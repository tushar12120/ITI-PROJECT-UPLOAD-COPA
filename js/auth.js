// Authentication Helper Functions

// Show toast notification
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast alert-${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✓' : type === 'danger' ? '✕' : 'ℹ'}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Check admin login status
function isAdminLoggedIn() {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
}

// Check student login status
function isStudentLoggedIn() {
    return sessionStorage.getItem('studentLoggedIn') === 'true';
}

// Get current student info
function getCurrentStudent() {
    const data = sessionStorage.getItem('studentData');
    return data ? JSON.parse(data) : null;
}

// Admin logout
function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = '/admin/login.html';
}

// Student logout
function studentLogout() {
    sessionStorage.removeItem('studentLoggedIn');
    sessionStorage.removeItem('studentData');
    window.location.href = '/student/login.html';
}

// Protect admin routes
function protectAdminRoute() {
    if (!isAdminLoggedIn()) {
        window.location.href = '/admin/login.html';
        return false;
    }
    return true;
}

// Protect student routes
function protectStudentRoute() {
    if (!isStudentLoggedIn()) {
        window.location.href = '/student/login.html';
        return false;
    }
    return true;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Format datetime
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    };
    return new Date(dateString).toLocaleString('en-IN', options);
}

// Mobile menu toggle (for responsive design)
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebar) {
        sidebar.classList.toggle('active');
    }
    if (overlay) {
        overlay.classList.toggle('active');
    }
}
