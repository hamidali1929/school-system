import { useState, useEffect, useMemo } from 'react';
import { Search, Download, Plus, X, FileText, Contact, Edit, Trash2, Camera, CheckCircle2, Users, DollarSign, Layers, ArrowRightLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Globe } from 'lucide-react';
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
import { Building2, GraduationCap } from 'lucide-react';

export const Students = () => {
    const { students, deleteStudent, addStudent, settings, campuses, currentUser, bulkUpdateStudents, classes: systemClasses, reAdmitStudent, sendNotification } = useStore();
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

    const [reAdmittingStudent, setReAdmittingStudent] = useState<Student | null>(null);
    const [reAdmitClass, setReAdmitClass] = useState('');
    const [reAdmitDiscipline, setReAdmitDiscipline] = useState('FSc Pre-Medical');
    const [reAdmitMonthly, setReAdmitMonthly] = useState(3500);
    const [reAdmitAdmission, setReAdmitAdmission] = useState(0);

    const handleCopyParentPortalLink = () => {
        const link = `${window.location.origin}/#/apply`;
        navigator.clipboard.writeText(link);
        Swal.fire({
            title: '🔗 Parent Portal Link Copied!',
            html: `
                <div class="text-left text-xs space-y-3 font-outfit">
                    <p class="font-bold text-slate-700 dark:text-slate-200">Share this dedicated link with parents via WhatsApp or SMS:</p>
                    <div class="p-3 bg-blue-50 dark:bg-slate-800 rounded-xl font-mono text-blue-600 dark:text-yellow-400 break-all select-all font-bold border border-blue-200 dark:border-white/10">
                        ${link}
                    </div>
                    <div class="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-800 dark:text-emerald-300 font-medium text-[11px] flex items-center gap-2">
                        <span>✅ Parents can fill all details and submit applications directly without accessing your admin portal.</span>
                    </div>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#003366',
            confirmButtonText: 'Done'
        });
    };

    const handleApproveOnlineStudent = async (student: Student) => {
        const result = await Swal.fire({
            title: `Approve ${student.name}?`,
            text: `Enroll ${student.name} as an Active student in ${student.class}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#003366',
            confirmButtonText: 'Yes, Approve & Enroll',
            cancelButtonText: 'Review / Edit Form'
        });

        if (result.isConfirmed) {
            bulkUpdateStudents([student.id], { status: 'Active' });
            
            // Send WhatsApp Approval Message with Portal Credentials
            const portalUrl = window.location.origin;
            const msg = `🎊 *ADMISSION APPROVED* 🎊\n\nDear Parents,\nCongratulations! The admission of *${student.name}* at *${settings.schoolName}* has been successfully approved for *${student.class}*.\n\n` + 
                        `*--- PORTAL CREDENTIALS ---*\n` + 
                        `👉 Portal Link: ${portalUrl}\n` +
                        `👉 Role: Select "Student"\n` +
                        `👉 Student ID / Username: *${student.id}*\n` +
                        `👉 Password: (Not required, just enter ID)\n\n` +
                        `Please visit the campus for further instructions if any fees are pending. Welcome to the family!`;

            if (student.contactFather) {
                sendNotification(student.id, 'General', msg);
            }
            
            Swal.fire({
                title: 'Admission Approved',
                text: `${student.name} is now an active student and an automated WhatsApp has been dispatched.`,
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            setEditingStudent(student);
        }
    };

    const handleOpenReAdmit = (student: Student) => {
        const availableClasses = systemClasses.length > 0 ? systemClasses : ['1st Year (Boys)', '1st Year (Girls)', '2nd Year (Boys)', '2nd Year (Girls)', ...classes.filter(c => c !== 'All')];
        const collegeClasses = availableClasses.filter(c => c.toLowerCase().includes('year') || c.toLowerCase().includes('11th') || c.toLowerCase().includes('12th'));
        const defaultClass = collegeClasses[0] || availableClasses[0] || '1st Year (Boys)';

        setReAdmittingStudent(student);
        setReAdmitClass(defaultClass);
        setReAdmitDiscipline(student.discipline || 'FSc Pre-Medical');
        setReAdmitMonthly(student.monthlyFees || 3500);
        setReAdmitAdmission(0);
    };

    const handleConfirmReAdmit = async () => {
        if (!reAdmittingStudent) return;
        await reAdmitStudent(reAdmittingStudent.id, reAdmitClass, reAdmitDiscipline, reAdmitMonthly, reAdmitAdmission);
        const name = reAdmittingStudent.name;
        const targetCls = reAdmitClass;
        const targetDisc = reAdmitDiscipline;
        setReAdmittingStudent(null);
        Swal.fire({
            title: '🎉 Student Re-Enrolled!',
            text: `${name} is now actively enrolled in ${targetCls} (${targetDisc})!`,
            icon: 'success',
            timer: 3500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Reset to page 1 on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterClass, statusFilter, campusFilter, pageSize]);

    const filteredStudents = useMemo(() => students.filter(s => {
        // Teacher restriction: Only show their incharge class
        if (currentUser?.role === 'teacher' && currentUser?.inchargeClass) {
            if (s.class !== currentUser.inchargeClass) return false;
        }

        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                              s.id.toLowerCase().includes(search.toLowerCase()) ||
                              (s.fatherName && s.fatherName.toLowerCase().includes(search.toLowerCase())) ||
                              (s.contactFather && s.contactFather.includes(search));
        
        const matchesClass = filterClass === 'All' || s.class === filterClass;
        const matchesStatus = statusFilter === 'All' ? true : 
                              statusFilter === 'Active' ? s.status === 'Active' :
                              statusFilter === 'Passed Out' ? (s.status === 'Passed Out' || s.status === 'Alumni') :
                              statusFilter === 'Inactive' ? s.status === 'Inactive' :
                              statusFilter === 'Online Applied' ? (s.status === 'Online Applied' || s.status === 'Pending Verification') :
                              s.status === statusFilter;
        const matchesCampus = campusFilter === 'All' || 
                              s.campus?.toLowerCase() === campusFilter.toLowerCase();
                              
        return matchesSearch && matchesClass && matchesStatus && matchesCampus;
    }), [students, search, filterClass, statusFilter, campusFilter, currentUser]);

    const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const classes = (currentUser?.role === 'teacher' && currentUser?.inchargeClass)
        ? [currentUser.inchargeClass]
        : ['All', ...new Set([...(systemClasses && systemClasses.length > 0 ? systemClasses : []), ...students.map(s => s.class)])];

    const viewStudentDetails = (student: Student) => {
        const hasAvatar = student.avatar && student.avatar.length > 5;
        const h = document.documentElement.classList.contains('dark');

        Swal.fire({
            padding: '0',
            background: h ? '#0b1120' : '#ffffff',
            color: h ? '#f8fafc' : '#1e293b',
            width: '95vw',
            showConfirmButton: true,
            confirmButtonText: 'Export PDF Profile',
            confirmButtonColor: '#003366',
            showCancelButton: true,
            cancelButtonText: 'Close',
            customClass: {
                popup: 'rounded-2xl sm:rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden max-w-4xl w-full',
                confirmButton: 'px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] m-2 sm:m-4 shadow-xl shadow-[#003366]/20 transition-all hover:scale-105',
                cancelButton: 'px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] m-2 sm:m-4 border-2 border-slate-100 dark:border-white/5 transition-all hover:bg-slate-50 dark:hover:bg-white/5',
                htmlContainer: '!m-0 !p-0 !overflow-x-hidden'
            },
            html: `
                <div class="font-outfit text-left overflow-y-auto max-h-[80vh]">
                    <!-- Hero Banner -->
                    <div class="relative bg-gradient-to-br from-[#003366] to-blue-900 overflow-hidden p-4 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8 text-center sm:text-left">
                        <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <div class="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                        
                        <div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                            <div class="relative group shrink-0">
                                <div class="absolute -inset-1.5 bg-white/20 blur-xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                ${hasAvatar ? `
                                    <div class="relative w-20 h-20 sm:w-32 sm:h-32 rounded-2xl sm:rounded-[2.5rem] border-4 border-white overflow-hidden shadow-2xl">
                                        <img src="${student.avatar}" class="w-full h-full object-cover" />
                                    </div>
                                ` : `
                                    <div class="relative w-20 h-20 sm:w-32 sm:h-32 rounded-2xl sm:rounded-[2.5rem] bg-white text-[#003366] flex items-center justify-center text-3xl sm:text-5xl font-black shadow-2xl">
                                        ${student.name.charAt(0)}
                                    </div>
                                `}
                            </div>
                            <div>
                                <h1 class="text-xl sm:text-3xl font-black text-white tracking-tighter uppercase mb-1">${student.name}</h1>
                                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    <span class="px-3 py-1 bg-yellow-400 text-[#003366] rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                                        ID: ${student.id}
                                    </span>
                                    <span class="px-3 py-1 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                                        ${student.status} Student
                                    </span>
                                    <span class="px-3 py-1 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] sm:hidden">
                                        ${student.campus || 'Main Campus'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="relative z-10 text-right hidden md:block">
                            <p class="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2 text-right">Campus</p>
                            <h2 class="text-xl font-black text-white uppercase tracking-wider">${student.campus || 'Main Campus'}</h2>
                        </div>
                    </div>

                    <div class="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 bg-slate-50 dark:bg-slate-900/50">
                        <!-- Left Column: Personal Info -->
                        <div class="space-y-4 sm:space-y-6">
                            <div class="p-4 sm:p-6 bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                                <h4 class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                    Personal Identity
                                </h4>
                                <div class="space-y-3.5 sm:space-y-4">
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Date of Birth</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${student.dob || 'N/A'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Gender</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${student.gender || 'N/A'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Religion</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${student.religion || 'Islam'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">CNIC / B-Form</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${student.cnic || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Center Column: Family & Contact -->
                        <div class="space-y-4 sm:space-y-6">
                            <div class="p-4 sm:p-6 bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm h-full">
                                <h4 class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                                    Family Details
                                </h4>
                                <div class="space-y-3.5 sm:space-y-4">
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Father's Name</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${student.fatherName || 'N/A'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Occupation</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${student.fatherOccupation || 'N/A'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Guardian Contact</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${student.contactFather || 'N/A'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">WhatsApp Number</p>
                                        <p class="text-xs sm:text-sm font-bold text-emerald-600">${student.whatsappNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column: Academic & Contact -->
                        <div class="space-y-4 sm:space-y-6">
                            <div class="p-4 sm:p-6 bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                                <h4 class="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                                    Academic Status
                                </h4>
                                <div class="space-y-3.5 sm:space-y-4">
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Current Class</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${student.class}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Performance</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${student.performance || 'Good'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Admission Date</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${student.admissionDate || 'N/A'}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Monthly Tuition</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white italic">Rs. ${student.monthlyFees?.toLocaleString() || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Full Width Address -->
                        <div class="col-span-full">
                            <div class="p-4 sm:p-6 bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                                <h4 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
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
                const hasAvatar = student.avatar && student.avatar.length > 5;
                const academicRows = (student.academicRecords || []).map(r => `
                    <tr>
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800; text-transform: uppercase;">${r.degree || 'N/A'}</td>
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 700;">${r.board || 'BISE / School'}</td>
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 800;">${r.passingYear || 'N/A'}</td>
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700;">${r.totalMarks || '1100'}</td>
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 800; color: #003366;">${r.marksObtained || '-'}</td>
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 900; color: #059669;">${r.percentage || '-'}</td>
                    </tr>
                `).join('');

                const html = `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <title>Official Student Profile - ${student.name} (${student.id})</title>
                            <style>
                                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
                                
                                @page {
                                    size: A4 portrait;
                                    margin: 6mm 8mm;
                                }
                                
                                * {
                                    box-sizing: border-box;
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                }
                                
                                body {
                                    font-family: 'Outfit', sans-serif;
                                    margin: 0;
                                    padding: 0;
                                    background: #f1f5f9;
                                    color: #0f172a;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                }
                                
                                .no-print-bar {
                                    width: 100%;
                                    max-width: 210mm;
                                    padding: 12px 20px;
                                    background: #003366;
                                    color: #fff;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                                    margin-bottom: 12px;
                                    border-radius: 0 0 16px 16px;
                                }
                                
                                .btn-print {
                                    background: #f59e0b;
                                    color: #003366;
                                    border: none;
                                    padding: 8px 20px;
                                    font-size: 11px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                                }
                                
                                .btn-close {
                                    background: rgba(255,255,255,0.15);
                                    color: #fff;
                                    border: 1px solid rgba(255,255,255,0.2);
                                    padding: 8px 16px;
                                    font-size: 11px;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    border-radius: 8px;
                                    cursor: pointer;
                                }
                                
                                .sheet {
                                    width: 210mm;
                                    box-sizing: border-box;
                                    background: #ffffff;
                                    padding: 16px 22px;
                                    margin: 0 auto;
                                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                                    border-radius: 4px;
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: space-between;
                                }
                                
                                /* Header Banner */
                                .header-strip {
                                    background: linear-gradient(135deg, #003366 0%, #001a33 100%);
                                    border-radius: 14px;
                                    padding: 12px 18px;
                                    color: #fff;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    border-bottom: 3px solid #f59e0b;
                                }
                                
                                .header-left {
                                    display: flex;
                                    align-items: center;
                                    gap: 14px;
                                }
                                
                                .school-logo {
                                    width: 52px;
                                    height: 52px;
                                    background: #ffffff;
                                    border-radius: 10px;
                                    padding: 4px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                                }
                                
                                .school-logo img {
                                    max-width: 100%;
                                    max-height: 100%;
                                    object-fit: contain;
                                }
                                
                                .school-title {
                                    font-size: 18px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: -0.3px;
                                    margin: 0;
                                    line-height: 1.1;
                                    color: #ffffff;
                                }
                                
                                .school-subtitle {
                                    font-size: 8.5px;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    letter-spacing: 1.5px;
                                    opacity: 0.8;
                                    margin-top: 3px;
                                    color: #93c5fd;
                                }
                                
                                .header-badge {
                                    text-align: right;
                                }
                                
                                .badge-title {
                                    font-size: 7.5px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 1.5px;
                                    color: #f59e0b;
                                }
                                
                                .badge-session {
                                    font-size: 13px;
                                    font-weight: 900;
                                    color: #ffffff;
                                    letter-spacing: 0.5px;
                                    margin-top: 2px;
                                }
                                
                                /* Profile Card */
                                .profile-bar {
                                    margin-top: 12px;
                                    background: #f8fafc;
                                    border: 1.5px solid #e2e8f0;
                                    border-radius: 14px;
                                    padding: 10px 14px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    gap: 16px;
                                }
                                
                                .profile-left {
                                    display: flex;
                                    align-items: center;
                                    gap: 14px;
                                }
                                
                                .avatar-box {
                                    width: 72px;
                                    height: 72px;
                                    border-radius: 12px;
                                    border: 2.5px solid #003366;
                                    overflow: hidden;
                                    background: #ffffff;
                                    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 28px;
                                    font-weight: 900;
                                    color: #003366;
                                    flex-shrink: 0;
                                }
                                
                                .avatar-box img {
                                    width: 100%;
                                    height: 100%;
                                    object-fit: cover;
                                }
                                
                                .name-area h2 {
                                    margin: 0;
                                    font-size: 19px;
                                    font-weight: 900;
                                    color: #003366;
                                    text-transform: uppercase;
                                    letter-spacing: -0.3px;
                                    line-height: 1.1;
                                }
                                
                                .pills-row {
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    margin-top: 5px;
                                    flex-wrap: wrap;
                                }
                                
                                .pill {
                                    padding: 2.5px 8px;
                                    border-radius: 6px;
                                    font-size: 8px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                }
                                
                                .pill-id { background: #f59e0b; color: #003366; }
                                .pill-class { background: #003366; color: #ffffff; }
                                .pill-campus { background: #e0e7ff; color: #3730a3; }
                                .pill-status { background: #dcfce7; color: #15803d; }
                                .pill-alumni { background: #f3e8ff; color: #7e22ce; }
                                
                                .profile-right-meta {
                                    text-align: right;
                                    border-left: 1.5px dashed #cbd5e1;
                                    padding-left: 14px;
                                    flex-shrink: 0;
                                }
                                
                                .meta-label {
                                    font-size: 7px;
                                    font-weight: 800;
                                    text-transform: uppercase;
                                    color: #64748b;
                                    letter-spacing: 1px;
                                }
                                
                                .meta-val {
                                    font-size: 11px;
                                    font-weight: 900;
                                    color: #003366;
                                    margin-top: 1px;
                                }
                                
                                /* 2-Column Info Grid */
                                .data-grid {
                                    display: grid;
                                    grid-template-columns: 1fr 1fr;
                                    gap: 10px;
                                    margin-top: 10px;
                                }
                                
                                .section-card {
                                    background: #ffffff;
                                    border: 1.5px solid #e2e8f0;
                                    border-radius: 12px;
                                    padding: 8px 12px;
                                }
                                
                                .section-head {
                                    font-size: 9px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                    color: #003366;
                                    border-bottom: 1.5px solid #f1f5f9;
                                    padding-bottom: 5px;
                                    margin-bottom: 6px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                }
                                
                                .field-table {
                                    width: 100%;
                                    border-collapse: collapse;
                                }
                                
                                .field-table tr td {
                                    padding: 2.5px 0;
                                    font-size: 9.5px;
                                    vertical-align: top;
                                }
                                
                                .field-label {
                                    width: 42%;
                                    color: #64748b;
                                    font-weight: 800;
                                    text-transform: uppercase;
                                    font-size: 7.5px;
                                    letter-spacing: 0.3px;
                                }
                                
                                .field-value {
                                    color: #0f172a;
                                    font-weight: 800;
                                    font-size: 9.5px;
                                }
                                
                                /* Address Box */
                                .address-card {
                                    margin-top: 10px;
                                    background: #f8fafc;
                                    border: 1.5px solid #e2e8f0;
                                    border-radius: 10px;
                                    padding: 8px 12px;
                                }
                                
                                .address-card h4 {
                                    margin: 0 0 3px 0;
                                    font-size: 8px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                    color: #64748b;
                                }
                                
                                .address-card p {
                                    margin: 0;
                                    font-size: 9.5px;
                                    font-weight: 700;
                                    color: #1e293b;
                                    line-height: 1.35;
                                }
                                
                                /* Academic Table */
                                .academic-table-wrap {
                                    margin-top: 10px;
                                }
                                
                                .academic-table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    font-size: 8.5px;
                                }
                                
                                .academic-table th {
                                    background: #003366;
                                    color: #fff;
                                    padding: 5px 8px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                    border: 1px solid #003366;
                                }
                                
                                /* Signatures Footer */
                                .signatures-row {
                                    margin-top: 16px;
                                    display: flex;
                                    align-items: flex-end;
                                    justify-content: space-between;
                                    padding-top: 12px;
                                    border-top: 1.5px dashed #cbd5e1;
                                }
                                
                                .sig-box {
                                    width: 28%;
                                    text-align: center;
                                }
                                
                                .sig-line {
                                    border-bottom: 1.5px solid #475569;
                                    margin-bottom: 4px;
                                    height: 24px;
                                }
                                
                                .sig-title {
                                    font-size: 7.5px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                    color: #003366;
                                }
                                
                                .sig-sub {
                                    font-size: 6.5px;
                                    font-weight: 700;
                                    color: #64748b;
                                    text-transform: uppercase;
                                }
                                
                                .footer-notice {
                                    margin-top: 10px;
                                    background: #003366;
                                    color: #ffffff;
                                    border-radius: 8px;
                                    padding: 6px 12px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    font-size: 7.5px;
                                    font-weight: 700;
                                }
                                
                                @media print {
                                    body {
                                        background: #ffffff !important;
                                        padding: 0 !important;
                                    }
                                    .no-print-bar {
                                        display: none !important;
                                    }
                                    .sheet {
                                        box-shadow: none !important;
                                        border: none !important;
                                        padding: 0 !important;
                                        width: 100% !important;
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="no-print-bar">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">Student Dossier Print Preview</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <button class="btn-print" onclick="window.print()">
                                        🖨️ Print / Save as PDF
                                    </button>
                                    <button class="btn-close" onclick="window.close()">
                                        Close
                                    </button>
                                </div>
                            </div>

                            <div class="sheet">
                                <div>
                                    <!-- Header Strip -->
                                    <div class="header-strip">
                                        <div class="header-left">
                                            <div class="school-logo">
                                                ${settings.logo1 || settings.logo2 ? `
                                                    <img src="${settings.logo1 || settings.logo2}" alt="Logo" />
                                                ` : `
                                                    <span style="font-size: 24px; font-weight: 900; color: #003366;">PS</span>
                                                `}
                                            </div>
                                            <div>
                                                <h1 class="school-title">${settings.schoolName || "PIONEER'S SUPERIOR EDUCATION SYSTEM"}</h1>
                                                <p class="school-subtitle">${settings.subTitle || settings.location || "INSTITUTE OF HIGHER SECONDARY EDUCATION"}</p>
                                            </div>
                                        </div>
                                        <div class="header-badge">
                                            <div class="badge-title">OFFICIAL DOSSIER</div>
                                            <div class="badge-session">SESSION: ${settings.academicSession || '2024 - 2025'}</div>
                                        </div>
                                    </div>

                                    <!-- Profile Hero -->
                                    <div class="profile-bar">
                                        <div class="profile-left">
                                            <div class="avatar-box">
                                                ${hasAvatar ? `<img src="${student.avatar}" alt="${student.name}" />` : `<span>${student.name.charAt(0)}</span>`}
                                            </div>
                                            <div class="name-area">
                                                <h2>${student.name}</h2>
                                                <div class="pills-row">
                                                    <span class="pill pill-id">ID: ${student.id}</span>
                                                    <span class="pill pill-class">CLASS: ${student.class}</span>
                                                    <span class="pill pill-campus">${student.campus || 'Main Campus'}</span>
                                                    <span class="pill ${student.status === 'Passed Out' ? 'pill-alumni' : 'pill-status'}">
                                                        ${student.status === 'Passed Out' ? '🎓 Passed Out' : student.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="profile-right-meta">
                                            <div class="meta-label">Enrollment Date</div>
                                            <div class="meta-val">${student.admissionDate || 'On Record'}</div>
                                            <div class="meta-label" style="margin-top: 4px;">Monthly Tuition</div>
                                            <div class="meta-val" style="color: #059669;">Rs. ${student.monthlyFees?.toLocaleString() || 'N/A'}</div>
                                        </div>
                                    </div>

                                    <!-- 4-Grid Data -->
                                    <div class="data-grid">
                                        <!-- Box 1: Personal -->
                                        <div class="section-card">
                                            <div class="section-head">
                                                <span>Personal Identity</span>
                                                <span style="color: #64748b; font-size: 7.5px;">Identity Card</span>
                                            </div>
                                            <table class="field-table">
                                                <tr><td class="field-label">Full Name</td><td class="field-value">${student.name}</td></tr>
                                                <tr><td class="field-label">Gender</td><td class="field-value">${student.gender || 'N/A'}</td></tr>
                                                <tr><td class="field-label">Date of Birth</td><td class="field-value">${student.dob || 'N/A'}</td></tr>
                                                <tr><td class="field-label">CNIC / B-Form</td><td class="field-value">${student.cnic || 'N/A'}</td></tr>
                                                <tr><td class="field-label">Religion</td><td class="field-value">${student.religion || 'Islam'}</td></tr>
                                                <tr><td class="field-label">Nationality</td><td class="field-value">${student.nationality || 'Pakistani'}</td></tr>
                                            </table>
                                        </div>

                                        <!-- Box 2: Academic Status -->
                                        <div class="section-card">
                                            <div class="section-head">
                                                <span>Academic Enrollment</span>
                                                <span style="color: #64748b; font-size: 7.5px;">Program Detail</span>
                                            </div>
                                            <table class="field-table">
                                                <tr><td class="field-label">Current Class</td><td class="field-value" style="color: #003366;">${student.class}</td></tr>
                                                <tr><td class="field-label">Assigned Campus</td><td class="field-value">${student.campus || 'Main Campus'}</td></tr>
                                                <tr><td class="field-label">Discipline/Stream</td><td class="field-value">${student.discipline || 'General Studies'}</td></tr>
                                                <tr><td class="field-label">Academic Status</td><td class="field-value">${student.status}</td></tr>
                                                <tr><td class="field-label">Roll Number / ID</td><td class="field-value">${student.manualId || student.id}</td></tr>
                                                <tr><td class="field-label">Admission Year</td><td class="field-value">${student.admissionDate ? new Date(student.admissionDate).getFullYear() : '2024'}</td></tr>
                                            </table>
                                        </div>

                                        <!-- Box 3: Family Info -->
                                        <div class="section-card">
                                            <div class="section-head">
                                                <span>Family & Guardianship</span>
                                                <span style="color: #64748b; font-size: 7.5px;">Guardian Detail</span>
                                            </div>
                                            <table class="field-table">
                                                <tr><td class="field-label">Father Name</td><td class="field-value">${student.fatherName || 'N/A'}</td></tr>
                                                <tr><td class="field-label">Father Occupation</td><td class="field-value">${student.fatherOccupation || 'N/A'}</td></tr>
                                                <tr><td class="field-label">Monthly Income</td><td class="field-value">${student.monthlyIncome ? `Rs. ${Number(student.monthlyIncome).toLocaleString()}` : 'N/A'}</td></tr>
                                                <tr><td class="field-label">Guardian Status</td><td class="field-value">${student.isOrphan ? 'Orphan Student' : 'Father / Guardian Active'}</td></tr>
                                                <tr><td class="field-label">Emergency Phone</td><td class="field-value">${student.contactFather || 'N/A'}</td></tr>
                                            </table>
                                        </div>

                                        <!-- Box 4: Contact & Communication -->
                                        <div class="section-card">
                                            <div class="section-head">
                                                <span>Contact & Communication</span>
                                                <span style="color: #64748b; font-size: 7.5px;">Contact Numbers</span>
                                            </div>
                                            <table class="field-table">
                                                <tr><td class="field-label">Primary Mobile</td><td class="field-value" style="color: #003366;">${student.contactSelf || student.contactFather || 'N/A'}</td></tr>
                                                <tr><td class="field-label">Father Contact</td><td class="field-value">${student.contactFather || 'N/A'}</td></tr>
                                                <tr><td class="field-label">WhatsApp Number</td><td class="field-value" style="color: #059669;">${student.whatsappNumber || student.contactFather || 'N/A'}</td></tr>
                                                <tr><td class="field-label">Email Address</td><td class="field-value">${student.email || 'N/A'}</td></tr>
                                                <tr><td class="field-label">Emergency Contact</td><td class="field-value">${student.contactFather || 'N/A'}</td></tr>
                                            </table>
                                        </div>
                                    </div>

                                    <!-- Address -->
                                    <div class="address-card">
                                        <h4>Permanent / Residential Address</h4>
                                        <p>${student.address || 'No registered residential address recorded on file.'}</p>
                                    </div>

                                    <!-- Academic History if exists -->
                                    ${(student.academicRecords || []).length > 0 ? `
                                        <div class="academic-table-wrap">
                                            <div style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #003366; margin-bottom: 4px;">
                                                Prior Academic Credentials & Examination History
                                            </div>
                                            <table class="academic-table">
                                                <thead>
                                                    <tr>
                                                        <th>Degree / Class</th>
                                                        <th>Board / School</th>
                                                        <th style="text-align: center;">Passing Year</th>
                                                        <th style="text-align: center;">Total Marks</th>
                                                        <th style="text-align: center;">Obtained</th>
                                                        <th style="text-align: center;">Percentage</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${academicRows}
                                                </tbody>
                                            </table>
                                        </div>
                                    ` : ''}
                                </div>

                                <div>
                                    <!-- Signatures Block -->
                                    <div class="signatures-row">
                                        <div class="sig-box">
                                            <div class="sig-line"></div>
                                            <div class="sig-title">Class In-Charge</div>
                                            <div class="sig-sub">Verified & Recorded</div>
                                        </div>
                                        <div class="sig-box">
                                            <div class="sig-line"></div>
                                            <div class="sig-title">Accounts Officer</div>
                                            <div class="sig-sub">Fee Verification & Stamp</div>
                                        </div>
                                        <div class="sig-box">
                                            <div class="sig-line"></div>
                                            <div class="sig-title">Principal / Controller</div>
                                            <div class="sig-sub">Official Signature & Seal</div>
                                        </div>
                                    </div>

                                    <!-- Footer Strip -->
                                    <div class="footer-notice">
                                        <div>
                                            CONFIDENTIAL OFFICIAL RECORD • ${settings.schoolName || "TIMES'S PUBLIC SCHOOL"}
                                        </div>
                                        <div>
                                            GENERATED ON: ${new Date().toLocaleDateString('en-GB')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <script>
                                window.addEventListener('load', function() {
                                    setTimeout(function() {
                                        window.print();
                                    }, 600);
                                });
                            </script>
                        </body>
                    </html>
                `;

                try {
                    const printWindow = window.open('', '_blank');
                    if (printWindow && printWindow.document) {
                        printWindow.document.write(html);
                        printWindow.document.close();
                    } else {
                        // Fallback for Android WebView / APK where window.open returns null
                        const iframe = document.createElement('iframe');
                        iframe.style.position = 'fixed';
                        iframe.style.right = '0';
                        iframe.style.bottom = '0';
                        iframe.style.width = '0';
                        iframe.style.height = '0';
                        iframe.style.border = '0';
                        document.body.appendChild(iframe);
                        const doc = iframe.contentWindow?.document;
                        if (doc) {
                            doc.open();
                            doc.write(html);
                            doc.close();
                            setTimeout(() => {
                                iframe.contentWindow?.focus();
                                iframe.contentWindow?.print();
                                setTimeout(() => {
                                    try { document.body.removeChild(iframe); } catch(e){}
                                }, 3000);
                            }, 600);
                        }
                    }
                } catch (err) {
                    console.error('Print Error:', err);
                }
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
        <div className="space-y-4 md:space-y-6 animate-fade-in font-outfit pb-10">
            {/* Compact Adjustable Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary to-brand-primary/80 dark:from-brand-primary/20 dark:to-brand-primary/10 rounded-[var(--brand-radius,1.5rem)] md:rounded-[var(--brand-radius,2.5rem)] p-3 sm:p-4 md:p-6 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
                    {/* Left: Branding & Core Title */}
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl items-center justify-center border border-white/10 backdrop-blur-xl shrink-0">
                            <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-none">Student Management</h2>
                            <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 md:mt-1.5">Manage and record student data</p>
                        </div>
                    </div>

                    {/* Right: Primary Actions */}
                    <div className="flex flex-wrap items-center gap-2">
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
                        
                        <div className="flex w-full sm:w-auto items-center gap-2">
                            <button
                                onClick={handleCopyParentPortalLink}
                                title="Copy Parent Online Admission Link for WhatsApp"
                                className="flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-1.5 md:gap-2"
                            >
                                <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-300" />
                                Parent Link
                            </button>

                            {canAddStudent && (
                                <button
                                    onClick={() => setShowSelectionModal(true)}
                                    className="flex-1 sm:flex-none px-3 py-2 md:px-5 md:py-3 bg-white text-brand-primary rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-1.5 md:gap-2 group"
                                >
                                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-90 transition-transform" />
                                    Add Student
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sub-Header: Filters & Secondary Actions */}
                <div className="mt-4 pt-4 md:mt-8 md:pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
                        <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 shrink-0">
                            {['All', 'Active', 'Online Applied', 'Passed Out', 'Inactive'].map(st => {
                                const onlineCount = st === 'Online Applied'
                                    ? students.filter(s => s.status === 'Online Applied' || s.status === 'Pending Verification').length
                                    : 0;

                                return (
                                    <button
                                        key={st}
                                        onClick={() => setStatusFilter(st)}
                                        className={cn(
                                            "px-3.5 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg flex items-center gap-1.5",
                                            statusFilter === st
                                                ? "bg-white text-brand-primary shadow-lg"
                                                : "text-white/40 hover:text-white"
                                        )}
                                    >
                                        {st === 'Passed Out' && <span>🎓</span>}
                                        {st === 'Online Applied' && <span>🌐</span>}
                                        <span>{st}</span>
                                        {onlineCount > 0 && (
                                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black animate-pulse">
                                                {onlineCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
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
                    {paginatedStudents.length > 0 ? paginatedStudents.map((student) => {
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

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <p className="text-[8px] font-black text-slate-400 dark:text-yellow-400/40 uppercase tracking-[0.2em] leading-none mb-1.5">Class</p>
                                        <p className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{student.class}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <p className="text-[8px] font-black text-slate-400 dark:text-yellow-400/40 uppercase tracking-[0.2em] leading-none mb-1.5">Status</p>
                                        <span className={cn(
                                            "text-[8px] font-black uppercase px-2.5 py-1 rounded-lg inline-block shadow-sm",
                                            (student.status === 'Passed Out' || student.status === 'Alumni')
                                                ? 'bg-purple-600 text-white'
                                                : (student.status === 'Online Applied' || student.status === 'Pending Verification')
                                                    ? 'bg-sky-500 text-white animate-pulse'
                                                    : student.status === 'Active'
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-amber-500 text-white'
                                        )}>
                                            {(student.status === 'Passed Out' || student.status === 'Alumni')
                                                ? `🎓 Passed Out ${student.graduatedYear ? `(${student.graduatedYear})` : ''}`
                                                : (student.status === 'Online Applied' || student.status === 'Pending Verification')
                                                    ? '🌐 Online Applied'
                                                    : student.status}
                                        </span>
                                    </div>
                                </div>

                                {(student.status === 'Online Applied' || student.status === 'Pending Verification') && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleApproveOnlineStudent(student);
                                        }}
                                        className="w-full mb-4 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-wider shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-yellow-300" /> ✅ Approve & Enroll Online Student
                                    </button>
                                )}

                                 {(student.status === 'Passed Out' || student.status === 'Inactive' || student.class?.includes('10th') || student.class?.includes('Matric')) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenReAdmit(student);
                                        }}
                                        className="w-full mb-4 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-wider shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        <GraduationCap className="w-3.5 h-3.5" /> ⚡ Re-Admit to College (1st Year)
                                    </button>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5" onClick={(e) => e.stopPropagation()}>
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
                                        checked={selectedIds.length === paginatedStudents.length && paginatedStudents.length > 0}
                                        onChange={(e) => e.target.checked ? setSelectedIds(paginatedStudents.map(s => s.id)) : setSelectedIds([])}
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
                            {paginatedStudents.map((student) => {
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
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block",
                                                (student.status === 'Passed Out' || student.status === 'Alumni')
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                                    : (student.status === 'Online Applied' || student.status === 'Pending Verification')
                                                        ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 animate-pulse'
                                                        : student.status === 'Active'
                                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                            : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300'
                                            )}>
                                                {(student.status === 'Passed Out' || student.status === 'Alumni')
                                                    ? `🎓 Passed Out ${student.graduatedYear ? `(${student.graduatedYear})` : ''}`
                                                    : (student.status === 'Online Applied' || student.status === 'Pending Verification')
                                                        ? '🌐 Online Applied'
                                                        : student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right sticky right-0 bg-white dark:bg-[#001a33]">
                                            <div className="flex items-center justify-end gap-2">
                                                {(student.status === 'Online Applied' || student.status === 'Pending Verification') && (
                                                    <button
                                                        onClick={() => handleApproveOnlineStudent(student)}
                                                        title="✅ Approve & Enroll Online Student"
                                                        className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors group relative"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 group-hover:scale-125 transition-transform text-emerald-600" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenReAdmit(student)}
                                                    title="⚡ 1-Click Re-Admit / Promote to College (1st Year)"
                                                    className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg transition-colors group relative"
                                                >
                                                    <GraduationCap className="w-4 h-4 group-hover:scale-125 transition-transform" />
                                                </button>
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

                {/* Pagination Controls */}
                {filteredStudents.length > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-[#001529] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>Showing <span className="text-[#003366] dark:text-yellow-400 font-black">{Math.min((currentPage - 1) * pageSize + 1, filteredStudents.length)}</span> to <span className="text-[#003366] dark:text-yellow-400 font-black">{Math.min(currentPage * pageSize, filteredStudents.length)}</span> of <span className="text-[#003366] dark:text-yellow-400 font-black">{filteredStudents.length}</span> students</span>
                            <span className="hidden sm:inline text-slate-300 dark:text-white/10">•</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400">Per page:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className="bg-slate-50 dark:bg-[#000d1a] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-black outline-none cursor-pointer"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                title="First Page"
                            >
                                <ChevronsLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                title="Previous Page"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            </button>

                            <div className="px-3 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-black min-w-[70px] text-center shadow-md shadow-brand-primary/20">
                                {currentPage} / {totalPages}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                title="Next Page"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                title="Last Page"
                            >
                                <ChevronsRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>
                    </div>
                )}
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
                                            onClick={() => setSelectedCampus(c.name)}
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
                                            settings.logo1 ? "bg-transparent" : "bg-[#0d3b3b] shadow-inner"
                                        )}>
                                            {settings.logo1 ? (
                                                <img src={settings.logo1} className="w-full h-full object-contain drop-shadow-2xl" alt="School Logo" />
                                            ) : (
                                                <GraduationCap className="w-16 h-16 text-yellow-400 opacity-80" />
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
                                            settings.logo2 ? "bg-transparent" : "bg-[#1e3a5f] shadow-inner"
                                        )}>
                                            {settings.logo2 ? (
                                                <img src={settings.logo2} className="w-full h-full object-contain drop-shadow-2xl" alt="College Logo" />
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

            {/* Executive Re-Admission & College Promotion Modal */}
            <AnimatePresence>
                {reAdmittingStudent && (
                    <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 15 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-[#071322] border border-slate-200 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="shrink-0 relative bg-gradient-to-r from-purple-700 via-indigo-700 to-[#003366] p-4 sm:p-6 text-white overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                                <div className="relative z-10 flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-xl overflow-hidden">
                                            {reAdmittingStudent.avatar && reAdmittingStudent.avatar.length > 5 ? (
                                                <img src={reAdmittingStudent.avatar} alt={reAdmittingStudent.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <GraduationCap className="w-7 h-7 text-yellow-300" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 backdrop-blur-md rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-yellow-300 mb-0.5">
                                                <span>⚡ 1-Click Fast Re-Admission</span>
                                            </div>
                                            <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                                                {reAdmittingStudent.name}
                                            </h3>
                                            <p className="text-[10px] sm:text-xs text-white/80 font-medium">
                                                S/O {reAdmittingStudent.fatherName || 'N/A'} • Prev: <span className="font-bold text-white">{reAdmittingStudent.class}</span> ({reAdmittingStudent.campus || 'Main Campus'})
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setReAdmittingStudent(null)}
                                        className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all shrink-0"
                                    >
                                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar overscroll-contain">
                                {/* Step 1: Select Target College Class */}
                                <div>
                                    <label className="block text-[10px] sm:text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                                        1. Select Target College Class
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {['1st Year (Boys)', '1st Year (Girls)', '2nd Year (Boys)', '2nd Year (Girls)'].map((cls) => (
                                            <button
                                                key={cls}
                                                type="button"
                                                onClick={() => setReAdmitClass(cls)}
                                                className={cn(
                                                    "px-2.5 py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all border text-center flex flex-col items-center justify-center gap-0.5",
                                                    reAdmitClass === cls
                                                        ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/30 scale-[1.02]"
                                                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/5 hover:border-purple-400"
                                                )}
                                            >
                                                <span>{cls}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Step 2: Choose Academic Discipline / Stream */}
                                <div>
                                    <label className="block text-[10px] sm:text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                                        2. Choose College Discipline / Stream
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {[
                                            { id: 'FSc Pre-Medical', title: 'FSc Pre-Medical', emoji: '🩺', desc: 'Biology • Chemistry • Physics' },
                                            { id: 'FSc Pre-Engineering', title: 'FSc Pre-Engineering', emoji: '⚙️', desc: 'Math • Chemistry • Physics' },
                                            { id: 'ICS', title: 'ICS (Computer Science)', emoji: '💻', desc: 'Computer • Math • Physics/Stats' },
                                            { id: 'I.Com', title: 'I.Com (Commerce)', emoji: '💼', desc: 'Accounting • Commerce • Economics' },
                                            { id: 'FA', title: 'FA (Arts & Humanities)', emoji: '🎨', desc: 'Civics • Islamic Studies • Arts' },
                                            { id: 'General Science', title: 'General Science', emoji: '🔬', desc: 'Statistics • Math • Physics' },
                                        ].map((stream) => {
                                            const isSelected = reAdmitDiscipline === stream.id;
                                            return (
                                                <button
                                                    key={stream.id}
                                                    type="button"
                                                    onClick={() => setReAdmitDiscipline(stream.id)}
                                                    className={cn(
                                                        "p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all relative overflow-hidden flex items-center gap-3",
                                                        isSelected
                                                            ? "bg-purple-50 dark:bg-purple-950/40 border-purple-600 dark:border-purple-500 shadow-sm ring-2 ring-purple-600/30"
                                                            : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                                                    )}
                                                >
                                                    <span className="text-xl sm:text-2xl shrink-0">{stream.emoji}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span className={cn("text-[11px] sm:text-xs font-black uppercase tracking-tight truncate", isSelected ? "text-purple-900 dark:text-purple-200" : "text-slate-800 dark:text-slate-200")}>
                                                                {stream.title}
                                                            </span>
                                                            {isSelected && (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                                            {stream.desc}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Step 3: Fee Setup */}
                                <div>
                                    <label className="block text-[10px] sm:text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                                        3. Fee Structure Setup
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/5">
                                        <div>
                                            <span className="block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                                Monthly Tuition Fee (₨)
                                            </span>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-black text-xs">
                                                    ₨
                                                </div>
                                                <input
                                                    type="number"
                                                    value={reAdmitMonthly}
                                                    onChange={(e) => setReAdmitMonthly(Number(e.target.value))}
                                                    placeholder="3500"
                                                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-slate-800 dark:text-white outline-none focus:border-purple-600 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <span className="block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                                Admission / Re-Enroll Fee (₨)
                                            </span>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-black text-xs">
                                                    ₨
                                                </div>
                                                <input
                                                    type="number"
                                                    value={reAdmitAdmission}
                                                    onChange={(e) => setReAdmitAdmission(Number(e.target.value))}
                                                    placeholder="0"
                                                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-slate-800 dark:text-white outline-none focus:border-purple-600 transition-colors"
                                                />
                                            </div>
                                            <p className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">Set 0 for free internal promotion</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="shrink-0 p-3.5 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-white/5 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setReAdmittingStudent(null)}
                                    className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmReAdmit}
                                    className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#003366] hover:from-purple-700 hover:to-indigo-700 text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
                                >
                                    <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    Confirm Re-Admission
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
