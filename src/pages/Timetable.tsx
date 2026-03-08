import { useState, useRef } from 'react';
import {
    Calendar, Download, Settings, Maximize2, Minimize2, Zap, Layout, Layers, Trash2, GraduationCap
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetablePage = () => {
    const {
        timetables, updateTimetable, updateAllTimetables, teachers, classes,
        periodSettings, updatePeriodSettings, currentUser, settings,
        classSubjects, subjectTeachers, campuses, students,
        wingAssignments, updateWingAssignments
    } = useStore();
    const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 0 : new Date().getDay() - 1]);
    const [activeWing, setActiveWing] = useState<'primary' | 'boys' | 'girls'>('primary');
    const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'teacher'>('daily');
    const [isExamMode, setIsExamMode] = useState(false);
    const [targetClass, setTargetClass] = useState<string>('');
    const [selectedCampus, setSelectedCampus] = useState<string>(campuses[0]?.name || '');
    const [targetTeacher, setTargetTeacher] = useState<string>('');
    const [density, setDensity] = useState<'comfortable' | 'compact'>('compact');
    const [isGenerating, setIsGenerating] = useState(false);
    const [draggedSlot, setDraggedSlot] = useState<{ cls: string, day: string, pIdx: number } | null>(null);
    const timetableRef = useRef<HTMLDivElement>(null);

    const campusClasses = classes.filter(c => {
        const hasStudents = students.some(s =>
            s.class?.trim().toLowerCase() === c.trim().toLowerCase() &&
            s.campus?.trim().toLowerCase() === selectedCampus.trim().toLowerCase()
        );
        const hasTeachers = teachers.some(t =>
            t.classes.some(tc => tc.trim().toLowerCase() === c.trim().toLowerCase()) &&
            t.campus?.trim().toLowerCase() === selectedCampus.trim().toLowerCase()
        );

        // Also show if it's Globally Empty (newly created), so it can be set up
        const isGloballyEmpty = !students.some(s => s.class?.trim().toLowerCase() === c.trim().toLowerCase()) &&
            !teachers.some(t => t.classes.some(tc => tc.trim().toLowerCase() === c.trim().toLowerCase()));

        return hasStudents || hasTeachers || isGloballyEmpty;
    });

    const getTimetableKey = (cls: string) => `${selectedCampus}_${cls}`;

    const canEditTimetable = currentUser?.role === 'admin' || currentUser?.role === 'ACADEMIC_HEAD';

    const calculateDurationStr = (start: string, end: string) => {
        if (!start || !end) return '0 Min';
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        return `${diff} Min`;
    };

    const minutesToTime = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const getTeacherWorkload = (day: string, periodIdx: number) => {
        const busyMap: Record<string, string[]> = {};
        classes.forEach(cls => {
            const tableKey = getTimetableKey(cls);
            const dayTable = timetables[tableKey]?.[day];
            if (dayTable && dayTable[periodIdx]) {
                const slot = dayTable[periodIdx];
                if (slot.teacherId) {
                    if (!busyMap[slot.teacherId]) busyMap[slot.teacherId] = [];
                    busyMap[slot.teacherId].push(cls);
                }
                if (slot.secondaryTeacherId) {
                    if (!busyMap[slot.secondaryTeacherId]) busyMap[slot.secondaryTeacherId] = [];
                    busyMap[slot.secondaryTeacherId].push(cls);
                }
            }
        });
        return busyMap;
    };

    const hasConflict = (teacherId: string, day: string, periodIdx: number) => {
        if (!teacherId || teacherId === '') return false;
        const busyMap = getTeacherWorkload(day, periodIdx);
        const assignedClasses = busyMap[teacherId] || [];
        return assignedClasses.length > 1;
    };

    const handleSmartSync = async () => {
        if (!canEditTimetable) return;
        setIsGenerating(true);

        const wingClasses = classes.filter(c => {
            if (wingAssignments[c]) return wingAssignments[c] === activeWing;
            const classLow = c.toLowerCase();
            const isGirls = classLow.includes('girls');
            const isBoys = classLow.includes('boys') || ['9th', '10th', '1st year', '2nd year', 'inter', 'matric'].some(p => classLow.includes(p));
            if (activeWing === 'girls') return isGirls;
            if (activeWing === 'boys') return isBoys && !isGirls;
            return !isBoys && !isGirls;
        });
        const periods = periodSettings[activeWing] || [];

        await new Promise(resolve => setTimeout(resolve, 2000));

        const teacherWorkload: Record<string, Record<string, Set<number>>> = {};
        const consecutivePeriods: Record<string, Record<string, number>> = {};

        const isTeacherFree = (tId: string, day: string, pIdx: number) => {
            if (!tId) return true;
            return !teacherWorkload[day]?.[tId]?.has(pIdx);
        };

        const markTeacherBusy = (tId: string, day: string, pIdx: number) => {
            if (!tId) return;
            if (!teacherWorkload[day]) teacherWorkload[day] = {};
            if (!teacherWorkload[day][tId]) teacherWorkload[day][tId] = new Set();
            teacherWorkload[day][tId].add(pIdx);

            if (!consecutivePeriods[day]) consecutivePeriods[day] = {};
            consecutivePeriods[day][tId] = (consecutivePeriods[day][tId] || 0) + 1;
        };

        const getConsecutive = (day: string, tId: string) => consecutivePeriods[day]?.[tId] || 0;

        const resetFatigue = (day: string) => {
            if (consecutivePeriods[day]) {
                Object.keys(consecutivePeriods[day]).forEach(tId => consecutivePeriods[day][tId] = 0);
            }
        };

        classes.forEach(c => {
            if (!wingClasses.includes(c)) {
                DAYS.forEach(day => {
                    const tableKey = getTimetableKey(c);
                    (timetables[tableKey]?.[day] || []).forEach((slot, pIdx) => {
                        if (slot.teacherId) markTeacherBusy(slot.teacherId, day, pIdx);
                    });
                });
            }
        });

        const newTimetables = { ...timetables };

        // Process each day
        DAYS.forEach(day => {
            const subjectsUsedToday: Record<string, Set<string>> = {};

            // Sort classes to process those with more subjects first
            const sortedWingClasses = [...wingClasses].sort((a, b) =>
                (classSubjects[b]?.length || 0) - (classSubjects[a]?.length || 0)
            );

            periods.forEach((p, pIdx) => {
                // FORCE ASSEMBLY as the FIRST SLOT (pIdx 0)
                if (pIdx === 0) {
                    sortedWingClasses.forEach(cls => {
                        const tableKey = getTimetableKey(cls);
                        if (!newTimetables[tableKey]) newTimetables[tableKey] = {};
                        if (!newTimetables[tableKey][day]) newTimetables[tableKey][day] = [];
                        newTimetables[tableKey][day][pIdx] = {
                            subject: 'ASSEMBLY', teacherId: '', startTime: p.start, endTime: p.end
                        };
                    });
                    resetFatigue(day);
                    return;
                }

                if (p.isBreak || p.label.toUpperCase().includes('ASSEMBLY')) {
                    sortedWingClasses.forEach(cls => {
                        const tableKey = getTimetableKey(cls);
                        if (!newTimetables[tableKey]) newTimetables[tableKey] = {};
                        if (!newTimetables[tableKey][day]) newTimetables[tableKey][day] = [];

                        const label = p.isBreak ? 'BREAK' : 'ASSEMBLY';
                        newTimetables[tableKey][day][pIdx] = {
                            subject: label, teacherId: '', startTime: p.start, endTime: p.end
                        };
                    });
                    resetFatigue(day);
                    return;
                }

                // For this specific period across all wing classes
                sortedWingClasses.forEach(cls => {
                    const tableKey = getTimetableKey(cls);
                    if (!newTimetables[tableKey]) newTimetables[tableKey] = {};
                    if (!newTimetables[tableKey][day]) newTimetables[tableKey][day] = [];

                    if (!subjectsUsedToday[cls]) subjectsUsedToday[cls] = new Set();

                    const clsSubjects = classSubjects[cls] || [];
                    const clsAssignedTeachers = subjectTeachers[cls] || {};

                    let availableSubjects = clsSubjects.filter(s => !subjectsUsedToday[cls].has(s));
                    if (availableSubjects.length === 0 && clsSubjects.length > 0) {
                        subjectsUsedToday[cls].clear();
                        availableSubjects = [...clsSubjects];
                    }

                    // Strict designated teacher check: Prioritize subjects where assigned teacher is FREE
                    availableSubjects.sort((a, b) => {
                        const tIdA = clsAssignedTeachers[a];
                        const tIdB = clsAssignedTeachers[b];
                        const freeA = tIdA ? (isTeacherFree(tIdA, day, pIdx) ? 0 : 1) : 2;
                        const freeB = tIdB ? (isTeacherFree(tIdB, day, pIdx) ? 0 : 1) : 2;
                        return freeA - freeB;
                    });

                    let assigned = false;

                    const findBestTeacher = (subj: string) => {
                        const campusLower = selectedCampus.trim().toLowerCase();

                        // 1. Strict Designated teacher preference
                        const prefId = clsAssignedTeachers[subj];
                        if (prefId) {
                            const prefT = teachers.find(t => t.id === prefId);
                            // If user has set a teacher, we ONLY use that teacher for this subject
                            if (prefT && prefT.status === 'Active' &&
                                prefT.campus?.trim().toLowerCase() === campusLower &&
                                isTeacherFree(prefId, day, pIdx)) {
                                return prefT;
                            }
                            // If the preferred teacher is BUSY, we cannot assign this subject in this slot 
                            // because user said "teacher change na kro us class mein"
                            return null;
                        }

                        // 2. Fallback Specialists (Only for subjects WITHOUT a designated teacher)
                        const specialists = teachers.filter(t =>
                            t.status === 'Active' &&
                            t.campus?.trim().toLowerCase() === campusLower &&
                            t.subject?.toLowerCase().includes(subj.toLowerCase()) &&
                            isTeacherFree(t.id, day, pIdx)
                        ).sort((a, b) => getConsecutive(day, a.id) - getConsecutive(day, b.id));

                        if (specialists.length > 0) return specialists[0];

                        // 3. Last Resort: Any Free (Emergency Fill)
                        const freeTeachers = teachers.filter(t =>
                            t.status === 'Active' &&
                            t.campus?.trim().toLowerCase() === campusLower &&
                            isTeacherFree(t.id, day, pIdx)
                        ).sort((a, b) => getConsecutive(day, a.id) - getConsecutive(day, b.id));

                        if (freeTeachers.length > 0) return freeTeachers[0];

                        return null;
                    };

                    for (const subj of availableSubjects) {
                        const teacher = findBestTeacher(subj);
                        if (teacher) {
                            newTimetables[tableKey][day][pIdx] = {
                                subject: subj, teacherId: teacher.id, startTime: p.start, endTime: p.end
                            };
                            markTeacherBusy(teacher.id, day, pIdx);
                            subjectsUsedToday[cls].add(subj);
                            assigned = true;
                            break;
                        }
                    }

                    if (!assigned) {
                        newTimetables[tableKey][day][pIdx] = {
                            subject: 'FREE', teacherId: '', startTime: p.start, endTime: p.end
                        };
                    }
                });
            });
        });

        updateAllTimetables(newTimetables);

        setIsGenerating(false);
        Swal.fire({
            title: 'Timetable Generated',
            text: `Timetables for ${wingClasses.length} classes have been created successfully.`,
            icon: 'success',
            toast: true,
            position: 'top-end',
            timer: 4000,
            showConfirmButton: false,
            background: document.documentElement.classList.contains('dark') ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? 'var(--brand-accent, #fbbf24)' : '#0f172a',
        });
    };

    const getAvailableTeachers = (day: string, periodIdx: number) => {
        const busyMap = getTeacherWorkload(day, periodIdx);
        const busyIds = new Set(Object.keys(busyMap));
        return teachers.filter(t =>
            !busyIds.has(t.id) &&
            t.status === 'Active' &&
            (!selectedCampus || t.campus?.trim().toLowerCase() === selectedCampus.trim().toLowerCase())
        );
    };

    const getFatigueStats = () => {
        const stats: Record<string, { consecutive: number, maxToday: number, currentConsecutive: number }> = {};

        teachers.forEach(t => {
            let maxToday = 0;
            let currentConsec = 0;
            let totalPeriods = 0;

            const pLength = (periodSettings[activeWing] || []).length;

            for (let i = 0; i < pLength; i++) {
                let isTeaching = false;
                Object.entries(timetables).forEach(([tableKey, table]) => {
                    if (!tableKey.startsWith(`${selectedCampus}_`)) return;
                    const slot = table[selectedDay]?.[i];
                    if (slot?.teacherId === t.id) isTeaching = true;
                });

                if (isTeaching) {
                    currentConsec++;
                    totalPeriods++;
                    maxToday = Math.max(maxToday, currentConsec);
                } else {
                    currentConsec = 0;
                }
            }
            stats[t.id] = { consecutive: maxToday, maxToday: totalPeriods, currentConsecutive: currentConsec };
        });

        return stats;
    };

    const showFreeTeachers = (day: string, periodIdx: number, pLabel: string) => {
        const available = getAvailableTeachers(day, periodIdx);
        const h = document.documentElement.classList.contains('dark');

        Swal.fire({
            title: `<span class="font-outfit uppercase font-black text-lg">Available Teachers</span>`,
            background: h ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
            color: h ? 'var(--brand-accent, #fbbf24)' : '#0f172a',
            html: `
                <div class="space-y-4 p-2 text-left font-outfit">
                    <div class="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mb-4 text-[10px] font-black uppercase text-emerald-600 tracking-widest text-center">
                        Free Teachers for ${day} - Period ${pLabel}
                    </div>
                    ${available.length > 0 ? `
                        <div class="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            ${available.map((t: any) => `
                                <div class="flex items-center gap-4 p-3 rounded-2xl ${h ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'} border transition-all hover:scale-[1.02]">
                                    <div class="w-10 h-10 rounded-[var(--brand-radius,1rem)] bg-[var(--brand-primary)] text-white flex items-center justify-center font-black">${t.name.charAt(0)}</div>
                                    <div class="flex-1">
                                        <p class="text-xs font-black uppercase tracking-tight">${t.name}</p>
                                        <p class="text-[9px] font-bold text-slate-400 mt-0.5">${t.subject || 'Expert'}</p>
                                    </div>
                                    <div class="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 text-[8px] font-black rounded-full uppercase">Available</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="py-10 text-center text-slate-400 font-bold uppercase text-[10px]">No Teachers currently free</div>
                    `}
                </div>
            `,
            confirmButtonText: 'Great, Thanks!',
            confirmButtonColor: 'var(--brand-primary)'
        });
    };

    const handleProxySearch = (cls: string, day: string, periodIdx: number, subject: string) => {
        const available = getAvailableTeachers(day, periodIdx);
        const h = document.documentElement.classList.contains('dark');

        // AI Scoring Logic
        const suggestions = available.map(t => {
            let score = 0;
            const tSubj = (t.subject || '').toLowerCase();
            const targetSubj = subject.toLowerCase();

            // 1. Subject Match (Highest Priority)
            if (tSubj.includes(targetSubj)) score += 100;

            // 2. Class Familiarity
            if (t.classes?.includes(cls)) score += 50;

            // 3. Department Match
            const departments: Record<string, string[]> = {
                'Science': ['physics', 'chemistry', 'biology', 'science'],
                'Math': ['math', 'mathematics', 'physics'],
                'Languages': ['english', 'urdu', 'arabic'],
                'Social': ['sst', 'history', 'geography', 'pst']
            };

            Object.values(departments).forEach(group => {
                if (group.some(ext => tSubj.includes(ext)) && group.some(ext => targetSubj.includes(ext))) {
                    score += 30;
                }
            });

            // 4. Effort/Load Balance (Consecutive periods today)
            const todayBusyCount = Object.entries(timetables).reduce((acc, [tableKey, table]) => {
                if (!tableKey.startsWith(`${selectedCampus}_`)) return acc;
                const dayTable = table[day] || [];
                return acc + dayTable.filter(slot => slot.teacherId === t.id).length;
            }, 0);
            score -= (todayBusyCount * 5); // Deduct points for high load

            return { ...t, score, load: todayBusyCount };
        }).sort((a, b) => b.score - a.score);

        Swal.fire({
            title: `<div class="flex items-center justify-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <svg class="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span class="font-outfit uppercase font-black text-lg">AI Proxy Suggester</span>
                    </div>`,
            background: h ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
            color: h ? 'var(--brand-accent, #fbbf24)' : '#0f172a',
            html: `
                <div class="space-y-4 p-2 text-left font-outfit">
                    <div class="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 mb-6">
                        <p class="text-[9px] font-black uppercase text-orange-600 tracking-[0.2em] mb-1">Replacement Target</p>
                        <p class="text-xs font-black uppercase text-slate-800 dark:text-white">${cls} | ${subject}</p>
                        <p class="text-[8px] font-bold text-slate-400 mt-1 uppercase">${day} - Period ${periodIdx + 1}</p>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        ${suggestions.slice(0, 5).map((t, idx) => `
                            <div class="relative group p-4 rounded-3xl ${h ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} border transition-all hover:bg-orange-500/10 hover:border-orange-500/30">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-lg">
                                        ${t.name.charAt(0)}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2">
                                            <p class="text-xs font-black uppercase tracking-tight text-brand-primary dark:text-white truncate">${t.name}</p>
                                            ${idx === 0 ? '<span class="px-1.5 py-0.5 bg-emerald-500 text-white text-[6px] font-black rounded uppercase">BEST MATCH</span>' : ''}
                                        </div>
                                        <p class="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">${t.subject || 'Generalist'}</p>
                                        <div class="flex items-center gap-3 mt-2">
                                            <div class="flex items-center gap-1">
                                                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                <p class="text-[8px] font-black text-slate-500 uppercase">Match: ${Math.max(0, Math.min(100, t.score))}%</p>
                                            </div>
                                            <div class="flex items-center gap-1">
                                                <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                <p class="text-[8px] font-black text-slate-500 uppercase">Load: ${t.load} Periods</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onclick="window.assignProxy('${cls}', '${day}', ${periodIdx}, '${t.id}')"
                                        class="px-4 py-2 bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary-dark text-[8px] font-black uppercase rounded-xl transition-all active:scale-95 shadow-lg"
                                    >
                                        Assign
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ${suggestions.length === 0 ? '<div class="py-10 text-center text-slate-400 font-bold uppercase text-[10px]">No suitable replacements found</div>' : ''}
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true
        });
    };

    (window as any).assignProxy = (cls: string, day: string, pIdx: number, teacherId: string) => {
        const tableKey = getTimetableKey(cls);
        const newTable = { ...(timetables[tableKey] || {}) };
        newTable[day] = [...(newTable[day] || [])];
        const oldSlot = newTable[day][pIdx];
        newTable[day][pIdx] = { ...oldSlot, teacherId };
        updateTimetable(getTimetableKey(cls), newTable);
        Swal.close();

        Swal.fire({
            title: 'Proxy Assigned',
            text: 'Timetable updated with substitute teacher.',
            icon: 'success',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
        });
    };

    const handleEditTimings = async () => {
        const periods = periodSettings[activeWing] || [];
        const h = document.documentElement.classList.contains('dark');
        const firstP = periods[0];
        const lastP = periods[periods.length - 1];
        const defStart = firstP?.start || "08:00";
        const defEnd = lastP?.end || "14:00";
        const defFriEnd = lastP?.friEnd || "12:30";
        const defCount = periods.length || 8;

        const { value: formValues } = await Swal.fire({
            title: `
                <div class="flex items-center justify-between px-5 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <h2 class="font-outfit uppercase font-black text-xs tracking-tight text-slate-800 dark:text-white">Time <span class="text-brand-primary">Settings</span></h2>
                    </div>
                </div>
            `,
            background: h ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
            color: h ? 'var(--brand-accent, #fbbf24)' : '#0f172a',
            customClass: {
                popup: 'rounded-[1.5rem] border-2 border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden',
                confirmButton: 'rounded-lg font-black uppercase tracking-widest px-6 py-2 text-[9px] bg-brand-primary h-auto',
                cancelButton: 'rounded-lg font-black uppercase tracking-widest px-6 py-2 text-[9px] bg-slate-100 dark:bg-white/5 text-slate-500 h-auto'
            },
            width: '800px',
            html: `
                <div class="p-2 font-outfit">
                    <div class="mb-2 p-2 rounded-xl bg-slate-900 text-white flex items-center gap-4 shadow-xl">
                        <button type="button" onclick="window.autoGeneratePeriods()" class="px-3 py-1.5 bg-brand-primary text-white rounded-md text-[8px] font-black uppercase tracking-widest">Auto Fill</button>
                        <div class="h-4 w-[1px] bg-white/10"></div>
                        <div class="flex-1 grid grid-cols-4 gap-2">
                            ${[
                    { id: 'smart-start', label: 'School Start', val: defStart },
                    { id: 'smart-count', label: 'Period Count', val: defCount, type: 'number' },
                    { id: 'smart-end', label: 'School End', val: defEnd },
                    { id: 'smart-fri-end', label: 'Friday End', val: defFriEnd }
                ].map(f => `
                                <div class="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                                    <span class="text-[7px] font-black uppercase text-slate-500 tracking-tighter shrink-0">${f.label}</span>
                                    <input id="${f.id}" type="${f.type || 'time'}" class="bg-transparent border-none text-[10px] font-bold text-white focus:outline-none p-0 w-full" value="${f.val}">
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Nano Ribbon Stream -->
                    <div class="space-y-1 max-h-[350px] overflow-y-auto px-1 custom-scrollbar">
                        <div class="flex items-center gap-4 px-4 py-1 opacity-30 text-[7px] font-black uppercase tracking-[0.2em]">
                             <div class="w-6 text-brand-primary">#</div>
                             <div class="w-16">Name / Period</div>
                             <div class="flex-1 text-center border-x border-slate-100 dark:border-white/5 italic">Normal Days (Mon-Sat)</div>
                             <div class="flex-1 text-center italic">Friday Timing</div>
                             <div class="w-8">Break?</div>
                        </div>

                        ${periods.map((p: any, i: number) => `
                            <div class="flex items-center gap-3 px-3 py-1 rounded-lg ${h ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'} border hover:bg-brand-primary/5 hover:border-brand-primary/20 transition-all group">
                                <span class="w-6 text-[10px] font-black text-slate-400 group-hover:text-brand-primary">${i + 1}</span>
                                
                                <input id="label-${i}" value="${p.label}" class="w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md text-[9px] font-black text-brand-primary p-1 text-center outline-none">
                                
                                <div class="flex-1 flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-md border border-slate-200 dark:border-white/5">
                                    <input id="start-${i}" type="time" value="${p.start}" class="bg-transparent border-none text-[11px] font-bold text-slate-700 dark:text-white w-full text-center outline-none">
                                    <div class="w-[1px] h-3 bg-slate-200 dark:bg-white/10"></div>
                                    <input id="end-${i}" type="time" value="${p.end}" class="bg-transparent border-none text-[11px] font-bold text-slate-700 dark:text-white w-full text-center outline-none">
                                </div>

                                <div class="flex-1 flex items-center justify-center gap-1.5 bg-blue-50/50 dark:bg-blue-900/10 p-1.5 rounded-md border border-blue-100/50 dark:border-blue-900/20">
                                    <input id="friStart-${i}" type="time" value="${p.friStart || p.start}" class="bg-transparent border-none text-[11px] font-bold text-blue-600 dark:text-blue-400 w-full text-center outline-none">
                                    <div class="w-[1px] h-3 bg-blue-200 dark:bg-blue-800"></div>
                                    <input id="friEnd-${i}" type="time" value="${p.friEnd || p.end}" class="bg-transparent border-none text-[11px] font-bold text-blue-600 dark:text-blue-400 w-full text-center outline-none">
                                </div>

                                <div class="w-8 flex justify-center">
                                     <input type="checkbox" id="break-${i}" ${p.isBreak ? 'checked' : ''} class="w-4 h-4 rounded-md border-slate-300 dark:border-white/10 text-brand-primary focus:ring-brand-primary">
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Nano Footer Utility -->
                    <div class="mt-2 flex items-center gap-2">
                         <button type="button" onclick="window.addPeriod()" class="flex-1 py-2 bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:text-brand-primary hover:border-brand-primary/50 transition-all flex items-center justify-center gap-2">
                             <span class="text-xs">+</span> Add New Period
                         </button>
                         ${periods.length > 0 ? `
                             <button type="button" onclick="window.removeLastPeriod()" class="px-4 py-2 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6V4c0-1-1-2-2-2H7c-1 0-2 1-2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M5 21h14"/></svg>
                             </button>
                         ` : ''}
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            confirmButtonColor: 'var(--brand-primary)',
            preConfirm: () => {
                const updated = periods.map((p: any, i: number) => {
                    const label = (document.getElementById(`label-${i}`) as HTMLInputElement).value;
                    const start = (document.getElementById(`start-${i}`) as HTMLInputElement).value;
                    const end = (document.getElementById(`end-${i}`) as HTMLInputElement).value;
                    const friStart = (document.getElementById(`friStart-${i}`) as HTMLInputElement).value;
                    const friEnd = (document.getElementById(`friEnd-${i}`) as HTMLInputElement).value;
                    const isBreak = (document.getElementById(`break-${i}`) as HTMLInputElement).checked;
                    return {
                        ...p,
                        label,
                        start,
                        end,
                        isBreak,
                        friStart,
                        friEnd,
                        duration: calculateDurationStr(start, end)
                    };
                });
                return updated;
            }
        });

        if (formValues) {
            updatePeriodSettings({ ...periodSettings, [activeWing]: formValues });
            Swal.fire({
                title: 'Schedule Updated',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: h ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
                color: h ? 'var(--brand-accent, #fbbf24)' : '#0f172a'
            });
        }
    };

    (window as any).addPeriod = () => {
        const current = periodSettings[activeWing] || [];
        const last = current[current.length - 1];
        const nextStart = last ? last.end : "08:00";
        const nextFriStart = last ? last.friEnd : "08:00";
        const [h, m] = nextStart.split(':').map(Number);
        const nextEnd = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const newItem = {
            label: `Period ${current.length + 1}`,
            start: nextStart,
            end: nextEnd,
            isBreak: false,
            friStart: nextFriStart,
            friEnd: nextEnd,
            duration: calculateDurationStr(nextStart, nextEnd)
        };
        updatePeriodSettings({ ...periodSettings, [activeWing]: [...current, newItem] });
        handleEditTimings();
    };

    (window as any).autoGeneratePeriods = () => {
        const startVal = (document.getElementById('smart-start') as HTMLInputElement)?.value;
        const endVal = (document.getElementById('smart-end') as HTMLInputElement)?.value;
        const friEndVal = (document.getElementById('smart-fri-end') as HTMLInputElement)?.value;
        const countVal = parseInt((document.getElementById('smart-count') as HTMLInputElement)?.value);

        if (!startVal || !endVal || !friEndVal || isNaN(countVal) || countVal <= 0) {
            Swal.showValidationMessage('Please fill all smart generator fields');
            return;
        }

        const [sh, sm] = startVal.split(':').map(Number);
        const [eh, em] = endVal.split(':').map(Number);
        const [feh, fem] = friEndVal.split(':').map(Number);

        const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
        const totalFriMinutes = (feh * 60 + fem) - (sh * 60 + sm);

        if (totalMinutes <= 0 || totalFriMinutes <= 0) {
            Swal.showValidationMessage('School closing time must be after start time');
            return;
        }

        const durationPerLecture = Math.floor(totalMinutes / countVal);
        const durationPerFriLecture = Math.floor(totalFriMinutes / countVal);

        const newPeriods = [];
        let rTime = sh * 60 + sm;
        let fTime = sh * 60 + sm;

        for (let i = 0; i < countVal; i++) {
            const rStart = minutesToTime(rTime);
            const rEnd = minutesToTime(rTime + durationPerLecture);
            const fStart = minutesToTime(fTime);
            const fEnd = minutesToTime(fTime + durationPerFriLecture);

            newPeriods.push({
                label: i === Math.floor(countVal / 2) && countVal > 4 ? 'BRK' : `P${i + 1}`,
                start: rStart,
                end: rEnd,
                friStart: fStart,
                friEnd: fEnd,
                isBreak: i === Math.floor(countVal / 2) && countVal > 4,
                duration: `${durationPerLecture} Min`
            });

            rTime += durationPerLecture;
            fTime += durationPerFriLecture;
        }

        updatePeriodSettings({ ...periodSettings, [activeWing]: newPeriods });

        Swal.close();
        setTimeout(() => handleEditTimings(), 100);
    };

    (window as any).removeLastPeriod = () => {
        const current = periodSettings[activeWing] || [];
        if (current.length === 0) return;
        updatePeriodSettings({ ...periodSettings, [activeWing]: current.slice(0, -1) });
        handleEditTimings();
    };

    const handleEditSlot = async (cls: string, day: string, periodIdx: number) => {
        if (!canEditTimetable) return;
        const currentTable = timetables[getTimetableKey(cls)]?.[day] || [];
        const currentSlot = currentTable[periodIdx] || { subject: 'FREE', teacherId: '', startTime: '', endTime: '' };
        const h = document.documentElement.classList.contains('dark');
        const clsSubjects = classSubjects[cls] || [];
        const clsTeachers = teachers.filter(t =>
            t.status === 'Active' &&
            t.campus?.trim().toLowerCase() === selectedCampus.trim().toLowerCase()
        );

        const { value: formValues } = await Swal.fire({
            title: `<span class="font-outfit uppercase font-black text-lg">Edit Period Slot</span>`,
            background: h ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
            color: h ? 'var(--brand-accent, #fbbf24)' : '#0f172a',
            customClass: {
                popup: 'rounded-[var(--brand-radius,3rem)] border-4 border-slate-100 shadow-2xl',
                confirmButton: 'rounded-xl font-black uppercase tracking-widest px-8',
                cancelButton: 'rounded-xl font-black uppercase tracking-widest px-8'
            },
            html: `
                <div class="space-y-5 p-2 text-left font-outfit">
                    <div class="p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/20 text-[10px] font-black uppercase text-brand-primary tracking-widest text-center">
                        Class: ${cls} | ${day} - Period ${periodIdx + 1}
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                            <label class="text-[9px] font-black uppercase text-slate-400">Primary Subject</label>
                            <select id="swal-subject" class="swal-input-premium">
                                <option value="FREE" ${currentSlot.subject === 'FREE' ? 'selected' : ''}>FREE</option>
                                <option value="BREAK" ${currentSlot.subject === 'BREAK' ? 'selected' : ''}>BREAK</option>
                                <option value="ASSEMBLY" ${currentSlot.subject === 'ASSEMBLY' ? 'selected' : ''}>ASSEMBLY</option>
                                ${clsSubjects.map((s: string) => `<option value="${s}" ${currentSlot.subject === s ? 'selected' : ''}>${s}</option>`).join('')}
                            </select>
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-[9px] font-black uppercase text-slate-400">Primary Teacher</label>
                            <select id="swal-teacher" class="swal-input-premium">
                                <option value="">No Teacher</option>
                                ${clsTeachers.map((t: any) => `<option value="${t.id}" ${currentSlot.teacherId === t.id ? 'selected' : ''}>${t.name} (${t.subject || 'Expert'})</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="pt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
                        <p class="text-[9px] font-black uppercase text-slate-300 tracking-widest">Optional Dual Subject (Co-teaching)</p>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="text-[9px] font-black uppercase text-slate-400">Secondary Subject</label>
                                <select id="swal-sec-subject" class="swal-input-premium">
                                    <option value="">None</option>
                                    ${clsSubjects.map((s: string) => `<option value="${s}" ${currentSlot.secondarySubject === s ? 'selected' : ''}>${s}</option>`).join('')}
                                </select>
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-[9px] font-black uppercase text-slate-400">Secondary Teacher</label>
                                <select id="swal-sec-teacher" class="swal-input-premium">
                                    <option value="">None</option>
                                    ${clsTeachers.map((t: any) => `<option value="${t.id}" ${currentSlot.secondaryTeacherId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            didOpen: () => {
                const subjSelect = document.getElementById('swal-subject') as HTMLSelectElement;
                const teacherSelect = document.getElementById('swal-teacher') as HTMLSelectElement;
                const secSubjSelect = document.getElementById('swal-sec-subject') as HTMLSelectElement;
                const secTeacherSelect = document.getElementById('swal-sec-teacher') as HTMLSelectElement;

                const filterTeachers = (sSelect: HTMLSelectElement, tSelect: HTMLSelectElement) => {
                    const subj = sSelect.value.toLowerCase();
                    const currentVal = tSelect.value;

                    if (['free', 'break', 'assembly', ''].includes(subj)) {
                        tSelect.innerHTML = '<option value="">NA</option>';
                        return;
                    }

                    const filtered = clsTeachers.filter(t =>
                        (t.subject?.toLowerCase().includes(subj)) ||
                        (subjectTeachers[cls]?.[sSelect.value] === t.id)
                    );

                    tSelect.innerHTML = '<option value="">Select Teacher...</option>' +
                        clsTeachers.map(t => {
                            const isMatch = filtered.some(ft => ft.id === t.id);
                            return `<option value="${t.id}" ${currentVal === t.id ? 'selected' : ''} style="display: ${isMatch ? 'block' : 'none'}; opacity: ${isMatch ? '1' : '0.3'}">${t.name} ${isMatch ? '' : '(Other)'}</option>`;
                        }).join('');
                };

                subjSelect.addEventListener('change', () => filterTeachers(subjSelect, teacherSelect));
                secSubjSelect.addEventListener('change', () => filterTeachers(secSubjSelect, secTeacherSelect));

                // Initial filter
                filterTeachers(subjSelect, teacherSelect);
                if (secSubjSelect.value) filterTeachers(secSubjSelect, secTeacherSelect);
            },
            showCancelButton: true,
            confirmButtonText: 'Update Slot',
            confirmButtonColor: 'var(--brand-primary)',
            preConfirm: () => {
                return {
                    subject: (document.getElementById('swal-subject') as HTMLSelectElement).value,
                    teacherId: (document.getElementById('swal-teacher') as HTMLSelectElement).value,
                    secondarySubject: (document.getElementById('swal-sec-subject') as HTMLSelectElement).value,
                    secondaryTeacherId: (document.getElementById('swal-sec-teacher') as HTMLSelectElement).value,
                    startTime: currentSlot.startTime,
                    endTime: currentSlot.endTime
                };
            }
        });

        if (formValues) {
            const newTable = { ...(timetables[getTimetableKey(cls)] || {}) };
            newTable[day] = [...(newTable[day] || [])];
            newTable[day][periodIdx] = formValues;
            updateTimetable(getTimetableKey(cls), newTable);
        }
    };

    const handlePrint = () => {
        const win = window.open('', '_blank');
        if (!win) return;

        const teacherName = viewMode === 'teacher' ? teachers.find(t => t.id === targetTeacher)?.name : '';
        const wingName = activeWing.toUpperCase();
        const exportTitle = viewMode === 'teacher' ? `Faculty Schedule - ${teacherName}` :
            viewMode === 'weekly' ? `Class Schedule - ${targetClass}` :
                `Weekly Master Registry - ${wingName}`;

        const wingClasses = classes.filter(c => {
            if (activeWing === 'primary') return !c.includes('(Boys)') && !c.includes('(Girls)') && !['9th', '10th', '1st Year', '2nd Year'].some(p => c.includes(p));
            if (activeWing === 'boys') return c.includes('(Boys)');
            return c.includes('(Girls)');
        }).filter(c => campusClasses.includes(c));
        const periods = periodSettings[activeWing] || [];

        const generateDayTable = (day: string) => {
            const tableRows = wingClasses.map(cls => {
                const tableKey = getTimetableKey(cls);
                const slots = timetables[tableKey]?.[day] || [];
                const cells = periods.map((p: any, i: number) => {
                    const slot = (slots[i] || { subject: 'FREE', teacherId: '' }) as any;
                    const isBreak = p.isBreak || slot.subject === 'BREAK';
                    const teacher = teachers.find(t => t.id === slot.teacherId);

                    if (isBreak) return `<td class="break-cell">BREAK</td>`;
                    if (slot.subject === 'FREE') return `<td>FREE</td>`;

                    return `
                        <td>
                            <span class="slot-subject">${isExamMode ? 'PAPER: ' : ''}${slot.subject}</span>
                            <span class="slot-teacher">${isExamMode ? 'INVIG: ' : ''}${teacher ? teacher.name : '??'}</span>
                            ${isExamMode ? '<span class="hall-tag">HALL A1</span>' : ''}
                        </td>
                    `;
                }).join('');

                return `
                    <tr>
                        <td class="class-name">${cls.replace(' (Boys)', '').replace(' (Girls)', '')}</td>
                        ${cells}
                    </tr>
                `;
            }).join('');

            return `
                <div class="day-section">
                    <div class="header">
                        <div class="side-logo">
                            ${settings.logo1 ? `<img src="${window.location.origin}${settings.logo1}" style="height: 100px; width: auto;" />` : ''}
                        </div>
                        <div class="center-info">
                            <div class="logo-text" style="font-size: 34px; letter-spacing: 1.5px; margin-bottom: 2px;">${settings.schoolName?.replace(/'+/g, "'")}</div>
                            <div style="font-size: 19px; font-weight: bold; margin-bottom: 10px; color: #111; text-transform: uppercase;">${settings.subTitle}</div>
                            <div class="subtitle-registry" style="border: 2.5px solid #000; padding: 6px 25px; border-radius: 6px; display: inline-block; background: #fafafa;">
                                ACADEMIC REGISTRY | ${wingName} WING
                            </div>
                        </div>
                        <div class="side-logo" style="text-align: right;">
                            ${settings.logo2 ? `<img src="${window.location.origin}${settings.logo2}" style="height: 100px; width: auto;" />` : ''}
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 100px;">CLASS</th>
                                ${periods.map((p: any) => `
                                    <th style="padding: 10px 2px;">
                                        <div style="font-size: 13px; margin-bottom: 5px; color: #000;">${p.label}</div>
                                        <div style="font-size: 8px; border-top: 1.5px solid #000; padding-top: 4px; line-height: 1.4;">
                                            <div style="font-weight: bold; color: #000;">${p.start} - ${p.end}</div>
                                            ${p.friStart ? `<div style="font-weight: normal; color: #555; font-size: 7.5px;">Fri: ${p.friStart}-${p.friEnd}</div>` : ''}
                                        </div>
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            `;
        };

        const contentHtml = viewMode === 'daily'
            ? generateDayTable(selectedDay)
            : timetableRef.current?.innerHTML || '';

        win.document.write(`
            <html>
                <head>
                    <title>${exportTitle}</title>
                    <style>
                        body { font-family: 'Times New Roman', Times, serif; padding: 0; background: white; color: #000; }
                        .day-section { padding: 30px; page-break-after: always; }
                        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3.5px double #000; padding-bottom: 15px; margin-bottom: 20px; }
                        .logo-text { font-size: 34px; font-weight: 800; text-transform: uppercase; color: #000; }
                        .subtitle-registry { font-size: 13px; font-weight: 800; color: #000; background: #fff; }
                        .center-info { text-align: center; flex: 1; }
                        .side-logo { width: 100px; flex-shrink: 0; }
                        
                        table { width: 100% !important; border-collapse: collapse; border: 2.5px solid #000; table-layout: fixed; }
                        th { background: #e5e5e5 !important; padding: 12px 2px; font-size: 12px; font-weight: bold; border: 1.5px solid #000; color: #000 !important; }
                        td { padding: 8px 4px; font-size: 11px; border: 1.2px solid #000; text-align: center; vertical-align: middle; color: #000 !important; }
                        
                        .class-name { font-weight: bold !important; text-align: left !important; background: #f0f0f0 !important; padding-left: 12px !important; width: 110px !important; font-size: 12px !important; }
                        .slot-subject { font-weight: bold !important; display: block !important; text-transform: uppercase !important; font-size: 10.5px !important; line-height: 1.1; margin-bottom: 2px; }
                        .slot-teacher { font-size: 9px !important; color: #000 !important; display: block !important; border-top: 1px dotted #999; margin-top: 3px; padding-top: 2px; }
                        .hall-tag { display: inline-block !important; border: 0.5px solid #000 !important; padding: 1px 3px !important; margin-top: 2px !important; font-size: 7px !important; background: #eee !important; }
                        .break-cell { font-style: italic; color: #555; font-weight: bold; background: #eeeeee !important; letter-spacing: 2px; font-size: 9px; }
                        
                        @media print {
                            @page { size: A4 landscape; margin: 0; }
                            .day-section { page-break-after: always; }
                        }
                    </style>
                </head>
                <body>
                    ${contentHtml}
                </body>
            </html>
        `);
        win.document.close();
        setTimeout(() => win.print(), 500);
    };

    const handleManageWings = async () => {
        const h = document.documentElement.classList.contains('dark');

        const { value: newAssignments } = await Swal.fire({
            title: '<span class="font-outfit uppercase font-black text-lg">Categorize Classes into Wings</span>',
            background: h ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
            color: h ? 'var(--brand-accent, #fbbf24)' : '#0f172a',
            width: '900px',
            customClass: {
                popup: 'rounded-[1.5rem] border-2 border-slate-100 dark:border-white/5 shadow-2xl',
                confirmButton: 'rounded-lg font-black uppercase tracking-widest px-6 py-2 text-[9px] bg-brand-primary h-auto',
                cancelButton: 'rounded-lg font-black uppercase tracking-widest px-6 py-2 text-[9px] bg-slate-100 dark:bg-white/5 text-slate-500 h-auto'
            },
            html: `
                <div class="p-4 font-outfit">
                    <p class="text-[9px] font-bold text-slate-400 uppercase mb-6 tracking-widest leading-relaxed">
                        Manually assign classes to their respective wings. This overrides automatic placement.
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto px-2 custom-scrollbar">
                        ${classes.map((cls, idx) => `
                            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                                <span class="text-[10px] font-black uppercase text-brand-primary dark:text-white truncate pr-2">${cls}</span>
                                <div class="flex gap-1">
                                    ${['primary', 'boys', 'girls'].map(wing => `
                                        <button 
                                            onclick="window.setLocalWingAssignment('${cls}', '${wing}')"
                                            id="btn-${cls}-${wing}"
                                            class="px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-tighter transition-all ${wingAssignments[cls] === wing ?
                    'bg-brand-primary text-white scale-105 shadow-md' :
                    'bg-white dark:bg-white/5 text-slate-400 hover:text-brand-primary'}"
                                        >
                                            ${wing}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save Configuration',
            preConfirm: () => {
                return (window as any).localWingAssignments;
            }
        });

        if (newAssignments) {
            updateWingAssignments(newAssignments);
            Swal.fire({
                title: 'Wings Updated',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: h ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
                color: h ? 'var(--brand-accent, #fbbf24)' : '#0f172a'
            });
        }
    };

    (window as any).localWingAssignments = { ...wingAssignments };
    (window as any).setLocalWingAssignment = (cls: string, wing: string) => {
        (window as any).localWingAssignments[cls] = wing;
        ['primary', 'boys', 'girls'].forEach(w => {
            const btn = document.getElementById(`btn-${cls}-${w}`);
            if (btn) {
                if (w === wing) {
                    btn.className = 'px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-tighter transition-all bg-brand-primary text-white scale-105 shadow-md';
                } else {
                    btn.className = 'px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-tighter transition-all bg-white dark:bg-white/5 text-slate-400 hover:text-brand-primary';
                }
            }
        });
    };

    const WingSection = ({ group }: { group: 'primary' | 'boys' | 'girls' }) => {
        const wingClasses = campusClasses.filter(c => {
            const classLow = c.toLowerCase();
            // Priority 1: Manual Assignment
            if (wingAssignments[c]) return wingAssignments[c] === group;

            // Priority 2: Automatic Fallback
            const isGirls = classLow.includes('girls');
            const isBoys = classLow.includes('boys') || ['9th', '10th', '1st year', '2nd year', 'inter', 'matric'].some(p => classLow.includes(p));

            // Girls take precedence if 'Girls' is in the name (e.g. 9th Girls)
            if (group === 'girls') return isGirls;
            if (group === 'boys') return isBoys && !isGirls;

            // Primary wing: No specific gender tag and not high school/college
            return !isBoys && !isGirls;
        });
        const periods = periodSettings[group] || [];

        if (wingClasses.length === 0) return null;

        return (
            <div className="space-y-6 mb-16 animate-slide-up">
                <div className={cn(
                    "flex items-center justify-between p-5 rounded-[var(--brand-radius,1.5rem)] border shadow-xl transition-all",
                    group === 'boys' ? "bg-brand-primary border-white/10" :
                        group === 'girls' ? "bg-purple-900 border-white/10" :
                            "bg-emerald-900 border-white/10"
                )}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[var(--brand-radius,1rem)] bg-white/10 flex items-center justify-center border border-white/20">
                            <Layout size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">{isExamMode ? 'Exam Seating & Invigilation' : `${group} Section`}</h3>
                            <span className="text-[9px] font-black text-white/50 uppercase tracking-tighter -mt-1">{isExamMode ? 'Assessment Mode' : 'Regular Timetable'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsExamMode(!isExamMode)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all flex items-center gap-2 border no-print",
                                isExamMode ? "bg-rose-500 text-white border-rose-400" : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                            )}
                        >
                            {isExamMode ? <Zap size={12} fill="currentColor" /> : <Calendar size={12} />}
                            {isExamMode ? 'Exam On' : 'Set Exam Mode'}
                        </button>
                        {canEditTimetable && (
                            <button
                                onClick={() => {
                                    Swal.fire({
                                        title: 'Purge Timetable?',
                                        text: `This will permanently delete all entries for the ${group} section.`,
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#f43f5e',
                                        cancelButtonColor: '#64748b',
                                        confirmButtonText: 'Yes, Purge All'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            wingClasses.forEach(c => updateTimetable(getTimetableKey(c), {}));
                                            Swal.fire('Purged!', 'Timetable has been cleared.', 'success');
                                        }
                                    });
                                }}
                                className="bg-white/10 hover:bg-rose-500 text-white p-2.5 rounded-[var(--brand-radius,0.75rem)] transition-all border border-white/20 group/purge no-print"
                            >
                                <Trash2 size={16} className="group-hover/purge:animate-pulse" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="glass-card overflow-hidden border-2 border-slate-200 dark:border-brand-accent/10 shadow-2xl rounded-[var(--brand-radius,1.5rem)] bg-white dark:bg-brand-accent/[0.02]">
                    <div className="overflow-x-auto overflow-y-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-slate-200 dark:bg-brand-primary-dark p-4 text-[10px] font-black text-slate-600 dark:text-brand-accent uppercase text-left border-b-2 border-slate-300 dark:border-brand-accent/30 w-[140px] sticky left-0 z-20 shadow-[5px_0_15px_rgba(0,0,0,0.05)]">Class Registry</th>
                                    {periods.map((p: any, i: number) => (
                                        <th key={i} className="bg-slate-100 dark:bg-brand-accent/10 p-4 text-[9px] font-black text-brand-primary dark:text-brand-accent uppercase border-b-2 border-slate-300 dark:border-brand-accent/30 border-l border-slate-200 dark:border-brand-accent/10">
                                            <div className="flex flex-col gap-0.5 items-center relative group/th">
                                                <span className="tracking-widest">{p.label}</span>
                                                <span className="text-[7.5px] opacity-60 font-bold">
                                                    {(selectedDay === 'Friday' && p.friStart) ? `${p.friStart} - ${p.friEnd}` : `${p.start} - ${p.end}`}
                                                </span>
                                                <button
                                                    onClick={() => showFreeTeachers(selectedDay, i, p.label)}
                                                    className="absolute -top-1 -right-1 opacity-0 group-hover/th:opacity-100 p-1 bg-emerald-500 text-white rounded-md shadow-lg transition-all hover:scale-110 active:scale-90 no-print"
                                                    title="View Available Teachers"
                                                >
                                                    <Zap size={8} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {wingClasses.map(cls => {
                                    const slots = timetables[getTimetableKey(cls)]?.[selectedDay] || [];
                                    return (
                                        <tr key={cls} className="hover:bg-slate-50/50 dark:hover:bg-brand-accent/5 transition-colors">
                                            <td className="p-5 font-black text-brand-primary dark:text-brand-accent text-xs border-r-2 border-slate-200 dark:border-brand-accent/20 bg-slate-50 dark:bg-brand-primary-dark sticky left-0 z-10 shadow-[5px_0_15px_rgba(0,0,0,0.05)] class-name">
                                                {cls.replace(' (Boys)', '').replace(' (Girls)', '')}
                                            </td>
                                            {periods.map((p: any, i: number) => {
                                                const slot = (slots[i] || { subject: 'FREE', teacherId: '' }) as any;
                                                const isBreak = p.isBreak || slot.subject === 'BREAK';
                                                const teacher = teachers.find(t => t.id === slot.teacherId);
                                                const isOnLeave = teacher?.status === 'On Leave';
                                                const primaryConflict = !isBreak && hasConflict(slot.teacherId, selectedDay, i);
                                                const secondaryConflict = !isBreak && hasConflict(slot.secondaryTeacherId || '', selectedDay, i);
                                                const anyConflict = primaryConflict || secondaryConflict;

                                                const onDragOver = (e: React.DragEvent) => {
                                                    e.preventDefault();
                                                    e.dataTransfer.dropEffect = 'move';
                                                };

                                                const onDrop = (e: React.DragEvent) => {
                                                    e.preventDefault();
                                                    if (!draggedSlot || draggedSlot.cls !== cls || draggedSlot.pIdx === i) return;

                                                    const tableKey = getTimetableKey(cls);
                                                    const newTable = { ...(timetables[tableKey] || {}) };
                                                    const daySlots = [...(newTable[selectedDay] || [])];

                                                    // Swap slots
                                                    const temp = daySlots[i];
                                                    daySlots[i] = daySlots[draggedSlot.pIdx];
                                                    daySlots[draggedSlot.pIdx] = temp;

                                                    newTable[selectedDay] = daySlots;
                                                    updateTimetable(getTimetableKey(cls), newTable);
                                                    setDraggedSlot(null);

                                                    Swal.fire({
                                                        title: 'Period Shifted',
                                                        text: `Successfully moved period to ${p.label} `,
                                                        icon: 'success',
                                                        toast: true,
                                                        position: 'top-end',
                                                        timer: 2000,
                                                        showConfirmButton: false,
                                                        background: document.documentElement.classList.contains('dark') ? '#001529' : '#ffffff',
                                                        color: document.documentElement.classList.contains('dark') ? '#fbbf24' : '#0f172a',
                                                    });
                                                };

                                                return (
                                                    <td
                                                        key={i}
                                                        draggable={canEditTimetable && !isBreak && slot.subject !== 'FREE'}
                                                        onDragStart={() => canEditTimetable && setDraggedSlot({ cls, day: selectedDay, pIdx: i })}
                                                        onDragOver={onDragOver}
                                                        onDrop={onDrop}
                                                        onClick={() => canEditTimetable && (isOnLeave ? handleProxySearch(cls, selectedDay, i, slot.subject) : handleEditSlot(cls, selectedDay, i))}
                                                        className={cn(
                                                            "border border-slate-200 dark:border-brand-accent/10 text-center relative group min-w-[120px] transition-all",
                                                            density === 'comfortable' ? "p-4" : "p-1.5",
                                                            isBreak && "bg-slate-100/50 dark:bg-brand-accent/10",
                                                            !isBreak && slot.subject === 'FREE' && "bg-slate-50/30 dark:bg-white/[0.01]",
                                                            isOnLeave && "bg-orange-500/10 dark:bg-orange-500/20 shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]",
                                                            anyConflict && "bg-rose-500/20 dark:bg-rose-500/20 shadow-[inset_0_0_20px_rgba(244,63,94,0.2)]",
                                                            draggedSlot?.pIdx === i && draggedSlot.cls === cls && "opacity-20 scale-95 grayscale",
                                                            canEditTimetable && "cursor-pointer"
                                                        )}
                                                    >
                                                        <div className="flex flex-col items-center w-full pointer-events-none">
                                                            <div className="flex flex-col items-center gap-0.5 w-full">
                                                                <span className={cn(
                                                                    "font-black uppercase leading-tight tracking-wide transition-colors slot-subject",
                                                                    density === 'comfortable' ? "text-[11px]" : "text-[9px]",
                                                                    isBreak ? "text-slate-400 italic" :
                                                                        slot.subject === 'FREE' ? "text-slate-300 dark:text-brand-accent/20" :
                                                                            isOnLeave ? "text-orange-600 dark:text-orange-400" :
                                                                                anyConflict ? "text-rose-600 dark:text-rose-400 animate-pulse" : "text-brand-primary dark:text-brand-accent"
                                                                )}>
                                                                    {isExamMode && !isBreak && slot.subject !== 'FREE' ? `PAPER: ${slot.subject} ` : isBreak ? 'BREAK' : slot.subject}
                                                                </span>
                                                                {!isBreak && slot.subject !== 'ASSEMBLY' && slot.subject !== 'FREE' && (
                                                                    <div className="flex flex-col items-center">
                                                                        <span className={cn(
                                                                            "font-bold leading-none slot-teacher",
                                                                            density === 'comfortable' ? "text-[9px]" : "text-[7.5px]",
                                                                            isOnLeave ? "text-orange-500/70" :
                                                                                primaryConflict ? "text-rose-600 dark:text-rose-400" : "text-[#64748B] dark:text-white/40"
                                                                        )}>
                                                                            {isExamMode ? 'INVIG: ' : ''}{teacher ? teacher.name : '??'}
                                                                        </span>
                                                                        {isOnLeave && (
                                                                            <span className="text-[6px] font-black bg-orange-500 text-white px-1 rounded-sm mt-1 animate-bounce">LEAVE</span>
                                                                        )}
                                                                        {isExamMode && (
                                                                            <span className="text-[6px] font-black bg-blue-500 text-white px-1 rounded-sm mt-1 uppercase tracking-tighter hall-tag">HALL A1</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {slot.secondarySubject && (
                                                                <div className="w-full mt-1.5 pt-1.5 border-t border-slate-200 dark:border-white/5 flex flex-col items-center gap-0.5">
                                                                    <span className="text-[7.5px] font-black text-blue-600 uppercase leading-none">{slot.secondarySubject}</span>
                                                                    <span className="text-[7px] font-bold text-slate-400 leading-none">{teachers.find(t => t.id === slot.secondaryTeacherId)?.name || '??'}</span>
                                                                </div>
                                                            )}

                                                            {canEditTimetable && isOnLeave && (
                                                                <div className="absolute inset-0 bg-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center no-print">
                                                                    <div className="bg-orange-600 text-white p-1 rounded-full shadow-lg">
                                                                        <Zap size={10} fill="currentColor" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    (window as any).showAvailableTeachers = showFreeTeachers;

    return (
        <div className="space-y-6 animate-fade-in pb-32 max-w-[1700px] mx-auto px-4 md:px-6 font-outfit">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black tracking-tighter uppercase text-brand-primary dark:text-brand-accent leading-none">Schedule Hub</h2>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full">Automated</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={selectedCampus}
                        onChange={(e) => setSelectedCampus(e.target.value)}
                        className="h-9 px-4 bg-white dark:bg-brand-primary-dark/80 border border-slate-200 dark:border-brand-accent/20 rounded-[var(--brand-radius,0.75rem)] text-[10px] font-black uppercase tracking-widest text-brand-primary dark:text-brand-accent outline-none shadow-sm focus:ring-2 focus:ring-brand-primary/20"
                    >
                        {campuses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>

                    <button
                        onClick={handleManageWings}
                        className="h-9 px-4 bg-white dark:bg-brand-primary-dark border border-slate-200 dark:border-brand-accent/20 rounded-[var(--brand-radius,0.75rem)] text-[9px] font-black uppercase tracking-widest text-brand-primary dark:text-brand-accent flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Layers size={14} />
                        Categorize Classes
                    </button>

                    <div className="flex p-1 bg-slate-100 dark:bg-brand-primary-dark/50 rounded-[var(--brand-radius,0.75rem)] border border-slate-200 dark:border-brand-accent/10">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={cn("px-4 py-1.5 rounded-[var(--brand-radius,0.5rem)] text-[9px] font-black uppercase tracking-widest transition-all", viewMode === 'daily' ? "bg-white dark:bg-brand-accent text-brand-primary dark:text-brand-primary-dark shadow-sm" : "text-slate-400")}
                        >
                            Daily Master
                        </button>
                        <button
                            onClick={() => setViewMode('weekly')}
                            className={cn("px-4 py-1.5 rounded-[var(--brand-radius,0.5rem)] text-[9px] font-black uppercase tracking-widest transition-all", viewMode === 'weekly' ? "bg-white dark:bg-brand-accent text-brand-primary dark:text-brand-primary-dark shadow-sm" : "text-slate-400")}
                        >
                            Weekly Class
                        </button>
                        <button
                            onClick={() => setViewMode('teacher')}
                            className={cn("px-4 py-1.5 rounded-[var(--brand-radius,0.5rem)] text-[9px] font-black uppercase tracking-widest transition-all", viewMode === 'teacher' ? "bg-white dark:bg-brand-accent text-brand-primary dark:text-brand-primary-dark shadow-sm" : "text-slate-400")}
                        >
                            Faculty Master
                        </button>
                    </div>

                    <div className="flex items-center gap-2 h-9 p-1 bg-white dark:bg-brand-primary-dark/50 rounded-[var(--brand-radius,0.75rem)] border border-slate-200 dark:border-brand-accent/10">
                        <button onClick={() => setDensity('comfortable')} className={cn("px-2.5 h-full rounded-[var(--brand-radius,0.5rem)] transition-all", density === 'comfortable' ? "bg-slate-100 dark:bg-brand-accent/20 text-brand-primary dark:text-brand-accent" : "text-slate-400")}>
                            <Maximize2 size={12} />
                        </button>
                        <button onClick={() => setDensity('compact')} className={cn("px-2.5 h-full rounded-[var(--brand-radius,0.5rem)] transition-all", density === 'compact' ? "bg-slate-100 dark:bg-brand-accent/20 text-brand-primary dark:text-brand-accent" : "text-slate-400")}>
                            <Minimize2 size={12} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
                        {canEditTimetable && (
                            <>
                                <button
                                    onClick={handleEditTimings}
                                    className="w-9 h-9 bg-slate-100 dark:bg-brand-accent/10 text-slate-600 dark:text-brand-accent rounded-[var(--brand-radius,0.75rem)] flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all border border-slate-200 dark:border-brand-accent/10"
                                    title="Timing Settings"
                                >
                                    <Settings size={14} />
                                </button>
                                <button
                                    onClick={handleSmartSync}
                                    disabled={isGenerating}
                                    className="w-9 h-9 bg-slate-100 dark:bg-brand-accent/10 text-slate-600 dark:text-brand-accent rounded-[var(--brand-radius,0.75rem)] flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all border border-slate-200 dark:border-brand-accent/10"
                                    title="Auto Sync Timetable"
                                >
                                    <Zap size={14} className={cn(isGenerating ? "animate-spin text-yellow-500" : "")} />
                                </button>
                            </>
                        )}
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-brand-primary text-white rounded-[var(--brand-radius,0.75rem)] text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
                        >
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                    {/* Fatigue Analysis Panel */}
                    {(() => {
                        const stats = getFatigueStats();
                        const highLoad = Object.entries(stats)
                            .filter(([_, s]) => s.consecutive >= 3 || s.maxToday >= 5)
                            .sort((a, b) => b[1].consecutive - a[1].consecutive)
                            .slice(0, 4);

                        if (highLoad.length === 0) return (
                            <div className="col-span-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl flex items-center gap-4">
                                <Zap className="text-emerald-500" size={20} />
                                <p className="text-xs font-black text-emerald-600 uppercase">Workload Optimized: No Faculty Fatigue Detected on {selectedDay}</p>
                            </div>
                        );

                        return highLoad.map(([tid, s]) => {
                            const t = teachers.find(x => x.id === tid);
                            return (
                                <div key={tid} className="bg-white dark:bg-brand-primary-dark p-4 rounded-[var(--brand-radius,1.5rem)] border-2 border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02] hover:border-rose-500/30">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                                        s.consecutive >= 4 ? "bg-rose-500 animate-pulse" : "bg-orange-500"
                                    )}>
                                        <Zap size={18} fill="currentColor" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-[10px] font-black uppercase text-brand-primary dark:text-white truncate">{t?.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[8px] font-black bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded uppercase">Load: {s.maxToday}</span>
                                            <span className={cn(
                                                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase",
                                                s.consecutive >= 4 ? "bg-rose-100 text-rose-600 font-black ring-1 ring-rose-200" : "bg-orange-100 text-orange-600"
                                            )}>Consec: {s.consecutive}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>

                <div className="lg:col-span-4 flex p-1 bg-slate-100 dark:bg-brand-primary-dark/50 rounded-[var(--brand-radius,1.25rem)] border border-slate-200 dark:border-brand-accent/10 h-10">
                    <button onClick={() => setActiveWing('primary')} className={cn("flex-1 rounded-[var(--brand-radius,1rem)] text-[10px] font-black uppercase tracking-widest transition-all", activeWing === 'primary' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400")}>Primary</button>
                    <button onClick={() => setActiveWing('boys')} className={cn("flex-1 rounded-[var(--brand-radius,1rem)] text-[10px] font-black uppercase tracking-widest transition-all", activeWing === 'boys' ? "bg-brand-primary text-white shadow-lg" : "text-slate-400")}>Boys</button>
                    <button onClick={() => setActiveWing('girls')} className={cn("flex-1 rounded-[var(--brand-radius,1rem)] text-[10px] font-black uppercase tracking-widest transition-all", activeWing === 'girls' ? "bg-purple-600 text-white shadow-lg" : "text-slate-400")}>Girls</button>
                </div>

                <div className="lg:col-span-8 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {viewMode === 'daily' ? (
                        DAYS.map(d => (
                            <button
                                key={d}
                                onClick={() => setSelectedDay(d)}
                                className={cn(
                                    "px-6 py-2 rounded-[var(--brand-radius,0.75rem)] text-[11px] font-black uppercase transition-all whitespace-nowrap tracking-widest flex items-center gap-2",
                                    selectedDay === d ? "bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary-dark shadow-lg" : "bg-white dark:bg-brand-primary-dark/30 text-slate-400 border border-slate-100 dark:border-brand-accent/10"
                                )}
                            >
                                <Calendar className="w-3 h-3" /> {d}
                            </button>
                        ))
                    ) : viewMode === 'weekly' ? (
                        <div className="flex-1">
                            <select
                                value={targetClass}
                                onChange={(e) => setTargetClass(e.target.value)}
                                className="w-full h-10 bg-white dark:bg-brand-primary-dark/50 border border-slate-200 dark:border-brand-accent/10 rounded-[var(--brand-radius,0.75rem)] px-4 text-[10px] font-black uppercase tracking-widest text-brand-primary dark:text-brand-accent outline-none"
                            >
                                <option value="">Select Class for Full Week Analysis...</option>
                                {campusClasses.filter(c => {
                                    const isBoys = c.includes('(Boys)') || c.includes('9th') || c.includes('10th') || c.includes('1st Year') || c.includes('2nd Year');
                                    const isGirls = c.includes('(Girls)');
                                    if (activeWing === 'boys') return isBoys;
                                    if (activeWing === 'girls') return isGirls;
                                    return !isBoys && !isGirls;
                                }).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div className="flex-1">
                            <select
                                value={targetTeacher}
                                onChange={(e) => setTargetTeacher(e.target.value)}
                                className="w-full h-10 bg-white dark:bg-brand-primary-dark/50 border border-slate-200 dark:border-brand-accent/10 rounded-[var(--brand-radius,0.75rem)] px-4 text-[10px] font-black uppercase tracking-widest text-brand-primary dark:text-brand-accent outline-none"
                            >
                                <option value="">Select Faculty Member to Analyze Load...</option>
                                {teachers.filter(t => t.status === 'Active' && (t.campus || campuses[0]?.name || 'Dr Manzoor Campus') === selectedCampus).map(t => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div ref={timetableRef} className="animate-fade-in">
                {viewMode === 'daily' ? (
                    <WingSection group={activeWing} />
                ) : viewMode === 'weekly' ? (
                    <div className="space-y-8 animate-slide-up">
                        {targetClass ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {DAYS.map(day => {
                                        const slots = timetables[getTimetableKey(targetClass)]?.[day] || [];
                                        const periods = periodSettings[activeWing] || [];
                                        const activePeriods = periods.filter(p => !p.isBreak);
                                        const loadPercentage = Math.round((slots.filter(s => s?.subject && s.subject !== 'FREE').length / activePeriods.length) * 100);

                                        return (
                                            <div key={day} className="group relative bg-white dark:bg-brand-primary-dark border border-slate-200 dark:border-brand-accent/10 rounded-[var(--brand-radius,2rem)] overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1">
                                                <div className="px-6 py-4 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-xs font-black text-brand-primary dark:text-brand-accent uppercase tracking-widest leading-none">{day}</h4>
                                                        <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">
                                                            {day === 'Friday' ? 'Friday Routine' : 'Regular Routine (Mon-Thu/Sat)'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-[var(--brand-radius,0.5rem)]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            <span className="text-[9px] font-black text-emerald-600 uppercase">{loadPercentage}% Load</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 space-y-2">
                                                    {periods.map((p: any, i: number) => {
                                                        const slot = (slots[i] || { subject: 'FREE', teacherId: '' }) as any;
                                                        const teacher = teachers.find(t => t.id === slot.teacherId);
                                                        const isBreak = p.isBreak || slot.subject === 'BREAK';

                                                        return (
                                                            <div key={i} className={cn(
                                                                "flex items-center gap-4 p-3 rounded-[var(--brand-radius,1rem)] border transition-all relative overflow-hidden",
                                                                isBreak ? "bg-slate-50/50 dark:bg-brand-accent/5 border-slate-100 dark:border-brand-accent/10 opacity-70" :
                                                                    slot.subject === 'FREE' ? "bg-white dark:bg-transparent border-slate-50 dark:border-white/5 opacity-40 hover:opacity-60" :
                                                                        "bg-white dark:bg-brand-primary-dark border-slate-100 dark:border-white/10 shadow-sm"
                                                            )}>
                                                                <div className="w-10 flex flex-col items-center shrink-0">
                                                                    <span className="text-[10px] font-black text-brand-primary dark:text-brand-accent/80 leading-none">{p.label}</span>
                                                                    <span className="text-[7.5px] font-bold text-slate-400 mt-1 uppercase">
                                                                        {day === 'Friday' && p.friStart ? p.friStart : p.start}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className={cn(
                                                                            "text-[10px] font-black uppercase tracking-tight truncate",
                                                                            isBreak ? "text-slate-400" : "text-brand-primary dark:text-white"
                                                                        )}>
                                                                            {isBreak ? 'BREAK' : slot.subject}
                                                                        </p>
                                                                        {slot.secondarySubject && <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-600 rounded-md font-black uppercase">DUAL</span>}
                                                                    </div>
                                                                    {!isBreak && slot.subject !== 'FREE' && (
                                                                        <p className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter truncate">
                                                                            Expert: {teacher?.name || 'Unassigned'}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {!isBreak && slot.subject !== 'FREE' && (
                                                                    <div className="w-7 h-7 rounded-[var(--brand-radius,0.5rem)] bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/5">
                                                                        <Zap className="w-3 h-3 text-slate-300" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-brand-primary-dark/30 border-2 border-dashed border-slate-200 dark:border-brand-accent/10 rounded-[var(--brand-radius,2.5rem)] animate-pulse">
                                <div className="w-20 h-20 rounded-[var(--brand-radius,2rem)] bg-slate-50 dark:bg-brand-accent/5 flex items-center justify-center mb-6">
                                    <Layers className="w-10 h-10 text-slate-200 dark:text-brand-accent/10" />
                                </div>
                                <h3 className="text-xl font-black text-slate-300 dark:text-brand-accent/10 uppercase tracking-widest">Select Academic Class</h3>
                                <p className="text-xs font-bold text-slate-400 mt-2">Choose a class to view its comprehensive weekly deployment strategy</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8 animate-slide-up">
                        {targetTeacher ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {DAYS.map(day => {
                                        const teacherLessons: any[] = [];
                                        Object.entries(timetables).forEach(([tableKey, weekTable]) => {
                                            if (!tableKey.startsWith(`${selectedCampus}_`)) return;
                                            const clsName = tableKey.replace(`${selectedCampus}_`, '');
                                            const daySlots = weekTable[day] || [];
                                            // Determine which wing settings to use based on class name or active wing
                                            // For simplicity, we'll try to match the class wing
                                            let wing: 'primary' | 'boys' | 'girls' = 'primary';
                                            if (clsName.includes('(Boys)')) wing = 'boys';
                                            else if (clsName.includes('(Girls)')) wing = 'girls';

                                            const periods = periodSettings[wing] || [];
                                            daySlots.forEach((slot, pIdx) => {
                                                if (slot.teacherId === targetTeacher || slot.secondaryTeacherId === targetTeacher) {
                                                    teacherLessons.push({
                                                        class: clsName,
                                                        subject: slot.teacherId === targetTeacher ? slot.subject : slot.secondarySubject,
                                                        period: periods[pIdx],
                                                        pIdx
                                                    });
                                                }
                                            });
                                        });

                                        teacherLessons.sort((a, b) => a.pIdx - b.pIdx);

                                        return (
                                            <div key={day} className="group relative bg-white dark:bg-brand-primary-dark border border-slate-200 dark:border-brand-accent/10 rounded-[var(--brand-radius,2rem)] overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                                                <div className="px-6 py-4 bg-brand-primary/5 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-xs font-black text-brand-primary dark:text-brand-accent uppercase tracking-widest leading-none">{day}</h4>
                                                        <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">
                                                            {day === 'Friday' ? 'Friday Schedule' : 'Standard Routine'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black text-brand-primary dark:text-white px-2 py-1 bg-white/50 dark:bg-white/10 rounded-lg">{teacherLessons.length} Periods</span>
                                                    </div>
                                                </div>

                                                <div className="p-4 space-y-2 min-h-[100px]">
                                                    {teacherLessons.length > 0 ? teacherLessons.map((lesson, idx) => (
                                                        <div key={idx} className="flex items-center gap-4 p-3 rounded-[var(--brand-radius,1rem)] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm transition-all hover:border-brand-accent/30 group/lesson">
                                                            <div className="w-10 flex flex-col items-center shrink-0">
                                                                <span className="text-[10px] font-black text-brand-primary dark:text-brand-accent/80 leading-none">{lesson.period?.label || 'P?'}</span>
                                                                <span className="text-[7.5px] font-bold text-slate-400 mt-1 uppercase whitespace-nowrap">
                                                                    {day === 'Friday' && lesson.period?.friStart ? lesson.period.friStart : (lesson.period?.start || '??')}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[10px] font-black text-brand-primary dark:text-white uppercase truncate">{lesson.class.replace(' (Boys)', '').replace(' (Girls)', '')}</p>
                                                                <p className="text-[8px] font-black text-blue-600 dark:text-brand-accent mt-0.5 uppercase tracking-tighter truncate">{lesson.subject}</p>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center border border-slate-100 dark:border-white/10 shadow-sm opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                                                <Maximize2 className="w-3.5 h-3.5 text-brand-accent" />
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="py-10 text-center">
                                                            <div className="text-[9px] font-black text-slate-300 dark:text-white/10 uppercase italic mb-2">Free Day</div>
                                                            <div className="text-[7px] font-bold text-slate-300 dark:text-white/5 uppercase">No lectures assigned</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-brand-primary-dark/30 border-2 border-dashed border-slate-200 dark:border-brand-accent/10 rounded-[var(--brand-radius,2.5rem)] animate-pulse">
                                <div className="w-20 h-20 rounded-[var(--brand-radius,2rem)] bg-slate-50 dark:bg-brand-accent/5 flex items-center justify-center mb-6">
                                    <GraduationCap className="w-10 h-10 text-slate-200 dark:text-brand-accent/10" />
                                </div>
                                <h3 className="text-xl font-black text-slate-300 dark:text-brand-accent/10 uppercase tracking-widest">Select Faculty Member</h3>
                                <p className="text-xs font-bold text-slate-400 mt-2">Choose a teacher to view their personal weekly academic deployment</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }

                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }

                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .swal-input-premium {
                    border: 2px solid #f1f5f9;
                    border-radius: var(--brand-radius, 12px);
                    padding: 10px 14px;
                    font-weight: 800;
                    font-size: 13px;
                    color: #334155;
                    width: 100%;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .dark .swal-input-premium {
                    background: var(--brand-primary-dark, #000c17);
                    border-color: #1e293b;
                    color: #f8fafc;
                }
                .swal-input-premium:focus {
                    border-color: var(--brand-primary);
                }
                .dark .swal-input-premium:focus {
                    border-color: var(--brand-accent);
                }

                @keyframes row-in {
                    0% { opacity: 0; transform: translateX(-20px) scale(0.95); background: rgba(16, 185, 129, 0.1); }
                    100% { opacity: 1; transform: translateX(0) scale(1); background: transparent; }
                }

                @keyframes row-out {
                    0% { opacity: 1; transform: translateX(0) scale(1); background: rgba(244, 63, 94, 0.1); }
                    100% { opacity: 0; transform: translateX(100px) scale(0.9); }
                }

                .animate-row-new { animation: row-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                .animate-row-purge { animation: row-out 0.4s cubic-bezier(0.4, 0, 1, 1) forwards; pointer-events: none; }
`}</style>
        </div >
    );
};
