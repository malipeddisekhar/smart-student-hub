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
  const prompt = `You are an expert career counselor and internship advisor. Analyze the following student profile and provide:

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
   - applyUrl: A real, working search URL where they can find this type of role (e.g., "https://internshala.com/internships/web-development-internship" or "https://www.linkedin.com/jobs/search/?keywords=data+science+intern")
   - matchReason: Why this matches the student's profile (1-2 sentences)
   - requiredSkills: Array of skills needed
   - matchedSkills: Array of skills the student already has
   - stipend: Estimated stipend range (if applicable)
   - duration: Typical duration
   - type: "remote" | "onsite" | "hybrid"
   - difficulty: "beginner" | "intermediate" | "advanced"

5. **Recommended Courses** — Suggest 6-8 REAL online courses that align with the student's career objective, skill gaps, and goals. For each course provide:
   - title: Course name (must be a real course)
   - platform: Real platform (e.g., "Coursera", "Udemy", "edX", "Pluralsight", "freeCodeCamp", "NPTEL", "Google", "AWS", "Microsoft Learn", "Codecademy")
   - courseUrl: A real, working URL to the course page or search page on the platform
   - instructor: Instructor or organization name
   - level: "beginner" | "intermediate" | "advanced"
   - duration: Estimated duration (e.g., "4 weeks", "20 hours")
   - reason: Why this course is relevant (1-2 sentences tied to career objective or skill gaps)
   - free: true if the course is free, false if paid
   - tags: Array of skill tags the course covers

STUDENT PROFILE:
${JSON.stringify(studentProfile, null, 2)}

IMPORTANT: 
- **CRITICAL: The student's career objective/summary says: "${studentProfile.objectiveSummary || 'not provided'}". Their headline is: "${studentProfile.headline || 'not provided'}". These MUST be the PRIMARY factor in recommending internships.** If the student mentions MERN stack, full stack, web development, etc. in their objective or skills, at LEAST 5-6 of the 10 internships MUST be directly related to those areas.
- The remaining internships can explore related/adjacent domains based on their department and other skills.
- Recommend REAL companies and REAL platforms where these internships can be found.
- The applyUrl should be a genuine search URL on the platform (not a made-up direct link).
- Tailor recommendations based on the student's explicitly stated interests FIRST, then department (${studentProfile.department}), skills, projects, and experience level.
- If the student is a beginner (few projects/certs), include beginner-friendly internships.
- Include a mix of well-known companies and startups.
- Include Indian platforms like Internshala, Stipendio for Indian students, and global ones like LinkedIn, AngelList.
- **COURSES MUST directly align with the career objective.** If the student says MERN/full stack, recommend MERN/React/Node courses. If they say cloud, recommend AWS/Azure/GCP courses. If cybersecurity, recommend security courses. At LEAST 4-5 of the courses must match the primary career interest.

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

module.exports = { buildStudentProfile, analyzeResumeWithAI };
