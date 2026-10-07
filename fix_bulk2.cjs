const fs = require('fs');
let content = fs.readFileSync('src/components/BulkFeeVoucher.tsx', 'utf8');

content = content.replace(/const \{ settings, students, feeStructure, attendance \} = useStore\(\);/, 'const { settings, students, feeStructure, attendance, campuses, classPrograms } = useStore();');

fs.writeFileSync('src/components/BulkFeeVoucher.tsx', content, 'utf8');
console.log("Fixed BulkFeeVoucher store variables");
