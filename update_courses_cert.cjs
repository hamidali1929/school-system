const fs = require('fs');
let text = fs.readFileSync('src/pages/Courses.tsx', 'utf8');

// 1. Add import
if (!text.includes("import { CertificateGenerator }")) {
  text = text.replace(
    "import { Plus, Users, Search, BookOpen, Clock, ChevronRight, X, GraduationCap, Award, Building2 } from 'lucide-react';",
    "import { Plus, Users, Search, BookOpen, Clock, ChevronRight, X, GraduationCap, Award, Building2 } from 'lucide-react';\nimport { CertificateGenerator } from '../components/CertificateGenerator';"
  );
}

// 2. Add state inside Courses component
if (!text.includes("const [isCertificateOpen, setIsCertificateOpen]")) {
  text = text.replace(
    "const [externalForm, setExternalForm] = useState",
    "const [isCertificateOpen, setIsCertificateOpen] = useState(false);\n    const [certificateData, setCertificateData] = useState({ studentName: '', courseName: '', enrollmentDate: '' });\n    const [externalForm, setExternalForm] = useState"
  );
}

// 3. Replace generateCertificate function
const oldGenerateCert = /const generateCertificate = \([\s\S]*?w\.print\(\);\n        \};/m;
const newGenerateCert = `const generateCertificate = (enrollment: any, course: any) => {
        const studentName = enrollment.isOutsider ? enrollment.outsiderDetails?.name : students.find(s => s.id === enrollment.studentId)?.name;
        setCertificateData({
            studentName: studentName || 'Unknown Student',
            courseName: course?.title || 'Unknown Course',
            enrollmentDate: enrollment.enrollmentDate
        });
        setIsCertificateOpen(true);
    };`;

text = text.replace(oldGenerateCert, newGenerateCert);

// 4. Add the component before the closing div
if (!text.includes("<CertificateGenerator")) {
  text = text.replace(
    "</div>\n        </div>\n    );\n}",
    `    <CertificateGenerator
                isOpen={isCertificateOpen}
                onClose={() => setIsCertificateOpen(false)}
                studentName={certificateData.studentName}
                courseName={certificateData.courseName}
                enrollmentDate={certificateData.enrollmentDate}
                logoUrl={settings.logo1}
            />\n        </div>\n        </div>\n    );\n}`
  );
}

fs.writeFileSync('src/pages/Courses.tsx', text);
