const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const Student = require('../models/Student');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not found in Backend/.env');
  process.exit(1);
}

const dataPath = process.argv[2] || path.resolve(__dirname, '..', 'data', 'students.txt');

const allowed = new Set(['CE','ME','EEE','ECE','IT','CSE','AIML','AIDS']);

// Accept optional CLI arg to continue after a specific roll
// Usage: node import_students.js --continue-after=23341A0504
const rawArgs = process.argv.slice(2);
let continueAfter = null;
for (const a of rawArgs) {
  if (a.startsWith('--continue-after=')) {
    continueAfter = a.split('=')[1].toUpperCase();
  } else if (a.startsWith('--start-roll=')) {
    continueAfter = a.split('=')[1].toUpperCase();
  }
}

function normalizeBranch(code) {
  if (!code) return null;
  const c = code.toUpperCase();
  return allowed.has(c) ? c : null;
}

async function run() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l && !/^JNTU/i.test(l) && !/^No\b/i.test(l) && !/^\.{3}/.test(l));

  await mongoose.connect(MONGO_URI, { dbName: process.env.MONGO_DB_NAME || undefined });

  // Fix existing documents that have null or missing studentId to avoid unique-index conflicts
  try {
    const nulls = await Student.find({ $or: [{ studentId: null }, { studentId: { $exists: false } }] }).lean();
    for (const ns of nulls) {
      const newStudentId = ns.rollNumber || ns._id.toString();
      try {
        await Student.updateOne({ _id: ns._id }, { $set: { studentId: newStudentId } });
      } catch (e) {
        console.error('Failed to migrate studentId for', ns._id, e.message);
      }
    }
  } catch (e) {
    console.error('Migration step failed:', e.message);
  }

  let inserted = 0, updated = 0, skipped = 0, errors = 0;

  let seenStart = continueAfter ? false : true; // if continueAfter provided, wait until we see it
  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length < 3) continue;
    const roll = parts[0];
    const admn = parts[1];
    const name = parts.slice(2).join(' ').trim();

    if (!roll || !admn) continue;

    const branchCode = admn.split('-')[0];
    const branch = normalizeBranch(branchCode);
    // Resume control: if continueAfter set, skip until after that roll
    if (!seenStart) {
      if (roll.toUpperCase() === continueAfter) {
        seenStart = true; // start after this
        continue; // skip the continueAfter roll itself
      }
      skipped++;
      continue;
    }

    if (!branch) { skipped++; continue; }

    const email = `${roll.toLowerCase()}@gmrit.edu.in`;
    const plainPassword = roll; // per your request: password == roll

    const doc = {
      studentId: roll,
      name: name || roll,
      email,
      password: plainPassword,
      year: 3,
      semester: 6,
      college: 'gmrit',
      department: branch,
      rollNumber: roll,
      authProvider: 'local'
    };

    try {
      const existing = await Student.findOne({ rollNumber: roll });
      if (existing) {
        await Student.updateOne({ _id: existing._id }, { $set: doc });
        updated++;
      } else {
        const s = new Student(doc);
        await s.save();
        inserted++;
      }
    } catch (e) {
      console.error('Error upserting', roll, e.message);
      errors++;
    }
  }

  console.log(`Import finished. inserted/updated=${inserted} skipped=${skipped} errors=${errors}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
