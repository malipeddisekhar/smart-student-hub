import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '👤' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'skills', label: 'Skills & Languages', icon: '⚡' },
  { id: 'awards', label: 'Awards & Hobbies', icon: '🏆' },
  { id: 'preview', label: 'Preview', icon: '👁️' },
];

const emptyEducation = { institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '', description: '' };
const emptyExperience = { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' };
const emptyProject = { title: '', description: '', technologies: '', githubLink: '', deployLink: '' };
const emptyAward = { title: '', issuer: '', date: '', description: '' };

const ResumePortfolioEditor = ({ studentData }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [fullStudentData, setFullStudentData] = useState(null);

  // Editor form state
  const [formData, setFormData] = useState({
    headline: '',
    aboutMe: '',
    objectiveSummary: '',
    customSkills: [],
    education: [],
    experience: [],
    customProjects: [],
    awards: [],
    languages: [],
    hobbies: [],
  });

  // Temp inputs for tag-style fields
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newHobby, setNewHobby] = useState('');

  // Fetch existing data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [portfolioRes, profileRes, studentRes, projectsRes, certsRes] = await Promise.all([
        api.get(`/api/portfolio-data/${studentData.studentId}`).catch(() => ({ data: {} })),
        api.get(`/api/profile/${studentData.studentId}`).catch(() => ({ data: {} })),
        api.get(`/api/students/${studentData.studentId}`).catch(() => ({ data: studentData })),
        api.get(`/api/projects/${studentData.studentId}`).catch(() => ({ data: [] })),
        api.get(`/api/academic-certificates/${studentData.studentId}`).catch(() => ({ data: [] })),
      ]);

      setProfileData(profileRes.data);
      setFullStudentData(studentRes.data || studentData);

      const portfolio = portfolioRes.data || {};

      // Extract approved skills from certs for reference
      const certSkills = {};
      (certsRes.data || []).forEach(cert => {
        if (cert.skills && cert.status === 'approved') {
          cert.skills.forEach(s => { certSkills[s] = true; });
        }
      });

      // Pre-fill form with saved portfolioData, or generate defaults from existing data
      setFormData({
        headline: portfolio.headline || '',
        aboutMe: portfolio.aboutMe || '',
        objectiveSummary: portfolio.objectiveSummary || '',
        customSkills: portfolio.customSkills || Object.keys(certSkills),
        education: portfolio.education?.length > 0 ? portfolio.education : [{
          institution: (studentRes.data || studentData)?.college || '',
          degree: 'B.Tech',
          field: (studentRes.data || studentData)?.department || '',
          startYear: '',
          endYear: '',
          gpa: profileRes.data?.overallCGPA ? String(profileRes.data.overallCGPA) : '',
          description: ''
        }],
        experience: portfolio.experience || [],
        customProjects: portfolio.customProjects?.length > 0 ? portfolio.customProjects :
          (projectsRes.data || []).map(p => ({
            title: p.title || '',
            description: p.description || '',
            technologies: '',
            githubLink: p.githubLink || '',
            deployLink: p.deployLink || ''
          })),
        awards: portfolio.awards || [],
        languages: portfolio.languages || ['English'],
        hobbies: portfolio.hobbies || [],
      });
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/api/portfolio-data/${studentData.studentId}`, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving portfolio data:', error);
      alert('Error saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Generic field updaters
  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const updateArrayItem = (field, index, key, value) => {
    setFormData(prev => {
      const arr = [...prev[field]];
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field, template) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], { ...template }] }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const addTag = (field, value, setter) => {
    const trimmed = value.trim();
    if (trimmed && !formData[field].includes(trimmed)) {
      updateField(field, [...formData[field], trimmed]);
    }
    setter('');
  };

  const removeTag = (field, index) => {
    updateField(field, formData[field].filter((_, i) => i !== index));
  };

  // ---- Section renderers ----

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Headline / Title</label>
        <input
          type="text"
          value={formData.headline}
          onChange={e => updateField('headline', e.target.value)}
          placeholder="e.g. Full Stack Developer | AI Enthusiast"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <p className="text-xs text-gray-400 mt-1">Appears below your name in resume & portfolio</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">About Me</label>
        <textarea
          value={formData.aboutMe}
          onChange={e => updateField('aboutMe', e.target.value)}
          placeholder="Write a short paragraph about yourself, your interests, and career goals..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">Used in the "About Me" section of your portfolio & resume</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Career Objective / Summary</label>
        <textarea
          value={formData.objectiveSummary}
          onChange={e => updateField('objectiveSummary', e.target.value)}
          placeholder="A focused 2-3 sentence career objective..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">Used as "Objective" in the resume header area</p>
      </div>

      {/* Live info box */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-indigo-700 mb-2">📋 Auto-filled from your profile</h4>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          <p><span className="font-medium">Name:</span> {fullStudentData?.name || 'N/A'}</p>
          <p><span className="font-medium">Department:</span> {fullStudentData?.department || 'N/A'}</p>
          <p><span className="font-medium">College:</span> {fullStudentData?.college || 'N/A'}</p>
          <p><span className="font-medium">Year / Sem:</span> {fullStudentData?.year || 'N/A'} / {fullStudentData?.semester || 'N/A'}</p>
          <p><span className="font-medium">Email:</span> {profileData?.collegeEmail || fullStudentData?.email || 'N/A'}</p>
          <p><span className="font-medium">Phone:</span> {profileData?.mobileNumber || 'N/A'}</p>
        </div>
        <p className="text-xs text-indigo-500 mt-2">These are pulled from your profile. Edit them in Profile Management.</p>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      {formData.education.map((edu, i) => (
        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5 relative">
          <button onClick={() => removeArrayItem('education', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-lg" title="Remove">✕</button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Institution</label>
              <input value={edu.institution} onChange={e => updateArrayItem('education', i, 'institution', e.target.value)}
                placeholder="e.g. GMRIT" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Degree</label>
              <input value={edu.degree} onChange={e => updateArrayItem('education', i, 'degree', e.target.value)}
                placeholder="e.g. B.Tech" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Field of Study</label>
              <input value={edu.field} onChange={e => updateArrayItem('education', i, 'field', e.target.value)}
                placeholder="e.g. Computer Science" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">GPA / CGPA</label>
              <input value={edu.gpa} onChange={e => updateArrayItem('education', i, 'gpa', e.target.value)}
                placeholder="e.g. 8.5" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Year</label>
              <input value={edu.startYear} onChange={e => updateArrayItem('education', i, 'startYear', e.target.value)}
                placeholder="e.g. 2022" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">End Year</label>
              <input value={edu.endYear} onChange={e => updateArrayItem('education', i, 'endYear', e.target.value)}
                placeholder="e.g. 2026 (or Expected)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
            <textarea value={edu.description} onChange={e => updateArrayItem('education', i, 'description', e.target.value)}
              placeholder="Relevant coursework, achievements..." rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
        </div>
      ))}
      <button onClick={() => addArrayItem('education', emptyEducation)}
        className="w-full py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors font-medium">
        + Add Education
      </button>
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      {formData.experience.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">💼</p>
          <p>No experience added yet. Add internships, jobs, or volunteer work.</p>
        </div>
      )}
      {formData.experience.map((exp, i) => (
        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5 relative">
          <button onClick={() => removeArrayItem('experience', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-lg" title="Remove">✕</button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Job Title</label>
              <input value={exp.title} onChange={e => updateArrayItem('experience', i, 'title', e.target.value)}
                placeholder="e.g. Software Intern" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
              <input value={exp.company} onChange={e => updateArrayItem('experience', i, 'company', e.target.value)}
                placeholder="e.g. Google" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
              <input value={exp.location} onChange={e => updateArrayItem('experience', i, 'location', e.target.value)}
                placeholder="e.g. Hyderabad, India" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={exp.current} onChange={e => updateArrayItem('experience', i, 'current', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-sm text-gray-600">Currently working here</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
              <input type="month" value={exp.startDate} onChange={e => updateArrayItem('experience', i, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            {!exp.current && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                <input type="month" value={exp.endDate} onChange={e => updateArrayItem('experience', i, 'endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
              </div>
            )}
          </div>
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={exp.description} onChange={e => updateArrayItem('experience', i, 'description', e.target.value)}
              placeholder="What you did, technologies used, achievements..." rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
        </div>
      ))}
      <button onClick={() => addArrayItem('experience', emptyExperience)}
        className="w-full py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors font-medium">
        + Add Experience
      </button>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
        💡 Projects here override the ones from your Project Portfolio. Edit them to customize how they appear in resume & portfolio.
      </div>
      {formData.customProjects.map((proj, i) => (
        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5 relative">
          <button onClick={() => removeArrayItem('customProjects', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-lg" title="Remove">✕</button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Project Title</label>
              <input value={proj.title} onChange={e => updateArrayItem('customProjects', i, 'title', e.target.value)}
                placeholder="e.g. Smart Student Hub" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea value={proj.description} onChange={e => updateArrayItem('customProjects', i, 'description', e.target.value)}
                placeholder="What does the project do? What problems does it solve?" rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Technologies Used</label>
              <input value={proj.technologies} onChange={e => updateArrayItem('customProjects', i, 'technologies', e.target.value)}
                placeholder="e.g. React, Node.js, MongoDB" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">GitHub Link</label>
              <input value={proj.githubLink} onChange={e => updateArrayItem('customProjects', i, 'githubLink', e.target.value)}
                placeholder="https://github.com/..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Live Demo Link</label>
              <input value={proj.deployLink} onChange={e => updateArrayItem('customProjects', i, 'deployLink', e.target.value)}
                placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => addArrayItem('customProjects', emptyProject)}
        className="w-full py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors font-medium">
        + Add Project
      </button>
    </div>
  );

  const renderSkillsLanguages = () => (
    <div className="space-y-8">
      {/* Skills */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Technical Skills</label>
        <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
          {formData.customSkills.map((skill, i) => (
            <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 group">
              {skill}
              <button onClick={() => removeTag('customSkills', i)} className="text-indigo-400 hover:text-red-500 font-bold group-hover:text-red-500">×</button>
            </span>
          ))}
          {formData.customSkills.length === 0 && <span className="text-gray-400 text-sm">No skills added</span>}
        </div>
        <div className="flex gap-2">
          <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('customSkills', newSkill, setNewSkill))}
            placeholder="Type a skill and press Enter" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          <button onClick={() => addTag('customSkills', newSkill, setNewSkill)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">Add</button>
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Languages Spoken</label>
        <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
          {formData.languages.map((lang, i) => (
            <span key={i} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 group">
              {lang}
              <button onClick={() => removeTag('languages', i)} className="text-green-400 hover:text-red-500 font-bold group-hover:text-red-500">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newLanguage} onChange={e => setNewLanguage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('languages', newLanguage, setNewLanguage))}
            placeholder="e.g. English, Telugu, Hindi" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          <button onClick={() => addTag('languages', newLanguage, setNewLanguage)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">Add</button>
        </div>
      </div>
    </div>
  );

  const renderAwardsHobbies = () => (
    <div className="space-y-8">
      {/* Awards */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Awards & Achievements</label>
        {formData.awards.map((award, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3 relative">
            <button onClick={() => removeArrayItem('awards', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-lg">✕</button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={award.title} onChange={e => updateArrayItem('awards', i, 'title', e.target.value)}
                placeholder="Award title" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
              <input value={award.issuer} onChange={e => updateArrayItem('awards', i, 'issuer', e.target.value)}
                placeholder="Issuing organization" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
              <input type="month" value={award.date} onChange={e => updateArrayItem('awards', i, 'date', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <textarea value={award.description} onChange={e => updateArrayItem('awards', i, 'description', e.target.value)}
              placeholder="Brief description..." rows={2}
              className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
        ))}
        <button onClick={() => addArrayItem('awards', emptyAward)}
          className="w-full py-2.5 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors font-medium text-sm">
          + Add Award
        </button>
      </div>

      {/* Hobbies */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Hobbies & Interests</label>
        <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
          {formData.hobbies.map((hobby, i) => (
            <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 group">
              {hobby}
              <button onClick={() => removeTag('hobbies', i)} className="text-purple-400 hover:text-red-500 font-bold group-hover:text-red-500">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newHobby} onChange={e => setNewHobby(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('hobbies', newHobby, setNewHobby))}
            placeholder="e.g. Chess, Reading, Open Source" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          <button onClick={() => addTag('hobbies', newHobby, setNewHobby)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">Add</button>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    const name = fullStudentData?.name || 'Student';
    const department = fullStudentData?.department || '';
    const college = fullStudentData?.college || '';
    const year = fullStudentData?.year || '';
    const semester = fullStudentData?.semester || '';
    const email = profileData?.collegeEmail || fullStudentData?.email || '';
    const phone = profileData?.mobileNumber || '';
    const linkedin = profileData?.linkedinProfile || '';
    const github = profileData?.githubProfile || '';

    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-sm text-amber-700">
          👁️ This is a preview of how your content will appear in the generated resume & portfolio. Click "Generate" in Professional Portfolio to download.
        </div>

        {/* Preview card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-8">
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-indigo-200 mt-1">{formData.headline || `${department} Student`}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-indigo-100">
              {email && <span>✉️ {email}</span>}
              {phone && <span>📞 {phone}</span>}
              {linkedin && <span>💼 LinkedIn</span>}
              {github && <span>🐙 GitHub</span>}
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Objective */}
            {formData.objectiveSummary && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 border-b-2 border-indigo-500 pb-1 mb-3">Objective</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{formData.objectiveSummary}</p>
              </div>
            )}

            {/* About Me */}
            {formData.aboutMe && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 border-b-2 border-indigo-500 pb-1 mb-3">About Me</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{formData.aboutMe}</p>
              </div>
            )}

            {/* Education */}
            {formData.education.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 border-b-2 border-indigo-500 pb-1 mb-3">Education</h2>
                {formData.education.map((edu, i) => (
                  <div key={i} className="mb-3">
                    <p className="font-semibold text-gray-800">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                    <p className="text-sm text-gray-600">{edu.institution} {edu.startYear && edu.endYear ? `(${edu.startYear} – ${edu.endYear})` : ''}</p>
                    {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                    {edu.description && <p className="text-sm text-gray-500 mt-1">{edu.description}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Experience */}
            {formData.experience.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 border-b-2 border-indigo-500 pb-1 mb-3">Experience</h2>
                {formData.experience.map((exp, i) => (
                  <div key={i} className="mb-3">
                    <p className="font-semibold text-gray-800">{exp.title} {exp.company && `at ${exp.company}`}</p>
                    <p className="text-sm text-gray-500">{exp.location} {exp.startDate && `| ${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`}</p>
                    {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {formData.customProjects.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 border-b-2 border-indigo-500 pb-1 mb-3">Projects</h2>
                {formData.customProjects.map((proj, i) => (
                  <div key={i} className="mb-3">
                    <p className="font-semibold text-gray-800">{proj.title || 'Untitled'}</p>
                    {proj.technologies && <p className="text-xs text-indigo-600">{proj.technologies}</p>}
                    {proj.description && <p className="text-sm text-gray-600 mt-1">{proj.description}</p>}
                    <div className="flex gap-3 mt-1 text-xs text-indigo-500">
                      {proj.githubLink && <span>GitHub ↗</span>}
                      {proj.deployLink && <span>Demo ↗</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {formData.customSkills.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 border-b-2 border-indigo-500 pb-1 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {formData.customSkills.map((s, i) => (
                    <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Awards */}
            {formData.awards.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 border-b-2 border-indigo-500 pb-1 mb-3">Awards</h2>
                {formData.awards.map((a, i) => (
                  <div key={i} className="mb-2">
                    <p className="font-semibold text-gray-800">{a.title}</p>
                    <p className="text-sm text-gray-500">{a.issuer} {a.date && `| ${a.date}`}</p>
                    {a.description && <p className="text-sm text-gray-600">{a.description}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Languages & Hobbies */}
            <div className="grid grid-cols-2 gap-6">
              {formData.languages.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-800 border-b-2 border-indigo-500 pb-1 mb-3">Languages</h2>
                  <p className="text-sm text-gray-600">{formData.languages.join(', ')}</p>
                </div>
              )}
              {formData.hobbies.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-800 border-b-2 border-indigo-500 pb-1 mb-3">Hobbies</h2>
                  <p className="text-sm text-gray-600">{formData.hobbies.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portfolio editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all border border-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">Resume & Portfolio Editor</h1>
              <p className="text-blue-200 text-xs">Edit once, reflect everywhere</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {saved && (
              <span className="bg-green-500/20 text-green-300 px-3 py-1.5 rounded-full text-sm animate-pulse border border-green-500/30">
                ✓ Saved
              </span>
            )}
            <button onClick={handleSave} disabled={saving}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 text-sm">
              {saving ? 'Saving...' : 'Save All'}
            </button>
            <button onClick={() => navigate('/professional-portfolio')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg text-sm">
              Generate ↗
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-thin">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/30">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'education' && renderEducation()}
          {activeTab === 'experience' && renderExperience()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'skills' && renderSkillsLanguages()}
          {activeTab === 'awards' && renderAwardsHobbies()}
          {activeTab === 'preview' && renderPreview()}
        </div>

        {/* Bottom save bar */}
        {activeTab !== 'preview' && (
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-400">Changes are saved to your profile and used in resume & portfolio generation.</p>
            <button onClick={handleSave} disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePortfolioEditor;
