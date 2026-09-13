const fs = require('fs');
let lines = fs.readFileSync('src/pages/Courses.tsx', 'utf8').split('\n');
const lastDivIndex = lines.findLastIndex(l => l.includes('</div>'));

if (lastDivIndex !== -1) {
    const codeToInject = `            <CertificateGenerator
                isOpen={isCertificateOpen}
                onClose={() => setIsCertificateOpen(false)}
                studentName={certificateData.studentName}
                courseName={certificateData.courseName}
                enrollmentDate={certificateData.enrollmentDate}
                logoUrl={settings.logo1}
            />`;
    
    lines.splice(lastDivIndex, 0, codeToInject);
    fs.writeFileSync('src/pages/Courses.tsx', lines.join('\n'));
    console.log("Injected CertificateGenerator!");
} else {
    console.log("Could not find </div>");
}
