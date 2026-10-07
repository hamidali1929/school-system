const fs = require('fs');

let code = fs.readFileSync('src/pages/Courses.tsx', 'utf-8');

// 1. Imports
if (!code.includes('Edit2')) {
    code = code.replace(/import \{ Laptop, Plus, Users, Award, Trash2, X, Search, CheckCircle2 \} from 'lucide-react';/, 
        "import { Laptop, Plus, Users, Award, Trash2, X, Search, CheckCircle2, Edit2, Printer } from 'lucide-react';\nimport CertificateEditorModal from '../components/CertificateEditorModal';");
}

// 2. Add States and Methods
if (!code.includes('isCertModalOpen')) {
    const stateAnchor = `const [activeTab, setActiveTab] = useState<'catalog' | 'enrollments'>('catalog');`;
    code = code.replace(stateAnchor, `${stateAnchor}\n    const [isCertModalOpen, setIsCertModalOpen] = useState(false);\n    const [certModalData, setCertModalData] = useState({ initialNarrative: '', studentName: '' });`);
}

// Ensure updateSettings is extracted
if (!code.includes('updateSettings, skillCourses')) {
    code = code.replace(/const \{ settings, updateSettings, skillCourses/, 'const { settings, updateSettings, skillCourses'); // Just checking if it exists
}

// Add the missing methods
if (!code.includes('handleBulkGenerate')) {
    const methodsAnchor = `const generateCertificate = (enrollment: any, course: any) => {`;
    const newMethods = `
    const getDefaultNarrative = () => {
        return settings.certificateTemplate || "Has successfully completed the professional computer course in <strong>[COURSE_NAME]</strong>. This certificate recognizes your dedication and technical excellence.";
    };

    const handleBulkGenerate = () => {
        if (courseEnrollments.length === 0) {
            Swal.fire('Error', 'No enrollments found to generate certificates.', 'error');
            return;
        }

        const certificatesData = courseEnrollments.map((enrollment: any) => {
            const course = skillCourses.find(c => c.id === enrollment.courseId);
            const studentName = enrollment.isOutsider ? enrollment.outsiderDetails?.name : students.find((s:any) => s.id === enrollment.studentId)?.name;
            
            let narrative = getDefaultNarrative();
            narrative = narrative.replace(/\\[COURSE_NAME\\]/g, course?.title || 'Technology');
            narrative = narrative.replace(/\\[STUDENT_NAME\\]/g, studentName || 'Student');

            return {
                type: 'course',
                schoolName: settings.schoolName,
                student: { name: studentName || 'Unknown Student' },
                course: course?.title || 'Unknown Course',
                customNarrative: narrative,
                serialNumber: \`CERT-\${Math.random().toString(36).substr(2, 9).toUpperCase()}\`
            };
        });

        handlePrintCertificate(certificatesData);
    };

    const handleSaveTemplate = (customHTML: string) => {
        updateSettings({ certificateTemplate: customHTML });
        Swal.fire('Saved', 'Certificate template updated successfully!', 'success');
        setIsCertModalOpen(false);
    };

    const generateCertificate = (enrollment: any, course: any) => {`;
    code = code.replace(methodsAnchor, newMethods);
}

// 3. Update the JSX for buttons
const enrollHeaderOld = `<div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black uppercase text-slate-800">Course Enrollments</h2>
                        <button onClick={() => setIsEnrollModalOpen(true)} className="px-5 py-2.5 bg-brand-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                            <Plus className="w-4 h-4" /> Enroll Student
                        </button>
                    </div>`;
                    
const enrollHeaderNew = `<div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black uppercase text-slate-800">Course Enrollments</h2>
                        <div className="flex gap-2">
                            <button onClick={() => {
                                setCertModalData({ initialNarrative: getDefaultNarrative(), studentName: "Template Preview" });
                                setIsCertModalOpen(true);
                            }} className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-2 hover:scale-105 transition-all">
                                <Edit2 className="w-4 h-4" /> Edit Template
                            </button>
                            <button onClick={handleBulkGenerate} className="px-4 py-2.5 bg-brand-secondary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                                <Printer className="w-4 h-4" /> Bulk Certs
                            </button>
                            <button onClick={() => setIsEnrollModalOpen(true)} className="px-5 py-2.5 bg-brand-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                                <Plus className="w-4 h-4" /> Enroll Student
                            </button>
                        </div>
                    </div>`;
                    
code = code.replace(enrollHeaderOld, enrollHeaderNew);

// 4. Inject CertificateEditorModal at the end of the return statement before the last div
const modalJSX = `
            {/* Certificate Editor Modal */}
            <CertificateEditorModal
                isOpen={isCertModalOpen}
                onClose={() => setIsCertModalOpen(false)}
                initialNarrative={certModalData.initialNarrative}
                studentName={certModalData.studentName}
                onGenerate={handleSaveTemplate}
            />
        </div>
    );
};
`;
code = code.replace(/<\/div>\s*\);\s*\};\s*$/, modalJSX);

fs.writeFileSync('src/pages/Courses.tsx', code);
console.log('Courses.tsx updated!');
