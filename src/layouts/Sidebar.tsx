import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    UserSquare2,
    GraduationCap,
    CreditCard,
    FileText,
    Library,
    Settings,
    ChevronRight,
    LogOut,
    CalendarCheck,
    DollarSign,
    TrendingUp,
    X,
    Award,
    Calendar,
    Wallet,
    MessageCircle
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useStore } from '../context/StoreContext';

const menuItems = [
    { id: 'dashboard', label: 'dashboard', icon: LayoutDashboard, role: ['admin', 'student'], studentTab: 'overview' },
    { id: 'admin', label: 'Admin Panel', icon: Settings, role: ['admin'] },
    { id: 'teachers', label: 'Teacher Panel', icon: UserSquare2, role: ['admin'] },
    { id: 'students', label: 'All Students', icon: GraduationCap, role: ['admin', 'teacher'] },
    { id: 'classes', label: 'Classes & Fee Control', icon: Library, role: ['admin'] },

    { id: 'academic', label: 'Academic Record', icon: Award, role: ['student'], studentTab: 'academic' },
    { id: 'attendance_log', label: 'Attendance Log', icon: Calendar, role: ['student'], studentTab: 'attendance' },
    { id: 'fees_ledger', label: 'Fee Ledger', icon: Wallet, role: ['student'], studentTab: 'fees' },
    { id: 'communication', label: 'School Liaison', icon: MessageCircle, role: ['student'], studentTab: 'communication' },

    { id: 'fees', label: 'Fees Collection', icon: CreditCard, role: ['admin', 'teacher'] },
    { id: 'exams', label: 'Exams & Results', icon: FileText, role: ['admin', 'teacher'] },
    { id: 'analytics', label: 'Student Reports', icon: TrendingUp, role: ['admin'] },
    { id: 'attendance', label: 'Student Attendance', icon: CalendarCheck, role: ['admin', 'teacher'] },
    { id: 'timetable', label: 'Class Timetable', icon: Library, role: ['admin', 'student', 'teacher'] },
    { id: 'documents', label: 'Documents & Letters', icon: FileText, role: ['admin'] },
    { id: 'finance', label: 'Accounts & Finance', icon: DollarSign, role: ['admin'] },
];

export const Sidebar = ({ user, activeTab, setActiveTab, onLogout, onClose }: {
    user: { name: string; role: string; permissions?: string[] };
    activeTab: string;
    setActiveTab: (id: string) => void;
    onLogout: () => void;
    onClose?: () => void;
}) => {
    const { settings } = useStore();

    const filteredMenuItems = menuItems.filter(item => {
        const hasRole = item.role.includes(user.role.toLowerCase());
        if (!hasRole) return false;

        if (user.role === 'teacher') {
            if (item.id === 'students') {
                return user.permissions?.includes('students_add') || user.permissions?.includes('students_view');
            }
            if (item.id === 'attendance') {
                return user.permissions?.includes('attendance_mark');
            }
            if (item.id === 'exams') {
                return user.permissions?.includes('results_manage');
            }
            if (item.id === 'fees') {
                return user.permissions?.includes('fees_manage');
            }
        }

        return true;
    });

    return (
        <div className="w-80 h-screen bg-brand-primary dark:bg-[#000816] flex flex-col p-6 sticky top-0 overflow-y-auto border-r border-white/10 dark:border-yellow-400/10 shadow-2xl transition-all duration-300 relative">
            {/* Mobile Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-yellow-400 border border-white/10 transition-all z-[120]"
                >
                    <X className="w-6 h-6" />
                </button>
            )}

            <div className="flex flex-col items-center text-center gap-4 mb-8 px-2">
                <div className="flex items-center gap-5 justify-center">
                    {settings.logo1 ? (
                        <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-[#001529] rounded-2xl p-1 shadow-2xl shadow-yellow-500/20 border-2 border-yellow-400 dark:border-yellow-400/50">
                            <img src={settings.logo1} alt="Logo 1" className="w-full h-full object-contain rounded-xl" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/40 border-4 border-white dark:border-[#000816]">
                            <GraduationCap className="text-brand-primary w-10 h-10" />
                        </div>
                    )}

                    {settings.logo2 && (
                        <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-[#001529] rounded-2xl p-1 shadow-2xl shadow-yellow-500/20 border-2 border-yellow-400 dark:border-yellow-400/50">
                            <img src={settings.logo2} alt="Logo 2" className="w-full h-full object-contain rounded-xl" />
                        </div>
                    )}
                </div>

                <div className="mt-2 space-y-1">
                    <h1 className="font-extrabold text-lg tracking-tight leading-none uppercase text-white dark:text-yellow-400">
                        <span className="text-yellow-400 dark:text-white">PIONEER'S SUPERIOR</span><br />
                        <span className="text-sm">Science School & College</span>
                    </h1>
                    <p className="text-[10px] font-black text-white/60 dark:text-yellow-400/60 leading-tight tracking-widest uppercase mt-1">{settings.subTitle}</p>
                    <p className="text-[9px] font-bold text-yellow-400 dark:text-sky-400 italic">{settings.location}</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2 relative">
                {filteredMenuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); onClose && onClose(); }}
                        className={cn(
                            "w-full flex items-center justify-between p-3.5 md:p-2.5 rounded-xl transition-colors duration-300 group relative z-10",
                            activeTab === item.id
                                ? "text-brand-primary"
                                : "text-white/80 dark:text-yellow-400/80 hover:bg-white/5 dark:hover:bg-yellow-400/10"
                        )}
                    >
                        {/* Sliding Background */}
                        {activeTab === item.id && (
                            <motion.div
                                layoutId="activeBackground"
                                className="absolute inset-0 bg-yellow-400 dark:bg-yellow-400 rounded-xl shadow-lg shadow-yellow-500/30 ring-1 ring-yellow-500/50 -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}

                        {/* Sliding Side Indicator */}
                        {activeTab === item.id && (
                            <motion.div
                                layoutId="sideIndicator"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#003366] dark:bg-[#000816] rounded-r-full shadow-[0_0_15px_rgba(0,51,102,0.4)]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}

                        <div className="flex items-center gap-3">
                            <item.icon className={cn("w-6 h-6 md:w-5 md:h-5 transition-transform group-hover:scale-110", activeTab === item.id ? "text-[#003366]" : "text-yellow-400")} />
                            <span className="font-bold uppercase text-[13px] md:text-[12px] tracking-wider">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {activeTab === item.id && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                </motion.div>
                            )}
                        </div>
                    </button>
                ))}
            </nav>

            <div className="mt-auto space-y-5 pt-8 border-t border-white/10 dark:border-yellow-400/20">
                <div className="bg-white/5 dark:bg-yellow-400/5 p-4 md:p-5 rounded-2xl flex items-center gap-4 border border-white/5 dark:border-yellow-400/10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#003366] to-blue-600 dark:from-yellow-400 dark:to-yellow-600 border-2 border-white dark:border-yellow-400/30 overflow-hidden flex items-center justify-center text-white dark:text-[#000816] font-black uppercase text-lg shadow-xl">
                        {user.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-base font-bold truncate text-white dark:text-yellow-400">{user.name}</p>
                        <p className="text-[11px] text-white/50 dark:text-yellow-400/60 font-black uppercase tracking-widest">{user.role}</p>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold text-[13px] uppercase tracking-widest group"
                >
                    <LogOut className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};
