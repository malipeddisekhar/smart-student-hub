import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      {/* Loading overlay for OAuth processing */}
      {isLoading && searchParams.get('token') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800">Completing sign in...</p>
            <p className="text-sm text-gray-600 mt-2">Please wait</p>
          </div>
        </div>
      )}
      
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600 mb-2">Smart Student Hub</h1>
          <h2 className="text-xl font-semibold text-gray-900">Student Login</h2>
        </div>

        {message && <div className="mb-4 p-2 bg-blue-100 rounded">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Microsoft/Outlook Login Button */}
        <button
          onClick={handleMicrosoftLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          <span>{isLoading ? 'Redirecting...' : 'Login with Outlook'}</span>
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Don't have an account? Register here
          </button>
        </div>

        <div className="mt-4 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;