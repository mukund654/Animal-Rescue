# 🔐 Security Setup Guide

## ⚠️ IMPORTANT: Complete These Steps Before Running the Application

### 1. Create Your Local Configuration File

```bash
# Navigate to backend resources
cd animal-healthcare-backend/src/main/resources/

# Copy the example file
cp application.properties.example application.properties
```

### 2. Set Secure Database Credentials

Edit `animal-healthcare-backend/src/main/resources/application.properties`:

```properties
# Replace these with your actual database credentials
spring.datasource.username=your_actual_db_username
spring.datasource.password=your_secure_db_password
```

### 3. Generate a Secure JWT Secret

```bash
# Generate a secure JWT secret (64+ characters)
openssl rand -base64 64
```

Copy the output and update in `application.properties`:
```properties
app.jwtSecret=your_generated_jwt_secret_here
```

### 4. Alternative: Use Environment Variables (Recommended for Production)

Create a `.env` file in the project root:
```bash
# Copy the template
cp .env.example .env

# Edit .env with your actual values
```

Set these environment variables:
- `DB_USERNAME`: Your database username
- `DB_PASSWORD`: Your database password
- `JWT_SECRET`: Your generated JWT secret

## 🚨 What Was Removed for Security

The following sensitive data was removed from the public repository:

1. **Database Password**: `MeraSQL@444` 
2. **JWT Secret Key**: Hard-coded Base64 encoded secret
3. **Test Credentials**: Sample usernames and passwords from HTML
4. **Personal Information**: Sample data now uses placeholder values

## 📝 Files You Need to Configure Locally

These files are ignored by git and must be configured on each system:

- `animal-healthcare-backend/src/main/resources/application.properties`
- `.env` (if using environment variables)

## 🔍 Security Best Practices Applied

✅ Removed hardcoded passwords and secrets  
✅ Created example configuration files  
✅ Updated .gitignore to prevent future security leaks  
✅ Added environment variable support  
✅ Made API URLs configurable  
✅ Created comprehensive documentation  

## 🚀 Quick Start (After Security Setup)

1. Set up your database credentials
2. Generate and set JWT secret
3. Run the backend: `mvn spring-boot:run`
4. Open `index.html` in your browser

## 📞 Need Help?

If you encounter issues:
1. Check that your database is running
2. Verify your credentials are correct
3. Ensure JWT secret is properly set
4. Check application logs for specific errors
