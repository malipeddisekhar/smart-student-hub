import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const AdminLogin3DScene = lazy(() => import('./AdminLogin3DScene'));

const AdminLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle OAuth callback with token
  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        onLogin(user);
        navigate('/admin/dashboard', { replace: true });
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        setError('Authentication successful, but failed to process user data');
      }
    }

    const errParam = searchParams.get('error');
    if (errParam) {
      setError('Microsoft authentication failed. Please try again.');
    }
  }, [searchParams, onLogin, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/api/admin/login', formData);
      onLogin(response.data);
      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Microsoft OAuth login
  const handleMicrosoftLogin = () => {
    setIsLoading(true);
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/auth/microsoft`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-purple-950 flex items-stretch relative overflow-hidden">

      {/* Loading overlay for OAuth processing */}
      {isLoading && searchParams.get('token') && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800/90 border border-white/10 p-10 rounded-3xl shadow-2xl text-center backdrop-blur-xl"
          >
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-purple-900"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin"></div>
            </div>
            <p className="text-lg font-semibold text-white">Completing sign in...</p>
            <p className="text-sm text-gray-400 mt-2">Please wait</p>
          </motion.div>
        </div>
      )}

      {/* ─── Left side: Login card ─── */}
      <div className="w-full lg:w-[58%] flex items-center justify-center p-6 sm:p-10 relative z-10">
        {/* Soft glow behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

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
              className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">Smart Student Hub</h1>
            <h2 className="text-lg font-semibold text-gray-300">Admin Login</h2>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 placeholder-gray-500 text-sm text-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 placeholder-gray-500 text-sm text-white"
                placeholder="Enter your password"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-ripple bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40"
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
            className="w-full flex items-center justify-center gap-3 bg-white/[0.06] border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.1] text-gray-300 py-3 px-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
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
              onClick={() => navigate('/admin/register')}
              className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors duration-200"
            >
              Need admin access? Register here
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
      <div className="hidden lg:flex lg:w-[42%] items-center justify-center relative">
        {/* Soft glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-purple-600/15 rounded-full blur-[100px]" />
        </div>
        <div className="w-full h-full">
          <Suspense fallback={null}>
            <AdminLogin3DScene />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;