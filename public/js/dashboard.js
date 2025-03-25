document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || !role) {
        window.location.href = '/login.html';
        return;
    }

    // Verify token validity on initial load
    verifyToken(token).then(isValid => {
        if (!isValid) {
            localStorage.clear();
            window.location.href = '/login.html';
        }
    });
    
    document.getElementById('userRoleBadge').textContent = role;
    initializeTheme();
    setupEventListeners();
    loadRoleSpecificContent(role);
    checkComputerRegistration();

    async function verifyToken(token) {
        try {
            const response = await fetch('/api/auth/verify-token', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
});

async function checkComputerRegistration() {
    const registerBtn = document.getElementById('registerComputerBtn');
    const ipDisplay = document.getElementById('detectedIp');
    
    try {
        // Get client IP
        const clientIp = await getClientIp();
        ipDisplay.textContent = `Checking: ${clientIp}`;
        
        // Fetch all computers
        const response = await fetch('/api/computers', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch computers');
        
        const computers = await response.json();
        
        // Find computer with matching IP
        const matchingComputer = computers.find(computer => computer.ipAddress === clientIp);
        
        if (matchingComputer) {
            if (matchingComputer.status === 'approved') {
                // Computer is registered and approved
                registerBtn.textContent = matchingComputer.name;
                registerBtn.disabled = true;
                registerBtn.style.cursor = 'default';
                registerBtn.style.opacity = '0.7';
                ipDisplay.textContent = `Status: Approved (${clientIp})`;
                ipDisplay.style.color = 'var(--success)';
            } else {
                // Computer is registered but pending approval
                registerBtn.textContent = 'Registration Pending';
                registerBtn.disabled = true;
                registerBtn.style.cursor = 'not-allowed';
                ipDisplay.textContent = `Status: Pending Approval (${clientIp})`;
                ipDisplay.style.color = 'var(--warning)';
            }
        } else {
            // Computer not registered
            registerBtn.textContent = 'Register This PC';
            registerBtn.disabled = false;
            registerBtn.style.cursor = 'pointer';
            registerBtn.style.opacity = '1';
            ipDisplay.textContent = `This PC (${clientIp}) is not registered`;
            ipDisplay.style.color = 'var(--text)';
            
            // Add click handler if not already added
            registerBtn.onclick = () => {
                window.location.href = '/register-computer.html';
            };
        }
    } catch (error) {
        console.error('Registration check error:', error);
        ipDisplay.textContent = 'Error checking registration status';
        ipDisplay.style.color = 'var(--danger)';
        
        // Fallback - enable registration button
        registerBtn.textContent = 'Register This PC';
        registerBtn.disabled = false;
        registerBtn.onclick = () => {
            window.location.href = '/register-computer.html';
        };
    }
}

async function getClientIp() {
    try {
        // Try public IP first
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.log('Could not get public IP:', error);
        
        // Fallback for local development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return '127.0.0.1';
        }

        // Final fallback
        return 'unknown-ip';
    }
}
document.getElementById('togglePasswordAddUser').addEventListener('click', function () {
    const passwordInput = document.getElementById('userPassword');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

// WebSocket connection for real-time updates
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('WebSocket connection established');
    // Start fetching and sending speed data
    fetchAndSendSpeed(ws);
};

ws.onmessage = (event) => {
    console.log('Message from server:', event.data);
    const data = JSON.parse(event.data);
    if (data.type === 'speed') {
        document.getElementById('currentSpeed').textContent = data.speed;
    }
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

// Function to fetch and send internet speed
async function fetchAndSendSpeed(ws) {
    try {
        const speed = await fetchInternetSpeed();
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'speed', speed }));
        }
        document.getElementById('currentSpeed').textContent = speed;
    } catch (error) {
        console.error('Error fetching speed:', error);
        document.getElementById('currentSpeed').textContent = '0';
    }

    // Fetch speed every 5 seconds
    setTimeout(() => fetchAndSendSpeed(ws), 5000);
}

