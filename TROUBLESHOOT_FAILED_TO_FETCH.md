# 🔧 Troubleshoot "Failed to Fetch" Error

This error means your frontend can't communicate with your backend. Let's fix it step by step!

## 🔍 Step-by-Step Diagnosis

### Step 1: Check What URLs Are Being Used

1. **Open your Netlify site** in browser
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Look for config message**: Should see something like:
   ```
   🚀 Production config loaded: {BASE_URL: "https://..."}
   ```
5. **Check the BASE_URL** - this should be your Railway URL

### Step 2: Test Backend Directly

1. **Get your Railway URL** from the config above
2. **Open new browser tab**
3. **Visit**: `https://your-railway-url.up.railway.app/api/test/health`
4. **Expected result**: JSON response with health status
5. **If you get 404 or error**: Backend isn't running properly

### Step 3: Check Network Tab

1. **In browser Dev Tools, go to Network tab**
2. **Try the failing action** (like submitting a form)
3. **Look for red entries** - these show failed requests
4. **Click on a red entry** to see details

## 🛠️ Common Fixes

### Fix 1: Backend Not Running

**Symptoms**: 
- `https://your-railway-url.up.railway.app/api/test/health` returns 404
- Railway shows deployment failed

**Solution**:
1. **Go to Railway Dashboard**
2. **Click your backend service**
3. **Check "Deployments" tab**
4. **If failed**: Click on failed deployment to see logs
5. **Common issues**:
   - Missing environment variables
   - Java/Maven build errors
   - Database connection failures

**Quick Fix**:
```bash
# Check these environment variables are set in Railway:
JWT_SECRET=your_secret_here
FRONTEND_URL=https://your-netlify-site.netlify.app
SPRING_PROFILES_ACTIVE=railway
```

### Fix 2: Wrong URL in Frontend Config

**Symptoms**:
- Network tab shows requests to wrong URL
- Config shows template URL still

**Solution**:
1. **Check `netlify-build/js/config.prod.js`**
2. **Line 6 should have your REAL Railway URL**:
   ```javascript
   BASE_URL: 'https://web-production-abc123.up.railway.app/api',
   ```
3. **If still shows template**: Edit and redeploy to Netlify
4. **Important**: Must include `/api` at the end!

### Fix 3: CORS Issues

**Symptoms**:
- Browser console shows CORS error
- Backend runs fine but frontend can't access it

**Solution**:
1. **Check Railway environment variables**
2. **Verify `FRONTEND_URL`** exactly matches your Netlify URL
3. **No trailing slash**: 
   - ✅ Correct: `https://site.netlify.app`
   - ❌ Wrong: `https://site.netlify.app/`

### Fix 4: HTTPS/HTTP Mixed Content

**Symptoms**:
- "Mixed content" errors in console
- Requests blocked by browser

**Solution**:
1. **Ensure both URLs use HTTPS**:
   - Netlify: `https://your-site.netlify.app`
   - Railway: `https://your-backend.up.railway.app`
2. **Both platforms provide HTTPS by default**

## 🔧 Debugging Commands

### Check Current Configuration
Open browser console on your Netlify site and run:
```javascript
console.log('Current API Config:', window.API_CONFIG);
console.log('Base URL being used:', window.API_BASE_URL);
```

### Test API Call Manually
```javascript
// Test if API is reachable
fetch(window.API_BASE_URL + '/test/health')
  .then(response => response.json())
  .then(data => console.log('API Response:', data))
  .catch(error => console.error('API Error:', error));
```

### Check Network Requests
1. **Network tab in Dev Tools**
2. **Filter by "XHR" or "Fetch"**
3. **Look for your API calls**
4. **Check status codes**:
   - 200: Success
   - 404: URL not found
   - 500: Server error
   - CORS: Cross-origin blocked

## 🎯 Step-by-Step Fix Process

### Step 1: Verify Backend is Running
```
✅ Railway Dashboard → Your Service → Deployments → Latest should be "Success"
✅ Visit: https://your-railway-url.up.railway.app/api/test/health
✅ Should return JSON, not 404 error
```

### Step 2: Verify Frontend Configuration
```
✅ netlify-build/js/config.prod.js has correct Railway URL
✅ URL ends with /api
✅ Frontend redeployed after config change
```

### Step 3: Verify Environment Variables
```
✅ JWT_SECRET set in Railway (64+ characters)
✅ FRONTEND_URL set to exact Netlify URL
✅ SPRING_PROFILES_ACTIVE=railway
✅ DATABASE_URL exists (auto-generated)
```

### Step 4: Test Connection
```
✅ No CORS errors in browser console
✅ API calls appear in Network tab
✅ Responses return data, not errors
```

## 🚨 Emergency Quick Fix

If nothing else works, try this:

### 1. Reset Frontend Config
```javascript
// Edit netlify-build/js/config.prod.js
window.API_CONFIG = {
    BASE_URL: 'https://your-actual-railway-url.up.railway.app/api',  // ← Fix this
    TIMEOUT: 30000,
    DEBUG_MODE: true,  // ← Turn on debug temporarily
    // ... rest stays same
};
```

### 2. Redeploy Everything
1. **Redeploy frontend**: Drag `netlify-build/` to Netlify
2. **Trigger backend redeploy**: Change any Railway env var and change it back

### 3. Test with Debug Mode
With `DEBUG_MODE: true`, you'll see more console messages to help debug.

## 📋 Diagnostic Checklist

Work through this list:

- [ ] ✅ Railway backend shows "Success" in deployments
- [ ] ✅ `https://railway-url.up.railway.app/api/test/health` returns JSON
- [ ] ✅ Frontend config has correct Railway URL
- [ ] ✅ Frontend redeployed after config change
- [ ] ✅ `JWT_SECRET` set in Railway variables
- [ ] ✅ `FRONTEND_URL` set to exact Netlify URL
- [ ] ✅ `SPRING_PROFILES_ACTIVE=railway` set
- [ ] ✅ No CORS errors in browser console
- [ ] ✅ Network tab shows API calls with 200 status

## 💬 Get Help

If you're still stuck, provide these details:

1. **Your Railway URL**: (from Railway dashboard)
2. **Your Netlify URL**: (from Netlify dashboard)
3. **Browser console errors**: (screenshot or copy/paste)
4. **Network tab errors**: (status codes of failed requests)
5. **Railway deployment status**: (Success/Failed)

**Most "Failed to fetch" errors are URL configuration issues - double-check your URLs match exactly!** 🎯
