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
                    const toFixIds = students.filter(s => !s.campus || !validCampusNames.has(s.campus.toLowerCase().trim())).map(s => s.id);
                    setStudents(prev => prev.map(s => {
                        if (toFixIds.includes(s.id)) {
                            return { ...s, campus: defaultCampusName };
                        }
                        return s;
                    }));
                    // Supabase sync
                    if (toFixIds.length > 0) {
                        supabase.from('students').update({ campus: defaultCampusName }).in('id', toFixIds).catch(console.error);
                    }
                }
                
                if (hasInvalidTeachers) {
                    const toFixIds = teachers.filter(t => !t.campus || !validCampusNames.has(t.campus.toLowerCase().trim())).map(t => t.id);
                    setTeachers(prev => prev.map(t => {
                        if (toFixIds.includes(t.id)) {
                            return { ...t, campus: defaultCampusName };
                        }
                        return t;
                    }));
                    if (toFixIds.length > 0) {
                        supabase.from('teachers').update({ campus: defaultCampusName }).in('id', toFixIds).catch(console.error);
                    }
                }
            }
        }
    }, [campuses]);
`;

content = content.replace(/\/\/ Auto-Fix invalid campuses[\s\S]*?\}, \[campuses\]\);/, injection.trim());
fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
console.log("Updated injection with DB sync.");
