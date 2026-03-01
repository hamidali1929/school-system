import {
    ShieldCheck,
    MessageCircle,
    Calendar,
    UserCircle,
    ChevronRight,
    CreditCard,
    TrendingUp,
    Download,
    Award,
    Clock,
    Bell,
    ClipboardList,
    Wallet,
    Send,
    Activity,
    Printer
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useState } from 'react';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';
import { FeeVoucher } from '../components/FeeVoucher';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    type ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const StudentPanel = ({
    activeTab: externalTab,
    onNavigate
}: {
    activeTab?: 'overview' | 'academic' | 'attendance' | 'fees' | 'communication',
    onNavigate?: (id: string) => void
}) => {
    const { students, attendance, examResults, currentUser, exams, settings, classSubjects } = useStore();
    const [showFeeVoucher, setShowFeeVoucher] = useState(false);
    const [internalTab, setInternalTab] = useState<'overview' | 'academic' | 'attendance' | 'fees' | 'communication'>('overview');

    // Security: Student portal is strictly locked to the authenticated user's ID
    const student = students.find(s => s.id === currentUser?.id);

    // Exam Selection State
    const finalizedExams = exams.filter(e => e.status === 'Finalized');
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

    const activeTab = externalTab || internalTab;

    const handleTabChange = (tabId: string) => {
        // Map student internal IDs to Sidebar IDs
        const sidebarMap: Record<string, string> = {
            'overview': 'dashboard',
            'academic': 'academic',
            'attendance': 'attendance_log',
            'fees': 'fees_ledger',
            'communication': 'communication'
        };

        if (onNavigate) {
            onNavigate(sidebarMap[tabId] || tabId);
        } else {
            setInternalTab(tabId as any);
        }
    };

    // Data Resolution
    const currentExamId = selectedExamId || (finalizedExams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.id);
    const selectedExam = exams.find(e => e.id === currentExamId);
    const selectedResult = student ? examResults.find(r => r.studentId === student.id && r.examId === currentExamId) : null;

    const handlePrintResultCard = () => {
        if (!student || !selectedResult || !selectedExam) {
            Swal.fire({
                title: 'Result Not Found',
                text: 'Selected examination result does not exist in our institutional database.',
                icon: 'error',
                background: 'var(--glass-bg)',
                color: 'var(--brand-accent)'
            });
            return;
        }

        const WindowPrt = window.open('', '', 'left=0,top=0,width=1000,height=1200,toolbar=0,scrollbars=0,status=0');
        if (!WindowPrt) return;

        const classTitle = selectedResult.className;
        const allClassSubjects = classSubjects[classTitle] || Object.keys(selectedResult.marks || {});
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
                        body { margin: 0; padding: 0; font-family: 'Outfit', sans-serif; background: #white; color: #1e293b; display: flex; justify-content: center; }
                        @page { size: A4; margin: 0; }
                        .page-container { width: 210mm; height: 297mm; background: white; padding: 10mm; position: relative; overflow: hidden; }
                        .outer-frame { height: 100%; width: 100%; border: 1.5mm solid var(--brand-primary); padding: 2mm; position: relative; display: flex; flex-direction: column; }
                        .inner-frame { height: 100%; width: 100%; border: 0.5mm solid var(--brand-primary); padding: 6mm; display: flex; flex-direction: column; position: relative; background: white; }
                        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6mm; border-bottom: 3px double var(--brand-primary); padding-bottom: 4mm; }
                        .logo-container { width: 30mm; height: 30mm; display: flex; align-items: center; justify-content: center; }
                        .logo-container img { max-width: 100%; max-height: 100%; object-fit: contain; }
                        .school-info { text-align: center; flex: 1; }
                        .school-info h1 { margin: 0; font-family: 'Playfair Display', serif; font-size: 28pt; color: var(--brand-primary); text-transform: uppercase; letter-spacing: -0.5px; }
                        .school-info p { margin: 1mm 0 0; font-size: 9.5pt; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 2.5px; }
                        .document-banner { background: var(--brand-primary); color: white; text-align: center; padding: 3mm; font-family: 'Cinzel', serif; font-size: 13pt; letter-spacing: 4px; margin-bottom: 6mm; border-radius: 8px; }
                        .profile-section { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-bottom: 6mm; }
                        .profile-item { background: #f8fafc; padding: 8px 12px; border-radius: 10px; border: 1px solid #e2e8f0; }
                        .profile-item label { font-size: 8pt; font-weight: 800; color: #475569; text-transform: uppercase; display: block; margin-bottom: 2px; }
                        .profile-item span { font-size: 11.5pt; font-weight: 900; color: #0f172a; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                        table { width: 100%; border-collapse: collapse; border: 2px solid #0f172a; margin-bottom: 6mm; }
                        th { background: #f1f5f9; color: var(--brand-primary); font-size: 8.5pt; font-weight: 800; text-transform: uppercase; padding: 10px; border: 2px solid #0f172a; text-align: center; }
                        td { padding: 8px 10px; font-size: 9.5pt; font-weight: 600; border: 2px solid #0f172a; text-align: center; }
                        .subject-name { text-align: left; font-weight: 800; color: var(--brand-primary); background: #fcfdfe; }
                        .bar-container { width: 100%; max-width: 120px; height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden; margin: 4px auto; }
                        .bar-fill { height: 100%; border-radius: 10px; }
                        .grade-badge { background: var(--brand-primary); color: white; padding: 2px 8px; border-radius: 4px; font-weight: 900; }
                        .summary-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 15px; margin-bottom: 6mm; }
                        .summary-box { border: 2px solid var(--brand-primary); border-radius: 15px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to right, white, #f8fafc); }
                        .summary-label { font-size: 8pt; font-weight: 800; color: #64748b; text-transform: uppercase; }
                        .summary-value { font-size: 22pt; font-weight: 900; color: var(--brand-primary); }
                        .summary-accent { font-size: 26pt; font-weight: 900; color: var(--brand-accent); }
                        .remarks-area { background: #fffbeb; border-left: 5px solid var(--brand-accent); padding: 12px 20px; border-radius: 0 12px 12px 0; margin-bottom: 10mm; }
                        .remarks-area h4 { margin: 0 0 4px; font-size: 8pt; color: #92400e; text-transform: uppercase; }
                        .remarks-area p { margin: 0; font-size: 10.5pt; font-weight: 600; font-style: italic; color: #451a03; }
                        .signature-row { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 10mm; margin-top: auto; }
                        .sig-block { text-align: center; width: 45mm; }
                        .sig-line { border-top: 1.5px solid var(--brand-primary); margin-bottom: 5px; opacity: 0.5; }
                        .sig-label { font-size: 8pt; font-weight: 800; color: #64748b; text-transform: uppercase; }
                        .watermark { position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%); width: 140mm; height: 140mm; opacity: 0.04; pointer-events: none; }
                    </style>
                </head>
                <body>
                    <div class="page-container">
                        <div class="outer-frame">
                            <div class="inner-frame">
                                <img src="${settings.logo1 || ''}" class="watermark">
                                <div class="header">
                                    <div class="logo-container"><img src="${settings.logo1 || ''}"></div>
                                    <div class="school-info">
                                        <h1>${settings.schoolName || 'PIONEER’S SUPERIOR'}</h1>
                                        <p>${settings.subTitle || 'Institute of Higher Secondary Education'}</p>
                                        ${student.campus ? `<div style="display: inline-block; background: #0f172a; color: #fff; padding: 4px 16px; border-radius: 20px; font-size: 9pt; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.2);">${student.campus}</div>` : ''}
                                        <div style="font-size: 14pt; font-weight: 800; color: var(--brand-primary); margin-top: 5px; text-transform: uppercase;">${selectedExam.name}</div>
                                    </div>
                                    <div class="logo-container"><img src="${settings.logo2 || settings.logo1 || ''}"></div>
                                </div>
                                <div class="document-banner">OFFICIAL PERFORMANCE TRANSCRIPT</div>

                                <div style="text-align: center; margin-bottom: 4mm; margin-top: 2mm;">
                                    <h2 style="margin: 0; font-size: 26pt; font-weight: 900; color: var(--brand-primary); text-transform: uppercase; letter-spacing: 1px;">${student.name}</h2>
                                </div>

                                <div class="profile-section" style="grid-template-columns: repeat(4, 1fr);">
                                    <div class="profile-item"><label>Father Name</label><span>${student.fatherName || '---'}</span></div>
                                    <div class="profile-item"><label>Admission No</label><span>${student.id}</span></div>
                                    <div class="profile-item"><label>Class</label><span>${selectedResult.className}</span></div>
                                    <div class="profile-item"><label>Session</label><span>${selectedExam.session || settings.academicSession || '2025-26'}</span></div>
                                </div>
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
            const m = selectedResult.marks[subName];
            return m && m.obtained !== undefined && String(m.obtained).trim() !== '';
        }).map(subName => {
            const m = selectedResult.marks[subName];
            const perc = (m.obtained / m.total) * 100;
            const barColor = perc >= 80 ? '#10b981' : perc >= 60 ? '#3b82f6' : perc >= 40 ? '#f59e0b' : '#ef4444';
            let g = 'F';
            if (perc >= 90) g = 'A+'; else if (perc >= 80) g = 'A'; else if (perc >= 70) g = 'B';
            else if (perc >= 60) g = 'C'; else if (perc >= 50) g = 'D';
            return `
                                                <tr>
                                                    <td class="subject-name">${subName}</td>
                                                    <td style="font-weight: 900; color: #0f172a; font-size: 10.5pt;">${m.total}</td>
                                                    <td style="font-weight: 900; color: #0f172a; font-size: 10.5pt;">${m.obtained}</td>
                                                    <td style="font-weight: 900; color: #64748b; font-size: 10.5pt;">${perc.toFixed(0)}%</td>
                                                    <td><div class="bar-container"><div class="bar-fill" style="width: ${perc}%; background: ${barColor}"></div></div></td>
                                                    <td><span class="grade-badge">${g}</span></td>
                                                </tr>
                                            `;
        }).join('')}
                                    </tbody>
                                </table>
                                <div class="summary-grid">
                                    <div class="summary-box">
                                        <div><div class="summary-label">Total Marks</div><div class="summary-value">${selectedResult.totalObtained} <span style="font-size: 15pt; opacity: 0.8; font-weight: 900;">/ ${selectedResult.totalPossible}</span></div></div>
                                        <div style="text-align: right"><div class="summary-label">Percentage</div><div class="summary-accent">${selectedResult.percentage.toFixed(1)}%</div></div>
                                    </div>
                                    <div class="summary-box">
                                        <div><div class="summary-label">Position</div><div class="summary-value">#${selectedResult.position || '---'}</div></div>
                                        <div style="text-align: right"><div class="summary-label">Grade</div><div class="summary-accent" style="color: var(--brand-primary)">${selectedResult.grade}</div></div>
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; margin-bottom: 10mm; padding-right: 10mm; padding-left: 0;">
                                    <div class="remarks-area" style="margin-bottom: 0; width: fit-content; min-width: 200px; max-width: 60%; padding-right: 40px;">
                                        <h4>Remarks</h4>
                                        <p>${selectedResult.remarks || 'Pending Finalization'}</p>
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
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.onafterprint = function() { window.close(); };
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        WindowPrt.document.close();
    };


    if (!student) return (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200">
            <UserCircle className="w-16 h-16 text-slate-300 mb-4 animate-pulse" />
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Accessing Institutional Student Node...</p>
        </div>
    );

    // Data Processing for Student Vectors
    const studentAttendance = attendance.filter(a => a.records.some(r => r.studentId === student.id));
    const totalDays = studentAttendance.length;
    const presentDays = studentAttendance.filter(a => a.records.find(r => r.studentId === student.id)?.status === 'Present').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Academic Data
    const studentResults = exams
        .filter(e => e.status === 'Finalized')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(exam => {
            const result = examResults.find(r => r.studentId === student.id && r.examId === exam.id);
            return {
                name: exam.name,
                percentage: result?.percentage || 0,
                grade: result?.grade || 'N/A'
            };
        });

    const latestExam = exams.filter(e => e.status === 'Finalized').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const latestResult = examResults.find(r => r.studentId === student.id && r.examId === latestExam?.id);


    // Chart Configuration
    const chartData = {
        labels: studentResults.length > 0 ? studentResults.map(r => r.name) : ['Cycle 1', 'Cycle 2', 'Cycle 3', 'Finals'],
        datasets: [{
            label: 'Academic Proficiency',
            data: studentResults.length > 0 ? studentResults.map(r => r.percentage) : [75, 82, 88, 92],
            borderColor: '#003366',
            backgroundColor: 'rgba(0, 51, 102, 0.05)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 6,
            pointBackgroundColor: '#fbbf24',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
        }]
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#001529',
                padding: 12,
                cornerRadius: 8,
                titleFont: { weight: 'bold' }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { callback: (val) => val + '%' }
            },
            x: { grid: { display: false } }
        }
    };

    // Timeline Events
    const timelineEvents = [
        ...studentAttendance.slice(-3).map(a => ({
            type: 'Attendance',
            title: 'Attendance Verified',
            details: `Marked ${a.records.find(r => r.studentId === student.id)?.status} in ${a.class}`,
            time: new Date(a.date).toLocaleDateString(),
            icon: Clock,
            color: 'bg-emerald-500'
        })),
        ...(latestResult ? [{
            type: 'Exam',
            title: 'Examination Result',
            details: `${latestExam.name}: ${latestResult.percentage}% Secured`,
            time: 'Recently',
            icon: Award,
            color: 'bg-amber-500'
        }] : [])
    ].sort((a, b) => b.time.localeCompare(a.time));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-outfit pb-20">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="space-y-6"
                >
                    {/* OVERVIEW / DASHBOARD TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* IDENTITY CARD */}
                            <div className="glass-card p-6 md:p-8 border-t-8 border-brand-primary relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform">
                                    <ShieldCheck size={200} className="text-brand-primary" />
                                </div>

                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                    <div className="flex items-center gap-8">
                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-tr from-brand-primary to-blue-600 p-1 md:p-1.5 shadow-2xl overflow-hidden hover:rotate-6 transition-transform">
                                            <div className="w-full h-full rounded-[1.8rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                                {student.avatar ? (
                                                    <img src={student.avatar} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl md:text-5xl font-black text-brand-primary">{(student.name || 'S').charAt(0)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl md:text-4xl font-[1000] tracking-tighter text-slate-800 dark:text-white uppercase leading-none">{student.name}</h2>
                                            <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">{student.class} • SID: {student.id}</p>
                                            <div className="hidden md:flex items-center gap-2 mt-4 text-emerald-600">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Institutional Profile Authenticated</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 w-full md:w-auto">
                                        <div className="p-3 md:p-5 bg-emerald-500/10 rounded-2xl md:rounded-3xl border border-emerald-500/10 text-center">
                                            <p className="text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 opacity-60">Attendance</p>
                                            <p className="text-lg md:text-2xl font-black text-emerald-700 dark:text-emerald-400">{attendancePercentage}%</p>
                                        </div>
                                        <div className="p-3 md:p-5 bg-amber-500/10 rounded-2xl md:rounded-3xl border border-amber-500/10 text-center">
                                            <p className="text-[8px] md:text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 opacity-60">Fee Balance</p>
                                            <p className="text-lg md:text-2xl font-black text-amber-700 dark:text-amber-400">Rs. {student.feesTotal - student.feesPaid}</p>
                                        </div>
                                        <div className="p-3 md:p-5 bg-indigo-500/10 rounded-2xl md:rounded-3xl border border-indigo-500/10 text-center col-span-2 sm:col-span-1">
                                            <p className="text-[8px] md:text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 opacity-60">Avg Grade</p>
                                            <p className="text-lg md:text-2xl font-black text-indigo-700 dark:text-indigo-400">{latestResult?.grade || '---'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Performance Chart */}
                                <div className="lg:col-span-8">
                                    <div className="glass-card p-6 md:p-8 h-full min-h-[400px] flex flex-col">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                                    <TrendingUp className="text-brand-primary" /> Growth Velocity
                                                </h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Academic Proficiency Track</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-[#fbbf24]"></div>
                                                <span className="text-[10px] font-black uppercase text-slate-400">Finalized Marks</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-h-[250px]">
                                            <Line data={chartData} options={chartOptions} />
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Timeline */}
                                <div className="lg:col-span-4">
                                    <div className="glass-card p-6 md:p-8 bg-slate-900 text-white min-h-[400px] flex flex-col border-none">
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                                            <Activity className="text-brand-accent" /> Recent Events
                                        </h3>
                                        <div className="flex-1 space-y-6">
                                            {timelineEvents.length > 0 ? (
                                                timelineEvents.map((event, i) => (
                                                    <div key={i} className="flex gap-4 relative">
                                                        {i !== timelineEvents.length - 1 && (
                                                            <div className="absolute left-4 top-10 w-0.5 h-10 bg-white/10"></div>
                                                        )}
                                                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg", event.color)}>
                                                            <event.icon size={16} className="text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase text-brand-accent tracking-widest">{event.title}</p>
                                                            <p className="text-xs font-bold text-white/90 leading-tight mt-0.5">{event.details}</p>
                                                            <p className="text-[9px] font-medium text-white/40 mt-1 uppercase">{event.time}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-48 opacity-20 text-center">
                                                    <Activity size={40} className="mb-4" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No activities detected</p>
                                                </div>
                                            )}
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleTabChange('academic')}
                                            className="w-full py-4 mt-8 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-accent hover:text-slate-950 transition-all duration-300 relative z-20"
                                        >
                                            View Full Registry
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Action Tiles */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { id: 'academic', label: 'Academic Hub', icon: Award, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                                    { id: 'attendance', label: 'Attendance', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                                    { id: 'fees', label: 'Financials', icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-500/10' },
                                    { id: 'communication', label: 'Liaison', icon: MessageCircle, color: 'text-indigo-600', bg: 'bg-indigo-500/10' }
                                ].map((tile) => (
                                    <motion.button
                                        key={tile.id}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleTabChange(tile.id as any)}
                                        className="group glass-card p-6 flex flex-col items-center gap-3 hover:bg-brand-primary hover:text-white transition-all duration-300 relative z-30 cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-brand-primary/20 pointer-events-auto"
                                    >
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:bg-white/20 group-hover:scale-110 shadow-inner", tile.bg)}>
                                            <tile.icon className={cn("w-7 h-7 transition-colors group-hover:text-white", tile.color)} />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white group-hover:text-white">{tile.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2️⃣ ACADEMIC SECTION */}
                    {activeTab === 'academic' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 space-y-6">
                                <div className="glass-card p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-white/5 gap-4">
                                        <div className="flex flex-col md:flex-row items-center gap-4 w-full sm:w-auto">
                                            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-3 whitespace-nowrap">
                                                <ClipboardList className="text-brand-primary" /> Marksheet Repository
                                            </h3>

                                            <select
                                                value={currentExamId || ''}
                                                onChange={(e) => setSelectedExamId(e.target.value)}
                                                className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary/20 w-full md:w-48"
                                            >
                                                {finalizedExams.map(exam => (
                                                    <option key={exam.id} value={exam.id} className="dark:bg-slate-900">
                                                        {exam.name}
                                                    </option>
                                                ))}
                                                {finalizedExams.length === 0 && <option>No Exams Found</option>}
                                            </select>
                                        </div>

                                        <button
                                            onClick={handlePrintResultCard}
                                            className="text-[9px] font-black text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-xl hover:bg-brand-primary hover:text-white transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                                        >
                                            <Printer size={14} /> Download Marksheet
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        {selectedResult ? (
                                            Object.entries(selectedResult.marks).map(([subject, marks]: [string, any], i) => (
                                                <div key={i} className="p-4 md:p-6 bg-white dark:bg-white/5 rounded-2xl md:rounded-[2rem] border border-slate-100 dark:border-white/10 flex justify-between items-center group hover:scale-[1.02] transition-all cursor-default">
                                                    <div>
                                                        <p className="text-xs md:text-sm font-black uppercase text-slate-800 dark:text-white">{subject}</p>
                                                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Assessment</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg md:text-2xl font-black text-brand-primary leading-none">{marks.obtained}/{marks.total}</p>
                                                        <p className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1.5">{Math.round((marks.obtained / marks.total) * 100)}% Proficiency</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 text-center py-12 md:py-24 opacity-30 italic uppercase text-[10px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.4em]">No assessments recorded</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-4 space-y-6">
                                <div className="glass-card p-8 border-l-8 border-brand-accent bg-amber-50 dark:bg-amber-500/5">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-600 mb-6 flex items-center gap-3">
                                        <Award size={16} /> Teacher Remarks
                                    </h4>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                        "{latestResult?.remarks || 'Pending Finalization'}"
                                    </p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-8 text-right">— Institutional Head of Faculty</p>
                                </div>
                                <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-[#001529] to-brand-primary text-white border-none shadow-2xl">
                                    <TrendingUp className="w-8 md:w-12 h-8 md:h-12 mb-4 md:mb-6 text-brand-accent animate-pulse" />
                                    <h4 className="font-black text-xl md:text-2xl mb-1 uppercase tracking-tighter">Performance Graph</h4>
                                    <p className="text-[8px] md:text-[10px] text-white/40 mb-6 md:mb-8 uppercase tracking-widest">Growth Velocity Analysis Node</p>
                                    <div className="flex items-end gap-2 md:gap-3 h-24 md:h-32">
                                        {[40, 85, 55, 95, 75, 100].map((h, i) => (
                                            <div key={i} className="flex-1 bg-white/10 rounded-t-lg md:rounded-t-[1rem] relative group overflow-hidden">
                                                <div className="absolute bottom-0 w-full bg-brand-accent group-hover:bg-white transition-all duration-700" style={{ height: `${h}%` }}></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 md:mt-6 px-1">
                                        <span className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-widest">Start</span>
                                        <span className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-widest">Final Status</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3️⃣ ATTENDANCE SECTION */}
                    {activeTab === 'attendance' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 space-y-6">
                                <div className="glass-card p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
                                        <h3 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                            <Calendar className="text-emerald-500" size={24} /> Daily Presence Log
                                        </h3>
                                        <div className="flex flex-wrap justify-center gap-3">
                                            <div className="flex items-center gap-2 bg-emerald-500/10 px-3 md:px-4 py-1.5 rounded-full border border-emerald-500/10">
                                                <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                <span className="text-[8px] md:text-[9px] font-black uppercase text-emerald-600 tracking-widest">Present</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-rose-500/10 px-3 md:px-4 py-1.5 rounded-full border border-rose-500/10">
                                                <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-rose-500" />
                                                <span className="text-[8px] md:text-[9px] font-black uppercase text-rose-600 tracking-widest">Absent</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1.5 md:gap-4">
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                            <div key={i} className="text-center text-[8px] md:text-[10px] font-black text-slate-400 py-2 md:py-3 border-b-2 border-slate-50 dark:border-white/5 tracking-widest">{d}</div>
                                        ))}
                                        {Array.from({ length: 31 }).map((_, i) => {
                                            const day = i + 1;
                                            const dateStr = new Date(new Date().getFullYear(), new Date().getMonth(), day).toISOString().split('T')[0];
                                            const dayRecord = studentAttendance.find(a => a.date === dateStr);
                                            const status = dayRecord?.records.find(r => r.studentId === student.id)?.status;

                                            return (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "aspect-square rounded-lg md:rounded-[1.5rem] border md:border-2 flex items-center justify-center text-[10px] md:text-xs font-black transition-all hover:scale-110 shadow-sm cursor-help",
                                                        status === 'Present' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
                                                            status === 'Absent' ? "bg-rose-500/10 border-rose-500/20 text-rose-600" :
                                                                status === 'Leave' ? "bg-amber-500/10 border-amber-500/20 text-amber-600" :
                                                                    dayRecord ? "bg-slate-100 border-slate-200 text-slate-400" :
                                                                        "bg-slate-50 border-slate-100 text-slate-300 dark:bg-white/5 dark:border-white/5"
                                                    )}
                                                >
                                                    {day}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-4 space-y-6">
                                <div className="glass-card p-6 md:p-10 text-center bg-white/50 dark:bg-slate-900/50 flex flex-col items-center">
                                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.4em] mb-6 md:mb-10">Monthly Presence Matrix</p>
                                    <div className="relative w-32 md:w-48 h-32 md:h-48 group">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-white/5 md:hidden" />
                                            <circle cx="96" cy="96" r="86" fill="none" stroke="currentColor" strokeWidth="16" className="hidden md:block text-slate-100 dark:text-white/5" />

                                            <circle
                                                cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8"
                                                strokeDasharray={351.85} strokeDashoffset={351.85 * (1 - attendancePercentage / 100)}
                                                className="text-emerald-500 md:hidden"
                                                strokeLinecap="round"
                                            />
                                            <circle
                                                cx="96" cy="96" r="86" fill="none" stroke="currentColor" strokeWidth="16"
                                                strokeDasharray={540.35} strokeDashoffset={540.35 * (1 - attendancePercentage / 100)}
                                                className="hidden md:block text-emerald-500 transition-all duration-1000 group-hover:stroke-brand-primary"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl md:text-5xl font-[1000] text-slate-800 dark:text-white leading-none tracking-tighter">{attendancePercentage}%</span>
                                            <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 md:mt-3">Verified</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => Swal.fire({
                                        title: 'Leave Application',
                                        text: 'Provide institutional reason for academic absence.',
                                        input: 'textarea',
                                        inputPlaceholder: 'Reason...',
                                        showCancelButton: true,
                                        confirmButtonText: 'Submit',
                                        confirmButtonColor: 'var(--brand-primary)',
                                        customClass: { popup: 'rounded-[2rem] font-outfit p-4 md:p-8' }
                                    })}
                                    className="w-full py-5 md:py-7 bg-brand-primary text-white rounded-2xl md:rounded-[2.5rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 md:gap-4"
                                >
                                    <Send size={18} /> Leave Terminal
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 4️⃣ FEE SECTION */}
                    {activeTab === 'fees' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 space-y-6">
                                <div className="glass-card p-12 bg-[#000d1a] text-white border-none relative overflow-hidden group min-h-[400px] flex flex-col justify-center">
                                    <div className="absolute top-0 right-0 p-16 opacity-[0.05] group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
                                        <CreditCard size={250} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-16">
                                            <div>
                                                <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Institutional Ledger Balance</p>
                                                <h3 className="text-6xl font-[1000] tracking-[ -0.05em] leading-none mb-2">Rs. {student.feesTotal - student.feesPaid}</h3>
                                                <div className="flex items-center gap-2 mt-4">
                                                    <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></div>
                                                    <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Settlement Required</p>
                                                </div>
                                            </div>
                                            <div className="p-5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">
                                                <Wallet className="text-brand-accent w-10 h-10" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-12">
                                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Institutional Credit (Paid)</p>
                                                <p className="text-3xl font-black text-white">Rs. {student.feesPaid}</p>
                                            </div>
                                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Outstanding Liability (Due)</p>
                                                <p className="text-3xl font-black text-brand-accent">Rs. {student.feesTotal - student.feesPaid}</p>
                                            </div>
                                        </div>
                                        <div className="mt-12">
                                            <button
                                                onClick={() => setShowFeeVoucher(true)}
                                                className="w-full py-6 bg-brand-accent text-[#000d1a] rounded-[2.2rem] text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(251,191,36,0.3)] flex items-center justify-center gap-4"
                                            >
                                                <Download size={20} /> Generate Digital Challan Node
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-4 space-y-6">
                                <div className="glass-card p-8 bg-white/50 dark:bg-slate-900/50 border-none h-full">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-4 text-slate-400">
                                        <Clock size={18} /> Financial History Log
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { date: 'FEB 15, 2026', amount: 'Rs. 4,500', type: 'Tuition' },
                                            { date: 'JAN 10, 2026', amount: 'Rs. 5,000', type: 'Enrollment' },
                                            { date: 'DEC 05, 2025', amount: 'Rs. 4,500', type: 'Tuition' },
                                            { date: 'NOV 12, 2025', amount: 'Rs. 2,000', type: 'Sports' },
                                        ].map((p, i) => (
                                            <div key={i} className="flex justify-between items-center p-5 bg-white dark:bg-slate-950 rounded-[1.8rem] border border-slate-100 dark:border-white/5 group hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all cursor-default">
                                                <div>
                                                    <p className="text-lg font-black text-slate-800 dark:text-white leading-none">{p.amount}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mt-2 tracking-widest">{p.type} Module • {p.date}</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5️⃣ COMMUNICATION SECTION */}
                    {activeTab === 'communication' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 space-y-6">
                                <div className="glass-card p-10 min-h-[550px] flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl">
                                    <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-100 dark:border-white/5">
                                        <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-slate-800 dark:text-white">
                                            <MessageCircle className="text-brand-primary" size={28} /> Teacher Liaison Hotline
                                        </h3>
                                        <div className="flex items-center gap-3 bg-emerald-500/10 px-5 py-2 rounded-2xl border border-emerald-500/10">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></span>
                                            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">End-to-End Encrypted</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center space-y-6 py-20 grayscale hover:grayscale-0 transition-all duration-1000">
                                        <div className="w-28 h-28 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shadow-inner border-2 border-slate-50 dark:border-white/5">
                                            <Send size={48} className="text-slate-400 -rotate-12" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">Secure Transmission History Empty</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 max-w-xs mx-auto leading-relaxed tracking-widest">Initiatve a professional academic query directly with your designated faculty advisors.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-5 mt-10 p-2 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-inner">
                                        <input
                                            className="flex-1 bg-transparent px-8 py-5 text-sm font-bold outline-none dark:text-white"
                                            placeholder="Encrypt and transmit message to faculty terminal..."
                                        />
                                        <button className="p-6 bg-brand-primary text-white rounded-[2rem] shadow-2xl shadow-brand-primary/40 hover:scale-110 active:scale-95 transition-all">
                                            <Send size={28} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-4 space-y-6">
                                <div className="glass-card p-10 bg-brand-primary text-white border-none shadow-2xl shadow-brand-primary/30 relative overflow-hidden h-full">
                                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-150 transition-all duration-1000">
                                        <Bell size={150} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-10">
                                            <div className="p-4 bg-white/10 rounded-[1.5rem] backdrop-blur-xl border border-white/10">
                                                <Bell className="text-brand-accent animate-bounce" size={28} />
                                            </div>
                                            <h4 className="text-2xl font-black uppercase tracking-tight">Institutional Briefings</h4>
                                        </div>
                                        <div className="space-y-6">
                                            {[
                                                { type: 'URGENT', details: 'Annual Academic Convocation registrations are now active at the main corridor terminal.', date: 'Posted 2 Hours Ago', color: 'bg-brand-accent text-brand-primary' },
                                                { type: 'NOTICE', details: 'Institutional Digital Archive expanded with new Physics and Mathematics academic journals.', date: 'Posted Today 09:00 AM', color: 'bg-white/20 text-white' },
                                                { type: 'UPDATE', details: 'Spring semester synchronization protocol for cloud calendars is now complete.', date: 'Posted Yesterday 04:30 PM', color: 'bg-white/20 text-white' }
                                            ].map((n, i) => (
                                                <div key={i} className="p-6 bg-white/10 rounded-[2.2rem] border border-white/10 hover:bg-white/20 transition-all cursor-alias group">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className={cn("text-[9px] font-[1000] px-4 py-1.5 rounded-full uppercase tracking-widest leading-none", n.color)}>{n.type}</span>
                                                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">{n.date}</span>
                                                    </div>
                                                    <p className="text-[13px] font-bold leading-relaxed uppercase tracking-tight group-hover:text-brand-accent transition-colors">{n.details}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-12 pt-8 border-t border-white/10">
                                            <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] hover:text-brand-accent transition-colors">
                                                Access Archives <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* VOUCHER MODAL */}
            {showFeeVoucher && (
                <FeeVoucher student={student} onClose={() => setShowFeeVoucher(false)} readOnly={true} />
            )}
        </div>
    );
};
