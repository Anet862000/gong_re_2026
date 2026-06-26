const elements = {
    battery: document.getElementById('battery'),
    brake: document.getElementById('brake'),
    camera: document.getElementById('camera'),
    cameraCanvas: document.getElementById('cameraCanvas'),
    cameraSummary: document.getElementById('cameraSummary'),
    connectionPill: document.getElementById('connectionPill'),
    emergencyStop: document.getElementById('emergencyStop'),
    estopPill: document.getElementById('estopPill'),
    faultList: document.getElementById('faultList'),
    gps: document.getElementById('gps'),
    lidar: document.getElementById('lidar'),
    lidarCanvas: document.getElementById('lidarCanvas'),
    lidarSummary: document.getElementById('lidarSummary'),
    modePill: document.getElementById('modePill'),
    position: document.getElementById('position'),
    resetFaults: document.getElementById('resetFaults'),
    routeLabel: document.getElementById('routeLabel'),
    routeProgress: document.getElementById('routeProgress'),
    speedValue: document.getElementById('speedValue'),
    steering: document.getElementById('steering'),
    targetSpeed: document.getElementById('targetSpeed'),
    throttle: document.getElementById('throttle'),
    toggleAutonomy: document.getElementById('toggleAutonomy'),
    updatedAt: document.getElementById('updatedAt'),
};

const cameraContext = elements.cameraCanvas.getContext('2d');
const lidarContext = elements.lidarCanvas.getContext('2d');
const lidarView = {
    dragging: false,
    lastX: 0,
    lastY: 0,
    pitch: -0.58,
    yaw: 0.42,
    scan: [],
};

function setPill(el, label, tone = '') {
    el.textContent = label;
    el.className = `pill ${tone}`.trim();
}

function renderFaults(faults) {
    elements.faultList.innerHTML = '';
    if (!faults.length) {
        const item = document.createElement('li');
        item.textContent = 'No active faults';
        item.className = 'muted';
        elements.faultList.appendChild(item);
        return;
    }

    faults.forEach((fault) => {
        const item = document.createElement('li');
        item.textContent = fault;
        elements.faultList.appendChild(item);
    });
}

