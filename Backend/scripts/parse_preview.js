const fs = require('fs');
const path = require('path');
const dataPath = process.argv[2] || path.resolve(__dirname, '..', 'data', 'students.txt');
const raw = fs.readFileSync(dataPath, 'utf8');
const lines = raw.split(/\r?\n/).map(l=>l.trim()).filter(l=>l && !/^JNTU/i.test(l));
const studentsByBranch = {};
for (const line of lines) {
  const parts = line.split(/\s+/);
  if (parts.length < 3) continue;
  const roll = parts[0];
  const admn = parts[1];
  const admnParts = admn.split('-');
  const deptCode = admnParts[0] || 'DEFAULT';
  if (!studentsByBranch[deptCode]) studentsByBranch[deptCode] = 0;
  studentsByBranch[deptCode]++;
}
console.log(studentsByBranch);
