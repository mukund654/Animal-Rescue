// Configuration file for frontend application
// This file can be customized for different environments

// API Configuration
window.API_CONFIG = {
    // Base URL for the backend API
    // Change this for different environments (development, staging, production)
    BASE_URL: window.API_BASE_URL || 'http://localhost:8080/api',
    
    // Timeout for API requests (in milliseconds)
    TIMEOUT: 30000,
    
    // Enable/disable API request logging
    DEBUG_MODE: true,
    
    // Other configuration options
    APP_NAME: 'Animal Healthcare System',
    VERSION: '1.0.0',
    
    // Feature flags
    FEATURES: {
        CHAT_ENABLED: true,
        EMERGENCY_SUBMISSIONS: true,
        USER_REGISTRATION: true
    }
};

// Make it available globally for other scripts
window.API_BASE_URL = window.API_CONFIG.BASE_URL;

console.log('Frontend configuration loaded:', window.API_CONFIG);
