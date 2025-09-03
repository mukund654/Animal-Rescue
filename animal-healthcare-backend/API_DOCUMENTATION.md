# Animal Rescue Backend API Documentation

## 🚀 Getting Started

The Animal Rescue Backend is a comprehensive REST API for managing animal rescue services, emergency requests, and user management with role-based authentication.

**Base URL:** `http://localhost:8080/api`

## 🔧 Setup Instructions

1. **Prerequisites:**
   - Java 17+
   - MySQL 8.0+
   - Maven 3.6+

2. **Database Setup:**
   - Create MySQL database named `animal_healthcare` (auto-created by application)
   - Update `application.properties` with your database credentials

3. **Environment Variables:**
   ```bash
   DB_PASSWORD=your_mysql_password
   ```

4. **Run Application:**
   ```bash
   mvn clean package
   java -jar target/animal-healthcare-backend-1.0.0.jar
   ```

## 📋 API Endpoints

### 🔍 Health Check & Test Endpoints

#### Test Health
- **GET** `/api/test/health`
- **Description:** Check API health status
- **Access:** Public
- **Response:**
  ```json
  {
    "success": true,
    "message": "Health check passed",
    "data": {
      "status": "UP",
      "timestamp": "2024-01-01T12:00:00",
      "application": "Animal Rescue Backend",
      "version": "1.0.0"
    }
  }
  ```

#### Welcome Message
- **GET** `/api/test/welcome`
- **Description:** Welcome message
- **Access:** Public

---

### 🔐 Authentication Endpoints

#### User Registration
- **POST** `/api/auth/signup`
- **Description:** Register a new user
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "role": "USER"
  }
  ```

#### User Login
- **POST** `/api/auth/signin`
- **Description:** User authentication
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "jwt_token_here",
      "type": "Bearer",
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "USER"
    }
  }
  ```

---

### 🚑 Emergency Request Endpoints

#### Submit Emergency Request
- **POST** `/api/emergency/submit`
- **Description:** Submit an emergency animal rescue request
- **Access:** Public (Anonymous submissions allowed)
- **Request Body:**
  ```json
  {
    "animalType": "Dog",
    "urgency": "HIGH",
    "location": "123 Main St, City",
    "contactName": "Jane Doe",
    "contactPhone": "+1234567890",
    "contactEmail": "jane@example.com",
    "description": "Injured dog needs immediate help"
  }
  ```

#### Get All Emergency Requests
- **GET** `/api/emergency/all`
- **Description:** Get all emergency requests
- **Access:** Admin/Volunteer only
- **Headers:** `Authorization: Bearer {jwt_token}`

#### Get Pending Requests (Priority Order)
- **GET** `/api/emergency/pending`
- **Description:** Get pending requests ordered by priority
- **Access:** Admin/Volunteer only

#### Get Request by ID
- **GET** `/api/emergency/{requestId}`
- **Description:** Get specific emergency request
- **Access:** Admin/Volunteer only

#### Get User's Own Requests
- **GET** `/api/emergency/my-requests`
- **Description:** Get authenticated user's emergency requests
- **Access:** Authenticated users

#### Assign Volunteer to Request
- **PUT** `/api/emergency/{requestId}/assign/{volunteerId}`
- **Description:** Assign a volunteer to handle an emergency request
- **Access:** Admin/Volunteer only

#### Update Request Status
- **PUT** `/api/emergency/{requestId}/status?status=COMPLETED`
- **Description:** Update emergency request status
- **Access:** Admin/Volunteer only
- **Query Parameters:** 
  - `status`: PENDING, ACCEPTED, COMPLETED

#### Get Requests by Status
- **GET** `/api/emergency/status/{status}`
- **Description:** Filter requests by status
- **Access:** Admin/Volunteer only

#### Get Requests by Urgency
- **GET** `/api/emergency/urgency/{urgency}`
- **Description:** Filter requests by urgency level
- **Access:** Admin/Volunteer only
- **Urgency Levels:** CRITICAL, HIGH, MEDIUM, LOW

#### Get Recent Requests
- **GET** `/api/emergency/recent?hours=24`
- **Description:** Get recent emergency requests
- **Access:** Admin/Volunteer only
- **Query Parameters:**
  - `hours`: Number of hours to look back (default: 24)

#### Search by Location
- **GET** `/api/emergency/search/location?location=City`
- **Description:** Search requests by location
- **Access:** Admin/Volunteer only

#### Search by Animal Type
- **GET** `/api/emergency/search/animal?animalType=Dog`
- **Description:** Search requests by animal type
- **Access:** Admin/Volunteer only

