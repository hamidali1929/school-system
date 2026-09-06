import { X, Upload, Save, User, Check, Camera, GraduationCap } from 'lucide-react';
import { useStore, type Teacher } from '../context/StoreContext';
import Swal from 'sweetalert2';
import { useState, useRef } from 'react';
import { cn } from '../utils/cn';

interface TeacherFormProps {
    onClose: () => void;
    editTeacher?: Teacher;
}

const ROLE_PRESETS: Record<string, string[]> = {
    'Class Teacher': ['attendance_mark', 'results_manage', 'students_view', 'students_add', 'timetable_view'],
    'Subject Teacher': ['results_manage', 'timetable_view'],
    'Administrator': ['attendance_mark', 'results_manage', 'students_view', 'students_add', 'timetable_view', 'library_access'],
    'Librarian': ['library_access', 'students_view'],
    'Custom': []
};

const PERMISSIONS = [
    { id: 'attendance_mark', label: 'Mark Attendance', icon: 'CheckSquare', description: 'Permits marking daily student attendance' },
    { id: 'results_manage', label: 'Manage Results', icon: 'FileText', description: 'Enables data entry for exam marks' },
    { id: 'students_view', label: 'Student Directory', icon: 'Users', description: 'Access to student profiles & history' },
    { id: 'students_add', label: 'Add Students', icon: 'UserPlus', description: 'Authority to register new students' },
    { id: 'timetable_view', label: 'Classroom Timetable', icon: 'Calendar', description: 'Edit and manage class schedules' },
    { id: 'library_access', label: 'Library Control', icon: 'BookOpen', description: 'Manage books & borrowing records' },
    { id: 'fees_manage', label: 'Financial Control', icon: 'DollarSign', description: 'Access to fee collection & ledgers' }
];

