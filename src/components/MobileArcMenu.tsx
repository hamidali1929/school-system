import { useState, useEffect, useRef } from 'react';
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
    LogOut,
    RotateCw
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useStore } from '../context/StoreContext';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: ['admin', 'student'], color: '#fbbf24' },
    { id: 'admin', label: 'Admin Panel', icon: Settings, role: ['admin'], color: '#f87171' },
    { id: 'teachers', label: 'Teacher Panel', icon: UserSquare2, role: ['admin'], color: '#60a5fa' },
    { id: 'students', label: 'All Students', icon: GraduationCap, role: ['admin', 'student'], color: '#34d399' },
    { id: 'classes', label: 'Classes & Fees', icon: Library, role: ['admin'], color: '#a78bfa' },
    { id: 'fees', label: 'Fees Collection', icon: CreditCard, role: ['admin', 'student'], color: '#fb923c' },
    { id: 'exams', label: 'Exams & Results', icon: FileText, role: ['admin', 'student', 'teacher'], color: '#f472b6' },
    { id: 'analytics', label: 'Student Reports', icon: TrendingUp, role: ['admin'], color: '#10b981' },
    { id: 'attendance', label: 'Student Attendance', icon: CalendarCheck, role: ['admin', 'teacher'], color: '#2dd4bf' },
    { id: 'documents', label: 'Documents & Letters', icon: FileText, role: ['admin'], color: '#8b5cf6' },
    { id: 'finance', label: 'Accounts & Finance', icon: DollarSign, role: ['admin'], color: '#fb7185' },
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
    const { settings } = useStore();
    const filteredItems = menuItems.filter(item => item.role.includes(user.role.toLowerCase()));

    // Screen size tracking for dynamic responsive auto-scaling
    const [screenSize, setScreenSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 380,
        height: typeof window !== 'undefined' ? window.innerHeight : 700
    });

    useEffect(() => {
        const updateSize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Calculate dynamic responsive radius and node sizes based on screen dimensions
    // We constrain the total diameter to comfortably fit inside (width - 24px) and (height - 180px)
    const availableDim = Math.min(screenSize.width - 24, Math.min(screenSize.height - 180, 440));
    const radius = Math.max(110, Math.min(155, Math.floor(availableDim * 0.38)));
    const buttonSize = radius < 125 ? 46 : radius < 140 ? 52 : 58;
    const iconSize = radius < 125 ? 20 : radius < 140 ? 22 : 25;
    const centerSize = radius < 125 ? 90 : radius < 140 ? 104 : 120;

    // Rotation engine with butter-smooth physics
    const rotation = useMotionValue(0);
    const smoothRotation = useSpring(rotation, {
        stiffness: 120,
        damping: 25,
        mass: 1,
        restDelta: 0.001
    });

    // Opposite rotation for stabilizing icons and text
    const oppositeRotation = useTransform(smoothRotation, r => -r);

    // Center ref for drag calculation
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
            {/* Kinetic Command Center Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center overflow-hidden select-none"
                    >
                        {/* Full Screen Close Trigger (Backdrop) */}
                        <div className="absolute inset-0 z-0" onClick={() => setIsOpen(false)}></div>

                        {/* Top Helper Hint */}
                        <div className="absolute top-6 flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 border border-slate-200/60 rounded-full text-slate-500 text-[9px] font-bold uppercase tracking-wider z-20 pointer-events-none">
                            <RotateCw className="w-3 h-3 text-brand-primary animate-spin" style={{ animationDuration: '8s' }} />
                            <span>Rotate dial to browse modules</span>
                        </div>

                        {/* The Magnetic Core Container */}
                        <motion.div
                            ref={centerRef}
                            drag
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragElastic={0}
                            onDrag={handleDrag}
                            className="relative flex items-center justify-center cursor-grab active:cursor-grabbing z-10 -mt-8 sm:-mt-14 touch-none"
                            style={{
                                width: `${(radius + buttonSize) * 2}px`,
                                height: `${(radius + buttonSize) * 2}px`,
                                rotate: smoothRotation
                            }}
                        >
                            {/* Visual Orbits */}
                            <div
                                className="absolute rounded-full border border-black/5 border-dashed pointer-events-none"
                                style={{
                                    width: `${radius * 2}px`,
                                    height: `${radius * 2}px`
                                }}
                            ></div>
                            <div
                                className="absolute rounded-full border border-black/5 pointer-events-none"
                                style={{
                                    width: `${radius * 1.45}px`,
                                    height: `${radius * 1.45}px`
                                }}
                            ></div>

                            {/* Navigation Nodes */}
                            {filteredItems.map((item, index) => {
                                const total = filteredItems.length;
                                const angle = (index / total) * (Math.PI * 2) - Math.PI / 2;
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;

                                return (
                                    <div
                                        key={item.id}
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: '50%',
                                            transform: `translate(${x - buttonSize / 2}px, ${y - buttonSize / 2}px)`,
                                            width: `${buttonSize}px`,
                                            height: `${buttonSize}px`
                                        }}
                                    >
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveTab(item.id);
                                            }}
                                            className={cn(
                                                "rounded-[1.1rem] flex flex-col items-center justify-center border-2 transition-all group pointer-events-auto shadow-md relative",
                                                activeTab === item.id
                                                    ? "bg-white border-blue-600 shadow-[0_10px_30px_rgba(0,0,0,0.15)] ring-2 ring-blue-500/20"
                                                    : "bg-white/95 backdrop-blur-md border-black/5 hover:border-black/15 shadow-sm"
                                            )}
                                            style={{
                                                width: `${buttonSize}px`,
                                                height: `${buttonSize}px`,
                                                rotate: oppositeRotation
                                            }}
                                        >
                                            <item.icon style={{ width: `${iconSize}px`, height: `${iconSize}px`, color: activeTab === item.id ? '#1e3a8a' : item.color }} />

                                            {/* Glow Aura */}
                                            <div className="absolute inset-0 rounded-[1rem] blur-md transition-opacity opacity-0 group-hover:opacity-15 pointer-events-none" style={{ backgroundColor: item.color }}></div>

                                            {/* Precise Labeling */}
                                            <div
                                                className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                                                style={{ top: `${buttonSize + 3}px` }}
                                            >
                                                <span className={cn(
                                                    "text-[7px] sm:text-[7.5px] font-black uppercase tracking-wider whitespace-nowrap px-1.5 sm:px-2 py-0.5 rounded-full border transition-all shadow-xs block leading-tight",
                                                    activeTab === item.id
                                                        ? "bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-md scale-105"
                                                        : "bg-white/95 text-slate-500 border-black/5"
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
                                className="absolute rounded-full bg-white flex items-center justify-center overflow-hidden z-20 pointer-events-none shadow-[0_10px_35px_rgba(0,0,0,0.08)] border border-black/5"
                                style={{
                                    width: `${centerSize}px`,
                                    height: `${centerSize}px`,
                                    rotate: oppositeRotation
                                }}
                            >
                                <div className="relative w-full h-full p-2 flex items-center justify-center">
                                    <motion.img
                                        src={settings.logo1 || "/logo1.png"}
                                        className="w-full h-full object-contain"
                                        animate={{ scale: [1, 1.03, 1] }}
                                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                        alt="School Logo"
                                    />
                                    {/* Inner Branding Ring */}
                                    <div className="absolute inset-0 border-[4px] border-black/5 rounded-full"></div>
                                </div>
                                {/* Kinetic Pulse Ring */}
                                <div className="absolute inset-0 border-[2.5px] border-transparent border-t-blue-600/40 border-r-blue-600/10 rounded-full animate-[spin_4s_linear_infinite]"></div>
                            </motion.div>
                        </motion.div>

                        {/* Logout Command */}
                        <motion.button
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 30, opacity: 0 }}
                            onClick={onLogout}
                            className="absolute bottom-8 sm:bottom-12 flex items-center gap-1.5 px-5 py-2 bg-rose-50 border border-rose-200/80 rounded-full text-rose-600 active:scale-95 shadow-sm transition-all hover:bg-rose-100 z-[300]"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Log Out</span>
                        </motion.button>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
