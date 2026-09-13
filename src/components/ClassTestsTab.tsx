import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ClipboardList, Plus, MessageSquare, Trash2, Edit2, Printer, Save } from 'lucide-react';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';

export const ClassTestsTab = () => {
    const { classTests, addClassTest, updateClassTest, deleteClassTest, classes, classSubjects, students, currentUser, sendNotification, settings } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

    // Form State
    const [className, setClassName] = useState('');
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [totalMarks, setTotalMarks] = useState<number | ''>('');
    const [passingPercentage, setPassingPercentage] = useState<number | ''>(40);
    const [results, setResults] = useState<Record<string, number | 'A'>>({});

    // Filter by allowed classes if teacher
    const allowedClasses = currentUser?.role === 'teacher' && currentUser?.inchargeClass 
        ? classes.filter(c => c === currentUser.inchargeClass) 
        : classes;

    const testStudents = useMemo(() => {
        if (!className) return [];
        return students.filter(s => s.class === className && s.status === 'Active');
    }, [className, students]);

    const activeSubjects = useMemo(() => {
        return classSubjects[className] || [];
    }, [className, classSubjects]);

    const handleCreateNew = () => {
        setIsCreating(true);
        setSelectedTestId(null);
        setClassName(allowedClasses[0] || '');
        setSubject('');
        setTopic('');
        setTotalMarks('');
        setPassingPercentage(40);
        setResults({});
    };

    const handleEdit = (test: any) => {
        setIsCreating(true);
        setSelectedTestId(test.id);
        setClassName(test.className);
        setSubject(test.subject);
        setTopic(test.topic);
        setTotalMarks(test.totalMarks);
        setPassingPercentage(test.passingPercentage || 40);
        setResults(test.results || {});
    };

    const handleSave = () => {
        if (!className || !subject || !topic || !totalMarks || !passingPercentage) {
            Swal.fire('Missing Fields', 'Please fill all test details including passing criteria.', 'error');
            return;
        }

        if (selectedTestId) {
            updateClassTest(selectedTestId, { className, subject, topic, totalMarks: Number(totalMarks), passingPercentage: Number(passingPercentage), results });
            Swal.fire({ title: 'Updated!', text: 'Class test updated successfully.', icon: 'success', timer: 1500 });
        } else {
            addClassTest({
                className,
                subject,
                topic,
                totalMarks: Number(totalMarks),
                passingPercentage: Number(passingPercentage),
                results,
                date: new Date().toISOString().split('T')[0],
                teacherId: currentUser?.id || 'Admin'
            });
            Swal.fire({ title: 'Saved!', text: 'New class test created.', icon: 'success', timer: 1500 });
        }
        setIsCreating(false);
    };

    const handleDelete = (id: string) => {
        Swal.fire({
            title: 'Delete Test?',
            text: 'This will remove the test and all entered marks.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444'
        }).then((res) => {
            if (res.isConfirmed) deleteClassTest(id);
        });
    };

    const handleWhatsAppBroadcast = (test: any) => {
        Swal.fire({
            title: 'Send to Parents?',
            text: `Send WhatsApp messages to parents of ${test.className} for ${test.subject}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Send Now'
        }).then((res) => {
            if (res.isConfirmed) {
                let sent = 0;
                const testStudents = students.filter(s => s.class === test.className && s.status === 'Active');
                testStudents.forEach(s => {
                    const marks = test.results[s.id];
                    if (marks !== undefined) {
                        let statusText = '';
                        if (marks === 'A') {
                            statusText = 'ABSENT';
                        } else {
                            const perc = (marks / test.totalMarks) * 100;
                            const isPass = perc >= (test.passingPercentage || 40);
                            statusText = isPass ? 'PASS' : 'FAIL';
                        }

                        const msg = `Dear Parent, your child ${s.name} scored ${marks === 'A' ? 'ABSENT' : `${marks}/${test.totalMarks} (${statusText})`} in today's ${test.subject} class test (${test.topic}).`;
                        sendNotification(s.id, 'General', msg);
                        sent++;
                    }
                });
                Swal.fire('Broadcast Complete', `Sent test results to ${sent} parents via WhatsApp.`, 'success');
            }
        });
    };

    const printMarksheet = (test: any) => {
        const testStudents = students.filter(s => s.class === test.className && s.status === 'Active');
        
        // Prepare HTML for printing
        let rowsHtml = '';
        let passCount = 0;
        let failCount = 0;
        let absentCount = 0;

        testStudents.forEach((student, index) => {
            const marks = test.results[student.id];
            let status = '-';
            let statusColor = '#64748b'; // slate-500
            let percStr = '-';
            let marksStr = '-';

            if (marks === 'A') {
                status = 'ABSENT';
                statusColor = '#f59e0b'; // amber-500
                marksStr = 'A';
                absentCount++;
            } else if (marks !== undefined) {
                marksStr = marks.toString();
                const perc = (marks / test.totalMarks) * 100;
                percStr = perc.toFixed(1) + '%';
                const isPass = perc >= (test.passingPercentage || 40);
                
                if (isPass) {
                    status = 'PASS';
                    statusColor = '#10b981'; // emerald-500
                    passCount++;
                } else {
                    status = 'FAIL';
                    statusColor = '#ef4444'; // rose-500
                    failCount++;
                }
            }

            rowsHtml += `
                <tr>
                    <td style="text-align: center;">${index + 1}</td>
                    <td><strong>${student.name}</strong></td>
                    <td style="text-align: center;">${student.id}</td>
                    <td style="text-align: center; font-weight: bold;">${marksStr}</td>
                    <td style="text-align: center;">${percStr}</td>
                    <td style="text-align: center; color: ${statusColor}; font-weight: bold;">${status}</td>
                </tr>
            `;
        });

        const printWindow = window.open('', '', 'width=1000,height=800');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>${test.className} - ${test.subject} Marksheet</title>
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
                        <h1>${settings.schoolName || 'School System'}</h1>
                        <p>Class Test Mark Sheet</p>
                    </div>

                    <div class="meta-info">
                        <div><label>Class</label><span>${test.className}</span></div>
                        <div><label>Subject</label><span>${test.subject}</span></div>
                        <div><label>Topic</label><span>${test.topic}</span></div>
                        <div><label>Total Marks</label><span>${test.totalMarks}</span></div>
                        <div><label>Passing Criteria</label><span>${test.passingPercentage}%</span></div>
                        <div><label>Date</label><span>${test.date}</span></div>
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
                            ${rowsHtml}
                        </tbody>
                    </table>

                    <div class="summary">
                        <div class="summary-box">
                            <label>Total Students</label>
                            <span>${testStudents.length}</span>
                        </div>
                        <div class="summary-box">
                            <label>Absent</label>
                            <span>${absentCount}</span>
                        </div>
                        <div class="summary-box pass">
                            <label>Passed</label>
                            <span>${passCount}</span>
                        </div>
                        <div class="summary-box fail">
                            <label>Failed</label>
                            <span>${failCount}</span>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const printConsolidatedReport = async () => {
        // Ask for class
        const { value: selectedClass } = await Swal.fire({
            title: 'Master Class Report',
            text: 'Select class to generate consolidated test report',
            input: 'select',
            inputOptions: allowedClasses.reduce((acc, c) => ({ ...acc, [c]: c }), {}),
            inputPlaceholder: 'Select a class',
            showCancelButton: true,
            confirmButtonColor: 'var(--brand-primary)'
        });

        if (!selectedClass) return;

        const classSpecificTests = classTests.filter(t => t.className === selectedClass).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (classSpecificTests.length === 0) {
            Swal.fire('No Tests Found', `There are no class tests recorded for ${selectedClass} yet.`, 'info');
            return;
        }

        const testStudents = students.filter(s => s.class === selectedClass && s.status === 'Active');
        
        let headerCols = classSpecificTests.map(t => `<th style="text-align: center; font-size: 10px;">${t.subject}<br/><span style="color:#64748b;font-size:9px;">${t.date}</span><br/><span style="color:#10b981;font-size:9px;">Max: ${t.totalMarks}</span></th>`).join('');
        
        let rowsHtml = '';
        testStudents.forEach((student, index) => {
            let totalObtained = 0;
            let totalMax = 0;

            let cellHtml = classSpecificTests.map(t => {
                const marks = t.results[student.id];
                if ((marks as any) === 'A') {
                    return `<td style="text-align: center; color: #f59e0b; font-weight: bold;">A</td>`;
                } else if (marks !== undefined && (marks as any) !== '') {
                    totalObtained += (marks as number);
                    totalMax += t.totalMarks;
                    const isPass = ((marks as number) / t.totalMarks) * 100 >= (t.passingPercentage || 40);
                    const color = isPass ? '#10b981' : '#ef4444';
                    return `<td style="text-align: center; font-weight: bold; color: ${color};">${marks}</td>`;
                } else {
                    return `<td style="text-align: center; color: #cbd5e1;">-</td>`;
                }
            }).join('');

            const overallPerc = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) + '%' : '-';

            rowsHtml += `
                <tr>
                    <td style="text-align: center;">${index + 1}</td>
                    <td><strong>${student.name}</strong></td>
                    <td style="text-align: center;">${student.id}</td>
                    ${cellHtml}
                    <td style="text-align: center; font-weight: 900; background: #f8fafc;">${totalObtained} / ${totalMax}</td>
                    <td style="text-align: center; font-weight: 900; background: #f8fafc;">${overallPerc}</td>
                </tr>
            `;
        });

        const printWindow = window.open('', '', 'width=1200,height=800');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>${selectedClass} - Consolidated Report</title>
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
                        <h1>${settings.schoolName || 'School System'}</h1>
                        <p>Consolidated Class Test Report — ${selectedClass}</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px;">S.No</th>
                                <th style="text-align: left;">Student Name</th>
                                <th>Student ID</th>
                                ${headerCols}
                                <th>Grand Total</th>
                                <th>Overall %</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const getStats = (test: any) => {
        const marks = Object.values(test.results).filter(m => m !== 'A') as number[];
        if (marks.length === 0) return { avg: 0, high: 0 };
        const avg = (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(1);
        const high = Math.max(...marks);
        return { avg, high };
    };

    const filteredTests = currentUser?.role === 'teacher' && currentUser?.inchargeClass 
        ? classTests.filter(t => t.className === currentUser.inchargeClass)
        : classTests;

    return (
        <div className="space-y-6">
            {!isCreating ? (
                <>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black uppercase text-slate-800 dark:text-white">Smart Class Tests</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Assessments & Analytics</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={printConsolidatedReport} className="px-4 py-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                                <ClipboardList className="w-4 h-4" /> Class Report
                            </button>
                            <button onClick={handleCreateNew} className="px-4 py-2 bg-brand-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                                <Plus className="w-4 h-4" /> New Test
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTests.map((test) => {
                            const { avg, high } = getStats(test);
                            
                            return (
                                <div key={test.id} className="bg-white dark:bg-slate-800/80 rounded-[2rem] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-white/5 border border-slate-50 dark:border-transparent relative group flex flex-col h-full">
                                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(test)} className="p-2 bg-slate-100 text-brand-primary rounded-full hover:bg-brand-primary hover:text-white"><Edit2 className="w-3 h-3" /></button>
                                        <button onClick={() => handleDelete(test.id)} className="p-2 bg-slate-100 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-brand-accent/20 flex items-center justify-center text-brand-primary">
                                            <ClipboardList className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 dark:text-white leading-tight">{test.subject}</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{test.className} • {test.date}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4 line-clamp-1 flex-1">{test.topic}</p>
                                    
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-center">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</div>
                                            <div className="text-sm font-black text-slate-800 dark:text-white">{test.totalMarks}</div>
                                        </div>
                                        <div className="bg-brand-accent/10 p-2 rounded-xl text-center">
                                            <div className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Avg</div>
                                            <div className="text-sm font-black text-brand-primary">{avg}</div>
                                        </div>
                                        <div className="bg-emerald-500/10 p-2 rounded-xl text-center">
                                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">High</div>
                                            <div className="text-sm font-black text-emerald-600">{high}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-auto">
                                        <button onClick={() => printMarksheet(test)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                            <Printer className="w-3.5 h-3.5" /> Marksheet
                                        </button>
                                        <button onClick={() => handleWhatsAppBroadcast(test)} className="flex-1 py-2.5 bg-[#25D366]/10 text-[#25D366] text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-[#25D366] hover:text-white transition-colors">
                                            <MessageSquare className="w-3.5 h-3.5" /> Broadcast
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-6 md:p-8 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5 border border-slate-50 dark:border-transparent">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black uppercase text-slate-800 dark:text-white">{selectedTestId ? 'Edit Test' : 'New Rapid Test'}</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tab through inputs for fast marks entry</p>
                        </div>
                        <button onClick={() => setIsCreating(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-black text-xs uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Class</label>
                            <select value={className} onChange={(e) => { setClassName(e.target.value); setSubject(''); }} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none font-bold text-sm">
                                <option value="">Select...</option>
                                {allowedClasses.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Subject</label>
                            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none font-bold text-sm">
                                <option value="">Select...</option>
                                {activeSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Total Marks</label>
                            <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value ? Number(e.target.value) : '')} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none font-bold text-sm" placeholder="e.g. 10" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Passing %</label>
                            <input type="number" value={passingPercentage} onChange={(e) => setPassingPercentage(e.target.value ? Number(e.target.value) : '')} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none font-bold text-sm text-brand-primary" placeholder="e.g. 40" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Topic / Chapter</label>
                            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 outline-none font-bold text-sm" placeholder="e.g. Ch 5 Motion" />
                        </div>
                    </div>

                    {className && subject && totalMarks && passingPercentage && (
                        <div className="mt-8">
                            <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-4">
                                <h3 className="font-black uppercase tracking-wider text-brand-primary">Enter Marks</h3>
                                <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">Type 'A' for Absent</div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {testStudents.map(student => {
                                    const m = results[student.id];
                                    let isPass = undefined;
                                    if (m !== undefined && (m as any) !== 'A' && (m as any) !== '') {
                                        isPass = ((m as number) / (totalMarks as number)) * 100 >= (passingPercentage as number);
                                    }

                                    return (
                                        <div key={student.id} className={cn(
                                            "flex items-center justify-between p-3 rounded-2xl border transition-colors",
                                            isPass === true ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30" : 
                                            isPass === false ? "bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30" : 
                                            "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-white/5"
                                        )}>
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {student.avatar ? (
                                                    <img src={student.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-black shrink-0">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="truncate pr-2">
                                                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{student.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400">{student.id}</p>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={results[student.id] || ''}
                                                onChange={(e) => {
                                                    let val: any = e.target.value.toUpperCase();
                                                    if (val !== 'A' && val !== '') {
                                                        val = Number(val);
                                                        if (isNaN(val)) return;
                                                        if (val > (totalMarks as number)) val = totalMarks;
                                                    }
                                                    setResults(prev => ({ ...prev, [student.id]: val }));
                                                }}
                                                className={cn(
                                                    "w-14 h-10 text-center font-black rounded-xl outline-none border-2 transition-all",
                                                    results[student.id] === 'A' ? "bg-amber-50 border-amber-200 text-amber-500" :
                                                    isPass === true ? "bg-emerald-100 border-emerald-300 text-emerald-700" :
                                                    isPass === false ? "bg-rose-100 border-rose-300 text-rose-700" :
                                                    "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:border-brand-primary"
                                                )}
                                                placeholder="-"
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button onClick={handleSave} className="px-8 py-4 bg-brand-primary text-white text-sm font-black uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                                    <Save className="w-5 h-5" /> Save Rapid Test
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
