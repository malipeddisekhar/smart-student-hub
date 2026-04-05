const mongoose = require('mongoose');

const generateStudentId = (college) => {
  const initials = college.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return initials + randomStr;
};

const academicCertificateSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    enum: ['internship', 'skill', 'event', 'workshop']
  },
  certificateName: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  certificateUrl: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  issuedBy: {
    type: String,
    required: true
  },
  description: String,
  skills: [String],
  duration: String,
  location: String,
  organizationType: {
    type: String,
    enum: ['corporate', 'educational', 'government', 'ngo']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  feedback: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedByTeacherId: { type: String },
  reviewedByTeacherName: { type: String },
  
  // Scan-based verification fields
  scanStatus: { 
    type: String, 
    enum: ['not_scanned', 'scanning', 'scanned'], 
    default: 'not_scanned' 
  },
  scanResult: { 
    type: String, 
    enum: ['AUTO_VERIFIED', 'AUTO_REJECTED', 'SOURCE_NOT_DIGITALLY_VERIFIABLE', null], 
    default: null 
  },
  scannedAt: { type: Date },
  scannedByTeacherId: { type: String },
  certificateHash: { type: String },
  
  // Verification details
  verificationDetails: {
    qrCodeFound: { type: Boolean, default: false },
    qrCodeData: { type: String },
    verificationUrl: { type: String },
    extractedStudentName: { type: String },
    extractedCourseName: { type: String },
    urlVerificationStatus: { type: String },
    tamperingDetected: { type: Boolean, default: false },
    verificationNotes: { type: String }
  }
}, {
  timestamps: true
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  githubLink: {
    type: String,
    required: true
  },
  deployLink: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensures no duplicate emails - single source of truth
  },
  password: {
    type: String,
    required: false // Allow OAuth users to not have password
  },
  microsoftId: {
    type: String,
    sparse: true, // Allows null values while maintaining uniqueness for non-null values
    unique: true
  },
  isVerified: {
    type: Boolean,
    default: false // Set to true for OAuth users
  },
  authProvider: {
    type: String,
    enum: ['local', 'microsoft', 'google'],
    default: 'local'
  },
  college: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  section: {
    type: String,
    default: null
  },
  year: {
    type: Number,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  profile: {
    profileImage: String,
    aadharNumber: String,
    mobileNumber: String,
    collegeEmail: String,
    class10Certificate: String,
    class12Certificate: String,
    diplomaCertificate: String,
    bachelorDegree: String,
    masterDegree: String,
    doctorDegree: String,
    linkedinProfile: String,
    githubProfile: String,
    currentSGPA: { type: Number, default: 0 },
    overallCGPA: { type: Number, default: 0 }
  },
  academicCertificates: { type: [academicCertificateSchema], default: [] },
  projects: { type: [projectSchema], default: [] },
  skills: {
    type: Object,
    default: {}
  },
  semesterMarks: {
    type: [{
      semester: { type: Number, required: true },
      year: { type: Number, required: true },
      sgpa: { type: Number, required: true },
      subjects: {
        type: [{
          name: { type: String, required: true },
          marks: { type: Number, required: true },
          grade: { type: String, required: true }
        }],
        default: []
      }
    }],
    default: []
  },
  cgpa: { type: Number, default: 0 },
  leetcodeUsername: {
    type: String,
    default: null
  },
  problemsSolved: {
    type: Number,
    default: 0
  },
  leetcodeUpdatedAt: {
    type: Date,
    default: null
  },
  codechefUsername: {
    type: String,
    default: null
  },
  codechefProblemsSolved: {
    type: Number,
    default: 0
  },
  codechefUpdatedAt: {
    type: Date,
    default: null
  },
  portfolioData: {
    aboutMe: { type: String, default: '' },
    headline: { type: String, default: '' },
    objectiveSummary: { type: String, default: '' },
    customSkills: [String],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startYear: String,
      endYear: String,
      gpa: String,
      description: String
    }],
    experience: [{
      title: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      current: { type: Boolean, default: false },
      description: String
    }],
    customProjects: [{
      title: String,
      description: String,
      technologies: String,
      githubLink: String,
      deployLink: String
    }],
    awards: [{
      title: String,
      issuer: String,
      date: String,
      description: String
    }],
    languages: [String],
    hobbies: [String],
    updatedAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

studentSchema.pre('save', function(next) {
  if (!this.studentId) {
    this.studentId = generateStudentId(this.college);
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);