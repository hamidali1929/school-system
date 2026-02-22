import { ShieldCheck, MessageCircle, Calendar, UserCircle, TrendingUp, Download, Award, Clock, Bell, ClipboardList, Wallet, Send } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useState } from 'react';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';
import { FeeVoucher } from '../components/FeeVoucher';
import { motion, AnimatePresence } from 'framer-motion';

export const ParentPanel = () => {
    const { students, attendance, examResults, currentUser, exams } = useStore();
    const [showFeeVoucher, setShowFeeVoucher] = useState(false);
    const [activeSection, setActiveSection] = useState<'overview' | 'academic' | 'attendance' | 'fees' | 'communication'>('overview');

    // Security: Locked to Student ID if logged in as student
    const isStudent = currentUser?.role === 'student';
    const initialStudentId = isStudent ? currentUser.id : (students[0]?.id || '');
    const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);

    const student = students.find(s => s.id === selectedStudentId);

    if (!student) return (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200">
            <UserCircle className="w-16 h-16 text-slate-300 mb-4 animate-pulse" />
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">No active student record detected.</p>
        </div>
    );

    // Data Processing
    const studentAttendance = attendance.filter(a => a.records.some(r => r.studentId === student.id));
    const totalDays = studentAttendance.length;
    const presentDays = studentAttendance.filter(a => a.records.find(r => r.studentId === student.id)?.status === 'Present').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    const latestExam = exams.filter(e => e.status === 'Finalized').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const latestResult = examResults.find(r => r.studentId === student.id && r.examId === latestExam?.id);

    const feeStatus = (student.feesTotal - student.feesPaid) <= 0 ? 'Cleared' : 'Pending';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-outfit pb-20">
            {/* 1️⃣ TOP SECTION: IDENTITY & VECTORS */}
            <div className="glass-card p-6 md:p-8 border-t-8 border-brand-primary relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform">
                    <ShieldCheck size={180} className="text-brand-primary" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-primary to-blue-600 p-1 shadow-2xl overflow-hidden">
                            <div className="w-full h-full rounded-[1.2rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                {student.avatar ? (
                                    <img src={student.avatar} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-brand-primary">{(student.name || 'S').charAt(0)}</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-[1000] tracking-tighter text-slate-800 dark:text-white uppercase leading-none">{student.name}</h2>
                            <p className="text-xs font-bold text-brand-primary uppercase tracking-[0.2em] mt-1">{student.class} • {student.id}</p>
                            <div className="flex items-center gap-3 mt-3">
                                {!isStudent && (
                                    <select
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        className="bg-slate-100 dark:bg-white/5 border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-brand-primary/20"
                                    >
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Attendance</p>
                            <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{attendancePercentage}%</p>
                        </div>
                        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-center">
                            <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Fee Status</p>
                            <p className="text-xl font-black text-amber-700 dark:text-amber-400">{feeStatus}</p>
                        </div>
                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-center col-span-2 sm:col-span-1">
                            <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mb-1">Latest Result</p>
                            <p className="text-xl font-black text-indigo-700 dark:text-indigo-400">{latestResult?.grade || '---'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar-hide no-scrollbar">
                {[
                    { id: 'academic', label: 'Academic Hub', icon: Award },
                    { id: 'attendance', label: 'Attendance', icon: Calendar },
                    { id: 'fees', label: 'Financials', icon: Wallet },
                    { id: 'communication', label: 'Liaison', icon: MessageCircle }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 active:scale-95",
                            activeSection === tab.id
                                ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-105"
                                : "bg-white dark:bg-white/5 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10"
                        )}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                    {/* 2️⃣ ACADEMIC SECTION */}
                    {activeSection === 'academic' && (
                        <>
                            <div className="lg:col-span-8 space-y-6">
                                <div className="glass-card p-8 group">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                            <ClipboardList className="text-brand-primary" /> Marksite Repository
                                        </h3>
                                        <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Download Report Card</button>
                                    </div>
                                    <div className="space-y-4">
                                        {latestResult ? (
                                            Object.entries(latestResult.marks).map(([subject, marks]: [string, any], i) => (
                                                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                                    <div>
                                                        <p className="text-xs font-black uppercase text-slate-700 dark:text-white">{subject}</p>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Assessment Module</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-brand-primary">{marks.obtained} / {marks.total}</p>
                                                        <p className="text-[8px] font-black text-emerald-500 uppercase">{Math.round((marks.obtained / marks.total) * 100)}% Proficiency</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 opacity-30 italic uppercase text-[10px] font-black">No assessments finalized in the current cycle</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-4 space-y-6">
                                <div className="glass-card p-6 border-l-4 border-brand-accent">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-4">Teacher Remarks</h4>
                                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl italic text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        "{latestResult?.remarks || 'Consistently demonstrating discipline and academic curiosity. Highly recommended for advanced modules.'}"
                                    </div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-4 text-right">— Institutional Faculty</p>
                                </div>
                                <div className="glass-card p-6 bg-gradient-to-br from-indigo-600 to-blue-800 text-white border-none shadow-2xl">
                                    <TrendingUp className="w-10 h-10 mb-4 text-brand-accent" />
                                    <h4 className="font-black text-lg mb-1 uppercase tracking-tighter">Performance Graph</h4>
                                    <p className="text-[10px] text-white/60 mb-6 uppercase tracking-widest font-bold">Academic Growth Velocity</p>
                                    <div className="flex items-end gap-2 h-24">
                                        {[40, 65, 55, 80, 75, 95].map((h, i) => (
                                            <div key={i} className="flex-1 bg-white/20 rounded-t-lg relative group overflow-hidden">
                                                <div className="absolute bottom-0 w-full bg-brand-accent group-hover:bg-white transition-all duration-700" style={{ height: `${h}%` }}></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 3️⃣ ATTENDANCE SECTION */}
                    {activeSection === 'attendance' && (
                        <>
                            <div className="lg:col-span-8">
                                <div className="glass-card p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                            <Clock className="text-emerald-500" /> Daily Attendance Log
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-[8px] font-black uppercase text-slate-400">Present</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                                <span className="text-[8px] font-black uppercase text-slate-400">Absent</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                                            <div key={d} className="text-center text-[10px] font-black text-slate-400 py-2">{d}</div>
                                        ))}
                                        {Array.from({ length: 31 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "aspect-square rounded-xl border flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 cursor-alias",
                                                    (i + 1) % 7 === 0 ? "bg-rose-500/10 border-rose-500/20 text-rose-600" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                                )}
                                            >
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-4 space-y-6">
                                <div className="glass-card p-6 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Percentage</p>
                                    <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-white/5" />
                                            <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={364.42} strokeDashoffset={364.42 * (1 - attendancePercentage / 100)} className="text-emerald-500 transition-all duration-1000" />
                                        </svg>
                                        <span className="absolute text-2xl font-black text-slate-800 dark:text-white">{attendancePercentage}%</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => Swal.fire({
                                        title: 'Leave Application',
                                        text: 'Submit leave request for administrative approval.',
                                        input: 'textarea',
                                        inputPlaceholder: 'State reason for leave...',
                                        showCancelButton: true,
                                        confirmButtonColor: 'var(--brand-primary)',
                                        customClass: { popup: 'rounded-[2.5rem]' }
                                    })}
                                    className="w-full py-5 bg-brand-primary text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Send size={16} /> Submit Leave Request
                                </button>
                            </div>
                        </>
                    )}

                    {/* 4️⃣ FEE SECTION */}
                    {activeSection === 'fees' && (
                        <>
                            <div className="lg:col-span-7 space-y-6">
                                <div className="glass-card p-8 bg-gradient-to-br from-slate-900 to-brand-primary text-white border-none relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-10">
                                            <div>
                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Financial Settlement</p>
                                                <h3 className="text-3xl font-[1000] tracking-tighter">Rs. {student.feesTotal - student.feesPaid}</h3>
                                            </div>
                                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                                                <Wallet className="text-brand-accent" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 mb-8">
                                            <div>
                                                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Paid Amount</p>
                                                <p className="text-xl font-black">Rs. {student.feesPaid}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Due Amount</p>
                                                <p className="text-xl font-black">Rs. {student.feesTotal - student.feesPaid}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowFeeVoucher(true)}
                                            className="w-full py-4 bg-brand-accent text-brand-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-accent/20"
                                        >
                                            <Download className="w-4 h-4" /> Download Official Challan
                                        </button>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                                </div>
                            </div>
                            <div className="lg:col-span-5">
                                <div className="glass-card p-8 h-full">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                        <Clock className="text-slate-400" /> Payment History
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { date: 'Jan 15, 2026', amount: 'Rs. 5,000', status: 'Verified' },
                                            { date: 'Dec 10, 2025', amount: 'Rs. 4,500', status: 'Verified' },
                                            { date: 'Nov 05, 2025', amount: 'Rs. 4,500', status: 'Verified' },
                                        ].map((p, i) => (
                                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group hover:bg-white dark:hover:bg-white/10 transition-colors">
                                                <div>
                                                    <p className="text-xs font-black text-slate-700 dark:text-white">{p.amount}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p.date}</p>
                                                </div>
                                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20 px-2 py-0.5 rounded-md bg-emerald-500/5">{p.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 5️⃣ COMMUNICATION SECTION */}
                    {activeSection === 'communication' && (
                        <>
                            <div className="lg:col-span-8 space-y-6">
                                <div className="glass-card p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                            <MessageCircle className="text-brand-primary" /> Teacher Hotline
                                        </h3>
                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">Encrypted Link</span>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/5 min-h-[200px] flex flex-col justify-end opacity-50">
                                            <div className="text-center py-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional chat log empty</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">Start a conversation with subject faculty</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <input
                                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 ring-brand-primary/20 transition-all dark:text-white shadow-inner"
                                                placeholder="Type your secure message..."
                                            />
                                            <button className="p-4 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all">
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-4 space-y-6">
                                <div className="glass-card p-6 bg-brand-primary text-white border-none">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Bell className="text-brand-accent animate-bounce" />
                                        <h4 className="font-black uppercase tracking-tight">Institutional Briefings</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                            <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-1">Urgent Update</p>
                                            <p className="text-xs font-bold leading-relaxed uppercase">Annual Sports Day registration begins tomorrow at main campus.</p>
                                        </div>
                                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Public Notice</p>
                                            <p className="text-xs font-bold leading-relaxed uppercase">Library new inventory access unlocked for Grade 8-10.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* MODALS */}
            {showFeeVoucher && (
                <FeeVoucher student={student} onClose={() => setShowFeeVoucher(false)} readOnly={true} />
            )}
        </div>
    );
};
