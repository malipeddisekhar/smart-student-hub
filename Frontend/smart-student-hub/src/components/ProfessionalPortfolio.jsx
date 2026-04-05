import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { generateWebTemplate } from '../utils/webPortfolioTemplates';
import { applyResumeTemplate } from '../utils/resumeTemplates';

const webTemplates = [
  { id: 'default', name: 'Default Gradient' },
  { id: 'minimalist', name: 'Minimalist Clean' },
  { id: 'dark', name: 'Dark Mode Sleek' },
  { id: 'terminal', name: 'Developer Terminal' },
  { id: 'creative', name: 'Creative Masonry' },
  { id: 'elegant', name: 'Elegant Serif' }
];

const resumeTemplatesList = [
  { id: 'default', name: 'Default Sidebar' },
  { id: 'minimalist', name: 'Minimalist Focused' },
  { id: 'professional', name: 'Professional Columns' },
  { id: 'executive', name: 'Executive Header' },
  { id: 'modern', name: 'Modern Accent' },
  { id: 'compact', name: 'Compact Dense' }
];

const ProfessionalPortfolio = ({ studentData }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [selectedWebTemplate, setSelectedWebTemplate] = useState('default');
  const [selectedResumeTemplate, setSelectedResumeTemplate] = useState('default');
  const [profileData, setProfileData] = useState(null);
  const [fullStudentData, setFullStudentData] = useState(studentData);
  const [projects, setProjects] = useState([]);
  const [academicCertificates, setAcademicCertificates] = useState([]);
  const [personalCertificates, setPersonalCertificates] = useState([]);
  const [skills, setSkills] = useState({});
  const [portfolioEditorData, setPortfolioEditorData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [profileRes, projectsRes, academicRes, personalRes, studentRes, portfolioRes] = await Promise.all([
        api.get(`/api/profile/${studentData.studentId}`),
        api.get(`/api/projects/${studentData.studentId}`),
        api.get(`/api/academic-certificates/${studentData.studentId}`),
        api.get(`/api/certificates/${studentData.studentId}`),
        api.get(`/api/students/${studentData.studentId}`).catch(() => ({ data: studentData })),
        api.get(`/api/portfolio-data/${studentData.studentId}`).catch(() => ({ data: null }))
      ]);

      setProfileData(profileRes.data);
      setFullStudentData(studentRes.data || studentData);
      setProjects(projectsRes.data);
      setAcademicCertificates(academicRes.data);
      setPersonalCertificates(personalRes.data);
      setPortfolioEditorData(portfolioRes.data || null);
      
      // Extract skills from academic certificates
      const allSkills = {};
      academicRes.data.forEach(cert => {
        if (cert.skills && cert.status === 'approved') {
          cert.skills.forEach(skill => {
            allSkills[skill] = (allSkills[skill] || 0) + 1;
          });
        }
      });
      setSkills(allSkills);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePortfolio = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const ed = portfolioEditorData; // shorthand for editor data
      
      // Safe access helpers - use fullStudentData which has complete info from DB
      const name = fullStudentData?.name || studentData?.name || 'Student';
      const department = fullStudentData?.department || studentData?.department || 'Department';
      const college = fullStudentData?.college || studentData?.college || 'College';
      const year = fullStudentData?.year || studentData?.year || 'N/A';
      const semester = fullStudentData?.semester || studentData?.semester || 'N/A';
      const headline = ed?.headline || `${department} Student | ${college}`;
      
      // Merge skills: editor custom skills + cert-extracted skills
      const mergedSkills = ed?.customSkills?.length > 0 ? ed.customSkills : Object.keys(skills || {});
      // Use editor projects if available, else original
      const mergedProjects = ed?.customProjects?.length > 0 ? ed.customProjects : (projects || []);
      // Education from editor
      const editorEducation = ed?.education?.length > 0 ? ed.education : null;
      // Experience from editor
      const editorExperience = ed?.experience || [];
      // Awards from editor
      const editorAwards = ed?.awards || [];
      
      // Colors
      const primaryColor = [59, 130, 246];
      const secondaryColor = [147, 51, 234];
      const darkGray = [31, 41, 55];
      const lightGray = [249, 250, 251];
      const textGray = [107, 114, 128];

      // Header Section
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(name, 20, 25);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(headline, 20, 32);

      let yPosition = 60;

      const ensureSpace = (needed = 20) => {
        if (yPosition + needed > 280) {
          doc.addPage();
          yPosition = 20;
        }
      };

      // Profile Image
      if (profileData?.profileImage) {
        try {
          doc.addImage(profileData.profileImage, "JPEG", 20, yPosition, 30, 30);
          yPosition += 40;
        } catch (error) {
          console.log('Could not add profile image:', error);
        }
      }

      // Objective / About Me from editor
      if (ed?.objectiveSummary) {
        doc.setTextColor(...darkGray);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        ensureSpace(18);
        doc.text("Career Objective", 20, yPosition);
        yPosition += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const objLines = doc.splitTextToSize(ed.objectiveSummary, 170);
        doc.text(objLines, 20, yPosition);
        yPosition += objLines.length * 5 + 8;
      }

      // Contact Information
      doc.setTextColor(...darkGray);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      ensureSpace(18);
      doc.text("Contact Information", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      if (profileData?.mobileNumber) {
        doc.text(`Phone: ${profileData.mobileNumber}`, 20, yPosition);
        yPosition += 6;
      }
      if (profileData?.collegeEmail) {
        doc.text(`Email: ${profileData.collegeEmail}`, 20, yPosition);
        yPosition += 6;
      }
      if (profileData?.linkedinProfile) {
        doc.text(`LinkedIn: ${profileData.linkedinProfile}`, 20, yPosition);
        yPosition += 6;
      }
      if (profileData?.githubProfile) {
        doc.text(`GitHub: ${profileData.githubProfile}`, 20, yPosition);
        yPosition += 6;
      }
      yPosition += 10;

      // Education (from editor if available, else DB)
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      ensureSpace(18);
      doc.text("Education", 20, yPosition);
      yPosition += 10;

      if (editorEducation) {
        editorEducation.forEach((edu) => {
          ensureSpace(22);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${edu.degree || ''} ${edu.field ? `in ${edu.field}` : ''}`.trim() || 'Degree', 20, yPosition);
          yPosition += 6;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          if (edu.institution) { doc.text(edu.institution, 20, yPosition); yPosition += 5; }
          const period = [edu.startYear, edu.endYear].filter(Boolean).join(' – ');
          if (period) { doc.text(period, 20, yPosition); yPosition += 5; }
          if (edu.gpa) { doc.text(`GPA: ${edu.gpa}`, 20, yPosition); yPosition += 5; }
          if (edu.description) {
            const desc = doc.splitTextToSize(edu.description, 170);
            doc.text(desc, 20, yPosition);
            yPosition += desc.length * 4;
          }
          yPosition += 4;
        });
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(department, 20, yPosition); yPosition += 6;
        doc.text(college, 20, yPosition); yPosition += 6;
        doc.text(`Year: ${year} | Semester: ${semester}`, 20, yPosition); yPosition += 6;
        if (profileData?.overallCGPA > 0) {
          doc.text(`CGPA: ${profileData.overallCGPA}`, 20, yPosition); yPosition += 6;
        }
      }
      yPosition += 10;

      // Experience from editor
      if (editorExperience.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        ensureSpace(18);
        doc.text("Experience", 20, yPosition);
        yPosition += 10;

        editorExperience.forEach((exp, index) => {
          ensureSpace(24);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${exp.title || 'Role'}${exp.company ? ` at ${exp.company}` : ''}`, 20, yPosition);
          yPosition += 6;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const dateLine = [exp.location, exp.startDate && `${exp.startDate} – ${exp.current ? 'Present' : (exp.endDate || '')}`].filter(Boolean).join(' | ');
          if (dateLine) { doc.text(dateLine, 20, yPosition); yPosition += 5; }
          if (exp.description) {
            const desc = doc.splitTextToSize(exp.description, 170);
            doc.text(desc, 20, yPosition);
            yPosition += desc.length * 4;
          }
          yPosition += 6;
        });
      }

      // Internships from certificates (only if no experience in editor)
      if (editorExperience.length === 0) {
        const internshipCerts = (academicCertificates || []).filter(
          (cert) => cert && cert.status === 'approved' && cert.domain === 'internship'
        );
        if (internshipCerts.length > 0) {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          ensureSpace(18);
          doc.text("Internships", 20, yPosition);
          yPosition += 10;

          internshipCerts.slice(0, 4).forEach((cert, index) => {
            ensureSpace(24);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(`${index + 1}. ${cert.certificateName || 'Untitled'}`, 20, yPosition);
            yPosition += 6;
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            if (cert.issuedBy) { doc.text(`Organization: ${cert.issuedBy}`, 20, yPosition); yPosition += 4; }
            if (cert.date) { doc.text(`Date: ${new Date(cert.date).toLocaleDateString()}`, 20, yPosition); yPosition += 4; }
            if (cert.description) {
              const desc = doc.splitTextToSize(String(cert.description), 170);
              doc.text(desc, 20, yPosition); yPosition += desc.length * 4;
            }
            yPosition += 6;
          });
        }
      }

      // Technical Skills
      if (mergedSkills.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        ensureSpace(18);
        doc.text("Technical Skills", 20, yPosition);
        yPosition += 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const skillsText = mergedSkills.join(', ');
        const splitSkills = doc.splitTextToSize(skillsText, 170);
        doc.text(splitSkills, 20, yPosition);
        yPosition += splitSkills.length * 6 + 10;
      }

      // Projects (editor projects or DB projects)
      if (mergedProjects.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        ensureSpace(18);
        doc.text("Projects", 20, yPosition);
        yPosition += 10;

        mergedProjects.slice(0, 5).forEach((project, index) => {
          if (!project) return;
          ensureSpace(28);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${project.title || 'Untitled Project'}`, 20, yPosition);
          yPosition += 6;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          // Show technologies if from editor
          if (project.technologies) {
            doc.text(`Tech: ${project.technologies}`, 20, yPosition);
            yPosition += 4;
          }
          if (project.description) {
            const description = doc.splitTextToSize(String(project.description), 170);
            doc.text(description, 20, yPosition);
            yPosition += description.length * 4 + 4;
          }
          if (project.githubLink) { doc.text(`GitHub: ${project.githubLink}`, 20, yPosition); yPosition += 4; }
          if (project.deployLink) { doc.text(`Live Demo: ${project.deployLink}`, 20, yPosition); yPosition += 4; }
          yPosition += 6;
        });
      }

      // Certifications
      const approvedCerts = (academicCertificates || []).filter(cert => cert && cert.status === 'approved');
      if (approvedCerts.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        ensureSpace(18);
        doc.text("Certifications", 20, yPosition);
        yPosition += 10;

        approvedCerts.slice(0, 5).forEach((cert, index) => {
          ensureSpace(22);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${cert.certificateName || 'Untitled'}`, 20, yPosition);
          yPosition += 6;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          if (cert.issuedBy) { doc.text(`Issued by: ${cert.issuedBy}`, 20, yPosition); yPosition += 4; }
          if (cert.date) { doc.text(`Date: ${new Date(cert.date).toLocaleDateString()}`, 20, yPosition); yPosition += 4; }
          if (cert.domain) { doc.text(`Domain: ${cert.domain.charAt(0).toUpperCase() + cert.domain.slice(1)}`, 20, yPosition); yPosition += 4; }
          yPosition += 4;
        });
      }

      // Awards from editor
      if (editorAwards.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        ensureSpace(18);
        doc.text("Awards & Achievements", 20, yPosition);
        yPosition += 10;

        editorAwards.forEach((award, index) => {
          ensureSpace(16);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${award.title || 'Award'}`, 20, yPosition);
          yPosition += 6;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const meta = [award.issuer, award.date].filter(Boolean).join(' | ');
          if (meta) { doc.text(meta, 20, yPosition); yPosition += 4; }
          if (award.description) {
            const desc = doc.splitTextToSize(award.description, 170);
            doc.text(desc, 20, yPosition);
            yPosition += desc.length * 4;
          }
          yPosition += 4;
        });
      }

      // Languages & Hobbies from editor
      if (ed?.languages?.length > 0 || ed?.hobbies?.length > 0) {
        ensureSpace(18);
        if (ed?.languages?.length > 0) {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("Languages", 20, yPosition);
          yPosition += 8;
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(ed.languages.join(', '), 20, yPosition);
          yPosition += 10;
        }
        if (ed?.hobbies?.length > 0) {
          ensureSpace(14);
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("Hobbies & Interests", 20, yPosition);
          yPosition += 8;
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(ed.hobbies.join(', '), 20, yPosition);
          yPosition += 10;
        }
      }

      // Footer
      doc.setFillColor(...lightGray);
      doc.rect(0, 280, 210, 17, "F");
      doc.setTextColor(...textGray);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Generated by Smart Student Hub", 20, 290);

      // Save the PDF (sanitize filename)
      const safeName = name.replace(/[^a-z0-9-_\. ]/gi, '_');
      doc.save(`${safeName}_Professional_Portfolio.pdf`);
    } catch (error) {
      console.error('Error generating portfolio:', error);
      alert('Error generating portfolio. Please try again.');
    }
  };

  const generateResume = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const ed = portfolioEditorData;
      
      const name = fullStudentData?.name || studentData?.name || 'Student';
      const department = fullStudentData?.department || studentData?.department || 'Department';
      const college = fullStudentData?.college || studentData?.college || 'College';
      const year = fullStudentData?.year || studentData?.year || 'N/A';
      const semester = fullStudentData?.semester || studentData?.semester || 'N/A';
      const headline = ed?.headline || `${department} Student`;
      
      const mergedSkills = ed?.customSkills?.length > 0 ? ed.customSkills : Object.keys(skills || {});
      const mergedProjects = ed?.customProjects?.length > 0 ? ed.customProjects : (projects || []);
      const editorEducation = ed?.education?.length > 0 ? ed.education : null;
      const editorExperience = ed?.experience || [];
      const resumeInternships = (academicCertificates || []).filter(cert => cert && cert.status === 'approved' && cert.domain === 'internship');
      const approvedCerts = (academicCertificates || []).filter(cert => cert && cert.status === 'approved');

      if (selectedResumeTemplate !== 'default') {
        applyResumeTemplate(doc, selectedResumeTemplate, {
          name, headline, department, college, year, semester, profileData, ed, mergedSkills, mergedProjects, editorEducation, editorExperience, resumeInternships, approvedCerts
        });
        const safeName = name.replace(/[^a-z0-9-_. ]/gi, '_');
        doc.save(`${safeName}_Professional_Resume.pdf`);
        return;
      }

      

      // Colors
      const darkGray = [31, 41, 55];

      // Left Sidebar (Dark)
      doc.setFillColor(...darkGray);
      doc.rect(0, 0, 70, 297, "F");

      // Profile Image
      if (profileData?.profileImage) {
        try {
          doc.addImage(profileData.profileImage, "JPEG", 10, 15, 50, 50);
        } catch (error) {
          console.log('Could not add profile image:', error);
        }
      }

      // Contact Info in Sidebar
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CONTACT", 10, 80);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      let sideY = 88;
      if (profileData?.mobileNumber) { doc.text(String(profileData.mobileNumber), 10, sideY); sideY += 8; }
      if (profileData?.collegeEmail) { doc.text(String(profileData.collegeEmail), 10, sideY); sideY += 8; }
      if (profileData?.linkedinProfile) { doc.text("LinkedIn", 10, sideY); sideY += 8; }
      if (profileData?.githubProfile) { doc.text("GitHub", 10, sideY); sideY += 8; }
      sideY += 8;

      // Skills in Sidebar
      if (mergedSkills.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("SKILLS", 10, sideY);
        sideY += 8;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        mergedSkills.slice(0, 15).forEach((skill) => {
          doc.text(`• ${skill}`, 10, sideY);
          sideY += 6;
        });
        sideY += 6;
      }

      // Languages in sidebar
      if (ed?.languages?.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("LANGUAGES", 10, sideY);
        sideY += 8;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        ed.languages.forEach((lang) => {
          doc.text(`• ${lang}`, 10, sideY);
          sideY += 6;
        });
        sideY += 6;
      }

      // Hobbies in sidebar
      if (ed?.hobbies?.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("HOBBIES", 10, sideY);
        sideY += 8;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        ed.hobbies.forEach((h) => {
          doc.text(`• ${h}`, 10, sideY);
          sideY += 6;
        });
      }

      // Main Content Area
      doc.setTextColor(...darkGray);
      
      // Name and Title - handle overflow
      const maxNameWidth = 120;
      let nameFontSize = 20;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(nameFontSize);
      
      let nameWidth = doc.getTextWidth(name);
      while (nameWidth > maxNameWidth && nameFontSize > 12) {
        nameFontSize -= 2;
        doc.setFontSize(nameFontSize);
        nameWidth = doc.getTextWidth(name);
      }
      
      let nameYEnd = 30;
      if (nameWidth > maxNameWidth) {
        const nameLines = doc.splitTextToSize(name, maxNameWidth);
        doc.text(nameLines, 80, 30);
        nameYEnd = 30 + (nameLines.length - 1) * (nameFontSize * 0.4);
      } else {
        doc.text(name, 80, 30);
      }
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(headline, 80, nameYEnd + 8);

      let yPosition = Math.max(55, nameYEnd + 18);

      // Objective from editor
      if (ed?.objectiveSummary) {
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("OBJECTIVE", 80, yPosition);
        yPosition += 8;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const objLines = doc.splitTextToSize(ed.objectiveSummary, 120);
        doc.text(objLines, 80, yPosition);
        yPosition += objLines.length * 4 + 8;
      }

      // Education
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("EDUCATION", 80, yPosition);
      yPosition += 8;

      if (editorEducation) {
        editorEducation.forEach((edu) => {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(`${edu.degree || ''} ${edu.field ? `in ${edu.field}` : ''}`.trim() || department, 80, yPosition);
          yPosition += 5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          if (edu.institution) { doc.text(edu.institution, 80, yPosition); yPosition += 5; }
          const period = [edu.startYear, edu.endYear].filter(Boolean).join(' – ');
          if (period) { doc.text(period, 80, yPosition); yPosition += 5; }
          if (edu.gpa) { doc.text(`GPA: ${edu.gpa}`, 80, yPosition); yPosition += 5; }
          yPosition += 4;
        });
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(department, 80, yPosition); yPosition += 6;
        doc.setFont("helvetica", "normal");
        doc.text(college, 80, yPosition); yPosition += 6;
        doc.text(`Year: ${year} | Semester: ${semester}`, 80, yPosition); yPosition += 6;
        if (profileData?.overallCGPA > 0) { doc.text(`CGPA: ${profileData.overallCGPA}`, 80, yPosition); yPosition += 6; }
      }
      yPosition += 6;

      // Experience from editor
      if (editorExperience.length > 0) {
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("EXPERIENCE", 80, yPosition);
        yPosition += 8;

        editorExperience.forEach((exp) => {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(`${exp.title || 'Role'}${exp.company ? ` — ${exp.company}` : ''}`, 80, yPosition);
          yPosition += 5;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const meta = [exp.location, exp.startDate && `${exp.startDate} – ${exp.current ? 'Present' : (exp.endDate || '')}`].filter(Boolean).join(' | ');
          if (meta) { doc.text(meta, 80, yPosition); yPosition += 5; }
          if (exp.description) {
            const desc = doc.splitTextToSize(exp.description, 120);
            doc.text(desc, 80, yPosition);
            yPosition += desc.length * 4;
          }
          yPosition += 6;
        });
      } else {
        // Internships from certificates
        const resumeInternships = (academicCertificates || []).filter(
          (cert) => cert && cert.status === 'approved' && cert.domain === 'internship'
        );
        if (resumeInternships.length > 0) {
          doc.setFontSize(13);
          doc.setFont("helvetica", "bold");
          doc.text("INTERNSHIPS", 80, yPosition);
          yPosition += 8;

          resumeInternships.slice(0, 4).forEach((cert) => {
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(cert.certificateName || 'Untitled', 80, yPosition);
            yPosition += 5;
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            const dateStr = cert.date ? new Date(cert.date).toLocaleDateString() : '';
            doc.text(`${cert.issuedBy || 'N/A'}${dateStr ? ' | ' + dateStr : ''}`, 80, yPosition);
            yPosition += 5;
            if (cert.description) {
              const desc = doc.splitTextToSize(String(cert.description), 120);
              doc.text(desc, 80, yPosition);
              yPosition += desc.length * 4;
            }
            yPosition += 5;
          });
        }
      }

      // Projects
      if (mergedProjects.length > 0) {
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("PROJECTS", 80, yPosition);
        yPosition += 8;

        mergedProjects.slice(0, 4).forEach((project) => {
          if (!project) return;
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(project.title || 'Untitled Project', 80, yPosition);
          yPosition += 5;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          if (project.technologies) { doc.text(`Tech: ${project.technologies}`, 80, yPosition); yPosition += 4; }
          if (project.description) {
            const description = doc.splitTextToSize(String(project.description), 120);
            doc.text(description, 80, yPosition);
            yPosition += description.length * 4 + 2;
          }
          if (project.githubLink) { doc.text(`GitHub: ${project.githubLink}`, 80, yPosition); yPosition += 4; }
          if (project.deployLink) { doc.text(`Live Demo: ${project.deployLink}`, 80, yPosition); yPosition += 4; }
          yPosition += 5;
        });
      }

      // Certifications
      if (approvedCerts.length > 0) {
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("CERTIFICATIONS", 80, yPosition);
        yPosition += 8;

        approvedCerts.slice(0, 4).forEach((cert) => {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(cert.certificateName || 'Untitled', 80, yPosition);
          yPosition += 5;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const dateStr = cert.date ? new Date(cert.date).toLocaleDateString() : 'N/A';
          doc.text(`${cert.issuedBy || 'N/A'} | ${dateStr}`, 80, yPosition);
          yPosition += 6;
        });
      }

      // Save the PDF (sanitize filename)
      const safeName = name.replace(/[^a-z0-9-_\. ]/gi, '_');
      doc.save(`${safeName}_Professional_Resume.pdf`);
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Error generating resume. Please try again.');
    }
  };

  const generateWebPortfolio = () => {
    const ed = portfolioEditorData;
    // Safe access helpers - use fullStudentData which has complete info from DB
    const name = fullStudentData?.name || studentData?.name || 'Student';
    const department = fullStudentData?.department || studentData?.department || '';
    const college = fullStudentData?.college || studentData?.college || '';
    const year = fullStudentData?.year || studentData?.year || '';
    const semester = fullStudentData?.semester || studentData?.semester || '';
    const headline = ed?.headline || (department ? `${department} Student` : 'Student');

    // Merged data from editor or DB
    const mergedSkills = ed?.customSkills?.length > 0 ? ed.customSkills : Object.keys(skills || {});
    const mergedProjects = ed?.customProjects?.length > 0 ? ed.customProjects : (projects || []).filter(p => p);
    const safeAcademicCerts = (academicCertificates || []).filter(cert => cert);
    const editorEducation = ed?.education?.length > 0 ? ed.education : null;
    const editorExperience = ed?.experience || [];
    const editorAwards = ed?.awards || [];
    const aboutMe = ed?.aboutMe || `I am a dedicated ${department || 'technology'} student${college ? ` at ${college}` : ''}${year ? `, currently in year ${year}` : ''}${semester ? `, semester ${semester}` : ''}. ${profileData?.overallCGPA > 0 ? `I maintain a CGPA of ${profileData.overallCGPA}.` : ''} I am passionate about technology and continuously work on projects to enhance my skills.`;

    if (selectedWebTemplate !== 'default') {
      const portfolioHTML = generateWebTemplate(selectedWebTemplate, {
        name, headline, college, department, year, semester, profileData, ed, aboutMe, mergedSkills, mergedProjects, safeAcademicCerts, editorEducation, editorExperience, editorAwards
      });
      
      const blob = new Blob([portfolioHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}_Web_Portfolio.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    const portfolioHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Professional Portfolio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 0; text-align: center; }
        .header h1 { font-size: 3rem; margin-bottom: 10px; }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .profile-img { width: 150px; height: 150px; border-radius: 50%; border: 5px solid white; margin: 20px auto; display: block; }
        .section { margin: 40px 0; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .section h2 { color: #667eea; margin-bottom: 20px; font-size: 2rem; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
        .skills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill-tag { background: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.9rem; }
        .project { margin: 20px 0; padding: 20px; border-left: 4px solid #667eea; background: #f8f9fa; }
        .project h3 { color: #333; margin-bottom: 10px; }
        .project .tech { color: #667eea; font-size: 0.85rem; margin-bottom: 8px; }
        .project-links { margin-top: 10px; }
        .project-links a { color: #667eea; text-decoration: none; margin-right: 15px; }
        .certificate { margin: 15px 0; padding: 15px; background: #e8f4fd; border-radius: 8px; }
        .certificate h4 { color: #333; margin-bottom: 5px; }
        .certificate p { color: #666; font-size: 0.9rem; }
        .contact-info { display: flex; justify-content: center; gap: 30px; margin-top: 20px; }
        .contact-info a { color: white; text-decoration: none; }
        .edu-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
        .edu-item { background: #f8f9ff; border-left: 4px solid #667eea; padding: 12px 14px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.04); }
        .edu-item strong { color: #333; }
        .experience { margin: 15px 0; padding: 15px; border-left: 4px solid #764ba2; background: #faf5ff; border-radius: 8px; }
        .experience h4 { color: #333; margin-bottom: 5px; }
        .experience .meta { color: #888; font-size: 0.85rem; }
        .tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag { background: #f0f0f0; color: #555; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; }
        @media (max-width: 768px) { .header h1 { font-size: 2rem; } .contact-info { flex-direction: column; gap: 10px; } }
    </style>
</head>
<body>
    <div class="header">
        ${profileData?.profileImage ? `<img src="${profileData.profileImage}" alt="${name}" class="profile-img">` : ''}
        <h1>${name}</h1>
        <p>${headline}${college ? ` | ${college}` : ''}</p>
        <div class="contact-info">
            ${profileData?.mobileNumber ? `<a href="tel:${profileData.mobileNumber}">📞 ${profileData.mobileNumber}</a>` : ''}
            ${profileData?.collegeEmail ? `<a href="mailto:${profileData.collegeEmail}">✉️ ${profileData.collegeEmail}</a>` : ''}
            ${profileData?.linkedinProfile ? `<a href="${profileData.linkedinProfile}" target="_blank">💼 LinkedIn</a>` : ''}
            ${profileData?.githubProfile ? `<a href="${profileData.githubProfile}" target="_blank">🐙 GitHub</a>` : ''}
        </div>
    </div>

    <div class="container">
        ${ed?.objectiveSummary ? `
        <div class="section">
            <h2>Career Objective</h2>
            <p>${ed.objectiveSummary}</p>
        </div>
        ` : ''}

        <div class="section">
            <h2>About Me</h2>
            <p>${aboutMe}</p>
        </div>

        <div class="section">
          <h2>Education</h2>
          ${editorEducation ? `
          ${editorEducation.map(edu => `
            <div class="certificate">
              <h4>${edu.degree || ''} ${edu.field ? 'in ' + edu.field : ''}</h4>
              ${edu.institution ? `<p><strong>Institution:</strong> ${edu.institution}</p>` : ''}
              ${edu.startYear || edu.endYear ? `<p>${edu.startYear || ''} – ${edu.endYear || ''}</p>` : ''}
              ${edu.gpa ? `<p><strong>GPA:</strong> ${edu.gpa}</p>` : ''}
              ${edu.description ? `<p>${edu.description}</p>` : ''}
            </div>
          `).join('')}
          ` : `
          <ul class="edu-list">
            ${college ? `<li class="edu-item"><strong>College:</strong> ${college}</li>` : ''}
            ${department ? `<li class="edu-item"><strong>Program / Dept:</strong> ${department}</li>` : ''}
            ${year || semester ? `<li class="edu-item"><strong>Year & Semester:</strong> ${year ? 'Year ' + year : ''}${year && semester ? ' | ' : ''}${semester ? 'Semester ' + semester : ''}</li>` : ''}
            ${profileData?.overallCGPA > 0 ? `<li class="edu-item"><strong>Overall CGPA:</strong> ${profileData.overallCGPA}</li>` : ''}
            ${profileData?.currentSGPA > 0 ? `<li class="edu-item"><strong>Current SGPA:</strong> ${profileData.currentSGPA}</li>` : ''}
          </ul>
          `}
        </div>

        ${editorExperience.length > 0 ? `
        <div class="section">
          <h2>Experience</h2>
          ${editorExperience.map(exp => `
            <div class="experience">
              <h4>${exp.title || 'Role'}${exp.company ? ' at ' + exp.company : ''}</h4>
              <p class="meta">${[exp.location, exp.startDate && (exp.startDate + ' – ' + (exp.current ? 'Present' : (exp.endDate || '')))].filter(Boolean).join(' | ')}</p>
              ${exp.description ? `<p>${exp.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
        ` : `
        ${safeAcademicCerts.filter(cert => cert.status === 'approved' && cert.domain === 'internship').length > 0 ? `
        <div class="section">
          <h2>Internships</h2>
          ${safeAcademicCerts
            .filter(cert => cert.status === 'approved' && cert.domain === 'internship')
            .map(cert => `
              <div class="certificate">
                <h4>${cert.certificateName || 'Untitled'}</h4>
                ${cert.issuedBy ? `<p><strong>Organization:</strong> ${cert.issuedBy}</p>` : ''}
                ${cert.date ? `<p><strong>Date:</strong> ${new Date(cert.date).toLocaleDateString()}</p>` : ''}
                ${cert.description ? `<p><strong>Description:</strong> ${cert.description}</p>` : ''}
              </div>
            `).join('')}
        </div>
        ` : ''}
        `}

        ${mergedSkills.length > 0 ? `
        <div class="section">
            <h2>Technical Skills</h2>
            <div class="skills">
                ${mergedSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
        ` : ''}

        ${mergedProjects.length > 0 ? `
        <div class="section">
            <h2>Projects</h2>
            ${mergedProjects.map(project => `
                <div class="project">
                    <h3>${project.title || 'Untitled Project'}</h3>
                    ${project.technologies ? `<p class="tech">🛠 ${project.technologies}</p>` : ''}
                    ${project.description ? `<p>${project.description}</p>` : ''}
                    <div class="project-links">
                        ${project.githubLink ? `<a href="${project.githubLink}" target="_blank">🔗 GitHub</a>` : ''}
                        ${project.deployLink ? `<a href="${project.deployLink}" target="_blank">🚀 Live Demo</a>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${safeAcademicCerts.filter(cert => cert.status === 'approved').length > 0 ? `
        <div class="section">
            <h2>Certifications</h2>
            ${safeAcademicCerts.filter(cert => cert.status === 'approved').map(cert => `
                <div class="certificate">
                    <h4>${cert.certificateName || 'Untitled'}</h4>
                    ${cert.issuedBy ? `<p><strong>Issued by:</strong> ${cert.issuedBy}</p>` : ''}
                    ${cert.date ? `<p><strong>Date:</strong> ${new Date(cert.date).toLocaleDateString()}</p>` : ''}
                    ${cert.domain ? `<p><strong>Domain:</strong> ${cert.domain.charAt(0).toUpperCase() + cert.domain.slice(1)}</p>` : ''}
                    ${cert.description ? `<p><strong>Description:</strong> ${cert.description}</p>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${editorAwards.length > 0 ? `
        <div class="section">
            <h2>Awards & Achievements</h2>
            ${editorAwards.map(a => `
                <div class="certificate">
                    <h4>${a.title || 'Award'}</h4>
                    <p>${[a.issuer, a.date].filter(Boolean).join(' | ')}</p>
                    ${a.description ? `<p>${a.description}</p>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${(ed?.languages?.length > 0 || ed?.hobbies?.length > 0) ? `
        <div class="section" style="display:grid;grid-template-columns:1fr 1fr;gap:30px;">
            ${ed?.languages?.length > 0 ? `<div><h2 style="font-size:1.5rem;">Languages</h2><div class="tag-list">${ed.languages.map(l => `<span class="tag">${l}</span>`).join('')}</div></div>` : ''}
            ${ed?.hobbies?.length > 0 ? `<div><h2 style="font-size:1.5rem;">Hobbies</h2><div class="tag-list">${ed.hobbies.map(h => `<span class="tag">${h}</span>`).join('')}</div></div>` : ''}
        </div>
        ` : ''}
    </div>
</body>
</html>`;

    const blob = new Blob([portfolioHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_Web_Portfolio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your professional data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Professional Portfolio</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/20">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'portfolio'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Portfolio Generator
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'resume'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Resume Generator
          </button>
        </div>

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Professional Portfolio Generator
              </h2>
              <p className="text-gray-600 mb-8">
                Generate a comprehensive professional portfolio showcasing your certifications, internships, projects, and technical skills.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-800 mb-2">📊 Portfolio Summary</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Projects:</span> {projects.length}</p>
                    <p><span className="font-medium">Approved Certificates:</span> {academicCertificates.filter(c => c.status === 'approved').length}</p>
                    <p><span className="font-medium">Technical Skills:</span> {Object.keys(skills).length}</p>
                    <p><span className="font-medium">Personal Certificates:</span> {personalCertificates.length}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-lg font-bold text-green-800 mb-2">🎯 Skills Overview</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(skills).slice(0, 8).map(skill => (
                      <span key={skill} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {Object.keys(skills).length > 8 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        +{Object.keys(skills).length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="text-lg font-bold text-purple-800 mb-2">📈 Recent Activity</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Latest Project:</span> {projects[0]?.title || 'None'}</p>
                    <p><span className="font-medium">Latest Certificate:</span> {academicCertificates[0]?.certificateName || 'None'}</p>
                    <p><span className="font-medium">Profile Complete:</span> {profileData ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={generatePortfolio}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Generate PDF Portfolio</span>
                </button>

                <button
                  onClick={generateWebPortfolio}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 w-full sm:w-auto"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <span>Generate Web Portfolio</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resume Tab */}
        {activeTab === 'resume' && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Professional Resume Generator
              </h2>
              <p className="text-gray-600 mb-8">
                Generate a professional resume with all your skills, projects, certifications, and academic achievements.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
                  <h3 className="text-lg font-bold text-red-800 mb-2">📄 Resume Features</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Professional layout with sidebar</li>
                    <li>• Contact information</li>
                    <li>• Education details</li>
                    <li>• Technical skills showcase</li>
                    <li>• Project highlights</li>
                    <li>• Approved certifications</li>
                    <li>• Profile photo integration</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200">
                  <h3 className="text-lg font-bold text-orange-800 mb-2">✨ Resume Preview</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {studentData.name}</p>
                    <p><span className="font-medium">Department:</span> {studentData.department}</p>
                    <p><span className="font-medium">College:</span> {studentData.college}</p>
                    <p><span className="font-medium">Skills Count:</span> {Object.keys(skills).length}</p>
                    <p><span className="font-medium">Projects:</span> {projects.length}</p>
                    <p><span className="font-medium">Certificates:</span> {academicCertificates.filter(c => c.status === 'approved').length}</p>
                  </div>
                </div>
              </div>

              <div className="text-center max-w-md mx-auto">

                <button
                  onClick={generateResume}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white p-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 w-full"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span>Generate Professional Resume</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalPortfolio;

