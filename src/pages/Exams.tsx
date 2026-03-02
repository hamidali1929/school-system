import { useState, useRef, useEffect } from 'react';
import {
    Plus, Trophy, BookOpen, Users, Calendar,
    CheckCircle2, AlertCircle, Trash2, Medal, Calculator, Save,
    Printer, Award, Star, ClipboardList, MessageSquare, Share2, Edit2,
    FileDown, FileUp
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../context/StoreContext';
import { MESSAGE_TEMPLATES } from '../utils/whatsapp';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';

export const Exams = () => {
    const {
        exams, examResults, addExam, updateExam, deleteExam,
        inputMarks, finalizeResults, classes,
        classSubjects, students, currentUser,
        settings, teachers, sendNotification, subjectTotalMarks
    } = useStore();

    const userProfile = teachers.find(t => t.id === currentUser?.id);
    const isAdmin = currentUser?.role === 'admin';
    const canManageSpecialAwards = isAdmin;
    const canFinalizeResults = isAdmin || userProfile?.permissions?.includes('results_manage');
    const canManageSessions = isAdmin;

    const [activeTab, setActiveTab] = useState<'manage' | 'marks' | 'results' | 'top' | 'custom'>('manage');
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(currentUser?.role === 'teacher' && currentUser?.inchargeClass ? currentUser.inchargeClass : null);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [certificateData, setCertificateData] = useState<null | Record<string, any>>(null);
    const [customCert, setCustomCert] = useState({
        name: '',
        category: '',
        position: '',
        event: '',
        date: new Date().toLocaleDateString()
    });

    const [selectedResults, setSelectedResults] = useState<string[]>([]);
    const certificateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedResults([]);
    }, [selectedExamId, selectedClass, selectedCampus]);

    const handleCreateExam = async () => {
        const h = document.documentElement.classList.contains('dark');
        const { value: formValues } = await Swal.fire({
            title: 'Create New Academic Exam',
            background: h ? 'var(--glass-bg)' : '#ffffff',
            color: h ? 'var(--brand-accent)' : '#0f172a',
            html: `
                <div class="text-left font-outfit space-y-4">
                    <div>
                        <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} tracking-widest block mb-1">Exam Name</label>
                        <input id="swal-exam-name" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${h ? '!bg-white/5 !border-brand-accent/20 !text-brand-accent' : ''}" placeholder="e.g. First Term 2026">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} tracking-widest block mb-1">Academic Session</label>
                        <input id="swal-exam-session" value="${settings.academicSession || '2025-2026'}" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${h ? '!bg-white/5 !border-brand-accent/20 !text-brand-accent' : ''}" placeholder="e.g. 2025-2026">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} tracking-widest block mb-1">Select Classes</label>
                        <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border ${h ? 'border-brand-accent/10 bg-brand-accent/5' : 'border-slate-100'} rounded-[var(--brand-radius,1rem)]" id="classes-chips">
                            ${classes.map(c => `
                                <label class="flex items-center gap-2 p-2 ${h ? 'hover:bg-brand-accent/10' : 'hover:bg-slate-50'} rounded-lg cursor-pointer">
                                    <input type="checkbox" name="exam-classes" value="${c}" class="accent-brand-primary">
                                    <span class="text-xs font-bold ${h ? 'text-brand-accent' : 'text-slate-600'}">${c}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `,
            confirmButtonText: 'Initialize Exam',
            confirmButtonColor: 'var(--brand-primary)',
            showCancelButton: true,
            preConfirm: () => {
                const name = (document.getElementById('swal-exam-name') as HTMLInputElement).value;
                const session = (document.getElementById('swal-exam-session') as HTMLInputElement).value;
                const checkedClasses = Array.from(document.querySelectorAll('input[name="exam-classes"]:checked'))
                    .map(el => (el as HTMLInputElement).value);

                if (!name) { Swal.showValidationMessage('Name is required'); return null; }
                if (checkedClasses.length === 0) { Swal.showValidationMessage('Select at least one class'); return null; }

                return { name, session, classes: checkedClasses };
            }
        });

        if (formValues) {
            addExam(formValues);
            Swal.fire({
                title: 'Exam Created',
                text: 'The academic session has been successfully initialized.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false,
                background: h ? 'var(--glass-bg)' : '#ffffff',
                color: h ? 'var(--brand-accent)' : '#0f172a',
            });
        }
    };

    const handleEditExam = async (exam: any) => {
        const h = document.documentElement.classList.contains('dark');
        const { value: formValues } = await Swal.fire({
            title: 'Edit Academic Exam',
            background: h ? 'var(--glass-bg)' : '#ffffff',
            color: h ? 'var(--brand-accent)' : '#0f172a',
            html: `
                <div class="text-left font-outfit space-y-4">
                    <div>
                        <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} tracking-widest block mb-1">Exam Name</label>
                        <input id="swal-exam-name-edit" value="${exam.name}" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${h ? '!bg-white/5 !border-brand-accent/20 !text-brand-accent' : ''}" placeholder="e.g. First Term 2026">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} tracking-widest block mb-1">Academic Session</label>
                        <input id="swal-exam-session-edit" value="${exam.session || settings.academicSession || '2025-2026'}" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${h ? '!bg-white/5 !border-brand-accent/20 !text-brand-accent' : ''}" placeholder="e.g. 2025-2026">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} tracking-widest block mb-1">Select Classes</label>
                        <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border ${h ? 'border-brand-accent/10 bg-brand-accent/5' : 'border-slate-100'} rounded-[var(--brand-radius,1rem)]" id="classes-chips-edit">
                            ${classes.map(c => `
                                <label class="flex items-center gap-2 p-2 ${h ? 'hover:bg-brand-accent/10' : 'hover:bg-slate-50'} rounded-lg cursor-pointer">
                                    <input type="checkbox" name="exam-classes-edit" value="${c}" class="accent-brand-primary" ${exam.classes.includes(c) ? 'checked' : ''}>
                                    <span class="text-xs font-bold ${h ? 'text-brand-accent' : 'text-slate-600'}">${c}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `,
            confirmButtonText: 'Save Changes',
            confirmButtonColor: 'var(--brand-primary)',
            showCancelButton: true,
            preConfirm: () => {
                const name = (document.getElementById('swal-exam-name-edit') as HTMLInputElement).value;
                const session = (document.getElementById('swal-exam-session-edit') as HTMLInputElement).value;
                const checkedClasses = Array.from(document.querySelectorAll('input[name="exam-classes-edit"]:checked'))
                    .map(el => (el as HTMLInputElement).value);

                if (!name) { Swal.showValidationMessage('Name is required'); return null; }
                if (checkedClasses.length === 0) { Swal.showValidationMessage('Select at least one class'); return null; }

                return { name, session, classes: checkedClasses };
            }
        });

        if (formValues) {
            updateExam(exam.id, formValues);
            Swal.fire({
                title: 'Exam Updated',
                text: 'The academic session has been successfully updated.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false,
                background: h ? 'var(--glass-bg)' : '#ffffff',
                color: h ? 'var(--brand-accent)' : '#0f172a',
            });
        }
    };

    const handleDeleteExam = (id: string) => {
        const h = document.documentElement.classList.contains('dark');
        Swal.fire({
            title: 'Delete Exam?',
            text: "This will permanently remove all marks and results for this exam session.",
            icon: 'warning',
            background: h ? 'var(--glass-bg)' : '#ffffff',
            color: h ? 'var(--brand-accent)' : '#0f172a',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            confirmButtonText: 'Yes, Delete Systematically'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteExam(id);
                Swal.fire({
                    title: 'Deleted',
                    text: 'Exam records purged.',
                    icon: 'success',
                    background: h ? 'var(--glass-bg)' : '#ffffff',
                    color: h ? 'var(--brand-accent)' : '#0f172a',
                });
            }
        });
    };

    const handleFinalize = (examId: string, className: string) => {
        const h = document.documentElement.classList.contains('dark');
        Swal.fire({
            title: 'Execute Ranking Protocol?',
            text: `System will calculate totals, grades, and assign positions for ${className}.`,
            icon: 'info',
            background: h ? 'var(--glass-bg)' : '#ffffff',
            color: h ? 'var(--brand-accent)' : '#0f172a',
            showCancelButton: true,
            confirmButtonColor: 'var(--brand-primary)',
            confirmButtonText: 'Start Execution'
        }).then((result) => {
            if (result.isConfirmed) {
                if (!canFinalizeResults) {
                    Swal.fire({
                        title: 'Access Denied',
                        text: 'Only administrators or designated managers can finalize results.',
                        icon: 'error',
                        background: h ? 'var(--glass-bg)' : '#ffffff',
                        color: h ? 'var(--brand-accent)' : '#0f172a',
                    });
                    return;
                }
                finalizeResults(examId, className);
                Swal.fire({
                    title: 'Completed',
                    text: 'Results finalized with automated ranking.',
                    icon: 'success',
                    background: h ? 'var(--glass-bg)' : '#ffffff',
                    color: h ? 'var(--brand-accent)' : '#0f172a',
                });
                setActiveTab('results');
            }
        });
    };

    const generateResultCardHTML = (student: any, result: any, exam: any, settings: any, allClassSubjects: string[]) => {
        // Sanitize colors to avoid 'oklch' parser errors in html2pdf (common in Tailwind 4)
        const sanitizeColor = (color: any, fallback: string) => {
            if (!color || typeof color !== 'string') return fallback;
            // If it's an oklch color, fallback to a safe hex version
            if (color.includes('oklch')) return fallback;
            return color;
        };

        const primaryColor = sanitizeColor(settings.themeColors?.primary, '#003366');
        const accentColor = sanitizeColor(settings.themeColors?.accent, '#fbbf24');

        return `
            <html>
                <head>
                    <title>Official Performance Transcript - ${student.name}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Outfit:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap" rel="stylesheet">
                    <style>
                        html, body {
                            background-color: #ffffff !important;
                            color: #1e293b !important;
                        }
                        :root {
                            --brand-primary: ${primaryColor};
                            --brand-accent: ${accentColor};
                        }
                        
                        * { 
                            box-sizing: border-box; 
                            -webkit-print-color-adjust: exact; 
                            font-weight: bold !important;
                            /* Force fallback for modern Tailwind variables that use oklch */
                            --tw-ring-color: rgba(0,0,0,0) !important;
                            --tw-shadow-color: rgba(0,0,0,0) !important;
                            --tw-outline-color: rgba(0,0,0,0) !important;
                        }
                        body { 
                            margin: 0; padding: 0; 
                            font-family: 'Times New Roman', Times, serif; 
                            font-weight: bold;
                            background: white; 
                            color: #1e293b;
                        }
                        
                        @page { size: A4; margin: 0; }

                        .page-container {
                            width: 210mm;
                            height: 297mm;
                            background: white;
                            padding: 10mm;
                            position: relative;
                            overflow: hidden;
                        }

                        /* Institutional Frame */
                        .outer-frame {
                            height: 100%;
                            width: 100%;
                            border: 1.5mm solid var(--brand-primary);
                            border-radius: 8mm;
                            padding: 1.5mm;
                            position: relative;
                            display: flex;
                            flex-direction: column;
                        }
                        
                        .inner-frame {
                            height: 100%;
                            width: 100%;
                            border: 0.5mm solid var(--brand-primary);
                            border-radius: 6.5mm;
                            padding: 6mm;
                            display: flex;
                            flex-direction: column;
                            position: relative;
                            background: white;
                            overflow: hidden;
                        }

                        .header {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            margin-bottom: 6mm;
                            border-bottom: 3px double var(--brand-primary);
                            padding-bottom: 4mm;
                        }

                        .logo-container {
                            width: 30mm;
                            height: 30mm;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .logo-container img {
                            max-width: 100%;
                            max-height: 100%;
                            object-fit: contain;
                        }

                        .school-info {
                            text-align: center;
                            flex: 1;
                        }
                        .school-info h1 {
                            margin: 0;
                            font-family: 'Times New Roman', Times, serif;
                            font-weight: bold;
                            font-size: 28pt;
                            color: var(--brand-primary);
                            text-transform: uppercase;
                            letter-spacing: -0.5px;
                        }
                        .school-info p {
                            margin: 1mm 0 0;
                            font-size: 9.5pt;
                            font-weight: 900;
                            color: #000000;
                            text-transform: uppercase;
                            letter-spacing: 2.5px;
                        }

                        .document-banner {
                            background: var(--brand-primary);
                            color: white;
                            text-align: center;
                            padding: 3mm;
                            font-family: 'Times New Roman', Times, serif;
                            font-weight: bold;
                            font-size: 13pt;
                            letter-spacing: 4px;
                            margin-bottom: 6mm;
                            border-radius: 8px;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        }

                        /* Student Profile */
                        .profile-section {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 3mm;
                            margin-bottom: 6mm;
                        }
                        .profile-item {
                            background: #f8fafc;
                            padding: 8px 12px;
                            border-radius: 10px;
                            border: 1px solid #e2e8f0;
                        }
                        .profile-item label {
                            font-size: 8pt;
                            font-weight: 800;
                            color: #475569;
                            text-transform: uppercase;
                            display: block;
                            margin-bottom: 2px;
                        }
                        .profile-item span {
                            font-size: 11.5pt;
                            font-weight: 900;
                            color: #0f172a;
                            display: block;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }

                        /* Result Table */
                        .table-wrapper {
                            flex: 1;
                            margin-bottom: 6mm;
                        }
                        table {
                            width: 100%;
                            border-collapse: separate;
                            border-spacing: 0;
                            border: 2px solid #0f172a;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                        }
                        th {
                            background: #f1f5f9;
                            color: var(--brand-primary);
                            font-size: 8.5pt;
                            font-weight: 800;
                            text-transform: uppercase;
                            padding: 10px;
                            border-bottom: 2px solid #0f172a;
                            border-right: 2px solid #0f172a;
                            text-align: center;
                        }
                        th:last-child { border-right: none; }
                        td {
                            padding: 8px 10px;
                            font-size: 9.5pt;
                            font-weight: 600;
                            border-bottom: 2px solid #0f172a;
                            border-right: 2px solid #0f172a;
                            text-align: center;
                        }
                        td:last-child { border-right: none; }
                        tr:last-child td { border-bottom: none; }
                        .subject-name {
                            text-align: left;
                            font-weight: 800;
                            color: var(--brand-primary);
                            background: #fcfdfe;
                        }

                        .bar-container {
                            width: 100%;
                            max-width: 120px;
                            height: 6px;
                            background: #e2e8f0;
                            border-radius: 10px;
                            overflow: hidden;
                            margin: 4px auto;
                        }
                        .bar-fill { height: 100%; border-radius: 10px; }

                        .grade-badge {
                            background: var(--brand-primary);
                            color: white;
                            padding: 2px 8px;
                            border-radius: 4px;
                            font-weight: 900;
                        }

                        /* Summary Metrics */
                        .summary-grid {
                            display: grid;
                            grid-template-columns: 1.2fr 1fr;
                            gap: 15px;
                            margin-bottom: 6mm;
                        }
                        .summary-box {
                            border: 2px solid var(--brand-primary);
                            border-radius: 15px;
                            padding: 12px 20px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            background: linear-gradient(to right, white, #f8fafc);
                        }
                        .summary-label { font-size: 8pt; font-weight: 800; color: #64748b; text-transform: uppercase; }
                        .summary-value { font-size: 22pt; font-weight: 900; color: var(--brand-primary); }
                        .summary-accent { font-size: 26pt; font-weight: 900; color: var(--brand-accent); }

                        .remarks-area {
                            background: #fffbeb;
                            border-left: 5px solid var(--brand-accent);
                            padding: 12px 20px;
                            border-radius: 0 12px 12px 0;
                            margin-bottom: 10mm;
                        }
                        .remarks-area h4 { margin: 0 0 4px; font-size: 8pt; color: #92400e; text-transform: uppercase; }
                        .remarks-area p { margin: 0; font-size: 10.5pt; font-weight: 600; font-style: italic; color: #451a03; }

                        /* Signatures */
                        .signature-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                            padding: 0 10mm;
                            margin-top: auto;
                        }
                        .sig-block { text-align: center; width: 45mm; }
                        .sig-line { border-top: 1.5px solid var(--brand-primary); margin-bottom: 5px; opacity: 0.5; }
                        .sig-label { font-size: 8pt; font-weight: 800; color: #64748b; text-transform: uppercase; }

                        .seal-box {
                            width: 70px; height: 70px;
                            border: 1px dashed var(--brand-primary);
                            border-radius: 50%;
                            display: flex; align-items: center; justify-content: center;
                            font-size: 7px; color: var(--brand-primary); opacity: 0.2;
                            text-align: center; line-height: 1.2;
                        }

                        .watermark {
                            position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%);
                            width: 140mm; height: 140mm; opacity: 0.04; pointer-events: none;
                        }

                        .qr-code {
                            position: absolute; bottom: 8mm; left: 8mm;
                            width: 15mm; height: 15mm;
                            border: 1px solid #e2e8f0;
                        }
                    </style>
                </head>
                <body>
                    <div class="page-container">
                        <div class="outer-frame">
                            <div class="inner-frame">
                                <img src="${settings.logo1 || ''}" class="watermark">
                                
                                <div class="header">
                                    <div class="logo-container">
                                        <img src="${settings.logo1 || ''}">
                                    </div>
                                    <div class="school-info">
                                        <h1>${(settings.schoolName || "PIONEER'S SUPERIOR").replace(/['"”’]+/g, "'")}</h1>
                                        <p>${settings.subTitle || 'Institute of Higher Secondary Education'}</p>
                                        ${student.campus ? `<div style="display: inline-block; background: #0f172a; color: #fff; padding: 4px 16px; border-radius: 20px; font-size: 9pt; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.2);">${student.campus}</div>` : ''}
                                        <div style="font-size: 14pt; font-weight: 800; color: var(--brand-primary); margin-top: 5px; text-transform: uppercase;">${exam.name}</div>
                                    </div>
                                    <div class="logo-container">
                                        <img src="${settings.logo2 || settings.logo1 || ''}">
                                    </div>
                                </div>

                                <div class="document-banner">STUDENT PROGRESS REPORT CARD</div>
                                
                                <div style="text-align: center; margin-bottom: 4mm; margin-top: 2mm;">
                                    <h2 style="margin: 0; font-size: 26pt; font-weight: 900; color: var(--brand-primary); text-transform: uppercase; letter-spacing: 1px;">${student.name}</h2>
                                </div>

                                <div class="profile-section" style="grid-template-columns: repeat(4, 1fr);">
                                    <div class="profile-item"><label>Father Name</label><span>${student.fatherName || '---'}</span></div>
                                    <div class="profile-item"><label>Admission No</label><span>${student.admissionId || student.id}</span></div>
                                    <div class="profile-item"><label>Class</label><span>${result.className}</span></div>
                                    <div class="profile-item"><label>Session</label><span>${exam.session || settings.academicSession || '2025-2026'}</span></div>
                                </div>

                                <div class="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style="width: 35%; text-align: left">Subject Title</th>
                                                <th style="width: 12%">Total</th>
                                                <th style="width: 12%">Obtained</th>
                                                <th style="width: 15%">Pass %</th>
                                                <th style="width: 15%">Performance</th>
                                                <th style="width: 11%">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${allClassSubjects.filter(subName => {
            const m = result.marks[subName];
            return m && m.obtained !== undefined && m.obtained !== '';
        }).map(subName => {
            const m = result.marks[subName];
            const perc = (m.obtained / m.total) * 100;
            const barColor = perc >= 80 ? '#10b981' : perc >= 60 ? '#3b82f6' : perc >= 40 ? '#f59e0b' : '#ef4444';
            let g = 'F';
            if (perc >= 96) g = 'A++'; else if (perc >= 91) g = 'A+'; else if (perc >= 86) g = 'A';
            else if (perc >= 81) g = 'B++'; else if (perc >= 76) g = 'B+'; else if (perc >= 71) g = 'B';
            else if (perc >= 61) g = 'C+'; else if (perc >= 51) g = 'C'; else if (perc >= 40) g = 'D';

            return `
                                                    <tr>
                                                        <td class="subject-name">${subName}</td>
                                                        <td style="font-weight: 900; color: #0f172a; font-size: 10.5pt;">${m.total}</td>
                                                        <td style="font-weight: 900; color: #0f172a; font-size: 10.5pt;">${m.obtained}</td>
                                                        <td style="font-weight: 900; color: #64748b; font-size: 10.5pt;">${perc.toFixed(0)}%</td>
                                                        <td>
                                                            <div class="bar-container"><div class="bar-fill" style="width: ${perc}%; background: ${barColor}"></div></div>
                                                        </td>
                                                        <td><span class="grade-badge">${g}</span></td>
                                                      </tr>
                                                `;
        }).join('')}
                                        </tbody>
                                    </table>
                                </div>

                                <div class="summary-grid">
                                    <div class="summary-box">
                                        <div><div class="summary-label">Total Marks</div><div class="summary-value">${result.totalObtained} <span style="font-size: 15pt; opacity: 0.8; font-weight: 900;">/ ${result.totalPossible}</span></div></div>
                                        <div style="text-align: right"><div class="summary-label">Percentage</div><div class="summary-accent">${result.percentage.toFixed(1)}%</div></div>
                                    </div>
                                    <div class="summary-box" style="display: flex; flex-direction: column; align-items: stretch; gap: 4px; padding: 10px 15px;">
                                        ${result.position && result.position <= 3 ? `
                                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 2px;">
                                                <span class="summary-label" style="font-size: 7pt;">Class Position</span>
                                                <span style="font-size: 13pt; color: var(--brand-accent); font-weight: 900;">#${result.position}</span>
                                            </div>
                                        ` : ''}
                                        ${(!result.position || result.position > 3) ? `
                                            <div style="display: flex; justify-content: space-between; align-items: center; height: 100%;">
                                                <span class="summary-label">Position</span>
                                                <span class="summary-value" style="font-size: 18pt; opacity: 0.5;">---</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="summary-box">
                                        <div><div class="summary-label">Grade</div><div class="summary-accent" style="color: var(--brand-primary); font-size: 28pt;">${result.grade}</div></div>
                                        <div style="text-align: right">
                                            <div class="summary-label">Status</div>
                                            <div style="font-size: 14pt; font-weight: 900; color: ${result.percentage >= 40 ? '#10b981' : '#ef4444'}">${result.percentage >= 40 ? 'PASSED' : 'FAILED'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; margin-bottom: 10mm; padding-right: 10mm; padding-left: 0;">
                                    <div class="remarks-area" style="margin-bottom: 0; width: fit-content; min-width: 200px; max-width: 60%; padding-right: 40px;">
                                        <h4>Remarks</h4>
                                        <p>${result.remarks || 'Pending Finalization'}</p>
                                    </div>
                                    <div class="sig-block" style="margin-bottom: 5px;"><div class="sig-line"></div><div class="sig-label">Academic Incharge</div></div>
                                </div>

                                <div class="signature-row" style="justify-content: space-between; margin-top: 0;">
                                    <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Director</div></div>
                                    <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Principal</div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `;
    };

    const handlePrintResultCard = (data: any) => {
        const { student, result, exam } = data;
        if (!student || !result || !exam) return;

        const WindowPrt = window.open('', '', 'left=0,top=0,width=1000,height=1200,toolbar=0,scrollbars=0,status=0');
        if (!WindowPrt) return;

        // Ensure we get all subjects for the class to show them even if marks are missing
        const classTitle = result.className;
        const allClassSubjects = classSubjects[classTitle] || Object.keys(result.marks || {});

        WindowPrt.document.write(generateResultCardHTML(student, result, exam, settings, allClassSubjects));
        WindowPrt.document.write(`
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.onafterprint = function() { window.close(); };
                    }, 800);
                };
            </script>
        `);
        WindowPrt.document.close();
    };

    const handleExportMarks = () => {
        if (!selectedExamId || !selectedClass) {
            Swal.fire({ title: 'Selections Required', text: 'Select an exam and class to export marks template.', icon: 'warning' });
            return;
        }

        const exam = exams.find(e => e.id === selectedExamId);
        const subjects = classSubjects[selectedClass] || [];
        const relevantStudents = students.filter(s => s.class === selectedClass && (!selectedCampus || s.campus === selectedCampus));

        const data = relevantStudents.map(student => {
            const result = examResults.find(r => r.studentId === student.id && r.examId === selectedExamId);
            const row: any = {
                'Student ID': student.id,
                'Name': student.name,
                ' फादर नेम (Father Name)': student.fatherName || '',
                'Campus': student.campus || ''
            };

            subjects.forEach(subject => {
                const markData = result?.marks?.[subject];
                row[`${subject} (Obtained)`] = markData?.obtained ?? '';
                row[`${subject} (Total)`] = markData?.total ?? subjectTotalMarks?.[selectedClass]?.[subject] ?? 100;
            });

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Marks");
        XLSX.writeFile(wb, `Marks_${selectedClass}_${exam?.name || 'Exam'}.xlsx`);

        Swal.fire({ title: 'Exported', text: 'Marks template downloaded successfully.', icon: 'success', toast: true, position: 'top-end', timer: 3000 });
    };

    const handleImportMarks = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedExamId || !selectedClass) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const wsname = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[wsname];
                const json = XLSX.utils.sheet_to_json(worksheet) as any[];

                let importCount = 0;
                json.forEach(row => {
                    const studentId = row['Student ID'];
                    if (!studentId) return;

                    Object.keys(row).forEach(key => {
                        if (key.endsWith(' (Obtained)')) {
                            const subject = key.replace(' (Obtained)', '');
                            const obtained = row[key];
                            const total = row[`${subject} (Total)`];
                            if (obtained !== undefined && obtained !== '') {
                                inputMarks(selectedExamId, selectedClass, studentId, subject, obtained, total);
                                importCount++;
                            }
                        }
                    });
                });

                Swal.fire({
                    title: 'Import Complete',
                    text: `Successfully updated marks for ${importCount} subject entries.`,
                    icon: 'success'
                });
                // Reset file input
                event.target.value = '';
            } catch (err) {
                console.error(err);
                Swal.fire({ title: 'Import Failed', text: 'Ensure the file matches the exported template format.', icon: 'error' });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSendWhatsAppResult = async (data: { student: any, result: any, exam: any }, silent = false) => {
        const { student, exam } = data;
        let { result } = data;
        if (!student || !result || !exam) return Promise.reject('Missing data');

        // Robust calculation: If result isn't finalized, calculate stats on-the-fly
        const marks = Object.values(result.marks || {}) as { obtained: number, total: number }[];
        const totalObtained = marks.reduce((sum, m) => sum + (Number(m.obtained) || 0), 0);
        const totalPossible = marks.reduce((sum, m) => sum + (Number(m.total) || 0), 0);
        const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;

        // Dynamic Grade
        let grade = result.grade || 'F';
        if (!result.grade || result.grade === 'F') {
            if (percentage >= 96) grade = 'A++';
            else if (percentage >= 91) grade = 'A+';
            else if (percentage >= 86) grade = 'A';
            else if (percentage >= 81) grade = 'B++';
            else if (percentage >= 76) grade = 'B+';
            else if (percentage >= 71) grade = 'B';
            else if (percentage >= 61) grade = 'C+';
            else if (percentage >= 51) grade = 'C';
            else if (percentage >= 40) grade = 'D';
        }

        // Clone result with calculated values for perfect PDF rendering
        const finalResult = {
            ...result,
            totalObtained: result.totalObtained || totalObtained,
            totalPossible: result.totalPossible || totalPossible,
            percentage: result.percentage || percentage,
            grade: grade
        };

        const allClassSubjects = classSubjects[finalResult.className] || Object.keys(finalResult.marks || {});
        const htmlContent = generateResultCardHTML(student, finalResult, exam, settings, allClassSubjects);

        if (!silent) {
            Swal.fire({
                title: 'Quantum Dispatch...',
                text: 'Preparing high-resolution transcript',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
        }

        // Create a temporary container that is actually visible (off-screen)
        // This is crucial for html-to-image to capture everything correctly
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-2000vw'; // Very far off-screen
        container.style.top = '0';
        container.style.width = '210mm';
        // We use a wrapper to ensure no external styles bleed in
        container.innerHTML = `
            <div id="pdf-export-root" style="background: white; width: 210mm; min-height: 297mm; padding: 0; margin: 0;">
                ${htmlContent}
            </div>
        `;
        document.body.appendChild(container);

        try {
            // Wait for internal assets (logo, fonts, etc)
            await new Promise(r => setTimeout(r, 2000));

            const exportNode = document.getElementById('pdf-export-root');
            if (!exportNode) throw new Error('Render node not found');

            // Advanced pixel capture
            const dataUrl = await htmlToImage.toPng(exportNode, {
                quality: 1.0,
                pixelRatio: 2, // High density (retina) but stays within payload limits
                backgroundColor: '#ffffff',
                skipAutoScale: true
            });

            // Cleanup DOM
            document.body.removeChild(container);

            // Construct PDF using jsPDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            const pdfBase64 = pdf.output('datauristring');

            const msg = `⭐ *OFFICIAL ACADEMIC TRANSCRIPT* ⭐\n\nDear Parent/Guardian,\n\nWe are pleased to share the comprehensive performance evaluation for *${student.name}* regarding the *${exam.name}* session at *${settings.schoolName}*.\n\n📊 *PERFORMANCE SUMMARY:*\n━━━━━━━━━━━━━━━━━━━━\n🔹 *Aggregate Score:* ${finalResult.totalObtained} / ${finalResult.totalPossible}\n🔹 *Global Percentage:* ${finalResult.percentage.toFixed(1)}%\n🔹 *Academic Grade:* ${finalResult.grade}\n🔹 *Class Merit Rank:* ${finalResult.position || 'Calculated'}\n━━━━━━━━━━━━━━━━━━━━\n\nPlease find the attached digital marksheet for detailed subject-wise analysis. This document serves as an official record of achievement and progress.\n\nWe appreciate your continued partnership in excellence.\n\nBest Regards,\n*Directorate of Examinations*\n*${settings.schoolName}*`;

            sendNotification(student.id, 'General' as const, msg, pdfBase64, `Marksheet_${student.name}.pdf`);

            if (!silent) {
                Swal.fire({
                    title: 'Transmitted!',
                    text: 'The digital transcript has been dispatched to WhatsApp.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000
                });
            }
            return pdfBase64;
        } catch (err) {
            console.error('Advanced PDF Error:', err);
            if (document.body.contains(container)) document.body.removeChild(container);
            if (!silent) Swal.fire({ title: 'System Error', text: 'Quantum rendering failed. Please try again.', icon: 'error' });
            throw err;
        }
    };

    const handleBulkPrint = () => {
        let results = examResults.filter(r => {
            if (r.examId !== selectedExamId) return false;
            if (selectedClass && selectedClass !== 'All' && r.className !== selectedClass) return false;
            if (selectedCampus) {
                const s = students.find(stud => stud.id === r.studentId);
                return s?.campus === selectedCampus;
            }
            return true;
        });

        if (selectedResults.length > 0) {
            results = results.filter(r => selectedResults.includes(r.studentId));
        }

        const exam = exams.find(e => e.id === selectedExamId);

        if (results.length === 0) {
            Swal.fire({ title: 'No Results', text: `No results selected or found for this selection.`, icon: 'info' });
            return;
        }

        const WindowPrt = window.open('', '', 'left=0,top=0,width=1000,height=1200,toolbar=0,scrollbars=0,status=0');
        if (!WindowPrt) return;

        let combinedHTML = '';
        results.forEach((result, index) => {
            const student = students.find(s => s.id === result.studentId);
            if (!student) return;

            const classTitle = result.className;
            const allClassSubjects = classSubjects[classTitle] || Object.keys(result.marks || {});

            const cardHTML = generateResultCardHTML(student, result, exam, settings, allClassSubjects);

            const bodyContentMatch = cardHTML.match(/<body>([\s\S]*?)<\/body>/);
            const headContentMatch = cardHTML.match(/<head>([\s\S]*?)<\/head>/);

            if (index === 0) {
                combinedHTML += `<html><head>${headContentMatch ? headContentMatch[1] : ''}<style>.page-break { page-break-after: always; } @media print { .page-break { page-break-after: always; display: block; } }</style></head><body>`;
            }

            if (bodyContentMatch) {
                combinedHTML += `<div class="${index < results.length - 1 ? 'page-break' : ''}">${bodyContentMatch[1]}</div>`;
            }

            if (index === results.length - 1) {
                combinedHTML += `</body></html>`;
            }
        });

        WindowPrt.document.write(combinedHTML);
        WindowPrt.document.write(`
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.onafterprint = function() { window.close(); };
                    }, 1500);
                };
            </script>
        `);
        WindowPrt.document.close();
    };

    const handleBulkSendPDFs = async () => {
        let results = examResults.filter(r => {
            if (r.examId !== selectedExamId) return false;
            if (selectedClass && selectedClass !== 'All' && r.className !== selectedClass) return false;
            if (selectedCampus) {
                const s = students.find(stud => stud.id === r.studentId);
                return s?.campus === selectedCampus;
            }
            return true;
        });

        if (selectedResults.length > 0) {
            results = results.filter(r => selectedResults.includes(r.studentId));
        }
        const exam = exams.find(e => e.id === selectedExamId);

        if (results.length === 0) {
            Swal.fire({ title: 'No Results', text: `No results found for this class ${selectedCampus ? `in ${selectedCampus}` : ''}.`, icon: 'info' });
            return;
        }

        const { isConfirmed } = await Swal.fire({
            title: 'Bulk WhatsApp PDF',
            text: `You are about to send full PDF marksheets to parents of ${results.length} students in ${selectedClass} ${selectedCampus ? `(${selectedCampus})` : ''}. This process runs in the background. Continue?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Neural Dispatch (PDF)',
            confirmButtonColor: '#10b981'
        });

        if (!isConfirmed) return;

        Swal.fire({
            title: 'Neural Dispatching...',
            html: `<div class="text-xs">Processing subject matrix for <b>${selectedClass}</b>...</div>`,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        let count = 0;
        for (const res of results) {
            const student = students.find(s => s.id === res.studentId);
            if (student) {
                try {
                    await handleSendWhatsAppResult({ student, result: res, exam }, true);
                    count++;
                } catch (e) { console.error(e); }
                // Small delay to keep UI breathing
                await new Promise(r => setTimeout(r, 800));
            }
        }

        Swal.fire({
            title: 'Process Complete',
            text: `Matrix complete. ${count} Marksheet PDFs have been queued for the WhatsApp gateway.`,
            icon: 'success'
        });
    };

    const handlePrintCertificate = (data?: any) => {
        const certData = data || certificateData;
        if (!certData) return;
        const serialNumber = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const WindowPrt = window.open('', '', 'left=0,top=0,width=1200,height=900,toolbar=0,scrollbars=0,status=0');
        if (WindowPrt) {
            WindowPrt.document.write(`
                <html>
                    <head>
                        <title>Official Certificate of Excellence</title>
                        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Cinzel:wght@600;900&family=Outfit:wght@400;600;800&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
                        <style>
                            @media print {
                                @page { size: A4 landscape; margin: 0; }
                                body { margin: 0; padding: 0; background: white !important; -webkit-print-color-adjust: exact; }
                                .cert-page { width: 297mm; height: 210mm; page-break-after: always; margin: 0 auto; overflow: hidden; transform: scale(1); }
                            }
                            body { 
                                margin: 0; padding: 0; 
                                background: #fafafa; 
                                display: flex; justify-content: center; align-items: center; 
                                min-height: 100vh;
                                font-family: 'EB Garamond', "Times New Roman", serif;
                            }
                            .cert-page {
                                width: 297mm;
                                height: 210mm;
                                background: #fff;
                                padding: 10mm;
                                box-sizing: border-box;
                                position: relative;
                                overflow: hidden;
                            }
                            
                            /* 3D Curved Luxury Border System */
                            .border-layer-1 {
                                height: 100%; width: 100%;
                                border: 8px double #c5a059;
                                border-radius: 40px;
                                padding: 4px;
                                box-sizing: border-box;
                                position: relative;
                                background: #fff;
                            }
                            .border-layer-2 {
                                height: 100%; width: 100%;
                                border: 1.5px solid #c5a059;
                                border-radius: 32px;
                                padding: 12px;
                                box-sizing: border-box;
                                background: #fdfbf7;
                                position: relative;
                            }
                            .border-layer-3 {
                                height: 100%; width: 100%;
                                border: 1px solid #e5d5b7;
                                border-radius: 24px;
                                box-sizing: border-box;
                                background: white;
                                position: relative;
                                padding: 30px 45px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                background-image: 
                                    radial-gradient(#c5a05908 1.5px, transparent 1.5px),
                                    linear-gradient(to right, #ffffff, #faf7f2, #ffffff);
                                background-size: 30px 30px, 100% 100%;
                            }

                            /* Ornate Corner Elements */
                            .corner-ornament {
                                position: absolute; width: 80px; height: 80px;
                                pointer-events: none; z-index: 5;
                            }
                            .top-left { top: 10px; left: 10px; border-top: 4px solid #c5a059; border-left: 4px solid #c5a059; border-radius: 25px 0 0 0; }
                            .top-right { top: 10px; right: 10px; border-top: 4px solid #c5a059; border-right: 4px solid #c5a059; border-radius: 0 25px 0 0; }
                            .bottom-left { bottom: 10px; left: 10px; border-bottom: 4px solid #c5a059; border-left: 4px solid #c5a059; border-radius: 0 0 0 25px; }
                            .bottom-right { bottom: 10px; right: 10px; border-bottom: 4px solid #c5a059; border-right: 4px solid #c5a059; border-radius: 0 0 25px 0; }

                            .header { display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 10px; }
                            .logo-box { width: 100px; height: 100px; padding: 10px; background: #fff; border: 2px solid #c5a059; border-radius: 20px; box-shadow: 0 10px 20px rgba(197, 160, 89, 0.15); }
                            .logo-img { width: 100%; height: 100%; object-fit: contain; }
                            
                            .school-info { text-align: center; flex: 1; margin: 0 20px; }
                            .school-name { 
                                font-family: 'Cinzel', serif; 
                                font-size: 44px; 
                                color: #1a1a1a; 
                                margin: 0; 
                                font-weight: 900; 
                                letter-spacing: 1px;
                                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                            }
                            .subtitle { 
                                font-size: 11px; 
                                color: #666; 
                                font-weight: 800; 
                                letter-spacing: 5px; 
                                text-transform: uppercase; 
                                margin-top: 5px;
                                font-family: 'Outfit', sans-serif;
                            }
                            
                            .cert-title-calligraphy { 
                                font-family: 'Great Vibes', cursive; 
                                font-size: 100px; 
                                color: #c5a059; 
                                margin: 0px 0 5px; 
                                line-height: 0.9;
                                text-shadow: 2px 2px 4px rgba(0,0,0,0.05);
                            }
                            
                            .award-banner {
                                background: #1a1a1a;
                                color: #fff;
                                padding: 6px 30px;
                                border-radius: 50px;
                                font-family: 'Cinzel', serif;
                                font-size: 14px;
                                font-weight: 700;
                                letter-spacing: 4px;
                                margin-bottom: 20px;
                                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                            }

                            .presented-to { 
                                font-family: 'EB Garamond', serif;
                                font-size: 16px; 
                                font-style: italic;
                                color: #888; 
                                margin-bottom: 5px; 
                            }
                            
                            .student-name { 
                                font-family: 'Cinzel', serif; 
                                font-size: 58px; 
                                color: #c5a059; 
                                margin-bottom: 15px; 
                                font-weight: 900; 
                                border-bottom: 1.5px solid #c5a05930;
                                min-width: 500px;
                                text-align: center;
                                padding-bottom: 2px;
                            }
                            
                            .narrative { 
                                font-family: 'EB Garamond', serif;
                                font-size: 22px; 
                                color: #444; 
                                line-height: 1.5; 
                                text-align: center; 
                                max-width: 850px; 
                            }
                            .narrative b { color: #000; font-weight: 700; font-family: 'EB Garamond', serif; font-size: 24px; }

                            .medal-container {
                                flex: 1;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                margin: 15px 0;
                            }
                            
                            /* Luxury Medal Style */
                            .gold-medal {
                                width: 130px; height: 130px;
                                position: relative;
                                background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
                                border-radius: 50%;
                                border: 4px solid #c5a059;
                                box-shadow: 0 15px 35px rgba(197, 160, 89, 0.3), inset 0 0 20px rgba(197, 160, 89, 0.2);
                                display: flex; flex-direction: column; align-items: center; justify-content: center;
                            }
                            .gold-medal::before {
                                content: "";
                                position: absolute; top: -5px; bottom: -5px; left: -5px; right: -5px;
                                border: 1px solid #c5a05950; border-radius: 50%;
                            }
                            .medal-pos { font-family: 'Cinzel', serif; font-size: 50px; font-weight: 900; color: #1a1a1a; line-height: 1; }
                            .medal-suffix { font-family: 'Cinzel', serif; font-size: 16px; vertical-align: super; margin-left: -2px; }
                            .medal-label { font-family: 'Outfit', sans-serif; font-size: 8px; font-weight: 900; text-transform: uppercase; color: #c5a059; letter-spacing: 2px; margin-top: -5px; }

                            .footer { 
                                position: absolute; 
                                bottom: 45px; 
                                left: 60px; 
                                right: 60px;
                                display: flex; 
                                justify-content: space-between; 
                                padding: 0 30px; 
                            }
                            .sig-box { text-align: center; width: 220px; }
                            .sig-line { border-top: 1.5px solid #1a1a1a; margin-bottom: 8px; }
                            .sig-label { font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 900; color: #000; text-transform: uppercase; letter-spacing: 3px; }

                            .watermark { 
                                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                                width: 450px; height: 450px; opacity: 0.04; pointer-events: none;
                                background: url("${settings.logo1 || ''}") center/contain no-repeat;
                            }
                            .registry-info {
                                position: absolute; 
                                bottom: 10mm; 
                                left: 50mm; 
                                right: 50mm;
                                font-family: 'Outfit', sans-serif; 
                                font-size: 7px; 
                                font-weight: 800; 
                                color: #ccc;
                                display: flex; 
                                justify-content: space-between;
                                letter-spacing: 1.5px;
                                text-transform: uppercase;
                                z-index: 100;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="cert-page">
                            <div class="border-layer-1">
                                <div class="border-layer-2">
                                    <div class="border-layer-3">
                                        <div class="corner-ornament top-left"></div>
                                        <div class="corner-ornament top-right"></div>
                                        <div class="corner-ornament bottom-left"></div>
                                        <div class="corner-ornament bottom-right"></div>
                                        <div class="watermark"></div>

                                        <div class="header">
                                            <div class="logo-box">
                                                <img src="${settings.logo1 || ''}" class="logo-img">
                                            </div>
                                            <div class="school-info">
                                                <h1 class="school-name">${settings.schoolName || 'TIMES PUBLIC SCHOOL'}</h1>
                                                <div class="subtitle">${settings.subTitle || 'Near Mehria Town Gate # 02 Attock'}</div>
                                            </div>
                                            <div class="logo-box">
                                                <img src="${settings.logo2 || settings.logo1 || ''}" class="logo-img">
                                            </div>
                                        </div>

                                        <div class="cert-title-calligraphy">Certificate of Achievement</div>
                                        
                                        <div class="award-banner">
                                            ${certData?.isCustom ? (certData.category || 'Special Award').toUpperCase() : 'ACADEMIC MERIT AWARD'}
                                        </div>

                                        <div class="presented-to">This honorable distinction is proudly presented to</div>
                                        <div class="student-name">${certData?.student?.name || '---'}</div>

                                        <div class="narrative">
                                            ${certData?.isCustom ? `
                                                Has demonstrated exceptional prowess and dedication by achieving
                                                <b>${certData.position || 'Outstanding Success'}</b> in the 
                                                <b>${certData.event || 'Institutional Category'}</b> event. 
                                                Your pursuit of excellence serves as an inspiration to the entire academic community.
                                            ` : `
                                                For securing the <b>${certData?.result?.position || '1'}${certData?.result?.position === 1 ? 'st' : certData?.result?.position === 2 ? 'nd' : certData?.result?.position === 3 ? 'rd' : 'th'} Position</b> 
                                                in the <b>${certData?.exam?.name || 'Official Examination'}</b> 
                                                with a commendable aggregate of <b>${certData?.result?.percentage?.toFixed(1) || '0.0'}%</b>.
                                                This certificate recognizes your hard work, intelligence, and academic dedication.
                                            `}
                                        </div>

                                        <div class="medal-container">
                                            <div class="gold-medal">
                                                <div class="medal-pos">
                                                    ${certData?.isCustom ? (certData.position?.includes('1') ? '1' : certData.position?.includes('2') ? '2' : '★') : (certData?.result?.position || '1')}
                                                    ${!certData?.isCustom || (certData.position?.includes('1') || certData.position?.includes('2')) ? `<span class="medal-suffix">${certData?.isCustom ? (certData.position?.includes('1') ? 'st' : 'nd') : (certData?.result?.position === 1 ? 'st' : certData?.result?.position === 2 ? 'nd' : certData?.result?.position === 3 ? 'rd' : 'th')}</span>` : ''}
                                                </div>
                                                <div class="medal-label">Rank / Merit</div>
                                            </div>
                                        </div>

                                        <div class="footer">
                                            <div class="sig-box">
                                                <div class="sig-line"></div>
                                                <div class="sig-label">PRINCIPAL SIGNATURE</div>
                                            </div>
                                            <div class="sig-box">
                                                <div class="sig-line"></div>
                                                <div class="sig-label">ADMINISTRATOR</div>
                                            </div>
                                        </div>

                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="registry-info">
                                <div>ID: ${serialNumber}</div>
                                <div>OFFICIAL RECORD VERIFIED</div>
                                <div>DATED: ${new Date().toLocaleDateString('en-GB')}</div>
                            </div>
                        </div>
                        <script>
                            window.onload = function() {
                                setTimeout(function() {
                                    window.print();
                                    window.onafterprint = function() { window.close(); };
                                }, 1200);
                            };
                        </script>
                    </body>
                </html>
            `);
            WindowPrt.document.close();
        }
    };


    return (
        <div className="space-y-6 animate-fade-in font-outfit">
            {/* Hidden Certificate Container */}
            <div style={{ display: 'none' }}>
                <div ref={certificateRef}>
                    {/* Dummy div to match ref */}
                    <div>Certificate Preview</div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-brand-primary dark:text-brand-accent leading-none">Academic Portal</h2>
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded-full">Automated</span>
                </div>
                {canManageSessions && (
                    <button
                        onClick={handleCreateExam}
                        className="w-full md:w-auto px-4 py-2 bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary rounded-[var(--brand-radius,0.75rem)] text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Plus className="w-3.5 h-3.5" /> Initialize Exam
                    </button>
                )}
            </div>

            {/* Main Tabs - App Style Pill Navigation */}
            <div className="w-full pb-2 md:pb-4 overflow-x-auto no-scrollbar pt-2 px-1">
                <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-full md:rounded-[var(--brand-radius,1rem)] w-max md:w-auto border border-white/50 dark:border-white/5 gap-1.5 md:gap-2 shadow-inner ring-1 ring-slate-900/5 dark:ring-0">
                    {[
                        { id: 'manage', label: 'Sessions', icon: Calendar, visible: true },
                        { id: 'marks', label: 'Marks', icon: Save, visible: true },
                        { id: 'results', label: 'Standings', icon: Trophy, visible: true },
                        { id: 'top', label: 'Top Rankers', icon: Medal, visible: true },
                        { id: 'custom', label: 'Special', icon: Award, visible: canManageSpecialAwards }
                    ].filter(t => t.visible).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex flex-row items-center justify-center gap-2 px-5 py-2.5 rounded-full md:rounded-[var(--brand-radius,0.75rem)] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-white dark:bg-brand-accent text-brand-primary shadow-sm ring-1 ring-slate-900/5 dark:ring-0 scale-100"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-brand-accent hover:bg-white/40 dark:hover:bg-white/5"
                            )}
                        >
                            <tab.icon className={cn(
                                "w-4 h-4 transition-colors",
                                activeTab === tab.id ? "text-brand-primary dark:text-brand-primary" : "opacity-70"
                            )} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sessions View */}
            {activeTab === 'manage' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {exams.length === 0 ? (
                        <div className="col-span-full py-32 text-center bg-white dark:bg-white/5 rounded-[var(--brand-radius,3rem)] border-4 border-dashed border-slate-100 dark:border-brand-accent/10">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-brand-accent/5 rounded-[var(--brand-radius,2rem)] flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="w-10 h-10 text-slate-300 dark:text-brand-accent/20" />
                            </div>
                            <p className="text-slate-400 dark:text-brand-accent/40 font-[1000] uppercase text-sm tracking-[0.3em]">No Active Exam Sessions Found</p>
                            {isAdmin && <p className="text-xs text-slate-400 dark:text-brand-accent/20 font-bold mt-4 uppercase tracking-widest">Invoke the core registry to begin academic evaluation.</p>}
                        </div>
                    ) : (
                        exams.map(exam => (
                            <div key={exam.id} className="group relative bg-white dark:bg-[#000816] rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 transition-all duration-500 hover:-translate-y-2 border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-150 transition-transform duration-700">
                                    <Calendar className="w-32 h-32" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <p className="text-[8px] font-black text-slate-400 dark:text-brand-accent/40 uppercase tracking-[0.2em]">{exam.date}</p>
                                            </div>
                                            <h3 className="text-xl font-[1000] text-brand-primary dark:text-white leading-none uppercase tracking-tighter">{exam.name}</h3>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm",
                                            exam.status === 'Finalized' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                                        )}>
                                            {exam.status}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{exam.classes.length} participating wings</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {exam.classes
                                                .filter(c => isAdmin || (currentUser?.role === 'teacher' && currentUser?.inchargeClass === c))
                                                .map(c => (
                                                    <span key={c} className="px-2 py-1 bg-slate-50 dark:bg-white/5 text-[8px] font-black text-brand-primary dark:text-brand-accent/80 rounded-lg border border-slate-100 dark:border-white/5 uppercase">{c}</span>
                                                ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 pt-4 border-t border-slate-50 dark:border-white/5">
                                        <button
                                            onClick={() => { setSelectedExamId(exam.id); setActiveTab('marks'); }}
                                            className="w-full sm:flex-1 py-3 bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary rounded-[var(--brand-radius,1rem)] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-md flex justify-center items-center gap-2"
                                        >
                                            <BookOpen className="w-3.5 h-3.5" /> Portal
                                        </button>
                                        {isAdmin && (
                                            <>
                                                <button
                                                    onClick={() => handleEditExam(exam)}
                                                    className="w-full sm:w-auto p-3 sm:px-4 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-brand-accent/80 rounded-[var(--brand-radius,1rem)] hover:bg-slate-100 hover:text-brand-primary dark:hover:bg-white/10 dark:hover:text-brand-accent transition-all active:scale-90 flex justify-center items-center gap-2"
                                                >
                                                    <Edit2 className="w-4 h-4" /> <span className="sm:hidden text-[10px] font-black uppercase tracking-widest">Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExam(exam.id)}
                                                    className="w-full sm:w-auto p-3 sm:px-4 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-[var(--brand-radius,1rem)] hover:bg-rose-500 hover:text-white transition-all active:scale-90 flex justify-center items-center gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" /> <span className="sm:hidden text-[10px] font-black uppercase tracking-widest">Delete</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Marks Entry View */}
            {activeTab === 'marks' && (
                <div className="space-y-6">
                    {/* Premium App-Style Selectors Group */}
                    <div className="bg-white/80 dark:bg-[#000816]/80 rounded-[1.5rem] md:rounded-[2rem] p-2 shadow-sm border border-slate-200/50 dark:border-white/5 md:flex md:flex-row grid grid-cols-1 gap-1">
                        <div className="md:flex-1 relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20">
                            <label className="text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5">Academic Session</label>
                            <select
                                value={selectedExamId || ''}
                                onChange={(e) => {
                                    setSelectedExamId(e.target.value);
                                    if (!(currentUser?.role === 'teacher' && currentUser?.inchargeClass)) {
                                        setSelectedClass(null);
                                    }
                                    setSelectedStudentId(null);
                                }}
                                className="w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer"
                            >
                                <option value="">Select Session...</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>

                        {selectedExamId && (
                            <div className="md:flex-1 relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20 animate-fade-in">
                                <label className="text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5">Select Campus</label>
                                <select
                                    value={selectedCampus || ''}
                                    onChange={(e) => { setSelectedCampus(e.target.value); setSelectedStudentId(null); }}
                                    className="w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer"
                                >
                                    <option value="">All Campuses...</option>
                                    {(useStore() as any).campuses?.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        )}

                        {selectedExamId && (
                            <div className="md:flex-1 relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20 animate-fade-in">
                                <label className="text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5">Assigned Class</label>
                                <select
                                    value={selectedClass || ''}
                                    onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudentId(null); }}
                                    className="w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer"
                                >
                                    <option value="">Select Wing...</option>
                                    {exams.find(e => e.id === selectedExamId)?.classes
                                        .filter(c => isAdmin || (currentUser?.role === 'teacher' && currentUser?.inchargeClass === c))
                                        .map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}

                        {selectedClass && (
                            <div className="md:flex-1 relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20 animate-fade-in">
                                <label className="text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5">Enrolled Student</label>
                                <select
                                    value={selectedStudentId || ''}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-brand-primary dark:text-brand-accent outline-none appearance-none truncate cursor-pointer"
                                >
                                    <option value="" disabled>Select Student...</option>
                                    {(() => {
                                        const classSubjCount = (classSubjects[selectedClass] || []).length;
                                        return students.filter(s => s.class === selectedClass && (!selectedCampus || s.campus === selectedCampus))
                                            .filter(s => {
                                                if (s.id === selectedStudentId) return true; // Always show currently selected
                                                const res = examResults.find(r => r.studentId === s.id && r.examId === selectedExamId);
                                                if (!res) return true; // No result yet
                                                let marksCount = 0;
                                                (classSubjects[selectedClass] || []).forEach((subj) => {
                                                    if (res.marks[subj] && res.marks[subj].obtained !== undefined && String(res.marks[subj].obtained) !== '') marksCount++;
                                                });
                                                return marksCount < classSubjCount; // Show if not all marks are entered
                                            })
                                            .map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>);
                                    })()}
                                </select>
                            </div>
                        )}

                        {selectedClass && (
                            <div className="flex items-center gap-1.5 px-2">
                                <button
                                    onClick={handleExportMarks}
                                    title="Export Template"
                                    className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all active:scale-95 border border-indigo-100 dark:border-indigo-500/20"
                                >
                                    <FileDown className="w-4 h-4" />
                                </button>
                                <label className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all active:scale-95 border border-emerald-100 dark:border-emerald-500/20 cursor-pointer">
                                    <FileUp className="w-4 h-4" />
                                    <input type="file" accept=".xlsx,.xls" onChange={handleImportMarks} className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>

                    {selectedExamId && selectedClass && selectedStudentId ? (
                        <div className="glass-card overflow-hidden">
                            <div className="p-4 md:p-6 bg-brand-primary text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-sm md:text-sm font-black uppercase tracking-widest">Marks Sheet</h4>
                                    <p className="text-[10px] opacity-70 font-bold">
                                        {students.find(s => s.id === selectedStudentId)?.name} • {selectedClass}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 sm:flex sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const student = students.find(s => s.id === selectedStudentId);
                                            const exam = exams.find(e => e.id === selectedExamId);
                                            const result = examResults.find(r => r.studentId === selectedStudentId && r.examId === selectedExamId);
                                            if (student && exam && result) {
                                                handleSendWhatsAppResult({ student, result, exam });
                                            } else {
                                                Swal.fire({ title: 'Insufficient Data', text: 'Please ensure at least one subject mark is recorded before sending PDF.', icon: 'warning' });
                                            }
                                        }}
                                        className="col-span-1 sm:w-auto px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-[1rem] text-[9.5px] font-black uppercase tracking-widest transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-sm"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span className="whitespace-nowrap">Distribute</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const student = students.find(s => s.id === selectedStudentId);
                                            const exam = exams.find(e => e.id === selectedExamId);
                                            const result = examResults.find(r => r.studentId === selectedStudentId && r.examId === selectedExamId);
                                            if (student && exam && result) {
                                                const subjects = Object.entries(result.marks);
                                                subjects.forEach(([subj, data]) => {
                                                    const msg = MESSAGE_TEMPLATES.MARKS_UPDATE(student.name, exam.name, subj, data.obtained, data.total, settings.schoolName);
                                                    sendNotification(student.id, 'General', msg);
                                                });
                                                Swal.fire({
                                                    title: 'Alerts Queued',
                                                    text: `WhatsApp alerts for ${subjects.length} subjects have been sent to ${student.name}'s parent.`,
                                                    icon: 'success',
                                                    toast: true,
                                                    position: 'top-end',
                                                    timer: 3000
                                                });
                                            }
                                        }}
                                        className="col-span-1 sm:w-auto px-4 py-2.5 bg-indigo-500/30 text-indigo-50 rounded-[1rem] text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5"
                                    >
                                        <MessageSquare className="w-4 h-4" /> <span className="whitespace-nowrap">Alert</span>
                                    </button>
                                    {canFinalizeResults && (
                                        <button
                                            onClick={() => handleFinalize(selectedExamId, selectedClass)}
                                            className="col-span-2 sm:w-auto px-5 py-3 bg-emerald-500 text-white rounded-[1rem] text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-1 sm:mt-0"
                                        >
                                            <Calculator className="w-4 h-4 text-emerald-100" /> <span className="whitespace-nowrap">Finalize Result</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Marks View - Premium Native IOS Style */}
                            <div className="md:hidden p-3 md:p-4 space-y-4 bg-slate-50/80 dark:bg-[#000816]">
                                {(classSubjects[selectedClass] || []).map(subject => {
                                    const result = examResults.find(r => r.studentId === selectedStudentId && r.examId === selectedExamId);
                                    const defaultTotal = selectedClass && subjectTotalMarks?.[selectedClass]?.[subject] || 100;
                                    const subjectData = result?.marks[subject] || { obtained: undefined as any, total: defaultTotal };
                                    const percent = subjectData.total > 0 && subjectData.obtained !== undefined && subjectData.obtained !== '' ? (subjectData.obtained / subjectData.total) * 100 : 0;

                                    return (
                                        <div key={subject} className="bg-white dark:bg-slate-900 rounded-[1.25rem] p-4 shadow-sm border border-slate-100/80 dark:border-white/5 overflow-hidden relative group">
                                            {/* decorative background element */}
                                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/[0.03] dark:bg-brand-accent/[0.03] rounded-full blur-2xl pointer-events-none transition-all group-focus-within:bg-brand-primary/[0.08]"></div>

                                            <div className="flex items-center justify-between mb-5 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-[0.85rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 flex items-center justify-center border border-slate-200/50 dark:border-white/5 shadow-inner shrink-0">
                                                        <BookOpen className="w-5 h-5 text-brand-primary/80 dark:text-brand-accent/80" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[15px] leading-none font-[1000] text-slate-800 dark:text-white uppercase tracking-tight block">{subject}</span>
                                                        <div className="flex items-center gap-1.5 mt-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SUBJECT MATRIX</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {subjectData.obtained !== undefined && subjectData.obtained !== '' ? (
                                                    <div className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black tracking-widest uppercase flex items-center gap-1 border border-emerald-100 dark:border-emerald-500/20 shadow-sm shrink-0">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Logged
                                                    </div>
                                                ) : (
                                                    <div className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black tracking-widest uppercase flex items-center gap-1 border border-amber-100 dark:border-amber-500/20 shadow-sm shrink-0">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Pending
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100/50 dark:border-white/5 rounded-2xl p-1.5 relative z-10 isolate">
                                                <div className="flex-1 p-2">
                                                    <label className="text-[8px] font-black text-slate-400 dark:text-brand-accent/40 uppercase tracking-[0.2em] block mb-2 ml-1">Total Points</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={subjectData.total}
                                                            onChange={(e) => inputMarks(selectedExamId, selectedClass, selectedStudentId, subject, subjectData.obtained, Number(e.target.value))}
                                                            className="w-full bg-white dark:bg-slate-800 border-none text-center py-3 rounded-xl text-sm font-black text-slate-600 dark:text-slate-200 outline-none shadow-sm shadow-slate-200/50 dark:shadow-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-brand-accent/30 transition-all font-outfit"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center px-1 z-10">
                                                    <div className="w-px h-10 bg-slate-200/80 dark:bg-white/10 rounded-full"></div>
                                                </div>
                                                <div className="flex-1 p-2">
                                                    <label className="text-[8px] font-black text-brand-primary dark:text-brand-accent uppercase tracking-[0.2em] block mb-2 ml-1">Score Obtained</label>
                                                    <div className="relative">
                                                        <input
                                                            id={`mark-input-obtained-${subject.replace(/\\s+/g, '-')}`}
                                                            type="number"
                                                            value={subjectData.obtained !== undefined ? subjectData.obtained : ''}
                                                            onChange={(e) => inputMarks(selectedExamId, selectedClass, selectedStudentId, subject, e.target.value, subjectData.total)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    const subjectsList = classSubjects[selectedClass] || [];
                                                                    const currentIndex = subjectsList.indexOf(subject);
                                                                    if (currentIndex < subjectsList.length - 1) {
                                                                        const nextSubject = subjectsList[currentIndex + 1];
                                                                        const nextInputs = document.querySelectorAll(`input[id="mark-input-obtained-${nextSubject.replace(/\\s+/g, '-')}"]`);
                                                                        for (let i = 0; i < nextInputs.length; i++) {
                                                                            const el = nextInputs[i] as HTMLInputElement;
                                                                            if (el.offsetParent !== null) { el.focus(); el.select(); return; }
                                                                        }
                                                                    } else {
                                                                        // Next Student
                                                                        const classSubjCount = subjectsList.length;

                                                                        // All students in this class/campus
                                                                        const relevantStudents = students.filter(s => s.class === selectedClass && (!selectedCampus || s.campus === selectedCampus));
                                                                        const currentIndexInAll = relevantStudents.findIndex(s => s.id === selectedStudentId);

                                                                        // Find the NEXT student who is incomplete
                                                                        const nextIncompleteStudent = relevantStudents.find((s, idx) => {
                                                                            if (idx <= currentIndexInAll) return false;
                                                                            const res = examResults.find(r => r.studentId === s.id && r.examId === selectedExamId);
                                                                            if (!res) return true;
                                                                            let marksCount = 0;
                                                                            subjectsList.forEach((subj) => {
                                                                                if (res.marks[subj] && res.marks[subj].obtained !== undefined && String(res.marks[subj].obtained) !== '') marksCount++;
                                                                            });
                                                                            return marksCount < classSubjCount;
                                                                        });

                                                                        if (nextIncompleteStudent) {
                                                                            setSelectedStudentId(nextIncompleteStudent.id);
                                                                            setTimeout(() => {
                                                                                const firstSubject = subjectsList[0];
                                                                                const nextInputs = document.querySelectorAll(`input[id="mark-input-obtained-${firstSubject.replace(/\\s+/g, '-')}"]`);
                                                                                for (let i = 0; i < nextInputs.length; i++) {
                                                                                    const el = nextInputs[i] as HTMLInputElement;
                                                                                    if (el.offsetParent !== null) { el.focus(); el.select(); return; }
                                                                                }
                                                                            }, 200);
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                            className="w-full bg-white dark:bg-slate-800 border-none text-center py-3 rounded-xl text-base font-[1000] text-brand-primary dark:text-brand-accent outline-none shadow-sm shadow-slate-200/50 dark:shadow-none focus:ring-2 focus:ring-brand-primary/40 dark:focus:ring-brand-accent/50 transition-all font-outfit placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:scale-105"
                                                            placeholder="--"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {subjectData.obtained !== undefined && subjectData.obtained !== '' && (
                                                <div className="mt-4 px-1.5 relative z-10 flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                                        <div
                                                            className={cn("h-full transition-all duration-1000 ease-out rounded-full", percent >= 80 ? "bg-emerald-500" : percent >= 60 ? "bg-brand-primary dark:bg-brand-accent" : "bg-amber-500")}
                                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-400">{percent.toFixed(0)}%</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="hidden md:block overflow-x-auto custom-scrollbar">
                                <table className="w-full min-w-[800px]">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-[9px] font-black uppercase text-slate-400 tracking-widest sticky left-0 bg-slate-50 z-10">Subject Name</th>
                                            <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-400 tracking-widest">Total Marks</th>
                                            <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-400 tracking-widest">Obtained Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {(classSubjects[selectedClass] || []).map(subject => {
                                            const result = examResults.find(r => r.studentId === selectedStudentId && r.examId === selectedExamId);
                                            const defaultTotal = selectedClass && subjectTotalMarks?.[selectedClass]?.[subject] || 100;
                                            const subjectData = result?.marks[subject] || { obtained: undefined as any, total: defaultTotal };

                                            return (
                                                <tr key={subject} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4 sticky left-0 bg-white dark:bg-slate-900 z-10 group-hover:bg-slate-50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 text-[10px]">
                                                                <BookOpen className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-700 uppercase">{subject}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {subjectData.obtained !== undefined && subjectData.obtained !== '' ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                                                        ) : (
                                                            <AlertCircle className="w-4 h-4 text-slate-200 mx-auto" />
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="max-w-[80px] mx-auto">
                                                            <input
                                                                type="number"
                                                                value={subjectData.total}
                                                                onChange={(e) => inputMarks(selectedExamId, selectedClass, selectedStudentId, subject, subjectData.obtained, Number(e.target.value))}
                                                                className="w-full bg-slate-50 border border-slate-100 text-center py-2 rounded-xl text-sm font-black text-slate-400 focus:ring-2 ring-slate-200 outline-none transition-all"
                                                                placeholder="100"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="max-w-[120px] mx-auto">
                                                            <input
                                                                id={`mark-input-obtained-${subject.replace(/\\s+/g, '-')}`}
                                                                type="number"
                                                                value={subjectData.obtained !== undefined ? subjectData.obtained : ''}
                                                                onChange={(e) => inputMarks(selectedExamId, selectedClass, selectedStudentId, subject, e.target.value, subjectData.total)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        const subjectsList = classSubjects[selectedClass] || [];
                                                                        const currentIndex = subjectsList.indexOf(subject);
                                                                        if (currentIndex < subjectsList.length - 1) {
                                                                            const nextSubject = subjectsList[currentIndex + 1];
                                                                            const nextInputs = document.querySelectorAll(`input[id="mark-input-obtained-${nextSubject.replace(/\\s+/g, '-')}"]`);
                                                                            for (let i = 0; i < nextInputs.length; i++) {
                                                                                const el = nextInputs[i] as HTMLInputElement;
                                                                                if (el.offsetParent !== null) { el.focus(); el.select(); return; }
                                                                            }
                                                                        } else {
                                                                            // Next Student
                                                                            const classSubjCount = subjectsList.length;

                                                                            // All students in this class/campus
                                                                            const relevantStudents = students.filter(s => s.class === selectedClass && (!selectedCampus || s.campus === selectedCampus));
                                                                            const currentIndexInAll = relevantStudents.findIndex(s => s.id === selectedStudentId);

                                                                            // Find the NEXT student who is incomplete
                                                                            const nextIncompleteStudent = relevantStudents.find((s, idx) => {
                                                                                if (idx <= currentIndexInAll) return false;
                                                                                const res = examResults.find(r => r.studentId === s.id && r.examId === selectedExamId);
                                                                                if (!res) return true;
                                                                                let marksCount = 0;
                                                                                subjectsList.forEach((subj) => {
                                                                                    if (res.marks[subj] && res.marks[subj].obtained !== undefined && String(res.marks[subj].obtained) !== '') marksCount++;
                                                                                });
                                                                                return marksCount < classSubjCount;
                                                                            });

                                                                            if (nextIncompleteStudent) {
                                                                                setSelectedStudentId(nextIncompleteStudent.id);
                                                                                setTimeout(() => {
                                                                                    const firstSubject = subjectsList[0];
                                                                                    const nextInputs = document.querySelectorAll(`input[id="mark-input-obtained-${firstSubject.replace(/\\s+/g, '-')}"]`);
                                                                                    for (let i = 0; i < nextInputs.length; i++) {
                                                                                        const el = nextInputs[i] as HTMLInputElement;
                                                                                        if (el.offsetParent !== null) { el.focus(); el.select(); return; }
                                                                                    }
                                                                                }, 200);
                                                                            }
                                                                        }
                                                                    }
                                                                }}
                                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-center py-2 rounded-[var(--brand-radius,0.75rem)] text-sm font-black focus:ring-2 ring-brand-primary/20 outline-none transition-all dark:text-white"
                                                                placeholder="00"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center glass-card border-dashed">
                            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Select Exam, Class and Student to begin entry</p>
                        </div>
                    )}
                </div>
            )}

            {/* Results & Rankings View */}
            {activeTab === 'results' && (
                <div className="space-y-6">
                    {/* Premium App-Style Selectors Group */}
                    <div className="bg-white/80 dark:bg-[#000816]/80 rounded-[1.5rem] md:rounded-[2rem] p-2 shadow-sm border border-slate-200/50 dark:border-white/5 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-1 items-stretch">
                        <div className="relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20">
                            <label className="text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5">Finalized Session</label>
                            <select
                                value={selectedExamId || ''}
                                onChange={(e) => { setSelectedExamId(e.target.value); setSelectedClass(null); }}
                                className="w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer"
                            >
                                <option value="">Select Session...</option>
                                {exams.filter(e => e.status === 'Finalized').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>

                        <div className="relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20">
                            <label className="text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5">Select Campus</label>
                            <select
                                value={selectedCampus || ''}
                                onChange={(e) => { setSelectedCampus(e.target.value); }}
                                className="w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer"
                            >
                                <option value="">All Campuses...</option>
                                {(useStore()).campuses?.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20">
                            <label className="text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5">Active Wing</label>
                            <select
                                value={selectedClass || ''}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-brand-primary dark:text-brand-accent outline-none appearance-none truncate cursor-pointer"
                            >
                                <option value="All">All Classes...</option>
                                {exams.find(e => e.id === selectedExamId)?.classes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {selectedExamId && selectedClass && (
                            <div className="flex px-1 pt-1 md:pt-0 gap-2">
                                <button
                                    onClick={() => handleBulkPrint()}
                                    className="w-full md:w-auto px-6 py-3 bg-brand-primary text-white rounded-[1.25rem] md:rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-md flex items-center justify-center gap-2 h-full whitespace-nowrap"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Bulk Print</span>
                                </button>
                                <button
                                    onClick={handleBulkSendPDFs}
                                    className="w-full md:w-auto px-6 py-3 bg-emerald-500 text-white rounded-[1.25rem] md:rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-md flex items-center justify-center gap-2 h-full whitespace-nowrap"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Bulk Distribute</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {selectedExamId && selectedClass ? (
                        <div className="space-y-8">
                            {/* Podium (Top 3) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                {[2, 1, 3].map((pos) => {
                                    const res = examResults.find(r => {
                                        if (r.examId !== selectedExamId || r.position !== pos) return false;
                                        if (selectedClass && selectedClass !== 'All' && r.className !== selectedClass) return false;
                                        if (selectedCampus) {
                                            const s = students.find(stud => stud.id === r.studentId);
                                            return s?.campus === selectedCampus;
                                        }
                                        return true;
                                    });
                                    if (!res) return null;
                                    const student = students.find(s => s.id === res.studentId);

                                    return (
                                        <div key={pos} className={cn(
                                            "glass-card p-6 md:p-8 flex flex-col items-center text-center relative animate-in slide-in-from-bottom-8 duration-700",
                                            pos === 1 ? "bg-gradient-to-br from-brand-primary/5 to-brand-accent/10 border-brand-accent/30 scale-100 md:scale-110 z-10 order-1 md:order-2 dark:bg-white/5" :
                                                pos === 2 ? "bg-white dark:bg-white/5 order-2 md:order-1" : "bg-white dark:bg-white/5 order-3",
                                        )}>
                                            <div className={cn(
                                                "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-4 ring-white",
                                                pos === 1 ? "bg-amber-400" : pos === 2 ? "bg-slate-300" : "bg-orange-300"
                                            )}>
                                                <Trophy className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="mb-4">
                                                <h4 className="font-black text-brand-primary dark:text-white uppercase text-sm leading-tight">{student?.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1">{student?.id}</p>
                                            </div>
                                            <div className="space-y-1 mb-6">
                                                <p className="text-2xl font-black text-brand-primary dark:text-white">{res.percentage.toFixed(1)}%</p>
                                                <div className="flex items-center gap-1.5 justify-center">
                                                    <Medal className={cn("w-3 h-3", pos === 1 ? "text-amber-500" : pos === 2 ? "text-slate-400" : "text-orange-400")} />
                                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Rank #{pos}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 w-full">
                                                <button
                                                    onClick={() => {
                                                        const data = { student, result: res, exam: exams.find(e => e.id === selectedExamId) };
                                                        handleSendWhatsAppResult(data);
                                                    }}
                                                    className="px-4 py-2 bg-green-500 text-white rounded-[var(--brand-radius,0.5rem)] text-[8px] font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Share2 className="w-3 h-3" /> WhatsApp Marksheet
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const data = { student, result: res, exam: exams.find(e => e.id === selectedExamId) };
                                                        setCertificateData(data);
                                                        handlePrintCertificate(data);
                                                    }}
                                                    className="px-4 py-2 bg-brand-primary text-white rounded-[var(--brand-radius,0.5rem)] text-[8px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Printer className="w-3 h-3" /> Print Certificate
                                                </button>
                                            </div>

                                            <div className={cn(
                                                "absolute -top-3 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm",
                                                pos === 1 ? "bg-brand-accent text-brand-primary border-brand-accent" : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-white/10"
                                            )}>
                                                {pos === 1 ? 'Champion' : pos === 2 ? 'Runner Up' : '3rd Place'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Full List */}
                            <div className="glass-card overflow-hidden">
                                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedResults.length > 0 && selectedResults.length === examResults.filter(r => r.examId === selectedExamId && r.className === selectedClass && (selectedCampus ? students.find(s => s.id === r.studentId)?.campus === selectedCampus : true)).length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    const allFilteredIds = examResults
                                                        .filter(r => r.examId === selectedExamId && r.className === selectedClass && (selectedCampus ? students.find(s => s.id === r.studentId)?.campus === selectedCampus : true))
                                                        .map(r => r.studentId);
                                                    setSelectedResults(allFilteredIds);
                                                } else {
                                                    setSelectedResults([]);
                                                }
                                            }}
                                            className="w-4 h-4 accent-brand-primary"
                                        />
                                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Institutional Merit List</h4>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Class Strength: {students.filter(s => s.class === selectedClass).length}</span>
                                </div>
                                {/* Mobile Merit List View - Premium Native App Style */}
                                <div className="md:hidden bg-slate-50/80 dark:bg-[#000816] p-3 md:p-4 space-y-3.5">
                                    {examResults
                                        .filter(r => {
                                            if (r.examId !== selectedExamId) return false;
                                            if (selectedClass && selectedClass !== 'All' && r.className !== selectedClass) return false;
                                            if (selectedCampus) {
                                                const s = students.find(stud => stud.id === r.studentId);
                                                return s?.campus === selectedCampus;
                                            }
                                            return true;
                                        })
                                        .sort((a, b) => b.percentage - a.percentage)
                                        .map((res, index) => {
                                            const student = students.find(s => s.id === res.studentId);
                                            const isTop3 = index < 3;

                                            return (
                                                <div key={res.studentId} className={cn(
                                                    "bg-white dark:bg-slate-900 rounded-[1.25rem] p-4 shadow-sm border overflow-hidden relative transition-all active:scale-[0.98]",
                                                    isTop3 ? "border-brand-primary/20 dark:border-brand-accent/20" : "border-slate-100 dark:border-white/5",
                                                    selectedResults.includes(res.studentId) ? "ring-2 ring-brand-primary ring-inset" : ""
                                                )}>
                                                    {isTop3 && (
                                                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none"></div>
                                                    )}

                                                    <div className="flex flex-row items-center gap-3.5 relative z-10">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedResults.includes(res.studentId)}
                                                            onChange={() => {
                                                                if (selectedResults.includes(res.studentId)) {
                                                                    setSelectedResults(selectedResults.filter(id => id !== res.studentId));
                                                                } else {
                                                                    setSelectedResults([...selectedResults, res.studentId]);
                                                                }
                                                            }}
                                                            className="w-4 h-4 accent-brand-primary"
                                                        />
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-[0.85rem] flex items-center justify-center text-xs font-[1000] shadow-inner border shrink-0",
                                                            index === 0 ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white border-amber-200" :
                                                                index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white border-slate-200" :
                                                                    index === 2 ? "bg-gradient-to-br from-orange-300 to-orange-400 text-white border-orange-200" :
                                                                        "bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-200/50 dark:border-white/5"
                                                        )}>
                                                            #{index + 1}
                                                        </div>

                                                        <div className="flex-1 min-w-0 py-0.5">
                                                            <h4 className="text-[14px] font-[1000] text-slate-800 dark:text-white uppercase tracking-tight truncate leading-tight mb-1">{student?.name}</h4>
                                                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                                <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{student?.id}</span>
                                                            </div>
                                                        </div>

                                                        <div className="text-right shrink-0">
                                                            <div className={cn(
                                                                "text-lg font-[1000] leading-none mb-1",
                                                                isTop3 ? "text-amber-500 dark:text-amber-400" : "text-brand-primary dark:text-brand-accent"
                                                            )}>{res.percentage.toFixed(1)}%</div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100/60 dark:border-white/5 relative z-10">
                                                        <button
                                                            onClick={() => handlePrintResultCard({ student, result: res, exam: exams.find(e => e.id === selectedExamId) })}
                                                            className="flex flex-col items-center justify-center gap-2 py-2.5 px-1 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 hover:bg-blue-100 text-blue-600 dark:text-blue-400 transition-colors"
                                                        >
                                                            <ClipboardList className="w-4 h-4" />
                                                            <span className="text-[7.5px] font-black uppercase tracking-widest whitespace-nowrap">Mark Sheet</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleSendWhatsAppResult({ student, result: res, exam: exams.find(e => e.id === selectedExamId) })}
                                                            className="flex flex-col items-center justify-center gap-2 py-2.5 px-1 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition-colors"
                                                        >
                                                            <Share2 className="w-4 h-4" />
                                                            <span className="text-[7.5px] font-black uppercase tracking-widest whitespace-nowrap">WhatsApp</span>
                                                        </button>
                                                        <button
                                                            onClick={() => { const d = { student, result: res, exam: exams.find(e => e.id === selectedExamId) }; handlePrintCertificate(d); }}
                                                            className="flex flex-col items-center justify-center gap-2 py-2.5 px-1 rounded-xl bg-amber-50/60 dark:bg-amber-500/10 hover:bg-amber-100 text-amber-600 dark:text-amber-400 transition-colors"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                            <span className="text-[7.5px] font-black uppercase tracking-widest whitespace-nowrap">Certificate</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>

                                <div className="hidden md:block overflow-x-auto custom-scrollbar">
                                    <table className="w-full min-w-[1000px]">
                                        <thead className="bg-white">
                                            <tr>
                                                <th className="px-6 py-4 text-left border-r border-slate-50 sticky left-0 bg-white z-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedResults.length > 0 && selectedResults.length === examResults.filter(r => r.examId === selectedExamId && r.className === selectedClass && (selectedCampus ? students.find(s => s.id === r.studentId)?.campus === selectedCampus : true)).length}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                const allFilteredIds = examResults
                                                                    .filter(r => r.examId === selectedExamId && r.className === selectedClass && (selectedCampus ? students.find(s => s.id === r.studentId)?.campus === selectedCampus : true))
                                                                    .map(r => r.studentId);
                                                                setSelectedResults(allFilteredIds);
                                                            } else {
                                                                setSelectedResults([]);
                                                            }
                                                        }}
                                                        className="w-4 h-4 accent-brand-primary"
                                                    />
                                                </th>
                                                <th className="px-6 py-4 text-left text-[9px] font-black uppercase text-slate-300 tracking-widest border-r border-slate-50">Pos</th>
                                                <th className="px-6 py-4 text-left text-[9px] font-black uppercase text-slate-300 tracking-widest">Student Name</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest">Subjects</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest">Total</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest">Percentage</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest">Grade</th>
                                                <th className="px-6 py-4 text-left text-[9px] font-black uppercase text-slate-300 tracking-widest">Assessment Remark</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest sticky right-0 bg-white z-10 border-l border-slate-50">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {examResults
                                                .filter(r => {
                                                    if (r.examId !== selectedExamId) return false;
                                                    if (selectedClass && selectedClass !== 'All' && r.className !== selectedClass) return false;
                                                    if (selectedCampus) {
                                                        const s = students.find(stud => stud.id === r.studentId);
                                                        return s?.campus === selectedCampus;
                                                    }
                                                    return true;
                                                })
                                                .sort((a, b) => b.percentage - a.percentage)
                                                .map((res, index) => {
                                                    const student = students.find(s => s.id === res.studentId);
                                                    return (
                                                        <tr key={res.studentId} className={cn(
                                                            "group hover:bg-slate-50 transition-colors",
                                                            index < 3 ? "bg-blue-50/20" : "",
                                                            selectedResults.includes(res.studentId) ? "bg-brand-primary/[0.03]" : ""
                                                        )}>
                                                            <td className="px-6 py-4 border-r border-slate-50 sticky left-0 bg-white z-10 group-hover:bg-slate-100 transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedResults.includes(res.studentId)}
                                                                    onChange={() => {
                                                                        if (selectedResults.includes(res.studentId)) {
                                                                            setSelectedResults(selectedResults.filter(id => id !== res.studentId));
                                                                        } else {
                                                                            setSelectedResults([...selectedResults, res.studentId]);
                                                                        }
                                                                    }}
                                                                    className="w-4 h-4 accent-brand-primary"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 border-r border-slate-50">
                                                                <div className={cn(
                                                                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black",
                                                                    index === 0 ? "bg-amber-400 text-white shadow-lg" :
                                                                        index === 1 ? "bg-slate-300 text-white" :
                                                                            index === 2 ? "bg-orange-300 text-white" :
                                                                                "bg-slate-100 text-slate-400"
                                                                )}>
                                                                    {index + 1}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div>
                                                                    <p className="text-xs font-black text-brand-primary dark:text-white uppercase">{student?.name}</p>
                                                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">{student?.id}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="text-[10px] font-bold text-slate-500">{Object.keys(res.marks || {}).length} / {(classSubjects[selectedClass] || []).length}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="text-xs font-black text-brand-primary dark:text-white">{res.totalObtained} / {res.totalPossible}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex items-center gap-2 justify-center">
                                                                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={cn(
                                                                                "h-full rounded-full transition-all duration-1000",
                                                                                res.percentage >= 80 ? "bg-emerald-500" : res.percentage >= 60 ? "bg-blue-500" : "bg-amber-500"
                                                                            )}
                                                                            style={{ width: `${res.percentage}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs font-black text-brand-primary dark:text-white">{res.percentage.toFixed(1)}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={cn(
                                                                    "px-3 py-1 rounded-lg text-[10px] font-black",
                                                                    res.grade === 'A+' ? "bg-emerald-100 text-emerald-600" :
                                                                        res.grade === 'A' ? "bg-emerald-50 text-emerald-600" :
                                                                            res.grade === 'F' ? "bg-rose-100 text-rose-600" :
                                                                                "bg-blue-50 text-blue-600"
                                                                )}>
                                                                    {res.grade}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-left">
                                                                <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed truncate max-w-[150px]">
                                                                    {res.remarks || 'Pending...'}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-4 text-center sticky right-0 bg-white dark:bg-slate-900 z-10 group-hover:bg-slate-50 transition-colors border-l border-slate-50">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <button
                                                                        onClick={() => handlePrintResultCard({ student, result: res, exam: exams.find(e => e.id === selectedExamId) })}
                                                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                                        title="Generate Result Card"
                                                                    >
                                                                        <ClipboardList className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSendWhatsAppResult({ student, result: res, exam: exams.find(e => e.id === selectedExamId) })}
                                                                        className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                                                                        title="Send Marksheet PDF via WhatsApp"
                                                                    >
                                                                        <Share2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            const data = { student, result: res, exam: exams.find(e => e.id === selectedExamId) };
                                                                            setCertificateData(data);
                                                                            handlePrintCertificate(data);
                                                                        }}
                                                                        className="p-2 text-slate-400 hover:text-brand-primary transition-colors"
                                                                        title="Print Certificate"
                                                                    >
                                                                        <Printer className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center glass-card border-dashed">
                            <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Select an Active and Finalized Session to view standings</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'top' && (
                <div className="space-y-6">
                    <div className="bg-white/80 dark:bg-[#000816]/80 rounded-[1.5rem] md:rounded-[2rem] p-4 shadow-sm border border-slate-200/50 dark:border-white/5 flex gap-4 max-w-md mx-auto relative">
                        <div className="flex-1">
                            <label className="text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5">Finalized Session</label>
                            <select
                                value={selectedExamId || ''}
                                onChange={(e) => setSelectedExamId(e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer"
                            >
                                <option value="">Select Session...</option>
                                {exams.filter(e => e.status === 'Finalized').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {selectedExamId ? (
                        <div className="space-y-12 pb-12">
                            {/* School Top 3 */}
                            <div>
                                <h3 className="text-xl font-black text-center mb-8 uppercase text-slate-800 dark:text-white">Overall School Top Positions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto">
                                    {[2, 1, 3].map((pos) => {
                                        const res = examResults.find(r => r.examId === selectedExamId && r.schoolPosition === pos);
                                        if (!res) return <div key={pos} className="hidden md:block"></div>;
                                        const student = students.find(s => s.id === res.studentId);
                                        return (
                                            <div key={pos} className={cn(
                                                "glass-card p-6 md:p-8 flex flex-col items-center text-center relative animate-in slide-in-from-bottom-8 duration-700 shadow-xl",
                                                pos === 1 ? "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 scale-100 md:scale-110 z-10 order-1 md:order-2 dark:from-white/10 dark:to-white/5 dark:border-white/20" :
                                                    pos === 2 ? "bg-slate-50 border-slate-200 order-2 md:order-1 dark:bg-white/5 dark:border-white/10" : "bg-orange-50 border-orange-200 order-3 dark:bg-white/5 dark:border-white/10"
                                            )}>
                                                <div className={cn(
                                                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-4 ring-white",
                                                    pos === 1 ? "bg-amber-400" : pos === 2 ? "bg-slate-300" : "bg-orange-300"
                                                )}>
                                                    <Trophy className="w-8 h-8 text-white" />
                                                </div>
                                                <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm leading-tight">{student?.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1">{student?.id} • {student?.class}</p>
                                                <div className="my-4">
                                                    <p className="text-3xl font-black text-slate-800 dark:text-white">{res.percentage.toFixed(1)}%</p>
                                                </div>
                                                <span className="px-3 py-1 bg-white/50 rounded-full text-[9px] font-black uppercase text-slate-500 tracking-widest border border-slate-200">
                                                    School Position #{pos}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Campus Top 3 (Grouped by Campus) */}
                            {Array.from(new Set(students.map(s => s.campus))).filter(Boolean).map(campus => {
                                const campusResults = examResults.filter(r => r.examId === selectedExamId && r.campusPosition && r.campusPosition <= 3 && students.find(s => s.id === r.studentId)?.campus === campus);
                                if (campusResults.length === 0) return null;
                                return (
                                    <div key={campus} className="pt-8 border-t border-slate-200 dark:border-white/10">
                                        <h3 className="text-lg font-black text-center mb-8 uppercase text-slate-600 dark:text-slate-300">{campus} Top Positions</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
                                            {[2, 1, 3].map((pos) => {
                                                const res = campusResults.find(r => r.campusPosition === pos);
                                                if (!res) return <div key={pos} className="hidden md:block"></div>;
                                                const student = students.find(s => s.id === res.studentId);
                                                return (
                                                    <div key={pos} className={cn(
                                                        "bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5 md:p-6 rounded-2xl md:rounded-[2rem] flex flex-col items-center text-center relative border border-slate-200 dark:border-white/10 focus-within:ring",
                                                        pos === 1 ? "scale-100 z-10 order-1 md:order-2 ring-2 ring-brand-primary/20 dark:ring-brand-accent/20" :
                                                            pos === 2 ? "order-2 md:order-1" : "order-3"
                                                    )}>
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-md",
                                                            pos === 1 ? "bg-amber-100 text-amber-600" : pos === 2 ? "bg-slate-100 text-slate-500" : "bg-orange-100 text-orange-600"
                                                        )}>
                                                            <Medal className="w-5 h-5" />
                                                        </div>
                                                        <h4 className="font-black text-slate-700 dark:text-white uppercase text-xs">{student?.name}</h4>
                                                        <p className="text-[9px] font-bold text-slate-400 my-1">{student?.class}</p>
                                                        <p className="text-xl font-black text-brand-primary dark:text-brand-accent">{res.percentage.toFixed(1)}%</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center glass-card border-dashed">
                            <Award className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Select an Active Session</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'custom' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl p-5 md:p-10 rounded-2xl md:rounded-[var(--brand-radius,2.5rem)] border border-white/20 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity hidden md:block">
                            <Award className="w-64 h-64 text-brand-primary" />
                        </div>

                        <div className="relative">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8 md:mb-10">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-primary/10 rounded-xl md:rounded-[var(--brand-radius,1.5rem)] flex items-center justify-center shadow-inner">
                                    <Award className="w-6 h-6 md:w-8 md:h-8 text-brand-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Generate Special Award</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] md:text-sm">Create luxury certificates for varied ceremonies</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-5xl">
                                <div className="space-y-2 md:space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Student Full Name</label>
                                    <input
                                        type="text"
                                        value={customCert.name}
                                        onChange={(e) => setCustomCert({ ...customCert, name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 md:p-5 rounded-xl md:rounded-[var(--brand-radius,1rem)] text-sm font-bold outline-none dark:text-white"
                                        placeholder="e.g. Muhammad Ali"
                                    />
                                </div>
                                <div className="space-y-2 md:space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Award Category</label>
                                    <input
                                        type="text"
                                        value={customCert.category}
                                        onChange={(e) => setCustomCert({ ...customCert, category: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 md:p-5 rounded-xl md:rounded-[var(--brand-radius,1rem)] text-sm font-bold outline-none dark:text-white"
                                        placeholder="e.g. Sports Excellence"
                                    />
                                </div>
                                <div className="space-y-2 md:space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Position / Achievement</label>
                                    <input
                                        type="text"
                                        value={customCert.position}
                                        onChange={(e) => setCustomCert({ ...customCert, position: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 md:p-5 rounded-xl md:rounded-[var(--brand-radius,1rem)] text-sm font-bold outline-none dark:text-white"
                                        placeholder="e.g. 1st Position"
                                    />
                                </div>
                                <div className="space-y-2 md:space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Event / Occasion</label>
                                    <input
                                        type="text"
                                        value={customCert.event}
                                        onChange={(e) => setCustomCert({ ...customCert, event: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 md:p-5 rounded-xl md:rounded-[var(--brand-radius,1rem)] text-sm font-bold outline-none dark:text-white"
                                        placeholder="e.g. Annual Gala 2026"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 md:mt-12 pt-6 md:pt-10 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center gap-4 md:gap-6">
                                <button
                                    onClick={() => {
                                        if (!customCert.name || !customCert.category || !customCert.position || !customCert.event) {
                                            Swal.fire({ title: 'Wait!', text: 'Fill all details.', icon: 'warning' });
                                            return;
                                        }
                                        const data = {
                                            student: { name: customCert.name },
                                            isCustom: true,
                                            category: customCert.category,
                                            position: customCert.position,
                                            event: customCert.event,
                                            date: customCert.date
                                        };
                                        setCertificateData(data);
                                        handlePrintCertificate(data);
                                    }}
                                    className="w-full md:w-auto bg-brand-primary text-white px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-[var(--brand-radius,2rem)] text-[11px] md:text-sm font-black shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
                                >
                                    <Printer className="w-5 h-5" />
                                    Generate Certificate
                                </button>
                                <p className="text-slate-400 text-[10px] font-bold italic w-full md:w-auto text-center md:text-left">Note: Professional 3D Luxury Branding theme.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
                            {[
                                { title: 'Victory Shield', icon: Trophy, color: 'bg-amber-50 text-amber-600', sub: 'Optimized for sports and competitions' },
                                { title: 'Star Performance', icon: Star, color: 'bg-blue-50 text-blue-600', sub: 'Perfect for academic stars and behaviors' },
                                { title: 'Culture Award', icon: Users, color: 'bg-rose-50 text-rose-600', sub: 'Ideal for arts and social events' }
                            ].map((card, idx) => (
                                <div key={idx} className="bg-white/60 dark:bg-white/5 p-8 rounded-[var(--brand-radius,2rem)] border border-white/20 shadow-xl hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-2">
                                    <div className={cn("w-14 h-14 rounded-[var(--brand-radius,1rem)] flex items-center justify-center mb-6 transition-all group-hover:scale-110", card.color)}>
                                        <card.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-black text-xl text-slate-800 dark:text-white tracking-tight">{card.title}</h3>
                                    <p className="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed uppercase tracking-wider">{card.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
