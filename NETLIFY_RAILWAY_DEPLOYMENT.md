# 🚀 Deploy with Netlify + Railway

This guide will help you deploy your Animal Healthcare project using:
- **Netlify**: Frontend hosting (HTML, CSS, JS)
- **Railway**: Backend hosting (Java Spring Boot + MySQL)

## 🎯 Overview

```
┌─────────────────┐    API calls    ┌─────────────────┐
│   Netlify       │ ──────────────► │   Railway       │
│   (Frontend)    │                 │   (Backend)     │
│   - HTML/CSS/JS │                 │   - Spring Boot │
│   - Static site │                 │   - MySQL DB    │
└─────────────────┘                 └─────────────────┘
```

---

## 📋 Prerequisites

Before starting:
- [ ] GitHub account
- [ ] Netlify account (free at netlify.com)
- [ ] Railway account (free at railway.app)
- [ ] Your project ready with security sanitization ✅

---

## 🎨 PART 1: Deploy Frontend on Netlify

### Step 1: Prepare Frontend Files

First, let's create a proper frontend build structure:

```powershell
# Create a frontend-only folder
mkdir frontend-build
cd frontend-build

# Copy all frontend files (but not backend)
cp ../*.html .
cp -r ../css .
cp -r ../js .
cp -r ../images .
cp -r ../ContactFrom_v1 .
```

### Step 2: Configure API URL for Production

We need to update the frontend to use your Railway backend URL:

Create `js/config.prod.js`:
```javascript
// Production configuration - will be updated after Railway deployment
window.API_CONFIG = {
    BASE_URL: 'https://your-railway-app.up.railway.app/api', // Update this after Railway deployment
    TIMEOUT: 30000,
    DEBUG_MODE: false, // Turn off debug for production
    APP_NAME: 'Animal Healthcare System',
    VERSION: '1.0.0'
};

window.API_BASE_URL = window.API_CONFIG.BASE_URL;
console.log('Production config loaded:', window.API_CONFIG);
```

### Step 3: Update HTML files to use production config

Add this line to the `<head>` section of your main HTML files:
```html
<!-- Add BEFORE other script tags -->
<script src="js/config.prod.js"></script>
```

### Step 4: Deploy to Netlify

**Option A: Drag & Drop (Easiest)**
1. Go to https://netlify.com
2. Click "Deploy manually"
3. Drag your `frontend-build` folder to the deploy area
4. Your site will be live instantly!

**Option B: GitHub Integration (Recommended)**
1. Push your project to GitHub
2. Go to https://netlify.com
3. Click "New site from Git"
4. Choose GitHub and select your repository
5. Set build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `./` (or your frontend folder)
6. Click "Deploy site"

### Step 5: Configure Custom Domain (Optional)

1. In Netlify dashboard → Domain settings
2. Click "Add custom domain"
3. Enter your domain (e.g., `animalcare.com`)
4. Update your domain's DNS to point to Netlify

---

## 🖥️ PART 2: Deploy Backend on Railway

### Step 1: Prepare Backend for Railway

Railway auto-detects Spring Boot projects. Let's make sure everything is configured:

Create `railway.json` in your backend folder:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "java -jar target/animal-healthcare-backend-*.jar",
    "healthcheckPath": "/api/test/health"
  }
}
```

### Step 2: Update application.properties for Railway

Create `animal-healthcare-backend/src/main/resources/application-railway.properties`:
```properties
# Railway Production Configuration
spring.profiles.active=railway

# Database Configuration - Railway will provide these
spring.datasource.url=${DATABASE_URL}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Server Configuration
server.port=${PORT:8080}
server.servlet.context-path=/api

