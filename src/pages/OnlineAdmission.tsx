import { useState, useMemo } from 'react';
import { useStore, type Student } from '../context/StoreContext';
import { 
    School, GraduationCap, Building2, User, Phone, 
    CheckCircle2, Upload, FileText, 
    Printer, ArrowRight, ShieldCheck,
    Camera, RefreshCw, Check, Sparkles, BookOpen, Trophy, Compass
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';
import { sendWhatsAppViaServer } from '../utils/whatsapp';
import { compressImage } from '../utils/imageCompressor';

export const OnlineAdmission = () => {
    const { settings, campuses, addStudent, classes: systemClasses, classPrograms } = useStore();

    // Steps: 0: Welcome, 1: Program & Campus, 2: Student Details, 3: Parent & Contact, 4: Academic & Review
    const [step, setStep] = useState(0);
    const [submittedStudent, setSubmittedStudent] = useState<Student | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isCollegeClass = (className: string) => {
        if (classPrograms && classPrograms[className]) {
            return classPrograms[className] === 'College';
        }
        const lower = className.toLowerCase();
        return ['year', 'fsc', 'ics', 'fa', 'i.com', '11th', '12th', 'inter'].some(kw => lower.includes(kw));
    };

    const schoolClasses = useMemo(() => {
        const list = (systemClasses && systemClasses.length > 0)
            ? systemClasses.filter(c => !isCollegeClass(c))
            : [
                'Playgroup', 'Nursery', 'Prep',
                'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
                'Class 6', 'Class 7', 'Class 8',
                'Class 9th (Science)', 'Class 9th (Arts)',
                'Class 10th (Science)', 'Class 10th (Arts)'
            ];
        return list;
    }, [systemClasses]);

    const collegeClasses = useMemo(() => {
        const list = (systemClasses && systemClasses.length > 0)
            ? systemClasses.filter(c => isCollegeClass(c))
            : [
                '1st Year (Boys)', '1st Year (Girls)',
                '2nd Year (Boys)', '2nd Year (Girls)'
            ];
        return list;
    }, [systemClasses]);

    // Form Data State
    const [programType, setProgramType] = useState<'School' | 'College'>('School');
    const [formData, setFormData] = useState({
        // Campus & Class
        campus: (campuses && campuses[0]?.name) || 'Main Campus',
        class: schoolClasses[0] || 'Class 9th (Science)',
        discipline: 'FSc Pre-Medical',

        // Student Info
        name: '',
        cnic: '', // B-Form
        dob: '',
        gender: 'Male',
        religion: 'Islam',
        nationality: 'Pakistani',
        avatar: '',

        // Father & Guardian
        fatherName: '',
        fatherCnic: '',
        fatherOccupation: '',
        monthlyIncome: '',
        isOrphan: false,

        // Contact & Location
        contactFather: '',
        whatsappNumber: '',
        email: '',
        address: '',
        city: settings.location || 'Attock City',

        // Prior Academic
        previousSchool: '',
        lastClass: '',
        totalMarks: '',
        obtainedMarks: '',
        percentage: '',

        // Documents
        bformDoc: '',
        resultDoc: ''
    });

    const collegeDisciplines = [
        { id: 'FSc Pre-Medical', title: 'FSc Pre-Medical', emoji: '🩺', desc: 'Biology • Chemistry • Physics' },
        { id: 'FSc Pre-Engineering', title: 'FSc Pre-Engineering', emoji: '⚙️', desc: 'Mathematics • Chemistry • Physics' },
        { id: 'ICS', title: 'ICS (Computer Science)', emoji: '💻', desc: 'Computer • Mathematics • Physics / Stats' },
        { id: 'I.Com', title: 'I.Com (Commerce)', emoji: '💼', desc: 'Accounting • Commerce • Economics' },
        { id: 'FA', title: 'FA (Arts & Humanities)', emoji: '🎨', desc: 'Civics • Islamic Studies • Literature' },
        { id: 'General Science', title: 'General Science', emoji: '🔬', desc: 'Statistics • Mathematics • Physics' },
    ];

    const handleInputChange = (field: string, value: any) => {
        const updates: any = { [field]: value };
        
        // AI/Smart Feature: Auto-format CNIC and auto-detect gender
        if (field === 'cnic' && typeof value === 'string') {
            let val = value.replace(/\D/g, ''); // strip non-digits
            if (val.length > 5) val = val.substring(0, 5) + '-' + val.substring(5);
            if (val.length > 13) val = val.substring(0, 13) + '-' + val.substring(13, 14);
            updates.cnic = val;
            
            // Last digit determines gender: Odd = Male, Even = Female
            if (val.length === 15) {
                const lastDigit = parseInt(val.charAt(14));
                if (!isNaN(lastDigit)) {
                    updates.gender = lastDigit % 2 !== 0 ? 'Male' : 'Female';
                }
            }
        }
        
        setFormData(prev => ({ ...prev, ...updates }));
    };

    // Auto-calculate percentage
    const handleMarksChange = (total: string, obtained: string) => {
        const t = parseFloat(total);
        const o = parseFloat(obtained);
        let pct = '';
        if (!isNaN(t) && !isNaN(o) && t > 0) {
            pct = `${((o / t) * 100).toFixed(1)}%`;
        }
        setFormData(prev => ({ ...prev, totalMarks: total, obtainedMarks: obtained, percentage: pct }));
    };

    // High-performance Auto-Compressed File Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'bformDoc' | 'resultDoc') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Automatically compress image to ~80-120 KB max to save bandwidth & memory
            const compressed = await compressImage(file, 900, 900, 0.78);
            handleInputChange(field, compressed);
        } catch (err) {
            console.error('Image compression fallback:', err);
            const reader = new FileReader();
            reader.onloadend = () => {
                handleInputChange(field, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateStep1 = () => {
        if (!formData.campus) {
            Swal.fire('Campus Required', 'Please select an institutional campus location.', 'warning');
            return false;
        }
        if (!formData.class) {
            Swal.fire('Class Required', 'Please select an academic class for admission.', 'warning');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.name.trim()) {
            Swal.fire('Student Name Required', 'Please provide the applicant\'s full legal name.', 'warning');
            return false;
        }
        if (!formData.cnic.trim()) {
            Swal.fire('B-Form / CNIC Required', 'Please provide the applicant\'s official B-Form or CNIC number.', 'warning');
            return false;
        }
        if (!formData.dob) {
            Swal.fire('Date of Birth Required', 'Please select the applicant\'s date of birth.', 'warning');
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!formData.fatherName.trim()) {
            Swal.fire('Father / Guardian Name Required', 'Please enter father or guardian legal name.', 'warning');
            return false;
        }
        if (!formData.contactFather.trim()) {
            Swal.fire('Contact Number Required', 'Please enter primary mobile number for communications.', 'warning');
            return false;
        }
        if (!formData.whatsappNumber.trim()) {
            Swal.fire('WhatsApp Number Required', 'Please enter WhatsApp number for digital notifications and updates.', 'warning');
            return false;
        }
        if (!formData.address.trim()) {
            Swal.fire('Address Required', 'Please enter permanent residential address.', 'warning');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        if (step === 3 && !validateStep3()) return;
        setStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmitApplication = async () => {
        if (!validateStep2() || !validateStep3()) return;

        setIsSubmitting(true);
        try {
            const year = new Date().getFullYear();
            const randomCode = Math.floor(100000 + Math.random() * 900000);
            const applicationId = `APP-${year}-${randomCode}`;
            const targetClass = `${formData.class} ${programType === 'College' ? `(${formData.discipline})` : ''}`.trim();

            const studentPayload: Partial<Student> = {
                id: applicationId,
                manualId: applicationId,
                name: formData.name.trim(),
                fatherName: formData.fatherName.trim(),
                fatherCnic: formData.fatherCnic.trim(),
                cnic: formData.cnic.trim(),
                dob: formData.dob,
                gender: formData.gender,
                religion: formData.religion,
                nationality: formData.nationality,
                avatar: formData.avatar || '',
                campus: formData.campus,
                class: formData.class,
                discipline: programType === 'College' ? formData.discipline : 'General Studies',
                fatherOccupation: formData.fatherOccupation.trim() || 'Service/Business',
                monthlyIncome: formData.monthlyIncome || '',
                isOrphan: formData.isOrphan,
                contactFather: formData.contactFather.trim(),
                whatsappNumber: formData.whatsappNumber.trim(),
                email: formData.email.trim(),
                address: `${formData.address.trim()}, ${formData.city}`,
                admissionDate: new Date().toISOString().split('T')[0],
                status: 'Online Applied',
                feesPaid: 0,
                feesTotal: 0,
                academicRecords: formData.previousSchool ? [{
                    degree: formData.lastClass || 'Previous Grade',
                    major: 'General',
                    board: formData.previousSchool,
                    passingYear: year.toString(),
                    totalMarks: formData.totalMarks || 'N/A',
                    marksObtained: formData.obtainedMarks || 'N/A',
                    percentage: formData.percentage || 'N/A'
                }] : [],
                documents: {
                    ...(formData.bformDoc ? { 'B-Form / CNIC': formData.bformDoc } : {}),
                    ...(formData.resultDoc ? { 'Previous Result': formData.resultDoc } : {})
                }
            };

            // 1. Save to institutional database & Store
            await addStudent(studentPayload);
            setSubmittedStudent(studentPayload as Student);

            // 2. 📲 Automated WhatsApp Confirmation Message to Parent's WhatsApp Number
            if (formData.whatsappNumber.trim()) {
                const waMessage = 
`🎓 *${(settings.schoolName || "PIONEER'S SUPERIOR SCIENCE SCHOOL & COLLEGE").toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━
✨ *ONLINE ADMISSION CONFIRMATION* ✨

Dear Parent/Guardian,
Your online admission application for session *${year}-${year + 1}* has been successfully received & recorded.

📋 *Applicant Summary:*
• *Application Token:* ${applicationId}
• *Student Name:* ${formData.name.trim()}
• *Father Name:* ${formData.fatherName.trim()}
• *Class / Program:* ${targetClass}
• *Campus:* ${formData.campus}
• *B-Form / CNIC:* ${formData.cnic.trim() || 'Provided'}
• *Status:* Under Review

📌 *Important Instructions:*
1. Please keep your *Application Token (${applicationId})* safe for reference.
2. Our admissions office will verify your details and contact you for the document verification & interview schedule.
3. Bring the student's original B-Form and previous result cards at the time of admission confirmation.

For assistance, visit our campus admission office.

Warm Regards,
*Directorate of Admissions*
*${settings.schoolName || "Pioneer's Superior System"}*`;

                // Dispatch via linked WhatsApp server in background
                sendWhatsAppViaServer({
                    to: formData.whatsappNumber.trim(),
                    message: waMessage
                }).catch((err) => {
                    console.warn('[WhatsApp Automatic Admission Dispatch Error]:', err);
                });
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Online Admission Submission Error:', error);
            Swal.fire({
                title: 'Submission Error',
                text: 'An error occurred while submitting your application. Please try again.',
                icon: 'error',
                confirmButtonColor: '#003366'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrintSlip = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-[#001020] dark:to-[#000a14] text-slate-800 dark:text-slate-100 font-outfit selection:bg-blue-500 selection:text-white">
            
            {/* 🖨️ A4 PRINTABLE ADMISSION SLIP (Single Page - Visible Only When Printing) */}
            {submittedStudent && (
                <div className="hidden print:block font-sans text-black bg-white p-0 m-0 w-full">
                    <style>{`
                        @media print {
                            @page {
                                size: A4 portrait;
                                margin: 8mm 10mm;
                            }
                            body {
                                background: white !important;
                                color: black !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            .print-slip-container {
                                page-break-inside: avoid !important;
                                break-inside: avoid !important;
                            }
                        }
                    `}</style>
                    <div className="print-slip-container max-w-[210mm] mx-auto border-2 border-slate-900 rounded-2xl p-6 bg-white space-y-4">
                        
                        {/* Slip Header with School Logos & Details */}
                        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                            <div className="w-20 h-20 flex items-center justify-center">
                                {settings.logo1 ? (
                                    <img src={settings.logo1} alt="Logo" className="max-h-16 max-w-16 object-contain" />
                                ) : (
                                    <div className="w-16 h-16 border border-slate-900 rounded-lg flex items-center justify-center font-bold text-xs">LOGO</div>
                                )}
                            </div>
                            <div className="text-center flex-1 px-4">
                                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                    {settings.schoolName || "PIONEER'S SUPERIOR"}
                                </h1>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-700">
                                    Science School & College System
                                </p>
                                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                                    {submittedStudent.campus || 'Main Campus'} • Admissions Session 2026-2027
                                </p>
                                <div className="inline-block mt-2 px-4 py-0.5 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-widest">
                                    Official Provisional Admission Registration Slip
                                </div>
                            </div>
                            <div className="w-20 h-20 flex items-center justify-center">
                                {settings.logo2 ? (
                                    <img src={settings.logo2} alt="Logo 2" className="max-h-16 max-w-16 object-contain" />
                                ) : (
                                    <div className="w-20 h-24 border-2 border-dashed border-slate-400 rounded flex flex-col items-center justify-center text-[9px] text-slate-400">
                                        {submittedStudent.avatar ? (
                                            <img src={submittedStudent.avatar} alt="Student" className="w-full h-full object-cover rounded" />
                                        ) : (
                                            <span>Affix Photo</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tracking Bar */}
                        <div className="bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 flex items-center justify-between text-xs">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Application Tracking Token</span>
                                <span className="font-mono font-black text-lg text-blue-900 tracking-wider">{submittedStudent.id}</span>
                            </div>
                            <div className="text-center">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Registration Date</span>
                                <span className="font-bold text-slate-800">
                                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Application Status</span>
                                <span className="inline-block font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded text-[11px] uppercase">
                                    Provisional (Under Review)
                                </span>
                            </div>
                        </div>

                        {/* Student Information Table */}
                        <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-200 px-3 py-1 rounded">
                                Section A: Student & Academic Details
                            </h3>
                            <table className="w-full text-xs border-collapse border border-slate-300">
                                <tbody>
                                    <tr className="border-b border-slate-300">
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600 w-1/4">Candidate Full Name:</td>
                                        <td className="p-2 font-black text-slate-900 uppercase w-1/4">{submittedStudent.name}</td>
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600 w-1/4">Applied Class / Grade:</td>
                                        <td className="p-2 font-black text-blue-900 w-1/4">{submittedStudent.class}</td>
                                    </tr>
                                    <tr className="border-b border-slate-300">
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600">B-Form / CNIC Number:</td>
                                        <td className="p-2 font-mono font-bold text-slate-900">{submittedStudent.cnic || 'N/A'}</td>
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600">Program / Discipline:</td>
                                        <td className="p-2 font-bold text-slate-800">{submittedStudent.discipline || 'General'}</td>
                                    </tr>
                                    <tr className="border-b border-slate-300">
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600">Date of Birth:</td>
                                        <td className="p-2 font-bold text-slate-900">{submittedStudent.dob || 'N/A'}</td>
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600">Campus Selected:</td>
                                        <td className="p-2 font-bold text-slate-900">{submittedStudent.campus || 'Main Campus'}</td>
                                    </tr>
                                    <tr className="border-b border-slate-300">
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600">Gender / Religion:</td>
                                        <td className="p-2 font-bold text-slate-900">{submittedStudent.gender} • {submittedStudent.religion || 'Islam'}</td>
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600">Special Category:</td>
                                        <td className="p-2 font-bold text-slate-900">{submittedStudent.isOrphan ? 'Orphan (Concession Applicable)' : 'Regular Student'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Guardian & Contact Information Table */}
                        <div className="space-y-1">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-200 px-3 py-1 rounded">
                                Section B: Parent / Guardian Information
                            </h3>
                            <table className="w-full text-xs border-collapse border border-slate-300">
                                <tbody>
                                    <tr className="border-b border-slate-300">
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600 w-1/4">Father / Guardian Name:</td>
                                        <td className="p-2 font-bold text-slate-900 w-1/4">{submittedStudent.fatherName}</td>
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600 w-1/4">Father CNIC:</td>
                                        <td className="p-2 font-mono font-bold text-slate-900 w-1/4">{submittedStudent.fatherCnic || 'N/A'}</td>
                                    </tr>
                                    <tr className="border-b border-slate-300">
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600">Primary Mobile Contact:</td>
                                        <td className="p-2 font-bold text-slate-900">{submittedStudent.contactFather || 'N/A'}</td>
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600">WhatsApp Notification No:</td>
                                        <td className="p-2 font-bold text-emerald-800">{submittedStudent.whatsappNumber || 'N/A'}</td>
                                    </tr>
                                    <tr className="border-b border-slate-300">
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600">Father Occupation:</td>
                                        <td className="p-2 font-bold text-slate-900">{submittedStudent.fatherOccupation || 'Service/Business'}</td>
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600">Monthly Income Bracket:</td>
                                        <td className="p-2 font-bold text-slate-900">{submittedStudent.monthlyIncome || 'N/A'}</td>
                                    </tr>
                                    <tr className="border-b border-slate-300">
                                        <td className="p-2 font-bold bg-slate-50 text-slate-600">Residential Address:</td>
                                        <td colSpan={3} className="p-2 font-bold text-slate-900">{submittedStudent.address || 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Prior Academic Record */}
                        {submittedStudent.academicRecords && submittedStudent.academicRecords.length > 0 && (
                            <div className="space-y-1">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-200 px-3 py-1 rounded">
                                    Section C: Previous Academic History
                                </h3>
                                <table className="w-full text-xs border-collapse border border-slate-300">
                                    <tbody>
                                        <tr className="border-b border-slate-300">
                                            <td className="p-2 font-bold bg-slate-50 text-slate-600 w-1/4">Previous Institution:</td>
                                            <td className="p-2 font-bold text-slate-900 w-1/4">{submittedStudent.academicRecords[0].board || 'N/A'}</td>
                                            <td className="p-2 font-bold bg-slate-50 text-slate-600 w-1/4">Marks / Percentage:</td>
                                            <td className="p-2 font-bold text-slate-900 w-1/4">
                                                {submittedStudent.academicRecords[0].marksObtained} / {submittedStudent.academicRecords[0].totalMarks} ({submittedStudent.academicRecords[0].percentage})
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Instructions & Declarations */}
                        <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-1 text-[10px] text-slate-700">
                            <p className="font-bold uppercase text-slate-900">📌 Important Instructions for Parents / Candidate:</p>
                            <ol className="list-decimal pl-4 space-y-0.5 leading-tight">
                                <li>This online slip serves as provisional confirmation of application submission.</li>
                                <li>Please bring the candidate's original B-Form / CNIC and last passed result cards at the time of verification.</li>
                                <li>Admission is subject to departmental merit and seat availability at the designated campus.</li>
                            </ol>
                        </div>

                        {/* Signature Block */}
                        <div className="pt-4 flex items-end justify-between text-xs text-slate-800">
                            <div className="text-center w-48">
                                <div className="border-b border-slate-900 pb-1"></div>
                                <span className="font-bold text-[10px] uppercase mt-1 block">Parent / Guardian Signature</span>
                            </div>
                            <div className="text-center w-48">
                                <div className="border-b border-slate-900 pb-1"></div>
                                <span className="font-bold text-[10px] uppercase mt-1 block">Admissions Officer / Principal</span>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Top Brand Header (Screen Only) */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#001f3f]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-sm print:hidden">
                <div className="max-w-4xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                        {settings.logo1 ? (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 shadow-md border border-slate-100 shrink-0">
                                <img src={settings.logo1} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#003366] text-white flex items-center justify-center shadow-md shrink-0">
                                <School className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className="text-xs sm:text-base md:text-lg font-black uppercase tracking-tight leading-tight text-[#003366] dark:text-white truncate">
                                {settings.schoolName || "PIONEER'S SUPERIOR"}
                            </h1>
                            <p className="text-[9px] sm:text-xs font-bold text-blue-600 dark:text-yellow-400 uppercase tracking-wider truncate">
                                Online Admission & Enrollment Portal
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                        <span className="px-2.5 sm:px-3 py-1 bg-blue-500/10 dark:bg-white/10 border border-blue-500/20 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
                            Session 2026-27
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 print:hidden">
                {/* When submitted successfully */}
                {submittedStudent ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white dark:bg-[#071322] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 md:p-10 shadow-2xl space-y-6 sm:space-y-8"
                    >
                        {/* Success Card Header */}
                        <div className="text-center space-y-2.5 sm:space-y-3">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 text-emerald-600 rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/10">
                                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Application Registered Successfully</span>
                            </div>
                            <h2 className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-800 dark:text-white">
                                Admission Form Received
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
                                Your admission registration has been successfully recorded in the institutional database and a confirmation notice has been dispatched.
                            </p>
                        </div>

                        {/* Interactive Digital Slip Card */}
                        <div className="bg-slate-50 dark:bg-slate-900/80 border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-200 dark:border-white/10">
                                <div>
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                                        Application Tracking Token
                                    </span>
                                    <span className="text-xl sm:text-3xl font-mono font-black text-[#003366] dark:text-yellow-400 tracking-wider">
                                        {submittedStudent.id}
                                    </span>
                                </div>
                                <div className="sm:text-right">
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                                        Registration Date
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Student Name</p>
                                        <p className="font-black text-slate-800 dark:text-white text-sm sm:text-base">{submittedStudent.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Father / Guardian Name</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-200">{submittedStudent.fatherName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">B-Form / CNIC Number</p>
                                        <p className="font-mono font-bold text-slate-700 dark:text-slate-200">{submittedStudent.cnic || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Applied Class & Program</p>
                                        <p className="font-black text-[#003366] dark:text-blue-400 text-sm sm:text-base">
                                            {submittedStudent.class} {submittedStudent.discipline && submittedStudent.discipline !== 'General Studies' ? `(${submittedStudent.discipline})` : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Campus Selected</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-200">{submittedStudent.campus || 'Main Campus'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">WhatsApp Notification Number</p>
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{submittedStudent.whatsappNumber || submittedStudent.contactFather}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-500">
                                <span>📍 {settings.schoolName || 'Institutional Admissions Office'}</span>
                                <span className="font-black text-blue-600 dark:text-blue-400">
                                    Status: Under Institutional Review
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons (Print & New Application) */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                            <button
                                onClick={handlePrintSlip}
                                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-[#003366] hover:bg-blue-900 text-white font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" /> Print / Save Official A4 Slip
                            </button>

                            <button
                                onClick={() => {
                                    setSubmittedStudent(null);
                                    setStep(1);
                                    setFormData({
                                        campus: (campuses && campuses[0]?.name) || 'Main Campus',
                                        class: 'Class 9th (Science)',
                                        discipline: 'FSc Pre-Medical',
                                        name: '',
                                        cnic: '',
                                        dob: '',
                                        gender: 'Male',
                                        religion: 'Islam',
                                        nationality: 'Pakistani',
                                        avatar: '',
                                        fatherName: '',
                                        fatherCnic: '',
                                        fatherOccupation: '',
                                        monthlyIncome: '',
                                        isOrphan: false,
                                        contactFather: '',
                                        whatsappNumber: '',
                                        email: '',
                                        address: '',
                                        city: settings.location || 'Attock City',
                                        previousSchool: '',
                                        lastClass: '',
                                        totalMarks: '',
                                        obtainedMarks: '',
                                        percentage: '',
                                        bformDoc: '',
                                        resultDoc: ''
                                    });
                                }}
                                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <RefreshCw className="w-4 h-4" /> Submit Another Application
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-6 sm:space-y-8">
                        {step === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-[#071322] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-10 md:p-14 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
                                
                                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-8 text-center lg:text-left">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30 shadow-sm">
                                            <Sparkles className="w-4 h-4" />
                                            <span>Admissions Open 2026-27</span>
                                        </div>
                                        
                                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[1.1]">
                                            Future <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Leaders</span> Are Built Here.
                                        </h1>
                                        
                                        <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                                            Welcome to {settings.schoolName}. Begin your journey towards academic excellence with our advanced curriculum, expert faculty, and state-of-the-art facilities.
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 text-left">
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-blue-200 transition-colors">
                                                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 mb-2 sm:mb-3" />
                                                <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Top Merit</h4>
                                                <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 font-medium">100% Board Success Rate</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-emerald-200 transition-colors">
                                                <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 mb-2 sm:mb-3" />
                                                <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Modern Tech</h4>
                                                <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 font-medium">Digital Campus & Portals</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#003366] to-blue-800 hover:from-blue-900 hover:to-[#001122] text-white rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-xl shadow-blue-900/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                                            >
                                                Start Application <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="relative hidden lg:block">
                                        <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl relative group">
                                            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" alt="Students" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f]/90 via-[#001f3f]/20 to-transparent flex flex-col justify-end p-8">
                                                <div className="flex items-center gap-3 text-white">
                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                                        <BookOpen className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Admissions Dept.</p>
                                                        <p className="text-lg font-black tracking-tight">Merit Based Selection</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="absolute -bottom-8 -left-8 bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/10 max-w-[260px] animate-bounce-slow">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-500/20">
                                                    <ShieldCheck className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Secure Portal</p>
                                                    <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight mt-1">End-to-End Encrypted Application Process</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                {/* Hero Info Banner */}
                                <div className="relative bg-gradient-to-r from-[#003366] via-blue-900 to-indigo-900 text-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                            <div className="relative z-10 max-w-2xl space-y-2.5 sm:space-y-3">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-yellow-300">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Official Admission Registration</span>
                                </div>
                                <h2 className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">
                                    Student Admission Application
                                </h2>
                                <p className="text-xs sm:text-sm text-white/85 font-medium leading-relaxed">
                                    Please provide accurate student and guardian information below to ensure seamless and swift institutional admission processing.
                                </p>
                            </div>

                            {/* Stepper Indicator */}
                            <div className="relative z-10 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/15 grid grid-cols-4 gap-1.5 sm:gap-2">
                                {[
                                    { num: 1, label: 'Program' },
                                    { num: 2, label: 'Student' },
                                    { num: 3, label: 'Guardian' },
                                    { num: 4, label: 'Review' }
                                ].map((s) => (
                                    <div 
                                        key={s.num} 
                                        onClick={() => {
                                            if (s.num < step) setStep(s.num);
                                        }}
                                        className={cn(
                                            "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 cursor-pointer transition-all",
                                            step === s.num ? "opacity-100" : step > s.num ? "opacity-90" : "opacity-40"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 transition-all",
                                            step === s.num ? "bg-yellow-400 text-slate-900 shadow-lg scale-105" : step > s.num ? "bg-emerald-400 text-slate-900" : "bg-white/20 text-white"
                                        )}>
                                            {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                                        </div>
                                        <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-center sm:text-left leading-tight">
                                            {s.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Card Container */}
                        <div onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') e.preventDefault(); }} className="bg-white dark:bg-[#071322] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 md:p-10 shadow-xl space-y-6 sm:space-y-8">
                            {/* STEP 1: Program, Campus & Class */}
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-5 sm:space-y-6"
                                >
                                    <div>
                                        <h3 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                            Step 1: Campus & Academic Level
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium mt-1">
                                            Select the academic division, campus, and target grade for admission.
                                        </p>
                                    </div>

                                    {/* Program Type Selection (School vs College) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProgramType('School');
                                                handleInputChange('class', schoolClasses[0] || 'Class 9th (Science)');
                                            }}
                                            className={cn(
                                                "p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 text-left transition-all flex items-center gap-3.5 sm:gap-4 relative overflow-hidden group cursor-pointer",
                                                programType === 'School'
                                                    ? "bg-blue-50 dark:bg-blue-950/40 border-[#003366] dark:border-blue-500 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/30"
                                                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300"
                                            )}
                                        >
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden p-1.5 shadow-sm">
                                                {settings.logo1 ? (
                                                    <img src={settings.logo1} alt="School Logo" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                                ) : (
                                                    <School className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-black text-xs sm:text-sm uppercase text-slate-800 dark:text-white">
                                                    School Section
                                                </h4>
                                                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                                    Playgroup, Primary, Middle to Matric (10th)
                                                </p>
                                            </div>
                                            {programType === 'School' && (
                                                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 absolute top-3.5 right-3.5" />
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProgramType('College');
                                                handleInputChange('class', collegeClasses[0] || '1st Year (Boys)');
                                            }}
                                            className={cn(
                                                "p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 text-left transition-all flex items-center gap-3.5 sm:gap-4 relative overflow-hidden group cursor-pointer",
                                                programType === 'College'
                                                    ? "bg-purple-50 dark:bg-purple-950/40 border-purple-600 dark:border-purple-500 shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/30"
                                                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300"
                                            )}
                                        >
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden p-1.5 shadow-sm">
                                                {settings.logo2 ? (
                                                    <img src={settings.logo2} alt="College Logo" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                                ) : (
                                                    <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-black text-xs sm:text-sm uppercase text-slate-800 dark:text-white">
                                                    College / Higher Secondary
                                                </h4>
                                                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                                    Intermediate (FSc, ICS, FA, I.Com)
                                                </p>
                                            </div>
                                            {programType === 'College' && (
                                                <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 absolute top-3.5 right-3.5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Campus Selector */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            Select Campus Location <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={formData.campus}
                                            onChange={(e) => handleInputChange('campus', e.target.value)}
                                            className="w-full min-h-[48px] p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors cursor-pointer"
                                        >
                                            {(campuses && campuses.length > 0 ? campuses : [{ id: '1', name: 'Main Campus' }]).map((c: any) => (
                                                <option key={c.id || c.name} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Class Selector */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            Select Class Applying For <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={formData.class}
                                            onChange={(e) => handleInputChange('class', e.target.value)}
                                            required
                                            className="w-full min-h-[48px] p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors cursor-pointer"
                                        >
                                            {(programType === 'School' ? schoolClasses : collegeClasses).map((cls) => (
                                                <option key={cls} value={cls}>{cls}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* If College: Choose Stream */}
                                    {programType === 'College' && (
                                        <div className="space-y-2.5 pt-1">
                                            <label className="block text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                                Select College Discipline / Program <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {collegeDisciplines.map((stream) => {
                                                    const isSelected = formData.discipline === stream.id;
                                                    return (
                                                        <button
                                                            key={stream.id}
                                                            type="button"
                                                            onClick={() => handleInputChange('discipline', stream.id)}
                                                            className={cn(
                                                                "p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 relative cursor-pointer",
                                                                isSelected
                                                                    ? "bg-purple-50 dark:bg-purple-950/40 border-purple-600 ring-2 ring-purple-600/30"
                                                                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300"
                                                            )}
                                                        >
                                                            <span className="text-2xl shrink-0">{stream.emoji}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <span className={cn("text-xs font-black uppercase tracking-tight block", isSelected ? "text-purple-900 dark:text-purple-200" : "text-slate-800 dark:text-slate-200")}>
                                                                    {stream.title}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate block">
                                                                    {stream.desc}
                                                                </span>
                                                            </div>
                                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP 2: Student Personal Information */}
                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-5 sm:space-y-6"
                                >
                                    <div>
                                        <h3 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                                            <User className="w-5 h-5 text-blue-600" />
                                            Step 2: Student Identity & Details
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium mt-1">
                                            Provide the applicant's official name, B-Form number, and personal background.
                                        </p>
                                    </div>

                                    {/* Photo Upload */}
                                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                                            {formData.avatar ? (
                                                <img src={formData.avatar} alt="Student" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-center sm:text-left space-y-1.5">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                                Student Passport Photograph (Optional)
                                            </h4>
                                            <p className="text-[10px] sm:text-[11px] text-slate-400">
                                                Upload clear passport photo or capture live picture from device. Max size: 3MB.
                                            </p>
                                            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all">
                                                <Camera className="w-3.5 h-3.5" />
                                                <span>Choose Photo / Camera</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'avatar')}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                        {/* Full Name */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                Student Full Legal Name <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                placeholder="e.g. Muhammad Ali"
                                                className="w-full min-h-[48px] p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors"
                                            />
                                        </div>

                                        {/* B-Form / CNIC */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                Student B-Form / CNIC Number <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.cnic}
                                                onChange={(e) => handleInputChange('cnic', e.target.value)}
                                                placeholder="36601-XXXXXXX-X"
                                                className="w-full min-h-[48px] p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors"
                                            />
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                Date of Birth <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.dob}
                                                onChange={(e) => handleInputChange('dob', e.target.value)}
                                                className="w-full min-h-[48px] p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors"
                                            />
                                        </div>

                                        {/* Gender */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                Gender <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Male', 'Female'].map((g) => (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => handleInputChange('gender', g)}
                                                        className={cn(
                                                            "min-h-[48px] rounded-2xl text-xs font-black uppercase transition-all border text-center cursor-pointer",
                                                            formData.gender === g
                                                                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                                                : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/5"
                                                        )}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Religion */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                Religion
                                            </label>
                                            <select
                                                value={formData.religion}
                                                onChange={(e) => handleInputChange('religion', e.target.value)}
                                                className="w-full min-h-[48px] p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors cursor-pointer"
                                            >
                                                <option value="Islam">Islam</option>
                                                <option value="Christianity">Christianity</option>
                                                <option value="Hinduism">Hinduism</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        {/* Nationality */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                Nationality
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.nationality}
                                                onChange={(e) => handleInputChange('nationality', e.target.value)}
                                                placeholder="Pakistani"
                                                className="w-full min-h-[48px] p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: Parent & Contact Details */}
                            {step === 3 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-5 sm:space-y-6"
                                >
                                    <div>
                                        <h3 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-emerald-600" />
                                            Step 3: Guardian & Contact Information
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium mt-1">
                                            Enter father or guardian credentials, mobile numbers, and residential address.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                        {/* Father Name */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                Father / Guardian Full Name <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.fatherName}
                                                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                                                placeholder="Father or Guardian Name"
                                                className="w-full min-h-[48px] p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors"
                                            />
                                        </div>

                                        {/* Father CNIC */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                Father / Guardian CNIC Number
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.fatherCnic}
                                                onChange={(e) => handleInputChange('fatherCnic', e.target.value)}
                                                placeholder="36601-XXXXXXX-X"
                                                className="w-full min-h-[48px] p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors"
                                            />
                                        </div>

                                        {/* Primary Mobile */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                Primary Calling Mobile No. <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.contactFather}
                                                onChange={(e) => handleInputChange('contactFather', e.target.value)}
                                                placeholder="0300-1234567"
                                                className="w-full min-h-[48px] p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors"
                                            />
                                        </div>

                                        {/* WhatsApp Number */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                                WhatsApp Number (For Instant Confirmation Notice) <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.whatsappNumber}
                                                onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                                                placeholder="0300-1234567"
                                                className="w-full min-h-[48px] p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-700/50 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500 transition-colors"
                                            />
                                        </div>

                                        {/* Father Occupation */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                Father Occupation / Profession
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.fatherOccupation}
                                                onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                                                placeholder="Business / Government / Private / Other"
                                                className="w-full min-h-[48px] p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors"
                                            />
                                        </div>

                                        {/* Monthly Household Income */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                Monthly Household Income Bracket
                                            </label>
                                            <select
                                                value={formData.monthlyIncome}
                                                onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                                                className="w-full min-h-[48px] p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors cursor-pointer"
                                            >
                                                <option value="">Select Income Bracket...</option>
                                                <option value="Under 35,000">Under Rs. 35,000</option>
                                                <option value="35,000 - 60,000">Rs. 35,000 - Rs. 60,000</option>
                                                <option value="60,000 - 100,000">Rs. 60,000 - Rs. 100,000</option>
                                                <option value="100,000+">Rs. 100,000+</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Residential Address */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            Permanent Residential Address <span className="text-rose-500">*</span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            placeholder="House / Street, Colony / Area Name"
                                            className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-600 transition-colors resize-none"
                                        />
                                    </div>

                                    {/* Orphan Checkbox */}
                                    <label className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-white/5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isOrphan}
                                            onChange={(e) => handleInputChange('isOrphan', e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                                        />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Is the student an orphan (father deceased)? Special institutional scholarship concession will apply.
                                        </span>
                                    </label>
                                </motion.div>
                            )}

                            {/* STEP 4: Academic Records, Documents & Review */}
                            {step === 4 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-5 sm:space-y-6"
                                >
                                    <div>
                                        <h3 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-indigo-600" />
                                            Step 4: Prior Education & Final Review
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium mt-1">
                                            Provide previous school background (if applicable), upload supporting documents, and review application.
                                        </p>
                                    </div>

                                    {/* Prior Academic History (Optional) */}
                                    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5 space-y-3.5">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-[#003366] dark:text-blue-400">
                                            Previous Academic History (Optional)
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Previous School / College Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.previousSchool}
                                                    onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                                                    placeholder="School or Institution Name"
                                                    className="w-full min-h-[44px] p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Last Completed Grade / Class</label>
                                                <input
                                                    type="text"
                                                    value={formData.lastClass}
                                                    onChange={(e) => handleInputChange('lastClass', e.target.value)}
                                                    placeholder="e.g. 8th Grade / Matric 9th"
                                                    className="w-full min-h-[44px] p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                            <div>
                                                <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Total Marks</label>
                                                <input
                                                    type="number"
                                                    value={formData.totalMarks}
                                                    onChange={(e) => handleMarksChange(e.target.value, formData.obtainedMarks)}
                                                    placeholder="1100"
                                                    className="w-full min-h-[44px] p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Marks Obtained</label>
                                                <input
                                                    type="number"
                                                    value={formData.obtainedMarks}
                                                    onChange={(e) => handleMarksChange(formData.totalMarks, e.target.value)}
                                                    placeholder="950"
                                                    className="w-full min-h-[44px] p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Percentage</label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={formData.percentage}
                                                    placeholder="%"
                                                    className="w-full min-h-[44px] p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-emerald-600 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document Uploads */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                                                B-Form / CNIC Document (Optional)
                                            </span>
                                            <label className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-blue-500 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
                                                <Upload className="w-3.5 h-3.5 text-blue-600" />
                                                <span>{formData.bformDoc ? '✓ B-Form Attached' : 'Attach B-Form Photo'}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'bformDoc')}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>

                                        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                                                Last Result Card / Certificate (Optional)
                                            </span>
                                            <label className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-blue-500 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
                                                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                                                <span>{formData.resultDoc ? '✓ Result Attached' : 'Attach Result Card'}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'resultDoc')}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Application Summary Box */}
                                    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-blue-50/50 dark:bg-[#002244]/40 border border-blue-200 dark:border-blue-800/40 space-y-3">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-[#003366] dark:text-yellow-400">
                                            Application Summary Checklist
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase block">Candidate</span>
                                                <span className="font-black text-slate-800 dark:text-white truncate block">{formData.name || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase block">Class / Grade</span>
                                                <span className="font-black text-[#003366] dark:text-blue-400 truncate block">{formData.class}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase block">Campus</span>
                                                <span className="font-bold text-slate-700 dark:text-slate-200 truncate block">{formData.campus}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase block">WhatsApp Contact</span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block">{formData.whatsappNumber || formData.contactFather || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Form Navigation Controls */}
                            <div className="pt-4 sm:pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-4">
                                {step > 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-black uppercase text-xs tracking-widest transition-all cursor-pointer text-center"
                                    >
                                        Previous Step
                                    </button>
                                ) : <div className="hidden sm:block" />}

                                {step < 4 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-[#003366] hover:bg-blue-900 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
                                    >
                                        <span>Continue Next</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={handleSubmitApplication}
                                        className="w-full sm:w-auto min-h-[48px] px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#003366] hover:from-emerald-700 hover:to-blue-900 text-white font-black uppercase text-xs sm:text-sm tracking-widest shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Registering Application & Sending Notice...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                <span>Submit Admission Application</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                        </>
                        )}
                    </div>
                )}
            </main>

            {/* Footer Notice */}
            <footer className="mt-12 sm:mt-16 py-6 sm:py-8 border-t border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-950/60 text-center text-xs text-slate-400 space-y-1.5 px-4 print:hidden">
                <p className="font-bold">
                    © {new Date().getFullYear()} {settings.schoolName || "Pioneer's Superior School & College System"} • All Rights Reserved.
                </p>
                <p className="text-[10px] text-slate-400">
                    Official Admissions Governance Protocol • Secure Cloud Encryption Active
                </p>
            </footer>
        </div>
    );
};

