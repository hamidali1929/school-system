const fs = require('fs');
let text = fs.readFileSync('src/pages/Courses.tsx', 'utf8');
text = text.replace(/\\`/g, '`');
fs.writeFileSync('src/pages/Courses.tsx', text);
