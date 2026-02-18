const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Student = require('../models/Student');

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not found in .env');
    process.exit(1);
  }
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const depts = ['CSE','AIML','AIDS'];
  const deptMap = {
    CSE: 'Computer Science and Engineering',
    AIML: 'Artificial Intelligence & Machine Learning',
    AIDS: 'Artificial Intelligence & Data Science'
  };

  const results = {};
  const fs = require('fs');
  const outDir = __dirname + '/../data/exports';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const code of depts) {
    const full = deptMap[code] || code;
    const query = { $or: [{ department: code }, { department: full }, { department: new RegExp(code, 'i') }] };

    const count = await Student.countDocuments(query);
    const samples = await Student.find(query).limit(5).lean();
    results[code] = { count, samples };

    const docs = await Student.find(query).lean();
    const p = `${outDir}/${code}.json`;
    fs.writeFileSync(p, JSON.stringify(docs, null, 2));
  }

  console.log(JSON.stringify(results, null, 2));
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
