const fs = require('fs');
let text = fs.readFileSync('src/pages/Courses.tsx', 'utf8');

// The old function is entirely this block:
const startStr = "const generateCertificate = (enrollment: any, course: any) => {";
const endStr = "printWindow.print();\n    };";

const startIndex = text.indexOf(startStr);
const endIndex = text.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
    const newFunc = `const generateCertificate = (enrollment: any, course: any) => {
        const studentName = enrollment.isOutsider ? enrollment.outsiderDetails?.name : students.find(s => s.id === enrollment.studentId)?.name;
        setCertificateData({
            studentName: studentName || 'Unknown Student',
            courseName: course?.title || 'Unknown Course',
            enrollmentDate: enrollment.enrollmentDate
        });
        setIsCertificateOpen(true);
    };`;
    
    text = text.substring(0, startIndex) + newFunc + text.substring(endIndex);
    fs.writeFileSync('src/pages/Courses.tsx', text);
    console.log("Successfully replaced generateCertificate");
} else {
    console.log("Could not find start or end index", startIndex, text.indexOf(endStr));
}
