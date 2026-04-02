const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const Teacher = require('../models/Teacher');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not found in Backend/.env');
  process.exit(1);
}

async function clearTeachers() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: process.env.MONGO_DB_NAME || undefined });
    
    console.log('Connected to MongoDB');
    
    // Get count before deletion
    const countBefore = await Teacher.countDocuments();
    console.log(`Teachers before deletion: ${countBefore}`);
    
    // Delete all teachers
    const result = await Teacher.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} teacher(s)`);
    
    // Verify deletion
    const countAfter = await Teacher.countDocuments();
    console.log(`Teachers after deletion: ${countAfter}`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error clearing teachers:', error.message);
    process.exit(1);
  }
}

clearTeachers();
