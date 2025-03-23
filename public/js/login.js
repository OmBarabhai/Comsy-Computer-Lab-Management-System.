document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store the token and role in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role); // Fixed: Get role from user object
        localStorage.setItem('userId', data.user.id); // Store user ID

        // Redirect to the appropriate dashboard based on role
        redirectToDashboard(data.user.role);

    } catch (error) {
        console.error('Login failed:', error);
        alert(error.message || 'Login failed. Please try again.');
    }
});

document.getElementById('togglePasswordLogin').addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

// Function to redirect to the appropriate dashboard
function redirectToDashboard(role) {
    switch (role.toLowerCase()) {
        case 'admin':
            window.location.href = 'dashboard.html';
            break;
        case 'student':
            window.location.href = 'dashboard.html';
            break;
        case 'staff':
            window.location.href = 'dashboard.html';
            break;
        default:
            console.error('Unknown role:', role);
            alert('Unknown role. Please contact support.');
            window.location.href = '/login.html'; // Redirect to login if role is unknown
    }
}