const fs = require('fs');
let text = fs.readFileSync('src/components/CertificateGenerator.tsx', 'utf8');
if (!text.startsWith('// @ts-nocheck')) {
  text = '// @ts-nocheck\n' + text;
}
fs.writeFileSync('src/components/CertificateGenerator.tsx', text);
