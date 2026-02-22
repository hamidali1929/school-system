import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
    LayoutDashboard,
    UserSquare2,
    GraduationCap,
    CreditCard,
    FileText,
    Library,
    Settings,
    CalendarCheck,
    DollarSign,
    TrendingUp,
    LogOut
} from 'lucide-react';
import { cn } from '../utils/cn';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: ['admin', 'student'], color: '#fbbf24' },
    { id: 'admin', label: 'Control', icon: Settings, role: ['admin'], color: '#f87171' },
    { id: 'teachers', label: 'Faculty', icon: UserSquare2, role: ['admin'], color: '#60a5fa' },
    { id: 'students', label: 'Students', icon: GraduationCap, role: ['admin', 'student'], color: '#34d399' },
    { id: 'classes', label: 'Academic', icon: Library, role: ['admin'], color: '#a78bfa' },
    { id: 'fees', label: 'Revenue', icon: CreditCard, role: ['admin', 'student'], color: '#fb923c' },
    { id: 'exams', label: 'Results', icon: FileText, role: ['admin', 'student', 'teacher'], color: '#f472b6' },
    { id: 'analytics', label: 'Analysis', icon: TrendingUp, role: ['admin'], color: '#10b981' },
    { id: 'attendance', label: 'Presence', icon: CalendarCheck, role: ['admin', 'teacher'], color: '#2dd4bf' },
    { id: 'documents', label: 'Letters', icon: FileText, role: ['admin'], color: '#8b5cf6' },
    { id: 'finance', label: 'Fin_Matrix', icon: DollarSign, role: ['admin'], color: '#fb7185' },
];

export const MobileArcMenu = ({
    user,
    activeTab,
    setActiveTab,
    onLogout,
    isOpen,
    setIsOpen
}: {
    user: { name: string; role: string };
    activeTab: string;
    setActiveTab: (id: string) => void;
    onLogout: () => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}) => {
    const filteredItems = menuItems.filter(item => item.role.includes(user.role.toLowerCase()));

    // Rotation engine with butter-smooth physics
    const rotation = useMotionValue(0);
    const smoothRotation = useSpring(rotation, {
        stiffness: 120, // Lower stiffness for "fluid" feel
        damping: 25,   // Optimized damping for smooth stop
        mass: 1,
        restDelta: 0.001
    });

    // Opposite rotation for stabilizing icons
    const oppositeRotation = useTransform(smoothRotation, r => -r);

    // Center ref for angle calculation
    const centerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) setIsOpen(false);
    }, [activeTab]);

    const handleDrag = (_: any, info: any) => {
        const sensitivity = 0.8;
        const delta = (info.delta.x - info.delta.y) * sensitivity;
        rotation.set(rotation.get() + delta);
    };

    return (
        <div className="lg:hidden">
            {/* Kinetic Command Center Overlay - Luminous Aesthetic */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center overflow-hidden"
                    >
                        {/* Full Screen Close Trigger (Backdrop) */}
                        <div className="absolute inset-0 z-0" onClick={() => setIsOpen(false)}></div>

                        {/* The Magnetic Core Container - Shifted up */}
                        <motion.div
                            ref={centerRef}
                            drag
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragElastic={0}
                            onDrag={handleDrag}
                            className="relative w-[380px] h-[380px] flex items-center justify-center cursor-grab active:cursor-grabbing z-10 -mt-20"
                            style={{ rotate: smoothRotation }}
                        >
                            {/* Visual Orbits - Light Theme Adjusted */}
                            <div className="absolute inset-0 rounded-full border border-black/5 border-dashed scale-105"></div>
                            <div className="absolute inset-20 rounded-full border border-black/5"></div>

                            {/* Navigation Nodes */}
                            {filteredItems.map((item, index) => {
                                const total = filteredItems.length;
                                const angle = (index / total) * (Math.PI * 2) - Math.PI / 2;
                                const radius = 165;
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;

                                return (
                                    <div
                                        key={item.id}
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: '50%',
                                            transform: `translate(${x - 32}px, ${y - 32}px)`
                                        }}
                                    >
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveTab(item.id);
                                            }}
                                            className={cn(
                                                "w-16 h-16 rounded-[1.3rem] flex flex-col items-center justify-center border-2 transition-all group pointer-events-auto",
                                                activeTab === item.id
                                                    ? "bg-white border-blue-600 shadow-[0_15px_40px_rgba(0,0,0,0.1)]"
                                                    : "bg-white/80 backdrop-blur-md border-black/5 shadow-lg"
                                            )}
                                            style={{
                                                rotate: oppositeRotation
                                            }}
                                        >
                                            <item.icon className="w-7 h-7" style={{ color: activeTab === item.id ? '#1e3a8a' : item.color }} />

                                            {/* Glow Aura */}
                                            <div className="absolute inset-0 rounded-[1.1rem] blur-lg transition-opacity opacity-0 group-hover:opacity-10" style={{ backgroundColor: item.color }}></div>

                                            {/* Precise Labeling */}
                                            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2">
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-widest whitespace-nowrap px-2.5 py-1 rounded-full border transition-all",
                                                    activeTab === item.id
                                                        ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                                                        : "bg-white/90 text-slate-400 border-black/5 shadow-sm"
                                                )}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        </motion.button>
                                    </div>
                                );
                            })}

                            {/* Center Identity Core */}
                            <motion.div
                                className="absolute w-36 h-36 rounded-full bg-white flex items-center justify-center overflow-hidden z-20 pointer-events-none shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-black/5"
                                style={{ rotate: oppositeRotation }}
                            >
                                <div className="relative w-full h-full p-3 flex items-center justify-center">
                                    <motion.img
                                        src="/logo1.png"
                                        className="w-full h-full object-contain"
                                        animate={{ scale: [1, 1.02, 1] }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                    />
                                    {/* Inner Branding Ring */}
                                    <div className="absolute inset-0 border-[6px] border-black/5 rounded-full"></div>
                                </div>
                                {/* Advanced Kinetic Pulse Ring */}
                                <div className="absolute inset-0 border-[3px] border-transparent border-t-blue-600/40 border-r-blue-600/10 rounded-full animate-[spin_4s_linear_infinite]"></div>
                            </motion.div>
                        </motion.div>

                        {/* Logout Command - Luminous Style */}
                        <motion.button
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            onClick={onLogout}
                            className="absolute bottom-16 flex items-center gap-1.5 px-4 py-1.5 bg-rose-50 border border-rose-200 rounded-full text-rose-600 active:scale-95 shadow-sm transition-all hover:bg-rose-100 z-[300]"
                        >
                            <LogOut className="w-3 h-3" />
                            <span className="text-[7px] font-black uppercase tracking-[0.2em]">Terminate Matrix</span>
                        </motion.button>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
