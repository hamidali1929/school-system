const fs = require('fs');

function patchFeeVoucher() {
    let content = fs.readFileSync('src/components/FeeVoucher.tsx', 'utf8');

    // Replace the month/year hardcoded vars with state
    if (content.includes('const currentMonth = new Date().getMonth();')) {
        content = content.replace(
            /const currentMonth = new Date\(\)\.getMonth\(\);\s*const currentYear = new Date\(\)\.getFullYear\(\);/,
            'const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());\n    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());'
        );
    }

    // Insert UI to edit month and year
    // Look for Tuition Fee input
    const tuitionHtml = `<div>
                                <label className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Tuition Fee</label>`;
    
    if (content.includes(tuitionHtml) && !content.includes('Select Month')) {
        const monthYearSelectHtml = `
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Month</label>
                                    <select value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))} className="w-full p-2.5 bg-white rounded-xl border border-slate-200 font-black text-xs outline-none focus:ring-2 ring-brand-primary/20">
                                        {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Year</label>
                                    <input type="number" value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))} className="w-full p-2.5 bg-white rounded-xl border border-slate-200 font-black text-xs outline-none focus:ring-2 ring-brand-primary/20" />
                                </div>
                            </div>
`;
        content = content.replace(tuitionHtml, monthYearSelectHtml + '\n' + tuitionHtml);
    }
    
    fs.writeFileSync('src/components/FeeVoucher.tsx', content, 'utf8');
}

function patchBulkFeeVoucher() {
    let content = fs.readFileSync('src/components/BulkFeeVoucher.tsx', 'utf8');

    // Replace state in BulkFeeVoucher
    if (content.includes('const currentMonth = new Date().getMonth();')) {
        content = content.replace(
            /const currentMonth = new Date\(\)\.getMonth\(\);\s*const currentYear = new Date\(\)\.getFullYear\(\);/g,
            'const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());\n    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());'
        );
    }

    // If there were multiple declarations, let's fix that
    if (content.split('const [currentMonth').length > 2) {
        // Oh, wait, absentMap uses them, and later there's another declaration.
        content = content.replace(
            /const \[currentMonth, setCurrentMonth\] = useState\(new Date\(\)\.getMonth\(\)\);\s*const \[currentYear, setCurrentYear\] = useState\(new Date\(\)\.getFullYear\(\)\);/,
            '' // remove the first one in absentMap
        );
        content = content.replace(
            /const absentMap = useMemo\(\(\) => \{/,
            `const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());\n    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());\n    const absentMap = useMemo(() => {`
        );
    }
    
    // Add selectors in toolbar
    const toolbarAction = `<button onClick={printDocument}`;
    if (content.includes(toolbarAction) && !content.includes('Select Month')) {
        const monthYearSelectHtml = `
                    <div className="flex items-center gap-2">
                        <select value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))} className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl font-bold text-xs outline-none focus:ring-2 ring-brand-primary/50">
                            {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <input type="number" value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))} className="w-20 px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl font-bold text-xs outline-none focus:ring-2 ring-brand-primary/50" />
                    </div>
`;
        content = content.replace(toolbarAction, monthYearSelectHtml + '\n' + toolbarAction);
    }
    
    fs.writeFileSync('src/components/BulkFeeVoucher.tsx', content, 'utf8');
}

patchFeeVoucher();
patchBulkFeeVoucher();
