const fs = require('fs');

function fixCourses() {
    let code = fs.readFileSync('src/pages/Courses.tsx', 'utf8');

    // 1. Add Import
    if (!code.includes('CertificateEditorModal')) {
        code = code.replace(
            /import Swal from 'sweetalert2';/,
            `import Swal from 'sweetalert2';\nimport CertificateEditorModal from '../components/CertificateEditorModal';`
        );
    }

    // 2. Add State
    if (!code.includes('isCertModalOpen')) {
        code = code.replace(
            /const \[activeTab, setActiveTab\] = useState<'catalog' \| 'enrollments'>\('catalog'\);/,
            `const [activeTab, setActiveTab] = useState<'catalog' | 'enrollments'>('catalog');\n    const [isCertModalOpen, setIsCertModalOpen] = useState(false);\n    const [certModalData, setCertModalData] = useState<any>(null);`
        );
    }

    // 3. Add Component at the end
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
        // Replace last </div> ); };
        code = code.replace(/<\/div>\s*\);\s*};\s*$/, modalJSX + '\n');
    }

    fs.writeFileSync('src/pages/Courses.tsx', code);
    console.log('Fixed Courses.tsx');
}

fixCourses();
