import { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface BlankAdmissionFormProps {
    onClose: () => void;
}

export const BlankAdmissionForm = ({ onClose }: BlankAdmissionFormProps) => {
    const { settings } = useStore();
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Admission Form - ${settings.schoolName}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @media print {
                            @page { size: A4; margin: 0; }
                            body { margin: 0 !important; -webkit-print-color-adjust: exact; }
                        }
                        body {
                            font-family: 'Outfit', sans-serif;
                            background: white;
                        }
                        .serif-header { font-family: 'Playfair Display', serif; }
                        .page-container {
                            width: 210mm;
                            height: 297mm;
                            margin: 0 auto;
                            padding: 12mm;
                            box-sizing: border-box;
                            position: relative;
                            display: flex;
                            flex-direction: column;
                            background: white;
                            overflow: hidden;
                        }
                        .glass-field {
                            background: #ffffff;
                            border: 1.5px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 8px 12px;
                            height: 52px;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                        }
                        .field-label {
                            font-size: 8px;
                            font-weight: 800;
                            color: #64748b;
                            text-transform: uppercase;
                            letter-spacing: 0.1em;
                            margin-bottom: 2px;
                        }
                        .field-value {
                            font-size: 14px;
                            font-weight: 700;
                            color: #1e293b;
                            line-height: 1;
                        }
                        .watermark {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%) rotate(-30deg);
                            font-size: 120px;
                            font-weight: 900;
                            color: rgba(0, 0, 0, 0.02);
                            white-space: nowrap;
                            pointer-events: none;
                            z-index: 0;
                            text-transform: uppercase;
                            letter-spacing: 0.2em;
                        }
                        .section-title {
                            border-left: 4px solid #830000;
                            padding-left: 10px;
                            font-weight: 900;
                            font-size: 12px;
                            color: #1e293b;
                            text-transform: uppercase;
                            letter-spacing: 0.1em;
                            margin: 15px 0 10px 0;
                        }
                        .char-box {
                            width: 22px;
                            height: 22px;
                            border: 1px solid #e2e8f0;
                            border-right: none;
                            background: white;
                        }
                        .char-box:last-child { border-right: 1px solid #e2e8f0; }
                    </style>
                </head>
                <body>
                    <div class="page-container">
                        ${content.innerHTML}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.onafterprint = () => printWindow.close();
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="relative w-full max-w-[1000px] h-[95vh] flex flex-col bg-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                {/* Modern Control Panel */}
                <div className="p-4 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-xl">
                            <Printer className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm tracking-tight">Print Admission Form</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Modern Integrated Layout</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            <Printer size={14} /> Print Now
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-700/50 p-6 flex justify-center custom-scrollbar">
                    {/* A4 Container */}
                    <div
                        ref={printRef}
                        className="w-[210mm] min-h-[297mm] h-[297mm] bg-white p-[12mm] text-slate-800 overflow-hidden relative flex flex-col shadow-2xl"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        {/* Watermark */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[35deg] text-[100px] font-black text-slate-900/[0.02] whitespace-nowrap pointer-events-none select-none uppercase tracking-[0.2em] z-0">
                            {settings.schoolName || "OFFICIAL"}
                        </div>

                        {/* Header Inspired by Uploaded Image */}
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div className="w-[90px] h-[90px] shrink-0">
                                {settings.logo1 ? (
                                    <img src={settings.logo1} className="w-full h-full object-contain" alt="Logo" />
                                ) : (
                                    <div className="w-full h-full border-2 border-slate-200 rounded-full bg-slate-50 flex items-center justify-center font-bold text-[10px]">LOGO</div>
                                )}
                            </div>

                            <div className="flex-1 text-center px-4">
                                <h1 className="text-[44px] font-black text-slate-900 leading-none tracking-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    {settings.schoolName || "PIONEER'S SUPERIOR"}
                                </h1>
                                <h2 className="text-[12px] font-black text-[#d97706] uppercase tracking-[0.3em] mb-1">
                                    {settings.subTitle || "INSTITUTE OF HIGHER SECONDARY EDUCATION, ATTOCK"}
                                </h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    Established Since 1984 • Registered & Recognized Institution
                                </p>
                            </div>

                            <div className="w-[90px] h-[90px] shrink-0">
                                {settings.logo2 ? (
                                    <img src={settings.logo2} className="w-full h-full object-contain" alt="Logo" />
                                ) : (
                                    <div className="w-full h-full border-2 border-slate-200 rounded-full bg-slate-50 flex items-center justify-center font-bold text-[10px]">LOGO</div>
                                )}
                            </div>
                        </div>

                        {/* Top Info Blocks */}
                        <div className="grid grid-cols-4 gap-3 mb-6 relative z-10">
                            {[
                                { label: 'Form Number', value: 'PF-2024-XXXX' },
                                { label: 'Admission No', value: '' },
                                { label: 'Admission Date', value: new Date().toLocaleDateString() },
                                { label: 'Class Applied', value: '' },
                                { label: 'Discipline', value: '' },
                                { label: 'Shift/Group', value: '' },
                                { label: 'Session', value: '2023-2024' },
                                { label: 'Status', value: 'New Admission' }
                            ].map((item, i) => (
                                <div key={i} className="bg-white border-[1.5px] border-slate-100 rounded-xl p-3 h-14 flex flex-col justify-center shadow-sm">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</span>
                                    <span className="text-sm font-extrabold text-slate-800">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Main Form Content */}
                        <div className="flex-1 space-y-4 relative z-10">
                            {/* Personal Information */}
                            <div>
                                <h3 className="border-l-4 border-[#830000] pl-3 py-0.5 text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3 bg-slate-50">1. Student Profile</h3>
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-9 space-y-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Student's Full Name (Block Letters)</p>
                                            <div className="flex">
                                                {Array.from({ length: 28 }).map((_, i) => (
                                                    <div key={i} className="flex-1 h-7 border border-slate-100 bg-white first:rounded-l-lg last:rounded-r-lg shadow-sm"></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Father's Full Name (Block Letters)</p>
                                            <div className="flex">
                                                {Array.from({ length: 28 }).map((_, i) => (
                                                    <div key={i} className="flex-1 h-7 border border-slate-100 bg-white first:rounded-l-lg last:rounded-r-lg shadow-sm"></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Father's Occupation</p>
                                                <div className="h-5 border-b border-slate-200"></div>
                                            </div>
                                            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Monthly Income (PKR)</p>
                                                <div className="h-5 border-b border-slate-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex items-center justify-center">
                                        <div className="w-[120px] h-[140px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-4 bg-slate-50/30">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                                <X className="w-4 h-4 text-slate-300" />
                                            </div>
                                            <p className="text-[9px] font-black text-slate-300 uppercase leading-tight">Attach Photograph</p>
                                            <p className="text-[7px] font-bold text-slate-200 mt-1 uppercase">Blue Background</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Supplementary Info */}
                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-4">
                                    <h3 className="border-l-4 border-slate-300 pl-3 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/30">Contact Details</h3>
                                    <div className="space-y-4">
                                        <div className="bg-white border-b border-slate-100 pb-2">
                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Student Contact Number</p>
                                            <div className="h-5"></div>
                                        </div>
                                        <div className="bg-white border-b border-slate-100 pb-2">
                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Father / Guardian Number</p>
                                            <div className="h-5"></div>
                                        </div>
                                        <div className="bg-white border-b border-slate-100 pb-2">
                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Permanent Residential Address</p>
                                            <div className="h-5"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="border-l-4 border-slate-300 pl-3 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/30">System Identification</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Date of Birth</p>
                                            <div className="flex gap-1">
                                                {['D', 'D', '/', 'M', 'M', '/', 'Y', 'Y', 'Y', 'Y'].map((c, i) => (
                                                    <div key={i} className={`flex-1 h-7 border border-slate-100 rounded-md bg-white flex items-center justify-center text-[9px] font-black ${c === '/' ? 'bg-slate-50 border-none' : ''}`}>
                                                        {c === '/' ? '/' : ''}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">CNIC / Bay-Form Number</p>
                                            <div className="flex gap-1">
                                                {Array.from({ length: 15 }).map((_, i) => (
                                                    <div key={i} className={`flex-1 h-7 border border-slate-100 bg-white rounded-md flex items-center justify-center text-[10px] font-black ${[5, 13].includes(i) ? 'bg-slate-50 border-none !w-6' : ''}`}>
                                                        {[5, 13].includes(i) ? '-' : ''}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Gender:</p>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 border-2 border-slate-200 rounded-lg"></div> <span className="text-[10px] font-black text-slate-600">Male</span></div>
                                                <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 border-2 border-slate-200 rounded-lg"></div> <span className="text-[10px] font-black text-slate-600">Female</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic History */}
                            <div className="pt-2">
                                <h3 className="border-l-4 border-[#830000] pl-3 py-0.5 text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3 bg-slate-50">2. Academic Record</h3>
                                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-center border-collapse">
                                        <thead className="bg-[#f8fafc] text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            <tr>
                                                <th className="py-2.5 px-4 text-left border-r border-slate-100">Examination</th>
                                                <th className="py-2.5 px-4 border-r border-slate-100">Board / Uni</th>
                                                <th className="py-2.5 px-4 border-r border-slate-100">Roll No</th>
                                                <th className="py-2.5 px-4 border-r border-slate-100">Obt Marks</th>
                                                <th className="py-2.5 px-4 border-r border-slate-100">Total</th>
                                                <th className="py-2.5 px-4">Year</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[11px] font-bold text-slate-700">
                                            {['Matriculation (SSC)', 'Intermediate (HSSC)'].map((row, i) => (
                                                <tr key={i} className="border-t border-slate-100 h-8">
                                                    <td className="px-4 text-left border-r border-slate-100 text-slate-400">{row}</td>
                                                    <td className="border-r border-slate-100"></td>
                                                    <td className="border-r border-slate-100"></td>
                                                    <td className="border-r border-slate-100"></td>
                                                    <td className="border-r border-slate-100"></td>
                                                    <td></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer Signatures Inspired by Uploaded Image */}
                        <div className="mt-auto pt-8 border-t border-slate-100">
                            <div className="grid grid-cols-3 gap-8 mb-4">
                                <div className="text-center space-y-2">
                                    <div className="h-[0.5px] bg-slate-300 mx-8"></div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Candidate Signature</p>
                                </div>
                                <div className="text-center space-y-2">
                                    <div className="h-[0.5px] bg-slate-300 mx-8"></div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Guardian Signature</p>
                                </div>
                                <div className="text-center space-y-2">
                                    <div className="h-[0.5px] bg-slate-300 mx-8"></div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Principal / HOD</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[7px] font-black text-slate-300 uppercase tracking-[0.4em] pt-4">
                                <span>Official Admission Document</span>
                                <span>{settings.schoolName || "PIONEER'S SUPERIOR"}</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
