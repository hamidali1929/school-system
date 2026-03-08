const fs = require('fs');

let ttContent = fs.readFileSync('src/pages/Timetable.tsx', 'utf8');

ttContent = ttContent.replace(/updateTimetable\(cls,\s*newTimetables\[cls\]/g, 'updateTimetable(getTimetableKey(cls), newTimetables[cls]');
ttContent = ttContent.replace(/Object\.entries\(timetables\)\.forEach\(\(\[clsName, weekTable\]\) => \{/g, 'Object.entries(timetables).forEach(([tableKey, weekTable]) => {\n            if (!tableKey.startsWith(`${selectedCampus}_`)) return;\n            const clsName = tableKey.replace(`${selectedCampus}_`, \' \');');

ttContent = ttContent.replace(/return teachers\.filter\(t => !busyIds\.has\(t\.id\) && t\.status === 'Active'\);/g, 'return teachers.filter(t => !busyIds.has(t.id) && t.status === \'Active\' && (!selectedCampus || t.campus === selectedCampus));');

ttContent = ttContent.replace(/const availablePool = teachers\.filter\(t => t\.status === 'Active'\);/g, 'const availablePool = teachers.filter(t => t.status === \'Active\' && (!selectedCampus || t.campus === selectedCampus));');

ttContent = ttContent.replace(/const currentTable = timetables\[cls\]\?\.\[day\] \|\| \[\];/g, 'const currentTable = timetables[getTimetableKey(cls)]?.[day] || [];');
ttContent = ttContent.replace(/updateTimetable\(cls,\s*newTable\);/g, 'updateTimetable(getTimetableKey(cls), newTable);');

ttContent = ttContent.replace(/const clsTable = timetables\[cls\] \|\| \{\};/g, 'const clsTable = timetables[getTimetableKey(cls)] || {};');

// We need to fix object iteration places where keys are returned
ttContent = ttContent.replace(/Object\.keys\(timetables\)\.forEach\(cls => \{/g, 'Object.keys(timetables).forEach(tKey => { if (!tKey.startsWith(`${selectedCampus}_`)) return; const cls = tKey.replace(`${selectedCampus}_`, \'\');');

// Add missing loops replacement (if any uses [cls, weekTable]
ttContent = ttContent.replace(/Object\.entries\(timetables\)\.forEach\(\(\[cls, weekTable\]\) => \{/g, 'Object.entries(timetables).forEach(([tableKey, weekTable]) => { if (!tableKey.startsWith(`${selectedCampus}_`)) return; const cls = tableKey.replace(`${selectedCampus}_`, \'\');');

// Add UI Dropdown
const campusSelectHtml = `
                <div className="flex bg-white/5 border border-white/10 p-1 md:p-1.5 rounded-[1.25rem] shadow-sm overflow-hidden flex-nowrap min-w-max">
                    <Layers className="w-5 h-5 text-white/50 p-0.5 ml-2 self-center hidden sm:block" />
                    <select
                        value={selectedCampus}
                        onChange={(e) => setSelectedCampus(e.target.value)}
                        className="bg-transparent text-white border-none py-1.5 px-3 md:px-4 text-[10px] md:text-sm font-black uppercase tracking-widest outline-none hover:bg-white/5 transition-colors cursor-pointer appearance-none rounded-xl disabled:opacity-50"
                        disabled={isGenerating}
                    >
                        {campuses.map(c => <option key={c.id} value={c.name} className="bg-[#001529] text-white py-2">{c.name}</option>)}
                    </select>
                </div>
`;

if (!ttContent.includes('value={selectedCampus}')) {
    ttContent = ttContent.replace(
        '<div className="flex bg-white/5 border border-white/10 p-1 md:p-1.5 rounded-[1.25rem] shadow-sm overflow-hidden flex-nowrap min-w-max">',
        campusSelectHtml + '\n                <div className="flex bg-white/5 border border-white/10 p-1 md:p-1.5 rounded-[1.25rem] shadow-sm overflow-hidden flex-nowrap min-w-max">'
    );
}

ttContent = ttContent.replace(/const slots = timetables\[targetClass\]\?\.\[day\] \|\| \[\];/g, 'const slots = timetables[getTimetableKey(targetClass)]?.[day] || [];');

if (!ttContent.includes('if (!selectedCampus) return')) {
    ttContent = ttContent.replace(
        'return (\n        <div className="min-h-screen bg-[#001529] font-outfit text-white p-4 md:p-6 lg:p-8 space-y-8 pb-32\">\n',
        'if (!selectedCampus) return <div className="p-10 flex h-full items-center justify-center text-center text-white font-bold text-xl uppercase tracking-widest">Please add a Campus first.</div>;\n    return (\n        <div className="min-h-screen bg-[#001529] font-outfit text-white p-4 md:p-6 lg:p-8 space-y-8 pb-32">\n'
    );
}

fs.writeFileSync('src/pages/Timetable.tsx', ttContent);
console.log('Done!');
