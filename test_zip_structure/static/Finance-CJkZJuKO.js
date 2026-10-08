import{r as u,j as e}from"./vendor-framer-D1vKbJ8a.js";import{u as _}from"./index-BtXMVJl_.js";import{c as h}from"./cn-hCdZ21mq.js";import{S as g}from"./vendor-utils-DML6cOpY.js";import{D as H,ad as J,aO as V,aw as v,N as Z,T as R,Y as K,c as T,P as z,aP as W,aQ as Q,Z as X,C as ee}from"./vendor-icons-BVeQKCV0.js";import"./vendor-react-Bce9NwRC.js";import"./vendor-export-B6SaTIxO.js";import"./vendor-firebase-B4Tjn-x7.js";const A=["January","February","March","April","May","June","July","August","September","October","November","December"],L=["Utilities","Rent","Stationery","Maintenance","Miscellaneous","Events"],f=l=>l>=1e7?`Rs. ${(l/1e6).toFixed(1)}M`:l>=1e5?`Rs. ${(l/1e3).toFixed(1)}K`:`Rs. ${l.toLocaleString()}`,ce=()=>{const{teachers:l,students:N,expenses:x,salarySlips:k,addExpense:D,deleteExpense:I,generateSalarySlips:B,updateSalarySlip:F,settings:m}=_(),[b,w]=u.useState("overview"),[c,M]=u.useState(A[new Date().getMonth()]),[o,O]=u.useState(new Date().getFullYear()),[y,G]=u.useState(""),S=t=>{const r=l.find(n=>n.id===t.teacherId),a=window.open("","_blank");if(!a)return;const i=`
            <html>
                <head>
                    <title>Salary Slip - ${r?.name}</title>
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
                                ${m.logo1?`<img src="${m.logo1}" class="logo-box" />`:""}
                                ${m.logo2?`<img src="${m.logo2}" class="logo-box" />`:""}
                            </div>
                            <h1 class="school-title">${m.schoolName||"PIONEER'S SUPERIOR"}</h1>
                            <p class="school-subtitle">${m.subTitle||"Institute of Higher Secondary Education, Attock"}</p>
                            <span class="slip-badge">Salary Statement: ${t.month} ${t.year}</span>
                        </header>

                        <div class="info-section">
                            <div class="info-block">
                                <span class="info-key">Faculty Member</span>
                                <span class="info-val">${r?.name}</span>
                            </div>
                            <div class="info-block">
                                <span class="info-key">Academic ID</span>
                                <span class="info-val">${r?.id||"PST-FAC-001"}</span>
                            </div>
                            <div class="info-block">
                                <span class="info-key">Department / Role</span>
                                <span class="info-val">${r?.subject} • ${r?.role}</span>
                            </div>
                            <div class="info-block">
                                <span class="info-key">Payment Cycle</span>
                                <span class="info-val">${t.month} ${t.year}</span>
                            </div>
                            <div class="info-block">
                                <span class="info-key">Status</span>
                                <span class="info-val" style="color: #10b981;">VERIFIED • PAID</span>
                            </div>
                            <div class="info-block">
                                <span class="info-key">Transaction Date</span>
                                <span class="info-val">${t.paidDate||new Date().toLocaleDateString()}</span>
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
                                    <td style="text-align: right;">${t.baseSalary.toLocaleString()} .00</td>
                                </tr>
                                ${t.allowances.map(n=>`
                                    <tr>
                                        <td>Bonus / Allowance (${n.type})</td>
                                        <td style="text-align: right; color: #10b981;">+ ${n.amount.toLocaleString()} .00</td>
                                    </tr>
                                `).join("")}
                                ${t.deductions.map(n=>`
                                    <tr>
                                        <td>Deductions (${n.type})</td>
                                        <td style="text-align: right; color: #ef4444;">- ${n.amount.toLocaleString()} .00</td>
                                    </tr>
                                `).join("")}
                                <tr class="net-row">
                                    <td>CERTIFIED NET PAYABLE</td>
                                    <td style="text-align: right;">Rs. ${t.netSalary.toLocaleString()} /-</td>
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
        `;a.document.write(i),a.document.close(),setTimeout(()=>a.print(),800)},p=u.useMemo(()=>{const t=N.reduce((s,d)=>Number(s)+Number(d.monthlyFees||0),0),r=x.reduce((s,d)=>Number(s)+Number(d.amount||0),0),a=k.filter(s=>s.month===c&&s.year===o),i=new Set(a.map(s=>s.teacherId)),n=l.filter(s=>s.status==="Active"&&!i.has(s.id)).reduce((s,d)=>s+(d.baseSalary||0),0),E=a.reduce((s,d)=>Number(s)+Number(d.netSalary||0),0)+n,q=a.filter(s=>s.status==="Paid").reduce((s,d)=>Number(s)+Number(d.netSalary||0),0),$=r+E,U=t-$;return{totalFees:t,schoolExpenses:r,totalPayroll:E,paidPayroll:q,totalOutflow:$,netProfit:U,activeSlipsCount:a.filter(s=>s.status==="Paid").length}},[N,x,k,l,c,o]),P=u.useMemo(()=>{const t=l.filter(a=>a.status==="Active"),r=k.filter(a=>a.month===c&&a.year===o);return t.filter(a=>y===""||a.name.toLowerCase().includes(y.toLowerCase())).map(a=>{const i=r.find(n=>n.teacherId===a.id);return{teacher:a,slip:i,id:i?.id||`TEMP-${a.id}`,status:i?.status||"Not Generated"}})},[l,k,c,o,y]),j=async()=>{(await g.fire({title:"Generate Payroll?",text:`This will create salary slips for all active teachers for ${c} ${o}.`,icon:"question",showCancelButton:!0,confirmButtonText:"Yes, Generate",background:document.documentElement.classList.contains("dark")?"#001529":"#ffffff",color:document.documentElement.classList.contains("dark")?"#fbbf24":"#0f172a"})).isConfirmed&&(B(c,o),g.fire({title:"Payroll Generated",icon:"success",timer:1500,showConfirmButton:!1,toast:!0,position:"top-end"}))},C=t=>{g.fire({title:"Confirm Payment",html:`
                <div class="text-left space-y-3 font-outfit">
                    <p class="text-xs uppercase font-black text-slate-400">Teacher: <span class="text-brand-primary dark:text-brand-accent">${l.find(r=>r.id===t.teacherId)?.name}</span></p>
                    <p class="text-xs uppercase font-black text-slate-400">Total Amount: <span class="text-emerald-500 font-black">Rs. ${t.netSalary.toLocaleString()}</span></p>
                    <select id="payment-method" class="swal-input-premium">
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                    </select>
                </div>
            `,showCancelButton:!0,confirmButtonText:"Record Payment",confirmButtonColor:"var(--brand-primary)",background:document.documentElement.classList.contains("dark")?"var(--brand-primary-dark, #001529)":"#ffffff",color:document.documentElement.classList.contains("dark")?"var(--brand-accent, #fbbf24)":"#0f172a",preConfirm:()=>({method:document.getElementById("payment-method").value})}).then(r=>{r.isConfirmed&&(F(t.id,{status:"Paid",paidDate:new Date().toLocaleDateString(),paymentMethod:r.value.method}),g.fire({title:"Payment Recorded",icon:"success",toast:!0,position:"top-end",timer:2e3,showConfirmButton:!1}))})},Y=()=>{g.fire({title:"Record Expense",html:`
                <div class="space-y-4 text-left font-outfit">
                    <div>
                        <label class="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Title</label>
                        <input id="exp-title" class="swal-input-premium" placeholder="e.g. Electric Bill">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Category</label>
                            <select id="exp-category" class="swal-input-premium">
                                ${L.map(t=>`<option value="${t}">${t}</option>`).join("")}
                            </select>
                        </div>
                        <div>
                            <label class="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Amount</label>
                            <input id="exp-amount" type="number" class="swal-input-premium" placeholder="0.00">
                        </div>
                    </div>
                </div>
            `,showCancelButton:!0,confirmButtonText:"Add Expense",background:document.documentElement.classList.contains("dark")?"#001529":"#ffffff",color:document.documentElement.classList.contains("dark")?"#fbbf24":"#0f172a",preConfirm:()=>{const t=document.getElementById("exp-title").value,r=document.getElementById("exp-category").value,a=Number(document.getElementById("exp-amount").value);return!t||!a?(g.showValidationMessage("Please fill all required fields"),!1):{title:t,category:r,amount:a,date:new Date().toLocaleDateString()}}}).then(t=>{t.isConfirmed&&D(t.value)})};return e.jsxs("div",{className:"space-y-8 animate-fade-in pb-32 max-w-[1600px] mx-auto px-4 md:px-6 font-outfit",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6",children:[e.jsxs("div",{className:"flex items-center gap-3 sm:gap-4 min-w-0",children:[e.jsx("div",{className:"w-12 h-12 sm:w-14 sm:h-14 bg-brand-primary dark:bg-brand-accent rounded-[var(--brand-radius,1.25rem)] flex items-center justify-center shadow-xl shrink-0",children:e.jsx(H,{className:"text-white dark:text-brand-primary-dark",size:26})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("h2",{className:"text-xl sm:text-2xl md:text-3xl font-black tracking-tight uppercase text-brand-primary dark:text-brand-accent truncate",children:"Accounts & Finance"}),e.jsx("p",{className:"text-slate-500 dark:text-brand-accent/60 font-medium text-xs sm:text-sm truncate",children:"Money Management & Reports"})]})]}),e.jsxs("div",{className:"w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 p-1 bg-slate-100 dark:bg-brand-primary-dark/30 rounded-[var(--brand-radius,1.25rem)] border border-slate-200 dark:border-brand-accent/10 shadow-sm backdrop-blur-md shrink-0",children:[e.jsx("button",{onClick:()=>w("overview"),className:h("px-3 sm:px-6 py-2 sm:py-2.5 rounded-[var(--brand-radius,1rem)] text-[10px] sm:text-xs font-black uppercase tracking-wider text-center transition-all",b==="overview"?"bg-white dark:bg-brand-accent text-brand-primary dark:text-brand-primary-dark shadow-md":"text-slate-500 hover:text-slate-700"),children:"Overview"}),e.jsx("button",{onClick:()=>w("payroll"),className:h("px-3 sm:px-6 py-2 sm:py-2.5 rounded-[var(--brand-radius,1rem)] text-[10px] sm:text-xs font-black uppercase tracking-wider text-center transition-all",b==="payroll"?"bg-white dark:bg-brand-accent text-brand-primary dark:text-brand-primary-dark shadow-md":"text-slate-500 hover:text-slate-700"),children:"Payroll"}),e.jsx("button",{onClick:()=>w("expenses"),className:h("px-3 sm:px-6 py-2 sm:py-2.5 rounded-[var(--brand-radius,1rem)] text-[10px] sm:text-xs font-black uppercase tracking-wider text-center transition-all",b==="expenses"?"bg-white dark:bg-brand-accent text-brand-primary dark:text-brand-primary-dark shadow-md":"text-slate-500 hover:text-slate-700"),children:"Expenses"})]})]}),b==="overview"&&e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6",children:[e.jsxs("div",{className:"glass-card p-6 border-l-4 border-l-brand-primary group transition-all cursor-default min-h-[160px] flex flex-col justify-between overflow-hidden",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1",children:"Expected Revenue"}),e.jsx("h3",{className:"text-2xl lg:text-3xl font-black text-brand-primary dark:text-brand-accent break-words line-clamp-1 truncate",children:f(p.totalFees)})]}),e.jsxs("div",{className:"flex items-center gap-2 mt-4 text-[10px] font-black text-brand-primary dark:text-brand-accent/60 uppercase tracking-widest",children:[e.jsx(J,{size:14,className:"shrink-0"})," Total Fees"]})]}),e.jsxs("div",{className:"glass-card p-6 border-l-4 border-l-rose-500 group transition-all cursor-default min-h-[160px] flex flex-col justify-between overflow-hidden",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1",children:"Total Expenses"}),e.jsx("h3",{className:"text-2xl lg:text-3xl font-black text-rose-500 break-words line-clamp-1 truncate",children:f(p.totalOutflow)})]}),e.jsxs("div",{className:"flex items-center gap-2 mt-4 text-[10px] font-black text-rose-400 uppercase tracking-widest",children:[e.jsx(V,{size:14,className:"shrink-0"})," Outgoing Money"]})]}),e.jsxs("div",{className:"glass-card p-6 border-l-4 border-l-emerald-500 group transition-all cursor-default min-h-[160px] flex flex-col justify-between overflow-hidden",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1",children:"Net Balance"}),e.jsx("h3",{className:h("text-2xl lg:text-3xl font-black break-words line-clamp-1 truncate",p.netProfit>=0?"text-emerald-500":"text-rose-600"),children:f(p.netProfit)})]}),e.jsxs("div",{className:"flex items-center gap-2 mt-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest",children:[e.jsx(v,{size:14,className:"animate-pulse shrink-0"})," Monthly Profit/Loss"]})]}),e.jsxs("div",{className:"glass-card p-6 border-l-4 border-l-brand-secondary group transition-all cursor-default min-h-[160px] flex flex-col justify-between overflow-hidden text-right lg:text-left",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1",children:"Teacher Salaries"}),e.jsx("h3",{className:"text-2xl lg:text-3xl font-black text-brand-primary dark:text-brand-accent break-words line-clamp-1 truncate",children:f(p.totalPayroll)})]}),e.jsxs("div",{className:"flex items-center lg:justify-start justify-end gap-2 mt-4 text-[10px] font-black text-brand-secondary-dark dark:text-brand-secondary uppercase tracking-widest",children:[e.jsx(Z,{size:14,className:"shrink-0"})," ",p.activeSlipsCount," Paid Slips"]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-8",children:[e.jsxs("div",{className:"lg:col-span-2 glass-card p-8 group overflow-hidden relative min-h-[400px]",children:[e.jsx("div",{className:"absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-primary/10 transition-colors"}),e.jsxs("div",{className:"flex items-center justify-between mb-8 relative",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"text-lg font-black uppercase tracking-tight text-brand-primary dark:text-brand-accent",children:"Expense Distribution"}),e.jsx("p",{className:"text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest",children:"Categorical Expenditure Analysis"})]}),e.jsx(R,{className:"text-brand-primary dark:text-brand-accent opacity-20 group-hover:opacity-100 transition-opacity",size:24})]}),e.jsx("div",{className:"space-y-6",children:L.map(t=>{const r=x.filter(i=>i.category===t).reduce((i,n)=>i+n.amount,0),a=r/(p.schoolExpenses||1)*100;return e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between items-center text-[10px] font-black uppercase tracking-widest",children:[e.jsx("span",{className:"text-slate-600 dark:text-white/60",children:t}),e.jsxs("span",{className:"text-slate-400",children:[f(r)," (",a.toFixed(0),"%)"]})]}),e.jsx("div",{className:"h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden",children:e.jsx("div",{className:"h-full bg-brand-primary dark:bg-brand-accent rounded-full transition-all duration-1000",style:{width:`${a}%`}})})]},t)})})]}),e.jsxs("div",{className:"glass-card p-8 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-white to-slate-50 dark:from-brand-primary-dark dark:to-brand-primary-dark/30 min-h-[400px] rounded-[var(--brand-radius,2rem)] border border-slate-200 dark:border-brand-accent/5",children:[e.jsxs("div",{className:"w-24 h-24 rounded-full border-8 border-emerald-500/10 flex items-center justify-center relative shadow-inner",children:[e.jsx("div",{className:"absolute inset-0 rounded-full border-t-8 border-emerald-500 animate-[spin_3s_linear_infinite]"}),e.jsx(R,{size:32,className:"text-emerald-500"})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-xl font-black uppercase tracking-tighter text-brand-primary dark:text-white",children:"Institutional Status"}),e.jsx("p",{className:"text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest",children:"Fiscal Performance Audit"})]}),e.jsxs("div",{className:"p-5 bg-white dark:bg-brand-primary-dark/60 rounded-3xl border border-slate-100 dark:border-brand-accent/10 w-full shadow-xl backdrop-blur-sm",children:[e.jsx("p",{className:"text-[10px] font-black text-emerald-600 uppercase tracking-[0.25em]",children:"Health Indicator"}),e.jsx("p",{className:"text-2xl font-black text-emerald-500 mt-1 uppercase tracking-tighter",children:p.netProfit>=0?"PROFITABLE":"LOSS RECOVERY"})]})]})]})]}),b==="payroll"&&e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"glass-card p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-[var(--brand-radius,1.5rem)]",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-2 sm:gap-4",children:[e.jsxs("div",{className:"flex p-1 bg-slate-100 dark:bg-brand-primary-dark/40 rounded-[var(--brand-radius,1rem)] border border-slate-200 dark:border-brand-accent/10",children:[e.jsx("select",{value:c,onChange:t=>M(t.target.value),className:"bg-transparent border-none text-[10px] font-black uppercase tracking-widest px-3 sm:px-4 py-1 cursor-pointer focus:ring-0 text-brand-primary dark:text-brand-accent",children:A.map(t=>e.jsx("option",{value:t,children:t},t))}),e.jsx("select",{value:o,onChange:t=>O(Number(t.target.value)),className:"bg-transparent border-none text-[10px] font-black uppercase tracking-widest px-3 sm:px-4 py-1 cursor-pointer focus:ring-0 text-brand-primary dark:text-brand-accent",children:[2024,2025,2026].map(t=>e.jsx("option",{value:t,children:t},t))})]}),e.jsxs("button",{onClick:j,className:"flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary-dark rounded-[var(--brand-radius,1rem)] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95",children:[e.jsx(v,{size:14})," Generate Payroll"]})]}),e.jsxs("div",{className:"relative w-full sm:w-auto",children:[e.jsx(K,{className:"absolute left-4 top-1/2 -translate-y-1/2 text-slate-400",size:16}),e.jsx("input",{placeholder:"Search Teachers...",className:"pl-12 pr-4 py-2 sm:py-2.5 bg-slate-100 dark:bg-brand-primary-dark/40 border border-slate-200 dark:border-brand-accent/10 rounded-[var(--brand-radius,1rem)] text-xs font-bold w-full sm:w-[260px] focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none",value:y,onChange:t=>G(t.target.value)})]})]}),e.jsx("div",{className:"md:hidden space-y-3",children:P.map(({teacher:t,slip:r,status:a})=>e.jsxs("div",{className:"glass-card p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 shadow-md",children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-3 min-w-0",children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black shrink-0 shadow-sm",children:t?.name.charAt(0)}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"text-sm font-black text-brand-primary dark:text-white uppercase truncate",children:t?.name}),e.jsxs("p",{className:"text-[10px] font-bold text-slate-400 uppercase",children:["ID: ",t?.id]})]})]}),e.jsx("span",{className:h("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0",a==="Paid"?"bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400":a==="Pending"?"bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400":"bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/20"),children:a==="Not Generated"?"Missing":a})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl text-center",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[8px] font-black uppercase tracking-widest text-slate-400",children:"Base Salary"}),e.jsxs("p",{className:"text-xs font-black text-brand-primary dark:text-brand-accent",children:["Rs. ",(r?.baseSalary||t.baseSalary||0).toLocaleString()]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[8px] font-black uppercase tracking-widest text-slate-400",children:"Net Payable"}),e.jsxs("p",{className:"text-xs font-black text-emerald-600",children:["Rs. ",(r?.netSalary||t.baseSalary||0).toLocaleString()]})]})]}),e.jsx("div",{className:"pt-1",children:a==="Not Generated"?e.jsxs("button",{onClick:j,className:"w-full flex items-center justify-center gap-2 py-2.5 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-md",children:[e.jsx(v,{size:12})," Sync / Generate Slip"]}):a==="Pending"?e.jsxs("button",{onClick:()=>C(r),className:"w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-md",children:[e.jsx(T,{size:12})," Pay Now (Rs. ",(r?.netSalary||0).toLocaleString(),")"]}):e.jsxs("button",{onClick:()=>S(r),className:"w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-white/10 text-brand-primary dark:text-brand-accent rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 border border-slate-200 dark:border-white/10",children:[e.jsx(z,{size:14})," Print Salary Slip"]})})]},t.id))}),e.jsx("div",{className:"hidden md:block glass-card overflow-hidden border-2 border-slate-100 dark:border-brand-accent/10 shadow-xl rounded-[var(--brand-radius,1.5rem)]",children:e.jsxs("table",{className:"w-full border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-slate-50 dark:bg-brand-primary-dark/60",children:[e.jsx("th",{className:"p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left",children:"Teacher Name"}),e.jsx("th",{className:"p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center",children:"Month"}),e.jsx("th",{className:"p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center",children:"Base Salary"}),e.jsx("th",{className:"p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center",children:"Net Salary"}),e.jsx("th",{className:"p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center",children:"Status"}),e.jsx("th",{className:"p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center",children:"Actions"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 dark:divide-white/5",children:P.map(({teacher:t,slip:r,status:a})=>e.jsxs("tr",{className:"hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group",children:[e.jsx("td",{className:"p-6",children:e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-10 h-10 rounded-[var(--brand-radius,0.75rem)] bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary-dark flex items-center justify-center font-black shadow-lg",children:t?.name.charAt(0)}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-black text-brand-primary dark:text-white uppercase tracking-tight",children:t?.name}),e.jsxs("p",{className:"text-[10px] font-bold text-slate-400 mt-0.5 uppercase",children:["ID: ",t?.id]})]})]})}),e.jsxs("td",{className:"p-6 text-center text-xs font-bold text-slate-500 uppercase tracking-widest",children:[c," ",o]}),e.jsxs("td",{className:"p-6 text-center text-xs font-black text-brand-primary dark:text-brand-accent uppercase tracking-tighter",children:["Rs. ",(r?.baseSalary||t.baseSalary||0).toLocaleString()]}),e.jsxs("td",{className:"p-6 text-center text-xs font-black text-emerald-600 uppercase tracking-tighter",children:["Rs. ",(r?.netSalary||t.baseSalary||0).toLocaleString()]}),e.jsx("td",{className:"p-6 text-center",children:e.jsx("span",{className:h("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",a==="Paid"?"bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400":a==="Pending"?"bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400":"bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/20"),children:a==="Not Generated"?"Missing":a})}),e.jsx("td",{className:"p-6 text-center",children:e.jsx("div",{className:"flex items-center justify-center gap-3",children:a==="Not Generated"?e.jsxs("button",{onClick:j,className:"flex items-center gap-2 px-5 py-2 bg-brand-primary text-white rounded-[var(--brand-radius,0.75rem)] text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95",children:[e.jsx(v,{size:12})," Sync Now"]}):a==="Pending"?e.jsxs("button",{onClick:()=>C(r),className:"flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white rounded-[var(--brand-radius,0.75rem)] text-[9px] font-black uppercase tracking-widest hover:scale-105 hover:bg-emerald-600 transition-all shadow-lg active:scale-95",children:[e.jsx(T,{size:12})," Pay Now"]}):e.jsx("button",{onClick:()=>S(r),className:"p-2.5 text-slate-400 hover:text-brand-primary dark:hover:text-brand-accent hover:bg-slate-100 dark:hover:bg-white/10 rounded-[var(--brand-radius,0.75rem)] transition-all",title:"Print Salary Slip",children:e.jsx(z,{size:18})})})})]},t.id))})]})})]}),b==="expenses"&&e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"glass-card p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-[var(--brand-radius,1.5rem)]",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("h4",{className:"text-base sm:text-lg font-black uppercase tracking-tight text-brand-primary dark:text-white",children:"Expenses List"}),e.jsx("div",{className:"h-4 w-px bg-slate-200 dark:bg-white/10 mx-1"}),e.jsxs("span",{className:"text-xs text-slate-400 font-bold",children:[x.length," Records"]})]}),e.jsxs("button",{onClick:Y,className:"w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary-dark rounded-[var(--brand-radius,1rem)] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95 shrink-0",children:[e.jsx(W,{size:16})," Record Expense"]})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6",children:x.length===0?e.jsxs("div",{className:"col-span-full py-16 sm:py-20 text-center glass-card border-dashed",children:[e.jsx(Q,{size:44,className:"text-slate-300 dark:text-white/20 mx-auto mb-3"}),e.jsx("p",{className:"text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]",children:"Zero Expenditures Found"})]}):x.map(t=>e.jsxs("div",{className:"glass-card p-5 sm:p-6 group hover:translate-y-[-4px] transition-all relative overflow-hidden flex flex-col justify-between shadow-md sm:shadow-lg rounded-[var(--brand-radius,1.25rem)] border border-slate-200 dark:border-white/10",children:[e.jsx("div",{className:"absolute top-0 left-0 w-1.5 h-full bg-brand-primary dark:bg-brand-accent opacity-30 group-hover:opacity-100 transition-opacity"}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex justify-between items-start mb-3",children:[e.jsx("span",{className:"px-2.5 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 text-[8px] font-black uppercase tracking-wider rounded-full",children:t.category}),e.jsx("button",{onClick:()=>I(t.id),className:"p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all",title:"Delete Expense",children:e.jsx(X,{size:14})})]}),e.jsx("h5",{className:"text-sm font-black text-brand-primary dark:text-white uppercase mt-1 tracking-tight line-clamp-2",children:t.title})]}),e.jsxs("div",{className:"flex items-end justify-between mt-6 pt-3 border-t border-slate-100 dark:border-white/5",children:[e.jsxs("p",{className:"text-[9px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider",children:[e.jsx(ee,{size:12,className:"shrink-0"})," ",t.date]}),e.jsxs("p",{className:"text-base sm:text-lg font-black text-rose-500 uppercase tracking-tighter",children:["Rs. ",t.amount.toLocaleString()]})]})]},t.id))})]})]})};export{ce as FinancePage};
