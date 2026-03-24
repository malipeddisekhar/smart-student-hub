import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AcademicRecords = ({ studentData }) => {
  const navigate = useNavigate();
  const [fullStudentData, setFullStudentData] = useState(studentData);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState('');

  useEffect(() => {
    if (!studentData?.studentId) return;

    fetchFullStudentData();
    const intervalId = setInterval(fetchFullStudentData, 15000);
    const onFocus = () => fetchFullStudentData();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [studentData?.studentId]);

  const fetchFullStudentData = async () => {
    try {
      setRecordsError('');
      const [studentRes, marksRes] = await Promise.all([
        api.get(`/api/students/${studentData.studentId}`),
        api.get(`/api/students/${studentData.studentId}/marks`),
      ]);
      const marks = Array.isArray(marksRes.data?.semesterMarks) ? marksRes.data.semesterMarks : [];
      const sortedMarks = [...marks].sort((a, b) => {
        const ay = Number(a?.year || 0);
        const by = Number(b?.year || 0);
        if (ay !== by) return ay - by;
        return Number(a?.semester || 0) - Number(b?.semester || 0);
      });

      setFullStudentData({
        ...studentRes.data,
        cgpa: marksRes.data?.cgpa ?? studentRes.data?.cgpa ?? null,
        semesterMarks: sortedMarks,
      });
    } catch (error) {
      console.error('Error fetching student data:', error);
      setRecordsError('Unable to load academic records right now.');
    } finally {
      setLoadingRecords(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Academic Records</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-2xl shadow-lg border border-orange-100">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Academic Performance</h2>
                <p className="text-orange-600 font-medium text-lg">CGPA: {fullStudentData.cgpa || 'N/A'}</p>
              </div>
            </div>

            {loadingRecords && (
              <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                Loading latest academic records...
              </div>
            )}

            {recordsError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {recordsError}
              </div>
            )}
            
            {fullStudentData.semesterMarks?.length > 0 ? (
              <div className="grid gap-4">
                {fullStudentData.semesterMarks.map((record, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-800">
                        Sem {record.semester} - Year {record.year}
                      </h3>
                      <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-lg font-bold">
                        SGPA: {record.sgpa}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl font-semibold text-gray-600 mb-2">No academic records found</p>
                <p className="text-gray-500">Your semester marks will appear here once added by your teacher.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicRecords;