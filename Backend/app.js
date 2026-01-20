require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/database");
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");
const Admin = require("./models/Admin");
const College = require("./models/College");
const Group = require("./models/Group");
const Message = require("./models/Message");
const { OAuth2Client } = require('google-auth-library');
const { fetchLeetCodeStats } = require("./utils/leetcodeService");
const { fetchCodeChefStats } = require("./utils/codechefService");

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");


// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: ensure we return a usable delivery URL for Cloudinary assets
const resolveCloudinaryUrl = (val) => {
  if (!val) return '';
  const s = String(val);
  // already an absolute URL or a local path (served from /uploads)
  if (/^https?:\/\//i.test(s) || s.startsWith('/') || s.startsWith('data:') || s.startsWith('blob:')) return s;
  try {
    // treat stored value as public_id (or path) and generate a secure URL
    return cloudinary.url(s, { resource_type: 'auto', secure: true });
  } catch (e) {
    return s;
  }
};

const app = express();
const port = process.env.PORT || 3000;

// ✅ Replace disk storage with Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "student-hub-uploads", // any folder name you like
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: 'auto',
  },
});
const upload = multer({ storage });

// Disk storage for personal certificates
const personalStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const personalUpload = multer({ storage: personalStorage });


// Connect to MongoDB
connectDB();

// Middleware


