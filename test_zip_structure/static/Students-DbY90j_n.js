import{r as o,j as e,m as ee,A as Pe}from"./vendor-framer-D1vKbJ8a.js";import{r as Fe,s as ft,a as gt}from"./fileDownloader-kVaTduAa.js";import{u as $e}from"./index-BtXMVJl_.js";import{c as D}from"./cn-hCdZ21mq.js";import{S as w}from"./vendor-utils-DML6cOpY.js";import{F as it}from"./FeeVoucher-ytiMIMxi.js";import{c as Le}from"./imageCompressor-rQQvaFbC.js";import{G as W,q as wt,U as Ye,K as Xe,F as fe,D as ce,X as te,V as ze,r as vt,Y as nt,x as ge,Z as Ie,z as Te,_ as Ue,$ as tt,C as jt,h as be,y as Ae,a0 as we,v as kt,a1 as ot,e as Ve,a2 as Nt,P as at,a3 as st,a4 as yt,m as Se,a5 as Ct,a6 as St,a7 as At,a8 as Pt,a9 as lt,aa as rt,ab as Ft,ac as It,w as $t}from"./vendor-icons-BVeQKCV0.js";import{t as Ge}from"./index-XablJR_U.js";import{E as Rt}from"./vendor-export-B6SaTIxO.js";import{Q as Dt}from"./index-DCz2Y6Xb.js";import{Q as Ot}from"./QRScanner-CfNC-_hR.js";import{B as Et}from"./BulkFeeVoucher-DhDf6O-7.js";import"./vendor-react-Bce9NwRC.js";import"./index-BS3xtQn5.js";import"./vendor-firebase-B4Tjn-x7.js";import"./DashboardLayout-Be_lMlFL.js";const V=[{id:"personal",label:"Student Info",sub:"Basic Details",icon:Ye},{id:"parental",label:"Parent info",sub:"Family Details",icon:Xe},{id:"academic",label:"Previous School",sub:"Past Records",icon:W},{id:"documents",label:"Documents",sub:"Files & Photos",icon:fe},{id:"financial",label:"Fees info",sub:"Fee Details",icon:ce}],Bt=({editStudent:i,onClose:b,initialCampus:O,initialType:p})=>{const{addStudent:m,updateStudent:n,students:C,classes:y,feeStructure:F,campuses:M,settings:_}=$e(),[j,q]=o.useState("personal"),[E,xe]=o.useState(null),S=o.useMemo(()=>p||(i?.class?i.class.toLowerCase().includes("year")?"College":"School":null),[p,i]),L=o.useMemo(()=>S?S==="College"?y.filter(a=>a.toLowerCase().includes("year")):y.filter(a=>!a.toLowerCase().includes("year")):y,[y,S]),[A,z]=o.useState(null),[s,f]=o.useState({name:"",fatherName:"",class:L[0]||"",campus:O||M[0]?.name||"Main Campus",status:"Active",gender:"Male",religion:"Islam",nationality:"Pakistani",dob:"",admissionDate:new Date().toISOString().split("T")[0],academicRecords:[],admissionFees:0,monthlyFees:0,securityFees:0,miscellaneousCharges:0,documents:{},manualId:i?.id||"",...i,avatar:i?.avatar&&i.avatar.length>5?i.avatar:""});o.useEffect(()=>{i&&f({...i,manualId:i.id||"",avatar:i.avatar&&i.avatar.length>5?i.avatar:""})},[i]),o.useEffect(()=>{if(!i){const a=s.campus||"",l=M.find(P=>P.id===a||P.name===a),x=`PS-${l?.idPrefix?l.idPrefix.replace(/^PS-/,"").replace(/-$/,""):"GEN"}-`,v=C.filter(P=>P.id.startsWith(x));let B=1;if(v.length>0){const P=v.map(U=>{const pe=U.id.match(/(\d+)$/);return pe?parseInt(pe[1]):0});B=Math.max(...P)+1}f(P=>({...P,manualId:`${x}${B.toString().padStart(4,"0")}`}))}},[s.campus,i,C,M,f]),o.useEffect(()=>{!i&&s.class&&F[s.class]&&f(a=>({...a,monthlyFees:F[s.class]})),!i&&s.class?.toString().toLowerCase().includes("10th")&&(s.academicRecords?.some(l=>l.degree.toLowerCase().includes("9th"))||f(l=>({...l,academicRecords:[{degree:"9th Class (Board)",major:"General",marksObtained:"",totalMarks:"",percentage:"",passingYear:(new Date().getFullYear()-1).toString(),board:"BISE"},...l.academicRecords||[]]}))),!i&&S==="College"&&(s.academicRecords?.some(l=>l.degree.toLowerCase().includes("10th")||l.degree.toLowerCase().includes("ssc"))||f(l=>({...l,academicRecords:[{degree:"10th Class (SSC)",major:"Science",marksObtained:"",totalMarks:"1100",percentage:"",passingYear:new Date().getFullYear().toString(),board:"Federal Board"},...l.academicRecords||[]]})))},[s.class,F,i,S]);const g=a=>{const{name:l,value:r,type:x}=a.target;f(v=>({...v,[l]:x==="number"?r===""?"":parseFloat(r):r}))},Q=(a,l,r)=>{const x=[...s.academicRecords||[]];if(x[a]={...x[a],[l]:r},l==="marksObtained"||l==="totalMarks"){const v=parseFloat(l==="marksObtained"?r:x[a].marksObtained),B=parseFloat(l==="totalMarks"?r:x[a].totalMarks);v&&B&&(x[a].percentage=(v/B*100).toFixed(1)+"%")}f(v=>({...v,academicRecords:x}))},[K,J]=o.useState(""),[ae,H]=o.useState(!1),ve=o.useMemo(()=>{if(!K.trim())return[];const a=K.toLowerCase().trim();return C.filter(l=>l.name?.toLowerCase().includes(a)||l.id?.toLowerCase().includes(a)||l.cnic&&l.cnic.toLowerCase().includes(a)||l.fatherName&&l.fatherName.toLowerCase().includes(a)||l.contactFather&&l.contactFather.includes(a)).slice(0,6)},[C,K]),se=a=>{f(l=>({...l,name:a.name||"",fatherName:a.fatherName||"",fatherOccupation:a.fatherOccupation||"",monthlyIncome:a.monthlyIncome?String(a.monthlyIncome):"",address:a.address||"",dob:a.dob||"",gender:a.gender||"Male",religion:a.religion||"Islam",nationality:a.nationality||"Pakistani",cnic:a.cnic||"",contactFather:a.contactFather||"",contactSelf:a.contactSelf||"",whatsappNumber:a.whatsappNumber||"",avatar:a.avatar||"",documents:a.documents||{},academicRecords:[...a.academicRecords||[],{degree:a.previousClass||a.class||"Matriculation (10th)",major:a.discipline||"Science",marksObtained:"",totalMarks:"1100",percentage:"",passingYear:a.graduatedYear||new Date().getFullYear().toString(),board:"Board of Intermediate & Secondary Education"}]})),J(""),H(!1),w.fire({title:"⚡ Student Data Autofilled!",text:`Successfully loaded records for ${a.name}. All family, personal, and previous school data are populated.`,icon:"success",timer:3500,showConfirmButton:!1,toast:!0,position:"top-end"})},je=()=>{f(a=>({...a,academicRecords:[...a.academicRecords||[],{degree:"",major:"",marksObtained:"",totalMarks:"",percentage:"",passingYear:"",board:""}]}))},ie=a=>{f(l=>({...l,academicRecords:(l.academicRecords||[]).filter((r,x)=>x!==a)}))},ke=a=>{if(a.preventDefault(),j!=="financial")return;if(!s.name||!s.class){w.fire("Error","Full Name and Class are required.","error");return}const l=(s.admissionFees||0)+(s.monthlyFees||0)+(s.securityFees||0)+(s.miscellaneousCharges||0),r={...s,feesTotal:l,feesPaid:i?i.feesPaid:0},x=s.campus||"",v=M.find(U=>U.id===x||U.name.toLowerCase()===x.toLowerCase()),B=v?.name||x;if(i){r.id=i.id,r.campus=B,r.avatar=s.avatar&&s.avatar.length>5?s.avatar:i.avatar&&i.avatar.length>5?i.avatar:(s.name||"S").charAt(0),n(i.id,r),w.fire({title:"Data Updated",text:"Student records have been saved successfully.",icon:"success",toast:!0,position:"top-end",timer:3e3,showConfirmButton:!1}),b();return}let P=s.manualId||"";if(/^\d+$/.test(P))P=`PS-${v?.idPrefix?v.idPrefix.replace(/^PS-/,"").replace(/-$/,""):"GEN"}-${P.padStart(4,"0")}`;else if(P){const U=P.match(/(\d+)$/)?.[1]||"0001";P=`PS-${P.replace(U,"").replace(/-$/,"").replace(/PS-/g,"").replace(/-/g,"").trim()||"GEN"}-${U.padStart(4,"0")}`}r.id=P||`PS-GEN-${Date.now()}`,r.campus=B,r.avatar=s.avatar&&s.avatar.length>5?s.avatar:(s.name||"S").charAt(0),m(r),xe(r),w.fire({title:"Admission Successful",text:"Student registered. Showing fee voucher...",icon:"success",toast:!0,position:"top-end",timer:3e3,showConfirmButton:!1})};if(E)return e.jsx(it,{student:E,onClose:b});const ne=e.jsxs(ee.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 md:p-10 overflow-hidden antialiased",children:[e.jsx("div",{className:"absolute inset-0",onClick:b}),e.jsxs(ee.div,{initial:{scale:.95,opacity:0,y:30},animate:{scale:1,opacity:1,y:0},exit:{scale:.95,opacity:0,y:30},className:"relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[95vh] bg-white dark:bg-slate-900 rounded-none sm:rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col",onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{className:"relative px-4 sm:px-6 md:px-12 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-100 dark:border-white/5",children:[e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-6",children:[e.jsxs("div",{className:"flex items-center gap-3 sm:gap-6 pr-10 md:pr-0",children:[e.jsxs("div",{className:"relative group",children:[e.jsx("div",{className:"absolute -inset-2 bg-gradient-to-tr from-brand-primary to-blue-400 opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity"}),e.jsx("div",{className:"relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center p-1.5 sm:p-2 border border-slate-50 dark:border-white/10",children:S==="College"?_.logo2?e.jsx("img",{src:_.logo2,className:"w-full h-full object-contain",alt:"College Logo"}):e.jsx(W,{className:"w-8 h-8 md:w-10 md:h-10 text-brand-primary"}):_.logo1?e.jsx("img",{src:_.logo1,className:"w-full h-full object-contain",alt:"School Logo"}):e.jsx(wt,{className:"w-8 h-8 md:w-10 md:h-10 text-brand-primary"})})]}),e.jsxs("div",{className:"space-y-0.5 sm:space-y-1 min-w-0",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-2 sm:gap-3",children:[e.jsx("h2",{className:"text-xl sm:text-2xl md:text-3xl font-[1000] text-[#003366] dark:text-white tracking-tighter uppercase font-outfit",children:"Admission Form"}),e.jsx("span",{className:"px-2.5 sm:px-4 py-0.5 sm:py-1 bg-amber-400 text-[#003366] rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-400/20 truncate max-w-[150px] sm:max-w-none",children:s.campus})]}),e.jsxs("p",{className:"text-[9px] sm:text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2",children:["Student Registration ",e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-slate-300"})," ",S||"Institution"]})]})]}),e.jsxs("div",{className:"flex flex-col items-start md:items-end gap-1.5 sm:gap-2 md:min-w-[200px]",children:[e.jsxs("div",{className:"flex items-center justify-between w-full mb-0.5",children:[e.jsx("span",{className:"text-[9px] sm:text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest",children:"Form Progress"}),e.jsxs("span",{className:"text-[9px] sm:text-[10px] font-black text-[#003366] dark:text-blue-400 uppercase tracking-widest",children:["Step ",V.findIndex(a=>a.id===j)+1,"/",V.length]})]}),e.jsx("div",{className:"w-full h-1.5 sm:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden",children:e.jsx(ee.div,{className:"h-full bg-[#003366] dark:bg-blue-500 shadow-[0_0_15px_rgba(0,51,102,0.3)]",initial:{width:0},animate:{width:`${(V.findIndex(a=>a.id===j)+1)/V.length*100}%`},transition:{type:"spring",stiffness:50,damping:20}})})]}),e.jsx("button",{onClick:b,className:"absolute top-4 sm:top-8 right-4 sm:right-8 p-2 sm:p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-rose-500 group",children:e.jsx(te,{className:"w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform"})})]}),e.jsx("div",{className:"relative pt-1 sm:pt-2 overflow-x-auto no-scrollbar pb-1",children:e.jsxs("div",{className:"flex items-center justify-between sm:min-w-[550px] min-w-max gap-2 sm:gap-4 px-1 sm:px-4 relative",children:[e.jsx("div",{className:"hidden sm:block absolute top-6 left-12 right-12 h-[2px] bg-slate-100 dark:bg-white/5 z-0"}),V.map((a,l)=>{const r=V.findIndex(B=>B.id===j),x=r>l,v=r===l;return e.jsxs("button",{type:"button",onClick:()=>q(a.id),className:"relative z-10 flex flex-col items-center gap-1.5 sm:gap-4 group cursor-pointer shrink-0",children:[e.jsx("div",{className:D("w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-500",v?"bg-[#003366] text-white shadow-2xl shadow-[#003366]/30 scale-105 sm:scale-110":x?"bg-emerald-500 text-white shadow-lg":"bg-white dark:bg-slate-800 text-slate-300 border border-slate-100 dark:border-white/5"),children:x?e.jsx(ze,{className:"w-4 h-4 sm:w-6 sm:h-6"}):e.jsx(a.icon,{className:"w-4 h-4 sm:w-6 sm:h-6"})}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:D("text-[8px] sm:text-[9.5px] font-[1000] uppercase tracking-wider sm:tracking-widest mb-0.5 transition-colors whitespace-nowrap",v?"text-slate-900 dark:text-white":"text-slate-800/60 dark:text-slate-400"),children:a.label}),e.jsx("p",{className:D("hidden sm:block text-[8px] font-black uppercase tracking-tight transition-colors",v?"text-slate-900/80 dark:text-white/80":"text-slate-800/40 dark:text-slate-500"),children:a.sub})]}),v&&e.jsx(ee.div,{layoutId:"active-dot",className:"absolute -top-1 w-1.5 h-1.5 bg-[#003366] dark:bg-blue-400 rounded-full"})]},a.id)})]})})]}),e.jsxs("form",{onSubmit:ke,onKeyDown:a=>{a.key==="Enter"&&a.target.tagName!=="TEXTAREA"&&a.preventDefault()},className:"flex-1 flex flex-col overflow-hidden",children:[e.jsx("div",{className:"flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-white dark:bg-slate-900/50",children:e.jsx(Pe,{mode:"wait",children:e.jsxs(ee.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},transition:{duration:.3},className:"max-w-4xl mx-auto",children:[j==="personal"&&e.jsxs("div",{className:"space-y-12",children:[!i&&e.jsxs("div",{className:"relative p-4 bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-blue-900/10 dark:from-purple-500/10 dark:via-indigo-500/10 dark:to-blue-500/10 rounded-3xl border border-purple-500/20 shadow-sm",children:[e.jsx("div",{className:"flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-2",children:e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-purple-600/30 shrink-0",children:e.jsx(vt,{className:"w-4 h-4"})}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-xs font-black text-purple-900 dark:text-purple-300 uppercase tracking-tight",children:"Fast-Autofill from Alumni / Matric Records"}),e.jsx("p",{className:"text-[9px] font-bold text-slate-500 dark:text-slate-400",children:"Re-admitting student into 1st Year? Search by Name, B-Form / CNIC, or ID."})]})]})}),e.jsxs("div",{className:"relative",children:[e.jsx(nt,{className:"absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none"}),e.jsx("input",{type:"text",value:K,onChange:a=>{J(a.target.value),H(!0)},onFocus:()=>H(!0),placeholder:"Search passed-out student by Name, CNIC, Phone, or ID...",className:"w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 rounded-2xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 ring-purple-500/30 transition-all placeholder:text-slate-400"}),K&&e.jsx("button",{type:"button",onClick:()=>{J(""),H(!1)},className:"absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500",children:e.jsx(te,{className:"w-4 h-4"})}),ae&&K.trim().length>0&&e.jsx("div",{className:"absolute top-full mt-2 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-purple-100 dark:border-purple-500/20 shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar",children:ve.length>0?e.jsx("div",{className:"divide-y divide-slate-100 dark:divide-white/5",children:ve.map(a=>e.jsxs("button",{type:"button",onClick:()=>se(a),className:"w-full text-left p-3 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center justify-between gap-3 transition-colors group",children:[e.jsxs("div",{className:"flex items-center gap-3 min-w-0",children:[e.jsx("div",{className:"w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0",children:a.name.charAt(0)}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"text-xs font-black text-slate-800 dark:text-white uppercase truncate group-hover:text-purple-600 transition-colors",children:a.name}),e.jsxs("p",{className:"text-[9px] font-bold text-slate-400 truncate",children:["Father: ",a.fatherName||"N/A"," • Class: ",a.previousClass||a.class," • ID: ",a.id]})]})]}),e.jsx("span",{className:"px-2.5 py-1 bg-purple-600 text-white text-[8px] font-black uppercase rounded-lg shrink-0 tracking-wider shadow-sm",children:"Autofill ⚡"})]},a.id))}):e.jsxs("div",{className:"p-4 text-center text-xs font-bold text-slate-400",children:['No student found matching "',K,'"']})})]})]}),e.jsx("div",{className:"relative p-0.5 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden",children:e.jsxs("div",{className:"bg-white dark:bg-[#000d1a] rounded-[1.95rem] p-5 flex flex-col md:flex-row items-center gap-6 group",children:[e.jsxs("div",{className:"relative shrink-0",children:[e.jsx("div",{className:"absolute -inset-4 bg-blue-500/10 rounded-[3rem] blur-2xl group-hover:bg-blue-500/20 transition-all"}),e.jsxs("div",{className:"relative w-28 h-28 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-white/5 transition-all group-hover:border-[#003366] group-hover:scale-[1.02]",children:[s.avatar&&s.avatar.length>5?e.jsx("img",{src:s.avatar,className:"w-full h-full object-cover",alt:"Student"}):e.jsxs("div",{className:"flex flex-col items-center justify-center text-slate-300 dark:text-slate-600",children:[e.jsx(ge,{className:"w-10 h-10 group-hover:scale-110 transition-transform"}),e.jsx("span",{className:"text-[8px] font-black uppercase tracking-wider mt-1 text-slate-400",children:"Add Photo"})]}),e.jsx("input",{type:"file",accept:"image/*",className:"absolute inset-0 opacity-0 cursor-pointer",onChange:async a=>{const l=a.target.files?.[0];if(l)try{const r=await Le(l,800,800,.82);f(x=>({...x,avatar:r}))}catch(r){console.error("Photo upload failed:",r)}}})]}),e.jsxs("div",{className:"absolute -bottom-1 -right-1 flex gap-1.5",children:[s.avatar&&s.avatar.length>5&&e.jsx("button",{type:"button",onClick:()=>f(a=>({...a,avatar:""})),className:"p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all flex items-center justify-center",title:"Remove Photo",children:e.jsx(Ie,{className:"w-4 h-4"})}),e.jsxs("label",{className:"p-2 bg-[#003366] text-white rounded-xl shadow-lg cursor-pointer hover:bg-[#002b57] transition-all flex items-center justify-center",title:"Upload Photo",children:[e.jsx(Te,{className:"w-4 h-4"}),e.jsx("input",{type:"file",accept:"image/*",className:"hidden",onChange:async a=>{const l=a.target.files?.[0];if(l)try{const r=await Le(l,800,800,.82);f(x=>({...x,avatar:r}))}catch(r){console.error("Photo upload failed:",r)}}})]}),e.jsx("button",{type:"button",onClick:()=>z("avatar"),className:"p-2 bg-emerald-500 text-white rounded-xl shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center",title:"Live Camera",children:e.jsx(ge,{className:"w-4 h-4"})})]})]}),e.jsxs("div",{className:"text-center md:text-left",children:[e.jsx("h3",{className:"text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-3",children:"Student Photo"}),e.jsx("p",{className:"text-xs md:text-sm font-black text-slate-900/60 dark:text-slate-400 leading-relaxed max-w-md",children:"Upload a professional photo of the student for school ID cards and institutional records."}),e.jsx("div",{className:"inline-flex mt-6 px-4 py-2 bg-slate-900 text-white dark:bg-white/10 rounded-xl",children:e.jsx("span",{className:"text-[10px] font-black uppercase tracking-widest italic",children:"Supports: JPG, PNG, WEBP (Auto-optimized)"})})]})]})}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsx(N,{label:"Full Name",icon:Ye,name:"name",value:s.name,onChange:g,placeholder:"Enter full name",type:"text",required:!0}),e.jsx(N,{label:"Select Campus",icon:Ue,name:"campus",value:s.campus,onChange:g,type:"select",options:[...M.map(a=>a.name.toUpperCase())],disabled:!!O}),e.jsx(N,{label:"Permanent Student ID",icon:tt,name:"manualId",value:s.manualId,onChange:g,placeholder:"PS-MH-0001",type:"text"}),e.jsx(N,{label:"Date of Birth",icon:jt,name:"dob",value:s.dob,onChange:g,type:"date",required:!0}),e.jsx(N,{label:"Gender",icon:Ye,name:"gender",value:s.gender,onChange:g,type:"select",options:["Male","Female","Other"],required:!0}),e.jsx(N,{label:"CNIC / B-Form",icon:tt,name:"cnic",value:s.cnic,onChange:g,placeholder:"00000-0000000-0",type:"text"}),e.jsx(N,{label:"Religion",icon:be,name:"religion",value:s.religion,onChange:g,type:"text",required:!0}),e.jsx(N,{label:"Nationality",icon:be,name:"nationality",value:s.nationality,onChange:g,type:"text"}),e.jsx(N,{label:"Status",icon:ze,name:"status",value:s.status,onChange:g,type:"select",options:["Active","Inactive","Passed Out","Alumni","Online Applied","Pending Verification"],required:!0}),e.jsx(N,{label:"Email Address",icon:Te,name:"email",value:s.email,onChange:g,placeholder:"student@example.com",type:"email"}),e.jsx(N,{label:"Guardian Phone",icon:Ae,name:"contactSelf",value:s.contactSelf,onChange:g,placeholder:"03XXXXXXXXX",type:"tel"}),e.jsx("div",{className:"col-span-full",children:e.jsx(N,{label:"Home Address",icon:Ue,name:"address",value:s.address,onChange:g,textarea:!0})})]})]}),j==="parental"&&e.jsx("div",{className:"space-y-10",children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8",children:[e.jsx(N,{label:"Father / Guardian Name",icon:Xe,name:"fatherName",value:s.fatherName,onChange:g,placeholder:"Enter name",type:"text"}),e.jsx(N,{label:"Father's Job",icon:be,name:"fatherOccupation",value:s.fatherOccupation,onChange:g,type:"text"}),e.jsx(N,{label:"Guardian Phone",icon:Ae,name:"contactFather",value:s.contactFather,onChange:g,placeholder:"03XXXXXXXXX",type:"tel"}),e.jsx(N,{label:"WhatsApp Sync",icon:Ae,name:"whatsappNumber",value:s.whatsappNumber,onChange:g,placeholder:"923XXXXXXXXX",type:"tel",required:!0}),e.jsx(N,{label:"Monthly Income",icon:ce,name:"monthlyIncome",value:s.monthlyIncome,onChange:g,type:"number"}),e.jsx(N,{label:"Orphan Status",icon:be,name:"isOrphan",value:s.isOrphan,onChange:g,type:"select",options:["No","Yes"]})]})}),j==="academic"&&e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8",children:[e.jsx("div",{className:D(S!=="College"&&"col-span-full"),children:e.jsx(N,{label:"Select Class",icon:W,name:"class",value:s.class,onChange:g,type:"select",options:["",...L]})}),S==="College"&&e.jsx(N,{label:"Select Board",icon:W,name:"discipline",value:s.discipline,onChange:g,placeholder:"E.g. Science, Arts"})]}),e.jsxs("div",{className:"pt-10 border-t border-slate-100 dark:border-slate-800",children:[e.jsxs("div",{className:"flex items-center justify-between mb-8",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight",children:"Previous School Info"}),e.jsx("p",{className:"text-sm text-slate-900/60 dark:text-slate-400 mt-1 font-black",children:"Please add the student's previous school result details."})]}),e.jsxs("button",{type:"button",onClick:je,className:"px-6 py-3 bg-[#003366] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:shadow-xl transition-all active:scale-95",children:[e.jsx(we,{className:"w-4 h-4"})," Add Record"]})]}),e.jsxs("div",{className:"grid gap-6",children:[s.academicRecords?.map((a,l)=>e.jsxs(ee.div,{initial:{opacity:0,x:-10},animate:{opacity:1,x:0},className:"p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative group",children:[e.jsx("button",{type:"button",onClick:()=>ie(l),className:"absolute -top-3 -right-3 p-3 bg-rose-500 text-white rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110",children:e.jsx(Ie,{className:"w-5 h-5"})}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e.jsx("div",{className:"md:col-span-2",children:e.jsx("input",{type:"text",placeholder:"Credential (e.g. Metric / SSC)",className:"w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none font-bold text-sm focus:border-blue-500 transition-all",value:a.degree,onChange:r=>Q(l,"degree",r.target.value)})}),e.jsx("input",{type:"text",placeholder:"Sesssion Year",className:"w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none font-bold text-sm focus:border-blue-500 transition-all",value:a.passingYear,onChange:r=>Q(l,"passingYear",r.target.value)}),e.jsx("input",{type:"number",placeholder:"Obtained Marks",className:"w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none font-bold text-sm focus:border-blue-500 transition-all",value:a.marksObtained,onChange:r=>Q(l,"marksObtained",r.target.value)}),e.jsx("input",{type:"number",placeholder:"Max Marks",className:"w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none font-bold text-sm focus:border-blue-500 transition-all",value:a.totalMarks,onChange:r=>Q(l,"totalMarks",r.target.value)}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"px-5 py-4 bg-brand-primary text-white rounded-2xl text-xs font-black min-w-[70px] text-center",children:a.percentage||"-%"}),e.jsx("input",{placeholder:"Affiliated Board",className:"flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none font-bold text-sm focus:border-blue-500 transition-all",value:a.board,onChange:r=>Q(l,"board",r.target.value)})]})]})]},l)),(s.academicRecords?.length||0)===0&&e.jsxs("div",{className:"py-20 text-center bg-slate-50 dark:bg-slate-800/30 rounded-[3.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800",children:[e.jsx(kt,{className:"w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-5"}),e.jsx("p",{className:"text-xs font-black text-slate-400 uppercase tracking-[0.3em]",children:"No school history added yet"})]})]})]})]}),j==="documents"&&e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{className:"text-center mb-10 max-w-2xl mx-auto",children:[e.jsx("h4",{className:"text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight",children:"Required Documents"}),e.jsx("p",{className:"text-sm text-slate-900/60 dark:text-slate-400 mt-2 font-black",children:"Please upload clear photos or PDF files of the student's documents."})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8",children:(()=>{const l=(s.academicRecords||[]).find(B=>(B.degree||"").toLowerCase().includes("10th")||(B.degree||"").toLowerCase().includes("ssc")),r=S==="College"&&l&&!["federal","federal board","fbise"].includes((l.board||"").toLowerCase().trim()),x=new Date().getFullYear(),v=S==="College"&&l&&l.passingYear&&parseInt(l.passingYear)<x;return[{id:"bform",label:"B-Form / CNIC Scanned",required:!0},{id:"fatherCnic",label:"Father CNIC (Both Sides)",required:!0},...s.isOrphan?[{id:"deathCert",label:"Father Death Certificate",required:!0}]:[],...r?[{id:"noc",label:"NOC / Migration Certificate",required:!0}]:[],...v?[{id:"gapCert",label:"Gap Certificate",required:!0}]:[],{id:"leavingCert",label:"Migration / Character Certificate",required:S==="College"},{id:"transcript",label:"Previous Result Card",required:!0},{id:"vaccination",label:"Bio Vaccination Profile",required:S==="School"}]})().map(a=>e.jsxs("div",{className:"p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-2xl",children:[e.jsxs("div",{className:"flex items-center gap-6",children:[e.jsx("div",{className:D("w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all shadow-sm",s.documents?.[a.id]?"bg-emerald-500 text-white animate-pulse":"bg-white dark:bg-slate-900 text-slate-300 border border-slate-100 dark:border-slate-700"),children:s.documents?.[a.id]?e.jsx(ze,{className:"w-8 h-8"}):e.jsx(fe,{className:"w-8 h-8"})}),e.jsxs("div",{children:[e.jsxs("span",{className:"block text-xs font-[1000] uppercase tracking-widest text-slate-900 dark:text-white",children:[a.label,a.required&&e.jsx("span",{className:"text-rose-600 ml-1",children:"*"})]}),e.jsx("span",{className:"text-[10px] font-black text-slate-900/40 dark:text-slate-500 mt-1 block uppercase tracking-tight",children:"Verified Digital Format"})]})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsxs("label",{className:"p-4 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-600 rounded-2xl shadow-sm cursor-pointer transition-all border border-slate-100 dark:border-slate-800 active:scale-90",children:[e.jsx(Te,{className:"w-5 h-5"}),e.jsx("input",{type:"file",className:"hidden",accept:"application/pdf,image/*",onChange:async l=>{const r=l.target.files?.[0];if(r)try{const x=await Le(r,1200,1200,.8);f(v=>({...v,documents:{...v.documents||{},[a.id]:x}}))}catch(x){console.error("Doc upload error:",x)}}})]}),e.jsx("button",{type:"button",onClick:()=>z(`doc-${a.id}`),className:"p-4 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-emerald-600 rounded-2xl shadow-sm transition-all border border-slate-100 dark:border-slate-800 active:scale-90",children:e.jsx(ge,{className:"w-5 h-5"})})]})]},a.id))})]}),j==="financial"&&e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{className:"text-center mb-10 max-w-2xl mx-auto",children:[e.jsx("h4",{className:"text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight",children:"Fee Structure"}),e.jsx("p",{className:"text-sm text-slate-900/60 dark:text-slate-400 mt-2 font-black",children:"Configure the admission and recurring fees for this student."})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-10",children:[e.jsx(N,{label:"Admission Fee",icon:ce,name:"admissionFees",value:s.admissionFees,onChange:g,type:"number"}),e.jsx(N,{label:"Monthly Tuition",icon:ce,name:"monthlyFees",value:s.monthlyFees,onChange:g,type:"number"}),e.jsx(N,{label:"Security Deposit",icon:be,name:"securityFees",value:s.securityFees,onChange:g,type:"number"}),e.jsx(N,{label:"Additional Charges",icon:we,name:"miscellaneousCharges",value:s.miscellaneousCharges,onChange:g,type:"number"})]}),e.jsxs("div",{className:"p-10 bg-gradient-to-br from-[#003366] to-slate-900 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group",children:[e.jsx("div",{className:"absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] group-hover:bg-white/10 transition-all duration-700"}),e.jsx("div",{className:"w-24 h-24 bg-yellow-400 rounded-3xl flex items-center justify-center text-[#003366] shadow-[0_0_40px_rgba(250,204,21,0.3)] shrink-0 z-10",children:e.jsx(ce,{className:"w-12 h-12"})}),e.jsxs("div",{className:"flex-1 text-center md:text-left z-10",children:[e.jsx("span",{className:"text-[10px] font-black text-white/40 uppercase tracking-[0.4em]",children:"Total Fee Estimate"}),e.jsxs("h3",{className:"text-5xl font-black text-white tracking-tighter mt-2",children:["Rs. ",(Number(s.admissionFees||0)+Number(s.monthlyFees||0)+Number(s.securityFees||0)+Number(s.miscellaneousCharges||0)).toLocaleString()]}),e.jsx("p",{className:"text-sm font-medium text-blue-300 mt-3 opacity-60",children:"This amount will be added to the student's account automatically."})]})]})]})]},j)})}),e.jsxs("div",{className:"px-6 md:px-12 py-5 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-4 justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3 w-full md:w-auto",children:[e.jsx("button",{type:"button",onClick:b,className:"flex-1 md:flex-none px-6 py-3.5 bg-white dark:bg-white/5 hover:bg-slate-100 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-400 font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 shadow-sm",children:"Cancel"}),j!=="personal"&&e.jsxs("button",{type:"button",onClick:()=>{const a=V.findIndex(l=>l.id===j);a>0&&q(V[a-1].id)},className:"flex-1 md:flex-none px-6 py-3.5 bg-white dark:bg-white/5 hover:bg-slate-100 border border-slate-100 dark:border-white/5 rounded-2xl text-[#003366] dark:text-white font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm",children:[e.jsx(ot,{className:"w-4 h-4"})," Previous"]})]}),j!=="financial"?e.jsxs("button",{type:"button",onClick:a=>{a.preventDefault(),a.stopPropagation();const l=V.findIndex(r=>r.id===j);if(l!==-1&&l<V.length-1){q(V[l+1].id);const r=document.querySelector(".custom-scrollbar");r&&r.scrollTo({top:0,behavior:"smooth"})}},className:"w-full md:w-auto px-10 py-3.5 bg-[#003366] hover:bg-[#002b57] text-white rounded-2xl font-[1000] uppercase text-[9px] tracking-widest shadow-xl shadow-[#003366]/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group",children:["Continue",e.jsx(Ve,{className:"w-4 h-4 group-hover:translate-x-1 transition-transform"})]}):e.jsxs("button",{type:"submit",className:"w-full md:w-auto px-10 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-[1000] uppercase text-[9px] tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group",children:[e.jsx(Nt,{className:"w-4 h-4 group-hover:rotate-12 transition-transform"}),i?"Update":"Submit"]})]})]})]}),e.jsx(Mt,{isOpen:!!A,onClose:()=>z(null),onCapture:a=>{if(A==="avatar")f(l=>({...l,avatar:a}));else if(A?.startsWith("doc-")){const l=A.replace("doc-","");f(r=>({...r,documents:{...r.documents||{},[l]:a}}))}z(null)}})]});return typeof document<"u"?Fe.createPortal(ne,document.body):ne},Mt=({isOpen:i,onClose:b,onCapture:O})=>{const p=o.useRef(null),m=o.useRef(null),[n,C]=o.useState(null);o.useEffect(()=>{i?navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:1280,height:720}}).then(F=>{C(F),p.current&&(p.current.srcObject=F)}).catch(F=>{console.error("Camera Error:",F),w.fire("Error","Could not access camera. Please check permissions.","error"),b()}):n&&(n.getTracks().forEach(F=>F.stop()),C(null))},[i]);const y=()=>{if(p.current&&m.current){const F=p.current,M=m.current;M.width=F.videoWidth,M.height=F.videoHeight,M.getContext("2d")?.drawImage(F,0,0),O(M.toDataURL("image/jpeg",.8))}};return e.jsx(Pe,{children:i&&e.jsx(ee.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4",children:e.jsxs("div",{className:"relative w-full max-w-2xl bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl",children:[e.jsxs("div",{className:"p-6 border-b border-white/5 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"p-2 bg-emerald-500/10 rounded-xl",children:e.jsx(ge,{className:"w-5 h-5 text-emerald-500"})}),e.jsx("h3",{className:"text-white font-black uppercase text-xs tracking-widest",children:"Live Capture"})]}),e.jsx("button",{onClick:b,className:"p-2 text-slate-400 hover:text-white transition-colors",children:e.jsx(te,{className:"w-6 h-6"})})]}),e.jsxs("div",{className:"relative aspect-video bg-black flex items-center justify-center",children:[e.jsx("video",{ref:p,autoPlay:!0,playsInline:!0,className:"w-full h-full object-cover"}),e.jsx("canvas",{ref:m,className:"hidden"}),e.jsx("div",{className:"absolute inset-x-0 inset-y-0 border-[40px] border-black/40 pointer-events-none",children:e.jsx("div",{className:"w-full h-full border-2 border-dashed border-white/20 rounded-3xl"})})]}),e.jsxs("div",{className:"p-8 flex items-center justify-center gap-4 bg-slate-900/50",children:[e.jsx("button",{onClick:b,className:"px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all",children:"Cancel"}),e.jsxs("button",{onClick:y,className:"flex-1 max-w-[240px] px-8 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-[1000] uppercase text-[10px] tracking-widest shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3",children:[e.jsx("div",{className:"w-4 h-4 rounded-full border-4 border-white animate-pulse"}),"Capture Photo"]})]})]})})})},N=({label:i,icon:b,textarea:O,type:p="text",options:m=[],required:n,...C})=>e.jsxs("div",{className:"space-y-1.5 group",children:[e.jsxs("label",{className:"text-[8px] md:text-[9.5px] font-[1000] text-slate-900 dark:text-white uppercase tracking-widest ml-1 flex items-center gap-1.5 transition-colors group-focus-within:text-blue-600",children:[e.jsx(b,{className:"w-3 h-3"}),i,n&&e.jsx("span",{className:"text-rose-600 font-black",children:"*"})]}),e.jsx("div",{className:"relative",children:O?e.jsx("textarea",{className:"w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-50 dark:border-white/5 p-3 rounded-xl text-xs font-bold outline-none ring-offset-0 focus:ring-4 focus:ring-[#003366]/5 focus:border-[#003366]/20 transition-all min-h-[100px] resize-none shadow-sm dark:text-white",...C}):p==="select"?e.jsxs("div",{className:"relative group/select",children:[e.jsx("select",{className:"w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-50 dark:border-white/5 px-4 py-2.5 rounded-xl text-xs font-black outline-none focus:ring-4 focus:ring-[#003366]/5 focus:border-[#003366]/20 transition-all appearance-none cursor-pointer shadow-sm dark:text-white",...C,children:m.map(y=>e.jsx("option",{value:y,className:"bg-white dark:bg-slate-900",children:y},y))}),e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within/select:text-[#003366] transition-colors",children:e.jsx(Ve,{className:"w-4 h-4 rotate-90"})})]}):e.jsx("input",{type:p,className:"w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-50 dark:border-white/5 px-4 py-2.5 rounded-xl text-xs font-[800] tracking-tight outline-none focus:ring-4 focus:ring-[#003366]/5 focus:border-[#003366]/20 transition-all shadow-sm dark:text-white",onFocus:y=>{p==="number"&&y.target.value==="0"&&(y.target.value=""),C.onFocus?.(y)},...C})})]}),Lt=({onClose:i})=>{const{settings:b}=$e(),O=o.useRef(null),p=()=>{const m=O.current;if(!m)return;const n=window.open("","_blank");n&&(n.document.write(`
            <html>
                <head>
                    <title>Admission Form - ${b.schoolName}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
                    <script src="https://cdn.tailwindcss.com"><\/script>
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
                        ${m.innerHTML}
                    </div>
                </body>
            </html>
        `),n.document.close(),setTimeout(()=>{n.focus(),n.print(),n.onafterprint=()=>n.close()},500))};return e.jsxs("div",{className:"fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4",children:[e.jsx("div",{className:"absolute inset-0",onClick:i}),e.jsxs("div",{className:"relative w-full max-w-[1000px] h-[95vh] flex flex-col bg-slate-800 rounded-3xl overflow-hidden shadow-2xl",children:[e.jsxs("div",{className:"p-4 bg-slate-900/50 border-b border-white/5 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"p-2 bg-rose-500/10 rounded-xl",children:e.jsx(at,{className:"w-5 h-5 text-rose-500"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-white font-bold text-sm tracking-tight",children:"Print Admission Form"}),e.jsx("p",{className:"text-slate-400 text-[10px] font-black uppercase tracking-widest",children:"Modern Integrated Layout"})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{onClick:p,className:"px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2",children:[e.jsx(at,{size:14})," Print Now"]}),e.jsx("button",{onClick:i,className:"p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all",children:e.jsx(te,{size:20})})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto bg-slate-700/50 p-6 flex justify-center custom-scrollbar",children:e.jsxs("div",{ref:O,className:"w-[210mm] min-h-[297mm] h-[297mm] bg-white p-[12mm] text-slate-800 overflow-hidden relative flex flex-col shadow-2xl",style:{fontFamily:"'Outfit', sans-serif"},children:[e.jsx("div",{className:"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[35deg] text-[100px] font-black text-slate-900/[0.02] whitespace-nowrap pointer-events-none select-none uppercase tracking-[0.2em] z-0",children:b.schoolName||"OFFICIAL"}),e.jsxs("div",{className:"flex justify-between items-center mb-8 relative z-10",children:[e.jsx("div",{className:"w-[90px] h-[90px] shrink-0",children:b.logo1?e.jsx("img",{src:b.logo1,className:"w-full h-full object-contain",alt:"Logo"}):e.jsx("div",{className:"w-full h-full border-2 border-slate-200 rounded-full bg-slate-50 flex items-center justify-center font-bold text-[10px]",children:"LOGO"})}),e.jsxs("div",{className:"flex-1 text-center px-4",children:[e.jsx("h1",{className:"text-[44px] font-black text-slate-900 leading-none tracking-tight mb-2",style:{fontFamily:"'Playfair Display', serif"},children:b.schoolName||"PIONEER'S SUPERIOR"}),e.jsx("h2",{className:"text-[12px] font-black text-[#d97706] uppercase tracking-[0.3em] mb-1",children:b.subTitle||"INSTITUTE OF HIGHER SECONDARY EDUCATION, ATTOCK"}),e.jsx("p",{className:"text-[9px] font-bold text-slate-400 uppercase tracking-widest",children:"Established Since 1984 • Registered & Recognized Institution"})]}),e.jsx("div",{className:"w-[90px] h-[90px] shrink-0",children:b.logo2?e.jsx("img",{src:b.logo2,className:"w-full h-full object-contain",alt:"Logo"}):e.jsx("div",{className:"w-full h-full border-2 border-slate-200 rounded-full bg-slate-50 flex items-center justify-center font-bold text-[10px]",children:"LOGO"})})]}),e.jsx("div",{className:"grid grid-cols-4 gap-3 mb-6 relative z-10",children:[{label:"Form Number",value:"PF-2024-XXXX"},{label:"Admission No",value:""},{label:"Admission Date",value:new Date().toLocaleDateString()},{label:"Class Applied",value:""},{label:"Discipline",value:""},{label:"Shift/Group",value:""},{label:"Session",value:"2025-2026"},{label:"Status",value:"New Admission"}].map((m,n)=>e.jsxs("div",{className:"bg-white border-[1.5px] border-slate-100 rounded-xl p-3 h-14 flex flex-col justify-center shadow-sm",children:[e.jsx("span",{className:"text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1",children:m.label}),e.jsx("span",{className:"text-sm font-extrabold text-slate-800",children:m.value})]},n))}),e.jsxs("div",{className:"flex-1 space-y-4 relative z-10",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"border-l-4 border-[#830000] pl-3 py-0.5 text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3 bg-slate-50",children:"1. Student Profile"}),e.jsxs("div",{className:"grid grid-cols-12 gap-4",children:[e.jsxs("div",{className:"col-span-9 space-y-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1",children:"Student's Full Name (Block Letters)"}),e.jsx("div",{className:"flex",children:Array.from({length:28}).map((m,n)=>e.jsx("div",{className:"flex-1 h-7 border border-slate-100 bg-white first:rounded-l-lg last:rounded-r-lg shadow-sm"},n))})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1",children:"Father's Full Name (Block Letters)"}),e.jsx("div",{className:"flex",children:Array.from({length:28}).map((m,n)=>e.jsx("div",{className:"flex-1 h-7 border border-slate-100 bg-white first:rounded-l-lg last:rounded-r-lg shadow-sm"},n))})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{className:"bg-slate-50/50 p-3 rounded-xl border border-slate-100",children:[e.jsx("p",{className:"text-[8px] font-black text-slate-400 uppercase mb-1",children:"Father's Occupation"}),e.jsx("div",{className:"h-5 border-b border-slate-200"})]}),e.jsxs("div",{className:"bg-slate-50/50 p-3 rounded-xl border border-slate-100",children:[e.jsx("p",{className:"text-[8px] font-black text-slate-400 uppercase mb-1",children:"Monthly Income (PKR)"}),e.jsx("div",{className:"h-5 border-b border-slate-200"})]})]})]}),e.jsx("div",{className:"col-span-3 flex items-center justify-center",children:e.jsxs("div",{className:"w-[120px] h-[140px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-4 bg-slate-50/30",children:[e.jsx("div",{className:"w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-2",children:e.jsx(te,{className:"w-4 h-4 text-slate-300"})}),e.jsx("p",{className:"text-[9px] font-black text-slate-300 uppercase leading-tight",children:"Attach Photograph"}),e.jsx("p",{className:"text-[7px] font-bold text-slate-200 mt-1 uppercase",children:"Blue Background"})]})})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-6 pt-2",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsx("h3",{className:"border-l-4 border-slate-300 pl-3 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/30",children:"Contact Details"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"bg-white border-b border-slate-100 pb-2",children:[e.jsx("p",{className:"text-[8px] font-black text-slate-400 uppercase mb-1",children:"Student Contact Number"}),e.jsx("div",{className:"h-5"})]}),e.jsxs("div",{className:"bg-white border-b border-slate-100 pb-2",children:[e.jsx("p",{className:"text-[8px] font-black text-slate-400 uppercase mb-1",children:"Father / Guardian Number"}),e.jsx("div",{className:"h-5"})]}),e.jsxs("div",{className:"bg-white border-b border-slate-100 pb-2",children:[e.jsx("p",{className:"text-[8px] font-black text-slate-400 uppercase mb-1",children:"Permanent Residential Address"}),e.jsx("div",{className:"h-5"})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h3",{className:"border-l-4 border-slate-300 pl-3 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/30",children:"System Identification"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[8px] font-black text-slate-400 uppercase mb-1",children:"Date of Birth"}),e.jsx("div",{className:"flex gap-1",children:["D","D","/","M","M","/","Y","Y","Y","Y"].map((m,n)=>e.jsx("div",{className:`flex-1 h-7 border border-slate-100 rounded-md bg-white flex items-center justify-center text-[9px] font-black ${m==="/"?"bg-slate-50 border-none":""}`,children:m==="/"?"/":""},n))})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[8px] font-black text-slate-400 uppercase mb-1",children:"CNIC / Bay-Form Number"}),e.jsx("div",{className:"flex gap-1",children:Array.from({length:15}).map((m,n)=>e.jsx("div",{className:`flex-1 h-7 border border-slate-100 bg-white rounded-md flex items-center justify-center text-[10px] font-black ${[5,13].includes(n)?"bg-slate-50 border-none !w-6":""}`,children:[5,13].includes(n)?"-":""},n))})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("p",{className:"text-[8px] font-black text-slate-400 uppercase",children:"Gender:"}),e.jsxs("div",{className:"flex gap-4",children:[e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("div",{className:"w-3.5 h-3.5 border-2 border-slate-200 rounded-lg"})," ",e.jsx("span",{className:"text-[10px] font-black text-slate-600",children:"Male"})]}),e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("div",{className:"w-3.5 h-3.5 border-2 border-slate-200 rounded-lg"})," ",e.jsx("span",{className:"text-[10px] font-black text-slate-600",children:"Female"})]})]})]})]})]})]}),e.jsxs("div",{className:"pt-2",children:[e.jsx("h3",{className:"border-l-4 border-[#830000] pl-3 py-0.5 text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3 bg-slate-50",children:"2. Academic Record"}),e.jsx("div",{className:"border border-slate-100 rounded-2xl overflow-hidden shadow-sm",children:e.jsxs("table",{className:"w-full text-center border-collapse",children:[e.jsx("thead",{className:"bg-[#f8fafc] text-[9px] font-black text-slate-400 uppercase tracking-widest",children:e.jsxs("tr",{children:[e.jsx("th",{className:"py-2.5 px-4 text-left border-r border-slate-100",children:"Examination"}),e.jsx("th",{className:"py-2.5 px-4 border-r border-slate-100",children:"Board / Uni"}),e.jsx("th",{className:"py-2.5 px-4 border-r border-slate-100",children:"Roll No"}),e.jsx("th",{className:"py-2.5 px-4 border-r border-slate-100",children:"Obt Marks"}),e.jsx("th",{className:"py-2.5 px-4 border-r border-slate-100",children:"Total"}),e.jsx("th",{className:"py-2.5 px-4",children:"Year"})]})}),e.jsx("tbody",{className:"text-[11px] font-bold text-slate-700",children:["Matriculation (SSC)","Intermediate (HSSC)"].map((m,n)=>e.jsxs("tr",{className:"border-t border-slate-100 h-8",children:[e.jsx("td",{className:"px-4 text-left border-r border-slate-100 text-slate-400",children:m}),e.jsx("td",{className:"border-r border-slate-100"}),e.jsx("td",{className:"border-r border-slate-100"}),e.jsx("td",{className:"border-r border-slate-100"}),e.jsx("td",{className:"border-r border-slate-100"}),e.jsx("td",{})]},n))})]})})]})]}),e.jsxs("div",{className:"mt-auto pt-8 border-t border-slate-100",children:[e.jsxs("div",{className:"grid grid-cols-3 gap-8 mb-4",children:[e.jsxs("div",{className:"text-center space-y-2",children:[e.jsx("div",{className:"h-[0.5px] bg-slate-300 mx-8"}),e.jsx("p",{className:"text-[9px] font-black text-slate-400 uppercase tracking-widest",children:"Candidate Signature"})]}),e.jsxs("div",{className:"text-center space-y-2",children:[e.jsx("div",{className:"h-[0.5px] bg-slate-300 mx-8"}),e.jsx("p",{className:"text-[9px] font-black text-slate-400 uppercase tracking-widest",children:"Guardian Signature"})]}),e.jsxs("div",{className:"text-center space-y-2",children:[e.jsx("div",{className:"h-[0.5px] bg-slate-300 mx-8"}),e.jsx("p",{className:"text-[9px] font-black text-slate-400 uppercase tracking-widest",children:"Principal / HOD"})]})]}),e.jsxs("div",{className:"flex justify-between items-center text-[7px] font-black text-slate-300 uppercase tracking-[0.4em] pt-4",children:[e.jsx("span",{children:"Official Admission Document"}),e.jsx("span",{children:b.schoolName||"PIONEER'S SUPERIOR"}),e.jsx("span",{children:new Date().toLocaleDateString()})]})]})]})})]})]})},zt=({student:i,onClose:b})=>{const{settings:O}=$e(),[p,m]=o.useState(!1),n=o.useRef(null),C=o.useRef(null),[y,F]=o.useState(!1),M=async()=>{const L=document.querySelectorAll(".id-card-side img"),A=Array.from(L).map(z=>{const s=z;return s.complete?Promise.resolve():new Promise(f=>{s.onload=f,s.onerror=f})});await Promise.all(A)},_=async L=>{const A=L==="front"?n:C;if(!(!A.current||p)){m(!0),F(!0),setTimeout(()=>F(!1),300);try{await M();const z={pixelRatio:5,backgroundColor:void 0,cacheBust:!0,style:{background:L==="front"?"#003366":"#ffffff"}},s=await Ge(A.current,z),f=`${i.name.replace(/\s+/g,"_")}_ID_${L.toUpperCase()}.png`;await gt(s,f,`Student ID Card (${L.toUpperCase()})`)}catch{w.fire({title:"Export Failed",icon:"error"})}finally{m(!1)}}},j=async()=>{if(!(!n.current||!C.current||p)){m(!0),w.fire({title:"Generating PDF...",allowOutsideClick:!1,didOpen:()=>w.showLoading()});try{await M();const L={pixelRatio:3,backgroundColor:void 0},A=await Ge(n.current,L),z=await Ge(C.current,L),s=new Rt({orientation:"portrait",unit:"mm",format:"a4"});s.addImage(A,"PNG",45,20,54,86),s.addImage(z,"PNG",110,20,54,86);const f=`${i.name.replace(/\s+/g,"_")}_ID_Card.pdf`;await ft(s,f,`Student ID Card - ${i.name}`),w.fire({title:"Success!",icon:"success",timer:1500,showConfirmButton:!1})}catch{w.fire({title:"PDF Error",icon:"error"})}finally{m(!1)}}},[q,E]=o.useState("both"),xe=i.gender?.toLowerCase()==="female"?"D/O":"S/O";return Fe.createPortal(e.jsxs("div",{className:"fixed inset-0 z-[150] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-0 sm:p-4 overflow-hidden font-serif",children:[y&&e.jsx("div",{className:"fixed inset-0 z-[300] bg-white animate-flash pointer-events-none"}),e.jsxs("div",{className:"relative w-full h-full sm:h-auto max-h-full sm:max-h-[96vh] sm:max-w-5xl bg-white sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden",children:[e.jsxs("div",{className:"p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/90 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 sm:gap-3 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 sm:w-10 sm:h-10 bg-[#003366] rounded-xl flex items-center justify-center text-yellow-500 font-black text-xs sm:text-base shrink-0 shadow-md",children:"PSS"}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("h2",{className:"text-sm sm:text-lg font-black text-[#003366] uppercase tracking-tight truncate leading-none",children:"Identity Studio"}),e.jsx("p",{className:"text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate",children:i.name})]})]}),e.jsxs("div",{className:"flex items-center gap-1.5 sm:gap-2 shrink-0",children:[e.jsx("button",{onClick:j,disabled:p,className:"px-3 sm:px-5 py-2 bg-[#003366] text-white rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95 flex items-center gap-1",children:"PDF"}),e.jsx("button",{onClick:()=>_("front"),className:"p-2 bg-slate-100 hover:bg-slate-200 text-[#003366] rounded-xl transition-all active:scale-95",title:"Export Front Image",children:e.jsx(st,{className:"w-4 h-4"})}),e.jsx("button",{onClick:()=>_("back"),className:"p-2 bg-slate-100 hover:bg-slate-200 text-[#003366] rounded-xl transition-all active:scale-95",title:"Export Back Image",children:e.jsx(st,{className:"w-4 h-4 text-emerald-700"})}),e.jsx("button",{onClick:b,className:"p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95 shrink-0",children:e.jsx(te,{className:"w-4 h-4 sm:w-5 sm:h-5"})})]})]}),e.jsx("div",{className:"md:hidden px-3 py-2 bg-slate-100 border-b border-slate-200/60 flex items-center justify-center shrink-0",children:e.jsxs("div",{className:"flex bg-white p-0.5 rounded-xl border border-slate-200 shadow-sm w-full max-w-xs",children:[e.jsx("button",{onClick:()=>E("both"),className:`flex-1 py-1 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${q==="both"?"bg-[#003366] text-white shadow-sm":"text-slate-500"}`,children:"Both"}),e.jsx("button",{onClick:()=>E("front"),className:`flex-1 py-1 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${q==="front"?"bg-[#003366] text-white shadow-sm":"text-slate-500"}`,children:"Front"}),e.jsx("button",{onClick:()=>E("back"),className:`flex-1 py-1 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${q==="back"?"bg-[#003366] text-white shadow-sm":"text-slate-500"}`,children:"Back"})]})}),e.jsx("div",{className:"p-3 sm:p-8 flex flex-col items-center justify-start overflow-y-auto bg-slate-50/60 flex-1",children:e.jsxs("div",{className:"flex flex-col lg:flex-row gap-6 md:gap-8 justify-center items-center py-4 px-2 sm:py-8 sm:px-8 bg-white rounded-2xl md:rounded-[2.5rem] shadow-xl border border-slate-100 w-full max-w-4xl shrink-0",children:[e.jsxs("div",{className:`flex flex-col items-center gap-3 transition-all ${q==="back"?"hidden md:flex":"flex"}`,children:[e.jsx("span",{className:"text-[10px] font-black text-slate-400 uppercase tracking-widest",children:"FRONT VIEW"}),e.jsxs("div",{ref:n,className:"id-card-side w-[54mm] h-[86mm] rounded-[5mm] relative overflow-hidden flex flex-col shadow-2xl border-[0.5pt] border-[#003366] shrink-0",style:{backgroundColor:"#003366"},children:[e.jsxs("div",{className:"h-[20mm] bg-white shrink-0 flex items-center justify-between px-3 relative z-10 border-b-[2.5pt] border-yellow-400 rounded-b-[4mm] shadow-lg",children:[e.jsx("div",{className:"w-[10mm] h-[10mm] flex items-center justify-center",children:O?.logo1&&e.jsx("img",{src:O.logo1,className:"w-full h-full object-contain",alt:"L1",crossOrigin:"anonymous"})}),e.jsxs("div",{className:"text-center flex-1 mx-1",children:[e.jsxs("h1",{className:"text-[12.5pt] font-black text-[#003366] uppercase tracking-tighter leading-[1] font-serif",style:{letterSpacing:"-0.3px"},children:["PIONEER'S",e.jsx("br",{}),"SUPERIOR"]}),e.jsx("div",{className:"mt-0.5 h-[0.5pt] w-8 bg-[#003366]/20 mx-auto"})]}),e.jsx("div",{className:"w-[10mm] h-[10mm] flex items-center justify-center",children:O?.logo2&&e.jsx("img",{src:O.logo2,className:"w-full h-full object-contain",alt:"L2",crossOrigin:"anonymous"})})]}),e.jsxs("div",{className:"flex-1 flex flex-col items-center px-5 relative z-10 -mt-2.5",children:[e.jsxs("div",{className:"relative mb-0.5 shrink-0",children:[e.jsx("div",{className:"w-[28mm] h-[28mm] bg-white rounded-full border-[1mm] border-yellow-500 shadow-xl overflow-hidden p-0.5",children:e.jsx("div",{className:"w-full h-full rounded-full overflow-hidden border border-[#003366]/5 shadow-inner",children:i.avatar&&i.avatar.length>5?e.jsx("img",{src:i.avatar,className:"w-full h-full object-cover",crossOrigin:"anonymous"}):e.jsx("div",{className:"w-full h-full flex items-center justify-center text-[#003366] bg-slate-50 font-black text-4xl",children:i.name.charAt(0)})})}),e.jsx("div",{className:"absolute -bottom-1 -right-1 bg-[#003366] border border-yellow-400 px-2 py-0.5 rounded-md shadow-lg",children:e.jsx("p",{className:"text-[5.5pt] font-black text-yellow-400 tracking-tighter whitespace-nowrap",children:"2026-27"})})]}),e.jsxs("div",{className:"text-center w-full mb-0.5 mt-2",children:[e.jsx("h2",{className:"text-[12pt] font-black text-white uppercase leading-none tracking-tight",children:i.name}),e.jsx("div",{className:"mt-1.2 inline-block px-4 py-0.5 bg-yellow-400 text-[#003366] rounded-full",children:e.jsx("p",{className:"text-[5pt] font-black uppercase tracking-widest leading-none",children:"STUDENT IDENTITY"})})]}),e.jsxs("div",{className:"mt-1 w-full space-y-2 pt-1.5 border-t border-white/10",children:[e.jsxs("div",{className:"flex justify-between items-center text-white text-[10pt] font-bold",children:[e.jsx("span",{className:"text-[7pt] font-black text-yellow-500 uppercase tracking-widest",children:"REG NO:"}),e.jsx("span",{children:i.id})]}),e.jsxs("div",{className:"flex justify-between items-center text-white text-[10pt] font-bold",children:[e.jsxs("span",{className:"text-[7pt] font-black text-yellow-500 uppercase tracking-widest",children:[xe,":"]}),e.jsx("span",{className:"uppercase truncate ml-2 flex-1 text-right",children:i.fatherName||"N/A"})]}),e.jsxs("div",{className:"flex justify-between items-center text-white text-[10pt] font-bold",children:[e.jsx("span",{className:"text-[7pt] font-black text-yellow-500 uppercase tracking-widest",children:"CLASS:"}),e.jsx("span",{className:"uppercase",children:i.class?.replace(/class/i,"").trim()||"N/A"})]})]})]}),e.jsx("div",{className:"mt-auto h-2 bg-yellow-400 w-full relative z-10 shrink-0 rounded-t-[3mm]"})]})]}),e.jsxs("div",{className:`flex flex-col items-center gap-3 transition-all ${q==="front"?"hidden md:flex":"flex"}`,children:[e.jsx("span",{className:"text-[10px] font-black text-slate-400 uppercase tracking-widest",children:"BACK VIEW"}),e.jsxs("div",{ref:C,className:"id-card-side w-[54mm] h-[86mm] bg-white rounded-[5mm] relative overflow-hidden flex flex-col shadow-2xl border-[0.5pt] border-slate-200",style:{backgroundColor:"#ffffff"},children:[e.jsx("div",{className:"h-[10mm] bg-white shrink-0 flex items-center justify-center px-4 relative z-10 border-b-[2pt] border-yellow-400 rounded-b-[4mm] shadow-sm",children:e.jsx("div",{className:"bg-[#003366] h-6 w-full rounded-[2.5mm] flex items-center justify-center shadow-inner",children:e.jsx("span",{className:"text-[6.5pt] font-black text-white uppercase tracking-wider",children:"Institutional Property"})})}),e.jsxs("div",{className:"flex-1 flex flex-col px-4 pt-1 pb-1 relative z-10 overflow-hidden",children:[e.jsxs("div",{className:"text-center mb-1 overflow-hidden",children:[e.jsx("h1",{className:"text-[12pt] font-black text-[#dc2626] leading-none uppercase tracking-tighter mb-1 font-serif whitespace-nowrap",style:{fontWeight:900},children:"PIONEER'S SUPERIOR"}),e.jsxs("p",{className:"text-[6.8pt] font-black text-[#003366] uppercase leading-tight tracking-wide",children:["Institute Of High Schooling",e.jsx("br",{}),"& Colleges, Attock"]})]}),e.jsx("div",{className:"pt-1",children:e.jsxs("div",{className:"space-y-2.5 bg-slate-50/50 p-2.5 rounded-[3mm] border border-slate-100 shadow-sm mt-1",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"w-6 h-6 rounded-md bg-[#003366] flex items-center justify-center shrink-0 shadow-sm border border-yellow-400/20",children:e.jsx(Ae,{className:"w-3 h-3 text-yellow-400"})}),e.jsx("p",{className:"text-[6.8pt] font-bold text-slate-800 leading-tight",children:"+92-57-234418, 0334-5930217"})]}),e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"w-6 h-6 rounded-md bg-[#003366] flex items-center justify-center shrink-0 shadow-sm border border-yellow-400/20",children:e.jsx(yt,{className:"w-3 h-3 text-yellow-400"})}),e.jsx("p",{className:"text-[6.8pt] font-bold text-slate-800 leading-tight lowercase",children:"psscc.official@gmail.com"})]}),e.jsxs("div",{className:"flex items-start gap-2.5",children:[e.jsx("div",{className:"w-6 h-6 rounded-md bg-[#003366] flex items-center justify-center shrink-0 shadow-sm border border-yellow-400/20",children:e.jsx(Ue,{className:"w-3 h-3 text-yellow-400"})}),e.jsx("p",{className:"text-[6.2pt] font-bold text-slate-800 uppercase leading-snug tracking-tight",children:"Moh Muhammad Nagar Mirza Road, Attock"})]})]})}),e.jsxs("div",{className:"mt-auto h-[22mm] flex items-center justify-between border-t border-slate-100 pt-2 pb-1 px-1",children:[e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:"p-1 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 shadow-md",style:{width:"46px",height:"46px"},children:e.jsx(Dt,{value:i.id||"ID-001",size:38,level:"M",includeMargin:!1})}),e.jsx("p",{className:"text-[4.8pt] font-black text-slate-400 mt-1 uppercase tracking-widest leading-none",children:"Security ID"})]}),e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("div",{className:"h-6 mb-1 opacity-20",children:e.jsx("span",{className:"text-[11pt] font-serif underline",children:"Signature"})}),e.jsx("div",{className:"h-[1.2pt] w-20 bg-[#003366]/30"}),e.jsx("p",{className:"text-[6.5pt] font-black text-[#003366] uppercase mt-1",children:"Principal"})]})]})]}),e.jsx("div",{className:"h-6 w-full bg-[#003366] flex items-center justify-center shrink-0 border-t-[2pt] border-yellow-400 rounded-t-[4mm]",children:e.jsx("p",{className:"text-[5.8pt] font-black text-yellow-400 uppercase tracking-[0.3em]",children:"Knowledge Is Success"})})]})]})]})})]}),e.jsx("style",{children:`
                .id-card-side { font-family: 'Crimson Pro', serif !important; font-style: normal !important; -webkit-print-color-adjust: exact; }
                .id-card-side * { font-family: 'Crimson Pro', serif !important; font-style: normal !important; }
            `})]}),document.body)},sa=()=>{const{students:i,deleteStudent:b,addStudent:O,settings:p,campuses:m,currentUser:n,bulkUpdateStudents:C,classes:y,reAdmitStudent:F,sendNotification:M}=$e(),_=n?.role==="admin"||n?.permissions?.includes("students_add"),j=n?.role==="admin";if(!(j||n?.permissions?.includes("students_view")||n?.permissions?.includes("students_add")))return null;const[E,xe]=o.useState("All"),[S,L]=o.useState("All"),[A,z]=o.useState(""),[s,f]=o.useState("All"),[g,Q]=o.useState(!1),[K,J]=o.useState(!1),[ae,H]=o.useState(""),[ve,se]=o.useState(null),[je,ie]=o.useState(null),[ke,ne]=o.useState(null),[a,l]=o.useState(!1),[r,x]=o.useState([]),[v,B]=o.useState(!1),[P,U]=o.useState(null),[pe,Re]=o.useState(!1),[Y,Ne]=o.useState(null),[De,_e]=o.useState(""),[Oe,qe]=o.useState("FSc Pre-Medical"),[He,We]=o.useState(3500),[Qe,Ke]=o.useState(0),dt=()=>{const t=`${window.location.origin}/#/apply`;navigator.clipboard.writeText(t),w.fire({title:"🔗 Parent Portal Link Copied!",html:`
                <div class="text-left text-xs space-y-3 font-outfit">
                    <p class="font-bold text-slate-700 dark:text-slate-200">Share this dedicated link with parents via WhatsApp or SMS:</p>
                    <div class="p-3 bg-blue-50 dark:bg-slate-800 rounded-xl font-mono text-blue-600 dark:text-yellow-400 break-all select-all font-bold border border-blue-200 dark:border-white/10">
                        ${t}
                    </div>
                    <div class="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-800 dark:text-emerald-300 font-medium text-[11px] flex items-center gap-2">
                        <span>✅ Parents can fill all details and submit applications directly without accessing your admin portal.</span>
                    </div>
                </div>
            `,icon:"success",confirmButtonColor:"#003366",confirmButtonText:"Done"})},Je=async t=>{const d=await w.fire({title:`Approve ${t.name}?`,text:`Enroll ${t.name} as an Active student in ${t.class}?`,icon:"question",showCancelButton:!0,confirmButtonColor:"#003366",confirmButtonText:"Yes, Approve & Enroll",cancelButtonText:"Review / Edit Form"});if(d.isConfirmed){C([t.id],{status:"Active"});const c=window.location.origin,h=`🎊 *ADMISSION APPROVED* 🎊

Dear Parents,
Congratulations! The admission of *${t.name}* at *${p.schoolName}* has been successfully approved for *${t.class}*.

*--- PORTAL CREDENTIALS ---*
👉 Portal Link: ${c}
👉 Role: Select "Student"
👉 Student ID / Username: *${t.id}*
👉 Password: (Not required, just enter ID)

Please visit the campus for further instructions if any fees are pending. Welcome to the family!`;t.contactFather&&M(t.id,"General",h),w.fire({title:"Admission Approved",text:`${t.name} is now an active student and an automated WhatsApp has been dispatched.`,icon:"success",toast:!0,position:"top-end",showConfirmButton:!1,timer:3e3})}else d.dismiss===w.DismissReason.cancel&&ie(t)},Ze=t=>{const d=y.length>0?y:["1st Year (Boys)","1st Year (Girls)","2nd Year (Boys)","2nd Year (Girls)",...Ee.filter($=>$!=="All")],h=d.filter($=>$.toLowerCase().includes("year")||$.toLowerCase().includes("11th")||$.toLowerCase().includes("12th"))[0]||d[0]||"1st Year (Boys)";Ne(t),_e(h),qe(t.discipline||"FSc Pre-Medical"),We(t.monthlyFees||3500),Ke(0)},ct=async()=>{if(!Y)return;await F(Y.id,De,Oe,He,Qe);const t=Y.name,d=De,c=Oe;Ne(null),w.fire({title:"🎉 Student Re-Enrolled!",text:`${t} is now actively enrolled in ${d} (${c})!`,icon:"success",timer:3500,showConfirmButton:!1,toast:!0,position:"top-end"})},[Z,me]=o.useState(1),[le,xt]=o.useState(25);o.useEffect(()=>{me(1)},[A,s,E,S,le]);const T=o.useMemo(()=>i.filter(t=>{if(n?.role==="teacher"&&n?.inchargeClass&&t.class!==n.inchargeClass)return!1;const d=t.name.toLowerCase().includes(A.toLowerCase())||t.id.toLowerCase().includes(A.toLowerCase())||t.fatherName&&t.fatherName.toLowerCase().includes(A.toLowerCase())||t.contactFather&&t.contactFather.includes(A),c=s==="All"||t.class===s,h=E==="All"?!0:E==="Active"?t.status==="Active":E==="Passed Out"?t.status==="Passed Out"||t.status==="Alumni":E==="Inactive"?t.status==="Inactive":E==="Online Applied"?t.status==="Online Applied"||t.status==="Pending Verification":t.status===E,$=S==="All"||t.campus?.toLowerCase()===S.toLowerCase();return d&&c&&h&&$}),[i,A,s,E,S,n]),he=Math.ceil(T.length/le)||1,oe=T.slice((Z-1)*le,Z*le),Ee=n?.role==="teacher"&&n?.inchargeClass?[n.inchargeClass]:["All",...new Set([...y&&y.length>0?y:[],...i.map(t=>t.class)])],Be=t=>{const d=t.avatar&&t.avatar.length>5,c=document.documentElement.classList.contains("dark");w.fire({padding:"0",background:c?"#0b1120":"#ffffff",color:c?"#f8fafc":"#1e293b",width:"95vw",showConfirmButton:!0,confirmButtonText:"Export PDF Profile",confirmButtonColor:"#003366",showCancelButton:!0,cancelButtonText:"Close",customClass:{popup:"rounded-2xl sm:rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden max-w-4xl w-full",confirmButton:"px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] m-2 sm:m-4 shadow-xl shadow-[#003366]/20 transition-all hover:scale-105",cancelButton:"px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] m-2 sm:m-4 border-2 border-slate-100 dark:border-white/5 transition-all hover:bg-slate-50 dark:hover:bg-white/5",htmlContainer:"!m-0 !p-0 !overflow-x-hidden"},html:`
                <div class="font-outfit text-left overflow-y-auto max-h-[80vh]">
                    <!-- Hero Banner -->
                    <div class="relative bg-gradient-to-br from-[#003366] to-blue-900 overflow-hidden p-4 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8 text-center sm:text-left">
                        <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <div class="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                        
                        <div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                            <div class="relative group shrink-0">
                                <div class="absolute -inset-1.5 bg-white/20 blur-xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                ${d?`
                                    <div class="relative w-20 h-20 sm:w-32 sm:h-32 rounded-2xl sm:rounded-[2.5rem] border-4 border-white overflow-hidden shadow-2xl">
                                        <img src="${t.avatar}" class="w-full h-full object-cover" />
                                    </div>
                                `:`
                                    <div class="relative w-20 h-20 sm:w-32 sm:h-32 rounded-2xl sm:rounded-[2.5rem] bg-white text-[#003366] flex items-center justify-center text-3xl sm:text-5xl font-black shadow-2xl">
                                        ${t.name.charAt(0)}
                                    </div>
                                `}
                            </div>
                            <div>
                                <h1 class="text-xl sm:text-3xl font-black text-white tracking-tighter uppercase mb-1">${t.name}</h1>
                                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    <span class="px-3 py-1 bg-yellow-400 text-[#003366] rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                                        ID: ${t.id}
                                    </span>
                                    <span class="px-3 py-1 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                                        ${t.status} Student
                                    </span>
                                    <span class="px-3 py-1 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] sm:hidden">
                                        ${t.campus||"Main Campus"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="relative z-10 text-right hidden md:block">
                            <p class="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2 text-right">Campus</p>
                            <h2 class="text-xl font-black text-white uppercase tracking-wider">${t.campus||"Main Campus"}</h2>
                        </div>
                    </div>

                    <div class="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 bg-slate-50 dark:bg-slate-900/50">
                        <!-- Left Column: Personal Info -->
                        <div class="space-y-4 sm:space-y-6">
                            <div class="p-4 sm:p-6 bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                                <h4 class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                    Personal Identity
                                </h4>
                                <div class="space-y-3.5 sm:space-y-4">
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Date of Birth</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${t.dob||"N/A"}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Gender</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${t.gender||"N/A"}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Religion</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${t.religion||"Islam"}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">CNIC / B-Form</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${t.cnic||"N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Center Column: Family & Contact -->
                        <div class="space-y-4 sm:space-y-6">
                            <div class="p-4 sm:p-6 bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm h-full">
                                <h4 class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                                    Family Details
                                </h4>
                                <div class="space-y-3.5 sm:space-y-4">
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Father's Name</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${t.fatherName||"N/A"}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Occupation</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${t.fatherOccupation||"N/A"}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Guardian Contact</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${t.contactFather||"N/A"}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">WhatsApp Number</p>
                                        <p class="text-xs sm:text-sm font-bold text-emerald-600">${t.whatsappNumber||"N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column: Academic & Contact -->
                        <div class="space-y-4 sm:space-y-6">
                            <div class="p-4 sm:p-6 bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                                <h4 class="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                                    Academic Status
                                </h4>
                                <div class="space-y-3.5 sm:space-y-4">
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Current Class</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${t.class}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Performance</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${t.performance||"Good"}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Admission Date</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">${t.admissionDate||"N/A"}</p>
                                    </div>
                                    <div class="group">
                                        <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Monthly Tuition</p>
                                        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white italic">Rs. ${t.monthlyFees?.toLocaleString()||"N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Full Width Address -->
                        <div class="col-span-full">
                            <div class="p-4 sm:p-6 bg-white dark:bg-white/5 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                                <h4 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    Residential Address
                                </h4>
                                <p class="text-xs font-bold text-slate-800 dark:text-white leading-relaxed">
                                    ${t.address||"No registered address on file."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `}).then(h=>{if(h.isConfirmed){const $=t.avatar&&t.avatar.length>5,re=(t.academicRecords||[]).map(R=>`
                    <tr>
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800; text-transform: uppercase;">${R.degree||"N/A"}</td>
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 700;">${R.board||"BISE / School"}</td>
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 800;">${R.passingYear||"N/A"}</td>
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700;">${R.totalMarks||"1100"}</td>
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 800; color: #003366;">${R.marksObtained||"-"}</td>
                        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 900; color: #059669;">${R.percentage||"-"}</td>
                    </tr>
                `).join(""),de=`
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <title>Official Student Profile - ${t.name} (${t.id})</title>
                            <style>
                                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
                                
                                @page {
                                    size: A4 portrait;
                                    margin: 6mm 8mm;
                                }
                                
                                * {
                                    box-sizing: border-box;
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                }
                                
                                body {
                                    font-family: 'Outfit', sans-serif;
                                    margin: 0;
                                    padding: 0;
                                    background: #f1f5f9;
                                    color: #0f172a;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                }
                                
                                .no-print-bar {
                                    width: 100%;
                                    max-width: 210mm;
                                    padding: 12px 20px;
                                    background: #003366;
                                    color: #fff;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                                    margin-bottom: 12px;
                                    border-radius: 0 0 16px 16px;
                                }
                                
                                .btn-print {
                                    background: #f59e0b;
                                    color: #003366;
                                    border: none;
                                    padding: 8px 20px;
                                    font-size: 11px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                                }
                                
                                .btn-close {
                                    background: rgba(255,255,255,0.15);
                                    color: #fff;
                                    border: 1px solid rgba(255,255,255,0.2);
                                    padding: 8px 16px;
                                    font-size: 11px;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    border-radius: 8px;
                                    cursor: pointer;
                                }
                                
                                .sheet {
                                    width: 210mm;
                                    box-sizing: border-box;
                                    background: #ffffff;
                                    padding: 16px 22px;
                                    margin: 0 auto;
                                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                                    border-radius: 4px;
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: space-between;
                                }
                                
                                /* Header Banner */
                                .header-strip {
                                    background: linear-gradient(135deg, #003366 0%, #001a33 100%);
                                    border-radius: 14px;
                                    padding: 12px 18px;
                                    color: #fff;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    border-bottom: 3px solid #f59e0b;
                                }
                                
                                .header-left {
                                    display: flex;
                                    align-items: center;
                                    gap: 14px;
                                }
                                
                                .school-logo {
                                    width: 52px;
                                    height: 52px;
                                    background: #ffffff;
                                    border-radius: 10px;
                                    padding: 4px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                                }
                                
                                .school-logo img {
                                    max-width: 100%;
                                    max-height: 100%;
                                    object-fit: contain;
                                }
                                
                                .school-title {
                                    font-size: 18px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: -0.3px;
                                    margin: 0;
                                    line-height: 1.1;
                                    color: #ffffff;
                                }
                                
                                .school-subtitle {
                                    font-size: 8.5px;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    letter-spacing: 1.5px;
                                    opacity: 0.8;
                                    margin-top: 3px;
                                    color: #93c5fd;
                                }
                                
                                .header-badge {
                                    text-align: right;
                                }
                                
                                .badge-title {
                                    font-size: 7.5px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 1.5px;
                                    color: #f59e0b;
                                }
                                
                                .badge-session {
                                    font-size: 13px;
                                    font-weight: 900;
                                    color: #ffffff;
                                    letter-spacing: 0.5px;
                                    margin-top: 2px;
                                }
                                
                                /* Profile Card */
                                .profile-bar {
                                    margin-top: 12px;
                                    background: #f8fafc;
                                    border: 1.5px solid #e2e8f0;
                                    border-radius: 14px;
                                    padding: 10px 14px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    gap: 16px;
                                }
                                
                                .profile-left {
                                    display: flex;
                                    align-items: center;
                                    gap: 14px;
                                }
                                
                                .avatar-box {
                                    width: 72px;
                                    height: 72px;
                                    border-radius: 12px;
                                    border: 2.5px solid #003366;
                                    overflow: hidden;
                                    background: #ffffff;
                                    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 28px;
                                    font-weight: 900;
                                    color: #003366;
                                    flex-shrink: 0;
                                }
                                
                                .avatar-box img {
                                    width: 100%;
                                    height: 100%;
                                    object-fit: cover;
                                }
                                
                                .name-area h2 {
                                    margin: 0;
                                    font-size: 19px;
                                    font-weight: 900;
                                    color: #003366;
                                    text-transform: uppercase;
                                    letter-spacing: -0.3px;
                                    line-height: 1.1;
                                }
                                
                                .pills-row {
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    margin-top: 5px;
                                    flex-wrap: wrap;
                                }
                                
                                .pill {
                                    padding: 2.5px 8px;
                                    border-radius: 6px;
                                    font-size: 8px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                }
                                
                                .pill-id { background: #f59e0b; color: #003366; }
                                .pill-class { background: #003366; color: #ffffff; }
                                .pill-campus { background: #e0e7ff; color: #3730a3; }
                                .pill-status { background: #dcfce7; color: #15803d; }
                                .pill-alumni { background: #f3e8ff; color: #7e22ce; }
                                
                                .profile-right-meta {
                                    text-align: right;
                                    border-left: 1.5px dashed #cbd5e1;
                                    padding-left: 14px;
                                    flex-shrink: 0;
                                }
                                
                                .meta-label {
                                    font-size: 7px;
                                    font-weight: 800;
                                    text-transform: uppercase;
                                    color: #64748b;
                                    letter-spacing: 1px;
                                }
                                
                                .meta-val {
                                    font-size: 11px;
                                    font-weight: 900;
                                    color: #003366;
                                    margin-top: 1px;
                                }
                                
                                /* 2-Column Info Grid */
                                .data-grid {
                                    display: grid;
                                    grid-template-columns: 1fr 1fr;
                                    gap: 10px;
                                    margin-top: 10px;
                                }
                                
                                .section-card {
                                    background: #ffffff;
                                    border: 1.5px solid #e2e8f0;
                                    border-radius: 12px;
                                    padding: 8px 12px;
                                }
                                
                                .section-head {
                                    font-size: 9px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                    color: #003366;
                                    border-bottom: 1.5px solid #f1f5f9;
                                    padding-bottom: 5px;
                                    margin-bottom: 6px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                }
                                
                                .field-table {
                                    width: 100%;
                                    border-collapse: collapse;
                                }
                                
                                .field-table tr td {
                                    padding: 2.5px 0;
                                    font-size: 9.5px;
                                    vertical-align: top;
                                }
                                
                                .field-label {
                                    width: 42%;
                                    color: #64748b;
                                    font-weight: 800;
                                    text-transform: uppercase;
                                    font-size: 7.5px;
                                    letter-spacing: 0.3px;
                                }
                                
                                .field-value {
                                    color: #0f172a;
                                    font-weight: 800;
                                    font-size: 9.5px;
                                }
                                
                                /* Address Box */
                                .address-card {
                                    margin-top: 10px;
                                    background: #f8fafc;
                                    border: 1.5px solid #e2e8f0;
                                    border-radius: 10px;
                                    padding: 8px 12px;
                                }
                                
                                .address-card h4 {
                                    margin: 0 0 3px 0;
                                    font-size: 8px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                    color: #64748b;
                                }
                                
                                .address-card p {
                                    margin: 0;
                                    font-size: 9.5px;
                                    font-weight: 700;
                                    color: #1e293b;
                                    line-height: 1.35;
                                }
                                
                                /* Academic Table */
                                .academic-table-wrap {
                                    margin-top: 10px;
                                }
                                
                                .academic-table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    font-size: 8.5px;
                                }
                                
                                .academic-table th {
                                    background: #003366;
                                    color: #fff;
                                    padding: 5px 8px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                    border: 1px solid #003366;
                                }
                                
                                /* Signatures Footer */
                                .signatures-row {
                                    margin-top: 16px;
                                    display: flex;
                                    align-items: flex-end;
                                    justify-content: space-between;
                                    padding-top: 12px;
                                    border-top: 1.5px dashed #cbd5e1;
                                }
                                
                                .sig-box {
                                    width: 28%;
                                    text-align: center;
                                }
                                
                                .sig-line {
                                    border-bottom: 1.5px solid #475569;
                                    margin-bottom: 4px;
                                    height: 24px;
                                }
                                
                                .sig-title {
                                    font-size: 7.5px;
                                    font-weight: 900;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                    color: #003366;
                                }
                                
                                .sig-sub {
                                    font-size: 6.5px;
                                    font-weight: 700;
                                    color: #64748b;
                                    text-transform: uppercase;
                                }
                                
                                .footer-notice {
                                    margin-top: 10px;
                                    background: #003366;
                                    color: #ffffff;
                                    border-radius: 8px;
                                    padding: 6px 12px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    font-size: 7.5px;
                                    font-weight: 700;
                                }
                                
                                @media print {
                                    body {
                                        background: #ffffff !important;
                                        padding: 0 !important;
                                    }
                                    .no-print-bar {
                                        display: none !important;
                                    }
                                    .sheet {
                                        box-shadow: none !important;
                                        border: none !important;
                                        padding: 0 !important;
                                        width: 100% !important;
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="no-print-bar">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">Student Dossier Print Preview</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <button class="btn-print" onclick="window.print()">
                                        🖨️ Print / Save as PDF
                                    </button>
                                    <button class="btn-close" onclick="window.close()">
                                        Close
                                    </button>
                                </div>
                            </div>

                            <div class="sheet">
                                <div>
                                    <!-- Header Strip -->
                                    <div class="header-strip">
                                        <div class="header-left">
                                            <div class="school-logo">
                                                ${p.logo1||p.logo2?`
                                                    <img src="${p.logo1||p.logo2}" alt="Logo" />
                                                `:`
                                                    <span style="font-size: 24px; font-weight: 900; color: #003366;">PS</span>
                                                `}
                                            </div>
                                            <div>
                                                <h1 class="school-title">${p.schoolName||"PIONEER'S SUPERIOR EDUCATION SYSTEM"}</h1>
                                                <p class="school-subtitle">${p.subTitle||p.location||"INSTITUTE OF HIGHER SECONDARY EDUCATION"}</p>
                                            </div>
                                        </div>
                                        <div class="header-badge">
                                            <div class="badge-title">OFFICIAL DOSSIER</div>
                                            <div class="badge-session">SESSION: ${p.academicSession||"2024 - 2025"}</div>
                                        </div>
                                    </div>

                                    <!-- Profile Hero -->
                                    <div class="profile-bar">
                                        <div class="profile-left">
                                            <div class="avatar-box">
                                                ${$?`<img src="${t.avatar}" alt="${t.name}" />`:`<span>${t.name.charAt(0)}</span>`}
                                            </div>
                                            <div class="name-area">
                                                <h2>${t.name}</h2>
                                                <div class="pills-row">
                                                    <span class="pill pill-id">ID: ${t.id}</span>
                                                    <span class="pill pill-class">CLASS: ${t.class}</span>
                                                    <span class="pill pill-campus">${t.campus||"Main Campus"}</span>
                                                    <span class="pill ${t.status==="Passed Out"?"pill-alumni":"pill-status"}">
                                                        ${t.status==="Passed Out"?"🎓 Passed Out":t.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="profile-right-meta">
                                            <div class="meta-label">Enrollment Date</div>
                                            <div class="meta-val">${t.admissionDate||"On Record"}</div>
                                            <div class="meta-label" style="margin-top: 4px;">Monthly Tuition</div>
                                            <div class="meta-val" style="color: #059669;">Rs. ${t.monthlyFees?.toLocaleString()||"N/A"}</div>
                                        </div>
                                    </div>

                                    <!-- 4-Grid Data -->
                                    <div class="data-grid">
                                        <!-- Box 1: Personal -->
                                        <div class="section-card">
                                            <div class="section-head">
                                                <span>Personal Identity</span>
                                                <span style="color: #64748b; font-size: 7.5px;">Identity Card</span>
                                            </div>
                                            <table class="field-table">
                                                <tr><td class="field-label">Full Name</td><td class="field-value">${t.name}</td></tr>
                                                <tr><td class="field-label">Gender</td><td class="field-value">${t.gender||"N/A"}</td></tr>
                                                <tr><td class="field-label">Date of Birth</td><td class="field-value">${t.dob||"N/A"}</td></tr>
                                                <tr><td class="field-label">CNIC / B-Form</td><td class="field-value">${t.cnic||"N/A"}</td></tr>
                                                <tr><td class="field-label">Religion</td><td class="field-value">${t.religion||"Islam"}</td></tr>
                                                <tr><td class="field-label">Nationality</td><td class="field-value">${t.nationality||"Pakistani"}</td></tr>
                                            </table>
                                        </div>

                                        <!-- Box 2: Academic Status -->
                                        <div class="section-card">
                                            <div class="section-head">
                                                <span>Academic Enrollment</span>
                                                <span style="color: #64748b; font-size: 7.5px;">Program Detail</span>
                                            </div>
                                            <table class="field-table">
                                                <tr><td class="field-label">Current Class</td><td class="field-value" style="color: #003366;">${t.class}</td></tr>
                                                <tr><td class="field-label">Assigned Campus</td><td class="field-value">${t.campus||"Main Campus"}</td></tr>
                                                <tr><td class="field-label">Discipline/Stream</td><td class="field-value">${t.discipline||"General Studies"}</td></tr>
                                                <tr><td class="field-label">Academic Status</td><td class="field-value">${t.status}</td></tr>
                                                <tr><td class="field-label">Roll Number / ID</td><td class="field-value">${t.manualId||t.id}</td></tr>
                                                <tr><td class="field-label">Admission Year</td><td class="field-value">${t.admissionDate?new Date(t.admissionDate).getFullYear():"2024"}</td></tr>
                                            </table>
                                        </div>

                                        <!-- Box 3: Family Info -->
                                        <div class="section-card">
                                            <div class="section-head">
                                                <span>Family & Guardianship</span>
                                                <span style="color: #64748b; font-size: 7.5px;">Guardian Detail</span>
                                            </div>
                                            <table class="field-table">
                                                <tr><td class="field-label">Father Name</td><td class="field-value">${t.fatherName||"N/A"}</td></tr>
                                                <tr><td class="field-label">Father Occupation</td><td class="field-value">${t.fatherOccupation||"N/A"}</td></tr>
                                                <tr><td class="field-label">Monthly Income</td><td class="field-value">${t.monthlyIncome?`Rs. ${Number(t.monthlyIncome).toLocaleString()}`:"N/A"}</td></tr>
                                                <tr><td class="field-label">Guardian Status</td><td class="field-value">${t.isOrphan?"Orphan Student":"Father / Guardian Active"}</td></tr>
                                                <tr><td class="field-label">Emergency Phone</td><td class="field-value">${t.contactFather||"N/A"}</td></tr>
                                            </table>
                                        </div>

                                        <!-- Box 4: Contact & Communication -->
                                        <div class="section-card">
                                            <div class="section-head">
                                                <span>Contact & Communication</span>
                                                <span style="color: #64748b; font-size: 7.5px;">Contact Numbers</span>
                                            </div>
                                            <table class="field-table">
                                                <tr><td class="field-label">Primary Mobile</td><td class="field-value" style="color: #003366;">${t.contactSelf||t.contactFather||"N/A"}</td></tr>
                                                <tr><td class="field-label">Father Contact</td><td class="field-value">${t.contactFather||"N/A"}</td></tr>
                                                <tr><td class="field-label">WhatsApp Number</td><td class="field-value" style="color: #059669;">${t.whatsappNumber||t.contactFather||"N/A"}</td></tr>
                                                <tr><td class="field-label">Email Address</td><td class="field-value">${t.email||"N/A"}</td></tr>
                                                <tr><td class="field-label">Emergency Contact</td><td class="field-value">${t.contactFather||"N/A"}</td></tr>
                                            </table>
                                        </div>
                                    </div>

                                    <!-- Address -->
                                    <div class="address-card">
                                        <h4>Permanent / Residential Address</h4>
                                        <p>${t.address||"No registered residential address recorded on file."}</p>
                                    </div>

                                    <!-- Academic History if exists -->
                                    ${(t.academicRecords||[]).length>0?`
                                        <div class="academic-table-wrap">
                                            <div style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #003366; margin-bottom: 4px;">
                                                Prior Academic Credentials & Examination History
                                            </div>
                                            <table class="academic-table">
                                                <thead>
                                                    <tr>
                                                        <th>Degree / Class</th>
                                                        <th>Board / School</th>
                                                        <th style="text-align: center;">Passing Year</th>
                                                        <th style="text-align: center;">Total Marks</th>
                                                        <th style="text-align: center;">Obtained</th>
                                                        <th style="text-align: center;">Percentage</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${re}
                                                </tbody>
                                            </table>
                                        </div>
                                    `:""}
                                </div>

                                <div>
                                    <!-- Signatures Block -->
                                    <div class="signatures-row">
                                        <div class="sig-box">
                                            <div class="sig-line"></div>
                                            <div class="sig-title">Class In-Charge</div>
                                            <div class="sig-sub">Verified & Recorded</div>
                                        </div>
                                        <div class="sig-box">
                                            <div class="sig-line"></div>
                                            <div class="sig-title">Accounts Officer</div>
                                            <div class="sig-sub">Fee Verification & Stamp</div>
                                        </div>
                                        <div class="sig-box">
                                            <div class="sig-line"></div>
                                            <div class="sig-title">Principal / Controller</div>
                                            <div class="sig-sub">Official Signature & Seal</div>
                                        </div>
                                    </div>

                                    <!-- Footer Strip -->
                                    <div class="footer-notice">
                                        <div>
                                            CONFIDENTIAL OFFICIAL RECORD • ${p.schoolName||"TIMES'S PUBLIC SCHOOL"}
                                        </div>
                                        <div>
                                            GENERATED ON: ${new Date().toLocaleDateString("en-GB")}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <script>
                                window.addEventListener('load', function() {
                                    setTimeout(function() {
                                        window.print();
                                    }, 600);
                                });
                            <\/script>
                        </body>
                    </html>
                `;try{const R=window.open("","_blank");if(R&&R.document)R.document.write(de),R.document.close();else{const I=document.createElement("iframe");I.style.position="fixed",I.style.right="0",I.style.bottom="0",I.style.width="0",I.style.height="0",I.style.border="0",document.body.appendChild(I);const k=I.contentWindow?.document;k&&(k.open(),k.write(de),k.close(),setTimeout(()=>{I.contentWindow?.focus(),I.contentWindow?.print(),setTimeout(()=>{try{document.body.removeChild(I)}catch{}},3e3)},600))}}catch(R){console.error("Print Error:",R)}}})},pt=async()=>{if(r.length===0)return;const t=y.map(h=>`<option value="${h}">${h}</option>`).join(""),d=m.map(h=>`<option value="${h.name}">${h.name}</option>`).join(""),c=await w.fire({title:"Bulk Migrate Students",html:`
                <div class="flex flex-col gap-4 text-left">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select New Class</label>
                        <select id="migrate-class" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
                            <option value="">Select a class...</option>
                            ${t}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Update Campus (Optional)</label>
                        <select id="migrate-campus" class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
                            <option value="">Keep Same Campus</option>
                            ${d}
                        </select>
                    </div>
                </div>
            `,focusConfirm:!1,showCancelButton:!0,confirmButtonText:"Migrate Students",confirmButtonColor:"var(--brand-primary)",preConfirm:()=>{const h=document.getElementById("migrate-class").value,$=document.getElementById("migrate-campus").value;return h?{targetClass:h,targetCampus:$}:(w.showValidationMessage("Please select a target class"),!1)}});if(c.isConfirmed&&c.value){const h={class:c.value.targetClass};c.value.targetCampus&&(h.campus=c.value.targetCampus),C(r,h),x([]),w.fire({title:"Migration Complete",text:`${r.length} students migrated successfully.`,icon:"success",toast:!0,position:"top-end",timer:3e3,showConfirmButton:!1})}},mt=()=>{r.length!==0&&w.fire({title:`Delete ${r.length} Records?`,text:"Are you sure you want to remove the selected students? This action cannot be undone.",icon:"warning",showCancelButton:!0,confirmButtonColor:"#d33",confirmButtonText:"Yes, Delete All",cancelButtonText:"Cancel"}).then(t=>{t.isConfirmed&&(r.forEach(d=>b(d)),x([]),w.fire({title:"Records Deleted",text:"The selected students have been removed.",icon:"success",toast:!0,position:"top-end",timer:3e3,showConfirmButton:!1}))})},et=(t,d)=>{w.fire({title:"Delete Student Record?",text:`Are you sure you want to remove ${d} from the school records? This cannot be undone.`,icon:"warning",showCancelButton:!0,confirmButtonColor:"#d33",cancelButtonColor:"#475569",confirmButtonText:"Yes, Delete Record",cancelButtonText:"Cancel",customClass:{title:"font-outfit font-black uppercase tracking-tight text-lg",htmlContainer:"font-outfit text-sm"}}).then(c=>{c.isConfirmed&&(b(t),w.fire({title:"Record Removed",text:"The student record has been deleted from the system.",icon:"success",confirmButtonColor:"var(--brand-primary)"}))})},ht=t=>{const d=t.target.files?.[0];if(!d)return;const c=new FileReader;c.onload=h=>{const re=(h.target?.result).split(`
`);if(re.length<2)return;const de=re[0].split(",").map(k=>k.trim().toLowerCase().replace(/ /g,"")),R=re.slice(1).filter(k=>k.trim());(async()=>{for(const k of R){const ye=[];let Me=!1,Ce="";for(let u=0;u<k.length;u++){const ue=k[u];ue==='"'?Me=!Me:ue===","&&!Me?(ye.push(Ce),Ce=""):Ce+=ue}ye.push(Ce);const bt=ye.map(u=>u.trim().replace(/^"|"$/g,"").replace(/""/g,'"')),G={};de.forEach((u,ue)=>{const X=bt[ue]||"";u==="id"||u==="srno"||u==="sid"||u==="admno"||u==="regno"||u==="reg#"||u==="sr#"?G.id=X:u==="name"||u==="studentname"?G.name=X:u==="fathername"||u==="fname"?G.fatherName=X:u==="class"||u==="grade"?G.class=X:u==="campus"?G.campus=X:u==="discipline"?G.discipline=X:u==="status"?G.status=X:u==="contactself"||u==="mobile"||u==="phone"?G.contactSelf=X:u==="admissiondate"?G.admissionDate=X:u==="address"?G.address=X:u==="manualid"&&(G.manualId=X)}),G.name&&G.class&&await O(G)}w.fire({title:"Import Successful",text:"Student records have been imported.",icon:"success",timer:2e3,showConfirmButton:!1})})(),t.target.value=""},c.readAsText(d)},ut=t=>{const d=t.trim();z(d),l(!1)};return e.jsxs("div",{className:"space-y-4 md:space-y-6 animate-fade-in font-outfit pb-10",children:[e.jsxs("div",{className:"relative overflow-hidden bg-gradient-to-br from-brand-primary to-brand-primary/80 dark:from-brand-primary/20 dark:to-brand-primary/10 rounded-[var(--brand-radius,1.5rem)] md:rounded-[var(--brand-radius,2.5rem)] p-3 sm:p-4 md:p-6 shadow-2xl border border-white/5",children:[e.jsx("div",{className:"absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"}),e.jsxs("div",{className:"relative flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6",children:[e.jsxs("div",{className:"flex items-center gap-3 md:gap-4",children:[e.jsx("div",{className:"hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl items-center justify-center border border-white/10 backdrop-blur-xl shrink-0",children:e.jsx(Xe,{className:"w-5 h-5 md:w-6 md:h-6 text-white"})}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-none",children:"Student Management"}),e.jsx("p",{className:"text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 md:mt-1.5",children:"Manage and record student data"})]})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[e.jsxs("div",{className:"flex items-center bg-black/30 backdrop-blur-xl p-1 rounded-xl border border-white/10",children:[e.jsxs("button",{onClick:()=>{r.length===T.length&&T.length>0?x([]):x(T.map(t=>t.id))},className:"px-4 py-2 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 group",children:[e.jsx("div",{className:D("w-3.5 h-3.5 rounded-md border-2 flex items-center justify-center transition-all",r.length===T.length&&T.length>0?"bg-white border-white text-brand-primary":"border-white/30 group-hover:border-white"),children:r.length===T.length&&T.length>0&&e.jsx(Se,{className:"w-2.5 h-2.5"})}),e.jsx("span",{className:"text-[9px] font-black uppercase tracking-widest text-white/90",children:"Select All"})]}),e.jsx("div",{className:"w-[1px] h-4 bg-white/10 mx-1"}),j&&e.jsxs("button",{onClick:mt,disabled:r.length===0,className:D("px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",r.length>0?"bg-rose-500 text-white shadow-lg":"text-white/20 cursor-not-allowed"),children:["Delete ",r.length>0&&`(${r.length})`]}),r.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-[1px] h-4 bg-white/10 mx-1"}),e.jsxs("button",{onClick:pt,className:"px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2",children:[e.jsx(Ct,{className:"w-3.5 h-3.5"})," Migrate (",r.length,")"]}),e.jsx("div",{className:"w-[1px] h-4 bg-white/10 mx-1"}),e.jsxs("button",{onClick:()=>Re(!0),className:"px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2",children:[e.jsx(St,{className:"w-3.5 h-3.5"})," Vouchers (",r.length,")"]})]})]}),e.jsxs("div",{className:"flex w-full sm:w-auto items-center gap-2",children:[e.jsxs("button",{onClick:dt,title:"Copy Parent Online Admission Link for WhatsApp",className:"flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-1.5 md:gap-2",children:[e.jsx(At,{className:"w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-300"}),"Parent Link"]}),_&&e.jsxs("button",{onClick:()=>J(!0),className:"flex-1 sm:flex-none px-3 py-2 md:px-5 md:py-3 bg-white text-brand-primary rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-1.5 md:gap-2 group",children:[e.jsx(we,{className:"w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-90 transition-transform"}),"Add Student"]})]})]})]}),e.jsxs("div",{className:"mt-4 pt-4 md:mt-8 md:pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4",children:[e.jsx("div",{className:"flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0",children:e.jsx("div",{className:"flex bg-black/20 p-1 rounded-xl border border-white/5 shrink-0",children:["All","Active","Online Applied","Passed Out","Inactive"].map(t=>{const d=t==="Online Applied"?i.filter(c=>c.status==="Online Applied"||c.status==="Pending Verification").length:0;return e.jsxs("button",{onClick:()=>xe(t),className:D("px-3.5 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg flex items-center gap-1.5",E===t?"bg-white text-brand-primary shadow-lg":"text-white/40 hover:text-white"),children:[t==="Passed Out"&&e.jsx("span",{children:"🎓"}),t==="Online Applied"&&e.jsx("span",{children:"🌐"}),e.jsx("span",{children:t}),d>0&&e.jsx("span",{className:"px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black animate-pulse",children:d})]},t)})})}),j&&e.jsxs("div",{className:"flex items-center gap-2 w-full md:w-auto",children:[e.jsx("input",{type:"file",id:"import-registry-input",className:"hidden",accept:".csv",onChange:ht}),e.jsxs("button",{onClick:()=>document.getElementById("import-registry-input")?.click(),className:"flex-1 md:flex-none px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white/70 hover:text-white transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest",children:[e.jsx(we,{className:"w-3.5 h-3.5"})," Import"]}),e.jsxs("button",{onClick:async()=>{const t={All:"All Classes",...Object.fromEntries(Ee.filter(c=>c!=="All").map(c=>[c,c]))},{value:d}=await w.fire({title:"Export Registry",text:"Select a class to export records",input:"select",inputOptions:t,inputPlaceholder:"Choose class...",showCancelButton:!0,confirmButtonText:"Export CSV",confirmButtonColor:"var(--brand-primary)"});if(d){const c=d==="All"?T:T.filter(k=>k.class===d);if(c.length===0){w.fire({title:"No Data",text:`There are no records to export for ${d}.`,icon:"info"});return}const re=[["ID","Name","Father Name","Class","Campus","Discipline","Status","Contact Self","Admission Date","Address"].join(","),...c.map(k=>[`"	${k.id}"`,`"${(k.name||"").replace(/"/g,'""')}"`,`"${(k.fatherName||"").replace(/"/g,'""')}"`,`"${(k.class||"").replace(/"/g,'""')}"`,`"${(k.campus||"").replace(/"/g,'""')}"`,`"${(k.discipline||"General").replace(/"/g,'""')}"`,`"${k.status}"`,`"	${(k.contactSelf||"").replace(/"/g,'""')}"`,`"	${(k.admissionDate||"").replace(/"/g,'""')}"`,`"${(k.address||"").replace(/"/g,'""')}"`].join(","))].join(`
`),de=new Blob([re],{type:"text/csv;charset=utf-8;"}),R=URL.createObjectURL(de),I=document.createElement("a");I.setAttribute("href",R),I.setAttribute("download",`Student_Records_${d.replace(/\s+/g,"_")}_${new Date().toLocaleDateString().replace(/\//g,"-")}.csv`),I.style.visibility="hidden",document.body.appendChild(I),I.click(),document.body.removeChild(I)}},className:"flex-1 md:flex-none px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white/70 hover:text-white transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest",children:[e.jsx(Pt,{className:"w-3.5 h-3.5"})," Export"]})]})]})]}),e.jsxs("div",{className:"glass-card flex flex-col md:flex-row items-stretch md:items-center gap-3 px-4 py-3 rounded-2xl md:rounded-3xl -mt-6 mx-2 md:mx-0 relative z-30 shadow-2xl border border-white/10 bg-white/90 dark:bg-[#001a33]/90 backdrop-blur-xl",children:[e.jsxs("div",{className:"relative flex-1 group",children:[e.jsx(nt,{className:"absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary dark:group-focus-within:text-brand-accent transition-colors"}),e.jsx("input",{type:"text",value:A,onChange:t=>z(t.target.value),placeholder:"Scan or type ID / Name...",className:"w-full pl-11 pr-32 py-3 bg-slate-50 dark:bg-[#000d1a] border border-slate-100 dark:border-white/5 rounded-xl md:rounded-2xl text-[13px] font-bold outline-none focus:ring-4 ring-blue-500/5 focus:bg-white dark:focus:bg-[#000d1a] transition-all placeholder:text-slate-400 dark:placeholder:text-white/10"}),e.jsxs("div",{className:"absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5",children:[A&&e.jsx("button",{onClick:()=>z(""),className:"p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors",children:e.jsx(te,{className:"w-3.5 h-3.5 text-slate-400"})}),e.jsxs("button",{onClick:()=>l(!0),className:"px-3 py-1.5 bg-brand-primary dark:bg-brand-accent text-white dark:text-[#000816] rounded-lg shadow-lg shadow-brand-primary/20 dark:shadow-brand-accent/10 transition-all active:scale-95 font-black text-[9px] uppercase tracking-widest flex items-center gap-2",children:[e.jsx(ge,{className:"w-3.5 h-3.5"})," ",e.jsx("span",{className:"hidden sm:inline",children:"Scanner"})]})]})]}),e.jsxs("div",{className:"flex items-center gap-2 w-full md:w-auto",children:[e.jsxs("select",{value:S,onChange:t=>L(t.target.value),className:"bg-slate-50 dark:bg-[#000d1a] border border-slate-100 dark:border-white/5 rounded-xl md:rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-blue-500 w-full md:min-w-[150px] cursor-pointer appearance-none hover:bg-white dark:hover:bg-white/5 transition-colors",children:[e.jsx("option",{value:"All",children:"All Campuses"}),m.map(t=>e.jsx("option",{value:t.name,children:t.name.toUpperCase()},t.id))]}),e.jsx("select",{value:s,onChange:t=>f(t.target.value),className:"bg-slate-50 dark:bg-[#000d1a] border border-slate-100 dark:border-white/5 rounded-xl md:rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-blue-500 w-full md:min-w-[150px] cursor-pointer appearance-none hover:bg-white dark:hover:bg-white/5 transition-colors",children:Ee.map(t=>e.jsx("option",{value:t,children:t},t))})]})]}),e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-5 px-2",children:oe.length>0?oe.map(t=>{const d=r.includes(t.id);return e.jsxs("div",{className:D("group relative bg-white dark:bg-[#001529] rounded-[2rem] p-6 border-2 transition-all duration-500",d?"border-[#003366] dark:border-yellow-400 shadow-2xl scale-[1.02]":"border-slate-100 dark:border-white/5 shadow-xl hover:border-blue-200 dark:hover:border-yellow-400/20"),onClick:()=>Be(t),children:[e.jsx("div",{className:"absolute top-5 right-5 z-10",onClick:c=>c.stopPropagation(),children:e.jsx("input",{type:"checkbox",checked:d,onChange:c=>c.target.checked?x(h=>[...h,t.id]):x(h=>h.filter($=>$!==t.id)),className:"w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-white/10 checked:bg-[#003366] dark:checked:bg-yellow-400 transition-all cursor-pointer"})}),e.jsxs("div",{className:"flex items-center gap-5 mb-6",children:[e.jsx("div",{className:"w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#003366] to-blue-600 dark:from-yellow-400 dark:to-yellow-600 flex items-center justify-center font-black text-white dark:text-[#000816] text-2xl shadow-xl shadow-blue-500/20 dark:shadow-yellow-400/20 shrink-0 border-2 border-white dark:border-[#001529]",children:t.avatar&&t.avatar.length>5?e.jsx("img",{src:t.avatar,className:"w-full h-full object-cover rounded-2xl"}):e.jsx("span",{children:t.name.charAt(0)})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("h4",{className:"font-black text-lg text-[#003366] dark:text-white tracking-tighter truncate pr-8 leading-none mb-1",children:t.name}),e.jsx("p",{className:"text-[10px] font-black text-slate-400 dark:text-yellow-400/40 uppercase tracking-[0.2em]",children:t.id})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4 mb-4",children:[e.jsxs("div",{className:"p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5",children:[e.jsx("p",{className:"text-[8px] font-black text-slate-400 dark:text-yellow-400/40 uppercase tracking-[0.2em] leading-none mb-1.5",children:"Class"}),e.jsx("p",{className:"text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-tight",children:t.class})]}),e.jsxs("div",{className:"p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5",children:[e.jsx("p",{className:"text-[8px] font-black text-slate-400 dark:text-yellow-400/40 uppercase tracking-[0.2em] leading-none mb-1.5",children:"Status"}),e.jsx("span",{className:D("text-[8px] font-black uppercase px-2.5 py-1 rounded-lg inline-block shadow-sm",t.status==="Passed Out"||t.status==="Alumni"?"bg-purple-600 text-white":t.status==="Online Applied"||t.status==="Pending Verification"?"bg-sky-500 text-white animate-pulse":t.status==="Active"?"bg-emerald-500 text-white":"bg-amber-500 text-white"),children:t.status==="Passed Out"||t.status==="Alumni"?`🎓 Passed Out ${t.graduatedYear?`(${t.graduatedYear})`:""}`:t.status==="Online Applied"||t.status==="Pending Verification"?"🌐 Online Applied":t.status})]})]}),(t.status==="Online Applied"||t.status==="Pending Verification")&&e.jsxs("button",{onClick:c=>{c.stopPropagation(),Je(t)},className:"w-full mb-4 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-wider shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95",children:[e.jsx(Se,{className:"w-3.5 h-3.5 text-yellow-300"})," ✅ Approve & Enroll Online Student"]}),(t.status==="Passed Out"||t.status==="Inactive"||t.class?.includes("10th")||t.class?.includes("Matric"))&&e.jsxs("button",{onClick:c=>{c.stopPropagation(),Ze(t)},className:"w-full mb-4 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-wider shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-95",children:[e.jsx(W,{className:"w-3.5 h-3.5"})," ⚡ Re-Admit to College (1st Year)"]}),e.jsxs("div",{className:"flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5",onClick:c=>c.stopPropagation(),children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{onClick:()=>Be(t),className:"p-3 bg-blue-500/5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-brand-primary dark:hover:text-brand-accent transition-all hover:scale-110",children:e.jsx(fe,{className:"w-4 h-4"})}),e.jsx("button",{onClick:()=>ne(t),className:"p-3 bg-blue-500/5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-brand-primary dark:hover:text-brand-accent transition-all hover:scale-110",children:e.jsx(lt,{className:"w-4 h-4"})})]}),e.jsxs("div",{className:"flex gap-2",children:[j&&e.jsx("button",{onClick:()=>ie(t),className:"p-3 bg-emerald-500/10 rounded-xl text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all hover:rotate-6",children:e.jsx(rt,{className:"w-4 h-4"})}),j&&e.jsx("button",{onClick:()=>et(t.id,t.name),className:"p-3 bg-rose-500/10 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all hover:-rotate-6",children:e.jsx(Ie,{className:"w-4 h-4"})})]})]})]},t.id)}):e.jsxs("div",{className:"col-span-full py-24 text-center bg-white dark:bg-[#001529] rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-2xl",children:[e.jsx(we,{className:"w-16 h-16 text-slate-200 dark:text-white/5 mx-auto mb-6 animate-pulse"}),e.jsx("p",{className:"text-slate-400 dark:text-white/20 font-black uppercase tracking-[0.3em] text-[11px]",children:"No students found • Try a different search"})]})}),e.jsx("div",{className:"hidden lg:block overflow-x-auto custom-scrollbar",children:e.jsxs("table",{className:"w-full text-left min-w-[1000px]",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"text-[10px] uppercase tracking-widest text-slate-400 dark:text-yellow-400/40 font-bold border-b border-slate-200 dark:border-yellow-400/10 bg-slate-50/30 dark:bg-yellow-400/5",children:[e.jsx("th",{className:"px-6 py-4 w-10 sticky left-0 bg-slate-50 dark:bg-[#001529] z-20",children:e.jsx("input",{type:"checkbox",checked:r.length===oe.length&&oe.length>0,onChange:t=>t.target.checked?x(oe.map(d=>d.id)):x([])})}),e.jsx("th",{className:"px-6 py-4 sticky left-[52px] bg-slate-50 dark:bg-[#001529] z-10",children:"Student Name"}),e.jsx("th",{className:"px-6 py-4",children:"Admission No"}),e.jsx("th",{className:"px-6 py-4",children:"Class"}),e.jsx("th",{className:"px-6 py-4 text-center",children:"Status"}),e.jsx("th",{className:"px-6 py-4 text-right sticky right-0 bg-slate-50 dark:bg-[#001529] z-10",children:"Actions"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 dark:divide-slate-800",children:oe.map(t=>{const d=r.includes(t.id);return e.jsxs("tr",{className:D("group transition-colors",d?"bg-primary-50/30 dark:bg-primary-900/10":"hover:bg-slate-50/50 dark:hover:bg-slate-900/10"),children:[e.jsx("td",{className:"px-6 py-4 sticky left-0 z-20 bg-white dark:bg-[#001a33]",children:e.jsx("input",{type:"checkbox",checked:d,onChange:c=>c.target.checked?x(h=>[...h,t.id]):x(h=>h.filter($=>$!==t.id))})}),e.jsx("td",{className:"px-6 py-4 sticky left-[52px] z-10 bg-white dark:bg-[#001a33]",children:e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-black text-white shadow-lg",children:t.avatar&&t.avatar.length>5?e.jsx("img",{src:t.avatar,className:"w-full h-full object-cover rounded-xl"}):e.jsx("span",{children:t.name.charAt(0)})}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("span",{className:"font-bold text-sm tracking-tight",children:t.name}),e.jsx("span",{className:"text-[10px] font-bold text-slate-400 capitalize",children:t.discipline})]})]})}),e.jsx("td",{className:"px-6 py-4 text-xs font-mono text-slate-500",children:t.id}),e.jsx("td",{className:"px-6 py-4 text-xs font-black uppercase text-slate-600 dark:text-slate-400",children:t.class}),e.jsx("td",{className:"px-6 py-4 text-center",children:e.jsx("span",{className:D("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block",t.status==="Passed Out"||t.status==="Alumni"?"bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300":t.status==="Online Applied"||t.status==="Pending Verification"?"bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 animate-pulse":t.status==="Active"?"bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300":"bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"),children:t.status==="Passed Out"||t.status==="Alumni"?`🎓 Passed Out ${t.graduatedYear?`(${t.graduatedYear})`:""}`:t.status==="Online Applied"||t.status==="Pending Verification"?"🌐 Online Applied":t.status})}),e.jsx("td",{className:"px-6 py-4 text-right sticky right-0 bg-white dark:bg-[#001a33]",children:e.jsxs("div",{className:"flex items-center justify-end gap-2",children:[(t.status==="Online Applied"||t.status==="Pending Verification")&&e.jsx("button",{onClick:()=>Je(t),title:"✅ Approve & Enroll Online Student",className:"p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors group relative",children:e.jsx(Se,{className:"w-4 h-4 group-hover:scale-125 transition-transform text-emerald-600"})}),e.jsx("button",{onClick:()=>Ze(t),title:"⚡ 1-Click Re-Admit / Promote to College (1st Year)",className:"p-2 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg transition-colors group relative",children:e.jsx(W,{className:"w-4 h-4 group-hover:scale-125 transition-transform"})}),e.jsx("button",{onClick:()=>Be(t),title:"View Profile",className:"p-2 hover:bg-brand-primary/10 text-slate-400",children:e.jsx(fe,{className:"w-4 h-4"})}),j&&e.jsx("button",{onClick:()=>ie(t),title:"Edit Student",className:"p-2 hover:bg-emerald-50 text-slate-400",children:e.jsx(rt,{className:"w-4 h-4"})}),e.jsx("button",{onClick:()=>{U(t)},title:"Generate Fee Slip",className:"p-2 hover:bg-amber-50 text-amber-600 transition-colors",children:e.jsx(ce,{className:"w-4 h-4"})}),e.jsx("button",{onClick:()=>ne(t),title:"ID Card",className:"p-2 hover:bg-brand-primary/10 text-slate-400",children:e.jsx(lt,{className:"w-4 h-4"})}),j&&e.jsx("button",{onClick:()=>et(t.id,t.name),title:"Delete",className:"p-2 hover:bg-red-50 text-slate-400",children:e.jsx(Ie,{className:"w-4 h-4"})})]})})]},t.id)})})]})}),T.length>0&&e.jsxs("div",{className:"mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-[#001529] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm",children:[e.jsxs("div",{className:"flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400",children:[e.jsxs("span",{children:["Showing ",e.jsx("span",{className:"text-[#003366] dark:text-yellow-400 font-black",children:Math.min((Z-1)*le+1,T.length)})," to ",e.jsx("span",{className:"text-[#003366] dark:text-yellow-400 font-black",children:Math.min(Z*le,T.length)})," of ",e.jsx("span",{className:"text-[#003366] dark:text-yellow-400 font-black",children:T.length})," students"]}),e.jsx("span",{className:"hidden sm:inline text-slate-300 dark:text-white/10",children:"•"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-[10px] uppercase tracking-wider text-slate-400",children:"Per page:"}),e.jsxs("select",{value:le,onChange:t=>xt(Number(t.target.value)),className:"bg-slate-50 dark:bg-[#000d1a] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-black outline-none cursor-pointer",children:[e.jsx("option",{value:10,children:"10"}),e.jsx("option",{value:25,children:"25"}),e.jsx("option",{value:50,children:"50"}),e.jsx("option",{value:100,children:"100"})]})]})]}),e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("button",{onClick:()=>me(1),disabled:Z===1,className:"p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all",title:"First Page",children:e.jsx(Ft,{className:"w-4 h-4 text-slate-600 dark:text-slate-300"})}),e.jsx("button",{onClick:()=>me(t=>Math.max(t-1,1)),disabled:Z===1,className:"p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all",title:"Previous Page",children:e.jsx(ot,{className:"w-4 h-4 text-slate-600 dark:text-slate-300"})}),e.jsxs("div",{className:"px-3 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-black min-w-[70px] text-center shadow-md shadow-brand-primary/20",children:[Z," / ",he]}),e.jsx("button",{onClick:()=>me(t=>Math.min(t+1,he)),disabled:Z===he,className:"p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all",title:"Next Page",children:e.jsx(Ve,{className:"w-4 h-4 text-slate-600 dark:text-slate-300"})}),e.jsx("button",{onClick:()=>me(he),disabled:Z===he,className:"p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all",title:"Last Page",children:e.jsx(It,{className:"w-4 h-4 text-slate-600 dark:text-slate-300"})})]})]})]}),typeof document<"u"&&Fe.createPortal(e.jsx(Pe,{children:K&&e.jsx("div",{className:"fixed inset-0 z-[150] bg-brand-primary/95 backdrop-blur-2xl flex items-center justify-center p-4",children:e.jsxs(ee.div,{initial:{opacity:0,scale:.9,y:20},animate:{opacity:1,scale:1,y:0},className:"w-full max-w-4xl",children:[e.jsxs("div",{className:"text-center mb-12",children:[e.jsx("h2",{className:"text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4",children:ae?"Admission For":"Select Campus"}),e.jsx("p",{className:"text-blue-400 font-bold uppercase tracking-[0.3em] text-sm",children:ae?"Step 2: Choose School or College":"Step 1: Choose Campus Location"})]}),ae?e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto",children:[e.jsxs("button",{onClick:()=>{se("School"),J(!1),Q(!0)},className:"group relative h-80 bg-[#001f3f]/40 hover:bg-[#001f3f]/60 text-white border border-white/5 rounded-[4rem] p-10 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center justify-center gap-8 shadow-2xl backdrop-blur-sm",children:[e.jsx("div",{className:D("w-36 h-36 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 overflow-hidden shadow-2xl border border-white/10",p.logo1?"bg-transparent":"bg-[#0d3b3b] shadow-inner"),children:p.logo1?e.jsx("img",{src:p.logo1,className:"w-full h-full object-contain drop-shadow-2xl",alt:"School Logo"}):e.jsx(W,{className:"w-16 h-16 text-yellow-400 opacity-80"})}),e.jsxs("div",{className:"text-center space-y-2",children:[e.jsx("span",{className:"block font-serif font-black uppercase tracking-[0.2em] text-2xl",children:"School"}),e.jsx("span",{className:"text-[10px] font-black opacity-40 uppercase tracking-[0.3em] block",children:"Primary to Secondary"})]}),e.jsx("div",{className:"absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity"})]}),e.jsxs("button",{onClick:()=>{se("College"),J(!1),Q(!0)},className:"group relative h-80 bg-[#001f3f]/40 hover:bg-[#001f3f]/60 text-white border border-white/5 rounded-[4rem] p-10 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center justify-center gap-8 shadow-2xl backdrop-blur-sm",children:[e.jsx("div",{className:D("w-36 h-36 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 overflow-hidden shadow-2xl border border-white/10",p.logo2?"bg-transparent":"bg-[#1e3a5f] shadow-inner"),children:p.logo2?e.jsx("img",{src:p.logo2,className:"w-full h-full object-contain drop-shadow-2xl",alt:"College Logo"}):e.jsx(W,{className:"w-16 h-16 text-[#60a5fa]"})}),e.jsxs("div",{className:"text-center space-y-2",children:[e.jsx("span",{className:"block font-serif font-black uppercase tracking-[0.2em] text-2xl",children:"College"}),e.jsx("span",{className:"text-[10px] font-black opacity-40 uppercase tracking-[0.3em] block",children:"Higher Secondary"})]}),e.jsx("div",{className:"absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-500/5 to-transparent rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity"})]})]}):e.jsx("div",{className:"flex flex-col gap-4 max-w-2xl mx-auto w-full",children:(m&&m.length>0?m:[{id:"DEFAULT",name:"MAIN CAMPUS"}]).map(t=>e.jsxs("button",{onClick:()=>H(t.name),className:"group relative w-full bg-white hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/10 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] flex items-center justify-start px-8 md:px-12 gap-6 shadow-sm hover:shadow-xl",children:[e.jsx("div",{className:"w-10 h-10 bg-brand-primary/5 group-hover:bg-white/10 rounded-full flex items-center justify-center",children:e.jsx($t,{className:"w-5 h-5"})}),e.jsx("span",{className:"font-outfit font-black uppercase tracking-widest text-xs md:text-sm text-left",children:t.name.toUpperCase()}),e.jsx("div",{className:"absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"})]},t.id))}),e.jsxs("div",{className:"mt-16 flex justify-center gap-4",children:[ae&&e.jsx("button",{onClick:()=>H(""),className:"px-8 py-3 rounded-2xl border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all",children:"Return to Campus List"}),e.jsxs("button",{onClick:()=>{J(!1),B(!0),H(""),se(null)},className:"px-8 py-3 rounded-2xl bg-[#800000] text-white font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-xl",children:[e.jsx(fe,{className:"w-4 h-4"})," Admission Form (Blank)"]}),e.jsx("button",{onClick:()=>{J(!1),H(""),se(null)},className:"px-8 py-3 rounded-2xl bg-white/5 text-white/40 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all",children:"Cancel Onboarding"})]})]})})}),document.body),(g||je)&&e.jsx(Bt,{editStudent:je||void 0,initialCampus:ae,initialType:ve||void 0,onClose:()=>{Q(!1),ie(null),H(""),se(null)}}),ke&&e.jsx(zt,{student:ke,onClose:()=>ne(null)}),a&&e.jsx(Ot,{mode:"Present",onScan:ut,onClose:()=>l(!1)}),v&&e.jsx(Lt,{onClose:()=>B(!1)}),P&&e.jsx(it,{student:P,onClose:()=>U(null)}),pe&&e.jsx(Et,{students:i.filter(t=>r.includes(t.id)),onClose:()=>Re(!1)}),typeof document<"u"&&Fe.createPortal(e.jsx(Pe,{children:Y&&e.jsx("div",{className:"fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-hidden",children:e.jsxs(ee.div,{initial:{opacity:0,scale:.94,y:15},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.94,y:15},transition:{type:"spring",damping:25,stiffness:350},className:"relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-[#071322] border border-slate-200 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden",children:[e.jsxs("div",{className:"shrink-0 relative bg-gradient-to-r from-purple-700 via-indigo-700 to-[#003366] p-4 sm:p-6 text-white overflow-hidden",children:[e.jsx("div",{className:"absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"}),e.jsx("div",{className:"absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"}),e.jsxs("div",{className:"relative z-10 flex items-start justify-between gap-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-xl overflow-hidden",children:Y.avatar&&Y.avatar.length>5?e.jsx("img",{src:Y.avatar,alt:Y.name,className:"w-full h-full object-cover"}):e.jsx(W,{className:"w-7 h-7 text-yellow-300"})}),e.jsxs("div",{children:[e.jsx("div",{className:"inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 backdrop-blur-md rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-yellow-300 mb-0.5",children:e.jsx("span",{children:"⚡ 1-Click Fast Re-Admission"})}),e.jsx("h3",{className:"text-lg sm:text-2xl font-black uppercase tracking-tight text-white leading-tight",children:Y.name}),e.jsxs("p",{className:"text-[10px] sm:text-xs text-white/80 font-medium",children:["S/O ",Y.fatherName||"N/A"," • Prev: ",e.jsx("span",{className:"font-bold text-white",children:Y.class})," (",Y.campus||"Main Campus",")"]})]})]}),e.jsx("button",{onClick:()=>Ne(null),className:"p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all shrink-0",children:e.jsx(te,{className:"w-4 h-4 sm:w-5 sm:h-5"})})]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar overscroll-contain",children:[e.jsxs("div",{children:[e.jsxs("label",{className:"block text-[10px] sm:text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5",children:[e.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-purple-600"}),"1. Select Target College Class"]}),e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-2",children:["1st Year (Boys)","1st Year (Girls)","2nd Year (Boys)","2nd Year (Girls)"].map(t=>e.jsx("button",{type:"button",onClick:()=>_e(t),className:D("px-2.5 py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all border text-center flex flex-col items-center justify-center gap-0.5",De===t?"bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/30 scale-[1.02]":"bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/5 hover:border-purple-400"),children:e.jsx("span",{children:t})},t))})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"block text-[10px] sm:text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5",children:[e.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-indigo-600"}),"2. Choose College Discipline / Stream"]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-2.5",children:[{id:"FSc Pre-Medical",title:"FSc Pre-Medical",emoji:"🩺",desc:"Biology • Chemistry • Physics"},{id:"FSc Pre-Engineering",title:"FSc Pre-Engineering",emoji:"⚙️",desc:"Math • Chemistry • Physics"},{id:"ICS",title:"ICS (Computer Science)",emoji:"💻",desc:"Computer • Math • Physics/Stats"},{id:"I.Com",title:"I.Com (Commerce)",emoji:"💼",desc:"Accounting • Commerce • Economics"},{id:"FA",title:"FA (Arts & Humanities)",emoji:"🎨",desc:"Civics • Islamic Studies • Arts"},{id:"General Science",title:"General Science",emoji:"🔬",desc:"Statistics • Math • Physics"}].map(t=>{const d=Oe===t.id;return e.jsxs("button",{type:"button",onClick:()=>qe(t.id),className:D("p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all relative overflow-hidden flex items-center gap-3",d?"bg-purple-50 dark:bg-purple-950/40 border-purple-600 dark:border-purple-500 shadow-sm ring-2 ring-purple-600/30":"bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"),children:[e.jsx("span",{className:"text-xl sm:text-2xl shrink-0",children:t.emoji}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex items-center justify-between gap-1",children:[e.jsx("span",{className:D("text-[11px] sm:text-xs font-black uppercase tracking-tight truncate",d?"text-purple-900 dark:text-purple-200":"text-slate-800 dark:text-slate-200"),children:t.title}),d&&e.jsx(Se,{className:"w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0"})]}),e.jsx("p",{className:"text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate",children:t.desc})]})]},t.id)})})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"block text-[10px] sm:text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5",children:[e.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-emerald-600"}),"3. Fee Structure Setup"]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/5",children:[e.jsxs("div",{children:[e.jsx("span",{className:"block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1",children:"Monthly Tuition Fee (₨)"}),e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-black text-xs",children:"₨"}),e.jsx("input",{type:"number",value:He,onChange:t=>We(Number(t.target.value)),placeholder:"3500",className:"w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-slate-800 dark:text-white outline-none focus:border-purple-600 transition-colors"})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1",children:"Admission / Re-Enroll Fee (₨)"}),e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-black text-xs",children:"₨"}),e.jsx("input",{type:"number",value:Qe,onChange:t=>Ke(Number(t.target.value)),placeholder:"0",className:"w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-slate-800 dark:text-white outline-none focus:border-purple-600 transition-colors"})]}),e.jsx("p",{className:"text-[8px] sm:text-[9px] text-slate-400 mt-0.5",children:"Set 0 for free internal promotion"})]})]})]})]}),e.jsxs("div",{className:"shrink-0 p-3.5 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-white/5 flex items-center justify-end gap-2.5",children:[e.jsx("button",{type:"button",onClick:()=>Ne(null),className:"px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all",children:"Cancel"}),e.jsxs("button",{type:"button",onClick:ct,className:"px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#003366] hover:from-purple-700 hover:to-indigo-700 text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-95",children:[e.jsx(W,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4"}),"Confirm Re-Admission"]})]})]})})}),document.body)]})};export{sa as Students};
