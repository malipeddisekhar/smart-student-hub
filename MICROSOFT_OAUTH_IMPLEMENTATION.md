# 🔐 Microsoft OAuth 2.0 Authentication - Implementation Guide

## 📖 Overview

This implementation adds **"Login with Microsoft (Outlook)"** OAuth 2.0 authentication to the Smart-Student-Hub MERN application. The system ensures:

✅ **Email-based user identification** - Each email maps to exactly ONE account  
✅ **No duplicate accounts** - Same email always returns same user  
✅ **Idempotent login** - Multiple logins from same email = same account  
✅ **Automatic account creation** - First-time users get accounts created automatically  
✅ **JWT-based sessions** - Secure, stateless authentication  
✅ **Profile completion support** - New users can complete profile after OAuth

---

## 🏗️ Architecture

### Authentication Flow

```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐
│   Frontend  │          │   Backend    │          │  Microsoft  │
│  (React)    │          │  (Express)   │          │    OAuth    │
└──────┬──────┘          └──────┬───────┘          └──────┬──────┘
       │                        │                         │
       │ 1. Click "Login        │                         │
       │    with Outlook"       │                         │
       ├───────────────────────>│                         │
       │                        │                         │
       │                        │ 2. Redirect to Microsoft│
       │                        ├────────────────────────>│
       │                        │                         │
       │                        │                         │ 3. User
       │                        │                         │    Authenticates
       │                        │                         │
       │                        │ 4. Callback with code   │
       │                        │<────────────────────────┤
       │                        │                         │
       │                        │ 5. Exchange code for    │
       │                        │    access token         │
       │                        ├────────────────────────>│
       │                        │                         │
       │                        │ 6. Get user profile     │
       │                        │<────────────────────────┤
       │                        │                         │
       │                        │ 7. Check if user exists │
       │                        │    by EMAIL (unique)    │
       │                        │                         │
       │                        │ 8. Create/Update user   │
       │                        │    Generate JWT token   │
       │                        │                         │
       │ 9. Redirect to         │                         │
       │    dashboard with token│                         │
       │<───────────────────────┤                         │
       │                        │                         │
       │ 10. Store token &      │                         │
       │     user data          │                         │
       └────────────────────────┴─────────────────────────┘
```

---

## 📁 File Structure

```
Backend/
├── config/
│   └── passport.js              # Passport Microsoft strategy configuration
├── routes/
│   └── auth.js                  # Authentication routes (/auth/microsoft, callback)
├── models/
│   └── Student.js               # Updated with microsoftId, isVerified, authProvider
├── app.js                       # Updated with session, passport, auth routes
├── .env                         # Environment variables (create from .env.example)
└── .env.example                 # Template for environment variables

Frontend/smart-student-hub/
├── src/
│   └── components/
│       ├── StudentLogin.jsx     # Updated with Microsoft OAuth button
│       ├── TeacherLogin.jsx     # Updated with Microsoft OAuth button
│       └── AdminLogin.jsx       # Updated with Microsoft OAuth button
├── .env                         # Frontend environment variables
└── .env.example                 # Template for frontend env vars

Documentation/
├── MICROSOFT_OAUTH_SETUP.md     # Detailed setup guide
└── MICROSOFT_OAUTH_IMPLEMENTATION.md  # This file
```

---

## 🔧 Key Components

### 1. Student Model Updates ([Student.js](Backend/models/Student.js))

```javascript
// Added fields:
{
  microsoftId: {
    type: String,
    sparse: true,
    unique: true
  },
  isVerified: {
    type: Boolean,
    default: false  // Set to true for OAuth users
  },
  authProvider: {
    type: String,
    enum: ['local', 'microsoft', 'google'],
    default: 'local'
  }
}
```

