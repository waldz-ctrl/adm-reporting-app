// VERY IMPORTANT: Paste the Web App URL you copied from Google Apps Script here
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx5ZyZ2nVyTJKFMsUj8TpztGiWEcU0EShip8uePk0vmzuj7BciI-Ia62RdDhMuncMakXw/exec';

// Function to store user info in the browser's session
function saveUserSession(userData) {
    sessionStorage.setItem('user', JSON.stringify(userData));
}

// Function to get user info
function getUserSession() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Function to check if a user is logged in and protect a page
function protectPage() {
    const user = getUserSession();
    if (!user) {
        window.location.href = 'login.html';
    }
    return user;
}

// Function to clear session on logout
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'index.html'; // Redirect to public dashboard
}