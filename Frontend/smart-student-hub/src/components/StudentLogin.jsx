import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StudentLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/login', formData);
      setMessage(`Success: ${response.data.message}`);
      onLogin(response.data);
      navigate('/dashboard');
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || 'Login failed'}`);
    }
  };

  // Google Sign-In
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const loadScript = () => {
      if (document.getElementById('google-client-script')) return Promise.resolve();
      return new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = 'https://accounts.google.com/gsi/client';
        s.id = 'google-client-script';
        s.async = true;
        s.defer = true;
        s.onload = resolve;
        document.body.appendChild(s);
      });
    };

    const parseJwt = (token) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    };

    loadScript().then(() => {
      /* global google */
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (resp) => {
            const payload = parseJwt(resp.credential);
            if (payload) {
              const user = {
                studentId: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                provider: 'google'
              };
              onLogin(user);
              navigate('/dashboard');
            }
          }
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInDivStudent'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      }
    });
  }, [onLogin, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="mt-6">
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <div id="googleSignInDivStudent" className="flex justify-center"></div>
          ) : (
            <div className="text-sm text-gray-500">Set VITE_GOOGLE_CLIENT_ID in your .env to enable Google Sign-In</div>
          )}
        </div>

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