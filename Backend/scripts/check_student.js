const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const Student = require('../models/Student');

async function main() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }

  const emailArg = process.argv[2] || '23341A4565@gmrit.edu.in';
  await mongoose.connect(MONGO_URI, { dbName: process.env.MONGO_DB_NAME || undefined });

  let student = await Student.findOne({ email: emailArg }).lean();
  if (!student) {
    // try rollNumber lookup (case-insensitive) by extracting roll from email
    const rollMatch = (emailArg || '').split('@')[0];
    if (rollMatch) {
      student = await Student.findOne({ rollNumber: new RegExp('^' + rollMatch + '$', 'i') }).lean();
    }
  }

  if (!student) {
    // try studentId
    const rollMatch = (emailArg || '').split('@')[0];
    if (rollMatch) {
      student = await Student.findOne({ studentId: new RegExp('^' + rollMatch + '$', 'i') }).lean();
    }
  }

  if (!student) {
    console.error('Student not found for', emailArg);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log('Found student:');
  console.log('  _id:', student._id);
  console.log('  studentId:', student.studentId);
  console.log('  rollNumber:', student.rollNumber);
  console.log('  email:', student.email);
  console.log('  authProvider:', student.authProvider);
  console.log('  password (first 60 chars):', (student.password || '').toString().slice(0,60));
  console.log('  password looks like bcrypt:', typeof student.password === 'string' && student.password.startsWith('$2'));

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
