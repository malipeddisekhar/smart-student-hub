# 🚀 Microsoft OAuth - Pre-Launch Checklist

Use this checklist before deploying Microsoft OAuth authentication to production.

---

## ✅ Azure Configuration

### App Registration
- [ ] Azure App Registration created
- [ ] Application (client) ID copied to `.env`
- [ ] Client secret created and copied to `.env`
- [ ] Client secret expiration date noted (set reminder to rotate)

### Redirect URIs
- [ ] Development URI added: `http://localhost:3000/auth/microsoft/callback`
- [ ] Production URI added: `https://your-domain.com/auth/microsoft/callback`
- [ ] Redirect URIs saved in Azure portal

### API Permissions
- [ ] `User.Read` permission added
- [ ] `email` permission added (optional)
- [ ] `openid` permission added (optional)
- [ ] `profile` permission added (optional)
- [ ] Admin consent granted (if required by organization)

### Security
- [ ] Token configuration reviewed
- [ ] Access token lifetime set appropriately
- [ ] Refresh token rotation enabled (recommended)

---

## ✅ Backend Configuration

### Environment Variables
- [ ] `MICROSOFT_CLIENT_ID` set correctly
- [ ] `MICROSOFT_CLIENT_SECRET` set correctly
- [ ] `MICROSOFT_CALLBACK_URL` matches Azure redirect URI exactly
- [ ] `JWT_SECRET` generated (min 32 characters)
- [ ] `SESSION_SECRET` generated (min 32 characters, different from JWT_SECRET)
- [ ] `FRONTEND_URL` set to production frontend domain
- [ ] `MONGODB_URI` points to production database
- [ ] `NODE_ENV` set to `production`
- [ ] All secrets different from development

### Dependencies
- [ ] `passport` installed
- [ ] `passport-microsoft` installed
- [ ] `jsonwebtoken` installed
- [ ] `express-session` installed
- [ ] `cookie-parser` installed
- [ ] `npm install` run successfully
- [ ] No vulnerability warnings (or addressed)

### Code Files
- [ ] `Backend/config/passport.js` exists
- [ ] `Backend/routes/auth.js` exists
- [ ] `Backend/models/Student.js` updated with microsoftId, isVerified, authProvider
- [ ] `Backend/app.js` includes session middleware
- [ ] `Backend/app.js` includes passport initialization
- [ ] `Backend/app.js` mounts auth routes at `/auth`
- [ ] No syntax errors in any file

### Security Settings
- [ ] CORS configured for production frontend domain
- [ ] Session cookies set to `secure: true` in production
- [ ] Session cookies set to `httpOnly: true`
- [ ] Session cookies set to `sameSite: 'strict'`
- [ ] Rate limiting implemented (recommended)
- [ ] HTTPS enabled (required for production)

---

## ✅ Database Configuration

### Indexes
- [ ] Email unique index exists: `db.students.createIndex({ email: 1 }, { unique: true })`
- [ ] MicrosoftId sparse unique index exists: `db.students.createIndex({ microsoftId: 1 }, { unique: true, sparse: true })`
- [ ] Indexes verified: `db.students.getIndexes()`

### Schema
- [ ] `email` field is unique
- [ ] `password` field is optional (required: false)
- [ ] `microsoftId` field added (sparse: true, unique: true)
- [ ] `isVerified` field added (default: false)
- [ ] `authProvider` field added (enum: ['local', 'microsoft', 'google'])

### Data Migration
- [ ] Existing users unaffected by schema changes
- [ ] Test account created via OAuth
- [ ] Test account can login repeatedly
- [ ] No duplicate accounts created for same email
- [ ] Database backup created before deployment

---

## ✅ Frontend Configuration

### Environment Variables
- [ ] `VITE_API_URL` points to production backend
- [ ] No hardcoded URLs in code
- [ ] Environment variables loaded correctly

### Components
- [ ] `StudentLogin.jsx` updated with Microsoft OAuth
- [ ] `TeacherLogin.jsx` updated with Microsoft OAuth
- [ ] `AdminLogin.jsx` updated with Microsoft OAuth
- [ ] Google Sign-In removed from all components
- [ ] OAuth callback handler implemented in all login components
- [ ] Loading states working correctly
- [ ] Error handling implemented

### Build
- [ ] `npm run build` succeeds
- [ ] No build errors or warnings
- [ ] Build output tested locally
- [ ] All assets load correctly

### UI/UX
- [ ] Microsoft button displays correctly
- [ ] Microsoft logo (4-color squares) visible
- [ ] Button label: "Login with Outlook"
- [ ] Loading state shows "Redirecting..."
- [ ] Button disabled during authentication
- [ ] Responsive on mobile devices
- [ ] Accessible (keyboard navigation, screen readers)

---

## ✅ Testing

### Development Testing
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access login page
- [ ] "Login with Outlook" button visible
- [ ] Click button redirects to Microsoft login
- [ ] Can authenticate with Microsoft account
- [ ] Redirected back to frontend after auth
- [ ] Token stored in localStorage
- [ ] User data displayed correctly
- [ ] Dashboard accessible after login

### Authentication Flow
- [ ] First-time login creates new user
- [ ] Second login with same email returns same account
- [ ] No duplicate users created
- [ ] MicrosoftId stored correctly
- [ ] `isVerified` set to true
- [ ] `authProvider` set to 'microsoft'
- [ ] JWT token generated correctly
- [ ] Token contains correct user data

