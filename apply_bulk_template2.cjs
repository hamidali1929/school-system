const fs = require('fs');

let code = fs.readFileSync('src/pages/Courses.tsx', 'utf8');

// 1. We replace handlePrintCertificate all the way to its end.
const printStart = code.indexOf('const handlePrintCertificate =');
const printEndStr = 'WindowPrt.document.close();\r\n        }\r\n    };';
const printEnd = code.indexOf(printEndStr, printStart);

if (printStart === -1 || printEnd === -1) {
    console.error("Could not find print block bounds");
} else {
    const printBlock = code.substring(printStart, printEnd + printEndStr.length);
    
    const newPrintLogic = `const handlePrintCertificate = (certificatesData: any[]) => {
        if (!certificatesData || certificatesData.length === 0) return;

        const WindowPrt = window.open('', '', 'left=0,top=0,width=1200,height=900,toolbar=0,scrollbars=0,status=0');
        if (WindowPrt) {
            WindowPrt.document.write(\`
                <html>
                    <head>
                        <title>Official Certificates</title>
                        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Cinzel:wght@600;900&family=Outfit:wght@400;600;800&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
                        <style>
                                @media print {
                                    @page { size: A4 landscape; margin: 0 !important; }
                                    body { margin: 0 !important; padding: 0 !important; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                    .cert-page { width: 297mm; height: 210mm; page-break-after: always; margin: 0; overflow: hidden; transform: scale(1); box-sizing: border-box; }
                                }
                                @page { size: A4 landscape; margin: 0 !important; }
                                body { 
                                    margin: 0; padding: 0; 
                                    background: #fafafa; 
                                    display: flex; flex-direction: column; align-items: center; 
                                    font-family: 'EB Garamond', "Times New Roman", serif;
                                }
                                .cert-page {
                                    width: 297mm;
                                    height: 210mm;
                                    background: #fff;
                                    padding: 10mm;
                                    box-sizing: border-box;
                                    position: relative;
                                    overflow: hidden;
                                    margin-bottom: 20px;
                                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                                }
                                @media print {
                                    .cert-page { margin-bottom: 0; box-shadow: none; }
                                }
                                
                                /* 3D Curved Luxury Border System */
                                .border-layer-1 { height: 100%; width: 100%; border: 8px double #c5a059; border-radius: 40px; padding: 4px; box-sizing: border-box; position: relative; background: #fff; box-shadow: inset 0 0 30px rgba(197, 160, 89, 0.1); }
                                .border-layer-2 { height: 100%; width: 100%; border: 2px solid #c5a059; border-radius: 32px; padding: 12px; box-sizing: border-box; position: relative; }
                                .border-layer-3 { height: 100%; width: 100%; border: 1px solid rgba(197, 160, 89, 0.5); border-radius: 24px; padding: 25px; box-sizing: border-box; position: relative; background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(197,160,89,0.03) 50%, rgba(255,255,255,0) 100%); }
                                
                                .corner-ornament { position: absolute; width: 60px; height: 60px; border: 2px solid #c5a059; border-radius: 10px; opacity: 0.7; }
                                .corner-tl { top: -10px; left: -10px; border-right: none; border-bottom: none; }
                                .corner-tr { top: -10px; right: -10px; border-left: none; border-bottom: none; }
                                .corner-bl { bottom: -10px; left: -10px; border-right: none; border-top: none; }
                                .corner-br { bottom: -10px; right: -10px; border-left: none; border-top: none; }
                                .corner-dot { position: absolute; width: 8px; height: 8px; background: #c5a059; border-radius: 50%; }
                                .dot-tl { top: 10px; left: 10px; }
                                .dot-tr { top: 10px; right: 10px; }
                                .dot-bl { bottom: 10px; left: 10px; }
                                .dot-br { bottom: 10px; right: 10px; }

                                .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.03; width: 450px; height: 450px; background-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png'); background-size: contain; background-repeat: no-repeat; background-position: center; filter: grayscale(100%); z-index: 0; pointer-events: none; }
                                
                                .content-wrapper { position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
                                
                                .header { text-align: center; margin-top: 10px; position: relative; }
                                .school-name { font-family: 'Cinzel', serif; font-size: 38px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; text-transform: uppercase; margin: 0; line-height: 1.2; text-shadow: 1px 1px 0px rgba(197, 160, 89, 0.3); }
                                .subtitle { font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; color: #c5a059; letter-spacing: 6px; text-transform: uppercase; margin-top: 8px; margin-bottom: 25px; }
                                
                                .cert-title-container { position: relative; display: inline-block; padding: 0 40px; }
                                .cert-title { font-family: 'Playfair Display', serif; font-size: 46px; font-weight: 900; color: #1a1a1a; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
                                .cert-title::before, .cert-title::after { content: ''; position: absolute; top: 50%; width: 60px; height: 2px; background: #c5a059; }
                                .cert-title::before { left: -30px; }
                                .cert-title::after { right: -30px; }

                                .body-content { text-align: center; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; margin-top: -20px; }
                                .presented-to { font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 600; color: #666; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 15px; }
                                .student-name { font-family: 'Great Vibes', cursive; font-size: 72px; color: #c5a059; margin: 0 0 20px 0; line-height: 1; text-shadow: 2px 2px 4px rgba(0,0,0,0.05); }
                                .name-underline { width: 400px; height: 1px; background: linear-gradient(90deg, transparent, #c5a059, transparent); margin: 0 auto 30px auto; }
                                .narrative { font-size: 22px; color: #333; line-height: 1.6; max-width: 750px; margin: 0 auto; font-style: italic; }
                                .narrative strong { font-family: 'Playfair Display', serif; font-size: 26px; color: #1a1a1a; font-style: normal; font-weight: 900; }
                                .narrative b { font-family: 'Playfair Display', serif; font-size: 26px; color: #1a1a1a; font-style: normal; font-weight: 900; }

                                .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; padding: 0 50px; box-sizing: border-box; width: 100%; }
                                .signature-box { text-align: center; width: 220px; }
                                .signature-line { width: 100%; height: 1px; background: #333; margin-bottom: 10px; position: relative; }
                                .signature-line::before, .signature-line::after { content: ''; position: absolute; bottom: -3px; width: 6px; height: 6px; border-radius: 50%; background: #c5a059; }
                                .signature-line::before { left: 0; }
                                .signature-line::after { right: 0; }
                                .signature-title { font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600; color: #666; letter-spacing: 2px; text-transform: uppercase; }
                                
                                .seal-container { position: relative; width: 140px; height: 140px; display: flex; justify-content: center; align-items: center; }
                                .seal-outer { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 4px dashed #c5a059; animation: spin 20s linear infinite; }
                                .seal-inner { position: relative; width: 110px; height: 110px; background: linear-gradient(135deg, #d4af37 0%, #aa7700 100%); border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 5px 15px rgba(197, 160, 89, 0.4), inset 0 2px 5px rgba(255,255,255,0.5); }
                                .seal-inner::before { content: ''; position: absolute; width: 96px; height: 96px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); }
                                .seal-text { font-family: 'Cinzel', serif; font-size: 10px; font-weight: 900; color: white; text-align: center; line-height: 1.2; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
                                .seal-ribbon { position: absolute; bottom: -20px; width: 80px; height: 40px; background: #c5a059; z-index: -1; clip-path: polygon(0 0, 100% 0, 80% 100%, 50% 80%, 20% 100%); }

                                .meta-info { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); font-family: 'Outfit', sans-serif; font-size: 9px; color: #999; letter-spacing: 1px; }

                                @keyframes spin { 100% { transform: rotate(360deg); } }
                        </style>
                    </head>
                    <body>
                        \${certificatesData.map(certData => \`
                        <div class="cert-page">
                            <div class="border-layer-1">
                                <div class="border-layer-2">
                                    <div class="border-layer-3">
                                        <div class="corner-ornament corner-tl"></div>
                                        <div class="corner-ornament corner-tr"></div>
                                        <div class="corner-ornament corner-bl"></div>
                                        <div class="corner-ornament corner-br"></div>
                                        <div class="corner-dot dot-tl"></div>
                                        <div class="corner-dot dot-tr"></div>
                                        <div class="corner-dot dot-bl"></div>
                                        <div class="corner-dot dot-br"></div>
                                        
                                        <div class="watermark"></div>
                                        
                                        <div class="content-wrapper">
                                            <div class="header">
                                                <h1 class="school-name">\${certData.schoolName || 'Education Institute'}</h1>
                                                <div class="subtitle">Excellence in Professional Education</div>
                                                <div class="cert-title-container">
                                                    <h2 class="cert-title">Certificate</h2>
                                                </div>
                                            </div>
                                            
                                            <div class="body-content">
                                                <div class="presented-to">This is proudly presented to</div>
                                                <h3 class="student-name">\${certData.student.name}</h3>
                                                <div class="name-underline"></div>
                                                <div class="narrative">\${certData.customNarrative}</div>
                                            </div>
                                            
                                            <div class="footer">
                                                <div class="signature-box">
                                                    <div class="signature-line"></div>
                                                    <div class="signature-title">Administrator</div>
                                                </div>
                                                
                                                <div class="seal-container">
                                                    <div class="seal-outer"></div>
                                                    <div class="seal-ribbon"></div>
                                                    <div class="seal-inner">
                                                        <div class="seal-text">OFFICIAL<br/>SEAL OF<br/>EXCELLENCE</div>
                                                    </div>
                                                </div>
                                                
                                                <div class="signature-box">
                                                    <div class="signature-line"></div>
                                                    <div class="signature-title">Principal</div>
                                                </div>
                                            </div>
                                            
                                            <div class="meta-info">
                                                ID: \${certData.serialNumber} | Date: \${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        \`).join('')}
                        <script>
                            setTimeout(() => {
                                window.print();
                                window.close();
                            }, 1000);
                        </script>
                    </body>
                </html>
            \`);
            WindowPrt.document.close();
        }
    };`;
    
    code = code.replace(printBlock, newPrintLogic);
}