**Key Features:**
- Email remains **UNIQUE** (single source of truth)
- `microsoftId` is **sparse unique** (allows nulls but unique when set)
- Password is **optional** (OAuth users don't need password)

---

### 2. Passport Configuration ([config/passport.js](Backend/config/passport.js))

**Strategy Logic:**
1. Extract `email`, `displayName`, `microsoftId` from Microsoft profile
2. Search database for existing user **by email** (not microsoftId)
3. **IF user exists:**
   - Update `microsoftId` if missing
   - Set `authProvider = 'microsoft'`
   - Set `isVerified = true`
   - Return existing user (NO new record created)
4. **ELSE create new user:**
   - Email, name, microsoftId from OAuth
   - Set `password = null`
   - Set `authProvider = 'microsoft'`
   - Set `isVerified = true`
   - Set temporary values for required fields (college, department)

**Edge Case Handling:**
- Same email from different devices → Same account ✅
- Multiple logins with same email → Same account ✅
- Microsoft ID changes but email same → Email wins ✅

---

### 3. Authentication Routes ([routes/auth.js](Backend/routes/auth.js))

#### **GET /auth/microsoft**
- Initiates OAuth flow
- Redirects to Microsoft login page
- Uses `prompt: 'select_account'` for better UX

#### **GET /auth/microsoft/callback**
- Receives authorization code from Microsoft
- Passport exchanges code for access token
- Gets user profile
- Creates/updates user in database
- Generates JWT token
- Redirects to frontend dashboard with token

#### **GET /auth/verify**
- Verifies JWT token validity
- Returns user data if valid
- Used by frontend to check authentication status

#### **GET /auth/logout**
- Clears session
- Redirects to login page

---

### 4. Frontend Components

#### **StudentLogin.jsx** / **TeacherLogin.jsx** / **AdminLogin.jsx**

**OAuth Callback Handling:**
```javascript
useEffect(() => {
  const token = searchParams.get('token');
  const userStr = searchParams.get('user');
  
  if (token && userStr) {
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update app state
    onLogin(user);
    
    // Navigate to dashboard
    navigate('/dashboard', { replace: true });
  }
}, [searchParams]);
```

**Microsoft Login Button:**
```javascript
const handleMicrosoftLogin = () => {
  setIsLoading(true);
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  window.location.href = `${backendUrl}/auth/microsoft`;
};
```

**UI Features:**
- Professional Microsoft logo (4-color squares)
- Loading states ("Redirecting...")
- Disabled state during authentication
- Error handling for failed OAuth
- Clean "PhonePe scan" style design

---

## 🔐 Security Features

### Email Uniqueness Enforcement
```javascript
email: {
  type: String,
  required: true,
  unique: true  // MongoDB index ensures uniqueness
}
```

### JWT Token Security
- Signed with `JWT_SECRET` (min 32 characters)
- Expires in 7 days
- Contains: userId, studentId, email, name, authProvider
- Stored in localStorage (frontend)

### Session Security
- `SESSION_SECRET` for Express sessions
- `httpOnly` cookies in production
- `secure: true` for HTTPS in production
- `sameSite: 'strict'` for CSRF protection

### Password Handling
- OAuth users have `password: null`
- Password field is **required: false** in schema
- Local auth users still require password

---

## 🧪 Testing Scenarios

### ✅ Scenario 1: First-time Microsoft Login
1. User clicks "Login with Outlook"
2. Redirected to Microsoft
3. User authenticates with `test@gmrit.edu.in`
4. System creates **NEW** user
5. User redirected to dashboard
6. **Expected**: New account created with email, microsoftId, isVerified=true

### ✅ Scenario 2: Repeat Login (Same Email)
1. User logs out
2. User clicks "Login with Outlook" again
3. Authenticates with `test@gmrit.edu.in`
4. System finds **EXISTING** user by email
5. No new record created
6. **Expected**: Same account, same studentId, same data

### ✅ Scenario 3: Login from Different Device
1. User logs in from Computer A
2. User logs in from Computer B
3. Both use same email `test@gmrit.edu.in`
4. **Expected**: Both sessions access SAME account

### ✅ Scenario 4: Email Already Exists (Local Auth)
1. User registers via form with `test@gmrit.edu.in`
2. Later tries Microsoft OAuth with same email
3. System finds existing account by email
4. Updates `microsoftId` field
5. **Expected**: Same account, now supports both auth methods

### ✅ Scenario 5: Microsoft ID Changes
1. User logs in with email `test@gmrit.edu.in`
2. Microsoft changes the user's Microsoft ID
3. User logs in again
4. Email remains same `test@gmrit.edu.in`
5. **Expected**: Email wins, microsoftId updated, same account

---

## 🚀 Deployment Checklist

### Azure App Registration
- [ ] Create Azure App Registration
- [ ] Copy Client ID and Client Secret
- [ ] Add production redirect URI
- [ ] Configure API permissions (User.Read)
- [ ] Grant admin consent

### Backend Configuration
- [ ] Set `MICROSOFT_CLIENT_ID` in production .env
- [ ] Set `MICROSOFT_CLIENT_SECRET` in production .env
- [ ] Update `MICROSOFT_CALLBACK_URL` to production URL
- [ ] Generate strong `JWT_SECRET` (32+ chars)
- [ ] Generate strong `SESSION_SECRET` (32+ chars)
- [ ] Set `FRONTEND_URL` to production frontend domain
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Set `secure: true` for cookies

### Frontend Configuration
- [ ] Set `VITE_API_URL` to production backend domain
- [ ] Build frontend: `npm run build`
- [ ] Deploy to hosting (Vercel, Netlify, etc.)

### Database
- [ ] Ensure email index exists: `db.students.createIndex({ email: 1 }, { unique: true })`
- [ ] Ensure microsoftId index exists: `db.students.createIndex({ microsoftId: 1 }, { unique: true, sparse: true })`
- [ ] Backup database before deployment

### Testing
- [ ] Test OAuth flow end-to-end
- [ ] Test first-time login
- [ ] Test repeat login
- [ ] Test login from different devices
- [ ] Verify no duplicate users created
- [ ] Test error handling
- [ ] Test JWT token expiration

---

## 🐛 Common Issues & Solutions

### Issue: "Redirect URI mismatch"
**Solution:** Ensure `MICROSOFT_CALLBACK_URL` matches Azure redirect URI exactly

### Issue: "Invalid client secret"
**Solution:** Regenerate client secret in Azure, update .env

### Issue: Duplicate user created for same email
**Solution:** Check database has unique index on email field

### Issue: JWT token invalid
**Solution:** Ensure `JWT_SECRET` matches between token creation and verification

### Issue: User profile incomplete after OAuth
**Solution:** Guide user to profile completion page after first login

---

## 📊 Database Schema Changes

### Before
```javascript
{
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}
```

### After
```javascript
{
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },  // OAuth users don't need password
  microsoftId: { type: String, sparse: true, unique: true },
  isVerified: { type: Boolean, default: false },
  authProvider: { type: String, enum: ['local', 'microsoft', 'google'], default: 'local' }
}
```

---

## 🔄 Migration Guide (Existing Users)

Existing users with local auth can seamlessly add Microsoft OAuth:

1. User has account: `{ email: "test@example.com", password: "hashed" }`
2. User clicks "Login with Outlook"
3. Microsoft returns email: `test@example.com`
4. System finds existing user by email
5. Updates: `{ microsoftId: "xxx", authProvider: "microsoft", isVerified: true }`
6. User can now login with EITHER:
   - Email/Password (local auth)
   - Microsoft OAuth

---

## 📚 API Reference

### POST /auth/verify
Verify JWT token and get user data

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "507f1f77bcf86cd799439011",
    "studentId": "GMRIT3a9Bc4",
    "email": "test@gmrit.edu.in",
    "name": "John Doe",
    "authProvider": "microsoft"
  }
}
```

---

## 🎯 Key Takeaways

1. **Email is the single source of truth** - Always check user existence by email
2. **No duplicate accounts** - Same email = same account, always
3. **Idempotent operations** - Multiple logins don't create duplicates
4. **Flexible auth** - Users can have both local and OAuth auth
5. **JWT for sessions** - Stateless, scalable authentication
6. **Security first** - Strong secrets, HTTPS in production, secure cookies

---

## 👥 Support

For issues or questions:
1. Check [MICROSOFT_OAUTH_SETUP.md](MICROSOFT_OAUTH_SETUP.md) for setup help
2. Review Azure App Registration configuration
3. Check browser console for frontend errors
4. Check backend logs for authentication errors

---

**Implementation Date**: January 20, 2026  
**Version**: 1.0.0  
**Maintained By**: Smart-Student-Hub Development Team
