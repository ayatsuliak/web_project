function showError(targetId, message) {
    const errorContainer = document.getElementById(targetId);
    const errorBox = document.createElement('div');
    errorBox.className = 'error-box';
    errorBox.textContent = message;
    errorContainer.innerHTML = ''; 
    errorContainer.appendChild(errorBox);
}

function hideError(targetId) {
    const errorContainer = document.getElementById(targetId);
    errorContainer.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        hideError('username-error'); 
        hideError('password-error'); 
        hideError('message-container'); 

        const username = usernameInput.value;
        const password = passwordInput.value;
        const errors = [];

        if (username.length < 4 || username.length > 16) {
            errors.push('Username must be between 4 and 16 characters long');
            showError('username-error', 'Username must be between 4 and 16 characters long');
        }

        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            errors.push('Username must contain only letters and numbers');
            showError('username-error', 'Username must contain only letters and numbers');
        }

        if (password.length < 8 || password.length > 16) {
            errors.push('The password must be between 8 and 16 characters');
            showError('password-error', 'The password must be between 8 and 16 characters');
        }

        if (errors.length > 0) {
            return;
        }

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.status === 200) {
                const messageContainer = document.getElementById('message-container');
                messageContainer.innerHTML = `<div class="success-message">${data.message}</div>`;
                const accessToken = data.accessToken;
                localStorage.setItem('accessToken', accessToken);
                window.location.href = data.redirect;
            } else {
                const messageContainer = document.getElementById('message-container');
                messageContainer.innerHTML = `<div class="error-server-message">${data.message}</div>`;                        
            }
        } catch (error) {
            console.error('Помилка при відправці запиту:', error);
        }
    });
});