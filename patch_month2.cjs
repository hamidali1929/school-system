const fs = require('fs');

function patchFeeVoucher() {
    let content = fs.readFileSync('src/components/FeeVoucher.tsx', 'utf8');

    // Find the tuition input block in FeeVoucher
    const tuitionRegex = /<label className="text-\[8px\] md:text-\[10px\] font-black uppercase text-slate-400 mb-1 block tracking-widest">Tuition Fee<\/label>/;
    
    if (!content.includes('Month</label>') && tuitionRegex.test(content)) {
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
        content = content.replace(tuitionRegex, monthYearSelectHtml + '\n                                  <label className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Tuition Fee</label>');
        console.log("Injected FeeVoucher UI");
    }
    
    fs.writeFileSync('src/components/FeeVoucher.tsx', content, 'utf8');
}

function patchBulkFeeVoucher() {
    let content = fs.readFileSync('src/components/BulkFeeVoucher.tsx', 'utf8');

    const printBtnRegex = /<button onClick=\{printDocument\}/;
    if (printBtnRegex.test(content) && !content.includes('setCurrentMonth')) {
        const monthYearSelectHtml = `
                    <div className="flex items-center gap-2">
                        <select value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))} className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl font-bold text-xs outline-none focus:ring-2 ring-brand-primary/50">
                            {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <input type="number" value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))} className="w-20 px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl font-bold text-xs outline-none focus:ring-2 ring-brand-primary/50" />
                    </div>
`;
        content = content.replace(printBtnRegex, monthYearSelectHtml + '\n                          <button onClick={printDocument}');
        console.log("Injected BulkFeeVoucher UI");
    }
    
    fs.writeFileSync('src/components/BulkFeeVoucher.tsx', content, 'utf8');
}

patchFeeVoucher();
patchBulkFeeVoucher();
