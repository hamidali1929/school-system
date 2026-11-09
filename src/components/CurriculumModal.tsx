import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    BookOpen,
    GraduationCap,
    Plus,
    Trash2,
    Sparkles,
    CheckCircle2,
    SlidersHorizontal,
    HeartPulse,
    Compass,
    Laptop,
    BarChart3,
    TrendingUp,
    Monitor,
    Palette,
    Briefcase,
    Building2,
    FileCheck2,
    Layers,
    CheckSquare,
    Square
} from 'lucide-react';
import { useStore, type ClassDisciplineConfig } from '../context/StoreContext';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';

interface CurriculumModalProps {
    className: string;
    onClose: () => void;
}

export interface SubjectItem {
    id: string;
    name: string;
    marks: number;
    isCompulsory: boolean;
}

interface FieldDefinition {
    id: string;
    name: string;
    urduName: string;
    category: 'College' | 'School';
    badge: string;
    icon: React.ElementType;
    color: string;
    description: string;
    electivesPart1: { name: string; marks: number }[];
    electivesPart2?: { name: string; marks: number }[];
}

const FBISE_FIELDS_CATALOG: FieldDefinition[] = [
    {
        id: 'fsc_pre_med',
        name: 'F.Sc Pre-Medical',
        urduName: 'ایف ایس سی پری میڈیکل',
        category: 'College',
        badge: 'Medical',
        icon: HeartPulse,
        color: 'from-emerald-500 to-teal-600',
        description: 'Biology, Chemistry & Physics for Medical aspirants',
        electivesPart1: [
            { name: 'Biology', marks: 100 },
            { name: 'Chemistry', marks: 100 },
            { name: 'Physics', marks: 100 },
        ]
    },
    {
        id: 'fsc_pre_eng',
        name: 'F.Sc Pre-Engineering',
        urduName: 'ایف ایس سی پری انجینئرنگ',
        category: 'College',
        badge: 'Engineering',
        icon: Compass,
        color: 'from-blue-500 to-indigo-600',
        description: 'Mathematics, Physics & Chemistry for Engineering aspirants',
        electivesPart1: [
            { name: 'Mathematics', marks: 100 },
            { name: 'Physics', marks: 100 },
            { name: 'Chemistry', marks: 100 },
        ]
    },
    {
        id: 'ics_phy',
        name: 'ICS (Physics Group)',
        urduName: 'آئی سی ایس - فزکس',
        category: 'College',
        badge: 'CS & Physics',
        icon: Laptop,
        color: 'from-violet-500 to-purple-600',
        description: 'Computer Science, Mathematics & Physics for Software & Hardware Tech',
        electivesPart1: [
            { name: 'Computer Science', marks: 100 },
            { name: 'Mathematics', marks: 100 },
            { name: 'Physics', marks: 100 },
        ]
    },
    {
        id: 'ics_stats',
        name: 'ICS (Statistics Group)',
        urduName: 'آئی سی ایس - شماریات',
        category: 'College',
        badge: 'CS & Stats',
        icon: BarChart3,
        color: 'from-indigo-500 to-cyan-600',
        description: 'Computer Science, Mathematics & Statistics for Data Analytics',
        electivesPart1: [
            { name: 'Computer Science', marks: 100 },
            { name: 'Mathematics', marks: 100 },
            { name: 'Statistics', marks: 100 },
        ]
    },
    {
        id: 'ics_eco',
        name: 'ICS (Economics Group)',
        urduName: 'آئی سی ایس - معاشیات',
        category: 'College',
        badge: 'CS & Finance',
        icon: TrendingUp,
        color: 'from-amber-500 to-orange-600',
        description: 'Computer Science, Mathematics & Economics for Fintech & Banking',
        electivesPart1: [
            { name: 'Computer Science', marks: 100 },
            { name: 'Mathematics', marks: 100 },
            { name: 'Economics', marks: 100 },
        ]
    },
    {
        id: 'fa_it',
        name: 'FA IT (Information Tech)',
        urduName: 'ایف اے آئی ٹی',
        category: 'College',
        badge: 'IT & Arts',
        icon: Monitor,
        color: 'from-teal-500 to-cyan-600',
        description: 'Computer Science, Civics & Education for Modern Digital Arts',
        electivesPart1: [
            { name: 'Computer Science', marks: 100 },
            { name: 'Civics', marks: 100 },
            { name: 'Education', marks: 100 },
        ]
    },
    {
        id: 'fa_general',
        name: 'FA Humanities / Arts',
        urduName: 'ایف اے جنرل / آرٹس',
        category: 'College',
        badge: 'Arts & Social',
        icon: Palette,
        color: 'from-rose-500 to-pink-600',
        description: 'Civics, Education & Islamic Studies Elective for Liberal Arts',
        electivesPart1: [
            { name: 'Islamic Studies (Elective)', marks: 100 },
            { name: 'Civics', marks: 100 },
            { name: 'Education', marks: 100 },
        ]
    },
    {
        id: 'icom',
        name: 'I.Com (Commerce)',
        urduName: 'آئی کام - کامرس',
        category: 'College',
        badge: 'Commerce',
        icon: Briefcase,
        color: 'from-emerald-600 to-teal-700',
        description: 'Accounting, Commerce, Economics & Business Math / Stats',
        electivesPart1: [
            { name: 'Principles of Accounting', marks: 100 },
            { name: 'Principles of Commerce', marks: 75 },
            { name: 'Principles of Economics', marks: 75 },
            { name: 'Business Mathematics', marks: 50 },
        ],
        electivesPart2: [
            { name: 'Principles of Accounting', marks: 100 },
            { name: 'Commercial Geography', marks: 75 },
            { name: 'Computer Studies (Banking)', marks: 75 },
            { name: 'Business Statistics', marks: 50 },
        ]
    },
    // School / Matric Streams
    {
        id: 'matric_bio',
        name: 'Matric Science (Biology)',
        urduName: 'میٹرک سائنس (بائیولوجی)',
        category: 'School',
        badge: '9th/10th Science',
        icon: HeartPulse,
        color: 'from-emerald-600 to-green-700',
        description: 'Biology, Physics, Chemistry & Mathematics for Matric Science',
        electivesPart1: [
            { name: 'Mathematics', marks: 75 },
            { name: 'Physics', marks: 75 },
            { name: 'Chemistry', marks: 75 },
            { name: 'Biology', marks: 75 },
        ]
    },
    {
        id: 'matric_cs',
        name: 'Matric Science (Computer)',
        urduName: 'میٹرک سائنس (کمپیوٹر)',
        category: 'School',
        badge: '9th/10th CS',
        icon: Laptop,
        color: 'from-blue-600 to-cyan-700',
        description: 'Computer Science, Physics, Chemistry & Mathematics for Matric CS',
        electivesPart1: [
            { name: 'Mathematics', marks: 75 },
            { name: 'Physics', marks: 75 },
            { name: 'Chemistry', marks: 75 },
            { name: 'Computer Science', marks: 75 },
        ]
    },
    {
        id: 'matric_arts',
        name: 'Matric General / Arts',
        urduName: 'میٹرک جنرل / آرٹس',
        category: 'School',
        badge: '9th/10th Arts',
        icon: Palette,
        color: 'from-amber-600 to-rose-600',
        description: 'General Science, General Mathematics, Civics & Education',
        electivesPart1: [
            { name: 'General Mathematics', marks: 75 },
            { name: 'General Science', marks: 75 },
            { name: 'Civics', marks: 75 },
            { name: 'Education', marks: 75 },
        ]
    }
];

