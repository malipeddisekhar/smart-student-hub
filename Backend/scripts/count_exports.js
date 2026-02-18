const fs = require('fs');
const path = require('path');
const folder = path.resolve(__dirname, '..', 'data', 'exports');
const files = ['CSE.json','AIML.json','AIDS.json'];
for (const f of files) {
  const p = path.join(folder, f);
  if (!fs.existsSync(p)) { console.log(f, 'missing'); continue; }
  const data = JSON.parse(fs.readFileSync(p,'utf8'));
  console.log(f, data.length);
}
