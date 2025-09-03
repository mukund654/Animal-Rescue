// Emergency Rescue System with Backend Integration

// Global variables
let emergencyRequests = [];
let currentUser = 'Anonymous User';
let currentChatRequest = null;
let backendConnected = false;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing with backend...'); 
    
    // Check if API service is loaded
    if (typeof apiService === 'undefined') {
        console.error('API Service not loaded! Please include api-service.js');
        showAlert('Backend connection failed. Using offline mode.', 'warning');
        loadLocalData();
        return;
    }
    
    // Test backend connection
    initializeBackendConnection();
    
    // Set up form submission
    setTimeout(() => {
        const form = document.getElementById('emergencyForm');
        if (form) {
            form.removeEventListener('submit', submitEmergencyRequest);
            form.addEventListener('submit', submitEmergencyRequest);
            console.log('Form event listener added');
        }
    }, 100);
    
    // Set up event delegation for dynamic buttons
    setupEventDelegation();
    
    // Load user authentication state
    loadUserState();
});

// Initialize backend connection
async function initializeBackendConnection() {
    try {
        console.log('Testing backend connection...');
        const healthCheck = await apiService.checkHealth();
        
        if (healthCheck && healthCheck.success) {
            console.log('✅ Backend connected successfully!');
            showAlert('Connected to Animal Rescue backend server!', 'success');
            backendConnected = true;
            
            // Load requests from backend
            await loadRequestsFromBackend();
        } else {
            throw new Error('Health check failed');
        }
    } catch (error) {
        console.warn('⚠️ Backend connection failed:', error.message);
        showAlert('Backend server not available. Running in offline mode.', 'warning');
        backendConnected = false;
        loadLocalData();
    }
}

// Load requests from backend
async function loadRequestsFromBackend() {
    try {
        console.log('Loading requests from backend...');
        
        // Try to get all public requests (pending ones)
        const response = await apiService.getPendingEmergencyRequests();
        
        if (response && response.success && response.data) {
            const backendRequests = response.data.map(apiRequest => 
                apiService.convertFromApiFormat(apiRequest)
            );
            
            console.log('Loaded requests from backend:', backendRequests);
            
            // Merge with local requests (keep both backend and local)
            const localRequests = JSON.parse(localStorage.getItem('emergencyRequests')) || [];
            
            // Combine requests, prioritizing backend data for existing IDs
            const combinedRequests = [...backendRequests];
            
            // Add local requests that don't exist in backend
            localRequests.forEach(localReq => {
                const existsInBackend = backendRequests.some(backendReq => backendReq.id === localReq.id);
                if (!existsInBackend) {
                    combinedRequests.push(localReq);
                }
            });
            
            emergencyRequests = combinedRequests;
            
            // Also load accepted requests
            const acceptedResponse = await apiService.getRequestsByStatus('ACCEPTED');
            if (acceptedResponse && acceptedResponse.success && acceptedResponse.data) {
                const acceptedRequests = acceptedResponse.data.map(apiRequest => 
                    apiService.convertFromApiFormat(apiRequest)
                );
                
                // Add accepted requests that aren't already in the list
                acceptedRequests.forEach(acceptedReq => {
                    const exists = emergencyRequests.some(req => req.id === acceptedReq.id);
                    if (!exists) {
                        emergencyRequests.push(acceptedReq);
                    }
                });
                
                console.log('Also loaded accepted requests from backend');
            }
            
            // Update localStorage with the merged data
            localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
            
        } else {
            console.log('No data from backend, loading local data...');
            // Fallback to local data first, then sample data
            const localRequests = JSON.parse(localStorage.getItem('emergencyRequests')) || [];
            if (localRequests.length > 0) {
                emergencyRequests = localRequests;
                console.log('Loaded local requests:', emergencyRequests);
            } else {
                addSampleRequests();
            }
        }
    } catch (error) {
        console.error('Failed to load requests from backend:', error);
        // If we can't load from backend, load from localStorage
        const localRequests = JSON.parse(localStorage.getItem('emergencyRequests')) || [];
        if (localRequests.length > 0) {
            emergencyRequests = localRequests;
            console.log('Fallback to local requests:', emergencyRequests);
        } else {
            addSampleRequests();
        }
    } finally {
        // Always refresh the display
        displayRequests();
        updateRequestCounts();
    }
}

