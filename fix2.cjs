const fs = require('fs');
let code = fs.readFileSync('src/pages/Courses.tsx', 'utf8');

// Replace in generateCertificate
const genCertOrig = `const data = {
            type: 'course',
            schoolName: settings.schoolName,
            student: { name: studentName || 'Unknown Student' },
            course: course?.title || 'Unknown Course',
            customNarrative: narrative,
            serialNumber: \`CERT-\${Math.random().toString(36).substr(2, 9).toUpperCase()}\`
        };`;

const genCertNew = `const phone = enrollment.isOutsider ? enrollment.outsiderDetails?.phone : students.find((s:any) => s.id === enrollment.studentId)?.rollNumber;
        const data = {
            type: 'course',
            schoolName: settings.schoolName,
            student: { name: studentName || 'Unknown Student' },
            course: course?.title || 'Unknown Course',
            customNarrative: narrative,
            duration: course?.duration,
            phone: phone,
            grade: 'A+',
            serialNumber: \`CERT-\${Math.random().toString(36).substr(2, 9).toUpperCase()}\`
        };`;

code = code.replace(genCertOrig, genCertNew);

// Replace in handleBulkGenerate
const bulkGenOrig = `return {
                  type: 'course',
                  schoolName: settings.schoolName,
                  student: { name: studentName || 'Unknown Student' },
                  course: course?.title || 'Unknown Course',
                  customNarrative: narrative,
                  serialNumber: \`CERT-\${Math.random().toString(36).substr(2, 9).toUpperCase()}\`
              };`;

const bulkGenNew = `const phone = enrollment.isOutsider ? enrollment.outsiderDetails?.phone : students.find((s:any) => s.id === enrollment.studentId)?.rollNumber;
              return {
                  type: 'course',
                  schoolName: settings.schoolName,
                  student: { name: studentName || 'Unknown Student' },
                  course: course?.title || 'Unknown Course',
                  customNarrative: narrative,
                  duration: course?.duration,
                  phone: phone,
                  grade: 'A+',
                  serialNumber: \`CERT-\${Math.random().toString(36).substr(2, 9).toUpperCase()}\`
              };`;

code = code.replace(bulkGenOrig, bulkGenNew);

fs.writeFileSync('src/pages/Courses.tsx', code);
console.log('Replaced JS object logic');
