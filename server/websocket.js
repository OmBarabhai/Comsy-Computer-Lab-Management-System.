const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'internet_speed') {
        document.getElementById('currentSpeed').textContent = data.speed;
    } else if (data.type === 'computer_status') {
        updateComputerStatusGrid(data.computers);
    }
};