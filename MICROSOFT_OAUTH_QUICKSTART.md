# 🚀 Microsoft OAuth Quick Start Guide

Get Microsoft (Outlook) authentication running in 5 minutes!

## ⚡ Prerequisites

- Node.js installed
- MongoDB running
- Azure account (free tier works)

---

## 🎯 Step 1: Azure Setup (2 minutes)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
3. Fill in:
   - **Name**: Smart-Student-Hub
   - **Account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: Web → `http://localhost:3000/auth/microsoft/callback`
4. Click **Register**
5. Copy **Application (client) ID** ✅
6. Go to **Certificates & secrets** → **New client secret**
7. Copy the **Value** immediately ✅
8. Go to **API permissions** → **Add permission** → **Microsoft Graph** → **Delegated**
9. Add `User.Read` permission

---

## 🔧 Step 2: Backend Setup (1 minute)

1. **Create `.env` file** in `Backend/` folder:

```bash
cd Backend
```

Create `.env`:
```env
MICROSOFT_CLIENT_ID=<paste-your-client-id-here>
MICROSOFT_CLIENT_SECRET=<paste-your-client-secret-here>
MICROSOFT_CALLBACK_URL=http://localhost:3000/auth/microsoft/callback

JWT_SECRET=your-random-secret-min-32-chars-generate-using-crypto
SESSION_SECRET=different-random-secret-also-min-32-chars

FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/smart-student-hub
PORT=3000
```

2. **Generate secrets** (run in terminal):
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

3. **Install and start**:
```bash
npm install
npm start
```

✅ Backend should be running on `http://localhost:3000`

---

## 🎨 Step 3: Frontend Setup (1 minute)

1. **Create `.env` file** in `Frontend/smart-student-hub/` folder:

```bash
cd Frontend/smart-student-hub
```

Create `.env`:
```env
VITE_API_URL=http://localhost:3000
```

2. **Install and start**:
```bash
npm install
npm run dev
```

✅ Frontend should be running on `http://localhost:5173`

---

## 🧪 Step 4: Test It! (1 minute)

1. Open browser: `http://localhost:5173/login`
2. Click **"Login with Outlook"** button
3. Sign in with your Microsoft/Outlook account
4. You should be redirected to dashboard!

---

## ✅ Verification Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can click "Login with Outlook" button
- [ ] Redirected to Microsoft login page
- [ ] After login, redirected to dashboard
- [ ] User data appears in MongoDB
- [ ] Second login with same email returns same account

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Redirect URI mismatch" | Check `MICROSOFT_CALLBACK_URL` matches Azure exactly |
| "Invalid client secret" | Copy secret value again from Azure |
| Backend won't start | Check MongoDB is running |
| Frontend shows error | Verify `VITE_API_URL` is correct |
| No email returned | Check Azure permissions include `User.Read` |

---

## 📖 Next Steps

- [ ] Read [MICROSOFT_OAUTH_SETUP.md](MICROSOFT_OAUTH_SETUP.md) for detailed setup
- [ ] Read [MICROSOFT_OAUTH_IMPLEMENTATION.md](MICROSOFT_OAUTH_IMPLEMENTATION.md) for architecture
- [ ] Update user profile completion flow
- [ ] Add role-based access control
- [ ] Configure production environment

---

## 🎉 You're Done!

Your app now supports Microsoft OAuth authentication with:
- ✅ No duplicate user accounts
- ✅ Email-based user identification
- ✅ Secure JWT sessions
- ✅ Professional UI

**Need help?** Check the detailed guides in the documentation folder.

---

**Quick Start Version**: 1.0  
**Last Updated**: January 20, 2026
