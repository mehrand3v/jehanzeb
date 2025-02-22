// auth.js
const USERS = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' }
];

// Check if user is already logged in
// auth.js

// checkAuth function

function checkAuth() {
    const user = sessionStorage.getItem('user');
    const isLoginPage = window.location.pathname.endsWith('login.html');

    if (!user && !isLoginPage) {
        // No user logged in and not on login page - redirect to login
        window.location.replace('login.html');
        return false;
    } else if (user && isLoginPage) {
        // User is logged in but on login page - redirect to index
        window.location.replace('index.html');
        return false;
    }
    return true;
}

// Make sure this runs when page loads
document.addEventListener('DOMContentLoaded', checkAuth);

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    const user = USERS.find(u => u.username === username && u.password === password);

    if (user) {
        // Store user info in session storage
        sessionStorage.setItem('user', JSON.stringify({
            username: user.username,
            role: user.role,
            loginTime: new Date().toISOString()
        }));

        // Redirect to main page
        window.location.href = 'index.html';
    } else {
        errorMessage.textContent = 'Invalid username or password';
    }
});

// Add logout functionality
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', checkAuth);