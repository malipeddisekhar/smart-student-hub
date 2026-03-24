import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
const backendUrl = import.meta.env.VITE_API_URL;

const StudentProfile = ({ studentData }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    profileImage: null,
    aadharNumber: '',
    mobileNumber: '',
    collegeEmail: '',
    class10Certificate: null,
    class12Certificate: null,
    diplomaCertificate: null,
    bachelorDegree: null,
    masterDegree: null,
    doctorDegree: null,
    linkedinProfile: '',
    githubProfile: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for student:', studentData.studentId);
      const response = await api.get(`/api/profile/${studentData.studentId}`);
      console.log('Profile data received:', response.data);
      setProfile(response.data);
      setFormData({ ...formData, ...response.data });
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 404) {
        console.log('Profile not found, will create new one on first save');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Student Data:', studentData);
      console.log('API Base URL:', api.defaults.baseURL);
      console.log('Profile URL:', `/api/profile/${studentData.studentId}`);
      
      // Test backend connection first
      await api.get('/api/test');
      console.log('Backend connection successful');
      
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      console.log('Making request to:', `${api.defaults.baseURL}/api/profile/${studentData.studentId}`);
      const response = await api.put(`/api/profile/${studentData.studentId}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Profile update response:', response.data);
      fetchProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response);
      if (error.response?.status === 404) {
        alert('Backend server not running or endpoint not found. Please start the backend server.');
      } else {
        alert('Error updating profile: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleDeleteCertificate = (certName) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      setProfile({ ...profile, [certName]: null });
      setFormData({ ...formData, [certName]: null });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">Update Profile</h1>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">Update Your Profile</h2>
              <p className="text-gray-600 text-lg">Keep your information up to date for better experience</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Personal Information Section */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Profile Image</label>
                    <div className="relative">
                      <input
                        type="file"
                        name="profileImage"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Aadhar Number</label>
                    <input
                      type="text"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="Enter Aadhar Number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="Enter Mobile Number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">College Email</label>
                    <input
                      type="email"
                      name="collegeEmail"
                      value={formData.collegeEmail}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="Enter College Email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">LinkedIn Profile</label>
                    <input
                      type="url"
                      name="linkedinProfile"
                      value={formData.linkedinProfile}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">GitHub Profile</label>
                    <input
                      type="url"
                      name="githubProfile"
                      value={formData.githubProfile}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
              </div>

             {/* Educational Certificates Section */}
<div className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-lg">
  <div className="flex items-center mb-6">
    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 714.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 713.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 710 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 71-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 71-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 71-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 710-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 713.138-3.138z"/>
      </svg>
    </div>
    <h3 className="text-2xl font-bold text-gray-800">Educational Certificates</h3>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[
      { name: 'class10Certificate', label: '10th Certificate' },
      { name: 'class12Certificate', label: '12th Certificate' },
      { name: 'diplomaCertificate', label: 'Diploma Certificate' },
      { name: 'bachelorDegree', label: 'Bachelor Degree' },
      { name: 'masterDegree', label: 'Master Degree' },
      { name: 'doctorDegree', label: 'Doctor Degree' }
    ].map((cert) => (
      <div key={cert.name} className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">{cert.label}</label>
        
        {profile[cert.name] ? (
          <div className="space-y-3">
            <div className="relative group w-full h-40 bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden">
              {/\.pdf$/i.test(String(profile[cert.name])) ? (
                <object
                  data={profile[cert.name]}
                  type="application/pdf"
                  className="w-full h-full rounded-xl"
                >
                  <a
                    href={profile[cert.name]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-full text-blue-600 font-medium"
                  >
                    Open PDF
                  </a>
                </object>
              ) : (
                <img
                  src={profile[cert.name]}
                  alt={cert.label}
                  className="w-full h-full object-cover rounded-xl cursor-pointer hover:border-blue-400 transition-all duration-300 group-hover:scale-105"
                  onClick={() =>
                    setSelectedImage({
                      src: profile[cert.name],
                      title: cert.label,
                    })
                  }
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => document.getElementById(cert.name).click()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Replace Certificate
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCertificate(cert.name)}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-1"
                title="Delete this certificate"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span>Delete</span>
              </button>
            </div>
            <input
              id={cert.name}
              type="file"
              name={cert.name}
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => document.getElementById(cert.name).click()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Upload Certificate
            </button>
            <input
              id={cert.name}
              type="file"
              name={cert.name}
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleChange}
              className="hidden"
            />
          </div>
        )}

        </div>
      ))}
    </div>
  </div>

                <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 text-white py-4 px-12 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Update Profile</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {selectedImage && (
          <div className="fixed inset-0 backdrop-blur-lg bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/30 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setSelectedImage(null)}>
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl max-w-4xl w-full mx-4 p-8 animate-slideUp" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{selectedImage.title}</h2>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 transform hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
              <div className="flex justify-center">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="max-w-full max-h-96 object-contain rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;