export const CurriculumModal = ({ className, onClose }: CurriculumModalProps) => {
    const {
        classSubjects,
        subjectTotalMarks,
        classDisciplines,
        updateClassDisciplines,
        updateClassSubjects,
        updateClassSubjectMarks,
        classPrograms
    } = useStore();

    // Determine initial Part & Category based on class name
    const lowerName = className.toLowerCase();
    const isCollegeDefault =
        classPrograms?.[className] === 'College' ||
        ['11th', '12th', '1st year', '2nd year', 'inter', 'fsc', 'ics', 'fa', 'icom'].some(k => lowerName.includes(k));

    const isPart2Default =
        ['12th', '2nd year', 'second year', 'part 2', 'part-2', '10th'].some(k => lowerName.includes(k));

    const [activeCategory, setActiveCategory] = useState<'College' | 'School'>(isCollegeDefault ? 'College' : 'School');
    const [academicPart, setAcademicPart] = useState<'part1' | 'part2'>(isPart2Default ? 'part2' : 'part1');

    // Helper to generate Compulsory subjects based on Part and Category
    const getCompulsorySubjects = (part: 'part1' | 'part2', category: 'College' | 'School'): { name: string; marks: number }[] => {
        if (category === 'College') {
            return [
                { name: 'English Compulsory', marks: 100 },
                { name: 'Urdu Compulsory', marks: 100 },
                { name: part === 'part1' ? 'Islamic Education (Compulsory)' : 'Pakistan Studies (Compulsory)', marks: 50 },
                { name: 'Tarjuma-tul-Quran (Compulsory)', marks: 50 },
            ];
        } else {
            return [
                { name: 'English Compulsory', marks: 75 },
                { name: 'Urdu Compulsory', marks: 75 },
                { name: part === 'part1' ? 'Islamic Education (Compulsory)' : 'Pakistan Studies (Compulsory)', marks: 50 },
                { name: 'Tarjuma-tul-Quran (Compulsory)', marks: 50 },
            ];
        }
    };

    // Helper to generate initial subjects for a field definition
    const buildFieldSubjects = (field: FieldDefinition, part = academicPart): SubjectItem[] => {
        const compulsory = getCompulsorySubjects(part, field.category);
        const electives = (part === 'part2' && field.electivesPart2) ? field.electivesPart2 : field.electivesPart1;

        return [
            ...compulsory.map((c, i) => ({
                id: `comp-${i}-${c.name}`,
                name: c.name,
                marks: c.marks,
                isCompulsory: true
            })),
            ...electives.map((e, i) => ({
                id: `elec-${i}-${e.name}`,
                name: e.name,
                marks: e.marks,
                isCompulsory: false
            }))
        ];
    };

    // State for multiple active disciplines:
    // mapping disciplineId -> { id, name, urduName, category, badge, subjects: SubjectItem[] }
    const [activeDisciplinesMap, setActiveDisciplinesMap] = useState<Record<string, {
        id: string;
        name: string;
        urduName?: string;
        category?: 'College' | 'School';
        badge?: string;
        subjects: SubjectItem[];
    }>>(() => {
        const existing = classDisciplines?.[className];
        if (existing && Object.keys(existing).length > 0) {
            const mapped: Record<string, any> = {};
            Object.entries(existing).forEach(([id, conf]) => {
                const catalogDef = FBISE_FIELDS_CATALOG.find(f => f.id === id || f.name.toLowerCase() === conf.name.toLowerCase());
                mapped[id] = {
                    id: conf.id || id,
                    name: conf.name,
                    urduName: conf.urduName || catalogDef?.urduName,
                    category: conf.category || catalogDef?.category || (isCollegeDefault ? 'College' : 'School'),
                    badge: conf.badge || catalogDef?.badge || 'Custom',
                    subjects: (conf.subjects || []).map((sName, sIdx) => {
                        const low = sName.toLowerCase();
                        const isComp = low.includes('english') || low.includes('urdu') || low.includes('islam') || low.includes('pakistan') || low.includes('quran') || low.includes('tarjuma');
                        return {
                            id: `init-${sIdx}-${sName}`,
                            name: sName,
                            marks: conf.marks?.[sName] || 100,
                            isCompulsory: isComp
                        };
                    })
                };
            });
            return mapped;
        }

        // If no multi-discipline saved yet, but class is College: initialize standard fields (Pre-Med & ICS) as defaults
        if (isCollegeDefault) {
            const preMed = FBISE_FIELDS_CATALOG.find(f => f.id === 'fsc_pre_med')!;
            const ics = FBISE_FIELDS_CATALOG.find(f => f.id === 'ics_phy')!;
            return {
                [preMed.id]: {
                    id: preMed.id,
                    name: preMed.name,
                    urduName: preMed.urduName,
                    category: preMed.category,
                    badge: preMed.badge,
                    subjects: buildFieldSubjects(preMed, isPart2Default ? 'part2' : 'part1')
                },
                [ics.id]: {
                    id: ics.id,
                    name: ics.name,
                    urduName: ics.urduName,
                    category: ics.category,
                    badge: ics.badge,
                    subjects: buildFieldSubjects(ics, isPart2Default ? 'part2' : 'part1')
                }
            };
        }

        // Otherwise if general class subjects exist, create a general discipline
        const exSubs = classSubjects[className] || [];
        if (exSubs.length > 0) {
            const marksMap = subjectTotalMarks[className] || {};
            return {
                'general_curriculum': {
                    id: 'general_curriculum',
                    name: `${className} Curriculum`,
                    category: 'School',
                    badge: 'Core',
                    subjects: exSubs.map((s, idx) => ({
                        id: `gen-${idx}-${s}`,
                        name: s,
                        marks: marksMap[s] || 100,
                        isCompulsory: ['english', 'urdu', 'islam', 'pakistan', 'quran'].some(k => s.toLowerCase().includes(k))
                    }))
                }
            };
        }

        return {};
    });

    // Currently focused/viewed discipline tab
    const [focusedDisciplineId, setFocusedDisciplineId] = useState<string>(() => {
        const keys = Object.keys(activeDisciplinesMap);
        return keys.length > 0 ? keys[0] : 'fsc_pre_med';
    });

    // Custom subject form input
    const [newSubjName, setNewSubjName] = useState('');
    const [newSubjMarks, setNewSubjMarks] = useState<number>(100);
    const [newSubjType, setNewSubjType] = useState<'compulsory' | 'elective'>('elective');

    // Available catalog fields based on current stream filter
    const availableFields = useMemo(() => {
        return FBISE_FIELDS_CATALOG.filter(f => f.category === activeCategory);
    }, [activeCategory]);

    // Active fields list
    const activeDisciplineEntries = useMemo(() => {
        return Object.values(activeDisciplinesMap);
    }, [activeDisciplinesMap]);

    // Currently selected field data for editing
    const currentFocusedField = useMemo(() => {
        if (focusedDisciplineId && activeDisciplinesMap[focusedDisciplineId]) {
            return activeDisciplinesMap[focusedDisciplineId];
        }
        if (activeDisciplineEntries.length > 0) {
            return activeDisciplineEntries[0];
        }
        return null;
    }, [focusedDisciplineId, activeDisciplinesMap, activeDisciplineEntries]);

    // Toggle a field from the catalog ON or OFF
    const toggleCatalogField = (catalogField: FieldDefinition) => {
        const id = catalogField.id;
        setActiveDisciplinesMap(prev => {
            const next = { ...prev };
            if (next[id]) {
                delete next[id];
                // Update focus if needed
                if (focusedDisciplineId === id) {
                    const remainingKeys = Object.keys(next);
                    if (remainingKeys.length > 0) {
                        setFocusedDisciplineId(remainingKeys[0]);
                    }
                }
            } else {
                next[id] = {
                    id: catalogField.id,
                    name: catalogField.name,
                    urduName: catalogField.urduName,
                    category: catalogField.category,
                    badge: catalogField.badge,
                    subjects: buildFieldSubjects(catalogField, academicPart)
                };
                setFocusedDisciplineId(id);
            }
            return next;
        });
    };

    // Quick action: Enable All Common College Fields
    const enableAllCommonFields = () => {
        const collegeFields = FBISE_FIELDS_CATALOG.filter(f => f.category === 'College');
        const newMap: Record<string, any> = { ...activeDisciplinesMap };
        collegeFields.forEach(field => {
            if (!newMap[field.id]) {
                newMap[field.id] = {
                    id: field.id,
                    name: field.name,
                    urduName: field.urduName,
                    category: field.category,
                    badge: field.badge,
                    subjects: buildFieldSubjects(field, academicPart)
                };
            }
        });
        setActiveDisciplinesMap(newMap);
        setFocusedDisciplineId('fsc_pre_med');
        Swal.fire({
            title: 'All College Streams Activated!',
            text: 'Pre-Medical, Pre-Engineering, ICS (Physics, Stats, Eco), FA IT, FA General & I.Com are now active for this class.',
            icon: 'success',
            toast: true,
            position: 'top-end',
            timer: 2500,
            showConfirmButton: false
        });
    };

    // Handle switching between Part 1 and Part 2
    const handleSwitchPart = (newPart: 'part1' | 'part2') => {
        setAcademicPart(newPart);
        // Update compulsory subjects across all active disciplines
        setActiveDisciplinesMap(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(discId => {
                const disc = next[discId];
                const catDef = FBISE_FIELDS_CATALOG.find(f => f.id === discId);
                const compList = getCompulsorySubjects(newPart, disc.category || 'College');

                // Update compulsory subjects
                const nonComp = disc.subjects.filter(s => !s.isCompulsory);
                const updatedComp: SubjectItem[] = compList.map((c, i) => ({
                    id: `comp-${i}-${c.name}`,
                    name: c.name,
                    marks: c.marks,
                    isCompulsory: true
                }));

                // If I.Com, update electives between Part 1 and Part 2
                let updatedElectives = nonComp;
                if (discId === 'icom' && catDef?.electivesPart2) {
                    const newElecDefs = newPart === 'part2' ? catDef.electivesPart2 : catDef.electivesPart1;
                    updatedElectives = newElecDefs.map((e, i) => ({
                        id: `elec-icom-${i}-${e.name}`,
                        name: e.name,
                        marks: e.marks,
                        isCompulsory: false
                    }));
                }

                next[discId] = {
                    ...disc,
                    subjects: [...updatedComp, ...updatedElectives]
                };
            });
            return next;
        });
    };

    // Subject editing functions for current focused field
    const handleUpdateName = (subjId: string, name: string) => {
        if (!focusedDisciplineId) return;
        setActiveDisciplinesMap(prev => {
            const cur = prev[focusedDisciplineId];
            if (!cur) return prev;
            return {
                ...prev,
                [focusedDisciplineId]: {
                    ...cur,
                    subjects: cur.subjects.map(s => s.id === subjId ? { ...s, name } : s)
                }
            };
        });
    };

    const handleUpdateMarks = (subjId: string, marks: number) => {
        if (!focusedDisciplineId) return;
        setActiveDisciplinesMap(prev => {
            const cur = prev[focusedDisciplineId];
            if (!cur) return prev;
            return {
                ...prev,
                [focusedDisciplineId]: {
                    ...cur,
                    subjects: cur.subjects.map(s => s.id === subjId ? { ...s, marks: Math.max(0, marks) } : s)
                }
            };
        });
    };

    const handleDeleteSubject = (subjId: string) => {
        if (!focusedDisciplineId) return;
        setActiveDisciplinesMap(prev => {
            const cur = prev[focusedDisciplineId];
            if (!cur) return prev;
            return {
                ...prev,
                [focusedDisciplineId]: {
                    ...cur,
                    subjects: cur.subjects.filter(s => s.id !== subjId)
                }
            };
        });
    };

    const handleAddSubjectToActiveField = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = newSubjName.trim();
        if (!trimmed || !focusedDisciplineId || !currentFocusedField) return;

        if (currentFocusedField.subjects.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
            Swal.fire({
                title: 'Subject Exists',
                text: `"${trimmed}" is already in ${currentFocusedField.name}.`,
                icon: 'warning',
                timer: 2000,
                showConfirmButton: false
            });
            return;
        }

        const newItem: SubjectItem = {
            id: `custom-${Date.now()}-${trimmed}`,
            name: trimmed,
            marks: Number(newSubjMarks) || 100,
            isCompulsory: newSubjType === 'compulsory'
        };

        setActiveDisciplinesMap(prev => {
            const cur = prev[focusedDisciplineId];
            if (!cur) return prev;
            return {
                ...prev,
                [focusedDisciplineId]: {
                    ...cur,
                    subjects: [...cur.subjects, newItem]
                }
            };
        });

        setNewSubjName('');
        setNewSubjMarks(100);
    };

    // Save All Disciplines and Curriculum to Store
    const handleSaveAll = () => {
        const disciplineEntries = Object.entries(activeDisciplinesMap);
        if (disciplineEntries.length === 0) {
            Swal.fire({
                title: 'No Fields Configured?',
                text: 'Please select at least one field (e.g. F.Sc Pre-Medical, ICS, Pre-Engineering) for this class.',
                icon: 'warning'
            });
            return;
        }

        const finalDisciplinesConfig: Record<string, ClassDisciplineConfig> = {};
        const allUniqueSubjects = new Set<string>();
        const combinedMarks: Record<string, number> = {};

        disciplineEntries.forEach(([id, disc]) => {
            const validSubs = disc.subjects.map(s => s.name.trim()).filter(Boolean);
            const discMarks: Record<string, number> = {};
            disc.subjects.forEach(s => {
                if (s.name.trim()) {
                    discMarks[s.name.trim()] = s.marks || 100;
                    combinedMarks[s.name.trim()] = s.marks || 100;
                    allUniqueSubjects.add(s.name.trim());
                }
            });

            finalDisciplinesConfig[id] = {
                id,
                name: disc.name,
                urduName: disc.urduName,
                category: disc.category,
                badge: disc.badge,
                subjects: validSubs,
                marks: discMarks
            };
        });

        // Save into Store
        updateClassDisciplines(className, finalDisciplinesConfig);
        updateClassSubjects(className, Array.from(allUniqueSubjects));
        updateClassSubjectMarks(className, combinedMarks);

        Swal.fire({
            title: 'Multiple Fields & Curriculum Saved!',
            html: `
                <div class="text-center font-outfit space-y-2">
                    <p class="text-xs text-slate-500">
                        Successfully saved <b>${disciplineEntries.length} Academic Fields</b> for <b>${className}</b>.
                    </p>
                    <div class="flex flex-wrap gap-1.5 justify-center py-2">
                        ${disciplineEntries.map(([_, d]) => `
                            <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                                ${d.name} (${d.subjects.length} Subjects)
                            </span>
                        `).join('')}
                    </div>
                    <p class="text-[10px] text-emerald-600 font-black">
                        ✓ Students will now automatically see only their selected field's subjects!
                    </p>
                </div>
            `,
            icon: 'success',
            timer: 3500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });

        onClose();
    };

    // Calculations for currently focused field
    const focusedCompulsoryList = useMemo(() => {
        return currentFocusedField?.subjects.filter(s => s.isCompulsory) || [];
    }, [currentFocusedField]);

    const focusedElectiveList = useMemo(() => {
        return currentFocusedField?.subjects.filter(s => !s.isCompulsory) || [];
    }, [currentFocusedField]);

    const focusedTotalMarks = useMemo(() => {
        return (currentFocusedField?.subjects || []).reduce((acc, s) => acc + (Number(s.marks) || 0), 0);
    }, [currentFocusedField]);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-5xl bg-white dark:bg-[#001026] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden font-outfit">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-primary to-blue-600 dark:from-yellow-400 dark:to-amber-500 flex items-center justify-center text-white dark:text-[#001a33] shadow-lg shadow-blue-500/20 shrink-0">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    Multi-Field Curriculum Manager
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-primary/10 text-brand-primary dark:bg-yellow-400/20 dark:text-yellow-400 border border-brand-primary/20">
                                    {className}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    {activeDisciplineEntries.length} Active Fields
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                Save multiple streams (ICS, Pre-Med, Pre-Eng, FA, I.Com) in one class — each student sees their own field!
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">

                    {/* Step 1: Controls Bar (Category, Academic Year & Quick Batch Buttons) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
                        {/* Stream Category */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Stream:</span>
                            <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-white/10">
                                <button
                                    onClick={() => setActiveCategory('College')}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                                        activeCategory === 'College'
                                            ? "bg-brand-primary text-white dark:bg-yellow-400 dark:text-[#001a33] shadow-sm"
                                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                    )}
                                >
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    College (HSSC)
                                </button>
                                <button
                                    onClick={() => setActiveCategory('School')}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                                        activeCategory === 'School'
                                            ? "bg-brand-primary text-white dark:bg-yellow-400 dark:text-[#001a33] shadow-sm"
                                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                    )}
                                >
                                    <Building2 className="w-3.5 h-3.5" />
                                    School (SSC)
                                </button>
                            </div>
                        </div>

                        {/* Part 1 vs Part 2 Switcher */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Academic Year:</span>
                            <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-white/10">
                                <button
                                    onClick={() => handleSwitchPart('part1')}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1",
                                        academicPart === 'part1'
                                            ? "bg-white dark:bg-[#001a33] text-brand-primary dark:text-yellow-400 shadow-sm"
                                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                    )}
                                >
                                    {activeCategory === 'College' ? 'Part-1 (11th)' : 'Part-1 (9th)'}
                                    <span className="text-[9px] opacity-75 font-normal ml-0.5">(Islamiat)</span>
                                </button>
                                <button
                                    onClick={() => handleSwitchPart('part2')}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1",
                                        academicPart === 'part2'
                                            ? "bg-white dark:bg-[#001a33] text-brand-primary dark:text-yellow-400 shadow-sm"
                                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                                    )}
                                >
                                    {activeCategory === 'College' ? 'Part-2 (12th)' : 'Part-2 (10th)'}
                                    <span className="text-[9px] opacity-75 font-normal ml-0.5">(Pak Studies)</span>
                                </button>
                            </div>
                        </div>

                        {/* Quick Batch Actions */}
                        {activeCategory === 'College' && (
                            <button
                                onClick={enableAllCommonFields}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:shadow-md transition-all active:scale-95"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Enable All College Streams
                            </button>
                        )}
                    </div>

                    {/* Step 2: Multi-Field Selector Grid (Toggle Multiple Fields ON / OFF) */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-brand-primary dark:text-yellow-400" />
                                <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider">
                                    1. Select All Offered Fields in {className} (Click to Toggle)
                                </h3>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                                Check all streams that students can enroll into in this class
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {availableFields.map((field) => {
                                const Icon = field.icon;
                                const isEnabled = Boolean(activeDisciplinesMap[field.id]);
                                const isFocused = focusedDisciplineId === field.id;

                                return (
                                    <div
                                        key={field.id}
                                        onClick={() => toggleCatalogField(field)}
                                        className={cn(
                                            "relative p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between group select-none",
                                            isEnabled
                                                ? isFocused
                                                    ? "bg-brand-primary/10 dark:bg-yellow-400/10 border-brand-primary dark:border-yellow-400 ring-2 ring-brand-primary/30 dark:ring-yellow-400/30 shadow-md"
                                                    : "bg-blue-50/60 dark:bg-white/[0.04] border-blue-300/80 dark:border-white/20 shadow-sm"
                                                : "bg-white dark:bg-white/[0.01] border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100 hover:border-slate-300"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-1 mb-2">
                                            <div className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 bg-gradient-to-br",
                                                field.color
                                            )}>
                                                <Icon className="w-4 h-4" />
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                                                    isEnabled
                                                        ? "bg-brand-primary text-white dark:bg-yellow-400 dark:text-[#001a33]"
                                                        : "bg-slate-100 dark:bg-white/10 text-slate-400"
                                                )}>
                                                    {field.badge}
                                                </span>
                                                {isEnabled ? (
                                                    <CheckSquare className="w-4 h-4 text-brand-primary dark:text-yellow-400" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                                                {field.name}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 font-urdu mt-0.5" dir="rtl">
                                                {field.urduName}
                                            </p>
                                            <p className="text-[8px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                                {field.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 3: Active Discipline Tabs & Curriculum Editor */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-brand-primary dark:text-yellow-400" />
                                <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider">
                                    2. Customize Subjects & Marks for Each Active Field
                                </h3>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">
                                Click a field tab to view & edit its subjects
                            </span>
                        </div>

                        {/* Field Navigation Tabs */}
                        {activeDisciplineEntries.length === 0 ? (
                            <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 text-center space-y-2">
                                <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    No fields currently enabled for {className}.
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    Click any of the field cards above (e.g. F.Sc Pre-Medical, ICS, FA IT) to enable it for this class.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Tab Buttons Bar */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                    {activeDisciplineEntries.map((disc) => {
                                        const isFocused = focusedDisciplineId === disc.id;
                                        return (
                                            <button
                                                key={disc.id}
                                                type="button"
                                                onClick={() => setFocusedDisciplineId(disc.id)}
                                                className={cn(
                                                    "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 shrink-0 border",
                                                    isFocused
                                                        ? "bg-brand-primary text-white dark:bg-yellow-400 dark:text-[#001a33] border-brand-primary dark:border-yellow-400 shadow-md"
                                                        : "bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300"
                                                )}
                                            >
                                                <span>{disc.name}</span>
                                                <span className={cn(
                                                    "px-1.5 py-0.2 rounded-md text-[9px] font-bold",
                                                    isFocused
                                                        ? "bg-white/20 text-white dark:text-[#001a33]"
                                                        : "bg-slate-200/70 dark:bg-white/10 text-slate-500"
                                                )}>
                                                    {disc.subjects.length} Subj
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Active Field Editor Container */}
                                {currentFocusedField && (
                                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-4">
                                        
                                        {/* Field Header & Quick Stats */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-white/10">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                        {currentFocusedField.name}
                                                    </h4>
                                                    {currentFocusedField.urduName && (
                                                        <span className="text-xs font-bold text-slate-400 font-urdu" dir="rtl">
                                                            ({currentFocusedField.urduName})
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-medium">
                                                    Students in <b>{className}</b> enrolled in <b>"{currentFocusedField.name}"</b> will study these subjects.
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black uppercase text-slate-400">Field Total Marks</p>
                                                    <p className="text-base font-black text-brand-primary dark:text-yellow-400">
                                                        {focusedTotalMarks} Marks
                                                    </p>
                                                </div>
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                    {currentFocusedField.subjects.length} Subjects
                                                </span>
                                            </div>
                                        </div>

                                        {/* Compulsory Subjects for this Field */}
                                        {focusedCompulsoryList.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                    <h5 className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                                        Compulsory Subjects (لازمی مضامین)
                                                    </h5>
                                                    <span className="text-[9px] text-slate-400 font-bold">
                                                        ({focusedCompulsoryList.length} Subjects)
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {focusedCompulsoryList.map(subj => (
                                                        <div
                                                            key={subj.id}
                                                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-white/[0.02] border border-blue-100 dark:border-white/10 group hover:border-blue-300 dark:hover:border-white/20 transition-all"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <input
                                                                    type="text"
                                                                    value={subj.name}
                                                                    onChange={e => handleUpdateName(subj.id, e.target.value)}
                                                                    className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white border-b border-transparent focus:border-blue-500 outline-none transition-colors"
                                                                />
                                                                <span className="text-[8px] font-black uppercase tracking-wider text-blue-500">
                                                                    Official Compulsory
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="200"
                                                                        value={subj.marks}
                                                                        onChange={e => handleUpdateMarks(subj.id, Number(e.target.value))}
                                                                        className="w-16 text-center text-xs font-black py-1 px-1.5 rounded-lg bg-white dark:bg-[#001026] border border-blue-200 dark:border-white/20 text-blue-600 dark:text-yellow-400 outline-none focus:ring-2 focus:ring-blue-500"
                                                                    />
                                                                    <span className="text-[8px] font-bold text-slate-400 ml-1">Marks</span>
                                                                </div>

                                                                <button
                                                                    onClick={() => handleDeleteSubject(subj.id)}
                                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                                                    title="Delete Subject"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Elective Subjects for this Field */}
                                        {focusedElectiveList.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                    <h5 className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                                        Field Electives / Specialization (اختیاری مضامین)
                                                    </h5>
                                                    <span className="text-[9px] text-slate-400 font-bold">
                                                        ({focusedElectiveList.length} Subjects)
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {focusedElectiveList.map(subj => (
                                                        <div
                                                            key={subj.id}
                                                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-purple-50/40 dark:bg-white/[0.02] border border-purple-100 dark:border-white/10 group hover:border-purple-300 dark:hover:border-white/20 transition-all"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <input
                                                                    type="text"
                                                                    value={subj.name}
                                                                    onChange={e => handleUpdateName(subj.id, e.target.value)}
                                                                    className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white border-b border-transparent focus:border-purple-500 outline-none transition-colors"
                                                                />
                                                                <span className="text-[8px] font-black uppercase tracking-wider text-purple-500">
                                                                    Field Elective
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="200"
                                                                        value={subj.marks}
                                                                        onChange={e => handleUpdateMarks(subj.id, Number(e.target.value))}
                                                                        className="w-16 text-center text-xs font-black py-1 px-1.5 rounded-lg bg-white dark:bg-[#001026] border border-purple-200 dark:border-white/20 text-purple-600 dark:text-yellow-400 outline-none focus:ring-2 focus:ring-purple-500"
                                                                    />
                                                                    <span className="text-[8px] font-bold text-slate-400 ml-1">Marks</span>
                                                                </div>

                                                                <button
                                                                    onClick={() => handleDeleteSubject(subj.id)}
                                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                                                    title="Delete Subject"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add Custom Subject to Currently Focused Field */}
                                        <div className="p-3.5 rounded-xl bg-white dark:bg-[#001026] border border-slate-200/80 dark:border-white/10">
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2">
                                                Add Custom Subject to {currentFocusedField.name}
                                            </p>
                                            <form onSubmit={handleAddSubjectToActiveField} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Fine Arts, Civics, Sociology, Library..."
                                                    value={newSubjName}
                                                    onChange={e => setNewSubjName(e.target.value)}
                                                    className="flex-1 min-w-[180px] h-8 px-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/20 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-brand-primary"
                                                />

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="300"
                                                        value={newSubjMarks}
                                                        onChange={e => setNewSubjMarks(Number(e.target.value))}
                                                        className="w-16 h-8 text-center rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/20 text-xs font-black text-slate-800 dark:text-white outline-none"
                                                        placeholder="Marks"
                                                    />
                                                    <span className="text-[8px] font-bold text-slate-400">Marks</span>
                                                </div>

                                                <select
                                                    value={newSubjType}
                                                    onChange={e => setNewSubjType(e.target.value as any)}
                                                    className="h-8 px-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/20 text-[9px] font-black uppercase text-slate-700 dark:text-white outline-none"
                                                >
                                                    <option value="elective">Elective</option>
                                                    <option value="compulsory">Compulsory</option>
                                                </select>

                                                <button
                                                    type="submit"
                                                    className="h-8 px-3.5 rounded-lg bg-brand-primary text-white dark:bg-yellow-400 dark:text-[#001a33] text-[9px] font-black uppercase tracking-wider flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    Add
                                                </button>
                                            </form>
                                        </div>

                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Step 4: Multi-Field Overview Summary Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-emerald-50/60 dark:from-white/[0.03] dark:via-white/[0.02] dark:to-yellow-400/5 border border-blue-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                    Automatic Student-Field Association Active
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                When marks are entered or transcripts are printed in <b>{className}</b>, each student will automatically only receive the subjects of their assigned discipline!
                            </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {activeDisciplineEntries.map(d => (
                                <span
                                    key={d.id}
                                    className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-white dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-sm"
                                >
                                    {d.name} ({d.subjects.length} Subj)
                                </span>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Modal Footer with Actions */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                            Total {activeDisciplineEntries.length} Disciplines Configured for {className}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveAll}
                            className="px-6 py-2.5 rounded-xl bg-brand-primary text-white dark:bg-yellow-400 dark:text-[#001a33] text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2"
                        >
                            <FileCheck2 className="w-4 h-4" />
                            Save All Fields & Curriculum
                        </button>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};
