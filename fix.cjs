const fs = require('fs');
let code = fs.readFileSync('src/pages/Courses.tsx', 'utf8');

code = code.replace(
  /.footer { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; padding: 0 50px; box-sizing: border-box; width: 100%; }/g,
  '.footer { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; padding: 0 80px; box-sizing: border-box; width: 100%; }'
);
code = code.replace(
  /.signature-box { text-align: center; width: 220px; }/g,
  '.signature-box { text-align: center; width: 180px; }'
);
code = code.replace(
  /.narrative { font-size: 22px; color: #333; line-height: 1.6; max-width: 750px; margin: 0 auto; font-style: italic; }/g,
  '.narrative { font-size: 20px; color: #333; line-height: 1.6; max-width: 750px; margin: 0 auto 20px auto; font-style: italic; }\n                                  .details-row { display: flex; justify-content: center; gap: 40px; margin-bottom: 30px; }\n                                  .detail-item { display: flex; flex-direction: column; align-items: center; border: 1px solid rgba(197, 160, 89, 0.3); padding: 8px 25px; border-radius: 8px; background: rgba(197, 160, 89, 0.02); box-shadow: 0 2px 10px rgba(0,0,0,0.02); }\n                                  .detail-label { font-family: \'Outfit\', sans-serif; font-size: 10px; font-weight: 800; color: #c5a059; text-transform: uppercase; letter-spacing: 2px; }\n                                  .detail-val { font-family: \'Playfair Display\', serif; font-size: 16px; font-weight: 900; color: #1a1a1a; margin-top: 4px; }'
);

const narrativeDiv = '<div class="narrative">${certData.customNarrative}</div>';
const replacementHTML = `<div class="narrative">\${certData.customNarrative}</div>
                                                  <div class="details-row">
                                                      <div class="detail-item">
                                                          <span class="detail-label">Duration</span>
                                                          <span class="detail-val">\${certData.duration || 'N/A'}</span>
                                                      </div>
                                                      <div class="detail-item">
                                                          <span class="detail-label">Phone / Roll No</span>
                                                          <span class="detail-val">\${certData.phone || 'N/A'}</span>
                                                      </div>
                                                      <div class="detail-item">
                                                          <span class="detail-label">Grade</span>
                                                          <span class="detail-val">\${certData.grade || 'A+'}</span>
                                                      </div>
                                                  </div>`;

code = code.replace(narrativeDiv, replacementHTML);

fs.writeFileSync('src/pages/Courses.tsx', code);
console.log('Replaced CSS and HTML');
