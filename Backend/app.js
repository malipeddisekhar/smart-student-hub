require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const passport = require("passport");
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
const { buildStudentProfile, analyzeResumeWithAI, extractTextFromPDF, extractTextFromImage, buildProfileFromResumeText } = require("./utils/resumeAnalyzerAI");
const Notification = require("./models/Notification");
const http = require('http');
const { Server } = require('socket.io');

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

// Helper to escape user input for use in RegExp
function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://sih-smart-student-hub-2.onrender.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Students/teachers join a room based on their userId
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`👤 ${userId} joined room`);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

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
connectDB().then(() => {
  console.log("DB connected, starting server...");

  server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log('🔌 Socket.IO ready for real-time notifications');
    // Run first auto-refresh 1 minute after server starts
    setTimeout(autoRefreshAllStats, 60 * 1000);
    // Then every 30 minutes
    setInterval(autoRefreshAllStats, 30 * 60 * 1000);
    console.log('🔄 Auto-refresh scheduled: every 30 minutes');
  });
}).catch((err) => {
  console.error("Failed to connect DB ❌", err);
  process.exit(1);
});

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

// Session configuration for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport and configure Microsoft OAuth strategy
require('./config/passport')(app);

// Mount authentication routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

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
    const admin = await Admin.findOne({ email: new RegExp('^' + escapeRegExp(email) + '$', 'i') });
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
    const student = await Student.findOne({ email: new RegExp('^' + escapeRegExp(email) + '$', 'i') });
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
    const teacher = await Teacher.findOne({ email: new RegExp('^' + escapeRegExp(email) + '$', 'i') });
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
    const { feedback, teacherId, teacherName } = req.body;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const cert = (student.academicCertificates || []).find(c => String(c._id) === String(certificateId));
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });

    cert.status = 'approved';
    cert.feedback = feedback || '';
    cert.reviewedAt = new Date();
    cert.reviewedByTeacherId = teacherId || '';
    cert.reviewedByTeacherName = teacherName || '';
    await student.save();

    // Create notification & message for student
    const senderName = teacherName || 'Faculty';
    const feedbackText = feedback ? `\nFaculty Feedback: ${feedback}` : '';
    const notifTitle = `Certificate Approved: ${cert.certificateName || 'Certificate'}`;
    const notifBody = `Your ${cert.certificateName || 'certificate'} has been approved by ${senderName}.${feedbackText}`;

    const notification = new Notification({
      recipientId: studentId,
      recipientType: 'student',
      type: 'certificate',
      title: notifTitle,
      body: notifBody,
      senderId: teacherId || '',
      senderName,
      link: '/academic-certificates'
    });
    await notification.save();

    const newMessage = new Message({
      senderId: teacherId || '',
      senderName,
      senderType: 'teacher',
      recipients: [{ studentId, studentName: student.name, isRead: false }],
      subject: notifTitle,
      message: notifBody,
      groupId: 'certificate-review',
      groupName: 'Certificate Review'
    });
    await newMessage.save();

    const io = req.app.get('io');
    io.to(studentId).emit('notification', {
      _id: notification._id, type: 'certificate', title: notifTitle,
      body: notifBody, senderName, createdAt: notification.createdAt, isRead: false
    });
    io.to(studentId).emit('new-message', {
      _id: newMessage._id, senderId: teacherId || '', senderName,
      subject: notifTitle, message: notifBody,
      groupName: 'Certificate Review', createdAt: newMessage.createdAt, isRead: false
    });

    res.json({ message: 'Certificate approved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/review/academic-certificates/:studentId/:certificateId/reject', async (req, res) => {
  try {
    const { studentId, certificateId } = req.params;
    const { feedback, teacherId, teacherName } = req.body;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const cert = (student.academicCertificates || []).find(c => String(c._id) === String(certificateId));
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });

    cert.status = 'rejected';
    cert.feedback = feedback || '';
    cert.reviewedAt = new Date();
    cert.reviewedByTeacherId = teacherId || '';
    cert.reviewedByTeacherName = teacherName || '';
    await student.save();

    // Create notification & message for student
    const senderName = teacherName || 'Faculty';
    const feedbackText = feedback ? `\nFaculty Feedback: ${feedback}` : '';
    const notifTitle = `Certificate Rejected: ${cert.certificateName || 'Certificate'}`;
    const notifBody = `Your ${cert.certificateName || 'certificate'} was rejected by ${senderName}.${feedbackText}`;

    const notification = new Notification({
      recipientId: studentId,
      recipientType: 'student',
      type: 'certificate',
      title: notifTitle,
      body: notifBody,
      senderId: teacherId || '',
      senderName,
      link: '/academic-certificates'
    });
    await notification.save();

    const newMessage = new Message({
      senderId: teacherId || '',
      senderName,
      senderType: 'teacher',
      recipients: [{ studentId, studentName: student.name, isRead: false }],
      subject: notifTitle,
      message: notifBody,
      groupId: 'certificate-review',
      groupName: 'Certificate Review'
    });
    await newMessage.save();

    const io = req.app.get('io');
    io.to(studentId).emit('notification', {
      _id: notification._id, type: 'certificate', title: notifTitle,
      body: notifBody, senderName, createdAt: notification.createdAt, isRead: false
    });
    io.to(studentId).emit('new-message', {
      _id: newMessage._id, senderId: teacherId || '', senderName,
      subject: notifTitle, message: notifBody,
      groupName: 'Certificate Review', createdAt: newMessage.createdAt, isRead: false
    });

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
    const { feedback, teacherId, teacherName } = req.body;
    
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
    cert.reviewedByTeacherId = teacherId || '';
    cert.reviewedByTeacherName = teacherName || '';
    await student.save();

    // Create notification & message for student
    const senderName = teacherName || 'Faculty';
    const feedbackText = feedback ? `\nFaculty Feedback: ${feedback}` : '';
    const notifTitle = `Certificate Approved: ${cert.certificateName || 'Certificate'}`;
    const notifBody = `Your ${cert.certificateName || 'certificate'} has been approved by ${senderName}.${feedbackText}`;

    const notification = new Notification({
      recipientId: studentId,
      recipientType: 'student',
      type: 'certificate',
      title: notifTitle,
      body: notifBody,
      senderId: teacherId || '',
      senderName,
      link: '/academic-certificates'
    });
    await notification.save();

    const newMessage = new Message({
      senderId: teacherId || '',
      senderName,
      senderType: 'teacher',
      recipients: [{ studentId, studentName: student.name, isRead: false }],
      subject: notifTitle,
      message: notifBody,
      groupId: 'certificate-review',
      groupName: 'Certificate Review'
    });
    await newMessage.save();

    const io = req.app.get('io');
    io.to(studentId).emit('notification', {
      _id: notification._id, type: 'certificate', title: notifTitle,
      body: notifBody, senderName, createdAt: notification.createdAt, isRead: false
    });
    io.to(studentId).emit('new-message', {
      _id: newMessage._id, senderId: teacherId || '', senderName,
      subject: notifTitle, message: notifBody,
      groupName: 'Certificate Review', createdAt: newMessage.createdAt, isRead: false
    });

    res.json({ message: 'Certificate approved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Updated reject endpoint to check scan status
app.post('/api/review/academic-certificates/:studentId/:certificateId/reject-with-scan', async (req, res) => {
  try {
    const { studentId, certificateId } = req.params;
    const { feedback, teacherId, teacherName } = req.body;
    
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
    cert.reviewedByTeacherId = teacherId || '';
    cert.reviewedByTeacherName = teacherName || '';
    await student.save();

    // Create notification & message for student
    const senderName = teacherName || 'Faculty';
    const feedbackText = feedback ? `\nFaculty Feedback: ${feedback}` : '';
    const notifTitle = `Certificate Rejected: ${cert.certificateName || 'Certificate'}`;
    const notifBody = `Your ${cert.certificateName || 'certificate'} was rejected by ${senderName}.${feedbackText}`;

    const notification = new Notification({
      recipientId: studentId,
      recipientType: 'student',
      type: 'certificate',
      title: notifTitle,
      body: notifBody,
      senderId: teacherId || '',
      senderName,
      link: '/academic-certificates'
    });
    await notification.save();

    const newMessage = new Message({
      senderId: teacherId || '',
      senderName,
      senderType: 'teacher',
      recipients: [{ studentId, studentName: student.name, isRead: false }],
      subject: notifTitle,
      message: notifBody,
      groupId: 'certificate-review',
      groupName: 'Certificate Review'
    });
    await newMessage.save();

    const io = req.app.get('io');
    io.to(studentId).emit('notification', {
      _id: notification._id, type: 'certificate', title: notifTitle,
      body: notifBody, senderName, createdAt: notification.createdAt, isRead: false
    });
    io.to(studentId).emit('new-message', {
      _id: newMessage._id, senderId: teacherId || '', senderName,
      subject: notifTitle, message: notifBody,
      groupName: 'Certificate Review', createdAt: newMessage.createdAt, isRead: false
    });

    res.json({ message: 'Certificate rejected' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Teacher certificate review stats
// ---------------------
app.get('/api/teacher/certificate-stats/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const students = await Student.find({ 'academicCertificates.reviewedByTeacherId': teacherId });
    
    let approved = 0;
    let rejected = 0;
    const recentReviews = [];
    
    for (const student of students) {
      for (const cert of (student.academicCertificates || [])) {
        if (cert.reviewedByTeacherId === teacherId) {
          if (cert.status === 'approved') approved++;
          if (cert.status === 'rejected') rejected++;
          recentReviews.push({
            certificateName: cert.certificateName,
            studentName: student.name,
            studentId: student.studentId,
            status: cert.status,
            reviewedAt: cert.reviewedAt,
            feedback: cert.feedback
          });
        }
      }
    }
    
    // Sort recent reviews by date descending
    recentReviews.sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
    
    res.json({
      approved,
      rejected,
      total: approved + rejected,
      recentReviews: recentReviews.slice(0, 20)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// ---------------------
// Portfolio Data (Resume/Portfolio Editor)
// ---------------------
app.get('/api/portfolio-data/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student.portfolioData || {});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/portfolio-data/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.portfolioData = {
      ...student.portfolioData,
      ...req.body,
      updatedAt: new Date()
    };

    await student.save();
    res.json({ message: 'Portfolio data updated', portfolioData: student.portfolioData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// AI Chatbot
// ============================================
const Groq = require("groq-sdk");
let _groqInstance = null;
function getGroqClient() {
  if (!_groqInstance) {
    _groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groqInstance;
}

const CHATBOT_SYSTEM_PROMPT = `You are "Smart Hub AI", the helpful assistant for the Smart Student Hub platform — an academic management system for college students, teachers, and admins.

You can help students with:
- Navigating the platform (academic records, certificates, projects, profile, portfolio, resume editor, resume analyzer, LeetCode/CodeChef stats)
- Academic guidance (study tips, exam preparation, CGPA improvement)
- Career advice (internships, placements, resume tips, skill development)
- Certificate guidance (how to upload, status tracking — pending/approved/rejected)
- Coding practice (LeetCode, CodeChef tips and problem-solving strategies)
- General college-related questions

Platform features you should know:
1. Academic Records — Students can view semester marks, SGPA, CGPA
2. Academic Certificates — Upload certificates (internship, NPTEL, etc.), teachers review & approve/reject with feedback
3. Personal Achievements — Track personal certificates
4. Profile Management — Update personal details, skills, LinkedIn, GitHub
5. Project Portfolio — Showcase projects with descriptions, tech stack, links
6. Professional Portfolio — Auto-generated portfolio/resume from profile data
7. Resume & Portfolio Editor — Edit resume content in one place
8. AI Resume Analyzer — AI-powered resume analysis with internship recommendations
9. LeetCode & CodeChef Cards — Track coding progress, auto-refreshed stats
10. Messages & Notifications — Real-time notifications from teachers, certificate feedback

Keep responses concise, friendly, and helpful. Use emojis sparingly. If asked about something unrelated to academics/careers/the platform, politely redirect. If you don't know something specific about the platform, say so honestly.`;

app.post('/api/chatbot', async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'Chatbot is not configured. GROQ_API_KEY missing.' });
    }

    const { messages, studentContext } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Build context-aware system message
    let systemMsg = CHATBOT_SYSTEM_PROMPT;
    if (studentContext) {
      systemMsg += `\n\nCurrent student context:\n- Name: ${studentContext.name || 'Unknown'}\n- Student ID: ${studentContext.studentId || 'N/A'}\n- Department: ${studentContext.department || 'N/A'}\n- College: ${studentContext.college || 'N/A'}\n- Year: ${studentContext.year || 'N/A'}, Semester: ${studentContext.semester || 'N/A'}`;
    }

    // Format messages for Groq
    const chatMessages = [
      { role: 'system', content: systemMsg },
      ...messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }))
    ];

    const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"];
    let lastError = null;

    for (const modelName of models) {
      try {
        const completion = await getGroqClient().chat.completions.create({
          messages: chatMessages,
          model: modelName,
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 0.9
        });

        const reply = completion.choices[0]?.message?.content;
        if (reply) {
          return res.json({ reply, model: modelName });
        }
      } catch (err) {
        lastError = err;
        console.log(`[Chatbot] Model ${modelName} failed, trying next...`);
      }
    }

    throw lastError || new Error('All models failed');
  } catch (error) {
    console.error('Chatbot error:', error.message);
    res.status(500).json({ error: 'Failed to get response. Please try again.' });
  }
});

// ============================================
// AI Resume Analysis & Internship Recommendations
// ============================================
app.get('/api/resume-analysis/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Gather all data
    const AcademicCertificate = require('./models/AcademicCertificate');
    const certs = await AcademicCertificate.find({ studentId: student._id });

    const profileData = student.profile || {};
    const portfolioData = student.portfolioData || {};
    const projects = student.projects || [];

    const studentProfile = buildStudentProfile(student, profileData, portfolioData, certs, projects);
    const analysis = await analyzeResumeWithAI(studentProfile);

    res.json({ success: true, analysis, profile: studentProfile });
  } catch (error) {
    console.error('Resume analysis error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to analyze resume' });
  }
});

// Handle uploaded resume files (PDF or images)
app.post('/api/resume-analysis-upload', upload.single('resume'), async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    let resumeText = '';
    const fileType = req.file.mimetype;
    const fileUrl = req.file.path || req.file.secure_url || req.file.url;

    console.log(`[Resume Upload] File type: ${fileType}, URL: ${fileUrl}`);

    // Extract text based on file type
    if (fileType === 'application/pdf') {
      console.log('[Resume Upload] Extracting text from PDF...');
      try {
        resumeText = await extractTextFromPDF(fileUrl);
      } catch (pdfError) {
        console.warn(`[Resume Upload] PDF extraction failed: ${pdfError.message}, attempting fallback...`);
        // Fallback: try alternative PDF extraction
        resumeText = 'Unable to extract text from PDF. Please ensure the PDF contains selectable text (not scanned images).';
      }
    } else if (fileType.startsWith('image/')) {
      console.log('[Resume Upload] Extracting text from image using OCR...');
      try {
        resumeText = await extractTextFromImage(fileUrl);
      } catch (ocrError) {
        console.warn(`[Resume Upload] OCR extraction failed: ${ocrError.message}`);
        resumeText = 'Unable to extract text from image. Please ensure the image is clear and readable.';
      }
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or image.' });
    }

    if (!resumeText || resumeText.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Could not extract text from the uploaded resume. Please check the file quality and ensure it contains readable text.',
        suggestion: fileType === 'application/pdf' ? 'If it\'s a scanned PDF, try converting it to an image for better OCR results.' : 'Try uploading a clearer image or PDF'
      });
    }

    console.log(`[Resume Upload] Extracted ${resumeText.length} characters from resume`);

    // Build profile from extracted resume text
    const studentProfile = buildProfileFromResumeText(resumeText, student);

    // Analyze with AI
    const analysis = await analyzeResumeWithAI(studentProfile);

    res.json({ success: true, analysis, profile: studentProfile });
  } catch (error) {
    console.error('[Resume Upload] Error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to analyze uploaded resume' });
  }
});

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

    // Auto-refresh if data is stale (older than 30 minutes) and username exists
    const THIRTY_MIN = 30 * 60 * 1000;
    const isStale = !student.leetcodeUpdatedAt || (Date.now() - new Date(student.leetcodeUpdatedAt).getTime() > THIRTY_MIN);

    if (student.leetcodeUsername && isStale) {
      try {
        console.log(`🔄 Auto-refreshing LeetCode stats for ${student.leetcodeUsername}`);
        const fresh = await fetchLeetCodeStats(student.leetcodeUsername);
        student.problemsSolved = fresh.totalSolved;
        student.leetcodeUpdatedAt = new Date();
        await student.save();
      } catch (err) {
        console.error('Auto-refresh LeetCode failed:', err.message);
      }
    }

    res.json({
      leetcodeUsername: student.leetcodeUsername || null,
      problemsSolved: student.problemsSolved || 0,
      leetcodeUpdatedAt: student.leetcodeUpdatedAt || null
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Leaderboard with in-memory cache (60s TTL)
// ---------------------
const leaderboardCache = { combined: null, leetcode: null, codechef: null };
const leaderboardCacheTime = { combined: 0, leetcode: 0, codechef: 0 };
const LEADERBOARD_CACHE_TTL = 60 * 1000; // 60 seconds

app.get('/api/leaderboard', async (req, res) => {
  try {
    const now = Date.now();
    if (leaderboardCache.combined && (now - leaderboardCacheTime.combined) < LEADERBOARD_CACHE_TTL) {
      return res.json(leaderboardCache.combined);
    }
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

    leaderboardCache.combined = leaderboard;
    leaderboardCacheTime.combined = Date.now();
    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LeetCode-only leaderboard
app.get('/api/leaderboard/leetcode', async (req, res) => {
  try {
    const now = Date.now();
    if (leaderboardCache.leetcode && (now - leaderboardCacheTime.leetcode) < LEADERBOARD_CACHE_TTL) {
      return res.json(leaderboardCache.leetcode);
    }
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

    leaderboardCache.leetcode = leaderboard;
    leaderboardCacheTime.leetcode = Date.now();
    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CodeChef-only leaderboard
app.get('/api/leaderboard/codechef', async (req, res) => {
  try {
    const now = Date.now();
    if (leaderboardCache.codechef && (now - leaderboardCacheTime.codechef) < LEADERBOARD_CACHE_TTL) {
      return res.json(leaderboardCache.codechef);
    }
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

    leaderboardCache.codechef = leaderboard;
    leaderboardCacheTime.codechef = Date.now();
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

    // Auto-refresh if data is stale (older than 30 minutes) and username exists
    const THIRTY_MIN = 30 * 60 * 1000;
    const isStale = !student.codechefUpdatedAt || (Date.now() - new Date(student.codechefUpdatedAt).getTime() > THIRTY_MIN);

    if (student.codechefUsername && isStale) {
      try {
        console.log(`🔄 Auto-refreshing CodeChef stats for ${student.codechefUsername}`);
        const fresh = await fetchCodeChefStats(student.codechefUsername);
        if (!fresh.error) {
          student.codechefProblemsSolved = fresh.totalSolved || 0;
          student.codechefUpdatedAt = new Date();
          await student.save();
        }
      } catch (err) {
        console.error('Auto-refresh CodeChef failed:', err.message);
      }
    }

    res.json({
      codechefUsername: student.codechefUsername || null,
      codechefProblemsSolved: student.codechefProblemsSolved || 0,
      codechefUpdatedAt: student.codechefUpdatedAt || null
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Manual refresh endpoint — force-fetch latest stats
app.post('/api/codechef/refresh/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!student.codechefUsername) return res.status(400).json({ error: 'No CodeChef username set' });

    const { getCodeChefStats } = require('./utils/codechefService');
    const fresh = await getCodeChefStats(student.codechefUsername);
    if (fresh.error) return res.status(400).json({ error: fresh.error });

    student.codechefProblemsSolved = fresh.totalSolved || 0;
    student.codechefUpdatedAt = new Date();
    await student.save();

    res.json({
      codechefUsername: student.codechefUsername,
      codechefProblemsSolved: student.codechefProblemsSolved,
      codechefUpdatedAt: student.codechefUpdatedAt,
      message: 'Stats refreshed successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Manual refresh endpoint for LeetCode
app.post('/api/leetcode/refresh/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!student.leetcodeUsername) return res.status(400).json({ error: 'No LeetCode username set' });

    const leetcodeData = await fetchLeetCodeStats(student.leetcodeUsername);
    student.problemsSolved = leetcodeData.totalSolved;
    student.leetcodeUpdatedAt = new Date();
    await student.save();

    res.json({
      leetcodeUsername: student.leetcodeUsername,
      problemsSolved: student.problemsSolved,
      leetcodeUpdatedAt: student.leetcodeUpdatedAt,
      message: 'Stats refreshed successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Background auto-refresh: Update all students' coding stats every 30 minutes
// ---------------------
const autoRefreshAllStats = async () => {
  console.log('🔄 [Auto-Refresh] Starting background stats update...');
  try {
    const students = await Student.find({
      $or: [
        { codechefUsername: { $exists: true, $ne: null, $ne: '' } },
        { leetcodeUsername: { $exists: true, $ne: null, $ne: '' } }
      ]
    });

    let updated = 0;
    for (const student of students) {
      // Refresh CodeChef
      if (student.codechefUsername) {
        try {
          const cc = await fetchCodeChefStats(student.codechefUsername, null);
          if (!cc.error) {
            student.codechefProblemsSolved = cc.totalSolved || 0;
            student.codechefUpdatedAt = new Date();
            updated++;
          }
        } catch (e) {
          console.error(`  CodeChef refresh failed for ${student.codechefUsername}:`, e.message);
        }
      }
      // Refresh LeetCode
      if (student.leetcodeUsername) {
        try {
          const lc = await fetchLeetCodeStats(student.leetcodeUsername);
          student.problemsSolved = lc.totalSolved;
          student.leetcodeUpdatedAt = new Date();
          updated++;
        } catch (e) {
          console.error(`  LeetCode refresh failed for ${student.leetcodeUsername}:`, e.message);
        }
      }
      await student.save();
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }
    console.log(`✅ [Auto-Refresh] Updated ${updated} stats for ${students.length} students`);
  } catch (err) {
    console.error('❌ [Auto-Refresh] Error:', err.message);
  }
};

// ---------------------
// Message routes (teacher -> students)
// ---------------------
app.post('/api/messages/send', async (req, res) => {
  try {
    const { senderId, senderName, senderType, groupId, subject, message } = req.body;

    if (!senderId || !senderName || !groupId || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Find the group to get student list
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    // Build recipients from group students
    const students = await Student.find({ studentId: { $in: group.students } });
    const recipients = students.map(s => ({
      studentId: s.studentId,
      studentName: s.name,
      isRead: false
    }));

    // Save message
    const newMessage = new Message({
      senderId,
      senderName,
      senderType: senderType || 'teacher',
      recipients,
      subject,
      message,
      groupId: group._id.toString(),
      groupName: group.name
    });
    await newMessage.save();

    // Create notifications + emit real-time events for each student
    const io = req.app.get('io');
    for (const student of students) {
      const notification = new Notification({
        recipientId: student.studentId,
        recipientType: 'student',
        type: 'message',
        title: `New message: ${subject}`,
        body: message.substring(0, 200),
        senderId,
        senderName,
        link: '/dashboard'
      });
      await notification.save();

      // Push real-time notification to student
      io.to(student.studentId).emit('notification', {
        _id: notification._id,
        type: 'message',
        title: notification.title,
        body: notification.body,
        senderName,
        createdAt: notification.createdAt,
        isRead: false
      });

      // Also emit the new message itself
      io.to(student.studentId).emit('new-message', {
        _id: newMessage._id,
        senderId,
        senderName,
        subject,
        message,
        groupName: group.name,
        createdAt: newMessage.createdAt,
        isRead: false
      });
    }

    res.status(201).json({ message: 'Message sent successfully', messageId: newMessage._id });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get messages for a student
app.get('/api/messages/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const messages = await Message.find({ 'recipients.studentId': studentId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Map to include isRead status for this student
    const formatted = messages.map(msg => {
      const recipient = msg.recipients.find(r => r.studentId === studentId);
      return {
        _id: msg._id,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderType: msg.senderType,
        subject: msg.subject,
        message: msg.message,
        groupName: msg.groupName,
        createdAt: msg.createdAt,
        isRead: recipient?.isRead || false,
        readAt: recipient?.readAt || null
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get unread message count for a student
app.get('/api/messages/unread-count/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const messages = await Message.find({
      'recipients': {
        $elemMatch: { studentId, isRead: false }
      }
    });
    res.json({ unreadCount: messages.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark message as read
app.put('/api/messages/:messageId/read/:studentId', async (req, res) => {
  try {
    const { messageId, studentId } = req.params;
    await Message.updateOne(
      { _id: messageId, 'recipients.studentId': studentId },
      { $set: { 'recipients.$.isRead': true, 'recipients.$.readAt': new Date() } }
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------
// Notification routes
// ---------------------

// Get notifications for a user
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get unread notification count
app.get('/api/notifications/unread-count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Notification.countDocuments({ recipientId: userId, isRead: false });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark single notification as read
app.put('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { isRead: true, readAt: new Date() });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark all notifications as read for a user
app.put('/api/notifications/mark-all-read/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Teacher sends individual feedback to a student (creates notification)
app.post('/api/feedback/send', async (req, res) => {
  try {
    const { senderId, senderName, studentId, subject, message } = req.body;
    if (!senderId || !senderName || !studentId || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Save as a direct message (1-to-1)
    const newMessage = new Message({
      senderId,
      senderName,
      senderType: 'teacher',
      recipients: [{ studentId: student.studentId, studentName: student.name, isRead: false }],
      subject,
      message,
      groupId: 'direct',
      groupName: 'Direct Feedback'
    });
    await newMessage.save();

    // Create notification
    const notification = new Notification({
      recipientId: student.studentId,
      recipientType: 'student',
      type: 'feedback',
      title: `Feedback from ${senderName}: ${subject}`,
      body: message.substring(0, 200),
      senderId,
      senderName,
      link: '/dashboard'
    });
    await notification.save();

    // Push real-time
    const io = req.app.get('io');
    io.to(student.studentId).emit('notification', {
      _id: notification._id,
      type: 'feedback',
      title: notification.title,
      body: notification.body,
      senderName,
      createdAt: notification.createdAt,
      isRead: false
    });
    io.to(student.studentId).emit('new-message', {
      _id: newMessage._id,
      senderId,
      senderName,
      subject,
      message,
      groupName: 'Direct Feedback',
      createdAt: newMessage.createdAt,
      isRead: false
    });

    res.status(201).json({ message: 'Feedback sent successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
