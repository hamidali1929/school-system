import {
    Globe, Bell, Lock, Server, Palette,
    Banknote as Bank, MessageSquare, Sparkles,
    Terminal, Activity, Download, Layout, Target,
    Users, GraduationCap, MapPin, Trash2, Edit2, Plus, ArrowRight, Shield
} from 'lucide-react';
import { WhatsAppMatrix } from '../components/WhatsAppMatrix';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';
import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardCard = ({ title, value, subValue, icon: Icon, trend, color, delay = 0 }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: "easeOut" }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="relative group p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm overflow-hidden"
    >
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-[11px] font-bold text-slate-400 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
                <p className="text-[11px] font-medium text-slate-400 mt-1">{subValue}</p>
            </div>
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300",
                color === 'emerald' ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
                    color === 'blue' ? "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white" :
                        color === 'indigo' ? "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white" :
                            "bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white"
            )}>
                <Icon size={24} />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center gap-2 relative z-10">
                <div className="h-1.5 flex-1 bg-slate-50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: trend }}
                        transition={{ delay: delay + 0.3, duration: 1.5, ease: "circOut" }}
                        className={cn("h-full rounded-full", color ? `bg-${color}-500` : "bg-blue-500")}
                    ></motion.div>
                </div>
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </motion.div>
);

const AdminSettingItem = ({ icon: Icon, title, desc, actionLabel, onClick }: any) => (
    <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ x: 5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50/80 transition-all gap-4 rounded-3xl group"
    >
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-600 flex items-center justify-center group-hover:text-brand-primary group-hover:border-brand-primary/20 transition-all duration-300">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold text-sm text-slate-800 tracking-tight">{title}</h4>
                <p className="text-xs font-medium text-slate-400 mt-0.5">{desc}</p>
            </div>
        </div>
        <button
            onClick={onClick}
            className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-all active:scale-95 shadow-sm active:shadow-inner"
        >
            {actionLabel}
        </button>
    </motion.div>
);

