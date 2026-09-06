import { useState, useMemo } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    PlusCircle,
    Printer,
    Trash2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    CreditCard,
    Briefcase,
    Zap
} from 'lucide-react';
import { useStore, type SalarySlip } from '../context/StoreContext';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORIES = ['Utilities', 'Rent', 'Stationery', 'Maintenance', 'Miscellaneous', 'Events'] as const;

// Helper to format large numbers for UI
const formatCurrency = (num: number) => {
    if (num >= 10000000) return `Rs. ${(num / 1000000).toFixed(1)}M`;
    if (num >= 100000) return `Rs. ${(num / 1000).toFixed(1)}K`;
    return `Rs. ${num.toLocaleString()}`;
};

export const FinancePage = () => {
    const {
        teachers,
        students,
        expenses,
        salarySlips,
        addExpense,
        deleteExpense,
        generateSalarySlips,
        updateSalarySlip,
        settings
    } = useStore();

    const [activeTab, setActiveTab] = useState<'overview' | 'payroll' | 'expenses'>('overview');
    const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');

    const handlePrintSalarySlip = (slip: SalarySlip) => {
        const teacher = teachers.find(t => t.id === slip.teacherId);
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const htmlContent = `
            <html>
                <head>
                    <title>Salary Slip - ${teacher?.name}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700;800;900&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Crimson Pro', serif; 
                            background: #fff; 
                            padding: 30px; 
                            color: #111;
                        }

                        .page-border {
                            border: 6px double var(--brand-primary);
                            padding: 40px;
                            position: relative;
                            min-height: 95vh;
                        }

                        .header-main {
                            text-align: center;
                            margin-bottom: 40px;
                            border-bottom: 2px solid var(--brand-primary);
                            padding-bottom: 30px;
                        }

                        .logo-container {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 50px;
                            margin-bottom: 20px;
                        }

                        .logo-box {
                            width: 110px;
                            height: 110px;
                            object-fit: contain;
                            padding: 5px;
                        }

                        .school-title {
                            font-size: 36px;
                            font-weight: bold;
                            color: var(--brand-primary);
                            text-transform: uppercase;
                            line-height: 1.2;
                        }

                        .school-subtitle {
                            font-size: 14px;
                            font-weight: bold;
                            color: #334155;
                            text-transform: uppercase;
                            letter-spacing: 2px;
                            margin-top: 5px;
                        }

                        .slip-badge {
                            display: inline-block;
                            border: 2px solid var(--brand-primary);
                            color: var(--brand-primary);
                            padding: 8px 25px;
                            font-size: 14px;
                            font-weight: bold;
                            text-transform: uppercase;
                            margin-top: 25px;
                        }

                        .info-section {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 20px;
                            margin-bottom: 40px;
                            border: 1px solid #cbd5e1;
                            padding: 25px;
                        }

                        .info-block { display: flex; flex-direction: row; align-items: baseline; gap: 10px; border-bottom: 1px dotted #e2e8f0; padding-bottom: 5px; }
                        .info-key { 
                            font-size: 11px; 
                            font-weight: bold; 
                            color: #475569; 
                            text-transform: uppercase; 
                            min-width: 140px;
                        }
                        .info-val { font-size: 16px; font-weight: bold; color: #000; }

                        .salary-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 60px;
                            border: 1px solid #000;
                        }

                        .salary-table th {
                            padding: 12px 15px;
                            text-align: left;
                            font-size: 12px;
                            font-weight: bold;
                            color: #fff;
                            background: #003366;
                            text-transform: uppercase;
                            border: 1px solid #000;
                        }

                        .salary-table td {
                            padding: 12px 15px;
                            font-size: 14px;
                            font-weight: bold;
                            border: 1px solid #000;
                        }

                        .net-row {
                            background: #f1f5f9;
                            color: #000;
                        }

                        .net-row td {
                            padding: 15px;
                            font-size: 18px;
                            font-weight: bold;
                            border: 2px solid #000;
                        }

                        .watermark {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%) rotate(-30deg);
                            font-size: 80px;
                            font-weight: bold;
                            color: rgba(0, 0, 0, 0.03);
                            pointer-events: none;
                            white-space: nowrap;
                            text-transform: uppercase;
                        }

                        .footer-sigs {
                            margin-top: 50px;
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 50px;
                            text-align: center;
                        }

                        .sig-line {
                            border-top: 1px solid #000;
                            padding-top: 10px;
                            font-size: 12px;
                            font-weight: bold;
                            color: #000;
                            text-transform: uppercase;
                        }
                        
                        @media print {
                            body { padding: 0; }
                            .page-border { border: 8px double #000; }
                        }
                    </style>
                </head>
                <body>
                    <div class="page-border">
                        <div class="watermark">OFFICIAL PAYSLIP</div>
                        
                        <header class="header-main">
                            <div class="logo-container">
                                ${settings.logo1 ? `<img src="${settings.logo1}" class="logo-box" />` : ''}
                                ${settings.logo2 ? `<img src="${settings.logo2}" class="logo-box" />` : ''}
                            </div>
                            <h1 class="school-title">${settings.schoolName || 'PIONEER\'S SUPERIOR'}</h1>
                            <p class="school-subtitle">${settings.subTitle || 'Institute of Higher Secondary Education, Attock'}</p>
                            <span class="slip-badge">Salary Statement: ${slip.month} ${slip.year}</span>
                        </header>

                        <div class="info-section">
                            <div class="info-block">
                                <span class="info-key">Faculty Member</span>
                                <span class="info-val">${teacher?.name}</span>
                            </div>
                            <div class="info-block">
                                <span class="info-key">Academic ID</span>
                                <span class="info-val">${teacher?.id || 'PST-FAC-001'}</span>
                            </div>
                            <div class="info-block">
                                <span class="info-key">Department / Role</span>
                                <span class="info-val">${teacher?.subject} • ${teacher?.role}</span>
                            </div>
                            <div class="info-block">
                                <span class="info-key">Payment Cycle</span>
                                <span class="info-val">${slip.month} ${slip.year}</span>
                            </div>
                            <div class="info-block">
                                <span class="info-key">Status</span>
                                <span class="info-val" style="color: #10b981;">VERIFIED • PAID</span>
                            </div>
                            <div class="info-block">
                                <span class="info-key">Transaction Date</span>
                                <span class="info-val">${slip.paidDate || new Date().toLocaleDateString()}</span>
                            </div>
                        </div>

                        <table class="salary-table">
                            <thead>
                                <tr>
                                    <th>Financial Description</th>
                                    <th style="text-align: right;">Amount Allocation (PKR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Base Salary</td>
                                    <td style="text-align: right;">${slip.baseSalary.toLocaleString()} .00</td>
                                </tr>
                                ${slip.allowances.map(a => `
                                    <tr>
                                        <td>Bonus / Allowance (${a.type})</td>
                                        <td style="text-align: right; color: #10b981;">+ ${a.amount.toLocaleString()} .00</td>
                                    </tr>
                                `).join('')}
                                ${slip.deductions.map(d => `
                                    <tr>
                                        <td>Deductions (${d.type})</td>
                                        <td style="text-align: right; color: #ef4444;">- ${d.amount.toLocaleString()} .00</td>
                                    </tr>
                                `).join('')}
                                <tr class="net-row">
                                    <td>CERTIFIED NET PAYABLE</td>
                                    <td style="text-align: right;">Rs. ${slip.netSalary.toLocaleString()} /-</td>
                                </tr>
                            </tbody>
                        </table>

                        <footer class="footer-sigs">
                            <div class="sig-block">
                                <div class="sig-line">Faculty Signature</div>
                            </div>
                            <div class="sig-block">
                                <div class="sig-line">Finance Controller</div>
                            </div>
                            <div class="sig-block">
                                <div class="sig-line">Executive Principal</div>
                            </div>
                        </footer>

                        <p style="text-align: center; font-size: 8px; color: #94a3b8; margin-top: 40px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                            This document is an electronic certification of payroll disbursement for the specified period.
                        </p>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 800);
    };

    // --- Financial Calculations ---
    const financialStats = useMemo(() => {
        const totalFees = students.reduce((acc, s) => Number(acc) + Number(s.monthlyFees || 0), 0);
        const schoolExpenses = expenses.reduce((acc, e) => Number(acc) + Number(e.amount || 0), 0);

        // Get slips for the current month
        const currentMonthSlips = salarySlips.filter(s => s.month === selectedMonth && s.year === selectedYear);

        // Total Payroll is the sum of generated slips + base salary of active teachers who don't have a slip yet
        const teachersWithSlips = new Set(currentMonthSlips.map(s => s.teacherId));
        const missingPayrollProjected = teachers
            .filter(t => t.status === 'Active' && !teachersWithSlips.has(t.id))
            .reduce((acc, t) => acc + (t.baseSalary || 0), 0);

        const totalPayroll = currentMonthSlips.reduce((acc, s) => Number(acc) + Number(s.netSalary || 0), 0) + missingPayrollProjected;
        const paidPayroll = currentMonthSlips.filter(s => s.status === 'Paid').reduce((acc, s) => Number(acc) + Number(s.netSalary || 0), 0);
        const totalOutflow = schoolExpenses + totalPayroll;
        const netProfit = totalFees - totalOutflow;

        return {
            totalFees,
            schoolExpenses,
            totalPayroll,
            paidPayroll,
            totalOutflow,
            netProfit,
            activeSlipsCount: currentMonthSlips.filter(s => s.status === 'Paid').length
        };
    }, [students, expenses, salarySlips, teachers, selectedMonth, selectedYear]);

    // --- Payroll Registry Logic ---
    const payrollRegistry = useMemo(() => {
        // We want to show all active teachers for the selected month
        const activeTeachers = teachers.filter(t => t.status === 'Active');
        const monthSlips = salarySlips.filter(s => s.month === selectedMonth && s.year === selectedYear);

        return activeTeachers
            .filter(t => searchTerm === '' || t.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(teacher => {
                const slip = monthSlips.find(s => s.teacherId === teacher.id);
                return {
                    teacher,
                    slip,
                    id: slip?.id || `TEMP-${teacher.id}`,
                    status: slip?.status || 'Not Generated'
                };
            });
    }, [teachers, salarySlips, selectedMonth, selectedYear, searchTerm]);

    const handleGeneratePayroll = async () => {
        const result = await Swal.fire({
            title: 'Generate Payroll?',
            text: `This will create salary slips for all active teachers for ${selectedMonth} ${selectedYear}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Generate',
            background: document.documentElement.classList.contains('dark') ? '#001529' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#fbbf24' : '#0f172a',
        });

        if (result.isConfirmed) {
            generateSalarySlips(selectedMonth, selectedYear);
            Swal.fire({
                title: 'Payroll Generated',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        }
    };

    const handlePaySalary = (slip: SalarySlip) => {
        Swal.fire({
            title: 'Confirm Payment',
            html: `
                <div class="text-left space-y-3 font-outfit">
                    <p class="text-xs uppercase font-black text-slate-400">Teacher: <span class="text-brand-primary dark:text-brand-accent">${teachers.find(t => t.id === slip.teacherId)?.name}</span></p>
                    <p class="text-xs uppercase font-black text-slate-400">Total Amount: <span class="text-emerald-500 font-black">Rs. ${slip.netSalary.toLocaleString()}</span></p>
                    <select id="payment-method" class="swal-input-premium">
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                    </select>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Record Payment',
            confirmButtonColor: 'var(--brand-primary)',
            background: document.documentElement.classList.contains('dark') ? 'var(--brand-primary-dark, #001529)' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? 'var(--brand-accent, #fbbf24)' : '#0f172a',
            preConfirm: () => {
                const method = (document.getElementById('payment-method') as HTMLSelectElement).value;
                return { method };
            }
        }).then((result: any) => {
            if (result.isConfirmed) {
                updateSalarySlip(slip.id, {
                    status: 'Paid',
                    paidDate: new Date().toLocaleDateString(),
                    paymentMethod: result.value.method as any
                });
                Swal.fire({
                    title: 'Payment Recorded',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    const handleAddExpense = () => {
        Swal.fire({
            title: 'Record Expense',
            html: `
                <div class="space-y-4 text-left font-outfit">
                    <div>
                        <label class="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Title</label>
                        <input id="exp-title" class="swal-input-premium" placeholder="e.g. Electric Bill">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Category</label>
                            <select id="exp-category" class="swal-input-premium">
                                ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Amount</label>
                            <input id="exp-amount" type="number" class="swal-input-premium" placeholder="0.00">
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Add Expense',
            background: document.documentElement.classList.contains('dark') ? '#001529' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#fbbf24' : '#0f172a',
            preConfirm: () => {
                const title = (document.getElementById('exp-title') as HTMLInputElement).value;
                const category = (document.getElementById('exp-category') as HTMLSelectElement).value;
                const amount = Number((document.getElementById('exp-amount') as HTMLInputElement).value);
                if (!title || !amount) {
                    Swal.showValidationMessage('Please fill all required fields');
                    return false;
                }
                return { title, category, amount, date: new Date().toLocaleDateString() };
            }
        }).then((result: any) => {
            if (result.isConfirmed) {
                addExpense(result.value);
            }
        });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-32 max-w-[1600px] mx-auto px-4 md:px-6 font-outfit">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-primary dark:bg-brand-accent rounded-[var(--brand-radius,1.25rem)] flex items-center justify-center shadow-xl shrink-0">
                        <DollarSign className="text-white dark:text-brand-primary-dark" size={26} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight uppercase text-brand-primary dark:text-brand-accent truncate">Accounts & Finance</h2>
                        <p className="text-slate-500 dark:text-brand-accent/60 font-medium text-xs sm:text-sm truncate">Money Management & Reports</p>
                    </div>
                </div>

                <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 p-1 bg-slate-100 dark:bg-brand-primary-dark/30 rounded-[var(--brand-radius,1.25rem)] border border-slate-200 dark:border-brand-accent/10 shadow-sm backdrop-blur-md shrink-0">
                    <button onClick={() => setActiveTab('overview')} className={cn("px-3 sm:px-6 py-2 sm:py-2.5 rounded-[var(--brand-radius,1rem)] text-[10px] sm:text-xs font-black uppercase tracking-wider text-center transition-all", activeTab === 'overview' ? "bg-white dark:bg-brand-accent text-brand-primary dark:text-brand-primary-dark shadow-md" : "text-slate-500 hover:text-slate-700")}>Overview</button>
                    <button onClick={() => setActiveTab('payroll')} className={cn("px-3 sm:px-6 py-2 sm:py-2.5 rounded-[var(--brand-radius,1rem)] text-[10px] sm:text-xs font-black uppercase tracking-wider text-center transition-all", activeTab === 'payroll' ? "bg-white dark:bg-brand-accent text-brand-primary dark:text-brand-primary-dark shadow-md" : "text-slate-500 hover:text-slate-700")}>Payroll</button>
                    <button onClick={() => setActiveTab('expenses')} className={cn("px-3 sm:px-6 py-2 sm:py-2.5 rounded-[var(--brand-radius,1rem)] text-[10px] sm:text-xs font-black uppercase tracking-wider text-center transition-all", activeTab === 'expenses' ? "bg-white dark:bg-brand-accent text-brand-primary dark:text-brand-primary-dark shadow-md" : "text-slate-500 hover:text-slate-700")}>Expenses</button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <div className="glass-card p-6 border-l-4 border-l-brand-primary group transition-all cursor-default min-h-[160px] flex flex-col justify-between overflow-hidden">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Expected Revenue</p>
                                <h3 className="text-2xl lg:text-3xl font-black text-brand-primary dark:text-brand-accent break-words line-clamp-1 truncate">
                                    {formatCurrency(financialStats.totalFees)}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-brand-primary dark:text-brand-accent/60 uppercase tracking-widest">
                                <ArrowUpRight size={14} className="shrink-0" /> Total Fees
                            </div>
                        </div>

                        <div className="glass-card p-6 border-l-4 border-l-rose-500 group transition-all cursor-default min-h-[160px] flex flex-col justify-between overflow-hidden">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Expenses</p>
                                <h3 className="text-2xl lg:text-3xl font-black text-rose-500 break-words line-clamp-1 truncate">
                                    {formatCurrency(financialStats.totalOutflow)}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                <ArrowDownRight size={14} className="shrink-0" /> Outgoing Money
                            </div>
                        </div>

                        <div className="glass-card p-6 border-l-4 border-l-emerald-500 group transition-all cursor-default min-h-[160px] flex flex-col justify-between overflow-hidden">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Net Balance</p>
                                <h3 className={cn("text-2xl lg:text-3xl font-black break-words line-clamp-1 truncate", financialStats.netProfit >= 0 ? "text-emerald-500" : "text-rose-600")}>
                                    {formatCurrency(financialStats.netProfit)}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                <Zap size={14} className="animate-pulse shrink-0" /> Monthly Profit/Loss
                            </div>
                        </div>

                        <div className="glass-card p-6 border-l-4 border-l-brand-secondary group transition-all cursor-default min-h-[160px] flex flex-col justify-between overflow-hidden text-right lg:text-left">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Teacher Salaries</p>
                                <h3 className="text-2xl lg:text-3xl font-black text-brand-primary dark:text-brand-accent break-words line-clamp-1 truncate">
                                    {formatCurrency(financialStats.totalPayroll)}
                                </h3>
                            </div>
                            <div className="flex items-center lg:justify-start justify-end gap-2 mt-4 text-[10px] font-black text-brand-secondary-dark dark:text-brand-secondary uppercase tracking-widest">
                                <Briefcase size={14} className="shrink-0" /> {financialStats.activeSlipsCount} Paid Slips
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 glass-card p-8 group overflow-hidden relative min-h-[400px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-primary/10 transition-colors" />
                            <div className="flex items-center justify-between mb-8 relative">
                                <div>
                                    <h4 className="text-lg font-black uppercase tracking-tight text-brand-primary dark:text-brand-accent">Expense Distribution</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Categorical Expenditure Analysis</p>
                                </div>
                                <TrendingUp className="text-brand-primary dark:text-brand-accent opacity-20 group-hover:opacity-100 transition-opacity" size={24} />
                            </div>

                            <div className="space-y-6">
                                {CATEGORIES.map(cat => {
                                    const amount = expenses.filter(e => e.category === cat).reduce((acc, e) => acc + e.amount, 0);
                                    const percentage = (amount / (financialStats.schoolExpenses || 1)) * 100;
                                    return (
                                        <div key={cat} className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-slate-600 dark:text-white/60">{cat}</span>
                                                <span className="text-slate-400">{formatCurrency(amount)} ({percentage.toFixed(0)}%)</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-primary dark:bg-brand-accent rounded-full transition-all duration-1000"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-white to-slate-50 dark:from-brand-primary-dark dark:to-brand-primary-dark/30 min-h-[400px] rounded-[var(--brand-radius,2rem)] border border-slate-200 dark:border-brand-accent/5">
                            <div className="w-24 h-24 rounded-full border-8 border-emerald-500/10 flex items-center justify-center relative shadow-inner">
                                <div className="absolute inset-0 rounded-full border-t-8 border-emerald-500 animate-[spin_3s_linear_infinite]" />
                                <TrendingUp size={32} className="text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-tighter text-brand-primary dark:text-white">Institutional Status</h4>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Fiscal Performance Audit</p>
                            </div>
                            <div className="p-5 bg-white dark:bg-brand-primary-dark/60 rounded-3xl border border-slate-100 dark:border-brand-accent/10 w-full shadow-xl backdrop-blur-sm">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.25em]">Health Indicator</p>
                                <p className="text-2xl font-black text-emerald-500 mt-1 uppercase tracking-tighter">
                                    {financialStats.netProfit >= 0 ? "PROFITABLE" : "LOSS RECOVERY"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'payroll' && (
                <div className="space-y-6">
                    <div className="glass-card p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-[var(--brand-radius,1.5rem)]">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <div className="flex p-1 bg-slate-100 dark:bg-brand-primary-dark/40 rounded-[var(--brand-radius,1rem)] border border-slate-200 dark:border-brand-accent/10">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest px-3 sm:px-4 py-1 cursor-pointer focus:ring-0 text-brand-primary dark:text-brand-accent"
                                >
                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest px-3 sm:px-4 py-1 cursor-pointer focus:ring-0 text-brand-primary dark:text-brand-accent"
                                >
                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={handleGeneratePayroll}
                                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary-dark rounded-[var(--brand-radius,1rem)] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95"
                            >
                                <Zap size={14} /> Generate Payroll
                            </button>
                        </div>

                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                placeholder="Search Teachers..."
                                className="pl-12 pr-4 py-2 sm:py-2.5 bg-slate-100 dark:bg-brand-primary-dark/40 border border-slate-200 dark:border-brand-accent/10 rounded-[var(--brand-radius,1rem)] text-xs font-bold w-full sm:w-[260px] focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Mobile Payroll Cards */}
                    <div className="md:hidden space-y-3">
                        {payrollRegistry.map(({ teacher, slip, status }) => (
                            <div key={teacher.id} className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 shadow-md">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                                            {teacher?.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-brand-primary dark:text-white uppercase truncate">{teacher?.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">ID: {teacher?.id}</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0",
                                        status === 'Paid' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" :
                                            status === 'Pending' ? "bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400" :
                                                "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/20"
                                    )}>
                                        {status === 'Not Generated' ? 'Missing' : status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl text-center">
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Base Salary</p>
                                        <p className="text-xs font-black text-brand-primary dark:text-brand-accent">Rs. {(slip?.baseSalary || teacher.baseSalary || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Net Payable</p>
                                        <p className="text-xs font-black text-emerald-600">Rs. {(slip?.netSalary || teacher.baseSalary || 0).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="pt-1">
                                    {status === 'Not Generated' ? (
                                        <button
                                            onClick={handleGeneratePayroll}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-md"
                                        >
                                            <Zap size={12} /> Sync / Generate Slip
                                        </button>
                                    ) : status === 'Pending' ? (
                                        <button
                                            onClick={() => handlePaySalary(slip!)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-md"
                                        >
                                            <CreditCard size={12} /> Pay Now (Rs. {(slip?.netSalary || 0).toLocaleString()})
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handlePrintSalarySlip(slip!)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-white/10 text-brand-primary dark:text-brand-accent rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 border border-slate-200 dark:border-white/10"
                                        >
                                            <Printer size={14} /> Print Salary Slip
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Payroll Table */}
                    <div className="hidden md:block glass-card overflow-hidden border-2 border-slate-100 dark:border-brand-accent/10 shadow-xl rounded-[var(--brand-radius,1.5rem)]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-brand-primary-dark/60">
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Teacher Name</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Month</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Base Salary</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Net Salary</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {payrollRegistry.map(({ teacher, slip, status }) => {
                                    return (
                                        <tr key={teacher.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-[var(--brand-radius,0.75rem)] bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary-dark flex items-center justify-center font-black shadow-lg">
                                                        {teacher?.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-brand-primary dark:text-white uppercase tracking-tight">{teacher?.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase">ID: {teacher?.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedMonth} {selectedYear}</td>
                                            <td className="p-6 text-center text-xs font-black text-brand-primary dark:text-brand-accent uppercase tracking-tighter">Rs. {(slip?.baseSalary || teacher.baseSalary || 0).toLocaleString()}</td>
                                            <td className="p-6 text-center text-xs font-black text-emerald-600 uppercase tracking-tighter">Rs. {(slip?.netSalary || teacher.baseSalary || 0).toLocaleString()}</td>
                                            <td className="p-6 text-center">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                                                    status === 'Paid' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" :
                                                        status === 'Pending' ? "bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400" :
                                                            "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/20"
                                                )}>
                                                    {status === 'Not Generated' ? 'Missing' : status}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    {status === 'Not Generated' ? (
                                                        <button
                                                            onClick={handleGeneratePayroll}
                                                            className="flex items-center gap-2 px-5 py-2 bg-brand-primary text-white rounded-[var(--brand-radius,0.75rem)] text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95"
                                                        >
                                                            <Zap size={12} /> Sync Now
                                                        </button>
                                                    ) : status === 'Pending' ? (
                                                        <button
                                                            onClick={() => handlePaySalary(slip!)}
                                                            className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white rounded-[var(--brand-radius,0.75rem)] text-[9px] font-black uppercase tracking-widest hover:scale-105 hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                                                        >
                                                            <CreditCard size={12} /> Pay Now
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handlePrintSalarySlip(slip!)}
                                                            className="p-2.5 text-slate-400 hover:text-brand-primary dark:hover:text-brand-accent hover:bg-slate-100 dark:hover:bg-white/10 rounded-[var(--brand-radius,0.75rem)] transition-all"
                                                            title="Print Salary Slip"
                                                        >
                                                            <Printer size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'expenses' && (
                <div className="space-y-6">
                    <div className="glass-card p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-[var(--brand-radius,1.5rem)]">
                        <div className="flex items-center gap-3">
                            <h4 className="text-base sm:text-lg font-black uppercase tracking-tight text-brand-primary dark:text-white">Expenses List</h4>
                            <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />
                            <span className="text-xs text-slate-400 font-bold">{expenses.length} Records</span>
                        </div>
                        <button
                            onClick={handleAddExpense}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary-dark rounded-[var(--brand-radius,1rem)] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95 shrink-0"
                        >
                            <PlusCircle size={16} /> Record Expense
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {expenses.length === 0 ? (
                            <div className="col-span-full py-16 sm:py-20 text-center glass-card border-dashed">
                                <TrendingDown size={44} className="text-slate-300 dark:text-white/20 mx-auto mb-3" />
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Zero Expenditures Found</p>
                            </div>
                        ) : (
                            expenses.map(exp => (
                                <div key={exp.id} className="glass-card p-5 sm:p-6 group hover:translate-y-[-4px] transition-all relative overflow-hidden flex flex-col justify-between shadow-md sm:shadow-lg rounded-[var(--brand-radius,1.25rem)] border border-slate-200 dark:border-white/10">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary dark:bg-brand-accent opacity-30 group-hover:opacity-100 transition-opacity" />
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 text-[8px] font-black uppercase tracking-wider rounded-full">{exp.category}</span>
                                            <button
                                                onClick={() => deleteExpense(exp.id)}
                                                className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                                                title="Delete Expense"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <h5 className="text-sm font-black text-brand-primary dark:text-white uppercase mt-1 tracking-tight line-clamp-2">{exp.title}</h5>
                                    </div>
                                    <div className="flex items-end justify-between mt-6 pt-3 border-t border-slate-100 dark:border-white/5">
                                        <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                                            <Calendar size={12} className="shrink-0" /> {exp.date}
                                        </p>
                                        <p className="text-base sm:text-lg font-black text-rose-500 uppercase tracking-tighter">Rs. {exp.amount.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
