// Emergency Rescue System JavaScript

// Global variables
let emergencyRequests = JSON.parse(localStorage.getItem('emergencyRequests')) || [];
let currentUser = localStorage.getItem('currentUser') || 'Anonymous User';
let currentChatRequest = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...'); // Debug log
    
    // Initialize emergency info first
    addEmergencyInfo();
    
    // Load requests and update counts
    loadRequests();
    updateRequestCounts();
    
    // Set up form submission with better error handling
    setTimeout(() => {
        const form = document.getElementById('emergencyForm');
        console.log('Form element found:', form); // Debug log
        if (form) {
            // Remove any existing event listeners to prevent duplicates
            form.removeEventListener('submit', submitEmergencyRequest);
            form.addEventListener('submit', submitEmergencyRequest);
            console.log('Form event listener added'); // Debug log
        } else {
            console.error('Emergency form not found!');
        }
    }, 100);
    
    // Set up event delegation for dynamic buttons
    setupEventDelegation();
});

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

// Show volunteer section (scroll to requests)
function showVolunteerSection() {
    document.querySelector('.requests-section').scrollIntoView({ behavior: 'smooth' });
}

// Submit emergency request
function submitEmergencyRequest(e) {
    e.preventDefault();
    
    console.log('Form submitted!'); // Debug log
    
    // Get form data
    const formData = {
        id: generateRequestId(),
        animalType: document.getElementById('animalType').value,
        urgency: document.getElementById('urgency').value,
        location: document.getElementById('location').value,
        contactName: document.getElementById('contactName').value,
        contactPhone: document.getElementById('contactPhone').value,
        contactEmail: document.getElementById('contactEmail').value,
        description: document.getElementById('description').value,
        timestamp: new Date().toISOString(),
        status: 'pending',
        helper: null,
        chatMessages: []
    };
    
    console.log('Form data:', formData); // Debug log
    
    // Validate required fields
    if (!formData.animalType || !formData.urgency || !formData.location || 
        !formData.contactName || !formData.contactPhone || !formData.description) {
        console.log('Validation failed'); // Debug log
        showAlert('Please fill in all required fields.', 'error');
        return;
    }
    
    // Add to requests array
    emergencyRequests.push(formData);
    
    console.log('Updated requests array:', emergencyRequests); // Debug log
    
    // Save to localStorage
    localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
    
    // Show success message
    showAlert('Emergency request submitted successfully!', 'success');
    
    // Reset form
    document.getElementById('emergencyForm').reset();
    
    // Hide form
    document.getElementById('submit-request').style.display = 'none';
    
    // Scroll to requests section
    document.querySelector('.requests-section').scrollIntoView({ behavior: 'smooth' });
    
    // Refresh the requests display
    loadRequests();
    updateRequestCounts();
}

