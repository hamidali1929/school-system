import { useState } from 'react';
import { Search, Download, Plus, X, FileText, Contact, Edit, Trash2, Camera, CheckCircle2, Users, DollarSign, Layers, ArrowRightLeft } from 'lucide-react';
import { useStore, type Student } from '../context/StoreContext';
import { AdmissionForm } from '../components/AdmissionForm';
import { BlankAdmissionForm } from '../components/BlankAdmissionForm';
import { IDCardGenerator } from '../components/IDCardGenerator';
import { QRScanner } from '../components/QRScanner';
import { FeeVoucher } from '../components/FeeVoucher';
import { BulkFeeVoucher } from '../components/BulkFeeVoucher';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, School, GraduationCap } from 'lucide-react';

export const Students = () => {
    const { students, deleteStudent, addStudent, settings, campuses, currentUser, bulkUpdateStudents, classes: systemClasses } = useStore();
    const canAddStudent = currentUser?.role === 'admin' || currentUser?.permissions?.includes('students_add');
    const isAdmin = currentUser?.role === 'admin';
    const canViewStudents = isAdmin || currentUser?.permissions?.includes('students_view') || currentUser?.permissions?.includes('students_add');

    if (!canViewStudents) return null;
    const [statusFilter, setStatusFilter] = useState('All');
    const [campusFilter, setCampusFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('All');
    const [showAdmissionForm, setShowAdmissionForm] = useState(false);
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState('');
    const [selectedType, setSelectedType] = useState<'School' | 'College' | null>(null);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [selectedStudentForId, setSelectedStudentForId] = useState<Student | null>(null);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showBlankForm, setShowBlankForm] = useState(false);
    const [submittedStudentForVoucher, setSubmittedStudentForVoucher] = useState<Student | null>(null);
    const [showBulkFeeVouchers, setShowBulkFeeVouchers] = useState(false);

    const filteredStudents = students.filter(s => {
        // Teacher restriction: Only show their incharge class
        if (currentUser?.role === 'teacher' && currentUser?.inchargeClass) {
            if (s.class !== currentUser.inchargeClass) return false;
        }

        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.id.toLowerCase().includes(search.toLowerCase());
        const matchesClass = filterClass === 'All' || s.class === filterClass;
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
        const matchesCampus = campusFilter === 'All' ||
            s.campus?.toLowerCase() === campusFilter.toLowerCase();
        return matchesSearch && matchesClass && matchesStatus && matchesCampus;
    });

    const classes = (currentUser?.role === 'teacher' && currentUser?.inchargeClass)
        ? [currentUser.inchargeClass]
        : ['All', ...new Set(students.map(s => s.class))];

    const viewStudentDetails = (student: Student) => {
        const hasAvatar = student.avatar && student.avatar.length > 5;
        const h = document.documentElement.classList.contains('dark');

        Swal.fire({
            padding: '0',
            background: h ? '#0b1120' : '#ffffff',
            color: h ? '#f8fafc' : '#1e293b',
            width: '1000px',
            showConfirmButton: true,
            confirmButtonText: 'Export PDF Profile',
            confirmButtonColor: '#003366',
            showCancelButton: true,
            cancelButtonText: 'Close',
            customClass: {
                popup: 'rounded-[3rem] border border-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.4)] overflow-hidden',
                confirmButton: 'px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] m-4 shadow-xl shadow-[#003366]/20 transition-all hover:scale-105',
                cancelButton: 'px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] m-4 border-2 border-slate-100 dark:border-white/5 transition-all hover:bg-slate-50 dark:hover:bg-white/5'
            },
            html: `
                <div class="font-outfit text-left overflow-hidden">
                    <!-- Hero Banner -->
                    <div class="relative h-48 bg-gradient-to-br from-[#003366] to-blue-900 overflow-hidden p-10 flex items-center justify-between">
                        <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <div class="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                        
                        <div class="relative z-10 flex items-center gap-8">
                            <div class="relative group">
                                <div class="absolute -inset-1.5 bg-white/20 blur-xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                ${hasAvatar ? `
                                    <div class="relative w-32 h-32 rounded-[2.5rem] border-4 border-white overflow-hidden shadow-2xl">
                                        <img src="${student.avatar}" class="w-full h-full object-cover" />
                                    </div>
                                ` : `
                                    <div class="relative w-32 h-32 rounded-[2.5rem] bg-white text-[#003366] flex items-center justify-center text-5xl font-black shadow-2xl">
                                        ${student.name.charAt(0)}
                                    </div>
                                `}
                            </div>
                            <div>
                                <h1 class="text-4xl font-black text-white tracking-tighter uppercase mb-1">${student.name}</h1>
                                <div class="flex items-center gap-3">
                                    <span class="px-4 py-1.5 bg-yellow-400 text-[#003366] rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                        ID: ${student.id}
                                    </span>
                                    <span class="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                        ${student.status} Student
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="relative z-10 text-right hidden md:block">
                            <p class="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2 text-right">Campus</p>
                            <h2 class="text-xl font-black text-white uppercase tracking-wider">${student.campus || 'Main Campus'}</h2>
                        </div>
                    </div>

                    <div class="p-10 grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50 dark:bg-slate-900/50">
                        <!-- Left Column: Personal Info -->
                        <div class="space-y-6">
                            <div class="p-8 bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
                                <h4 class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                    Personal Identity
                                </h4>
                                <div class="space-y-6">
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Date of Birth</p>
                                        <p class="text-sm font-bold text-slate-800 dark:text-white">${student.dob || 'N/A'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Gender</p>
                                        <p class="text-sm font-bold text-slate-800 dark:text-white">${student.gender || 'N/A'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Religion</p>
                                        <p class="text-sm font-bold text-slate-800 dark:text-white">${student.religion || 'Islam'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">CNIC / B-Form</p>
                                        <p class="text-sm font-bold text-slate-800 dark:text-white">${student.cnic || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Center Column: Family & Contact -->
                        <div class="space-y-6">
                            <div class="p-8 bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm h-full">
                                <h4 class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                                    Family Details
                                </h4>
                                <div class="space-y-6">
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Father's Name</p>
                                        <p class="text-sm font-bold text-slate-800 dark:text-white">${student.fatherName || 'N/A'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Occupation</p>
                                        <p class="text-sm font-bold text-slate-800 dark:text-white">${student.fatherOccupation || 'N/A'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Guardian Contact</p>
                                        <p class="text-sm font-bold text-slate-800 dark:text-white">${student.contactFather || 'N/A'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">WhatsApp Number</p>
                                        <p class="text-sm font-bold text-emerald-600">${student.whatsappNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column: Academic & Contact -->
                        <div class="space-y-6">
                            <div class="p-8 bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
                                <h4 class="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                                    Academic Status
                                </h4>
                                <div class="space-y-6">
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Current Class</p>
                                        <p class="text-sm font-bold text-slate-800 dark:text-white">${student.class}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Performance</p>
                                        <p class="text-sm font-bold text-slate-800 dark:text-white">${student.performance || 'Good'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Admission Date</p>
                                        <p class="text-sm font-bold text-slate-800 dark:text-white">${student.admissionDate || 'N/A'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Monthly Tuition</p>
                                        <p class="text-sm font-bold text-slate-800 dark:text-white italic">Rs. ${student.monthlyFees?.toLocaleString() || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Full Width Address -->
                        <div class="col-span-full">
                            <div class="p-8 bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
                                <h4 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    Residential Address
                                </h4>
                                <p class="text-xs font-bold text-slate-800 dark:text-white leading-relaxed">
                                    ${student.address || 'No registered address on file.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
        }).then((result) => {
            if (result.isConfirmed) {
                const printWindow = window.open('', '_blank');
                if (!printWindow) return;

                const hasAvatar = student.avatar && student.avatar.length > 5;
                const html = `
                    <html>
                        <head>
                            <title>Student Profile - ${student.name}</title>
                            <style>
                                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                                @page { size: A4; margin: 0; }
                                body { font-family: 'Outfit', sans-serif; margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; }
                                
                                .a4-container { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; position: relative; overflow: hidden; }
                                
                                .header-strip { height: 120px; background: #003366; display: flex; align-items: center; justify-content: space-between; padding: 0 50px; color: #fff; }
                                .logo-section { display: flex; align-items: center; gap: 20px; }
                                .logo-section h1 { margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
                                .logo-section p { margin: 0; font-size: 10px; font-weight: 700; opacity: 0.6; text-transform: uppercase; letter-spacing: 2px; }
                                
                                .profile-header { padding: 40px 50px; display: flex; gap: 40px; align-items: center; background: #f8fafc; border-bottom: 2px solid #f1f5f9; }
                                .avatar-frame { width: 140px; height: 140px; border-radius: 30px; border: 6px solid #fff; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                                .avatar-frame img { width: 100%; height: 100%; object-fit: cover; }
                                .name-plate h2 { margin: 0; font-size: 32px; font-weight: 900; color: #003366; text-transform: uppercase; letter-spacing: -1px; }
                                .name-plate .id-badge { display: inline-block; margin-top: 10px; padding: 6px 15px; background: #fbce07; color: #003366; border-radius: 10px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
                                
                                .info-grid { padding: 40px 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                                .info-card { padding: 25px; background: #fff; border: 2.5px solid #f1f5f9; border-radius: 25px; }
                                .info-card h3 { margin: 0 0 20px 0; font-size: 10px; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 10px; }
                                
                                .field { margin-bottom: 15px; }
                                .label { font-size: 8px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 3px; }
                                .value { font-size: 13px; font-weight: 700; color: #1e293b; }
                                
                                .address-box { grid-column: span 2; padding: 25px; background: #f8fafc; border-radius: 25px; border: 2.5px solid #f1f5f9; }
                                .address-box h3 { margin: 0 0 10px 0; font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; }
                                .address-box p { margin: 0; font-size: 12px; font-weight: 600; color: #1e293b; line-height: 1.6; }
                                
                                .qr-code { position: absolute; top: 150px; right: 50px; width: 80px; height: 80px; padding: 10px; background: #fff; border: 1px solid #f1f5f9; border-radius: 15px; }
                                
                                .footer { position: absolute; bottom: 0; left: 0; right: 0; padding: 30px 50px; background: #003366; color: #fff; display: flex; justify-content: space-between; align-items: center; border-radius: 100px 100px 0 0; }
                                .footer p { margin: 0; font-size: 9px; font-weight: 700; opacity: 0.6; text-transform: uppercase; }
                            </style>
                        </head>
                        <body>
                            <div class="a4-container">
                                <div class="header-strip">
                                    <div class="logo-section">
                                        <div>
                                            <h1>${settings.schoolName || "TIMES'S PUBLIC SCHOOL"}</h1>
                                            <p>${settings.subTitle || "Building Knowledge. Shaping Future."}</p>
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <p style="opacity: 0.6; font-size: 8px; font-weight: 900;">ADMISSION YEAR</p>
                                        <div style="font-size: 18px; font-weight: 900;">2024 - 2025</div>
                                    </div>
                                </div>
                                
                                <div class="profile-header">
                                    <div class="avatar-frame">
                                        ${hasAvatar ? `<img src="${student.avatar}" />` : `<div style="width:100%; height:100%; background:#f1f5f9; color:#003366; display:flex; align-items:center; justify-content:center; font-size:60px; font-weight:900;">${student.name.charAt(0)}</div>`}
                                    </div>
                                    <div class="name-plate">
                                        <h2>${student.name}</h2>
                                        <div class="id-badge">OFFICIAL ID: ${student.id}</div>
                                    </div>
                                </div>

                                <div class="info-grid">
                                    <!-- Personal Identity -->
                                    <div class="info-card">
                                        <h3>Personal Identity</h3>
                                        <div class="field"><div class="label">Gender / Sex</div><div class="value">${student.gender || 'N/A'}</div></div>
                                        <div class="field"><div class="label">Date of Birth</div><div class="value">${student.dob || 'N/A'}</div></div>
                                        <div class="field"><div class="label">Religion</div><div class="value">${student.religion || 'Islam'}</div></div>
                                        <div class="field"><div class="label">B-Form / CNIC</div><div class="value">${student.cnic || 'N/A'}</div></div>
                                    </div>

                                    <!-- Academic Status -->
                                    <div class="info-card">
                                        <h3>Academic Record</h3>
                                        <div class="field"><div class="label">Current Class</div><div class="value">${student.class}</div></div>
                                        <div class="field"><div class="label">Assigned Campus</div><div class="value">${student.campus || 'Main Campus'}</div></div>
                                        <div class="field"><div class="label">Academic Status</div><div class="value">${student.status}</div></div>
                                        <div class="field"><div class="label">Monthly Tuition</div><div class="value">Rs. ${student.monthlyFees?.toLocaleString() || 'N/A'}</div></div>
                                    </div>

                                    <!-- Family & Contact -->
                                    <div class="info-card">
                                        <h3>Family Information</h3>
                                        <div class="field"><div class="label">Father Name</div><div class="value">${student.fatherName || 'N/A'}</div></div>
                                        <div class="field"><div class="label">Occupation</div><div class="value">${student.fatherOccupation || 'N/A'}</div></div>
                                        <div class="field"><div class="label">Contact Primary</div><div class="value">${student.contactFather || 'N/A'}</div></div>
                                        <div class="field"><div class="label">WhatsApp Number</div><div class="value">${student.whatsappNumber || 'N/A'}</div></div>
                                    </div>

                                    <!-- Contact Info -->
                                    <div class="info-card">
                                        <h3>Contact Detail</h3>
                                        <div class="field"><div class="label">Student Mobile</div><div class="value">${student.contactSelf || 'N/A'}</div></div>
                                        <div class="field"><div class="label">Email Address</div><div class="value">${student.email || 'N/A'}</div></div>
                                        <div class="field"><div class="label">Emergency Contact</div><div class="value">${student.contactFather || 'N/A'}</div></div>
                                        <div class="field"><div class="label">Blood Group</div><div class="value">N/A</div></div>
                                    </div>

                                    <div class="address-box">
                                        <h3>Current Residential Address</h3>
                                        <p>${student.address || 'No registered address on file.'}</p>
                                    </div>
                                </div>

                                <div class="footer">
                                    <div>
                                        <h1>${settings.schoolName || "TIMES'S PUBLIC SCHOOL"}</h1>
                                        <p>${settings.location}</p>
                                    </div>
                                    <div style="text-align: right;">
                                        <p>VALID OFFICIAL DOCUMENT</p>
                                        <p style="opacity: 0.6;">GENERATED ON ${new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                            <script>window.print(); setTimeout(() => window.close(), 500);</script>
                        </body>
                    </html>
                `;
                printWindow.document.write(html);
                printWindow.document.close();
            }
        });
    };

    const handleBulkMigrate = async () => {
        if (selectedIds.length === 0) return;

        const classOptionsHtml = systemClasses.map(c => `<option value="${c}">${c}</option>`).join('');
        const campusOptionsHtml = campuses.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

        const result = await Swal.fire({
            title: 'Bulk Migrate Students',
            html: `
                <div class="flex flex-col gap-4 text-left">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select New Class</label>
                        <select id="migrate-class" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
                            <option value="">Select a class...</option>
                            ${classOptionsHtml}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Update Campus (Optional)</label>
                        <select id="migrate-campus" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
                            <option value="">Keep Same Campus</option>
                            ${campusOptionsHtml}
                        </select>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Migrate Students',
            confirmButtonColor: 'var(--brand-primary)',
            preConfirm: () => {
                const targetClass = (document.getElementById('migrate-class') as HTMLSelectElement).value;
                const targetCampus = (document.getElementById('migrate-campus') as HTMLSelectElement).value;
                if (!targetClass) {
                    Swal.showValidationMessage('Please select a target class');
                    return false;
                }
                return { targetClass, targetCampus };
            }
        });

        if (result.isConfirmed && result.value) {
            const updates: Partial<Student> = { class: result.value.targetClass };
            if (result.value.targetCampus) {
                updates.campus = result.value.targetCampus;
            }

            bulkUpdateStudents(selectedIds, updates);
            setSelectedIds([]);

            Swal.fire({
                title: 'Migration Complete',
                text: `${selectedIds.length} students migrated successfully.`,
                icon: 'success',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
            });
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        Swal.fire({
            title: `Delete ${selectedIds.length} Records?`,
            text: `Are you sure you want to remove the selected students? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, Delete All',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                selectedIds.forEach(id => deleteStudent(id));
                setSelectedIds([]);
                Swal.fire({
                    title: 'Records Deleted',
                    text: 'The selected students have been removed.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        });
    };

    const handleDeleteStudent = (id: string, name: string) => {
        Swal.fire({
            title: 'Delete Student Record?',
            text: `Are you sure you want to remove ${name} from the school records? This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Yes, Delete Record',
            cancelButtonText: 'Cancel',
            customClass: {
                title: 'font-outfit font-black uppercase tracking-tight text-lg',
                htmlContainer: 'font-outfit text-sm'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                deleteStudent(id);
                Swal.fire({
                    title: 'Record Removed',
                    text: 'The student record has been deleted from the system.',
                    icon: 'success',
                    confirmButtonColor: 'var(--brand-primary)'
                });
            }
        });
    };



    const handleImportRegistry = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const rows = content.split('\n');
            if (rows.length < 2) return;

            const headers = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/ /g, ''));
            const studentRows = rows.slice(1).filter(r => r.trim());

            const processRows = async () => {
                for (const row of studentRows) {
                    const values = [];
                    let insideQuote = false;
                    let currentWord = '';
                    for (let i = 0; i < row.length; i++) {
                        const char = row[i];
                        if (char === '"') {
                            insideQuote = !insideQuote;
                        } else if (char === ',' && !insideQuote) {
                            values.push(currentWord);
                            currentWord = '';
                        } else {
                            currentWord += char;
                        }
                    }
                    values.push(currentWord);
                    const cleanValues = values.map(val => val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

                    const studentData: any = {};
                    headers.forEach((key, index) => {
                        const val = cleanValues[index] || '';
                        if (key === 'id' || key === 'srno' || key === 'sid' || key === 'admno' || key === 'regno' || key === 'reg#' || key === 'sr#') studentData.id = val;
                        else if (key === 'name' || key === 'studentname') studentData.name = val;
                        else if (key === 'fathername' || key === 'fname') studentData.fatherName = val;
                        else if (key === 'class' || key === 'grade') studentData.class = val;
                        else if (key === 'campus') studentData.campus = val;
                        else if (key === 'discipline') studentData.discipline = val;
                        else if (key === 'status') studentData.status = val;
                        else if (key === 'contactself' || key === 'mobile' || key === 'phone') studentData.contactSelf = val;
                        else if (key === 'admissiondate') studentData.admissionDate = val;
                        else if (key === 'address') studentData.address = val;
                        else if (key === 'manualid') studentData.manualId = val;
                    });

                    if (studentData.name && studentData.class) {
                        await addStudent(studentData);
                    }
                }

                Swal.fire({
                    title: 'Import Successful',
                    text: 'Student records have been imported.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            };
            processRows();
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    const handleQRScan = (data: string) => {
        const rawId = data.trim();
        setSearch(rawId);
        setShowQRScanner(false);
    };

    return (
        <div className="space-y-6 animate-fade-in font-outfit pb-10">
            {/* Compact Adjustable Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary to-brand-primary/80 dark:from-brand-primary/20 dark:to-brand-primary/10 rounded-[var(--brand-radius,2.5rem)] p-4 md:p-6 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left: Branding & Core Title */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex w-12 h-12 bg-white/10 rounded-xl items-center justify-center border border-white/10 backdrop-blur-xl shrink-0">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-none">Student Management</h2>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1.5">Manage and record student data</p>
                        </div>
                    </div>

                    {/* Right: Primary Actions */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <div className="flex items-center bg-black/30 backdrop-blur-xl p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => {
                                    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) setSelectedIds([]);
                                    else setSelectedIds(filteredStudents.map(s => s.id));
                                }}
                                className="px-4 py-2 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 group"
                            >
                                <div className={cn(
                                    "w-3.5 h-3.5 rounded-md border-2 flex items-center justify-center transition-all",
                                    selectedIds.length === filteredStudents.length && filteredStudents.length > 0
                                        ? "bg-white border-white text-brand-primary"
                                        : "border-white/30 group-hover:border-white"
                                )}>
                                    {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 && <CheckCircle2 className="w-2.5 h-2.5" />}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/90">Select All</span>
                            </button>
                            <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                            {isAdmin && (
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={selectedIds.length === 0}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        selectedIds.length > 0 ? "bg-rose-500 text-white shadow-lg" : "text-white/20 cursor-not-allowed"
                                    )}
                                >
                                    Delete {selectedIds.length > 0 && `(${selectedIds.length})`}
                                </button>
                            )}
                            {selectedIds.length > 0 && (
                                <>
                                    <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                                    <button
                                        onClick={handleBulkMigrate}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <ArrowRightLeft className="w-3.5 h-3.5" /> Migrate ({selectedIds.length})
                                    </button>
                                    <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                                    <button
                                        onClick={() => setShowBulkFeeVouchers(true)}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <Layers className="w-3.5 h-3.5" /> Vouchers ({selectedIds.length})
                                    </button>
                                </>
                            )}
                        </div>

                        {canAddStudent && (
                            <button
                                onClick={() => setShowSelectionModal(true)}
                                className="px-5 py-3 bg-white text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95 flex items-center gap-2 group"
                            >
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                Add Student
                            </button>
                        )}
                    </div>
                </div>

                {/* Sub-Header: Filters & Secondary Actions */}
                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
                        <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 shrink-0">
                            {['All', 'Active', 'Inactive'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    className={cn(
                                        "px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg",
                                        statusFilter === st
                                            ? "bg-white text-brand-primary shadow-lg"
                                            : "text-white/40 hover:text-white"
                                    )}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <input type="file" id="import-registry-input" className="hidden" accept=".csv" onChange={handleImportRegistry} />
                            <button
                                onClick={() => document.getElementById('import-registry-input')?.click()}
                                className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white/70 hover:text-white transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest"
                            >
                                <Plus className="w-3.5 h-3.5" /> Import
                            </button>
                            <button
                                onClick={async () => {
                                    const classOptions = { 'All': 'All Classes', ...Object.fromEntries(classes.filter(c => c !== 'All').map(c => [c, c])) };
                                    const { value: selectedClass } = await Swal.fire({
                                        title: 'Export Registry',
                                        text: 'Select a class to export records',
                                        input: 'select',
                                        inputOptions: classOptions,
                                        inputPlaceholder: 'Choose class...',
                                        showCancelButton: true,
                                        confirmButtonText: 'Export CSV',
                                        confirmButtonColor: 'var(--brand-primary)'
                                    });

                                    if (selectedClass) {
                                        const studentsToExport = selectedClass === 'All' ? filteredStudents : filteredStudents.filter(s => s.class === selectedClass);

                                        if (studentsToExport.length === 0) {
                                            Swal.fire({ title: 'No Data', text: `There are no records to export for ${selectedClass}.`, icon: 'info' });
                                            return;
                                        }

                                        const headers = ['ID', 'Name', 'Father Name', 'Class', 'Campus', 'Discipline', 'Status', 'Contact Self', 'Admission Date', 'Address'];
                                        const csvRows = [
                                            headers.join(','),
                                            ...studentsToExport.map(s => [
                                                `"\t${s.id}"`, `"${(s.name || '').replace(/"/g, '""')}"`, `"${(s.fatherName || '').replace(/"/g, '""')}"`,
                                                `"${(s.class || '').replace(/"/g, '""')}"`, `"${(s.campus || '').replace(/"/g, '""')}"`, `"${(s.discipline || 'General').replace(/"/g, '""')}"`,
                                                `"${s.status}"`, `"\t${(s.contactSelf || '').replace(/"/g, '""')}"`, `"\t${(s.admissionDate || '').replace(/"/g, '""')}"`, `"${(s.address || '').replace(/"/g, '""')}"`
                                            ].join(','))
                                        ];

                                        const csvString = csvRows.join('\n');
                                        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                                        const url = URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.setAttribute('href', url);
                                        link.setAttribute('download', `Student_Records_${selectedClass.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
                                        link.style.visibility = 'hidden';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }
                                }}
                                className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white/70 hover:text-white transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest"
                            >
                                <Download className="w-3.5 h-3.5" /> Export
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Search & Filters */}
            <div className="glass-card flex flex-col md:flex-row items-stretch md:items-center gap-3 px-4 py-3 rounded-2xl md:rounded-3xl -mt-6 mx-2 md:mx-0 relative z-30 shadow-2xl border border-white/10 bg-white/90 dark:bg-[#001a33]/90 backdrop-blur-xl">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary dark:group-focus-within:text-brand-accent transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Scan or type ID / Name..."
                        className="w-full pl-11 pr-32 py-3 bg-slate-50 dark:bg-[#000d1a] border border-slate-100 dark:border-white/5 rounded-xl md:rounded-2xl text-[13px] font-bold outline-none focus:ring-4 ring-blue-500/5 focus:bg-white dark:focus:bg-[#000d1a] transition-all placeholder:text-slate-400 dark:placeholder:text-white/10"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {search && <button onClick={() => setSearch('')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"><X className="w-3.5 h-3.5 text-slate-400" /></button>}
                        <button onClick={() => setShowQRScanner(true)} className="px-3 py-1.5 bg-brand-primary dark:bg-brand-accent text-white dark:text-[#000816] rounded-lg shadow-lg shadow-brand-primary/20 dark:shadow-brand-accent/10 transition-all active:scale-95 font-black text-[9px] uppercase tracking-widest flex items-center gap-2"><Camera className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Scanner</span></button>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                        value={campusFilter}
                        onChange={(e) => setCampusFilter(e.target.value)}
                        className="bg-slate-50 dark:bg-[#000d1a] border border-slate-100 dark:border-white/5 rounded-xl md:rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-blue-500 w-full md:min-w-[150px] cursor-pointer appearance-none hover:bg-white dark:hover:bg-white/5 transition-colors"
                    >
                        <option value="All">All Campuses</option>
                        {campuses.map(c => <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>)}
                    </select>
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-slate-50 dark:bg-[#000d1a] border border-slate-100 dark:border-white/5 rounded-xl md:rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-blue-500 w-full md:min-w-[150px] cursor-pointer appearance-none hover:bg-white dark:hover:bg-white/5 transition-colors"
                    >
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Adaptive Grid / Table View */}
            <div className="relative">
                {/* Mobile & Tablet Card View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-5 px-2">
                    {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                        const isSelected = selectedIds.includes(student.id);
                        return (
                            <div key={student.id} className={cn(
                                "group relative bg-white dark:bg-[#001529] rounded-[2rem] p-6 border-2 transition-all duration-500",
                                isSelected ? "border-[#003366] dark:border-yellow-400 shadow-2xl scale-[1.02]" : "border-slate-100 dark:border-white/5 shadow-xl hover:border-blue-200 dark:hover:border-yellow-400/20"
                            )} onClick={() => viewStudentDetails(student)}>
                                <div className="absolute top-5 right-5 z-10" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => e.target.checked ? setSelectedIds(prev => [...prev, student.id]) : setSelectedIds(prev => prev.filter(id => id !== student.id))}
                                        className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-white/10 checked:bg-[#003366] dark:checked:bg-yellow-400 transition-all cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#003366] to-blue-600 dark:from-yellow-400 dark:to-yellow-600 flex items-center justify-center font-black text-white dark:text-[#000816] text-2xl shadow-xl shadow-blue-500/20 dark:shadow-yellow-400/20 shrink-0 border-2 border-white dark:border-[#001529]">
                                        {student.avatar && student.avatar.length > 5 ? <img src={student.avatar} className="w-full h-full object-cover rounded-2xl" /> : <span>{student.name.charAt(0)}</span>}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-lg text-[#003366] dark:text-white tracking-tighter truncate pr-8 leading-none mb-1">{student.name}</h4>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-yellow-400/40 uppercase tracking-[0.2em]">{student.id}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <p className="text-[8px] font-black text-slate-400 dark:text-yellow-400/40 uppercase tracking-[0.2em] leading-none mb-1.5">Class</p>
                                        <p className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{student.class}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <p className="text-[8px] font-black text-slate-400 dark:text-yellow-400/40 uppercase tracking-[0.2em] leading-none mb-1.5">Status</p>
                                        <span className={cn("text-[8px] font-black uppercase px-2.5 py-1 rounded-lg inline-block shadow-sm", student.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white')}>{student.status}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/5" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex gap-2">
                                        <button onClick={() => viewStudentDetails(student)} className="p-3 bg-blue-500/5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-brand-primary dark:hover:text-brand-accent transition-all hover:scale-110"><FileText className="w-4 h-4" /></button>
                                        <button onClick={() => setSelectedStudentForId(student)} className="p-3 bg-blue-500/5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-brand-primary dark:hover:text-brand-accent transition-all hover:scale-110"><Contact className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex gap-2">
                                        {isAdmin && <button onClick={() => setEditingStudent(student)} className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all hover:rotate-6"><Edit className="w-4 h-4" /></button>}
                                        {isAdmin && <button onClick={() => handleDeleteStudent(student.id, student.name)} className="p-3 bg-rose-500/10 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all hover:-rotate-6"><Trash2 className="w-4 h-4" /></button>}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full py-24 text-center bg-white dark:bg-[#001529] rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-2xl">
                            <Plus className="w-16 h-16 text-slate-200 dark:text-white/5 mx-auto mb-6 animate-pulse" />
                            <p className="text-slate-400 dark:text-white/20 font-black uppercase tracking-[0.3em] text-[11px]">No students found • Try a different search</p>
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-yellow-400/40 font-bold border-b border-slate-200 dark:border-yellow-400/10 bg-slate-50/30 dark:bg-yellow-400/5">
                                <th className="px-6 py-4 w-10 sticky left-0 bg-slate-50 dark:bg-[#001529] z-20">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                                        onChange={(e) => e.target.checked ? setSelectedIds(filteredStudents.map(s => s.id)) : setSelectedIds([])}
                                    />
                                </th>
                                <th className="px-6 py-4 sticky left-[52px] bg-slate-50 dark:bg-[#001529] z-10">Student Name</th>
                                <th className="px-6 py-4">Admission No</th>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right sticky right-0 bg-slate-50 dark:bg-[#001529] z-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredStudents.map((student) => {
                                const isSelected = selectedIds.includes(student.id);
                                return (
                                    <tr key={student.id} className={cn("group transition-colors", isSelected ? "bg-primary-50/30 dark:bg-primary-900/10" : "hover:bg-slate-50/50 dark:hover:bg-slate-900/10")}>
                                        <td className="px-6 py-4 sticky left-0 z-20 bg-white dark:bg-[#001a33]">
                                            <input type="checkbox" checked={isSelected} onChange={(e) => e.target.checked ? setSelectedIds(prev => [...prev, student.id]) : setSelectedIds(prev => prev.filter(id => id !== student.id))} />
                                        </td>
                                        <td className="px-6 py-4 sticky left-[52px] z-10 bg-white dark:bg-[#001a33]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-black text-white shadow-lg">
                                                    {student.avatar && student.avatar.length > 5 ? <img src={student.avatar} className="w-full h-full object-cover rounded-xl" /> : <span>{student.name.charAt(0)}</span>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm tracking-tight">{student.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 capitalize">{student.discipline}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{student.id}</td>
                                        <td className="px-6 py-4 text-xs font-black uppercase text-slate-600 dark:text-slate-400">{student.class}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", student.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600')}>{student.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right sticky right-0 bg-white dark:bg-[#001a33]">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => viewStudentDetails(student)} title="View Profile" className="p-2 hover:bg-brand-primary/10 text-slate-400"><FileText className="w-4 h-4" /></button>
                                                {isAdmin && <button onClick={() => setEditingStudent(student)} title="Edit Student" className="p-2 hover:bg-emerald-50 text-slate-400"><Edit className="w-4 h-4" /></button>}
                                                <button
                                                    onClick={() => {
                                                        setSubmittedStudentForVoucher(student);
                                                    }}
                                                    title="Generate Fee Slip"
                                                    className="p-2 hover:bg-amber-50 text-amber-600 transition-colors"
                                                >
                                                    <DollarSign className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setSelectedStudentForId(student)} title="ID Card" className="p-2 hover:bg-brand-primary/10 text-slate-400"><Contact className="w-4 h-4" /></button>
                                                {isAdmin && <button onClick={() => handleDeleteStudent(student.id, student.name)} title="Delete" className="p-2 hover:bg-red-50 text-slate-400"><Trash2 className="w-4 h-4" /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showSelectionModal && (
                    <div className="fixed inset-0 z-[150] bg-brand-primary/95 backdrop-blur-2xl flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="w-full max-w-4xl"
                        >
                            <div className="text-center mb-12">
                                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4">
                                    {!selectedCampus ? 'Select Campus' : 'Admission For'}
                                </h2>
                                <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-sm">
                                    {!selectedCampus ? 'Step 1: Choose Campus Location' : 'Step 2: Choose School or College'}
                                </p>
                            </div>

                            {!selectedCampus ? (
                                <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
                                    {(campuses && campuses.length > 0 ? campuses : [
                                        { id: 'DEFAULT', name: 'MAIN CAMPUS' }
                                    ]).map((c: any) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedCampus(c.id)}
                                            className="group relative w-full bg-white hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/10 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] flex items-center justify-start px-8 md:px-12 gap-6 shadow-sm hover:shadow-xl"
                                        >
                                            <div className="w-10 h-10 bg-brand-primary/5 group-hover:bg-white/10 rounded-full flex items-center justify-center">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <span className="font-outfit font-black uppercase tracking-widest text-xs md:text-sm text-left">{c.name.toUpperCase()}</span>
                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                                    {/* School Selection */}
                                    <button
                                        onClick={() => {
                                            setSelectedType('School');
                                            setShowSelectionModal(false);
                                            setShowAdmissionForm(true);
                                        }}
                                        className="group relative h-80 bg-[#001f3f]/40 hover:bg-[#001f3f]/60 text-white border border-white/5 rounded-[4rem] p-10 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center justify-center gap-8 shadow-2xl backdrop-blur-sm"
                                    >
                                        <div className={cn(
                                            "w-36 h-36 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 overflow-hidden shadow-2xl border border-white/10",
                                            settings.logo1 ? "bg-white p-5" : "bg-[#0d3b3b] shadow-inner"
                                        )}>
                                            {settings.logo1 ? (
                                                <img src={settings.logo1} className="w-full h-full object-contain rounded-xl" alt="School Logo" />
                                            ) : (
                                                <School className="w-16 h-16 text-[#4ade80]" />
                                            )}
                                        </div>
                                        <div className="text-center space-y-2">
                                            <span className="block font-serif font-black uppercase tracking-[0.2em] text-2xl">School</span>
                                            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] block">Primary to Secondary</span>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </button>

                                    {/* College Selection */}
                                    <button
                                        onClick={() => {
                                            setSelectedType('College');
                                            setShowSelectionModal(false);
                                            setShowAdmissionForm(true);
                                        }}
                                        className="group relative h-80 bg-[#001f3f]/40 hover:bg-[#001f3f]/60 text-white border border-white/5 rounded-[4rem] p-10 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center justify-center gap-8 shadow-2xl backdrop-blur-sm"
                                    >
                                        <div className={cn(
                                            "w-36 h-36 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 overflow-hidden shadow-2xl border border-white/10",
                                            settings.logo2 ? "bg-white p-5" : "bg-[#1e3a5f] shadow-inner"
                                        )}>
                                            {settings.logo2 ? (
                                                <img src={settings.logo2} className="w-full h-full object-contain rounded-xl" alt="College Logo" />
                                            ) : (
                                                <GraduationCap className="w-16 h-16 text-[#60a5fa]" />
                                            )}
                                        </div>
                                        <div className="text-center space-y-2">
                                            <span className="block font-serif font-black uppercase tracking-[0.2em] text-2xl">College</span>
                                            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] block">Higher Secondary</span>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-500/5 to-transparent rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </button>
                                </div>
                            )}

                            <div className="mt-16 flex justify-center gap-4">
                                {selectedCampus && (
                                    <button
                                        onClick={() => setSelectedCampus('')}
                                        className="px-8 py-3 rounded-2xl border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
                                    >
                                        Return to Campus List
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowSelectionModal(false);
                                        setShowBlankForm(true);
                                        setSelectedCampus('');
                                        setSelectedType(null);
                                    }}
                                    className="px-8 py-3 rounded-2xl bg-[#800000] text-white font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-xl"
                                >
                                    <FileText className="w-4 h-4" /> Admission Form (Blank)
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSelectionModal(false);
                                        setSelectedCampus('');
                                        setSelectedType(null);
                                    }}
                                    className="px-8 py-3 rounded-2xl bg-white/5 text-white/40 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all"
                                >
                                    Cancel Onboarding
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {(showAdmissionForm || editingStudent) && (
                <AdmissionForm
                    editStudent={editingStudent || undefined}
                    initialCampus={selectedCampus}
                    initialType={selectedType || undefined}
                    onClose={() => {
                        setShowAdmissionForm(false);
                        setEditingStudent(null);
                        setSelectedCampus('');
                        setSelectedType(null);
                    }}
                />
            )}

            {selectedStudentForId && (
                <IDCardGenerator
                    student={selectedStudentForId}
                    onClose={() => setSelectedStudentForId(null)}
                />
            )}

            {showQRScanner && (
                <QRScanner
                    mode="Present"
                    onScan={handleQRScan}
                    onClose={() => setShowQRScanner(false)}
                />
            )}

            {showBlankForm && (
                <BlankAdmissionForm onClose={() => setShowBlankForm(false)} />
            )}

            {submittedStudentForVoucher && (
                <FeeVoucher
                    student={submittedStudentForVoucher}
                    onClose={() => setSubmittedStudentForVoucher(null)}
                />
            )}

            {showBulkFeeVouchers && (
                <BulkFeeVoucher
                    students={students.filter(s => selectedIds.includes(s.id))}
                    onClose={() => setShowBulkFeeVouchers(false)}
                />
            )}
        </div>
    );
};
