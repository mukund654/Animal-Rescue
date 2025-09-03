// Authentication management for frontend

class AuthManager {
    constructor() {
        this.apiUrl = 'http://localhost:8080/api';
        this.init();
    }

    init() {
        // Check authentication status on page load
        this.checkAuthStatus();
        
        // Add logout functionality
        document.addEventListener('DOMContentLoaded', () => {
            this.setupLogoutHandler();
        });
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('jwtToken');
        const userInfo = localStorage.getItem('userInfo');
        return token && userInfo;
    }

    // Get user information
    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    }

    // Check auth status and update UI
    checkAuthStatus() {
        if (this.isAuthenticated()) {
            this.showAuthenticatedUI();
        } else {
            this.showUnauthenticatedUI();
        }
    }

    // Show UI for authenticated users
    showAuthenticatedUI() {
        const userInfo = this.getUserInfo();
        const signBtnDiv = document.querySelector('.sign-btn');
        
        if (signBtnDiv && userInfo) {
            signBtnDiv.innerHTML = `
                <span style="color: #ff6e01; margin-right: 15px;">Welcome, ${userInfo.fullName || userInfo.username}</span>
                <button id="logout-btn" style="background: #e74c3c; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Logout</button>
            `;
            
            // Add logout event listener
            document.getElementById('logout-btn').addEventListener('click', () => {
                this.logout();
            });
        }
    }

    // Show UI for unauthenticated users
    showUnauthenticatedUI() {
        const signBtnDiv = document.querySelector('.sign-btn');
        
        if (signBtnDiv) {
            signBtnDiv.innerHTML = `
                <button id="btn1" onclick="window.location.href='sign_up.html'">Sign-Up</button>
                <button onclick="window.location.href='sign_in.html'">Log-in</button>
            `;
        }
    }

    // Setup logout handler
    setupLogoutHandler() {
        // Handle logout from any page
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'logout-btn') {
                this.logout();
            }
        });
    }

    // Logout function
    logout() {
        // Clear local storage
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userInfo');
        
        // Show success message
        alert('Logged out successfully!');
        
        // Redirect to home page
        window.location.href = 'index.html';
    }

    // Get authentication headers for API calls
    getAuthHeaders() {
        const token = localStorage.getItem('jwtToken');
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    }

    // Check if user has specific role
    hasRole(role) {
        const userInfo = this.getUserInfo();
        return userInfo && userInfo.role === role;
    }

    // Redirect if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            alert('Please login to access this page');
            window.location.href = 'sign_in.html';
            return false;
        }
        return true;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Make it available globally
window.authManager = authManager;
