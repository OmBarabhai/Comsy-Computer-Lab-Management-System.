// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const statusMessage = document.getElementById('statusMessage');
const specsError = document.getElementById('specsError');
const retryButton = document.getElementById('retryButton');
const submitButton = document.getElementById('submitButton');

// Detect system specifications on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Function to fetch and update specs
    const updateSpecs = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/specs');
            if (!response.ok) return;
            const specs = await response.json();

            // Update UI
            document.getElementById('cpuInfo').textContent = specs.cpu;
            document.getElementById('ramInfo').textContent = specs.ram;
            document.getElementById('osInfo').textContent = specs.os;
            document.getElementById('networkInfo').textContent = specs.network;
            document.getElementById('storageInfo').textContent = specs.storage.map(disk => `${disk.name} (${disk.size})`).join(', ');

            // Update storage display
            const storageList = document.getElementById('storageList');
            storageList.innerHTML = `
                <h4>Storage Devices</h4>
                ${specs.storage.map(disk => `
                    <p><strong>${disk.type}:</strong> ${disk.name} (${disk.size}, ${disk.vendor})</p>
                `).join('')}
            `;

            // Update connected devices display
            const devicesList = document.getElementById('devicesList');
            devicesList.innerHTML = `
                <h4>Connected Devices</h4>
                <p><strong>USB Devices:</strong> ${specs.connectedDevices.usb.map(device => `<strong>${device.type}:</strong> (${device.name})`).join(', ')}</p>
                <p><strong>Bluetooth Devices:</strong> ${specs.connectedDevices.bluetooth.map(device => device.name).join(', ')}</p>
                <p><strong>Printers:</strong> ${specs.connectedDevices.printers.map(printer => printer.name).join(', ')}</p>
            `;

        } catch (error) {
            console.error('Error fetching specs:', error);
        }
    };

    // Initial fetch
    await updateSpecs();

    // Poll every 5 seconds
    setInterval(updateSpecs, 5000);
});

// Handle form submission
document.getElementById('computerRegistrationForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
        // Disable the submit button to prevent multiple submissions
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // Gather form data
        const computerData = {
            name: document.getElementById('computerName').value,
            specs: {
                cpu: document.getElementById('cpuInfo').textContent,
                ram: document.getElementById('ramInfo').textContent,
                storage: document.getElementById('storageInfo').textContent,
                os: document.getElementById('osInfo').textContent,
                network: document.getElementById('networkInfo').textContent,
            },
            ipAddress: await getIPAddress(),
        };

        console.log('Submitting computer data:', computerData); // Debugging: Log the data

        // Send the data to the server
        const response = await fetch('/api/computers/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(computerData),
        });

        console.log('Response status:', response.status); // Debugging: Log the response status

        if (response.ok) {
            // Show success message
            statusMessage.textContent = 'Registration request sent to admin!';
            statusMessage.className = 'status-message success';
            statusMessage.style.display = 'block';

            // Close the window after a short delay
            setTimeout(() => window.close(), 1500);
        } else {
            // Handle server errors
            const errorData = await response.json();
            console.error('Server error:', errorData);
            statusMessage.textContent = 'Registration failed: ' + (errorData.message || 'Unknown error');
            statusMessage.className = 'status-message error';
            statusMessage.style.display = 'block';
        }
    } catch (error) {
        // Handle network or other errors
        console.error('Registration failed:', error);
        statusMessage.textContent = 'Registration failed: Check the console for details.';
        statusMessage.className = 'status-message error';
        statusMessage.style.display = 'block';
    } finally {
        // Re-enable the submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Registration';
    }
});

// Helper function to get IP address
async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
        return 'Unknown';
    }
}