import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PersonalAchievements = ({ studentData }) => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [savingCertificate, setSavingCertificate] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, certId: null });
  const [deleteInput, setDeleteInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    url: '',
    date: '',
    category: '',
    issuer: ''
  });

  useEffect(() => {
    if (studentData?.studentId) {
      fetchCertificates();
    }
  }, [studentData?.studentId]);

  const fetchCertificates = async () => {
    try {
      setLoadingCertificates(true);
      setStatusMessage({ type: '', text: '' });
      const response = await api.get(`/api/certificates/${studentData.studentId}`);
      setCertificates(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setStatusMessage({ type: 'error', text: 'Unable to load certificates right now.' });
    } finally {
      setLoadingCertificates(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingCertificate(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      formDataToSend.append('url', formData.url);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('issuer', formData.issuer);
      formDataToSend.append('studentId', studentData.studentId);
      
      await api.post('/api/certificates', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ name: '', image: null, url: '', date: '', category: '', issuer: '' });
      setShowForm(false);
      await fetchCertificates();
      setStatusMessage({ type: 'success', text: 'Certificate added successfully.' });
    } catch (error) {
      console.error('Error adding certificate:', error);
      setStatusMessage({
        type: 'error',
        text: error.response?.data?.error || 'Unable to add certificate right now.',
      });
    } finally {
      setSavingCertificate(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleDelete = async () => {
    if (deleteInput === 'Delete') {
      try {
        await api.delete(`/api/certificates/${studentData.studentId}/${deleteConfirm.certId}`);
        await fetchCertificates();
        setDeleteConfirm({ show: false, certId: null });
        setDeleteInput('');
        setStatusMessage({ type: 'success', text: 'Certificate deleted successfully.' });
      } catch (error) {
        console.error('Error deleting certificate:', error);
        setStatusMessage({ type: 'error', text: 'Unable to delete certificate right now.' });
      }
    }
  };

  const downloadCertificate = (certificate) => {
    try {
      const link = document.createElement('a');
      const raw = certificate.image || '';
      const url = /^https?:\/\//i.test(raw) || raw.startsWith('/') ? (api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') + (raw.startsWith('/') ? raw : '/' + raw) : raw) : raw;
      const extMatch = String(raw).split('.').pop().split(/[#?]/)[0];
      const ext = extMatch && extMatch.length < 6 ? extMatch : 'pdf';
      const filename = `${certificate.name.replace(/\s+/g, '_')}.${ext}`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Personal Achievements</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {statusMessage.text && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {statusMessage.text}
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Certificates</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Add Certificate
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Certificate</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Certificate Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="file"
                name="image"
                accept=".jpg,.jpeg,.png,.pdf,application/pdf,image/*"
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="url"
                name="url"
                placeholder="Certificate URL (optional)"
                value={formData.url}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="issuer"
                placeholder="Issued By"
                value={formData.issuer}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={savingCertificate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {savingCertificate ? 'Adding...' : 'Add Certificate'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loadingCertificates ? (
          <div className="text-center py-10 text-gray-500">Loading certificates...</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert._id} className="bg-white rounded-lg shadow p-4 relative cursor-pointer hover:shadow-lg transition-shadow">
              <button
                onClick={() => setDeleteConfirm({ show: true, certId: cert._id })}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 text-xs z-10"
              >
                ×
              </button>
              <div onClick={() => setSelectedCertificate(cert)}>
                {(() => {
                    const src = cert.image || '';
                    const isPdf = /\.pdf(\?.*)?$/i.test(String(src));
                    const full = (() => {
                      if (!src) return '';
                      if (/^https?:\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src;
                      return (api.defaults.baseURL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + (src.startsWith('/') ? src : '/' + src);
                    })();
                    if (isPdf) {
                      return (
                        <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded mb-4 overflow-hidden">
                          <a href={full} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                            <object
                              data={full}
                              type="application/pdf"
                              className="w-full h-full"
                              aria-label={cert.name + " PDF preview"}
                            >
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <svg className="w-10 h-10 text-red-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                  <path d="M6 2h7l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
                                  <path d="M13 3v5h5" />
                                </svg>
                              </div>
                            </object>
                          </a>
                        </div>
                      );
                    }
                    return (
                      <img
                        src={full}
                        alt={cert.name}
                        className="w-full h-48 object-cover rounded mb-4"
                      />
                    );
                  })()}
                <h3 className="font-semibold text-lg mb-2">{cert.name}</h3>
                <p className="text-gray-600 mb-1">Category: {cert.category}</p>
                <p className="text-gray-600 mb-1">Issued by: {cert.issuer}</p>
                <p className="text-gray-600">Date: {new Date(cert.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
        )}

        {selectedCertificate && (
          <div className="fixed inset-0 backdrop-blur-lg bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/30 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setSelectedCertificate(null)}>
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl max-w-6xl w-full mx-4 p-8 animate-slideUp" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{selectedCertificate.name}</h2>
                <button 
                  onClick={() => setSelectedCertificate(null)}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors duration-200 hover:rotate-90 transform transition-transform"
                >
                  ×
                </button>
              </div>
              <div className="flex gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <span className="font-semibold text-gray-700 text-lg">Category:</span>
                    <span className="text-indigo-600 font-medium text-lg">{selectedCertificate.category}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <span className="font-semibold text-gray-700 text-lg">Issued by:</span>
                    <span className="text-emerald-600 font-medium text-lg">{selectedCertificate.issuer}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <span className="font-semibold text-gray-700 text-lg">Date:</span>
                    <span className="text-purple-600 font-medium text-lg">{new Date(selectedCertificate.date).toLocaleDateString()}</span>
                  </div>
                  {selectedCertificate.url && (
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                      <span className="font-semibold text-gray-700 text-lg">URL:</span>
                      <a href={selectedCertificate.url} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-red-600 font-medium text-lg transition-colors duration-200 hover:underline">
                        View Certificate
                      </a>
                    </div>
                  )}
                  <button
                    onClick={() => downloadCertificate(selectedCertificate)}
                    className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium text-lg rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Certificate
                  </button>
                </div>
                <div className="flex-1">
                  {(() => {
                    const src = selectedCertificate.image || '';
                    const isPdf = /\.pdf(\?.*)?$/i.test(String(src));
                    const full = (() => {
                      if (!src) return '';
                      if (/^https?:\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src;
                      return (api.defaults.baseURL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + (src.startsWith('/') ? src : '/' + src);
                    })();
                    if (isPdf) {
                      return (
                        <object
                          data={full}
                          type="application/pdf"
                          className="w-full h-96 rounded-xl shadow-lg"
                          style={{ width: '100%', height: '100%' }}
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            <a href={full} target="_blank" rel="noopener noreferrer" className="text-sm text-red-600 font-medium">
                              Open PDF in new tab
                            </a>
                          </div>
                        </object>
                      );
                    }
                    return (
                      <img
                        src={full}
                        alt={selectedCertificate.name}
                        className="w-full h-96 object-cover rounded-xl shadow-lg"
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm.show && (
          <div className="fixed inset-0 backdrop-blur-lg bg-gradient-to-br from-red-100/30 via-pink-100/20 to-orange-100/30 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl p-6 rounded-2xl max-w-md w-full mx-4 animate-slideUp">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">Delete Certificate</h3>
              <p className="mb-6 text-gray-600">Type "Delete" to confirm deletion:</p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                placeholder="Type Delete"
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleDelete}
                  disabled={deleteInput !== 'Delete'}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl flex-1 font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirm({ show: false, certId: null });
                    setDeleteInput('');
                  }}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl flex-1 font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {certificates.length === 0 && !showForm && !loadingCertificates && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No certificates added yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Add Your First Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalAchievements;