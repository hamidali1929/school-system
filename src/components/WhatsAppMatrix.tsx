import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../context/StoreContext';
import {
    RefreshCcw, CheckCheck,
    ShieldCheck, Send, Zap,
    History, Users, Settings, Smartphone, MessageSquare, Search,
    Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeWhatsAppNumber, MESSAGE_TEMPLATES } from '../utils/whatsapp';

export const WhatsAppMatrix = () => {
    const { students, teachers, settings } = useStore();
    const [status, setStatus] = useState<'IDLE' | 'QR' | 'CONNECTED' | 'DISCONNECTED'>('IDLE');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [, setSocket] = useState<Socket | null>(null);
    const [logs, setLogs] = useState<{ time: string, msg: string, type: 'info' | 'success' | 'warning' }[]>([]);
    const [activeTab, setActiveTab] = useState<'connect' | 'groups' | 'broadcast' | 'logs'>('connect');
    const [groups, setGroups] = useState<any[]>([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [groupSearch, setGroupSearch] = useState('');
    const [broadcastType, setBroadcastType] = useState<'groups' | 'students' | 'teachers'>('groups');
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [contactSearch, setContactSearch] = useState('');

    useEffect(() => {
        const newSocket = io(window.location.origin, {
            path: '/socket.io'
        });

        newSocket.on('connect', () => {
            addLog('System connected to WhatsApp server', 'info');
        });

        newSocket.on('qr', (qr: string) => {
            setQrCode(qr);
            setStatus('QR');
            addLog('New connection QR code generated', 'warning');
        });

        newSocket.on('status', (newStatus: string) => {
            setStatus(newStatus as any);
            if (newStatus === 'CONNECTED') {
                setQrCode(null);
                addLog('WhatsApp connected successfully', 'success');
            }
        });

        newSocket.on('system_log', (msg: string) => {
            addLog(msg, 'info');
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const addLog = (msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
        setLogs(prev => [{
            time: new Date().toLocaleTimeString(),
            msg,
            type
        }, ...prev].slice(0, 50));
    };

    const fetchGroups = async () => {
        if (status !== 'CONNECTED') return;
        setIsLoadingGroups(true);
        try {
            const response = await fetch('/api/wa/groups');
            const data = await response.json();
            if (data.success) {
                setGroups(data.groups);
                addLog(`Found ${data.groups.length} active groups`, 'info');
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            console.error('Failed to fetch groups', err);
            addLog(`Could not load groups: ${err.message}`, 'warning');
        } finally {
            setIsLoadingGroups(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'groups' && status === 'CONNECTED') {
            fetchGroups();
        }
    }, [activeTab, status]);

    const handleSendMessage = async (targetId?: string, targetName?: string) => {
        if (status !== 'CONNECTED') {
            Swal.fire({
                title: 'Not Connected',
                text: 'Please connect WhatsApp first to send messages.',
                icon: 'error',
                confirmButtonColor: '#003366'
            });
            return;
        }

        const { value: formValues } = await Swal.fire({
            title: targetName ? `Send Message to ${targetName}` : 'Send New Message',
            html: `
                <div class="text-left space-y-4 font-outfit p-1">
                    ${!targetId ? `
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Phone Number</label>
                        <input id="swal-wa-number" class="swal2-input !mt-0 !w-full !rounded-xl !text-sm border-slate-200 focus:border-[#25D366]" placeholder="e.g. 923001234567">
                    </div>` : ''}
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Message</label>
                        <textarea id="swal-wa-message" class="swal2-input !mt-0 !w-full !rounded-xl !text-sm !h-32 border-slate-200 focus:border-[#25D366]" placeholder="Type your message here..."></textarea>
                    </div>
                </div>`,
            showCancelButton: true,
            confirmButtonText: 'Send Now',
            confirmButtonColor: '#25D366',
            cancelButtonColor: '#ef4444',
            padding: '2rem',
            customClass: {
                popup: 'rounded-[2.5rem]',
                confirmButton: 'rounded-xl px-8 py-3 font-bold uppercase tracking-widest text-[10px]',
                cancelButton: 'rounded-xl px-8 py-3 font-bold uppercase tracking-widest text-[10px]'
            },
            preConfirm: () => {
                const to = targetId || (document.getElementById('swal-wa-number') as HTMLInputElement).value;
                const message = (document.getElementById('swal-wa-message') as HTMLTextAreaElement).value;

                if (!to || !message) {
                    Swal.showValidationMessage('Please fill in all fields');
                    return false;
                }
                return { to, message };
            }
        });

        if (formValues) {
            try {
                const response = await fetch('/api/wa/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formValues)
                });
                const data = await response.json();
                if (data.success) {
                    Swal.fire({
                        title: 'Sent!',
                        text: 'Your message has been sent successfully.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    addLog(`Message sent to ${formValues.to}`, 'success');
                } else {
                    throw new Error(data.error);
                }
            } catch (err: any) {
                Swal.fire('Error', err.message, 'error');
            }
        }
    };

    const applyTemplate = (templateName: keyof typeof MESSAGE_TEMPLATES) => {
        let msg = '';
        const { schoolName } = settings;

        switch (templateName) {
            case 'ADMISSION_WELCOME':
                msg = MESSAGE_TEMPLATES.ADMISSION_WELCOME('[Student Name]', '[ID]', schoolName);
                break;
            case 'FEE_REMINDER':
                msg = MESSAGE_TEMPLATES.FEE_REMINDER('[Student Name]', 0, schoolName);
                break;
            case 'ATTENDANCE_ABSENT':
                msg = MESSAGE_TEMPLATES.ATTENDANCE_ABSENT('[Student Name]', new Date().toLocaleDateString(), schoolName);
                break;
            case 'ATTENDANCE_LATE':
                msg = MESSAGE_TEMPLATES.ATTENDANCE_LATE('[Student Name]', new Date().toLocaleDateString(), schoolName);
                break;
        }
        setBroadcastMessage(msg);
    };

    const handleBroadCast = async () => {
        if (status !== 'CONNECTED') {
            Swal.fire('Error', 'Connect WhatsApp first', 'error');
            return;
        }

        if (selectedTargets.length === 0) {
            Swal.fire('Error', 'Select at least one recipient', 'error');
            return;
        }

        if (!broadcastMessage.trim()) {
            Swal.fire('Error', 'Please enter a message', 'error');
            return;
        }

        const { isConfirmed } = await Swal.fire({
            title: 'Start Broadcast?',
            text: `This will send the message to ${selectedTargets.length} recipients with a 6-second delay between each.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Start Sending',
            confirmButtonColor: '#003366',
            cancelButtonColor: '#ef4444'
        });

        if (!isConfirmed) return;

        setIsBroadcasting(true);
        addLog(`Starting broadcast to ${selectedTargets.length} recipients`, 'info');

        let successCount = 0;
        let failCount = 0;

        for (const targetId of selectedTargets) {
            try {
                let personalizedMessage = broadcastMessage;
                let targetNumber = '';
                let targetLabel = targetId;

                if (broadcastType === 'students') {
                    const student = students.find(s => s.id === targetId);
                    if (student) {
                        targetNumber = normalizeWhatsAppNumber(student.whatsappNumber || '');
                        targetLabel = student.name;
                        personalizedMessage = personalizedMessage
                            .replace(/\[Student Name\]/g, student.name)
                            .replace(/\[ID\]/g, student.id);
                    }
                } else if (broadcastType === 'teachers') {
                    const teacher = teachers.find(t => t.id === targetId);
                    if (teacher) {
                        targetNumber = normalizeWhatsAppNumber(teacher.whatsappNumber || '');
                        targetLabel = teacher.name;
                        personalizedMessage = personalizedMessage
                            .replace(/\[Student Name\]/g, teacher.name);
                    }
                } else if (broadcastType === 'groups') {
                    targetNumber = targetId; // For groups, targetId IS the JID
                    const group = groups.find(g => g.id === targetId);
                    if (group) {
                        targetLabel = group.subject;
                        personalizedMessage = personalizedMessage.replace(/\[Student Name\]/g, 'Students');
                    }
                }

                if (!targetNumber) continue;

                const response = await fetch('/api/wa/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: targetNumber,
                        message: personalizedMessage
                    })
                });
                const data = await response.json();
                if (data.success) {
                    successCount++;
                    addLog(`Broadcast queued for ${targetLabel}`, 'success');
                } else {
                    failCount++;
                    addLog(`Broadcast failed for ${targetLabel}`, 'warning');
                }

                // Add small delay between messages
                await new Promise(r => setTimeout(r, 6000));
            } catch (err) {
                failCount++;
                console.error('Broadcast relay failed', err);
            }
        }

        setIsBroadcasting(false);
        setBroadcastMessage('');
        setSelectedTargets([]);
        Swal.fire({
            title: 'Broadcast Initialized',
            text: `Successfully queued ${successCount} messages. ${failCount} failed.`,
            icon: successCount > 0 ? 'success' : 'error'
        });
    };

    const toggleTargetSelection = (id: string) => {
        setSelectedTargets(prev =>
            prev.includes(id)
                ? prev.filter(targetId => targetId !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        let targets: string[] = [];
        if (broadcastType === 'groups') targets = groups.map(g => g.id);
        else if (broadcastType === 'students') targets = students.filter(s => s.whatsappNumber).map(s => s.id);
        else if (broadcastType === 'teachers') targets = teachers.filter(t => t.whatsappNumber).map(t => t.id);

        setSelectedTargets(targets);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className={cn(
                            "p-4 rounded-[2rem] shadow-2xl relative group overflow-hidden",
                            status === 'CONNECTED' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-slate-100 text-slate-400"
                        )}
                    >
                        <Smartphone size={28} className="relative z-10" />
                    </motion.div>
                    <div>
                        <h3 className="text-2xl font-black text-[#003366] uppercase tracking-tighter">WhatsApp Center</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Messaging Gateway</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <motion.div
                        layout
                        className={cn(
                            "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 shadow-sm flex items-center gap-2",
                            status === 'CONNECTED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                status === 'QR' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    "bg-slate-50 text-slate-400 border-slate-100"
                        )}
                    >
                        {status === 'CONNECTED' ? <CheckCircle2 size={12} /> :
                            status === 'QR' ? <RefreshCcw size={12} className="animate-spin" /> :
                                <Loader2 size={12} className="animate-spin" />}
                        {status}
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
                        {/* Custom Tab Bar */}
                        <div className="flex p-2 bg-slate-50/50 border-b border-slate-100 sticky top-0 z-20 backdrop-blur-md">
                            {[
                                { id: 'connect', icon: Zap, label: 'Connection' },
                                { id: 'groups', icon: MessageSquare, label: 'Groups' },
                                { id: 'broadcast', icon: Send, label: 'Bulk Send' },
                                { id: 'logs', icon: History, label: 'Activity Logs' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "relative flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-[1.5rem]",
                                        activeTab === tab.id ? "text-[#003366]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                                    )}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white shadow-xl shadow-blue-500/10 rounded-[1.5rem]"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <tab.icon size={14} className="relative z-10" />
                                    <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="p-8 flex-1">
                            <AnimatePresence mode="wait">
                                {activeTab === 'connect' && (
                                    <motion.div
                                        key="connect"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full flex flex-col items-center justify-center py-10"
                                    >
                                        {status === 'CONNECTED' ? (
                                            <div className="text-center space-y-8 w-full max-w-md">
                                                <div className="relative">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: 'spring', delay: 0.2 }}
                                                        className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-[8px] border-emerald-100"
                                                    >
                                                        <ShieldCheck size={56} className="text-emerald-500" />
                                                    </motion.div>
                                                    <div className="absolute inset-x-0 -bottom-4 flex justify-center">
                                                        <div className="bg-emerald-500 text-white text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">Online</div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Connected</h4>
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">WhatsApp is ready for messaging</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    {[
                                                        { label: 'Status', value: 'Active', icon: Zap },
                                                        { label: 'Security', value: 'Safe', icon: ShieldCheck }
                                                    ].map((stat, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col items-center"
                                                        >
                                                            <stat.icon size={16} className="text-slate-300 mb-2" />
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                                            <p className="text-sm font-black text-[#003366]">{stat.value}</p>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                <div className="flex flex-col gap-4">
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleSendMessage()}
                                                        className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/30 transition-all font-outfit"
                                                    >
                                                        Open Message Box
                                                    </motion.button>
                                                    <button
                                                        onClick={async () => {
                                                            const { isConfirmed } = await Swal.fire({
                                                                title: 'Disconnect WhatsApp?',
                                                                text: 'Are you sure you want to log out?',
                                                                icon: 'warning',
                                                                showCancelButton: true,
                                                                confirmButtonText: 'Yes, Log out',
                                                                confirmButtonColor: '#ff4757',
                                                                cancelButtonColor: '#f1f2f6'
                                                            });
                                                            if (isConfirmed) {
                                                                setQrCode(null);
                                                                setStatus('IDLE');
                                                                fetch('/api/wa/logout', { method: 'POST' });
                                                                addLog('WhatsApp logged out', 'warning');
                                                            }
                                                        }}
                                                        className="w-full py-4 text-rose-500 border-2 border-rose-50 hover:bg-rose-50 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                                    >
                                                        Disconnect Account
                                                    </button>
                                                </div>
                                            </div>
                                        ) : status === 'QR' && qrCode ? (
                                            <div className="text-center space-y-10 animate-in fade-in zoom-in duration-700">
                                                <div className="relative inline-block">
                                                    <div className="p-10 bg-white rounded-[3.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.08)] border-[12px] border-slate-50 relative">
                                                        <QRCodeSVG value={qrCode} size={260} level="H" includeMargin={true} />
                                                    </div>
                                                </div>

                                                <div className="space-y-8">
                                                    <div className="space-y-2">
                                                        <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Login with QR</h4>
                                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Scan to link your school WhatsApp</p>
                                                    </div>

                                                    <div className="max-w-md mx-auto space-y-3">
                                                        {[
                                                            "Open WhatsApp on your phone",
                                                            "Go to Linked Devices in settings",
                                                            "Point your phone at this screen"
                                                        ].map((step, idx) => (
                                                            <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                                <span className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-xs font-black text-[#003366] shrink-0">{idx + 1}</span>
                                                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide text-left">{step}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button
                                                        onClick={async () => {
                                                            fetch('/api/wa/logout', { method: 'POST' });
                                                            setStatus('IDLE');
                                                            setQrCode(null);
                                                        }}
                                                        className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-rose-500 transition-all font-outfit"
                                                    >
                                                        Refresh QR Code
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-20 flex flex-col items-center gap-6">
                                                <Loader2 size={40} className="text-[#003366]/20 animate-spin" />
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Loading System...</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'groups' && (
                                    <motion.div
                                        key="groups"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                                            <div className="relative flex-1 group w-full">
                                                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003366]" />
                                                <input
                                                    type="text"
                                                    placeholder="Search groups..."
                                                    value={groupSearch}
                                                    onChange={(e) => setGroupSearch(e.target.value)}
                                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:bg-white outline-none transition-all"
                                                />
                                            </div>
                                            <button
                                                onClick={fetchGroups}
                                                disabled={isLoadingGroups}
                                                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[#003366] disabled:opacity-50"
                                            >
                                                <RefreshCcw size={20} className={cn(isLoadingGroups && "animate-spin")} />
                                            </button>
                                        </div>

                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                                            {status !== 'CONNECTED' ? (
                                                <div className="text-center py-32 opacity-20 flex flex-col items-center gap-4">
                                                    <AlertCircle size={64} />
                                                    <p className="text-[11px] font-black uppercase tracking-[0.4em]">Connect WhatsApp To Load Groups</p>
                                                </div>
                                            ) : isLoadingGroups ? (
                                                <div className="py-32 text-center space-y-4">
                                                    <Loader2 size={40} className="animate-spin text-[#003366]/10 mx-auto" />
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Loading Groups...</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {groups
                                                        .filter(g => g.subject.toLowerCase().includes(groupSearch.toLowerCase()))
                                                        .map((group, idx) => (
                                                            <motion.div
                                                                key={group.id}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: idx * 0.03 }}
                                                                whileHover={{ scale: 1.02 }}
                                                                onClick={() => {
                                                                    // @ts-ignore
                                                                    if (activeTab === 'broadcast') {
                                                                        toggleTargetSelection(group.id);
                                                                    } else {
                                                                        handleSendMessage(group.id, group.subject);
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    "group flex flex-col p-6 bg-slate-50 hover:bg-white border-2 border-slate-50 hover:border-[#25D366]/20 rounded-[2.5rem] transition-all cursor-pointer relative overflow-hidden",
                                                                    selectedTargets.includes(group.id) && "ring-4 ring-[#25D366] border-[#25D366]/50 bg-white"
                                                                )}
                                                            >
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-[#003366] border border-slate-100 group-hover:text-emerald-500 transition-all">
                                                                        <Users size={28} />
                                                                    </div>
                                                                    <div className="p-2 bg-emerald-100/50 text-emerald-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Send size={16} />
                                                                    </div>
                                                                </div>

                                                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight line-clamp-1 mb-2">
                                                                    {group.subject}
                                                                </h4>

                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-full">
                                                                        <Users size={10} className="text-slate-400" />
                                                                        <span className="text-[9px] font-black text-slate-600 uppercase">{group.participants} Members</span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'broadcast' && (
                                    <motion.div
                                        key="broadcast"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[3rem] border-2 border-white shadow-xl relative overflow-hidden">
                                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                                <div className="space-y-4 flex-1 text-center md:text-left">
                                                    <div className="p-4 bg-white rounded-3xl shadow-sm inline-block text-indigo-500">
                                                        <Zap size={32} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-2xl font-black text-indigo-900 uppercase tracking-tight">Bulk Send Messaging</h4>
                                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1">Send messages to multiple targets at once</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
                                                    {[
                                                        { id: 'groups', label: 'Groups', icon: MessageSquare, sub: 'WA Groups' },
                                                        { id: 'students', label: 'Students', icon: Users, sub: 'All scholars' },
                                                        { id: 'teachers', label: 'Teachers', icon: Smartphone, sub: 'Staff matrix' }
                                                    ].map((target, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setBroadcastType(target.id as any)}
                                                            className={cn(
                                                                "p-6 rounded-[2rem] border-2 shadow-sm text-left group transition-all",
                                                                broadcastType === target.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-800 border-white hover:border-indigo-200"
                                                            )}
                                                        >
                                                            <target.icon className={cn("w-8 h-8 mb-4 transition-transform group-hover:scale-110", broadcastType === target.id ? "text-white" : "text-indigo-500")} />
                                                            <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none mb-1", broadcastType === target.id ? "text-indigo-100" : "text-slate-400")}>Quick Target</p>
                                                            <p className="text-sm font-black uppercase tracking-tighter">{target.label}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-4">
                                                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Selected {broadcastType}: {selectedTargets.length}</h5>
                                                    <div className="relative">
                                                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                                        <input
                                                            type="text"
                                                            placeholder={`Search ${broadcastType}...`}
                                                            value={contactSearch}
                                                            onChange={(e) => setContactSearch(e.target.value)}
                                                            className="bg-slate-50 border-2 border-slate-100 rounded-full py-2 pl-9 pr-4 text-[10px] font-bold outline-none focus:bg-white w-48"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={selectAll}
                                                        className="text-[9px] font-black text-indigo-500 uppercase hover:underline"
                                                    >
                                                        Select All {broadcastType}
                                                    </button>
                                                    {selectedTargets.length > 0 && (
                                                        <button
                                                            onClick={() => setSelectedTargets([])}
                                                            className="text-[9px] font-black text-rose-500 uppercase hover:underline"
                                                        >
                                                            Clear Selection
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Targets Selection List for Broadcast */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[250px] overflow-y-auto p-2 custom-scrollbar border-2 border-dashed border-slate-100 rounded-[2rem]">
                                                {broadcastType === 'groups' ? (
                                                    isLoadingGroups ? (
                                                        <div className="col-span-full py-10 text-center">
                                                            <Loader2 size={24} className="animate-spin mx-auto text-slate-300" />
                                                        </div>
                                                    ) : groups.length === 0 ? (
                                                        <div className="col-span-full py-10 text-center text-slate-300 text-[10px] font-black uppercase">No groups loaded</div>
                                                    ) : (
                                                        groups
                                                            .filter(g => g.subject.toLowerCase().includes(contactSearch.toLowerCase()))
                                                            .map(g => (
                                                                <button
                                                                    key={g.id}
                                                                    onClick={() => toggleTargetSelection(g.id)}
                                                                    className={cn(
                                                                        "p-3 rounded-2xl text-[10px] font-bold text-left transition-all border-2",
                                                                        selectedTargets.includes(g.id)
                                                                            ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                                                            : "bg-white border-slate-50 text-slate-500 hover:border-slate-200"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={cn(
                                                                            "w-2 h-2 rounded-full",
                                                                            selectedTargets.includes(g.id) ? "bg-emerald-500" : "bg-slate-200"
                                                                        )}></div>
                                                                        <span className="truncate">{g.subject}</span>
                                                                    </div>
                                                                </button>
                                                            ))
                                                    )
                                                ) : broadcastType === 'students' ? (
                                                    students
                                                        .filter(s => s.name.toLowerCase().includes(contactSearch.toLowerCase()) || (s.whatsappNumber && s.whatsappNumber.includes(contactSearch)))
                                                        .map(s => (
                                                            <button
                                                                key={s.id}
                                                                disabled={!s.whatsappNumber}
                                                                onClick={() => s.whatsappNumber && toggleTargetSelection(s.id)}
                                                                className={cn(
                                                                    "p-3 rounded-2xl text-[10px] font-bold text-left transition-all border-2",
                                                                    selectedTargets.includes(s.id)
                                                                        ? "bg-blue-50 border-blue-500 text-blue-700"
                                                                        : "bg-white border-slate-50 text-slate-500 hover:border-slate-200",
                                                                    !s.whatsappNumber && "opacity-50 cursor-not-allowed"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn(
                                                                        "w-2 h-2 rounded-full",
                                                                        selectedTargets.includes(s.id) ? "bg-blue-500" : "bg-slate-200"
                                                                    )}></div>
                                                                    <div className="flex flex-col">
                                                                        <span className="truncate">{s.name}</span>
                                                                        <span className="text-[8px] opacity-60">{s.whatsappNumber || 'No WA Number'}</span>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))
                                                ) : (
                                                    teachers
                                                        .filter(t => t.name.toLowerCase().includes(contactSearch.toLowerCase()) || (t.whatsappNumber && t.whatsappNumber.includes(contactSearch)))
                                                        .map(t => (
                                                            <button
                                                                key={t.id}
                                                                disabled={!t.whatsappNumber}
                                                                onClick={() => t.whatsappNumber && toggleTargetSelection(t.id)}
                                                                className={cn(
                                                                    "p-3 rounded-2xl text-[10px] font-bold text-left transition-all border-2",
                                                                    selectedTargets.includes(t.id)
                                                                        ? "bg-amber-50 border-amber-500 text-amber-700"
                                                                        : "bg-white border-slate-50 text-slate-500 hover:border-slate-200",
                                                                    !t.whatsappNumber && "opacity-50 cursor-not-allowed"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn(
                                                                        "w-2 h-2 rounded-full",
                                                                        selectedTargets.includes(t.id) ? "bg-amber-500" : "bg-slate-200"
                                                                    )}></div>
                                                                    <div className="flex flex-col">
                                                                        <span className="truncate">{t.name}</span>
                                                                        <span className="text-[8px] opacity-60">{t.whatsappNumber || 'No WA Number'}</span>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {[
                                                        { id: 'ADMISSION_WELCOME', label: 'Admission' },
                                                        { id: 'FEE_REMINDER', label: 'Fee Reminder' },
                                                        { id: 'ATTENDANCE_ABSENT', label: 'Absent' },
                                                        { id: 'ATTENDANCE_LATE', label: 'Late' }
                                                    ].map(tmp => (
                                                        <button
                                                            key={tmp.id}
                                                            onClick={() => applyTemplate(tmp.id as any)}
                                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                                        >
                                                            {tmp.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-8 text-sm outline-none focus:bg-white h-48 font-bold transition-all"
                                                    placeholder={`Write your bulk message to ${broadcastType} here...`}
                                                    value={broadcastMessage}
                                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                                ></textarea>
                                                <button
                                                    onClick={handleBroadCast}
                                                    disabled={isBroadcasting || selectedTargets.length === 0}
                                                    className="w-full py-6 bg-[#003366] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
                                                >
                                                    {isBroadcasting ? (
                                                        <>Broadcasting... <Loader2 size={16} className="animate-spin" /></>
                                                    ) : (
                                                        <>Start Sending to {selectedTargets.length} Recipients <Send size={16} /></>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'logs' && (
                                    <motion.div
                                        key="logs"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4 h-[500px] flex flex-col"
                                    >
                                        <div className="flex items-center justify-between px-2 mb-2">
                                            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Activity History</h5>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Updates</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-3">
                                            <AnimatePresence initial={false}>
                                                {logs.map((log, i) => (
                                                    <motion.div
                                                        key={`log-${i}`}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="flex gap-4 p-5 bg-slate-50 hover:bg-white border-2 border-slate-50 hover:border-slate-100 rounded-[1.5rem] transition-all"
                                                    >
                                                        <div className={cn(
                                                            "w-1 h-10 rounded-full shrink-0",
                                                            log.type === 'success' ? "bg-emerald-500" :
                                                                log.type === 'warning' ? "bg-amber-500" : "bg-blue-500"
                                                        )}></div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{log.type}</span>
                                                                </div>
                                                                <span className="text-[9px] font-black text-slate-300 font-mono">{log.time}</span>
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-600 leading-relaxed truncate">{log.msg}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>

                                            {logs.length === 0 && (
                                                <div className="h-full flex flex-col items-center justify-center opacity-10">
                                                    <History size={80} className="mb-6" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">No activity yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Info */}
                <div className="space-y-8">
                    {/* Security Card */}
                    <div className="bg-[#003366] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl w-fit">
                                <ShieldCheck size={20} className="text-blue-200" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">System Info</h4>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { text: "Your login remains active even after refresh.", icon: CheckCheck },
                                    { text: "Messages are sent instantly to groups.", icon: Zap },
                                    { text: "Encrypted and safe connection.", icon: RefreshCcw }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                            <item.icon size={12} />
                                        </div>
                                        <p className="text-[11px] font-bold text-blue-50/80 leading-relaxed">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Health Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-emerald-500 mb-6 font-outfit">
                            <Settings size={28} />
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">System Status</h4>
                            <p className="text-xl font-black text-slate-800 uppercase tracking-tighter">Running Well</p>
                        </div>

                        <div className="w-full h-2 bg-slate-50 rounded-full mt-8 overflow-hidden border p-0.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                className="h-full bg-emerald-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
