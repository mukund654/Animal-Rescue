# 🔧 Railway Environment Variables Setup

This guide shows you exactly how to set up environment variables in Railway for your Animal Healthcare project.

## 🎯 Step-by-Step Instructions

### Step 1: Generate JWT Secret

First, you need to generate a secure JWT secret. You have several options:

#### Option A: Using Git Bash (Recommended)
If you have Git installed on Windows:
```bash
# Open Git Bash and run:
openssl rand -base64 64
```

#### Option B: Using PowerShell (Alternative)
```powershell
# Generate a secure random string
$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

#### Option C: Online Generator (Quick)
- Go to https://generate-secret.vercel.app/64
- Or https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
- Generate a 64-character random string

**Copy the generated secret - you'll need it in step 3!**

---

### Step 2: Access Railway Dashboard

1. **Go to https://railway.app**
2. **Sign in** with your GitHub account
3. **Find your Animal Healthcare project** in the dashboard
4. **Click on your project** (not the database)

You should see something like this:
```
🚂 Your Project Name
├── 🗄️  MySQL (database)
└── 🖥️  animal-healthcare-backend (your service)
```

---

### Step 3: Set Environment Variables

1. **Click on your backend service** (the one that says "animal-healthcare-backend" or similar)

2. **Look for the "Variables" tab** at the top of the service page:
   ```
   Overview | Deployments | Logs | Variables | Settings
   ```

3. **Click on "Variables"**

4. **Add each environment variable** by clicking "+ New Variable":

#### Variable 1: JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: `[paste your generated secret from Step 1]`
- Example: `JWT_SECRET=abcdef123456789...` (64+ characters)

#### Variable 2: FRONTEND_URL  
- **Name**: `FRONTEND_URL`
- **Value**: `https://your-netlify-url.netlify.app`
- **Note**: You'll update this after deploying to Netlify

#### Variable 3: SPRING_PROFILES_ACTIVE
- **Name**: `SPRING_PROFILES_ACTIVE`
- **Value**: `railway`

---

### Step 4: Visual Guide

Here's what the Railway Variables page looks like:

```
🔧 Environment Variables

┌─────────────────────┬──────────────────────────────────────────┐
│ Name                │ Value                                    │
├─────────────────────┼──────────────────────────────────────────┤
│ JWT_SECRET          │ your_64_character_secret_here           │
│ FRONTEND_URL        │ https://your-site.netlify.app           │
│ SPRING_PROFILES_ACTIVE │ railway                             │
│ DATABASE_URL        │ [Automatically set by Railway]          │
│ PORT                │ [Automatically set by Railway]          │
└─────────────────────┴──────────────────────────────────────────┘

[+ New Variable]
```

---

### Step 5: Save and Deploy

1. **After adding all variables**, Railway will automatically redeploy your service
2. **Wait for the deployment to complete** (you'll see the status in the Deployments tab)
3. **Your Railway URL will be ready** - note it down for the next step

---

## 🔄 Complete Process (Start to Finish)

### Before You Start:
- [ ] Railway account created
- [ ] GitHub repository connected to Railway
- [ ] MySQL database added to Railway project

### Setting Variables:
1. **Generate JWT Secret**:
   ```bash
   # In Git Bash:
   openssl rand -base64 64
   
   # Copy the output (should look like):
   # a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0=
   ```

2. **Go to Railway Dashboard**:
   - https://railway.app → Your Project → Backend Service → Variables

3. **Add Variables One by One**:
   ```
   JWT_SECRET = [your generated secret]
   FRONTEND_URL = https://placeholder-will-update-after-netlify.com
   SPRING_PROFILES_ACTIVE = railway
   ```

4. **Save and Wait for Deployment**

5. **Get Your Railway URL**:
   - Go to Overview tab
   - Copy the generated URL (like `https://animal-care-backend.up.railway.app`)

---

## 🔄 After Netlify Deployment

Once you deploy to Netlify:

1. **Get your Netlify URL** (e.g., `https://amazing-animal-care.netlify.app`)
2. **Go back to Railway Variables**
3. **Update FRONTEND_URL**:
   - Click on `FRONTEND_URL` variable
   - Change value to your actual Netlify URL
   - Save changes

---

## 🧪 Test Your Setup

After setting variables, test if everything works:

1. **Check Railway Deployment Logs**:
   - Go to Railway → Your Service → Logs tab
   - Look for "Started application" message
   - No error messages about missing environment variables

2. **Test API Health**:
   - Visit: `https://your-railway-url.up.railway.app/api/test/health`
   - Should return success message

3. **Check Database Connection**:
   - Look in logs for database connection messages
   - Should see "HikariCP" connection pool messages

---

## ❌ Troubleshooting

### Common Issues:

**"JWT_SECRET environment variable not found"**
- ✅ Make sure variable name is exactly `JWT_SECRET` (case-sensitive)
- ✅ Verify the secret is at least 32 characters long

**"CORS Error" when testing frontend**
- ✅ Check `FRONTEND_URL` matches your Netlify URL exactly
- ✅ Make sure there's no trailing slash: `https://site.netlify.app` not `https://site.netlify.app/`

**"Database connection failed"**
- ✅ Verify MySQL database addon is installed
- ✅ Check that `DATABASE_URL` appears in your variables (Railway sets this automatically)

**"Application won't start"**
- ✅ Check Railway logs for specific error messages
- ✅ Ensure `SPRING_PROFILES_ACTIVE=railway` is set correctly

---

## 🔐 Security Best Practices

- ✅ **Never share your JWT_SECRET** publicly
- ✅ **Generate unique secrets** for each environment (dev, staging, prod)  
- ✅ **Use Railway's secure variable storage** - never put secrets in code
- ✅ **Regularly rotate secrets** for better security

---

## 📞 Need Help?

If you get stuck:

1. **Check Railway Logs** - most issues show up there
2. **Verify variable names** are exactly as shown above
3. **Check Railway Discord** - very active community
4. **Railway Docs**: https://docs.railway.app/reference/variables

Your environment should be ready to go! 🚀
