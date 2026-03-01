import { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { Student } from '../context/StoreContext';
import { useStore } from '../context/StoreContext';
import { X, Phone, Mail, MapPin, ImageIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Swal from 'sweetalert2';

interface IDCardGeneratorProps {
    student: Student;
    onClose: () => void;
}

export const IDCardGenerator = ({ student, onClose }: IDCardGeneratorProps) => {
    const { settings } = useStore();
    const [isExporting, setIsExporting] = useState(false);
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);
    const [flash, setFlash] = useState(false);

    const preloadImages = async () => {
        const images = document.querySelectorAll('.id-card-side img');
        const promises = Array.from(images).map(el => {
            const img = el as HTMLImageElement;
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        });
        await Promise.all(promises);
    };

    const exportHighQualImage = async (side: 'front' | 'back') => {
        const targetRef = side === 'front' ? frontRef : backRef;
        if (!targetRef.current || isExporting) return;

        setIsExporting(true);
        setFlash(true);
        setTimeout(() => setFlash(false), 300);

        try {
            await preloadImages();
            const options = {
                pixelRatio: 5,
                backgroundColor: undefined,
                cacheBust: true,
                style: { background: side === 'front' ? '#003366' : '#ffffff' }
            };

            const dataUrl = await htmlToImage.toPng(targetRef.current, options);
            const link = document.createElement('a');
            link.download = `${student.name.replace(/\s+/g, '_')}_ID_${side.toUpperCase()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            Swal.fire({ title: 'Export Failed', icon: 'error' });
        } finally { setIsExporting(false); }
    };

    const exportPDF = async () => {
        if (!frontRef.current || !backRef.current || isExporting) return;
        setIsExporting(true);
        Swal.fire({ title: 'Generating PDF...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            await preloadImages();
            const options = { pixelRatio: 3, backgroundColor: undefined };
            const frontData = await htmlToImage.toPng(frontRef.current, options);
            const backData = await htmlToImage.toPng(backRef.current, options);

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            pdf.addImage(frontData, 'PNG', 45, 20, 54, 86);
            pdf.addImage(backData, 'PNG', 110, 20, 54, 86);
            pdf.save(`${student.name.replace(/\s+/g, '_')}_ID_Card.pdf`);
            Swal.fire({ title: 'Success!', icon: 'success', timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ title: 'PDF Error', icon: 'error' });
        } finally { setIsExporting(false); }
    };

    const parentPrefix = student.gender?.toLowerCase() === 'female' ? 'D/O' : 'S/O';
    const currentSession = "2026-27";

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-3xl overflow-y-auto font-serif">
            {flash && <div className="fixed inset-0 z-[300] bg-white animate-flash pointer-events-none" />}

            <div className="relative w-full max-w-5xl bg-white rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden mx-auto">
                <div className="p-3 md:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-[#003366] rounded-lg md:rounded-xl flex items-center justify-center text-yellow-500 font-black text-xs md:text-base">PSS</div>
                        <h2 className="text-lg md:text-xl font-black text-[#003366]">IDENTITY STUDIO</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={exportPDF} disabled={isExporting} className="px-3 md:px-6 py-2 bg-[#003366] text-white rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">PDF</button>
                        <button onClick={() => exportHighQualImage('front')} className="p-2 hover:bg-slate-100 rounded-lg group" title="Front"><ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-[#003366]" /></button>
                        <button onClick={() => exportHighQualImage('back')} className="p-2 hover:bg-slate-100 rounded-lg group" title="Back"><ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-[#003366]" /></button>
                        <button onClick={onClose} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
                    </div>
                </div>

                <div className="p-4 md:p-8 flex flex-col items-center gap-6 md:gap-12 bg-slate-50">
                    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 justify-center items-center py-6 px-4 md:py-10 md:px-10 bg-white rounded-2xl md:rounded-[3rem] shadow-xl border border-slate-100 w-full md:w-auto">

                        {/* FRONT SIDE */}
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FRONT VIEW</span>
                            <div
                                ref={frontRef}
                                className="id-card-side w-[54mm] h-[86mm] rounded-[5mm] relative overflow-hidden flex flex-col shadow-2xl border-[0.5pt] border-[#003366]"
                                style={{ backgroundColor: '#003366' }}
                            >
                                <div className="h-[20mm] bg-white shrink-0 flex items-center justify-between px-3 relative z-10 border-b-[2.5pt] border-yellow-400 rounded-b-[4mm] shadow-lg">
                                    <div className="w-[10mm] h-[10mm] flex items-center justify-center">
                                        {settings?.logo1 && <img src={settings.logo1} className="w-full h-full object-contain" alt="L1" crossOrigin="anonymous" />}
                                    </div>
                                    <div className="text-center flex-1 mx-1">
                                        <h1 className="text-[12.5pt] font-black text-[#003366] uppercase tracking-tighter leading-[1] font-serif" style={{ letterSpacing: '-0.3px' }}>
                                            PIONEER'S<br />SUPERIOR
                                        </h1>
                                        <div className="mt-0.5 h-[0.5pt] w-8 bg-[#003366]/20 mx-auto"></div>
                                    </div>
                                    <div className="w-[10mm] h-[10mm] flex items-center justify-center">
                                        {settings?.logo2 && <img src={settings.logo2} className="w-full h-full object-contain" alt="L2" crossOrigin="anonymous" />}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col items-center px-5 relative z-10 -mt-2.5">
                                    <div className="relative mb-0.5 shrink-0">
                                        <div className="w-[28mm] h-[28mm] bg-white rounded-full border-[1mm] border-yellow-500 shadow-xl overflow-hidden p-0.5">
                                            <div className="w-full h-full rounded-full overflow-hidden border border-[#003366]/5 shadow-inner">
                                                {student.avatar && student.avatar.length > 5 ? (
                                                    <img src={student.avatar} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#003366] bg-slate-50 font-black text-4xl">{student.name.charAt(0)}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-[#003366] border border-yellow-400 px-2 py-0.5 rounded-md shadow-lg">
                                            <p className="text-[5.5pt] font-black text-yellow-400 tracking-tighter whitespace-nowrap">{currentSession}</p>
                                        </div>
                                    </div>

                                    <div className="text-center w-full mb-0.5 mt-2">
                                        <h2 className="text-[12pt] font-black text-white uppercase leading-none tracking-tight">{student.name}</h2>
                                        <div className="mt-1.2 inline-block px-4 py-0.5 bg-yellow-400 text-[#003366] rounded-full">
                                            <p className="text-[5pt] font-black uppercase tracking-widest leading-none">STUDENT IDENTITY</p>
                                        </div>
                                    </div>

                                    <div className="mt-1 w-full space-y-2 pt-1.5 border-t border-white/10">
                                        <div className="flex justify-between items-center text-white text-[10pt] font-bold">
                                            <span className="text-[7pt] font-black text-yellow-500 uppercase tracking-widest">REG NO:</span>
                                            <span>{student.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-white text-[10pt] font-bold">
                                            <span className="text-[7pt] font-black text-yellow-500 uppercase tracking-widest">{parentPrefix}:</span>
                                            <span className="uppercase truncate ml-2 flex-1 text-right">{student.fatherName || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-white text-[10pt] font-bold">
                                            <span className="text-[7pt] font-black text-yellow-500 uppercase tracking-widest">CLASS:</span>
                                            <span className="uppercase">{student.class?.replace(/class/i, '').trim() || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto h-2 bg-yellow-400 w-full relative z-10 shrink-0 rounded-t-[3mm]"></div>
                            </div>
                        </div>

                        {/* BACK SIDE - REVERTED TO WHITE BACKGROUND */}
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BACK VIEW</span>
                            <div
                                ref={backRef}
                                className="id-card-side w-[54mm] h-[86mm] bg-white rounded-[5mm] relative overflow-hidden flex flex-col shadow-2xl border-[0.5pt] border-slate-200"
                                style={{ backgroundColor: '#ffffff' }}
                            >
                                {/* TOP BLOCK - SHIFTED UP */}
                                <div className="h-[10mm] bg-white shrink-0 flex items-center justify-center px-4 relative z-10 border-b-[2pt] border-yellow-400 rounded-b-[4mm] shadow-sm">
                                    <div className="bg-[#003366] h-6 w-full rounded-[2.5mm] flex items-center justify-center shadow-inner">
                                        <span className="text-[6.5pt] font-black text-white uppercase tracking-wider">Institutional Property</span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col px-4 pt-1 pb-1 relative z-10 overflow-hidden">
                                    {/* SCHOOL NAME - SHIFTED UP */}
                                    <div className="text-center mb-1 overflow-hidden">
                                        <h1 className="text-[12pt] font-black text-[#dc2626] leading-none uppercase tracking-tighter mb-1 font-serif whitespace-nowrap" style={{ fontWeight: 900 }}>
                                            PIONEER'S SUPERIOR
                                        </h1>
                                        <p className="text-[6.8pt] font-black text-[#003366] uppercase leading-tight tracking-wide">Institute Of High Schooling<br />& Colleges, Attock</p>
                                    </div>

                                    {/* CONTACTS - BOXED ON WHITE */}
                                    <div className="pt-1">
                                        <div className="space-y-2.5 bg-slate-50/50 p-2.5 rounded-[3mm] border border-slate-100 shadow-sm mt-1">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-6 h-6 rounded-md bg-[#003366] flex items-center justify-center shrink-0 shadow-sm border border-yellow-400/20">
                                                    <Phone className="w-3 h-3 text-yellow-400" />
                                                </div>
                                                <p className="text-[6.8pt] font-bold text-slate-800 leading-tight">+92-57-234418, 0334-5930217</p>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-6 h-6 rounded-md bg-[#003366] flex items-center justify-center shrink-0 shadow-sm border border-yellow-400/20">
                                                    <Mail className="w-3 h-3 text-yellow-400" />
                                                </div>
                                                <p className="text-[6.8pt] font-bold text-slate-800 leading-tight lowercase">psscc.official@gmail.com</p>
                                            </div>
                                            <div className="flex items-start gap-2.5">
                                                <div className="w-6 h-6 rounded-md bg-[#003366] flex items-center justify-center shrink-0 shadow-sm border border-yellow-400/20">
                                                    <MapPin className="w-3 h-3 text-yellow-400" />
                                                </div>
                                                <p className="text-[6.2pt] font-bold text-slate-800 uppercase leading-snug tracking-tight">Moh Muhammad Nagar Mirza Road, Attock</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR & SIGNATURE */}
                                    <div className="mt-auto h-[22mm] flex items-center justify-between border-t border-slate-100 pt-2 pb-1 px-1">
                                        <div className="flex flex-col items-center">
                                            <div className="p-1 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 shadow-md" style={{ width: '46px', height: '46px' }}>
                                                <QRCodeSVG value={student.id || "ID-001"} size={38} level="M" includeMargin={false} />
                                            </div>
                                            <p className="text-[4.8pt] font-black text-slate-400 mt-1 uppercase tracking-widest leading-none">Security ID</p>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="h-6 mb-1 opacity-20"><span className="text-[11pt] font-serif underline">Signature</span></div>
                                            <div className="h-[1.2pt] w-20 bg-[#003366]/30"></div>
                                            <p className="text-[6.5pt] font-black text-[#003366] uppercase mt-1">Principal</p>
                                        </div>
                                    </div>
                                </div>

                                {/* BOTTOM STRIP */}
                                <div className="h-6 w-full bg-[#003366] flex items-center justify-center shrink-0 border-t-[2pt] border-yellow-400 rounded-t-[4mm]">
                                    <p className="text-[5.8pt] font-black text-yellow-400 uppercase tracking-[0.3em]">Knowledge Is Success</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .id-card-side { font-family: 'Crimson Pro', serif !important; font-style: normal !important; -webkit-print-color-adjust: exact; }
                .id-card-side * { font-family: 'Crimson Pro', serif !important; font-style: normal !important; }
            `}</style>
        </div>
    );
};