function resizeCanvasToDisplaySize(canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width * window.devicePixelRatio));
    const height = Math.max(1, Math.floor(rect.height * window.devicePixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
}

function drawCamera(status) {
    const canvas = elements.cameraCanvas;
    resizeCanvasToDisplaySize(canvas);
    const ctx = cameraContext;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#030506';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 2 * window.devicePixelRatio;
    ctx.strokeRect(18, 18, width - 36, height - 36);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.font = `${14 * window.devicePixelRatio}px Segoe UI, Arial`;
    ctx.fillText('CAM-01 / FRONT', 30, 48);
    ctx.fillText(status.camera === 'OK' ? 'NO VIDEO SIGNAL - READY' : `CAMERA ${status.camera}`, 30, height - 32);

    ctx.strokeStyle = 'rgba(113, 224, 173, 0.22)';
    ctx.beginPath();
    ctx.moveTo(width * 0.38, height);
    ctx.lineTo(width * 0.48, height * 0.55);
    ctx.moveTo(width * 0.62, height);
    ctx.lineTo(width * 0.52, height * 0.55);
    ctx.stroke();

    elements.cameraSummary.textContent = status.camera === 'OK' ? 'Black frame' : status.camera;
}

function projectLidarPoint(point, width, height) {
    const angle = point.angle * Math.PI / 180;
    const distance = point.distance;
    const baseX = Math.sin(angle) * distance;
    const baseZ = Math.cos(angle) * distance;
    const baseY = 0.16 * Math.sin(distance * 1.7 + angle * 3);

    const cosYaw = Math.cos(lidarView.yaw);
    const sinYaw = Math.sin(lidarView.yaw);
    const cosPitch = Math.cos(lidarView.pitch);
    const sinPitch = Math.sin(lidarView.pitch);

    const x1 = baseX * cosYaw - baseZ * sinYaw;
    const z1 = baseX * sinYaw + baseZ * cosYaw;
    const y1 = baseY * cosPitch - z1 * sinPitch;
    const z2 = baseY * sinPitch + z1 * cosPitch;
    const depth = z2 + 15;
    const perspective = 560 / Math.max(3, depth);

    return {
        x: width / 2 + x1 * perspective,
        y: height * 0.66 - y1 * perspective,
        size: Math.max(2.2, 6.5 - depth * 0.18) * window.devicePixelRatio,
        close: distance < 4.8,
        depth,
    };
}

function drawLidar(scan = lidarView.scan) {
    lidarView.scan = scan;
    const canvas = elements.lidarCanvas;
    resizeCanvasToDisplaySize(canvas);
    const ctx = lidarContext;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#10161b';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.11)';
    ctx.lineWidth = 1;
    for (let z = 0; z <= 12; z += 3) {
        ctx.beginPath();
        const top = projectLidarPoint({ angle: 0, distance: z }, width, height);
        const left = projectLidarPoint({ angle: -70, distance: z }, width, height);
        const right = projectLidarPoint({ angle: 70, distance: z }, width, height);
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(top.x, top.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
    }

    [-90, -60, -30, 0, 30, 60, 90].forEach((angle) => {
        const start = projectLidarPoint({ angle, distance: 0.4 }, width, height);
        const end = projectLidarPoint({ angle, distance: 12 }, width, height);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    });

    const projected = scan.map((point) => projectLidarPoint(point, width, height));
    projected.sort((a, b) => b.depth - a.depth).forEach((point) => {
        ctx.beginPath();
        ctx.fillStyle = point.close ? '#ff7d6e' : '#71e0ad';
        ctx.arc(point.x, point.y, point.close ? point.size * 1.4 : point.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = '#f4f7fb';
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.72 - 22);
    ctx.lineTo(width / 2 - 14, height * 0.72 + 14);
    ctx.lineTo(width / 2 + 14, height * 0.72 + 14);
    ctx.closePath();
    ctx.fill();

    elements.lidarSummary.textContent = `${scan.length} nodes / drag view`;
}

function renderStatus(status) {
    setPill(elements.connectionPill, status.connected ? 'Connected' : 'Disconnected', status.connected ? 'ok' : 'bad');
    setPill(elements.modePill, status.autonomous ? 'Autonomous' : 'Manual', status.autonomous ? 'active' : '');
    setPill(elements.estopPill, status.emergency_stop ? 'E-Stop Active' : 'E-Stop Clear', status.emergency_stop ? 'bad' : 'ok');

    elements.speedValue.textContent = Number(status.speed_kph).toFixed(1);
    elements.targetSpeed.textContent = Number(status.target_speed_kph).toFixed(1);
    elements.battery.textContent = `${status.battery_percent}%`;
    elements.steering.textContent = `${Number(status.steering_deg).toFixed(1)} deg`;
    elements.throttle.textContent = `${status.throttle_percent}%`;
    elements.brake.textContent = `${status.brake_percent}%`;
    elements.gps.textContent = `${status.gps_fix} / ${status.gps_satellites} sat`;
    elements.lidar.textContent = status.lidar;
    elements.camera.textContent = status.camera;
    elements.position.textContent = `${Number(status.latitude).toFixed(6)}, ${Number(status.longitude).toFixed(6)}`;
    elements.routeLabel.textContent = `${status.route_name} / ${status.route_progress_percent}%`;
    elements.routeProgress.style.width = `${status.route_progress_percent}%`;
    elements.updatedAt.textContent = status.updated_at_iso;
    elements.toggleAutonomy.textContent = status.autonomous ? 'Manual Mode' : 'Autonomy';

    drawCamera(status);
    drawLidar(status.lidar_scan || []);
    renderFaults(status.faults);
}

async function requestStatus(path, options = {}) {
    const response = await fetch(path, { cache: 'no-store', ...options });
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    renderStatus(await response.json());
}

function command(name) {
    requestStatus(`/api/command/${name}`, { method: 'POST' }).catch(() => {
        setPill(elements.connectionPill, 'Command Failed', 'bad');
    });
}

elements.toggleAutonomy.addEventListener('click', () => command('toggle-autonomy'));
elements.emergencyStop.addEventListener('click', () => command('emergency-stop'));
elements.resetFaults.addEventListener('click', () => command('reset-faults'));

const statusEvents = new EventSource('/api/status/events');

statusEvents.addEventListener('message', (event) => {
    renderStatus(JSON.parse(event.data));
});

statusEvents.addEventListener('error', () => {
    setPill(elements.connectionPill, 'Reconnecting', 'bad');
    requestStatus('/api/status').catch(() => {});
});

elements.lidarCanvas.addEventListener('pointerdown', (event) => {
    lidarView.dragging = true;
    lidarView.lastX = event.clientX;
    lidarView.lastY = event.clientY;
    elements.lidarCanvas.setPointerCapture(event.pointerId);
});

elements.lidarCanvas.addEventListener('pointermove', (event) => {
    if (!lidarView.dragging) {
        return;
    }
    const dx = event.clientX - lidarView.lastX;
    const dy = event.clientY - lidarView.lastY;
    lidarView.lastX = event.clientX;
    lidarView.lastY = event.clientY;
    lidarView.yaw += dx * 0.008;
    lidarView.pitch = Math.max(-1.15, Math.min(0.15, lidarView.pitch + dy * 0.006));
    drawLidar();
});

elements.lidarCanvas.addEventListener('pointerup', () => {
    lidarView.dragging = false;
});

elements.lidarCanvas.addEventListener('pointercancel', () => {
    lidarView.dragging = false;
});

window.addEventListener('resize', () => {
    drawCamera({ camera: elements.camera.textContent || 'OK' });
    drawLidar();
});
