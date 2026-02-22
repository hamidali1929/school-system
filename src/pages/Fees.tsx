import { useState } from 'react';
import { ArrowUpRight, Search, Clock, AlertTriangle, FileText, History, Percent, Edit3, Calendar, MessageSquare, Bell } from 'lucide-react';
import { useStore, type Student, type Payment } from '../context/StoreContext';
import { cn } from '../utils/cn';
import { MESSAGE_TEMPLATES } from '../utils/whatsapp';
import Swal from 'sweetalert2';
import { FeeVoucher } from '../components/FeeVoucher';
import { BulkFeeVoucher } from '../components/BulkFeeVoucher';

export const Fees = () => {
    const { students, updateStudent, feeStructure, triggerFeeReminders, sendNotification, settings } = useStore();
    const [search, setSearch] = useState('');
    const [selectedStudentForVoucher, setSelectedStudentForVoucher] = useState<Student | null>(null);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'billing' | 'ledger'>('billing');

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.class.toLowerCase().includes(search.toLowerCase())
    );

    // Get all payments for ledger
    const masterLedger: { studentName: string; studentId: string; class: string; payment: Payment }[] = [];
    students.forEach(s => {
        if (s.paymentHistory) {
            s.paymentHistory.forEach(p => {
                masterLedger.push({ studentName: s.name, studentId: s.id, class: s.class, payment: p });
            });
        }
    });
    masterLedger.sort((a, b) => new Date(b.payment.date).getTime() - new Date(a.payment.date).getTime());

    const handleGenerateAllMonthlyFees = async () => {
        const h = document.documentElement.classList.contains('dark');
        const { isConfirmed } = await Swal.fire({
            title: 'Generate Monthly Billing?',
            background: h ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
            color: h ? 'var(--brand-accent)' : '#0f172a',
            text: `This will apply the monthly tuition fee to all ${students.length} students based on their class. Proceed?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Apply Fees',
            confirmButtonColor: 'var(--brand-primary)'
        });

        if (isConfirmed) {
            students.forEach(s => {
                const tuitionFee = Number(s.monthlyFees) || Number(s.monthlyTuition) || feeStructure[s.class] || feeStructure['General'] || 3000;
                updateStudent(s.id, { feesTotal: (s.feesTotal || 0) + tuitionFee });
            });

            Swal.fire({
                title: 'Billing Cycle Synchronized',
                text: 'Monthly tuition fees have been successfully added to all active student accounts.',
                icon: 'success',
                background: h ? '#001529' : '#ffffff',
                color: h ? 'var(--brand-accent)' : '#0f172a',
            });
        }
    };

    const handleEditFees = async (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const h = document.documentElement.classList.contains('dark');
        const { value: formValues } = await Swal.fire({
            title: 'Manual Ledger Override',
            background: h ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
            color: h ? 'var(--brand-accent)' : '#0f172a',
            html: `
                <div class="text-left space-y-4 font-outfit">
                    <p class="text-[10px] font-black ${h ? 'text-brand-accent/60' : 'text-slate-400'} uppercase tracking-widest">Editing financial record for ${student.name}</p>
                    <div>
                        <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} mb-2 block tracking-widest">Total Liability (Total Fees)</label>
                        <input id="edit-total" type="number" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${h ? '!bg-[#000816] !border-brand-accent/20 !text-brand-accent' : ''}" value="${student.feesTotal}">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} mb-2 block tracking-widest">Total Paid (Till Date)</label>
                        <input id="edit-paid" type="number" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${h ? '!bg-[#000816] !border-brand-accent/20 !text-brand-accent' : ''}" value="${student.feesPaid}">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save Overlap',
            confirmButtonColor: 'var(--brand-primary)',
            preConfirm: () => ({
                feesTotal: Number((document.getElementById('edit-total') as HTMLInputElement).value),
                feesPaid: Number((document.getElementById('edit-paid') as HTMLInputElement).value)
            })
        });

        if (formValues) {
            updateStudent(studentId, formValues);
            Swal.fire('Ledger Updated', 'Student financial records have been manually adjusted.', 'success');
        }
    };

    const handlePayFee = async (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const remaining = student.feesTotal - student.feesPaid;
        if (remaining <= 0) {
            Swal.fire('Already Paid', 'This student has no outstanding dues.', 'success');
            return;
        }

        const h = document.documentElement.classList.contains('dark');
        const { value: formValues } = await Swal.fire({
            title: 'Institutional Payment Receipt',
            background: h ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
            color: h ? 'var(--brand-accent)' : '#0f172a',
            html: `
                <div class="text-left space-y-4 font-outfit">
                    <div class="p-4 ${h ? 'bg-brand-accent/5 border border-brand-accent/10' : 'bg-slate-50 border border-slate-100'} rounded-[var(--brand-radius,1.25rem)] italic">
                        <p class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/40' : 'text-slate-400'} mb-1">Account Holder</p>
                        <p class="text-sm font-black ${h ? 'text-brand-accent' : 'text-brand-primary'}">${student.name} <span class="${h ? 'text-brand-accent/40' : 'text-slate-400'} font-bold ml-2">(${student.id})</span></p>
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} mb-2 block tracking-widest">Amount to Deposit (RS)</label>
                        <input id="pay-amount" type="number" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${h ? '!bg-[#000816] !border-brand-accent/20 !text-brand-accent' : ''}" placeholder="Max: ${remaining}" value="${remaining}">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} mb-2 block tracking-widest">Payment Mode</label>
                            <select id="pay-method" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm !h-[42px] px-2 outline-none ${h ? '!bg-[#000816] !border-brand-accent/20 !text-brand-accent' : ''}">
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} mb-2 block tracking-widest">Transaction Note</label>
                            <input id="pay-note" type="text" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${h ? '!bg-[#000816] !border-brand-accent/20 !text-brand-accent' : ''}" placeholder="e.g. June Tuition">
                        </div>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Authorize Payment',
            confirmButtonColor: 'var(--brand-primary)',
            preConfirm: () => {
                const amount = Number((document.getElementById('pay-amount') as HTMLInputElement).value);
                const method = (document.getElementById('pay-method') as HTMLSelectElement).value;
                const note = (document.getElementById('pay-note') as HTMLInputElement).value;

                if (!amount || amount <= 0) {
                    Swal.showValidationMessage('Enter a valid amount');
                    return false;
                }
                if (amount > remaining) {
                    Swal.showValidationMessage(`Exceeds due balance by RS ${amount - remaining}`);
                    return false;
                }
                return { amount, method, note };
            }
        });

        if (formValues) {
            const newPayment: Payment = {
                id: `TRX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                amount: formValues.amount,
                date: new Date().toISOString(),
                method: formValues.method as any,
                description: formValues.note || 'Institutional Fee Payment'
            };

            const updatedHistory = [...(student.paymentHistory || []), newPayment];
            updateStudent(studentId, {
                feesPaid: student.feesPaid + formValues.amount,
                paymentHistory: updatedHistory
            });

            // Auto-send WhatsApp Receipt
            const receiptMsg = MESSAGE_TEMPLATES.PAYMENT_RECEIPT(
                student.name,
                formValues.amount,
                newPayment.id,
                student.feesTotal - (student.feesPaid + formValues.amount),
                settings.schoolName
            );
            sendNotification(student.id, 'Fee', receiptMsg);

            // Show Success Receipt
            Swal.fire({
                title: 'Payment Synchronized',
                html: `
                    <div class="text-left font-outfit border-2 border-emerald-100 rounded-3xl p-6 bg-emerald-50/30">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600">Payment Receipt</h4>
                                <p className="text-[9px] font-bold text-slate-400 mt-1">Transaction ID: ${newPayment.id}</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between border-b border-emerald-100/50 pb-2">
                                <span class="text-[10px] font-bold text-slate-500 uppercase">Paid For</span>
                                <span class="text-[10px] font-black text-slate-700">${student.name}</span>
                            </div>
                            <div class="flex justify-between border-b border-emerald-100/50 pb-2">
                                <span class="text-[10px] font-bold text-slate-500 uppercase">Amount Received</span>
                                <span class="text-lg font-black text-emerald-600">RS ${newPayment.amount}</span>
                            </div>
                            <div class="flex justify-between border-b border-emerald-100/50 pb-2">
                                <span class="text-[10px] font-bold text-slate-500 uppercase">Mode</span>
                                <span class="text-[10px] font-black text-slate-700">${newPayment.method}</span>
                            </div>
                            <div class="flex justify-between pt-2">
                                <span class="text-[10px] font-bold text-slate-500 uppercase">Outstanding Balance</span>
                                <span class="text-[10px] font-black text-rose-600">RS ${remaining - formValues.amount}</span>
                            </div>
                        </div>
                    </div>
                `,
                confirmButtonText: 'Print Receipt',
                confirmButtonColor: 'var(--brand-primary)',
                icon: 'success'
            });
        }
    };

    const handleApplyDiscount = async (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const h = document.documentElement.classList.contains('dark');
        const { value: formValues } = await Swal.fire({
            title: 'Apply Institutional Discount',
            background: h ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
            color: h ? 'var(--brand-accent)' : '#0f172a',
            html: `
                <div class="text-left space-y-4 font-outfit">
                    <div>
                        <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} mb-2 block tracking-widest">Discount Amount (RS)</label>
                        <input id="disc-amount" type="number" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${h ? '!bg-[#000816] !border-brand-accent/20 !text-brand-accent' : ''}" placeholder="Amount to deduct">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase ${h ? 'text-brand-accent/60' : 'text-slate-500'} mb-2 block tracking-widest">Reason / Scholarship Type</label>
                        <select id="disc-reason" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm !h-[42px] px-2 outline-none ${h ? '!bg-[#000816] !border-brand-accent/20 !text-brand-accent' : ''}">
                            <option value="Merit-Based Scholarship">Merit-Based Scholarship</option>
                            <option value="Sibling Discount">Sibling Discount</option>
                            <option value="Orphan Welfare Support">Orphan Welfare Support</option>
                            <option value="Teacher's Ward Concession">Teacher's Ward Concession</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Apply Deduction',
            confirmButtonColor: 'var(--brand-primary)',
            preConfirm: () => {
                const amount = Number((document.getElementById('disc-amount') as HTMLInputElement).value);
                const reason = (document.getElementById('disc-reason') as HTMLSelectElement).value;
                if (!amount || amount <= 0) {
                    Swal.showValidationMessage('Enter a valid amount');
                    return false;
                }
                return { amount, reason };
            }
        });

        if (formValues) {
            const newDiscount = {
                id: `DISC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                amount: formValues.amount,
                reason: formValues.reason,
                date: new Date().toISOString()
            };

            const updatedDiscounts = [...(student.discounts || []), newDiscount];
            updateStudent(studentId, {
                feesTotal: Math.max(0, student.feesTotal - formValues.amount),
                discounts: updatedDiscounts
            });

            Swal.fire({
                title: 'Deduction Applied',
                text: `Institutional discount of RS ${formValues.amount} has been subtracted from ${student.name}'s account.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    const handleShowHistory = (student: Student) => {
        if ((!student.paymentHistory || student.paymentHistory.length === 0) && (!student.discounts || student.discounts.length === 0)) {
            Swal.fire('No Records', 'This account has no transaction or discount history yet.', 'info');
            return;
        }

        const paymentsHtml = (student.paymentHistory || []).map(p => `
            <div class="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl mb-2 border border-emerald-100/30">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-white rounded-xl shadow-sm text-emerald-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                    </div>
                    <div class="text-left">
                        <p class="text-xs font-black text-emerald-700">${p.description}</p>
                        <p class="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">${new Date(p.date).toLocaleString()} • ${p.method}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-black text-emerald-600">+ RS ${p.amount}</p>
                </div>
            </div>
        `).join('');

        const discountsHtml = (student.discounts || []).map(d => `
            <div class="flex items-center justify-between p-4 bg-rose-50/50 rounded-2xl mb-2 border border-rose-100/30">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-white rounded-xl shadow-sm text-rose-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>
                    </div>
                    <div class="text-left">
                        <p class="text-xs font-black text-rose-700">${d.reason}</p>
                        <p class="text-[8px] font-bold text-rose-400 uppercase tracking-widest">${new Date(d.date).toLocaleString()} • Discount</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-black text-rose-600">- RS ${d.amount}</p>
                </div>
            </div>
        `).join('');

        Swal.fire({
            title: `<div class="text-left"><p class="text-[10px] font-black uppercase text-slate-400 tracking-widest">Student Ledger</p><h3 class="text-xl font-black text-brand-primary dark:text-brand-accent">${student.name}</h3></div>`,
            html: `
                <div class="max-h-[60vh] overflow-y-auto px-1 font-outfit mt-4 custom-scrollbar">
                    <p class="text-[8px] font-black uppercase text-slate-400 mb-3 tracking-widest">Payment Transactions</p>
                    ${paymentsHtml || '<p class="text-center py-4 text-slate-300 text-[10px] font-bold uppercase">No payments recorded</p>'}
                    <div class="h-4"></div>
                    <p class="text-[8px] font-black uppercase text-slate-400 mb-3 tracking-widest">Institutional Discounts</p>
                    ${discountsHtml || '<p class="text-center py-4 text-slate-300 text-[10px] font-bold uppercase">No discounts applied</p>'}
                </div>
            `,
            showConfirmButton: false,
            width: '32rem'
        });
    };

    const totalCollected = students.reduce((acc, s) => acc + (Number(s.feesPaid) || 0), 0);
    const totalTarget = students.reduce((acc, s) => acc + (Number(s.feesTotal) || 0), 0);
    const totalPending = totalTarget - totalCollected;
    const recoveryRate = totalTarget > 0 ? ((totalCollected / totalTarget) * 100).toFixed(1) : '100';
    const ledgerSum = masterLedger.reduce((acc, entry) => acc + (Number(entry.payment.amount) || 0), 0);

    return (
        <div className="space-y-8 animate-fade-in font-outfit">


            {selectedStudentForVoucher && (
                <FeeVoucher
                    student={selectedStudentForVoucher}
                    onClose={() => setSelectedStudentForVoucher(null)}
                />
            )}

            {showBulkModal && (
                <BulkFeeVoucher
                    students={filteredStudents}
                    onClose={() => setShowBulkModal(false)}
                />
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-brand-primary dark:text-brand-accent leading-none">Finance Hub</h2>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full">Active</span>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 dark:text-brand-accent/40 uppercase tracking-widest mt-1">Institutional Revenue Tracking</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => {
                        triggerFeeReminders();
                        Swal.fire({
                            title: 'Broadcasting Reminders',
                            text: 'AI-generated WhatsApp reminders are being sent to all pending accounts.',
                            icon: 'success',
                            toast: true,
                            position: 'top-end',
                            timer: 3000,
                            showConfirmButton: false
                        });
                    }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/10">
                        <MessageSquare className="w-3.5 h-3.5" /> Reminders
                    </button>
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-[var(--brand-radius,1rem)] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/10"
                    >
                        <FileText className="w-3.5 h-3.5" /> Bulk Slips
                    </button>
                    <button onClick={() => handleGenerateAllMonthlyFees()} className="px-4 py-2 bg-brand-primary text-white rounded-[var(--brand-radius,1rem)] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/10">
                        <Calendar className="w-3.5 h-3.5" /> Bulk Billing
                    </button>
                    <div className="flex p-1 bg-slate-100 dark:bg-brand-primary-dark rounded-[var(--brand-radius,1rem)] border border-slate-200 dark:border-brand-accent/10">
                        <button
                            onClick={() => setActiveTab('billing')}
                            className={cn("px-4 py-1.5 rounded-[var(--brand-radius,0.75rem)] text-[9px] font-black uppercase tracking-widest transition-all", activeTab === 'billing' ? "bg-white dark:bg-brand-accent text-brand-primary shadow-sm" : "text-slate-400")}
                        >
                            Billing
                        </button>
                        <button
                            onClick={() => setActiveTab('ledger')}
                            className={cn("px-4 py-1.5 rounded-[var(--brand-radius,0.75rem)] text-[9px] font-black uppercase tracking-widest transition-all", activeTab === 'ledger' ? "bg-white dark:bg-brand-accent text-brand-primary shadow-sm" : "text-slate-400")}
                        >
                            History
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 border-none bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-xl shadow-brand-primary/10 rounded-[var(--brand-radius,1.5rem)]">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">Collection</p>
                        <ArrowUpRight className="w-4 h-4 opacity-40 shrink-0" />
                    </div>
                    <h3 className="text-xl font-black tracking-tighter">RS {totalCollected.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full" style={{ width: `${recoveryRate}%` }}></div>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">{recoveryRate}% Recovery</span>
                    </div>
                </div>
                <div className="glass-card p-4 border-none bg-white dark:bg-brand-primary-dark rounded-[var(--brand-radius,1.5rem)]">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Target Recovery</p>
                        <Clock className="w-3.5 h-3.5 text-slate-200 dark:text-brand-accent/20" />
                    </div>
                    <h3 className="text-xl font-black tracking-tighter text-slate-800 dark:text-brand-accent">RS {totalTarget.toLocaleString()}</h3>
                </div>
                <div className="glass-card p-4 border-none bg-white dark:bg-brand-primary-dark rounded-[var(--brand-radius,1.5rem)]">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Pending</p>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-200" />
                    </div>
                    <h3 className="text-xl font-black tracking-tighter text-rose-600">RS {totalPending.toLocaleString()}</h3>
                </div>
                <div className="glass-card p-4 border-none bg-slate-900 text-white rounded-[var(--brand-radius,1.5rem)]">
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Deficit Risk</p>
                    <h3 className="text-xl font-black tracking-tighter">{(100 - Number(recoveryRate)).toFixed(1)}%</h3>
                </div>
            </div>

            <div className="glass-card overflow-hidden border-none shadow-xl shadow-slate-200/50 min-h-[500px] rounded-[var(--brand-radius,1.5rem)]">
                <div className="p-4 md:p-6 border-b border-slate-50 dark:border-brand-accent/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-tight text-brand-primary dark:text-brand-accent leading-none">
                            {activeTab === 'billing' ? 'Ledger Registry' : 'Archive'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {activeTab === 'ledger' && (
                            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-2">
                                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight">Total RS {ledgerSum.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, ID or class..."
                                className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#000816] rounded-[var(--brand-radius,1rem)] text-xs font-semibold outline-none focus:ring-4 ring-brand-primary/5 w-48 md:w-80 transition-all border border-slate-100 dark:border-brand-accent/10"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    {activeTab === 'billing' ? (
                        <table className="w-full text-left min-w-[1000px]">
                            <thead>
                                <tr className="text-[11px] uppercase tracking-[0.2em] text-brand-primary font-black border-b border-slate-50 bg-slate-50/50">
                                    <th className="px-8 py-6 sticky left-0 bg-slate-50 dark:bg-brand-primary-dark z-10">Student Profile</th>
                                    <th className="px-8 py-6 text-center">Approved Fee</th>
                                    <th className="px-8 py-6 text-center text-emerald-600">Total Paid</th>
                                    <th className="px-8 py-6 text-center text-rose-600">Arrears</th>
                                    <th className="px-8 py-6 text-center">Collection Status</th>
                                    <th className="px-8 py-6 text-right sticky right-0 bg-slate-50 dark:bg-brand-primary-dark z-10">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((s) => (
                                        <tr key={s.id} className="group hover:bg-brand-primary/5 transition-colors">
                                            <td className="px-8 py-6 sticky left-0 bg-white dark:bg-brand-primary-dark z-10 group-hover:bg-brand-primary/10 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-[var(--brand-radius,1.25rem)] bg-brand-primary text-white flex items-center justify-center font-black text-xs shadow-lg shadow-brand-primary/20">
                                                        {(s.name || 'S').charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-800 uppercase tracking-tight text-[15px]">{s.name}</span>
                                                        <span className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest mt-0.5">{s.id} • {s.class}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center font-black text-slate-500">RS {s.feesTotal}</td>
                                            <td className="px-8 py-6 text-center text-emerald-600 font-black">RS {s.feesPaid}</td>
                                            <td className="px-8 py-6 text-center text-rose-600 font-black">RS {s.feesTotal - s.feesPaid}</td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={cn(
                                                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm",
                                                    s.feesPaid >= s.feesTotal
                                                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                                        : 'bg-amber-500 text-white shadow-amber-500/20'
                                                )}>
                                                    {s.feesPaid >= s.feesTotal ? 'Cleared' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right sticky right-0 bg-white dark:bg-brand-primary-dark z-10 group-hover:bg-brand-primary/10 transition-colors border-l border-slate-50 dark:border-brand-accent/5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditFees(s.id)}
                                                        className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-[var(--brand-radius,1rem)] transition-all"
                                                        title="Edit Ledger"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleApplyDiscount(s.id)}
                                                        className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[var(--brand-radius,1rem)] transition-all"
                                                        title="Apply Discount"
                                                    >
                                                        <Percent className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleShowHistory(s)}
                                                        className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-[var(--brand-radius,1rem)] transition-all"
                                                        title="Payment History"
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            triggerFeeReminders(undefined, s.id);
                                                            Swal.fire({
                                                                title: 'Opening WhatsApp',
                                                                text: `Preparing reminder for ${s.name}.`,
                                                                icon: 'info',
                                                                toast: true,
                                                                position: 'top-end',
                                                                timer: 2000,
                                                                showConfirmButton: false,
                                                                customClass: {
                                                                    popup: 'rounded-[var(--brand-radius,1rem)] shadow-lg',
                                                                },
                                                            });
                                                        }}
                                                        className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-[var(--brand-radius,1rem)] transition-all"
                                                        title="Send WhatsApp Reminder"
                                                    >
                                                        <Bell className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedStudentForVoucher(s)}
                                                        className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-[var(--brand-radius,1rem)] transition-all font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-sm"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" /> Generate Slip
                                                    </button>
                                                    {s.feesPaid < s.feesTotal && (
                                                        <button
                                                            onClick={() => handlePayFee(s.id)}
                                                            className="px-6 py-2.5 bg-brand-primary text-white rounded-[var(--brand-radius,1rem)] text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/10"
                                                        >
                                                            Receive
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center">
                                            <Search className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Account lookup yielded zero results.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {filteredStudents.length > 0 && (
                                <tfoot className="bg-slate-50/80 border-t border-slate-100">
                                    <tr className="text-[10px] font-black uppercase tracking-widest">
                                        <td className="px-8 py-4 text-brand-primary">Registry Summary</td>
                                        <td className="px-8 py-4 text-center text-slate-500">RS {filteredStudents.reduce((acc, s) => acc + (Number(s.feesTotal) || 0), 0).toLocaleString()}</td>
                                        <td className="px-8 py-4 text-center text-emerald-600 text-[13px]">RS {filteredStudents.reduce((acc, s) => acc + (Number(s.feesPaid) || 0), 0).toLocaleString()}</td>
                                        <td className="px-8 py-4 text-center text-rose-600">RS {filteredStudents.reduce((acc, s) => acc + ((Number(s.feesTotal) || 0) - (Number(s.feesPaid) || 0)), 0).toLocaleString()}</td>
                                        <td className="px-8 py-4" colSpan={2}></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    ) : (
                        <table className="w-full text-left min-w-[1000px]">
                            <thead>
                                <tr className="text-[11px] uppercase tracking-[0.2em] text-brand-primary font-black border-b border-slate-50 bg-slate-50/50">
                                    <th className="px-8 py-6 sticky left-0 bg-slate-50 dark:bg-brand-primary-dark z-10">Transaction ID</th>
                                    <th className="px-8 py-6">Student Details</th>
                                    <th className="px-8 py-6 text-center">Timestamp</th>
                                    <th className="px-8 py-6 text-center">Mode</th>
                                    <th className="px-8 py-6 text-center text-emerald-600">Amount</th>
                                    <th className="px-8 py-6 text-right sticky right-0 bg-slate-50 dark:bg-brand-primary-dark z-10">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium font-mono text-[11px]">
                                {masterLedger.length > 0 ? (
                                    masterLedger.map((entry: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-brand-primary/5 transition-colors group">
                                            <td className="px-8 py-6 font-black text-slate-400 sticky left-0 bg-white dark:bg-brand-primary-dark z-10 group-hover:bg-brand-primary/10 transition-colors">{entry.payment.id}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col text-slate-700 dark:text-white/80 font-bold">
                                                    <span className="uppercase text-slate-900 dark:text-brand-accent font-black">{entry.studentName}</span>
                                                    <span className="opacity-50">{entry.studentId} • {entry.class}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center text-slate-500 uppercase">{new Date(entry.payment.date).toLocaleString()}</td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-md text-slate-600 dark:text-white/60 uppercase font-black text-[9px]">{entry.payment.method}</span>
                                            </td>
                                            <td className="px-8 py-6 text-center text-emerald-600 font-black">RS {entry.payment.amount}</td>
                                            <td className="px-8 py-6 text-right font-black text-emerald-500 uppercase tracking-widest sticky right-0 bg-white dark:bg-brand-primary-dark z-10 group-hover:bg-brand-primary/10 transition-colors border-l border-slate-50 dark:border-brand-accent/5">Confirmed</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center">
                                            <History className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">The institutional ledger is currently empty.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <style>{`
                .swal-input-premium {
                    border: 2px solid #f1f5f9;
                    border-radius: var(--brand-radius, 1rem);
                    padding: 12px 16px;
                    font-weight: 800;
                    font-size: 14px;
                    color: #334155;
                    width: 100%;
                    outline: none;
                    transition: all 0.2s;
                    background: #f8fafc;
                }
                .swal-input-premium:focus {
                    border-color: var(--brand-primary);
                    background: #ffffff;
                    box-shadow: 0 0 0 4px var(--brand-primary-light, rgba(0, 51, 102, 0.05));
                }
                .dark .swal-input-premium {
                    background: var(--brand-primary-dark, #001529);
                    border-color: var(--brand-accent-light, rgba(251, 191, 36, 0.2));
                    color: var(--brand-accent);
                }
                .dark .swal-input-premium:focus {
                    border-color: var(--brand-accent);
                    background: #000816;
                }
            `}</style>
        </div>
    );
};

