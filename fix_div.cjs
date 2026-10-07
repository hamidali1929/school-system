const fs = require('fs');
let code = fs.readFileSync('src/pages/Courses.tsx', 'utf8');

const regex = /<button onClick=\{\(\) => setIsEnrollModalOpen\(true\)\}[\s\S]*?<\/button>\s*<\/div>/;

if (regex.test(code)) {
    code = code.replace(regex, `<button onClick={() => setIsEnrollModalOpen(true)} className="px-5 py-2.5 bg-brand-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                                <Plus className="w-4 h-4" /> Enroll Student
                            </button>
                        </div>
                    </div>`);
    fs.writeFileSync('src/pages/Courses.tsx', code);
    console.log("Fixed unclosed div!");
} else {
    console.log("Regex didn't match.");
}
