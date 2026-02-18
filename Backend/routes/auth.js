const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

/**
 * Microsoft OAuth Authentication Routes
 * 
 * Flow:
 * 1. User clicks "Login with Outlook" → GET /auth/microsoft
 * 2. Passport redirects to Microsoft login page
 * 3. User authenticates with Microsoft
 * 4. Microsoft redirects back → GET /auth/microsoft/callback
 * 5. Passport verifies and creates/updates user
 * 6. Generate JWT token
 * 7. Redirect to frontend dashboard with token
 */

/**
 * @route   GET /auth/microsoft
 * @desc    Initiate Microsoft OAuth flow
 * @access  Public
 */
router.get('/microsoft',
  passport.authenticate('microsoft', {
    prompt: 'select_account' // Force account selection for better UX
  })
);

/**
 * @route   GET /auth/microsoft/callback
 * @desc    Handle Microsoft OAuth callback
 * @access  Public
 * 
 * This endpoint is called by Microsoft after user authentication
 * - On success: Generate JWT and redirect to dashboard
 * - On failure: Redirect to login with error message
 */
// Compute frontend base URL for redirects
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

router.get('/microsoft/callback',
  passport.authenticate('microsoft', {
    failureRedirect: `${frontendUrl}/login?error=unregistered`,
    session: false // We use JWT, not sessions
  }),
  async (req, res) => {
    try {
      // User authenticated successfully
      const user = req.user;

      if (!user) {
        console.error('❌ No user object after Microsoft authentication');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_user`);
      }

      console.log(`✅ User authenticated: ${user.email}`);

      // =====================================================
      // Generate JWT Token for session management
      // =====================================================
      const token = jwt.sign(
        {
          userId: user._id,
          studentId: user.studentId,
          email: user.email,
          name: user.name,
          authProvider: 'microsoft'
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        { expiresIn: '7d' } // Token valid for 7 days
      );

      // =====================================================
      // Redirect to frontend login page with token
      // StudentLogin component will process the token and navigate to dashboard
      // =====================================================
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}/student-login?token=${token}&user=${encodeURIComponent(JSON.stringify({
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        provider: 'microsoft'
      }))}`;

      console.log(`🔄 Redirecting to: ${redirectUrl.substring(0, 100)}...`);
      res.redirect(redirectUrl);

    } catch (error) {
      console.error('❌ Error in Microsoft callback:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=callback_error`);
    }
  }
);

/**
 * @route   GET /auth/logout
 * @desc    Logout user (clear session if using session-based auth)
 * @access  Public
 */
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login`);
  });
});

/**
 * @route   GET /auth/verify
 * @desc    Verify JWT token and return user data
 * @access  Protected
 * 
 * Used by frontend to verify token validity and get user data
 */
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
    );

    // Token is valid, return user data
    res.json({
      success: true,
      user: {
        userId: decoded.userId,
        studentId: decoded.studentId,
        email: decoded.email,
        name: decoded.name,
        authProvider: decoded.authProvider
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
