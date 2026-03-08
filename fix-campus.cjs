const fs = require('fs');

// ==== 1. Fix Teachers.tsx ====
let tr = fs.readFileSync('src/pages/Teachers.tsx', 'utf8');
tr = tr.replace(
    'const matchesCampus = campusFilter === \'All\' || t.campus === campusFilter;',
    'const tCampus = t.campus || (campuses[0]?.name || \'Dr Manzoor Campus\');\n        const matchesCampus = campusFilter === \'All\' || tCampus === campusFilter;'
);
fs.writeFileSync('src/pages/Teachers.tsx', tr);

// ==== 2. Fix Timetable.tsx ====
let ti = fs.readFileSync('src/pages/Timetable.tsx', 'utf8');

// A. Fix the replace string mistake
ti = ti.replace(/tableKey\.replace\(`\$\{selectedCampus\}_`, ' '\)/g, "tableKey.replace(`${selectedCampus}_`, '')");

// B. Fix the targetClass Dropdown to only show classes tied to the selected campus
const targetClassReplacement = `
                                {classes.filter(c => {
                                    const hasCampusStudent = students.some(s => s.class === c && (s.campus || campuses[0]?.name) === selectedCampus);
                                    const hasCampusTeacher = teachers.some(t => t.classes.includes(c) && (t.campus || campuses[0]?.name) === selectedCampus);
                                    if (!hasCampusStudent && !hasCampusTeacher) return false;

                                    if (activeWing === 'primary') return !c.includes('(Boys)') && !c.includes('(Girls)') && !['9th', '10th', '1st Year', '2nd Year'].some(p => c.includes(p));
                                    if (activeWing === 'boys') return c.includes('(Boys)');
                                    return c.includes('(Girls)');
                                }).map(c => <option key={c} value={c}>{c}</option>)}
`;

ti = ti.replace(
    /\{classes\.filter\(c => \{\r?\n\s+if \(activeWing === 'primary'\) return !c\.includes\('\(Boys\)'\).*;/g,
    `{classes.filter(c => {
                                    const hasCampusStudent = students.some(s => s.class === c && (s.campus || campuses[0]?.name || 'Dr Manzoor Campus') === selectedCampus);
                                    const hasCampusTeacher = teachers.some(t => t.classes.includes(c) && (t.campus || campuses[0]?.name || 'Dr Manzoor Campus') === selectedCampus);
                                    if (!hasCampusStudent && !hasCampusTeacher) return false;

                                    if (activeWing === 'primary') return !c.includes('(Boys)') && (!c.includes('(Girls)')) && !['9th', '10th', '1st Year', '2nd Year'].some(p => c.includes(p));`
);

// C. Fix timetable teacher fallbacks
ti = ti.replace(
    /return teachers\.filter\(t => !busyIds\.has\(t\.id\) && t\.status === 'Active' && \(!selectedCampus \|\| t\.campus === selectedCampus\)\);/g,
    'return teachers.filter(t => !busyIds.has(t.id) && t.status === \'Active\' && (!selectedCampus || (t.campus || campuses[0]?.name || \'Dr Manzoor Campus\') === selectedCampus));'
);

ti = ti.replace(
    /const availablePool = teachers\.filter\(t => t\.status === 'Active' && \(!selectedCampus \|\| t\.campus === selectedCampus\)\);/g,
    'const availablePool = teachers.filter(t => t.status === \'Active\' && (!selectedCampus || (t.campus || campuses[0]?.name || \'Dr Manzoor Campus\') === selectedCampus));'
);

ti = ti.replace(
    /const clsTeachers = teachers\.filter\(t => t\.status === 'Active' && t\.campus === selectedCampus\);/g,
    'const clsTeachers = teachers.filter(t => t.status === \'Active\' && (t.campus || campuses[0]?.name || \'Dr Manzoor Campus\') === selectedCampus);'
);


fs.writeFileSync('src/pages/Timetable.tsx', ti);
console.log('Fixed scripts successfully!');
