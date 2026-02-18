# 🔧 Microsoft OAuth Troubleshooting Guide

Quick solutions to common issues when implementing Microsoft OAuth authentication.

---

## 🚨 Common Errors

### 1. "Redirect URI Mismatch"

**Error Message:**
```
AADSTS50011: The redirect URI 'http://localhost:3000/auth/microsoft/callback' 
specified in the request does not match the redirect URIs configured for the application.
```

**Cause:** Callback URL in `.env` doesn't match Azure App Registration

**Solution:**
```bash
# 1. Check your .env file
MICROSOFT_CALLBACK_URL=http://localhost:3000/auth/microsoft/callback

# 2. Go to Azure Portal → Your App → Authentication
# 3. Verify redirect URI matches EXACTLY:
#    - Same protocol (http vs https)
#    - Same domain
#    - Same port
#    - Same path
#    - No trailing slash differences

# 4. Common mistakes:
❌ http://localhost:3000/auth/microsoft/callback/  (extra slash)
❌ https://localhost:3000/auth/microsoft/callback   (http vs https)
❌ http://localhost:3000/microsoft/callback         (wrong path)
✅ http://localhost:3000/auth/microsoft/callback   (correct)
```

---

### 2. "Invalid Client Secret"

**Error Message:**
```
AADSTS7000215: Invalid client secret is provided
```

**Cause:** Wrong client secret or expired

**Solution:**
```bash
# 1. Go to Azure Portal → Your App → Certificates & secrets
# 2. Check expiration date of current secret
# 3. If expired or wrong, create NEW secret:
#    - Click "New client secret"
#    - Set expiration (24 months recommended)
#    - Copy VALUE immediately (you can't see it again!)
# 4. Update .env:
MICROSOFT_CLIENT_SECRET=your-new-secret-value-here

# 5. Restart backend server
npm start
```

---

### 3. "Cannot read properties of undefined (reading 'email')"

**Error Message:**
```
TypeError: Cannot read properties of undefined (reading 'email')
at Strategy._verify (passport.js:52)
```

**Cause:** Microsoft didn't return email in profile

**Solution:**
```bash
# 1. Check Azure API permissions
# Go to Azure Portal → Your App → API permissions

# 2. Ensure these permissions exist:
✅ User.Read (Microsoft Graph)
✅ email (Microsoft Graph)
✅ openid (Microsoft Graph)
✅ profile (Microsoft Graph)

# 3. Grant admin consent
# Click "Grant admin consent for [Your Organization]"

# 4. Ask user to re-authenticate
# Their account may need to grant permissions
```

---

### 4. "Duplicate Key Error" (E11000)

**Error Message:**
```
MongoServerError: E11000 duplicate key error collection: 
smart-student-hub.students index: email_1 dup key: { email: "test@example.com" }
```

**Cause:** Email already exists in database

**Solution:**
```bash
# This is EXPECTED behavior! It means the system is working correctly.
# Email uniqueness prevents duplicate accounts.

# What's happening:
# - User with email "test@example.com" already exists
# - OAuth trying to create new user with same email
# - Database rejects it (good!)

# Fix in code (already implemented):
# passport.js checks if user exists BEFORE creating:
let user = await Student.findOne({ email });
if (user) {
  // Update existing user
  user.microsoftId = microsoftId;
  await user.save();
} else {
  // Create new user
  user = new Student({ email, ... });
  await user.save();
}
```

---

### 5. "JWT Token Invalid"

**Error Message:**
```
JsonWebTokenError: invalid signature
```

**Cause:** JWT_SECRET mismatch or token tampered

**Solution:**
```bash
# 1. Check JWT_SECRET in .env
# Must be the SAME secret used to create AND verify tokens

# 2. Regenerate JWT_SECRET if unsure:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Update .env:
JWT_SECRET=<paste-new-secret-here>

# 4. Restart backend

# 5. Users will need to re-login (old tokens invalid)
```

---

### 6. "Session Secret Not Found"

**Error Message:**
```
Error: secret option required for sessions
```

**Cause:** SESSION_SECRET not set in .env

**Solution:**
```bash
# 1. Generate session secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Add to .env:
SESSION_SECRET=<paste-secret-here>

# 3. Restart backend
npm start
```

---

### 7. "CORS Error" (Frontend Can't Reach Backend)

**Error Message:**
```
Access to XMLHttpRequest has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present
```

**Cause:** CORS not configured for frontend domain

**Solution:**
```javascript
// Backend/app.js - Update CORS configuration:

app.use(cors({
  origin: [
    'http://localhost:5173',           // Local development
    'https://your-frontend-domain.com' // Production
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Restart backend after changes
```

---

### 8. "Cannot GET /auth/microsoft"

**Error Message:**
```
Cannot GET /auth/microsoft
```

**Cause:** Auth routes not mounted in app.js

**Solution:**
```javascript
// Backend/app.js - Ensure auth routes are mounted:

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);  // This line must exist!

// Check file exists:
// Backend/routes/auth.js ✓

// Restart backend
npm start
```

---

### 9. "Module not found: passport-microsoft"

**Error Message:**
```
Error: Cannot find module 'passport-microsoft'
```

**Cause:** Dependencies not installed

**Solution:**
```bash
cd Backend
npm install passport passport-microsoft jsonwebtoken express-session cookie-parser

# Verify installation:
cat package.json | grep "passport"
# Should show:
#   "passport": "^0.7.0",
#   "passport-microsoft": "^1.0.0",
```

