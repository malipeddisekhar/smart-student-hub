const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const Student = require('../models/Student');

async function main() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { dbName: process.env.MONGO_DB_NAME || undefined });

  const cursor = Student.find().cursor();
  let updated = 0, skipped = 0, errors = 0;

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    try {
      const pwd = doc.password || '';
      // If password already looks like bcrypt hash ($2a$ or $2b$ etc), skip
      if (typeof pwd === 'string' && pwd.startsWith('$2')) {
        skipped++;
        continue;
      }

      // If password equals rollNumber (imported), hash it
      const toHash = String(doc.rollNumber || pwd || doc.studentId || '');
      if (!toHash) { skipped++; continue; }

      const hashed = await bcrypt.hash(toHash, 10);
      await Student.updateOne({ _id: doc._id }, { $set: { password: hashed } });
      updated++;
    } catch (e) {
      console.error('Failed hashing for', doc._id, e.message);
      errors++;
    }
  }

  console.log(`Hashing complete. updated=${updated} skipped=${skipped} errors=${errors}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
