const fs = require('fs');
let text = fs.readFileSync('src/pages/Courses.tsx', 'utf8');

// Match everything from 'const generateCertificate = ' up to 'printWindow.print();\n    };' or 'printWindow.print();\r\n    };'
const regex = /const generateCertificate = \([\s\S]*?printWindow\.print\(\);\r?\n\s*\};/;

const newFunc = `const generateCertificate = (enrollment: any, course: any) => {
        const studentName = enrollment.isOutsider ? enrollment.outsiderDetails?.name : students.find(s => s.id === enrollment.studentId)?.name;
        setCertificateData({
            studentName: studentName || 'Unknown Student',
            courseName: course?.title || 'Unknown Course',
            enrollmentDate: enrollment.enrollmentDate
        });
        setIsCertificateOpen(true);
    };`;

text = text.replace(regex, newFunc);

fs.writeFileSync('src/pages/Courses.tsx', text);
console.log("Successfully ran regex replacement");
