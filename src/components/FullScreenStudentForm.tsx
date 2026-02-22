import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Users,
    School,
    FileText,
    CreditCard,
    X,
    Camera,
    Upload,
    ChevronRight,
    ChevronLeft,
    CheckCircle2
} from 'lucide-react';

interface FullScreenStudentFormProps {
    onClose: () => void;
}

const steps = [
    { id: 1, title: 'STUDENT INFO', subtitle: 'BASIC DETAILS', icon: User },
    { id: 2, title: 'PARENT INFO', subtitle: 'FAMILY DETAILS', icon: Users },
    { id: 3, title: 'PREVIOUS SCHOOL', subtitle: 'PAST RECORDS', icon: School },
    { id: 4, title: 'DOCUMENTS', subtitle: 'FILES & PHOTOS', icon: FileText },
    { id: 5, title: 'FEES INFO', subtitle: 'FEE DETAILS', icon: CreditCard },
];

const FullScreenStudentForm: React.FC<FullScreenStudentFormProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        campus: 'Dr Manzoor ul Hassan Campus',
        photo: null as string | null,
        // Add other fields as needed
    });

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // const currentStepData = steps.find(s => s.id === currentStep);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card w-full max-w-5xl bg-white overflow-hidden flex flex-col relative"
                style={{ height: 'calc(100vh - 4rem)', maxHeight: '850px' }}
            >
                {/* Header Section */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-start border-b border-slate-100">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center p-2 border border-slate-100">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-[var(--brand-primary)] tracking-tight">ADMISSION FORM</h1>
                                <span className="bg-[var(--brand-accent)] text-[var(--brand-primary)] text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-yellow-400/20">
                                    CAMP-MANZOOR
                                </span>
                            </div>
                            <p className="text-[var(--brand-primary)]/60 text-[10px] font-bold tracking-[0.2em] uppercase">
                                Student Registration • School
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[var(--brand-primary)]/40 text-[9px] font-black tracking-widest uppercase mb-1">Form Progress</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                                            className="h-full bg-[var(--brand-primary)]"
                                        />
                                    </div>
                                    <span className="text-[var(--brand-primary)] text-[11px] font-black italic uppercase">Step {currentStep}/{steps.length}</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stepper Navigation */}
                <div className="px-8 py-6 bg-slate-50/50 flex justify-between items-center relative overflow-x-auto no-scrollbar">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <React.Fragment key={step.id}>
                                {idx > 0 && (
                                    <div className="flex-1 h-px bg-slate-200 mx-4 min-w-[20px]" />
                                )}
                                <button
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`flex flex-col items-center group transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm relative ${isActive ? 'bg-[var(--brand-primary)] text-white shadow-xl shadow-blue-900/20' :
                                        isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' :
                                            'bg-white text-slate-300 border border-slate-100 hover:border-slate-300'
                                        }`}>
                                        {isCompleted ? <CheckCircle2 size={24} /> : <Icon size={24} />}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeStep"
                                                className="absolute -inset-1 rounded-2xl border-2 border-[var(--brand-primary)]/20"
                                            />
                                        )}
                                    </div>
                                    <div className="mt-3 text-center min-w-[100px]">
                                        <p className={`text-[10px] font-black transition-colors ${isActive ? 'text-[var(--brand-primary)]' : isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                                            {step.title}
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">{step.subtitle}</p>
                                    </div>
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Form Content - Steps */}
                <div className="flex-1 overflow-y-auto px-8 py-10 scrollbar-hide">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="max-w-4xl mx-auto"
                        >
                            {currentStep === 1 && (
                                <div className="space-y-8">
                                    {/* Photo Upload Section */}
                                    <div className="flex flex-col md:flex-row gap-8 items-center bg-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50">
                                        <div className="w-48 h-48 rounded-3xl bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[var(--brand-primary)] transition-colors shadow-inner">
                                            {formData.photo ? (
                                                <img src={formData.photo} alt="Student" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-300 group-hover:text-[var(--brand-primary)] transition-colors">
                                                    <Camera size={48} strokeWidth={1} />
                                                    <span className="text-[10px] font-black mt-2">STUDENT PHOTO</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-[var(--brand-primary)]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                                <button
                                                    className="p-3 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors"
                                                    onClick={() => setFormData(prev => ({ ...prev, photo: 'https://via.placeholder.com/150' }))}
                                                >
                                                    <Upload size={20} />
                                                </button>
                                                <button className="p-3 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors">
                                                    <Camera size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="text-2xl font-black text-[var(--brand-primary)] uppercase">Student Photo</h3>
                                                <p className="text-slate-500 text-sm leading-relaxed mt-1">
                                                    Upload a professional photo of the student for school ID cards and institutional records.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-5 py-2 bg-[var(--brand-primary)] text-white text-[10px] font-black italic uppercase rounded-full tracking-widest">Supports: JPG, PNG, WEBP</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Basic Info Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">
                                                <User size={12} /> Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter full name"
                                                className="input-modern w-full"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">
                                                <School size={12} /> Select Campus
                                            </label>
                                            <select className="input-modern w-full appearance-none">
                                                <option>Dr Manzoor ul Hassan Campus</option>
                                                <option>Model Town Campus</option>
                                                <option>Main Campus</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">
                                                Gender
                                            </label>
                                            <div className="flex gap-4">
                                                {['Male', 'Female', 'Other'].map(gender => (
                                                    <label key={gender} className="flex-1">
                                                        <input type="radio" name="gender" className="peer hidden" value={gender} />
                                                        <div className="w-full py-3 text-center border border-slate-200 rounded-2xl peer-checked:bg-[var(--brand-primary)] peer-checked:text-white peer-checked:border-[var(--brand-primary)] cursor-pointer transition-all font-bold text-sm text-slate-500">
                                                            {gender}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">
                                                Date of Birth
                                            </label>
                                            <input type="date" className="input-modern w-full" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-8">
                                    <div className="bg-yellow-50/30 p-6 rounded-[2rem] border border-yellow-100/50 flex items-start gap-4 mb-8">
                                        <div className="w-12 h-12 bg-[var(--brand-accent)] rounded-2xl flex items-center justify-center text-[var(--brand-primary)] shrink-0">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-[var(--brand-primary)] uppercase">Parent / Guardian Information</h3>
                                            <p className="text-slate-500 text-sm mt-1">Please provide accurate contact details for institutional communication.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">Father's Name</label>
                                            <input type="text" className="input-modern w-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">Father's CNIC</label>
                                            <input type="text" className="input-modern w-full" placeholder="00000-0000000-0" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">Profession</label>
                                            <input type="text" className="input-modern w-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">Contact Number</label>
                                            <input type="tel" className="input-modern w-full" />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">Residential Address</label>
                                            <textarea className="input-modern w-full min-h-[100px] resize-none"></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-8 animate-slide-up">
                                    <div className="bg-emerald-50/30 p-6 rounded-[2rem] border border-emerald-100/50 flex items-start gap-4 mb-8">
                                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                                            <School size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-[var(--brand-primary)] uppercase">Academic Background</h3>
                                            <p className="text-slate-500 text-sm mt-1">Provide details of the student's previous educational history.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">Last School Attended</label>
                                            <input type="text" className="input-modern w-full" placeholder="Enter school name" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">Last Class Attended</label>
                                            <input type="text" className="input-modern w-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">Grade / Percentage</label>
                                            <input type="text" className="input-modern w-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">Reason for Leaving</label>
                                            <input type="text" className="input-modern w-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest pl-1">Transfer Certificate No.</label>
                                            <input type="text" className="input-modern w-full" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-8 animate-slide-up">
                                    <div className="bg-purple-50/30 p-6 rounded-[2rem] border border-purple-100/50 flex items-start gap-4 mb-8">
                                        <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-[var(--brand-primary)] uppercase">Document Verification</h3>
                                            <p className="text-slate-500 text-sm mt-1">Upload necessary documents for application verification.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[
                                            { label: 'B-Form / CNIC Copy', required: true },
                                            { label: "Father's CNIC Copy", required: true },
                                            { label: 'Previous Result Card', required: false },
                                            { label: 'School Leaving Certificate', required: false },
                                            { label: 'Character Certificate', required: false },
                                            { label: 'Medical Fitness Certificate', required: false },
                                        ].map((doc, idx) => (
                                            <div key={idx} className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[var(--brand-primary)] hover:bg-slate-50 transition-all cursor-pointer">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-all shadow-sm">
                                                    <Upload size={20} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                                                        {doc.label} {doc.required && <span className="text-red-500">*</span>}
                                                    </p>
                                                    <p className="text-[8px] text-slate-400 mt-0.5 uppercase">Click to upload PDF or Image</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-8 animate-slide-up">
                                    <div className="bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50 flex items-start gap-4 mb-8">
                                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-[var(--brand-primary)] uppercase">Fee Structure & Billing</h3>
                                            <p className="text-slate-500 text-sm mt-1">Review the fee details for the selected class and campus.</p>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest">Fee Description</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest text-right">Amount (PKR)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                <tr>
                                                    <td className="px-8 py-5 text-sm font-bold text-slate-600 uppercase tracking-tight">One-time Admission Fee</td>
                                                    <td className="px-8 py-5 text-sm font-black text-[var(--brand-primary)] text-right font-mono">10,000.00</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-8 py-5 text-sm font-bold text-slate-600 uppercase tracking-tight">Security Deposit (Refundable)</td>
                                                    <td className="px-8 py-5 text-sm font-black text-[var(--brand-primary)] text-right font-mono">5,000.00</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-8 py-5 text-sm font-bold text-slate-600 uppercase tracking-tight">Monthly Tuition Fee</td>
                                                    <td className="px-8 py-5 text-sm font-black text-[var(--brand-primary)] text-right font-mono">4,500.00</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-8 py-5 text-sm font-bold text-slate-600 uppercase tracking-tight">Annual Resource & Tech Fund</td>
                                                    <td className="px-8 py-5 text-sm font-black text-[var(--brand-primary)] text-right font-mono">3,000.00</td>
                                                </tr>
                                                <tr className="bg-[var(--brand-primary)]/5">
                                                    <td className="px-8 py-5 text-sm font-black text-[var(--brand-primary)] uppercase tracking-widest">Total Payable at Admission</td>
                                                    <td className="px-8 py-5 text-base font-black text-[var(--brand-primary)] text-right font-mono underline decoration-double underline-offset-4">22,500.00</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="text-blue-500" size={20} />
                                            <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">Fee structure is automatically calculated based on 'Grade 1' and 'Main Campus' selections.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 bg-slate-50 flex items-center justify-between border-t border-slate-100 rounded-b-[2.5rem]">
                    <button
                        onClick={currentStep === 1 ? onClose : prevStep}
                        className="px-8 py-3 text-[var(--brand-primary)] text-xs font-black uppercase tracking-widest border-2 border-slate-200 rounded-2xl hover:bg-white hover:border-slate-300 transition-all flex items-center gap-2"
                    >
                        {currentStep === 1 ? 'Cancel' : <><ChevronLeft size={16} /> Previous</>}
                    </button>

                    <div className="flex items-center gap-4">
                        {currentStep < steps.length ? (
                            <button
                                onClick={nextStep}
                                className="btn-primary group !px-10"
                            >
                                CONTINUE
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                className="bg-green-600 text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-900/10 hover:bg-green-700 transition-all flex items-center gap-2"
                            >
                                SUBMIT APPLICATION
                                <CheckCircle2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FullScreenStudentForm;
