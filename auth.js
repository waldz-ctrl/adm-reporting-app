document.addEventListener('DOMContentLoaded', () => {
    const loginFormContainer = document.getElementById('login-form');
    const registerFormContainer = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const messageDiv = document.getElementById('message');

    // Toggle forms
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'block';
        registerFormContainer.style.display = 'none';
    });

    // Handle Registration
    const registerForm = document.getElementById('register');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            action: 'register',
            payload: {
                fullName: document.getElementById('fullName').value,
                schoolName: document.getElementById('schoolName').value,
                schoolType: document.getElementById('schoolType').value,
                email: document.getElementById('register-email').value,
                password: document.getElementById('register-password').value,
            }
        };

        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.status === 'success') {
                messageDiv.textContent = "Registration successful! Please login.";
                messageDiv.style.color = 'green';
                showLoginLink.click(); // Switch to login form
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            messageDiv.textContent = `Error: ${error.message}`;
            messageDiv.style.color = 'red';
        }
    });

    // Handle Login
    const loginForm = document.getElementById('login');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            action: 'login',
            payload: {
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value,
            }
        };

        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (result.status === 'success') {
                saveUserSession(result.data); // Save user data to session
                window.location.href = 'main.html'; // Redirect to main app page
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            messageDiv.textContent = `Error: ${error.message}`;
            messageDiv.style.color = 'red';
        }
    });
});