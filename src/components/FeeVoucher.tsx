import React, { useState, useEffect } from 'react';
import { useStore, type Student } from '../context/StoreContext';
import { Phone, Edit2, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

interface FeeVoucherProps {
    student: Student;
    onClose: () => void;
    readOnly?: boolean;
}

const numberToWords = (num: number): string => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const makeWords = (n: number): string => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + makeWords(n % 100) : '');
        if (n < 100000) return makeWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + makeWords(n % 1000) : '');
        return '';
    };

    return makeWords(num) + ' Only';
};

const VoucherCopy = ({
    copyType, student, settings, totalAmount, absentDays,
    tuitionFee, absentFine, finalArrear, admissionFee, securityFee, miscCharges, monthName, year
}: any) => {
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 10);

    const formatDate = (date: Date) =>
        `${date.getDate().toString().padStart(2, '0')}, ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;

    return (
        <div className="bg-white flex-1 pt-5 pb-3 px-2.5 border-r-2 border-dashed last:border-r-0 border-slate-300 relative print:pt-3 print:pb-2 print:px-2 print:border-slate-400 h-full flex flex-col box-border" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <div className="absolute top-0 right-4 py-1.5 px-4 bg-brand-primary text-white text-[7px] font-black uppercase tracking-[0.2em] rounded-b-xl shadow-md z-20 print:translate-y-0">
                {copyType}
            </div>

            <div className="flex items-center gap-2 border-b-2 border-brand-primary pb-2 mb-3 mt-4">
                <div className="shrink-0 w-12 h-12">
                    {settings.logo1 ? (
                        <img src={settings.logo1} className="w-full h-full object-contain" alt="Logo 1" />
                    ) : (
                        <div className="w-full h-full bg-brand-primary rounded-xl shadow-sm"></div>
                    )}
                </div>
                <div className="text-center flex-1 min-w-0">
                    <h1 className="text-[18px] font-black uppercase tracking-tighter text-brand-primary leading-none mb-1 truncate">{settings.schoolName}</h1>
                    <p className="text-[8px] font-black text-slate-800 uppercase tracking-tighter leading-none truncate mb-1">{settings.subTitle}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                        <p className="text-[8px] font-black text-white bg-brand-primary px-3 py-1 rounded-full uppercase tracking-widest shrink-0 italic">Fee for: {monthName} {year}</p>
                        <div className="h-[1px] flex-1 bg-slate-200"></div>
                    </div>
                </div>
                <div className="shrink-0 w-12 h-12">
                    {settings.logo2 ? (
                        <img src={settings.logo2} className="w-full h-full object-contain" alt="Logo 2" />
                    ) : (
                        <div className="w-full h-full border-2 border-dashed border-brand-primary/20 rounded-xl flex items-center justify-center">
                            <span className="text-[6px] text-slate-300 uppercase">Logo 2</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 mb-3 uppercase font-black text-[10px] border-2 border-brand-primary rounded-sm overflow-hidden">
                {[
                    { label: 'Student Name', value: student.name },
                    { label: 'Student ID', value: student.id },
                    { label: 'Father Name', value: student.fatherName || 'N/A' },
                    { label: 'Class / Grade', value: student.class },
                    { label: 'Issue Date', value: formatDate(issueDate) },
                    { label: 'Due Date', value: formatDate(dueDate) },
                ].map((row, i) => (
                    <div key={i} className="grid grid-cols-12 border-b-2 border-brand-primary last:border-0">
                        <div className="col-span-5 p-1 bg-slate-50 border-r-2 border-brand-primary flex items-center">{row.label}</div>
                        <div className="col-span-7 p-1.5 text-center font-black text-brand-primary flex items-center justify-center">{row.value}</div>
                    </div>
                ))}
            </div>

            <div className="mb-3 border-2 border-brand-primary rounded-sm overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-100 border-b-2 border-brand-primary font-black text-[10px] uppercase">
                    <div className="col-span-8 p-1.5 border-r-2 border-brand-primary">Particulars / Details</div>
                    <div className="col-span-4 p-1.5 text-right">Amount (RS)</div>
                </div>

                <div className="text-[10px] font-black">
                    {[
                        { label: 'Admission Fee', amount: admissionFee > 0 ? admissionFee.toLocaleString() : '-' },
                        { label: 'Security Fee', amount: securityFee > 0 ? securityFee.toLocaleString() : '-' },
                        { label: 'Misc. / Other Charges', amount: miscCharges > 0 ? miscCharges.toLocaleString() : '-' },
                        { label: 'Tuition Fee:', amount: tuitionFee.toLocaleString() },
                        { label: `Absent Fine (${absentDays})`, amount: absentFine > 0 ? absentFine.toLocaleString() : '-' },
                        { label: 'Arrears / Due', amount: finalArrear > 0 ? finalArrear.toLocaleString() : '-' },
                    ].map((row, i) => (
                        <div key={i} className="grid grid-cols-12 border-b border-slate-100 last:border-0">
                            <div className="col-span-8 p-1 border-r border-slate-100">{row.label}</div>
                            <div className="col-span-4 p-1 text-right font-black">{row.amount}</div>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-50 border-t-2 border-brand-primary">
                    <div className="grid grid-cols-12 font-black text-[10px] border-b border-slate-300">
                        <div className="col-span-8 p-1.5 border-r border-slate-300 uppercase text-slate-500">Gross Total Payable</div>
                        <div className="col-span-4 p-1.5 text-right text-slate-900">{totalAmount.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-12 font-black text-[10px] border-b border-slate-300 bg-emerald-50/50">
                        <div className="col-span-8 p-1.5 border-r border-slate-300 uppercase text-emerald-600">Amount Received / Paid</div>
                        <div className="col-span-4 p-1.5 text-right text-emerald-600">-{Number(student.feesPaid || 0).toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-12 bg-brand-primary text-white font-black text-[12px]">
                        <div className="col-span-8 p-2 border-r border-white/20 uppercase">Net Balance Arrears</div>
                        <div className="col-span-4 p-2 text-right whitespace-nowrap">{(totalAmount - Number(student.feesPaid || 0)).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5">Total in Words</p>
                <p className="text-[11px] font-black italic border-b border-slate-200 pb-1 leading-tight text-brand-primary">{numberToWords(totalAmount)}</p>
            </div>

            <div className="bg-brand-primary p-1.5 text-[8px] font-black uppercase text-center text-white tracking-widest mb-2 rounded-md shadow-sm">
                20 RS/DAY FINE AFTER DUE DATE
            </div>

            <div className="flex justify-between items-end mt-auto">
                <div className="flex-1">
                    <div className="font-urdu text-[11px] font-bold leading-tight text-right mb-1" dir="rtl">
                        نوٹ: بغیر فیس چالان کے کوئی فیس جمع نہیں کی جائے گی اور ڈپلیکیٹ چالان چارجز -/50 روپے ہو گا۔
                    </div>
                    <div className="flex gap-2 text-[8px] font-black text-slate-500 uppercase">
                        <Phone className="w-2 h-2" /> +92-57-234418 | +92-334-5930217 | +92-333-2333139
                    </div>
                </div>

                <div className="shrink-0 flex flex-col items-center">
                    <div className="w-16 h-6 border-b border-brand-primary mb-0.5"></div>
                    <p className="text-[5px] font-black uppercase tracking-widest text-brand-primary/60">Accountant</p>
                </div>
            </div>
        </div>
    );
};

export const FeeVoucher: React.FC<FeeVoucherProps> = ({ student, onClose, readOnly = false }) => {
    const { settings, attendance, feeStructure, updateStudent } = useStore();

    const [editableTuition, setEditableTuition] = useState(0);
    const [editableAbsentFine, setEditableAbsentFine] = useState(0);
    const [editableArrear, setEditableArrear] = useState(0);
    const [editableAdmission, setEditableAdmission] = useState(0);
    const [editableSecurity, setEditableSecurity] = useState(0);
    const [editableMisc, setEditableMisc] = useState(0);
    const [isModified, setIsModified] = useState(false);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const absentDays = attendance.filter(a => {
        const date = new Date(a.date);
        return date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear &&
            a.records.some(r => r.studentId === student.id && r.status === 'Absent');
    }).length;

    useEffect(() => {
        const tuition = Number(student.monthlyFees) || Number(student.monthlyTuition) || Number(feeStructure[student.class]) || Number(feeStructure['General']) || 4000;
        const fine = Number(absentDays) * 50;
        const admission = Number(student.admissionFees || 0);
        const security = Number(student.securityFees || 0);
        const misc = Number(student.miscellaneousCharges || 0);
        const currentBalance = Number(student.feesTotal || 0) - Number(student.feesPaid || 0);
        const currentVoucherTotal = tuition + admission + security + misc + fine;
        const initialArrear = currentBalance > currentVoucherTotal ? (currentBalance - currentVoucherTotal) : 0;

        setEditableTuition(tuition);
        setEditableAbsentFine(fine);
        setEditableAdmission(admission);
        setEditableSecurity(security);
        setEditableMisc(misc);
        setEditableArrear(initialArrear > 0 ? initialArrear : 0);
    }, [student, feeStructure, absentDays]);

    const totalAmount = Number(editableTuition) + Number(editableAbsentFine) + Number(editableArrear) +
        Number(editableAdmission) + Number(editableSecurity) + Number(editableMisc);

    const handleSyncToStore = () => {
        updateStudent(student.id, {
            monthlyFees: editableTuition,
            admissionFees: editableAdmission,
            securityFees: editableSecurity,
            miscellaneousCharges: editableMisc,
            feesTotal: (student.feesPaid || 0) + totalAmount
        });
        setIsModified(false);
        Swal.fire({
            title: 'Record Updated',
            text: 'Fee components and total balance have been synced to student record.',
            icon: 'success',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const currentMonthName = monthNames[currentMonth];

    return (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 md:p-4 overflow-y-auto print:p-0 print:bg-white print:backdrop-blur-none">
            <div className={`bg-white w-full ${readOnly ? 'max-w-[1100px]' : 'max-w-[1300px]'} shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden print:shadow-none print:rounded-none flex flex-col md:flex-row h-[95vh] md:h-[90vh] print:h-auto`}>

                {!readOnly && (
                    <div className="w-full md:w-80 bg-slate-50 border-r border-slate-100 p-5 md:p-8 flex flex-col gap-4 md:gap-6 print:hidden overflow-y-auto shrink-0 md:h-auto h-1/2">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 md:p-2 bg-brand-primary rounded-xl text-white">
                                <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-brand-primary">Voucher Editor</h3>
                        </div>

                        <div className="space-y-3 md:space-y-4 mt-2">
                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                <div className="p-2.5 md:p-3 bg-brand-primary/5 border border-brand-primary/10 rounded-xl">
                                    <p className="text-[8px] md:text-[10px] font-black uppercase text-brand-primary tracking-widest leading-none mb-1">Period</p>
                                    <p className="text-xs md:text-sm font-black text-brand-primary uppercase">{currentMonthName} {currentYear}</p>
                                </div>
                                <div className="p-2.5 md:p-3 bg-slate-100 border border-slate-200 rounded-xl">
                                    <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Ledger</p>
                                    <p className="text-xs md:text-sm font-black text-slate-600">RS {((student.feesTotal || 0) - (student.feesPaid || 0)).toLocaleString()}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Tuition Fee</label>
                                <input type="number" value={editableTuition} onChange={(e) => { setEditableTuition(Number(e.target.value)); setIsModified(true); }} className="w-full p-2.5 md:p-3.5 bg-white rounded-xl border border-slate-200 font-black text-xs outline-none focus:ring-2 ring-brand-primary/20" />
                            </div>
                            <div>
                                <label className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Arrears / Balance</label>
                                <input type="number" value={editableArrear} onChange={(e) => { setEditableArrear(Number(e.target.value)); setIsModified(true); }} className="w-full p-2.5 md:p-3.5 bg-white rounded-xl border border-slate-200 font-black text-xs outline-none focus:ring-2 ring-brand-primary/20" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Admission</label>
                                    <input type="number" value={editableAdmission} onChange={(e) => { setEditableAdmission(Number(e.target.value)); setIsModified(true); }} className="w-full p-2.5 bg-white rounded-xl border border-slate-200 font-black text-xs outline-none" />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Security</label>
                                    <input type="number" value={editableSecurity} onChange={(e) => { setEditableSecurity(Number(e.target.value)); setIsModified(true); }} className="w-full p-2.5 bg-white rounded-xl border border-slate-200 font-black text-xs outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Misc Charges</label>
                                <input type="number" value={editableMisc} onChange={(e) => { setEditableMisc(Number(e.target.value)); setIsModified(true); }} className="w-full p-2.5 bg-white rounded-xl border border-slate-200 font-black text-xs outline-none" />
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Absent Fines</label>
                                <input type="number" value={editableAbsentFine} onChange={(e) => { setEditableAbsentFine(Number(e.target.value)); setIsModified(true); }} className="w-full p-2.5 bg-white rounded-xl border border-slate-200 font-black text-xs outline-none" />
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-200">
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-4">
                                <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest">Final Payable</p>
                                <h4 className="text-2xl font-black text-brand-primary">RS {totalAmount.toLocaleString()}</h4>
                            </div>
                            {isModified && (
                                <button onClick={handleSyncToStore} className="w-full py-4 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20">
                                    <RefreshCw className="w-4 h-4" /> Save Record
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex-1 flex flex-col bg-slate-200/30 overflow-hidden relative">
                    <div className="flex justify-between items-center p-6 bg-white border-b border-slate-100 print:hidden shrink-0">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.name} • {student.id}</p>
                            <h3 className="text-xl font-black uppercase tracking-tight text-brand-primary">
                                {readOnly ? 'Institutional Fee Voucher' : 'Triple-Copy Preview'}
                            </h3>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                                {readOnly ? 'Back' : 'Cancel'}
                            </button>
                            <button onClick={handlePrint} className="px-8 py-3 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20">Print Voucher</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-6 print:p-0 bg-slate-200/50 print:bg-white custom-scrollbar">
                        <div className={`flex h-full min-h-[580px] w-full ${readOnly ? 'max-w-[1000px]' : 'max-w-[1200px]'} bg-white print:h-[210mm] print:w-[297mm] shadow-2xl print:shadow-none mx-auto rounded-3xl print:rounded-none overflow-hidden origin-top scale-95 print:scale-100 transition-transform duration-500`} id="voucher-to-print">
                            <VoucherCopy
                                copyType="STUDENT COPY" student={student} settings={settings} totalAmount={totalAmount}
                                absentDays={absentDays} tuitionFee={editableTuition} absentFine={editableAbsentFine}
                                finalArrear={editableArrear} admissionFee={editableAdmission} securityFee={editableSecurity}
                                miscCharges={editableMisc} monthName={currentMonthName} year={currentYear}
                            />
                            <VoucherCopy
                                copyType="SCHOOL COPY" student={student} settings={settings} totalAmount={totalAmount}
                                absentDays={absentDays} tuitionFee={editableTuition} absentFine={editableAbsentFine}
                                finalArrear={editableArrear} admissionFee={editableAdmission} securityFee={editableSecurity}
                                miscCharges={editableMisc} monthName={currentMonthName} year={currentYear}
                            />
                            <VoucherCopy
                                copyType="BANK COPY" student={student} settings={settings} totalAmount={totalAmount}
                                absentDays={absentDays} tuitionFee={editableTuition} absentFine={editableAbsentFine}
                                finalArrear={editableArrear} admissionFee={editableAdmission} securityFee={editableSecurity}
                                miscCharges={editableMisc} monthName={currentMonthName} year={currentYear}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { size: A4 landscape; margin: 0; }
                    body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; }
                    body * { visibility: hidden; }
                    #voucher-to-print, #voucher-to-print * { visibility: visible; }
                    #voucher-to-print { 
                        position: fixed; left: 0; top: 0; 
                        width: 297mm !important; height: 210mm !important;
                        display: grid !important; grid-template-columns: 1fr 1fr 1fr !important;
                        padding: 6mm !important; margin: 0 !important; scale: 1 !important;
                    }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};
export default FeeVoucher;
