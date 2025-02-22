// auth.js
const USERS = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' }
];

// Check if user is already logged in
function checkAuth() {
    const user = sessionStorage.getItem('user');
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    } else if (!user && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

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