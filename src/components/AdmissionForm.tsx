import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    Users,
    GraduationCap,
    DollarSign,
    ShieldCheck,
    Camera,
    Upload,
    Save,
    Plus,
    Trash2,
    Calendar,
    Phone,
    MapPin,
    Hash,
    BookOpen,
    FileText,
    CheckCircle,
    School,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { useStore, type Student, type AcademicRecord } from '../context/StoreContext';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';
import { FeeVoucher } from './FeeVoucher';

interface AdmissionFormProps {
    editStudent?: Student;
    onClose: () => void;
    initialCampus?: string;
    initialType?: 'School' | 'College';
}

const SECTIONS = [
    { id: 'personal', label: 'Student Info', sub: 'Basic Details', icon: User },
    { id: 'parental', label: 'Parent info', sub: 'Family Details', icon: Users },
    { id: 'academic', label: 'Previous School', sub: 'Past Records', icon: GraduationCap },
    { id: 'documents', label: 'Documents', sub: 'Files & Photos', icon: FileText },
    { id: 'financial', label: 'Fees info', sub: 'Fee Details', icon: DollarSign },
];

export const AdmissionForm = ({ editStudent, onClose, initialCampus, initialType }: AdmissionFormProps) => {
    const { addStudent, updateStudent, students, classes: allClasses, feeStructure, campuses, settings } = useStore();
    const [activeSection, setActiveSection] = useState('personal');
    const [submittedStudent, setSubmittedStudent] = useState<Student | null>(null);

    const detectedType = useMemo(() => {
        if (initialType) return initialType;
        if (editStudent?.class) {
            return editStudent.class.toLowerCase().includes('year') ? 'College' : 'School';
        }
        return null;
    }, [initialType, editStudent]);

    const filteredClasses = useMemo(() => {
        if (!detectedType) return allClasses;
        if (detectedType === 'College') {
            return allClasses.filter(c => c.toLowerCase().includes('year'));
        } else {
            return allClasses.filter(c => !c.toLowerCase().includes('year'));
        }
    }, [allClasses, detectedType]);

    const [showCamera, setShowCamera] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Student>>({
        name: '',
        fatherName: '',
        class: filteredClasses[0] || '',
        campus: initialCampus || (campuses[0]?.name || 'Main Campus'),
        status: 'Active',
        gender: 'Male',
        religion: 'Islam',
        nationality: 'Pakistani',
        dob: '',
        admissionDate: new Date().toISOString().split('T')[0],
        academicRecords: [],
        admissionFees: 0,
        monthlyFees: 0,
        securityFees: 0,
        miscellaneousCharges: 0,
        documents: {},
        manualId: editStudent?.id || '',
        ...editStudent
    });

    // Auto-generate next sequential number for manualId
    useEffect(() => {
        if (!editStudent) {
            const campusId = formData.campus || '';
            const campus = campuses.find(c => c.id === campusId || c.name === campusId);
            const rawPrefix = campus?.idPrefix ? campus.idPrefix.replace(/^PS-/, '').replace(/-$/, '') : 'GEN';
            const fullPrefix = `PS-${rawPrefix}-`;

            const campusStudents = students.filter(s => s.id.startsWith(fullPrefix));
            let nextNum = 1;
            if (campusStudents.length > 0) {
                const numbers = campusStudents.map(s => {
                    const match = s.id.match(/(\d+)$/);
                    return match ? parseInt(match[1]) : 0;
                });
                nextNum = Math.max(...numbers) + 1;
            }
            // Populate FULL ID for transparency and manual adjustment
            setFormData(prev => ({ ...prev, manualId: `${fullPrefix}${nextNum.toString().padStart(4, '0')}` }));
        }
    }, [formData.campus, editStudent, students, campuses, setFormData]);

    // Auto-fill monthly fees based on class selection
    useEffect(() => {
        if (!editStudent && formData.class && feeStructure[formData.class]) {
            setFormData(prev => ({
                ...prev,
                monthlyFees: feeStructure[formData.class as string]
            }));
        }

        // Auto-add 9th class record if current class is 10th
        if (!editStudent && formData.class?.toString().toLowerCase().includes('10th')) {
            const has9th = formData.academicRecords?.some(r => r.degree.toLowerCase().includes('9th'));
            if (!has9th) {
                setFormData(prev => ({
                    ...prev,
                    academicRecords: [
                        { degree: '9th Class (Board)', major: 'General', marksObtained: '', totalMarks: '', percentage: '', passingYear: (new Date().getFullYear() - 1).toString(), board: 'BISE' },
                        ...(prev.academicRecords || [])
                    ]
                }));
            }
        }

        // Auto-add 10th class record if current class is College
        if (!editStudent && detectedType === 'College') {
            const has10th = formData.academicRecords?.some(r => r.degree.toLowerCase().includes('10th') || r.degree.toLowerCase().includes('ssc'));
            if (!has10th) {
                setFormData(prev => ({
                    ...prev,
                    academicRecords: [
                        { degree: '10th Class (SSC)', major: 'Science', marksObtained: '', totalMarks: '1100', percentage: '', passingYear: new Date().getFullYear().toString(), board: 'Federal Board' },
                        ...(prev.academicRecords || [])
                    ]
                }));
            }
        }
    }, [formData.class, feeStructure, editStudent, detectedType]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }));
    };

    const handleAcademicChange = (index: number, field: keyof AcademicRecord, value: string) => {
        const updatedRecords = [...(formData.academicRecords || [])];
        updatedRecords[index] = { ...updatedRecords[index], [field]: value };

        // Auto-calculate percentage
        if (field === 'marksObtained' || field === 'totalMarks') {
            const obtained = parseFloat(field === 'marksObtained' ? value : updatedRecords[index].marksObtained);
            const total = parseFloat(field === 'totalMarks' ? value : updatedRecords[index].totalMarks);
            if (obtained && total) {
                updatedRecords[index].percentage = ((obtained / total) * 100).toFixed(1) + '%';
            }
        }

        setFormData(prev => ({ ...prev, academicRecords: updatedRecords }));
    };

    const addAcademicRecord = () => {
        setFormData(prev => ({
            ...prev,
            academicRecords: [
                ...(prev.academicRecords || []),
                { degree: '', major: '', marksObtained: '', totalMarks: '', percentage: '', passingYear: '', board: '' }
            ]
        }));
    };

    const removeAcademicRecord = (index: number) => {
        setFormData(prev => ({
            ...prev,
            academicRecords: (prev.academicRecords || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Fallback: If not on the final section, navigating instead of submitting
        // This prevents premature submission via Enter key or accidental triggers
        if (activeSection !== 'financial') {
            const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
            if (currentIndex !== -1 && currentIndex < SECTIONS.length - 1) {
                setActiveSection(SECTIONS[currentIndex + 1].id);
                const container = document.querySelector('.custom-scrollbar');
                if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
        }

        if (!formData.name || !formData.class) {
            Swal.fire('Error', 'Full Name and Class are required.', 'error');
            return;
        }

        // Calculate feesTotal
        const total = (formData.admissionFees || 0) +
            (formData.monthlyFees || 0) +
            (formData.securityFees || 0) +
            (formData.miscellaneousCharges || 0);

        const finalData = {
            ...formData,
            feesTotal: total,
            feesPaid: editStudent ? editStudent.feesPaid : 0
        } as Student;

        // Generate Campus Specific ID using Manual ID
        const campusId = formData.campus || '';
        const campus = campuses.find(c => c.id === campusId || c.name.toLowerCase() === campusId.toLowerCase());
        const finalCampusName = campus?.name || campusId;

        // Robust ID cleaning: Ensure PS-[PREFIX]-[NUMBER]
        let inputId = (formData as any).manualId || '';

        // If it's just numbers, prepend prefix
        if (/^\d+$/.test(inputId)) {
            const rawPrefix = campus?.idPrefix ? campus.idPrefix.replace(/^PS-/, '').replace(/-$/, '') : 'GEN';
            inputId = `PS-${rawPrefix}-${inputId.padStart(4, '0')}`;
        } else {
            // Clean double prefixing and formatting
            const numericPart = inputId.match(/(\d+)$/)?.[1] || '0001';
            let prefixPart = inputId.replace(numericPart, '').replace(/-$/, '');

            // Remove redundant PS-PS- or similar
            let cleanPrefix = prefixPart.replace(/PS-/g, '').replace(/-/g, '').trim() || 'GEN';
            inputId = `PS-${cleanPrefix}-${numericPart.padStart(4, '0')}`;
        }

        finalData.id = inputId;
        finalData.campus = finalCampusName;

        if (editStudent) {
            updateStudent(editStudent.id, finalData);
            Swal.fire({
                title: 'Data Updated',
                text: 'Student records have been saved successfully.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
            });
            onClose();
        } else {
            addStudent(finalData);
            setSubmittedStudent(finalData);
            Swal.fire({
                title: 'Admission Successful',
                text: 'Student registered. Showing fee voucher...',
                icon: 'success',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
            });
        }
    };



    if (submittedStudent) {
        return <FeeVoucher student={submittedStudent} onClose={onClose} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 overflow-hidden antialiased"
        >
            <div className="absolute inset-0" onClick={onClose}></div>

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                className="relative w-full max-w-4xl h-full max-h-[95vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Advanced Premium Header */}
                <div className="relative px-6 md:px-12 pt-6 pb-4 border-b border-slate-100 dark:border-white/5">
                    {/* Upper Header: Logo + Title + Progress */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-tr from-brand-primary to-blue-400 opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity"></div>
                                <div className="relative w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center p-2 border border-slate-50 dark:border-white/10">
                                    {detectedType === 'College' ? (
                                        settings.logo2 ? <img src={settings.logo2} className="w-full h-full object-contain" alt="College Logo" /> : <GraduationCap className="w-10 h-10 text-brand-primary" />
                                    ) : (
                                        settings.logo1 ? <img src={settings.logo1} className="w-full h-full object-contain" alt="School Logo" /> : <School className="w-10 h-10 text-brand-primary" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl md:text-3xl font-[1000] text-[#003366] dark:text-white tracking-tighter uppercase font-outfit">
                                        Admission Form
                                    </h2>
                                    <span className="px-4 py-1 bg-amber-400 text-[#003366] rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-400/20">
                                        {formData.campus}
                                    </span>
                                </div>
                                <p className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                    Student Registration <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {detectedType || 'Institution'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 md:min-w-[200px]">
                            <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Form Progress</span>
                                <span className="text-[10px] font-black text-[#003366] dark:text-blue-400 uppercase tracking-widest">Step {SECTIONS.findIndex(s => s.id === activeSection) + 1}/{SECTIONS.length}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#003366] dark:bg-blue-500 shadow-[0_0_15px_rgba(0,51,102,0.3)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((SECTIONS.findIndex(s => s.id === activeSection) + 1) / SECTIONS.length) * 100}%` }}
                                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                />
                            </div>
                        </div>

                        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-slate-300 hover:text-rose-500 group">
                            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>

                    {/* Lower Header: Stepper */}
                    <div className="relative pt-2 overflow-x-auto custom-scrollbar-hide pb-1">
                        <div className="flex items-center justify-between min-w-[700px] px-4 relative">
                            {/* Connector Line */}
                            <div className="absolute top-6 left-12 right-12 h-[2px] bg-slate-100 dark:bg-white/5 z-0"></div>

                            {SECTIONS.map((s, idx) => {
                                const currentIndex = SECTIONS.findIndex(sec => sec.id === activeSection);
                                const isCompleted = currentIndex > idx;
                                const isActive = currentIndex === idx;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveSection(s.id)}
                                        className="relative z-10 flex flex-col items-center gap-4 group cursor-pointer"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                                            isActive ? "bg-[#003366] text-white shadow-2xl shadow-[#003366]/30 scale-110" :
                                                isCompleted ? "bg-emerald-500 text-white shadow-lg" :
                                                    "bg-white dark:bg-slate-800 text-slate-300 border border-slate-100 dark:border-white/5"
                                        )}>
                                            {isCompleted ? <CheckCircle className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
                                        </div>
                                        <div className="text-center">
                                            <p className={cn(
                                                "text-[9.5px] font-[1000] uppercase tracking-widest mb-0.5 transition-colors",
                                                isActive ? "text-slate-900 dark:text-white" : "text-slate-800/60 dark:text-slate-400"
                                            )}>{s.label}</p>
                                            <p className={cn(
                                                "text-[8px] font-black uppercase tracking-tight transition-colors",
                                                isActive ? "text-slate-900/80 dark:text-white/80" : "text-slate-800/40 dark:text-slate-500"
                                            )}>{s.sub}</p>
                                        </div>
                                        {isActive && (
                                            <motion.div layoutId="active-dot" className="absolute -top-1 w-1.5 h-1.5 bg-[#003366] dark:bg-blue-400 rounded-full"></motion.div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-white dark:bg-slate-900/50">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-4xl mx-auto"
                            >
                                {activeSection === 'personal' && (
                                    <div className="space-y-12">
                                        <div className="relative p-0.5 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden">
                                            <div className="bg-white dark:bg-[#000d1a] rounded-[1.95rem] p-5 flex flex-col md:flex-row items-center gap-6 group">
                                                <div className="relative shrink-0">
                                                    <div className="absolute -inset-4 bg-blue-500/10 rounded-[3rem] blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                                                    <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-slate-100 dark:border-white/10 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-white/5 transition-all group-hover:border-[#003366] group-hover:scale-[1.02]">
                                                        {formData.avatar ? (
                                                            <img src={formData.avatar} className="w-full h-full object-cover" alt="Student" />
                                                        ) : (
                                                            <Camera className="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform" />
                                                        )}
                                                        <input
                                                            type="file"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => setFormData(prev => ({ ...prev, avatar: reader.result as string }));
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 flex gap-2">
                                                        <label className="p-2 bg-[#003366] text-white rounded-xl shadow-lg cursor-pointer hover:bg-[#002b57] transition-all flex items-center justify-center">
                                                            <Upload className="w-4 h-4" />
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => setFormData(prev => ({ ...prev, avatar: reader.result as string }));
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCamera('avatar')}
                                                            className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center"
                                                        >
                                                            <Camera className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="text-center md:text-left">
                                                    <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-3">Student Photo</h3>
                                                    <p className="text-xs md:text-sm font-black text-slate-900/60 dark:text-slate-400 leading-relaxed max-w-md">
                                                        Upload a professional photo of the student for school ID cards and institutional records.
                                                    </p>
                                                    <div className="inline-flex mt-6 px-4 py-2 bg-slate-900 text-white dark:bg-white/10 rounded-xl">
                                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Supports: JPG, PNG, WEBP</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField label="Full Name" icon={User} name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter full name" type="text" required />
                                            <FormField label="Select Campus" icon={MapPin} name="campus" value={formData.campus} onChange={handleInputChange} type="select" options={[...campuses.map(c => c.name.toUpperCase())]} disabled={!!initialCampus} />
                                            <FormField
                                                label="Permanent Student ID"
                                                icon={Hash}
                                                name="manualId"
                                                value={formData.manualId}
                                                onChange={handleInputChange}
                                                placeholder="PS-MH-0001"
                                                type="text"
                                            />
                                            <FormField label="Date of Birth" icon={Calendar} name="dob" value={formData.dob} onChange={handleInputChange} type="date" required />
                                            <FormField label="Gender" icon={User} name="gender" value={formData.gender} onChange={handleInputChange} type="select" options={['Male', 'Female', 'Other']} required />
                                            <FormField label="CNIC / B-Form" icon={Hash} name="cnic" value={formData.cnic} onChange={handleInputChange} placeholder="00000-0000000-0" type="text" />
                                            <FormField label="Religion" icon={ShieldCheck} name="religion" value={formData.religion} onChange={handleInputChange} type="text" required />
                                            <FormField label="Nationality" icon={ShieldCheck} name="nationality" value={formData.nationality} onChange={handleInputChange} type="text" />
                                            <FormField label="Email Address" icon={Upload} name="email" value={formData.email} onChange={handleInputChange} placeholder="student@example.com" type="email" />
                                            <FormField label="Guardian Phone" icon={Phone} name="contactSelf" value={formData.contactSelf} onChange={handleInputChange} placeholder="03XXXXXXXXX" type="tel" />
                                            <div className="col-span-full">
                                                <FormField label="Home Address" icon={MapPin} name="address" value={formData.address} onChange={handleInputChange} textarea />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'parental' && (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <FormField label="Father / Guardian Name" icon={Users} name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Enter name" type="text" />
                                            <FormField label="Father's Job" icon={ShieldCheck} name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} type="text" />
                                            <FormField label="Guardian Phone" icon={Phone} name="contactFather" value={formData.contactFather} onChange={handleInputChange} placeholder="03XXXXXXXXX" type="tel" />
                                            <FormField label="WhatsApp Sync" icon={Phone} name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} placeholder="923XXXXXXXXX" type="tel" required />
                                            <FormField label="Monthly Income" icon={DollarSign} name="monthlyIncome" value={formData.monthlyIncome} onChange={handleInputChange} type="number" />
                                            <FormField label="Orphan Status" icon={ShieldCheck} name="isOrphan" value={formData.isOrphan} onChange={handleInputChange} type="select" options={['No', 'Yes']} />
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'academic' && (
                                    <div className="space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className={cn(detectedType !== 'College' && "col-span-full")}>
                                                <FormField label="Select Class" icon={GraduationCap} name="class" value={formData.class} onChange={handleInputChange} type="select" options={['', ...filteredClasses]} />
                                            </div>
                                            {detectedType === 'College' && (
                                                <FormField label="Select Board" icon={GraduationCap} name="discipline" value={formData.discipline} onChange={handleInputChange} placeholder="E.g. Science, Arts" />
                                            )}
                                        </div>

                                        <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <h4 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight">Previous School Info</h4>
                                                    <p className="text-sm text-slate-900/60 dark:text-slate-400 mt-1 font-black">Please add the student's previous school result details.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={addAcademicRecord}
                                                    className="px-6 py-3 bg-[#003366] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:shadow-xl transition-all active:scale-95"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Record
                                                </button>
                                            </div>

                                            <div className="grid gap-6">
                                                {formData.academicRecords?.map((record, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative group"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAcademicRecord(index)}
                                                            className="absolute -top-3 -right-3 p-3 bg-rose-500 text-white rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            <div className="md:col-span-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Credential (e.g. Metric / SSC)"
                                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none font-bold text-sm focus:border-blue-500 transition-all"
                                                                    value={record.degree}
                                                                    onChange={(e) => handleAcademicChange(index, 'degree', e.target.value)}
                                                                />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                placeholder="Sesssion Year"
                                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none font-bold text-sm focus:border-blue-500 transition-all"
                                                                value={record.passingYear}
                                                                onChange={(e) => handleAcademicChange(index, 'passingYear', e.target.value)}
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Obtained Marks"
                                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none font-bold text-sm focus:border-blue-500 transition-all"
                                                                value={record.marksObtained}
                                                                onChange={(e) => handleAcademicChange(index, 'marksObtained', e.target.value)}
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Max Marks"
                                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none font-bold text-sm focus:border-blue-500 transition-all"
                                                                value={record.totalMarks}
                                                                onChange={(e) => handleAcademicChange(index, 'totalMarks', e.target.value)}
                                                            />
                                                            <div className="flex items-center gap-4">
                                                                <div className="px-5 py-4 bg-brand-primary text-white rounded-2xl text-xs font-black min-w-[70px] text-center">{record.percentage || '-%'}</div>
                                                                <input
                                                                    placeholder="Affiliated Board"
                                                                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none font-bold text-sm focus:border-blue-500 transition-all"
                                                                    value={record.board}
                                                                    onChange={(e) => handleAcademicChange(index, 'board', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                {(formData.academicRecords?.length || 0) === 0 && (
                                                    <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/30 rounded-[3.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                                                        <BookOpen className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-5" />
                                                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">No school history added yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'documents' && (
                                    <div className="space-y-12">
                                        <div className="text-center mb-10 max-w-2xl mx-auto">
                                            <h4 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight">Required Documents</h4>
                                            <p className="text-sm text-slate-900/60 dark:text-slate-400 mt-2 font-black">Please upload clear photos or PDF files of the student's documents.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {(() => {
                                                const academicRecords = formData.academicRecords || [];
                                                const sscRecord = academicRecords.find(r => (r.degree || '').toLowerCase().includes('10th') || (r.degree || '').toLowerCase().includes('ssc'));
                                                const needsNOC = detectedType === 'College' && sscRecord && !['federal', 'federal board', 'fbise'].includes((sscRecord.board || '').toLowerCase().trim());
                                                const currentYear = new Date().getFullYear();
                                                const needsGap = detectedType === 'College' && sscRecord && sscRecord.passingYear && parseInt(sscRecord.passingYear) < currentYear;

                                                return [
                                                    { id: 'bform', label: 'B-Form / CNIC Scanned', required: true },
                                                    { id: 'fatherCnic', label: 'Father CNIC (Both Sides)', required: true },
                                                    ...(formData.isOrphan === 'Yes' ? [{ id: 'deathCert', label: 'Father Death Certificate', required: true }] : []),
                                                    ...(needsNOC ? [{ id: 'noc', label: 'NOC / Migration Certificate', required: true }] : []),
                                                    ...(needsGap ? [{ id: 'gapCert', label: 'Gap Certificate', required: true }] : []),
                                                    { id: 'leavingCert', label: 'Migration / Character Certificate', required: detectedType === 'College' },
                                                    { id: 'transcript', label: 'Previous Result Card', required: true },
                                                    { id: 'vaccination', label: 'Bio Vaccination Profile', required: detectedType === 'School' }
                                                ];
                                            })().map((doc) => (
                                                <div key={doc.id} className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-2xl">
                                                    <div className="flex items-center gap-6">
                                                        <div className={cn(
                                                            "w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all shadow-sm",
                                                            formData.documents?.[doc.id] ? "bg-emerald-500 text-white animate-pulse" : "bg-white dark:bg-slate-900 text-slate-300 border border-slate-100 dark:border-slate-700"
                                                        )}>
                                                            {formData.documents?.[doc.id] ? <CheckCircle className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                                                        </div>
                                                        <div>
                                                            <span className="block text-xs font-[1000] uppercase tracking-widest text-slate-900 dark:text-white">
                                                                {doc.label}
                                                                {doc.required && <span className="text-rose-600 ml-1">*</span>}
                                                            </span>
                                                            <span className="text-[10px] font-black text-slate-900/40 dark:text-slate-500 mt-1 block uppercase tracking-tight">Verified Digital Format</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <label className="p-4 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-600 rounded-2xl shadow-sm cursor-pointer transition-all border border-slate-100 dark:border-slate-800 active:scale-90">
                                                            <Upload className="w-5 h-5" />
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="application/pdf,image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => setFormData(prev => ({
                                                                            ...prev,
                                                                            documents: { ...(prev.documents || {}), [doc.id]: reader.result as string }
                                                                        }));
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCamera(`doc-${doc.id}`)}
                                                            className="p-4 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-emerald-600 rounded-2xl shadow-sm transition-all border border-slate-100 dark:border-slate-800 active:scale-90"
                                                        >
                                                            <Camera className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'financial' && (
                                    <div className="space-y-12">
                                        <div className="text-center mb-10 max-w-2xl mx-auto">
                                            <h4 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight">Fee Structure</h4>
                                            <p className="text-sm text-slate-900/60 dark:text-slate-400 mt-2 font-black">Configure the admission and recurring fees for this student.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <FormField label="Admission Fee" icon={DollarSign} name="admissionFees" value={formData.admissionFees} onChange={handleInputChange} type="number" />
                                            <FormField label="Monthly Tuition" icon={DollarSign} name="monthlyFees" value={formData.monthlyFees} onChange={handleInputChange} type="number" />
                                            <FormField label="Security Deposit" icon={ShieldCheck} name="securityFees" value={formData.securityFees} onChange={handleInputChange} type="number" />
                                            <FormField label="Additional Charges" icon={Plus} name="miscellaneousCharges" value={formData.miscellaneousCharges} onChange={handleInputChange} type="number" />
                                        </div>

                                        <div className="p-10 bg-gradient-to-br from-[#003366] to-slate-900 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] group-hover:bg-white/10 transition-all duration-700"></div>
                                            <div className="w-24 h-24 bg-yellow-400 rounded-3xl flex items-center justify-center text-[#003366] shadow-[0_0_40px_rgba(250,204,21,0.3)] shrink-0 z-10">
                                                <DollarSign className="w-12 h-12" />
                                            </div>
                                            <div className="flex-1 text-center md:text-left z-10">
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Total Fee Estimate</span>
                                                <h3 className="text-5xl font-black text-white tracking-tighter mt-2">
                                                    Rs. {(
                                                        Number(formData.admissionFees || 0) +
                                                        Number(formData.monthlyFees || 0) +
                                                        Number(formData.securityFees || 0) +
                                                        Number(formData.miscellaneousCharges || 0)
                                                    ).toLocaleString()}
                                                </h3>
                                                <p className="text-sm font-medium text-blue-300 mt-3 opacity-60">This amount will be added to the student's account automatically.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Precision Responsive Footer */}
                    <div className="px-6 md:px-12 py-5 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-4 justify-between">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 md:flex-none px-6 py-3.5 bg-white dark:bg-white/5 hover:bg-slate-100 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-400 font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 shadow-sm"
                            >
                                Cancel
                            </button>
                            {activeSection !== 'personal' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
                                        if (currentIndex > 0) {
                                            setActiveSection(SECTIONS[currentIndex - 1].id);
                                        }
                                    }}
                                    className="flex-1 md:flex-none px-6 py-3.5 bg-white dark:bg-white/5 hover:bg-slate-100 border border-slate-100 dark:border-white/5 rounded-2xl text-[#003366] dark:text-white font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </button>
                            )}
                        </div>

                        {activeSection !== 'financial' ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
                                    if (currentIndex !== -1 && currentIndex < SECTIONS.length - 1) {
                                        setActiveSection(SECTIONS[currentIndex + 1].id);
                                        // Force scroll top for new section
                                        const container = document.querySelector('.custom-scrollbar');
                                        if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                }}
                                className="w-full md:w-auto px-10 py-3.5 bg-[#003366] hover:bg-[#002b57] text-white rounded-2xl font-[1000] uppercase text-[9px] tracking-widest shadow-xl shadow-[#003366]/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
                            >
                                Continue
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="w-full md:w-auto px-10 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-[1000] uppercase text-[9px] tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
                            >
                                <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                {editStudent ? 'Update' : 'Submit'}
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>

            <LiveCameraModal
                isOpen={!!showCamera}
                onClose={() => setShowCamera(null)}
                onCapture={(img) => {
                    if (showCamera === 'avatar') {
                        setFormData(prev => ({ ...prev, avatar: img }));
                    } else if (showCamera?.startsWith('doc-')) {
                        const docId = showCamera.replace('doc-', '');
                        setFormData(prev => ({
                            ...prev,
                            documents: { ...(prev.documents || {}), [docId]: img }
                        }));
                    }
                    setShowCamera(null);
                }}
            />
        </motion.div>
    );
};

const LiveCameraModal = ({ isOpen, onClose, onCapture }: { isOpen: boolean, onClose: () => void, onCapture: (img: string) => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (isOpen) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 } })
                .then(s => {
                    setStream(s);
                    if (videoRef.current) videoRef.current.srcObject = s;
                })
                .catch(err => {
                    console.error("Camera Error:", err);
                    Swal.fire('Error', 'Could not access camera. Please check permissions.', 'error');
                    onClose();
                });
        } else {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
        }
    }, [isOpen]);

    const capture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            onCapture(canvas.toDataURL('image/jpeg', 0.8));
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                >
                    <div className="relative w-full max-w-2xl bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-xl">
                                    <Camera className="w-5 h-5 text-emerald-500" />
                                </div>
                                <h3 className="text-white font-black uppercase text-xs tracking-widest">Live Capture</h3>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="relative aspect-video bg-black flex items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Guidelines Overlay */}
                            <div className="absolute inset-x-0 inset-y-0 border-[40px] border-black/40 pointer-events-none">
                                <div className="w-full h-full border-2 border-dashed border-white/20 rounded-3xl"></div>
                            </div>
                        </div>

                        <div className="p-8 flex items-center justify-center gap-4 bg-slate-900/50">
                            <button
                                onClick={onClose}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={capture}
                                className="flex-1 max-w-[240px] px-8 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-[1000] uppercase text-[10px] tracking-widest shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <div className="w-4 h-4 rounded-full border-4 border-white animate-pulse"></div>
                                Capture Photo
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const FormField = ({ label, icon: Icon, textarea, type = "text", options = [], required, ...props }: any) => {
    return (
        <div className="space-y-1.5 group">
            <label className="text-[8px] md:text-[9.5px] font-[1000] text-slate-900 dark:text-white uppercase tracking-widest ml-1 flex items-center gap-1.5 transition-colors group-focus-within:text-blue-600">
                <Icon className="w-3 h-3" />
                {label}
                {required && <span className="text-rose-600 font-black">*</span>}
            </label>
            <div className="relative">
                {textarea ? (
                    <textarea
                        className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-50 dark:border-white/5 p-3 rounded-xl text-xs font-bold outline-none ring-offset-0 focus:ring-4 focus:ring-[#003366]/5 focus:border-[#003366]/20 transition-all min-h-[100px] resize-none shadow-sm dark:text-white"
                        {...props}
                    />
                ) : type === 'select' ? (
                    <div className="relative group/select">
                        <select
                            className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-50 dark:border-white/5 px-4 py-2.5 rounded-xl text-xs font-black outline-none focus:ring-4 focus:ring-[#003366]/5 focus:border-[#003366]/20 transition-all appearance-none cursor-pointer shadow-sm dark:text-white"
                            {...props}
                        >
                            {options.map((opt: string) => <option key={opt} value={opt} className="bg-white dark:bg-slate-900">{opt}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within/select:text-[#003366] transition-colors">
                            <ChevronRight className="w-4 h-4 rotate-90" />
                        </div>
                    </div>
                ) : (
                    <input
                        type={type}
                        className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-50 dark:border-white/5 px-4 py-2.5 rounded-xl text-xs font-[800] tracking-tight outline-none focus:ring-4 focus:ring-[#003366]/5 focus:border-[#003366]/20 transition-all shadow-sm dark:text-white"
                        onFocus={(e) => {
                            if (type === 'number' && e.target.value === '0') {
                                e.target.value = '';
                            }
                            props.onFocus?.(e);
                        }}
                        {...props}
                    />
                )}
            </div>
        </div>
    );
};
