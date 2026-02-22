import { Bell, User, Menu, Check, Info, AlertTriangle, ShieldCheck, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { cn } from '../utils/cn';

interface TopbarProps {
    onOpenSidebar?: () => void;
}

export const Topbar = ({ onOpenSidebar }: TopbarProps) => {
    const { currentUser } = useStore();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const notifications = [
        { id: 1, title: 'Fee Payment Received', desc: 'Zainab Ahmed paid $600.', type: 'success', time: '2m ago' },
        { id: 2, title: 'System Backup', desc: 'Institutional backup completed successfully.', type: 'info', time: '1h ago' },
        { id: 3, title: 'Exam Alert', desc: 'Mathematics Q1 results are pending upload.', type: 'warning', time: '3h ago' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="h-20 glass-nav px-4 md:px-8 flex items-center justify-between sticky top-0 z-[100] transition-all duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={onOpenSidebar}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden transition-colors"
                >
                    <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                </button>

                <div className="hidden lg:flex flex-col">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                        Institutional Portal
                    </h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                        Cleared for Alpha-4 Access
                    </p>
                </div>
            </div>


            <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl group cursor-help relative" title="Hacker Protection Active: SQL & XSS Guard Enabled">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 hidden md:block">Secure</span>

                    {/* Tooltip on hover */}
                    <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-900 text-white rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[200] border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Protection Layer v2.0</p>
                        <p className="text-[9px] text-slate-400 font-bold leading-relaxed italic">
                            System is protected against SQL Payloads, XSS Scripting, and Data Tampering.
                        </p>
                    </div>
                </div>

                {currentUser?.role === 'admin' && (
                    <button
                        onClick={async () => {
                            const { isConfirmed } = await Swal.fire({
                                title: 'WhatsApp Logout',
                                text: 'Do you want to terminate the active WhatsApp session?',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Yes, Disconnect',
                                confirmButtonColor: '#f43f5e',
                                cancelButtonColor: '#64748b',
                                background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
                                color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                            });

                            if (isConfirmed) {
                                try {
                                    const res = await fetch('/api/wa/logout', { method: 'POST' });
                                    if (res.ok) {
                                        Swal.fire({
                                            title: 'Disconnected',
                                            text: 'WhatsApp session has been terminated.',
                                            icon: 'success',
                                            toast: true,
                                            position: 'top-end',
                                            timer: 3000,
                                            showConfirmButton: false
                                        });
                                    }
                                } catch (error) {
                                    Swal.fire('Error', 'Failed to logout WhatsApp.', 'error');
                                }
                            }
                        }}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all text-rose-600 dark:text-rose-400 group"
                        title="Logout WhatsApp Session"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] hidden md:block">WA Logout</span>
                    </button>
                )}

                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={cn(
                            "p-2.5 rounded-xl transition-all active:scale-95 border",
                            showNotifications
                                ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                                : "bg-slate-100 dark:bg-[#001529] text-slate-600 dark:text-brand-accent border-slate-200 dark:border-brand-accent/20"
                        )}
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#000c1d] animate-pulse"></span>
                    </button>

                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-80 glass-card border border-slate-200 dark:border-yellow-400/30 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-yellow-400/10">
                                <h4 className="font-bold text-sm tracking-tight text-brand-primary dark:text-brand-accent">System Notifications</h4>
                                <span className="text-[10px] font-black text-brand-primary dark:text-brand-secondary uppercase tracking-widest">3 New</span>
                            </div>
                            <div className="space-y-4">
                                {notifications.map(notif => (
                                    <div key={notif.id} className="flex gap-3 relative group cursor-pointer hover:translate-x-1 transition-transform">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                            notif.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                notif.type === 'warning' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-sky-400'
                                        )}>
                                            {notif.type === 'success' ? <Check className="w-4 h-4" /> :
                                                notif.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold leading-none mb-1 text-slate-900 dark:text-yellow-400/90">{notif.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-yellow-400/60 truncate">{notif.desc}</p>
                                            <p className="text-[9px] text-slate-400 dark:text-yellow-400/40 font-bold uppercase tracking-widest mt-1">{notif.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-2 bg-slate-50 dark:bg-[#000816] hover:bg-brand-primary/10 dark:hover:bg-brand-accent/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors text-slate-500 dark:text-brand-accent/40 hover:text-brand-primary dark:hover:text-brand-accent">
                                Mark all as read
                            </button>
                        </div>
                    )}
                </div>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-yellow-400/10 mx-2 hidden sm:block"></div>

                <button className="flex items-center gap-3 pl-2 pr-1 hover:opacity-80 transition-opacity group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold leading-none tracking-tight text-slate-900 dark:text-yellow-400">Hamid R.</p>
                        <p className="text-[10px] text-slate-500 dark:text-yellow-400/60 font-black uppercase tracking-widest mt-1">Super Admin</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary dark:from-brand-accent dark:to-brand-secondary flex items-center justify-center border-2 border-white dark:border-brand-accent shadow-md transition-transform group-hover:rotate-3 shadow-brand-primary/20 dark:shadow-brand-accent/20">
                        <User className="w-6 h-6 text-white dark:text-[#000816]" />
                    </div>
                </button>
            </div>
        </div >
    );
};
