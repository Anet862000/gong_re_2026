import json
import math
import queue
import random
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from threading import Event, Lock, Thread
from urllib import error, request

from flask import Flask, Response, jsonify, send_from_directory
from werkzeug.serving import BaseWSGIServer, make_server

AUTOCAR_PORT = 49340


@dataclass
class AutocarStatus:
    connected: bool = True
    autonomous: bool = False
    emergency_stop: bool = False
    speed_kph: float = 0.0
    target_speed_kph: float = 30.0
    battery_percent: int = 87
    steering_deg: float = 0.0
    throttle_percent: int = 0
    brake_percent: int = 0
    gps_fix: str = "3D"
    gps_satellites: int = 14
    latitude: float = 37.5665
    longitude: float = 126.9780
    lidar: str = "OK"
    camera: str = "OK"
    route_name: str = "Test Track A"
    route_progress_percent: int = 18
    faults: list[str] = field(default_factory=list)
    updated_at: float = field(default_factory=time.time)


StatusPayload = dict[str, object]
StatusEventQueue = queue.Queue[StatusPayload]


class AutocarApiServer:
    def __init__(self, frontend_dir: Path) -> None:
        self.frontend_dir = Path(frontend_dir).resolve()
        self.port = AUTOCAR_PORT
        self._status = AutocarStatus()
        self._lock = Lock()
        self._event_clients: list[StatusEventQueue] = []
        self._server: BaseWSGIServer | None = None
        self._thread: Thread | None = None
        self._sim_thread: Thread | None = None
        self._stop_event = Event()
        self._owns_server = False
        self._tick = 0

        self.app = Flask(__name__, static_folder=str(self.frontend_dir), static_url_path="")
        self.app.add_url_rule("/", "index", self._serve_index)
        self.app.add_url_rule("/api/status", "status", self._status_payload)
        self.app.add_url_rule("/api/status/events", "events", self._stream_status_events)
        self.app.add_url_rule(
            "/api/command/<command_name>",
            "command",
            self._handle_command,
            methods=["POST"],
        )

    def _serve_index(self):
        return send_from_directory(self.frontend_dir, "index.html")

    def _status_payload(self):
        return jsonify(self._snapshot())

    def _snapshot(self) -> StatusPayload:
        with self._lock:
            payload = asdict(self._status)
        payload["updated_at_iso"] = time.strftime(
            "%Y-%m-%d %H:%M:%S", time.localtime(float(payload["updated_at"]))
        )
        return payload

    def _broadcast_status(self) -> None:
        payload = self._snapshot()
        for client_queue in list(self._event_clients):
            client_queue.put(payload)

    def _handle_command(self, command_name: str):
        with self._lock:
            if command_name == "toggle-autonomy":
                self._status.autonomous = not self._status.autonomous
                if self._status.autonomous:
                    self._status.emergency_stop = False
            elif command_name == "emergency-stop":
                self._status.emergency_stop = True
                self._status.autonomous = False
                self._status.target_speed_kph = 0.0
                self._status.speed_kph = 0.0
                self._status.throttle_percent = 0
                self._status.brake_percent = 100
            elif command_name == "reset-faults":
                self._status.faults.clear()
                self._status.lidar = "OK"
                self._status.camera = "OK"
            else:
                return jsonify({"error": f"Unknown command: {command_name}"}), 404
            self._status.updated_at = time.time()

        self._broadcast_status()
        return jsonify(self._snapshot())

    def _stream_status_events(self) -> Response:
        client_queue: StatusEventQueue = queue.Queue()
        with self._lock:
            self._event_clients.append(client_queue)
        client_queue.put(self._snapshot())

        def event_stream():
            try:
                while True:
                    payload = client_queue.get()
                    yield f"data: {json.dumps(payload)}\n\n"
            finally:
                with self._lock:
                    if client_queue in self._event_clients:
                        self._event_clients.remove(client_queue)

        return Response(event_stream(), mimetype="text/event-stream")

    @property
    def base_url(self) -> str:
        return f"http://127.0.0.1:{self.port}"

    def _is_server_ready(self) -> bool:
        try:
            with request.urlopen(f"{self.base_url}/api/status", timeout=1) as resp:
                return resp.status == 200
        except (OSError, error.URLError):
            return False

    def start(self) -> None:
        if self._is_server_ready():
            return

        try:
            self._server = make_server("127.0.0.1", self.port, self.app, threaded=True)
        except OSError as exc:
            if exc.errno in {10048, 98} and self._is_server_ready():
                return
            raise

        self._thread = Thread(target=self._server.serve_forever, daemon=True)
        self._thread.start()
        self._sim_thread = Thread(target=self._simulate_status, daemon=True)
        self._sim_thread.start()
        self._owns_server = True

    def stop(self) -> None:
        self._stop_event.set()
        if self._sim_thread is not None:
            self._sim_thread.join(timeout=1)
        if not self._owns_server or self._server is None or self._thread is None:
            return
        self._server.shutdown()
        self._thread.join(timeout=1)

    def _simulate_status(self) -> None:
        while not self._stop_event.wait(1.0):
            with self._lock:
                self._tick += 1
                phase = self._tick / 6
                target = self._status.target_speed_kph if self._status.autonomous else 0.0
                if self._status.emergency_stop:
                    target = 0.0

                self._status.speed_kph += (target - self._status.speed_kph) * 0.24
                self._status.steering_deg = round(math.sin(phase) * 9.5, 1)
                self._status.throttle_percent = int(max(0, min(100, self._status.speed_kph * 2.2)))
                self._status.brake_percent = 100 if self._status.emergency_stop else int(
                    max(0, 40 - self._status.speed_kph)
                )
                self._status.battery_percent = max(
                    0, self._status.battery_percent - (1 if self._tick % 45 == 0 else 0)
                )
                self._status.latitude += 0.00001 if self._status.autonomous else 0.0
                self._status.longitude += 0.000014 if self._status.autonomous else 0.0
                self._status.route_progress_percent = min(
                    100,
                    self._status.route_progress_percent
                    + (1 if self._status.autonomous and self._tick % 4 == 0 else 0),
                )

                if self._tick % 37 == 0 and random.random() < 0.35:
                    self._status.camera = "WARN"
                    if "Camera exposure warning" not in self._status.faults:
                        self._status.faults.append("Camera exposure warning")

                self._status.updated_at = time.time()
            self._broadcast_status()
