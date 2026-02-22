import { useState } from 'react';
import { useStore, type Student } from '../context/StoreContext';
import {
    Users,
    Briefcase,
    TrendingUp,
    Trophy,
    ShieldCheck,
    Activity,
    CreditCard,
    ChevronRight,
    Calendar,
    Target
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
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
    BarElement,
    type ChartOptions
} from 'chart.js';
import { cn } from '../utils/cn';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const Dashboard = ({ onNavigate }: { onNavigate: (page: any) => void }) => {
    const { students, teachers, auditLogs, currentUser, attendance, examResults, exams } = useStore();
    const [chartPeriod, setChartPeriod] = useState<'Weekly' | 'Monthly' | 'Annual'>('Monthly');

    // Role-based logic
    const isAdmin = currentUser?.role === 'admin';
    const studentData = !isAdmin ? students.find(s => s.id === currentUser?.id) : null;

    // Admin Stats
    const totalRevenue = students.reduce((acc: number, s: Student) => acc + (s.feesPaid || 0), 0);
    const totalDue = students.reduce((acc: number, s: Student) => acc + (s.feesTotal || 0), 0);
    const recoveryRate = totalDue > 0 ? (totalRevenue / totalDue) * 100 : 0;

    // Student Stats (Parent Control)
    const studentAttendance = attendance.filter(a => a.records.some(r => r.studentId === studentData?.id));
    const attendancePresent = studentAttendance.filter(a => a.records.find(r => r.studentId === studentData?.id)?.status === 'Present').length;
    const attendanceRate = studentAttendance.length > 0 ? Math.round((attendancePresent / studentAttendance.length) * 100) : 0;

    const latestExam = exams.filter(e => e.status === 'Finalized').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const latestResult = studentData ? examResults.find(r => r.studentId === studentData.id && r.examId === latestExam?.id) : null;

    const getChartData = () => {
        if (!isAdmin) {
            // Simplified progress chart for student
            return {
                labels: ['Unit 1', 'Mid-Term', 'Unit 2', 'Finals'],
                data: [82, 88, 85, latestResult?.percentage || 90]
            };
        }
        switch (chartPeriod) {
            case 'Weekly':
                return {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    data: [12000, 19000, 15000, 22000, 30000, 10000]
                };
            case 'Annual':
                return {
                    labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
                    data: [450000, 520000, 680000, 810000, 950000, 1100000]
                };
            default:
                return {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    data: [45000, 52000, 48000, 61000, 55000, 67000]
                };
        }
    };

    const currentChart = getChartData();

    const lineData = {
        labels: currentChart.labels,
        datasets: [
            {
                label: isAdmin ? `${chartPeriod} Collection` : 'Performance Index',
                data: currentChart.data,
                borderColor: isAdmin ? '#fbbf24' : '#0ea5e9',
                backgroundColor: isAdmin ? 'rgba(251, 191, 36, 0.05)' : 'rgba(14, 165, 233, 0.05)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: isAdmin ? '#fbbf24' : '#0ea5e9',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }
        ]
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#001529',
                titleFont: { size: 12, family: 'Crimson Pro', weight: 'bold' },
                bodyFont: { size: 11, family: 'Crimson Pro' },
                padding: 12,
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(148, 163, 184, 0.05)' },
                border: { display: false },
                ticks: {
                    font: { size: 10, family: 'Crimson Pro' },
                    color: '#94a3b8',
                    padding: 10,
                    callback: (value) => isAdmin ? 'RS ' + value.toLocaleString() : value + '%'
                }
            },
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    font: { size: 10, family: 'Crimson Pro' },
                    color: '#94a3b8',
                    padding: 10
                }
            },
        },
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100 dark:border-white/5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-brand-primary/5 dark:bg-brand-accent/10 border border-brand-primary/10 dark:border-brand-accent/20 rounded-md text-[8px] font-black uppercase tracking-widest text-brand-primary dark:text-brand-accent">
                            Institutional Intelligence
                        </span>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-md text-[8px] font-black uppercase tracking-widest text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Updates
                        </div>
                    </div>
                    <h1 className="text-4xl font-[1000] tracking-tighter text-brand-primary dark:text-white leading-none">
                        {isAdmin ? 'Administrative' : 'Student Success'} <span className="text-brand-accent italic font-serif opacity-90">{isAdmin ? 'Dashboard' : 'Portal'}</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-400 dark:text-brand-accent/40 tracking-tight">
                        {getGreeting()}, {currentUser?.name.split(' ')[0]}. {isAdmin ? "Here's what's happening at Times Public School today." : `Monitoring academic progress for ${studentData?.name}.`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('timetable')}
                        className="p-2.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl shadow-sm hover:scale-105 transition-all group"
                        title="View Academic Timetable"
                    >
                        <Calendar className="w-5 h-5 text-slate-400 group-hover:text-brand-primary dark:group-hover:text-brand-accent transition-colors" />
                    </button>
                    <div className="h-10 w-[1px] bg-slate-200 dark:bg-white/10 hidden md:block mx-1"></div>
                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary dark:text-brand-accent">Role: {currentUser?.role}</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-white">{currentUser?.name}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-blue-800 dark:from-brand-accent dark:to-yellow-600 p-[1.5px] shadow-lg">
                            <div className="w-full h-full rounded-[inherit] bg-white dark:bg-[#001529] flex items-center justify-center overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'User'}`} alt="User" className="w-8 h-8 opacity-90" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isAdmin ? (
                    [
                        { label: 'Total Enrolled', value: students.length, sub: 'Active Student Body', icon: Users, color: 'blue', trend: '+2.4%' },
                        { label: 'Faculty Members', value: teachers.length, sub: 'Verified Educators', icon: Briefcase, color: 'amber', trend: 'Stable' },
                        { label: 'Collection Rate', value: `${recoveryRate.toFixed(1)}%`, sub: 'Current Term Recovery', icon: TrendingUp, color: 'emerald', trend: '+5.1%' },
                        { label: 'Academic Standing', value: 'Elite-IA', sub: 'Regional Performance', icon: Trophy, color: 'indigo', trend: 'Top 1%' }
                    ].map((stat, i) => (
                        <div key={i} className="group relative glass-card p-6 overflow-hidden hover:-translate-y-1 duration-300">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full blur-2xl group-hover:bg-brand-accent/10 transition-colors"></div>
                            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className={cn(
                                        "p-3 rounded-2xl transition-all shadow-lg group-hover:rotate-6",
                                        stat.color === 'blue' ? "bg-blue-600 shadow-blue-500/20" :
                                            stat.color === 'amber' ? "bg-amber-500 shadow-amber-500/20" :
                                                stat.color === 'emerald' ? "bg-emerald-600 shadow-emerald-600/20" :
                                                    "bg-indigo-600 shadow-indigo-500/20"
                                    )}>
                                        <stat.icon className="text-white w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.trend}</span>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</h3>
                                    <div className="mt-1 flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-brand-accent/40 uppercase tracking-tighter">{stat.label}</p>
                                        <p className="text-[9px] font-medium text-slate-400 italic">{stat.sub}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    [
                        { label: 'Attendance Rate', value: `${attendanceRate}%`, sub: 'Term Cumulative', icon: Calendar, color: 'blue', trend: 'Healthy' },
                        { label: 'Financial Standing', value: studentData ? (studentData.feesTotal - studentData.feesPaid === 0 ? 'Cleared' : 'Due') : 'N/A', sub: 'Institutional Ledger', icon: CreditCard, color: 'emerald', trend: 'Official' },
                        { label: 'Class Ranking', value: latestResult ? `#${latestResult.position || '---'}` : '---', sub: latestExam?.name || 'Latest Exam', icon: Trophy, color: 'amber', trend: 'Verified' },
                        { label: 'Academic Index', value: latestResult ? `${latestResult.percentage.toFixed(1)}%` : '---', sub: 'Subject Proficiency', icon: Target, color: 'indigo', trend: latestResult?.grade || '---' }
                    ].map((stat, i) => (
                        <div key={i} className="group relative glass-card p-6 overflow-hidden hover:-translate-y-1 duration-300">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full blur-2xl group-hover:bg-brand-accent/10 transition-colors"></div>
                            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className={cn(
                                        "p-3 rounded-2xl transition-all shadow-lg group-hover:rotate-6",
                                        stat.color === 'blue' ? "bg-blue-600 shadow-blue-500/20" :
                                            stat.color === 'amber' ? "bg-amber-500 shadow-amber-500/20" :
                                                stat.color === 'emerald' ? "bg-emerald-600 shadow-emerald-600/20" :
                                                    "bg-indigo-600 shadow-indigo-500/20"
                                    )}>
                                        <stat.icon className="text-white w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.trend}</span>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</h3>
                                    <div className="mt-1 flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-brand-accent/40 uppercase tracking-tighter">{stat.label}</p>
                                        <p className="text-[9px] font-medium text-slate-400 italic">{stat.sub}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Visual Analytics */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="glass-card p-8 min-h-[500px] flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                            <div>
                                <h3 className="text-xl font-black text-brand-primary dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    {isAdmin ? <CreditCard className="w-5 h-5 text-brand-accent" /> : <Activity className="w-5 h-5 text-brand-secondary" />}
                                    {isAdmin ? 'Financial Performance' : 'Academic Growth Vector'}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{isAdmin ? 'Monthly Fee Collection Analysis' : 'Subject Mastery Progress Index'}</p>
                            </div>
                            {isAdmin && (
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-1 rounded-xl">
                                    {['Weekly', 'Monthly', 'Annual'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setChartPeriod(t as any)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                chartPeriod === t ? "bg-white dark:bg-brand-primary text-brand-primary dark:text-white shadow-md shadow-brand-primary/10" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-h-[300px] relative">
                            <Line data={lineData} options={chartOptions} />
                        </div>

                        {isAdmin ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">RS {totalRevenue.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Recovery</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">RS {totalDue.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Dues</p>
                                    <p className="text-xl font-black text-rose-600">RS {(totalDue - totalRevenue).toLocaleString()}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Institutional Event</p>
                                    <p className="text-base font-black text-brand-primary dark:text-white">Annual Science Exhibition - Level 4</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faculty Remarks</p>
                                    <p className="text-xs font-bold text-emerald-600">"Exceptional growth in analytical subjects this term."</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Access Tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: isAdmin ? 'Students' : 'Success Portal', target: isAdmin ? 'students' : 'parents', icon: Users, color: 'blue' },
                            { label: isAdmin ? 'Accounts' : 'Financials', target: 'fees', icon: CreditCard, color: 'emerald' },
                            { label: isAdmin ? 'Academic' : 'Examination', target: 'exams', icon: Trophy, color: 'amber' },
                            { label: isAdmin ? 'Staffing' : 'Timetable', target: isAdmin ? 'teachers' : 'timetable', icon: isAdmin ? ShieldCheck : Calendar, color: 'slate' }
                        ].map((btn, i) => (
                            <button
                                key={i}
                                onClick={() => onNavigate(btn.target)}
                                className="group glass-card p-5 hover:bg-brand-primary dark:hover:bg-brand-accent transition-all duration-500 overflow-hidden relative"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-150 transition-transform">
                                    <btn.icon size={80} />
                                </div>
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <btn.icon className={cn(
                                            "w-6 h-6 transition-colors",
                                            btn.color === 'blue' ? "text-blue-600" :
                                                btn.color === 'emerald' ? "text-emerald-600" :
                                                    btn.color === 'amber' ? "text-amber-500" :
                                                        "text-slate-500",
                                            "group-hover:text-white"
                                        )} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white group-hover:text-white">{btn.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* System Activity Sidebar */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="glass-card bg-slate-950 p-8 text-white relative overflow-hidden h-full flex flex-col min-h-[600px] border-none">
                        <div className="absolute top-0 right-0 p-10 opacity-10 blur-xl">
                            <Activity size={100} className="text-brand-accent animate-pulse" />
                        </div>

                        <div className="relative z-10 space-y-8 flex flex-col h-full">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter">{isAdmin ? 'System Log' : 'Activity Stream'}</h3>
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mt-1 italic">{isAdmin ? 'Real-time audit trail' : 'Student event timeline'}</p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <Activity size={16} className="text-brand-accent" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar-white pr-2 py-4">
                                {isAdmin ? (
                                    auditLogs.length > 0 ? (
                                        auditLogs.slice(-6).reverse().map((log, i) => (
                                            <div key={i} className="flex gap-4 group cursor-default">
                                                <div className="flex flex-col items-center group">
                                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-brand-accent bg-slate-950 z-10 group-hover:scale-125 transition-transform duration-300"></div>
                                                    <div className="w-[1.5px] h-full bg-white/10 group-last:bg-transparent -mt-0.5"></div>
                                                </div>
                                                <div className="flex-1 pb-6 group-last:pb-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-[10px] font-black uppercase text-brand-accent/80 tracking-widest">{log.user}</p>
                                                        <span className="text-[8px] font-bold text-white/30 uppercase">
                                                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-[1000] text-white/90 leading-relaxed group-hover:text-white transition-colors">{log.action}</p>
                                                    <p className="text-[9px] font-bold text-white/40 leading-relaxed truncate">{log.details}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-20 text-center py-20">
                                            <Activity size={48} className="mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No activity detected</p>
                                        </div>
                                    )
                                ) : (
                                    // Student Specific Activity
                                    [
                                        { action: 'Attendance Verified', details: 'Marked Present in Class 10-A', time: '08:02 AM', icon: ShieldCheck },
                                        { action: 'Grade Registry Update', details: 'Physics Quiz: 92/100 Secured', time: 'Yesterday', icon: Target },
                                        { action: 'Portal Authenticated', details: 'Guardian access verified from Sector B', time: 'Last Week', icon: Activity }
                                    ].map((act, i) => (
                                        <div key={i} className="flex gap-4 group cursor-default">
                                            <div className="flex flex-col items-center group">
                                                <div className="w-2.5 h-2.5 rounded-full border-2 border-brand-accent bg-slate-950 z-10 group-hover:scale-125 transition-transform duration-300"></div>
                                                <div className="w-[1.5px] h-full bg-white/10 group-last:bg-transparent -mt-0.5"></div>
                                            </div>
                                            <div className="flex-1 pb-6 group-last:pb-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-[10px] font-black uppercase text-brand-accent/80 tracking-widest">Verified</p>
                                                    <span className="text-[8px] font-bold text-white/30 uppercase">{act.time}</span>
                                                </div>
                                                <p className="text-[11px] font-[1000] text-white/90 leading-relaxed group-hover:text-white transition-colors">{act.action}</p>
                                                <p className="text-[9px] font-bold text-white/40 leading-relaxed truncate">{act.details}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-accent hover:text-slate-950 transition-all duration-500 group">
                                <span className="flex items-center justify-center gap-2">
                                    {isAdmin ? 'View Full Archive' : 'View Detailed History'}
                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Status Utility Card */}
                    <div className="glass-card bg-gradient-to-br from-brand-primary to-[#002b55] p-6 text-white overflow-hidden relative group">
                        <div className="absolute right-[-10%] bottom-[-10%] w-32 h-32 bg-brand-accent/20 rounded-full blur-[60px]"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-brand-accent">Database Connectivity</p>
                                <h4 className="text-lg font-black tracking-tight">Systems Healthy</h4>
                            </div>
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                <Target className="w-6 h-6 text-brand-accent animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

