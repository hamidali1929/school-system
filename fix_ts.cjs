const fs = require('fs');
let text = fs.readFileSync('src/pages/Courses.tsx', 'utf8');

// Fix feePaid
text = text.replace(/feePaid: true/g, '');

// Fix Active -> Ongoing
text = text.replace(/status: 'Active'/g, "status: 'Ongoing'");

// Fix capacity cast
text = text.replace(/course\.capacity/g, '(course as any).capacity');

// Fix rollNumber
text = text.replace(/std\?\.rollNumber/g, 'std?.id'); // fallback to ID

fs.writeFileSync('src/pages/Courses.tsx', text);
