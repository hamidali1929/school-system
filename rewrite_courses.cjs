const fs = require('fs');

let content = fs.readFileSync('src/pages/Courses.tsx', 'utf8');

// 1. Remove the import
content = content.replace("import { CertificateGenerator } from '../components/CertificateGenerator';\n", "");

// 2. We don't need isCertificateOpen and certificateData anymore, but it doesn't hurt to keep them or we can remove them.
// Let's replace the generateCertificate function.

const oldGenerateCertStart = "const generateCertificate = (enrollment: any, course: any) => {";
const oldGenerateCertCode = `    const generateCertificate = (enrollment: any, course: any) => {
        const studentName = enrollment.isOutsider ? enrollment.outsiderDetails?.name : students.find(s => s.id === enrollment.studentId)?.name;
        setCertificateData({
            studentName: studentName || 'Unknown Student',
            courseName: course?.title || 'Unknown Course',
            enrollmentDate: enrollment.enrollmentDate
        });
        setIsCertificateOpen(true);
    };`;

const handlePrintCertStr = `
    const handlePrintCertificate = (data: any) => {
        const certData = data;
        if (!certData) return;
        const serialNumber = \`CERT-\${Math.random().toString(36).substr(2, 9).toUpperCase()}\`;

        const WindowPrt = window.open('', '', 'left=0,top=0,width=1200,height=900,toolbar=0,scrollbars=0,status=0');
        if (WindowPrt) {
            WindowPrt.document.write(\`
                <html>
                    <head>
                        <title>Official Certificate of Excellence</title>
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
                                    display: flex; justify-content: center; align-items: center; 
                                    min-height: 100vh;
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
                                }
                                
                                /* 3D Curved Luxury Border System */
                                .border-layer-1 {
                                    height: 100%; width: 100%;
                                    border: 8px double #c5a059;
                                    border-radius: 40px;
                                    padding: 4px;
                                    box-sizing: border-box;
                                    position: relative;
                                    background: #fff;
                                    box-shadow: inset 0 0 30px rgba(197, 160, 89, 0.1);
                                }
                                .border-layer-2 {
                                    height: 100%; width: 100%;
                                    border: 2px solid #c5a059;
                                    border-radius: 32px;
                                    padding: 12px;
                                    box-sizing: border-box;
                                    background: #fdfbf7;
                                    position: relative;
                                }
                                .border-layer-3 {
                                    height: 100%; width: 100%;
                                    border: 1px solid #e5d5b7;
                                    border-radius: 24px;
                                    box-sizing: border-box;
                                    background: white;
                                    position: relative;
                                    padding: 25px 45px;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    background-image: 
                                        radial-gradient(#c5a05910 1.5px, transparent 1.5px),
                                        linear-gradient(135deg, #ffffff 0%, #faf7f2 50%, #ffffff 100%);
                                    background-size: 30px 30px, 100% 100%;
                                    box-shadow: inset 0 0 50px rgba(197, 160, 89, 0.05);
                                }
    
                                /* Ornate Corner Elements */
                                .corner-ornament {
                                    position: absolute; width: 90px; height: 90px;
                                    pointer-events: none; z-index: 5;
                                }
                                .top-left { top: 12px; left: 12px; border-top: 5px solid #c5a059; border-left: 5px solid #c5a059; border-radius: 30px 0 0 0; }
                                .top-right { top: 12px; right: 12px; border-top: 5px solid #c5a059; border-right: 5px solid #c5a059; border-radius: 0 30px 0 0; }
                                .bottom-left { bottom: 12px; left: 12px; border-bottom: 5px solid #c5a059; border-left: 5px solid #c5a059; border-radius: 0 0 0 30px; }
                                .bottom-right { bottom: 12px; right: 12px; border-bottom: 5px solid #c5a059; border-right: 5px solid #c5a059; border-radius: 0 0 30px 0; }
    
                                .header { display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 5px; }
                                .logo-box { width: 90px; height: 90px; padding: 10px; background: #fff; border: 2px solid #c5a059; border-radius: 20px; box-shadow: 0 10px 20px rgba(197, 160, 89, 0.15); }
                                .logo-img { width: 100%; height: 100%; object-fit: contain; }
                                
                                .school-info { text-align: center; flex: 1; margin: 0 20px; }
                                .school-name { 
                                    font-family: 'Cinzel', serif; 
                                    font-size: 42px; 
                                    color: #1a1a1a; 
                                    margin: 0; 
                                    font-weight: 900; 
                                    letter-spacing: 2px;
                                    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                                }
                                .subtitle { 
                                    font-size: 11px; 
                                    color: #666; 
                                    font-weight: 800; 
                                    letter-spacing: 5px; 
                                    text-transform: uppercase; 
                                    margin-top: 5px;
                                    font-family: 'Outfit', sans-serif;
                                }
                                
                                .cert-title-calligraphy { 
                                    font-family: 'Great Vibes', cursive; 
                                    font-size: 100px; 
                                    color: #c5a059; 
                                    margin: 0px 0 5px; 
                                    line-height: 0.9;
                                    text-shadow: 1px 1px 0px #fff, 3px 3px 6px rgba(197,160,89,0.3);
                                }
                                
                                .award-banner {
                                    background: linear-gradient(to right, #1a1a1a, #333, #1a1a1a);
                                    color: #e5d5b7;
                                    padding: 8px 40px;
                                    border-radius: 50px;
                                    font-family: 'Cinzel', serif;
                                    font-size: 14px;
                                    font-weight: 800;
                                    letter-spacing: 5px;
                                    margin-bottom: 20px;
                                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                                    border: 1px solid #c5a059;
                                }
    
                                .presented-to { 
                                    font-family: 'EB Garamond', serif;
                                    font-size: 18px; 
                                    font-style: italic;
                                    color: #666; 
                                    margin-bottom: 5px; 
                                    letter-spacing: 1px;
                                }
                                
                                .student-name { 
                                    font-family: 'Cinzel', serif; 
                                    font-size: 55px; 
                                    color: #c5a059; 
                                    margin-bottom: 12px; 
                                    font-weight: 900; 
                                    border-bottom: 2px solid #c5a05950;
                                    min-width: 550px;
                                    text-align: center;
                                    padding-bottom: 5px;
                                    text-shadow: 1px 1px 2px rgba(0,0,0,0.05);
                                }
    
                                .narrative {
                                    text-align: center;
                                    font-size: 18px;
                                    color: #444;
                                    line-height: 1.8;
                                    max-width: 800px;
                                    margin: 0 auto 30px;
                                }
                                .narrative b {
                                    color: #1a1a1a;
                                    font-family: 'Cinzel', serif;
                                    font-size: 20px;
                                    margin: 0 4px;
                                }
    
                                .medal-container {
                                    position: relative;
                                    width: 120px; height: 120px;
                                    margin-bottom: -10px;
                                    z-index: 10;
                                }
                                .gold-medal {
                                    width: 100%; height: 100%;
                                    border-radius: 50%;
                                    background: linear-gradient(135deg, #d4af37 0%, #ffdf73 25%, #997a00 50%, #ffdf73 75%, #d4af37 100%);
                                    border: 4px solid #fff;
                                    box-shadow: 0 10px 20px rgba(0,0,0,0.2), inset 0 0 15px rgba(255,255,255,0.5);
                                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                                    position: relative;
                                }
                                .gold-medal::before {
                                    content: '';
                                    position: absolute; top: 4px; left: 4px; right: 4px; bottom: 4px;
                                    border-radius: 50%;
                                    border: 2px dashed rgba(255,255,255,0.5);
                                }
                                .medal-pos { font-family: 'Cinzel', serif; font-size: 36px; font-weight: 900; color: #fff; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); line-height: 1; }
                                .medal-suffix { font-size: 14px; vertical-align: super; }
                                .medal-label { font-family: 'Outfit', sans-serif; font-size: 10px; font-weight: 800; color: #fff; letter-spacing: 2px; margin-top: 5px; }
                                
                                .footer { 
                                    width: 100%; 
                                    position: absolute; 
                                    bottom: 35px; 
                                    left: 60px; 
                                    right: 60px;
                                    display: flex; 
                                    justify-content: space-between; 
                                    padding: 0 30px; 
                                }
                                .sig-box { text-align: center; width: 220px; z-index: 10; }
                                .sig-line { border-top: 1.5px solid #1a1a1a; margin-bottom: 8px; }
                                .sig-label { font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 900; color: #000; text-transform: uppercase; letter-spacing: 3px; }
    
                                .watermark { 
                                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                                    width: 550px; height: 550px; opacity: 0.03; pointer-events: none;
                                    background: url("\${settings.logo1 || ''}") center/contain no-repeat;
                                    filter: grayscale(100%) sepia(100%) hue-rotate(5deg) saturate(200%);
                                }
                              .registry-info {
                                  position: absolute; 
                                  bottom: 10mm; 
                                  left: 50mm; 
                                  right: 50mm;
                                  font-family: 'Outfit', sans-serif; 
                                  font-size: 7px; 
                                  font-weight: 800; 
                                  color: #ccc;
                                  display: flex; 
                                  justify-content: space-between;
                                  letter-spacing: 1.5px;
                                  text-transform: uppercase;
                                  z-index: 100;
                              }
                          </style>
                      </head>
                      <body>
                          <div class="cert-page">
                              <div class="border-layer-1">
                                  <div class="border-layer-2">
                                      <div class="border-layer-3">
                                          <div class="corner-ornament top-left"></div>
                                          <div class="corner-ornament top-right"></div>
                                          <div class="corner-ornament bottom-left"></div>
                                          <div class="corner-ornament bottom-right"></div>
                                          <div class="watermark"></div>
  
                                          <div class="header">
                                              <div class="logo-box">
                                                  <img src="\${settings.logo1 || ''}" class="logo-img">
                                              </div>
                                              <div class="school-info">
                                                  <h1 class="school-name">\${settings.schoolName || 'TIMES PUBLIC SCHOOL'}</h1>
                                                  <div class="subtitle">\${settings.subTitle || 'Near Mehria Town Gate # 02 Attock'}</div>
                                              </div>
                                              <div class="logo-box">
                                                  <img src="\${settings.logo2 || settings.logo1 || ''}" class="logo-img">
                                              </div>
                                          </div>
  
                                          <div class="cert-title-calligraphy">Certificate of Achievement</div>
                                          
                                          <div class="award-banner">
                                              \${certData?.type === 'course' ? 'PROFESSIONAL CERTIFICATION' : certData?.isCustom ? (certData.category || 'Special Award').toUpperCase() : 'ACADEMIC MERIT AWARD'}
                                          </div>
  
                                          <div class="presented-to">This honorable distinction is proudly presented to</div>
                                          <div class="student-name">\${certData?.student?.name || '---'}</div>
  
                                          <div class="narrative">
                                              \${certData?.type === 'course' ? \`
                                                  Has successfully completed the professional computer course in
                                                  <b>\${certData.course || 'Technology'}</b> spanning a duration of
                                                  <b>\${certData.duration || 'Specified Period'}</b>, and achieved 
                                                  <b>Grade \${certData.grade || 'A'}</b>. 
                                                  This certificate recognizes your dedication and technical excellence.
                                              \` : certData?.isCustom ? \`
                                                  Has demonstrated exceptional prowess and dedication by achieving
                                                  <b>\${certData.position || 'Outstanding Success'}</b> in the 
                                                  <b>\${certData.event || 'Institutional Category'}</b> event. 
                                                  Your pursuit of excellence serves as an inspiration to the entire academic community.
                                              \` : \`
                                                  For securing the <b>\${certData?.result?.position || '1'}\${certData?.result?.position === 1 ? 'st' : certData?.result?.position === 2 ? 'nd' : certData?.result?.position === 3 ? 'rd' : 'th'} Position</b> 
                                                  in the <b>\${certData?.exam?.name || 'Official Examination'}</b> 
                                                  with a commendable aggregate of <b>\${certData?.result?.percentage?.toFixed(1) || '0.0'}%</b>.
                                                  This certificate recognizes your hard work, intelligence, and academic dedication.
                                              \`}
                                          </div>
  
                                          <div class="medal-container">
                                              <div class="gold-medal">
                                                  <div class="medal-pos">
                                                      \${certData?.type === 'course' ? (certData.grade || 'A+') : certData?.isCustom ? (certData.position?.includes('1') ? '1' : certData.position?.includes('2') ? '2' : '⭐') : (certData?.result?.position || '1')}
                                                      \${certData?.type === 'course' ? '' : !certData?.isCustom || (certData.position?.includes('1') || certData.position?.includes('2')) ? \`<span class="medal-suffix">\${certData?.isCustom ? (certData.position?.includes('1') ? 'st' : 'nd') : (certData?.result?.position === 1 ? 'st' : certData?.result?.position === 2 ? 'nd' : certData?.result?.position === 3 ? 'rd' : 'th')}</span>\` : ''}
                                                  </div>
                                                  <div class="medal-label">\${certData?.type === 'course' ? 'GRADE' : 'Rank / Merit'}</div>
                                              </div>
                                          </div>
  
                                          <div class="footer">
                                              <div class="sig-box">
                                                  <div class="sig-line"></div>
                                                  <div class="sig-label">PRINCIPAL SIGNATURE</div>
                                              </div>
                                              <div class="sig-box">
                                                  <div class="sig-line"></div>
                                                  <div class="sig-label">ADMINISTRATOR</div>
                                              </div>
                                          </div>
  
                                          </div>
                                      </div>
                                  </div>
                              </div>
  
                              <div class="registry-info">
                                  <div>ID: \${serialNumber}</div>
                                  <div>OFFICIAL RECORD VERIFIED</div>
                                  <div>DATED: \${new Date().toLocaleDateString('en-GB')}</div>
                              </div>
                          </div>
                          <script>
                              window.onload = function() {
                                  setTimeout(function() {
                                      window.print();
                                      window.onafterprint = function() { window.close(); };
                                  }, 1200);
                              };
                          </script>
                      </body>
                  </html>
              \`);
              WindowPrt.document.close();
          }
      };

    const generateCertificate = (enrollment: any, course: any) => {
        const studentName = enrollment.isOutsider ? enrollment.outsiderDetails?.name : students.find((s:any) => s.id === enrollment.studentId)?.name;
        
        const data = {
            type: 'course',
            student: { name: studentName || 'Unknown Student' },
            course: course?.title || 'Unknown Course',
            duration: course?.duration || 'Completed',
            grade: 'A+' 
        };
        handlePrintCertificate(data);
    };`;

content = content.replace(oldGenerateCertCode, handlePrintCertStr);

// 3. Remove the rendered <CertificateGenerator /> component
const certGenJSX = `<CertificateGenerator
                isOpen={isCertificateOpen}
                onClose={() => setIsCertificateOpen(false)}
                studentName={certificateData.studentName}
                courseName={certificateData.courseName}
                enrollmentDate={certificateData.enrollmentDate}
                logoUrl={settings.logo1}
            />`;

content = content.replace(certGenJSX, "");

fs.writeFileSync('src/pages/Courses.tsx', content);
console.log("Rewrite complete!");