// Function to fetch internet speed
async function fetchInternetSpeed() {
    try {
        // Simulate a random speed for testing
        const speed = (Math.random() * 100).toFixed(2); // Random speed between 0 and 100 Mbps
        console.log('Simulated speed:', speed);
        return speed;
    } catch (error) {
        console.error('Error fetching internet speed:', error);
        return 0; // Return 0 in case of error
    }
}

// Update computer status
document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
        try {
            const response = await fetch(`/api/computers/${e.target.dataset.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: e.target.value })
            });
            
            if (!response.ok) throw new Error('Status update failed');
            loadAllComputers(); // Refresh data
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
});
// Submit issue report

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
    document.getElementById('addUserForm').addEventListener('submit', addNewUser);
    document.getElementById('labBookingFormAdmin').addEventListener('submit', bookLab);
    document.getElementById('staffBookingForm').addEventListener('submit', handleStaffBooking);
    document.getElementById('profileBtn').addEventListener('click', () => {window.location.href = '/profile.html';});
    document.querySelector('[href="dashboard.html"]').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.section-content').forEach(el => el.classList.add('hidden'));
        document.getElementById('dashboardOverview').classList.remove('hidden');
        loadDashboardData();
    });
}

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

// Role-Based Content Loading
// Update loadRoleSpecificContent
function loadRoleSpecificContent(role) {
    // Hide all dashboards
    document.querySelectorAll('[id$="Dashboard"]').forEach(el => el.classList.add('hidden'));
    document.getElementById('adminView').classList.add('hidden');
    
    // Load necessary data
    switch(role) {
        case 'admin':
            document.getElementById('adminView').classList.remove('hidden');
            document.getElementById('adminDashboard').classList.remove('hidden');
            
            // Load dashboard overview by default
            document.getElementById('dashboardOverview').classList.remove('hidden');
            
            // Load all data
            loadDashboardData();
            loadRegistrationRequests();
            loadAllComputers();
            loadIssuesTable();
            loadBookings();
            break;
        case 'student':
            document.getElementById('studentDashboard').classList.remove('hidden');
            loadAvailableComputers();
            break;
        case 'staff':
            document.getElementById('staffDashboard').classList.remove('hidden');
            loadAvailableComputers();
            break;
    }
}

// Add this new function to fetch and update dashboard data
async function loadDashboardData() {
    try {
        // Fetch computers data
        const computersResponse = await fetch('/api/computers', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const computers = await computersResponse.ok ? await computersResponse.json() : [];
        
        // Count computer statuses
        const totalComputers = computers.length;
        const availableComputers = computers.filter(c => c.operationalStatus === 'available').length;
        const inUseComputers = computers.filter(c => c.operationalStatus === 'in-use').length;
        const maintenanceComputers = computers.filter(c => c.operationalStatus === 'maintenance').length;
        const pendingComputers = computers.filter(c => c.status === 'pending').length;
        
        // Update computer cards
        document.getElementById('totalComputers').textContent = totalComputers;
        document.getElementById('availableComputers').textContent = availableComputers;
        document.getElementById('inUseComputers').textContent = inUseComputers;
        document.getElementById('maintenanceComputers').textContent = maintenanceComputers;
        document.getElementById('pendingComputers').textContent = pendingComputers;
        
        // Fetch issues data
        const issuesResponse = await fetch('/api/issues', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const issues = issuesResponse.ok ? await issuesResponse.json() : [];
        
        // Count issue statuses
        const totalIssues = issues.length;
        const openIssues = issues.filter(i => i.status === 'open').length;
        const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
        
        // Update issues card
        document.getElementById('totalIssues').textContent = totalIssues;
        document.getElementById('openIssues').textContent = openIssues;
        document.getElementById('resolvedIssues').textContent = resolvedIssues;
        
        // Fetch bookings data
        const bookingsResponse = await fetch('/api/bookings', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const bookings = bookingsResponse.ok ? await bookingsResponse.json() : [];
        
        // Count booking statuses
        const totalBookings = bookings.length;
        const upcomingBookings = bookings.filter(b => b.status === 'upcoming').length;
        const ongoingBookings = bookings.filter(b => b.status === 'ongoing').length;
        const completedBookings = bookings.filter(b => b.status === 'completed').length;
        
        // Update bookings card
        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('upcomingBookings').textContent = upcomingBookings;
        document.getElementById('ongoingBookings').textContent = ongoingBookings;
        document.getElementById('completedBookings').textContent = completedBookings;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}
// Admin Functions
async function loadRegistrationRequests() {
    try {
        const response = await fetch('/api/computers/pending', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to fetch pending computers');
        const computers = await response.json();

        const tbody = document.querySelector('#pendingComputersTable tbody');
        tbody.innerHTML = '';

        // In loadRegistrationRequests function
        // In loadRegistrationRequests function
        computers.forEach(computer => {
            tbody.innerHTML += `
                <tr>
                    <td>${computer.name}</td>
                    <td>${computer.ipAddress}</td>
                    <td>
                        <div><strong>CPU:</strong> ${computer.specs.cpu}</div>
                        <div><strong>RAM:</strong> ${computer.specs.ram}</div>
                        <div><strong>Storage:</strong> ${computer.specs.storage}</div>
                        <div><strong>OS:</strong> ${computer.specs.os}</div>
                        <div><strong>Network:</strong> ${computer.specs.network}</div>
                    </td>
                    <td>
                        <button class="btn-approve" data-id="${computer._id}">Approve</button>
                        <button class="btn-reject" data-id="${computer._id}">Reject</button>
                    </td>
                </tr>
            `;
        });

        // Add event listeners after populating the table
        document.querySelectorAll('.btn-approve').forEach(button => {
            button.addEventListener('click', () => approveComputer(button.dataset.id));
        });

        document.querySelectorAll('.btn-reject').forEach(button => {
            button.addEventListener('click', () => rejectComputer(button.dataset.id));
        });

    } catch (error) {
        console.error('Error loading requests:', error);
        alert(`Error: ${error.message}`);
    }
}

function showRegistrationRequests() {
    document.getElementById('registrationRequests').classList.remove('hidden');
    document.getElementById('allComputers').classList.add('hidden');
    
    // Refresh the data when showing the table
    loadRegistrationRequests();
    
}

function showAllComputers() {
    document.getElementById('allComputers').classList.remove('hidden');
    document.getElementById('registrationRequests').classList.add('hidden');
}
// Add these functions
async function loadAllComputers() {
    try {
        const response = await fetch('/api/computers', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to fetch computers');
        const computers = await response.json();

        const tbody = document.querySelector('#computersTable tbody');
        tbody.innerHTML = '';

        // Populate dropdown for all roles
        const issueComputerSelectStudent = document.getElementById('issueComputerSelectStudent');
        if (issueComputerSelectStudent) {
            issueComputerSelectStudent.innerHTML = '<option value="">Select Computer</option>';

            computers.forEach(computer => {
                if (computer.status === 'approved') {
                    issueComputerSelectStudent.innerHTML += `
                        <option value="${computer.id}">${computer.name}</option>
                    `;
                }
            });
        }

        // Populate table with real data
        computers.forEach(computer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${computer.id}</td>
                <td>${computer.name}</td>
                <td>
                    <span class="status-indicator ${computer.operationalStatus}">
                        ${computer.operationalStatus}
                    </span>
                </td>
                <td>
                    <span class="approval-status ${computer.status}">
                        ${computer.status}
                    </span>
                </td>
                <td>
                    <span class="power-status ${computer.powerStatus}">
                        ${computer.powerStatus.toUpperCase()}
                    </span>
                </td>
                <td>
                    <span class="network-speed">${computer.networkSpeed}</span> Mbps
                </td>
                <td>${computer.ipAddress}</td>
                <td>
                    <button class="btn-see-details">See Details</button>
                    <button class="btn-delete" data-ip="${computer.ipAddress}">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add delete button event listeners
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', async () => {
                const ipAddress = button.dataset.ip;
                if (confirm(`Are you sure you want to delete computer with IP ${ipAddress}?`)) {
                    try {
                        const response = await fetch(`/api/computers/ip/${ipAddress}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to delete computer');
                        }

                        alert('Computer deleted successfully!');
                        loadAllComputers(); // Refresh the table
                    } catch (error) {
                        console.error('Delete error:', error);
                        alert(`Error: ${error.message}`);
                    }
                }
            });
        });

        // Simulate network speed updates
        simulateNetworkSpeedUpdates();

    } catch (error) {
        console.error('Error loading computers:', error);
        alert(`Error: ${error.message}`);
    }
}

