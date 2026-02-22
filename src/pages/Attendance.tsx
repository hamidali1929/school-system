import { useState, useMemo, useCallback, useRef } from 'react';
import { Search, CheckCircle2, XCircle, Clock, AlertCircle, Save, QrCode, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useStore, type AttendanceRecord } from '../context/StoreContext';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';
import { QRScanner } from '../components/QRScanner';

export const Attendance = () => {
    const { students, attendance, markAttendance, campuses } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState('All');
    const [selectedCampus, setSelectedCampus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanMode, setScanMode] = useState<'Present' | 'Late'>('Present');
    const lastScannedRef = useRef<{ id: string, time: number }>({ id: '', time: 0 });

    const playBeep = useCallback(() => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.12);
        } catch (e) { console.warn("Audio Context Failed", e); }
    }, []);

    // Extracts unique classes and campuses for filters
    const classes = useMemo(() => ['All', ...new Set(students.map(s => s.class))], [students]);
    const campusOptions = useMemo(() => ['All', ...campuses.map(c => c.name)], [campuses]);

    // Current attendance records for the selected date, class, and campus
    const currentAttendance = useMemo(() => {
        return attendance.find(a => a.date === selectedDate && a.class === selectedClass && a.campus === selectedCampus);
    }, [attendance, selectedDate, selectedClass, selectedCampus]);

    // Local state for pending attendance changes before saving
    const [pendingRecords, setPendingRecords] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'>>({});

    // Filtered students for the current view
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesClass = selectedClass === 'All' || s.class === selectedClass;
            const matchesCampus = selectedCampus === 'All' || (s.campus || (campuses[0]?.name || 'Dr Manzoor Campus')) === selectedCampus;
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesClass && matchesCampus && matchesSearch;
        });
    }, [students, selectedClass, selectedCampus, searchQuery]);

    const handleStatusChange = useCallback((studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
        setPendingRecords(prev => ({ ...prev, [studentId]: status }));
    }, []);



    const handleSave = () => {
        const h = document.documentElement.classList.contains('dark');
        if (selectedClass === 'All' || selectedCampus === 'All') {
            Swal.fire({
                title: 'Operation Blocked',
                background: h ? '#001529' : '#ffffff',
                color: h ? '#fbbf24' : '#0f172a',
                text: 'Please select a specific Class and Campus to sync neural records.',
                icon: 'error',
                confirmButtonColor: h ? 'var(--brand-accent)' : 'var(--brand-primary)'
            });
            return;
        }

        const recordsToSave: AttendanceRecord[] = filteredStudents.map(s => {
            const status = pendingRecords[s.id] || (currentAttendance?.records.find(r => r.studentId === s.id)?.status || 'Present');
            return { studentId: s.id, status };
        });

        markAttendance({
            date: selectedDate,
            class: selectedClass,
            campus: selectedCampus,
            records: recordsToSave
        });

        Swal.fire({
            title: 'Attendance Records Updated',
            text: `Records synced for ${selectedClass}. WhatsApp alerts dispatched for absent/late students.`,
            icon: 'success',
            toast: true,
            position: 'top-end',
            timer: 4000,
            showConfirmButton: false,
            background: h ? '#001529' : '#ffffff',
            color: h ? '#fbbf24' : '#0f172a',
        });
        setPendingRecords({});
    };

    const getStatus = (studentId: string) => {
        if (pendingRecords[studentId]) return pendingRecords[studentId];
        const existing = currentAttendance?.records.find(r => r.studentId === studentId);
        return existing ? existing.status : null;
    };

    const stats = useMemo(() => {
        const counts = { Present: 0, Absent: 0, Late: 0, Leave: 0, Total: filteredStudents.length };
        filteredStudents.forEach(s => {
            const status = getStatus(s.id) || 'Present';
            counts[status as keyof typeof counts]++;
        });
        return counts;
    }, [filteredStudents, pendingRecords, currentAttendance]);

    const handleQRScan = useCallback((decodedText: string) => {
        // Direct Admission No Matching (Pure & Fast)
        const rawId = decodedText.trim();
        const student = students.find(s => s.id === rawId || s.id.toUpperCase() === rawId.toUpperCase());

        const now = Date.now();
        if (lastScannedRef.current.id === rawId && (now - lastScannedRef.current.time) < 3000) return;

        if (student) {
            lastScannedRef.current = { id: student.id, time: now };
            playBeep();

            const cStatus = getStatus(student.id);
            const h = document.documentElement.classList.contains('dark');
            if (cStatus === scanMode) {
                Swal.fire({
                    title: `Already ${scanMode}`,
                    text: `${student.name} is already marked as ${scanMode} for today.`,
                    icon: 'info',
                    toast: true,
                    position: 'top',
                    timer: 2000,
                    showConfirmButton: false,
                    background: h ? '#001529' : '#334155',
                    color: h ? '#fbbf24' : '#ffffff'
                });
                return;
            }

            handleStatusChange(student.id, scanMode);
            Swal.fire({
                title: 'Record Logged',
                text: `${student.name} - ${scanMode}`,
                icon: 'success',
                toast: true,
                position: 'top',
                timer: 1500,
                showConfirmButton: false,
                background: h ? '#001529' : '#10b981',
                color: h ? '#fbbf24' : '#ffffff'
            });
        }
    }, [students, scanMode, handleStatusChange, playBeep]);

    return (
        <div className="space-y-4 animate-fade-in font-outfit pb-10">
            {/* QR Scanner Overlay */}
            {isScanning && (
                <QRScanner
                    mode={scanMode}
                    onScan={handleQRScan}
                    onClose={() => setIsScanning(false)}
                    onModeChange={(m) => setScanMode(m)}
                />
            )}

            {/* Header Section: Compressed */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-[#003366] dark:text-yellow-400 leading-none">Attendance Hub</h2>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full">System Active</span>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-[#000d1a] px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-yellow-400/10 font-black">
                    <button
                        onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() - 1);
                            setSelectedDate(d.toISOString().split('T')[0]);
                        }}
                        className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent text-[9px] uppercase outline-none cursor-pointer text-brand-primary dark:text-brand-accent appearance-none font-black"
                    />
                    <button
                        onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() + 1);
                            setSelectedDate(d.toISOString().split('T')[0]);
                        }}
                        className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Master Optical Command Center: Unified */}
            <div className="glass-card p-4 overflow-hidden relative border border-brand-primary/5 dark:border-brand-accent/5 bg-white dark:bg-[#001529] shadow-xl rounded-[2rem]">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-primary/60 dark:from-brand-accent dark:to-brand-accent/60 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/20 dark:shadow-brand-accent/10">
                            <QrCode className="w-6 h-6 text-white dark:text-[#000816]" />
                        </div>
                        <div>
                            <h3 className="text-base font-black uppercase tracking-tight text-brand-primary dark:text-brand-accent">Optical Scanner</h3>
                            <p className="text-[9px] font-bold text-slate-400 dark:text-yellow-400/40 uppercase tracking-widest mt-0.5 font-outfit">Instant Identity Verification System</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                        {/* Mode Toggle */}
                        <div className="flex p-1 bg-slate-100 dark:bg-[#000d1a] rounded-2xl border border-slate-200 dark:border-white/5">
                            <button
                                onClick={() => setScanMode('Present')}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    scanMode === 'Present' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                )}
                            >
                                <CheckCircle2 size={12} /> Present
                            </button>
                            <button
                                onClick={() => setScanMode('Late')}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    scanMode === 'Late' ? "bg-amber-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                )}
                            >
                                <Clock size={12} /> Late
                            </button>
                        </div>

                        <button
                            onClick={() => setIsScanning(true)}
                            className="px-10 py-3 bg-brand-primary dark:bg-brand-accent text-white dark:text-[#000816] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Zap size={14} className="fill-current" /> Open Scanner
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid: Compressed Labels */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                    { label: 'Total', value: stats.Total, color: 'slate' },
                    { label: 'Present', value: stats.Present, color: 'emerald' },
                    { label: 'Absent', value: stats.Absent, color: 'rose' },
                    { label: 'Late', value: stats.Late, color: 'amber' },
                    { label: 'Leave', value: stats.Leave, color: 'indigo' }
                ].map((stat) => (
                    <div key={stat.label} className={cn(
                        "p-2.5 rounded-xl border flex items-center justify-between px-4 shadow-sm transition-all",
                        stat.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
                            stat.color === 'rose' ? "bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10 text-rose-700 dark:text-rose-400" :
                                stat.color === 'amber' ? "bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10 text-amber-700 dark:text-amber-400" :
                                    stat.color === 'indigo' ? "bg-indigo-50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/10 text-indigo-700 dark:text-indigo-400" :
                                        "bg-white dark:bg-[#000d1a] border-slate-100 dark:border-yellow-400/10 text-slate-700 dark:text-yellow-400"
                    )}>
                        <p className="text-[7px] font-black uppercase tracking-widest opacity-60 shrink-0">{stat.label}</p>
                        <p className="text-base font-black">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters Section: Compressed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-2 bg-white dark:bg-[#000d1a] p-2 rounded-xl border border-slate-100 dark:border-yellow-400/10 shadow-sm">
                <div className="lg:col-span-4">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Fast Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#000816] border border-slate-100 dark:border-yellow-400/10 rounded-lg text-xs outline-none focus:ring-2 ring-blue-500/10 transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="lg:col-span-4 flex gap-2">
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#000816] border border-slate-100 dark:border-yellow-400/10 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-blue-500/10"
                    >
                        <option value="All" className="text-brand-primary">All Classes</option>
                        {classes.filter(c => c !== 'All').map(c => <option key={c} value={c} className="text-brand-primary">{c}</option>)}
                    </select>

                    <select
                        value={selectedCampus}
                        onChange={(e) => setSelectedCampus(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#000816] border border-slate-100 dark:border-yellow-400/10 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-blue-500/10"
                    >
                        {campusOptions.map(c => <option key={c} value={c} className="text-brand-primary">{c === 'All' ? 'All Campuses' : c}</option>)}
                    </select>
                </div>

                <div className="lg:col-span-4 flex flex-wrap items-center justify-end gap-2">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-[#003366] dark:bg-yellow-400 hover:bg-[#002244] dark:hover:bg-yellow-300 text-white dark:text-[#000816] rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 transition-all w-full md:w-auto"
                    >
                        <Save className="w-3.5 h-3.5" /> Sync
                    </button>
                </div>
            </div>
            {/* Students Grid: Higher Density */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredStudents.map((student) => {
                    const status = getStatus(student.id);

                    return (
                        <div key={student.id} className={cn(
                            "group p-4 rounded-3xl border-2 transition-all duration-300 shadow-sm hover:shadow-md",
                            status === 'Present' ? 'bg-emerald-50 border-emerald-200' :
                                status === 'Absent' ? 'bg-rose-50 border-rose-200' :
                                    status === 'Late' ? 'bg-amber-50 border-amber-200' :
                                        status === 'Leave' ? 'bg-indigo-50 border-indigo-200' :
                                            'bg-white border-slate-50 hover:border-slate-100'
                        )}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#003366] to-blue-500 p-0.5 shadow-md shrink-0">
                                    <div className="w-full h-full rounded-[0.9rem] bg-white overflow-hidden flex items-center justify-center font-black text-lg text-[#003366]">
                                        {student.avatar && student.avatar.length > 5 ? <img src={student.avatar} className="w-full h-full object-cover" /> : student.name.charAt(0)}
                                    </div>
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-black text-xs uppercase tracking-tight text-slate-800 line-clamp-1 leading-tight">{student.name}</h4>
                                    <p className="text-[8px] font-black text-[#003366]/40 uppercase tracking-widest mt-0.5 font-mono">{student.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-1.5 h-10">
                                {[
                                    { s: 'Present', i: CheckCircle2, c: 'emerald', l: 'P' },
                                    { s: 'Absent', i: XCircle, c: 'rose', l: 'A' },
                                    { s: 'Late', i: Clock, c: 'amber', l: 'L' },
                                    { s: 'Leave', i: AlertCircle, c: 'indigo', l: 'V' }
                                ].map((mode) => (
                                    <button
                                        key={mode.s}
                                        onClick={() => handleStatusChange(student.id, mode.s as any)}
                                        className={cn(
                                            "flex flex-col items-center justify-center rounded-xl transition-all active:scale-95 border",
                                            status === mode.s
                                                ? `bg-${mode.c}-500 text-white border-transparent`
                                                : `bg-slate-50 text-slate-300 border-slate-100 hover:bg-${mode.c}-50`
                                        )}
                                    >
                                        <mode.i size={12} strokeWidth={3} />
                                        {/* <span className="text-[7px] font-black">{mode.l}</span> */}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fixed bottom-6 right-6 z-50">
                <button onClick={handleSave} className="flex items-center gap-3 px-8 py-4 bg-[#003366] text-[#fbbf24] rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs border border-[#fbbf24]/20">
                    <Save className="w-4 h-4" /> Save Registry
                </button>
            </div>

            <style>{`
                #reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 1.5rem; }
                #reader__scan_region { background: transparent !important; }
                #reader__dashboard { display: none !important; }
                @keyframes scan-line {
                    0% { top: 10%; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
                .animate-scan-line {
                    animation: scan-line 2s linear infinite;
                }
            `}</style>
        </div>
    );
};
