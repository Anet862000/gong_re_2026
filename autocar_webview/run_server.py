from pathlib import Path
from threading import Event

from backend.server import AutocarApiServer

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"


def main() -> None:
    server = AutocarApiServer(FRONTEND_DIR)
    server.start()
    print(f"Autocar status server running at {server.base_url}")
    print("Press Ctrl+C to stop.")
    wait_forever = Event()
    try:
        wait_forever.wait()
    except KeyboardInterrupt:
        server.stop()


if __name__ == "__main__":
    main()