// Load local data (fallback)
function loadLocalData() {
    emergencyRequests = JSON.parse(localStorage.getItem('emergencyRequests')) || [];
    if (emergencyRequests.length === 0) {
        addSampleRequests();
    }
    displayRequests();
    updateRequestCounts();
}

// Load user authentication state
function loadUserState() {
    // Use authManager if available, fallback to apiService
    if (typeof authManager !== 'undefined' && authManager.isAuthenticated()) {
        const userData = authManager.getUserInfo();
        if (userData) {
            currentUser = userData.fullName || userData.username;
            console.log('User authenticated via authManager:', currentUser);
            updateUIForAuthenticatedUser(userData);
        }
    } else if (apiService.isAuthenticated()) {
        const userData = apiService.getCurrentUserData();
        if (userData) {
            currentUser = userData.fullName || userData.username;
            console.log('User authenticated via apiService:', currentUser);
            updateUIForAuthenticatedUser(userData);
        }
    }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser(userData) {
    // Update sign-in/sign-up buttons
    const signBtns = document.querySelector('.sign-btn');
    if (signBtns) {
        signBtns.innerHTML = `
            <span>Welcome, ${userData.fullName}!</span>
            <button onclick="logout()">Logout</button>
        `;
    }
    
    // Show role-specific content
    if (userData.role === 'ADMIN' || userData.role === 'VOLUNTEER') {
        // Add admin/volunteer controls (could be extended)
        console.log('User has elevated permissions:', userData.role);
    }
}

// Submit emergency request with backend integration
async function submitEmergencyRequest(e) {
    e.preventDefault();
    
    console.log('Form submitted!');
    
    // Get form data
    const formData = {
        animalType: document.getElementById('animalType').value,
        urgency: document.getElementById('urgency').value.toUpperCase(),
        location: document.getElementById('location').value,
        contactName: document.getElementById('contactName').value,
        contactPhone: document.getElementById('contactPhone').value,
        contactEmail: document.getElementById('contactEmail').value || '',
        description: document.getElementById('description').value
    };
    
    console.log('Form data:', formData);
    
    // Validate required fields
    if (!formData.animalType || !formData.urgency || !formData.location || 
        !formData.contactName || !formData.contactPhone || !formData.description) {
        showAlert('Please fill in all required fields.', 'error');
        return;
    }
    
    try {
        if (backendConnected) {
            // Submit to backend
            console.log('Submitting to backend...');
            const response = await apiService.submitEmergencyRequest(formData);
            
            if (response && response.success) {
                showAlert('Emergency request submitted successfully to our rescue team!', 'success');
                
                // Add to local array for immediate display
                const localRequest = {
                    id: response.data.id,
                    ...formData,
                    urgency: formData.urgency.toLowerCase(),
                    timestamp: response.data.createdAt || new Date().toISOString(),
                    status: 'pending',
                    helper: null,
                    chatMessages: []
                };
                
                emergencyRequests.unshift(localRequest); // Add to beginning
                
                // Always save to localStorage for persistence
                localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
            } else {
                throw new Error(response.message || 'Submission failed');
            }
        } else {
            // Fallback to local storage
            const localRequest = {
                id: generateRequestId(),
                ...formData,
                urgency: formData.urgency.toLowerCase(),
                timestamp: new Date().toISOString(),
                status: 'pending',
                helper: null,
                chatMessages: []
            };
            
            emergencyRequests.unshift(localRequest);
            localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
            showAlert('Emergency request saved locally. Will sync when server is available.', 'success');
        }
        
        // Reset form and refresh display
        document.getElementById('emergencyForm').reset();
        document.getElementById('submit-request').style.display = 'none';
        document.querySelector('.requests-section').scrollIntoView({ behavior: 'smooth' });
        
        displayRequests();
        updateRequestCounts();
        
    } catch (error) {
        console.error('Error submitting request:', error);
        showAlert(`Error submitting request: ${error.message}`, 'error');
    }
}

// Accept a request (enhanced with backend integration)
async function acceptRequest(requestId) {
    console.log('acceptRequest called with ID:', requestId);
    
    const request = emergencyRequests.find(req => req.id === requestId);
    if (!request) {
        showAlert('Request not found. Please refresh the page and try again.', 'error');
        return;
    }
    
    if (request.status === 'accepted') {
        showAlert('This request has already been accepted by someone else.', 'error');
        return;
    }
    
    // Check if user is authenticated
    const userData = apiService.getCurrentUserData();
    let helperName, helperPhone, helperEmail;
    
    if (userData) {
        // Use authenticated user's data
        helperName = userData.fullName;
        helperPhone = userData.phone || prompt('Please enter your phone number:');
        helperEmail = userData.email;
        
        if (!helperPhone) {
            showAlert('Phone number is required to accept this request.', 'error');
            return;
        }
    } else {
        // Prompt for details
        helperName = prompt('Enter your name:');
        if (!helperName || helperName.trim() === '') {
            showAlert('Name is required to accept this request.', 'error');
            return;
        }
        
        helperPhone = prompt('Enter your phone number:');
        if (!helperPhone || helperPhone.trim() === '') {
            showAlert('Phone number is required to accept this request.', 'error');
            return;
        }
        
        helperEmail = prompt('Enter your email (optional):') || '';
    }
    
    try {
        if (backendConnected && userData && (userData.role === 'VOLUNTEER' || userData.role === 'ADMIN')) {
            // Use backend API to assign volunteer
            console.log('Assigning volunteer through backend...');
            const response = await apiService.assignVolunteer(requestId, userData.id);
            
            if (response && response.success) {
                // Update local request
                const requestIndex = emergencyRequests.findIndex(req => req.id === requestId);
                if (requestIndex !== -1) {
                    emergencyRequests[requestIndex].status = 'accepted';
                    emergencyRequests[requestIndex].helper = {
                        name: helperName.trim(),
                        phone: helperPhone.trim(),
                        email: helperEmail.trim(),
                        id: userData.id
                    };
                    
                    // Always save to localStorage for persistence
                    localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
                }
                
                showAlert('Thank you for volunteering! The request owner will be notified.', 'success');
            } else {
                throw new Error(response.message || 'Failed to assign volunteer');
            }
        } else {
            // Local fallback
            const requestIndex = emergencyRequests.findIndex(req => req.id === requestId);
            if (requestIndex !== -1) {
                emergencyRequests[requestIndex].status = 'accepted';
                emergencyRequests[requestIndex].helper = {
                    name: helperName.trim(),
                    phone: helperPhone.trim(),
                    email: helperEmail.trim()
                };
                
                if (!emergencyRequests[requestIndex].chatMessages) {
                    emergencyRequests[requestIndex].chatMessages = [];
                }
                
                emergencyRequests[requestIndex].chatMessages.push({
                    sender: 'system',
                    message: `${helperName.trim()} has accepted this rescue request and will be in touch soon.`,
                    timestamp: new Date().toISOString()
                });
                
                localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
                showAlert('Thank you for volunteering to help! (Local mode)', 'success');
            }
        }
        
        displayRequests();
        updateRequestCounts();
        
        setTimeout(() => {
            showTab('accepted');
        }, 1000);
        
    } catch (error) {
        console.error('Error accepting request:', error);
        showAlert(`Error accepting request: ${error.message}`, 'error');
    }
}

// Display requests (unified function)
function displayRequests() {
    const pendingContainer = document.getElementById('pendingRequests');
    const acceptedContainer = document.getElementById('acceptedRequests');
    
    // Clear containers
    pendingContainer.innerHTML = '';
    acceptedContainer.innerHTML = '';
    
    // Sort requests by timestamp (newest first)
    const sortedRequests = emergencyRequests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    sortedRequests.forEach(request => {
        const requestCard = createRequestCard(request);
        
        if (request.status === 'pending') {
            pendingContainer.appendChild(requestCard);
        } else {
            acceptedContainer.appendChild(requestCard);
        }
    });
    
    // Show message if no requests
    if (pendingContainer.children.length === 0) {
        pendingContainer.innerHTML = '<p class="no-requests">No pending emergency requests at the moment.</p>';
    }
    
    if (acceptedContainer.children.length === 0) {
        acceptedContainer.innerHTML = '<p class="no-requests">No accepted requests yet.</p>';
    }
}

// Create request card HTML (same as original but with backend status)
function createRequestCard(request) {
    const card = document.createElement('div');
    card.className = 'request-card';
    
    const urgencyClass = `urgency-${request.urgency}`;
    const timeAgo = getTimeAgo(request.timestamp);
    const backendBadge = backendConnected ? '<span class="backend-badge">🟢 Live</span>' : '<span class="backend-badge">🔴 Offline</span>';
    
    card.innerHTML = `
        <div class="request-header">
            <span class="animal-type">${request.animalType.toUpperCase()}</span>
            <span class="urgency-level ${urgencyClass}">${request.urgency.toUpperCase()}</span>
            ${backendBadge}
        </div>
        
        <div class="request-info">
            <h4><i class="fas fa-map-marker-alt"></i> ${request.location}</h4>
            <p><i class="fas fa-clock"></i> <strong>Submitted:</strong> ${timeAgo}</p>
            <p><i class="fas fa-user"></i> <strong>Contact:</strong> ${request.contactName}</p>
            <p><i class="fas fa-phone"></i> <strong>Phone:</strong> ${request.contactPhone}</p>
            ${request.contactEmail ? `<p><i class="fas fa-envelope"></i> <strong>Email:</strong> ${request.contactEmail}</p>` : ''}
            <p><i class="fas fa-info-circle"></i> <strong>Description:</strong></p>
            <p>${request.description}</p>
        </div>
        
        ${request.status === 'pending' ? `
            <div class="request-actions">
                <button class="accept-btn" onclick="acceptRequest('${request.id}')">
                    <i class="fas fa-hand-holding-heart"></i> Accept & Help
                </button>
            </div>
        ` : `
            <div class="helper-info">
                <h5><i class="fas fa-user-check"></i> Helping: ${request.helper.name}</h5>
                <p><i class="fas fa-phone"></i> ${request.helper.phone}</p>
                ${request.helper.email ? `<p><i class="fas fa-envelope"></i> ${request.helper.email}</p>` : ''}
            </div>
            <div class="request-actions">
                <button class="chat-btn" onclick="openChat('${request.id}')">
                    <i class="fas fa-comments"></i> Chat
                </button>
                ${backendConnected ? `
                    <button class="status-btn" onclick="markAsCompleted('${request.id}')">
                        <i class="fas fa-check-circle"></i> Mark Complete
                    </button>
                ` : ''}
            </div>
        `}
        
        <div class="request-id">
            <small><i class="fas fa-hashtag"></i> Request ID: ${request.id}</small>
        </div>
    `;
    
    return card;
}

// Mark request as completed (backend integration)
async function markAsCompleted(requestId) {
    try {
        if (backendConnected) {
            const response = await apiService.updateRequestStatus(requestId, 'COMPLETED');
            if (response && response.success) {
                showAlert('Request marked as completed!', 'success');
                // Remove from local display or update status
                const requestIndex = emergencyRequests.findIndex(req => req.id === requestId);
                if (requestIndex !== -1) {
                    emergencyRequests[requestIndex].status = 'completed';
                    
                    // Always save to localStorage for persistence
                    localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
                }
                displayRequests();
                updateRequestCounts();
            }
        } else {
            showAlert('Backend connection required to update request status.', 'warning');
        }
    } catch (error) {
        console.error('Error updating request status:', error);
        showAlert(`Error updating status: ${error.message}`, 'error');
    }
}

// Logout function
function logout() {
    // Use authManager if available, fallback to apiService
    if (typeof authManager !== 'undefined') {
        authManager.logout();
    } else {
        apiService.logout();
    }
    currentUser = 'Anonymous User';
    location.reload(); // Refresh page to reset UI
}

// Show/Hide request form
function showRequestForm() {
    const formSection = document.getElementById('submit-request');
    if (formSection.style.display === 'none' || !formSection.style.display) {
        formSection.style.display = 'block';
        formSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        formSection.style.display = 'none';
    }
}

// Show volunteer section
function showVolunteerSection() {
    document.querySelector('.requests-section').scrollIntoView({ behavior: 'smooth' });
}

// Show tab content
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Update request counts
function updateRequestCounts() {
    const pendingCount = emergencyRequests.filter(req => req.status === 'pending').length;
    const acceptedCount = emergencyRequests.filter(req => req.status === 'accepted').length;
    
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('accepted-count').textContent = acceptedCount;
}

// Generate unique request ID
function generateRequestId() {
    return 'REQ-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Get time ago string
function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
}

// Show alert message
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                           type === 'warning' ? 'exclamation-triangle' : 'exclamation-triangle'}"></i>
        ${message}
    `;
    
    const formSection = document.getElementById('submit-request');
    if (formSection) {
        formSection.insertBefore(alert, formSection.firstChild);
    } else {
        document.body.insertBefore(alert, document.body.firstChild);
    }
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Chat functionality (backend integrated)
async function openChat(requestId) {
    console.log('Opening chat for request:', requestId);
    
    const request = emergencyRequests.find(req => req.id === requestId);
    if (!request) {
        showAlert('Request not found for chat.', 'error');
        return;
    }
    
    // Update chat modal with request information
    const modal = document.getElementById('chatModal');
    const chatPartner = document.getElementById('chatPartner');
    const chatRequestId = document.getElementById('chatRequestId');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!modal) {
        showAlert('Chat modal not found. Please refresh the page.', 'error');
        return;
    }
    
    // Set chat partner information
    if (chatPartner) {
        if (request.helper && request.helper.name) {
            chatPartner.textContent = request.helper.name;
        } else {
            chatPartner.textContent = request.contactName;
        }
    }
    
    if (chatRequestId) {
        chatRequestId.textContent = requestId;
    }
    
    // Store current chat request
    currentChatRequest = request;
    
    try {
        if (backendConnected && apiService.isAuthenticated()) {
            // Get or create chat room from backend
            let chatRoom;
            try {
                const chatRoomResponse = await apiService.getChatRoom(requestId);
                if (chatRoomResponse && chatRoomResponse.success) {
                    chatRoom = chatRoomResponse.data;
                } else {
                    // Create chat room if it doesn't exist
                    const createResponse = await apiService.createChatRoom(requestId);
                    if (createResponse && createResponse.success) {
                        chatRoom = createResponse.data;
                    }
                }
            } catch (error) {
                console.log('Error getting chat room, creating new one:', error);
                const createResponse = await apiService.createChatRoom(requestId);
                if (createResponse && createResponse.success) {
                    chatRoom = createResponse.data;
                }
            }
            
            if (chatRoom) {
                currentChatRequest.chatRoomId = chatRoom.id;
                await loadChatMessages(chatRoom.id, chatMessages);
            } else {
                showAlert('Could not create chat room.', 'error');
                return;
            }
        } else {
            // Fallback to local messages
            loadLocalChatMessages(chatMessages);
        }
    } catch (error) {
        console.error('Error opening chat:', error);
        showAlert('Error opening chat: ' + error.message, 'error');
        // Fallback to local messages
        loadLocalChatMessages(chatMessages);
    }
    
    // Show modal
    modal.style.display = 'block';
    
    // Focus on input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        setTimeout(() => messageInput.focus(), 100);
    }
}

// Load chat messages from backend
async function loadChatMessages(roomId, chatMessagesContainer) {
    try {
        const response = await apiService.getChatMessages(roomId);
        if (response && response.success && response.data) {
            chatMessagesContainer.innerHTML = '';
            
            if (response.data.length > 0) {
                response.data.forEach(msg => {
                    const messageDiv = createChatMessage(
                        msg.message, 
                        msg.senderType.toLowerCase(), 
                        msg.createdAt
                    );
                    chatMessagesContainer.appendChild(messageDiv);
                });
            } else {
                // Add welcome message
                const welcomeMsg = createChatMessage(
                    'Chat started. You can now communicate about this emergency request.',
                    'system',
                    new Date().toISOString()
                );
                chatMessagesContainer.appendChild(welcomeMsg);
            }
            
            // Scroll to bottom
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
    } catch (error) {
        console.error('Error loading chat messages:', error);
        loadLocalChatMessages(chatMessagesContainer);
    }
}

// Load local chat messages (fallback)
function loadLocalChatMessages(chatMessagesContainer) {
    chatMessagesContainer.innerHTML = '';
    
    if (currentChatRequest.chatMessages && currentChatRequest.chatMessages.length > 0) {
        currentChatRequest.chatMessages.forEach(msg => {
            const messageDiv = createChatMessage(msg.message, msg.sender, msg.timestamp);
            chatMessagesContainer.appendChild(messageDiv);
        });
    } else {
        // Add welcome message
        const welcomeMsg = createChatMessage(
            'Chat started. You can now communicate about this emergency request.',
            'system',
            new Date().toISOString()
        );
        chatMessagesContainer.appendChild(welcomeMsg);
    }
    
    // Scroll to bottom
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function closeChatModal() {
    const modal = document.getElementById('chatModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentChatRequest = null;
}

// Create chat message element
function createChatMessage(message, sender, timestamp) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender === 'system' ? 'system' : (sender === 'user' ? 'sent' : 'received')}`;
    
    const time = new Date(timestamp);
    const timeString = time.toLocaleTimeString();
    
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    return messageDiv;
}

