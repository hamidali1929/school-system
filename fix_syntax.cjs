const fs = require('fs');
let text = fs.readFileSync('src/pages/Courses.tsx', 'utf8');
text = text.replace(/style=\{\{ width: \\\`\\\$\{/g, 'style={{ width: `${');
text = text.replace(/\}\%\\\` \}\}/g, '}%` }}');
text = text.replace(/Roll: \\\$\{std\.rollNumber\}/g, 'Roll: ${std.rollNumber}');
fs.writeFileSync('src/pages/Courses.tsx', text);
