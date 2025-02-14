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
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!data.token || !data.role) {
        throw new Error('Invalid response from server');
      }
  
      // Store the token and role in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
  
      // Redirect based on role
      switch (data.role) {
        case 'admin':
          window.location.href = '/dashboard.html';
          break;
        case 'staff':
          window.location.href = '/dashboard.html';
          break;
        case 'student':
          window.location.href = '/dashboard.html';
          break;
        default:
          throw new Error('Unknown role');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: Invalid username or password');
    }
  });