#### Dashboard Statistics
- **GET** `/api/emergency/stats`
- **Description:** Get dashboard statistics
- **Access:** Admin only
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "pendingRequests": 5,
      "completedRequests": 23,
      "totalRequests": 28
    }
  }
  ```

---

### 👥 User Management Endpoints

#### Get Current User Profile
- **GET** `/api/users/profile`
- **Description:** Get authenticated user's profile
- **Access:** Authenticated users
- **Headers:** `Authorization: Bearer {jwt_token}`

#### Update User Profile
- **PUT** `/api/users/profile`
- **Description:** Update user profile
- **Access:** Authenticated users
- **Request Body:**
  ```json
  {
    "fullName": "Updated Name",
    "phone": "+1987654321",
    "email": "newemail@example.com"
  }
  ```

#### Get All Users
- **GET** `/api/users/all`
- **Description:** Get all users
- **Access:** Admin only

#### Get All Volunteers
- **GET** `/api/users/volunteers`
- **Description:** Get all volunteers
- **Access:** Admin/Volunteer only

#### Search Volunteers
- **GET** `/api/users/volunteers/search?search=john`
- **Description:** Search volunteers by name
- **Access:** Admin/Volunteer only

#### Get Users by Role
- **GET** `/api/users/role/{role}`
- **Description:** Get users by specific role
- **Access:** Admin only
- **Roles:** USER, VOLUNTEER, ADMIN

#### Search Users
- **GET** `/api/users/search?name=john`
- **Description:** Search users by name
- **Access:** Admin only

#### Get User by ID
- **GET** `/api/users/{userId}`
- **Description:** Get specific user details
- **Access:** Admin only

#### Update User Role
- **PUT** `/api/users/{userId}/role?role=VOLUNTEER`
- **Description:** Update user's role
- **Access:** Admin only

#### Delete User
- **DELETE** `/api/users/{userId}`
- **Description:** Delete a user
- **Access:** Admin only

---

## 🔒 Authentication & Authorization

### JWT Token Usage
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {your_jwt_token}
```

### User Roles
- **USER:** Can submit emergency requests, view own requests, update profile
- **VOLUNTEER:** All USER permissions + manage emergency requests, view all requests
- **ADMIN:** All VOLUNTEER permissions + user management, system statistics

### Token Expiration
- JWT tokens expire after 24 hours (86400000 ms)
- Use the refresh endpoint to get a new token

---

## 📝 Request/Response Format

### Standard API Response
```json
{
  "success": boolean,
  "message": "string",
  "data": object|array,
  "status": number
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "status": 400
}
```

---

## 🛠 Data Models

### User Entity
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "fullName": "string",
  "phone": "string",
  "role": "USER|VOLUNTEER|ADMIN",
  "createdAt": "timestamp"
}
```

### Emergency Request Entity
```json
{
  "id": "EMR-ABC123DE",
  "userId": 1,
  "animalType": "string",
  "urgency": "CRITICAL|HIGH|MEDIUM|LOW",
  "location": "string",
  "contactName": "string",
  "contactPhone": "string",
  "contactEmail": "string",
  "description": "string",
  "status": "PENDING|ACCEPTED|COMPLETED",
  "volunteerId": 2,
  "volunteerName": "string",
  "volunteerPhone": "string",
  "createdAt": "timestamp"
}
```

---

## 🔧 Configuration

### Database Configuration (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/animal_healthcare
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}

# JWT Configuration
app.jwtSecret=your_secret_key
app.jwtExpirationMs=86400000

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:3000,http://127.0.0.1:5500
```

---

## 📊 Database Schema

### Tables Created Automatically:
- **users:** User accounts and authentication
- **emergency_requests:** Animal emergency requests
- Both tables include audit fields (created_at, updated_at)

---

## 🚀 Production Deployment

1. **Environment Variables:**
   ```bash
   export DB_PASSWORD=your_production_password
   export JWT_SECRET=your_secure_jwt_secret
   ```

2. **Security Considerations:**
   - Use HTTPS in production
   - Set strong JWT secret
   - Configure proper CORS origins
   - Use environment variables for sensitive data

3. **Database:**
   - Use production MySQL instance
   - Enable SSL connections
   - Regular backups

---

## 📞 Support

For technical support or questions about the API:
- Check the health endpoint: `/api/test/health`
- Verify JWT token validity
- Ensure proper request headers and body format
- Check user role permissions

---

## 🔄 Version History

**v1.0.0** - Initial release with complete CRUD operations for users and emergency requests, JWT authentication, and role-based authorization.
