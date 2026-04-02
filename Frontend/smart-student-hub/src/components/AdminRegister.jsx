import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminRegister = ({ onRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: 'gmrit',
    department: '',
    role: 'Super Admin',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);

  // Fetch colleges and departments from database
  useEffect(() => {
    const fetchCollegesAndDepartments = async () => {
      try {
        setLoadingColleges(true);
        // Fetch all students and teachers to get available colleges/departments
        const [studentsRes, teachersRes] = await Promise.all([
          api.get('/api/admin/students'),
          api.get('/api/admin/teachers')
        ]);

        const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        const teachers = Array.isArray(teachersRes.data) ? teachersRes.data : [];

        // Only gmrit
        setColleges(['gmrit']);

        // Extract unique departments (uppercase, deduplicate by uppercase version)
        const deptMap = new Map();
        students.forEach(s => {
          if (s.department) {
            const upperDept = String(s.department).trim().toUpperCase();
            if (!deptMap.has(upperDept)) {
              deptMap.set(upperDept, upperDept);
            }
          }
        });
        teachers.forEach(t => {
          if (t.department) {
            const upperDept = String(t.department).trim().toUpperCase();
            if (!deptMap.has(upperDept)) {
              deptMap.set(upperDept, upperDept);
            }
          }
        });

        setDepartments(Array.from(deptMap.values()).sort());
        setLoadingColleges(false);
      } catch (err) {
        console.error('Error fetching colleges/departments:', err);
        setLoadingColleges(false);
      }
    };

    fetchCollegesAndDepartments();
  }, []);

  const filteredDepartments = formData.institution ? departments : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'institution') {
      // Reset department when institution changes
      setFormData({
        ...formData,
        [name]: value,
        department: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        institution: formData.institution,
        department: formData.department,
        role: formData.role,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };
      console.log('Submitting admin registration:', payload);
      const response = await api.post('/api/admin/register', payload);
      console.log('Registration response:', response.data);
      onRegister(response.data);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center py-4 px-3 sm:py-8 sm:px-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-5 sm:p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Admin Registration
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Create administrative account</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institution
            </label>
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 text-gray-900 font-semibold">
              gmrit
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">-- Select Department --</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Login here
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;