function simulateNetworkSpeedUpdates() {
    setInterval(() => {
        document.querySelectorAll('.network-speed').forEach(element => {
            // Update speed with random value between 45-105 Mbps
            const newSpeed = (Math.random() * 60 + 45).toFixed(2);
            element.textContent = newSpeed;
        });
    }, 2000); // Update every 5 seconds
}

async function handleStatusChange(e) {
    try {
        const response = await fetch(`/api/computers/${e.target.dataset.id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
                operationalStatus: e.target.value 
            })
        });
        
        if (!response.ok) throw new Error('Status update failed');
        loadAllComputers();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
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

async function handleStaffBooking(e) {
    e.preventDefault();
    // Implement booking logic similar to student
}

document.getElementById('issueFormStudent').addEventListener('submit', async (e) => {
    e.preventDefault();

    const computerId = document.getElementById('issueComputerSelectStudent').value;
    const description = document.getElementById('issueDescriptionStudent').value;

    if (!computerId) {
        alert('Please select a computer.');
        return;
    }

    const issueData = {
        computer: computerId,
        description: description
    };

    console.log('Issue Data:', issueData); // Debugging log

    try {
        const response = await fetch('/api/issues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(issueData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to report issue');
        }

        alert('Issue reported successfully!');
        e.target.reset();
        loadIssuesTable(); // Refresh the issues table
    } catch (error) {
        console.error('Error reporting issue:', error);
        alert(`Error: ${error.message}`);
    }
});

document.getElementById('issueFormStaff').addEventListener('submit', async (e) => {
    e.preventDefault();

    const computerId = document.getElementById('issueComputerSelectStudent').value;
    const description = document.getElementById('issueDescriptionStudent').value;

    if (!computerId) {
        alert('Please select a computer.');
        return;
    }

    const issueData = {
        computer: computerId,
        description: description
    };

    console.log('Issue Data:', issueData); // Debugging log

    try {
        const response = await fetch('/api/issues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(issueData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to report issue');
        }

        alert('Issue reported successfully!');
        e.target.reset();
        loadIssuesTable(); // Refresh the issues table
    } catch (error) {
        console.error('Error reporting issue:', error);
        alert(`Error: ${error.message}`);
    }
});

async function loadIssuesTable() {
    try {
        const response = await fetch('/api/issues', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        let issues = [];

        if (!response.ok) {
            console.warn('Failed to fetch issues. Using dummy data instead.');
            issues = [
                {
                    _id: '64f8b1e2a1b2c3d4e5f6a7b8',
                    computer: { name: 'Computer 1' },
                    reportedBy: { username: 'student1' },
                    description: 'Keyboard not working',
                    status: 'open',
                    createdAt: new Date()
                },
                {
                    _id: '64f8b1e2a1b2c3d4e5f6a7b9',
                    computer: { name: 'Computer 2' },
                    reportedBy: { username: 'staff1' },
                    description: 'Monitor not displaying',
                    status: 'in-progress',
                    createdAt: new Date()
                }
            ];
        } else {
            issues = await response.json();
        }

        const tbody = document.querySelector('#issuesTable tbody');
        tbody.innerHTML = '';

        issues.forEach(issue => {
            tbody.innerHTML += `
                <tr>
                    <td>${issue._id}</td>
                    <td>${issue.computer?.name || 'N/A'}</td>
                    <td>${issue.reportedBy?.username || 'Unknown'}</td>
                    <td>${new Date(issue.createdAt).toLocaleDateString()}</td>
                    <td>${issue.description}</td>
                    <td>
                        <span class="status-indicator ${issue.status}">
                            ${issue.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn-resolve" data-id="${issue._id}">Issue Resolved</button>
                    </td>
                </tr>
            `;
        });

        // Add event listeners for buttons
        document.querySelectorAll('.btn-resolve').forEach(button => {
            button.addEventListener('click', async () => {
                const issueId = button.dataset.id;
                try {
                    const response = await fetch(`/api/issues/${issueId}/resolve`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (!response.ok) throw new Error('Failed to resolve issue');
                    alert('Issue resolved successfully!');
                    loadIssuesTable(); // Refresh the issues table
                    loadAllComputers(); // Refresh the computers table
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            });
        });

    } catch (error) {
        console.error('Error loading issues:', error);
        alert(`Error: ${error.message}`);
    }
}
// Computer Approval/Rejection
// Updated approveComputer function
async function approveComputer(computerId) {
    try {
        if (!computerId) throw new Error('Invalid computer ID');
        
        const response = await fetch(`/api/computers/${computerId}/approve`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Approval failed');
        }

        alert('Computer approved!');
        loadRegistrationRequests();
        loadAllComputers();

    } catch (error) {
        console.error('Approval error:', error);
        alert(`Approval failed: ${error.message}`);
    }
}

async function rejectComputer(computerId) {
    try {
        if (!computerId) throw new Error('Invalid computer ID');
        
        const response = await fetch(`/api/computers/${computerId}/reject`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Rejection failed');
        }

        alert('Computer rejected!');
        loadRegistrationRequests();
        loadAllComputers();

    } catch (error) {
        console.error('Rejection error:', error);
        alert(`Rejection failed: ${error.message}`);
    }
}

async function addNewUser(event) {
    event.preventDefault();
    
    const userData = {
        username: document.getElementById('userUsername').value,
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        password: document.getElementById('userPassword').value
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            // Handle specific conflict messages
            if (responseData.conflict === 'username') {
                throw new Error('Username already exists!');
            }
            if (responseData.conflict === 'email') {
                throw new Error('Email already exists!');
            }
            throw new Error(responseData.message || 'Failed to add user');
        }

        alert('User added successfully!');
        event.target.reset();
        
    } catch (error) {
        console.error('Error adding user:', error);
        alert(`Error: ${error.message}`);
    }
}

async function loadAvailableComputers() {
    try {
        const response = await fetch('/api/computers', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch computers');
        const computers = await response.json();

        // Filter approved and available computers
        const availableComputers = computers.filter(computer => 
            computer.status === 'approved' && 
            computer.operationalStatus === 'available'
        );

        // Populate student booking dropdown
        const select = document.getElementById('studentComputerSelect');
        select.innerHTML = '<option value="">Select Computer</option>';
        
        availableComputers.forEach(computer => {
            select.innerHTML += `
                <option value="${computer.id}">
                    ${computer.name} (${computer.specs.cpu}, ${computer.specs.ram}, ${computer.specs.storage})
                </option>
            `;
        });

    } catch (error) {
        console.error('Error loading available computers:', error);
        alert(`Error: ${error.message}`);
    }
}

document.getElementById('studentBookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const computerId = document.getElementById('studentComputerSelect').value;
    const startTime = document.getElementById('studentStartTime').value;
    const endTime = document.getElementById('studentEndTime').value;
    const purpose = document.getElementById('studentBookingPurpose').value;

    if (!computerId || !startTime || !endTime || !purpose) {
        alert('Please fill all fields.');
        return;
    }

    const bookingData = {
        computer: computerId,
        startTime: startTime, // Plain date string
        endTime: endTime, // Plain date string
        purpose
    };

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(bookingData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to book computer');
        }

        alert('Computer booked successfully!');
        e.target.reset();
        loadAvailableComputers(); // Refresh the available computers list
    } catch (error) {
        console.error('Error booking computer:', error);
        alert(`Error: ${error.message}`);
    }
});
document.getElementById('staffBookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const computerId = document.getElementById('studentComputerSelect').value;
    const startTime = document.getElementById('studentStartTime').value;
    const endTime = document.getElementById('studentEndTime').value;
    const purpose = document.getElementById('studentBookingPurpose').value;

    if (!computerId || !startTime || !endTime || !purpose) {
        alert('Please fill all fields.');
        return;
    }

    const bookingData = {
        computer: computerId,
        startTime: startTime, // Plain date string
        endTime: endTime, // Plain date string
        purpose
    };

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(bookingData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to book computer');
        }

        alert('Computer booked successfully!');
        e.target.reset();
        loadAvailableComputers(); // Refresh the available computers list
    } catch (error) {
        console.error('Error booking computer:', error);
        alert(`Error: ${error.message}`);
    }
});

async function loadBookings() {
    try {
        const response = await fetch('/api/bookings', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to fetch bookings');
        const bookings = await response.json();

        console.log('Fetched Bookings:', bookings); // Debugging log

        const tbody = document.querySelector('#bookingsTable tbody');
        tbody.innerHTML = '';

        bookings.forEach(booking => {
            const startDate = new Date(booking.startTime);
            const endDate = new Date(booking.endTime);

            tbody.innerHTML += `
                <tr>
                    <td>${booking._id}</td>
                    <td>${booking.computer?.name || 'N/A'}</td>
                    <td>${booking.user?.username || 'Unknown'}</td>
                    <td>${startDate.toLocaleDateString()}</td>
                    <td>${startDate.toLocaleTimeString()}</td>
                    <td>${endDate.toLocaleTimeString()}</td>
                    <td>${booking.purpose}</td>
                    <td>
                        <span class="status-indicator ${booking.status}">
                            ${booking.status}
                        </span>
                    </td>
                    <td>
                        ${booking.status === 'upcoming' ? `
                            <button class="btn-cancel" data-id="${booking._id}">Cancel</button>
                        ` : '--'}
                    </td>
                </tr>
            `;
        });

        // Add cancel event listeners
        document.querySelectorAll('.btn-cancel').forEach(button => {
            button.addEventListener('click', async () => {
                if (confirm('Are you sure you want to cancel this booking?')) {
                    try {
                        const response = await fetch(`/api/bookings/${button.dataset.id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });

                        if (!response.ok) throw new Error('Failed to cancel booking');
                        alert('Booking cancelled successfully');
                        loadBookings(); // Refresh the table
                    } catch (error) {
                        alert(`Error: ${error.message}`);
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error loading bookings:', error);
        alert(`Error: ${error.message}`);
    }
}

// View Attendance
document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    if (!fromDate || !toDate) {
        alert('Please select a date range.');
        return;
    }

    try {
        const response = await fetch(`/api/bookings/attendance?from=${fromDate}&to=${toDate}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch attendance');
        }

        // Populate the table
        const tbody = document.querySelector('#attendanceTable tbody');
        tbody.innerHTML = '';

        data.forEach(booking => {
            const startDate = new Date(booking.startTime);
            const endDate = new Date(booking.endTime);

            tbody.innerHTML += `
                <tr>
                    <td>${booking._id}</td>
                    <td>${booking.computer?.name || 'N/A'}</td>
                    <td>${booking.user?.username || 'Unknown'}</td>
                    <td>${startDate.toLocaleString()}</td>
                    <td>${endDate.toLocaleString()}</td>
                    <td>${booking.purpose}</td>
                    <td>${booking.status}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        alert(`Error: ${error.message}`);
    }
});