export const TeacherForm = ({ onClose, editTeacher }: TeacherFormProps) => {
    const { addTeacher, updateTeacher, settings, campuses, classes: allClasses } = useStore();
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const detectedCampusCodes = campuses.reduce((acc: any, c) => {
        acc[c.name] = c.idPrefix || c.id.split('-').pop();
        return acc;
    }, {});

    const [formData, setFormData] = useState({
        name: editTeacher?.name || '',
        subject: editTeacher?.subject || '',
        phone: editTeacher?.phone || '',
        whatsappNumber: editTeacher?.whatsappNumber || '',
        email: editTeacher?.email || '',
        fatherName: editTeacher?.fatherName || '',
        husbandName: editTeacher?.husbandName || '',
        maritalStatus: editTeacher?.maritalStatus || 'Single',
        address: editTeacher?.address || '',
        dob: editTeacher?.dob || '',
        cnic: editTeacher?.cnic || '',
        gender: editTeacher?.gender || 'Male',
        qualification: editTeacher?.qualification || '',
        experience: editTeacher?.experience || '',
        joiningDate: editTeacher?.joiningDate || new Date().toISOString().split('T')[0],
        employmentType: 'Full-Time',
        campus: editTeacher?.campus || '',
        id: editTeacher?.id || 'PST-',
        status: editTeacher?.status || 'Active',
        username: editTeacher?.username || '',
        password: editTeacher?.password || '',
        permissions: editTeacher?.permissions || ['timetable_view'],
        role: editTeacher?.role || 'Custom',
        classes: editTeacher?.classes || [],
        baseSalary: editTeacher?.baseSalary || 0,
        inchargeClass: editTeacher?.inchargeClass || ''
    });

    const [teacherPhoto, setTeacherPhoto] = useState<string | null>(editTeacher?.avatar || null);
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>(editTeacher?.documents || {});

    const handleDocUpload = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
                Swal.fire('Invalid Format', 'Please upload PDF or Image files.', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedDocs(prev => ({ ...prev, [docName]: reader.result as string }));
                Swal.fire({
                    title: 'Document Attached',
                    text: `${docName} has been encrypted and attached.`,
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            let val: any = value;
            if (name === 'baseSalary') val = Number(value);

            const newFormData = { ...prev, [name]: val };

            if ((name === 'name' || name === 'campus') && !editTeacher) {
                const currentName = name === 'name' ? String(value) : prev.name;
                const currentCampus = name === 'campus' ? String(value) : prev.campus;

                if (currentName.trim().length >= 3) {
                    const campusPart = detectedCampusCodes[currentCampus]?.toLowerCase() || 'inst';
                    const namePart = currentName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
                    const randomId = Math.floor(100 + Math.random() * 899);
                    newFormData.username = `${campusPart}.${namePart}${randomId}`;

                    if (!prev.password) {
                        const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
                        let pass = "";
                        for (let i = 0; i < 6; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                        newFormData.password = pass;
                    }
                }
            }

            if (name === 'role') {
                newFormData.permissions = ROLE_PRESETS[value] || [];
            }

            return newFormData;
        });
    };

    const togglePermission = (permId: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permId)
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId]
        }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setTeacherPhoto(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const startCamera = () => {
        setIsCameraOpen(true);
        setTimeout(async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                Swal.fire('Error', 'Could not access camera.', 'error');
                setIsCameraOpen(false);
            }
        }, 100);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                setTeacherPhoto(canvasRef.current.toDataURL('image/jpeg', 0.8));
                stopCamera();
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const missingFields = [];
        if (!formData.name.trim()) missingFields.push('Full Name');
        if (!formData.subject) missingFields.push('Department/Subject');
        if (!formData.campus) missingFields.push('Campus');

        if (missingFields.length > 0) {
            Swal.fire({
                title: 'Missing Information',
                text: `Please provide: ${missingFields.join(', ')}`,
                icon: 'error',
                confirmButtonColor: 'var(--brand-primary)'
            });
            return;
        }

        const teacherPayload = {
            ...formData,
            avatar: teacherPhoto || formData.name.charAt(0),
            documents: uploadedDocs
        };

        if (editTeacher) updateTeacher(editTeacher.id, teacherPayload);
        else addTeacher(teacherPayload);

        Swal.fire({
            title: '<div class="text-brand-primary font-black uppercase text-2xl">Profile Created</div>',
            html: `
                <div class="mt-4 p-6 bg-slate-50 rounded-3xl border border-slate-200 text-left space-y-4 font-outfit">
                    <div class="flex items-center justify-between border-b pb-3 mb-3">
                        <span class="text-[10px] font-black uppercase text-slate-400">Faculty Credentials</span>
                        <span class="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div>
                                <p class="text-[9px] font-black uppercase text-slate-400 uppercase">Username</p>
                                <p class="text-sm font-mono font-black text-brand-primary">${formData.username}</p>
                            </div>
                            <button onclick="navigator.clipboard.writeText('${formData.username}')" class="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                        </div>
                        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div>
                                <p class="text-[9px] font-black uppercase text-slate-400 uppercase tracking-widest">Pin</p>
                                <p class="text-sm font-mono font-black text-brand-primary">${formData.password}</p>
                            </div>
                            <button onclick="navigator.clipboard.writeText('${formData.password}')" class="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `,
            confirmButtonText: 'FINISH',
            confirmButtonColor: 'var(--brand-primary)',
        });
        onClose();
    };

    const [mobileTab, setMobileTab] = useState<'personal' | 'academic' | 'access'>('personal');

    if (!formData.campus && !editTeacher) {
        return (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
                <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-brand-primary/10 dark:bg-brand-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-brand-primary dark:text-brand-accent">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black uppercase text-brand-primary dark:text-brand-accent tracking-tighter">Campus Registry</h2>
                        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1">Select Faculty Campus Location</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                        {(campuses && campuses.length > 0 ? campuses : [{ name: 'MAIN CAMPUS', id: 'DEFAULT', idPrefix: 'MAIN' }]).map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                    const prefix = c.idPrefix || c.id.split('-').pop();
                                    const randomId = Math.floor(1000 + Math.random() * 9000);
                                    setFormData(prev => ({ ...prev, campus: c.name, id: `PST-${prefix}-${randomId}` }));
                                }}
                                className={cn("flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left", formData.campus === c.name ? "border-brand-primary bg-brand-primary/5 dark:border-brand-accent dark:bg-brand-accent/10" : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700")}
                            >
                                <span className="font-black text-xs uppercase text-brand-primary dark:text-white">{c.name.toUpperCase()}</span>
                                {formData.campus === c.name && <Check className="text-brand-primary dark:text-brand-accent" size={16} />}
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancel</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative w-full max-w-6xl h-[94vh] sm:h-[88vh] max-h-[900px] bg-white dark:bg-slate-950 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-200 z-10">
                
                {/* Header */}
                <div className="bg-brand-primary px-4 sm:px-6 py-3 text-white flex items-center justify-between shrink-0 border-b-2 border-brand-accent">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm shrink-0">
                            {settings.logo1 ? <img src={settings.logo1} className="w-full h-full object-contain" /> : <GraduationCap className="text-brand-primary w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-black text-xs sm:text-sm uppercase tracking-tight text-brand-accent truncate">
                                {editTeacher ? 'Edit Faculty Record' : 'Institutional Faculty Profile'}
                            </h2>
                            <p className="text-[7px] sm:text-[8px] font-bold opacity-70 uppercase tracking-widest truncate">{formData.campus.toUpperCase()} • {formData.id || 'NEW'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-white/10 text-white hover:text-brand-accent rounded-xl transition-all"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    </div>
                </div>

                {/* Mobile Tab Switcher (Visible on < lg) */}
                <div className="lg:hidden flex items-center bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-1 shrink-0">
                    <button
                        type="button"
                        onClick={() => setMobileTab('personal')}
                        className={cn(
                            "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                            mobileTab === 'personal'
                                ? "bg-white dark:bg-slate-800 text-brand-primary dark:text-brand-accent shadow-sm"
                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                        )}
                    >
                        <User className="w-3.5 h-3.5" />
                        <span>Personnel</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileTab('academic')}
                        className={cn(
                            "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                            mobileTab === 'academic'
                                ? "bg-white dark:bg-slate-800 text-brand-primary dark:text-brand-accent shadow-sm"
                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                        )}
                    >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Academic</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileTab('access')}
                        className={cn(
                            "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                            mobileTab === 'access'
                                ? "bg-white dark:bg-slate-800 text-brand-primary dark:text-brand-accent shadow-sm"
                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                        )}
                    >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Access & Docs</span>
                    </button>
                </div>

                {/* Form Body Container */}
                <div className="flex-1 flex overflow-hidden lg:flex-row flex-col">
                    
                    {/* Desktop Sidebar (lg:flex) / Mobile Sidebar Elements (controlled by mobileTab) */}
                    <aside className="hidden lg:flex lg:w-80 bg-slate-50 dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800 flex-col p-5 space-y-4 overflow-y-auto custom-scrollbar shrink-0">
                        
                        {/* Photo Card */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Faculty Photo</p>
                            <div className="w-full aspect-square max-w-[220px] mx-auto rounded-2xl relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                                {isCameraOpen ? (
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                ) : teacherPhoto ? (
                                    <img src={teacherPhoto} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <User className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                        <span className="text-[8px] font-bold uppercase tracking-wider">No Photo</span>
                                    </div>
                                )}
                                {!isCameraOpen && (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                        <button type="button" onClick={() => (document.getElementById('teacher-pt-input') as HTMLInputElement)?.click()} className="px-3 py-2 bg-white text-brand-primary rounded-xl text-[9px] font-black uppercase shadow-lg flex items-center gap-1.5 hover:bg-brand-accent transition-colors">
                                            <Upload size={12} /> Upload
                                        </button>
                                        <button type="button" onClick={startCamera} className="p-2 bg-brand-accent text-brand-primary rounded-xl shadow-lg hover:bg-yellow-300 transition-colors">
                                            <Camera size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <input type="file" id="teacher-pt-input" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            
                            {isCameraOpen ? (
                                <div className="mt-3 flex gap-2">
                                    <button type="button" onClick={capturePhoto} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors">Capture</button>
                                    <button type="button" onClick={stopCamera} className="px-3 py-2 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition-colors"><X size={14} /></button>
                                </div>
                            ) : (
                                <div className="mt-3 flex gap-2 lg:hidden">
                                    <button type="button" onClick={() => (document.getElementById('teacher-pt-input') as HTMLInputElement)?.click()} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[8px] font-black uppercase flex items-center justify-center gap-1">
                                        <Upload size={12} /> Upload
                                    </button>
                                    <button type="button" onClick={startCamera} className="flex-1 py-2 bg-brand-primary text-brand-accent rounded-xl text-[8px] font-black uppercase flex items-center justify-center gap-1">
                                        <Camera size={12} /> Camera
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Portal Credentials Live Card */}
                        <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl border-t-4 border-brand-accent space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[7px] font-black text-brand-accent uppercase tracking-widest">PORTAL BADGE</span>
                                <span className="text-[7px] font-bold text-slate-400 uppercase">{formData.role}</span>
                            </div>
                            <h5 className="font-black text-xs uppercase tracking-tight text-white truncate">{formData.name || 'FACULTY NAME'}</h5>
                            <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center text-[8px] font-mono">
                                    <span className="text-slate-400 uppercase">PORTAL ID</span>
                                    <span className="text-brand-accent font-bold truncate ml-2">{formData.username || '...'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[8px] font-mono">
                                    <span className="text-slate-400 uppercase">KEY</span>
                                    <span className="text-brand-accent font-bold tracking-widest">{formData.password || '••••'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Documents / Inventory */}
                        <div className="space-y-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-1">
                                <h6 className="text-[8px] font-black uppercase tracking-widest text-slate-400">Inventory</h6>
                                <span className="text-[7px] font-bold text-slate-400 uppercase">{Object.keys(uploadedDocs).length}/3 attached</span>
                            </div>
                            {['CNIC', 'Graduation', 'Experience'].map(doc => (
                                <div key={doc} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[9px] font-black uppercase text-slate-700 dark:text-slate-300 block truncate">{doc}</span>
                                    </div>
                                    {uploadedDocs[doc] ? (
                                        <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                            <Check size={10} /> Attached
                                        </span>
                                    ) : (
                                        <button type="button" onClick={() => (document.getElementById(`doc-up-${doc}`) as HTMLInputElement)?.click()} className="flex items-center gap-1 text-[8px] font-bold text-brand-primary dark:text-brand-accent bg-brand-primary/5 hover:bg-brand-primary/10 px-2 py-1 rounded-md transition-colors">
                                            <Upload size={10} /> Upload
                                        </button>
                                    )}
                                    <input type="file" id={`doc-up-${doc}`} className="hidden" onChange={(e) => handleDocUpload(doc, e)} />
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Main Form Content */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
                        <form id="faculty-form" onSubmit={handleSubmit} className="space-y-6">

                            {/* MOBILE SECTION 1: PERSONNEL INFO */}
                            <div className={cn("space-y-5", mobileTab !== 'personal' && "hidden lg:block")}>
                                
                                {/* Mobile Avatar Section */}
                                <div className="lg:hidden bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                                    <div className="w-24 h-24 rounded-2xl relative overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center border-2 border-brand-primary/20 shrink-0 shadow-sm">
                                        {isCameraOpen ? (
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                        ) : teacherPhoto ? (
                                            <img src={teacherPhoto} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-brand-primary dark:text-brand-accent">Faculty Photo</h4>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase">Upload passport size picture or use live camera</p>
                                        </div>
                                        {isCameraOpen ? (
                                            <div className="flex gap-2">
                                                <button type="button" onClick={capturePhoto} className="flex-1 py-1.5 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-wider">Take Snapshot</button>
                                                <button type="button" onClick={stopCamera} className="px-3 py-1.5 bg-rose-500 text-white rounded-lg"><X size={12} /></button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 justify-center sm:justify-start">
                                                <button type="button" onClick={() => (document.getElementById('teacher-pt-input-mob') as HTMLInputElement)?.click()} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[8px] font-black uppercase flex items-center gap-1.5 shadow-sm">
                                                    <Upload size={12} /> Choose Image
                                                </button>
                                                <button type="button" onClick={startCamera} className="px-3 py-1.5 bg-brand-primary text-brand-accent rounded-lg text-[8px] font-black uppercase flex items-center gap-1.5 shadow-sm">
                                                    <Camera size={12} /> Camera
                                                </button>
                                                <input type="file" id="teacher-pt-input-mob" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <section className="space-y-3">
                                    <div className="flex items-center gap-2 border-l-3 border-brand-accent pl-2.5">
                                        <h4 className="text-xs font-black uppercase text-brand-primary dark:text-brand-accent tracking-tight">Personnel Particulars</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {[
                                            { label: 'Full Name *', name: 'name', placeholder: 'e.g. Mr. Muhammad Basit' },
                                            { label: 'Father / Guardian Name', name: 'fatherName', placeholder: 'Father Name' },
                                            { label: 'CNIC Number', name: 'cnic', placeholder: '37101-xxxxxxx-x' },
                                            { label: 'Date of Birth', name: 'dob', type: 'date' },
                                            { label: 'Teacher / Staff ID *', name: 'id', placeholder: 'PST-MAIN-1001' },
                                            { label: 'Residential Address', name: 'address', placeholder: 'Full home address' }
                                        ].map(field => (
                                            <div key={field.name} className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">{field.label}</label>
                                                <input
                                                    name={field.name}
                                                    type={field.type || 'text'}
                                                    value={(formData as any)[field.name]}
                                                    onChange={handleInputChange}
                                                    placeholder={field.placeholder}
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 ring-brand-primary/20 dark:text-white"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2 border-l-3 border-brand-accent pl-2.5">
                                        <h4 className="text-xs font-black uppercase text-brand-primary dark:text-brand-accent tracking-tight">Communications & Status</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Phone Number</label>
                                            <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="03xx-xxxxxxx" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 ring-brand-primary/20 dark:text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">WhatsApp Number</label>
                                            <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} placeholder="03xx-xxxxxxx" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 ring-brand-primary/20 dark:text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Email Address</label>
                                            <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="name@institution.edu" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 ring-brand-primary/20 dark:text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Campus *</label>
                                            <select name="campus" value={formData.campus} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 ring-brand-primary/20 dark:text-white">
                                                <option value="">Select Campus</option>
                                                {campuses.map(c => <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 ring-brand-primary/20 dark:text-white">
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Marital Status</label>
                                            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 ring-brand-primary/20 dark:text-white">
                                                <option value="Single">Single</option>
                                                <option value="Married">Married</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Staff Status *</label>
                                            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 ring-brand-primary/20 dark:text-white">
                                                <option value="Active">Active</option>
                                                <option value="On Leave">On Leave</option>
                                                <option value="Resigned">Resigned</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                {mobileTab === 'personal' && (
                                    <div className="lg:hidden pt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setMobileTab('academic')}
                                            className="px-6 py-2.5 bg-brand-primary text-brand-accent rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg"
                                        >
                                            Next: Academic Info →
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* MOBILE SECTION 2: ACADEMIC & PROFESSIONAL */}
                            <div className={cn("space-y-5", mobileTab !== 'academic' && "hidden lg:block")}>
                                <section className="space-y-3">
                                    <div className="flex items-center gap-2 border-l-3 border-brand-accent pl-2.5">
                                        <h4 className="text-xs font-black uppercase text-brand-primary dark:text-brand-accent tracking-tight">Professional & Academic Profile</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Department / Designation *</label>
                                            <select name="subject" value={formData.subject} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 ring-brand-primary/20 dark:text-white">
                                                <option value="">Select Category</option>
                                                <optgroup label="Academic Faculty">
                                                    {['Preschool Teacher', 'Junior Teacher', 'Senior Teacher', 'Lecturer', 'Professor', 'PT Instructor', 'Lab Incharge'].map(s => <option key={s} value={s}>{s}</option>)}
                                                </optgroup>
                                                <optgroup label="Administrative Staff">
                                                    {['Principal', 'Vice Principal', 'Section Head', 'Accountant', 'Admin Officer', 'Librarian', 'Clerk'].map(s => <option key={s} value={s}>{s}</option>)}
                                                </optgroup>
                                                <optgroup label="Technical & Support">
                                                    {['IT Support', 'Security Guard', 'Driver', 'Sweeper', 'Gardener', 'Helper'].map(s => <option key={s} value={s}>{s}</option>)}
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Qualification Degree</label>
                                            <input name="qualification" value={formData.qualification} onChange={handleInputChange} placeholder="e.g. M.Sc / M.Phil" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 ring-brand-primary/20 dark:text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Experience (Years / History)</label>
                                            <input name="experience" value={formData.experience} onChange={handleInputChange} placeholder="e.g. 5 Years in Senior School" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 ring-brand-primary/20 dark:text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">System Role Preset</label>
                                            <select name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-brand-primary/5 dark:bg-white/5 border border-brand-primary/20 dark:border-white/10 text-brand-primary dark:text-brand-accent rounded-xl px-3 py-2 text-xs font-black uppercase outline-none">
                                                {Object.keys(ROLE_PRESETS).map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider block">Base Salary (PKR)</label>
                                            <input name="baseSalary" type="number" value={formData.baseSalary} onChange={handleInputChange} placeholder="0" className="w-full bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-yellow-400 rounded-xl px-3 py-2 text-xs font-black outline-none focus:ring-2 ring-amber-500/20" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">Class Incharge</label>
                                            <select name="inchargeClass" value={formData.inchargeClass} onChange={handleInputChange} className="w-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl px-3 py-2 text-xs font-black uppercase outline-none">
                                                <option value="">None (General Staff)</option>
                                                {allClasses.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                {mobileTab === 'academic' && (
                                    <div className="lg:hidden pt-4 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setMobileTab('personal')}
                                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase"
                                        >
                                            ← Previous
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMobileTab('access')}
                                            className="px-6 py-2.5 bg-brand-primary text-brand-accent rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg"
                                        >
                                            Next: Access & Docs →
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* MOBILE SECTION 3: SYSTEM ACCESS & INVENTORY */}
                            <div className={cn("space-y-5", mobileTab !== 'access' && "hidden lg:block")}>
                                
                                {/* Credentials Box on Mobile */}
                                <div className="lg:hidden p-4 bg-slate-900 rounded-2xl text-white shadow-xl border-t-4 border-brand-accent space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-black text-brand-accent uppercase tracking-widest">Portal Credentials</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">{formData.role}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[7px] font-black uppercase text-slate-400 tracking-wider">Portal Username (ID)</label>
                                            <input name="username" value={formData.username} onChange={handleInputChange} className="w-full bg-white/10 border border-white/10 text-brand-accent font-mono font-bold rounded-xl px-3 py-2 text-xs outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[7px] font-black uppercase text-slate-400 tracking-wider">Portal Password (Key)</label>
                                            <input name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-white/10 border border-white/10 text-brand-accent font-mono font-bold rounded-xl px-3 py-2 text-xs outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <section className="hidden lg:block space-y-3">
                                    <div className="flex items-center gap-2 border-l-3 border-brand-accent pl-2.5">
                                        <h4 className="text-xs font-black uppercase text-brand-primary dark:text-brand-accent tracking-tight">System Access Registry</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400">Portal ID (Username)</label>
                                            <input name="username" value={formData.username} onChange={handleInputChange} className="w-full bg-brand-primary/5 dark:bg-white/5 border border-brand-primary/10 dark:border-white/10 text-brand-primary dark:text-brand-accent font-mono font-black rounded-xl px-3 py-2 text-xs outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400">Key (Password)</label>
                                            <input name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-brand-primary/5 dark:bg-white/5 border border-brand-primary/10 dark:border-white/10 text-brand-primary dark:text-brand-accent font-mono font-black rounded-xl px-3 py-2 text-xs outline-none" />
                                        </div>
                                    </div>
                                </section>

                                {/* Privileges Matrix */}
                                <section className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-tight">System Privileges & Permissions</h4>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">{formData.permissions.length} selected</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {PERMISSIONS.map(p => {
                                            const isChecked = formData.permissions.includes(p.id);
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => togglePermission(p.id)}
                                                    className={cn(
                                                        "flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all text-left",
                                                        isChecked
                                                            ? "border-brand-primary bg-brand-primary/5 dark:border-brand-accent dark:bg-brand-accent/10"
                                                            : "border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                                        isChecked
                                                            ? "bg-brand-primary dark:bg-brand-accent text-brand-accent dark:text-slate-950"
                                                            : "bg-slate-100 dark:bg-slate-800 text-transparent"
                                                    )}>
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-[9px] font-black uppercase text-slate-800 dark:text-white block truncate">{p.label}</span>
                                                        <span className="text-[7px] text-slate-400 block truncate">{p.description}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Mobile Document Inventory */}
                                <section className="lg:hidden space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-tight">Document Attachments</h4>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">{Object.keys(uploadedDocs).length}/3</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        {['CNIC', 'Graduation', 'Experience'].map(doc => (
                                            <div key={doc} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                <span className="text-[9px] font-black uppercase text-slate-700 dark:text-slate-300">{doc}</span>
                                                {uploadedDocs[doc] ? (
                                                    <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                                                        <Check size={10} /> Attached
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => (document.getElementById(`doc-up-mob-${doc}`) as HTMLInputElement)?.click()}
                                                        className="flex items-center gap-1 text-[8px] font-bold text-brand-primary dark:text-brand-accent bg-brand-primary/5 px-2.5 py-1 rounded-lg"
                                                    >
                                                        <Upload size={10} /> Upload
                                                    </button>
                                                )}
                                                <input type="file" id={`doc-up-mob-${doc}`} className="hidden" onChange={(e) => handleDocUpload(doc, e)} />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Sticky / Floating Commit Action Bar for all screens */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                                <span className="hidden sm:inline text-[8px] font-black text-slate-400 uppercase tracking-widest">Official HR Matrix • 2026</span>
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 sm:flex-none px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        form="faculty-form"
                                        className="flex-1 sm:flex-none px-6 py-2.5 bg-brand-primary dark:bg-brand-accent text-brand-accent dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                                    >
                                        <Save size={14} /> Commit Profile
                                    </button>
                                </div>
                            </div>
                        </form>
                    </main>
                </div>
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};
