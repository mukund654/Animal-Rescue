# Animal Healthcare Deployment Preparation Script
# This script prepares your project for Netlify + Railway deployment

Write-Host "🚀 Animal Healthcare - Deployment Preparation" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if netlify-build directory exists
if (Test-Path "netlify-build") {
    Write-Host "✅ Netlify build directory already exists" -ForegroundColor Yellow
} else {
    Write-Host "❌ Creating netlify-build directory..." -ForegroundColor Red
    New-Item -ItemType Directory -Name "netlify-build"
}

# Copy files to netlify-build if they don't exist or are newer
Write-Host "📁 Copying frontend files to netlify-build..." -ForegroundColor Cyan

# Copy HTML files
Copy-Item "*.html" "netlify-build/" -Force
Write-Host "  ✅ HTML files copied"

# Copy directories
$directories = @("css", "js", "images", "ContactFrom_v1")
foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Copy-Item $dir "netlify-build/" -Recurse -Force
        Write-Host "  ✅ $dir directory copied"
    } else {
        Write-Host "  ⚠️  $dir directory not found - skipping"
    }
}

# Create _redirects file for Netlify (handles SPA routing)
$redirectsContent = @"
# Netlify redirects for Animal Healthcare
/*    /index.html   200
"@
$redirectsContent | Out-File "netlify-build/_redirects" -Encoding UTF8
Write-Host "  ✅ _redirects file created"

# Check Railway configuration
Write-Host "🚂 Checking Railway configuration..." -ForegroundColor Cyan

$railwayConfigPath = "animal-healthcare-backend/railway.json"
if (Test-Path $railwayConfigPath) {
    Write-Host "  ✅ Railway configuration found"
} else {
    Write-Host "  ❌ Railway configuration missing - check animal-healthcare-backend/railway.json"
}

$railwayPropsPath = "animal-healthcare-backend/src/main/resources/application-railway.properties"
if (Test-Path $railwayPropsPath) {
    Write-Host "  ✅ Railway application properties found"
} else {
    Write-Host "  ❌ Railway application properties missing"
}

# Check production config
Write-Host "⚙️  Checking production configuration..." -ForegroundColor Cyan

if (Test-Path "js/config.prod.js") {
    Write-Host "  ✅ Production config found"
    
    # Check if Railway URL needs to be updated
    $configContent = Get-Content "js/config.prod.js" -Raw
    if ($configContent -match "your-railway-app\.up\.railway\.app") {
        Write-Host "  ⚠️  Railway URL in config.prod.js needs to be updated after Railway deployment" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Railway URL appears to be configured"
    }
} else {
    Write-Host "  ❌ Production config missing - js/config.prod.js"
}

# Generate JWT secret if needed
Write-Host "🔐 Security check..." -ForegroundColor Cyan

Write-Host "  💡 Remember to:"
Write-Host "     - Generate JWT secret: openssl rand -base64 64"
Write-Host "     - Set Railway environment variables:"
Write-Host "       * JWT_SECRET=your_generated_secret"
Write-Host "       * FRONTEND_URL=https://your-netlify-url.netlify.app"
Write-Host "       * SPRING_PROFILES_ACTIVE=railway"

# Summary
Write-Host ""
Write-Host "📋 DEPLOYMENT CHECKLIST:" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host "Frontend (Netlify):"
Write-Host "  1. 📁 Drag netlify-build/ folder to netlify.com"
Write-Host "  2. ✏️  Note your Netlify URL"
Write-Host "  3. 🔧 Update js/config.prod.js with Railway URL (after step 6)"
Write-Host ""
Write-Host "Backend (Railway):"
Write-Host "  4. 🚂 Go to railway.app and connect GitHub repo"
Write-Host "  5. 🗄️  Add MySQL database to Railway project"
Write-Host "  6. ⚙️  Set environment variables in Railway"
Write-Host "  7. ✏️  Note your Railway URL"
Write-Host "  8. 🔗 Update FRONTEND_URL in Railway with Netlify URL"
Write-Host ""
Write-Host "Final Steps:"
Write-Host "  9. 🧪 Test both frontend and backend"
Write-Host "  10. 🎉 Celebrate your deployed Animal Healthcare app!"

Write-Host ""
Write-Host "🎯 Ready for deployment! Check NETLIFY_RAILWAY_DEPLOYMENT.md for detailed instructions." -ForegroundColor Green
