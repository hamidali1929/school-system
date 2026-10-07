const fs = require('fs');

function patchFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');

    // Add campus name label to VoucherCopy
    if (!content.includes('{student?.campus ? ')) {
        const replacement = `<div className="absolute top-0 right-4 py-1 px-3 border-2 border-t-0 border-slate-800 bg-slate-100 text-slate-900 text-[8px] font-black uppercase tracking-[0.2em] rounded-b-xl z-20 print:translate-y-0 shadow-sm">
                {copyType}
            </div>
            
            <div className="absolute top-0 left-4 py-1 px-3 border-2 border-t-0 border-slate-800 bg-slate-100 text-slate-900 text-[8px] font-black uppercase tracking-[0.2em] rounded-b-xl z-20 print:translate-y-0 shadow-sm">
                {student?.campus ? student.campus.toUpperCase() : 'PIONEER\\'S SUPERIOR'}
            </div>`;
        content = content.replace(/<div className="absolute top-0 right-4 py-1 px-3 border-2 border-t-0 border-slate-800 bg-slate-100 text-slate-900 text-\[8px\] font-black uppercase tracking-\[0\.2em\] rounded-b-xl z-20 print:translate-y-0 shadow-sm">\s*\{copyType\}\s*<\/div>/, replacement);
    }

    // Change copyType="SCHOOL COPY" to dynamic
    if (content.includes('copyType="SCHOOL COPY"')) {
        content = content.replace(/copyType="SCHOOL COPY"/g, "copyType={student?.campus?.toLowerCase().includes('college') ? 'COLLEGE COPY' : 'SCHOOL COPY'}");
    }

    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Patched ' + filepath);
}

patchFile('./src/components/FeeVoucher.tsx');
patchFile('./src/components/BulkFeeVoucher.tsx');
