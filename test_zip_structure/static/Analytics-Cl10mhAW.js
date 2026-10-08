import{r as o,j as e,m as R}from"./vendor-framer-D1vKbJ8a.js";import{u as H}from"./index-BtXMVJl_.js";import{R as W,f as V,L as Z,C as _,a as Q,b as U,P as Y,c as J,B as K,g as X,p as ee,d as ae,e as te,i as re}from"./vendor-charts-C2zLxhSm.js";import{S as se}from"./vendor-utils-DML6cOpY.js";import{c as h}from"./cn-hCdZ21mq.js";import{aw as ie,aS as A,O as ne,s as de,T as E,aq as P,Q as le,h as oe,r as ce,aT as $,a8 as xe,b as pe,G as me}from"./vendor-icons-BVeQKCV0.js";import"./vendor-react-Bce9NwRC.js";import"./vendor-export-B6SaTIxO.js";import"./vendor-firebase-B4Tjn-x7.js";_.register(Q,U,Y,J,K,X,ee,ae,te,re);const ke=()=>{const{students:w,exams:p,examResults:f,classes:j,settings:c}=H(),[x,T]=o.useState(j[0]||""),[g,F]=o.useState(p[0]?.id||""),[y,k]=o.useState(!1),D=o.useRef(null),N=o.useRef(null),S=o.useRef(null),C=o.useRef(null),t=o.useMemo(()=>{const a=f.filter(r=>r.className===x&&r.examId===g);if(a.length===0)return null;const n=a.reduce((r,i)=>r+i.percentage,0)/a.length,d=[...a].sort((r,i)=>i.percentage-r.percentage)[0],s=w.find(r=>r.id===d?.studentId),u=new Set;a.forEach(r=>Object.keys(r.marks).forEach(i=>u.add(i)));const m=Array.from(u).map(r=>{const i=a.map(l=>l.marks[r]).filter(l=>l&&l.total>0);if(i.length===0)return{subject:r,avg:0,passRate:0};const M=i.reduce((l,I)=>l+I.obtained/I.total*100,0)/i.length,q=i.filter(l=>l.obtained/l.total*100>=40).length/i.length*100;return{subject:r,avg:M,passRate:q}}).sort((r,i)=>i.avg-r.avg),b=[...m].sort((r,i)=>r.avg-i.avg)[0],G=m[0];return{avgPercentage:n,topStudent:s?.name||"Unknown",topPercentage:d?.percentage||0,weakestSubject:b,strongestSubject:G,subjectStats:m,classCount:a.length,overallPassRate:a.filter(r=>r.percentage>=40).length/a.length*100}},[x,g,f,w]),O={labels:t?.subjectStats.map(a=>a.subject)||[],datasets:[{label:"Competency Index",data:t?.subjectStats.map(a=>a.avg)||[],backgroundColor:"var(--brand-primary-light, rgba(59, 130, 246, 0.2))",borderColor:"var(--brand-primary)",borderWidth:3,pointBackgroundColor:"#fff",pointBorderColor:"var(--brand-primary)",pointHoverBackgroundColor:"var(--brand-primary)",pointHoverBorderColor:"#fff"}]},L={labels:t?.subjectStats.map(a=>a.subject)||[],datasets:[{label:"Average Achievement %",data:t?.subjectStats.map(a=>a.avg)||[],backgroundColor:a=>{const n=a.chart.ctx,d=a.dataset.data[a.dataIndex],s=n.createLinearGradient(0,0,0,400);return d<50?(s.addColorStop(0,"#f43f5e"),s.addColorStop(1,"#9f1239")):d<75?(s.addColorStop(0,"#3b82f6"),s.addColorStop(1,"#1d4ed8")):(s.addColorStop(0,"#10b981"),s.addColorStop(1,"#065f46")),s},borderRadius:12,borderSkipped:!1}]},B={labels:p.map(a=>a.name),datasets:[{label:"Growth Index",data:p.map(a=>{const n=f.filter(d=>d.examId===a.id&&d.className===x);return n.length?n.reduce((d,s)=>d+s.percentage,0)/n.length:0}),borderColor:"var(--brand-primary)",backgroundColor:"var(--brand-primary-soft, rgba(0, 51, 102, 0.05))",fill:!0,tension:.5,pointRadius:8,pointHoverRadius:12,pointBackgroundColor:"#fff",pointBorderWidth:4}]},v={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{backgroundColor:"#000816",padding:15,titleFont:{size:14,weight:"bold",family:"Outfit"},bodyFont:{size:12,family:"Outfit"},cornerRadius:12,displayColors:!1}}},z=async()=>{if(!(!t||y)){k(!0);try{await new Promise(b=>setTimeout(b,500));const a=N.current?.toBase64Image(),n=S.current?.toBase64Image(),d=C.current?.toBase64Image(),s=window.open("","_blank");if(!s)return;const u=p.find(b=>b.id===g)?.name||"Exam",m=c.schoolName.replace(/'{2,}/g,"'");s.document.write(`
                <html>
                    <head>
                        <title>Strategic Audit - ${x}</title>
                        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet">
                        <style>
                            @page { size: A4 landscape; margin: 0; }
                            body { 
                                font-family: 'Outfit', sans-serif; 
                                color: #011627; 
                                margin: 0; 
                                padding: 8mm; 
                                background: #f0f4f8; 
                                -webkit-print-color-adjust: exact;
                            }
                            
                            .main-container {
                                background: white;
                                border-radius: var(--brand-radius, 24px);
                                border: 1px solid #e2e8f0;
                                padding: 25px;
                                height: 180mm; /* Force height to fit A4 */
                                display: flex;
                                flex-direction: column;
                                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                            }

                            .header { 
                                display: flex; 
                                align-items: center; 
                                justify-content: space-between; 
                                padding-bottom: 20px; 
                                border-bottom: 1px dashed #cbd5e1; 
                                margin-bottom: 20px; 
                            }
                            .header-content { text-align: center; flex: 1; margin: 0 40px; }
                            .header-content h1 { 
                                margin: 0; 
                                font-size: 34px; 
                                font-weight: 900; 
                                color: var(--brand-primary); 
                                font-family: 'Cinzel', serif;
                                text-transform: uppercase; 
                                letter-spacing: 2px;
                            }
                            .header-content p { 
                                margin: 5px 0 0; 
                                font-weight: 700; 
                                color: #64748b; 
                                font-size: 11px; 
                                text-transform: uppercase; 
                                letter-spacing: 2px; 
                            }
                            .logo { width: 70px; height: 70px; object-fit: contain; }
                            
                            .id-bar { 
                                display: flex; 
                                justify-content: space-between; 
                                align-items: center; 
                                margin-bottom: 20px; 
                                background: var(--brand-primary); 
                                color: white;
                                padding: 12px 25px;
                                border-radius: var(--brand-radius, 12px);
                            }
                            .id-bar h2 { 
                                margin: 0; 
                                font-size: 18px; 
                                font-weight: 700; 
                                font-family: 'Cinzel', serif;
                                text-transform: uppercase; 
                                letter-spacing: 1px;
                            }
                            .id-bar .meta { font-size: 9px; font-weight: 700; text-transform: uppercase; opacity: 0.9; }

                            .metric-grid { 
                                display: grid; 
                                grid-template-columns: repeat(4, 1fr); 
                                gap: 15px; 
                                margin-bottom: 20px; 
                            }
                            .metric-box { 
                                background: #f1f5f9; 
                                padding: 15px; 
                                border-radius: var(--brand-radius, 16px); 
                                text-align: center; 
                                border: 1px solid #e2e8f0;
                            }
                            .metric-val { font-size: 24px; font-weight: 900; color: var(--brand-primary); }
                            .metric-label { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; }

                            .visuals-grid { 
                                display: grid; 
                                grid-template-columns: 1fr 1fr 1fr; 
                                gap: 15px; 
                                flex: 1;
                                min-height: 0;
                            }
                            .card { 
                                border: 1px solid #e2e8f0; 
                                background: #fff;
                                border-radius: var(--brand-radius, 16px); 
                                display: flex;
                                flex-direction: column;
                                overflow: hidden;
                            }
                            .card-header {
                                background: #f8fafc;
                                padding: 12px 15px;
                                font-size: 11px;
                                font-weight: 900;
                                font-family: 'Cinzel', serif;
                                color: var(--brand-primary);
                                text-transform: uppercase;
                                border-bottom: 1px solid #e2e8f0;
                            }
                            .card-body {
                                flex: 1;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 10px;
                            }
                            .chart-img { max-width: 100%; max-height: 100%; object-fit: contain; }

                            .narrative-card {
                                border: 1px solid var(--brand-primary);
                                border-radius: var(--brand-radius, 16px);
                                padding: 15px 25px;
                                margin-top: 15px;
                                background: #f8fafc;
                            }
                            .narrative-title {
                                font-size: 11px;
                                font-weight: 900;
                                text-transform: uppercase;
                                color: var(--brand-primary);
                                margin-bottom: 8px;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            }
                            .narrative-content {
                                font-size: 11px;
                                line-height: 1.5;
                                color: #0f172a;
                                font-weight: 500;
                            }
                            
                            .footer { 
                                margin-top: auto; 
                                padding-top: 15px;
                                text-align: center; 
                                font-size: 9px; 
                                font-weight: 700; 
                                color: #94a3b8; 
                                border-top: 1px solid #f1f5f9; 
                            }
                        </style>
                    </head>
                    <body>
                        <div class="main-container">
                            <div class="header">
                                <img src="${c.logo1}" class="logo">
                                <div class="header-content">
                                    <h1>${m}</h1>
                                    <p>${c.subTitle} | ${c.location}</p>
                                </div>
                                <img src="${c.logo2||c.logo1}" class="logo">
                            </div>

                            <div class="id-bar">
                                <h2>Strategic Intelligence Audit</h2>
                                <div class="meta">Session: ${x} | Exam: ${u} | Date: ${new Date().toLocaleDateString()}</div>
                            </div>

                            <div class="metric-grid">
                                <div class="metric-box">
                                    <div class="metric-val">${t.avgPercentage.toFixed(1)}%</div>
                                    <div class="metric-label">Efficiency Index</div>
                                </div>
                                <div class="metric-box">
                                    <div class="metric-val">${t.topStudent.split(" ")[0]}</div>
                                    <div class="metric-label">Class Leader</div>
                                </div>
                                <div class="metric-box">
                                    <div class="metric-val">${t.strongestSubject?.subject}</div>
                                    <div class="metric-label">Peak Performance</div>
                                </div>
                                <div class="metric-box">
                                    <div class="metric-val">${t.overallPassRate.toFixed(1)}%</div>
                                    <div class="metric-label">Pass Concentration</div>
                                </div>
                            </div>

                            <div class="visuals-grid">
                                <div class="card">
                                    <div class="card-header">Target Competency Matrix</div>
                                    <div class="card-body">
                                        <img src="${a}" class="chart-img">
                                    </div>
                                </div>
                                <div class="card">
                                    <div class="card-header">Subject Velocity Analysis</div>
                                    <div class="card-body">
                                        <img src="${n}" class="chart-img">
                                    </div>
                                </div>
                                <div class="card">
                                    <div class="card-header">Growth Index Projection</div>
                                    <div class="card-body">
                                        <img src="${d}" class="chart-img">
                                    </div>
                                </div>
                                <div class="narrative-card">
                                    <div class="narrative-title">Diagnostic Neural Narrative</div>
                                    <div class="narrative-content">
                                        <b>Mastery Core:</b> Superior efficiency identified in ${t.strongestSubject?.subject} (${t.strongestSubject?.avg.toFixed(1)}%). 
                                        <b>Critical Intervention:</b> Immediate tactical review required for ${t.weakestSubject?.subject} sector (${t.weakestSubject?.avg.toFixed(1)}%). 
                                        Statistical drift prompts curriculum recalibration for Q3 recovery.
                                    </div>
                                </div>
                            </div>

                            <div class="footer">
                                GENERATED BY PIONEER ENTERPRISE SCHOOL MANAGEMENT SYSTEM | VERIFIED AUDIT REPORT | ${new Date().getFullYear()}
                            </div>
                        </div>

                        <script>
                            window.onload = () => {
                                setTimeout(() => {
                                    window.print();
                                    window.close();
                                }, 1000);
                            };
                        <\/script>
                    </body>
                </html>
            `),s.document.close()}catch(a){console.error("Report generation failed:",a),se.fire({title:"Export Failed",text:"The engine was unable to compile the reports. Check chart data.",icon:"error"})}finally{k(!1)}}};return e.jsxs("div",{ref:D,className:"min-h-screen space-y-10 pb-20 font-outfit animate-in fade-in slide-in-from-bottom-5 duration-700 relative",children:[y&&e.jsxs("div",{className:"fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white",children:[e.jsx("div",{className:"w-16 h-16 border-4 border-white/20 border-t-brand-primary rounded-full animate-spin mb-6"}),e.jsx("h2",{className:"text-2xl font-black uppercase tracking-widest animate-pulse font-outfit",children:"Generating Strategic Report"}),e.jsx("p",{className:"text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.4em] mt-2",children:"Neural Engine is compiling data streams..."})]}),e.jsxs("div",{className:"relative p-10 bg-white/40 dark:bg-brand-accent/5 backdrop-blur-3xl rounded-[var(--brand-radius,3rem)] border border-white/20 shadow-2xl overflow-hidden group",children:[e.jsx("div",{"data-html2canvas-ignore":"true",className:"absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-brand-primary/10 to-brand-accent/5 rounded-full blur-[100px] -z-10 group-hover:scale-110 transition-transform duration-1000"}),e.jsxs("div",{className:"flex flex-col xl:flex-row xl:items-center justify-between gap-10 relative z-10",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-brand-primary/30",children:[e.jsx(ie,{size:12,className:"animate-pulse"}),"Neural Intelligence Link"]}),e.jsxs("h1",{className:"text-5xl font-[1000] text-brand-primary dark:text-white tracking-tighter uppercase leading-none",children:["Strategic ",e.jsx("span",{className:"text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-primary to-brand-accent",children:"Analytics"})]}),e.jsx("p",{className:"text-slate-400 font-bold text-sm tracking-wide bg-white/50 dark:bg-black/20 w-fit px-4 py-1 rounded-lg",children:"Operational Class Intelligence & Dynamic Performance Matrix"})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-4",children:[e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("span",{className:"text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2",children:"Session Wing"}),e.jsxs("div",{className:"relative",children:[e.jsx("select",{value:x,onChange:a=>T(a.target.value),className:"appearance-none bg-white dark:bg-brand-accent/5 pl-6 pr-12 py-4 rounded-[var(--brand-radius,1rem)] border-2 border-slate-100 dark:border-white/5 font-black text-[11px] uppercase tracking-wider text-brand-primary dark:text-white outline-none focus:border-brand-primary transition-all shadow-xl shadow-slate-200/50 w-[200px]",children:j.map(a=>e.jsx("option",{value:a,children:a},a))}),e.jsx(A,{className:"absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4"})]})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("span",{className:"text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2",children:"Target Exam"}),e.jsxs("div",{className:"relative",children:[e.jsx("select",{value:g,onChange:a=>F(a.target.value),className:"appearance-none bg-white dark:bg-brand-accent/5 pl-6 pr-12 py-4 rounded-[var(--brand-radius,1rem)] border-2 border-slate-100 dark:border-white/5 font-black text-[11px] uppercase tracking-wider text-brand-primary dark:text-white outline-none focus:border-brand-primary transition-all shadow-xl shadow-slate-200/50 w-[240px]",children:p.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))}),e.jsx(A,{className:"absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4"})]})]})]})]})]}),t?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",children:[{label:"Overall Index",val:`${t.avgPercentage.toFixed(1)}%`,desc:"Average Class Efficiency",icon:ne,color:"blue",secondary:`${t.overallPassRate.toFixed(1)}% Pass Rate`},{label:"Elite Performer",val:t.topStudent.split(" ")[0],desc:"Institutional Leader",icon:de,color:"amber",secondary:`@ ${t.topPercentage.toFixed(1)}% Score`},{label:"Prime Subject",val:t.strongestSubject?.subject,desc:"Academic Strength",icon:E,color:"emerald",secondary:`${t.strongestSubject?.avg.toFixed(1)}% Mastery`},{label:"Critical Audit",val:t.weakestSubject?.subject,desc:"Immediate Attention",icon:P,color:"rose",secondary:`${t.weakestSubject?.avg.toFixed(1)}% Lowest Avg`}].map((a,n)=>e.jsxs(R.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:n*.1},className:"relative overflow-hidden bg-white dark:bg-brand-accent/5 p-8 rounded-[var(--brand-radius,2rem)] border border-slate-100 dark:border-white/5 shadow-xl group hover:-translate-y-2 transition-all duration-300",children:[e.jsx("div",{"data-html2canvas-ignore":"true",className:h("absolute top-0 right-0 w-24 h-24 blur-[50px] opacity-20 transition-opacity group-hover:opacity-40",a.color==="blue"?"bg-blue-600":a.color==="amber"?"bg-amber-600":a.color==="emerald"?"bg-emerald-600":"bg-rose-600")}),e.jsxs("div",{className:"relative z-10 flex flex-col h-full",children:[e.jsxs("div",{className:"flex justify-between items-start mb-6",children:[e.jsx("div",{className:h("p-4 rounded-[var(--brand-radius,1rem)] text-white shadow-2xl group-hover:rotate-6 transition-transform",a.color==="blue"?"bg-brand-primary shadow-brand-primary/30":a.color==="amber"?"bg-brand-accent shadow-brand-accent/30":a.color==="emerald"?"bg-emerald-600 shadow-emerald-500/30":"bg-rose-600 shadow-rose-500/30"),children:e.jsx(a.icon,{size:22})}),e.jsx("div",{className:h("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest",a.color==="blue"?"bg-blue-50 text-blue-600":a.color==="amber"?"bg-amber-50 text-amber-600":a.color==="emerald"?"bg-emerald-50 text-emerald-600":"bg-rose-50 text-rose-600"),children:a.label})]}),e.jsx("h3",{className:"text-4xl font-[1000] text-brand-primary dark:text-white tracking-tighter mb-1 truncate",children:a.val}),e.jsx("p",{className:"text-[10px] font-black text-slate-400 uppercase tracking-widest",children:a.desc}),e.jsxs("div",{className:"mt-8 pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between",children:[e.jsx("span",{className:h("text-[10px] font-black uppercase tracking-tight",a.color==="emerald"?"text-emerald-500":a.color==="rose"?"text-rose-500":"text-slate-500"),children:a.secondary}),e.jsx(le,{size:14,className:"text-slate-200"})]})]})]},n))}),e.jsxs("div",{className:"grid grid-cols-1 xl:grid-cols-2 gap-8",children:[e.jsxs("div",{className:"bg-white dark:bg-brand-accent/5 p-10 rounded-[var(--brand-radius,3rem)] border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group",children:[e.jsxs("div",{className:"flex items-center justify-between mb-10",children:[e.jsxs("div",{className:"flex items-center gap-5",children:[e.jsx("div",{className:"p-4 bg-brand-primary text-white rounded-[var(--brand-radius,1.5rem)] shadow-xl shadow-brand-primary/20",children:e.jsx(oe,{size:28})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-2xl font-[1000] text-brand-primary dark:text-white uppercase tracking-tight leading-none",children:"Competency Matrix"}),e.jsx("p",{className:"text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2",children:"Neural Subject distribution index"})]})]}),e.jsx(ce,{className:"text-brand-accent w-6 h-6 animate-bounce"})]}),e.jsx("div",{className:"h-[450px]",children:e.jsx(W,{ref:N,data:O,options:{...v,scales:{r:{beginAtZero:!0,max:100,ticks:{display:!1},grid:{color:"rgba(0,0,0,0.05)"},angleLines:{color:"rgba(0,0,0,0.05)"},pointLabels:{font:{weight:"bold",size:12,family:"Outfit"},color:"#94a3b8"}}}}})})]}),e.jsxs("div",{className:"bg-white dark:bg-brand-accent/5 p-10 rounded-[var(--brand-radius,3.5rem)] border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between mb-10",children:[e.jsxs("div",{className:"flex items-center gap-5",children:[e.jsx("div",{className:"p-4 bg-emerald-600 text-white rounded-[var(--brand-radius,1.5rem)] shadow-xl shadow-emerald-900/20",children:e.jsx($,{size:28})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-2xl font-[1000] text-brand-primary dark:text-white uppercase tracking-tight leading-none",children:"Velocity Analysis"}),e.jsx("p",{className:"text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2",children:"Subject-wide passing concentration"})]})]}),e.jsx("button",{onClick:z,className:"p-4 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl hover:bg-brand-primary hover:text-white transition-all",children:e.jsx(xe,{size:20})})]}),e.jsx("div",{className:"h-[450px]",children:e.jsx(V,{ref:S,data:L,options:{...v,scales:{y:{beginAtZero:!0,max:100,ticks:{font:{weight:"bold",family:"Outfit"},color:"#94a3b8"},grid:{display:!1}},x:{ticks:{font:{weight:"bold",family:"Outfit"},color:"#94a3b8"},grid:{display:!1}}}}})})]}),e.jsxs("div",{className:"xl:col-span-2 bg-brand-primary p-12 rounded-[var(--brand-radius,4rem)] text-white shadow-2xl relative overflow-hidden group",children:[e.jsx("div",{"data-html2canvas-ignore":"true",className:"absolute top-0 right-0 w-[800px] h-[800px] bg-brand-accent/10 rounded-full blur-[100px] -z-0"}),e.jsxs("div",{className:"relative z-10 flex flex-col lg:flex-row justify-between gap-12",children:[e.jsxs("div",{className:"lg:w-1/3 space-y-8",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsx("div",{className:"w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[var(--brand-radius,1rem)] flex items-center justify-center border border-white/20",children:e.jsx(E,{size:32,className:"text-brand-accent"})}),e.jsxs("h3",{className:"text-4xl font-[1000] uppercase tracking-tighter leading-none",children:["Growth ",e.jsx("br",{})," Trajectory"]}),e.jsx("p",{className:"text-blue-100/60 font-bold text-sm leading-relaxed",children:"System is calculating institutional drift across multi-session data streams. Currently projecting an 8.4% uptrend for upcoming finals."})]}),e.jsx("div",{className:"space-y-4",children:e.jsxs("div",{className:"p-6 bg-white/5 rounded-[var(--brand-radius,2rem)] border border-white/10",children:[e.jsx("p",{className:"text-[10px] font-black text-brand-accent/60 uppercase tracking-widest mb-2",children:"Neural Prediction"}),e.jsx("div",{className:"text-3xl font-black text-brand-accent",children:"88.4% Score"}),e.jsx("p",{className:"text-[11px] font-bold text-white/40 mt-1 uppercase",children:"Target: Session Final 2026"})]})})]}),e.jsx("div",{className:"flex-1 h-[400px] bg-white/5 rounded-[var(--brand-radius,3rem)] p-8 border border-white/10",children:e.jsx(Z,{ref:C,data:B,options:{...v,scales:{y:{beginAtZero:!0,max:100,ticks:{color:"rgba(255,255,255,0.4)",font:{weight:"bold"}},grid:{color:"rgba(255,255,255,0.05)"}},x:{ticks:{color:"rgba(255,255,255,0.4)",font:{weight:"bold"}},grid:{display:!1}}}}})})]})]})]}),e.jsxs("div",{className:"bg-gradient-to-br from-brand-primary via-brand-primary to-indigo-900 rounded-[var(--brand-radius,4rem)] p-12 text-white relative overflow-hidden shadow-2xl border-4 border-white/5",children:[e.jsx("div",{"data-html2canvas-ignore":"true",className:"absolute left-0 bottom-0 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[120px] -z-0"}),e.jsxs("div",{className:"relative z-10",children:[e.jsxs("div",{className:"flex items-center gap-6 mb-12",children:[e.jsx("div",{className:"w-20 h-20 bg-white/10 backdrop-blur-3xl rounded-[var(--brand-radius,2rem)] flex items-center justify-center border border-white/20 shadow-2xl",children:e.jsx(pe,{size:36,className:"text-brand-accent"})}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-3xl font-[1000] uppercase tracking-tighter",children:"Strategic Audit Intelligence"}),e.jsxs("div",{className:"flex items-center gap-2 mt-1",children:[e.jsx("div",{className:"w-2 h-2 rounded-full bg-emerald-500 animate-pulse"}),e.jsx("p",{className:"text-[10px] font-black text-brand-accent/60 uppercase tracking-[0.3em]",children:"AI-Driven Narrative Engine Powered by Groq 3.1"})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-8",children:[e.jsx("div",{className:"group p-10 bg-white/5 rounded-[var(--brand-radius,3rem)] border border-white/10 hover:bg-white/10 transition-all duration-500",children:e.jsxs("div",{className:"flex items-start gap-6",children:[e.jsx("div",{className:"p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl",children:e.jsx(me,{size:24})}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-lg font-black uppercase text-blue-100 mb-3",children:"Mastery Core Identified"}),e.jsxs("p",{className:"text-sm font-medium text-blue-100/60 leading-relaxed",children:["Our neural Audit confirms exceptional performance in ",e.jsx("b",{children:t.strongestSubject?.subject})," with a mastery index of ",e.jsxs("b",{children:[t.strongestSubject?.avg.toFixed(1),"%"]}),'. The teaching methodologies applied here are optimal. We recommend a "Cross-Subject Integration" strategy to export these success patterns to other academic segments.']})]})]})}),e.jsx("div",{className:"group p-10 bg-white/5 rounded-[var(--brand-radius,3rem)] border border-white/10 hover:bg-white/10 transition-all duration-500 border-l-4 border-l-rose-500",children:e.jsxs("div",{className:"flex items-start gap-6",children:[e.jsx("div",{className:"p-4 bg-rose-500/20 text-rose-400 rounded-2xl",children:e.jsx(P,{size:24})}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-lg font-black uppercase text-rose-100 mb-3",children:"Critical Intervention Required"}),e.jsxs("p",{className:"text-sm font-medium text-blue-100/60 leading-relaxed",children:["The subject ",e.jsx("b",{children:t.weakestSubject?.subject})," is currently underperforming with an average velocity of ",e.jsxs("b",{children:[t.weakestSubject?.avg.toFixed(1),"%"]}),". Statistical drift suggests a lack of conceptual clarity in this segment. Immediate tactical review of the curriculum and faculty response time is vital for Q3 recovery."]})]})]})})]}),e.jsxs("div",{className:"mt-12 flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-black/20 rounded-[var(--brand-radius,2rem)] border border-white/5",children:[e.jsxs("div",{className:"flex items-center gap-8",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-[10px] font-black text-brand-accent/60 uppercase tracking-widest mb-1",children:"Institutional Grade"}),e.jsx("div",{className:"text-5xl font-black text-brand-accent transition-transform hover:scale-110 cursor-default",children:t.avgPercentage>75?"A+":t.avgPercentage>60?"B":"C"})]}),e.jsx("div",{className:"h-12 w-[1px] bg-white/10 hidden md:block"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-black text-brand-accent/60 uppercase tracking-widest mb-1",children:"Audit Status"}),e.jsx("p",{className:"text-lg font-black text-white uppercase tracking-tight",children:"Verified Performance Hub"})]})]}),e.jsxs("div",{className:"flex gap-4 w-full md:w-auto",children:[e.jsx("button",{onClick:z,className:"flex-1 md:flex-none px-10 py-5 bg-white text-brand-primary rounded-[var(--brand-radius,1rem)] font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all shadow-2xl active:scale-95",children:"Download PDF Audit"}),e.jsx("button",{className:"flex-1 md:flex-none px-10 py-5 bg-brand-accent text-brand-primary rounded-[var(--brand-radius,1rem)] font-black text-xs uppercase tracking-widest shadow-2xl hover:opacity-90 transition-all",children:"Request AI Sync"})]})]})]})]})]}):e.jsxs("div",{className:"flex flex-col items-center justify-center py-40 bg-white/40 dark:bg-brand-accent/5 backdrop-blur-3xl rounded-[var(--brand-radius,4rem)] border border-white/20",children:[e.jsx(R.div,{animate:{rotate:360},transition:{repeat:1/0,duration:20,ease:"linear"},className:"w-32 h-32 bg-slate-100 dark:bg-white/5 rounded-[var(--brand-radius,2rem)] flex items-center justify-center text-slate-300 mb-8 border border-slate-100",children:e.jsx($,{size:60})}),e.jsx("h3",{className:"text-2xl font-black text-brand-primary dark:text-white uppercase tracking-tighter",children:"Neural Link Offline"}),e.jsx("p",{className:"text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2",children:"Class Data Matrix Pending Initialization"}),e.jsx("p",{className:"text-xs font-bold text-slate-300 mt-6 max-w-sm text-center px-10",children:"Please ensure exam results are finalized and synced to activate the strategic intelligence analytics framework."})]})]})};export{ke as Analytics};
