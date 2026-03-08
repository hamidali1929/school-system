const fs = require('fs');

// 1. Modify StoreContext.tsx
let store = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

if (!store.includes('bulkAddTeachers')) {
    // Add to interface AppState, it's defined right above 'const StoreContext = '
    store = store.replace(
        'addTeacher: (t: Partial<Teacher>) => Promise<void>;\r\n    updateTeacher:',
        'addTeacher: (t: Partial<Teacher>) => Promise<void>;\r\n    bulkAddTeachers: (teachers: Partial<Teacher>[]) => Promise<void>;\r\n    updateTeacher:'
    );
    // fallback if exact spacing didn't match
    store = store.replace(
        'addTeacher: (t: Partial<Teacher>) => Promise<void>;\n    updateTeacher:',
        'addTeacher: (t: Partial<Teacher>) => Promise<void>;\n    bulkAddTeachers: (teachers: Partial<Teacher>[]) => Promise<void>;\n    updateTeacher:'
    );

    // Implementation of bulkAddTeachers right below addTeacher
    const bulkInsertCode = `
    const bulkAddTeachers = async (teachersArray: Partial<Teacher>[]) => {
        const newTeachers = teachersArray.map((t, idx) => ({
            id: t.id || \`PST-\${Date.now()}-\${Math.floor(Math.random() * 100000) + idx}\`,
            name: t.name || '',
            subject: t.subject || '',
            phone: t.phone || '',
            avatar: t.avatar || (t.name || 'P').charAt(0),
            status: t.status || 'Active',
            classes: t.classes || [],
            whatsappNumber: t.whatsappNumber || '',
            email: t.email || '',
            fatherName: t.fatherName || '',
            password: t.password || '',
            username: t.username || '',
            permissions: t.permissions || [],
            baseSalary: sanitizeNumber(t.baseSalary),
            campus: t.campus || campuses[0]?.name || 'Dr Manzoor Campus',
            ...t
        } as Teacher));

        setTeachers(prev => {
            const updated = [...prev];
            newTeachers.forEach(nt => {
                const index = updated.findIndex(item => item.id === nt.id);
                if (index >= 0) updated[index] = nt;
                else updated.push(nt);
            });
            return updated;
        });

        try {
            await supabase.from('teachers').upsert(newTeachers, { onConflict: 'id' });
        } catch (err) {
            console.error('Failed to strict bulk sync teachers to Supabase:', err);
        }
    };
`;
    store = store.replace(
        'const updateTeacher = async',
        bulkInsertCode + '\n    const updateTeacher = async'
    );

    // Add to export
    store = store.replace(
        'addTeacher,\n            updateTeacher,',
        'addTeacher,\n            bulkAddTeachers,\n            updateTeacher,'
    );
    store = store.replace(
        'addTeacher,\r\n            updateTeacher,',
        'addTeacher,\r\n            bulkAddTeachers,\r\n            updateTeacher,'
    );

    fs.writeFileSync('src/context/StoreContext.tsx', store);
}

// 2. Modify Teachers.tsx
let tch = fs.readFileSync('src/pages/Teachers.tsx', 'utf8');

tch = tch.replace(
    /const \{ teachers, deleteTeacher, addTeacher, campuses, updateTeacher \} = useStore\(\);/g,
    'const { teachers, deleteTeacher, campuses, updateTeacher, bulkAddTeachers } = useStore();'
);

if (tch.includes('addTeacher(data);')) {
    // We need to change the single addTeacher insertion to bulk.
    // Replace the internal logic of the line reading rows and inserting.
    const importLogicOriginalRegex = /let count = 0;[\s\S]*?rows\.slice\(1\)\.forEach\(row => \{[\s\S]*?addTeacher\(data\);\s*count\+\+;\s*\}\s*\}\);\s*Swal\.fire/g;

    // Instead of doing complex regex, let's just do targeted string replacements:
    tch = tch.replace('let count = 0;\n            rows.slice(1).forEach(row => {', 'let count = 0;\n            const importedTeachers: Partial<Teacher>[] = [];\n            rows.slice(1).forEach(row => {');
    tch = tch.replace('let count = 0;\r\n            rows.slice(1).forEach(row => {', 'let count = 0;\r\n            const importedTeachers: Partial<Teacher>[] = [];\r\n            rows.slice(1).forEach(row => {');

    tch = tch.replace(
        'if (data.name && data.subject) {\n                    addTeacher(data);\n                    count++;\n                }',
        'if (data.name && data.subject) {\n                    importedTeachers.push(data);\n                    count++;\n                }'
    );
    tch = tch.replace(
        'if (data.name && data.subject) {\r\n                    addTeacher(data);\r\n                    count++;\r\n                }',
        'if (data.name && data.subject) {\r\n                    importedTeachers.push(data);\r\n                    count++;\r\n                }'
    );

    tch = tch.replace(
        'Swal.fire({ title: \'Import Complete\'',
        'if(importedTeachers.length > 0) bulkAddTeachers(importedTeachers);\n            Swal.fire({ title: \'Import Complete\''
    );

    fs.writeFileSync('src/pages/Teachers.tsx', tch);
}

console.log('Done!');
