# 🐾 Animal Healthcare System

A comprehensive web application for animal rescue, healthcare, and emergency services.

## 🚀 Project Structure

```
Animal-Healthcare/
├── animal-healthcare-backend/     # Java Spring Boot backend
├── css/                          # Frontend stylesheets
├── js/                           # Frontend JavaScript
├── images/                       # Static images
├── ContactFrom_v1/               # Contact form components
├── *.html                        # Frontend HTML pages
└── README.md                     # This file
```

## 🛠️ Technologies Used

- **Backend**: Java Spring Boot, Spring Security, JWT Authentication
- **Database**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Build Tool**: Maven

## 📋 Prerequisites

- Java 11 or higher
- Maven 3.6+
- MySQL 8.0+
- A modern web browser

## 🔧 Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd Animal-Healthcare
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE animalrescue;
EXIT;

# Run the database migration
mysql -u root -p animalrescue < animal-healthcare-backend/run_in_mysql_workbench.sql
```

### 3. Backend Configuration
```bash
# Copy the example configuration
cd animal-healthcare-backend/src/main/resources/
cp application.properties.example application.properties

# Edit application.properties with your actual values:
# - Database username/password
# - JWT secret key (generate a secure 64+ character string)
```

### 4. Environment Variables (Recommended)
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your actual values
# Generate a secure JWT secret: openssl rand -base64 64
```

### 5. Build and Run Backend
```bash
cd animal-healthcare-backend
mvn clean install
mvn spring-boot:run
```

### 6. Run Frontend
Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 5500

# Using Node.js (if you have live-server installed)
live-server
```

## 🔐 Security Configuration

### ⚠️ IMPORTANT SECURITY NOTES

1. **Never commit sensitive data** to version control
2. **Always use environment variables** for production secrets
3. **Generate secure JWT secrets** (minimum 64 characters)
4. **Use strong database passwords**

### JWT Secret Generation
```bash
# Generate a secure JWT secret
openssl rand -base64 64
```

### Environment Variables
The application uses these environment variables:
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password  
- `JWT_SECRET`: JWT signing secret
- `API_BASE_URL`: Backend API URL (for frontend configuration)

## 📱 Features

- **User Authentication**: Secure login/registration
- **Emergency Rescue**: Submit and track emergency animal rescue requests
- **Pet Care Information**: Comprehensive guides for different animals
- **Grooming Services**: Pet grooming service information
- **Chat System**: Real-time communication for emergency requests
- **Responsive Design**: Works on desktop and mobile devices

## 🌐 API Endpoints

The backend API is available at `http://localhost:8080/api/`

Key endpoints:
- `POST /auth/signin` - User login
- `POST /auth/signup` - User registration
- `POST /emergency/submit` - Submit emergency request
- `GET /emergency/user/{userId}` - Get user's emergency requests

For detailed API documentation, see `animal-healthcare-backend/API_DOCUMENTATION.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:
1. Check the database connection
2. Verify environment variables are set correctly
3. Ensure Java and Maven are properly installed
4. Check the application logs for error details

## 🔄 Deployment

### Production Checklist
- [ ] Set secure environment variables
- [ ] Use production database
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up proper logging
- [ ] Configure backup strategy

---

**Made with ❤️ for animal welfare**
