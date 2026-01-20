const mongoose = require("mongoose");

const academicCertificateSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  feedback: { type: String },
  uploadedAt: { type: Date, default: Date.now },
  
  // Scan-based verification fields
  scanStatus: { 
    type: String, 
    enum: ["not_scanned", "scanning", "scanned"], 
    default: "not_scanned" 
  },
  scanResult: { 
    type: String, 
    enum: ["AUTO_VERIFIED", "AUTO_REJECTED", "SOURCE_NOT_DIGITALLY_VERIFIABLE", null], 
    default: null 
  },
  scannedAt: { type: Date },
  scannedByTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  certificateHash: { type: String }, // SHA-256 hash for tampering detection
  
  // Verification details
  verificationDetails: {
    qrCodeFound: { type: Boolean, default: false },
    qrCodeData: { type: String },
    verificationUrl: { type: String },
    extractedStudentName: { type: String },
    extractedCourseName: { type: String },
    urlVerificationStatus: { type: String }, // 'success', 'failed', 'not_attempted'
    tamperingDetected: { type: Boolean, default: false },
    verificationNotes: { type: String }
  }
});

module.exports = mongoose.model("AcademicCertificate", academicCertificateSchema);