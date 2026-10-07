const fs = require('fs');

function rewriteCourses() {
    let code = fs.readFileSync('src/pages/Courses.tsx', 'utf8');

    // Add imports
    if (!code.includes('CertificateEditorModal')) {
        code = code.replace(
            `import { Plus, Search, Filter, BookOpen, Clock, Users, MoreVertical, Edit2, Trash2, Calendar, FileText, CheckCircle, XCircle, FileSpreadsheet, Download, RefreshCw, Upload, Image as ImageIcon, Laptop } from 'lucide-react';`,
            `import { Plus, Search, Filter, BookOpen, Clock, Users, MoreVertical, Edit2, Trash2, Calendar, FileText, CheckCircle, XCircle, FileSpreadsheet, Download, RefreshCw, Upload, Image as ImageIcon, Laptop } from 'lucide-react';\nimport CertificateEditorModal from '../components/CertificateEditorModal';`
        );
    }

    // Add state variables inside Courses function
    if (!code.includes('isCertModalOpen')) {
        code = code.replace(
            /const \[isAddModalOpen, setIsAddModalOpen\] = useState\(false\);/,
            `const [isAddModalOpen, setIsAddModalOpen] = useState(false);\n    const [isCertModalOpen, setIsCertModalOpen] = useState(false);\n    const [certModalData, setCertModalData] = useState<any>(null);`
        );
    }

    // Rewrite generateCertificate function to open modal instead of Swal
    const oldGenCertRegex = /const generateCertificate = async \(enrollment: any, course: any\) => \{[\s\S]*?handlePrintCertificate\(data\);\s*\}\s*\};/;
    
    const newGenCert = `const generateCertificate = (enrollment: any, course: any) => {
        const studentName = enrollment.isOutsider ? enrollment.outsiderDetails?.name : students.find((s:any) => s.id === enrollment.studentId)?.name;
        
        const defaultNarrative = \`Has successfully completed the professional computer course in <strong>\${course?.title || 'Technology'}</strong>. This certificate recognizes your dedication and technical excellence.\`;

        setCertModalData({
            enrollment,
            course,
            studentName: studentName || 'Unknown Student',
            courseName: course?.title || 'Unknown Course',
            initialNarrative: defaultNarrative
        });
        setIsCertModalOpen(true);
    };

    const handleGenerateCertificateWithCustomText = (customHTML: string) => {
        if (!certModalData) return;
        
        const data = {
            type: 'course',
            student: { name: certModalData.studentName },
            course: certModalData.courseName,
            customNarrative: customHTML
        };
        handlePrintCertificate(data);
    };`;

    code = code.replace(oldGenCertRegex, newGenCert);

    // Inject <CertificateEditorModal /> at the end of the return statement, just before the last </div>
    if (!code.includes('<CertificateEditorModal')) {
        const modalJSX = `
            {certModalData && (
                <CertificateEditorModal
                    isOpen={isCertModalOpen}
                    onClose={() => setIsCertModalOpen(false)}
                    initialNarrative={certModalData.initialNarrative}
                    studentName={certModalData.studentName}
                    courseName={certModalData.courseName}
                    onGenerate={handleGenerateCertificateWithCustomText}
                />
            )}
        </div>
    );
};`;
        code = code.replace(/<\/div>\s*\);\s*};\s*export default Courses;/, modalJSX + '\nexport default Courses;');
    }

    fs.writeFileSync('src/pages/Courses.tsx', code);
    console.log('Courses.tsx updated with Advanced Certificate Modal!');
}

rewriteCourses();