// Send message function (backend integrated)
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!messageInput || !chatMessages || !currentChatRequest) {
        console.error('Chat components not found or no active chat');
        return;
    }
    
    const message = messageInput.value.trim();
    if (!message) {
        return;
    }
    
    // Clear input immediately for better UX
    messageInput.value = '';
    
    try {
        if (backendConnected && currentChatRequest.chatRoomId && apiService.isAuthenticated()) {
            // Send to backend
            console.log('Sending message to backend...');
            const response = await apiService.sendChatMessage(currentChatRequest.chatRoomId, message);
            
            if (response && response.success) {
                console.log('Message sent successfully to backend');
                
                // Display the message with backend data
                const messageDiv = createChatMessage(
                    response.data.message, 
                    response.data.senderType.toLowerCase(), 
                    response.data.createdAt
                );
                chatMessages.appendChild(messageDiv);
                
                // Update local storage with the backend message
                if (!currentChatRequest.chatMessages) {
                    currentChatRequest.chatMessages = [];
                }
                
                currentChatRequest.chatMessages.push({
                    message: response.data.message,
                    sender: response.data.senderType.toLowerCase(),
                    timestamp: response.data.createdAt
                });
                
                localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
                
            } else {
                throw new Error(response.message || 'Failed to send message');
            }
        } else {
            // Fallback to local storage only
            console.log('Using local storage for message...');
            
            // Add message to current request
            if (!currentChatRequest.chatMessages) {
                currentChatRequest.chatMessages = [];
            }
            
            const newMessage = {
                message: message,
                sender: 'user',
                timestamp: new Date().toISOString()
            };
            
            currentChatRequest.chatMessages.push(newMessage);
            localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
            
            // Display message
            const messageDiv = createChatMessage(message, 'user', newMessage.timestamp);
            chatMessages.appendChild(messageDiv);
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
    } catch (error) {
        console.error('Error sending message:', error);
        showAlert('Error sending message: ' + error.message, 'error');
        
        // Restore message input on error
        messageInput.value = message;
    }
}

