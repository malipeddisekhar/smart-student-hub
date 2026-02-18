const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const Student = require('../models/Student');

/**
 * Passport Microsoft OAuth 2.0 Configuration
 * 
 * This module configures Microsoft authentication using OAuth 2.0
 * Ensures email-based user identification (no duplicate accounts for same email)
 */

module.exports = function(app) {
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize user for session storage
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Student.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  /**
   * Microsoft OAuth Strategy Configuration
   * 
   * Flow:
   * 1. User clicks "Login with Outlook"
   * 2. Redirected to Microsoft login
   * 3. After successful authentication, Microsoft returns to callback URL
   * 4. We receive: accessToken, refreshToken, profile
   * 5. Extract email, displayName, microsoftId from profile
   * 6. Check if user exists by EMAIL (single source of truth)
   * 7. If exists: update microsoftId, log in
   * 8. If not exists: create new user with role='student', isVerified=true
   */
  passport.use(new MicrosoftStrategy({
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3000/auth/microsoft/callback',
      scope: ['user.read'] // Minimum scope needed for email and profile
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔐 Microsoft OAuth - Profile received:', {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value
        });

        // Extract user details from Microsoft profile
        const email = profile.emails?.[0]?.value;
        const displayName = profile.displayName || 'Microsoft User';
        const microsoftId = profile.id;

        // Validation: Email is required
        if (!email) {
          return done(new Error('No email provided by Microsoft'), null);
        }

        // =====================================================
        // CRITICAL: Email is the single source of truth
        // Perform a case-insensitive lookup for the email to match DB entries
        // =====================================================
        const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const emailRegex = new RegExp('^' + escapeRegExp(email) + '$', 'i');
        let user = await Student.findOne({ email: emailRegex });

        if (user) {
          // ✅ User exists - Update microsoftId if missing and log in
          console.log(`✅ Existing user found: ${email}`);
          
          // Update Microsoft ID if it's not already set or has changed
          if (!user.microsoftId || user.microsoftId !== microsoftId) {
            user.microsoftId = microsoftId;
            user.authProvider = 'microsoft';
            user.isVerified = true;
            await user.save();
            console.log(`🔄 Updated microsoftId for user: ${email}`);
          }

          return done(null, user);
        }

        // =====================================================
        // User does NOT exist - IMPORTANT: Do NOT create new accounts via OAuth
        // Reject the login and log the attempt for auditing
        // =====================================================
        console.warn(`🚫 Microsoft OAuth login rejected (not pre-registered): ${email}`);
        // Append to rejected log file for auditing
        try {
          const fs = require('fs');
          const logDir = __dirname + '/../logs';
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
          const logLine = `${new Date().toISOString()} - REJECTED_OAUTH - email=${email} microsoftId=${microsoftId} profileId=${profile.id}\n`;
          fs.appendFileSync(logDir + '/rejected_oauth.log', logLine);
        } catch (e) {
          console.error('Failed to write rejected oauth log:', e.message);
        }

        // Return 'no user' so Passport will treat this as authentication failure
        return done(null, false, { message: 'unregistered' });

      } catch (error) {
        console.error('❌ Microsoft OAuth Error:', error);
        return done(error, null);
      }
    }
  ));
};
