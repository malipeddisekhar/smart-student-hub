const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: __dirname + '/../.env' });
const Student = require('../models/Student');

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }
  await mongoose.connect(uri);

  const email = 'test.student@local';
  const plain = 'Test@1234';
  const hash = await bcrypt.hash(plain, 10);

  const doc = {
    name: 'Test Student',
    email,
    password: hash,
    college: 'JNTU',
    department: 'Computer Science and Engineering',
    studentId: 'TEST0001',
    rollNumber: 'TEST0001',
    year: 2023,
    semester: 1,
    section: 'T'
  };

  const u = await Student.findOneAndUpdate({ email }, { $set: doc }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('Upserted test user:', u.email);
  await mongoose.disconnect();
  console.log('Done');
}

main().catch(err=>{ console.error(err); process.exit(1); });
