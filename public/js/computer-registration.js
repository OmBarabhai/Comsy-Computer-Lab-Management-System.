
const loadingOverlay = document.getElementById('loadingOverlay');
const statusMessage = document.getElementById('statusMessage');
const specsError = document.getElementById('specsError');
const retryButton = document.getElementById('retryButton');
const submitButton = document.getElementById('submitButton');

// Fetch specs from Electron (now includes MAC, hardware, network speed)
async function fetchSystemSpecs() {
    try {
        const response = await fetch('http://localhost:4000/api/specs');
        if (!response.ok) throw new Error('Failed to fetch specs');
        return await response.json();
    } catch (error) {
        console.error('Error fetching specs:', error);
        throw error;
    }
}

// Update UI with all specs (expanded)
async function updateSpecsDisplay() {
    try {
        const specs = await fetchSystemSpecs();

        // Update basic specs (existing)
        document.getElementById('cpuInfo').textContent = specs.cpu;
        document.getElementById('ramInfo').textContent = specs.ram;
        document.getElementById('osInfo').textContent = specs.os;
        document.getElementById('networkInfo').textContent = specs.network;
        document.getElementById('storageInfo').textContent = specs.storage;

        // New: Display MAC Address
        document.getElementById('macInfo').textContent = specs.macAddress || 'Not detected';

        // New: Display Hardware Connected
        const hardwareList = document.getElementById('hardwareList');
        hardwareList.innerHTML = `
            <h4>Connected Hardware</h4>
            <ul>
                ${Object.entries(specs.hardwareConnected || {})
                    .map(([device, isConnected]) => 
                        `<li><strong>${device}:</strong> ${isConnected ? '✔ Connected' : '✖ Not connected'}</li>`
                    ).join('')}
            </ul>
        `;

        // New: Display Network Speed
        const speedInfo = document.getElementById('speedInfo');
        if (specs.networkSpeed) {
            speedInfo.innerHTML = `
                <h4>Network Speed</h4>
                <p>Download: ${specs.networkSpeed.download.toFixed(2)} Mbps</p>
                <p>Upload: ${specs.networkSpeed.upload.toFixed(2)} Mbps</p>
            `;
        }

    } catch (error) {
        specsError.textContent = 'Failed to load system specifications.';
        retryButton.style.display = 'block';
    }
}

// Handle form submission (updated with all fields)
document.getElementById('computerRegistrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    loadingOverlay.style.display = 'flex';

    try {
        const specs = await fetchSystemSpecs();
        
        const formData = {
            name: document.getElementById('computerName').value,
            ipAddress: specs.ipAddress,
            macAddress: specs.macAddress,
            specs: {
                cpu: specs.cpu,
                ram: specs.ram,
                storage: specs.storage,
                os: specs.os,
                network: specs.network,
                hardwareConnected: specs.hardwareConnected // New field
            },
            networkSpeed: specs.networkSpeed, // New field
            powerStatus: 'on' // Default
        };

        console.log('Form data being sent:', formData);
        const response = await fetch('/api/computers/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error(await response.text());
        
        alert('Computer registered successfully!');
        window.location.href = '/dashboard.html';

    } catch (error) {
        console.error('Registration failed:', error);
        statusMessage.textContent = `Error: ${error.message}`;
    } finally {
        loadingOverlay.style.display = 'none';
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateSpecsDisplay();
    setInterval(updateSpecsDisplay, 60000); // Refresh every minute
});