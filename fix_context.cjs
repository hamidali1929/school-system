const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

const injection = `
    // Auto-Fix invalid campuses
    useEffect(() => {
        if (students.length > 0 && campuses.length > 0) {
            const validCampusNames = new Set(campuses.map(c => c.name.toLowerCase().trim()));
            const hasInvalidStudents = students.some(s => !s.campus || !validCampusNames.has(s.campus.toLowerCase().trim()));
            const hasInvalidTeachers = teachers.some(t => !t.campus || !validCampusNames.has(t.campus.toLowerCase().trim()));
            
            if (hasInvalidStudents || hasInvalidTeachers) {
                const defaultCampusName = campuses[0].name;
                
                if (hasInvalidStudents) {
                    setStudents(prev => prev.map(s => {
                        if (!s.campus || !validCampusNames.has(s.campus.toLowerCase().trim())) {
                            return { ...s, campus: defaultCampusName };
                        }
                        return s;
                    }));
                }
                
                if (hasInvalidTeachers) {
                    setTeachers(prev => prev.map(t => {
                        if (!t.campus || !validCampusNames.has(t.campus.toLowerCase().trim())) {
                            return { ...t, campus: defaultCampusName };
                        }
                        return t;
                    }));
                }
            }
        }
    }, [campuses]);
`;

if (!content.includes('Auto-Fix invalid campuses')) {
    content = content.replace('// Apply Theme Engine', injection + '\n    // Apply Theme Engine');
    fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
    console.log("Injected auto-fix.");
} else {
    console.log("Already injected.");
}
