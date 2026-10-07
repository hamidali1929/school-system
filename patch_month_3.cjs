const fs = require('fs');

function fixBulkFeeVoucher() {
    let content = fs.readFileSync('src/components/BulkFeeVoucher.tsx', 'utf8');

    // Fix double declarations
    content = content.replace(/const \[currentMonth, setCurrentMonth\] = useState\(new Date\(\)\.getMonth\(\)\);\s*const \[currentYear, setCurrentYear\] = useState\(new Date\(\)\.getFullYear\(\)\);\s*const currentMonthName = monthNames\[currentMonth\];/g, 'const currentMonthName = monthNames[currentMonth];');

    // Add UI
    const printBtnRegex = /<button onClick=\{printDocument\}/;
    if (printBtnRegex.test(content) && !content.includes('monthNames.map')) {
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

fixBulkFeeVoucher();
