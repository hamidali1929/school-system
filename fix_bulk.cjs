const fs = require('fs');
let content = fs.readFileSync('src/components/BulkFeeVoucher.tsx', 'utf8');

const collegeLogic = `
                            const isCollegeClass = student?.class ? ['11th', '12th', '1st year', '2nd year', 'fsc', 'ics', 'icom', 'fa'].some(kw => student.class.toLowerCase().includes(kw)) : false;
                            const isCollegeCampus = campuses?.find(c => c.name === student?.campus)?.type === 'College';
                            const isCollegeProgram = classPrograms?.[student?.class] === 'College';
                            const collegeCopyName = (isCollegeClass || isCollegeCampus || isCollegeProgram) ? 'COLLEGE COPY' : 'SCHOOL COPY';
`;

content = content.replace(/(const studentAbsents = absentMap\[student\.id\] \|\| 0;)/, collegeLogic + '\n                          $1');

fs.writeFileSync('src/components/BulkFeeVoucher.tsx', content, 'utf8');
console.log("Fixed BulkFeeVoucher");
