import { useState, useMemo, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import {
    TrendingUp, BarChart3, Trophy,
    Target, AlertCircle,
    Download, Zap, Activity, ShieldCheck,
    ChevronDown, GraduationCap, Laptop, Sparkles
} from 'lucide-react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, RadialLinearScale, Title, Tooltip,
    Legend, Filler
} from 'chart.js';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { cn } from '../utils/cn';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

export const Analytics = () => {
    const { students, exams, examResults, classes, settings } = useStore();
    const [selectedClass, setSelectedClass] = useState(classes[0] || '');
    const [selectedExam, setSelectedExam] = useState(exams[0]?.id || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const dashboardRef = useRef<HTMLDivElement>(null);
    const radarRef = useRef<any>(null);
    const barRef = useRef<any>(null);
    const growthRef = useRef<any>(null);

    // --- Kinetic Data Engine ---
    const stats = useMemo(() => {
        const classResults = examResults.filter(r => r.className === selectedClass && r.examId === selectedExam);
        if (classResults.length === 0) return null;

        const avgPercentage = classResults.reduce((acc, r) => acc + r.percentage, 0) / classResults.length;
        const topStudent = [...classResults].sort((a, b) => b.percentage - a.percentage)[0];
        const studentInfo = students.find(s => s.id === topStudent?.studentId);

        // Subject-wise Analysis
        const subjectsList = new Set<string>();
        classResults.forEach(r => Object.keys(r.marks).forEach(s => subjectsList.add(s)));

        const subjectStats = Array.from(subjectsList).map(subject => {
            const subjectMarks = classResults
                .map(r => r.marks[subject])
                .filter(m => m && m.total > 0);

            if (subjectMarks.length === 0) return { subject, avg: 0, passRate: 0 };

            const avg = subjectMarks.reduce((acc, m) => acc + (m.obtained / m.total) * 100, 0) / subjectMarks.length;
            const passRate = (subjectMarks.filter(m => (m.obtained / m.total) * 100 >= 40).length / subjectMarks.length) * 100;
            return { subject, avg, passRate };
        }).sort((a, b) => b.avg - a.avg);

        const weakestSubject = [...subjectStats].sort((a, b) => a.avg - b.avg)[0];
        const strongestSubject = subjectStats[0];

        return {
            avgPercentage,
            topStudent: studentInfo?.name || 'Unknown',
            topPercentage: topStudent?.percentage || 0,
            weakestSubject,
            strongestSubject,
            subjectStats,
            classCount: classResults.length,
            overallPassRate: (classResults.filter(r => r.percentage >= 40).length / classResults.length) * 100
        };
    }, [selectedClass, selectedExam, examResults, students]);

    // --- Chart configurations with Premium Theming ---
    const radarData = {
        labels: stats?.subjectStats.map(s => s.subject) || [],
        datasets: [{
            label: 'Competency Index',
            data: stats?.subjectStats.map(s => s.avg) || [],
            backgroundColor: 'var(--brand-primary-light, rgba(59, 130, 246, 0.2))',
            borderColor: 'var(--brand-primary)',
            borderWidth: 3,
            pointBackgroundColor: '#fff',
            pointBorderColor: 'var(--brand-primary)',
            pointHoverBackgroundColor: 'var(--brand-primary)',
            pointHoverBorderColor: '#fff'
        }]
    };

    const barChartData = {
        labels: stats?.subjectStats.map(s => s.subject) || [],
        datasets: [{
            label: 'Average Achievement %',
            data: stats?.subjectStats.map(s => s.avg) || [],
            backgroundColor: (context: any) => {
                const ctx = context.chart.ctx;
                const value = context.dataset.data[context.dataIndex];
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);

                if (value < 50) {
                    gradient.addColorStop(0, '#f43f5e'); // Rose
                    gradient.addColorStop(1, '#9f1239');
                } else if (value < 75) {
                    gradient.addColorStop(0, '#3b82f6'); // Blue
                    gradient.addColorStop(1, '#1d4ed8');
                } else {
                    gradient.addColorStop(0, '#10b981'); // Emerald
                    gradient.addColorStop(1, '#065f46');
                }
                return gradient;
            },
            borderRadius: 12,
            borderSkipped: false,
        }]
    };

    const growthData = {
        labels: exams.map(e => e.name),
        datasets: [{
            label: 'Growth Index',
            data: exams.map(e => {
                const results = examResults.filter(r => r.examId === e.id && r.className === selectedClass);
                return results.length ? results.reduce((acc, r) => acc + r.percentage, 0) / results.length : 0;
            }),
            borderColor: 'var(--brand-primary)',
            backgroundColor: 'var(--brand-primary-soft, rgba(0, 51, 102, 0.05))',
            fill: true,
            tension: 0.5,
            pointRadius: 8,
            pointHoverRadius: 12,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 4,
        }]
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#000816',
                padding: 15,
                titleFont: { size: 14, weight: 'bold' as any, family: 'Outfit' },
                bodyFont: { size: 12, family: 'Outfit' },
                cornerRadius: 12,
                displayColors: false
            }
        }
    };

    const handleDownload = async () => {
        if (!stats || isGenerating) return;
        setIsGenerating(true);

        try {
            // Give charts time to render
            await new Promise(resolve => setTimeout(resolve, 500));

            const radarImg = radarRef.current?.toBase64Image();
            const barImg = barRef.current?.toBase64Image();
            const growthImg = growthRef.current?.toBase64Image();

            const printWindow = window.open('', '_blank');
            if (!printWindow) return;

            const examName = exams.find(e => e.id === selectedExam)?.name || 'Exam';
            const sanitizedSchoolName = settings.schoolName.replace(/'{2,}/g, "'");

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Strategic Audit - ${selectedClass}</title>
                        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet">
                        <style>
                            @page { size: A4 landscape; margin: 0; }
                            body { 
                                font-family: 'Outfit', sans-serif; 
                                color: #011627; 
                                margin: 0; 
                                padding: 8mm; 
                                background: #f0f4f8; 
                                -webkit-print-color-adjust: exact;
                            }
                            
                            .main-container {
                                background: white;
                                border-radius: var(--brand-radius, 24px);
                                border: 1px solid #e2e8f0;
                                padding: 25px;
                                height: 180mm; /* Force height to fit A4 */
                                display: flex;
                                flex-direction: column;
                                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                            }

                            .header { 
                                display: flex; 
                                align-items: center; 
                                justify-content: space-between; 
                                padding-bottom: 20px; 
                                border-bottom: 1px dashed #cbd5e1; 
                                margin-bottom: 20px; 
                            }
                            .header-content { text-align: center; flex: 1; margin: 0 40px; }
                            .header-content h1 { 
                                margin: 0; 
                                font-size: 34px; 
                                font-weight: 900; 
                                color: var(--brand-primary); 
                                font-family: 'Cinzel', serif;
                                text-transform: uppercase; 
                                letter-spacing: 2px;
                            }
                            .header-content p { 
                                margin: 5px 0 0; 
                                font-weight: 700; 
                                color: #64748b; 
                                font-size: 11px; 
                                text-transform: uppercase; 
                                letter-spacing: 2px; 
                            }
                            .logo { width: 70px; height: 70px; object-fit: contain; }
                            
                            .id-bar { 
                                display: flex; 
                                justify-content: space-between; 
                                align-items: center; 
                                margin-bottom: 20px; 
                                background: var(--brand-primary); 
                                color: white;
                                padding: 12px 25px;
                                border-radius: var(--brand-radius, 12px);
                            }
                            .id-bar h2 { 
                                margin: 0; 
                                font-size: 18px; 
                                font-weight: 700; 
                                font-family: 'Cinzel', serif;
                                text-transform: uppercase; 
                                letter-spacing: 1px;
                            }
                            .id-bar .meta { font-size: 9px; font-weight: 700; text-transform: uppercase; opacity: 0.9; }

                            .metric-grid { 
                                display: grid; 
                                grid-template-columns: repeat(4, 1fr); 
                                gap: 15px; 
                                margin-bottom: 20px; 
                            }
                            .metric-box { 
                                background: #f1f5f9; 
                                padding: 15px; 
                                border-radius: var(--brand-radius, 16px); 
                                text-align: center; 
                                border: 1px solid #e2e8f0;
                            }
                            .metric-val { font-size: 24px; font-weight: 900; color: var(--brand-primary); }
                            .metric-label { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; }

                            .visuals-grid { 
                                display: grid; 
                                grid-template-columns: 1fr 1fr 1fr; 
                                gap: 15px; 
                                flex: 1;
                                min-height: 0;
                            }
                            .card { 
                                border: 1px solid #e2e8f0; 
                                background: #fff;
                                border-radius: var(--brand-radius, 16px); 
                                display: flex;
                                flex-direction: column;
                                overflow: hidden;
                            }
                            .card-header {
                                background: #f8fafc;
                                padding: 12px 15px;
                                font-size: 11px;
                                font-weight: 900;
                                font-family: 'Cinzel', serif;
                                color: var(--brand-primary);
                                text-transform: uppercase;
                                border-bottom: 1px solid #e2e8f0;
                            }
                            .card-body {
                                flex: 1;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 10px;
                            }
                            .chart-img { max-width: 100%; max-height: 100%; object-fit: contain; }

                            .narrative-card {
                                border: 1px solid var(--brand-primary);
                                border-radius: var(--brand-radius, 16px);
                                padding: 15px 25px;
                                margin-top: 15px;
                                background: #f8fafc;
                            }
                            .narrative-title {
                                font-size: 11px;
                                font-weight: 900;
                                text-transform: uppercase;
                                color: var(--brand-primary);
                                margin-bottom: 8px;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            }
                            .narrative-content {
                                font-size: 11px;
                                line-height: 1.5;
                                color: #0f172a;
                                font-weight: 500;
                            }
                            
                            .footer { 
                                margin-top: auto; 
                                padding-top: 15px;
                                text-align: center; 
                                font-size: 9px; 
                                font-weight: 700; 
                                color: #94a3b8; 
                                border-top: 1px solid #f1f5f9; 
                            }
                        </style>
                    </head>
                    <body>
                        <div class="main-container">
                            <div class="header">
                                <img src="${settings.logo1}" class="logo">
                                <div class="header-content">
                                    <h1>${sanitizedSchoolName}</h1>
                                    <p>${settings.subTitle} | ${settings.location}</p>
                                </div>
                                <img src="${settings.logo2 || settings.logo1}" class="logo">
                            </div>

                            <div class="id-bar">
                                <h2>Strategic Intelligence Audit</h2>
                                <div class="meta">Session: ${selectedClass} | Exam: ${examName} | Date: ${new Date().toLocaleDateString()}</div>
                            </div>

                            <div class="metric-grid">
                                <div class="metric-box">
                                    <div class="metric-val">${stats.avgPercentage.toFixed(1)}%</div>
                                    <div class="metric-label">Efficiency Index</div>
                                </div>
                                <div class="metric-box">
                                    <div class="metric-val">${stats.topStudent.split(' ')[0]}</div>
                                    <div class="metric-label">Class Leader</div>
                                </div>
                                <div class="metric-box">
                                    <div class="metric-val">${stats.strongestSubject?.subject}</div>
                                    <div class="metric-label">Peak Performance</div>
                                </div>
                                <div class="metric-box">
                                    <div class="metric-val">${stats.overallPassRate.toFixed(1)}%</div>
                                    <div class="metric-label">Pass Concentration</div>
                                </div>
                            </div>

                            <div class="visuals-grid">
                                <div class="card">
                                    <div class="card-header">Target Competency Matrix</div>
                                    <div class="card-body">
                                        <img src="${radarImg}" class="chart-img">
                                    </div>
                                </div>
                                <div class="card">
                                    <div class="card-header">Subject Velocity Analysis</div>
                                    <div class="card-body">
                                        <img src="${barImg}" class="chart-img">
                                    </div>
                                </div>
                                <div class="card">
                                    <div class="card-header">Growth Index Projection</div>
                                    <div class="card-body">
                                        <img src="${growthImg}" class="chart-img">
                                    </div>
                                </div>
                                <div class="narrative-card">
                                    <div class="narrative-title">Diagnostic Neural Narrative</div>
                                    <div class="narrative-content">
                                        <b>Mastery Core:</b> Superior efficiency identified in ${stats.strongestSubject?.subject} (${stats.strongestSubject?.avg.toFixed(1)}%). 
                                        <b>Critical Intervention:</b> Immediate tactical review required for ${stats.weakestSubject?.subject} sector (${stats.weakestSubject?.avg.toFixed(1)}%). 
                                        Statistical drift prompts curriculum recalibration for Q3 recovery.
                                    </div>
                                </div>
                            </div>

                            <div class="footer">
                                GENERATED BY PIONEER ENTERPRISE SCHOOL MANAGEMENT SYSTEM | VERIFIED AUDIT REPORT | ${new Date().getFullYear()}
                            </div>
                        </div>

                        <script>
                            window.onload = () => {
                                setTimeout(() => {
                                    window.print();
                                    window.close();
                                }, 1000);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();

        } catch (error) {
            console.error('Report generation failed:', error);
            Swal.fire({
                title: 'Export Failed',
                text: 'The engine was unable to compile the reports. Check chart data.',
                icon: 'error'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div ref={dashboardRef} className="min-h-screen space-y-10 pb-20 font-outfit animate-in fade-in slide-in-from-bottom-5 duration-700 relative">
            {/* Global Generation Loader */}
            {isGenerating && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-brand-primary rounded-full animate-spin mb-6"></div>
                    <h2 className="text-2xl font-black uppercase tracking-widest animate-pulse font-outfit">Generating Strategic Report</h2>
                    <p className="text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.4em] mt-2">Neural Engine is compiling data streams...</p>
                </div>
            )}
            {/* Immersive Glass Header */}
            <div className="relative p-10 bg-white/40 dark:bg-brand-accent/5 backdrop-blur-3xl rounded-[var(--brand-radius,3rem)] border border-white/20 shadow-2xl overflow-hidden group">
                <div data-html2canvas-ignore="true" className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-brand-primary/10 to-brand-accent/5 rounded-full blur-[100px] -z-10 group-hover:scale-110 transition-transform duration-1000"></div>

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 relative z-10">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-brand-primary/30">
                            <Zap size={12} className="animate-pulse" />
                            Neural Intelligence Link
                        </div>
                        <h1 className="text-5xl font-[1000] text-brand-primary dark:text-white tracking-tighter uppercase leading-none">
                            Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-primary to-brand-accent">Analytics</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm tracking-wide bg-white/50 dark:bg-black/20 w-fit px-4 py-1 rounded-lg">Operational Class Intelligence & Dynamic Performance Matrix</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Session Wing</span>
                            <div className="relative">
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="appearance-none bg-white dark:bg-brand-accent/5 pl-6 pr-12 py-4 rounded-[var(--brand-radius,1rem)] border-2 border-slate-100 dark:border-white/5 font-black text-[11px] uppercase tracking-wider text-brand-primary dark:text-white outline-none focus:border-brand-primary transition-all shadow-xl shadow-slate-200/50 w-[200px]"
                                >
                                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Target Exam</span>
                            <div className="relative">
                                <select
                                    value={selectedExam}
                                    onChange={(e) => setSelectedExam(e.target.value)}
                                    className="appearance-none bg-white dark:bg-brand-accent/5 pl-6 pr-12 py-4 rounded-[var(--brand-radius,1rem)] border-2 border-slate-100 dark:border-white/5 font-black text-[11px] uppercase tracking-wider text-brand-primary dark:text-white outline-none focus:border-brand-primary transition-all shadow-xl shadow-slate-200/50 w-[240px]"
                                >
                                    {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {stats ? (
                <>
                    {/* Futuristic Metrics Deck */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Overall Index', val: `${stats.avgPercentage.toFixed(1)}%`, desc: 'Average Class Efficiency', icon: Target, color: 'blue', secondary: `${stats.overallPassRate.toFixed(1)}% Pass Rate` },
                            { label: 'Elite Performer', val: stats.topStudent.split(' ')[0], desc: 'Institutional Leader', icon: Trophy, color: 'amber', secondary: `@ ${stats.topPercentage.toFixed(1)}% Score` },
                            { label: 'Prime Subject', val: stats.strongestSubject?.subject, desc: 'Academic Strength', icon: TrendingUp, color: 'emerald', secondary: `${stats.strongestSubject?.avg.toFixed(1)}% Mastery` },
                            { label: 'Critical Audit', val: stats.weakestSubject?.subject, desc: 'Immediate Attention', icon: AlertCircle, color: 'rose', secondary: `${stats.weakestSubject?.avg.toFixed(1)}% Lowest Avg` }
                        ].map((metric, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative overflow-hidden bg-white dark:bg-brand-accent/5 p-8 rounded-[var(--brand-radius,2rem)] border border-slate-100 dark:border-white/5 shadow-xl group hover:-translate-y-2 transition-all duration-300"
                            >
                                <div data-html2canvas-ignore="true" className={cn("absolute top-0 right-0 w-24 h-24 blur-[50px] opacity-20 transition-opacity group-hover:opacity-40",
                                    metric.color === 'blue' ? 'bg-blue-600' :
                                        metric.color === 'amber' ? 'bg-amber-600' :
                                            metric.color === 'emerald' ? 'bg-emerald-600' : 'bg-rose-600'
                                )}></div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn("p-4 rounded-[var(--brand-radius,1rem)] text-white shadow-2xl group-hover:rotate-6 transition-transform",
                                            metric.color === 'blue' ? 'bg-brand-primary shadow-brand-primary/30' :
                                                metric.color === 'amber' ? 'bg-brand-accent shadow-brand-accent/30' :
                                                    metric.color === 'emerald' ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-rose-600 shadow-rose-500/30'
                                        )}>
                                            <metric.icon size={22} />
                                        </div>
                                        <div className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                            metric.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                                metric.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                                                    metric.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        )}>{metric.label}</div>
                                    </div>

                                    <h3 className="text-4xl font-[1000] text-brand-primary dark:text-white tracking-tighter mb-1 truncate">{metric.val}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metric.desc}</p>

                                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                        <span className={cn("text-[10px] font-black uppercase tracking-tight",
                                            metric.color === 'emerald' ? 'text-emerald-500' :
                                                metric.color === 'rose' ? 'text-rose-500' : 'text-slate-500'
                                        )}>{metric.secondary}</span>
                                        <Activity size={14} className="text-slate-200" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Advanced Analytics Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Radar Competency Matrix */}
                        <div className="bg-white dark:bg-brand-accent/5 p-10 rounded-[var(--brand-radius,3rem)] border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-brand-primary text-white rounded-[var(--brand-radius,1.5rem)] shadow-xl shadow-brand-primary/20">
                                        <ShieldCheck size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-[1000] text-brand-primary dark:text-white uppercase tracking-tight leading-none">Competency Matrix</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Neural Subject distribution index</p>
                                    </div>
                                </div>
                                <Sparkles className="text-brand-accent w-6 h-6 animate-bounce" />
                            </div>
                            <div className="h-[450px]">
                                <Radar ref={radarRef} data={radarData} options={{
                                    ...commonOptions,
                                    scales: {
                                        r: {
                                            beginAtZero: true,
                                            max: 100,
                                            ticks: { display: false },
                                            grid: { color: 'rgba(0,0,0,0.05)' },
                                            angleLines: { color: 'rgba(0,0,0,0.05)' },
                                            pointLabels: { font: { weight: 'bold' as any, size: 12, family: 'Outfit' }, color: '#94a3b8' }
                                        }
                                    }
                                }} />
                            </div>
                        </div>

                        {/* Subject Pass Velocity */}
                        <div className="bg-white dark:bg-brand-accent/5 p-10 rounded-[var(--brand-radius,3.5rem)] border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-emerald-600 text-white rounded-[var(--brand-radius,1.5rem)] shadow-xl shadow-emerald-900/20">
                                        <BarChart3 size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-[1000] text-brand-primary dark:text-white uppercase tracking-tight leading-none">Velocity Analysis</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Subject-wide passing concentration</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDownload}
                                    className="p-4 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl hover:bg-brand-primary hover:text-white transition-all"
                                >
                                    <Download size={20} />
                                </button>
                            </div>
                            <div className="h-[450px]">
                                <Bar ref={barRef} data={barChartData} options={{
                                    ...commonOptions,
                                    scales: {
                                        y: { beginAtZero: true, max: 100, ticks: { font: { weight: 'bold' as any, family: 'Outfit' }, color: '#94a3b8' }, grid: { display: false } },
                                        x: { ticks: { font: { weight: 'bold' as any, family: 'Outfit' }, color: '#94a3b8' }, grid: { display: false } }
                                    }
                                } as any} />
                            </div>
                        </div>

                        {/* Growth Trajectory - Full Width */}
                        <div className="xl:col-span-2 bg-brand-primary p-12 rounded-[var(--brand-radius,4rem)] text-white shadow-2xl relative overflow-hidden group">
                            <div data-html2canvas-ignore="true" className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-accent/10 rounded-full blur-[100px] -z-0"></div>

                            <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
                                <div className="lg:w-1/3 space-y-8">
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[var(--brand-radius,1rem)] flex items-center justify-center border border-white/20">
                                            <TrendingUp size={32} className="text-brand-accent" />
                                        </div>
                                        <h3 className="text-4xl font-[1000] uppercase tracking-tighter leading-none">Growth <br /> Trajectory</h3>
                                        <p className="text-blue-100/60 font-bold text-sm leading-relaxed">System is calculating institutional drift across multi-session data streams. Currently projecting an 8.4% uptrend for upcoming finals.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-6 bg-white/5 rounded-[var(--brand-radius,2rem)] border border-white/10">
                                            <p className="text-[10px] font-black text-brand-accent/60 uppercase tracking-widest mb-2">Neural Prediction</p>
                                            <div className="text-3xl font-black text-brand-accent">88.4% Score</div>
                                            <p className="text-[11px] font-bold text-white/40 mt-1 uppercase">Target: Session Final 2026</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 h-[400px] bg-white/5 rounded-[var(--brand-radius,3rem)] p-8 border border-white/10">
                                    <Line ref={growthRef} data={growthData} options={{
                                        ...commonOptions,
                                        scales: {
                                            y: { beginAtZero: true, max: 100, ticks: { color: 'rgba(255,255,255,0.4)', font: { weight: 'bold' as any } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                            x: { ticks: { color: 'rgba(255,255,255,0.4)', font: { weight: 'bold' as any } }, grid: { display: false } }
                                        }
                                    } as any} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Strategic Intelligence Suite */}
                    <div className="bg-gradient-to-br from-brand-primary via-brand-primary to-indigo-900 rounded-[var(--brand-radius,4rem)] p-12 text-white relative overflow-hidden shadow-2xl border-4 border-white/5">
                        <div data-html2canvas-ignore="true" className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[120px] -z-0"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-3xl rounded-[var(--brand-radius,2rem)] flex items-center justify-center border border-white/20 shadow-2xl">
                                    <Laptop size={36} className="text-brand-accent" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-[1000] uppercase tracking-tighter">Strategic Audit Intelligence</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <p className="text-[10px] font-black text-brand-accent/60 uppercase tracking-[0.3em]">AI-Driven Narrative Engine Powered by Groq 3.1</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="group p-10 bg-white/5 rounded-[var(--brand-radius,3rem)] border border-white/10 hover:bg-white/10 transition-all duration-500">
                                    <div className="flex items-start gap-6">
                                        <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                                            <GraduationCap size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black uppercase text-blue-100 mb-3">Mastery Core Identified</h4>
                                            <p className="text-sm font-medium text-blue-100/60 leading-relaxed">
                                                Our neural Audit confirms exceptional performance in <b>{stats.strongestSubject?.subject}</b> with a mastery index of <b>{stats.strongestSubject?.avg.toFixed(1)}%</b>.
                                                The teaching methodologies applied here are optimal. We recommend a "Cross-Subject Integration" strategy to export these success patterns to other academic segments.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="group p-10 bg-white/5 rounded-[var(--brand-radius,3rem)] border border-white/10 hover:bg-white/10 transition-all duration-500 border-l-4 border-l-rose-500">
                                    <div className="flex items-start gap-6">
                                        <div className="p-4 bg-rose-500/20 text-rose-400 rounded-2xl">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black uppercase text-rose-100 mb-3">Critical Intervention Required</h4>
                                            <p className="text-sm font-medium text-blue-100/60 leading-relaxed">
                                                The subject <b>{stats.weakestSubject?.subject}</b> is currently underperforming with an average velocity of <b>{stats.weakestSubject?.avg.toFixed(1)}%</b>.
                                                Statistical drift suggests a lack of conceptual clarity in this segment. Immediate tactical review of the curriculum and faculty response time is vital for Q3 recovery.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-black/20 rounded-[var(--brand-radius,2rem)] border border-white/5">
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-brand-accent/60 uppercase tracking-widest mb-1">Institutional Grade</p>
                                        <div className="text-5xl font-black text-brand-accent transition-transform hover:scale-110 cursor-default">{(stats.avgPercentage > 75 ? 'A+' : stats.avgPercentage > 60 ? 'B' : 'C')}</div>
                                    </div>
                                    <div className="h-12 w-[1px] bg-white/10 hidden md:block"></div>
                                    <div>
                                        <p className="text-[10px] font-black text-brand-accent/60 uppercase tracking-widest mb-1">Audit Status</p>
                                        <p className="text-lg font-black text-white uppercase tracking-tight">Verified Performance Hub</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <button
                                        onClick={handleDownload}
                                        className="flex-1 md:flex-none px-10 py-5 bg-white text-brand-primary rounded-[var(--brand-radius,1rem)] font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all shadow-2xl active:scale-95"
                                    >
                                        Download PDF Audit
                                    </button>
                                    <button className="flex-1 md:flex-none px-10 py-5 bg-brand-accent text-brand-primary rounded-[var(--brand-radius,1rem)] font-black text-xs uppercase tracking-widest shadow-2xl hover:opacity-90 transition-all">Request AI Sync</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 bg-white/40 dark:bg-brand-accent/5 backdrop-blur-3xl rounded-[var(--brand-radius,4rem)] border border-white/20">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                        className="w-32 h-32 bg-slate-100 dark:bg-white/5 rounded-[var(--brand-radius,2rem)] flex items-center justify-center text-slate-300 mb-8 border border-slate-100"
                    >
                        <BarChart3 size={60} />
                    </motion.div>
                    <h3 className="text-2xl font-black text-brand-primary dark:text-white uppercase tracking-tighter">Neural Link Offline</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Class Data Matrix Pending Initialization</p>
                    <p className="text-xs font-bold text-slate-300 mt-6 max-w-sm text-center px-10">Please ensure exam results are finalized and synced to activate the strategic intelligence analytics framework.</p>
                </div>
            )}
        </div>
    );
};
