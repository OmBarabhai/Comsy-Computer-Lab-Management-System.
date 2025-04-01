let computersRefreshInterval = null;

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

    if (token && role === 'admin') {
        loadAllComputers(); // This will start the interval
    }

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
        // Get system specs which includes IP address from localhost:4000
        const specs = await fetchSystemSpecs();
        const clientIp = specs.ipAddress;
        
        if (!clientIp) {
            throw new Error('Could not detect IP address');
        }
        
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

// Add this helper function to fetch system specs (similar to computer-registration.js)
async function fetchSystemSpecs() {
    try {
        const response = await fetch('http://localhost:4000/api/specs');
        if (!response.ok) throw new Error('Failed to fetch specs');
        return await response.json();
    } catch (error) {
        console.error('Error fetching specs:', error);
        return { ipAddress: null, networkSpeed: { download: 0, upload: 0, ping: 0 } };
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

// Update computer status
// Update computer status - Fix the status update
document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
        try {
            const response = await fetch(`/api/computers/${e.target.dataset.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ operationalStatus: e.target.value }) // Changed from 'status' to 'operationalStatus'
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
    document.getElementById('refreshIssuesBtn')?.addEventListener('click', async function() {
        const btn = this;
        btn.disabled = true;
        btn.classList.add('loading');
        try {
            await loadIssuesTable();
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    });

    document.getElementById('refreshBookingsBtn')?.addEventListener('click', async function() {
        const btn = this;
        btn.disabled = true;
        btn.classList.add('loading');
        try {
            await loadBookings();
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    });
}

// Add refresh functionality to issues table
document.getElementById('refreshIssuesBtn')?.addEventListener('click', async function() {
    const btn = this;
    btn.disabled = true;
    btn.classList.add('loading');
    
    try {
        await loadIssuesTable();
    } catch (error) {
        console.error('Error refreshing issues:', error);
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
    }
});

// Add refresh functionality to bookings table
document.getElementById('refreshBookingsBtn')?.addEventListener('click', async function() {
    const btn = this;
    btn.disabled = true;
    btn.classList.add('loading');
    
    try {
        await loadBookings();
    } catch (error) {
        console.error('Error refreshing bookings:', error);
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
    }
});

window.addEventListener('beforeunload', () => {
    if (computersRefreshInterval) {
        clearInterval(computersRefreshInterval);
        computersRefreshInterval = null;
    }
    const indicator = document.getElementById('computersRefreshIndicator');
    if (indicator) indicator.classList.add('hidden');
});

function logout() {
    // Clear the refresh interval
    if (computersRefreshInterval) {
        clearInterval(computersRefreshInterval);
        computersRefreshInterval = null;
    }
    
    localStorage.clear();
    window.location.href = '/login.html';
}

// Update loadRoleSpecificContent
function loadRoleSpecificContent(role) {

    if (computersRefreshInterval) {
        clearInterval(computersRefreshInterval);
        computersRefreshInterval = null;
    }
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
            loadAllComputers();
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
        const indicator = document.getElementById('computersRefreshIndicator');
        if (indicator) indicator.classList.remove('hidden');

        const loadData = async () => {
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
                        <span class="network-speed">${computer.networkSpeed?.download?.toFixed(2) || '0.00'}</span> Mbps
                    </td>
                    <td>
                        <span class="network-speed">${computer.networkSpeed?.upload?.toFixed(2) || '0.00'}</span> Mbps
                    </td>
                    <td>${computer.ipAddress}</td>
                    <td>
                        <button class="btn-details">Details</button>
                        <button class="btn-delete" data-ip="${computer.ipAddress}">Delete</button>
                    </td>
                `;
                row.querySelector('.btn-details').addEventListener('click', () => {
                    showDetailsPopup(computer); // Pass the complete computer object
                });    
                tbody.appendChild(row);
            });

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
        };
        await loadData();

        // Hide refresh indicator when done
        if (indicator) indicator.classList.add('hidden');

        // Set up auto-refresh
        if (!computersRefreshInterval) {
            computersRefreshInterval = setInterval(async () => {
                if (indicator) indicator.classList.remove('hidden');
                await loadData();
                if (indicator) indicator.classList.add('hidden');
            }, 20000);
        }

    } catch (error) {
        console.error('Error loading computers:', error);
        const indicator = document.getElementById('computersRefreshIndicator');
        if (indicator) {
            indicator.classList.remove('hidden');
            indicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Sync failed';
            indicator.style.color = 'var(--danger)';
        }
        alert(`Error: ${error.message}`);
    }
}