### Edge Cases
- [ ] Same email from different devices → same account
- [ ] Existing local auth user can add Microsoft OAuth
- [ ] User can login with both email/password and Microsoft OAuth
- [ ] Email remains unique across all auth methods
- [ ] MicrosoftId changes handled correctly (email wins)
- [ ] Invalid token rejected
- [ ] Expired token rejected
- [ ] Missing email from Microsoft handled gracefully

### Error Handling
- [ ] Failed authentication redirects to login with error
- [ ] Network errors handled gracefully
- [ ] Invalid redirect URI shows clear error
- [ ] Invalid client secret shows clear error
- [ ] Missing email from Microsoft shows error
- [ ] Database errors caught and logged

### Security Testing
- [ ] JWT tokens expire correctly (7 days)
- [ ] Expired tokens cannot access protected routes
- [ ] CSRF protection working (sameSite cookies)
- [ ] XSS protection in place
- [ ] SQL injection not possible (using Mongoose)
- [ ] No sensitive data in frontend logs
- [ ] No secrets in frontend code

---

## ✅ Production Deployment

### Pre-Deployment
- [ ] All environment variables set in production
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Team notified of deployment

### Backend Deployment
- [ ] Code pushed to production branch
- [ ] Dependencies installed on server
- [ ] Environment variables loaded
- [ ] Server restarted
- [ ] Health check passed
- [ ] Logs show no errors

### Frontend Deployment
- [ ] Built with production settings
- [ ] Deployed to hosting platform
- [ ] HTTPS enabled
- [ ] CDN configured (if applicable)
- [ ] Cache invalidated

### Post-Deployment
- [ ] Production login page accessible
- [ ] Microsoft OAuth flow works end-to-end
- [ ] Test account can login
- [ ] User data persists correctly
- [ ] No duplicate accounts created
- [ ] Logs monitored for errors

---

## ✅ Monitoring & Maintenance

### Monitoring
- [ ] Error logging configured (Sentry, LogRocket, etc.)
- [ ] Performance monitoring enabled (New Relic, DataDog, etc.)
- [ ] Login success/failure metrics tracked
- [ ] Database query performance monitored
- [ ] API response times monitored

### Alerts
- [ ] Alert for failed logins (threshold: 10+/hour)
- [ ] Alert for database errors
- [ ] Alert for high API latency
- [ ] Alert for expired client secret (30 days before)

### Documentation
- [ ] Deployment process documented
- [ ] Rollback process documented
- [ ] Troubleshooting guide created
- [ ] Team trained on new authentication flow

---

## ✅ User Communication

### Before Launch
- [ ] Users notified of new login option
- [ ] Benefits explained (faster login, no password needed)
- [ ] Migration path explained (existing accounts unaffected)

### After Launch
- [ ] Support team briefed on new feature
- [ ] FAQ updated with Microsoft OAuth info
- [ ] Help documentation updated
- [ ] Feedback mechanism in place

---

## ✅ Compliance & Legal

### Privacy
- [ ] Privacy policy updated (OAuth data usage)
- [ ] Terms of service updated (if needed)
- [ ] Data retention policy defined
- [ ] GDPR compliance verified (if applicable)
- [ ] User consent obtained for data processing

### Security
- [ ] Security audit completed
- [ ] Penetration testing done (recommended)
- [ ] Compliance requirements met (FERPA, COPPA, etc.)
- [ ] Incident response plan updated

---

## 🚨 Critical Checklist (Must Complete)

These items are **CRITICAL** and must be completed before production launch:

1. ✅ Azure redirect URI matches production URL exactly
2. ✅ JWT_SECRET and SESSION_SECRET are strong (32+ chars) and unique
3. ✅ HTTPS enabled in production
4. ✅ Email unique index exists in database
5. ✅ CORS configured for production frontend domain
6. ✅ Environment variables set in production (not hardcoded)
7. ✅ Client secret not exposed in frontend code
8. ✅ Database backup created
9. ✅ End-to-end testing completed successfully
10. ✅ Rollback plan documented

---

## 📊 Success Metrics

Track these metrics after launch:

- [ ] OAuth login success rate (target: >95%)
- [ ] OAuth login failure rate (target: <5%)
- [ ] Average login time (target: <3 seconds)
- [ ] Duplicate account creation rate (target: 0%)
- [ ] User adoption rate (target: >50% within 1 month)

---

## 🎯 Go/No-Go Decision

**Can you answer YES to all critical items?**

- [ ] YES - All critical items complete → ✅ **DEPLOY**
- [ ] NO - Some critical items incomplete → ❌ **DO NOT DEPLOY**

---

## 📞 Emergency Contacts

**If something goes wrong:**

1. **Check logs**: Backend and frontend error logs
2. **Rollback**: Revert to previous version
3. **Contact**: [Your team's emergency contact info]
4. **Escalate**: [Your escalation path]

---

## ✅ Final Sign-Off

**Deployment Approved By:**

- [ ] Developer: _________________ Date: _______
- [ ] Tech Lead: _________________ Date: _______
- [ ] Security: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______

---

**Checklist Version**: 1.0  
**Last Updated**: January 20, 2026  
**Next Review**: Before next major release