export const AdminPanel = () => {
    const {
        settings, updateSettings, feeStructure, updateFeeStructure,
        notifications, students, teachers, auditLogs, addAuditLog,
        attendance, classes, periodSettings, classSubjects,
        classInCharge, subjectTeachers, timetables, exams,
        examResults, expenses, salarySlips, importBackup,
        campuses, addCampus, updateCampus, deleteCampus
    } = useStore();
    const [broadcast, setBroadcast] = useState('');
    const [activeView, setActiveView] = useState<'settings' | 'whatsapp' | 'campuses'>('settings');

    const handleExportBackup = () => {
        const backupData = {
            students,
            teachers,
            settings,
            attendance,
            feeStructure,
            classes,
            periodSettings,
            classSubjects,
            classInCharge,
            subjectTeachers,
            timetables,
            exams,
            examResults,
            notifications,
            auditLogs,
            expenses,
            salarySlips,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `PIONEER_MASTER_BACKUP_${date}.psb`;
        link.click();
        URL.revokeObjectURL(url);

        addAuditLog({
            user: 'Admin',
            action: 'Backup Exported',
            details: 'Entire school database exported to .psb file',
            type: 'Security'
        });

        Swal.fire({
            title: 'Backup Successful',
            text: 'Your master record is now downloaded. Keep it safe!',
            icon: 'success',
            confirmButtonColor: 'var(--brand-primary)'
        });
    };

    const handleRestoreBackup = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.psb,.json';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event: any) => {
                try {
                    const data = JSON.parse(event.target.result);

                    Swal.fire({
                        title: 'Confirm Restore?',
                        text: 'This will replace ALL current data with the data from the backup file. This cannot be undone!',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Restore Everything',
                        confirmButtonColor: '#ef4444'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const success = importBackup(data);
                            if (success) {
                                addAuditLog({
                                    user: 'Admin',
                                    action: 'Backup Restored',
                                    details: `Database restored from backup dated: ${data.exportDate || 'Unknown'}`,
                                    type: 'Security'
                                });

                                Swal.fire({
                                    title: 'System Restored',
                                    text: 'School data has been successfully updated. The page will now reload.',
                                    icon: 'success',
                                    timer: 3000,
                                    showConfirmButton: false
                                }).then(() => {
                                    window.location.reload();
                                });
                            } else {
                                Swal.fire('Error', 'Failed to process backup file. It might be corrupted.', 'error');
                            }
                        }
                    });
                } catch (err) {
                    Swal.fire('Error', 'Invalid file format.', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const stats = useMemo(() => {
        const totalFeesTarget = students.reduce((sum, s) => sum + (s.feesTotal || 0), 0);
        const totalFeesPaid = students.reduce((sum, s) => sum + (s.feesPaid || 0), 0);
        const feeCollectionRate = totalFeesTarget > 0 ? (totalFeesPaid / totalFeesTarget) * 100 : 0;

        return {
            studentsCount: students.length,
            teachersCount: teachers.length,
            activeUsers: teachers.filter(t => t.status === 'Active').length + 1, // +1 for admin
            feeRate: `${feeCollectionRate.toFixed(1)}%`,
            revenue: `RS ${totalFeesPaid.toLocaleString()}`
        };
    }, [students, teachers]);

    const handleEditFees = async () => {
        const structureHtml = Object.entries(feeStructure).map(([className, fee]) => `
            <div class="flex items-center justify-between gap-4 mb-2 p-3 bg-white border border-slate-100 rounded-xl">
                <span class="text-[10px] font-black uppercase tracking-tight text-brand-primary shrink-0 w-32">${className}</span>
                <input 
                    type="number" 
                    id="fee-${className.replace(/\s+/g, '-')}" 
                    class="swal2-input !m-0 !w-32 !text-xs !rounded-lg !h-10 !border-slate-100 !px-4" 
                    value="${fee}" 
                    placeholder="Fee in RS"
                >
            </div>
        `).join('');

        const { value: formValues } = await Swal.fire({
            title: 'Fee Management',
            html: `
                <div class="text-left font-outfit">
                    <p class="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em] px-1">School Fee Tiers</p>
                    <div class="max-h-[50vh] overflow-y-auto px-1 space-y-2">
                        ${structureHtml}
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Synchronize Rates',
            confirmButtonColor: 'var(--brand-primary)',
            preConfirm: () => {
                const newStructure: Record<string, number> = {};
                Object.keys(feeStructure).forEach(className => {
                    const input = document.getElementById(`fee-${className.replace(/\s+/g, '-')}`) as HTMLInputElement;
                    newStructure[className] = Number(input.value) || 0;
                });
                return newStructure;
            }
        });

        if (formValues) {
            updateFeeStructure(formValues);
            addAuditLog({
                user: 'Super Admin',
                action: 'Fee Structure Updated',
                type: 'Financial',
                details: 'Global tuition fees reorganized.'
            });
            Swal.fire({
                title: 'Rates Updated',
                text: 'School fees updated successfully.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
            });
        }
    };

    const handleEditBranding = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'School Branding',
            html: `
                <div class="text-left space-y-4 font-outfit max-h-[70vh] overflow-y-auto px-1">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                        <label class="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">School Full Name</label>
                        <input id="swal-school-name" class="swal2-input !mt-0 !w-full !rounded-xl !text-sm" value="${settings.schoolName}">
                    </div>
                    <div class="col-span-2">
                        <label class="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Subtitle / Slogan</label>
                        <input id="swal-sub-title" class="swal2-input !mt-0 !w-full !rounded-xl !text-sm" value="${settings.subTitle || ''}">
                    </div>
                  </div>
                  <div>
                    <label class="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Physical Address</label>
                    <input id="swal-location" class="swal2-input !mt-0 !w-full !rounded-xl !text-sm" value="${settings.location || ''}">
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">School Logo URL</label>
                      <input id="swal-logo-1" class="swal2-input !mt-0 !w-full !rounded-xl !text-sm" placeholder="PNG URL" value="${settings.logo1 || ''}">
                    </div>
                    <div>
                      <label class="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">College Logo URL</label>
                      <input id="swal-logo-2" class="swal2-input !mt-0 !w-full !rounded-xl !text-sm" placeholder="PNG URL" value="${settings.logo2 || ''}">
                    </div>
                  </div>
                </div>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Update Branding',
            confirmButtonColor: 'var(--brand-primary)',
            preConfirm: () => {
                return {
                    schoolName: (document.getElementById('swal-school-name') as HTMLInputElement).value,
                    subTitle: (document.getElementById('swal-sub-title') as HTMLInputElement).value,
                    location: (document.getElementById('swal-location') as HTMLInputElement).value,
                    logo1: (document.getElementById('swal-logo-1') as HTMLInputElement).value || null,
                    logo2: (document.getElementById('swal-logo-2') as HTMLInputElement).value || null
                }
            }
        });

        if (formValues) {
            updateSettings(formValues);
            addAuditLog({
                user: 'Super Admin',
                action: 'Branding Updated',
                type: 'System',
                details: 'School branding updated.'
            });
            Swal.fire({
                title: 'Settings Saved',
                text: 'School branding updated successfully.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
            });
        }
    };

    const handleAIConfig = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'AI Neural Configuration',
            html: `
                <div class="text-left space-y-4 font-outfit">
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Groq API Key (Llama 3.1)</label>
                        <input id="swal-ai-key" type="password" class="swal2-input !mt-0 !w-full !rounded-xl !text-sm" placeholder="gsk_..." value="${settings.aiApiKey || ''}">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">AI Communication Tone</label>
                        <select id="swal-ai-tone" class="swal2-input !mt-0 !w-full !rounded-xl !text-sm !h-12">
                            <option value="Professional" ${settings.aiTone === 'Professional' ? 'selected' : ''}>Professional (Standard)</option>
                            <option value="Polite" ${settings.aiTone === 'Polite' ? 'selected' : ''}>Polite & Friendly</option>
                            <option value="Strict" ${settings.aiTone === 'Strict' ? 'selected' : ''}>Strict & Academic</option>
                            <option value="Supportive" ${settings.aiTone === 'Supportive' ? 'selected' : ''}>Encouraging & Supportive</option>
                        </select>
                    </div>
                </div>`,
            showCancelButton: true,
            confirmButtonText: 'Calibrate AI',
            confirmButtonColor: 'var(--brand-primary)',
            preConfirm: () => {
                return {
                    aiApiKey: (document.getElementById('swal-ai-key') as HTMLInputElement).value,
                    aiTone: (document.getElementById('swal-ai-tone') as HTMLSelectElement).value
                }
            }
        });

        if (formValues) {
            updateSettings(formValues);
            addAuditLog({
                user: 'Super Admin',
                action: 'AI Config Saved',
                type: 'System',
                details: `Tone set to ${formValues.aiTone}`
            });
            Swal.fire('AI Saved', 'AI Settings updated with desired tone.', 'success');
        }
    };

    const handleThemeDesigner = async () => {
        const presets = [
            { id: 'default', name: 'Institutional Default', p: '#003366', s: '#0ea5e9', a: '#fbbf24', r: '40px', g: '0.98' },
            { id: 'emerald', name: 'Emerald Scholastic', p: '#064e3b', s: '#059669', a: '#d9f99d', r: '20px', g: '0.95' },
            { id: 'midnight', name: 'Midnight Academy', p: '#1e1b4b', s: '#6366f1', a: '#a5b4fc', r: '12px', g: '0.90' },
            { id: 'crimson', name: 'Crimson Academic', p: '#7f1d1d', s: '#dc2626', a: '#fca5a5', r: '30px', g: '0.96' },
        ];

        const presetHtml = presets.map(p => `
            <button onclick="window.applyPreset('${p.p}', '${p.s}', '${p.a}', '${p.r}', '${p.g}')" class="flex flex-col items-center gap-2 p-4 bg-white border-2 border-slate-50 rounded-3xl hover:border-blue-500 transition-all group">
                <div class="flex gap-1">
                    <div class="w-6 h-6 rounded-full shadow-sm" style="background: ${p.p}"></div>
                    <div class="w-6 h-6 rounded-full shadow-sm" style="background: ${p.s}"></div>
                    <div class="w-6 h-6 rounded-full shadow-sm" style="background: ${p.a}"></div>
                </div>
                <span class="text-[9px] font-black uppercase text-slate-400 group-hover:text-blue-600">${p.name}</span>
            </button>
        `).join('');

        // Expose helper to window for swal buttons
        (window as any).applyPreset = (p: string, s: string, a: string, r: string, g: string) => {
            (document.getElementById('swal-theme-p') as HTMLInputElement).value = p;
            (document.getElementById('swal-theme-s') as HTMLInputElement).value = s;
            (document.getElementById('swal-theme-a') as HTMLInputElement).value = a;
            (document.getElementById('swal-theme-radius') as HTMLInputElement).value = parseInt(r).toString();
            (document.getElementById('swal-theme-glass') as HTMLInputElement).value = (parseFloat(g) * 100).toString();
            document.getElementById('radius-val')!.innerText = r;
            document.getElementById('glass-val')!.innerText = g;
        };

        Swal.fire({
            title: '<span class="font-cinzel text-2xl font-black text-slate-700">Visual Theme Engine</span>',
            html: `
                <div class="text-left space-y-6 font-outfit px-1">
                    <div>
                        <p class="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em] px-1">Institutional Presets</p>
                        <div class="grid grid-cols-2 gap-3 mb-6">
                            ${presetHtml}
                        </div>
                    </div>
                    
                    <div class="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100/50">
                        <p class="text-[10px] font-black uppercase text-blue-600 mb-4 tracking-[0.2em]">Structural Geometry</p>
                        <div class="space-y-4">
                            <div>
                                <div class="flex justify-between mb-1">
                                    <label class="text-[9px] font-black uppercase text-slate-400">Border Radius</label>
                                    <span class="text-[9px] font-bold text-blue-600" id="radius-val">${settings.themeColors?.borderRadius || '40px'}</span>
                                </div>
                                <input id="swal-theme-radius" type="range" min="0" max="60" value="${parseInt(settings.themeColors?.borderRadius || '40')}" class="w-full accent-blue-600 h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer" oninput="document.getElementById('radius-val').innerText = this.value + 'px'">
                            </div>
                            <div>
                                <div class="flex justify-between mb-1">
                                    <label class="text-[9px] font-black uppercase text-slate-400">Glass Transparency</label>
                                    <span class="text-[9px] font-bold text-blue-600" id="glass-val">${settings.themeColors?.glassIntensity || '0.98'}</span>
                                </div>
                                <input id="swal-theme-glass" type="range" min="50" max="100" value="${parseFloat(settings.themeColors?.glassIntensity || '0.98') * 100}" class="w-full accent-blue-600 h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer" oninput="document.getElementById('glass-val').innerText = (this.value/100).toFixed(2)">
                            </div>
                        </div>
                    </div>

                    <div class="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100/50">
                        <p class="text-[10px] font-black uppercase text-blue-600 mb-4 tracking-[0.2em]">Color Calibration</p>
                        <div class="grid grid-cols-3 gap-6">
                            <div class="text-center">
                                <label class="text-[9px] font-black uppercase text-slate-400 block mb-2">Primary</label>
                                <input id="swal-theme-p" type="color" class="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 overflow-hidden" value="${settings.themeColors?.primary || '#003366'}">
                            </div>
                            <div class="text-center">
                                <label class="text-[9px] font-black uppercase text-slate-400 block mb-2">Secondary</label>
                                <input id="swal-theme-s" type="color" class="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 overflow-hidden" value="${settings.themeColors?.secondary || '#0ea5e9'}">
                            </div>
                            <div class="text-center">
                                <label class="text-[9px] font-black uppercase text-slate-400 block mb-2">Accent</label>
                                <input id="swal-theme-a" type="color" class="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 overflow-hidden" value="${settings.themeColors?.accent || '#fbbf24'}">
                            </div>
                        </div>
                    </div>
                    <p class="text-[9px] font-bold text-slate-400 italic text-center">Your interface will undergo a full visual synchronization upon saving.</p>
                </div>`,
            showCancelButton: true,
            confirmButtonText: 'ACTIVATE THEME',
            customClass: {
                popup: 'rounded-[3rem] p-8',
                confirmButton: 'px-10 py-4 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl !m-0',
                cancelButton: 'px-10 py-4 bg-slate-100 text-brand-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all !m-0',
                actions: 'gap-4 !pt-8 flex-wrap'
            },
            showDenyButton: true,
            denyButtonText: 'RESET TO DEFAULT',
            denyButtonColor: '#f43f5e',
            preConfirm: () => ({
                primary: (document.getElementById('swal-theme-p') as HTMLInputElement).value,
                secondary: (document.getElementById('swal-theme-s') as HTMLInputElement).value,
                accent: (document.getElementById('swal-theme-a') as HTMLInputElement).value,
                borderRadius: (document.getElementById('swal-theme-radius') as HTMLInputElement).value + 'px',
                glassIntensity: (parseInt((document.getElementById('swal-theme-glass') as HTMLInputElement).value) / 100).toString(),
            })
        }).then((result) => {
            if (result.isConfirmed) {
                const colors = result.value;
                updateSettings({ themeColors: colors });
                addAuditLog({
                    user: 'Super Admin',
                    action: 'UI Theme Calibrated',
                    type: 'System',
                    details: `Primary: ${colors.primary}, Accent: ${colors.accent}`
                });
                Swal.fire({
                    title: 'Theme Applied',
                    text: 'Visual sync completed successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: colors.primary,
                    color: '#fff'
                });
            } else if (result.isDenied) {
                const defaultColors = {
                    primary: '#003366',
                    secondary: '#0ea5e9',
                    accent: '#fbbf24',
                    borderRadius: '40px',
                    glassIntensity: '0.98'
                };
                updateSettings({ themeColors: defaultColors });
                Swal.fire({
                    title: 'Factory Reset',
                    text: 'System aesthetic restored to default.',
                    icon: 'info',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#003366',
                    color: '#fff'
                });
            }
        });
    };

    const handleBackup = () => {
        const data = {
            students,
            teachers,
            settings,
            feeStructure,
            auditLogs,
            notifications,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edunova-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addAuditLog({
            user: 'Super Admin',
            action: 'Manual Backup',
            type: 'System',
            details: 'School data exported to JSON.'
        });
        Swal.fire('Backup Saved', 'School data exported successfully.', 'success');
    };

    const handleBroadcast = () => {
        if (!broadcast.trim()) {
            Swal.fire('Error', 'Broadcast message cannot be empty.', 'error');
            return;
        }
        Swal.fire({
            title: 'Confirm Broadcast',
            text: 'This message will be sent to all active users.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Send Now',
            confirmButtonColor: 'var(--brand-primary)'
        }).then((result) => {
            if (result.isConfirmed) {
                addAuditLog({
                    user: 'Super Admin',
                    action: 'Broadcast Sent',
                    type: 'System',
                    details: broadcast
                });
                Swal.fire('Sent', 'Message has been sent to all users.', 'success');
                setBroadcast('');
            }
        });
    };

    const CampusManager = () => {
        const handleAddCampus = async () => {
            const { value: newCampus } = await Swal.fire({
                title: '<span class="font-cinzel text-2xl font-black text-slate-700">Add New Campus</span>',
                showClass: {
                    popup: 'animate__animated animate__fadeInUp animate__faster'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutDown animate__faster'
                },
                html: `
                    <div class="text-left space-y-6 font-outfit px-2 pt-2 pb-4">
                        <!-- Group: Branch Identity -->
                        <div class="bg-[#f0f7ff]/50 p-6 rounded-[2.5rem] border border-blue-100 shadow-sm relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <p class="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] mb-6 flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span> 
                                Branch Identity
                            </p>
                            <div class="space-y-5">
                                <div class="relative">
                                    <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Campus Name</label>
                                    <input id="swal-new-name" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm placeholder:text-slate-300" placeholder="e.g. Model Town Campus">
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="relative">
                                        <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Roll No Prefix</label>
                                        <input id="swal-new-prefix" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm placeholder:text-slate-300" placeholder="e.g. MH, SN">
                                    </div>
                                    <div class="relative">
                                        <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Academy Type</label>
                                        <select id="swal-new-type" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm appearance-none cursor-pointer">
                                            <option value="School">School Only</option>
                                            <option value="College">College Only</option>
                                            <option value="Both">Combined (Both)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Group: Leadership & Contact -->
                        <div class="bg-[#f5f8ff]/50 p-6 rounded-[2.5rem] border border-blue-100 shadow-sm relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <p class="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] mb-6 flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span> 
                                Leadership & Contact
                            </p>
                            <div class="space-y-4">
                                <div class="relative">
                                    <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Principal / Admin In-Charge</label>
                                    <input id="swal-new-principal" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm placeholder:text-slate-300" placeholder="Full Name">
                                </div>
                                <div class="relative">
                                    <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Contact Number</label>
                                    <input id="swal-new-contact" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm placeholder:text-slate-300" placeholder="03XXXXXXXXX">
                                </div>
                                <div class="relative">
                                    <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Branch Address</label>
                                    <input id="swal-new-loc" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm placeholder:text-slate-300" placeholder="Physical Location">
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                confirmButtonText: 'ADD CAMPUS',
                cancelButtonText: 'CANCEL',
                customClass: {
                    popup: 'rounded-[3.5rem] p-10 border border-slate-100 shadow-2xl',
                    confirmButton: 'px-14 py-5 bg-[#6b66e6] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#5a55d4] transition-all shadow-xl !m-0',
                    cancelButton: 'px-14 py-5 bg-[#64748b] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#475569] transition-all !m-0',
                    actions: 'gap-6 !pt-10'
                },
                showCancelButton: true,
                preConfirm: () => ({
                    name: (document.getElementById('swal-new-name') as HTMLInputElement).value,
                    idPrefix: (document.getElementById('swal-new-prefix') as HTMLInputElement).value,
                    principalName: (document.getElementById('swal-new-principal') as HTMLInputElement).value,
                    location: (document.getElementById('swal-new-loc') as HTMLInputElement).value,
                    type: (document.getElementById('swal-new-type') as HTMLSelectElement).value,
                    contact: (document.getElementById('swal-new-contact') as HTMLInputElement).value,
                    status: 'Active'
                })
            });

            if (newCampus && newCampus.name) {
                addCampus(newCampus);
                Swal.fire({
                    title: 'Campus Added',
                    text: 'New campus added successfully.',
                    icon: 'success',
                    background: '#003366',
                    color: '#fff',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        };

        const handleEditCampus = async (campus: any) => {
            const { value: updates } = await Swal.fire({
                title: '<span class="font-cinzel text-2xl font-black text-slate-700">Edit Campus Details</span>',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown animate__faster'
                },
                hideClass: {
                    popup: 'animate__animated animate__zoomOut animate__faster'
                },
                html: `
                    <div class="text-left space-y-6 font-outfit px-2 pt-2 pb-4">
                        <!-- Group: Branch Identity -->
                        <div class="bg-[#f0f7ff]/50 p-6 rounded-[2.5rem] border border-blue-100 shadow-sm relative overflow-hidden">
                             <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                             <p class="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] mb-6 flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span> 
                                Branch Identity: ${campus.idPrefix || 'GEN'}
                            </p>
                            <div class="space-y-5">
                                <div class="relative">
                                    <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Campus Name</label>
                                    <input id="swal-edit-name" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm" value="${campus.name}">
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="relative">
                                        <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Roll No Prefix</label>
                                        <input id="swal-edit-prefix" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm" value="${campus.idPrefix || ''}">
                                    </div>
                                    <div class="relative">
                                        <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Current Status</label>
                                        <select id="swal-edit-status" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm appearance-none cursor-pointer">
                                            <option value="Active" ${campus.status === 'Active' ? 'selected' : ''}>Active</option>
                                            <option value="Inactive" ${campus.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Group: Leadership & Contact -->
                        <div class="bg-[#f5f8ff]/50 p-6 rounded-[2.5rem] border border-blue-100 shadow-sm relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <p class="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] mb-6 flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span> 
                                Support & Management
                            </p>
                            <div class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="relative">
                                        <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Academy Type</label>
                                        <select id="swal-edit-type" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm appearance-none cursor-pointer">
                                            <option value="School" ${campus.type === 'School' ? 'selected' : ''}>School Only</option>
                                            <option value="College" ${campus.type === 'College' ? 'selected' : ''}>College Only</option>
                                            <option value="Both" ${campus.type === 'Both' || !campus.type ? 'selected' : ''}>Combined (Both)</option>
                                        </select>
                                    </div>
                                    <div class="relative">
                                        <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Campus Capacity</label>
                                        <input id="swal-edit-capacity" type="number" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm" value="${campus.capacity || 500}">
                                    </div>
                                </div>
                                <div class="relative">
                                    <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Principal Name</label>
                                    <input id="swal-edit-principal" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm" value="${campus.principalName || ''}">
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="relative">
                                        <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Contact Phone</label>
                                        <input id="swal-edit-contact" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm" value="${campus.contact || ''}">
                                    </div>
                                    <div class="relative">
                                        <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Email Address</label>
                                        <input id="swal-edit-email" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm" value="${campus.email || ''}">
                                    </div>
                                </div>
                                <div class="relative">
                                    <label class="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest px-1">Physical Address</label>
                                    <input id="swal-edit-loc" class="!m-0 !w-full !bg-white !border-2 !border-blue-50 !rounded-2xl !py-4 !px-6 !text-sm font-bold text-[#003366] focus:!border-blue-400 !transition-all outline-none shadow-sm" value="${campus.location}">
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                confirmButtonText: 'SAVE CHANGES',
                cancelButtonText: 'DISCARD',
                customClass: {
                    popup: 'rounded-[3.5rem] p-10 border border-slate-100 shadow-2xl',
                    confirmButton: 'px-14 py-5 bg-[#6b66e6] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#5a55d4] transition-all shadow-xl !m-0',
                    cancelButton: 'px-14 py-5 bg-[#64748b] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#475569] transition-all !m-0',
                    actions: 'gap-6 !pt-10'
                },
                showCancelButton: true,
                preConfirm: () => ({
                    name: (document.getElementById('swal-edit-name') as HTMLInputElement).value,
                    idPrefix: (document.getElementById('swal-edit-prefix') as HTMLInputElement).value,
                    status: (document.getElementById('swal-edit-status') as HTMLSelectElement).value,
                    principalName: (document.getElementById('swal-edit-principal') as HTMLInputElement).value,
                    contact: (document.getElementById('swal-edit-contact') as HTMLInputElement).value,
                    email: (document.getElementById('swal-edit-email') as HTMLInputElement).value,
                    location: (document.getElementById('swal-edit-loc') as HTMLInputElement).value,
                    type: (document.getElementById('swal-edit-type') as HTMLSelectElement).value,
                    capacity: Number((document.getElementById('swal-edit-capacity') as HTMLInputElement).value) || undefined,
                })
            });

            if (updates) {
                updateCampus(campus.id, updates);
                Swal.fire({
                    title: 'Updated',
                    text: 'Campus details updated successfully.',
                    icon: 'success',
                    background: '#003366',
                    color: '#fff',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        };

        const handleDeleteCampus = (id: string) => {
            Swal.fire({
                title: 'Delete Campus?',
                text: 'This action will permanently remove this campus from the system.',
                icon: 'warning',
                showClass: {
                    popup: 'animate__animated animate__shakeX'
                },
                showCancelButton: true,
                confirmButtonColor: '#f43f5e',
                confirmButtonText: 'Yes, Delete Now',
                cancelButtonText: 'Cancel',
                background: '#fff',
                customClass: {
                    popup: 'rounded-[2.5rem]'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteCampus(id);
                    Swal.fire({
                        title: 'Deleted',
                        text: 'Campus removed from the system.',
                        icon: 'success',
                        background: '#f43f5e',
                        color: '#fff'
                    });
                }
            });
        };

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/50 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-xl">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
                            <MapPin size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-[#003366] uppercase tracking-tight">Campus Management</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Manage your different campuses and branches</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAddCampus}
                        className="w-full md:w-auto px-8 py-4 bg-[#003366] text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-blue-500/20 active:scale-95 group"
                    >
                        <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center group-hover:rotate-90 transition-transform">
                            <Plus size={16} />
                        </div>
                        Add New Campus
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {campuses.map((c) => (
                        <div
                            key={c.id}
                            className="glass-card p-8 group relative overflow-hidden transition-all hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] bg-white/60"
                        >
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">
                                            {c.idPrefix || 'GEN'}
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest",
                                            c.status === 'Active' ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" : "bg-rose-50 text-rose-600 border border-rose-100/50"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", c.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                                            {c.status || 'Active'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditCampus(c)}
                                            className="p-3 bg-white hover:bg-indigo-50 text-indigo-600 rounded-xl shadow-sm border border-slate-50 transition-colors"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCampus(c.id)}
                                            className="p-3 bg-white hover:bg-rose-50 text-rose-600 rounded-xl shadow-sm border border-slate-50 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h4 className="text-xl font-black text-[#003366] uppercase tracking-tighter leading-none mb-2">{c.name}</h4>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                        <MapPin size={12} className="text-blue-500" />
                                        {c.location}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-100/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-yellow-400/40 uppercase tracking-widest text-left">Principal</span>
                                        <span className="text-[10px] font-black text-[#003366] uppercase tracking-tight text-right">{c.principalName || 'Not Assigned'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-yellow-400/40 uppercase tracking-widest text-left">Institution Type</span>
                                        <span className="px-3 py-1 bg-slate-100 text-[#003366] rounded-lg text-[9px] font-black uppercase tracking-widest text-right">{c.type || 'Combined'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100/50">
                                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Students</p>
                                            <p className="text-sm font-black text-blue-700">{students.filter(s => s.campus === c.name || s.campus === c.id).length}</p>
                                        </div>
                                        <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100/50">
                                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Faculty</p>
                                            <p className="text-sm font-black text-indigo-700">{teachers.filter(t => t.campus === c.name || t.campus === c.id).length}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-yellow-400/40 uppercase tracking-widest text-left">System Identity</span>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tight text-right">NODE ACTIVE ✓</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleEditCampus(c)}
                                    className="w-full mt-8 py-4 bg-slate-50 hover:bg-[#003366] hover:text-white text-[#003366] rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-slate-100 group-hover:border-transparent"
                                >
                                    Edit Campus Details <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={handleAddCampus}
                        className="p-8 border-4 border-dashed border-slate-100 hover:border-blue-200 rounded-[3rem] group transition-all hover:bg-blue-50/30 flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-blue-400"
                    >
                        <Plus size={32} />
                        <span className="text-xs font-black uppercase tracking-widest">Add Another Campus</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 md:space-y-12 font-outfit pb-20 px-4 md:px-0 overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                            <Terminal size={24} />
                        </div>
                        Admin Settings
                    </h2>
                    <p className="text-sm font-medium text-slate-400 mt-2 ml-1">Configure and manage your school's digital foundation.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex bg-slate-100 rounded-2xl p-1.5 mr-2 shadow-inner border border-slate-200/50">
                        {[
                            { id: 'settings', label: 'General' },
                            { id: 'whatsapp', label: 'WhatsApp' },
                            { id: 'campuses', label: 'Branches' }
                        ].map((view) => (
                            <button
                                key={view.id}
                                onClick={() => setActiveView(view.id as any)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all relative",
                                    activeView === view.id ? "text-blue-700" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {activeView === view.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white shadow-sm border border-slate-100 rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{view.label}</span>
                            </button>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBackup}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
                    >
                        <Download size={14} className="text-blue-500" /> Save Data
                    </motion.button>
                    <div className="px-5 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center gap-3 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">System Active</span>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Fees Collected"
                    value={stats.revenue}
                    subValue="Total revenue today"
                    icon={Bank}
                    trend={stats.feeRate}
                    color="emerald"
                    delay={0.1}
                />
                <DashboardCard
                    title="Students"
                    value={stats.studentsCount}
                    subValue="Total enrolled kids"
                    icon={Users}
                    trend="85%"
                    color="blue"
                    delay={0.2}
                />
                <DashboardCard
                    title="Teachers"
                    value={stats.teachersCount}
                    subValue="Active staff members"
                    icon={GraduationCap}
                    trend="100%"
                    color="indigo"
                    delay={0.3}
                />
                <DashboardCard
                    title="System Status"
                    value="Optimal"
                    subValue={`${stats.activeUsers} Active Devices`}
                    icon={Server}
                    trend="24%"
                    color="rose"
                    delay={0.4}
                />
            </div>

            <AnimatePresence mode="wait">
                {activeView === 'settings' ? (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 xl:grid-cols-3 gap-8"
                    >
                        {/* Main Settings Panel */}
                        <div className="xl:col-span-2 space-y-8">
                            {/* Core Systems */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                                    <h3 className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Layout size={18} />
                                        </div>
                                        Main Settings
                                    </h3>
                                </div>
                                <div className="p-2 space-y-1">
                                    <AdminSettingItem
                                        icon={Globe}
                                        title="School Details"
                                        desc="Update your school name, logo and branding colors."
                                        actionLabel="Update Info"
                                        onClick={handleEditBranding}
                                    />
                                    <AdminSettingItem
                                        icon={Bank}
                                        title="Fee Settings"
                                        desc="Set monthly fees for all classes and grades."
                                        actionLabel="Set Fees"
                                        onClick={handleEditFees}
                                    />
                                    <AdminSettingItem
                                        icon={Palette}
                                        title="Design System"
                                        desc="Customize the look and feel of your app."
                                        actionLabel="Customize"
                                        onClick={handleThemeDesigner}
                                    />
                                    <AdminSettingItem
                                        icon={MapPin}
                                        title="Campuses"
                                        desc="Manage different school branches and locations."
                                        actionLabel="View All"
                                        onClick={() => setActiveView('campuses')}
                                    />
                                    <AdminSettingItem
                                        icon={Lock}
                                        title="Privacy & Security"
                                        desc="Keep your school data safe and secure."
                                        actionLabel="Security"
                                        onClick={() => Swal.fire('Protected', 'Your data is secured with AES-256 encryption.', 'info')}
                                    />
                                    <AdminSettingItem
                                        icon={Globe}
                                        title="Online Website"
                                        desc="Settings for student result portal."
                                        actionLabel="Open Link"
                                        onClick={() => Swal.fire('Portal', 'Your Result Portal is live at student.school.com', 'success')}
                                    />
                                </div>
                            </div>

                            {/* Data Archiving */}
                            <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-500/5 overflow-hidden">
                                <div className="p-8 border-b border-slate-50 bg-emerald-50/30">
                                    <h3 className="text-sm font-bold tracking-tight text-emerald-700 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <Server size={18} />
                                        </div>
                                        Data Backup & Restore
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/10">
                                                <Download className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-800">Save School Data</h4>
                                                <p className="text-xs font-medium text-slate-400 mt-0.5">Download a safe backup of everything.</p>
                                            </div>
                                        </div>
                                        <button onClick={handleExportBackup} className="w-full py-4 bg-slate-800 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">Download Backup</button>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/10">
                                                <Activity className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-800">Restore Data</h4>
                                                <p className="text-xs font-medium text-slate-400 mt-0.5">Bring back data from an old backup.</p>
                                            </div>
                                        </div>
                                        <button onClick={handleRestoreBackup} className="w-full py-4 bg-amber-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg active:scale-95">Upload Backup</button>
                                    </div>
                                </div>
                            </div>

                            {/* AI & Neural Systems */}
                            <div className="bg-white rounded-[2.5rem] border border-indigo-100 shadow-xl shadow-indigo-500/5 overflow-hidden">
                                <div className="p-8 bg-gradient-to-br from-indigo-50/50 to-white relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="flex items-start gap-5">
                                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 shrink-0">
                                                <Sparkles size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-indigo-900 tracking-tight flex items-center gap-2">
                                                    AI Assistant <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">v3.1</span>
                                                </h3>
                                                <p className="text-sm font-medium text-slate-500 mt-1 max-w-md">
                                                    Control how AI speaks and generates reports for your students and parents.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleAIConfig}
                                            className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all text-center"
                                        >
                                            Settings
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/30">
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tone</p>
                                        <p className="text-xs font-bold text-indigo-600">{settings.aiTone || 'Professional'}</p>
                                    </div>
                                    <div className="text-center border-l border-slate-100">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">State</p>
                                        <p className="text-xs font-bold text-emerald-500">Active</p>
                                    </div>
                                    <div className="text-center border-l border-slate-100">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Speed</p>
                                        <p className="text-xs font-bold text-slate-600">Fast</p>
                                    </div>
                                    <div className="text-center border-l border-slate-100">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Auth</p>
                                        <p className="text-xs font-bold text-slate-600">{settings.aiApiKey ? 'Verified✓' : 'Missing✗'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Notification Broadcast */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                            <Bell className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 tracking-tight">System Announcement</h3>
                                            <p className="text-xs font-medium text-slate-400 mt-0.5">Send a message to all school members.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-6">
                                    <textarea
                                        value={broadcast}
                                        onChange={(e) => setBroadcast(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-sm outline-none focus:ring-4 ring-amber-500/10 min-h-[140px] font-medium text-slate-700 placeholder:text-slate-300 transition-all shadow-inner"
                                        placeholder="Type a message to show on all school computers..."
                                    ></textarea>
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={handleBroadcast}
                                        className="w-full py-4 bg-amber-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3"
                                    >
                                        <Target size={18} /> Send Message
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Tracking & Logs Panel */}
                        <div className="space-y-8">
                            {/* Activity Feed */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden max-h-[1000px]">
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-sm text-slate-800 tracking-tight">Recent Activity</h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Live Feed</span>
                                </div>
                                <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                                    {auditLogs.length > 0 ? (
                                        <div className="space-y-1">
                                            {auditLogs.map((log) => (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    key={log.id}
                                                    className="p-5 hover:bg-slate-50 rounded-2xl transition-all group"
                                                >
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            log.type === 'Security' ? "bg-rose-500" :
                                                                log.type === 'Financial' ? "bg-emerald-500" :
                                                                    log.type === 'Academic' ? "bg-blue-500" : "bg-slate-300"
                                                        )} />
                                                        <span className="text-[10px] font-bold text-slate-400 flex-1">{log.user}</span>
                                                        <span className="text-[9px] font-medium text-slate-300">{log.timestamp.split(',')[1]}</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-700 leading-tight mb-1">{log.action}</p>
                                                    <p className="text-xs font-medium text-slate-400 italic leading-relaxed">{log.details}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center px-10">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Terminal className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <p className="text-slate-300 font-bold text-xs">No activity recorded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* WhatsApp Log Shortcut */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden group shadow-xl shadow-indigo-500/20"
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                            <MessageSquare size={20} />
                                        </div>
                                        <h4 className="font-bold text-sm tracking-tight">WhatsApp Reports</h4>
                                    </div>
                                    <p className="text-3xl font-bold mb-4">{notifications.length}</p>
                                    <p className="text-xs font-medium text-indigo-100/70 mb-6 font-medium">Messages sent successfully.</p>
                                    <div className="space-y-3">
                                        {notifications.slice(0, 3).map(n => (
                                            <div key={n.id} className="text-[11px] font-medium text-indigo-100 flex items-center gap-3 bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                                <span className="truncate">To: {n.studentName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute right-[-40px] bottom-[-40px] w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                            </motion.div>
                        </div>
                    </motion.div>
                ) : activeView === 'whatsapp' ? (
                    <motion.div
                        key="whatsapp"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <WhatsAppMatrix />
                    </motion.div>
                ) : activeView === 'campuses' ? (
                    <motion.div
                        key="campuses"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <CampusManager />
                    </motion.div>
                ) : (
                    <motion.div
                        key="security"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="py-20 text-center"
                    >
                        <Shield size={64} className="mx-auto text-slate-100 mb-6" />
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Security Protocol Active</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Initializing neural management link...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
