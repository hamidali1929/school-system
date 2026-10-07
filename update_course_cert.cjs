const fs = require('fs');

function updateCourses() {
    let content = fs.readFileSync('src/pages/Courses.tsx', 'utf8');

    // 1. Rewrite generateCertificate function
    const oldGenCertRegex = /const generateCertificate = \(enrollment: any, course: any\) => \{[\s\S]*?handlePrintCertificate\(data\);\s*\};/;
    
    const newGenCert = `const generateCertificate = async (enrollment: any, course: any) => {
        const studentName = enrollment.isOutsider ? enrollment.outsiderDetails?.name : students.find((s:any) => s.id === enrollment.studentId)?.name;
        
        const defaultNarrative = \`Has successfully completed the professional computer course in <b>\${course?.title || 'Technology'}</b>. This certificate recognizes your dedication and technical excellence.\`;

        const { value: customText } = await Swal.fire({
            title: 'Edit Certificate Text',
            input: 'textarea',
            inputValue: defaultNarrative,
            inputLabel: 'Edit the English text. You can use <b>text</b> for bold.',
            showCancelButton: true,
            confirmButtonText: 'Generate & Print',
            cancelButtonText: 'Cancel',
            width: '600px'
        });

        if (customText) {
            const data = {
                type: 'course',
                student: { name: studentName || 'Unknown Student' },
                course: course?.title || 'Unknown Course',
                customNarrative: customText
            };
            handlePrintCertificate(data);
        }
    };`;

    content = content.replace(oldGenCertRegex, newGenCert);

    // 2. Update narrative HTML inside handlePrintCertificate
    const oldNarrativeHTML = `\${certData?.type === 'course' ? \`
                                                    Has successfully completed the professional computer course in
                                                  <b>\${certData.course || 'Technology'}</b>. 
                                                  This certificate recognizes your dedication and technical excellence.
                                                \``;
                                                
    const newNarrativeHTML = `\${certData?.type === 'course' ? (certData.customNarrative || \`
                                                    Has successfully completed the professional computer course in
                                                  <b>\${certData.course || 'Technology'}</b>. 
                                                  This certificate recognizes your dedication and technical excellence.
                                                \`)`;

    // Try a broad replace
    content = content.replace(/\$\{certData\?\.type === 'course' \? `[\s\S]*?` \: certData\?\.isCustom \? `/g, 
        `\${certData?.type === 'course' ? (certData.customNarrative || \`Has successfully completed the professional computer course in <b>\${certData.course || 'Technology'}</b>. This certificate recognizes your dedication and technical excellence.\`) : certData?.isCustom ? \``);

    fs.writeFileSync('src/pages/Courses.tsx', content);
    console.log("Updated Courses.tsx");
}

updateCourses();
