const elements = {
    battery: document.getElementById('battery'),
    brake: document.getElementById('brake'),
    camera: document.getElementById('camera'),
    connectionPill: document.getElementById('connectionPill'),
    emergencyStop: document.getElementById('emergencyStop'),
    estopPill: document.getElementById('estopPill'),
    faultList: document.getElementById('faultList'),
    gps: document.getElementById('gps'),
    lidar: document.getElementById('lidar'),
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
