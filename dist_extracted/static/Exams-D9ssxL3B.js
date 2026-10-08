import{r as P,j as e}from"./vendor-framer-D1vKbJ8a.js";import{u as Ae,w as Je,r as Ze,E as et}from"./vendor-export-B6SaTIxO.js";import{u as ve,M as tt}from"./index-BtXMVJl_.js";import{t as at}from"./index-XablJR_U.js";import{c as I}from"./cn-hCdZ21mq.js";import{S as h}from"./vendor-utils-DML6cOpY.js";import{aj as Ce,a0 as _e,ak as Pe,Z as qe,P as ne,i as He,a2 as st,C as Be,al as Ge,s as pe,am as ze,w as Ue,A as ie,v as Ie,K as Re,an as rt,ao as it,ap as Ne,m as Me,aq as We,ar as Fe}from"./vendor-icons-BVeQKCV0.js";import"./vendor-react-Bce9NwRC.js";import"./vendor-firebase-B4Tjn-x7.js";const nt=()=>{const{classTests:k,addClassTest:T,updateClassTest:Te,deleteClassTest:Ee,classes:Se,classSubjects:ee,students:le,currentUser:W,sendNotification:_,settings:f}=ve(),[G,y]=P.useState(!1),[we,ke]=P.useState(null),[L,ye]=P.useState(""),[U,me]=P.useState(""),[oe,xe]=P.useState(""),[R,te]=P.useState(""),[d,V]=P.useState(40),[u,X]=P.useState({}),m=W?.role==="teacher"&&W?.inchargeClass?Se.filter(l=>l===W.inchargeClass):Se,de=P.useMemo(()=>L?le.filter(l=>l.class===L&&l.status==="Active"):[],[L,le]),q=P.useMemo(()=>ee[L]||[],[L,ee]),be=()=>{y(!0),ke(null),ye(m[0]||""),me(""),xe(""),te(""),V(40),X({})},M=l=>{y(!0),ke(l.id),ye(l.className),me(l.subject),xe(l.topic),te(l.totalMarks),V(l.passingPercentage||40),X(l.results||{})},J=()=>{if(!L||!U||!oe||!R||!d){h.fire("Missing Fields","Please fill all test details including passing criteria.","error");return}we?(Te(we,{className:L,subject:U,topic:oe,totalMarks:Number(R),passingPercentage:Number(d),results:u}),h.fire({title:"Updated!",text:"Class test updated successfully.",icon:"success",timer:1500})):(T({className:L,subject:U,topic:oe,totalMarks:Number(R),passingPercentage:Number(d),results:u,date:new Date().toISOString().split("T")[0],teacherId:W?.id||"Admin"}),h.fire({title:"Saved!",text:"New class test created.",icon:"success",timer:1500})),y(!1)},ue=l=>{h.fire({title:"Delete Test?",text:"This will remove the test and all entered marks.",icon:"warning",showCancelButton:!0,confirmButtonColor:"#ef4444"}).then(g=>{g.isConfirmed&&Ee(l)})},he=l=>{h.fire({title:"Send to Parents?",text:`Send WhatsApp messages to parents of ${l.className} for ${l.subject}?`,icon:"question",showCancelButton:!0,confirmButtonText:"Yes, Send Now"}).then(g=>{if(g.isConfirmed){let N=0;le.filter(C=>C.class===l.className&&C.status==="Active").forEach(C=>{const E=l.results[C.id];if(E!==void 0){let j="";E==="A"?j="ABSENT":j=E/l.totalMarks*100>=(l.passingPercentage||40)?"PASS":"FAIL";const D=`Dear Parent, your child ${C.name} scored ${E==="A"?"ABSENT":`${E}/${l.totalMarks} (${j})`} in today's ${l.subject} class test (${l.topic}).`;_(C.id,"General",D),N++}}),h.fire("Broadcast Complete",`Sent test results to ${N} parents via WhatsApp.`,"success")}})},$e=l=>{const g=le.filter(D=>D.class===l.className&&D.status==="Active");let N="",Y=0,C=0,E=0;g.forEach((D,Q)=>{const B=l.results[D.id];let ae="-",se="#64748b",Z="-",H="-";if(B==="A")ae="ABSENT",se="#f59e0b",H="A",E++;else if(B!==void 0){H=B.toString();const fe=B/l.totalMarks*100;Z=fe.toFixed(1)+"%",fe>=(l.passingPercentage||40)?(ae="PASS",se="#10b981",Y++):(ae="FAIL",se="#ef4444",C++)}N+=`
                <tr>
                    <td style="text-align: center;">${Q+1}</td>
                    <td><strong>${D.name}</strong></td>
                    <td style="text-align: center;">${D.id}</td>
                    <td style="text-align: center; font-weight: bold;">${H}</td>
                    <td style="text-align: center;">${Z}</td>
                    <td style="text-align: center; color: ${se}; font-weight: bold;">${ae}</td>
                </tr>
            `});const j=window.open("","","width=1000,height=800");j&&(j.document.write(`
            <html>
                <head>
                    <title>${l.className} - ${l.subject} Marksheet</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #1e293b; }
                        .header { text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
                        .header h1 { margin: 0; color: #0f172a; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
                        .header p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
                        
                        .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                        .meta-info div { display: flex; flex-direction: column; gap: 4px; }
                        .meta-info label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; color: #64748b; }
                        .meta-info span { font-size: 14px; font-weight: bold; color: #0f172a; }

                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #cbd5e1; padding: 10px; font-size: 13px; }
                        th { background-color: #f1f5f9; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; color: #475569; }
                        
                        .summary { display: flex; justify-content: flex-end; gap: 20px; margin-top: 20px; }
                        .summary-box { text-align: center; padding: 10px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
                        .summary-box.pass { color: #10b981; border-color: #10b981; background: #ecfdf5; }
                        .summary-box.fail { color: #ef4444; border-color: #ef4444; background: #fef2f2; }
                        .summary-box label { display: block; font-size: 10px; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
                        .summary-box span { font-size: 18px; font-weight: 900; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${f.schoolName||"School System"}</h1>
                        <p>Class Test Mark Sheet</p>
                    </div>

                    <div class="meta-info">
                        <div><label>Class</label><span>${l.className}</span></div>
                        <div><label>Subject</label><span>${l.subject}</span></div>
                        <div><label>Topic</label><span>${l.topic}</span></div>
                        <div><label>Total Marks</label><span>${l.totalMarks}</span></div>
                        <div><label>Passing Criteria</label><span>${l.passingPercentage}%</span></div>
                        <div><label>Date</label><span>${l.date}</span></div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50px;">S.No</th>
                                <th style="text-align: left;">Student Name</th>
                                <th>Student ID</th>
                                <th>Obtained</th>
                                <th>Percentage</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${N}
                        </tbody>
                    </table>

                    <div class="summary">
                        <div class="summary-box">
                            <label>Total Students</label>
                            <span>${g.length}</span>
                        </div>
                        <div class="summary-box">
                            <label>Absent</label>
                            <span>${E}</span>
                        </div>
                        <div class="summary-box pass">
                            <label>Passed</label>
                            <span>${Y}</span>
                        </div>
                        <div class="summary-box fail">
                            <label>Failed</label>
                            <span>${C}</span>
                        </div>
                    </div>
                </body>
            </html>
        `),j.document.close(),j.focus(),setTimeout(()=>{j.print()},500))},F=async()=>{const{value:l}=await h.fire({title:"Master Class Report",text:"Select class to generate consolidated test report",input:"select",inputOptions:m.reduce((j,D)=>({...j,[D]:D}),{}),inputPlaceholder:"Select a class",showCancelButton:!0,confirmButtonColor:"var(--brand-primary)"});if(!l)return;const g=k.filter(j=>j.className===l).sort((j,D)=>new Date(j.date).getTime()-new Date(D.date).getTime());if(g.length===0){h.fire("No Tests Found",`There are no class tests recorded for ${l} yet.`,"info");return}const N=le.filter(j=>j.class===l&&j.status==="Active");let Y=g.map(j=>`<th style="text-align: center; font-size: 10px;">${j.subject}<br/><span style="color:#64748b;font-size:9px;">${j.date}</span><br/><span style="color:#10b981;font-size:9px;">Max: ${j.totalMarks}</span></th>`).join(""),C="";N.forEach((j,D)=>{let Q=0,B=0,ae=g.map(Z=>{const H=Z.results[j.id];return H==="A"?'<td style="text-align: center; color: #f59e0b; font-weight: bold;">A</td>':H!==void 0&&H!==""?(Q+=H,B+=Z.totalMarks,`<td style="text-align: center; font-weight: bold; color: ${H/Z.totalMarks*100>=(Z.passingPercentage||40)?"#10b981":"#ef4444"};">${H}</td>`):'<td style="text-align: center; color: #cbd5e1;">-</td>'}).join("");const se=B>0?(Q/B*100).toFixed(1)+"%":"-";C+=`
                <tr>
                    <td style="text-align: center;">${D+1}</td>
                    <td><strong>${j.name}</strong></td>
                    <td style="text-align: center;">${j.id}</td>
                    ${ae}
                    <td style="text-align: center; font-weight: 900; background: #f8fafc;">${Q} / ${B}</td>
                    <td style="text-align: center; font-weight: 900; background: #f8fafc;">${se}</td>
                </tr>
            `});const E=window.open("","","width=1200,height=800");E&&(E.document.write(`
            <html>
                <head>
                    <title>${l} - Consolidated Report</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #1e293b; }
                        .header { text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
                        .header h1 { margin: 0; color: #0f172a; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
                        .header p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
                        
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; }
                        th { background-color: #f1f5f9; text-transform: uppercase; letter-spacing: 1px; color: #475569; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${f.schoolName||"School System"}</h1>
                        <p>Consolidated Class Test Report — ${l}</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px;">S.No</th>
                                <th style="text-align: left;">Student Name</th>
                                <th>Student ID</th>
                                ${Y}
                                <th>Grand Total</th>
                                <th>Overall %</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${C}
                        </tbody>
                    </table>
                </body>
            </html>
        `),E.document.close(),E.focus(),setTimeout(()=>{E.print()},500))},ge=l=>{const g=Object.values(l.results).filter(C=>C!=="A");if(g.length===0)return{avg:0,high:0};const N=(g.reduce((C,E)=>C+E,0)/g.length).toFixed(1),Y=Math.max(...g);return{avg:N,high:Y}},O=W?.role==="teacher"&&W?.inchargeClass?k.filter(l=>l.className===W.inchargeClass):k;return e.jsx("div",{className:"space-y-6",children:G?e.jsxs("div",{className:"bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-6 md:p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-50 dark:border-transparent",children:[e.jsxs("div",{className:"flex items-center justify-between mb-8",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-black uppercase text-slate-800 dark:text-white",children:we?"Edit Test":"New Rapid Test"}),e.jsx("p",{className:"text-xs font-bold text-slate-500 uppercase tracking-wider",children:"Tab through inputs for fast marks entry"})]}),e.jsx("button",{onClick:()=>y(!1),className:"px-4 py-2 bg-slate-100 text-slate-600 font-black text-xs uppercase rounded-xl hover:bg-slate-200",children:"Cancel"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-5 gap-4 mb-8",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-[10px] font-black uppercase text-slate-500 mb-2",children:"Class"}),e.jsxs("select",{value:L,onChange:l=>{ye(l.target.value),me("")},className:"w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none font-bold text-sm",children:[e.jsx("option",{value:"",children:"Select..."}),m.map(l=>e.jsx("option",{value:l,children:l},l))]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-[10px] font-black uppercase text-slate-500 mb-2",children:"Subject"}),e.jsxs("select",{value:U,onChange:l=>me(l.target.value),className:"w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none font-bold text-sm",children:[e.jsx("option",{value:"",children:"Select..."}),q.map(l=>e.jsx("option",{value:l,children:l},l))]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-[10px] font-black uppercase text-slate-500 mb-2",children:"Total Marks"}),e.jsx("input",{type:"number",value:R,onChange:l=>te(l.target.value?Number(l.target.value):""),className:"w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none font-bold text-sm",placeholder:"e.g. 10"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-[10px] font-black uppercase text-slate-500 mb-2",children:"Passing %"}),e.jsx("input",{type:"number",value:d,onChange:l=>V(l.target.value?Number(l.target.value):""),className:"w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none font-bold text-sm text-brand-primary",placeholder:"e.g. 40"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-[10px] font-black uppercase text-slate-500 mb-2",children:"Topic / Chapter"}),e.jsx("input",{type:"text",value:oe,onChange:l=>xe(l.target.value),className:"w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none font-bold text-sm",placeholder:"e.g. Ch 5 Motion"})]})]}),L&&U&&R&&d&&e.jsxs("div",{className:"mt-8",children:[e.jsxs("div",{className:"flex justify-between items-end mb-4 border-b border-slate-100 pb-4",children:[e.jsx("h3",{className:"font-black uppercase tracking-wider text-brand-primary",children:"Enter Marks"}),e.jsx("div",{className:"text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg",children:"Type 'A' for Absent"})]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",children:de.map(l=>{const g=u[l.id];let N;return g!==void 0&&g!=="A"&&g!==""&&(N=g/R*100>=d),e.jsxs("div",{className:I("flex items-center justify-between p-3 rounded-2xl border transition-colors",N===!0?"bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30":N===!1?"bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30":"bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-white/5"),children:[e.jsxs("div",{className:"flex items-center gap-3 overflow-hidden",children:[l.avatar?e.jsx("img",{src:l.avatar,alt:"",className:"w-8 h-8 rounded-full object-cover shrink-0"}):e.jsx("div",{className:"w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-black shrink-0",children:l.name.charAt(0)}),e.jsxs("div",{className:"truncate pr-2",children:[e.jsx("p",{className:"text-xs font-bold text-slate-800 dark:text-white truncate",children:l.name}),e.jsx("p",{className:"text-[9px] font-bold text-slate-400",children:l.id})]})]}),e.jsx("input",{type:"text",value:u[l.id]||"",onChange:Y=>{let C=Y.target.value.toUpperCase();if(C!=="A"&&C!==""){if(C=Number(C),isNaN(C))return;C>R&&(C=R)}X(E=>({...E,[l.id]:C}))},className:I("w-14 h-10 text-center font-black rounded-xl outline-none border-2 transition-all",u[l.id]==="A"?"bg-amber-50 border-amber-200 text-amber-500":N===!0?"bg-emerald-100 border-emerald-300 text-emerald-700":N===!1?"bg-rose-100 border-rose-300 text-rose-700":"bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:border-brand-primary"),placeholder:"-"})]},l.id)})}),e.jsx("div",{className:"mt-8 flex justify-end",children:e.jsxs("button",{onClick:J,className:"px-8 py-4 bg-brand-primary text-white text-sm font-black uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2",children:[e.jsx(st,{className:"w-5 h-5"})," Save Rapid Test"]})})]})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-black uppercase text-slate-800 dark:text-white",children:"Smart Class Tests"}),e.jsx("p",{className:"text-xs font-bold text-slate-500 uppercase tracking-wider",children:"Quick Assessments & Analytics"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsxs("button",{onClick:F,className:"px-4 py-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2",children:[e.jsx(Ce,{className:"w-4 h-4"})," Class Report"]}),e.jsxs("button",{onClick:be,className:"px-4 py-2 bg-brand-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all",children:[e.jsx(_e,{className:"w-4 h-4"})," New Test"]})]})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:O.map(l=>{const{avg:g,high:N}=ge(l);return e.jsxs("div",{className:"bg-white dark:bg-slate-800/80 rounded-[2rem] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-white/5 border border-slate-50 dark:border-transparent relative group flex flex-col h-full",children:[e.jsxs("div",{className:"absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",children:[e.jsx("button",{onClick:()=>M(l),className:"p-2 bg-slate-100 text-brand-primary rounded-full hover:bg-brand-primary hover:text-white",children:e.jsx(Pe,{className:"w-3 h-3"})}),e.jsx("button",{onClick:()=>ue(l.id),className:"p-2 bg-slate-100 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white",children:e.jsx(qe,{className:"w-3 h-3"})})]}),e.jsxs("div",{className:"flex items-center gap-3 mb-4",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-brand-accent/20 flex items-center justify-center text-brand-primary",children:e.jsx(Ce,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-black text-slate-800 dark:text-white leading-tight",children:l.subject}),e.jsxs("p",{className:"text-[10px] font-bold text-slate-500 uppercase tracking-wider",children:[l.className," • ",l.date]})]})]}),e.jsx("p",{className:"text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4 line-clamp-1 flex-1",children:l.topic}),e.jsxs("div",{className:"grid grid-cols-3 gap-2 mb-4",children:[e.jsxs("div",{className:"bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-center",children:[e.jsx("div",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Total"}),e.jsx("div",{className:"text-sm font-black text-slate-800 dark:text-white",children:l.totalMarks})]}),e.jsxs("div",{className:"bg-brand-accent/10 p-2 rounded-xl text-center",children:[e.jsx("div",{className:"text-[10px] font-bold text-brand-primary uppercase tracking-wider",children:"Avg"}),e.jsx("div",{className:"text-sm font-black text-brand-primary",children:g})]}),e.jsxs("div",{className:"bg-emerald-500/10 p-2 rounded-xl text-center",children:[e.jsx("div",{className:"text-[10px] font-bold text-emerald-600 uppercase tracking-wider",children:"High"}),e.jsx("div",{className:"text-sm font-black text-emerald-600",children:N})]})]}),e.jsxs("div",{className:"flex gap-2 mt-auto",children:[e.jsxs("button",{onClick:()=>$e(l),className:"flex-1 py-2.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors",children:[e.jsx(ne,{className:"w-3.5 h-3.5"})," Marksheet"]}),e.jsxs("button",{onClick:()=>he(l),className:"flex-1 py-2.5 bg-[#25D366]/10 text-[#25D366] text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-[#25D366] hover:text-white transition-colors",children:[e.jsx(He,{className:"w-3.5 h-3.5"})," Broadcast"]})]})]},l.id)})})]})})},ht=()=>{const{exams:k,examResults:T,addExam:Te,updateExam:Ee,deleteExam:Se,inputMarks:ee,finalizeResults:le,classes:W,classSubjects:_,students:f,currentUser:G,settings:y,teachers:we,sendNotification:ke,subjectTotalMarks:L}=ve(),ye=we.find(t=>t.id===G?.id),U=G?.role==="admin",me=U,oe=U||ye?.permissions?.includes("results_manage"),xe=U,[R,te]=P.useState("manage"),[d,V]=P.useState(null),[u,X]=P.useState(null),[m,de]=P.useState(G?.role==="teacher"&&G?.inchargeClass?G.inchargeClass:null),[q,be]=P.useState([]),[M,J]=P.useState(null),[,ue]=P.useState(null),[he,$e]=P.useState("academic"),[F,ge]=P.useState({name:"",category:"",position:"",event:"",date:new Date().toLocaleDateString()}),[O,l]=P.useState({name:"",course:"",duration:"",grade:"",date:new Date().toLocaleDateString()}),[g,N]=P.useState([]),Y=P.useRef(null);P.useEffect(()=>{N([])},[d,m,u]);const C=async()=>{const t=document.documentElement.classList.contains("dark"),{value:r}=await h.fire({title:"Create New Academic Exam",background:t?"var(--glass-bg)":"#ffffff",color:t?"var(--brand-accent)":"#0f172a",html:`
                <div class="text-left font-outfit space-y-4">
                    <div>
                        <label class="text-[10px] font-black uppercase ${t?"text-brand-accent/60":"text-slate-500"} tracking-widest block mb-1">Exam Name</label>
                        <input id="swal-exam-name" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${t?"!bg-white/5 !border-brand-accent/20 !text-brand-accent":""}" placeholder="e.g. First Term 2026">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase ${t?"text-brand-accent/60":"text-slate-500"} tracking-widest block mb-1">Academic Session</label>
                        <input id="swal-exam-session" value="${y.academicSession||"2025-2026"}" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${t?"!bg-white/5 !border-brand-accent/20 !text-brand-accent":""}" placeholder="e.g. 2025-2026">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase ${t?"text-brand-accent/60":"text-slate-500"} tracking-widest block mb-1">Select Classes</label>
                        <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border ${t?"border-brand-accent/10 bg-brand-accent/5":"border-slate-100"} rounded-[var(--brand-radius,1rem)]" id="classes-chips">
                            ${W.map(a=>`
                                <label class="flex items-center gap-2 p-2 ${t?"hover:bg-brand-accent/10":"hover:bg-slate-50"} rounded-lg cursor-pointer">
                                    <input type="checkbox" name="exam-classes" value="${a}" class="accent-brand-primary">
                                    <span class="text-xs font-bold ${t?"text-brand-accent":"text-slate-600"}">${a}</span>
                                </label>
                            `).join("")}
                        </div>
                    </div>
                </div>
            `,confirmButtonText:"Initialize Exam",confirmButtonColor:"var(--brand-primary)",showCancelButton:!0,preConfirm:()=>{const a=document.getElementById("swal-exam-name").value,s=document.getElementById("swal-exam-session").value,i=Array.from(document.querySelectorAll('input[name="exam-classes"]:checked')).map(n=>n.value);return a?i.length===0?(h.showValidationMessage("Select at least one class"),null):{name:a,session:s,classes:i}:(h.showValidationMessage("Name is required"),null)}});r&&(Te(r),h.fire({title:"Exam Created",text:"The academic session has been successfully initialized.",icon:"success",toast:!0,position:"top-end",timer:3e3,showConfirmButton:!1,background:t?"var(--glass-bg)":"#ffffff",color:t?"var(--brand-accent)":"#0f172a"}))},E=async t=>{const r=document.documentElement.classList.contains("dark"),{value:a}=await h.fire({title:"Edit Academic Exam",background:r?"var(--glass-bg)":"#ffffff",color:r?"var(--brand-accent)":"#0f172a",html:`
                <div class="text-left font-outfit space-y-4">
                    <div>
                        <label class="text-[10px] font-black uppercase ${r?"text-brand-accent/60":"text-slate-500"} tracking-widest block mb-1">Exam Name</label>
                        <input id="swal-exam-name-edit" value="${t.name}" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${r?"!bg-white/5 !border-brand-accent/20 !text-brand-accent":""}" placeholder="e.g. First Term 2026">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase ${r?"text-brand-accent/60":"text-slate-500"} tracking-widest block mb-1">Academic Session</label>
                        <input id="swal-exam-session-edit" value="${t.session||y.academicSession||"2025-2026"}" class="swal2-input !mt-0 !w-full !rounded-[var(--brand-radius,1rem)] !text-sm ${r?"!bg-white/5 !border-brand-accent/20 !text-brand-accent":""}" placeholder="e.g. 2025-2026">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase ${r?"text-brand-accent/60":"text-slate-500"} tracking-widest block mb-1">Select Classes</label>
                        <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border ${r?"border-brand-accent/10 bg-brand-accent/5":"border-slate-100"} rounded-[var(--brand-radius,1rem)]" id="classes-chips-edit">
                            ${W.map(s=>`
                                <label class="flex items-center gap-2 p-2 ${r?"hover:bg-brand-accent/10":"hover:bg-slate-50"} rounded-lg cursor-pointer">
                                    <input type="checkbox" name="exam-classes-edit" value="${s}" class="accent-brand-primary" ${t.classes.includes(s)?"checked":""}>
                                    <span class="text-xs font-bold ${r?"text-brand-accent":"text-slate-600"}">${s}</span>
                                </label>
                            `).join("")}
                        </div>
                    </div>
                </div>
            `,confirmButtonText:"Save Changes",confirmButtonColor:"var(--brand-primary)",showCancelButton:!0,preConfirm:()=>{const s=document.getElementById("swal-exam-name-edit").value,i=document.getElementById("swal-exam-session-edit").value,n=Array.from(document.querySelectorAll('input[name="exam-classes-edit"]:checked')).map(o=>o.value);return s?n.length===0?(h.showValidationMessage("Select at least one class"),null):{name:s,session:i,classes:n}:(h.showValidationMessage("Name is required"),null)}});a&&(Ee(t.id,a),h.fire({title:"Exam Updated",text:"The academic session has been successfully updated.",icon:"success",toast:!0,position:"top-end",timer:3e3,showConfirmButton:!1,background:r?"var(--glass-bg)":"#ffffff",color:r?"var(--brand-accent)":"#0f172a"}))},j=t=>{const r=document.documentElement.classList.contains("dark");h.fire({title:"Delete Exam?",text:"This will permanently remove all marks and results for this exam session.",icon:"warning",background:r?"var(--glass-bg)":"#ffffff",color:r?"var(--brand-accent)":"#0f172a",showCancelButton:!0,confirmButtonColor:"#e11d48",confirmButtonText:"Yes, Delete Systematically"}).then(a=>{a.isConfirmed&&(Se(t),h.fire({title:"Deleted",text:"Exam records purged.",icon:"success",background:r?"var(--glass-bg)":"#ffffff",color:r?"var(--brand-accent)":"#0f172a"}))})},D=(t,r)=>{const a=document.documentElement.classList.contains("dark");h.fire({title:"Execute Ranking Protocol?",text:`System will calculate totals, grades, and assign positions for ${r}.`,icon:"info",background:a?"var(--glass-bg)":"#ffffff",color:a?"var(--brand-accent)":"#0f172a",showCancelButton:!0,confirmButtonColor:"var(--brand-primary)",confirmButtonText:"Start Execution"}).then(s=>{if(s.isConfirmed){if(!oe){h.fire({title:"Access Denied",text:"Only administrators or designated managers can finalize results.",icon:"error",background:a?"var(--glass-bg)":"#ffffff",color:a?"var(--brand-accent)":"#0f172a"});return}le(t,r),h.fire({title:"Completed",text:"Results finalized with automated ranking.",icon:"success",background:a?"var(--glass-bg)":"#ffffff",color:a?"var(--brand-accent)":"#0f172a"}),te("results")}})},Q=(t,r,a,s,i)=>{const n=(b,p)=>!b||typeof b!="string"||b.includes("oklch")?p:b,o=n(s.themeColors?.primary,"#003366"),c=n(s.themeColors?.accent,"#fbbf24"),v=Array.from(new Set(i.map(b=>b.trim()))).filter(Boolean);return`
            <html>
                <head>
                    <title>Official Performance Transcript - ${t.name}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Outfit:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap" rel="stylesheet">
                    <style>
                        html, body {
                            background-color: #ffffff !important;
                            color: #1e293b !important;
                        }
                        :root {
                            --brand-primary: ${o};
                            --brand-accent: ${c};
                        }
                        
                        * { 
                            box-sizing: border-box; 
                            -webkit-print-color-adjust: exact; 
                            font-weight: bold !important;
                        }
                        body { 
                            margin: 0; padding: 0; 
                            font-family: 'Times New Roman', Times, serif; 
                            font-weight: bold;
                            background: white; 
                            color: #1e293b;
                        }
                        
                        @page { size: A4; margin: 0; }

                        .page-container {
                            width: 210mm;
                            height: 297mm;
                            background: white;
                            padding: 10mm;
                            position: relative;
                            overflow: hidden;
                        }

                        .outer-frame {
                            height: 100%;
                            width: 100%;
                            border: 1.5mm solid var(--brand-primary);
                            border-radius: 8mm;
                            padding: 1.5mm;
                            position: relative;
                            display: flex;
                            flex-direction: column;
                        }
                        
                        .inner-frame {
                            height: 100%;
                            width: 100%;
                            border: 0.5mm solid var(--brand-primary);
                            border-radius: 6.5mm;
                            padding: 6mm;
                            display: flex;
                            flex-direction: column;
                            position: relative;
                            background: white;
                            overflow: hidden;
                        }

                        .header {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            margin-bottom: 6mm;
                            border-bottom: 3px double var(--brand-primary);
                            padding-bottom: 4mm;
                        }

                        .logo-container {
                            width: 30mm;
                            height: 30mm;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .logo-container img {
                            max-width: 100%;
                            max-height: 100%;
                            object-fit: contain;
                        }

                        .school-info {
                            text-align: center;
                            flex: 1;
                        }
                        .school-info h1 {
                            margin: 0;
                            font-family: 'Times New Roman', Times, serif;
                            font-weight: bold;
                            font-size: 28pt;
                            color: var(--brand-primary);
                            text-transform: uppercase;
                            letter-spacing: -0.5px;
                        }
                        .school-info p {
                            margin: 1mm 0 0;
                            font-size: 9.5pt;
                            font-weight: 900;
                            color: #000000;
                            text-transform: uppercase;
                            letter-spacing: 2.5px;
                        }

                        .document-banner {
                            background: var(--brand-primary);
                            color: white;
                            text-align: center;
                            padding: 3mm;
                            font-family: 'Times New Roman', Times, serif;
                            font-weight: bold;
                            font-size: 13pt;
                            letter-spacing: 4px;
                            margin-bottom: 6mm;
                            border-radius: 8px;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        }

                        .profile-section {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 3mm;
                            margin-bottom: 6mm;
                        }
                        .profile-item {
                            background: #f8fafc;
                            padding: 8px 12px;
                            border-radius: 10px;
                            border: 1px solid #e2e8f0;
                        }
                        .profile-item label {
                            font-size: 8pt;
                            font-weight: 800;
                            color: #475569;
                            text-transform: uppercase;
                            display: block;
                            margin-bottom: 2px;
                        }
                        .profile-item span {
                            font-size: 11.5pt;
                            font-weight: 900;
                            color: #0f172a;
                            display: block;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }

                        .table-wrapper {
                            flex: 1;
                            margin-bottom: 6mm;
                        }
                        table {
                            width: 100%;
                            border-collapse: separate;
                            border-spacing: 0;
                            border: 2px solid #0f172a;
                            border-radius: 12px;
                            overflow: hidden;
                        }
                        th {
                            background: #f1f5f9;
                            color: var(--brand-primary);
                            font-size: 8.5pt;
                            font-weight: 800;
                            text-transform: uppercase;
                            padding: 10px;
                            border-bottom: 2px solid #0f172a;
                            border-right: 2px solid #0f172a;
                            text-align: center;
                        }
                        th:last-child { border-right: none; }
                        td {
                            padding: 8px 10px;
                            font-size: 9.5pt;
                            font-weight: 600;
                            border-bottom: 2px solid #0f172a;
                            border-right: 2px solid #0f172a;
                            text-align: center;
                        }
                        td:last-child { border-right: none; }
                        tr:last-child td { border-bottom: none; }
                        .subject-name {
                            text-align: left;
                            font-weight: 800;
                            color: var(--brand-primary);
                            background: #fcfdfe;
                        }

                        .bar-container {
                            width: 100%;
                            max-width: 120px;
                            height: 6px;
                            background: #e2e8f0;
                            border-radius: 10px;
                            overflow: hidden;
                            margin: 4px auto;
                        }
                        .bar-fill { height: 100%; border-radius: 10px; }

                        .grade-badge {
                            background: var(--brand-primary);
                            color: white;
                            padding: 2px 8px;
                            border-radius: 4px;
                            font-weight: 900;
                        }

                        .summary-grid {
                            display: grid;
                            grid-template-columns: 1.2fr 1fr;
                            gap: 15px;
                            margin-bottom: 6mm;
                        }
                        .summary-box {
                            border: 2px solid #000000;
                            border-radius: 15px;
                            padding: 12px 20px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            background: linear-gradient(to right, white, #f8fafc);
                        }
                        .summary-label { font-size: 8pt; font-weight: 800; color: #000000; text-transform: uppercase; }
                        .summary-value { font-size: 22pt; font-weight: 900; color: #000000; }
                        .summary-accent { font-size: 26pt; font-weight: 900; color: #000000; }

                        .remarks-area {
                            background: #fffbeb;
                            border-left: 5px solid var(--brand-accent);
                            padding: 12px 20px;
                            border-radius: 0 12px 12px 0;
                            margin-bottom: 10mm;
                        }
                        .remarks-area h4 { margin: 0 0 4px; font-size: 8pt; color: #92400e; text-transform: uppercase; }
                        .remarks-area p { margin: 0; font-size: 10.5pt; font-weight: 600; font-style: italic; color: #451a03; }

                        .signature-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                            padding: 0 10mm;
                            margin-top: auto;
                        }
                        .sig-block { text-align: center; width: 45mm; }
                        .sig-line { border-top: 1.5px solid var(--brand-primary); margin-bottom: 5px; opacity: 0.5; }
                        .sig-label { font-size: 8pt; font-weight: 800; color: #64748b; text-transform: uppercase; }

                        .watermark {
                            position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%);
                            width: 140mm; height: 140mm; opacity: 0.04; pointer-events: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="page-container">
                        <div class="outer-frame">
                            <div class="inner-frame">
                                <img src="${s.logo1||""}" class="watermark">
                                
                                <div class="header">
                                    <div class="logo-container">
                                        <img src="${s.logo1||""}">
                                    </div>
                                    <div class="school-info">
                                        <h1>${(s.schoolName||"PIONEER'S SUPERIOR").replace(/['"”’]+/g,"'")}</h1>
                                        <p>${s.subTitle||"Institute of Higher Secondary Education"}</p>
                                        ${t.campus?`<div style="display: inline-block; background: #000000; color: #fff; padding: 4px 16px; border-radius: 20px; font-size: 9pt; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.2);">${t.campus}</div>`:""}
                                        <div style="font-size: 14pt; font-weight: 900; color: #000000; margin-top: 5px; text-transform: uppercase;">${a.name}</div>
                                    </div>
                                    <div class="logo-container">
                                        <img src="${s.logo2||s.logo1||""}">
                                    </div>
                                </div>

                                <div class="document-banner">STUDENT PROGRESS REPORT CARD</div>
                                
                                <div style="text-align: center; margin-bottom: 4mm; margin-top: 2mm;">
                                    <h2 style="margin: 0; font-size: 26pt; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 1px;">${t.name}</h2>
                                </div>

                                <div class="profile-section">
                                    <div class="profile-item"><label>Father Name</label><span>${t.fatherName||"---"}</span></div>
                                    <div class="profile-item"><label>Admission No</label><span>${t.admissionId||t.id}</span></div>
                                    <div class="profile-item"><label>Class</label><span>${r.className}</span></div>
                                    <div class="profile-item"><label>Session</label><span>${a.session||s.academicSession||"2025-2026"}</span></div>
                                </div>

                                <div class="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style="width: 35%; text-align: left">Subject Title</th>
                                                <th style="width: 12%">Total</th>
                                                <th style="width: 12%">Obtained</th>
                                                <th style="width: 15%">Pass %</th>
                                                <th style="width: 15%">Performance</th>
                                                <th style="width: 11%">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${v.filter(b=>{const p=r.marks[b];return p&&p.obtained!==void 0&&p.obtained!==""}).map(b=>{const p=r.marks[b],x=p.obtained/p.total*100,w=x>=80?"#10b981":x>=60?"#3b82f6":x>=40?"#f59e0b":"#ef4444";let S="F";return x>=96?S="A++":x>=91?S="A+":x>=86?S="A":x>=81?S="B++":x>=76?S="B+":x>=71?S="B":x>=61?S="C+":x>=51?S="C":x>=40&&(S="D"),`
                                                    <tr>
                                                        <td class="subject-name">${b}</td>
                                                        <td style="font-weight: 900; color: #000000; font-size: 10.5pt;">${p.total}</td>
                                                        <td style="font-weight: 900; color: #000000; font-size: 10.5pt;">${p.obtained}</td>
                                                        <td style="font-weight: 900; color: #000000; font-size: 10.5pt;">${x.toFixed(0)}%</td>
                                                        <td>
                                                            <div class="bar-container"><div class="bar-fill" style="width: ${x}%; background: ${w}"></div></div>
                                                        </td>
                                                        <td><span class="grade-badge">${S}</span></td>
                                                      </tr>
                                                `}).join("")}
                                        </tbody>
                                    </table>
                                </div>

                                <div class="summary-grid">
                                    <div class="summary-box">
                                        <div><div class="summary-label">Total Marks</div><div class="summary-value">${r.totalObtained} <span style="font-size: 15pt; opacity: 0.8; font-weight: 900;">/ ${r.totalPossible}</span></div></div>
                                        <div style="text-align: right"><div class="summary-label">Percentage</div><div class="summary-accent">${r.percentage.toFixed(1)}%</div></div>
                                    </div>
                                    <div class="summary-box">
                                        <div style="display: flex; flex-direction: column; width: 100%;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                                <span class="summary-label">Final Position</span>
                                                <span class="summary-accent" style="font-size: 24pt;">#${r.position||"---"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="summary-box" style="grid-column: span 2;">
                                        <div><div class="summary-label">Final Grade</div><div class="summary-accent" style="font-size: 32pt;">${r.grade}</div></div>
                                        <div style="text-align: right">
                                            <div class="summary-label">Qualifying Status</div>
                                            <div style="font-size: 20pt; font-weight: 900; color: ${r.percentage>=40,"#000000"}">${r.percentage>=40?"PASSED":"FAILED"}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; margin-bottom: 10mm; padding-right: 10mm;">
                                    <div class="remarks-area" style="margin-bottom: 0; min-width: 250px; max-width: 70%;">
                                        <h4>Official Assessment Remark</h4>
                                        <p>${r.remarks||"Pending Finalization"}</p>
                                    </div>
                                    <div class="sig-block" style="margin-bottom: 5px;"><div class="sig-line"></div><div class="sig-label">Academic Incharge</div></div>
                                </div>

                                <div class="signature-row">
                                    <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Director</div></div>
                                    <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Principal</div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `},B=t=>{const{student:r,result:a,exam:s}=t;if(!r||!a||!s)return;const i=window.open("","","left=0,top=0,width=1000,height=1200,toolbar=0,scrollbars=0,status=0");if(!i)return;const n=a.className,o=_[n]||Object.keys(a.marks||{});i.document.write(Q(r,a,s,y,o)),i.document.write(`
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.onafterprint = function() { window.close(); };
                    }, 800);
                };
            <\/script>
        `),i.document.close()},ae=()=>{if(!d||!m){h.fire({title:"Selections Required",text:"Select an exam and class to export marks template.",icon:"warning"});return}const t=k.find(o=>o.id===d),r=_[m]||[],s=f.filter(o=>o.class===m&&(!u||o.campus?.toLowerCase()===u.toLowerCase())).map(o=>{const c=T.find(b=>b.studentId===o.id&&b.examId===d),v={"Student ID":o.id,Name:o.name," फादर नेम (Father Name)":o.fatherName||"",Campus:o.campus||""};return r.forEach(b=>{const p=c?.marks?.[b];v[`${b} (Obtained)`]=p?.obtained??"",v[`${b} (Total)`]=p?.total??L?.[m]?.[b]??100}),v}),i=Ae.json_to_sheet(s),n=Ae.book_new();Ae.book_append_sheet(n,i,"Marks"),Je(n,`Marks_${m}_${t?.name||"Exam"}.xlsx`),h.fire({title:"Exported",text:"Marks template downloaded successfully.",icon:"success",toast:!0,position:"top-end",timer:3e3})},se=()=>{if(!d||!u||q.length===0){h.fire({title:"Attention",text:"Please select session, campus, and classes.",icon:"warning"});return}const t=q,r=k.find(n=>n.id===d),a=T.filter(n=>n.examId===d&&t.includes(n.className)&&f.find(o=>o.id===n.studentId)?.campus?.toLowerCase()===u.toLowerCase()).sort((n,o)=>o.percentage-n.percentage),s=a.slice(0,3).map((n,o)=>({...n,pos:o+1,student:f.find(c=>c.id===n.studentId)}));if(s.length===0){h.fire({title:"No Data",text:"No results found for the selected range.",icon:"info"});return}const i=window.open("","_blank");i&&(i.document.write(`
            <html>
                <head>
                    <title>Range Toppers Report - ${u}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                        @page { size: A4 portrait; margin: 10mm; }
                        body { font-family: 'Outfit', sans-serif; padding: 0; margin: 0; color: #1e293b; background: white; }
                        
                        .page { padding: 40px; page-break-after: always; min-height: 250mm; display: flex; flex-direction: column; }
                        .page:last-child { page-break-after: auto; }

                        .main-header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #003366; padding-bottom: 25px; }
                        .school-name { font-size: 36px; font-weight: 900; color: #003366; margin: 0; text-transform: uppercase; }
                        .report-meta { font-size: 16px; font-weight: 700; color: #64748b; margin-top: 8px; text-transform: uppercase; letter-spacing: 2px; }
                        .campus-tag { display: inline-block; background: #003366; color: white; padding: 8px 25px; border-radius: 50px; font-size: 14px; margin-top: 20px; font-weight: 800; }

                        .range-info { margin: 30px 0; text-align: center; font-size: 18px; font-weight: 900; color: #003366; background: #f8fafc; padding: 15px; border-radius: 15px; border: 1px solid #e2e8f0; }

                        /* Podiums for Top 3 */
                        .podium-container { display: flex; justify-content: center; align-items: flex-end; gap: 20px; margin: 60px 0; height: 350px; }
                        .podium-item { flex: 1; max-width: 250px; background: white; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; align-items: center; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                        .rank-1 { height: 350px; border-top: 8px solid #ffb81c; position: relative; z-index: 10; margin-bottom: 20px; }
                        .rank-2 { height: 300px; border-top: 8px solid #94a3b8; }
                        .rank-3 { height: 260px; border-top: 8px solid #ff7c00; }

                        .rank-badge { width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: white; font-size: 24px; margin-bottom: 20px; }
                        .badge-1 { background: #ffb81c; }
                        .badge-2 { background: #94a3b8; }
                        .badge-3 { background: #ff7c00; }

                        .topper-image { width: 80px; height: 80px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 15px; border: 4px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                        .topper-name { font-weight: 900; font-size: 16px; color: #003366; text-transform: uppercase; text-align: center; line-height: 1.2; margin-bottom: 5px; }
                        .topper-class { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 15px; }
                        .topper-score { font-size: 28px; font-weight: 900; color: #003366; }
                        .topper-percent { font-size: 12px; font-weight: 700; color: #64748b; margin-top: -5px; }

                        /* Detail Table */
                        .data-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                        .data-table th { background: #003366; color: white; padding: 15px; text-align: left; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
                        .data-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #1e293b; }
                        .data-table tr:hover { background: #f8fafc; }

                        .footer { margin-top: auto; border-top: 1px solid #e2e8f0; padding-top: 25px; display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #94a3b8; }
                    </style>
                </head>
                <body>
                    <!-- PAGE 1: Overall Champions Podium -->
                    <div class="page">
                        <div class="main-header">
                            <h1 class="school-name">${y.schoolName}</h1>
                            <div class="report-meta">${r?.name} (${r?.session}) • OVERALL EXCELLENCE AWARDS</div>
                            <div class="campus-tag">${u} CAMPUS</div>
                        </div>

                    <div class="range-info">
                        SELECTED WINGS: ${t.join(", ")}
                    </div>

                        <div class="podium-container">
                            <!-- 2nd Place -->
                            ${s[1]?`
                                <div class="podium-item rank-2">
                                    <div class="rank-badge badge-2">2</div>
                                    <div class="topper-image">🥈</div>
                                    <div class="topper-name">${s[1].student?.name}</div>
                                    <div class="topper-class">${s[1].className}</div>
                                    <div class="topper-score">${s[1].percentage.toFixed(1)}%</div>
                                    <div class="topper-percent">AGGREGATE SCORE</div>
                                </div>
                            `:""}

                            <!-- 1st Place -->
                            ${s[0]?`
                                <div class="podium-item rank-1">
                                    <div class="rank-badge badge-1">1</div>
                                    <div class="topper-image">🥇</div>
                                    <div class="topper-name" style="font-size: 20px;">${s[0].student?.name}</div>
                                    <div class="topper-class">${s[0].className}</div>
                                    <div class="topper-score" style="font-size: 36px; color: #b45309;">${s[0].percentage.toFixed(1)}%</div>
                                    <div class="topper-percent" style="color: #b45309;">OVERALL CHAMPION</div>
                                </div>
                            `:""}

                            <!-- 3rd Place -->
                            ${s[2]?`
                                <div class="podium-item rank-3">
                                    <div class="rank-badge badge-3">3</div>
                                    <div class="topper-image">🥉</div>
                                    <div class="topper-name">${s[2].student?.name}</div>
                                    <div class="topper-class">${s[2].className}</div>
                                    <div class="topper-score">${s[2].percentage.toFixed(1)}%</div>
                                    <div class="topper-percent">AGGREGATE SCORE</div>
                                </div>
                            `:""}
                        </div>

                        <div class="footer">
                            <div>GENERATED ON ${new Date().toLocaleString().toUpperCase()}</div>
                            <div>CHAMPIONS PODIUM • PAGE 1</div>
                        </div>
                    </div>

                    <!-- PAGE 2: Full Benchmarks -->
                    <div class="page">
                        <div class="main-header">
                            <h1 class="school-name">${y.schoolName}</h1>
                            <div class="report-meta">INSTITUTIONAL PERFORMANCE AUDIT</div>
                            <div class="campus-tag">${u} - Detailed Range Registry</div>
                        </div>

                        <div style="font-size: 14px; font-weight: 900; text-transform: uppercase; color: #003366; border-left: 4px solid #003366; padding-left: 15px; margin-bottom: 25px;">
                            Full Merit List (Top 20 in Range)
                        </div>

                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 60px;">Rank</th>
                                    <th>Student Details</th>
                                    <th>Father Name</th>
                                    <th>Class</th>
                                    <th style="text-align: center;">Marks</th>
                                    <th style="text-align: center;">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${a.slice(0,20).map((n,o)=>{const c=f.find(v=>v.id===n.studentId);return`
                                        <tr>
                                            <td style="font-weight: 900; color: #003366;">#${o+1}</td>
                                            <td>
                                                <div style="font-weight: 900;">${c?.name}</div>
                                                <div style="font-size: 10px; color: #94a3b8;">ID: ${c?.id}</div>
                                            </td>
                                            <td style="font-weight: 600;">${c?.fatherName||"---"}</td>
                                            <td style="font-weight: 700; color: #003366;">${n.className}</td>
                                            <td style="text-align: center; font-family: monospace;">${n.totalObtained} / ${n.totalPossible}</td>
                                            <td style="text-align: center; font-weight: 900; color: #003366;">${n.percentage.toFixed(1)}%</td>
                                        </tr>
                                    `}).join("")}
                            </tbody>
                        </table>

                        <div class="footer">
                            <div>OFFICIAL RECOGNITION BUREAU</div>
                            <div>DETAILED MERIT LIST • PAGE 2</div>
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(() => {
                                window.print();
                                // window.close();
                            }, 500);
                        };
                    <\/script>
                </body>
            </html>
        `),i.document.close())},Z=()=>{if(!d||!u){h.fire({title:"Attention",text:"Please select an exam and a campus.",icon:"warning"});return}const t=k.find(n=>n.id===d),r=T.filter(n=>n.examId===d&&f.find(o=>o.id===n.studentId)?.campus?.toLowerCase()===u.toLowerCase()),a={};(t?.classes||[]).forEach(n=>{const o=r.filter(c=>c.className===n).sort((c,v)=>v.percentage-c.percentage).slice(0,3);o.length>0&&(a[n]=o.map((c,v)=>({...c,pos:v+1,student:f.find(b=>b.id===c.studentId)})))});const i=window.open("","_blank");i&&(i.document.write(`
            <html>
                <head>
                    <title>Campus Toppers Report - ${u}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                        @page { size: A4 landscape; margin: 10mm; }
                        body { font-family: 'Outfit', sans-serif; padding: 0; margin: 0; color: #1e293b; background: white; }
                        
                        .page { padding: 40px; page-break-after: always; min-height: 190mm; }
                        .page:last-child { page-break-after: auto; }

                        .main-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #003366; padding-bottom: 20px; }
                        .school-name { font-size: 32px; font-weight: 900; color: #003366; margin: 0; text-transform: uppercase; }
                        .report-meta { font-size: 14px; font-weight: 700; color: #64748b; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px; }
                        .campus-tag { display: inline-block; background: #003366; color: white; padding: 6px 20px; border-radius: 50px; font-size: 12px; margin-top: 15px; font-weight: 800; }

                        .section-title { font-size: 18px; font-weight: 900; color: #003366; text-transform: uppercase; margin-bottom: 25px; display: flex; align-items: center; gap: 10px; }
                        .section-title::after { content: ""; flex: 1; height: 2px; background: #f1f5f9; }

                        /* Card Styles */
                        .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                        .class-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; page-break-inside: avoid; }
                        .card-header { background: #003366; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; color: white; }
                        .card-header h3 { margin: 0; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
                        
                        .toppers-list { padding: 15px; }
                        .topper-row { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 15px; margin-bottom: 10px; border: 1px solid #f1f5f9; }
                        
                        .rank-badge { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: white; font-size: 16px; flex-shrink: 0; }
                        .rank-1 { background: #ffb81c; }
                        .rank-2 { background: #94a3b8; }
                        .rank-3 { background: #ff7c00; }

                        .student-info { flex: 1; min-width: 0; }
                        .student-name { font-weight: 900; color: #003366; font-size: 12px; text-transform: uppercase; margin-bottom: 2px; }
                        .student-score { font-size: 9px; font-weight: 800; color: #94a3b8; }

                        /* Table Styles */
                        .detail-table { width: 100%; border-collapse: collapse; border-radius: 15px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 40px; }
                        .detail-table th { background: #f8fafc; padding: 15px; text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
                        .detail-table td { padding: 15px; font-size: 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
                        .detail-table tr:last-child td { border-bottom: none; }
                        .pos-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: 900; font-size: 10px; color: white; }

                        .footer { margin-top: auto; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: #94a3b8; }
                    </style>
                </head>
                <body>
                    <!-- PAGE 1: Position Cards Summary -->
                    <div class="page">
                        <div class="main-header">
                            <h1 class="school-name">${y.schoolName}</h1>
                            <div class="report-meta">${t?.name} (${t?.session}) • ACADEMIC POSITION SUMMARY</div>
                            <div class="campus-tag">${u} CAMPUS</div>
                        </div>

                        <div class="section-title">🏆 Top Position Holders (Class-Wise)</div>

                        <div class="cards-grid">
                            ${Object.entries(a).map(([n,o])=>`
                                <div class="class-card">
                                    <div class="card-header">
                                        <h3>${n}</h3>
                                        <span>🏆</span>
                                    </div>
                                    <div class="toppers-list">
                                        ${o.map(c=>`
                                            <div class="topper-row">
                                                <div class="rank-badge rank-${c.pos}">${c.pos}</div>
                                                <div class="student-info">
                                                    <div class="student-name">${c.student?.name}</div>
                                                    <div class="student-score">★ ${c.percentage.toFixed(1)}% SCORE</div>
                                                </div>
                                                <div style="font-size: 8px; font-weight: 900; color: #1e293b; opacity: 0.8; text-transform: uppercase;">
                                                    ${c.pos===1?"TOPPER":c.pos===2?"RUNNER":"3RD"}
                                                </div>
                                            </div>
                                        `).join("")}
                                    </div>
                                </div>
                            `).join("")}
                        </div>

                        <div class="footer">
                            <div>GENERATED ON ${new Date().toLocaleString().toUpperCase()}</div>
                            <div>POSITION SUMMARY REPORT • PAGE 1</div>
                        </div>
                    </div>

                    <!-- PAGE 2: Detailed Registry -->
                    <div class="page">
                        <div class="main-header">
                            <h1 class="school-name">${y.schoolName}</h1>
                            <div class="report-meta">Institutional Academic Excellence Bureau</div>
                            <div class="campus-tag">${u} - Detailed Record</div>
                        </div>

                        <div class="section-title">📊 Detailed Performance Registry</div>

                        <table class="detail-table">
                            <thead>
                                <tr>
                                    <th style="width: 80px;">Class</th>
                                    <th style="width: 60px;">Rank</th>
                                    <th>Student Name</th>
                                    <th>Father Name</th>
                                    <th style="text-align: center;">Marks</th>
                                    <th style="text-align: center;">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(a).flatMap(([n,o])=>o.map(c=>`
                                        <tr>
                                            <td style="font-weight: 800; color: #003366;">${n}</td>
                                            <td>
                                                <span class="pos-badge rank-${c.pos}">${c.pos===1?"1st":c.pos===2?"2nd":"3rd"}</span>
                                            </td>
                                            <td>
                                                <div style="font-weight: 900;">${c.student?.name}</div>
                                                <div style="font-size: 9px; color: #94a3b8;">ID: ${c.student?.id}</div>
                                            </td>
                                            <td style="font-weight: 600;">${c.student?.fatherName||"---"}</td>
                                            <td style="text-align: center; font-family: monospace; font-weight: 700;">${c.totalObtained} / ${c.totalPossible}</td>
                                            <td style="text-align: center;">
                                                <div style="font-weight: 900; color: ${c.pos===1?"#b45309":"#1e293b"}; font-size: 14px;">${c.percentage.toFixed(1)}%</div>
                                            </td>
                                        </tr>
                                    `)).join("")}
                            </tbody>
                        </table>

                        <div class="footer">
                            <div>RECORDS BUREAU • OFFICIAL DOCUMENT</div>
                            <div>DETAILED REGISTRY • PAGE 2</div>
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(() => {
                                window.print();
                            }, 500);
                        };
                    <\/script>
                </body>
            </html>
        `),i.document.close())},H=async t=>{const r=t.target.files?.[0];if(!r||!d||!m)return;const a=new FileReader;a.onload=async s=>{try{const i=new Uint8Array(s.target?.result),n=Ze(i,{type:"array"}),o=n.SheetNames[0],c=n.Sheets[o],v=Ae.sheet_to_json(c);let b=0;v.forEach(p=>{const x=p["Student ID"];x&&Object.keys(p).forEach(w=>{if(w.endsWith(" (Obtained)")){const z=w.replace(" (Obtained)","").trim(),$=p[w],A=Object.keys(p).find(re=>re.trim()===`${z} (Total)`),K=A?p[A]:100;$!==void 0&&$!==""&&(ee(d,m,x,z,$,K),b++)}})}),h.fire({title:"Import Complete",text:`Successfully updated marks for ${b} subject entries.`,icon:"success"}),t.target.value=""}catch(i){console.error(i),h.fire({title:"Import Failed",text:"Ensure the file matches the exported template format.",icon:"error"})}},a.readAsArrayBuffer(r)},fe=t=>{const r=f.find(a=>a.id===t.studentId);r&&(V(t.examId),de(t.className),r.campus&&X(r.campus),J(t.studentId),te("marks"),window.scrollTo({top:0,behavior:"smooth"}))},ce=async(t,r=!1)=>{const{student:a,exam:s}=t;let{result:i}=t;if(!a||!i||!s)return Promise.reject("Missing data");const o=T.filter(A=>A.examId!==s.id||A.className!==i.className?!1:a.campus?f.find(re=>re.id===A.studentId)?.campus?.trim().toLowerCase()===a.campus?.trim().toLowerCase():!0).sort((A,K)=>K.percentage-A.percentage).findIndex(A=>A.studentId===a.id)+1;r||h.fire({title:"Generating PDF",text:"Preparing high-quality marksheet...",allowOutsideClick:!1,didOpen:()=>h.showLoading()});const c=Object.values(i.marks||{}),v=c.reduce((A,K)=>A+(Number(K.obtained)||0),0),b=c.reduce((A,K)=>A+(Number(K.total)||0),0),p=b>0?v/b*100:0;let x=i.grade||"F";(!i.grade||i.grade==="F")&&(p>=96?x="A++":p>=91?x="A+":p>=86?x="A":p>=81?x="B++":p>=76?x="B+":p>=71?x="B":p>=61?x="C+":p>=51?x="C":p>=40&&(x="D"));const w={...i,position:o,totalObtained:i.totalObtained||v,totalPossible:i.totalPossible||b,percentage:i.percentage||p,grade:x},S=_[w.className]||Object.keys(w.marks||{}),z=Q(a,w,s,y,S);r||h.fire({title:"Quantum Dispatch...",text:"Preparing high-resolution transcript",allowOutsideClick:!1,didOpen:()=>h.showLoading()});const $=document.createElement("div");$.style.position="fixed",$.style.left="-2000vw",$.style.top="0",$.style.width="210mm",$.innerHTML=`
            <div id="pdf-export-root" style="background: white; width: 210mm; min-height: 297mm; padding: 0; margin: 0;">
                ${z}
            </div>
        `,document.body.appendChild($);try{await new Promise(Xe=>setTimeout(Xe,2e3));const A=document.getElementById("pdf-export-root");if(!A)throw new Error("Render node not found");const K=await at(A,{quality:1,pixelRatio:2,backgroundColor:"#ffffff",skipAutoScale:!0});document.body.removeChild($);const re=new et({orientation:"portrait",unit:"mm",format:"a4",compress:!0}),Oe=re.getImageProperties(K),De=re.internal.pageSize.getWidth(),Ke=Oe.height*De/Oe.width;re.addImage(K,"PNG",0,0,De,Ke,void 0,"FAST");const Le=re.output("datauristring"),Qe=`⭐ *OFFICIAL ACADEMIC TRANSCRIPT* ⭐

Dear Parent/Guardian,

We are pleased to share the comprehensive performance evaluation for *${a.name}* regarding the *${s.name}* session at *${y.schoolName}*.

📊 *PERFORMANCE SUMMARY:*
━━━━━━━━━━━━━━━━━━━━
🔹 *Aggregate Score:* ${w.totalObtained} / ${w.totalPossible}
🔹 *Global Percentage:* ${w.percentage.toFixed(1)}%
🔹 *Academic Grade:* ${w.grade}
🔹 *Class Merit Rank:* ${w.position||"Calculated"}
━━━━━━━━━━━━━━━━━━━━

Please find the attached digital marksheet for detailed subject-wise analysis. This document serves as an official record of achievement and progress.

We appreciate your continued partnership in excellence.

Best Regards,
*Directorate of Examinations*
*${y.schoolName}*`;return ke(a.id,"General",Qe,Le,`Marksheet_${a.name}.pdf`),r||h.fire({title:"Transmitted!",text:"The digital transcript has been dispatched to WhatsApp.",icon:"success",toast:!0,position:"top-end",timer:3e3}),Le}catch(A){throw console.error("Advanced PDF Error:",A),document.body.contains($)&&document.body.removeChild($),r||h.fire({title:"System Error",text:"Quantum rendering failed. Please try again.",icon:"error"}),A}},Ve=()=>{let t=T.filter(i=>i.examId!==d||m&&m!=="All"&&i.className!==m?!1:u?f.find(o=>o.id===i.studentId)?.campus?.trim().toLowerCase()===u.trim().toLowerCase():!0);g.length>0&&(t=t.filter(i=>g.includes(i.studentId))),t.sort((i,n)=>n.percentage-i.percentage);const r=k.find(i=>i.id===d);if(t.length===0){h.fire({title:"No Results",text:"No results selected or found for this selection.",icon:"info"});return}const a=window.open("","","left=0,top=0,width=1000,height=1200,toolbar=0,scrollbars=0,status=0");if(!a)return;let s="";t.forEach((i,n)=>{const o=f.find(w=>w.id===i.studentId);if(!o)return;const c=i.className,v=_[c]||Object.keys(i.marks||{}),b=Q(o,{...i,position:n+1},r,y,v),p=b.match(/<body>([\s\S]*?)<\/body>/),x=b.match(/<head>([\s\S]*?)<\/head>/);n===0&&(s+=`<html><head>${x?x[1]:""}<style>.page-break { page-break-after: always; } @media print { .page-break { page-break-after: always; display: block; } }</style></head><body>`),p&&(s+=`<div class="${n<t.length-1?"page-break":""}">${p[1]}</div>`),n===t.length-1&&(s+="</body></html>")}),a.document.write(s),a.document.write(`
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.onafterprint = function() { window.close(); };
                    }, 1500);
                };
            <\/script>
        `),a.document.close()},Ye=async()=>{let t=T.filter(i=>i.examId!==d||m&&m!=="All"&&i.className!==m?!1:u?f.find(o=>o.id===i.studentId)?.campus?.trim().toLowerCase()===u.trim().toLowerCase():!0);g.length>0&&(t=t.filter(i=>g.includes(i.studentId))),t.sort((i,n)=>n.percentage-i.percentage);const r=k.find(i=>i.id===d);if(t.length===0){h.fire({title:"No Results",text:`No results found for this class ${u?`in ${u}`:""}.`,icon:"info"});return}const{isConfirmed:a}=await h.fire({title:"Bulk WhatsApp PDF",text:`You are about to send full PDF marksheets to parents of ${t.length} students in ${m} ${u?`(${u})`:""}. This process runs in the background. Continue?`,icon:"question",showCancelButton:!0,confirmButtonText:"Neural Dispatch (PDF)",confirmButtonColor:"#10b981"});if(!a)return;h.fire({title:"Neural Dispatching...",html:`<div class="text-xs">Processing subject matrix for <b>${m}</b>...</div>`,allowOutsideClick:!1,didOpen:()=>h.showLoading()});let s=0;for(const i of t){const n=f.find(o=>o.id===i.studentId);if(n){try{const o=t.indexOf(i);await ce({student:n,result:{...i,position:o+1},exam:r},!0),s++}catch(o){console.error(o)}await new Promise(o=>setTimeout(o,800))}}h.fire({title:"Process Complete",text:`Matrix complete. ${s} Marksheet PDFs have been queued for the WhatsApp gateway.`,icon:"success"})},je=t=>{const r=window.open("","","left=0,top=0,width=1123,height=794,toolbar=0,scrollbars=0,status=0");if(r){const a=`CERT-${Math.random().toString(36).substr(2,9).toUpperCase()}`;r.document.write(`
                <html>
                    <head>
                        <title>Official Certificate</title>
                        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Montserrat:wght@300;400;600;700&family=Great+Vibes&family=Pinyon+Script&display=swap" rel="stylesheet">
                        <style>
                            @page { size: A4 landscape; margin: 0; }
                            body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Montserrat', sans-serif; }
                            .cert-page { 
                                width: 1123px; height: 794px; position: relative; 
                                background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%); 
                                overflow: hidden; page-break-after: always; box-sizing: border-box; 
                            }
                            
                            /* Luxury Borders */
                            .border-outer { position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 1px solid #1a233a; }
                            .border-inner { position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 4px solid #c5a059; border-radius: 4px; box-shadow: inset 0 0 0 2px #fff, inset 0 0 0 3px #c5a059; background: #fff; }
                            .border-inner-2 { position: absolute; top: 45px; left: 45px; right: 45px; bottom: 45px; border: 1px solid rgba(197, 160, 89, 0.4); }

                            /* Corner Ornaments */
                            .corner { position: absolute; width: 60px; height: 60px; z-index: 5; }
                            .corner-tl { top: 25px; left: 25px; border-top: 5px solid #1a233a; border-left: 5px solid #1a233a; }
                            .corner-tr { top: 25px; right: 25px; border-top: 5px solid #1a233a; border-right: 5px solid #1a233a; }
                            .corner-bl { bottom: 25px; left: 25px; border-bottom: 5px solid #1a233a; border-left: 5px solid #1a233a; }
                            .corner-br { bottom: 25px; right: 25px; border-bottom: 5px solid #1a233a; border-right: 5px solid #1a233a; }

                            .watermark { 
                                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                                opacity: 0.04; width: 600px; height: 600px; 
                                background-image: url('${y.logo1||"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png"}'); 
                                background-size: contain; background-repeat: no-repeat; background-position: center; filter: grayscale(100%); z-index: 1; 
                            }

                            .content-wrapper { position: absolute; top: 60px; left: 60px; right: 60px; bottom: 60px; z-index: 10; display: flex; flex-direction: column; justify-content: space-between; text-align: center; }
                            
                            .header { display: flex; justify-content: space-between; align-items: flex-start; padding: 0 40px; }
                            .logo-box { width: 100px; height: 100px; display: flex; justify-content: center; align-items: center; }
                            .logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }
                            
                            .school-info { flex: 1; margin: 0 20px; padding-top: 15px; }
                            .school-name { font-family: 'Cinzel', serif; font-size: 36px; font-weight: 900; color: #1a233a; letter-spacing: 5px; text-transform: uppercase; margin: 0; line-height: 1.2; text-shadow: 1px 1px 0px rgba(0,0,0,0.1); }
                            .subtitle { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 600; color: #c5a059; letter-spacing: 6px; text-transform: uppercase; margin-top: 8px; }

                            .cert-title-container { margin-top: 20px; }
                            .cert-title { font-family: 'Cinzel', serif; font-size: 54px; font-weight: 900; color: #c5a059; letter-spacing: 12px; margin: 0; text-transform: uppercase; }
                            .cert-subtitle { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: #1a233a; letter-spacing: 8px; text-transform: uppercase; margin-top: 5px; }

                            .body-content { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; margin-top: -20px; }
                            .presented-to { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: #777; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 25px; }
                            
                            .student-name { 
                                font-family: 'Pinyon Script', cursive; 
                                font-size: 85px; 
                                color: #1a233a; 
                                margin: 0; 
                                line-height: 1; 
                                text-shadow: 2px 2px 4px rgba(0,0,0,0.05);
                                text-transform: capitalize;
                            }
                            
                            .name-underline { width: 500px; height: 2px; background: linear-gradient(90deg, transparent, #c5a059, transparent); margin: 10px auto 35px auto; }
                            
                            .narrative { font-size: 20px; color: #333; line-height: 1.8; max-width: 800px; margin: 0 auto; font-family: 'Playfair Display', serif; }
                            .narrative strong, .narrative b { font-family: 'Cinzel', serif; font-size: 22px; color: #1a233a; font-weight: 900; letter-spacing: 1px; }
                            
                            .footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 60px; margin-bottom: 20px; }
                            
                            .signature-box { text-align: center; width: 220px; }
                            .signature-img { height: 60px; margin-bottom: -10px; opacity: 0.8; }
                            .signature-line { width: 100%; height: 1px; background: #1a233a; margin-bottom: 10px; position: relative; }
                            .signature-title { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700; color: #1a233a; letter-spacing: 3px; text-transform: uppercase; }
                            .signature-subtitle { font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 400; color: #777; letter-spacing: 1px; margin-top: 4px; }

                            .seal-container { position: relative; width: 160px; height: 160px; display: flex; justify-content: center; align-items: center; margin-bottom: -20px; }
                            .seal-outer { position: absolute; width: 140px; height: 140px; border-radius: 50%; border: 2px solid #c5a059; }
                            .seal-ribbon-left { position: absolute; bottom: 0px; left: 15px; width: 40px; height: 60px; background: #960018; transform: rotate(30deg); z-index: 1; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; box-shadow: 2px 4px 8px rgba(0,0,0,0.2); }
                            .seal-ribbon-left::after { content: ''; position: absolute; bottom: -15px; left: 0; border-left: 20px solid #960018; border-right: 20px solid #960018; border-bottom: 20px solid transparent; }
                            .seal-ribbon-right { position: absolute; bottom: 0px; right: 15px; width: 40px; height: 60px; background: #960018; transform: rotate(-30deg); z-index: 1; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; box-shadow: -2px 4px 8px rgba(0,0,0,0.2); }
                            .seal-ribbon-right::after { content: ''; position: absolute; bottom: -15px; left: 0; border-left: 20px solid #960018; border-right: 20px solid #960018; border-bottom: 20px solid transparent; }
                            
                            .seal-inner { position: relative; width: 130px; height: 130px; background: radial-gradient(circle, #e2c179 0%, #b8860b 100%); border-radius: 50%; display: flex; justify-content: center; align-items: center; flex-direction: column; box-shadow: 0 4px 15px rgba(0,0,0,0.3), inset 0 2px 5px rgba(255,255,255,0.6); z-index: 5; border: 3px solid #ffdf00; }
                            .seal-inner::before { content: ''; position: absolute; width: 116px; height: 116px; border-radius: 50%; border: 1px dashed rgba(255,255,255,0.7); }
                            .seal-text-top { font-family: 'Cinzel', serif; font-size: 11px; font-weight: 900; color: #fff; letter-spacing: 2px; position: absolute; top: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.4); }
                            .seal-star { color: #fff; font-size: 24px; margin: 15px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.4); }
                            .seal-text-bottom { font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 700; color: #fff; letter-spacing: 1px; position: absolute; bottom: 20px; text-shadow: 1px 1px 2px rgba(0,0,0,0.4); }

                            .meta-container { position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%); text-align: center; font-family: 'Montserrat', sans-serif; font-size: 10px; color: #888; letter-spacing: 2px; }
                            .meta-serial { font-weight: 700; color: #1a233a; }

                        </style>
                    </head>
                    <body>
                        <div class="cert-page">
                            <!-- Borders -->
                            <div class="border-outer"></div>
                            <div class="border-inner"></div>
                            <div class="border-inner-2"></div>
                            
                            <!-- Corners -->
                            <div class="corner corner-tl"></div>
                            <div class="corner corner-tr"></div>
                            <div class="corner corner-bl"></div>
                            <div class="corner corner-br"></div>
                            
                            <!-- Watermark -->
                            <div class="watermark"></div>

                            <div class="content-wrapper">
                                <!-- Header -->
                                <div class="header">
                                    <div class="logo-box">
                                        ${y.logo1?`<img src="${y.logo1}" class="logo-img" />`:""}
                                    </div>
                                    <div class="school-info">
                                        <h1 class="school-name">${y.schoolName||"Education Institute"}</h1>
                                        <div class="subtitle">${y.subTitle||"Excellence in Professional Education"}</div>
                                        
                                        <div class="cert-title-container">
                                            <h2 class="cert-title">Certificate</h2>
                                            <div class="cert-subtitle">${t?.isCustom?(t.category||"Special Award").toUpperCase():"Academic Merit Award"}</div>
                                        </div>
                                    </div>
                                    <div class="logo-box">
                                        ${y.logo2?`<img src="${y.logo2}" class="logo-img" />`:y.logo1?`<img src="${y.logo1}" class="logo-img" />`:""}
                                    </div>
                                </div>

                                <!-- Body -->
                                <div class="body-content">
                                    <div class="presented-to">This is proudly presented to</div>
                                    <h3 class="student-name">${(t?.student?.name||"---").toLowerCase()}</h3>
                                    <div class="name-underline"></div>
                                    <div class="narrative">
                                        ${t?.isCustom?`
                                            Has demonstrated exceptional prowess and dedication by achieving
                                            <strong>${t.position||"Outstanding Success"}</strong> in the 
                                            <strong>${t.event||"Institutional Category"}</strong> event. 
                                            Your pursuit of excellence serves as an inspiration to the entire academic community.
                                        `:`
                                            For securing the <strong>${t?.result?.position||"1"}${t?.result?.position===1?"st":t?.result?.position===2?"nd":t?.result?.position===3?"rd":"th"} Position</strong> 
                                            in the <strong>${t?.exam?.name||"Official Examination"}</strong> 
                                            with a commendable aggregate of <strong>${t?.result?.percentage?.toFixed(1)||"0.0"}%</strong>.
                                            This certificate recognizes your hard work, intelligence, and academic dedication.
                                        `}
                                    </div>
                                </div>

                                <!-- Footer -->
                                <div class="footer">
                                    <div class="signature-box">
                                        <div style="height: 60px;"></div>
                                        <div class="signature-line"></div>
                                        <div class="signature-title">Administrator</div>
                                        <div class="signature-subtitle">${y.schoolName||"Education Institute"}</div>
                                    </div>
                                    
                                    <div class="seal-container">
                                        <div class="seal-outer"></div>
                                        <div class="seal-ribbon-left"></div>
                                        <div class="seal-ribbon-right"></div>
                                        <div class="seal-inner">
                                            <div class="seal-text-top">OFFICIAL</div>
                                            <div class="seal-star">
                                                ${t?.isCustom?t.position?.includes("1")?"1st":t.position?.includes("2")?"2nd":"★":t?.result?.position===1?"1st":t?.result?.position===2?"2nd":t?.result?.position===3?"3rd":"★"}
                                            </div>
                                            <div class="seal-text-bottom">${t?.isCustom?"AWARD":"MERIT"}</div>
                                        </div>
                                    </div>
                                    
                                    <div class="signature-box">
                                        <div style="height: 60px;"></div>
                                        <div class="signature-line"></div>
                                        <div class="signature-title">Principal</div>
                                        <div class="signature-subtitle">${y.schoolName||"Education Institute"}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Meta -->
                            <div class="meta-container">
                                <span class="meta-serial">ID: ${a}</span> &nbsp;|&nbsp; Date: ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                            </div>
                        </div>
                        <script>
                            setTimeout(() => {
                                window.print();
                                window.close();
                            }, 1000);
                        <\/script>
                    </body>
                </html>
            `),r.document.close()}};return e.jsxs("div",{className:"space-y-6 animate-fade-in font-outfit",children:[e.jsx("div",{style:{display:"none"},children:e.jsx("div",{ref:Y,children:e.jsx("div",{children:"Certificate Preview"})})}),e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center justify-between gap-4 px-2",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("h2",{className:"text-xl md:text-2xl font-black tracking-tighter uppercase text-brand-primary dark:text-brand-accent leading-none",children:"Academic Portal"}),e.jsx("span",{className:"px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded-full",children:"Automated"})]}),xe&&e.jsxs("button",{onClick:C,className:"w-full md:w-auto px-4 py-2 bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary rounded-[var(--brand-radius,0.75rem)] text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg",children:[e.jsx(_e,{className:"w-3.5 h-3.5"})," Initialize Exam"]})]}),e.jsx("div",{className:"w-full pb-2 md:pb-4 overflow-x-auto no-scrollbar pt-2 px-1",children:e.jsx("div",{className:"flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-full md:rounded-[var(--brand-radius,1rem)] w-max md:w-auto border border-white/50 dark:border-white/5 gap-1.5 md:gap-2 shadow-inner ring-1 ring-slate-900/5 dark:ring-0",children:[{id:"manage",label:"Sessions",icon:Be,visible:xe},{id:"class_tests",label:"Class Tests",icon:Ce,visible:!0},{id:"marks",label:"Marks Portal",icon:Ge,visible:!0},{id:"results",label:"Standings",icon:pe,visible:!0},{id:"top",label:"Top Rankers",icon:ze,visible:!0},{id:"campus_toppers",label:"Campus Tops",icon:Ue,visible:!0},{id:"range_toppers",label:"Range Tops",icon:ie,visible:!0},{id:"custom",label:"Special",icon:ie,visible:me}].filter(t=>t.visible).map(t=>e.jsxs("button",{onClick:()=>te(t.id),className:I("flex flex-row items-center justify-center gap-2 px-5 py-2.5 rounded-full md:rounded-[var(--brand-radius,0.75rem)] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300",R===t.id?"bg-white dark:bg-brand-accent text-brand-primary shadow-sm ring-1 ring-slate-900/5 dark:ring-0 scale-100":"text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-brand-accent hover:bg-white/40 dark:hover:bg-white/5"),children:[e.jsx(t.icon,{className:I("w-4 h-4 transition-colors",R===t.id?"text-brand-primary dark:text-brand-primary":"opacity-70")}),e.jsx("span",{children:t.label})]},t.id))})}),R==="class_tests"&&e.jsx(nt,{}),R==="manage"&&e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",children:k.length===0?e.jsxs("div",{className:"col-span-full py-32 text-center bg-white dark:bg-white/5 rounded-[var(--brand-radius,3rem)] border-4 border-dashed border-slate-100 dark:border-brand-accent/10",children:[e.jsx("div",{className:"w-20 h-20 bg-slate-50 dark:bg-brand-accent/5 rounded-[var(--brand-radius,2rem)] flex items-center justify-center mx-auto mb-6",children:e.jsx(Ie,{className:"w-10 h-10 text-slate-300 dark:text-brand-accent/20"})}),e.jsx("p",{className:"text-slate-400 dark:text-brand-accent/40 font-[1000] uppercase text-sm tracking-[0.3em]",children:"No Active Exam Sessions Found"}),U&&e.jsx("p",{className:"text-xs text-slate-400 dark:text-brand-accent/20 font-bold mt-4 uppercase tracking-widest",children:"Invoke the core registry to begin academic evaluation."})]}):k.map(t=>e.jsxs("div",{className:"group relative bg-white dark:bg-[#000816] rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 transition-all duration-500 hover:-translate-y-2 border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden",children:[e.jsx("div",{className:"absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-150 transition-transform duration-700",children:e.jsx(Be,{className:"w-32 h-32"})}),e.jsxs("div",{className:"relative z-10",children:[e.jsxs("div",{className:"flex justify-between items-start mb-6",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"}),e.jsx("p",{className:"text-[8px] font-black text-slate-400 dark:text-brand-accent/40 uppercase tracking-[0.2em]",children:t.date})]}),e.jsx("h3",{className:"text-xl font-[1000] text-brand-primary dark:text-white leading-none uppercase tracking-tighter",children:t.name})]}),e.jsx("div",{className:I("px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm",t.status==="Finalized"?"bg-emerald-500 text-white":"bg-amber-500 text-white"),children:t.status})]}),e.jsxs("div",{className:"space-y-4 mb-6",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Re,{className:"w-3.5 h-3.5 text-slate-300"}),e.jsxs("span",{className:"text-[9px] font-black text-slate-500 uppercase tracking-widest",children:[t.classes.length," participating wings"]})]}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:t.classes.filter(r=>U||G?.role==="teacher"&&G?.inchargeClass===r).map(r=>e.jsx("span",{className:"px-2 py-1 bg-slate-50 dark:bg-white/5 text-[8px] font-black text-brand-primary dark:text-brand-accent/80 rounded-lg border border-slate-100 dark:border-white/5 uppercase",children:r},r))})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-2 sm:gap-3 pt-4 border-t border-slate-50 dark:border-white/5",children:[e.jsxs("button",{onClick:()=>{V(t.id),te("marks")},className:"w-full sm:flex-1 py-3 bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-primary rounded-[var(--brand-radius,1rem)] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-md flex justify-center items-center gap-2",children:[e.jsx(Ie,{className:"w-3.5 h-3.5"})," Portal"]}),U&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:()=>E(t),className:"w-full sm:w-auto p-3 sm:px-4 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-brand-accent/80 rounded-[var(--brand-radius,1rem)] hover:bg-slate-100 hover:text-brand-primary dark:hover:bg-white/10 dark:hover:text-brand-accent transition-all active:scale-90 flex justify-center items-center gap-2",children:[e.jsx(Pe,{className:"w-4 h-4"})," ",e.jsx("span",{className:"sm:hidden text-[10px] font-black uppercase tracking-widest",children:"Edit"})]}),e.jsxs("button",{onClick:()=>j(t.id),className:"w-full sm:w-auto p-3 sm:px-4 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-[var(--brand-radius,1rem)] hover:bg-rose-500 hover:text-white transition-all active:scale-90 flex justify-center items-center gap-2",children:[e.jsx(qe,{className:"w-4 h-4"})," ",e.jsx("span",{className:"sm:hidden text-[10px] font-black uppercase tracking-widest",children:"Delete"})]})]})]})]})]},t.id))}),R==="marks"&&e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"bg-white/80 dark:bg-[#000816]/80 rounded-[1.5rem] md:rounded-[2rem] p-2 shadow-sm border border-slate-200/50 dark:border-white/5 md:flex md:flex-row grid grid-cols-1 gap-1",children:[e.jsxs("div",{className:"md:flex-1 relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20",children:[e.jsx("label",{className:"text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5",children:"Academic Session"}),e.jsxs("select",{value:d||"",onChange:t=>{V(t.target.value),G?.role==="teacher"&&G?.inchargeClass||de(null),J(null)},className:"w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer",children:[e.jsx("option",{value:"",children:"Select Session..."}),k.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]}),d&&e.jsxs("div",{className:"md:flex-1 relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20 animate-fade-in",children:[e.jsx("label",{className:"text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5",children:"Select Campus"}),e.jsxs("select",{value:u||"",onChange:t=>{X(t.target.value),J(null)},className:"w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer",children:[e.jsx("option",{value:"",children:"All Campuses..."}),ve().campuses?.map(t=>e.jsx("option",{value:t.name,children:t.name.toUpperCase()},t.id))]})]}),d&&e.jsxs("div",{className:"md:flex-1 relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20 animate-fade-in",children:[e.jsx("label",{className:"text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5",children:"Assigned Class"}),e.jsxs("select",{value:m||"",onChange:t=>{de(t.target.value),J(null)},className:"w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer",children:[e.jsx("option",{value:"",children:"Select Wing..."}),k.find(t=>t.id===d)?.classes.filter(t=>U||G?.role==="teacher"&&G?.inchargeClass===t).map(t=>e.jsx("option",{value:t,children:t},t))]})]}),m&&e.jsxs("div",{className:"md:flex-1 relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20 animate-fade-in",children:[e.jsx("label",{className:"text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5",children:"Enrolled Student"}),e.jsxs("select",{value:M||"",onChange:t=>J(t.target.value),className:"w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-brand-primary dark:text-brand-accent outline-none appearance-none truncate cursor-pointer",children:[e.jsx("option",{value:"",disabled:!0,children:"Select Student..."}),(()=>{const t=u?.trim().toLowerCase(),r=f.filter(i=>i.class===m&&(!t||i.campus?.trim().toLowerCase()===t)),a=_[m]||[],s=a.length;return r.map(i=>{const n=T.find(c=>c.studentId===i.id&&c.examId===d);let o=!1;if(n&&s>0){let c=0;a.forEach(v=>{const b=v.trim(),p=n.marks[b]||n.marks[v];p&&p.obtained!==void 0&&String(p.obtained)!==""&&c++}),o=c>=s}return e.jsxs("option",{value:i.id,children:[o?"✓ ":"",i.name," (",i.id,")"]},i.id)})})()]})]}),m&&e.jsxs("div",{className:"flex items-center gap-1.5 px-2",children:[e.jsx("button",{onClick:ae,title:"Export Template",className:"p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all active:scale-95 border border-indigo-100 dark:border-indigo-500/20",children:e.jsx(rt,{className:"w-4 h-4"})}),e.jsxs("label",{className:"p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all active:scale-95 border border-emerald-100 dark:border-emerald-500/20 cursor-pointer",children:[e.jsx(it,{className:"w-4 h-4"}),e.jsx("input",{type:"file",accept:".xlsx,.xls",onChange:H,className:"hidden"})]})]})]}),d&&m&&M?e.jsxs("div",{className:"glass-card overflow-hidden",children:[e.jsxs("div",{className:"p-4 md:p-6 bg-brand-primary text-white flex flex-col md:flex-row md:items-center justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"text-sm md:text-sm font-black uppercase tracking-widest",children:"Marks Sheet"}),e.jsxs("p",{className:"text-[10px] opacity-70 font-bold",children:[f.find(t=>t.id===M)?.name," • ",m]})]}),e.jsxs("div",{className:"grid grid-cols-2 sm:flex sm:flex-row flex-wrap items-stretch sm:items-center gap-2",children:[e.jsxs("button",{onClick:()=>{const t=f.find(s=>s.id===M),r=k.find(s=>s.id===d),a=T.find(s=>s.studentId===M&&s.examId===d);t&&r&&a?ce({student:t,result:a,exam:r}):h.fire({title:"Insufficient Data",text:"Please ensure at least one subject mark is recorded before sending PDF.",icon:"warning"})},className:"col-span-1 sm:w-auto px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-[1rem] text-[9.5px] font-black uppercase tracking-widest transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-sm",children:[e.jsx(Ne,{className:"w-4 h-4"}),e.jsx("span",{className:"whitespace-nowrap",children:"Distribute"})]}),e.jsxs("button",{onClick:()=>{const t=f.find(s=>s.id===M),r=k.find(s=>s.id===d),a=T.find(s=>s.studentId===M&&s.examId===d);if(t&&r&&a){const i=T.filter(n=>n.examId!==d||n.className!==m?!1:t.campus?f.find(c=>c.id===n.studentId)?.campus?.trim().toLowerCase()===t.campus?.trim().toLowerCase():!0).sort((n,o)=>o.percentage-n.percentage).findIndex(n=>n.studentId===t.id)+1;B({student:t,result:{...a,position:i},exam:r})}},className:"col-span-1 sm:w-auto px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-[1rem] text-[9.5px] font-black uppercase tracking-widest transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-sm",children:[e.jsx(ne,{className:"w-4 h-4"}),e.jsx("span",{className:"whitespace-nowrap",children:"Print"})]}),e.jsxs("button",{onClick:()=>{const t=f.find(s=>s.id===M),r=k.find(s=>s.id===d),a=T.find(s=>s.studentId===M&&s.examId===d);if(t&&r&&a){const s=Object.entries(a.marks);s.forEach(([i,n])=>{const o=tt.MARKS_UPDATE(t.name,r.name,i,n.obtained,n.total,y.schoolName);ke(t.id,"General",o)}),h.fire({title:"Alerts Queued",text:`WhatsApp alerts for ${s.length} subjects have been sent to ${t.name}'s parent.`,icon:"success",toast:!0,position:"top-end",timer:3e3})}},className:"col-span-1 sm:w-auto px-4 py-2.5 bg-indigo-500/30 text-indigo-50 rounded-[1rem] text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5",children:[e.jsx(He,{className:"w-4 h-4"})," ",e.jsx("span",{className:"whitespace-nowrap",children:"Alert"})]}),oe&&e.jsxs("button",{onClick:()=>D(d,m),className:"col-span-2 sm:w-auto px-5 py-3 bg-emerald-500 text-white rounded-[1rem] text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-1 sm:mt-0",children:[e.jsx(Ge,{className:"w-4 h-4 text-emerald-100"})," ",e.jsx("span",{className:"whitespace-nowrap",children:"Finalize Result"})]})]})]}),e.jsx("div",{className:"md:hidden p-3 md:p-4 space-y-4 bg-slate-50/80 dark:bg-[#000816]",children:(_[m]||[]).map(t=>{const r=T.find(n=>n.studentId===M&&n.examId===d),a=m&&L?.[m]?.[t]||100,s=r?.marks[t]||{obtained:void 0,total:a},i=s.total>0&&s.obtained!==void 0&&s.obtained!==""?s.obtained/s.total*100:0;return e.jsxs("div",{className:"bg-white dark:bg-slate-900 rounded-[1.25rem] p-4 shadow-sm border border-slate-100/80 dark:border-white/5 overflow-hidden relative group",children:[e.jsx("div",{className:"absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/[0.03] dark:bg-brand-accent/[0.03] rounded-full blur-2xl pointer-events-none transition-all group-focus-within:bg-brand-primary/[0.08]"}),e.jsxs("div",{className:"flex items-center justify-between mb-5 relative z-10",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-11 h-11 rounded-[0.85rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 flex items-center justify-center border border-slate-200/50 dark:border-white/5 shadow-inner shrink-0",children:e.jsx(Ie,{className:"w-5 h-5 text-brand-primary/80 dark:text-brand-accent/80"})}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[15px] leading-none font-[1000] text-slate-800 dark:text-white uppercase tracking-tight block",children:t}),e.jsxs("div",{className:"flex items-center gap-1.5 mt-1.5",children:[e.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"}),e.jsx("span",{className:"text-[9px] font-black text-slate-400 uppercase tracking-widest",children:"SUBJECT MATRIX"})]})]})]}),s.obtained!==void 0&&s.obtained!==""?e.jsxs("div",{className:"px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black tracking-widest uppercase flex items-center gap-1 border border-emerald-100 dark:border-emerald-500/20 shadow-sm shrink-0",children:[e.jsx(Me,{className:"w-3.5 h-3.5"})," Logged"]}):e.jsxs("div",{className:"px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black tracking-widest uppercase flex items-center gap-1 border border-amber-100 dark:border-amber-500/20 shadow-sm shrink-0",children:[e.jsx(We,{className:"w-3.5 h-3.5"})," Pending"]})]}),e.jsxs("div",{className:"flex bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100/50 dark:border-white/5 rounded-2xl p-1.5 relative z-10 isolate",children:[e.jsxs("div",{className:"flex-1 p-2",children:[e.jsx("label",{className:"text-[8px] font-black text-slate-400 dark:text-brand-accent/40 uppercase tracking-[0.2em] block mb-2 ml-1",children:"Total Points"}),e.jsx("div",{className:"relative",children:e.jsx("input",{type:"number",value:s.total,onChange:n=>ee(d,m,M,t,s.obtained,Number(n.target.value)),className:"w-full bg-white dark:bg-slate-800 border-none text-center py-3 rounded-xl text-sm font-black text-slate-600 dark:text-slate-200 outline-none shadow-sm shadow-slate-200/50 dark:shadow-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-brand-accent/30 transition-all font-outfit"})})]}),e.jsx("div",{className:"flex flex-col justify-center px-1 z-10",children:e.jsx("div",{className:"w-px h-10 bg-slate-200/80 dark:bg-white/10 rounded-full"})}),e.jsxs("div",{className:"flex-1 p-2",children:[e.jsx("label",{className:"text-[8px] font-black text-brand-primary dark:text-brand-accent uppercase tracking-[0.2em] block mb-2 ml-1",children:"Score Obtained"}),e.jsx("div",{className:"relative",children:e.jsx("input",{id:`mark-input-obtained-${t.replace(/\\s+/g,"-")}`,type:"number",value:s.obtained!==void 0?s.obtained:"",onChange:n=>ee(d,m,M,t,n.target.value,s.total),onKeyDown:n=>{if(n.key==="Enter"){n.preventDefault();const o=_[m]||[],c=o.indexOf(t);if(c<o.length-1){const v=o[c+1],b=document.querySelectorAll(`input[id="mark-input-obtained-${v.replace(/\\s+/g,"-")}"]`);for(let p=0;p<b.length;p++){const x=b[p];if(x.offsetParent!==null){x.focus(),x.select();return}}}else{const v=o.length,b=f.filter(w=>w.class===m&&(!u||w.campus?.toLowerCase()===u.toLowerCase())),p=b.findIndex(w=>w.id===M),x=b.find((w,S)=>{if(S<=p)return!1;const z=T.find(A=>A.studentId===w.id&&A.examId===d);if(!z)return!0;let $=0;return o.forEach(A=>{z.marks[A]&&z.marks[A].obtained!==void 0&&String(z.marks[A].obtained)!==""&&$++}),$<v});x&&(J(x.id),setTimeout(()=>{const w=o[0],S=document.querySelectorAll(`input[id="mark-input-obtained-${w.replace(/\\s+/g,"-")}"]`);for(let z=0;z<S.length;z++){const $=S[z];if($.offsetParent!==null){$.focus(),$.select();return}}},200))}}},className:"w-full bg-white dark:bg-slate-800 border-none text-center py-3 rounded-xl text-base font-[1000] text-brand-primary dark:text-brand-accent outline-none shadow-sm shadow-slate-200/50 dark:shadow-none focus:ring-2 focus:ring-brand-primary/40 dark:focus:ring-brand-accent/50 transition-all font-outfit placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:scale-105",placeholder:"--"})})]})]}),s.obtained!==void 0&&s.obtained!==""&&e.jsxs("div",{className:"mt-4 px-1.5 relative z-10 flex items-center gap-3",children:[e.jsx("div",{className:"flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex",children:e.jsx("div",{className:I("h-full transition-all duration-1000 ease-out rounded-full",i>=80?"bg-emerald-500":i>=60?"bg-brand-primary dark:bg-brand-accent":"bg-amber-500"),style:{width:`${Math.min(i,100)}%`}})}),e.jsxs("span",{className:"text-[9px] font-black text-slate-400",children:[i.toFixed(0),"%"]})]})]},t)})}),e.jsx("div",{className:"hidden md:block overflow-x-auto custom-scrollbar",children:e.jsxs("table",{className:"w-full min-w-[800px]",children:[e.jsx("thead",{className:"bg-slate-50 border-b border-slate-100",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-6 py-4 text-left text-[9px] font-black uppercase text-slate-400 tracking-widest sticky left-0 bg-slate-50 z-10",children:"Subject Name"}),e.jsx("th",{className:"px-6 py-4 text-center text-[9px] font-black uppercase text-slate-400 tracking-widest",children:"Status"}),e.jsx("th",{className:"px-6 py-4 text-center text-[9px] font-black uppercase text-slate-400 tracking-widest",children:"Total Marks"}),e.jsx("th",{className:"px-6 py-4 text-center text-[9px] font-black uppercase text-slate-400 tracking-widest",children:"Obtained Marks"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-50",children:(_[m]||[]).map(t=>{const r=T.find(i=>i.studentId===M&&i.examId===d),a=m&&L?.[m]?.[t]||100,s=r?.marks[t]||{obtained:void 0,total:a};return e.jsxs("tr",{className:"hover:bg-slate-50/50 transition-colors group",children:[e.jsx("td",{className:"px-6 py-4 sticky left-0 bg-white dark:bg-slate-900 z-10 group-hover:bg-slate-50 transition-colors",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 text-[10px]",children:e.jsx(Ie,{className:"w-4 h-4"})}),e.jsx("span",{className:"text-xs font-bold text-slate-700 uppercase",children:t})]})}),e.jsx("td",{className:"px-6 py-4 text-center",children:s.obtained!==void 0&&s.obtained!==""?e.jsx(Me,{className:"w-4 h-4 text-emerald-500 mx-auto"}):e.jsx(We,{className:"w-4 h-4 text-slate-200 mx-auto"})}),e.jsx("td",{className:"px-6 py-4 text-center",children:e.jsx("div",{className:"max-w-[80px] mx-auto",children:e.jsx("input",{type:"number",value:s.total,onChange:i=>ee(d,m,M,t,s.obtained,Number(i.target.value)),className:"w-full bg-slate-50 border border-slate-100 text-center py-2 rounded-xl text-sm font-black text-slate-400 focus:ring-2 ring-slate-200 outline-none transition-all",placeholder:"100"})})}),e.jsx("td",{className:"px-6 py-4",children:e.jsx("div",{className:"max-w-[120px] mx-auto",children:e.jsx("input",{id:`mark-input-obtained-${t.replace(/\\s+/g,"-")}`,type:"number",value:s.obtained!==void 0?s.obtained:"",onChange:i=>ee(d,m,M,t,i.target.value,s.total),onKeyDown:i=>{if(i.key==="Enter"){i.preventDefault();const n=_[m]||[],o=n.indexOf(t);if(o<n.length-1){const c=n[o+1],v=document.querySelectorAll(`input[id="mark-input-obtained-${c.replace(/\\s+/g,"-")}"]`);for(let b=0;b<v.length;b++){const p=v[b];if(p.offsetParent!==null){p.focus(),p.select();return}}}else{const c=n.length,v=f.filter(x=>x.class===m&&(!u||x.campus?.toLowerCase()===u.toLowerCase())),b=v.findIndex(x=>x.id===M),p=v.find((x,w)=>{if(w<=b)return!1;const S=T.find($=>$.studentId===x.id&&$.examId===d);if(!S)return!0;let z=0;return n.forEach($=>{S.marks[$]&&S.marks[$].obtained!==void 0&&String(S.marks[$].obtained)!==""&&z++}),z<c});p&&(J(p.id),setTimeout(()=>{const x=n[0],w=document.querySelectorAll(`input[id="mark-input-obtained-${x.replace(/\\s+/g,"-")}"]`);for(let S=0;S<w.length;S++){const z=w[S];if(z.offsetParent!==null){z.focus(),z.select();return}}},200))}}},className:"w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-center py-2 rounded-[var(--brand-radius,0.75rem)] text-sm font-black focus:ring-2 ring-brand-primary/20 outline-none transition-all dark:text-white",placeholder:"00"})})})]},t)})})]})})]}):e.jsxs("div",{className:"py-20 text-center glass-card border-dashed",children:[e.jsx(Re,{className:"w-12 h-12 text-slate-200 mx-auto mb-4"}),e.jsx("p",{className:"text-slate-400 font-black uppercase text-[10px] tracking-widest",children:"Select Exam, Class and Student to begin entry"})]})]}),R==="results"&&e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"bg-white/80 dark:bg-[#000816]/80 rounded-[1.5rem] md:rounded-[2rem] p-2 shadow-sm border border-slate-200/50 dark:border-white/5 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-1 items-stretch",children:[e.jsxs("div",{className:"relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20",children:[e.jsx("label",{className:"text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5",children:"Finalized Session"}),e.jsxs("select",{value:d||"",onChange:t=>{V(t.target.value),de(null)},className:"w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer",children:[e.jsx("option",{value:"",children:"Select Session..."}),k.filter(t=>t.status==="Finalized").map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]}),e.jsxs("div",{className:"relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20",children:[e.jsx("label",{className:"text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5",children:"Select Campus"}),e.jsxs("select",{value:u||"",onChange:t=>{X(t.target.value)},className:"w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer",children:[e.jsx("option",{value:"",children:"All Campuses..."}),ve().campuses?.map(t=>e.jsx("option",{value:t.name,children:t.name},t.id))]})]}),e.jsxs("div",{className:"relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20",children:[e.jsx("label",{className:"text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5",children:"Active Wing"}),e.jsxs("select",{value:m||"",onChange:t=>de(t.target.value),className:"w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-brand-primary dark:text-brand-accent outline-none appearance-none truncate cursor-pointer",children:[e.jsx("option",{value:"All",children:"All Classes..."}),k.find(t=>t.id===d)?.classes.map(t=>e.jsx("option",{value:t,children:t},t))]})]}),d&&m&&e.jsxs("div",{className:"flex px-1 pt-1 md:pt-0 gap-2",children:[e.jsxs("button",{onClick:()=>Ve(),className:"w-full md:w-auto px-6 py-3 bg-brand-primary text-white rounded-[1.25rem] md:rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-md flex items-center justify-center gap-2 h-full whitespace-nowrap",children:[e.jsx(ne,{className:"w-4 h-4"}),e.jsx("span",{children:"Bulk Print"})]}),e.jsxs("button",{onClick:Ye,className:"w-full md:w-auto px-6 py-3 bg-emerald-500 text-white rounded-[1.25rem] md:rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-md flex items-center justify-center gap-2 h-full whitespace-nowrap",children:[e.jsx(Ne,{className:"w-4 h-4"}),e.jsx("span",{children:"Bulk Distribute"})]})]})]}),d&&m?e.jsx("div",{className:"space-y-8",children:(()=>{const t=u?.trim().toLowerCase(),r=T.filter(a=>a.examId!==d||m&&m!=="All"&&a.className!==m?!1:t?f.find(i=>i.id===a.studentId)?.campus?.trim().toLowerCase()===t:!0).sort((a,s)=>s.percentage-a.percentage);return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 items-end",children:[2,1,3].map(a=>{const s=r[a-1];if(!s)return null;const i=f.find(n=>n.id===s.studentId);return e.jsxs("div",{className:I("glass-card p-6 md:p-8 flex flex-col items-center text-center relative animate-in slide-in-from-bottom-8 duration-700",a===1?"bg-gradient-to-br from-brand-primary/5 to-brand-accent/10 border-brand-accent/30 scale-100 md:scale-110 z-10 order-1 md:order-2 dark:bg-white/5":a===2?"bg-white dark:bg-white/5 order-2 md:order-1":"bg-white dark:bg-white/5 order-3"),children:[e.jsx("div",{className:I("w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-4 ring-white",a===1?"bg-amber-400":a===2?"bg-slate-300":"bg-orange-300"),children:e.jsx(pe,{className:"w-8 h-8 text-white"})}),e.jsxs("div",{className:"mb-4",children:[e.jsx("h4",{className:"font-black text-brand-primary dark:text-white uppercase text-sm leading-tight",children:i?.name}),e.jsx("p",{className:"text-[10px] font-bold text-slate-400 mt-1",children:i?.id})]}),e.jsxs("div",{className:"space-y-1 mb-6",children:[e.jsxs("p",{className:"text-2xl font-black text-brand-primary dark:text-white",children:[s.percentage.toFixed(1),"%"]}),e.jsxs("div",{className:"flex items-center gap-1.5 justify-center",children:[e.jsx(ze,{className:I("w-3 h-3",a===1?"text-amber-500":a===2?"text-slate-400":"text-orange-400")}),e.jsxs("span",{className:"text-[9px] font-black uppercase text-slate-400 tracking-widest",children:["Rank #",a]})]})]}),e.jsxs("div",{className:"flex flex-col gap-2 w-full",children:[e.jsxs("button",{onClick:()=>{const n={student:i,result:{...s,position:a},exam:k.find(o=>o.id===d)};ce(n)},className:"px-4 py-2 bg-green-500 text-white rounded-[var(--brand-radius,0.5rem)] text-[8px] font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2",children:[e.jsx(Ne,{className:"w-3 h-3"})," WhatsApp Marksheet"]}),e.jsxs("button",{onClick:()=>{const n={student:i,result:{...s,position:a},exam:k.find(o=>o.id===d)};ue(n),je(n)},className:"px-4 py-2 bg-brand-primary text-white rounded-[var(--brand-radius,0.5rem)] text-[8px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2",children:[e.jsx(ne,{className:"w-3 h-3"})," Print Certificate"]})]}),e.jsx("div",{className:I("absolute -top-3 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm",a===1?"bg-brand-accent text-brand-primary border-brand-accent":"bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-white/10"),children:a===1?"Champion":a===2?"Runner Up":"3rd Place"})]},a)})}),e.jsxs("div",{className:"glass-card overflow-hidden",children:[e.jsxs("div",{className:"p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("input",{type:"checkbox",checked:g.length>0&&g.length===r.length,onChange:a=>{a.target.checked?N(r.map(s=>s.studentId)):N([])},className:"w-4 h-4 accent-brand-primary"}),e.jsx("h4",{className:"text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]",children:"Institutional Merit List"})]}),e.jsxs("span",{className:"text-[9px] font-bold text-slate-400 uppercase",children:["Class Strength: ",r.length]})]}),e.jsx("div",{className:"md:hidden bg-slate-50/80 dark:bg-[#000816] p-3 md:p-4 space-y-3.5",children:r.map((a,s)=>{const i=f.find(o=>o.id===a.studentId),n=s<3;return e.jsxs("div",{className:I("bg-white dark:bg-slate-900 rounded-[1.25rem] p-4 shadow-sm border overflow-hidden relative transition-all active:scale-[0.98]",n?"border-brand-primary/20 dark:border-brand-accent/20":"border-slate-100 dark:border-white/5",g.includes(a.studentId)?"ring-2 ring-brand-primary ring-inset":""),children:[n&&e.jsx("div",{className:"absolute -top-12 -right-12 w-32 h-32 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none"}),e.jsxs("div",{className:"flex flex-row items-center gap-3.5 relative z-10",children:[e.jsx("input",{type:"checkbox",checked:g.includes(a.studentId),onChange:()=>{g.includes(a.studentId)?N(g.filter(o=>o!==a.studentId)):N([...g,a.studentId])},className:"w-4 h-4 accent-brand-primary"}),e.jsxs("div",{className:I("w-10 h-10 rounded-[0.85rem] flex items-center justify-center text-xs font-[1000] shadow-inner border shrink-0",s===0?"bg-gradient-to-br from-amber-300 to-amber-500 text-white border-amber-200":s===1?"bg-gradient-to-br from-slate-300 to-slate-400 text-white border-slate-200":s===2?"bg-gradient-to-br from-orange-300 to-orange-400 text-white border-orange-200":"bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-200/50 dark:border-white/5"),children:["#",s+1]}),e.jsxs("div",{className:"flex-1 min-w-0 py-0.5",children:[e.jsx("h4",{className:"text-[14px] font-[1000] text-slate-800 dark:text-white uppercase tracking-tight truncate leading-tight mb-1",children:i?.name}),e.jsx("div",{className:"flex flex-wrap items-center gap-1.5 mt-0.5",children:e.jsx("span",{className:"text-[9px] font-black text-slate-400 tracking-widest uppercase",children:i?.id})})]}),e.jsx("div",{className:"text-right shrink-0",children:e.jsxs("div",{className:I("text-lg font-[1000] leading-none mb-1",n?"text-amber-500 dark:text-amber-400":"text-brand-primary dark:text-brand-accent"),children:[a.percentage.toFixed(1),"%"]})})]}),e.jsxs("div",{className:"grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100/60 dark:border-white/5 relative z-10",children:[e.jsxs("button",{onClick:()=>fe(a),className:"flex flex-col items-center justify-center gap-2 py-2.5 px-1 rounded-xl bg-slate-50/60 dark:bg-white/10 hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors",children:[e.jsx(Pe,{className:"w-4 h-4"}),e.jsx("span",{className:"text-[7.5px] font-black uppercase tracking-widest whitespace-nowrap",children:"Edit"})]}),e.jsxs("button",{onClick:()=>B({student:i,result:{...a,position:s+1},exam:k.find(o=>o.id===d)}),className:"flex flex-col items-center justify-center gap-2 py-2.5 px-1 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 hover:bg-blue-100 text-blue-600 dark:text-blue-400 transition-colors",children:[e.jsx(Ce,{className:"w-4 h-4"}),e.jsx("span",{className:"text-[7.5px] font-black uppercase tracking-widest whitespace-nowrap",children:"Mark Sheet"})]}),e.jsxs("button",{onClick:()=>ce({student:i,result:{...a,position:s+1},exam:k.find(o=>o.id===d)}),className:"flex flex-col items-center justify-center gap-2 py-2.5 px-1 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition-colors",children:[e.jsx(Ne,{className:"w-4 h-4"}),e.jsx("span",{className:"text-[7.5px] font-black uppercase tracking-widest whitespace-nowrap",children:"WhatsApp"})]}),e.jsxs("button",{onClick:()=>{const o={student:i,result:{...a,position:s+1},exam:k.find(c=>c.id===d)};je(o)},className:"flex flex-col items-center justify-center gap-2 py-2.5 px-1 rounded-xl bg-amber-50/60 dark:bg-amber-500/10 hover:bg-amber-100 text-amber-600 dark:text-amber-400 transition-colors",children:[e.jsx(ne,{className:"w-4 h-4"}),e.jsx("span",{className:"text-[7.5px] font-black uppercase tracking-widest whitespace-nowrap",children:"Certificate"})]})]})]},a.studentId)})}),e.jsx("div",{className:"hidden md:block overflow-x-auto custom-scrollbar",children:e.jsxs("table",{className:"w-full min-w-[1000px]",children:[e.jsx("thead",{className:"bg-white",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-6 py-4 text-left border-r border-slate-50 sticky left-0 bg-white z-10",children:e.jsx("input",{type:"checkbox",checked:g.length>0&&g.length===r.length,onChange:a=>{a.target.checked?N(r.map(s=>s.studentId)):N([])},className:"w-4 h-4 accent-brand-primary"})}),e.jsx("th",{className:"px-6 py-4 text-left text-[9px] font-black uppercase text-slate-300 tracking-widest border-r border-slate-50",children:"Pos"}),e.jsx("th",{className:"px-6 py-4 text-left text-[9px] font-black uppercase text-slate-300 tracking-widest",children:"Student Name"}),e.jsx("th",{className:"px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest",children:"Subjects"}),e.jsx("th",{className:"px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest",children:"Total"}),e.jsx("th",{className:"px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest",children:"Percentage"}),e.jsx("th",{className:"px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest",children:"Grade"}),e.jsx("th",{className:"px-6 py-4 text-left text-[9px] font-black uppercase text-slate-300 tracking-widest",children:"Assessment Remark"}),e.jsx("th",{className:"px-6 py-4 text-center text-[9px] font-black uppercase text-slate-300 tracking-widest sticky right-0 bg-white z-10 border-l border-slate-50",children:"Actions"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-50",children:r.map((a,s)=>{const i=f.find(o=>o.id===a.studentId),n=k.find(o=>o.id===d);return e.jsxs("tr",{className:I("group hover:bg-slate-50 transition-colors",s<3?"bg-blue-50/20":"",g.includes(a.studentId)?"bg-brand-primary/[0.03]":""),children:[e.jsx("td",{className:"px-6 py-4 border-r border-slate-50 sticky left-0 bg-white z-10 group-hover:bg-slate-100 transition-colors",children:e.jsx("input",{type:"checkbox",checked:g.includes(a.studentId),onChange:()=>{g.includes(a.studentId)?N(g.filter(o=>o!==a.studentId)):N([...g,a.studentId])},className:"w-4 h-4 accent-brand-primary"})}),e.jsx("td",{className:"px-6 py-4 border-r border-slate-50",children:e.jsx("div",{className:I("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-[1000] text-slate-900 border border-slate-200 shadow-sm transition-all",s===0?"bg-amber-400 text-white shadow-lg border-amber-500":s===1?"bg-slate-300 text-white":s===2?"bg-orange-300 text-white":"bg-white"),children:s+1})}),e.jsx("td",{className:"px-6 py-4",children:e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-black text-brand-primary dark:text-white uppercase truncate max-w-[180px]",children:i?.name}),e.jsx("p",{className:"text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5",children:i?.id})]})}),e.jsx("td",{className:"px-6 py-4 text-center",children:e.jsxs("span",{className:"text-[10px] font-black text-slate-400",children:[Object.keys(a.marks||{}).length," / ",(_[a.className]||[]).length]})}),e.jsx("td",{className:"px-6 py-4 text-center",children:e.jsx("div",{className:"flex flex-col items-center",children:e.jsxs("span",{className:"text-[11px] font-[1000] text-brand-primary dark:text-white leading-none mb-1",children:[a.totalObtained," / ",a.totalPossible]})})}),e.jsx("td",{className:"px-6 py-4 text-center",children:e.jsxs("div",{className:"flex flex-col items-center gap-1.5",children:[e.jsx("div",{className:"w-12 h-1 bg-slate-100 rounded-full overflow-hidden",children:e.jsx("div",{className:I("h-full rounded-full transition-all duration-1000",a.percentage>=80?"bg-emerald-500":a.percentage>=60?"bg-blue-500":"bg-amber-500"),style:{width:`${a.percentage}%`}})}),e.jsxs("span",{className:"text-xs font-[1000] text-slate-900 dark:text-white",children:[a.percentage.toFixed(1),"%"]})]})}),e.jsx("td",{className:"px-6 py-4 text-center",children:e.jsx("span",{className:I("px-3 py-1 rounded-lg text-[10px] font-black",a.grade==="A+"?"bg-emerald-100 text-emerald-600":a.grade==="A"?"bg-emerald-50 text-emerald-600":a.grade==="F"?"bg-rose-100 text-rose-600":"bg-blue-50 text-blue-600"),children:a.grade})}),e.jsx("td",{className:"px-6 py-4 text-left",children:e.jsx("p",{className:"text-[10px] text-slate-500 font-medium italic leading-relaxed truncate max-w-[150px]",children:a.remarks||"Pending..."})}),e.jsx("td",{className:"px-6 py-4 text-center sticky right-0 bg-white dark:bg-slate-900 z-10 group-hover:bg-slate-50 transition-colors border-l border-slate-50",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[e.jsx("button",{onClick:()=>fe(a),className:"p-2 text-slate-400 hover:text-brand-primary transition-colors",title:"Edit Marks",children:e.jsx(Pe,{className:"w-4 h-4"})}),e.jsx("button",{onClick:()=>B({student:i,result:{...a,position:s+1},exam:n}),className:"p-2 text-slate-400 hover:text-blue-600 transition-colors",title:"Generate Result Card",children:e.jsx(Ce,{className:"w-4 h-4"})}),e.jsx("button",{onClick:()=>ce({student:i,result:{...a,position:s+1},exam:n}),className:"p-2 text-slate-400 hover:text-green-600 transition-colors",title:"Send Marksheet PDF via WhatsApp",children:e.jsx(Ne,{className:"w-4 h-4"})}),e.jsx("button",{onClick:()=>{const o={student:i,result:{...a,position:s+1},exam:n};ue(o),je(o)},className:"p-2 text-slate-400 hover:text-brand-primary transition-colors",title:"Print Certificate",children:e.jsx(ne,{className:"w-4 h-4"})})]})})]},a.studentId)})})]})})]})]})})()}):e.jsxs("div",{className:"py-20 text-center glass-card border-dashed",children:[e.jsx(pe,{className:"w-12 h-12 text-slate-200 mx-auto mb-4"}),e.jsx("p",{className:"text-slate-400 font-black uppercase text-[10px] tracking-widest",children:"Select an Active and Finalized Session to view standings"})]})]}),R==="top"&&e.jsxs("div",{className:"space-y-6",children:[e.jsx("div",{className:"bg-white/80 dark:bg-[#000816]/80 rounded-[1.5rem] md:rounded-[2rem] p-4 shadow-sm border border-slate-200/50 dark:border-white/5 flex gap-4 max-w-md mx-auto relative",children:e.jsxs("div",{className:"flex-1",children:[e.jsx("label",{className:"text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5",children:"Finalized Session"}),e.jsxs("select",{value:d||"",onChange:t=>V(t.target.value),className:"w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer",children:[e.jsx("option",{value:"",children:"Select Session..."}),k.filter(t=>t.status==="Finalized").map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]})}),d?e.jsxs("div",{className:"space-y-12 pb-12",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-black text-center mb-8 uppercase text-slate-800 dark:text-white",children:"Overall School Top Positions"}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto",children:[2,1,3].map(t=>{const r=T.find(s=>s.examId===d&&s.schoolPosition===t);if(!r)return e.jsx("div",{className:"hidden md:block"},t);const a=f.find(s=>s.id===r.studentId);return e.jsxs("div",{className:I("glass-card p-6 md:p-8 flex flex-col items-center text-center relative animate-in slide-in-from-bottom-8 duration-700 shadow-xl",t===1?"bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 scale-100 md:scale-110 z-10 order-1 md:order-2 dark:from-white/10 dark:to-white/5 dark:border-white/20":t===2?"bg-slate-50 border-slate-200 order-2 md:order-1 dark:bg-white/5 dark:border-white/10":"bg-orange-50 border-orange-200 order-3 dark:bg-white/5 dark:border-white/10"),children:[e.jsx("div",{className:I("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-4 ring-white",t===1?"bg-amber-400":t===2?"bg-slate-300":"bg-orange-300"),children:e.jsx(pe,{className:"w-8 h-8 text-white"})}),e.jsx("h4",{className:"font-black text-slate-800 dark:text-white uppercase text-sm leading-tight",children:a?.name}),e.jsxs("p",{className:"text-[10px] font-bold text-slate-400 mt-1",children:[a?.id," • ",a?.class]}),e.jsx("div",{className:"my-4",children:e.jsxs("p",{className:"text-3xl font-black text-slate-800 dark:text-white",children:[r.percentage.toFixed(1),"%"]})}),e.jsxs("span",{className:"px-3 py-1 bg-white/50 rounded-full text-[9px] font-black uppercase text-slate-500 tracking-widest border border-slate-200",children:["School Position #",t]})]},t)})})]}),Array.from(new Set(f.map(t=>t.campus))).filter(Boolean).map(t=>{const r=T.filter(a=>a.examId===d&&a.campusPosition&&a.campusPosition<=3&&f.find(s=>s.id===a.studentId)?.campus===t);return r.length===0?null:e.jsxs("div",{className:"pt-8 border-t border-slate-200 dark:border-white/10",children:[e.jsxs("h3",{className:"text-lg font-black text-center mb-8 uppercase text-slate-600 dark:text-slate-300",children:[t," Top Positions"]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto",children:[2,1,3].map(a=>{const s=r.find(n=>n.campusPosition===a);if(!s)return e.jsx("div",{className:"hidden md:block"},a);const i=f.find(n=>n.id===s.studentId);return e.jsxs("div",{className:I("bg-white/60 dark:bg-white/5 backdrop-blur-sm p-5 md:p-6 rounded-2xl md:rounded-[2rem] flex flex-col items-center text-center relative border border-slate-200 dark:border-white/10 focus-within:ring",a===1?"scale-100 z-10 order-1 md:order-2 ring-2 ring-brand-primary/20 dark:ring-brand-accent/20":a===2?"order-2 md:order-1":"order-3"),children:[e.jsx("div",{className:I("w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-md",a===1?"bg-amber-100 text-amber-600":a===2?"bg-slate-100 text-slate-500":"bg-orange-100 text-orange-600"),children:e.jsx(ze,{className:"w-5 h-5"})}),e.jsx("h4",{className:"font-black text-slate-700 dark:text-white uppercase text-xs",children:i?.name}),e.jsx("p",{className:"text-[9px] font-bold text-slate-400 my-1",children:i?.class}),e.jsxs("p",{className:"text-xl font-black text-brand-primary dark:text-brand-accent",children:[s.percentage.toFixed(1),"%"]})]},a)})})]},t)})]}):e.jsxs("div",{className:"py-20 text-center glass-card border-dashed",children:[e.jsx(ie,{className:"w-12 h-12 text-slate-200 mx-auto mb-4"}),e.jsx("p",{className:"text-slate-400 font-black uppercase text-[10px] tracking-widest",children:"Select an Active Session"})]})]}),R==="custom"&&e.jsx("div",{className:"space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500",children:e.jsxs("div",{className:"bg-white/80 dark:bg-white/5 backdrop-blur-2xl p-5 md:p-10 rounded-2xl md:rounded-[var(--brand-radius,2.5rem)] border border-white/20 shadow-2xl relative overflow-hidden group",children:[e.jsx("div",{className:"absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity hidden md:block",children:e.jsx(ie,{className:"w-64 h-64 text-brand-primary"})}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8 md:mb-10",children:[e.jsx("div",{className:"w-12 h-12 md:w-16 md:h-16 bg-brand-primary/10 rounded-xl md:rounded-[var(--brand-radius,1.5rem)] flex items-center justify-center shadow-inner",children:e.jsx(ie,{className:"w-6 h-6 md:w-8 md:h-8 text-brand-primary"})}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight",children:"Generate Special Award"}),e.jsx("p",{className:"text-slate-500 dark:text-slate-400 font-bold text-[10px] md:text-sm",children:"Create luxury certificates for varied ceremonies or computer courses"})]})]}),e.jsxs("div",{className:"flex gap-4 mb-8",children:[e.jsx("button",{onClick:()=>$e("academic"),className:`py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${he==="academic"?"bg-[#003366] text-white shadow-xl":"bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200"}`,children:"Academic / Event"}),e.jsx("button",{onClick:()=>$e("course"),className:`py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${he==="course"?"bg-[#003366] text-white shadow-xl":"bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200"}`,children:"Computer Course"})]}),he==="academic"?e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-5xl",children:[e.jsxs("div",{className:"space-y-2 md:space-y-3",children:[e.jsx("label",{className:"text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2",children:"Student Full Name"}),e.jsx("input",{type:"text",value:F.name,onChange:t=>ge({...F,name:t.target.value}),className:"w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 md:p-5 rounded-xl md:rounded-[var(--brand-radius,1rem)] text-sm font-bold outline-none dark:text-white",placeholder:"e.g. Muhammad Ali"})]}),e.jsxs("div",{className:"space-y-2 md:space-y-3",children:[e.jsx("label",{className:"text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2",children:"Award Category"}),e.jsx("input",{type:"text",value:F.category,onChange:t=>ge({...F,category:t.target.value}),className:"w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 md:p-5 rounded-xl md:rounded-[var(--brand-radius,1rem)] text-sm font-bold outline-none dark:text-white",placeholder:"e.g. Sports Excellence"})]}),e.jsxs("div",{className:"space-y-2 md:space-y-3",children:[e.jsx("label",{className:"text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2",children:"Position / Achievement"}),e.jsx("input",{type:"text",value:F.position,onChange:t=>ge({...F,position:t.target.value}),className:"w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 md:p-5 rounded-xl md:rounded-[var(--brand-radius,1rem)] text-sm font-bold outline-none dark:text-white",placeholder:"e.g. 1st Position"})]}),e.jsxs("div",{className:"space-y-2 md:space-y-3",children:[e.jsx("label",{className:"text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2",children:"Event / Occasion"}),e.jsx("input",{type:"text",value:F.event,onChange:t=>ge({...F,event:t.target.value}),className:"w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 md:p-5 rounded-xl md:rounded-[var(--brand-radius,1rem)] text-sm font-bold outline-none dark:text-white",placeholder:"e.g. Annual Gala 2026"})]})]}):e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-5xl",children:[e.jsxs("div",{className:"space-y-2 md:space-y-3",children:[e.jsx("label",{className:"text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2",children:"Student Full Name"}),e.jsx("input",{type:"text",value:O.name,onChange:t=>l({...O,name:t.target.value}),className:"w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 md:p-5 rounded-xl md:rounded-[var(--brand-radius,1rem)] text-sm font-bold outline-none dark:text-white",placeholder:"e.g. Abdullah"})]}),e.jsxs("div",{className:"space-y-2 md:space-y-3",children:[e.jsx("label",{className:"text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2",children:"Course Name"}),e.jsx("input",{type:"text",value:O.course,onChange:t=>l({...O,course:t.target.value}),className:"w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 md:p-5 rounded-xl md:rounded-[var(--brand-radius,1rem)] text-sm font-bold outline-none dark:text-white",placeholder:"e.g. Graphic Design"})]}),e.jsxs("div",{className:"space-y-2 md:space-y-3",children:[e.jsx("label",{className:"text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2",children:"Duration"}),e.jsx("input",{type:"text",value:O.duration,onChange:t=>l({...O,duration:t.target.value}),className:"w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 md:p-5 rounded-xl md:rounded-[var(--brand-radius,1rem)] text-sm font-bold outline-none dark:text-white",placeholder:"e.g. 3 Months"})]}),e.jsxs("div",{className:"space-y-2 md:space-y-3",children:[e.jsx("label",{className:"text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2",children:"Grade"}),e.jsx("input",{type:"text",value:O.grade,onChange:t=>l({...O,grade:t.target.value}),className:"w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 md:p-5 rounded-xl md:rounded-[var(--brand-radius,1rem)] text-sm font-bold outline-none dark:text-white",placeholder:"e.g. A+"})]})]}),e.jsxs("div",{className:"mt-8 md:mt-12 pt-6 md:pt-10 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center gap-4 md:gap-6",children:[e.jsxs("button",{onClick:()=>{if(he==="academic"){if(!F.name||!F.category||!F.position||!F.event){h.fire({title:"Wait!",text:"Fill all details.",icon:"warning"});return}const t={student:{name:F.name},isCustom:!0,category:F.category,position:F.position,event:F.event,date:F.date};ue(t),je(t)}else{if(!O.name||!O.course||!O.duration||!O.grade){h.fire({title:"Wait!",text:"Fill all course details.",icon:"warning"});return}const t={student:{name:O.name},type:"course",course:O.course,duration:O.duration,grade:O.grade,date:O.date};ue(t),je(t)}},className:"w-full md:w-auto bg-brand-primary text-white px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-[var(--brand-radius,2rem)] text-[11px] md:text-sm font-black shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3",children:[e.jsx(ne,{className:"w-5 h-5"}),"Generate Certificate"]}),e.jsx("p",{className:"text-slate-400 text-[10px] font-bold italic w-full md:w-auto text-center md:text-left",children:"Note: Professional 3D Luxury Branding theme."})]})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-8 pb-10",children:[{title:"Victory Shield",icon:pe,color:"bg-amber-50 text-amber-600",sub:"Optimized for sports and competitions"},{title:"Star Performance",icon:Fe,color:"bg-blue-50 text-blue-600",sub:"Perfect for academic stars and behaviors"},{title:"Culture Award",icon:Re,color:"bg-rose-50 text-rose-600",sub:"Ideal for arts and social events"}].map((t,r)=>e.jsxs("div",{className:"bg-white/60 dark:bg-white/5 p-8 rounded-[var(--brand-radius,2rem)] border border-white/20 shadow-xl hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-2",children:[e.jsx("div",{className:I("w-14 h-14 rounded-[var(--brand-radius,1rem)] flex items-center justify-center mb-6 transition-all group-hover:scale-110",t.color),children:e.jsx(t.icon,{className:"w-7 h-7"})}),e.jsx("h3",{className:"font-black text-xl text-slate-800 dark:text-white tracking-tight",children:t.title}),e.jsx("p",{className:"text-[11px] font-bold text-slate-400 mt-2 leading-relaxed uppercase tracking-wider",children:t.sub})]},r))})]})}),R==="campus_toppers"&&e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"bg-white/80 dark:bg-[#000816]/80 rounded-[1.5rem] md:rounded-[2rem] p-2 shadow-sm border border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row gap-2",children:[e.jsxs("div",{className:"flex-1 relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20",children:[e.jsx("label",{className:"text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5",children:"Academic Session"}),e.jsxs("select",{value:d||"",onChange:t=>V(t.target.value),className:"w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer",children:[e.jsx("option",{value:"",children:"Select Session..."}),k.filter(t=>t.status==="Finalized").map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]}),e.jsxs("div",{className:"flex-1 relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20",children:[e.jsx("label",{className:"text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5",children:"Target Campus"}),e.jsxs("select",{value:u||"",onChange:t=>X(t.target.value),className:"w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none truncate cursor-pointer",children:[e.jsx("option",{value:"",children:"Select Campus..."}),(ve().campuses||[]).map(t=>e.jsx("option",{value:t.name,children:t.name},t.id))]})]}),d&&u&&e.jsxs("button",{onClick:Z,className:"px-8 py-3 bg-brand-primary text-white rounded-[1.25rem] md:rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2",children:[e.jsx(ne,{className:"w-4 h-4"})," Print Toppers Report"]})]}),!d||!u?e.jsxs("div",{className:"py-32 text-center glass-card border-dashed",children:[e.jsx(Ue,{className:"w-16 h-16 text-slate-200 dark:text-brand-accent/10 mx-auto mb-4"}),e.jsx("p",{className:"text-slate-400 font-black uppercase text-[10px] tracking-widest",children:"Select Session & Campus to Reveal Toppers"})]}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:(k.find(t=>t.id===d)?.classes||[]).map(t=>{const r=T.filter(a=>a.examId===d&&a.className===t&&f.find(s=>s.id===a.studentId)?.campus?.toLowerCase()===u.toLowerCase()).sort((a,s)=>s.percentage-a.percentage).slice(0,3);return r.length===0?null:e.jsxs("div",{className:"glass-card overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 border-none",children:[e.jsxs("div",{className:"bg-brand-primary p-4 flex justify-between items-center",children:[e.jsx("h4",{className:"text-white font-black uppercase text-xs tracking-widest",children:t}),e.jsx(pe,{className:"w-4 h-4 text-brand-accent animate-pulse"})]}),e.jsx("div",{className:"p-4 space-y-4 flex-1 bg-white/50 dark:bg-[#000816]/50",children:r.map((a,s)=>{const i=f.find(n=>n.id===a.studentId);return e.jsxs("div",{className:"flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:bg-brand-primary/5 transition-colors",children:[e.jsx("div",{className:I("w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg",s===0?"bg-amber-400 rotate-3":s===1?"bg-slate-400 -rotate-3":"bg-orange-400 rotate-1"),children:s+1}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"font-black text-brand-primary dark:text-white uppercase text-[11px] truncate",children:i?.name}),e.jsxs("div",{className:"flex items-center gap-2 mt-0.5",children:[e.jsx(Fe,{className:"w-3 h-3 text-brand-accent fill-brand-accent"}),e.jsxs("span",{className:"text-[9px] font-bold text-slate-400 uppercase",children:[a.percentage.toFixed(1),"% Score"]})]})]}),e.jsx("div",{className:"text-right",children:e.jsx("p",{className:"text-[9px] font-black text-brand-primary dark:text-brand-accent uppercase tracking-tighter",children:s===0?"Topper":s===1?"Runner":"3rd"})})]},a.studentId)})})]},t)})})]}),R==="range_toppers"&&e.jsx("div",{className:"space-y-6",children:e.jsxs("div",{className:"bg-white/80 dark:bg-[#000816]/80 rounded-[1.5rem] md:rounded-[2rem] p-4 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20",children:[e.jsx("label",{className:"text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5",children:"Session"}),e.jsxs("select",{value:d||"",onChange:t=>V(t.target.value),className:"w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none cursor-pointer",children:[e.jsx("option",{value:"",children:"Select Session..."}),k.filter(t=>t.status==="Finalized").map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]}),e.jsxs("div",{className:"relative bg-slate-50/50 dark:bg-white/5 rounded-[1.25rem] md:rounded-[1.75rem] px-4 py-2 border border-slate-100 dark:border-white/5 hover:border-brand-primary/20 transition-colors focus-within:ring-2 focus-within:ring-brand-primary/20",children:[e.jsx("label",{className:"text-[7.5px] font-black uppercase text-brand-primary/60 dark:text-brand-accent/60 tracking-[0.2em] block mb-0.5",children:"Campus"}),e.jsxs("select",{value:u||"",onChange:t=>X(t.target.value),className:"w-full bg-transparent border-none p-0 text-[12px] font-[1000] uppercase text-slate-800 dark:text-white outline-none appearance-none cursor-pointer",children:[e.jsx("option",{value:"",children:"Select Campus..."}),(ve().campuses||[]).map(t=>e.jsx("option",{value:t.name,children:t.name},t.id))]})]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex justify-between items-center mb-4 px-2",children:[e.jsx("label",{className:"text-[10px] font-[1000] uppercase text-slate-500 tracking-widest",children:"Select Wings for Comparison"}),e.jsxs("div",{className:"flex gap-4",children:[e.jsx("button",{onClick:()=>be(W),className:"text-[9px] font-black uppercase text-brand-primary hover:scale-105 transition-transform",children:"Select All"}),e.jsx("button",{onClick:()=>be([]),className:"text-[9px] font-black uppercase text-rose-500 hover:scale-105 transition-transform",children:"Clear All"})]})]}),e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2",children:W.map(t=>e.jsxs("label",{className:I("relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300",q.includes(t)?"bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-[1.02]":"bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-brand-primary/30"),children:[e.jsx("input",{type:"checkbox",checked:q.includes(t),onChange:r=>{r.target.checked?be([...q,t]):be(q.filter(a=>a!==t))},className:"hidden"}),e.jsx("span",{className:"text-[10px] font-black uppercase truncate text-center w-full",children:t}),q.includes(t)&&e.jsx(Me,{className:"w-3 h-3 absolute right-2 top-2"})]},t))})]}),e.jsx("div",{className:"flex justify-center",children:e.jsxs("button",{onClick:se,disabled:!d||!u||q.length===0,className:"px-12 py-4 bg-brand-primary text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-primary/30 flex items-center gap-3 disabled:opacity-50 disabled:scale-100",children:[e.jsx(ie,{className:"w-5 h-5"})," Export Over-All Toppers"]})}),d&&u&&q.length>0?e.jsx("div",{className:"pt-10",children:(()=>{const t=T.filter(r=>r.examId===d&&q.includes(r.className)&&f.find(a=>a.id===r.studentId)?.campus?.trim().toLowerCase()===u.trim().toLowerCase()).sort((r,a)=>a.percentage-r.percentage).slice(0,3);return t.length===0?e.jsxs("div",{className:"py-20 text-center glass-card border-dashed",children:[e.jsx(ie,{className:"w-12 h-12 text-slate-200 mx-auto mb-4"}),e.jsx("p",{className:"text-slate-400 font-black uppercase text-[10px] tracking-widest",children:"No matching results for selected classes"})]}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto px-4",children:[2,1,3].map(r=>{const a=t[r-1];if(!a)return e.jsx("div",{className:"hidden md:block"},r);const s=f.find(i=>i.id===a.studentId);return e.jsxs("div",{className:I("bg-white dark:bg-[#000816] p-8 rounded-[2.5rem] flex flex-col items-center text-center relative border border-slate-100 dark:border-white/5 transition-all duration-500 hover:-translate-y-2",r===1?"md:pb-16 order-1 md:order-2 ring-4 ring-amber-400/20 shadow-2xl":r===2?"order-2 md:order-1 opacity-90":"order-3 opacity-80"),children:[e.jsx("div",{className:I("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl",r===1?"bg-amber-400 text-white":r===2?"bg-slate-400 text-white":"bg-orange-400 text-white"),children:e.jsx(pe,{className:"w-8 h-8"})}),e.jsxs("div",{className:"absolute top-4 right-4 font-black text-4xl text-slate-100 dark:text-white/5 select-none",children:["#",r]}),e.jsx("h4",{className:"font-black text-brand-primary dark:text-white uppercase text-sm tracking-tight mb-1",children:s?.name}),e.jsxs("div",{className:"px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4",children:[a.className," • ",u]}),e.jsx("div",{className:"flex items-center gap-1 mb-2",children:[...Array(5)].map((i,n)=>e.jsx(Fe,{className:I("w-3 h-3",n<5-r+1?"text-amber-400 fill-amber-400":"text-slate-200")},n))}),e.jsxs("div",{className:"text-3xl md:text-4xl font-black text-brand-primary dark:text-brand-accent tabular-nums",children:[a.percentage.toFixed(1),"%"]}),e.jsx("p",{className:"text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1",children:"Cross-Range Standing"})]},r)})})})()}):e.jsxs("div",{className:"py-32 text-center glass-card border-dashed",children:[e.jsx(ie,{className:"w-16 h-16 text-slate-200 dark:text-brand-accent/10 mx-auto mb-4"}),e.jsx("p",{className:"text-slate-400 font-black uppercase text-[10px] tracking-widest",children:"Select Session, Campus & Classes to Reveal Legends"})]})]})})]})};export{ht as Exams};
