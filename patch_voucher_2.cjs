const fs = require('fs');

function patchFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');

    // First replace the old dynamic check back to something clean
    content = content.replace(/copyType=\{student\?\.campus\?\.toLowerCase\(\)\.includes\('college'\) \? 'COLLEGE COPY' : 'SCHOOL COPY'\}/g, 'copyType={collegeCopyName}');

    // Now inject collegeCopyName variable before the return statement of FeeVoucher / BulkFeeVoucher mapping
    if (filepath.includes('FeeVoucher.tsx')) {
        // Need to extract campuses from useStore
        if (!content.includes('campuses, classPrograms')) {
            content = content.replace(/const \{ settings, attendance, feeStructure, updateStudent, sendNotification \} = useStore\(\);/, 'const { settings, attendance, feeStructure, updateStudent, sendNotification, campuses, classPrograms } = useStore();');
        }
        
        const collegeLogic = `
    const isCollegeClass = student?.class ? ['11th', '12th', '1st year', '2nd year', 'fsc', 'ics', 'icom', 'fa'].some(kw => student.class.toLowerCase().includes(kw)) : false;
    const isCollegeCampus = campuses?.find(c => c.name === student?.campus)?.type === 'College';
    const isCollegeProgram = classPrograms?.[student?.class] === 'College';
    const collegeCopyName = (isCollegeClass || isCollegeCampus || isCollegeProgram) ? 'COLLEGE COPY' : 'SCHOOL COPY';
`;
        if (!content.includes('const collegeCopyName')) {
            content = content.replace(/(const \[editableTuition, setEditableTuition\] = useState\(0\);)/, collegeLogic + '\n    $1');
        }
    } else if (filepath.includes('BulkFeeVoucher.tsx')) {
        if (!content.includes('campuses, classPrograms')) {
            content = content.replace(/const \{ settings, students, feeStructure, attendance \} = useStore\(\);/, 'const { settings, students, feeStructure, attendance, campuses, classPrograms } = useStore();');
        }

        const collegeLogic = `
                            const isCollegeClass = student?.class ? ['11th', '12th', '1st year', '2nd year', 'fsc', 'ics', 'icom', 'fa'].some(kw => student.class.toLowerCase().includes(kw)) : false;
                            const isCollegeCampus = campuses?.find(c => c.name === student?.campus)?.type === 'College';
                            const isCollegeProgram = classPrograms?.[student?.class] === 'College';
                            const collegeCopyName = (isCollegeClass || isCollegeCampus || isCollegeProgram) ? 'COLLEGE COPY' : 'SCHOOL COPY';
`;
        if (!content.includes('const collegeCopyName')) {
            content = content.replace(/(const tuition = getStudentTuition\(student\);)/, collegeLogic + '\n                            $1');
        }
    }

    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Patched ' + filepath);
}

patchFile('./src/components/FeeVoucher.tsx');
patchFile('./src/components/BulkFeeVoucher.tsx');
