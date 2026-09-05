import {
    LayoutDashboard,
    GraduationCap,
    CreditCard,
    CalendarCheck,
    Menu,
    FileText,
    Award
} from 'lucide-react';
import { cn } from '../utils/cn';

interface MobileBottomNavProps {
    user: { role: string };
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onOpenMore: () => void;
    isDrawerOpen: boolean;
}

export const MobileBottomNav = ({
    user,
    activeTab,
    setActiveTab,
    onOpenMore,
    isDrawerOpen
}: MobileBottomNavProps) => {
    const role = user.role.toLowerCase();

    const getNavItems = () => {
        if (role === 'student') {
            return [
                { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
                { id: 'academic', label: 'Results', icon: Award },
                { id: 'attendance_log', label: 'Presence', icon: CalendarCheck },
                { id: 'fees_ledger', label: 'Fees', icon: CreditCard },
            ];
        }

        if (role === 'teacher') {
            return [
                { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
                { id: 'students', label: 'Students', icon: GraduationCap },
                { id: 'exams', label: 'Exams', icon: FileText },
                { id: 'fees', label: 'Fees', icon: CreditCard },
            ];
        }

        // Admin default
        return [
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'students', label: 'Students', icon: GraduationCap },
            { id: 'fees', label: 'Fees', icon: CreditCard },
            { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
        ];
    };

    const items = getNavItems();

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[120] bg-white/95 dark:bg-[#000d1a]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-around max-w-md mx-auto">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id && !isDrawerOpen;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative",
                                isActive
                                    ? "text-brand-primary dark:text-yellow-400 font-bold"
                                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 active:scale-95"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-all",
                                isActive && "bg-brand-primary/10 dark:bg-yellow-400/15 scale-110"
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] tracking-tight mt-0.5">
                                {item.label}
                            </span>
                            {isActive && (
                                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-brand-primary dark:bg-yellow-400 animate-pulse" />
                            )}
                        </button>
                    );
                })}

                {/* More / All Modules Button */}
                <button
                    onClick={onOpenMore}
                    className={cn(
                        "flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative",
                        isDrawerOpen
                            ? "text-brand-primary dark:text-yellow-400 font-bold"
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 active:scale-95"
                    )}
                >
                    <div className={cn(
                        "p-1.5 rounded-xl transition-all",
                        isDrawerOpen && "bg-brand-primary/10 dark:bg-yellow-400/15 scale-110"
                    )}>
                        <Menu className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] tracking-tight mt-0.5">
                        More
                    </span>
                    {isDrawerOpen && (
                        <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-brand-primary dark:bg-yellow-400 animate-pulse" />
                    )}
                </button>
            </div>
        </div>
    );
};
