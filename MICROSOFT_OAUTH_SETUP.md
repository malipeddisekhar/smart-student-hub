# Microsoft OAuth 2.0 Authentication - Environment Variables Setup

This document explains how to set up environment variables for Microsoft (Outlook) OAuth authentication in the Smart-Student-Hub MERN application.

## 📋 Prerequisites

Before you begin, you need to register your application with Microsoft Azure to obtain OAuth credentials.

## 🔧 Azure App Registration Steps

### 1. Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: `Smart-Student-Hub` (or your preferred name)
   - **Supported account types**: Choose one of:
     - `Accounts in this organizational directory only` (Single tenant - for specific college/organization)
     - `Accounts in any organizational directory` (Multi-tenant - for any educational institution)
     - `Accounts in any organizational directory and personal Microsoft accounts` (Recommended for broader access)
   - **Redirect URI**: 
     - Platform: `Web`
     - URI: `http://localhost:3000/auth/microsoft/callback` (for development)
5. Click **Register**

### 2. Get Client ID

After registration:
- Copy the **Application (client) ID** from the Overview page
- This is your `MICROSOFT_CLIENT_ID`

### 3. Create Client Secret

1. Go to **Certificates & secrets** → **Client secrets**
2. Click **New client secret**
3. Add description: `Smart-Student-Hub OAuth Secret`
4. Choose expiration (recommended: 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the **Value** immediately (you won't see it again)
7. This is your `MICROSOFT_CLIENT_SECRET`

### 4. Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Choose **Microsoft Graph** → **Delegated permissions**
4. Add these permissions:
   - `User.Read` (required - to read user profile and email)
   - `email` (optional but recommended)
   - `openid` (optional but recommended)
   - `profile` (optional but recommended)
5. Click **Add permissions**
6. Click **Grant admin consent** (if you have admin rights)

### 5. Add Redirect URIs for Production

1. Go to **Authentication**
2. Under **Platform configurations** → **Web** → **Redirect URIs**
3. Add your production callback URL:
   - `https://yourdomain.com/auth/microsoft/callback`
4. Click **Save**

---

## 📝 Backend Environment Variables (.env)

Create or update your `.env` file in the `Backend` directory:

```env
# ============================================
# Microsoft OAuth 2.0 Configuration
# ============================================

# Application (client) ID from Azure App Registration
MICROSOFT_CLIENT_ID=your-microsoft-client-id-here

# Client secret from Azure App Registration
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret-here

# OAuth callback URL (must match Azure redirect URI)
# Development
MICROSOFT_CALLBACK_URL=http://localhost:3000/auth/microsoft/callback

# Production (uncomment and update when deploying)
# MICROSOFT_CALLBACK_URL=https://yourdomain.com/auth/microsoft/callback

# ============================================
# JWT & Session Configuration
# ============================================

# Secret key for signing JWT tokens (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# Secret key for Express sessions (generate a different random string)
SESSION_SECRET=your-session-secret-change-in-production-min-32-chars

# ============================================
# Frontend URL Configuration
# ============================================

# Frontend URL for redirects after authentication
# Development
FRONTEND_URL=http://localhost:5173

# Production (uncomment and update when deploying)
# FRONTEND_URL=https://your-frontend-domain.com

# ============================================
# Database & Other Existing Variables
# ============================================

# MongoDB connection string
MONGODB_URI=your-mongodb-connection-string

# Server port
PORT=3000

# Node environment
NODE_ENV=development

# Cloudinary (existing)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🎨 Frontend Environment Variables (.env)

Create or update your `.env` file in the `Frontend/smart-student-hub` directory:

```env
# ============================================
# Backend API Configuration
# ============================================

# Backend API base URL
# Development
VITE_API_URL=http://localhost:3000

# Production (uncomment and update when deploying)
# VITE_API_URL=https://your-backend-domain.com
```

---

## 🔐 Generating Secure Secrets

For `JWT_SECRET` and `SESSION_SECRET`, generate strong random strings:

### Using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Using OpenSSL:
```bash
openssl rand -hex 32
```

### Using Online Tool:
- Visit: https://www.uuidgenerator.net/
- Generate a long UUID/random string

**IMPORTANT**: 
- Use different secrets for `JWT_SECRET` and `SESSION_SECRET`
- Never commit secrets to version control
- Keep production secrets secure and different from development

---

## 🚀 Testing the Setup

### 1. Start Backend Server
```bash
cd Backend
npm install
npm start
```

### 2. Start Frontend Server
```bash
cd Frontend/smart-student-hub
npm install
npm run dev
```

### 3. Test Login Flow
1. Navigate to `http://localhost:5173/login`
2. Click **"Login with Outlook"**
3. You should be redirected to Microsoft login
4. After successful login, you should return to dashboard

---

## 🔍 Troubleshooting

### "Invalid client secret" error
- Ensure `MICROSOFT_CLIENT_SECRET` matches the value from Azure
- Client secret might have expired - create a new one

### "Redirect URI mismatch" error
- Verify `MICROSOFT_CALLBACK_URL` in `.env` matches Azure redirect URI exactly
- Check for http vs https
- Check for trailing slashes

### "User profile is private" or email not returned
- Verify API permissions include `User.Read`
- Grant admin consent for permissions
- User might need to allow permissions on first login

### "JWT token invalid" error
- Ensure `JWT_SECRET` is set in backend `.env`
- Check token is being sent with `Authorization: Bearer <token>` header

### Database duplicate email error
- Email uniqueness is enforced
- This is expected behavior to prevent duplicate accounts
- Same email always maps to same account

---

## 📊 Environment Variables Summary

| Variable | Location | Required | Description |
|----------|----------|----------|-------------|
| `MICROSOFT_CLIENT_ID` | Backend | ✅ Yes | Azure App Registration Client ID |
| `MICROSOFT_CLIENT_SECRET` | Backend | ✅ Yes | Azure App Registration Client Secret |
| `MICROSOFT_CALLBACK_URL` | Backend | ✅ Yes | OAuth callback URL |
| `JWT_SECRET` | Backend | ✅ Yes | JWT signing secret (min 32 chars) |
| `SESSION_SECRET` | Backend | ✅ Yes | Express session secret |
| `FRONTEND_URL` | Backend | ✅ Yes | Frontend URL for redirects |
| `VITE_API_URL` | Frontend | ✅ Yes | Backend API URL |
| `PORT` | Backend | ⚠️ Optional | Server port (default: 3000) |
| `NODE_ENV` | Backend | ⚠️ Optional | Environment (development/production) |

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. Add `.env` to `.gitignore`
3. Use different secrets for development and production
4. Rotate secrets periodically (every 3-6 months)
5. Use HTTPS in production
6. Set `secure: true` for cookies in production
7. Implement rate limiting on auth endpoints
8. Monitor failed login attempts
9. Use strong, unique secrets (min 32 characters)
10. Keep Azure client secrets secure and don't share them

---

## 📚 Additional Resources

- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Passport Microsoft Strategy](https://github.com/seanfisher/passport-microsoft)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OAuth 2.0 Specification](https://oauth.net/2/)

---

## ✅ Checklist

- [ ] Created Azure App Registration
- [ ] Copied Client ID to `MICROSOFT_CLIENT_ID`
- [ ] Created and copied Client Secret to `MICROSOFT_CLIENT_SECRET`
- [ ] Added redirect URIs in Azure
- [ ] Configured API permissions (`User.Read`)
- [ ] Generated strong `JWT_SECRET` (32+ chars)
- [ ] Generated strong `SESSION_SECRET` (32+ chars)
- [ ] Set `FRONTEND_URL` to frontend domain
- [ ] Set `VITE_API_URL` to backend domain
- [ ] Added `.env` to `.gitignore`
- [ ] Tested login flow end-to-end
- [ ] Verified no duplicate user creation for same email

---

**Last Updated**: January 20, 2026  
**Maintained By**: Smart-Student-Hub Development Team
