import { useState, useRef } from 'react';
import {
    Plus, Trophy, BookOpen, Users, Calendar,
    CheckCircle2, AlertCircle, Trash2, Medal, Calculator, Save,
    Printer, Award, Star, Sparkles, ClipboardList
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';

export const Exams = () => {
    const {
        exams, examResults, addExam, deleteExam,
        inputMarks, finalizeResults, classes,
        classSubjects, students, currentUser,
        settings, teachers
    } = useStore();

    const userProfile = teachers.find(t => t.id === currentUser?.id);
    const isAdmin = currentUser?.role === 'admin';
    const canManageSpecialAwards = isAdmin;
    const canFinalizeResults = isAdmin || userProfile?.permissions?.includes('results_manage');
    const canManageSessions = isAdmin;

    const [activeTab, setActiveTab] = useState<'manage' | 'marks' | 'results' | 'custom'>('manage');
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [certificateData, setCertificateData] = useState<any>(null);
    const [customCert, setCustomCert] = useState({
        name: '',
        category: '',
        position: '',
        event: '',
        date: new Date().toLocaleDateString()
    });

    const certificateRef = useRef<HTMLDivElement>(null);

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
                const checkedClasses = Array.from(document.querySelectorAll('input[name="exam-classes"]:checked'))
                    .map(el => (el as HTMLInputElement).value);

                if (!name) { Swal.showValidationMessage('Name is required'); return null; }
                if (checkedClasses.length === 0) { Swal.showValidationMessage('Select at least one class'); return null; }

                return { name, classes: checkedClasses };
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

    const handlePrintResultCard = (data: any) => {
        const { student, result, exam } = data;
        if (!student || !result || !exam) return;

        const WindowPrt = window.open('', '', 'left=0,top=0,width=1000,height=1200,toolbar=0,scrollbars=0,status=0');
        if (!WindowPrt) return;

        // Ensure we get all subjects for the class to show them even if marks are missing
        const classTitle = result.className;
        const allClassSubjects = classSubjects[classTitle] || Object.keys(result.marks || {});

        const primaryColor = settings.themeColors?.primary || '#003366';
        const accentColor = settings.themeColors?.accent || '#fbbf24';

        WindowPrt.document.write(`
            <html>
                <head>
                    <title>Official Performance Transcript - ${student.name}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Outfit:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap" rel="stylesheet">
                    <style>
                        :root {
                            --brand-primary: ${primaryColor};
                            --brand-accent: ${accentColor};
                        }
                        
                        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
                        body { 
                            margin: 0; padding: 0; 
                            font-family: 'Outfit', sans-serif; 
                            background: #f1f5f9; 
                            display: flex; justify-content: center;
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
                            padding: 2mm;
                            position: relative;
                            display: flex;
                            flex-direction: column;
                        }
                        
                        .inner-frame {
                            height: 100%;
                            width: 100%;
                            border: 0.5mm solid var(--brand-primary);
                            padding: 6mm;
                            display: flex;
                            flex-direction: column;
                            position: relative;
                            background: white;
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
                            font-family: 'Playfair Display', serif;
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
                            font-family: 'Cinzel', serif;
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
                            font-size: 7pt;
                            font-weight: 800;
                            color: #94a3b8;
                            text-transform: uppercase;
                            display: block;
                            margin-bottom: 2px;
                        }
                        .profile-item span {
                            font-size: 10.5pt;
                            font-weight: 800;
                            color: var(--brand-primary);
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
                            border-collapse: collapse;
                            border: 1px solid #cbd5e1;
                        }
                        th {
                            background: #f1f5f9;
                            color: var(--brand-primary);
                            font-size: 8.5pt;
                            font-weight: 800;
                            text-transform: uppercase;
                            padding: 10px;
                            border: 1px solid #cbd5e1;
                            text-align: center;
                        }
                        td {
                            padding: 8px 10px;
                            font-size: 9.5pt;
                            font-weight: 600;
                            border: 1px solid #e2e8f0;
                            text-align: center;
                        }
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
                                        <h1>${settings.schoolName || 'PIONEER’S SUPERIOR'}</h1>
                                        <p>${settings.subTitle || 'Institute of Higher Secondary Education'}</p>
                                    </div>
                                    <div class="logo-container">
                                        <img src="${settings.logo2 || settings.logo1 || ''}">
                                    </div>
                                </div>

                                <div class="document-banner">STUDENT PROGRESS REPORT CARD</div>

                                <div class="profile-section">
                                    <div class="profile-item"><label>Student Name</label><span>${student.name}</span></div>
                                    <div class="profile-item"><label>Father's Name</label><span>${student.fatherName || '---'}</span></div>
                                    <div class="profile-item"><label>Admission No</label><span>${student.admissionId || student.id}</span></div>
                                    <div class="profile-item"><label>Class / Wing</label><span>${result.className}</span></div>
                                    <div class="profile-item"><label>Examination</label><span>${exam.name}</span></div>
                                    <div class="profile-item"><label>Academic Roll</label><span>${student.manualId || 'N/A'}</span></div>
                                    <div class="profile-item"><label>Session</label><span>${settings.academicSession || '2025-26'}</span></div>
                                    <div class="profile-item"><label>Date Analysis</label><span>${new Date().toLocaleDateString('en-GB')}</span></div>
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
                                            ${allClassSubjects.map(subName => {
            const m = result.marks[subName] || { obtained: 0, total: 100 };
            const perc = (m.obtained / m.total) * 100;
            const barColor = perc >= 80 ? '#10b981' : perc >= 60 ? '#3b82f6' : perc >= 40 ? '#f59e0b' : '#ef4444';
            let g = 'F';
            if (perc >= 90) g = 'A+'; else if (perc >= 80) g = 'A'; else if (perc >= 70) g = 'B';
            else if (perc >= 60) g = 'C'; else if (perc >= 50) g = 'D';

            return `
                                                    <tr>
                                                        <td class="subject-name">${subName}</td>
                                                        <td>${m.total}</td>
                                                        <td style="font-weight: 800; color: var(--brand-primary)">${m.obtained}</td>
                                                        <td style="font-weight: 700; color: #64748b">${perc.toFixed(0)}%</td>
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
                                        <div><div class="summary-label">Aggregate Marks</div><div class="summary-value">${result.totalObtained} <span style="font-size: 12pt; opacity: 0.4">/ ${result.totalPossible}</span></div></div>
                                        <div style="text-align: right"><div class="summary-label">Total Percentage</div><div class="summary-accent">${result.percentage.toFixed(1)}%</div></div>
                                    </div>
                                    <div class="summary-box">
                                        <div><div class="summary-label">Merit Rank</div><div class="summary-value">#${result.position || '---'}</div></div>
                                        <div style="text-align: right"><div class="summary-label">Final Grade</div><div class="summary-accent" style="color: var(--brand-primary)">${result.grade}</div></div>
                                    </div>
                                </div>

                                <div class="remarks-area">
                                    <h4>Institutional Assessment Remarks</h4>
                                    <p>${result.remarks || 'Performance evaluated based on standardized academic parameters. Continuous improvement in consistency will lead to superior competitive outcomes.'}</p>
                                </div>

                                <div class="signature-row">
                                    <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Class In-charge</div></div>
                                    <div class="seal-box">SYSTEM GENERATED<br>OFFICIAL<br>VERIFIED</div>
                                    <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Principal / Dean</div></div>
                                </div>

                                <div class="qr-code">
                                    <div style="width: 100%; height: 100%; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 5pt; color: #cbd5e1; text-align: center">SECURE<br>TRANSCRIPT<br>ID</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.onafterprint = function() { window.close(); };
                            }, 800);
                        };
                    </script>
                </body>
            </html>
        `);
        WindowPrt.document.close();
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
    const selectedExam = exams.find(e => e.id === selectedExamId);

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black tracking-tighter uppercase text-brand-primary dark:text-brand-accent leading-none">Academic Portal</h2>
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded-full">Automated</span>
                </div>
                {canManageSessions && (
                    <button
                        onClick={handleCreateExam}
                        className="px-4 py-2 bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary rounded-[var(--brand-radius,0.75rem)] text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
                    >
                        <Plus className="w-3.5 h-3.5" /> Initialize Exam
                    </button>
                )}
            </div>

            {/* Main Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-brand-accent/5 p-1 rounded-[var(--brand-radius,0.75rem)] w-fit border dark:border-brand-accent/10">
                {[
                    { id: 'manage', label: 'Sessions', icon: Calendar, visible: true },
                    { id: 'marks', label: 'Marks', icon: Save, visible: true },
                    { id: 'results', label: 'Standings', icon: Trophy, visible: true },
                    { id: 'custom', label: 'Special', icon: Award, visible: canManageSpecialAwards }
                ].filter(t => t.visible).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded-[var(--brand-radius,0.5rem)] text-[9px] font-black uppercase tracking-widest transition-all",
                            activeTab === tab.id
                                ? "bg-white dark:bg-brand-accent text-brand-primary shadow-sm"
                                : "text-slate-400"
                        )}
                    >
                        <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                ))}
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
                            <div key={exam.id} className="group relative bg-white dark:bg-[#000816] rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
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
                                            {exam.classes.map(c => (
                                                <span key={c} className="px-2 py-1 bg-slate-50 dark:bg-white/5 text-[8px] font-black text-brand-primary dark:text-brand-accent/80 rounded-lg border border-slate-100 dark:border-white/5 uppercase">{c}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-white/5">
                                        <button
                                            onClick={() => { setSelectedExamId(exam.id); setActiveTab('marks'); }}
                                            className="flex-1 py-2.5 bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary rounded-[var(--brand-radius,0.75rem)] text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                                        >
                                            Open Portal
                                        </button>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteExam(exam.id)}
                                                className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-[var(--brand-radius,0.75rem)] hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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
                    <div className="glass-card p-4 flex flex-wrap items-center gap-4 dark:border-brand-accent/10 dark:bg-brand-accent/5">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[8px] font-black uppercase text-slate-400 dark:text-brand-accent/40 tracking-widest block mb-1">Select Exam</label>
                            <select
                                value={selectedExamId || ''}
                                onChange={(e) => { setSelectedExamId(e.target.value); setSelectedClass(null); setSelectedStudentId(null); }}
                                className="w-full p-2.5 bg-slate-50 dark:bg-white/5 rounded-[var(--brand-radius,0.75rem)] border-none text-[11px] font-black uppercase text-brand-primary dark:text-brand-accent outline-none"
                            >
                                <option value="">CHOOSE SESSION</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        {selectedExamId && (
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-[8px] font-black uppercase text-slate-400 dark:text-brand-accent/40 tracking-widest block mb-1">Select Class</label>
                                <select
                                    value={selectedClass || ''}
                                    onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudentId(null); }}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 rounded-[var(--brand-radius,0.75rem)] border-none text-[11px] font-black uppercase text-brand-primary dark:text-brand-accent outline-none"
                                >
                                    <option value="">CHOOSE CLASS</option>
                                    {exams.find(e => e.id === selectedExamId)?.classes.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                        {selectedClass && (
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-[8px] font-black uppercase text-slate-400 dark:text-brand-accent/40 tracking-widest block mb-1">Select Student</label>
                                <select
                                    value={selectedStudentId || ''}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 rounded-[var(--brand-radius,0.75rem)] border-none text-[11px] font-black uppercase text-brand-primary dark:text-brand-accent outline-none"
                                >
                                    <option value="">CHOOSE STUDENT</option>
                                    {students.filter(s => s.class === selectedClass).map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {selectedExamId && selectedClass && selectedStudentId ? (
                        <div className="glass-card overflow-hidden">
                            <div className="p-6 bg-brand-primary text-white flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest">Student Marks Sheet</h4>
                                    <p className="text-[10px] opacity-70 font-bold">
                                        {students.find(s => s.id === selectedStudentId)?.name} • {selectedClass} • {selectedExam?.name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {canFinalizeResults && (
                                        <button
                                            onClick={() => handleFinalize(selectedExamId, selectedClass)}
                                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                        >
                                            <Calculator className="w-3 h-3" /> Finalize Result & Rank
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto custom-scrollbar">
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
                                            const subjectData = result?.marks[subject] || { obtained: 0, total: 100 };

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
                                                        {subjectData.obtained > 0 ? (
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
                                                                type="number"
                                                                value={subjectData.obtained || ''}
                                                                onChange={(e) => inputMarks(selectedExamId, selectedClass, selectedStudentId, subject, Number(e.target.value), subjectData.total)}
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
                    <div className="glass-card p-4 flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">Select Session</label>
                            <select
                                value={selectedExamId || ''}
                                onChange={(e) => { setSelectedExamId(e.target.value); setSelectedClass(null); }}
                                className="w-full p-2.5 bg-slate-50 dark:bg-white/5 rounded-[var(--brand-radius,0.75rem)] border-none text-[11px] font-black uppercase text-brand-primary dark:text-brand-accent outline-none"
                            >
                                <option value="">CHOOSE SESSION</option>
                                {exams.filter(e => e.status === 'Finalized').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        {selectedExamId && (
                            <div className="flex-1 min-w-[200px]">
                                <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">Select Class</label>
                                <select
                                    value={selectedClass || ''}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 rounded-[var(--brand-radius,0.75rem)] border-none text-[11px] font-black uppercase text-brand-primary dark:text-brand-accent outline-none"
                                >
                                    <option value="">CHOOSE CLASS</option>
                                    {exams.find(e => e.id === selectedExamId)?.classes.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {selectedExamId && selectedClass ? (
                        <div className="space-y-8">
                            {/* Podium (Top 3) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                {[2, 1, 3].map((pos) => {
                                    const res = examResults.find(r => r.examId === selectedExamId && r.className === selectedClass && r.position === pos);
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

                                            <button
                                                onClick={() => {
                                                    const data = { student, result: res, exam: selectedExam };
                                                    setCertificateData(data);
                                                    handlePrintCertificate(data);
                                                }}
                                                className="px-4 py-2 bg-brand-primary text-white rounded-[var(--brand-radius,0.5rem)] text-[8px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                                            >
                                                <Printer className="w-3 h-3" /> Print Certificate
                                            </button>

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
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Institutional Merit List</h4>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Class Strength: {students.filter(s => s.class === selectedClass).length}</span>
                                </div>
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full min-w-[1000px]">
                                        <thead className="bg-white">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-[9px] font-black uppercase text-slate-300 tracking-widest sticky left-0 bg-white z-10 border-r border-slate-50">Pos</th>
                                                <th className="px-6 py-4 text-left text-[9px] font-black uppercase text-slate-300 tracking-widest">Student Name</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest">Subjects</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest">Total</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest">Percentage</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest">Grade</th>
                                                <th className="px-6 py-4 text-left text-[9px] font-black uppercase text-slate-300 tracking-widest">AI Assessment Remarks</th>
                                                <th className="px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest sticky right-0 bg-white z-10 border-l border-slate-50">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {examResults
                                                .filter(r => r.examId === selectedExamId && r.className === selectedClass)
                                                .sort((a, b) => b.percentage - a.percentage)
                                                .map((res, index) => {
                                                    const student = students.find(s => s.id === res.studentId);
                                                    return (
                                                        <tr key={res.studentId} className={cn(
                                                            "group hover:bg-slate-50 transition-colors",
                                                            index < 3 ? "bg-blue-50/20" : ""
                                                        )}>
                                                            <td className="px-6 py-4 sticky left-0 bg-white dark:bg-slate-900 z-10 group-hover:bg-slate-100 transition-colors border-r border-slate-50">
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
                                                                <div className="flex items-start gap-2 group/remark max-w-[280px]">
                                                                    <div className="mt-0.5 p-1 rounded-md bg-indigo-50 text-indigo-500 shrink-0">
                                                                        <Sparkles className="w-3 h-3" />
                                                                    </div>
                                                                    <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                                                                        {res.remarks || 'Wait for finalization...'}
                                                                    </p>
                                                                </div>
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

            {activeTab === 'custom' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl p-10 rounded-[var(--brand-radius,2.5rem)] border border-white/20 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Award className="w-64 h-64 text-brand-primary" />
                        </div>

                        <div className="relative">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-16 h-16 bg-brand-primary/10 rounded-[var(--brand-radius,1.5rem)] flex items-center justify-center shadow-inner">
                                    <Award className="w-8 h-8 text-brand-primary" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Generate Special Award</h2>
                                    <p className="text-slate-500 font-bold text-sm">Create luxury certificates for sports, arts, and ceremonies</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Student Full Name</label>
                                    <input
                                        type="text"
                                        value={customCert.name}
                                        onChange={(e) => setCustomCert({ ...customCert, name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 rounded-[var(--brand-radius,1rem)] text-sm font-bold focus:ring-4 ring-brand-primary/10 outline-none transition-all hover:bg-white dark:hover:bg-white/10 dark:text-white"
                                        placeholder="e.g. Muhammad Ali"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Award Category</label>
                                    <input
                                        type="text"
                                        value={customCert.category}
                                        onChange={(e) => setCustomCert({ ...customCert, category: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 rounded-[var(--brand-radius,1rem)] text-sm font-bold focus:ring-4 ring-brand-primary/10 outline-none transition-all hover:bg-white dark:hover:bg-white/10 dark:text-white"
                                        placeholder="e.g. Sports Excellence, Arts & Crafts"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Position / Achievement</label>
                                    <input
                                        type="text"
                                        value={customCert.position}
                                        onChange={(e) => setCustomCert({ ...customCert, position: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 rounded-[var(--brand-radius,1rem)] text-sm font-bold focus:ring-4 ring-brand-primary/10 outline-none transition-all hover:bg-white dark:hover:bg-white/10 dark:text-white"
                                        placeholder="e.g. 1st Position, Winner, Outstanding Performance"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Event / Occasion</label>
                                    <input
                                        type="text"
                                        value={customCert.event}
                                        onChange={(e) => setCustomCert({ ...customCert, event: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 rounded-[var(--brand-radius,1rem)] text-sm font-bold focus:ring-4 ring-brand-primary/10 outline-none transition-all hover:bg-white dark:hover:bg-white/10 dark:text-white"
                                        placeholder="e.g. Annual Sports Gala 2026"
                                    />
                                </div>
                            </div>

                            <div className="mt-12 pt-10 border-t border-slate-100 flex flex-wrap items-center gap-6">
                                <button
                                    onClick={() => {
                                        if (!customCert.name || !customCert.category || !customCert.position || !customCert.event) {
                                            Swal.fire({
                                                title: 'Wait!',
                                                text: 'Please fill in all the details to generate the certificate.',
                                                icon: 'warning',
                                                confirmButtonColor: 'var(--brand-primary)'
                                            });
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
                                    className="bg-brand-primary text-white px-12 py-5 rounded-[var(--brand-radius,2rem)] text-sm font-black shadow-2xl shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group"
                                >
                                    <Printer className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                    Generate & Print Luxury Certificate
                                </button>
                                <p className="text-slate-400 text-xs font-bold italic">Note: These certificates use the same 3D Luxury Branding theme.</p>
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
