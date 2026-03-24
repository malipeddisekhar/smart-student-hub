const Groq = require("groq-sdk");

let _groq = null;
function getGroq() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

/**
 * Aggregates all student data into a structured profile object
 */
function buildStudentProfile(student, profileData, portfolioData, certs, projects) {
  const approvedCerts = (certs || []).filter(c => c && c.status === 'approved');
  const internshipCerts = approvedCerts.filter(c => c.domain === 'internship');
  const techCerts = approvedCerts.filter(c => c.domain !== 'internship');

  const certSkills = new Set();
  approvedCerts.forEach(c => {
    if (c.extractedSkills && Array.isArray(c.extractedSkills)) {
      c.extractedSkills.forEach(s => certSkills.add(s));
    }
    if (c.domain) certSkills.add(c.domain);
  });

  const editorSkills = portfolioData?.customSkills || [];
  const allSkills = [...new Set([...certSkills, ...editorSkills])];

  const projectTechs = new Set();
  (projects || []).forEach(p => {
    if (p?.technologies) {
      p.technologies.split(/[,;]/).map(t => t.trim()).filter(Boolean).forEach(t => projectTechs.add(t));
    }
  });

  return {
    name: student?.name || 'Student',
    department: student?.department || '',
    college: student?.college || '',
    year: student?.year || '',
    semester: student?.semester || '',
    cgpa: profileData?.overallCGPA || 0,
    sgpa: profileData?.currentSGPA || 0,
    skills: allSkills,
    projectTechnologies: [...projectTechs],
    projects: (projects || []).map(p => ({
      title: p?.title || '',
      description: p?.description || '',
      technologies: p?.technologies || ''
    })),
    certifications: techCerts.map(c => ({
      name: c.certificateName || '',
      issuer: c.issuedBy || '',
      domain: c.domain || ''
    })),
    internships: internshipCerts.map(c => ({
      name: c.certificateName || '',
      organization: c.issuedBy || '',
      description: c.description || ''
    })),
    editorEducation: portfolioData?.education || [],
    editorExperience: portfolioData?.experience || [],
    headline: portfolioData?.headline || '',
    objectiveSummary: portfolioData?.objectiveSummary || '',
    aboutMe: portfolioData?.aboutMe || '',
    leetcode: {
      solved: student?.leetcode?.totalSolved || 0,
      easy: student?.leetcode?.easySolved || 0,
      medium: student?.leetcode?.mediumSolved || 0,
      hard: student?.leetcode?.hardSolved || 0,
      ranking: student?.leetcode?.ranking || 0
    },
    codechef: {
      rating: student?.codechef?.rating || 0,
      stars: student?.codechef?.stars || '',
      problemsSolved: student?.codechef?.problemsSolved || 0
    },
    linkedinProfile: profileData?.linkedinProfile || '',
    githubProfile: profileData?.githubProfile || ''
  };
}

/**
 * Calls Groq AI (ultra-fast LPU inference) to analyze resume + recommend internships
 */
async function analyzeResumeWithAI(studentProfile) {
  const isUploadedResume = studentProfile.resumeText ? true : false;
  
  const prompt = `You are an expert career counselor and internship advisor. Analyze the following student profile${isUploadedResume ? ' and uploaded resume' : ''} and provide:

1. **Resume Strength Analysis** — Rate each area out of 10 and give brief feedback:
   - Technical Skills
   - Projects
   - Education
   - Experience / Internships
   - Coding Profiles (LeetCode/CodeChef)
   - Overall Resume Score (out of 100)

2. **Skill Gap Analysis** — What skills are missing or weak based on current tech industry demands for their department/field?

3. **Improvement Tips** — 3-5 specific, actionable tips to strengthen their resume.

4. **Recommended Real Internships** — Suggest 8-10 REAL internship opportunities that match this student's profile. For each internship provide:
   - title: Job title
   - company: Real company name
   - platform: Where to find/apply (e.g., "Internshala", "LinkedIn", "company website", "Stipendio", "LetsIntern", "AngelList")
   - applyUrl: A real, working search URL where they can find this type of role
   - matchReason: Why this matches the student's profile (1-2 sentences)
   - requiredSkills: Array of skills needed
   - matchedSkills: Array of skills the student already has
   - stipend: Estimated stipend range (if applicable)
   - duration: Typical duration
   - type: "remote" | "onsite" | "hybrid"
   - difficulty: "beginner" | "intermediate" | "advanced"

5. **Recommended Courses** — Suggest 6-8 REAL online courses that align with the student's skills, profile, and goals. For each course provide:
   - title: Course name (must be a real course)
   - platform: Real platform (e.g., "Coursera", "Udemy", "edX", "Pluralsight", "freeCodeCamp", "NPTEL", "Google", "AWS", "Microsoft Learn", "Codecademy")
   - courseUrl: A real, working URL to the course page or search page on the platform
   - instructor: Instructor or organization name
   - level: "beginner" | "intermediate" | "advanced"
   - duration: Estimated duration (e.g., "4 weeks", "20 hours")
   - reason: Why this course is relevant (1-2 sentences)
   - free: true if the course is free, false if paid
   - tags: Array of skill tags the course covers

${isUploadedResume ? `

UPLOADED RESUME TEXT:
\`\`\`
${studentProfile.resumeText || 'No text extracted'}
\`\`\`

**PRIMARY ANALYSIS SOURCE: Use the uploaded resume text as the main source of truth for analyzing the student's skills, experience, and background.**
` : ''}

