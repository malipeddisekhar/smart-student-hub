import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const AdminDashboard = ({ adminData, onLogout }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [groupForm, setGroupForm] = useState({ name: '', teacher: '', students: [] });
  const [editingGroup, setEditingGroup] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', teacher: '', students: [] });
  const [dark, setDark] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin-dark-mode')) ?? true; } catch { return true; }
  });
  useEffect(() => { localStorage.setItem('admin-dark-mode', JSON.stringify(dark)); }, [dark]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, teachersRes, collegesRes] = await Promise.all([
        api.get('/api/admin/students'),
        api.get('/api/admin/teachers'),
        api.get('/api/colleges')
      ]);
      console.log('Admin data:', adminData);
      console.log('All students:', studentsRes.data);
      console.log('All teachers:', teachersRes.data);
      
      const filteredStudents = studentsRes.data.filter(student => {
        console.log('Student:', student.name, 'College:', student.college, 'Dept:', student.department);
        return student.college === adminData.institution && student.department === adminData.department;
      });
      const filteredTeachers = teachersRes.data.filter(teacher => {
        console.log('Teacher:', teacher.name, 'College:', teacher.college, 'Dept:', teacher.department);
        return teacher.college === adminData.institution && teacher.department === adminData.department;
      });
      
      console.log('Filtered students:', filteredStudents);
      console.log('Filtered teachers:', filteredTeachers);
      
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
      setColleges(collegesRes.data);
      
      const groupsRes = await api.get(`/api/groups/${adminData.adminId}`);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      {/* Modern Navigation */}
      <nav className={`backdrop-blur-xl border-b shadow-lg sticky top-0 z-40 transition-colors duration-300 ${dark ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-white/20'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your institution</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl ${dark ? 'bg-white/10' : 'bg-gradient-to-r from-indigo-50 to-purple-50'}`}>
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{adminData?.name?.charAt(0)}</span>
                </div>
                <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Welcome, {adminData?.name}</span>
              </div>
              {/* Dark mode toggle */}
              <button
                onClick={() => setDark(d => !d)}
                className={`p-2 rounded-xl transition-all duration-200 ${dark ? 'bg-white/10 hover:bg-white/20 text-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                title={dark ? 'Light mode' : 'Dark mode'}
              >
                {dark ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
                )}
              </button>
              <button 
                onClick={onLogout} 
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className={`backdrop-blur-xl rounded-2xl p-6 border shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${dark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/20'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{students.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className={`backdrop-blur-xl rounded-2xl p-6 border shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${dark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/20'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Total Teachers</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{teachers.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className={`backdrop-blur-xl rounded-2xl p-6 border shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${dark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/20'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Active Groups</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{groups.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className={`backdrop-blur-xl rounded-2xl p-6 border shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${dark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/20'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>System Status</p>
                <p className="text-lg font-bold text-green-500">Online</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Modern Tab Navigation */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className={`backdrop-blur-xl rounded-2xl shadow-xl border overflow-hidden transition-colors duration-300 ${dark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/20'}`}>
          <div className={`border-b ${dark ? 'border-white/10' : 'border-gray-200/50'}`}>
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Personal Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { key: 'students', label: 'Students', icon: 'M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z' },
                { key: 'teachers', label: 'Faculty', icon: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' },
                { key: 'groups', label: 'Groups', icon: 'M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.key 
                      ? 'border-indigo-500 text-indigo-400' 
                      : dark ? 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d={tab.icon} clipRule="evenodd"/>
                  </svg>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'overview' && (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-white">{adminData?.name?.charAt(0)}</span>
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Admin Profile
                  </h3>
                  <p className={`${dark ? 'text-gray-400' : 'text-gray-600'}`}>Manage your administrative account</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-2xl border ${dark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'}`}>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h4 className={`text-lg font-semibold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Full Name</h4>
                    </div>
                    <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{adminData?.name}</p>
                  </div>
                  
                  <div className={`p-6 rounded-2xl border ${dark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100'}`}>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h4 className={`text-lg font-semibold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Admin ID</h4>
                    </div>
                    <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{adminData?.adminId}</p>
                  </div>
                  
                  <div className={`p-6 rounded-2xl border ${dark ? 'bg-green-500/10 border-green-500/20' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'}`}>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                        </svg>
                      </div>
                      <h4 className={`text-lg font-semibold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Institution</h4>
                    </div>
                    <p className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{adminData?.institution || 'Not specified'}</p>
                  </div>
                  
                  <div className={`p-6 rounded-2xl border ${dark ? 'bg-orange-500/10 border-orange-500/20' : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-100'}`}>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h4 className={`text-lg font-semibold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Department</h4>
                    </div>
                    <p className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{adminData?.department || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}



          {activeTab === 'students' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Student Management</h3>
                  <p className={`mt-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Manage and view all registered students</p>
                </div>
                <div className={`px-4 py-2 rounded-xl ${dark ? 'bg-blue-500/10' : 'bg-gradient-to-r from-blue-50 to-cyan-50'}`}>
                  <span className={`text-sm font-medium ${dark ? 'text-blue-400' : 'text-blue-700'}`}>{students.length} Total Students</span>
                </div>
              </div>
              
              <div className={`backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden ${dark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/20'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${dark ? 'bg-white/5' : 'bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Student ID</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Name</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Email</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Department</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>College</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${dark ? 'divide-white/10' : 'divide-gray-200'}`}>
                      {students.map((student, index) => (
                        <tr key={student._id} className={`transition-colors duration-200 ${dark ? (index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent') + ' hover:bg-white/5' : (index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30') + ' hover:bg-blue-50/50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white text-xs font-bold">{student.name?.charAt(0)}</span>
                              </div>
                              <span className={`text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{student.studentId}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{student.name}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{student.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${dark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                              {student.department}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{student.college}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Faculty Management</h3>
                  <p className={`mt-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Manage and view all faculty members</p>
                </div>
                <div className={`px-4 py-2 rounded-xl ${dark ? 'bg-green-500/10' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
                  <span className={`text-sm font-medium ${dark ? 'text-green-400' : 'text-green-700'}`}>{teachers.length} Total Faculty</span>
                </div>
              </div>
              
              <div className={`backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden ${dark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/20'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${dark ? 'bg-white/5' : 'bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Teacher ID</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Name</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Email</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Department</th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Designation</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${dark ? 'divide-white/10' : 'divide-gray-200'}`}>
                      {teachers.map((teacher, index) => (
                        <tr key={teacher._id} className={`transition-colors duration-200 ${dark ? (index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent') + ' hover:bg-white/5' : (index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30') + ' hover:bg-green-50/50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white text-xs font-bold">{teacher.name?.charAt(0)}</span>
                              </div>
                              <span className={`text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{teacher.teacherId}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>{teacher.name}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{teacher.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${dark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800'}`}>
                              {teacher.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${dark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>
                              {teacher.designation}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Group Management</h3>
                <p className={`mt-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Create and manage student groups</p>
              </div>
              
              <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 mb-8 ${dark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/20'}`}>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
                    </svg>
                  </div>
                  <h4 className={`text-xl font-bold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Create New Group</h4>
                </div>
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    console.log('Admin data:', adminData);
                    const groupData = {
                      name: groupForm.name,
                      college: adminData.institution || 'Test College',
                      department: adminData.department || 'Test Department',
                      teacher: groupForm.teacher,
                      students: groupForm.students,
                      createdBy: adminData.adminId
                    };
                    console.log('Creating group:', groupData);
                    const response = await api.post('/api/groups', groupData);
                    console.log('Group created:', response.data);
                    setGroupForm({ name: '', teacher: '', students: [] });
                    fetchData();
                  } catch (error) {
                    console.error('Group creation error:', error);
                    alert('Error creating group: ' + (error.response?.data?.error || error.message));
                  }
                }} className="space-y-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Group Name</label>
                    <input
                      type="text"
                      placeholder="Enter group name"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white/50 border-gray-200 text-gray-900'}`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Assign Teacher</label>
                    <select
                      value={groupForm.teacher}
                      onChange={(e) => setGroupForm({...groupForm, teacher: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/50 border-gray-200 text-gray-900'}`}
                      required
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.teacherId} value={teacher.teacherId}>
                          {teacher.name} ({teacher.teacherId})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Select Students</label>
                    <div className={`max-h-48 overflow-y-auto backdrop-blur-sm border rounded-xl p-4 ${dark ? 'bg-white/5 border-white/10' : 'bg-gray-50/50 border-gray-200'}`}>
                      <div className="space-y-2">
                        {students.map((student) => (
                          <label key={student.studentId} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 cursor-pointer ${dark ? 'hover:bg-white/5' : 'hover:bg-white/50'}`}>
                            <input
                              type="checkbox"
                              checked={groupForm.students.includes(student.studentId)}
                              onChange={() => {
                                const studentId = student.studentId;
                                setGroupForm(prev => ({
                                  ...prev,
                                  students: prev.students.includes(studentId)
                                    ? prev.students.filter(id => id !== studentId)
                                    : [...prev.students, studentId]
                                }));
                              }}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{student.name?.charAt(0)}</span>
                            </div>
                            <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{student.name} ({student.studentId})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    Create Group
                  </button>
                </form>
              </div>
              
              <div className={`backdrop-blur-sm rounded-2xl shadow-xl border p-6 ${dark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-white/20'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                      </svg>
                    </div>
                    <h4 className={`text-xl font-bold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Existing Groups</h4>
                  </div>
                  <div className={`px-4 py-2 rounded-xl ${dark ? 'bg-purple-500/10' : 'bg-gradient-to-r from-purple-50 to-pink-50'}`}>
                    <span className={`text-sm font-medium ${dark ? 'text-purple-400' : 'text-purple-700'}`}>{groups.length} Groups</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {groups.map((group) => (
                    <div key={group._id} className={`backdrop-blur-sm border rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${dark ? 'bg-white/[0.03] border-white/10' : 'bg-gradient-to-r from-white/60 to-gray-50/60 border-gray-200/50'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                              <span className="text-white font-bold text-lg">{group.name?.charAt(0)}</span>
                            </div>
                            <div>
                              <h5 className={`text-xl font-bold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{group.name}</h5>
                              <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-500'}`}>Created by Admin</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                                </svg>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Teacher</p>
                                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{group.teacher}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                                </svg>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Students</p>
                                <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{group.students.length} members</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            setEditingGroup(group._id);
                            setEditForm({
                              name: group.name,
                              teacher: group.teacher,
                              students: group.students
                            });
                          }}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                          </svg>
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {groups.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                        </svg>
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>No groups created yet</h3>
                      <p className={`${dark ? 'text-gray-500' : 'text-gray-500'}`}>Create your first group to get started with student management.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {editingGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`backdrop-blur-xl rounded-2xl shadow-2xl max-w-lg w-full border ${dark ? 'bg-gray-900/95 border-white/10' : 'bg-white/95 border-white/20'}`}>
            <div className={`p-6 border-b ${dark ? 'border-white/10' : 'border-gray-200/50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                  </div>
                  <h3 className={`text-xl font-bold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Edit Group</h3>
                </div>
                <button
                  onClick={() => setEditingGroup(null)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <svg className={`w-4 h-4 ${dark ? 'text-gray-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.put(`/api/groups/${editingGroup}`, editForm);
                setEditingGroup(null);
                fetchData();
              } catch (error) {
                alert('Error updating group: ' + (error.response?.data?.error || error.message));
              }
            }} className="p-6 space-y-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Group Name</label>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white/50 border-gray-200 text-gray-900'}`}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Assign Teacher</label>
                <select
                  value={editForm.teacher}
                  onChange={(e) => setEditForm({...editForm, teacher: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/50 border-gray-200 text-gray-900'}`}
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.teacherId} value={teacher.teacherId}>
                      {teacher.name} ({teacher.teacherId})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Select Students</label>
                <div className={`max-h-48 overflow-y-auto backdrop-blur-sm border rounded-xl p-4 ${dark ? 'bg-white/5 border-white/10' : 'bg-gray-50/50 border-gray-200'}`}>
                  <div className="space-y-2">
                    {students.map((student) => (
                      <label key={student.studentId} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 cursor-pointer ${dark ? 'hover:bg-white/5' : 'hover:bg-white/50'}`}>
                        <input
                          type="checkbox"
                          checked={editForm.students.includes(student.studentId)}
                          onChange={() => {
                            const studentId = student.studentId;
                            setEditForm(prev => ({
                              ...prev,
                              students: prev.students.includes(studentId)
                                ? prev.students.filter(id => id !== studentId)
                                : [...prev.students, studentId]
                            }));
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{student.name?.charAt(0)}</span>
                        </div>
                        <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{student.name} ({student.studentId})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;