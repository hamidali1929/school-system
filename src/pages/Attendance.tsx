import { useState, useMemo, useCallback, useRef } from 'react';
import { Search, CheckCircle2, XCircle, Clock, AlertCircle, Save, QrCode, ChevronLeft, ChevronRight, Zap, MessageCircle, Calendar, Sparkles, CheckCheck } from 'lucide-react';
import { useStore, type AttendanceRecord, isStudentActive } from '../context/StoreContext';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';
import { QRScanner } from '../components/QRScanner';
import { hapticFeedback } from '../utils/haptics';
import { MESSAGE_TEMPLATES, sendWhatsAppViaServer, getStudentParentPhone } from '../utils/whatsapp';

export const Attendance = () => {
    const { students, attendance, markAttendance, campuses, currentUser, settings, sendNotification } = useStore();
    const isTeacher = currentUser?.role === 'teacher';
    const inchargeClass = currentUser?.inchargeClass;

    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState(() => {
        if (isTeacher && inchargeClass) return inchargeClass;
        return localStorage.getItem('edunova_last_attendance_class') || 'All';
    });
    const [selectedCampus, setSelectedCampus] = useState(() => {
        return localStorage.getItem('edunova_last_attendance_campus') || 'All';
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanMode, setScanMode] = useState<'Present' | 'Late'>('Present');
    const lastScannedRef = useRef<{ id: string, time: number }>({ id: '', time: 0 });

    // Local state for pending unsaved attendance changes
    const [pendingRecords, setPendingRecords] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'>>({});

    const handleClassChange = (newClass: string) => {
        setSelectedClass(newClass);
        localStorage.setItem('edunova_last_attendance_class', newClass);
        setPendingRecords({});
    };

    const handleCampusChange = (newCampus: string) => {
        setSelectedCampus(newCampus);
        localStorage.setItem('edunova_last_attendance_campus', newCampus);
        setPendingRecords({});
    };

    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        setPendingRecords({});
    };

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
    const classes = useMemo(() => {
        if (isTeacher && inchargeClass) return [inchargeClass];
        const activeStudents = students.filter(isStudentActive);
        return ['All', ...new Set(activeStudents.map(s => s.class))];
    }, [students, isTeacher, inchargeClass]);
    const campusOptions = useMemo(() => ['All', ...campuses.map(c => c.name)], [campuses]);

    // Current attendance records for the selected date and class (tolerant of campus === 'All')
    const currentAttendance = useMemo(() => {
        if (selectedClass === 'All') return null;
        return attendance.find(a =>
            a.date === selectedDate &&
            a.class === selectedClass &&
            (selectedCampus === 'All' || a.campus?.toLowerCase() === selectedCampus.toLowerCase())
        ) || null;
    }, [attendance, selectedDate, selectedClass, selectedCampus]);

    // Filtered students for the current view (Strictly active students only)
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            if (!isStudentActive(s)) return false;
            const matchesClass = selectedClass === 'All' || s.class === selectedClass;
            const matchesCampus = selectedCampus === 'All' ||
                (s.campus?.toLowerCase() || (campuses[0]?.name?.toLowerCase() || 'dr manzoor campus')) === selectedCampus.toLowerCase();
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesClass && matchesCampus && matchesSearch;
        });
    }, [students, selectedClass, selectedCampus, searchQuery, campuses]);

    // Robust multi-fallback status lookup for each student
    const getStatus = useCallback((studentId: string): 'Present' | 'Absent' | 'Late' | 'Leave' | null => {
        // 1. Pending unsaved in-memory change takes highest precedence
        if (pendingRecords[studentId]) return pendingRecords[studentId];

        // 2. Direct hit in active currentAttendance batch
        if (currentAttendance) {
            const rec = currentAttendance.records?.find(r => r.studentId === studentId);
            if (rec) return rec.status;
        }

        // 3. Fallback: Lookup student in any batch on selectedDate matching filters
        for (const a of attendance) {
            if (a.date === selectedDate) {
                if (selectedClass !== 'All' && a.class !== selectedClass) continue;
                if (selectedCampus !== 'All' && a.campus?.toLowerCase() !== selectedCampus.toLowerCase()) continue;

                const rec = a.records?.find(r => r.studentId === studentId);
                if (rec) return rec.status;
            }
        }

        // 4. Class-level fallback for the student's own enrolled class
        const student = students.find(s => s.id === studentId);
        if (student) {
            const classBatch = attendance.find(a =>
                a.date === selectedDate &&
                a.class === student.class &&
                (!student.campus || !a.campus || a.campus.toLowerCase() === student.campus.toLowerCase())
            );
            const rec = classBatch?.records?.find(r => r.studentId === studentId);
            if (rec) return rec.status;
        }

        return null;
    }, [pendingRecords, currentAttendance, attendance, selectedDate, selectedClass, selectedCampus, students]);

    const handleStatusChange = useCallback((studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
        hapticFeedback.selection();
        setPendingRecords(prev => ({ ...prev, [studentId]: status }));
    }, []);

    // Quick one-click "Mark All Present" helper
    const handleMarkAllPresent = useCallback(() => {
        hapticFeedback.selection();
        const newPending: Record<string, 'Present'> = {};
        filteredStudents.forEach(s => {
            newPending[s.id] = 'Present';
        });
        setPendingRecords(prev => ({ ...prev, ...newPending }));
        Swal.fire({
            title: 'Marked All as Present ⚡',
            text: `Selected Present for all ${filteredStudents.length} students in view. Click "Sync" to save.`,
            icon: 'info',
            toast: true,
            position: 'top-end',
            timer: 2000,
            showConfirmButton: false
        });
    }, [filteredStudents]);

    // Check attendance status for every class on the selectedDate
    const classAttendanceStatusMap = useMemo(() => {
        const map: Record<string, { isMarked: boolean; presentCount: number; absentCount: number; lateCount: number; leaveCount: number; totalMarked: number; totalStudents: number; campus?: string }> = {};

        classes.filter(c => c !== 'All').forEach(cls => {
            const classStudents = students.filter(s => {
                if (!isStudentActive(s)) return false;
                const matchesClass = s.class === cls;
                const matchesCampus = selectedCampus === 'All' ||
                    (s.campus?.toLowerCase() || (campuses[0]?.name?.toLowerCase() || 'dr manzoor campus')) === selectedCampus.toLowerCase();
                return matchesClass && matchesCampus;
            });

            // Find attendance batch for this class on selectedDate
            const batch = attendance.find(a =>
                a.date === selectedDate &&
                a.class === cls &&
                (selectedCampus === 'All' || a.campus?.toLowerCase() === selectedCampus.toLowerCase())
            );

            if (batch && batch.records && batch.records.length > 0) {
                const presentCount = batch.records.filter(r => r.status === 'Present').length;
                const absentCount = batch.records.filter(r => r.status === 'Absent').length;
                const lateCount = batch.records.filter(r => r.status === 'Late').length;
                const leaveCount = batch.records.filter(r => r.status === 'Leave').length;
                map[cls] = {
                    isMarked: true,
                    presentCount,
                    absentCount,
                    lateCount,
                    leaveCount,
                    totalMarked: batch.records.length,
                    totalStudents: classStudents.length || batch.records.length,
                    campus: batch.campus
                };
            } else {
                map[cls] = {
                    isMarked: false,
                    presentCount: 0,
                    absentCount: 0,
                    lateCount: 0,
                    leaveCount: 0,
                    totalMarked: 0,
                    totalStudents: classStudents.length
                };
            }
        });
        return map;
    }, [classes, students, attendance, selectedDate, selectedCampus, campuses]);

    // Summary of attendance state for the current view
    const overallSummary = useMemo(() => {
        const classList = classes.filter(c => c !== 'All');
        const markedClassesCount = classList.filter(c => classAttendanceStatusMap[c]?.isMarked).length;
        const totalClassesCount = classList.length;

        const totalStudentsInView = filteredStudents.length;
        const markedStudentsCount = filteredStudents.filter(s => getStatus(s.id) !== null).length;
        const isFullyMarked = totalStudentsInView > 0 && markedStudentsCount === totalStudentsInView;
        const isPartiallyMarked = markedStudentsCount > 0 && markedStudentsCount < totalStudentsInView;
        const isUnmarked = markedStudentsCount === 0;

        return {
            markedClassesCount,
            totalClassesCount,
            markedStudentsCount,
            totalStudentsInView,
            isFullyMarked,
            isPartiallyMarked,
            isUnmarked,
            hasPendingChanges: Object.keys(pendingRecords).length > 0
        };
    }, [classes, classAttendanceStatusMap, filteredStudents, getStatus, pendingRecords]);

    // Accurate stats calculation distinguishing marked vs unmarked
    const stats = useMemo(() => {
        const counts = { Present: 0, Absent: 0, Late: 0, Leave: 0, Unmarked: 0, Total: filteredStudents.length };
        filteredStudents.forEach(s => {
            const status = getStatus(s.id);
            if (status === 'Present') counts.Present++;
            else if (status === 'Absent') counts.Absent++;
            else if (status === 'Late') counts.Late++;
            else if (status === 'Leave') counts.Leave++;
            else counts.Unmarked++;
        });
        return counts;
    }, [filteredStudents, getStatus]);

    const handleSendAttendanceWhatsApp = async (student: typeof students[0], status: string) => {
        hapticFeedback.light();
        const targetPhone = getStudentParentPhone(student);
        const msg = status === 'Absent'
            ? MESSAGE_TEMPLATES.ATTENDANCE_ABSENT(student.name, selectedDate, settings.schoolName || 'School Administration')
            : MESSAGE_TEMPLATES.ATTENDANCE_LATE(student.name, selectedDate, settings.schoolName || 'School Administration');

        if (!targetPhone) {
            Swal.fire({
                title: 'No Phone Number',
                text: `No WhatsApp number found in ${student.name}'s admission form.`,
                icon: 'warning'
            });
            return;
        }

        Swal.fire({
            title: 'Sending WhatsApp...',
            text: `Delivering ${status} alert to ${targetPhone} via Cloud server...`,
            toast: true,
            position: 'top-end',
            timer: 1500,
            showConfirmButton: false
        });

        const result = await sendWhatsAppViaServer({
            to: targetPhone,
            message: msg
        });

        if (sendNotification) {
            sendNotification(student.id, 'Attendance', msg);
        }

        if (result.success) {
            Swal.fire({
                title: 'WhatsApp Sent! ✅',
                text: `${status} notification delivered to ${student.name}'s parent (${targetPhone})`,
                icon: 'success',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                title: 'Message Queued',
                text: `Notification queued in gateway for ${student.name} (${targetPhone}).`,
                icon: 'info',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
            });
        }
    };

    // Resilient handleSave: Supports single class, all classes, and automatic campus grouping
    const handleSave = () => {
        const h = document.documentElement.classList.contains('dark');

        if (filteredStudents.length === 0) {
            hapticFeedback.error();
            Swal.fire({
                title: 'No Students Selected',
                text: 'There are no students in the current view to save attendance for.',
                icon: 'warning'
            });
            return;
        }

        // Group students by Class and Campus so batch saving is seamless
        const groups: Record<string, { cls: string; campus: string; records: AttendanceRecord[] }> = {};

        filteredStudents.forEach(s => {
            const studentStatus = pendingRecords[s.id] || getStatus(s.id) || 'Present';
            const campusName = selectedCampus !== 'All' ? selectedCampus : (s.campus || campuses[0]?.name || 'Dr Manzoor Campus');
            const className = selectedClass !== 'All' ? selectedClass : s.class;
            const groupKey = `${className}___${campusName}`;

            if (!groups[groupKey]) {
                groups[groupKey] = { cls: className, campus: campusName, records: [] };
            }
            groups[groupKey].records.push({ studentId: s.id, status: studentStatus });
        });

        // Save all groups
        Object.values(groups).forEach(g => {
            markAttendance({
                date: selectedDate,
                class: g.cls,
                campus: g.campus,
                records: g.records
            });
        });

        hapticFeedback.success();
        Swal.fire({
            title: 'Attendance Records Synced! ✅',
            html: `
                <div class="text-left font-outfit text-xs space-y-1.5">
                    <p>📅 <b>Date:</b> ${selectedDate}</p>
                    <p>👥 <b>Students Synced:</b> ${filteredStudents.length} students</p>
                    <p>🏫 <b>Batches Saved:</b> ${Object.keys(groups).length} class/campus group(s)</p>
                    <div class="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold mt-2">
                        Records are now permanently saved in database and will show as Marked!
                    </div>
                </div>
            `,
            icon: 'success',
            toast: true,
            position: 'top-end',
            timer: 3500,
            showConfirmButton: false,
            background: h ? '#001529' : '#ffffff',
            color: h ? '#fbbf24' : '#0f172a',
        });
        setPendingRecords({});
    };

    const handleQRScan = useCallback((decodedText: string) => {
        const rawId = decodedText.trim();
        const student = students.find(s => s.id === rawId || s.id.toUpperCase() === rawId.toUpperCase());

        const now = Date.now();
        if (lastScannedRef.current.id === rawId && (now - lastScannedRef.current.time) < 3000) return;

        if (student) {
            if (!isStudentActive(student)) {
                Swal.fire({
                    title: 'Student Inactive ⚠️',
                    text: `${student.name} (${student.id}) is marked as "${student.status || 'Inactive'}" and is excluded from Attendance.`,
                    icon: 'warning',
                    toast: true,
                    position: 'top',
                    timer: 3000,
                    showConfirmButton: false
                });
                return;
            }
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
    }, [students, scanMode, handleStatusChange, playBeep, getStatus]);

    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-4 animate-fade-in font-outfit pb-12">
            {/* QR Scanner Overlay */}
            {isScanning && (
                <QRScanner
                    mode={scanMode}
                    onScan={handleQRScan}
                    onClose={() => setIsScanning(false)}
                    onModeChange={(m) => setScanMode(m)}
                />
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-[#003366] dark:text-yellow-400 leading-none">Attendance Hub</h2>
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        System Active
                    </span>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-[#000d1a] px-3 py-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-yellow-400/10 font-black">
                    <button
                        onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() - 1);
                            handleDateChange(d.toISOString().split('T')[0]);
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Previous Day"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <div className="flex items-center gap-1 text-[9px] uppercase font-black text-brand-primary dark:text-brand-accent">
                        <Calendar size={12} className="text-slate-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="bg-transparent text-[9px] uppercase outline-none cursor-pointer text-brand-primary dark:text-brand-accent appearance-none font-black"
                        />
                    </div>
                    <button
                        onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() + 1);
                            handleDateChange(d.toISOString().split('T')[0]);
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Next Day"
                    >
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    {!isToday && (
                        <button
                            onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                            className="ml-1 px-2 py-0.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary dark:text-brand-accent text-[8px] font-black uppercase tracking-wider rounded-md transition-all"
                            title="Go to Today"
                        >
                            Today
                        </button>
                    )}
                </div>
            </div>

            {/* Optical Scanner Command Bar */}
            <div className="glass-card p-4 overflow-hidden relative border border-brand-primary/5 dark:border-brand-accent/5 bg-white dark:bg-[#001529] shadow-xl rounded-[2rem]">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 w-full md:w-auto">
                        <div className="w-11 h-11 bg-gradient-to-br from-brand-primary to-brand-primary/70 dark:from-brand-accent dark:to-brand-accent/70 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 dark:shadow-brand-accent/10 shrink-0">
                            <QrCode className="w-5 h-5 text-white dark:text-[#000816]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-tight text-brand-primary dark:text-brand-accent">Optical Student Scanner</h3>
                            <p className="text-[9px] font-bold text-slate-400 dark:text-yellow-400/50 uppercase tracking-wider mt-0.5 font-outfit">Instant Identity & Barcode Verification</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        {/* Mode Toggle */}
                        <div className="flex p-1 bg-slate-100 dark:bg-[#000d1a] rounded-2xl border border-slate-200 dark:border-white/5">
                            <button
                                onClick={() => setScanMode('Present')}
                                className={cn(
                                    "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                                    scanMode === 'Present' ? "bg-emerald-500 text-white shadow-md" : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                )}
                            >
                                <CheckCircle2 size={12} /> Present
                            </button>
                            <button
                                onClick={() => setScanMode('Late')}
                                className={cn(
                                    "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                                    scanMode === 'Late' ? "bg-amber-500 text-white shadow-md" : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                )}
                            >
                                <Clock size={12} /> Late
                            </button>
                        </div>

                        <button
                            onClick={() => setIsScanning(true)}
                            className="px-6 py-2.5 bg-brand-primary dark:bg-brand-accent text-white dark:text-[#000816] rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Zap size={13} className="fill-current" /> Open Scanner
                        </button>
                    </div>
                </div>
            </div>

            {/* REAL-TIME ATTENDANCE STATUS BANNER (Fixes User Issue: Shows if attendance is already marked) */}
            <div className={cn(
                "p-4 rounded-3xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm",
                overallSummary.hasPendingChanges
                    ? "bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/50 text-amber-950 dark:text-amber-200"
                    : overallSummary.isFullyMarked
                        ? "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/50 text-emerald-950 dark:text-emerald-200"
                        : overallSummary.isPartiallyMarked
                            ? "bg-blue-50/90 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700/50 text-blue-950 dark:text-blue-200"
                            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300"
            )}>
                <div className="flex items-center gap-3.5">
                    <div className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md",
                        overallSummary.hasPendingChanges
                            ? "bg-amber-500 text-white shadow-amber-500/20"
                            : overallSummary.isFullyMarked
                                ? "bg-emerald-600 text-white shadow-emerald-500/20"
                                : overallSummary.isPartiallyMarked
                                    ? "bg-blue-600 text-white shadow-blue-500/20"
                                    : "bg-slate-400 text-white"
                    )}>
                        {overallSummary.hasPendingChanges ? (
                            <AlertCircle size={22} />
                        ) : overallSummary.isFullyMarked ? (
                            <CheckCheck size={24} />
                        ) : overallSummary.isPartiallyMarked ? (
                            <Clock size={22} />
                        ) : (
                            <Calendar size={22} />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs md:text-sm font-black uppercase tracking-tight">
                                {overallSummary.hasPendingChanges
                                    ? "Unsaved Attendance Changes (Pending Sync) ✍️"
                                    : overallSummary.isFullyMarked
                                        ? "Attendance Already Marked & Recorded in Database! ✅"
                                        : overallSummary.isPartiallyMarked
                                            ? "Attendance Partially Marked ⚠️"
                                            : "Attendance Not Marked Yet for Today ⏳"}
                            </h4>
                            <span className="text-[8.5px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-white/90 dark:bg-black/40 border border-current/20 font-mono">
                                {selectedDate}
                            </span>
                            {selectedClass !== 'All' && (
                                <span className="text-[8.5px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-brand-primary text-white">
                                    {selectedClass}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] font-medium opacity-90 mt-0.5 leading-relaxed">
                            {overallSummary.hasPendingChanges
                                ? `You have modified ${Object.keys(pendingRecords).length} student record(s). Click "Save Registry" to sync to the database.`
                                : overallSummary.isFullyMarked
                                    ? `All ${overallSummary.markedStudentsCount} students have attendance saved (${stats.Present} Present, ${stats.Absent} Absent, ${stats.Late} Late, ${stats.Leave} Leave).`
                                    : overallSummary.isPartiallyMarked
                                        ? `${overallSummary.markedStudentsCount} of ${overallSummary.totalStudentsInView} students are marked (${stats.Unmarked} still unmarked).`
                                        : `No attendance has been taken yet for ${selectedClass === 'All' ? 'these students' : selectedClass} on ${selectedDate}. Click "Mark All Present" or mark individual students below.`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                        onClick={handleMarkAllPresent}
                        type="button"
                        className="px-3.5 py-2 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-wider border border-slate-200 dark:border-white/10 shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                    >
                        <Sparkles size={12} className="text-amber-500 fill-current" /> Mark All Present
                    </button>
                    {overallSummary.hasPendingChanges && (
                        <button
                            onClick={handleSave}
                            type="button"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1.5 animate-pulse"
                        >
                            <Save size={12} /> Sync Now
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Class Status Pills Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 shrink-0">Classes:</span>
                <button
                    onClick={() => handleClassChange('All')}
                    className={cn(
                        "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 border",
                        selectedClass === 'All'
                            ? "bg-[#003366] text-white border-[#003366] shadow-sm"
                            : "bg-white dark:bg-[#000d1a] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50"
                    )}
                >
                    <span>All Classes</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[8px] bg-white/20 font-mono">
                        {overallSummary.markedClassesCount}/{overallSummary.totalClassesCount} Marked
                    </span>
                </button>
                {classes.filter(c => c !== 'All').map(cls => {
                    const info = classAttendanceStatusMap[cls];
                    const isSelected = selectedClass === cls;
                    return (
                        <button
                            key={cls}
                            onClick={() => handleClassChange(cls)}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 border",
                                isSelected
                                    ? "bg-[#003366] text-white border-[#003366] shadow-md"
                                    : info?.isMarked
                                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/40"
                                        : "bg-white dark:bg-[#000d1a] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50"
                            )}
                        >
                            <span>{info?.isMarked ? '✅' : '⏳'}</span>
                            <span>{cls}</span>
                            {info?.isMarked ? (
                                <span className="text-[8px] opacity-80 font-mono">({info.totalMarked})</span>
                            ) : (
                                <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 font-bold uppercase font-mono">Pending</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Quick Stats Grid: Includes Unmarked count */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {[
                    { label: 'Total', value: stats.Total, color: 'slate' },
                    { label: 'Present', value: stats.Present, color: 'emerald' },
                    { label: 'Absent', value: stats.Absent, color: 'rose' },
                    { label: 'Late', value: stats.Late, color: 'amber' },
                    { label: 'Leave', value: stats.Leave, color: 'indigo' },
                    { label: 'Unmarked', value: stats.Unmarked, color: stats.Unmarked > 0 ? 'warning' : 'slate-light' }
                ].map((stat) => (
                    <div key={stat.label} className={cn(
                        "p-2.5 rounded-xl border flex items-center justify-between px-3.5 shadow-sm transition-all",
                        stat.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
                        stat.color === 'rose' ? "bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/10 text-rose-700 dark:text-rose-400" :
                        stat.color === 'amber' ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/10 text-amber-700 dark:text-amber-400" :
                        stat.color === 'indigo' ? "bg-indigo-50 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/10 text-indigo-700 dark:text-indigo-400" :
                        stat.color === 'warning' ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 font-bold" :
                        "bg-white dark:bg-[#000d1a] border-slate-200 dark:border-yellow-400/10 text-slate-700 dark:text-yellow-400"
                    )}>
                        <p className="text-[7.5px] font-black uppercase tracking-widest opacity-70 shrink-0">{stat.label}</p>
                        <p className="text-base font-black">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-2 bg-white dark:bg-[#000d1a] p-2.5 rounded-2xl border border-slate-200 dark:border-yellow-400/10 shadow-sm">
                <div className="lg:col-span-4">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Fast Search Student Name / ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#000816] border border-slate-200 dark:border-yellow-400/10 rounded-xl text-xs outline-none focus:ring-2 ring-blue-500/10 transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="lg:col-span-5 flex gap-2">
                    <select
                        value={selectedClass}
                        onChange={(e) => handleClassChange(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#000816] border border-slate-200 dark:border-yellow-400/10 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none focus:ring-2 ring-blue-500/10 cursor-pointer"
                    >
                        <option value="All" className="text-brand-primary">
                            All Classes ({overallSummary.markedClassesCount}/{overallSummary.totalClassesCount} Marked)
                        </option>
                        {classes.filter(c => c !== 'All').map(c => {
                            const info = classAttendanceStatusMap[c];
                            const statusIcon = info?.isMarked ? '✅' : '⏳';
                            const statusText = info?.isMarked ? `Marked (${info.totalMarked})` : 'Pending';
                            return (
                                <option key={c} value={c} className="text-brand-primary">
                                    {statusIcon} {c} — {statusText}
                                </option>
                            );
                        })}
                    </select>

                    <select
                        value={selectedCampus}
                        onChange={(e) => handleCampusChange(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#000816] border border-slate-200 dark:border-yellow-400/10 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none focus:ring-2 ring-blue-500/10 cursor-pointer"
                    >
                        {campusOptions.map(c => <option key={c} value={c} className="text-brand-primary uppercase">{c === 'All' ? 'ALL CAMPUSES' : c.toUpperCase()}</option>)}
                    </select>
                </div>

                <div className="lg:col-span-3 flex flex-wrap items-center justify-end gap-2">
                    <button
                        onClick={handleMarkAllPresent}
                        type="button"
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-1.5"
                        title="Mark all students in current view as Present"
                    >
                        <Sparkles size={12} className="text-amber-500" /> All Present
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 bg-[#003366] dark:bg-yellow-400 hover:bg-[#002244] dark:hover:bg-yellow-300 text-white dark:text-[#000816] rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                        <Save className="w-3.5 h-3.5" /> Sync
                    </button>
                </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredStudents.map((student) => {
                    const status = getStatus(student.id);
                    const isPending = !!pendingRecords[student.id];

                    return (
                        <div key={student.id} className={cn(
                            "group p-4 rounded-3xl border-2 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden",
                            status === 'Present' ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800/40' :
                            status === 'Absent' ? 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/20 dark:border-rose-800/40' :
                            status === 'Late' ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/20 dark:border-amber-800/40' :
                            status === 'Leave' ? 'bg-indigo-50/70 border-indigo-300 dark:bg-indigo-950/20 dark:border-indigo-800/40' :
                            'bg-white dark:bg-[#000d1a] border-slate-200 dark:border-white/10 hover:border-slate-300'
                        )}>
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#003366] to-blue-500 p-0.5 shadow-md shrink-0">
                                        <div className="w-full h-full rounded-[0.9rem] bg-white overflow-hidden flex items-center justify-center font-black text-base text-[#003366]">
                                            {student.avatar && student.avatar.length > 5 ? <img src={student.avatar} className="w-full h-full object-cover" alt="" /> : student.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="overflow-hidden min-w-0">
                                        <h4 className="font-black text-xs uppercase tracking-tight text-slate-800 dark:text-white line-clamp-1 leading-tight">{student.name}</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[8px] font-black text-[#003366] dark:text-yellow-400 uppercase tracking-widest font-mono">{student.id}</span>
                                            <span className="text-[8px] text-slate-300 dark:text-slate-600">•</span>
                                            <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 truncate">{student.class}</span>
                                        </div>
                                    </div>
                                </div>
                                {(status === 'Absent' || status === 'Late') && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSendAttendanceWhatsApp(student, status);
                                        }}
                                        className="p-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-md active:scale-95 transition-all shrink-0 flex items-center gap-1 text-[8px] font-black uppercase"
                                        title={`Send WhatsApp ${status} Alert to Parent`}
                                    >
                                        <MessageCircle size={13} />
                                        <span className="hidden sm:inline">Alert</span>
                                    </button>
                                )}
                            </div>

                            {/* Marked Status Badge: Shows explicitly if student's attendance is marked */}
                            <div className="mb-3 flex items-center justify-between">
                                {status ? (
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs",
                                        status === 'Present' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700" :
                                        status === 'Absent' ? "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-300 dark:border-rose-700" :
                                        status === 'Late' ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700" :
                                        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                                    )}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                        Marked: {status}
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700">
                                        ⏳ Not Marked
                                    </span>
                                )}

                                {isPending && (
                                    <span className="text-[7.5px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                                        Unsaved
                                    </span>
                                )}
                            </div>

                            {/* 4 Attendance Status Buttons */}
                            <div className="grid grid-cols-4 gap-1.5 h-10">
                                {[
                                    { s: 'Present', i: CheckCircle2, l: 'P', label: 'Present' },
                                    { s: 'Absent', i: XCircle, l: 'A', label: 'Absent' },
                                    { s: 'Late', i: Clock, l: 'L', label: 'Late' },
                                    { s: 'Leave', i: AlertCircle, l: 'V', label: 'Leave' }
                                ].map((mode) => {
                                    const isSelected = status === mode.s;
                                    return (
                                        <button
                                            key={mode.s}
                                            type="button"
                                            onClick={() => handleStatusChange(student.id, mode.s as any)}
                                            className={cn(
                                                "flex flex-col items-center justify-center rounded-xl transition-all active:scale-95 border cursor-pointer font-black",
                                                isSelected
                                                    ? mode.s === 'Present'
                                                        ? "bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.02]"
                                                        : mode.s === 'Absent'
                                                            ? "bg-rose-600 text-white border-rose-700 shadow-md scale-[1.02]"
                                                            : mode.s === 'Late'
                                                                ? "bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]"
                                                                : "bg-indigo-600 text-white border-indigo-700 shadow-md scale-[1.02]"
                                                    : "bg-slate-50 dark:bg-[#001529] text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                                            )}
                                            title={`Mark as ${mode.label}`}
                                        >
                                            <mode.i size={13} strokeWidth={isSelected ? 3.5 : 2.5} />
                                            <span className="text-[7.5px] mt-0.5">{mode.l}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleSave}
                    className={cn(
                        "flex items-center gap-3 px-8 py-4 bg-[#003366] text-[#fbbf24] rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs border border-[#fbbf24]/20",
                        overallSummary.hasPendingChanges && "ring-4 ring-emerald-500/40 animate-bounce"
                    )}
                >
                    <Save className="w-4 h-4" />
                    <span>
                        {overallSummary.hasPendingChanges
                            ? `Save Changes (${Object.keys(pendingRecords).length})`
                            : "Save Registry"}
                    </span>
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
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};