async function showDetailsPopup(computer) {
    try {
        const popup = document.getElementById('computerDetailsPopup');
        popup.classList.remove('hidden');

        const popupContent = document.getElementById('popupDetails');
        popupContent.innerHTML = `
            <div class="detail-section">
                <h4>Basic Information</h4>
                <div class="detail-item">
                    <span class="detail-label">Computer Name:</span>
                    <span>${computer.name || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">IP Address:</span>
                    <span>${computer.ipAddress || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">MAC Address:</span>
                    <span>${computer.macAddress || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="status-indicator ${computer.operationalStatus || 'unknown'}">
                        ${computer.operationalStatus || 'N/A'}
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Approval Status:</span>
                    <span class="approval-status ${computer.status || 'unknown'}">
                        ${computer.status || 'N/A'}
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Power Status:</span>
                    <span class="power-status ${computer.powerStatus || 'unknown'}">
                        ${computer.powerStatus ? computer.powerStatus.toUpperCase() : 'N/A'}
                    </span>
                </div>
            </div>

            <div class="detail-section">
                <h4>System Specifications</h4>
                <div class="detail-item">
                    <span class="detail-label">Processor:</span>
                    <span>${computer.specs?.cpu || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Memory (RAM):</span>
                    <span>${computer.specs?.ram || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Storage:</span>
                    <span>${computer.specs?.storage || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Operating System:</span>
                    <span>${computer.specs?.os || 'N/A'}</span>
                </div>
            </div>

            <div class="detail-section">
                <h4>Quick Status</h4>
                <div class="detail-item">
                    <span class="detail-label">Network Adapter:</span>
                    <span>${computer.specs?.network || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Download Speed:</span>
                    <span>${computer.networkSpeed?.download ? `${computer.networkSpeed.download.toFixed(2)} Mbps` : 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Upload Speed:</span>
                    <span>${computer.networkSpeed?.upload ? `${computer.networkSpeed.upload.toFixed(2)} Mbps` : 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Maintenance Required:</span>
                    <span>${computer.operationalStatus === 'maintenance' ? 'Yes' : 'No'}</span>
                </div>
            </div>

            <div class="detail-section">
                <h4>Hardware Connected</h4>
                <div class="detail-item">
                    <span class="detail-label">Keyboard:</span>
                    <span>${computer.specs?.hardwareConnected?.keyboard ? '✔ Connected' : '✖ Not connected'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Mouse:</span>
                    <span>${computer.specs?.hardwareConnected?.mouse ? '✔ Connected' : '✖ Not connected'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Monitor:</span>
                    <span>${computer.specs?.hardwareConnected?.monitor ? '✔ Connected' : '✖ Not connected'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Headphones:</span>
                    <span>${computer.specs?.hardwareConnected?.headphone ? '✔ Connected' : '✖ Not connected'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Microphone:</span>
                    <span>${computer.specs?.hardwareConnected?.microphone ? '✔ Connected' : '✖ Not connected'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">USB Drive:</span>
                    <span>${computer.specs?.hardwareConnected?.pendrive ? '✔ Connected' : '✖ Not connected'}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Current User</h4>
                <div class="detail-item">
                    <span class="detail-label">Name:</span>
                    <span>N/A</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Role:</span>
                    <span>N/A</span>
                </div>
            </div>

            <div class="detail-section">
                <h4>Registration Details</h4>
                <div class="detail-item">
                    <span class="detail-label">Registered By:</span>
                    <span>${computer.registeredBy?.name || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Registration Date:</span>
                    <span>${computer.registeredAt ? 
                        new Date(computer.registeredAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Last Updated:</span>
                    <span>${computer.lastUpdated ? 
                        new Date(computer.lastUpdated).toLocaleString() : 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Updated At:</span>
                    <span>${computer.updatedAt ? 
                        new Date(computer.updatedAt).toLocaleString() : 'N/A'}</span>
                </div>
            </div>
        `;

        // Add close button functionality
        document.querySelector('.popup-close').addEventListener('click', () => {
            popup.classList.add('hidden');
        });

    } catch (error) {
        console.error('Error showing computer details:', error);
        alert('Failed to load computer details');
    }
}
const style = document.createElement('style');
style.textContent = `
    .popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .popup-content {
        background: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 500px;
        width: 100%;
        position: relative;
    }
    .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #000;
    }
    .blur {
        filter: blur(5px);
        pointer-events: none; /* Prevent interaction with blurred content */
    }
`;
document.head.appendChild(style);

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
        loadIssuesTable();
        loadAllComputers(); // Refresh the issues table
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

        if (!response.ok) throw new Error('Failed to fetch issues');
        const issues = await response.json();

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

document.addEventListener('DOMContentLoaded', () => {
    // Set minimum date to today
    const dateInput = document.getElementById('studentBookingDate');
    const startTimeInput = document.getElementById('studentStartTime');
    const endTimeInput = document.getElementById('studentEndTime');
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    // If booking is for today, set min time to current time
    dateInput.addEventListener('change', () => {
        const selectedDate = dateInput.value;
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        
        if (selectedDate === currentDate) {
            // Calculate current time + 15 minutes (buffer time)
            const currentHours = now.getHours().toString().padStart(2, '0');
            const currentMinutes = (now.getMinutes() + 15).toString().padStart(2, '0');
            const minTime = `${currentHours}:${currentMinutes}`;
            
            startTimeInput.setAttribute('min', minTime);
            endTimeInput.setAttribute('min', minTime);
        } else {
            // For future dates, allow any time
            startTimeInput.removeAttribute('min');
            endTimeInput.removeAttribute('min');
        }
    });
    
    // Validate start time is before end time
    startTimeInput.addEventListener('change', () => {
        endTimeInput.setAttribute('min', startTimeInput.value);
    });
});

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

