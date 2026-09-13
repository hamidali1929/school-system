const fs = require('fs');
let text = fs.readFileSync('src/pages/Courses.tsx', 'utf8');
text = text.replace(
    "import Swal from 'sweetalert2';",
    "import Swal from 'sweetalert2';\nimport { CertificateGenerator } from '../components/CertificateGenerator';"
);
fs.writeFileSync('src/pages/Courses.tsx', text);
console.log("Import added!");