// Download Excel
document.getElementById('downloadExcel').addEventListener('click', async () => {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    if (!fromDate || !toDate) {
        alert('Please select a date range.');
        return;
    }

    window.open(`/api/bookings/attendance/excel?from=${fromDate}&to=${toDate}`, '_blank');
});

// Download PDF
document.getElementById('downloadPDF').addEventListener('click', async () => {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    if (!fromDate || !toDate) {
        alert('Please select a date range.');
        return;
    }

    window.open(`/api/bookings/attendance/pdf?from=${fromDate}&to=${toDate}`, '_blank');
});

// Add these functions to your dashboard.js or in a script tag
async function fetchIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
        return null;
    }
}

async function fetchComputerDetails(ip) {
    try {
        const response = await fetch(`/api/computers?ip=${ip}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching computer details:', error);
        return null;
    }
}

async function fetchRealTimeSpecs() {
    try {
        const response = await fetch('http://localhost:3000/api/specs');
        if (!response.ok) throw new Error('Failed to fetch specs');
        const specs = await response.json();
        return specs;
    } catch (error) {
        console.error('Error fetching real-time specs:', error);
        return null;
    }
}

async function updateSystemSpecs() {
    const ip = await fetchIPAddress();
    if (ip) {
        document.getElementById('computer-name').textContent = ip;
        const computerDetails = await fetchComputerDetails(ip);
        const realTimeSpecs = await fetchRealTimeSpecs();

        const specsToUpdate = {
            'os': realTimeSpecs?.os || computerDetails?.os,
            'processor': realTimeSpecs?.cpu || computerDetails?.processor,
            'memory': realTimeSpecs?.ram || computerDetails?.memory,
            'storage': realTimeSpecs?.storage?.map(disk => disk.size).join(', ') || computerDetails?.storage,
            'graphics': computerDetails?.graphics,
            'resolution': computerDetails?.resolution
        };

        Object.entries(specsToUpdate).forEach(([key, value]) => {
            const element = document.getElementById(`${key}-value`);
            const input = document.getElementById(`${key}-input`);
            
            if (value) {
                element.textContent = value;
                input.value = value;
            } else {
                element.textContent = '--';
                addEditButton(key);
            }
        });
    }
}

function addEditButton(specId) {
    const specItem = document.getElementById(`${specId}-value`).closest('.spec-item');
    const editHtml = `
        <i class="fas fa-pencil-alt edit-icon" data-spec="${specId}"></i>
        <i class="fas fa-save edit-icon" data-spec="${specId}" style="display: none"></i>
    `;
    specItem.insertAdjacentHTML('beforeend', editHtml);
    
    specItem.querySelector('.fa-pencil-alt').addEventListener('click', startEditing);
    specItem.querySelector('.fa-save').addEventListener('click', saveEditing);
}

function startEditing(e) {
    const specItem = e.target.closest('.spec-item');
    const specId = e.target.dataset.spec;
    
    specItem.classList.add('editing');
    e.target.style.display = 'none';
    specItem.querySelector('.fa-save').style.display = 'block';
}

function saveEditing(e) {
    const specItem = e.target.closest('.spec-item');
    const specId = e.target.dataset.spec;
    const input = document.getElementById(`${specId}-input`);
    const valueElement = document.getElementById(`${specId}-value`);
    
    valueElement.textContent = input.value || '--';
    specItem.classList.remove('editing');
    e.target.style.display = 'none';
    specItem.querySelector('.fa-pencil-alt').style.display = 'block';
}

function simulateSpeedTest() {
    const testSpeedBtn = document.getElementById("test-speed-btn");
    testSpeedBtn.disabled = true;
    testSpeedBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';

    document.getElementById("download-speed").textContent = "0.00";
    document.getElementById("upload-speed").textContent = "0.00";
    document.getElementById("ping-value").textContent = "0";
    document.getElementById("download-progress").style.width = "0%";
    document.getElementById("upload-progress").style.width = "0%";
    document.getElementById("ping-progress").style.width = "0%";

    setTimeout(() => {
        const downloadSpeed = (Math.random() * 100 + 50).toFixed(2);
        document.getElementById("download-speed").textContent = downloadSpeed;
        document.getElementById("download-progress").style.width = `${Math.min((downloadSpeed / 200) * 100, 100)}%`;

        setTimeout(() => {
            const uploadSpeed = (Math.random() * 30 + 10).toFixed(2);
            document.getElementById("upload-speed").textContent = uploadSpeed;
            document.getElementById("upload-progress").style.width = `${Math.min((uploadSpeed / 50) * 100, 100)}%`;

            setTimeout(() => {
                const ping = Math.floor(Math.random() * 30 + 5);
                document.getElementById("ping-value").textContent = ping;
                document.getElementById("ping-progress").style.width = `${Math.min(100 - (ping / 100) * 100, 100)}%`;

                testSpeedBtn.disabled = false;
                testSpeedBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Test Speed';
            }, 500);
        }, 1000);
    }, 1500);
}

// Initialize when This PC section is shown
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('test-speed-btn')?.addEventListener('click', simulateSpeedTest);
    
    // Update specs when This PC section is shown
    document.querySelector('[data-target="thisPC"]')?.addEventListener('click', updateSystemSpecs);
});

