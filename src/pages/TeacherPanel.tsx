import { useState, useMemo } from 'react';
import {
    GraduationCap,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    DollarSign,
    FileText,
    ChevronRight,
    Phone,
    Printer,
    Sparkles,
    Search,
    CalendarCheck,
    Check,
    MessageCircle,
    UserCheck,
    Award,
    X
} from 'lucide-react';
import { useStore, type Attendance } from '../context/StoreContext';
import Swal from 'sweetalert2';

interface TeacherPanelProps {
    onNavigate?: (id: string) => void;
}

export const TeacherPanel = ({ onNavigate }: TeacherPanelProps) => {
    const {
        currentUser,
        teachers,
        students,
        timetables,
        attendance,
        markAttendance,
        exams,
        examResults,
        inputMarks,
        finalizeResults,
        salarySlips,
        settings,
        classInCharge
    } = useStore();

    // Active sub-tab in Teacher Portal
    const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'students' | 'attendance' | 'marks' | 'salary'>('overview');

    // Current Teacher Record
    const teacher = useMemo(() => {
        return teachers.find(t =>
            t.id.toLowerCase() === currentUser?.id?.toLowerCase() ||
            t.username?.toLowerCase() === currentUser?.id?.toLowerCase()
        ) || {
            id: currentUser?.id || 'T-01',
            name: currentUser?.name || 'Faculty Member',
            subject: 'General Education',
            classes: [],
            status: 'Active' as const,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'Teacher'}`,
            campus: 'Main Campus',
            phone: '',
            baseSalary: 45000,
            inchargeClass: undefined
        };
    }, [teachers, currentUser]);

    // Teacher In-charge Class (if any)
    const inchargeClass = useMemo(() => {
        return teacher.inchargeClass || Object.keys(classInCharge).find(cls => classInCharge[cls] === teacher.id) || null;
    }, [teacher, classInCharge]);

    // In-charge Students
    const inchargeStudents = useMemo(() => {
        if (!inchargeClass) return [];
        return students.filter(s => s.class === inchargeClass && s.status === 'Active');
    }, [students, inchargeClass]);

    // Today's Day Name
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    const todayName = dayNames[todayIndex];
    const todayDateStr = new Date().toISOString().split('T')[0];

    // Today's Lectures from Timetable across all classes
    const todayLectures = useMemo(() => {
        const lectures: Array<{
            className: string;
            subject: string;
            startTime: string;
            endTime: string;
            isCurrent: boolean;
        }> = [];

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        Object.entries(timetables).forEach(([clsName, weekly]) => {
            const daySlots = weekly[todayName] || [];
            daySlots.forEach(slot => {
                if (
                    slot.teacherId === teacher.id ||
                    slot.secondaryTeacherId === teacher.id ||
                    slot.tertiaryTeacherId === teacher.id
                ) {
                    // Check if current lecture
                    let isCurrent = false;
                    if (slot.startTime && slot.endTime) {
                        try {
                            const [startH, startM] = slot.startTime.split(':').map(Number);
                            const [endH, endM] = slot.endTime.split(':').map(Number);
                            const startMin = startH * 60 + startM;
                            const endMin = endH * 60 + endM;
                            isCurrent = currentMinutes >= startMin && currentMinutes <= endMin;
                        } catch {}
                    }

                    lectures.push({
                        className: clsName,
                        subject: slot.subject,
                        startTime: slot.startTime || 'TBD',
                        endTime: slot.endTime || 'TBD',
                        isCurrent
                    });
                }
            });
        });

        return lectures.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [timetables, todayName, teacher.id]);

    // Attendance State for Today's Incharge Class
    const [selectedAttendanceClass, setSelectedAttendanceClass] = useState<string>(inchargeClass || (teacher.classes?.[0] || ''));
    const [attendanceDate, setAttendanceDate] = useState<string>(todayDateStr);

    const classStudentsForAttendance = useMemo(() => {
        return students.filter(s => s.class === selectedAttendanceClass && s.status === 'Active');
    }, [students, selectedAttendanceClass]);

    // Load existing attendance record for selected class & date
    const existingAttendance = useMemo(() => {
        return attendance.find(a => a.class === selectedAttendanceClass && a.date === attendanceDate);
    }, [attendance, selectedAttendanceClass, attendanceDate]);

    // Local state for attendance records
    const [localAttendance, setLocalAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Leave'>>({});

    // Sync local attendance when class or date changes
    const currentRecords = useMemo(() => {
        const recs: Record<string, any> = {};
        if (existingAttendance) {
            existingAttendance.records.forEach(r => {
                recs[r.studentId] = r.status;
            });
        }
        classStudentsForAttendance.forEach(s => {
            if (!recs[s.id]) {
                recs[s.id] = localAttendance[s.id] || 'Present';
            }
        });
        return recs;
    }, [existingAttendance, classStudentsForAttendance, localAttendance]);

    const handleToggleAttendance = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
        setLocalAttendance(prev => ({
            ...prev,
            ...currentRecords,
            [studentId]: status
        }));
    };

    const handleMarkAll = (status: 'Present' | 'Absent') => {
        const updated: Record<string, 'Present' | 'Absent' | 'Leave'> = {};
        classStudentsForAttendance.forEach(s => {
            updated[s.id] = status;
        });
        setLocalAttendance(updated);
    };

    const handleSaveAttendance = () => {
        if (!selectedAttendanceClass) return;

        const records = classStudentsForAttendance.map(s => ({
            studentId: s.id,
            status: localAttendance[s.id] || currentRecords[s.id] || 'Present',
            remarks: ''
        }));

        const newAttendance: Attendance = {
            date: attendanceDate,
            class: selectedAttendanceClass,
            campus: teacher.campus || 'Main Campus',
            records
        };

        markAttendance(newAttendance);

        Swal.fire({
            title: 'Attendance Saved! ✅',
            text: `Attendance for ${selectedAttendanceClass} on ${attendanceDate} has been recorded and synced.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    // Marks Entry State
    const activeExams = useMemo(() => exams, [exams]);
    const [selectedExamId, setSelectedExamId] = useState<string>(activeExams[0]?.id || '');
    const [selectedMarksClass, setSelectedMarksClass] = useState<string>(inchargeClass || teacher.classes?.[0] || '');
    const [selectedMarksSubject, setSelectedMarksSubject] = useState<string>(teacher.subject || '');

    const studentsForMarks = useMemo(() => {
        return students.filter(s => s.class === selectedMarksClass && s.status === 'Active');
    }, [students, selectedMarksClass]);

    // Teacher's Salary Slips
    const mySalarySlips = useMemo(() => {
        return salarySlips.filter(s => s.teacherId === teacher.id);
    }, [salarySlips, teacher.id]);

    // Student Search in In-Charge Class
    const [studentSearch, setStudentSearch] = useState('');
    const filteredInchargeStudents = useMemo(() => {
        return inchargeStudents.filter(s =>
            s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.id.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.fatherName?.toLowerCase().includes(studentSearch.toLowerCase())
        );
    }, [inchargeStudents, studentSearch]);

    // Print Salary Slip Modal
    const handlePrintSalarySlip = (slip: any) => {
        const netSalary = slip.baseSalary +
            (slip.allowances?.reduce((sum: number, a: any) => sum + Number(a.amount || 0), 0) || 0) -
            (slip.deductions?.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0) || 0);

        const printWindow = window.open('', '', 'width=800,height=900');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Salary Slip - ${teacher.name} (${slip.month} ${slip.year})</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; padding: 40px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 2px solid #003366; padding-bottom: 15px; margin-bottom: 25px; }
                        .title { font-size: 24px; font-weight: 900; color: #003366; text-transform: uppercase; margin: 0; }
                        .sub { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-top: 5px; }
                        .badge { display: inline-block; background: #f1f5f9; padding: 4px 12px; border-radius: 999px; font-weight: bold; font-size: 12px; margin-top: 10px; border: 1px solid #cbd5e1; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; }
                        th { background: #f8fafc; text-align: left; text-transform: uppercase; font-size: 10px; }
                        .text-right { text-align: right; }
                        .total-row { background: #003366; color: white; font-weight: bold; font-size: 14px; }
                        .total-row td { border-color: #003366; }
                        .footer { margin-top: 60px; display: flex; justify-content: space-between; }
                        .sig { text-align: center; width: 180px; border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 class="title">${settings.schoolName || "PIONEER'S SUPERIOR"}</h1>
                        <p class="sub">Institutional Faculty Compensation Statement</p>
                        <div class="badge">PAYSLIP FOR: ${slip.month.toUpperCase()} ${slip.year}</div>
                    </div>

                    <table>
                        <tr>
                            <th>Teacher Name</th>
                            <td><b>${teacher.name}</b></td>
                            <th>Employee ID</th>
                            <td><b>${teacher.id}</b></td>
                        </tr>
                        <tr>
                            <th>Department / Subject</th>
                            <td>${teacher.subject || 'Faculty'}</td>
                            <th>Designation / Status</th>
                            <td>${teacher.status || 'Active'}</td>
                        </tr>
                    </table>

                    <div style="display: flex; gap: 20px; margin-top: 20px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #047857;">Earnings / Allowances</h4>
                            <table>
                                <tr><th>Basic Salary</th><td class="text-right">RS ${Number(slip.baseSalary).toLocaleString()}</td></tr>
                                ${(slip.allowances || []).map((a: any) => `<tr><td>${a.type}</td><td class="text-right">RS ${Number(a.amount).toLocaleString()}</td></tr>`).join('')}
                            </table>
                        </div>
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #b91c1c;">Deductions</h4>
                            <table>
                                ${(slip.deductions || []).length > 0 ? (slip.deductions || []).map((d: any) => `<tr><td>${d.type}</td><td class="text-right">-RS ${Number(d.amount).toLocaleString()}</td></tr>`).join('') : '<tr><td colspan="2" style="text-align: center; color: #94a3b8;">No Deductions</td></tr>'}
                            </table>
                        </div>
                    </div>

                    <table style="margin-top: 25px;">
                        <tr class="total-row">
                            <td colspan="3" style="padding: 12px;">NET PAYABLE COMPENSATION</td>
                            <td class="text-right" style="padding: 12px; font-size: 16px;">RS ${netSalary.toLocaleString()}</td>
                        </tr>
                    </table>

                    <div class="footer">
                        <div class="sig">Accountant</div>
                        <div class="sig">Principal / Administrator</div>
                        <div class="sig">Teacher Signature</div>
                    </div>

                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6 animate-fade-in font-outfit pb-12">
            {/* HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003366] via-[#002244] to-[#001122] p-6 md:p-8 text-white shadow-2xl border border-white/10">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <img
                                src={teacher.avatar}
                                alt={teacher.name}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 p-1 object-cover border-2 border-amber-400 shadow-xl"
                            />
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-[#002244] rounded-full flex items-center justify-center text-[10px]">
                                <Check className="w-3 h-3 text-white" />
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-400 text-[#003366]">
                                    Faculty Portal
                                </span>
                                {inchargeClass && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                                        <Award className="w-3 h-3" /> In-Charge: {inchargeClass}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-xl md:text-3xl font-[1000] tracking-tight">{teacher.name}</h1>
                            <p className="text-xs md:text-sm text-slate-300 font-bold flex items-center gap-2 mt-0.5">
                                <span>{teacher.subject || 'General Educator'}</span>
                                <span>•</span>
                                <span>ID: {teacher.id}</span>
                                <span>•</span>
                                <span>{teacher.campus || 'Main Campus'}</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0 text-center min-w-[90px]">
                            <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Today's Lectures</p>
                            <p className="text-xl font-[1000]">{todayLectures.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0 text-center min-w-[90px]">
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">In-Charge</p>
                            <p className="text-xl font-[1000]">{inchargeStudents.length} <span className="text-xs font-normal">Students</span></p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0 text-center min-w-[90px]">
                            <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Assigned</p>
                            <p className="text-xl font-[1000]">{teacher.classes?.length || 0} <span className="text-xs font-normal">Classes</span></p>
                        </div>
                    </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* NAVIGATION TABS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-white/10">
                {[
                    { id: 'overview', label: 'Overview & Today', icon: Clock },
                    { id: 'attendance', label: 'Class Attendance', icon: CalendarCheck },
                    { id: 'marks', label: 'Marks Entry', icon: FileText },
                    { id: 'students', label: 'My Students', icon: GraduationCap },
                    { id: 'salary', label: 'Salary Slips', icon: DollarSign }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                                isActive
                                    ? 'bg-[#003366] text-white shadow-lg shadow-[#003366]/20'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: OVERVIEW & TODAY'S SCHEDULE */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Schedule Timeline */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black uppercase text-slate-900 dark:text-white">Today's Class Schedule</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{todayName} • {todayDateStr}</p>
                                </div>
                            </div>
                            <span className="text-xs font-black text-brand-primary px-3 py-1 bg-brand-primary/10 rounded-full">
                                {todayLectures.length} Total Periods
                            </span>
                        </div>

                        {todayLectures.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 space-y-2">
                                <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                                <p className="font-bold text-sm">No scheduled lectures for you today ({todayName}).</p>
                                <p className="text-xs text-slate-400">Timetable slots assigned to your ID will appear here automatically.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 mt-4">
                                {todayLectures.map((lec, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                                            lec.isCurrent
                                                ? 'bg-amber-500/10 border-amber-400 dark:bg-amber-400/5 shadow-md ring-2 ring-amber-400/30'
                                                : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-[1000] text-sm ${
                                                lec.isCurrent ? 'bg-amber-500 text-white shadow-lg' : 'bg-brand-primary text-white'
                                            }`}>
                                                P{idx + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-sm text-slate-900 dark:text-white">{lec.subject}</h4>
                                                    {lec.isCurrent && (
                                                        <span className="px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black uppercase rounded-full animate-pulse">
                                                            Ongoing
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                    <GraduationCap className="w-3.5 h-3.5 text-brand-primary" />
                                                    <span>Class: {lec.className}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-xs font-black px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                                                {lec.startTime} - {lec.endTime}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Shortcuts & In-Charge Status Card */}
                    <div className="space-y-6">
                        {/* In-Charge Classroom Card */}
                        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <span className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <UserCheck className="w-5 h-5 text-white" />
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
                                    In-Charge Hub
                                </span>
                            </div>
                            <h3 className="text-xl font-[1000] tracking-tight">{inchargeClass || "No Class Assigned"}</h3>
                            <p className="text-xs text-emerald-100 mt-1">
                                {inchargeClass ? `${inchargeStudents.length} Students under your care` : "Contact admin to assign class in-charge."}
                            </p>

                            {inchargeClass && (
                                <div className="mt-5 pt-4 border-t border-white/20 flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedAttendanceClass(inchargeClass);
                                            setActiveTab('attendance');
                                        }}
                                        className="flex-1 py-2 px-3 bg-white text-emerald-800 font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-emerald-50 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <CalendarCheck className="w-3.5 h-3.5" /> Mark Today
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('students')}
                                        className="py-2 px-3 bg-emerald-900/60 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-900 transition-all"
                                    >
                                        View Roster
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Educator Actions */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-white/10 space-y-3">
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Teacher Shortcuts</h4>
                            
                            <button
                                onClick={() => setActiveTab('marks')}
                                className="w-full p-3 bg-slate-50 dark:bg-white/5 hover:bg-brand-primary hover:text-white rounded-2xl flex items-center justify-between group transition-all border border-slate-100 dark:border-white/5"
                            >
                                <span className="flex items-center gap-3 font-bold text-xs">
                                    <FileText className="w-4 h-4 text-brand-primary group-hover:text-white transition-colors" />
                                    Exam Marks Entry
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => setActiveTab('salary')}
                                className="w-full p-3 bg-slate-50 dark:bg-white/5 hover:bg-brand-primary hover:text-white rounded-2xl flex items-center justify-between group transition-all border border-slate-100 dark:border-white/5"
                            >
                                <span className="flex items-center gap-3 font-bold text-xs">
                                    <DollarSign className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors" />
                                    View Salary Slips
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                            </button>

                            {onNavigate && (
                                <button
                                    onClick={() => onNavigate('timetable')}
                                    className="w-full p-3 bg-slate-50 dark:bg-white/5 hover:bg-brand-primary hover:text-white rounded-2xl flex items-center justify-between group transition-all border border-slate-100 dark:border-white/5"
                                >
                                    <span className="flex items-center gap-3 font-bold text-xs">
                                        <Calendar className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
                                        Full School Timetable
                                    </span>
                                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CLASS ATTENDANCE MARKING */}
            {activeTab === 'attendance' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-white/10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                        <div>
                            <h3 className="text-lg font-[1000] uppercase text-slate-900 dark:text-white flex items-center gap-2">
                                <CalendarCheck className="w-5 h-5 text-brand-primary" />
                                Student Daily Attendance Portal
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">
                                Mark and sync daily attendance directly to cloud institutional records.
                            </p>
                        </div>

                        {/* Class Selector & Date */}
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={selectedAttendanceClass}
                                onChange={e => setSelectedAttendanceClass(e.target.value)}
                                className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs outline-none border border-slate-200 dark:border-white/10"
                            >
                                {inchargeClass && <option value={inchargeClass}>In-Charge: {inchargeClass}</option>}
                                {(teacher.classes || []).map(cls => (
                                    cls !== inchargeClass && <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>

                            <input
                                type="date"
                                value={attendanceDate}
                                onChange={e => setAttendanceDate(e.target.value)}
                                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs outline-none border border-slate-200 dark:border-white/10"
                            />
                        </div>
                    </div>

                    {/* Quick Mark Bar */}
                    <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleMarkAll('Present')}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                                <Check className="w-3.5 h-3.5" /> All Present
                            </button>
                            <button
                                onClick={() => handleMarkAll('Absent')}
                                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-rose-700 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                                <X className="w-3.5 h-3.5" /> All Absent
                            </button>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-black">
                            <span className="text-emerald-600 flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                Present: {Object.values(currentRecords).filter(s => s === 'Present').length}
                            </span>
                            <span className="text-rose-600 flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                Absent: {Object.values(currentRecords).filter(s => s === 'Absent').length}
                            </span>
                            <span className="text-amber-600 flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                Leave: {Object.values(currentRecords).filter(s => s === 'Leave').length}
                            </span>
                        </div>

                        <button
                            onClick={handleSaveAttendance}
                            className="px-5 py-2 bg-brand-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 shadow-lg shadow-brand-primary/20 transition-all flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> Save Records
                        </button>
                    </div>

                    {/* Students List for Attendance */}
                    {classStudentsForAttendance.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <AlertCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                            <p className="font-bold text-sm">No active students found in {selectedAttendanceClass}.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {classStudentsForAttendance.map(s => {
                                const status = currentRecords[s.id] || 'Present';
                                return (
                                    <div
                                        key={s.id}
                                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                            status === 'Present'
                                                ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-800/30'
                                                : status === 'Absent'
                                                ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/10 dark:border-rose-800/30'
                                                : 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-800/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-xs text-slate-800 dark:text-slate-200">
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-xs text-slate-900 dark:text-white leading-tight">{s.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400">{s.id} • {s.fatherName || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleAttendance(s.id, 'Present')}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                                                    status === 'Present'
                                                        ? 'bg-emerald-600 text-white shadow-sm'
                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                                                }`}
                                            >
                                                P
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleAttendance(s.id, 'Absent')}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                                                    status === 'Absent'
                                                        ? 'bg-rose-600 text-white shadow-sm'
                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                                                }`}
                                            >
                                                A
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleAttendance(s.id, 'Leave')}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                                                    status === 'Leave'
                                                        ? 'bg-amber-600 text-white shadow-sm'
                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                                                }`}
                                            >
                                                L
                                            </button>

                                            {/* WhatsApp Alert for Absent */}
                                            {status === 'Absent' && (s.whatsappNumber || s.contactFather) && (
                                                <a
                                                    href={`https://wa.me/${(s.whatsappNumber || s.contactFather)?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum, Aap ka bacha ${s.name} (Class: ${s.class}) aaj ${attendanceDate} ko school se ghair-hazir (Absent) hai. - ${settings.schoolName}`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors ml-1"
                                                    title="Send WhatsApp Absent Notice to Father"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: MARKS ENTRY SHORTCUT */}
            {activeTab === 'marks' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-white/10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                        <div>
                            <h3 className="text-lg font-[1000] uppercase text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-brand-primary" />
                                Rapid Marks Entry
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">
                                Select an examination, class, and your subject to rapidly record assessment marks.
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={selectedExamId}
                                onChange={e => setSelectedExamId(e.target.value)}
                                className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs outline-none border border-slate-200 dark:border-white/10"
                            >
                                {activeExams.map(ex => (
                                    <option key={ex.id} value={ex.id}>{ex.name} {ex.session ? `(${ex.session})` : ''}</option>
                                ))}
                            </select>

                            <select
                                value={selectedMarksClass}
                                onChange={e => setSelectedMarksClass(e.target.value)}
                                className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs outline-none border border-slate-200 dark:border-white/10"
                            >
                                {inchargeClass && <option value={inchargeClass}>In-Charge: {inchargeClass}</option>}
                                {(teacher.classes || []).map(cls => (
                                    cls !== inchargeClass && <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                placeholder="Subject Name"
                                value={selectedMarksSubject}
                                onChange={e => setSelectedMarksSubject(e.target.value)}
                                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs outline-none border border-slate-200 dark:border-white/10 w-36"
                            />
                        </div>
                    </div>

                    {studentsForMarks.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <p className="font-bold text-sm">Please select a class with active students.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/10 uppercase tracking-widest text-[10px] text-slate-400 bg-slate-50 dark:bg-white/5">
                                        <th className="p-3">Student Name</th>
                                        <th className="p-3">ID</th>
                                        <th className="p-3">Total Marks</th>
                                        <th className="p-3">Obtained Marks</th>
                                        <th className="p-3">Percentage / Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {studentsForMarks.map(student => {
                                        const res = examResults.find(r => r.studentId === student.id && r.examId === selectedExamId);
                                        const subjectData = res?.marks?.[selectedMarksSubject] || { obtained: '', total: 100 };
                                        const currentObt = subjectData.obtained;
                                        const currentTot = subjectData.total || 100;
                                        const pct = currentObt !== '' && currentObt !== null && !isNaN(Number(currentObt)) ? Math.round((Number(currentObt) / currentTot) * 100) : null;

                                        return (
                                            <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                                <td className="p-3 font-bold text-slate-900 dark:text-white">
                                                    {student.name}
                                                </td>
                                                <td className="p-3 font-mono text-slate-400">{student.id}</td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        value={currentTot}
                                                        onChange={e => {
                                                            const newTot = Number(e.target.value) || 100;
                                                            inputMarks(selectedExamId, selectedMarksClass, student.id, selectedMarksSubject, currentObt, newTot);
                                                        }}
                                                        className="w-16 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-center font-bold text-xs"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        placeholder="Obt"
                                                        value={currentObt}
                                                        onChange={e => {
                                                            const newObt = e.target.value === '' ? '' : Number(e.target.value);
                                                            inputMarks(selectedExamId, selectedMarksClass, student.id, selectedMarksSubject, newObt, currentTot);
                                                        }}
                                                        className="w-20 p-1.5 bg-brand-primary/5 border border-brand-primary/20 text-brand-primary rounded-lg text-center font-black text-xs outline-none focus:ring-2 ring-brand-primary"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    {pct !== null ? (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                                            pct >= 80 ? 'bg-emerald-100 text-emerald-800' : pct >= 50 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                                                        }`}>
                                                            {pct}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-slate-600 font-mono">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex justify-end">
                                <button
                                    onClick={() => {
                                        finalizeResults(selectedExamId, selectedMarksClass);
                                        Swal.fire({
                                            title: 'Class Results Finalized! 🏆',
                                            text: `Results for ${selectedMarksClass} have been compiled and ranks updated.`,
                                            icon: 'success',
                                            timer: 2500,
                                            showConfirmButton: false
                                        });
                                    }}
                                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" /> Finalize & Rank Class Results
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 4: MY IN-CHARGE STUDENTS ROSTER */}
            {activeTab === 'students' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-white/10 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                        <div>
                            <h3 className="text-lg font-[1000] uppercase text-slate-900 dark:text-white flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-brand-primary" />
                                {inchargeClass ? `My Students (${inchargeClass})` : 'Class Students Roster'}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">
                                Total {filteredInchargeStudents.length} active students enrolled.
                            </p>
                        </div>

                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={studentSearch}
                                onChange={e => setStudentSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none border border-slate-200 dark:border-white/10 w-64"
                            />
                        </div>
                    </div>

                    {filteredInchargeStudents.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <p className="font-bold text-sm">No students found matching your search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredInchargeStudents.map(student => (
                                <div
                                    key={student.id}
                                    className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col justify-between gap-3 hover:border-brand-primary/30 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-[1000] text-sm shrink-0">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">{student.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 truncate">ID: {student.id}</p>
                                            <p className="text-[10px] text-slate-500 truncate">Father: {student.fatherName || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-[10px]">
                                        <span className="font-bold text-slate-500">
                                            Balance: <span className={Number(student.feesTotal || 0) > Number(student.feesPaid || 0) ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}>
                                                RS {Math.max(0, Number(student.feesTotal || 0) - Number(student.feesPaid || 0)).toLocaleString()}
                                            </span>
                                        </span>

                                        {(student.whatsappNumber || student.contactFather) && (
                                            <a
                                                href={`https://wa.me/${(student.whatsappNumber || student.contactFather)?.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-black flex items-center gap-1 transition-colors"
                                            >
                                                <Phone className="w-3 h-3" /> WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 5: MY SALARY SLIPS */}
            {activeTab === 'salary' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-white/10 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                        <div>
                            <h3 className="text-lg font-[1000] uppercase text-slate-900 dark:text-white flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                My Institutional Salary Slips
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">
                                Base Monthly Package: RS {Number(teacher.baseSalary || 45000).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {mySalarySlips.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 space-y-2">
                            <DollarSign className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                            <p className="font-bold text-sm">No official salary slips generated yet.</p>
                            <p className="text-xs text-slate-400">When the administration runs the monthly payroll, your payslips will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mySalarySlips.map(slip => {
                                const totalAllowances = slip.allowances?.reduce((sum, a) => sum + Number(a.amount || 0), 0) || 0;
                                const totalDeductions = slip.deductions?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0;
                                const netPay = Number(slip.baseSalary) + totalAllowances - totalDeductions;

                                return (
                                    <div
                                        key={slip.id}
                                        className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200/60 dark:border-white/10 space-y-4 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 bg-brand-primary text-white text-[10px] font-black uppercase rounded-full tracking-wider">
                                                {slip.month} {slip.year}
                                            </span>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                                                Disbursed
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Net Amount Received</p>
                                            <p className="text-2xl font-[1000] text-slate-900 dark:text-white">RS {netPay.toLocaleString()}</p>
                                        </div>

                                        <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/5 text-xs">
                                            <div className="flex justify-between text-slate-500">
                                                <span>Basic Salary:</span>
                                                <span className="font-bold text-slate-700 dark:text-slate-300">RS {Number(slip.baseSalary).toLocaleString()}</span>
                                            </div>
                                            {totalAllowances > 0 && (
                                                <div className="flex justify-between text-emerald-600">
                                                    <span>Total Allowances:</span>
                                                    <span className="font-bold">+RS {totalAllowances.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {totalDeductions > 0 && (
                                                <div className="flex justify-between text-rose-600">
                                                    <span>Total Deductions:</span>
                                                    <span className="font-bold">-RS {totalDeductions.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handlePrintSalarySlip(slip)}
                                            className="w-full py-2.5 bg-white dark:bg-slate-800 text-brand-primary border border-brand-primary/20 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <Printer className="w-3.5 h-3.5" /> Print Official Payslip
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
