// Production Configuration for Animal Healthcare System
// This will be used when deployed on Netlify

window.API_CONFIG = {
    // Backend API URL - UPDATE THIS after Railway deployment
    BASE_URL: 'https://railway.com/project/983ebea3-fa16-48ac-93d5-0ba5d692be72?environmentId=a70dbf38-dd2d-467b-b017-60e77f8d6d5a',
    
    // Request timeout (30 seconds)
    TIMEOUT: 30000,
    
    // Disable debug logging in production
    DEBUG_MODE: false,
    
    // Application info
    APP_NAME: 'Animal Healthcare System',
    VERSION: '1.0.0',
    ENVIRONMENT: 'production',
    
    // Feature flags for production
    FEATURES: {
        CHAT_ENABLED: true,
        EMERGENCY_SUBMISSIONS: true,
        USER_REGISTRATION: true,
        DEBUG_CONSOLE: false
    }
};

// Set global API URL for other scripts
window.API_BASE_URL = window.API_CONFIG.BASE_URL;

// Log configuration load (only in dev mode)
if (window.API_CONFIG.DEBUG_MODE) {
    console.log('🚀 Production config loaded:', window.API_CONFIG);
}