# CORS Configuration - Update with your Netlify URL
spring.web.cors.allowed-origins=${FRONTEND_URL:https://your-netlify-site.netlify.app}
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# JWT Configuration
app.jwtSecret=${JWT_SECRET}
app.jwtExpirationMs=86400000

# Logging
logging.level.org.springframework.web=INFO
logging.level.org.hibernate=WARN
```

### Step 3: Deploy Backend to Railway

1. **Go to https://railway.app**
2. **Sign in with GitHub**
3. **Create New Project** → "Deploy from GitHub repo"
4. **Select your repository**
5. **Railway will auto-detect Spring Boot and start building**

### Step 4: Add Database

1. In your Railway project dashboard
2. Click **"+ New"** → **"Database"** → **"Add MySQL"**
3. Railway will automatically create a MySQL database
4. The `DATABASE_URL` environment variable will be set automatically

### Step 5: Configure Environment Variables

In Railway dashboard → Your service → Variables tab:

```env
JWT_SECRET=your_super_secure_jwt_secret_minimum_64_characters_long
FRONTEND_URL=https://your-netlify-site.netlify.app
SPRING_PROFILES_ACTIVE=railway
```

### Step 6: Get Your Railway URL

Once deployed, Railway will give you a URL like:
`https://your-project-name.up.railway.app`

---

## 🔗 PART 3: Connect Frontend to Backend

### Step 1: Update Frontend Configuration

Go back to your Netlify site and update the API URL:

Edit `js/config.prod.js`:
```javascript
window.API_CONFIG = {
    BASE_URL: 'https://your-actual-railway-url.up.railway.app/api', // Update with real Railway URL
    // ... rest of config
};
```

### Step 2: Redeploy Frontend

**If using drag & drop:**
- Update the file locally
- Drag the updated folder to Netlify again

**If using GitHub:**
- Commit and push the changes
- Netlify will auto-deploy

### Step 3: Update CORS in Backend

Update the Railway environment variable:
```env
FRONTEND_URL=https://your-actual-netlify-url.netlify.app
```

---

## 🧪 PART 4: Testing Your Deployment

### Test Checklist:

1. **Frontend loads**: Visit your Netlify URL
2. **Backend health**: Visit `https://your-railway-url.up.railway.app/api/test/health`
3. **Database connection**: Check Railway logs
4. **API calls work**: Test user registration/login
5. **Emergency requests**: Test form submission
6. **CORS configured**: No browser console errors

### Debugging:

**Frontend Issues:**
- Check browser console for errors
- Verify API URL configuration
- Check Netlify build logs

**Backend Issues:**
- Check Railway deployment logs
- Verify environment variables
- Test database connection
- Check CORS configuration

---

## 💰 Cost Breakdown

### Netlify (Free Tier):
- ✅ 100GB bandwidth/month
- ✅ Unlimited personal projects
- ✅ HTTPS included
- ✅ Custom domains

### Railway (Free Tier):
- ✅ $5 credit monthly
- ✅ 512MB RAM
- ✅ Shared CPU
- ✅ 1GB disk space
- ✅ Automatic HTTPS

**Total Monthly Cost: FREE!** 🎉

---

## 📈 Scaling and Monitoring

### Netlify Features:
- **Analytics**: Track site performance
- **Forms**: Handle contact forms (paid feature)
- **Functions**: Add serverless functions if needed

### Railway Features:
- **Metrics**: Monitor CPU, RAM, requests
- **Logs**: Real-time application logs
- **Auto-scaling**: Upgrade when needed

---

## 🔧 Advanced Configuration

### Custom Domain Setup:

**For Netlify:**
1. Domain settings → Add custom domain
2. Update DNS records with your domain provider
3. SSL certificate auto-generated

**For Railway:**
1. Settings → Domains → Add custom domain
2. Create CNAME record: `api.yourdomain.com` → `your-project.up.railway.app`

### Environment-based Configs:

Create different config files:
- `js/config.dev.js` (for local development)
- `js/config.staging.js` (for testing)
- `js/config.prod.js` (for production)

---

## 🚀 Quick Commands Reference

```powershell
# Create production build
mkdir production-build
cp *.html production-build/
cp -r css js images ContactFrom_v1 production-build/

# Update API URLs in config files
# Deploy to Netlify (drag & drop or GitHub)
# Deploy to Railway (GitHub integration)

# Test deployment
# curl https://your-railway-url.up.railway.app/api/test/health
```

---

## 🆘 Troubleshooting

### Common Issues:

**CORS Errors:**
- Verify `FRONTEND_URL` environment variable in Railway
- Check Railway logs for CORS configuration

**API Not Found:**
- Ensure Railway URL includes `/api` path
- Verify Spring Boot context path

**Database Connection:**
- Check Railway database status
- Verify `DATABASE_URL` environment variable

**Build Failures:**
- Check Java version compatibility
- Verify Maven dependencies
- Check Railway build logs

---

## 📞 Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Railway Docs**: https://docs.railway.app
- **Community**: Railway Discord, Netlify Forums
- **Your Project**: Check logs in both platforms

**Ready to deploy? Let's go! 🚀**
