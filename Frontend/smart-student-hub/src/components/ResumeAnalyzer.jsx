import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ScoreRing = ({ score, max = 10, label, color = '#667eea' }) => {
  const pct = Math.round((score / max) * 100);
  const r = 36, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="88" height="88" className="drop-shadow">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 44 44)" className="transition-all duration-1000" />
        <text x="44" y="48" textAnchor="middle" className="text-lg font-bold" fill="#1f2937">{score}/{max}</text>
      </svg>
      <span className="text-xs text-gray-500 font-medium text-center">{label}</span>
    </div>
  );
};

const BadgeTag = ({ text, variant = 'default' }) => {
  const colors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
    matched: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    required: 'bg-gray-100 text-gray-600 border-gray-200',
    default: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    beginner: 'bg-green-100 text-green-700 border-green-200',
    intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
    advanced: 'bg-purple-100 text-purple-700 border-purple-200',
    remote: 'bg-teal-100 text-teal-700 border-teal-200',
    onsite: 'bg-orange-100 text-orange-700 border-orange-200',
    hybrid: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${colors[variant] || colors.default}`}>
      {text}
    </span>
  );
};

export default function ResumeAnalyzer({ studentData }) {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [hasApiKey, setHasApiKey] = useState(true);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);

  const studentId = studentData?.studentId || studentData?._id || localStorage.getItem('studentId');

  const runAnalysis = async () => {
    if (!studentId) { setError('No student ID found. Please login again.'); return; }
    setLoading(true);
    setError('');
    try {
      let res;
      
      // If a resume is uploaded, send it to the special endpoint
      if (uploadedResume) {
        const formData = new FormData();
        formData.append('resume', uploadedResume);
        formData.append('studentId', studentId);
        
        res = await fetch(`${API_URL}/api/resume-analysis-upload`, {
          method: 'POST',
          body: formData
        });
      } else {
        // Otherwise use the profile-based analysis
        res = await fetch(`${API_URL}/api/resume-analysis/${studentId}`);
      }
      
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.includes('API_KEY') || data.error?.includes('key')) {
          setHasApiKey(false);
        }
        if (data.error?.includes('429') || data.error?.includes('quota')) {
          throw new Error('AI rate limit reached. Please wait 60 seconds and try again.');
        }
        throw new Error(data.error || 'Analysis failed');
      }
      setAnalysis(data.analysis);
      setStudentProfile(data.profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid PDF or image file (PDF, PNG, JPG, JPEG, WebP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadedResume(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setResumePreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const clearResume = () => {
    setUploadedResume(null);
    setResumePreview(null);
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '' },
    { id: 'gaps', label: '🔍 Skill Gaps', icon: '' },
    { id: 'tips', label: '💡 Tips', icon: '' },
    { id: 'internships', label: '🏢 Internships', icon: '' },
    { id: 'courses', label: '📚 Courses', icon: '' },
  ];

  const ra = analysis?.resumeAnalysis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Nav */}
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">AI Resume Analyzer</h1>
          <button onClick={() => navigate('/dashboard')}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-lg transition-all">
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Hero / CTA */}
        {!analysis && !loading && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-10 border border-white/30 text-center mb-8">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              AI-Powered Resume Analysis
            </h2>
            <p className="text-gray-600 mb-2 max-w-2xl mx-auto">
              Get personalized resume feedback, skill gap analysis, and <strong>real internship recommendations</strong> from top platforms — all powered by Google Gemini AI.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Analyzes your profile, projects, certificates, coding stats &amp; more. Or upload your own resume.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 max-w-lg mx-auto">
                <p className="text-red-700 text-sm">{error}</p>
                {!hasApiKey && (
                  <p className="text-red-500 text-xs mt-2">
                    ⚠️ Groq API key not set. Add <code className="bg-red-100 px-1 rounded">GROQ_API_KEY</code> to your backend <code className="bg-red-100 px-1 rounded">.env</code> file.
                    Get a free key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline">console.groq.com/keys</a>
                  </p>
                )}
              </div>
            )}

            {/* Resume Upload Section */}
            <div className="max-w-2xl mx-auto mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-dashed border-indigo-300">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleResumeUpload}
                  className="hidden"
                  disabled={loading}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="text-4xl">📄</div>
                  <div>
                    <p className="font-semibold text-gray-700">Upload Your Resume</p>
                    <p className="text-xs text-gray-500 mt-1">PDF or Image (PNG, JPG) • Max 10MB</p>
                  </div>
                  <span className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                    Click to browse
                  </span>
                </div>
              </label>

              {uploadedResume && (
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <p className="text-sm text-gray-600 mb-3">📎 Uploaded: <span className="font-medium">{uploadedResume.name}</span></p>
                  {resumePreview && uploadedResume.type.startsWith('image') && (
                    <div className="mb-3 max-h-48 overflow-auto">
                      <img src={resumePreview} alt="Resume preview" className="max-w-full h-auto rounded-lg border border-indigo-200" />
                    </div>
                  )}
                  {uploadedResume.type === 'application/pdf' && (
                    <p className="text-xs text-gray-500 mb-3">PDF file ready for analysis</p>
                  )}
                  <button
                    onClick={clearResume}
                    className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    ✕ Clear
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={runAnalysis}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
                🚀 Analyze {uploadedResume ? 'Uploaded Resume' : 'My Resume'}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-16 border border-white/30 text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Analyzing your resume with AI...</h3>
            <p className="text-gray-500">This may take 10-15 seconds. Gemini is reviewing your profile, skills, projects, and certifications.</p>
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <>
            {/* Tab bar */}
            <div className="flex space-x-1 mb-6 bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/20">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Re-analyze button */}
            <div className="flex justify-end mb-4">
              <button onClick={runAnalysis}
                className="text-sm bg-white border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all">
                🔄 Re-analyze
              </button>
            </div>

            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === 'overview' && ra && (
              <div className="space-y-6">
                {/* Overall score hero */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <div className="relative w-36 h-36">
                        <svg width="144" height="144">
                          <circle cx="72" cy="72" r="62" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                          <circle cx="72" cy="72" r="62" fill="none" stroke="white" strokeWidth="10"
                            strokeDasharray={2 * Math.PI * 62}
                            strokeDashoffset={2 * Math.PI * 62 - (ra.overallScore / 100) * 2 * Math.PI * 62}
                            strokeLinecap="round" transform="rotate(-90 72 72)" className="transition-all duration-1000" />
                          <text x="72" y="68" textAnchor="middle" fill="white" className="text-3xl font-bold">{ra.overallScore}</text>
                          <text x="72" y="88" textAnchor="middle" fill="rgba(255,255,255,0.7)" className="text-xs">/100</text>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold mb-2">Overall Resume Score</h2>
                      <p className="text-white/80 leading-relaxed">{ra.overallFeedback}</p>
                    </div>
                  </div>
                </div>

                {/* Category scores */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Category Breakdown</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                    <ScoreRing score={ra.technicalSkills?.score || 0} label="Technical Skills" color="#6366f1" />
                    <ScoreRing score={ra.projects?.score || 0} label="Projects" color="#8b5cf6" />
                    <ScoreRing score={ra.education?.score || 0} label="Education" color="#06b6d4" />
                    <ScoreRing score={ra.experience?.score || 0} label="Experience" color="#f59e0b" />
                    <ScoreRing score={ra.codingProfiles?.score || 0} label="Coding Profiles" color="#10b981" />
                  </div>
                </div>

                {/* Feedback cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'technicalSkills', label: 'Technical Skills', emoji: '⚙️' },
                    { key: 'projects', label: 'Projects', emoji: '🛠' },
                    { key: 'education', label: 'Education', emoji: '🎓' },
                    { key: 'experience', label: 'Experience', emoji: '💼' },
                    { key: 'codingProfiles', label: 'Coding Profiles', emoji: '💻' },
                  ].map(item => ra[item.key] && (
                    <div key={item.key} className="bg-white/80 backdrop-blur-xl rounded-xl shadow p-5 border border-white/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{item.emoji}</span>
                        <h4 className="font-bold text-gray-800">{item.label}</h4>
                        <span className="ml-auto text-sm font-bold text-indigo-600">{ra[item.key].score}/10</span>
                      </div>
                      <p className="text-gray-600 text-sm">{ra[item.key].feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== SKILL GAPS TAB ===== */}
            {activeTab === 'gaps' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-6">🔍 Skill Gap Analysis</h3>
                {analysis.skillGaps?.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.skillGaps.map((gap, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex-shrink-0 mt-0.5">
                          <BadgeTag text={gap.importance} variant={gap.importance} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{gap.skill}</h4>
                          <p className="text-gray-600 text-sm mt-0.5">{gap.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No major skill gaps identified. Great job! 🎉</p>
                )}

                {/* Current skills */}
                {studentProfile?.skills?.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-bold text-gray-700 mb-3">Your Current Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {studentProfile.skills.map((s, i) => <BadgeTag key={i} text={s} variant="matched" />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== TIPS TAB ===== */}
            {activeTab === 'tips' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-6">💡 Improvement Tips</h3>
                <div className="space-y-4">
                  {analysis.improvementTips?.map((tip, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-800">{tip.tip}</h4>
                          <BadgeTag text={tip.priority} variant={tip.priority} />
                        </div>
                        {tip.category && <span className="text-xs text-gray-400">{tip.category}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== INTERNSHIPS TAB ===== */}
            {activeTab === 'internships' && (
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">🏢 Recommended Internships</h3>
                  <p className="text-gray-500 text-sm">AI-curated internship recommendations based on your profile. Click "Apply / Search" to find these on real platforms.</p>
                </div>

                {analysis.recommendedInternships?.map((intern, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-shadow">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="text-lg font-bold text-gray-800">{intern.title}</h4>
                            <BadgeTag text={intern.difficulty} variant={intern.difficulty} />
                            <BadgeTag text={intern.type} variant={intern.type} />
                          </div>
                          <p className="text-indigo-600 font-medium">{intern.company}</p>
                          <p className="text-gray-500 text-sm mt-1">
                            {intern.platform && <span>📍 {intern.platform}</span>}
                            {intern.stipend && <span className="ml-3">💰 {intern.stipend}</span>}
                            {intern.duration && <span className="ml-3">⏱ {intern.duration}</span>}
                          </p>
                        </div>
                        {intern.applyUrl && (
                          <a href={intern.applyUrl} target="_blank" rel="noreferrer"
                            className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all text-center">
                            Apply / Search →
                          </a>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mt-3">{intern.matchReason}</p>

                      {/* Skills */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {intern.matchedSkills?.map((s, j) => <BadgeTag key={'m' + j} text={'✓ ' + s} variant="matched" />)}
                        {intern.requiredSkills?.filter(s => !intern.matchedSkills?.includes(s)).map((s, j) => (
                          <BadgeTag key={'r' + j} text={s} variant="required" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {(!analysis.recommendedInternships || analysis.recommendedInternships.length === 0) && (
                  <div className="text-center py-10 text-gray-500">No internship recommendations generated. Try re-analyzing.</div>
                )}
              </div>
            )}

            {/* ===== COURSES TAB ===== */}
            {activeTab === 'courses' && (
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">📚 Recommended Courses</h3>
                  <p className="text-gray-500 text-sm">Courses tailored to your career objective and skill gaps. Includes free and paid options from top platforms.</p>
                </div>

                {analysis.recommendedCourses?.map((course, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-shadow">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="text-lg font-bold text-gray-800">{course.title}</h4>
                            <BadgeTag text={course.level} variant={course.level} />
                            {course.free ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold border bg-green-100 text-green-700 border-green-200">FREE</span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">Paid</span>
                            )}
                          </div>
                          <p className="text-indigo-600 font-medium">{course.platform}</p>
                          <p className="text-gray-500 text-sm mt-1">
                            {course.instructor && <span>👤 {course.instructor}</span>}
                            {course.duration && <span className="ml-3">⏱ {course.duration}</span>}
                          </p>
                          <p className="text-gray-600 text-sm mt-2">{course.reason}</p>
                          {course.tags?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {course.tags.map((tag, j) => <BadgeTag key={j} text={tag} />)}
                            </div>
                          )}
                        </div>
                        {course.courseUrl && (
                          <a href={course.courseUrl} target="_blank" rel="noreferrer"
                            className="flex-shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all text-center">
                            View Course →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {(!analysis.recommendedCourses || analysis.recommendedCourses.length === 0) && (
                  <div className="text-center py-10 text-gray-500">No course recommendations generated. Try re-analyzing.</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
