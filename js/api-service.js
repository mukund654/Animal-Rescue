// API Service for Animal Rescue Backend Integration
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:8080/api';
        this.token = localStorage.getItem('jwtToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('jwtToken', token);
    }

    // Remove authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('jwtToken');
    }

    // Get authentication headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: this.getHeaders(options.auth !== false),
            ...options
        };

        try {
            console.log(`API Request: ${config.method} ${url}`);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Health check
    async checkHealth() {
        return await this.request('/test/health', { auth: false });
    }

    // Authentication APIs
    async login(credentials) {
        const response = await this.request('/auth/signin', {
            method: 'POST',
            body: JSON.stringify(credentials),
            auth: false
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            localStorage.setItem('userInfo', JSON.stringify(response.data));
        }
        
        return response;
    }

    async register(userData) {
        return await this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
            auth: false
        });
    }

    // Emergency Request APIs
    async submitEmergencyRequest(requestData) {
        return await this.request('/emergency/submit', {
            method: 'POST',
            body: JSON.stringify(requestData),
            auth: false // Allow anonymous submissions
        });
    }

    async getAllEmergencyRequests() {
        return await this.request('/emergency/all');
    }

    async getPendingEmergencyRequests() {
        return await this.request('/emergency/pending');
    }

    async getEmergencyRequest(id) {
        return await this.request(`/emergency/${id}`);
    }

    async getMyEmergencyRequests() {
        return await this.request('/emergency/my-requests');
    }

    async assignVolunteer(requestId, volunteerId) {
        return await this.request(`/emergency/${requestId}/assign/${volunteerId}`, {
            method: 'PUT'
        });
    }

    async updateRequestStatus(requestId, status) {
        return await this.request(`/emergency/${requestId}/status?status=${status}`, {
            method: 'PUT'
        });
    }

    async getRequestsByStatus(status) {
        return await this.request(`/emergency/status/${status}`);
    }

    async getRequestsByUrgency(urgency) {
        return await this.request(`/emergency/urgency/${urgency}`);
    }

    async getRecentRequests(hours = 24) {
        return await this.request(`/emergency/recent?hours=${hours}`);
    }

    async searchRequestsByLocation(location) {
        return await this.request(`/emergency/search/location?location=${encodeURIComponent(location)}`);
    }

    async searchRequestsByAnimal(animalType) {
        return await this.request(`/emergency/search/animal?animalType=${encodeURIComponent(animalType)}`);
    }

    async getEmergencyStats() {
        return await this.request('/emergency/stats');
    }

    // User Management APIs
    async getCurrentUser() {
        return await this.request('/users/profile');
    }

    async updateProfile(userData) {
        return await this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async getAllUsers() {
        return await this.request('/users/all');
    }

    async getAllVolunteers() {
        return await this.request('/users/volunteers');
    }

    async searchVolunteers(searchTerm) {
        return await this.request(`/users/volunteers/search?search=${encodeURIComponent(searchTerm)}`);
    }

    async getUsersByRole(role) {
        return await this.request(`/users/role/${role}`);
    }

    async searchUsers(name) {
        return await this.request(`/users/search?name=${encodeURIComponent(name)}`);
    }

    async getUserById(userId) {
        return await this.request(`/users/${userId}`);
    }

    async updateUserRole(userId, role) {
        return await this.request(`/users/${userId}/role?role=${role}`, {
            method: 'PUT'
        });
    }

    async deleteUser(userId) {
        return await this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }

    // Chat System APIs
    async createChatRoom(emergencyId) {
        return await this.request(`/chat/room/emergency/${emergencyId}`, {
            method: 'POST'
        });
    }

    async getChatRoom(emergencyId) {
        return await this.request(`/chat/room/emergency/${emergencyId}`);
    }

    async sendChatMessage(roomId, message) {
        return await this.request(`/chat/room/${roomId}/message`, {
            method: 'POST',
            body: JSON.stringify({ message: message })
        });
    }

    async getChatMessages(roomId) {
        return await this.request(`/chat/room/${roomId}/messages`);
    }

    async markMessagesAsRead(roomId) {
        return await this.request(`/chat/room/${roomId}/read`, {
            method: 'PUT'
        });
    }

    async getUnreadCount(roomId) {
        return await this.request(`/chat/room/${roomId}/unread-count`);
    }

    async getUserChatRooms() {
        return await this.request('/chat/rooms');
    }

    async assignVolunteerToChat(roomId, volunteerId) {
        return await this.request(`/chat/room/${roomId}/assign/${volunteerId}`, {
            method: 'PUT'
        });
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUserData() {
        const userData = localStorage.getItem('userInfo');
        return userData ? JSON.parse(userData) : null;
    }

    logout() {
        this.clearToken();
        localStorage.removeItem('userInfo');
    }

    // Convert local storage format to API format
    convertToApiFormat(localRequest) {
        return {
            animalType: localRequest.animalType || localRequest.animal_type,
            urgency: (localRequest.urgency || '').toUpperCase(),
            location: localRequest.location,
            contactName: localRequest.contactName || localRequest.contact_name,
            contactPhone: localRequest.contactPhone || localRequest.contact_phone,
            contactEmail: localRequest.contactEmail || localRequest.contact_email || '',
            description: localRequest.description
        };
    }

    // Convert API format to local display format
    convertFromApiFormat(apiRequest) {
        return {
            id: apiRequest.id,
            animalType: apiRequest.animalType,
            urgency: apiRequest.urgency.toLowerCase(),
            location: apiRequest.location,
            contactName: apiRequest.contactName,
            contactPhone: apiRequest.contactPhone,
            contactEmail: apiRequest.contactEmail || '',
            description: apiRequest.description,
            timestamp: apiRequest.createdAt,
            status: apiRequest.status.toLowerCase(),
            helper: apiRequest.volunteerId ? {
                name: apiRequest.volunteerName,
                phone: apiRequest.volunteerPhone,
                id: apiRequest.volunteerId
            } : null,
            chatMessages: [] // Chat functionality can be extended later
        };
    }
}

// Create global API service instance
window.apiService = new ApiService();