// 2. Replace generateCertificate & handleGenerateCertificateWithCustomText
const genStart = code.indexOf('const generateCertificate =');
const genEndStr = 'handlePrintCertificate(data);\r\n    };';
const genEnd = code.indexOf(genEndStr, genStart);

if (genStart === -1 || genEnd === -1) {
    console.error("Could not find gen block bounds");
} else {
    const genBlock = code.substring(genStart, genEnd + genEndStr.length);
    
    const newGenLogic = `const getDefaultNarrative = () => {
        return settings.certificateTemplate || "Has successfully completed the professional computer course in <strong>[COURSE_NAME]</strong>. This certificate recognizes your dedication and technical excellence.";
    };

    const generateCertificate = (enrollment: any, course: any) => {
        const studentName = enrollment.isOutsider ? enrollment.outsiderDetails?.name : students.find((s:any) => s.id === enrollment.studentId)?.name;
        
        let narrative = getDefaultNarrative();
        narrative = narrative.replace(/\\[COURSE_NAME\\]/g, course?.title || 'Technology');
        narrative = narrative.replace(/\\[STUDENT_NAME\\]/g, studentName || 'Student');

        const data = {
            type: 'course',
            schoolName: settings.schoolName,
            student: { name: studentName || 'Unknown Student' },
            course: course?.title || 'Unknown Course',
            customNarrative: narrative,
            serialNumber: \`CERT-\${Math.random().toString(36).substr(2, 9).toUpperCase()}\`
        };
        handlePrintCertificate([data]);
    };

    const handleBulkGenerate = () => {
        if (courseEnrollments.length === 0) {
            Swal.fire('Error', 'No enrollments found to generate certificates.', 'error');
            return;
        }

        const certificatesData = courseEnrollments.map(enrollment => {
            const course = skillCourses.find(c => c.id === enrollment.courseId);
            const studentName = enrollment.isOutsider ? enrollment.outsiderDetails?.name : students.find((s:any) => s.id === enrollment.studentId)?.name;
            
            let narrative = getDefaultNarrative();
            narrative = narrative.replace(/\\[COURSE_NAME\\]/g, course?.title || 'Technology');
            narrative = narrative.replace(/\\[STUDENT_NAME\\]/g, studentName || 'Student');

            return {
                type: 'course',
                schoolName: settings.schoolName,
                student: { name: studentName || 'Unknown Student' },
                course: course?.title || 'Unknown Course',
                customNarrative: narrative,
                serialNumber: \`CERT-\${Math.random().toString(36).substr(2, 9).toUpperCase()}\`
            };
        });

        handlePrintCertificate(certificatesData);
    };

    const handleSaveTemplate = (customHTML: string) => {
        updateSettings({ certificateTemplate: customHTML });
        Swal.fire('Saved', 'Certificate template updated successfully!', 'success');
    };`;
    
    code = code.replace(genBlock, newGenLogic);
}

// 3. Update the modal props
code = code.replace(
    /onGenerate=\{handleGenerateCertificateWithCustomText\}/,
    'onGenerate={handleSaveTemplate}'
);

// Check if updateSettings is in useStore destructuring
if (!code.includes('updateSettings } = useStore();')) {
    code = code.replace('teachers, settings } = useStore();', 'teachers, settings, updateSettings } = useStore();');
}

fs.writeFileSync('src/pages/Courses.tsx', code);
console.log('Courses.tsx updated with precise replace logic!');
