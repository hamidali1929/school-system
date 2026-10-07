const fs = require('fs');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix footer
    const oldFooter = `.footer { 
                                    width: 100%; 
                                    position: absolute; 
                                    bottom: 35px; 
                                    left: 60px; 
                                    right: 60px;
                                    display: flex; 
                                    justify-content: space-between; 
                                    padding: 0 30px; 
                                }`;
    const newFooter = `.footer { 
                                    width: 100%; 
                                    position: absolute; 
                                    bottom: 35px; 
                                    left: 0; 
                                    box-sizing: border-box;
                                    display: flex; 
                                    justify-content: space-between; 
                                    padding: 0 80px; 
                                }`;

    // Try a more robust replace for footer if exact match fails
    content = content.replace(/\.footer\s*\{\s*width:\s*100%;\s*position:\s*absolute;\s*bottom:\s*35px;\s*left:\s*60px;\s*right:\s*60px;\s*display:\s*flex;\s*justify-content:\s*space-between;\s*padding:\s*0\s*30px;\s*\}/g, 
        `.footer { \n                                    width: 100%; \n                                    position: absolute; \n                                    bottom: 35px; \n                                    left: 0; \n                                    box-sizing: border-box;\n                                    display: flex; \n                                    justify-content: space-between; \n                                    padding: 0 80px; \n                                }`);


    // Fix narrative
    const oldNarrative = ` Has successfully completed the professional computer course in
                                                <b>\${certData.course || 'Technology'}</b> spanning a duration of
                                                <b>\${certData.duration || 'Specified Period'}</b>, and achieved 
                                                <b>Grade \${certData.grade || 'A'}</b>. 
                                                This certificate recognizes your dedication and technical excellence.`;
    
    // Replace using regex to avoid whitespace issues
    content = content.replace(/Has successfully completed the professional computer course in\s*<b>\${certData\.course \|\| 'Technology'}<\/b> spanning a duration of\s*<b>\${certData\.duration \|\| 'Specified Period'}<\/b>, and achieved\s*<b>Grade \${certData\.grade \|\| 'A'}<\/b>\.\s*This certificate recognizes your dedication and technical excellence\./g, 
        `Has successfully completed the professional computer course in\n                                                <b>\${certData.course || 'Technology'}</b>. \n                                                This certificate recognizes your dedication and technical excellence.`);


    fs.writeFileSync(filePath, content);
    console.log("Fixed", filePath);
}

fixFile('src/pages/Courses.tsx');
fixFile('src/pages/Exams.tsx');
