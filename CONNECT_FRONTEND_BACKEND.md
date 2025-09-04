# 🔗 Connect Frontend & Backend - Detailed Guide

This guide shows you exactly how to connect your Netlify frontend with your Railway backend after both are deployed.

## 📋 Prerequisites

Before starting, you should have:
- ✅ Frontend deployed to Netlify (with a URL like `https://your-site.netlify.app`)
- ✅ Backend deployed to Railway (with a URL like `https://your-project.up.railway.app`)
- ✅ Railway environment variables set up

---

## 🎯 Part 1: Update Frontend Configuration

### Step 1: Get Your Railway URL

1. **Go to Railway Dashboard**: https://railway.app
2. **Click on your project**
3. **Click on your backend service** (not the database)
4. **Go to the "Overview" tab**
5. **Copy the URL** under "Domains" (looks like: `https://animal-healthcare-backend-production.up.railway.app`)

### Step 2: Edit the Frontend Config File

1. **Open your project folder** in VS Code or any text editor
2. **Navigate to**: `netlify-build/js/config.prod.js`
3. **Find this line**:
   ```javascript
   BASE_URL: 'https://your-railway-app.up.railway.app/api',
   ```
4. **Replace with your actual Railway URL**:
   ```javascript
   BASE_URL: 'https://your-actual-railway-url.up.railway.app/api',
   ```

**Important**: Make sure to include `/api` at the end!

### Step 3: Example Before/After

**BEFORE** (template):
```javascript
window.API_CONFIG = {
    BASE_URL: 'https://your-railway-app.up.railway.app/api',
    TIMEOUT: 30000,
    DEBUG_MODE: false,
    // ... rest of config
};
```

**AFTER** (with real URL):
```javascript
window.API_CONFIG = {
    BASE_URL: 'https://animal-healthcare-backend-production.up.railway.app/api',
    TIMEOUT: 30000,
    DEBUG_MODE: false,
    // ... rest of config
};
```

### Step 4: Redeploy to Netlify

#### Option A: Drag & Drop Method
1. **Save the file** after editing
2. **Go to netlify.com** and sign in
3. **Find your site** in the dashboard
4. **Click on your site**
5. **Go to "Deploys" tab**
6. **Drag the entire `netlify-build/` folder** to the deploy area
7. **Wait for deployment** to complete

#### Option B: GitHub Method (if using Git)
```bash
# Add, commit, and push changes
git add netlify-build/js/config.prod.js
git commit -m "Update API URL for production"
git push origin main
```
Netlify will auto-deploy the changes.

---

## 🎯 Part 2: Update Backend CORS Configuration

### Step 1: Get Your Netlify URL

1. **Go to netlify.com** and sign in
2. **Click on your site**
3. **Copy the site URL** (looks like: `https://amazing-animal-care-123.netlify.app`)

### Step 2: Update Railway Environment Variable

1. **Go to Railway Dashboard**: https://railway.app
2. **Click on your project**
3. **Click on your backend service**
4. **Go to "Variables" tab**
5. **Find the `FRONTEND_URL` variable**
6. **Click "Edit" (pencil icon)**
7. **Replace the placeholder** with your actual Netlify URL
8. **Save changes**

### Step 3: Example Before/After

**BEFORE** (placeholder):
```
FRONTEND_URL = https://placeholder-will-update-after-netlify.com
```

**AFTER** (real Netlify URL):
```
FRONTEND_URL = https://amazing-animal-care-123.netlify.app
```

### Step 4: Wait for Railway to Redeploy

- Railway will automatically redeploy your backend after changing environment variables
- Wait for the deployment to complete (check the "Deployments" tab)

---

## 🧪 Part 3: Test the Connection

### Test 1: API Health Check

1. **Open your browser**
2. **Visit**: `https://your-railway-url.up.railway.app/api/test/health`
3. **Should see**: Success message or health status

### Test 2: Frontend-Backend Communication

1. **Visit your Netlify site**: `https://your-netlify-url.netlify.app`
2. **Open browser Developer Tools** (F12)
3. **Go to Console tab**
4. **Look for**: `🚀 Production config loaded:` message
5. **Check**: No CORS errors in the console

### Test 3: Full Application Test

1. **Go to Emergency Rescue page**: `https://your-netlify-url.netlify.app/emergency_rescue.html`
2. **Try to submit an emergency request**
3. **Try to register a new user**
4. **Check**: No network errors in browser console

---

## 🔄 Complete Step-by-Step Process

### Prerequisites Done:
- [x] Netlify frontend deployed
- [x] Railway backend deployed  
- [x] Railway environment variables set

### Now Do This:

#### Step 1: Get URLs
- **Railway URL**: `https://your-backend.up.railway.app` ← Copy this
- **Netlify URL**: `https://your-frontend.netlify.app` ← Copy this

#### Step 2: Update Frontend
```javascript
// Edit: netlify-build/js/config.prod.js
BASE_URL: 'https://your-backend.up.railway.app/api', // ← Paste Railway URL + /api
```

#### Step 3: Redeploy Frontend
- Drag `netlify-build/` folder to Netlify again

#### Step 4: Update Backend
```
Railway → Your Service → Variables → Edit FRONTEND_URL
Old: https://placeholder.com
New: https://your-frontend.netlify.app  ← Paste Netlify URL
```

#### Step 5: Test
- Visit your Netlify site
- Test emergency request form
- Check browser console for errors

---

## ❌ Troubleshooting

### Problem: CORS Errors

**Error in browser console**:
```
Access to fetch at 'https://backend.railway.app/api/...' from origin 'https://frontend.netlify.app' has been blocked by CORS policy
```

**Solution**:
1. ✅ Verify `FRONTEND_URL` in Railway exactly matches your Netlify URL
2. ✅ No trailing slash: use `https://site.netlify.app` not `https://site.netlify.app/`
3. ✅ Check Railway logs for CORS configuration messages

### Problem: API Not Found (404)

**Error**: `GET https://backend.railway.app/api/test/health 404 Not Found`

**Solution**:
1. ✅ Ensure Railway backend is running (check Deployments tab)
2. ✅ Verify the URL includes `/api`: `https://backend.up.railway.app/api`
3. ✅ Check Railway logs for startup errors

### Problem: Frontend Config Not Updated

**Error**: Still using template URL in network requests

**Solution**:
1. ✅ Clear browser cache (Ctrl+F5)
2. ✅ Verify you edited the right file: `netlify-build/js/config.prod.js`
3. ✅ Confirm Netlify redeployed after your changes

---

## 🎉 Success Checklist

Your connection is working when:

- [ ] ✅ No CORS errors in browser console
- [ ] ✅ API health endpoint returns success
- [ ] ✅ Emergency request form submits successfully
- [ ] ✅ User registration/login works
- [ ] ✅ Network tab shows requests to correct Railway URL
- [ ] ✅ Responses return data (not error messages)

---

## 📱 Pro Tips

### Quick URL Updates
Create bookmarks for easy access:
- Railway Dashboard: `https://railway.app/dashboard`
- Netlify Dashboard: `https://app.netlify.com/`

### Testing Changes
Always test in an incognito/private browser window to avoid cache issues.

### Environment Variables Shortcut
Save your URLs in a text file for future reference:
```
My Project URLs:
Frontend: https://amazing-animal-care-123.netlify.app
Backend:  https://animal-healthcare-backend-production.up.railway.app
API:      https://animal-healthcare-backend-production.up.railway.app/api
```

Your frontend and backend should now be perfectly connected! 🚀
