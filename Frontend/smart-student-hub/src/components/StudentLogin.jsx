import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const Login3DScene = lazy(() => import('./Login3DScene'));

const StudentLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle OAuth callback with token
  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    
    if (token && userStr) {
      console.log('🔐 OAuth callback detected');
      console.log('Token:', token.substring(0, 20) + '...');
      console.log('User data:', userStr);
      
      // Set loading state while processing OAuth callback
      setIsLoading(true);
      
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        console.log('✅ Parsed user:', user);
        
        // Store in both localStorage and sessionStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('studentData', JSON.stringify(user));
        sessionStorage.setItem('authToken', token);
        console.log('💾 Stored in localStorage and sessionStorage');
        
        // Update app state
        console.log('📢 Calling onLogin...');
        onLogin(user);
        
        // Force page reload to dashboard - this ensures App.jsx loads user from storage
        console.log('🔄 Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('❌ Error processing OAuth callback:', error);
        setMessage('Authentication successful, but failed to process user data');
        setIsLoading(false);
      }
    }

    // Handle error from OAuth
    const error = searchParams.get('error');
    if (error) {
      const errorMessages = {
        'microsoft_auth_failed': 'Microsoft authentication failed. Please try again.',
        'no_user': 'Failed to create user account. Please try again.',
        'callback_error': 'An error occurred during authentication. Please try again.'
      };
      setMessage(`Error: ${errorMessages[error] || 'Authentication failed'}`);
    }
  }, [searchParams, onLogin, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/api/login', formData);
      setMessage(`Success: ${response.data.message}`);
      onLogin(response.data);
      navigate('/dashboard');
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || 'Login failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Microsoft OAuth login
  const handleMicrosoftLogin = () => {
    setIsLoading(true);
    // Redirect to backend Microsoft OAuth endpoint
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${backendUrl}/auth/microsoft`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 flex items-stretch relative overflow-hidden">

      {/* Loading overlay for OAuth processing */}
      {isLoading && searchParams.get('token') && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800/90 border border-white/10 p-10 rounded-3xl shadow-2xl text-center backdrop-blur-xl"
          >
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-900"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin"></div>
            </div>
            <p className="text-lg font-semibold text-white">Completing sign in...</p>
            <p className="text-sm text-gray-400 mt-2">Please wait</p>
          </motion.div>
        </div>
      )}

      {/* ─── Left side: Login card ─── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-10 relative z-10">
        {/* Soft glow behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative z-10 bg-white/[0.06] backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/10"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </motion.div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-1">Smart Student Hub</h1>
            <h2 className="text-lg font-semibold text-gray-300">Student Login</h2>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-5 p-3 rounded-xl text-sm font-medium ${message.startsWith('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}
            >
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 placeholder-gray-500 text-sm text-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 placeholder-gray-500 text-sm text-white"
                placeholder="Enter your password"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-ripple bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : 'Login'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-900/80 text-gray-500 rounded-full backdrop-blur-sm">Or continue with</span>
            </div>
          </div>

          {/* Microsoft/Outlook Login Button */}
          <motion.button
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 bg-white/[0.06] border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.1] text-gray-300 py-3 px-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
              <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
            </svg>
            <span>{isLoading ? 'Redirecting...' : 'Login with Outlook'}</span>
          </motion.button>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/register')}
              className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-200"
            >
              Don't have an account? Register here
            </button>
          </div>

          <div className="mt-3 text-center">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-200"
            >
              ← Back to Home
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─── Right side: 3D scene ─── */}
      <div className="hidden lg:flex lg:w-[52%] items-center justify-center relative">
        {/* Soft glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-indigo-600/15 rounded-full blur-[100px]" />
        </div>
        <div className="w-full h-full">
          <Suspense fallback={null}>
            <Login3DScene />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;