// Generate unique request ID
function generateRequestId() {
    return 'REQ-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Load and display requests
function loadRequests() {
    const pendingContainer = document.getElementById('pendingRequests');
    const acceptedContainer = document.getElementById('acceptedRequests');
    
    // Clear containers
    pendingContainer.innerHTML = '';
    acceptedContainer.innerHTML = '';
    
    // Add sample requests if none exist
    if (emergencyRequests.length === 0) {
        addSampleRequests();
    }
    
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

// Create request card HTML
function createRequestCard(request) {
    const card = document.createElement('div');
    card.className = 'request-card';
    
    const urgencyClass = `urgency-${request.urgency}`;
    const timeAgo = getTimeAgo(request.timestamp);
    
    card.innerHTML = `
        <div class="request-header">
            <span class="animal-type">${request.animalType.toUpperCase()}</span>
            <span class="urgency-level ${urgencyClass}">${request.urgency.toUpperCase()}</span>
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
            </div>
        `}
        
        <div class="request-id">
            <small><i class="fas fa-hashtag"></i> Request ID: ${request.id}</small>
        </div>
    `;
    
    return card;
}

// Accept a request
function acceptRequest(requestId) {
    console.log('acceptRequest called with ID:', requestId); // Debug log
    
    // Check if we have the request
    const request = emergencyRequests.find(req => req.id === requestId);
    if (!request) {
        console.error('Request not found:', requestId);
        showAlert('Request not found. Please refresh the page and try again.', 'error');
        return;
    }
    
    console.log('Found request:', request); // Debug log
    
    // Check if already accepted
    if (request.status === 'accepted') {
        showAlert('This request has already been accepted by someone else.', 'error');
        return;
    }
    
    const helperName = prompt('Enter your name:');
    if (!helperName || helperName.trim() === '') {
        showAlert('Name is required to accept this request.', 'error');
        return;
    }
    
    const helperPhone = prompt('Enter your phone number:');
    if (!helperPhone || helperPhone.trim() === '') {
        showAlert('Phone number is required to accept this request.', 'error');
        return;
    }
    
    const helperEmail = prompt('Enter your email (optional):') || '';
    
    try {
        // Find and update the request
        const requestIndex = emergencyRequests.findIndex(req => req.id === requestId);
        if (requestIndex !== -1) {
            emergencyRequests[requestIndex].status = 'accepted';
            emergencyRequests[requestIndex].helper = {
                name: helperName.trim(),
                phone: helperPhone.trim(),
                email: helperEmail.trim()
            };
            
            // Initialize chat messages array if it doesn't exist
            if (!emergencyRequests[requestIndex].chatMessages) {
                emergencyRequests[requestIndex].chatMessages = [];
            }
            
            // Add initial chat message
            emergencyRequests[requestIndex].chatMessages.push({
                sender: 'system',
                message: `${helperName.trim()} has accepted this rescue request and will be in touch soon.`,
                timestamp: new Date().toISOString()
            });
            
            console.log('Updated request:', emergencyRequests[requestIndex]); // Debug log
            
            // Save to localStorage
            localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
            
            console.log('Saved to localStorage'); // Debug log
            
            // Refresh display
            loadRequests();
            updateRequestCounts();
            
            showAlert('Thank you for volunteering to help! The request owner will be notified.', 'success');
            
            // Auto-switch to accepted tab to show the result
            setTimeout(() => {
                showTab('accepted');
            }, 1000);
        } else {
            console.error('Request index not found after search');
            showAlert('Error updating request. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error accepting request:', error);
        showAlert('An error occurred while accepting the request. Please try again.', 'error');
    }
}

// Show tab content
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Update request counts
function updateRequestCounts() {
    const pendingCount = emergencyRequests.filter(req => req.status === 'pending').length;
    const acceptedCount = emergencyRequests.filter(req => req.status === 'accepted').length;
    
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('accepted-count').textContent = acceptedCount;
}

// Open chat modal
function openChat(requestId) {
    const request = emergencyRequests.find(req => req.id === requestId);
    if (!request) return;
    
    currentChatRequest = requestId;
    
    // Set up chat modal
    document.getElementById('chatPartner').textContent = 
        request.helper && request.helper.name !== currentUser ? request.helper.name : request.contactName;
    document.getElementById('chatRequestId').textContent = requestId;
    
    // Load chat messages
    loadChatMessages(requestId);
    
    // Show modal
    document.getElementById('chatModal').style.display = 'block';
}

// Close chat modal
function closeChatModal() {
    document.getElementById('chatModal').style.display = 'none';
    currentChatRequest = null;
}

// Load chat messages
function loadChatMessages(requestId) {
    const request = emergencyRequests.find(req => req.id === requestId);
    const chatContainer = document.getElementById('chatMessages');
    
    chatContainer.innerHTML = '';
    
    if (request.chatMessages) {
        request.chatMessages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.sender === currentUser ? 'sent' : 'received'}`;
            
            if (message.sender === 'system') {
                messageDiv.className = 'message system';
                messageDiv.style.background = '#f0f0f0';
                messageDiv.style.textAlign = 'center';
                messageDiv.style.fontStyle = 'italic';
            }
            
            messageDiv.innerHTML = `
                <div>${message.message}</div>
                <small>${getTimeAgo(message.timestamp)}</small>
            `;
            
            chatContainer.appendChild(messageDiv);
        });
    }
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send chat message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message || !currentChatRequest) return;
    
    const requestIndex = emergencyRequests.findIndex(req => req.id === currentChatRequest);
    if (requestIndex === -1) return;
    
    // Add message to request
    const newMessage = {
        sender: currentUser,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    emergencyRequests[requestIndex].chatMessages.push(newMessage);
    
    // Save to localStorage
    localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
    
    // Clear input
    messageInput.value = '';
    
    // Reload chat messages
    loadChatMessages(currentChatRequest);
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
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        ${message}
    `;
    
    // Insert after form or at top of page
    const formSection = document.getElementById('submit-request');
    if (formSection) {
        formSection.insertBefore(alert, formSection.firstChild);
    } else {
        document.body.insertBefore(alert, document.body.firstChild);
    }
    
    // Remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Add sample emergency requests for demonstration
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
            description: 'Found an injured stray dog with a broken leg. The dog appears to be in severe pain and needs immediate medical attention. It\'s a brown medium-sized dog, appears friendly but scared.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            status: 'pending',
            helper: null,
            chatMessages: []
        },
        {
            id: 'REQ-SAMPLE-002',
            animalType: 'cat',
            urgency: 'medium',
            location: 'Sector 15, Housing Board Colony, Sehore',
            contactName: 'Rahul Kumar',
            contactPhone: '+91-87654-32109',
            contactEmail: '',
            description: 'A small kitten is stuck on a tree for the past 6 hours. It\'s meowing continuously and seems unable to come down on its own. The tree is quite tall and we need help with proper equipment.',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            status: 'accepted',
            helper: {
                name: 'Dr. Amit Patel',
                phone: '+91-99887-76543',
                email: 'dr.amit@animalcare.com'
            },
            chatMessages: [
                {
                    sender: 'system',
                    message: 'Dr. Amit Patel has accepted this rescue request and will be in touch soon.',
                    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
                },
                {
                    sender: 'Dr. Amit Patel',
                    message: 'Hi Rahul, I\'m on my way with the necessary equipment. Should be there in 15 minutes.',
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
                },
                {
                    sender: 'Rahul Kumar',
                    message: 'Thank you so much! I\'ll wait for you at the location. The kitten is still there.',
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 300000).toISOString()
                }
            ]
        },
        {
            id: 'REQ-SAMPLE-003',
            animalType: 'cow',
            urgency: 'high',
            location: 'Village Road, 5km from Sehore towards Raisen',
            contactName: 'Sunita Devi',
            contactPhone: '+91-76543-21098',
            contactEmail: '',
            description: 'A cow has fallen into a ditch and cannot get out. It seems to be injured and distressed. We need help with ropes and people to safely rescue the animal.',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
            status: 'pending',
            helper: null,
            chatMessages: []
        }
    ];
    
    emergencyRequests = sampleRequests;
    localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
}

// Handle Enter key in chat input
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.id === 'messageInput') {
        sendMessage();
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('chatModal');
    if (event.target === modal) {
        closeChatModal();
    }
}

// Update current user (this would normally come from login system)
function setCurrentUser(userName) {
    currentUser = userName;
    localStorage.setItem('currentUser', userName);
}

// Initialize emergency info section - now integrated into form
function addEmergencyInfo() {
    // Info is now built into the About section, so we don't need to add it to the form
    console.log('Emergency info integrated into About section');
}

// Emergency info is now added in the main DOMContentLoaded event listener

// Search functionality (for future enhancement)
function searchRequests(query) {
    const filteredRequests = emergencyRequests.filter(request => 
        request.location.toLowerCase().includes(query.toLowerCase()) ||
        request.animalType.toLowerCase().includes(query.toLowerCase()) ||
        request.description.toLowerCase().includes(query.toLowerCase())
    );
    
    return filteredRequests;
}

// Filter by urgency (for future enhancement)
function filterByUrgency(urgencyLevel) {
    return emergencyRequests.filter(request => request.urgency === urgencyLevel);
}

// Export request data (for admin panel - future enhancement)
function exportRequests() {
    const dataStr = JSON.stringify(emergencyRequests, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'emergency_requests.json';
    link.click();
}

// Debug functions (call from browser console)
function debugEmergencySystem() {
    console.log('=== Emergency System Debug Info ===');
    console.log('Total requests:', emergencyRequests.length);
    console.log('Requests array:', emergencyRequests);
    console.log('LocalStorage data:', localStorage.getItem('emergencyRequests'));
    console.log('Form element:', document.getElementById('emergencyForm'));
    console.log('Pending container:', document.getElementById('pendingRequests'));
    console.log('Accepted container:', document.getElementById('acceptedRequests'));
}

// Clear all data (call from browser console if needed)
function clearEmergencyData() {
    localStorage.removeItem('emergencyRequests');
    emergencyRequests = [];
    console.log('Emergency data cleared');
    loadRequests();
    updateRequestCounts();
}

// Test form submission (call from browser console)
function testFormSubmission() {
    const testData = {
        id: generateRequestId(),
        animalType: 'dog',
        urgency: 'critical',
        location: 'Test Location',
        contactName: 'Test User',
        contactPhone: '+91-9999999999',
        contactEmail: 'test@example.com',
        description: 'This is a test emergency request.',
        timestamp: new Date().toISOString(),
        status: 'pending',
        helper: null,
        chatMessages: []
    };
    
    emergencyRequests.push(testData);
    localStorage.setItem('emergencyRequests', JSON.stringify(emergencyRequests));
    loadRequests();
    updateRequestCounts();
    console.log('Test request added:', testData);
}

// Set up event delegation for dynamically created buttons
function setupEventDelegation() {
    console.log('Setting up event delegation...'); // Debug log
    
    // Use event delegation for accept buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.accept-btn') || e.target.closest('.accept-btn')) {
            e.preventDefault();
            
            const button = e.target.matches('.accept-btn') ? e.target : e.target.closest('.accept-btn');
            const onclickAttr = button.getAttribute('onclick');
            
            if (onclickAttr) {
                // Extract request ID from onclick attribute
                const match = onclickAttr.match(/acceptRequest\('([^']+)'\)/);
                if (match && match[1]) {
                    console.log('Accept button clicked via delegation, ID:', match[1]);
                    acceptRequest(match[1]);
                } else {
                    console.error('Could not extract request ID from onclick attribute');
                }
            }
        }
        
        // Handle chat button clicks
        if (e.target.matches('.chat-btn') || e.target.closest('.chat-btn')) {
            e.preventDefault();
            
            const button = e.target.matches('.chat-btn') ? e.target : e.target.closest('.chat-btn');
            const onclickAttr = button.getAttribute('onclick');
            
            if (onclickAttr) {
                // Extract request ID from onclick attribute
                const match = onclickAttr.match(/openChat\('([^']+)'\)/);
                if (match && match[1]) {
                    console.log('Chat button clicked via delegation, ID:', match[1]);
                    openChat(match[1]);
                } else {
                    console.error('Could not extract request ID from onclick attribute');
                }
            }
        }
    });
    
    console.log('Event delegation set up successfully'); // Debug log
}

// Test accept button functionality (call from console)
function testAcceptButton() {
    // Find the first pending request and simulate accept button click
    const pendingRequest = emergencyRequests.find(req => req.status === 'pending');
    if (pendingRequest) {
        console.log('Testing accept functionality with request:', pendingRequest.id);
        acceptRequest(pendingRequest.id);
    } else {
        console.log('No pending requests found for testing');
    }
}

// Make functions available globally for debugging
window.debugEmergencySystem = debugEmergencySystem;
window.clearEmergencyData = clearEmergencyData;
window.testFormSubmission = testFormSubmission;
window.testAcceptButton = testAcceptButton;
