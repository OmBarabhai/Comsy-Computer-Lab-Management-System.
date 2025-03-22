// public/js/profile.js
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Load current profile data
    loadProfileData();

    // Handle form submission
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateProfile();
    });
});

document.getElementById('toggleCurrentPassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('currentPassword');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

document.getElementById('toggleNewPassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('newPassword');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

async function loadProfileData() {
    try {
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to load profile');
        
        const userData = await response.json();
        document.getElementById('profileName').value = userData.name;
        document.getElementById('profileEmail').value = userData.email;
    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    }
}

async function updateProfile() {
    const updateBtn = document.getElementById('updateProfileBtn');
    const messageEl = document.getElementById('profileMessage');
    
    try {
        updateBtn.disabled = true;
        updateBtn.textContent = 'Updating...';

        const updateData = {
            name: document.getElementById('profileName').value,
            email: document.getElementById('profileEmail').value,
            currentPassword: document.getElementById('currentPassword').value,
            newPassword: document.getElementById('newPassword').value
        };

        const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Update failed');
        
        showMessage('Profile updated successfully!', 'success');
        if (updateData.newPassword) {
            // If password changed, log out
            setTimeout(() => {
                localStorage.clear();
                window.location.href = '/login.html';
            }, 1500);
        }
    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    } finally {
        updateBtn.disabled = false;
        updateBtn.textContent = 'Update Profile';
    }
}

function showMessage(message, type) {
    const messageEl = document.getElementById('profileMessage');
    messageEl.textContent = message;
    messageEl.className = `status-message ${type}`;
    messageEl.style.display = 'block';
    setTimeout(() => messageEl.style.display = 'none', 3000);
}