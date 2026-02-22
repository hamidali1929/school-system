import { useRef, useState } from 'react';
import { X, Mail, Phone, MapPin, Calendar, CreditCard, GraduationCap, Briefcase, User, Shield, Download, FileText, CheckCircle2 } from 'lucide-react';
import type { Teacher } from '../context/StoreContext';
import { useStore } from '../context/StoreContext';
import { cn } from '../utils/cn';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import Swal from 'sweetalert2';

interface FacultyProfileModalProps {
    teacher: Teacher;
    onClose: () => void;
}

export const FacultyProfileModal = ({ teacher, onClose }: FacultyProfileModalProps) => {
    const { settings } = useStore();
    const [isExporting, setIsExporting] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const exportPDF = async () => {
        if (!profileRef.current || isExporting) return;
        setIsExporting(true);
        Swal.fire({ title: 'Preparing Document...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            const options = {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                style: { transform: 'scale(1)', transformOrigin: 'top left' }
            };

            const dataUrl = await htmlToImage.toPng(profileRef.current, options);
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${teacher.name.replace(/\s+/g, '_')}_Official_Profile.pdf`);

            Swal.fire({ title: 'Success!', text: 'Profile exported successfully.', icon: 'success', timer: 1500, showConfirmButton: false });
        } catch (error) {
            console.error('Export error:', error);
            Swal.fire({ title: 'Export Failed', text: 'Could not generate PDF profile.', icon: 'error' });
        } finally {
            setIsExporting(false);
        }
    };

    const DetailItem = ({ icon: Icon, label, value, color = "blue" }: any) => (
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                color === "blue" ? "bg-blue-500/10 text-blue-600" :
                    color === "emerald" ? "bg-emerald-500/10 text-emerald-600" :
                        color === "amber" ? "bg-amber-500/10 text-amber-600" :
                            "bg-slate-500/10 text-slate-600"
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{label}</p>
                <p className="text-[11px] font-bold text-slate-700 uppercase break-words leading-tight">{value || 'Not Recorded'}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">

                {/* Header Controls */}
                <div className="sticky top-0 z-20 px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white p-2">
                            {settings.logo1 ? <img src={settings.logo1} className="w-full h-full object-contain" /> : <Shield className="w-6 h-6 text-brand-accent" />}
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-brand-primary uppercase tracking-tight">Institutional Faculty Record</h2>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{teacher.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportPDF}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-brand-accent rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            {isExporting ? 'Processing...' : 'Export PDF'}
                        </button>
                        <button onClick={onClose} className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"><X className="w-6 h-6" /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-50/50">
                    <div ref={profileRef} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10 space-y-12">

                        {/* Profile Hero Section */}
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="relative shrink-0">
                                <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-tr from-brand-primary to-blue-600 p-1.5 shadow-2xl overflow-hidden rotate-3">
                                    <div className="w-full h-full rounded-[2.8rem] bg-white p-1 overflow-hidden">
                                        {teacher.avatar && teacher.avatar.length > 5 ? (
                                            <img src={teacher.avatar} className="w-full h-full object-cover rounded-[2.5rem]" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-brand-primary text-6xl font-black bg-slate-50">
                                                {teacher.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={cn(
                                    "absolute -bottom-2 -right-2 px-4 py-1.5 rounded-full border-4 border-white shadow-xl flex items-center gap-2",
                                    teacher.status === 'Active' ? "bg-emerald-500" : "bg-amber-500"
                                )}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">{teacher.status}</span>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/5 rounded-full border border-brand-primary/10">
                                    <Shield className="w-3 h-3 text-brand-primary" />
                                    <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.2em]">Verified Personnel Record</span>
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{teacher.name}</h1>
                                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                                    <span className="px-5 py-2 bg-slate-900 text-brand-accent rounded-xl text-[10px] font-black uppercase tracking-widest">{teacher.subject || 'Staff'}</span>
                                    <span className="px-5 py-2 bg-brand-accent text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-primary/10">{teacher.campus}</span>
                                </div>
                            </div>
                        </div>

                        {/* Grid Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Personal Details */}
                            <div className="lg:col-span-3">
                                <h3 className="text-xs font-black uppercase text-slate-300 tracking-[0.3em] mb-4 border-b border-slate-100 pb-2">Personnel Particulars</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <DetailItem icon={User} label="Father / Guardian" value={teacher.fatherName} color="blue" />
                                    <DetailItem icon={CreditCard} label="CNIC Number" value={teacher.cnic} color="emerald" />
                                    <DetailItem icon={Calendar} label="Birth Date" value={teacher.dob} color="amber" />
                                    <DetailItem icon={Briefcase} label="Employment Type" value={teacher.employmentType || "Full-Time"} color="blue" />
                                    <DetailItem icon={User} label="Gender" value={teacher.gender} color="emerald" />
                                    <DetailItem icon={Shield} label="Marital Status" value={teacher.maritalStatus} color="amber" />
                                </div>
                            </div>

                            {/* Contact & Communication */}
                            <div className="lg:col-span-3">
                                <h3 className="text-xs font-black uppercase text-slate-300 tracking-[0.3em] mb-4 border-b border-slate-100 pb-2">Communications Hub</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <DetailItem icon={Phone} label="Primary Contact" value={teacher.phone} color="blue" />
                                    <DetailItem icon={Phone} label="WhatsApp Identity" value={teacher.whatsappNumber} color="emerald" />
                                    <DetailItem icon={Mail} label="Academic Email" value={teacher.email} color="amber" />
                                    <DetailItem icon={MapPin} label="Residential Address" value={teacher.address} color="blue" />
                                </div>
                            </div>

                            {/* Professional & Academic */}
                            <div className="lg:col-span-3">
                                <h3 className="text-xs font-black uppercase text-slate-300 tracking-[0.3em] mb-4 border-b border-slate-100 pb-2">Professional Experience</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <DetailItem icon={GraduationCap} label="Educational Degree" value={teacher.qualification} color="emerald" />
                                    <DetailItem icon={Briefcase} label="Field Experience" value={teacher.experience} color="blue" />
                                    <DetailItem icon={Calendar} label="Date of Joining" value={teacher.joiningDate} color="amber" />
                                    <DetailItem icon={Briefcase} label="Assigned Classes" value={teacher.classes?.join(', ')} color="blue" />
                                    <DetailItem icon={FileText} label="Salary Bracket" value={teacher.baseSalary ? `PKR ${teacher.baseSalary.toLocaleString()}` : "Not Set"} color="emerald" />
                                </div>
                            </div>

                            {/* System Privileges */}
                            <div className="lg:col-span-3">
                                <h3 className="text-xs font-black uppercase text-slate-300 tracking-[0.3em] mb-4 border-b border-slate-100 pb-2">System Credentials</h3>
                                <div className="flex flex-wrap gap-3">
                                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white min-w-[280px]">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Shield className="w-5 h-5 text-brand-accent" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Portal Authentication</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[7px] font-black uppercase text-white/40 tracking-widest mb-1">Electronic ID (Username)</p>
                                                <p className="text-sm font-mono font-black text-brand-accent tracking-widest">{teacher.username || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[7px] font-black uppercase text-white/40 tracking-widest mb-1">Access Key (Password)</p>
                                                <p className="text-sm font-mono font-black text-brand-accent tracking-[0.4em]">{teacher.password || '••••'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-white border border-slate-200 rounded-[2rem] p-6">
                                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Granted Privileges</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {teacher.permissions && teacher.permissions.length > 0 ? teacher.permissions.map(p => (
                                                <span key={p} className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                    {p.replace(/_/g, ' ')}
                                                </span>
                                            )) : (
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">No special privileges assigned.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Document Inventory */}
                        {teacher.documents && Object.keys(teacher.documents).length > 0 && (
                            <div className="lg:col-span-3">
                                <h3 className="text-xs font-black uppercase text-slate-300 tracking-[0.3em] mb-4 border-b border-slate-100 pb-2">Attachment Inventory</h3>
                                <div className="flex flex-wrap gap-4">
                                    {Object.keys(teacher.documents).map(doc => (
                                        <div key={doc} className="flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-brand-primary transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-700 tracking-tight">{doc}</p>
                                                <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Digital Attachment Active</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer Branding */}
                        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center p-2">
                                    {settings.logo1 && <img src={settings.logo1} className="w-full h-full object-contain" />}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">PIONEER'S SUPERIOR</h4>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Official Human Resource Portal • 2026</p>
                                </div>
                            </div>
                            <div className="text-[7px] font-black text-slate-400 uppercase tracking-[.4em] text-center md:text-right">
                                Integrity • Excellence • Education
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