STUDENT PROFILE:
${JSON.stringify(studentProfile, null, 2)}

IMPORTANT: 
- **If this is an uploaded resume, prioritize information from the resume text over the profile data.**
- Identify the primary technology stack/career path from the resume (e.g., Java, Spring Boot, Microservices = Java/Spring backend; React, Node = MERN/Web development; Python, Data structures = Data Science)
- **AT LEAST 60% of internship recommendations MUST align with the PRIMARY tech stack identified in the resume.**
- For example: If resume shows Java + Spring Boot experience, recommend backend/microservices/cloud internships. If it shows JavaScript/React + Node, recommend full-stack/MERN internships. If it shows Python, recommend Python/data science internships.
- The remaining internships can explore related/adjacent domains.
- Recommend REAL companies and REAL platforms where these internships can be found.
- Tailor recommendations based on the student's explicitly stated interests/skills FIRST, then department (${studentProfile.department}), other context, and experience level.
- **COURSES MUST directly align with the PRIMARY tech stack identified.** If the resume shows Java/Spring, recommend Spring/Microservices courses. If it shows JavaScript, recommend React/Node courses. At LEAST 5-6 of the courses must match the primary tech stack.
- Include a mix of well-known companies and startups.
- Include Indian platforms like Internshala, Stipendio for Indian students, and global ones like LinkedIn, AngelList.

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "resumeAnalysis": {
    "technicalSkills": { "score": 0, "feedback": "" },
    "projects": { "score": 0, "feedback": "" },
    "education": { "score": 0, "feedback": "" },
    "experience": { "score": 0, "feedback": "" },
    "codingProfiles": { "score": 0, "feedback": "" },
    "overallScore": 0,
    "overallFeedback": ""
  },
  "skillGaps": [
    { "skill": "", "importance": "high|medium|low", "reason": "" }
  ],
  "improvementTips": [
    { "tip": "", "priority": "high|medium|low", "category": "" }
  ],
  "recommendedInternships": [
    {
      "title": "",
      "company": "",
      "platform": "",
      "applyUrl": "",
      "matchReason": "",
      "requiredSkills": [],
      "matchedSkills": [],
      "stipend": "",
      "duration": "",
      "type": "remote|onsite|hybrid",
      "difficulty": "beginner|intermediate|advanced"
    }
  ],
  "recommendedCourses": [
    {
      "title": "",
      "platform": "",
      "courseUrl": "",
      "instructor": "",
      "level": "beginner|intermediate|advanced",
      "duration": "",
      "reason": "",
      "free": true,
      "tags": []
    }
  ]
}`;

  // Try models in order: fastest & most accurate first
  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"];
  let lastError;

  for (const modelName of models) {
    try {
      console.log(`[Groq] Trying model: ${modelName}`);
      const startTime = Date.now();

      const chatCompletion = await getGroq().chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a JSON-only response bot. You respond ONLY with valid JSON, no markdown, no explanation, no code blocks."
          },
          { role: "user", content: prompt }
        ],
        model: modelName,
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      });

      const elapsed = Date.now() - startTime;
      console.log(`[Groq] Success with ${modelName} in ${elapsed}ms`);

      const text = chatCompletion.choices[0]?.message?.content || '';

      try {
        return JSON.parse(text);
      } catch (parseErr) {
        // Try to extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        console.error('[Groq] Failed to parse:', text.substring(0, 300));
        throw new Error('AI returned invalid JSON. Please try again.');
      }
    } catch (err) {
      lastError = err;
      const isRateLimit = err.status === 429 || err.message?.includes('429') || err.message?.includes('rate');
      if (isRateLimit) {
        console.log(`[Groq] Rate limited on ${modelName}, trying next model...`);
        continue;
      }
      if (err.message?.includes('JSON')) throw err;
      console.error(`[Groq] Error with ${modelName}:`, err.message);
      continue;
    }
  }

  throw lastError || new Error('All AI models failed. Please try again.');
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(filePath) {
  try {
    const fs = require('fs').promises;
    const axios = require('axios');

    let fileBuffer;

    // Check if filePath is a URL (Cloudinary)
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      console.log(`[PDF] Downloading from URL...`);
      const response = await axios.get(filePath, { 
        responseType: 'arraybuffer',
        timeout: 30000
      });
      fileBuffer = Buffer.from(response.data);
      console.log(`[PDF] Downloaded ${fileBuffer.length} bytes`);
    } else {
      // Local file
      fileBuffer = await fs.readFile(filePath);
      console.log(`[PDF] Read ${fileBuffer.length} bytes from local file`);
    }

    // Clear require cache and load pdf-parse fresh
    delete require.cache[require.resolve('pdf-parse')];
    
    let pdfParse;
    try {
      const pdfParseModule = require('pdf-parse');
      console.log(`[PDF] Module loaded, typeof: ${typeof pdfParseModule}, keys: ${Object.keys(pdfParseModule).join(', ')}`);
      
      // Handle different export formats
      if (typeof pdfParseModule === 'function') {
        pdfParse = pdfParseModule;
      } else if (pdfParseModule.default && typeof pdfParseModule.default === 'function') {
        pdfParse = pdfParseModule.default;
      } else if (typeof pdfParseModule === 'object' && pdfParseModule.parse && typeof pdfParseModule.parse === 'function') {
        pdfParse = pdfParseModule.parse;
      } else {
        throw new Error(`Unable to find pdf-parse function in module. Keys: ${Object.keys(pdfParseModule).join(', ')}`);
      }
    } catch (loadErr) {
      console.error(`[PDF] Failed to load pdf-parse: ${loadErr.message}`);
      throw new Error(`pdf-parse not available: ${loadErr.message}`);
    }

    console.log('[PDF] Starting PDF parsing...');
    const data = await pdfParse(fileBuffer);
    
    console.log(`[PDF] Parse successful, text length: ${data?.text?.length || 0}`);
    
    if (!data || !data.text || data.text.trim().length === 0) {
      throw new Error('PDF parsed but contains no extractable text');
    }
    
    return data.text.trim();
  } catch (error) {
    console.error(`[PDF] Extraction failed: ${error.message}`);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract text from image using Tesseract OCR
 */
async function extractTextFromImage(filePath) {
  try {
    const Tesseract = require('tesseract.js');
    const axios = require('axios');
    const fs = require('fs').promises;
    const path = require('path');
    const os = require('os');

    let localFilePath = filePath;

    // Check if filePath is a URL (Cloudinary)
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      console.log(`Downloading image from URL: ${filePath}`);
      const response = await axios.get(filePath, { responseType: 'arraybuffer' });
      
      // Save to temp file
      const tempDir = os.tmpdir();
      const fileName = `resume-ocr-${Date.now()}.png`;
      localFilePath = path.join(tempDir, fileName);
      
      await fs.writeFile(localFilePath, Buffer.from(response.data));
      console.log(`Saved temp image to: ${localFilePath}`);
    }

    const result = await Tesseract.recognize(localFilePath, 'eng', {
      logger: (m) => console.log('[OCR]', m.status, Math.round(m.progress * 100) + '%')
    });

    // Clean up temp file if it was created
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      try {
        await fs.unlink(localFilePath);
      } catch (e) {
        console.log('Could not delete temp file:', e.message);
      }
    }

    return result.data.text || '';
  } catch (error) {
    console.error('Image OCR error:', error.message);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
}

/**
 * Build a profile from uploaded resume text
 */
function buildProfileFromResumeText(resumeText, student) {
  // Extract key information from resume text using pattern matching
  const skillsMatch = resumeText.match(/(?:skills?|technologies?)[:\s]*([^.]*?)(?=\n|experience|projects|education|$)/is);
  const skillsText = skillsMatch?.[1] || '';
  const skills = skillsText
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .slice(0, 20);

  return {
    name: student?.name || 'Student',
    department: student?.department || '',
    college: student?.college || '',
    year: student?.year || '',
    semester: student?.semester || '',
    cgpa: 0,
    sgpa: 0,
    skills: skills.length > 0 ? skills : [],
    projectTechnologies: [],
    projects: [],
    certifications: [],
    internships: [],
    editorEducation: [],
    editorExperience: [],
    headline: `Experienced in: ${skills.slice(0, 5).join(', ')}`,
    objectiveSummary: 'Seeking opportunities in ' + (skills.join(' and ').substring(0, 100) || 'technology'),
    aboutMe: '',
    leetcode: { solved: 0, easy: 0, medium: 0, hard: 0, ranking: 0 },
    codechef: { rating: 0, stars: '', problemsSolved: 0 },
    linkedinProfile: '',
    githubProfile: '',
    resumeText: resumeText.substring(0, 5000) // Include raw resume text for AI context
  };
}

module.exports = { buildStudentProfile, analyzeResumeWithAI, extractTextFromPDF, extractTextFromImage, buildProfileFromResumeText };
