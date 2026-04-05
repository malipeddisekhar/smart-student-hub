export const applyResumeTemplate = (doc, templateName, data) => {
  const { name, headline, department, college, year, semester, profileData, ed, mergedSkills, mergedProjects, editorEducation, editorExperience, resumeInternships, approvedCerts } = data;

  const darkGray = [40, 40, 40];
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [231, 76, 60];  // Red
  
  if (templateName === 'minimalist') {
    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(name, 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(headline, 105, 28, { align: "center" });
    
    // Contact
    doc.setFontSize(9);
    const contactStr = [profileData?.mobileNumber, profileData?.collegeEmail, profileData?.linkedinProfile].filter(Boolean).join(" | ");
    doc.text(contactStr, 105, 34, { align: "center" });
    
    doc.setDrawColor(200);
    doc.line(20, 38, 190, 38);
    
    let y = 45;

    // Helper function
    const addSectionHeader = (title) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), 20, y);
      y += 8;
    };

    if (editorExperience.length > 0) {
      addSectionHeader("Experience");
      editorExperience.forEach(exp => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(exp.title, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(exp.company, 20, y + 5);
        
        doc.setFontSize(9);
        doc.text(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, 190, y, { align: "right" });
        y += 10;
        if (exp.description) {
           const lines = doc.splitTextToSize(exp.description, 170);
           doc.text(lines, 20, y);
           y += lines.length * 5;
        }
        y += 5;
      });
    }

    if (mergedProjects.length > 0) {
      addSectionHeader("Projects");
      mergedProjects.slice(0, 4).forEach(p => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(p.title, 20, y);
        if (p.technologies) {
           doc.setFont("helvetica", "italic");
           doc.setFontSize(9);
           doc.text(p.technologies, 20, y+5);
           y+=5;
        }
        y += 5;
        if (p.description) {
           doc.setFont("helvetica", "normal");
           const lines = doc.splitTextToSize(p.description, 170);
           doc.text(lines, 20, y);
           y += lines.length * 5;
        }
        y += 5;
      });
    }

    addSectionHeader("Skills");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const skillsLines = doc.splitTextToSize(mergedSkills.join(", "), 170);
    doc.text(skillsLines, 20, y);
    
  } else if (templateName === 'professional') {
    // Two columns, line in middle
    doc.setFont("times", "bold");
    doc.setFontSize(26);
    doc.text(name, 20, 25);
    doc.setFontSize(14);
    doc.setFont("times", "italic");
    doc.text(headline, 20, 33);
    
    // Left col: Education, Skills, Contact
    // Right col: Experience, Projects
    doc.setDrawColor(200);
    doc.line(70, 40, 70, 280);
    
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    let ly = 45;
    doc.text("CONTACT", 20, ly); ly+=8;
    if(profileData?.mobileNumber) { doc.text(profileData.mobileNumber, 20, ly); ly+=6; }
    if(profileData?.collegeEmail) { doc.text(profileData.collegeEmail, 20, ly); ly+=6; }
    
    ly += 10;
    doc.setFont("times", "bold");
    doc.text("SKILLS", 20, ly); ly+=8;
    doc.setFont("times", "normal");
    mergedSkills.slice(0,12).forEach(s => {
      doc.text(s, 20, ly); ly+=6;
    });

    let ry = 45;
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("EXPERIENCE", 75, ry); ry+=8;
    editorExperience.forEach(exp => {
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text(`${exp.title} - ${exp.company}`, 75, ry); ry+=5;
      doc.setFontSize(9);
      doc.setFont("times", "italic");
      doc.text(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, 75, ry); ry+=6;
      doc.setFont("times", "normal");
      if(exp.description) {
        const lines = doc.splitTextToSize(exp.description, 120);
        doc.text(lines, 75, ry); ry+=lines.length*5 + 2;
      }
    });

    ry+=5;
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("PROJECTS", 75, ry); ry+=8;
    mergedProjects.slice(0,3).forEach(p => {
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text(p.title, 75, ry); ry+=6;
      doc.setFontSize(9);
      doc.setFont("times", "normal");
      if(p.description) {
        const lines = doc.splitTextToSize(p.description, 120);
        doc.text(lines, 75, ry); ry+=lines.length*5 + 2;
      }
    });

  } else if (templateName === 'executive') {
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 45, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(name, 20, 25);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(headline, 20, 33);
    
    const contact = [profileData?.mobileNumber, profileData?.collegeEmail].filter(Boolean).join(" | ");
    doc.text(contact, 20, 39);

    doc.setTextColor(...darkGray);
    let y = 60;
    
    const addSection = (title) => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text(title, 20, y);
      doc.setDrawColor(...primaryColor);
      doc.line(20, y+2, 190, y+2);
      doc.setTextColor(...darkGray);
      y += 10;
    }

    addSection("Experience");
    editorExperience.forEach(exp => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(exp.title, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(exp.company, 20, y+6);
      doc.setFontSize(10);
      doc.text(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, 190, y, {align: 'right'});
      y += 12;
      if(exp.description) {
        const lines = doc.splitTextToSize(exp.description, 170);
        doc.text(lines, 20, y); y += lines.length*5+4;
      }
    });

    addSection("Skills");
    doc.setFontSize(10);
    const splitSkills = doc.splitTextToSize(mergedSkills.join(" • "), 170);
    doc.text(splitSkills, 20, y);

  } else if (templateName === 'modern') {
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 0, 8, 297, "F"); // Left accent bar
    
    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text(name, 20, 30);
    doc.setFontSize(14);
    doc.setTextColor(...secondaryColor);
    doc.text(headline, 20, 40);
    
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text([profileData?.mobileNumber, profileData?.collegeEmail].filter(Boolean).join("    "), 20, 48);

    doc.setTextColor(...darkGray);
    let y = 65;

    const addSectionHeader = (title) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, 20, y);
      y += 8;
    };

    addSectionHeader("EXPERIENCE");
    editorExperience.forEach(exp => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(exp.title, 20, y);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text(`${exp.company} | ${exp.startDate} - ${exp.endDate || 'Present'}`, 20, y+5);
      doc.setTextColor(...darkGray);
      y += 10;
      if(exp.description) {
        const lines = doc.splitTextToSize(exp.description, 170);
        doc.text(lines, 20, y); y += lines.length*5+5;
      }
    });

    addSectionHeader("PROJECTS");
    mergedProjects.slice(0, 3).forEach(p => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(p.title, 20, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      if(p.description) {
        const lines = doc.splitTextToSize(p.description, 170);
        doc.text(lines, 20, y); y+=lines.length*5+4;
      }
    });
    
  } else if (templateName === 'compact') {
    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`${name} - ${headline}`, 105, 15, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text([profileData?.mobileNumber, profileData?.collegeEmail, profileData?.linkedinProfile].filter(Boolean).join(" | "), 105, 20, { align: "center" });
    
    doc.setDrawColor(0);
    doc.line(10, 23, 200, 23);
    
    let y = 28;
    const addSection = (title) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(title, 10, y);
      doc.line(10, y+1, 200, y+1);
      y += 6;
    }

    addSection("EXPERIENCE");
    editorExperience.forEach(exp => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${exp.title}, ${exp.company}`, 10, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${exp.startDate}-${exp.current?'Present':exp.endDate}`, 200, y, {align:'right'});
      y+=4;
      if(exp.description) {
        const lines = doc.splitTextToSize(exp.description, 190);
        doc.setFontSize(9);
        doc.text(lines, 10, y); y+=lines.length*4+2;
      }
    });

    addSection("PROJECTS");
    mergedProjects.forEach(p => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(p.title, 10, y);
      doc.setFont("helvetica", "normal");
      if(p.technologies) { doc.text(`(${p.technologies})`, doc.getTextWidth(p.title)+12, y); }
      y+=4;
      if(p.description) {
        const lines = doc.splitTextToSize(p.description, 190);
        doc.setFontSize(9);
        doc.text(lines, 10, y); y+=lines.length*4+2;
      }
    });
  } else {
    // Default fallback - handled in component
  }
};
