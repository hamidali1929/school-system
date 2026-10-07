const fs = require('fs');
let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

const newUpdateCampus = `
    const updateCampus = async (id: string, updates: Partial<Campus>) => {
        const oldCampus = campuses.find(c => c.id === id);
        
        if (oldCampus && updates.name && oldCampus.name !== updates.name) {
            const oldName = oldCampus.name;
            const newName = updates.name;
            
            // Cascade update to students locally
            setStudents(prev => prev.map(s => (s.campus || '').trim().toLowerCase() === oldName.trim().toLowerCase() ? { ...s, campus: newName } : s));
            
            // Cascade update to teachers locally
            setTeachers(prev => prev.map(t => (t.campus || '').trim().toLowerCase() === oldName.trim().toLowerCase() ? { ...t, campus: newName } : t));

            try {
                // Update Supabase
                await supabase.from('students').update({ campus: newName }).ilike('campus', oldName.trim());
                await supabase.from('teachers').update({ campus: newName }).ilike('campus', oldName.trim());
            } catch (err) {
                console.error('Failed to cascade campus name update to Supabase:', err);
            }
        }

        setCampuses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        addAuditLog({
            user: 'Admin',
            action: 'Campus Updated',
            details: \`ID: \${id}\`,
            type: 'System'
        });
    };
`;

content = content.replace(/const updateCampus = \(id: string, updates: Partial<Campus>\) => \{[\s\S]*?type: 'System'\n\s+\}\);\n\s+\};/, newUpdateCampus.trim());

fs.writeFileSync('src/context/StoreContext.tsx', content, 'utf8');
console.log("updateCampus patched");
