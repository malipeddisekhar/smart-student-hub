import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProfessionalPortfolio = ({ studentData }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [profileData, setProfileData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [academicCertificates, setAcademicCertificates] = useState([]);
  const [personalCertificates, setPersonalCertificates] = useState([]);
  const [skills, setSkills] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [profileRes, projectsRes, academicRes, personalRes] = await Promise.all([
        api.get(`/api/profile/${studentData.studentId}`),
        api.get(`/api/projects/${studentData.studentId}`),
        api.get(`/api/academic-certificates/${studentData.studentId}`),
        api.get(`/api/certificates/${studentData.studentId}`)
      ]);

      setProfileData(profileRes.data);
      setProjects(projectsRes.data);
      setAcademicCertificates(academicRes.data);
      setPersonalCertificates(personalRes.data);
      
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
      
      // Colors
      const primaryColor = [59, 130, 246]; // Blue-500
      const secondaryColor = [147, 51, 234]; // Purple-600
      const darkGray = [31, 41, 55]; // Gray-800
      const lightGray = [249, 250, 251]; // Gray-50
      const textGray = [107, 114, 128]; // Gray-500

      // Header Section
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, "F");
      
      // Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(studentData.name, 20, 25);
      
      // Title
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`${studentData.department} Student | ${studentData.college}`, 20, 32);

      let yPosition = 60;

      // Simple pagination helper to avoid clipping content
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

      // Contact Information
      doc.setTextColor(...darkGray);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
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

      // Education
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      ensureSpace(18);
      doc.text("Education", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${studentData.department}`, 20, yPosition);
      yPosition += 6;
      doc.text(`${studentData.college}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Year: ${studentData.year} | Semester: ${studentData.semester}`, 20, yPosition);
      yPosition += 6;
      if (profileData?.overallCGPA > 0) {
        doc.text(`CGPA: ${profileData.overallCGPA}`, 20, yPosition);
        yPosition += 6;
      }
      yPosition += 10;

      // Internships
      const internshipCerts = academicCertificates.filter(
        (cert) => cert.status === 'approved' && cert.domain === 'internship'
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
          doc.text(`${index + 1}. ${cert.certificateName}`, 20, yPosition);
          yPosition += 6;

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(`Organization: ${cert.issuedBy || 'N/A'}`, 20, yPosition);
          yPosition += 4;
          if (cert.date) {
            doc.text(`Date: ${new Date(cert.date).toLocaleDateString()}`, 20, yPosition);
            yPosition += 4;
          }
          if (cert.description) {
            const desc = doc.splitTextToSize(cert.description, 170);
            doc.text(desc, 20, yPosition);
            yPosition += desc.length * 4;
          }
          yPosition += 6;
        });
      }

      // Technical Skills
      const approvedSkills = Object.keys(skills);
      if (approvedSkills.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        ensureSpace(18);
        doc.text("Technical Skills", 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const skillsText = approvedSkills.join(', ');
        const splitSkills = doc.splitTextToSize(skillsText, 170);
        doc.text(splitSkills, 20, yPosition);
        yPosition += splitSkills.length * 6 + 10;
      }

      // Projects
      if (projects.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        ensureSpace(18);
        doc.text("Projects", 20, yPosition);
        yPosition += 10;

        projects.slice(0, 5).forEach((project, index) => {
          ensureSpace(28);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${project.title}`, 20, yPosition);
          yPosition += 6;

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const description = doc.splitTextToSize(project.description, 170);
          doc.text(description, 20, yPosition);
          yPosition += description.length * 4 + 4;

          if (project.githubLink) {
            doc.text(`GitHub: ${project.githubLink}`, 20, yPosition);
            yPosition += 4;
          }
          if (project.deployLink) {
            doc.text(`Live Demo: ${project.deployLink}`, 20, yPosition);
            yPosition += 4;
          }
          yPosition += 6;
        });
      }

      // Certifications
      const approvedCerts = academicCertificates.filter(cert => cert.status === 'approved');
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
          doc.text(`${index + 1}. ${cert.certificateName}`, 20, yPosition);
          yPosition += 6;

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(`Issued by: ${cert.issuedBy}`, 20, yPosition);
          yPosition += 4;
          doc.text(`Date: ${new Date(cert.date).toLocaleDateString()}`, 20, yPosition);
          yPosition += 4;
          doc.text(`Domain: ${cert.domain.charAt(0).toUpperCase() + cert.domain.slice(1)}`, 20, yPosition);
          yPosition += 8;
        });
      }

      // Footer
      doc.setFillColor(...lightGray);
      doc.rect(0, 280, 210, 17, "F");
      doc.setTextColor(...textGray);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Generated by Smart Student Hub", 20, 290);

      // Save the PDF
      doc.save(`${studentData.name}_Professional_Portfolio.pdf`);
    } catch (error) {
      console.error('Error generating portfolio:', error);
      alert('Error generating portfolio. Please try again.');
    }
  };

  const generateResume = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      // Colors
      const darkGray = [31, 41, 55]; // Gray-800
      const lightGray = [249, 250, 251]; // Gray-50
      const primaryColor = [59, 130, 246]; // Blue-500
      const textGray = [107, 114, 128]; // Gray-500

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
      if (profileData?.mobileNumber) {
        doc.text(profileData.mobileNumber, 10, 88);
      }
      if (profileData?.collegeEmail) {
        doc.text(profileData.collegeEmail, 10, 96);
      }
      if (profileData?.linkedinProfile) {
        doc.text("LinkedIn", 10, 104);
      }
      if (profileData?.githubProfile) {
        doc.text("GitHub", 10, 112);
      }

      // Skills in Sidebar
      const approvedSkills = Object.keys(skills);
      if (approvedSkills.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("SKILLS", 10, 130);
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        approvedSkills.slice(0, 15).forEach((skill, index) => {
          doc.text(`• ${skill}`, 10, 138 + (index * 6));
        });
      }

      // Main Content Area
      doc.setTextColor(...darkGray);
      
      // Name and Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(studentData.name, 80, 30);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`${studentData.department} Student`, 80, 38);
      doc.text(studentData.college, 80, 46);

      let yPosition = 70;

      // Education
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("EDUCATION", 80, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${studentData.department}`, 80, yPosition);
      yPosition += 6;
      
      doc.setFont("helvetica", "normal");
      doc.text(`${studentData.college}`, 80, yPosition);
      yPosition += 6;
      doc.text(`Year: ${studentData.year} | Semester: ${studentData.semester}`, 80, yPosition);
      yPosition += 6;
      if (profileData?.overallCGPA > 0) {
        doc.text(`CGPA: ${profileData.overallCGPA}`, 80, yPosition);
        yPosition += 6;
      }
      yPosition += 10;

      // Internships
      const resumeInternships = academicCertificates.filter(
        (cert) => cert.status === 'approved' && cert.domain === 'internship'
      );
      if (resumeInternships.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("INTERNSHIPS", 80, yPosition);
        yPosition += 10;

        resumeInternships.slice(0, 4).forEach((cert) => {
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(cert.certificateName, 80, yPosition);
          yPosition += 6;

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(`${cert.issuedBy || 'N/A'}${cert.date ? ' | ' + new Date(cert.date).toLocaleDateString() : ''}`, 80, yPosition);
          yPosition += 6;
          if (cert.description) {
            const desc = doc.splitTextToSize(cert.description, 120);
            doc.text(desc, 80, yPosition);
            yPosition += desc.length * 4;
          }
          yPosition += 6;
        });
      }

      // Projects
      if (projects.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PROJECTS", 80, yPosition);
        yPosition += 10;

        projects.slice(0, 4).forEach((project, index) => {
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(project.title, 80, yPosition);
          yPosition += 6;

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const description = doc.splitTextToSize(project.description, 120);
          doc.text(description, 80, yPosition);
          yPosition += description.length * 4 + 4;

          if (project.githubLink) {
            doc.text(`GitHub: ${project.githubLink}`, 80, yPosition);
            yPosition += 4;
          }
          if (project.deployLink) {
            doc.text(`Live Demo: ${project.deployLink}`, 80, yPosition);
            yPosition += 4;
          }
          yPosition += 6;
        });
      }

      // Certifications
      const approvedCerts = academicCertificates.filter(cert => cert.status === 'approved');
      if (approvedCerts.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("CERTIFICATIONS", 80, yPosition);
        yPosition += 10;

        approvedCerts.slice(0, 4).forEach((cert, index) => {
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(cert.certificateName, 80, yPosition);
          yPosition += 6;

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(`${cert.issuedBy} | ${new Date(cert.date).toLocaleDateString()}`, 80, yPosition);
          yPosition += 6;
        });
      }

      // Save the PDF
      doc.save(`${studentData.name}_Professional_Resume.pdf`);
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Error generating resume. Please try again.');
    }
  };

  const generateWebPortfolio = () => {
    const portfolioHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${studentData.name} - Professional Portfolio</title>
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
        @media (max-width: 768px) { .header h1 { font-size: 2rem; } .contact-info { flex-direction: column; gap: 10px; } }
    </style>
</head>
<body>
    <div class="header">
        ${profileData?.profileImage ? `<img src="${profileData.profileImage}" alt="${studentData.name}" class="profile-img">` : ''}
        <h1>${studentData.name}</h1>
        <p>${studentData.department} Student | ${studentData.college}</p>
        <div class="contact-info">
            ${profileData?.mobileNumber ? `<a href="tel:${profileData.mobileNumber}">📞 ${profileData.mobileNumber}</a>` : ''}
            ${profileData?.collegeEmail ? `<a href="mailto:${profileData.collegeEmail}">✉️ ${profileData.collegeEmail}</a>` : ''}
            ${profileData?.linkedinProfile ? `<a href="${profileData.linkedinProfile}" target="_blank">💼 LinkedIn</a>` : ''}
            ${profileData?.githubProfile ? `<a href="${profileData.githubProfile}" target="_blank">🐙 GitHub</a>` : ''}
        </div>
    </div>

    <div class="container">
        <div class="section">
            <h2>About Me</h2>
            <p>I am a dedicated ${studentData.department} student at ${studentData.college}, currently in year ${studentData.year}, semester ${studentData.semester}. 
            ${profileData?.overallCGPA > 0 ? `I maintain a CGPA of ${profileData.overallCGPA}.` : ''} 
            I am passionate about technology and continuously work on projects to enhance my skills.</p>
        </div>

        <div class="section">
          <h2>Education</h2>
          <ul class="edu-list">
            <li class="edu-item"><strong>College:</strong> ${studentData.college || 'N/A'}</li>
            <li class="edu-item"><strong>Program / Dept:</strong> ${studentData.department || 'N/A'}</li>
            <li class="edu-item"><strong>Year & Semester:</strong> ${studentData.year || 'N/A'} | ${studentData.semester ? `Semester ${studentData.semester}` : 'Semester N/A'}</li>
            ${profileData?.overallCGPA > 0 ? `<li class="edu-item"><strong>Overall CGPA:</strong> ${profileData.overallCGPA}</li>` : ''}
            ${profileData?.currentSGPA > 0 ? `<li class="edu-item"><strong>Current SGPA:</strong> ${profileData.currentSGPA}</li>` : ''}
          </ul>
        </div>

        ${academicCertificates.filter(cert => cert.status === 'approved' && cert.domain === 'internship').length > 0 ? `
        <div class="section">
          <h2>Internships</h2>
          ${academicCertificates
            .filter(cert => cert.status === 'approved' && cert.domain === 'internship')
            .map(cert => `
              <div class="certificate">
                <h4>${cert.certificateName}</h4>
                <p><strong>Organization:</strong> ${cert.issuedBy || 'N/A'}</p>
                ${cert.date ? `<p><strong>Date:</strong> ${new Date(cert.date).toLocaleDateString()}</p>` : ''}
                ${cert.description ? `<p><strong>Description:</strong> ${cert.description}</p>` : ''}
              </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="section">
            <h2>Technical Skills</h2>
            <div class="skills">
                ${Object.keys(skills).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>

        <div class="section">
            <h2>Projects</h2>
            ${projects.map(project => `
                <div class="project">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-links">
                        ${project.githubLink ? `<a href="${project.githubLink}" target="_blank">🔗 GitHub</a>` : ''}
                        ${project.deployLink ? `<a href="${project.deployLink}" target="_blank">🚀 Live Demo</a>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>Certifications</h2>
            ${academicCertificates.filter(cert => cert.status === 'approved').map(cert => `
                <div class="certificate">
                    <h4>${cert.certificateName}</h4>
                    <p><strong>Issued by:</strong> ${cert.issuedBy}</p>
                    <p><strong>Date:</strong> ${new Date(cert.date).toLocaleDateString()}</p>
                    <p><strong>Domain:</strong> ${cert.domain.charAt(0).toUpperCase() + cert.domain.slice(1)}</p>
                    ${cert.description ? `<p><strong>Description:</strong> ${cert.description}</p>` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([portfolioHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studentData.name}_Web_Portfolio.html`;
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
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
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

              <div className="text-center">
                <button
                  onClick={generateResume}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white p-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 mx-auto"
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