async function updateSystemSpecs() {
    try {
        // Fetch real-time specs from local endpoint
        const specs = await fetchSystemSpecs();
        
        if (!specs) {
            throw new Error('Could not fetch system specifications');
        }

        // Update basic specs
        const specsContainer = document.getElementById('systemSpecsContainer');
        specsContainer.innerHTML = ''; // Clear previous content

        // Add system specifications section
        const systemSpecsHTML = `
            <div class="spec-section">
                <h3>System Specifications</h3>
                <div class="spec-grid">
                    <div class="spec-item">
                        <span class="spec-label">Processor:</span>
                        <span class="spec-value">${specs.cpu || 'N/A'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Memory (RAM):</span>
                        <span class="spec-value">${specs.ram || 'N/A'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Storage:</span>
                        <span class="spec-value">${specs.storage || 'N/A'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Operating System:</span>
                        <span class="spec-value">${specs.os || 'N/A'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Network Adapter:</span>
                        <span class="spec-value">${specs.network || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
        specsContainer.insertAdjacentHTML('beforeend', systemSpecsHTML);

        // Add network performance section
        const networkSpecsHTML = `
            <div class="spec-section">
                <h3>Network Performance</h3>
                <div class="spec-grid">
                    <div class="spec-item">
                        <span class="spec-label">IP Address:</span>
                        <span class="spec-value">${specs.ipAddress || 'N/A'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Download Speed:</span>
                        <span class="spec-value">
                            ${specs.networkSpeed?.download ? `${specs.networkSpeed.download.toFixed(2)} Mbps` : 'N/A'}
                        </span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Upload Speed:</span>
                        <span class="spec-value">
                            ${specs.networkSpeed?.upload ? `${specs.networkSpeed.upload.toFixed(2)} Mbps` : 'N/A'}
                        </span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Ping:</span>
                        <span class="spec-value">
                            ${specs.networkSpeed?.ping ? `${specs.networkSpeed.ping} ms` : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        `;
        specsContainer.insertAdjacentHTML('beforeend', networkSpecsHTML);

        // Add hardware connected section as a list
        const hardwareHTML = `
            <div class="spec-section">
                <h3>Hardware Connected</h3>
                <ul class="hardware-list">
                    ${specs.hardwareConnected ? `
                        <li class="hardware-item ${specs.hardwareConnected.keyboard ? 'connected' : 'disconnected'}">
                            Keyboard: ${specs.hardwareConnected.keyboard ? '✔ Connected' : '✖ Not connected'}
                        </li>
                        <li class="hardware-item ${specs.hardwareConnected.mouse ? 'connected' : 'disconnected'}">
                            Mouse: ${specs.hardwareConnected.mouse ? '✔ Connected' : '✖ Not connected'}
                        </li>
                        <li class="hardware-item ${specs.hardwareConnected.monitor ? 'connected' : 'disconnected'}">
                            Monitor: ${specs.hardwareConnected.monitor ? '✔ Connected' : '✖ Not connected'}
                        </li>
                        <li class="hardware-item ${specs.hardwareConnected.headphone ? 'connected' : 'disconnected'}">
                            Headphones: ${specs.hardwareConnected.headphone ? '✔ Connected' : '✖ Not connected'}
                        </li>
                        <li class="hardware-item ${specs.hardwareConnected.microphone ? 'connected' : 'disconnected'}">
                            Microphone: ${specs.hardwareConnected.microphone ? '✔ Connected' : '✖ Not connected'}
                        </li>
                        <li class="hardware-item ${specs.hardwareConnected.pendrive ? 'connected' : 'disconnected'}">
                            USB Drive: ${specs.hardwareConnected.pendrive ? '✔ Connected' : '✖ Not connected'}
                        </li>
                    ` : `
                        <li class="hardware-item disconnected">Hardware status unavailable</li>
                    `}
                </ul>
            </div>
        `;
        specsContainer.insertAdjacentHTML('beforeend', hardwareHTML);

        // Add refresh button functionality
        const refreshBtn = document.getElementById('refreshSpecsBtn');
        if (refreshBtn) {
            refreshBtn.onclick = updateSystemSpecs;
        }

    } catch (error) {
        console.error('Error updating system specs:', error);
        const specsContainer = document.getElementById('systemSpecsContainer');
        specsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Could not load system specifications. Please try again later.</p>
                <button id="retrySpecsBtn" class="btn-primary">Retry</button>
            </div>
        `;
        document.getElementById('retrySpecsBtn').onclick = updateSystemSpecs;
    }
}

// Initialize when This PC section is shown
document.addEventListener('DOMContentLoaded', function() {
    // Update specs when This PC section is shown
    document.querySelector('[data-target="thisPC"]')?.addEventListener('click', updateSystemSpecs);
});

