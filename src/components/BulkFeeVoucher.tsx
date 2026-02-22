import React, { useMemo, useEffect, useState } from 'react';
import { useStore, type Student } from '../context/StoreContext';
import { X, Printer, Layers, Phone, Download, Loader2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import Swal from 'sweetalert2';

interface BulkFeeVoucherProps {
    students: Student[];
    onClose: () => void;
}

const numberToWords = (num: number): string => {
    if (num <= 0) return 'Zero Only';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const makeWords = (n: number): string => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + makeWords(n % 100) : '');
        if (n < 100000) return makeWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + makeWords(n % 1000) : '');
        return '';
    };
    return makeWords(num) + ' Only';
};

const VoucherCopy = React.memo(({
    copyType, student, settings, tuitionFee, absentDays, monthName, year
}: { copyType: string, student: Student, settings: any, tuitionFee: number, absentDays: number, monthName: string, year: number }) => {

    const admission = Number(student.admissionFees || 0);
    const security = Number(student.securityFees || 0);
    const misc = Number(student.miscellaneousCharges || 0);
    const fine = Number(absentDays) * 50;

    const currentBalance = Number(student.feesTotal || 0) - Number(student.feesPaid || 0);
    const currentVoucherTotal = tuitionFee + admission + security + misc + fine;
    const oldBalance = currentBalance > currentVoucherTotal ? (currentBalance - currentVoucherTotal) : 0;
    const grossTotal = tuitionFee + admission + security + misc + fine + oldBalance;
    const amountToPay = Math.max(0, grossTotal - Number(student.feesPaid || 0));

    const issueDate = useMemo(() => new Date(), []);
    const dueDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 10);
        return d;
    }, []);

    const formatDate = (date: Date) => `${date.getDate().toString().padStart(2, '0')}, ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;

    return (
        <div className="bg-white flex-1 pt-5 pb-3 px-2.5 border-r-2 border-dashed last:border-r-0 border-slate-300 relative h-full flex flex-col box-border font-serif" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            {/* Copy Indicator Tab */}
            <div className="absolute top-0 right-4 py-1.5 px-6 bg-brand-primary text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-b-xl shadow-md z-20">
                {copyType}
            </div>

            {/* Header Section */}
            <div className="flex items-center gap-2 border-b-2 border-brand-primary pb-2 mb-3 mt-4">
                <div className="shrink-0 w-12 h-12">
                    {settings.logo1 && <img src={settings.logo1} className="w-full h-full object-contain" alt="L1" crossOrigin="anonymous" loading="eager" />}
                </div>
                <div className="text-center flex-1 min-w-0">
                    <h1 className="text-[19px] font-black uppercase tracking-tighter text-brand-primary leading-none mb-1">{settings.schoolName}</h1>
                    <p className="text-[8.5px] font-black text-slate-800 uppercase leading-none mb-1.5">{settings.subTitle}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                        <div className="bg-brand-primary text-white text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest italic leading-none whitespace-nowrap">
                            FEE FOR: {monthName} {year}
                        </div>
                        <div className="h-[1px] flex-1 bg-slate-200"></div>
                    </div>
                </div>
                <div className="shrink-0 w-12 h-12">
                    {settings.logo2 && <img src={settings.logo2} className="w-full h-full object-contain" alt="L2" crossOrigin="anonymous" loading="eager" />}
                </div>
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-1 mb-3 uppercase font-black text-[10px] border-2 border-brand-primary rounded-sm overflow-hidden">
                {[
                    { label: 'STUDENT NAME', value: student.name },
                    { label: 'STUDENT ID', value: student.id },
                    { label: 'FATHER NAME', value: student.fatherName || 'N/A' },
                    { label: 'CLASS / GRADE', value: student.class },
                    { label: 'ISSUE DATE', value: formatDate(issueDate) },
                    { label: 'DUE DATE', value: formatDate(dueDate) },
                ].map((row, i) => (
                    <div key={i} className="grid grid-cols-12 border-b-2 border-brand-primary last:border-0 h-[26px]">
                        <div className="col-span-5 px-2 bg-slate-50 border-r-2 border-brand-primary flex items-center">
                            <span className="truncate">{row.label}</span>
                        </div>
                        <div className="col-span-7 px-2 text-center font-black text-brand-primary flex items-center justify-center truncate">
                            {row.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Particulars Table */}
            <div className="mb-3 border-2 border-brand-primary rounded-sm overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="grid grid-cols-12 bg-slate-100 border-b-2 border-brand-primary font-black text-[10px] uppercase h-7 shrink-0">
                    <div className="col-span-8 p-1.5 border-r-2 border-brand-primary flex items-center uppercase">Particulars / Details</div>
                    <div className="col-span-4 p-1.5 text-right flex items-center justify-end uppercase">Amount (RS)</div>
                </div>

                <div className="text-[10px] font-black flex-1 overflow-hidden flex flex-col justify-around bg-white">
                    {[
                        { label: 'Admission Fee', val: admission },
                        { label: 'Security Fee', val: security },
                        { label: 'Misc. / Other Charges', val: misc },
                        { label: 'Tuition Fee:', val: tuitionFee },
                        { label: `Absent Fine (${absentDays})`, val: fine },
                        { label: 'Arrears / Old Balance', val: oldBalance },
                    ].map((row, i) => (
                        <div key={i} className="grid grid-cols-12 border-b border-slate-100 last:border-0 grow flex items-center">
                            <div className="col-span-8 px-2 flex items-center h-full">
                                {row.label}
                            </div>
                            <div className="col-span-4 px-2 text-right font-black flex items-center justify-end h-full">
                                {row.val > 0 ? row.val.toLocaleString() : '-'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Arrears Summary Section */}
                <div className="bg-slate-50 border-t-2 border-brand-primary shrink-0">
                    <div className="grid grid-cols-12 font-black text-[10px] border-b border-slate-300">
                        <div className="col-span-8 p-1.5 border-r border-slate-300 uppercase text-slate-500">Gross Total Payable</div>
                        <div className="col-span-4 p-1.5 text-right text-slate-900">{grossTotal.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-12 font-black text-[10px] border-b border-slate-300 bg-emerald-50/50">
                        <div className="col-span-8 p-1.5 border-r border-slate-300 uppercase text-emerald-600">Amount Received / Paid</div>
                        <div className="col-span-4 p-1.5 text-right text-emerald-600">-{Number(student.feesPaid || 0).toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-12 bg-brand-primary text-white font-black text-[13px]">
                        <div className="col-span-8 p-2 border-r border-white/20 uppercase whitespace-nowrap">Net Balance Arrears</div>
                        <div className="col-span-4 p-2 text-right">{amountToPay.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Total in Words */}
            <div className="mb-3 shrink-0">
                <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5 leading-none">TOTAL IN WORDS</p>
                <div className="flex justify-between items-end border-b-2 border-slate-200 pb-1">
                    <p className="text-[11px] font-black italic leading-tight text-brand-primary truncate max-w-[200px]">{numberToWords(amountToPay)}</p>
                </div>
            </div>

            {/* Fine Strip */}
            <div className="bg-brand-primary p-1.5 text-[9px] font-black uppercase text-center text-white tracking-widest mb-2 rounded-md shrink-0 shadow-sm">
                20 RS/DAY FINE AFTER DUE DATE
            </div>

            {/* Footer Section */}
            <div className="mt-auto shrink-0 pb-1">
                <div className="font-urdu text-[11.5px] font-bold leading-tight text-right mb-2" dir="rtl">
                    نوٹ: بغیر فیس چالان کے کوئی فیس جمع نہیں کی جائے گی اور ڈپلیکیٹ چالان چارجز -/50 روپے ہو گا۔
                </div>
                <div className="flex justify-between items-end">
                    <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[8.5px] font-black text-slate-500 uppercase">
                            <Phone className="w-2.5 h-2.5 text-brand-primary" strokeWidth={3} />
                            +92-57-234418 | 0334-5930217 | 0333-2333139
                        </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-center">
                        <div className="w-16 h-6 border-b-2 border-brand-primary mb-0.5"></div>
                        <p className="text-[6px] font-black uppercase tracking-widest text-brand-primary">ACCOUNTANT</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

VoucherCopy.displayName = 'VoucherCopy';

export const BulkFeeVoucher = ({ students, onClose }: BulkFeeVoucherProps) => {
    const { settings, feeStructure, attendance } = useStore();
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        // Prevent body scrolling when studio is open
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const absentMap = useMemo(() => {
        const map: Record<string, number> = {};
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        attendance.forEach(day => {
            const date = new Date(day.date);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                day.records.forEach((r: any) => {
                    if (r.status === 'Absent') map[r.studentId] = (map[r.studentId] || 0) + 1;
                });
            }
        });
        return map;
    }, [attendance]);

    const handlePrint = () => {
        window.print();
    };

    const preloadImages = async () => {
        const images = document.querySelectorAll('.bulk-voucher-page img');
        const promises = Array.from(images).map(img => {
            const imageEl = img as HTMLImageElement;
            if (imageEl.complete) return Promise.resolve();
            return new Promise(resolve => {
                imageEl.onload = resolve;
                imageEl.onerror = resolve;
            });
        });
        await Promise.all(promises);
    };

    const handleDownloadPDF = async () => {
        const pages = document.querySelectorAll('.bulk-voucher-page');
        if (pages.length === 0 || isExporting) return;

        setIsExporting(true);
        Swal.fire({
            title: 'Generating PDF Vouchers',
            html: `Preparing <b>${pages.length}</b> vouchers...<br/><br/><div id="progress-text">0% Complete</div>`,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            await preloadImages();

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const options = {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                cacheBust: true,
                style: {
                    margin: '0',
                    padding: '0'
                }
            };

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i] as HTMLElement;
                const progress = Math.round((i / pages.length) * 100);

                const progressEl = document.getElementById('progress-text');
                if (progressEl) progressEl.innerText = `${progress}% Complete (${i + 1}/${pages.length})`;

                const dataUrl = await htmlToImage.toJpeg(page, { ...options, quality: 0.95 });

                if (i > 0) pdf.addPage();
                pdf.addImage(dataUrl, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
            }

            const fileName = `Vouchers_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

            Swal.fire({
                title: 'Success!',
                text: 'PDF has been downloaded successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('PDF Export Error:', error);
            Swal.fire({
                title: 'Export Failed',
                text: 'There was an error generating the PDF. Try printing to "Save as PDF" instead.',
                icon: 'error'
            });
        } finally {
            setIsExporting(false);
        }
    };

    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthName = monthNames[currentMonth];

    return (
        <div className="bulk-voucher-studio fixed inset-0 z-[1000] bg-[#020617] flex flex-col font-serif print:relative print:z-0 print:bg-white print:block print:inset-auto">
            {/* TOOLBAR */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-md print:hidden shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary rounded-[var(--brand-radius,1rem)] flex items-center justify-center text-brand-accent shadow-2xl border border-white/10">
                        <Layers className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Bulk Voucher Studio</h2>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Found {students.length} Accounts • Ready to Print
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isExporting}
                        className={`px-8 py-4 bg-brand-primary text-white rounded-[var(--brand-radius,1rem)] font-black text-[12px] uppercase tracking-widest flex items-center gap-3 transform transition-all active:scale-95 shadow-2xl shadow-brand-primary/20 group ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                    >
                        {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />}
                        {isExporting ? 'Generating PDF...' : 'Final Print All (PDF)'}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-8 py-4 bg-white text-brand-primary border-2 border-brand-primary rounded-[var(--brand-radius,1rem)] font-black text-[12px] uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transform transition-all active:scale-95 group"
                    >
                        <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" /> Browser Print
                    </button>
                    <button onClick={onClose} className="p-4 bg-white/5 text-white hover:bg-rose-500/20 hover:text-rose-500 rounded-[var(--brand-radius,1rem)] transition-all border border-white/10">
                        <X className="w-7 h-7" />
                    </button>
                </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="flex-1 overflow-y-auto p-16 bg-slate-950/50 print:bg-white print:p-0 print:overflow-visible print:block custom-scrollbar">
                <div className="flex flex-col gap-16 items-center print:gap-0 print:block">
                    {students.map((student) => {
                        const tuition = Number(student.monthlyFees) || Number(student.monthlyTuition) || Number(feeStructure[student.class]) || Number(feeStructure['General']) || 4000;
                        const studentAbsents = absentMap[student.id] || 0;

                        return (
                            <div key={student.id} className="bulk-voucher-page bg-white w-full max-w-[297mm] h-[210mm] shadow-[0_40px_100px_rgba(0,0,0,0.5)] print:shadow-none print:m-0 flex flex-row overflow-hidden rounded-[var(--brand-radius,1.5rem)] print:rounded-none transition-transform hover:scale-[1.01] print:hover:scale-100">
                                <VoucherCopy copyType="STUDENT COPY" student={student} settings={settings} tuitionFee={tuition} absentDays={studentAbsents} monthName={currentMonthName} year={currentYear} />
                                <VoucherCopy copyType="SCHOOL COPY" student={student} settings={settings} tuitionFee={tuition} absentDays={studentAbsents} monthName={currentMonthName} year={currentYear} />
                                <VoucherCopy copyType="BANK COPY" student={student} settings={settings} tuitionFee={tuition} absentDays={studentAbsents} monthName={currentMonthName} year={currentYear} />
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @media print {
                    @page { size: A4 landscape; margin: 0 !important; }
                    body > *:not(.bulk-voucher-studio) { display: none !important; }
                    body, html { height: auto !important; overflow: visible !important; background: white !important; margin: 0 !important; padding: 0 !important; }
                    .bulk-voucher-studio { position: static !important; display: block !important; background: white !important; width: 100% !important; height: auto !important; padding: 0 !important; margin: 0 !important; }
                    .bulk-voucher-page { 
                        display: flex !important; 
                        flex-direction: row !important; 
                        width: 297mm !important; 
                        height: 210mm !important; 
                        page-break-after: always !important; 
                        page-break-inside: avoid !important; 
                        break-after: page !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        border: none !important; 
                        box-shadow: none !important; 
                    }
                    .bulk-voucher-page:last-child { page-break-after: auto !important; }
                    .print-hidden, button { display: none !important; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); background-clip: content-box; }
            `}</style>
        </div>
    );
};
