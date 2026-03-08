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

    if (!formData.campus && !editTeacher) {
        return (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
                <div className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black uppercase text-brand-primary tracking-tighter">Campus Registry</h2>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Select Faculty Campus Location</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {(campuses && campuses.length > 0 ? campuses : [{ name: 'MAIN CAMPUS', id: 'DEFAULT', idPrefix: 'MAIN' }]).map((c) => (
                            <button
                                key={c.id}
                                onClick={() => {
                                    const prefix = c.idPrefix || c.id.split('-').pop();
                                    const randomId = Math.floor(1000 + Math.random() * 9000);
                                    setFormData(prev => ({ ...prev, campus: c.name, id: `PST-${prefix}-${randomId}` }));
                                }}
                                className={cn("flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left", formData.campus === c.name ? "border-brand-primary bg-brand-primary/5" : "border-slate-100 hover:border-slate-200")}
                            >
                                <span className="font-black text-xs uppercase text-brand-primary">{c.name.toUpperCase()}</span>
                                {formData.campus === c.name && <Check className="text-brand-primary" size={16} />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-6xl h-[85vh] bg-white dark:bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-200">
                <div className="bg-brand-primary px-5 py-3 text-white flex items-center justify-between shrink-0 border-b-2 border-brand-accent">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
                            {settings.logo1 ? <img src={settings.logo1} className="w-full h-full object-contain" /> : <GraduationCap className="text-brand-primary w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="font-black text-sm uppercase tracking-tight text-brand-accent">Faculty Profile</h2>
                            <p className="text-[8px] font-bold opacity-60 uppercase">{formData.campus.toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-brand-accent hover:text-brand-primary rounded-lg transition-all"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 flex overflow-hidden lg:flex-row flex-col">
                    <aside className="lg:w-72 w-full bg-slate-50 dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 space-y-4 overflow-y-auto">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                            <div className="aspect-square rounded-xl relative overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-slate-50">
                                {isCameraOpen ? <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" /> : teacherPhoto ? <img src={teacherPhoto} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-slate-300" />}
                                {!isCameraOpen && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                        <button type="button" onClick={() => (document.getElementById('teacher-pt-input') as HTMLInputElement).click()} className="p-2 bg-white rounded-lg text-brand-primary"><Upload size={14} /></button>
                                        <button type="button" onClick={startCamera} className="p-2 bg-brand-accent rounded-lg text-brand-primary"><Camera size={14} /></button>
                                    </div>
                                )}
                            </div>
                            <input type="file" id="teacher-pt-input" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            {isCameraOpen && (
                                <div className="mt-2 flex gap-1 h-8">
                                    <button type="button" onClick={capturePhoto} className="flex-1 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase">Capture</button>
                                    <button type="button" onClick={stopCamera} className="w-8 bg-rose-500 text-white rounded-lg flex items-center justify-center"><X size={12} /></button>
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg border-t-4 border-brand-accent space-y-3">
                            <div className="text-center">
                                <h5 className="font-black text-[10px] uppercase tracking-tighter text-brand-accent truncate">{formData.name || 'FACULTY NAME'}</h5>
                                <p className="text-[7px] font-bold text-slate-500 uppercase">{formData.role}</p>
                            </div>
                            <div className="space-y-1.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                                <div className="flex justify-between text-[7px] font-black font-mono">
                                    <span className="text-slate-500 uppercase">PORTAL ID</span>
                                    <span className="text-brand-accent truncate ml-2">{formData.username || '...'}</span>
                                </div>
                                <div className="flex justify-between text-[7px] font-black font-mono">
                                    <span className="text-slate-500 uppercase">KEY</span>
                                    <span className="text-brand-accent">{formData.password || '••••'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <h6 className="text-[7px] font-black uppercase tracking-widest text-slate-400">Inventory</h6>
                            {['CNIC', 'Graduation', 'Experience'].map(doc => (
                                <div key={doc} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                    <span className="text-[8px] font-black uppercase text-slate-600 truncate">{doc}</span>
                                    {uploadedDocs[doc] ? <Check size={10} className="text-emerald-500" /> : (
                                        <button type="button" onClick={() => (document.getElementById(`doc-up-${doc}`) as HTMLInputElement).click()} className="text-slate-300"><Upload size={10} /></button>
                                    )}
                                    <input type="file" id={`doc-up-${doc}`} className="hidden" onChange={(e) => handleDocUpload(doc, e)} />
                                </div>
                            ))}
                        </div>
                    </aside>
                    <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        <form id="faculty-form" onSubmit={handleSubmit} className="space-y-6">
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 border-l-2 border-brand-accent pl-2 h-3">
                                    <h4 className="text-[10px] font-black uppercase text-brand-primary">Personnel Registry</h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Full Name *', name: 'name' },
                                        { label: 'Father Name', name: 'fatherName' },
                                        { label: 'CNIC', name: 'cnic' },
                                        { label: 'DOB', name: 'dob', type: 'date' },
                                        { label: 'Teacher ID *', name: 'id' }
                                    ].map(field => (
                                        <div key={field.name} className="space-y-1">
                                            <label className="text-[7px] font-black uppercase text-slate-400 tracking-widest">{field.label}</label>
                                            <input name={field.name} type={field.type || 'text'} value={(formData as any)[field.name]} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:ring-2 ring-blue-500/10" />
                                        </div>
                                    ))}
                                    {[
                                        { label: 'WhatsApp', name: 'whatsappNumber' },
                                        { label: 'Email', name: 'email' },
                                        { label: 'Campus *', name: 'campus', type: 'select', options: ['', ...campuses.map(c => c.name)] },
                                        { label: 'Gender', name: 'gender', type: 'select', options: ['Male', 'Female'] },
                                        { label: 'Status *', name: 'status', type: 'select', options: ['Active', 'On Leave'] }
                                    ].map(field => (
                                        <div key={field.name} className="space-y-1">
                                            <label className="text-[7px] font-black uppercase text-slate-400 tracking-widest">{field.label}</label>
                                            {field.type === 'select' ? (
                                                <select name={field.name} value={(formData as any)[field.name]} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none">
                                                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            ) : (
                                                <input name={field.name} value={(formData as any)[field.name]} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:ring-2 ring-blue-500/10" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 border-l-2 border-brand-accent pl-2 h-3">
                                    <h4 className="text-[10px] font-black uppercase text-brand-primary">Professional Record</h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black uppercase text-slate-400">Department *</label>
                                        <select name="subject" value={formData.subject} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none">
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
                                        <label className="text-[7px] font-black uppercase text-slate-400">Qualification</label>
                                        <input name="qualification" value={formData.qualification} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black uppercase text-slate-400">Experience</label>
                                        <input name="experience" value={formData.experience} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black uppercase text-slate-400">Set Role</label>
                                        <select name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-brand-primary/5 border border-brand-primary/20 text-brand-primary rounded-lg px-2 py-1.5 text-[10px] font-black uppercase outline-none">
                                            {Object.keys(ROLE_PRESETS).map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black uppercase text-amber-600 font-outfit tracking-widest">Base Salary (PKR)</label>
                                        <input name="baseSalary" type="number" value={formData.baseSalary} onChange={handleInputChange} className="w-full bg-amber-500/5 border border-amber-500/20 text-amber-700 dark:text-yellow-400 rounded-lg px-2 py-1.5 text-[10px] font-black outline-none focus:ring-2 ring-amber-500/10" placeholder="0" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black uppercase text-emerald-600">Class Incharge</label>
                                        <select name="inchargeClass" value={formData.inchargeClass} onChange={handleInputChange} className="w-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase outline-none">
                                            <option value="">None</option>
                                            {allClasses.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </section>
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 border-l-2 border-brand-accent pl-2 h-3">
                                    <h4 className="text-[10px] font-black uppercase text-brand-primary">System Access Registry</h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black uppercase text-slate-400">Portal ID (Username)</label>
                                        <input name="username" value={formData.username} onChange={handleInputChange} className="w-full bg-brand-primary/5 border border-brand-primary/10 text-brand-primary rounded-lg px-2 py-1.5 text-[10px] font-black outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black uppercase text-slate-400">Key (Password)</label>
                                        <input name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-brand-primary/5 border border-brand-primary/10 text-brand-primary rounded-lg px-2 py-1.5 text-[10px] font-black outline-none" />
                                    </div>
                                </div>
                            </section>
                            <section className="space-y-3">
                                <h4 className="text-[9px] font-black uppercase text-slate-400">Privileges</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                    {PERMISSIONS.map(p => (
                                        <button key={p.id} type="button" onClick={() => togglePermission(p.id)} className={cn("flex items-center gap-2 p-2 rounded-xl border-2 transition-all", formData.permissions.includes(p.id) ? "border-brand-primary bg-brand-primary/5" : "border-slate-50 opacity-40")}>
                                            <div className={cn("w-5 h-5 rounded flex items-center justify-center", formData.permissions.includes(p.id) ? "bg-brand-primary text-brand-accent" : "bg-white border")}><Check size={10} strokeWidth={4} /></div>
                                            <span className="text-[8px] font-black uppercase text-brand-primary truncate">{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[7px] font-black text-slate-300 uppercase">Institutional Registry • 2026</span>
                                <div className="flex gap-2">
                                    <button type="button" onClick={onClose} className="px-4 py-2 text-[9px] font-black uppercase text-slate-400">Abort</button>
                                    <button type="submit" form="faculty-form" className="px-6 py-2 bg-brand-primary text-brand-accent rounded-lg text-[9px] font-black uppercase shadow-lg active:scale-95 border border-brand-accent/20 flex items-center gap-2">
                                        <Save size={12} /> Commit Profile
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
