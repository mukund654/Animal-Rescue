# 🔗 Simple Connection Steps

## Part 1: Update Frontend Config (5 minutes)

### Step 1: Get Your Railway URL
1. Go to **https://railway.app**
2. Click your project → Click your backend service
3. Copy the URL (something like: `https://web-production-abc123.up.railway.app`)

### Step 2: Edit the Config File
1. Open **`netlify-build/js/config.prod.js`** in any text editor
2. Find **Line 6**: 
   ```javascript
   BASE_URL: 'https://your-railway-app.up.railway.app/api',
   ```
3. Replace with your Railway URL:
   ```javascript
   BASE_URL: 'https://web-production-abc123.up.railway.app/api',
   ```
4. **Save the file**

### Step 3: Redeploy to Netlify
1. Go to **https://netlify.com** → Your site
2. **Drag** the entire `netlify-build/` folder to the deploy area
3. Wait for deployment to finish

---

## Part 2: Update Backend CORS (2 minutes)

### Step 1: Get Your Netlify URL
1. Go to **https://netlify.com** → Your site
2. Copy the site URL (something like: `https://amazing-site-123.netlify.app`)

### Step 2: Update Railway Environment Variable
1. Go to **https://railway.app** → Your project → Backend service
2. Click **"Variables"** tab
3. Find **`FRONTEND_URL`** → Click **"Edit"**
4. Replace with your Netlify URL:
   ```
   https://amazing-site-123.netlify.app
   ```
5. **Save** - Railway will auto-redeploy

---

## Test Your Connection

1. **Visit your Netlify site**
2. **Go to Emergency Rescue page**
3. **Try submitting a request**
4. **Check browser console (F12)** - should be no CORS errors

### Success Signs:
- ✅ No red errors in browser console
- ✅ Forms submit successfully
- ✅ API calls work

### If Something's Wrong:
- ❌ CORS errors → Check Railway `FRONTEND_URL` matches Netlify URL exactly
- ❌ 404 errors → Make sure Railway URL includes `/api` at the end
- ❌ Config not working → Clear browser cache (Ctrl+F5)

**That's it! Your frontend and backend are now connected! 🎉**