---

### 10. "Database Connection Failed"

**Error Message:**
```
MongooseError: Could not connect to any servers in your MongoDB Atlas cluster
```

**Cause:** Invalid MONGODB_URI or network issue

**Solution:**
```bash
# 1. Check .env:
MONGODB_URI=mongodb://localhost:27017/smart-student-hub
# or for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# 2. Test connection:
mongo <your-connection-string>

# 3. Check firewall/network access
# 4. Verify database user credentials
# 5. Ensure IP whitelist includes your IP (for Atlas)
```

---

## 🔍 Debugging Steps

### General Debugging Process

1. **Check Backend Logs**
   ```bash
   cd Backend
   npm start
   # Watch console for errors
   ```

2. **Check Frontend Logs**
   ```bash
   # Open browser console (F12)
   # Look for errors in Console tab
   # Check Network tab for failed requests
   ```

3. **Check Environment Variables**
   ```bash
   # Backend/.env should have:
   MICROSOFT_CLIENT_ID=...
   MICROSOFT_CLIENT_SECRET=...
   MICROSOFT_CALLBACK_URL=...
   JWT_SECRET=...
   SESSION_SECRET=...
   FRONTEND_URL=...
   MONGODB_URI=...
   
   # Frontend/.env should have:
   VITE_API_URL=...
   ```

4. **Check Database**
   ```bash
   # Connect to MongoDB
   mongo
   
   # Switch to database
   use smart-student-hub
   
   # Check indexes
   db.students.getIndexes()
   
   # Should see:
   # { email: 1 } with unique: true
   # { microsoftId: 1 } with unique: true, sparse: true
   ```

5. **Check Azure Configuration**
   - Go to Azure Portal
   - Find your App Registration
   - Verify Client ID matches .env
   - Verify Redirect URIs include your callback URL
   - Check API permissions granted

---

## 🧪 Testing Tools

### Test Backend Directly

```bash
# Test auth route exists:
curl http://localhost:3000/auth/microsoft
# Should redirect to Microsoft login

# Test token verification:
curl -H "Authorization: Bearer <your-jwt-token>" \
     http://localhost:3000/auth/verify
# Should return user data
```

### Test Database

```javascript
// Test user creation
use smart-student-hub
db.students.findOne({ email: "test@example.com" })

// Check for duplicates
db.students.aggregate([
  { $group: { _id: "$email", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
// Should return empty array (no duplicates)
```

---

## 📊 Common Scenarios

### Scenario: User Can't Login

**Checklist:**
- [ ] Backend running (port 3000)
- [ ] Frontend running (port 5173)
- [ ] MongoDB running and accessible
- [ ] Azure App Registration active
- [ ] Redirect URI matches exactly
- [ ] Client secret not expired
- [ ] API permissions granted
- [ ] CORS configured correctly

### Scenario: Duplicate Accounts Created

**Investigation:**
```javascript
// 1. Check database
db.students.find({ email: "affected@example.com" })

// 2. Should only return 1 document
// If more than 1, check:

// 3. Verify email index exists
db.students.getIndexes()

// 4. Recreate index if missing
db.students.createIndex({ email: 1 }, { unique: true })

// 5. Check passport.js logic
// Should have: let user = await Student.findOne({ email });
```

### Scenario: Token Expired

**Solution:**
```javascript
// Frontend: Detect expired token
try {
  const response = await fetch('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
} catch (error) {
  // Handle error
}
```

---

## 🔐 Security Issues

### Issue: Token Stored in URL

**Problem:** Token visible in browser URL after redirect

**Solution:**
```javascript
// Already implemented in login components:
useEffect(() => {
  const token = searchParams.get('token');
  if (token) {
    localStorage.setItem('authToken', token);
    navigate('/dashboard', { replace: true }); // Clean URL
  }
}, [searchParams]);
```

### Issue: Secrets Exposed

**Problem:** Secrets visible in frontend code

**Prevention:**
```javascript
❌ Never do this:
const secret = 'my-secret-key'; // In frontend code

✅ Always do this:
// Backend only:
const secret = process.env.JWT_SECRET;

// Frontend only:
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📞 Getting Help

### Information to Include When Asking for Help

1. **Error message** (exact text)
2. **When it occurs** (during what action)
3. **Environment** (development/production)
4. **Browser console logs** (screenshot)
5. **Backend logs** (relevant portion)
6. **What you've tried** (debugging steps)

### Useful Logs to Collect

```bash
# Backend logs
cd Backend
npm start > backend.log 2>&1

# Frontend logs
# Open browser → F12 → Console → Right-click → Save as...

# MongoDB logs
mongod --logpath /var/log/mongodb/mongod.log

# Azure logs
# Azure Portal → Your App → Monitoring → Sign-in logs
```

---

## ✅ Verification After Fix

After fixing an issue, verify:

- [ ] Can access login page
- [ ] Can click "Login with Outlook"
- [ ] Redirected to Microsoft login
- [ ] Can authenticate
- [ ] Redirected back to dashboard
- [ ] Token stored in localStorage
- [ ] User data displayed correctly
- [ ] Second login with same email → same account
- [ ] No errors in console
- [ ] No errors in backend logs

---

**Last Updated**: January 20, 2026  
**Version**: 1.0.0