app.use(cors({
  origin: [
    'http://localhost:5173',                     // local dev
    'https://sih-smart-student-hub-2.onrender.com' // your deployed frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Google OAuth2 client for ID token verification
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Endpoint to verify Google ID token and check user existence
app.post('/api/auth/google', async (req, res) => {
  try {
    const { id_token, role } = req.body;
    if (!id_token) return res.status(400).json({ error: 'id_token required' });

    const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload(); // email, name, sub, picture, etc.

    const email = payload.email;
    if (!email) return res.status(400).json({ error: 'Unable to determine email from token' });

    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ email });
      if (teacher) {
        return res.json({ ok: true, type: 'teacher', teacherId: teacher.teacherId, name: teacher.name, email });
      }
      return res.json({ ok: true, type: 'none', payload });
    }

    // default: student role
    const student = await Student.findOne({ email });
    if (student) {
      return res.json({ ok: true, type: 'student', studentId: student.studentId, name: student.name, email });
    }

    return res.json({ ok: true, type: 'none', payload });
  } catch (error) {
    console.error('Google token verification failed', error);
    res.status(400).json({ error: 'Invalid token' });
  }
});


// ---------------------
// Basic routes
// ---------------------
app.get("/", (req, res) => res.send("Smart Student Hub Dashboard - Please use the frontend application"));

app.get("/api/test", (req, res) => res.json({ message: "Backend connected successfully!" }));

// ---------------------
// Colleges routes
// ---------------------
app.get("/api/colleges", async (req, res) => {
  try {
    let colleges = await College.find({}, { name: 1, departments: 1 }).lean();

    if (!colleges || colleges.length === 0) {
      // Auto-seed a minimal set if empty to improve first-run UX
      const defaults = [
        {
          name: 'MIT College of Engineering',
          code: 'MITCOE',
          address: 'Pune, India',
          createdBy: 'SYSTEM',
          departments: [
            { name: 'Computer Science', code: 'CSE' },
            { name: 'Information Technology', code: 'IT' },
            { name: 'Mechanical Engineering', code: 'ME' },
          ],
        },
        {
          name: 'Stanford University',
          code: 'STANFD',
          address: 'Stanford, CA, USA',
          createdBy: 'SYSTEM',
          departments: [
            { name: 'Computer Science', code: 'CS' },
            { name: 'Electrical Engineering', code: 'EE' },
          ],
        },
      ];

      await College.insertMany(defaults);
      colleges = await College.find({}, { name: 1, departments: 1 }).lean();
    }

    res.json(colleges);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Admin routes
// ---------------------
app.post("/api/admin/register", async (req, res) => {
  try {
    const { password, confirmPassword, ...adminData } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ ...adminData, password: hashedPassword });
    await admin.save();

    // Automatically create college if not exists
    const existingCollege = await College.findOne({ name: admin.institution });
    if (!existingCollege && admin.institution && admin.department) {
      const collegeCode = admin.institution.replace(/\s+/g, '').substring(0, 6).toUpperCase();
      const deptCode = admin.department.replace(/\s+/g, '').substring(0, 4).toUpperCase();
      const newCollege = new College({
        name: admin.institution,
        code: collegeCode,
        address: 'Not specified',
        departments: [{ name: admin.department, code: deptCode }],
        createdBy: admin.adminId
      });
      await newCollege.save();
    }

    res.status(201).json({ message: "Admin registered successfully", adminId: admin.adminId, name: admin.name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(400).json({ error: "Invalid email or password" });

    res.json({ message: "Login successful", adminId: admin.adminId, name: admin.name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Student routes
// ---------------------
app.post("/api/register", async (req, res) => {
  try {
    const { password, ...studentData } = req.body;

    // ✅ Hash password and save
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({
      ...studentData,
      password: hashedPassword,
    });

    await student.save();

    res.status(201).json({
      message: "Student registered successfully",
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      college: student.college,
      department: student.department,
      year: student.year,
      semester: student.semester,
      rollNumber: student.rollNumber,
    });
  } catch (error) {
    console.error("❌ Registration Error:", error.message);
    res.status(400).json({ error: error.message });
  }
});


app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(400).json({ error: "Invalid email or password" });

    res.json({
      message: "Login successful",
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      college: student.college,
      department: student.department,
      year: student.year,
      semester: student.semester,
      rollNumber: student.rollNumber,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Teacher routes
// ---------------------
app.post("/api/teacher/register", async (req, res) => {
  try {
    const { password, confirmPassword, experience, ...teacherData } = req.body;
    if (password !== confirmPassword) return res.status(400).json({ error: "Passwords do not match" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({ ...teacherData, password: hashedPassword, experience: parseInt(experience) || 0 });
    await teacher.save();

    res.status(201).json({ message: "Teacher registered successfully", teacherId: teacher.teacherId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/teacher/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(400).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, teacher.password);
    if (!valid) return res.status(400).json({ error: "Invalid email or password" });

    res.json({ message: "Login successful", teacherId: teacher.teacherId, name: teacher.name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Academic certificates
// ---------------------
app.post("/api/academic-certificates", upload.single("image"), async (req, res) => {
  try {
    const {
      studentId,
      domain,
      certificateName,
      certificateUrl,
      date,
      issuedBy,
      description,
      skills,
      duration,
      location,
      organizationType
    } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const imageUrl = req.file?.path || req.file?.secure_url || req.file?.url || req.body.image;

    // Safe skills parsing
    let skillsArr = [];
    try { skillsArr = skills ? JSON.parse(skills) : []; } catch (e) { skillsArr = []; }

    const newCert = {
      domain,
      certificateName,
      image: imageUrl,
      certificateUrl,
      date,
      issuedBy,
      description,
      skills: skillsArr,
      duration,
      location,
      organizationType,
      status: 'pending',
      submittedAt: new Date()
    };

    student.academicCertificates = student.academicCertificates || [];
    student.academicCertificates.push(newCert);
    await student.save();

    res.status(201).json({ message: "Certificate submitted", certificate: newCert });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.get("/api/academic-certificates/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found" });
    
    const certs = (student.academicCertificates || []).map(c => {
      const certObj = c.toObject ? c.toObject() : c;
      return {
        _id: certObj._id,
        domain: certObj.domain || '',
        certificateName: certObj.certificateName || '',
        image: resolveCloudinaryUrl(certObj.image),
        certificateUrl: certObj.certificateUrl || '',
        date: certObj.date || '',
        issuedBy: certObj.issuedBy || '',
        description: certObj.description || '',
        skills: certObj.skills || [],
        duration: certObj.duration || '',
        location: certObj.location || '',
        organizationType: certObj.organizationType || '',
        status: certObj.status || 'pending',
        feedback: certObj.feedback || '',
        submittedAt: certObj.submittedAt || '',
        reviewedAt: certObj.reviewedAt || ''
      };
    });
    
    res.json(certs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a specific academic certificate
app.delete("/api/academic-certificates/:studentId/:certificateId", async (req, res) => {
  try {
    const { studentId, certificateId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const beforeCount = (student.academicCertificates || []).length;
    student.academicCertificates = (student.academicCertificates || []).filter((c) => String(c._id) !== String(certificateId));

    if (beforeCount === student.academicCertificates.length) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    await student.save();
    res.json({ message: "Certificate deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Teacher groups
// ---------------------
app.get('/api/teacher/groups/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const groups = await Group.find({ teacher: teacherId });
    res.json(groups);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Admin students (for teacher dashboard)
// ---------------------
app.get('/api/admin/students', async (req, res) => {
  try {
    const students = await Student.find({}, { 
      studentId: 1, 
      name: 1, 
      email: 1, 
      college: 1, 
      department: 1, 
      year: 1, 
      semester: 1, 
      rollNumber: 1 
    });
    res.json(students);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Academic certificates review (teacher)
// ---------------------
app.get('/api/review/academic-certificates', async (req, res) => {
  try {
    const students = await Student.find({}, { name: 1, studentId: 1, academicCertificates: 1 }).lean();
    const items = [];

    for (const s of students) {
      for (const c of (s.academicCertificates || [])) {
        if (c.status === 'pending') {
          items.push({
            studentId: s.studentId,
            studentName: s.name,
            certificateId: String(c._id),
            domain: c.domain,
            certificateName: c.certificateName,
            image: c.image || '', // Cloudinary URL
            certificateUrl: c.certificateUrl,
            date: c.date,
            issuedBy: c.issuedBy,
            description: c.description,
            skills: c.skills || [],
            duration: c.duration,
            location: c.location,
            organizationType: c.organizationType,
            submittedAt: c.submittedAt,
            // Scan information
            scanStatus: c.scanStatus || 'not_scanned',
            scanResult: c.scanResult || null,
            scannedAt: c.scannedAt || null,
            verificationDetails: c.verificationDetails || {}
          });
        }
      }
    }

    res.json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.post('/api/review/academic-certificates/:studentId/:certificateId/approve', async (req, res) => {
  try {
    const { studentId, certificateId } = req.params;
    const { feedback } = req.body;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const cert = (student.academicCertificates || []).find(c => String(c._id) === String(certificateId));
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });

    cert.status = 'approved';
    cert.feedback = feedback || '';
    cert.reviewedAt = new Date();
    await student.save();

    res.json({ message: 'Certificate approved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/review/academic-certificates/:studentId/:certificateId/reject', async (req, res) => {
  try {
    const { studentId, certificateId } = req.params;
    const { feedback } = req.body;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const cert = (student.academicCertificates || []).find(c => String(c._id) === String(certificateId));
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });

    cert.status = 'rejected';
    cert.feedback = feedback || '';
    cert.reviewedAt = new Date();
    await student.save();

    res.json({ message: 'Certificate rejected' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Certificate Scanning & Verification
// ---------------------
const { scanAndVerifyCertificate } = require('./utils/certificateScanService');

// Rate limiting map to prevent abuse
const scanRateLimits = new Map();
const SCAN_RATE_LIMIT_MS = 5000; // 5 seconds between scans

app.post('/api/scan-certificate/:studentId/:certificateId', async (req, res) => {
  try {
    const { studentId, certificateId } = req.params;
    const { teacherId } = req.body;
    
    if (!teacherId) {
      return res.status(400).json({ error: 'Teacher ID is required' });
    }
    
    // Rate limiting check
    const rateLimitKey = `${teacherId}_${certificateId}`;
    const lastScanTime = scanRateLimits.get(rateLimitKey);
    const now = Date.now();
    
    if (lastScanTime && (now - lastScanTime) < SCAN_RATE_LIMIT_MS) {
      const waitTime = Math.ceil((SCAN_RATE_LIMIT_MS - (now - lastScanTime)) / 1000);
      return res.status(429).json({ 
        error: `Please wait ${waitTime} seconds before scanning again` 
      });
    }
    
    // Find student and certificate
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const cert = (student.academicCertificates || []).find(
      c => String(c._id) === String(certificateId)
    );
    
    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    // Update scan status to 'scanning'
    cert.scanStatus = 'scanning';
    await student.save();
    
    // Update rate limit
    scanRateLimits.set(rateLimitKey, now);
    
    try {
      // Get certificate image URL
      const certificateImageUrl = resolveCloudinaryUrl(cert.image);
      
      if (!certificateImageUrl) {
        throw new Error('Certificate image URL is invalid or missing');
      }
      
      console.log('Scanning certificate:', certificateImageUrl);
      
      // Perform scan and verification
      const scanResult = await scanAndVerifyCertificate(
        certificateImageUrl,
        { name: student.name, courseName: cert.certificateName },
        cert.certificateHash // Previous hash if exists
      );
      
      console.log('Scan completed:', scanResult.scanResult);
      
      // Update certificate with scan results
      cert.scanStatus = 'scanned';
      cert.scanResult = scanResult.scanResult;
      cert.scannedAt = new Date();
      cert.scannedByTeacherId = teacherId;
      cert.certificateHash = scanResult.certificateHash;
      cert.verificationDetails = scanResult.verificationDetails;
      
      await student.save();
      
      return res.json({
        message: 'Certificate scanned successfully',
        scanResult: scanResult.scanResult,
        verificationDetails: scanResult.verificationDetails
      });
    } catch (scanError) {
      // Update scan status to error
      cert.scanStatus = 'not_scanned';
      await student.save();
      
      console.error('Scan error:', scanError);
      return res.status(500).json({ 
        error: 'Failed to scan certificate',
        details: scanError.message 
      });
    }
  } catch (error) {
    console.error('Error in scan-certificate endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get scan status for a certificate
app.get('/api/scan-status/:studentId/:certificateId', async (req, res) => {
  try {
    const { studentId, certificateId } = req.params;
    
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const cert = (student.academicCertificates || []).find(
      c => String(c._id) === String(certificateId)
    );
    
    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    res.json({
      scanStatus: cert.scanStatus || 'not_scanned',
      scanResult: cert.scanResult || null,
      scannedAt: cert.scannedAt || null,
      verificationDetails: cert.verificationDetails || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Updated approve endpoint to check scan status
app.post('/api/review/academic-certificates/:studentId/:certificateId/approve-with-scan', async (req, res) => {
  try {
    const { studentId, certificateId } = req.params;
    const { feedback } = req.body;
    
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const cert = (student.academicCertificates || []).find(
      c => String(c._id) === String(certificateId)
    );
    
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    
    // Check if certificate has been scanned
    if (!cert.scanStatus || cert.scanStatus === 'not_scanned') {
      return res.status(400).json({ 
        error: 'Certificate must be scanned before approval',
        requiresScan: true
      });
    }
    
    // Check if scan result is AUTO_VERIFIED
    if (cert.scanResult !== 'AUTO_VERIFIED') {
      return res.status(400).json({ 
        error: `Cannot approve certificate with scan result: ${cert.scanResult}. Only AUTO_VERIFIED certificates can be approved.`,
        scanResult: cert.scanResult
      });
    }

    cert.status = 'approved';
    cert.feedback = feedback || '';
    cert.reviewedAt = new Date();
    await student.save();

    res.json({ message: 'Certificate approved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Updated reject endpoint to check scan status
app.post('/api/review/academic-certificates/:studentId/:certificateId/reject-with-scan', async (req, res) => {
  try {
    const { studentId, certificateId } = req.params;
    const { feedback } = req.body;
    
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const cert = (student.academicCertificates || []).find(
      c => String(c._id) === String(certificateId)
    );
    
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    
    // Check if certificate has been scanned
    if (!cert.scanStatus || cert.scanStatus === 'not_scanned') {
      return res.status(400).json({ 
        error: 'Certificate must be scanned before rejection',
        requiresScan: true
      });
    }

    cert.status = 'rejected';
    cert.feedback = feedback || '';
    cert.reviewedAt = new Date();
    await student.save();

    res.json({ message: 'Certificate rejected' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Personal achievements (personal certificates)
// ---------------------
app.get("/api/certificates/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Ensure all certificate images are direct Cloudinary URLs
    const certificates = (student.personalCertificates || []).map(cert => ({
      _id: cert._id,
      name: cert.name,
      image: resolveCloudinaryUrl(cert.image) || "",        // Cloudinary URL
      url: cert.url || "",
      date: cert.date || "",
      category: cert.category || "",
      issuer: cert.issuer || ""
    }));

    res.json(certificates);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/certificates", personalUpload.single("image"), async (req, res) => {
  try {
    const { studentId, name, url, date, category, issuer } = req.body;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    const newCert = {
      name,
      image: imageUrl,
      url: url || "",
      date: date ? new Date(date) : null,
      category,
      issuer,
      submittedAt: new Date(),
    };

    student.personalCertificates = student.personalCertificates || [];
    student.personalCertificates.push(newCert);
    await student.save();

    res.status(201).json({ message: "Certificate added", certificate: newCert });
  } catch (error) {
    console.error("❌ Personal certificate save error:", error);
    res.status(400).json({ error: error.message });
  }
});

const UPLOADS_FOLDER = path.join(__dirname, "uploads");
app.use("/uploads", express.static(UPLOADS_FOLDER));

app.delete("/api/certificates/:studentId/:certificateId", async (req, res) => {
  try {
    const { studentId, certificateId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const before = (student.personalCertificates || []).length;
    student.personalCertificates = (student.personalCertificates || []).filter((c) => String(c._id) !== String(certificateId));
    if (before === student.personalCertificates.length) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    await student.save();
    res.json({ message: "Certificate deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Student profile routes
// ---------------------
app.get("/api/profile/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student.profile || {});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put(
  "/api/profile/:studentId",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "class10Certificate", maxCount: 1 },
    { name: "class12Certificate", maxCount: 1 },
    { name: "diplomaCertificate", maxCount: 1 },
    { name: "bachelorDegree", maxCount: 1 },
    { name: "masterDegree", maxCount: 1 },
    { name: "doctorDegree", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { studentId } = req.params;
      const student = await Student.findOne({ studentId });
      if (!student) return res.status(404).json({ error: "Student not found" });

      // ✅ Updated to Cloudinary URLs
      const toUrl = (file) => (file ? file.path : undefined);

      const fileFields = [
        "profileImage",
        "class10Certificate",
        "class12Certificate",
        "diplomaCertificate",
        "bachelorDegree",
        "masterDegree",
        "doctorDegree",
      ];

      const textFields = [
        "aadharNumber",
        "mobileNumber",
        "collegeEmail",
        "linkedinProfile",
        "githubProfile",
      ];

      student.profile = student.profile || {};

      // Handle files
      for (const field of fileFields) {
        const file = req.files && req.files[field] && req.files[field][0];
        if (file) {
          student.profile[field] = toUrl(file);
        } else if (typeof req.body[field] === "string" && req.body[field].length > 0) {
          student.profile[field] = req.body[field];
        }
      }

      // Handle text fields
      for (const field of textFields) {
        if (field in req.body) {
          student.profile[field] = req.body[field];
        }
      }

      await student.save();
      res.json({ message: "Profile updated", profile: student.profile });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);


// ---------------------
// Projects
// ---------------------
app.get('/api/projects/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student.projects || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { studentId, title, description, githubLink, deployLink } = req.body;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const newProject = {
      title,
      description,
      githubLink,
      deployLink,
      createdAt: new Date(),
    };

    student.projects = student.projects || [];
    student.projects.push(newProject);
    await student.save();

    res.status(201).json({ message: 'Project added', project: newProject });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/projects/:studentId/:projectId', async (req, res) => {
  try {
    const { studentId, projectId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const before = (student.projects || []).length;
    student.projects = (student.projects || []).filter((p) => String(p._id) !== String(projectId));
    if (before === student.projects.length) {
      return res.status(404).json({ error: 'Project not found' });
    }
    await student.save();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Return full student record (used by frontend view profile)
app.get('/api/students/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId }).lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Remove sensitive fields
    const { password, __v, ...rest } = student;
    res.json(rest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Search routes
// ---------------------
app.get('/api/search/students', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    const searchQuery = query.trim();
    const students = await Student.find(
      {
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { studentId: { $regex: searchQuery, $options: 'i' } },
          { rollNumber: { $regex: searchQuery, $options: 'i' } },
          { college: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } }
        ]
      },
      {
        studentId: 1,
        name: 1,
        email: 1,
        college: 1,
        department: 1,
        year: 1,
        rollNumber: 1,
        'profile.profileImage': 1
      }
    ).limit(10).lean();

    res.json(students);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// LeetCode routes
// ---------------------
app.post('/api/leetcode/update-username', async (req, res) => {
  try {
    const { studentId, username } = req.body;

    if (!studentId || !username) {
      return res.status(400).json({ error: 'StudentId and username are required' });
    }

    if (typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username cannot be empty' });
    }

    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Fetch LeetCode stats
    try {
      const leetcodeData = await fetchLeetCodeStats(username.trim());
      student.leetcodeUsername = leetcodeData.username;
      student.problemsSolved = leetcodeData.totalSolved;
      student.leetcodeUpdatedAt = new Date();
      await student.save();

      res.json({
        message: 'LeetCode username saved successfully',
        leetcodeUsername: student.leetcodeUsername,
        problemsSolved: student.problemsSolved
      });
    } catch (error) {
      return res.status(400).json({ 
        error: 'Failed to fetch LeetCode stats',
        details: error.message 
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/leetcode/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.json({
      leetcodeUsername: student.leetcodeUsername || null,
      problemsSolved: student.problemsSolved || 0,
      leetcodeUpdatedAt: student.leetcodeUpdatedAt || null
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const students = await Student.find(
      {
        $or: [
          { leetcodeUsername: { $exists: true, $ne: null } },
          { codechefUsername: { $exists: true, $ne: null } }
        ]
      },
      { 
        studentId: 1, 
        name: 1, 
        college: 1, 
        department: 1, 
        leetcodeUsername: 1, 
        problemsSolved: 1, 
        leetcodeUpdatedAt: 1,
        codechefUsername: 1,
        codechefProblemsSolved: 1,
        codechefUpdatedAt: 1
      }
    )
      .lean();

    // Calculate total and sort by total problems solved
    const leaderboard = students.map((student) => ({
      ...student,
      leetcodeSolved: student.problemsSolved || 0,
      codechefSolved: student.codechefProblemsSolved || 0,
      totalSolved: (student.problemsSolved || 0) + (student.codechefProblemsSolved || 0)
    }))
    .sort((a, b) => b.totalSolved - a.totalSolved)
    .map((student, index) => ({
      ...student,
      rank: index + 1
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LeetCode-only leaderboard
app.get('/api/leaderboard/leetcode', async (req, res) => {
  try {
    const students = await Student.find(
      { leetcodeUsername: { $exists: true, $ne: null } },
      { 
        studentId: 1, 
        name: 1, 
        college: 1, 
        department: 1, 
        leetcodeUsername: 1, 
        problemsSolved: 1, 
        leetcodeUpdatedAt: 1
      }
    ).lean();

    const leaderboard = students
      .map((student) => ({
        ...student,
        problemsSolvedCount: student.problemsSolved || 0
      }))
      .sort((a, b) => b.problemsSolvedCount - a.problemsSolvedCount)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));

    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CodeChef-only leaderboard
app.get('/api/leaderboard/codechef', async (req, res) => {
  try {
    const students = await Student.find(
      { codechefUsername: { $exists: true, $ne: null } },
      { 
        studentId: 1, 
        name: 1, 
        college: 1, 
        department: 1, 
        codechefUsername: 1,
        codechefProblemsSolved: 1,
        codechefUpdatedAt: 1
      }
    ).lean();

    const leaderboard = students
      .map((student) => ({
        ...student,
        problemsSolvedCount: student.codechefProblemsSolved || 0
      }))
      .sort((a, b) => b.problemsSolvedCount - a.problemsSolvedCount)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));

    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// CodeChef routes
// ---------------------
app.post('/api/codechef/update-username', async (req, res) => {
  try {
    const { studentId, username } = req.body;

    if (!studentId || !username) {
      return res.status(400).json({ error: 'StudentId and username are required' });
    }

    if (typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username cannot be empty' });
    }

    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Fetch CodeChef stats with caching support
    // Pass existing student data for cache validation
    try {
      const cachedData = {
        codechefUsername: student.codechefUsername,
        codechefProblemsSolved: student.codechefProblemsSolved,
        codechefUpdatedAt: student.codechefUpdatedAt
      };

      const codechefData = await fetchCodeChefStats(username.trim(), cachedData);
      
      // Update student record with all fetched stats
      student.codechefUsername = codechefData.username;
      student.codechefProblemsSolved = codechefData.totalSolved || 0;
      student.codechefUpdatedAt = new Date();
      
      console.log('Saving student with CodeChef data:', {
        studentId: student.studentId,
        codechefUsername: student.codechefUsername,
        codechefProblemsSolved: student.codechefProblemsSolved
      });
      
      await student.save();
      
      console.log('Student saved successfully');

      const response = {
        message: codechefData.fromCache 
          ? 'CodeChef username loaded from cache' 
          : 'CodeChef username saved successfully',
        codechefUsername: student.codechefUsername,
        codechefProblemsSolved: student.codechefProblemsSolved,
        fromCache: codechefData.fromCache || false
      };

      // Add warning if profile is private
      if (codechefData.isPrivate) {
        response.warning = codechefData.warning;
      }

      res.json(response);
    } catch (error) {
      // Only return error for invalid username or not found
      if (error.type === 'NOT_FOUND' || error.type === 'INVALID_INPUT') {
        return res.status(400).json({ 
          error: error.message
        });
      }
      // For network errors, return error but don't fail completely
      return res.status(503).json({ 
        error: error.message
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/codechef/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.json({
      codechefUsername: student.codechefUsername || null,
      codechefProblemsSolved: student.codechefProblemsSolved || 0,
      codechefUpdatedAt: student.codechefUpdatedAt || null
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
