import { useState } from 'react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    MapPin,
    Tag,
    AlertCircle,
    CheckCircle2,
    CalendarDays
} from 'lucide-react';
import { cn } from '../utils/cn';

interface Event {
    id: string;
    title: string;
    date: string;
    type: 'Holiday' | 'Exam' | 'Event' | 'Admin';
    description?: string;
    location?: string;
    startTime?: string;
    endTime?: string;
}

const INITIAL_EVENTS: Event[] = [
    { id: '1', title: 'Spring Semester Start', date: '2026-02-01', type: 'Admin', description: 'Official start of the spring semester for all classes.' },
    { id: '2', title: 'Mid-Term Examinations', date: '2026-03-15', type: 'Exam', description: 'Block-wise mid-term exams for Grade 5 to 12.' },
    { id: '3', title: 'Annual Sports Day', date: '2026-02-14', type: 'Event', description: 'Inter-house sports competitions and award ceremony.', location: 'School Main Ground' },
    { id: '4', title: 'Pakistan Day Holiday', date: '2026-03-23', type: 'Holiday', description: 'National holiday observing Pakistan Day.' },
    { id: '5', title: 'Parent-Teacher Meeting', date: '2026-01-25', type: 'Event', description: 'Discussion on student performance and academic progress.', location: 'Main Seminar Hall', startTime: '09:00 AM', endTime: '01:00 PM' },
    { id: '6', title: 'Kashmir Day Holiday', date: '2026-02-05', type: 'Holiday' },
];

export const AcademicCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Starting Jan 2026
    const [events] = useState<Event[]>(INITIAL_EVENTS);
    const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const getEventsForDate = (dateStr: string) => {
        return events.filter(e => e.date === dateStr);
    };

    const renderDays = () => {
        const days = [];
        // Header
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => {
            days.push(
                <div key={d} className="h-10 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {d}
                </div>
            );
        });

        // Padding for first day
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`pad-${i}`} className="h-24 md:h-32 border-t border-l border-slate-50 dark:border-slate-800/50 bg-slate-50/20" />);
        }

        // Days
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayEvents = getEventsForDate(dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const isSelected = selectedDate === dateStr;

            days.push(
                <div
                    key={d}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                        "h-24 md:h-32 border-t border-l border-slate-50 dark:border-slate-800/50 p-2 transition-all cursor-pointer relative group",
                        isSelected ? "bg-blue-50/30 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/20"
                    )}
                >
                    <div className="flex justify-between items-start">
                        <span className={cn(
                            "w-7 h-7 flex items-center justify-center text-xs font-black rounded-lg transition-colors",
                            isToday ? "bg-blue-600 text-white shadow-lg" :
                                isSelected ? "bg-[#003366] text-white" : "text-slate-600 dark:text-slate-400"
                        )}>
                            {d}
                        </span>
                        {dayEvents.length > 0 && (
                            <div className="flex gap-0.5">
                                {dayEvents.slice(0, 3).map((e, i) => (
                                    <div key={i} className={cn(
                                        "w-1 h-1 rounded-full",
                                        e.type === 'Holiday' ? "bg-rose-500" :
                                            e.type === 'Exam' ? "bg-amber-500" :
                                                e.type === 'Event' ? "bg-emerald-500" : "bg-blue-500"
                                    )} />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mt-1 space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((e, i) => (
                            <div key={i} className={cn(
                                "px-1.5 py-0.5 rounded text-[8px] font-black truncate uppercase tracking-tighter",
                                e.type === 'Holiday' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                    e.type === 'Exam' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                        e.type === 'Event' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                            "bg-blue-50 text-blue-600 border border-blue-100"
                            )}>
                                {e.title}
                            </div>
                        ))}
                        {dayEvents.length > 2 && (
                            <div className="text-[7px] font-bold text-slate-400 pl-1">
                                +{dayEvents.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    const selectedDayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in font-outfit max-w-[1700px] mx-auto px-4 md:px-0">
            {/* Header section: More responsive */}
            <div className="bg-[#003366] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 border border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-400/10 blur-[80px] md:blur-[100px] rounded-full -mr-32 -mt-32 md:-mr-48 md:-mt-48" />

                <div className="flex items-center gap-4 md:gap-6 relative z-10">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-yellow-400 text-[#003366] rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shrink-0">
                        <CalendarIcon size={28} className="md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-1 md:mb-2 text-nowrap">
                            School <span className="text-yellow-400 italic">Calendar</span>
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="px-2 md:px-3 py-0.5 md:py-1 bg-white/10 rounded-full text-[8px] md:text-[9px] font-black text-blue-200 uppercase tracking-widest backdrop-blur-md">
                                Academic 2026
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4 relative z-10">
                    <div className="bg-white/5 backdrop-blur-2xl p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-white/10 flex items-center gap-2 md:gap-4 flex-1 md:flex-none justify-between md:justify-start">
                        <button onClick={prevMonth} className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl hover:bg-white/10 text-white flex items-center justify-center transition-all">
                            <ChevronLeft size={18} />
                        </button>
                        <div className="text-center min-w-[100px] md:min-w-[140px]">
                            <h3 className="text-[11px] md:text-sm font-black text-white uppercase tracking-widest">{monthNames[month]}</h3>
                            <p className="text-[9px] font-bold text-yellow-400/70">{year}</p>
                        </div>
                        <button onClick={nextMonth} className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl hover:bg-white/10 text-white flex items-center justify-center transition-all">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <button className="w-12 h-12 md:w-14 md:h-14 bg-yellow-400 text-[#003366] rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all shrink-0">
                        <Plus size={20} className="md:w-6 md:h-6" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-full">
                {/* Calendar Main Grid */}
                <div className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="grid grid-cols-7">
                        {renderDays()}
                    </div>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-lg">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Selected Period</h4>
                            <Tag size={14} className="text-blue-500" />
                        </div>

                        {selectedDate ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Timeline Coordinate</p>
                                    <h5 className="text-lg font-black text-[#003366] dark:text-white uppercase tracking-tight">
                                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </h5>
                                </div>

                                <div className="space-y-4">
                                    {selectedDayEvents.length > 0 ? (
                                        selectedDayEvents.map(e => (
                                            <div key={e.id} className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-600 before:rounded-full">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={cn(
                                                        "text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                                                        e.type === 'Holiday' ? "bg-rose-100 text-rose-600" :
                                                            e.type === 'Exam' ? "bg-amber-100 text-amber-600" :
                                                                e.type === 'Event' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                                                    )}>
                                                        {e.type}
                                                    </span>
                                                    {e.startTime && (
                                                        <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1">
                                                            <Clock size={10} /> {e.startTime}
                                                        </span>
                                                    )}
                                                </div>
                                                <h6 className="text-[13px] font-black text-slate-800 dark:text-white uppercase leading-tight mb-1">{e.title}</h6>
                                                {e.description && <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{e.description}</p>}
                                                {e.location && (
                                                    <div className="flex items-center gap-1.5 mt-2 text-[9px] font-bold text-slate-400">
                                                        <MapPin size={10} className="text-blue-500" />
                                                        {e.location}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                            <CalendarDays size={32} className="mb-4 text-slate-300" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No scheduled activities</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <AlertCircle size={32} className="mx-auto mb-4 text-slate-200" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Initiate date selection</p>
                            </div>
                        )}
                    </div>

                    {/* Stats / Quick Info */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">Upcoming Events</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black leading-none mb-1">Annual Sports Day</p>
                                    <p className="text-[9px] opacity-60 font-bold uppercase tracking-widest">In 26 Days</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
