document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role');
    if (!role) window.location.href = '/index.html';
    
    document.getElementById('userRoleBadge').textContent = role;
    initializeTheme();
    setupEventListeners();
    loadRoleSpecificContent(role);

    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'speed') {
            document.getElementById('currentSpeed').textContent = data.speed;
        }
    };

    // Periodically fetch speed (every 5 seconds)
    setInterval(async () => {
        const speed = await fetchInternetSpeed();
        ws.send(JSON.stringify({ type: 'speed', speed }));
    }, 5000);
});

async function fetchInternetSpeed() {
    try {
        const response = await fetch('https://api.fast.com/netflix/speedtest/v1?https=true');
        const data = await response.json();
        return data.speed;
    } catch (error) {
        return 0;
    }
}


// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme;
}

function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('labBookingForm').addEventListener('submit', bookLab);
}

function logout() {
    localStorage.clear();
    window.location.href = '/index.html';
}

// Role-Based Content Loading
function loadRoleSpecificContent(role) {
    // Hide all views first
    document.querySelectorAll('[id$="View"], [id$="Dashboard"]').forEach(el => {
        el.classList.add('hidden');
    });

    switch(role) {
        case 'admin':
            document.getElementById('adminView').classList.remove('hidden');
            document.getElementById('adminDashboard').classList.remove('hidden');
            loadRegistrationRequests();
            loadAllComputers();
            break;
            
        case 'student':
            document.getElementById('studentView').classList.remove('hidden');
            document.getElementById('studentDashboard').classList.remove('hidden');
            loadComputersForBooking();
            break;
            
        case 'staff':
            document.getElementById('staffView').classList.remove('hidden');
            document.getElementById('staffDashboard').classList.remove('hidden');
            loadLabsForBooking();
            break;
    }
}

// Admin Functions
async function loadRegistrationRequests() {
    try {
        const response = await fetch('/api/computers/pending');
        const computers = await response.json();
        const tbody = document.querySelector('#pendingComputersTable tbody');
        tbody.innerHTML = '';
        
        computers.forEach(computer => {
            tbody.innerHTML += `
                <tr>
                    <td>${computer.name}</td>
                    <td>${computer.ipAddress}</td>
                    <td>${JSON.stringify(computer.specs)}</td>
                    <td>
                        <button onclick="approveComputer('${computer._id}')">Approve</button>
                        <button onclick="rejectComputer('${computer._id}')">Reject</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

function showRegistrationRequests() {
    document.getElementById('registrationRequests').classList.remove('hidden');
    document.getElementById('allComputers').classList.add('hidden');
}

function showAllComputers() {
    document.getElementById('allComputers').classList.remove('hidden');
    document.getElementById('registrationRequests').classList.add('hidden');
}

// Staff Functions
async function loadLabsForBooking() {
    // Implementation for loading labs
}

async function bookLab(event) {
    event.preventDefault();
    const formData = {
        labName: document.getElementById('labName').value,
        startTime: document.getElementById('labStartTime').value,
        endTime: document.getElementById('labEndTime').value
    };

    try {
        const response = await fetch('/api/labs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Lab booked successfully!');
            event.target.reset();
        }
    } catch (error) {
        console.error('Booking failed:', error);
    }
}

// Student Functions
async function loadComputersForBooking() {
    // Implementation for loading available computers
}

// Attendance Management
async function downloadAttendance() {
    const date = document.getElementById('attendanceDate').value;
    try {
        const response = await fetch(`/api/attendance?date=${date}`);
        const data = await response.json();
        
        // Example PDF generation
        const doc = new jspdf.jsPDF();
        doc.text(`Attendance Report - ${date}`, 10, 10);
        // Add table creation logic here
        doc.save(`attendance-${date}.pdf`);
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

// Computer Approval/Rejection
async function approveComputer(computerId) {
    try {
        await fetch(`/api/computers/${computerId}/approve`, { method: 'PATCH' });
        loadRegistrationRequests();
    } catch (error) {
        console.error('Approval failed:', error);
    }
}

async function rejectComputer(computerId) {
    try {
        await fetch(`/api/computers/${computerId}/reject`, { method: 'DELETE' });
        loadRegistrationRequests();
    } catch (error) {
        console.error('Rejection failed:', error);
    }
}