// Sample requests (fallback)
function addSampleRequests() {
    const sampleRequests = [
        {
            id: 'REQ-SAMPLE-001',
            animalType: 'dog',
            urgency: 'critical',
            location: 'Near Central Park, Bhopal - Behind the main gate',
            contactName: 'Priya Sharma',
            contactPhone: '+91-98765-43210',
            contactEmail: 'priya.sharma@email.com',
            description: 'Found an injured stray dog with a broken leg. The dog appears to be in severe pain and needs immediate medical attention.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            helper: null,
            chatMessages: []
        }
    ];
    
    if (emergencyRequests.length === 0) {
        emergencyRequests = sampleRequests;
        if (!backendConnected) {
            localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
        }
    }
}

// Set up event delegation
function setupEventDelegation() {
    document.addEventListener('click', function(e) {
        // Handle accept buttons
        if (e.target.matches('.accept-btn') || e.target.closest('.accept-btn')) {
            e.preventDefault();
            const button = e.target.matches('.accept-btn') ? e.target : e.target.closest('.accept-btn');
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/acceptRequest\('([^']+)'\)/);
                if (match && match[1]) {
                    acceptRequest(match[1]);
                }
            }
        }
        
        // Handle chat buttons
        if (e.target.matches('.chat-btn') || e.target.closest('.chat-btn')) {
            e.preventDefault();
            const button = e.target.matches('.chat-btn') ? e.target : e.target.closest('.chat-btn');
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/openChat\('([^']+)'\)/);
                if (match && match[1]) {
                    openChat(match[1]);
                }
            }
        }
        
        // Handle modal click outside to close
        if (e.target.matches('.modal')) {
            closeChatModal();
        }
    });
    
    // Handle keyboard events
    document.addEventListener('keydown', function(e) {
        // Escape key to close modal
        if (e.key === 'Escape' && currentChatRequest) {
            closeChatModal();
        }
        
        // Enter key to send message
        if (e.key === 'Enter' && e.target.matches('#messageInput')) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Test backend connectivity
async function testBackendConnection() {
    try {
        const health = await apiService.checkHealth();
        console.log('Backend health check:', health);
        showAlert('Backend connection test successful!', 'success');
        return true;
    } catch (error) {
        console.error('Backend connection test failed:', error);
        showAlert('Backend connection test failed: ' + error.message, 'error');
        return false;
    }
}

// Make test function available globally
window.testBackendConnection = testBackendConnection;

// Login Modal Functions
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Focus on username input
        const usernameInput = document.getElementById('loginUsername');
        if (usernameInput) {
            setTimeout(() => usernameInput.focus(), 100);
        }
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        
        // Clear form
        const form = document.getElementById('loginForm');
        if (form) {
            form.reset();
        }
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!username || !password) {
        showAlert('Please enter both username and password.', 'error');
        return;
    }
    
    try {
        console.log('Attempting login with username:', username);
        
        // For demo purposes, we'll create a simple password - in production this should be secure
        const loginData = {
            username: username,
            password: password || 'demo123' // fallback password for testing
        };
        
        const response = await apiService.login(loginData);
        
        if (response && response.success) {
            showAlert(`Welcome back, ${response.data.fullName || username}!`, 'success');
            closeLoginModal();
            
            // Update UI for authenticated user
            loadUserState();
            
            // Refresh requests to get user-specific data
            if (backendConnected) {
                await loadRequestsFromBackend();
            }
        } else {
            throw new Error(response.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Login failed: ' + error.message, 'error');
    }
}

// Auto-login function for quick testing
function quickLogin(username) {
    document.getElementById('loginUsername').value = username;
    document.getElementById('loginPassword').value = 'demo123';
    showLoginModal();
}

// Update openChat to prompt for login if not authenticated
const originalOpenChat = openChat;
openChat = async function(requestId) {
    if (backendConnected && !apiService.isAuthenticated()) {
        showAlert('Please login to use the chat functionality.', 'warning');
        showLoginModal();
        return;
    }
    
    return originalOpenChat.call(this, requestId);
};

// Initialize login form event listener
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Add modal click outside to close
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }
});
