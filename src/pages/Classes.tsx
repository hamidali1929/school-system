import { useState } from 'react';
import { Plus, Edit2, Trash2, GraduationCap, Users, RotateCcw, BookOpen, UserPlus, UploadCloud, DownloadCloud, Search, Layers, ArrowRightLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Swal from 'sweetalert2';
import { cn } from '../utils/cn';

export const ClassesPage = () => {
    const {
        classes, feeStructure, addClass, updateClass, deleteClass, students, teachers,
        classSubjects, classInCharge, subjectTeachers, updateClassSubjects, updateClassInCharge,
        updateClassSubjectTeachers, campuses, addStudent, subjectTotalMarks, updateClassSubjectMarks,
        migrateClass, campusSections, addCampusSection, deleteCampusSection,
        wingAssignments, updateWingAssignments, passOutClass,
        classPrograms, updateClassPrograms
    } = useStore();

    const [campusFilter, setCampusFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');
    const [search, setSearch] = useState('');

    const handleRestoreDefaults = () => {
        Swal.fire({
            title: 'Restore Default Classes?',
            text: 'This will reset your class list to the standard institutional categories (PG to 2nd Year). Current custom classes will stay if their names match.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: 'var(--brand-primary)',
            confirmButtonText: 'Yes, Restore'
        }).then((result) => {
            if (result.isConfirmed) {
                const defaults = [
                    'PG', 'Nursery', 'KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th',
                    '1st Year', '2nd Year'
                ];
                const defaultFees: Record<string, number> = {
                    'PG': 2500, 'Nursery': 2500, 'KG': 2500, '1st': 3000, '2nd': 3000, '3rd': 3000,
                    '4th': 3000, '5th': 3000, '6th': 3500, '7th': 3500, '8th': 3500, '9th': 4000,
                    '10th': 4000, '1st Year': 5000, '2nd Year': 5000
                };

                defaults.forEach(c => addClass(c, defaultFees[c]));
                Swal.fire('Restored', 'Default classes have been added to the registry.', 'success');
            }
        });
    };

    const handleManageSections = async () => {
        const sectionsList = campusSections || [];
        const { value: action } = await Swal.fire({
            title: 'Campus Sections & Wings',
            html: `
                <div class="text-left font-outfit p-2">
                    <p class="text-[10px] text-slate-500 font-bold mb-3 uppercase tracking-wider">Configure Section categories (Junior, Boys, Girls, Custom) across campuses.</p>
                    
                    <div class="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                        ${sectionsList.map(s => `
                            <div class="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <div>
                                    <div class="flex items-center gap-2">
                                        <span class="w-2.5 h-2.5 rounded-full ${s.color === 'blue' ? 'bg-blue-500' : s.color === 'purple' ? 'bg-purple-500' : 'bg-emerald-500'}"></span>
                                        <h4 class="text-xs font-black text-slate-800 dark:text-white uppercase">${s.name}</h4>
                                    </div>
                                    <p class="text-[8px] font-bold text-slate-400 mt-0.5">${s.description || 'General Section'}</p>
                                    <span class="text-[7px] font-black uppercase px-2 py-0.5 bg-slate-200 dark:bg-white/10 rounded-md text-slate-600 dark:text-slate-300 mt-1 inline-block">Campus: ${s.campusName || 'All'}</span>
                                </div>
                                ${!['sec-junior', 'sec-boys', 'sec-girls'].includes(s.id) ? `
                                    <button onclick="window.deleteSec('${s.id}')" class="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                ` : '<span class="text-[8px] font-black text-slate-400 uppercase">System</span>'}
                            </div>
                        `).join('')}
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/10">
                        <h4 class="text-[10px] font-black text-brand-primary dark:text-brand-accent uppercase mb-2">Add New Custom Section</h4>
                        <div class="space-y-2">
                            <input id="swal-sec-name" class="swal2-input !m-0 !w-full !rounded-xl !text-xs !h-9 !border-slate-200" placeholder="e.g. Pre-Medical Section">
                            <div class="grid grid-cols-2 gap-2">
                                <select id="swal-sec-campus" class="swal2-input !m-0 !w-full !rounded-xl !text-[10px] !h-9 !border-slate-200 !bg-white">
                                    <option value="All">All Campuses</option>
                                    ${campuses.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                                </select>
                                <select id="swal-sec-key" class="swal2-input !m-0 !w-full !rounded-xl !text-[10px] !h-9 !border-slate-200 !bg-white">
                                    <option value="primary">Junior Type</option>
                                    <option value="boys">Boys Type</option>
                                    <option value="girls">Girls Type</option>
                                    <option value="custom">Special Wing</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '+ Create Section',
            confirmButtonColor: 'var(--brand-primary)',
            cancelButtonText: 'Close',
            customClass: {
                popup: 'rounded-[2.5rem] border-0 shadow-2xl',
                confirmButton: 'rounded-full px-6 py-2.5 !text-[9px] !font-black !uppercase !tracking-wider',
                cancelButton: 'rounded-full px-6 py-2.5 !text-[9px] !font-black !uppercase !tracking-wider !bg-slate-100'
            },
            preConfirm: () => {
                const name = (document.getElementById('swal-sec-name') as HTMLInputElement)?.value;
                const campusName = (document.getElementById('swal-sec-campus') as HTMLSelectElement)?.value || 'All';
                const key = (document.getElementById('swal-sec-key') as HTMLSelectElement)?.value || 'custom';
                if (!name) return null;
                return { name, campusName, key, description: `${name} for ${campusName}`, color: key === 'boys' ? 'blue' : key === 'girls' ? 'purple' : 'emerald' };
            }
        });

        if (action && action.name) {
            addCampusSection(action);
            Swal.fire('Section Created', `${action.name} has been added to sections.`, 'success');
        }
    };

    (window as any).deleteSec = (id: string) => {
        deleteCampusSection(id);
        Swal.close();
        handleManageSections();
    };

    const handleAddClass = async () => {
        const campusOptions = campuses.reduce((acc, c) => ({ ...acc, [c.name]: c.name.toUpperCase() }), {} as Record<string, string>);
        const sectionOptions = [
            { key: 'primary', label: '👶 JUNIOR SECTION (PG - 5)' },
            { key: 'boys', label: '👦 BOYS SECTION (6 - 12)' },
            { key: 'girls', label: '👧 GIRLS SECTION (6 - 12)' },
            ...(campusSections || []).filter(s => !['sec-junior', 'sec-boys', 'sec-girls'].includes(s.id)).map(s => ({ key: s.key || s.id, label: `✨ ${s.name.toUpperCase()}` }))
        ];

        const { value: formValues } = await Swal.fire({
            title: '',
            html: `
                <div class="text-left font-outfit -mt-4">
                    <div class="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                        <div class="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-sm shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-brand-primary uppercase tracking-tight leading-none">Class Designer</h3>
                            <p class="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Add New Class & Assign Section</p>
                        </div>
                    </div>

                    <div class="space-y-2.5">
                        <div class="grid grid-cols-2 gap-2.5">
                            <div>
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Class Name</label>
                                <input id="swal-class-name" class="swal2-input !mt-0 !w-full !rounded-2xl !text-xs !border-slate-100 focus:!border-brand-primary transition-all !h-9 !px-4 !m-0" placeholder="e.g. Class 7">
                            </div>
                            <div>
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Section Suffix</label>
                                <input id="swal-class-section" class="swal2-input !mt-0 !w-full !rounded-2xl !text-xs !border-slate-100 !h-9 !px-4 !m-0" placeholder="e.g. Boys or A">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2.5">
                            <div>
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Program Type</label>
                                <select id="swal-class-program" class="swal2-input !mt-0 !w-full !rounded-2xl !text-[10px] !border-slate-100 !h-9 !px-3 !m-0 !bg-white">
                                    <option value="School">School</option>
                                    <option value="College">College</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Section / Wing Category</label>
                                <select id="swal-class-wing" class="swal2-input !mt-0 !w-full !rounded-2xl !text-[10px] !border-slate-100 !h-9 !px-3 !m-0 !bg-white">
                                    ${sectionOptions.map(opt => `<option value="${opt.key}">${opt.label}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2.5">
                            <div>
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Monthly Fee</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary font-black text-[7px] pointer-events-none">PKR</span>
                                    <input id="swal-class-fee" type="number" class="swal2-input !mt-0 !w-full !rounded-2xl !text-xs !pl-9 !border-slate-100 !h-9 !m-0" placeholder="3500">
                                </div>
                            </div>
                            <div>
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Campus</label>
                                <select id="swal-campus" class="swal2-input !mt-0 !w-full !rounded-2xl !text-[10px] !border-slate-100 !h-9 !px-3 !m-0 !bg-white">
                                    <option value="All">ALL CAMPUSES</option>
                                    ${Object.entries(campusOptions).map(([name, upperName]) => `<option value="${name}" ${campusFilter.toLowerCase() === name.toLowerCase() ? 'selected' : ''}>${upperName}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 p-2 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                            <svg class="text-brand-primary shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            <p class="text-[7px] text-slate-400 font-medium">Class will automatically link to the selected section & campus timetable.</p>
                        </div>
                    </div>
                </div>
            `,
            width: '380px',
            padding: '1.25rem',
            background: 'white',
            showCancelButton: true,
            confirmButtonText: 'Create Class',
            confirmButtonColor: 'var(--brand-primary)',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'rounded-[2.5rem] border-0 shadow-2xl overflow-hidden',
                confirmButton: 'rounded-full px-8 py-2.5 !text-[9px] !font-black !uppercase !tracking-wider shadow-sm active:scale-95 transition-all !m-0',
                cancelButton: 'rounded-full px-8 py-2.5 !text-[9px] !font-black !uppercase !tracking-wider !bg-slate-50 !text-slate-400 hover:!bg-slate-100 transition-all !m-0 mr-2'
            },
            didOpen: () => {
                const nameInput = document.getElementById('swal-class-name') as HTMLInputElement;
                const programSelect = document.getElementById('swal-class-program') as HTMLSelectElement;
                if (nameInput && programSelect) {
                    nameInput.addEventListener('input', (e) => {
                        const val = (e.target as HTMLInputElement).value.toLowerCase();
                        if (['year', 'fsc', 'ics', 'fa', 'i.com', '11th', '12th', 'inter'].some(k => val.includes(k))) {
                            programSelect.value = 'College';
                        } else if (['class', 'playgroup', 'nursery', 'prep', 'kg', 'th', 'grade', 'school'].some(k => val.includes(k))) {
                            programSelect.value = 'School';
                        }
                    });
                }
            },
            preConfirm: () => {
                const name = (document.getElementById('swal-class-name') as HTMLInputElement).value;
                const section = (document.getElementById('swal-class-section') as HTMLInputElement).value;
                const wingKey = (document.getElementById('swal-class-wing') as HTMLSelectElement).value;
                const program = (document.getElementById('swal-class-program') as HTMLSelectElement).value;
                const fee = Number((document.getElementById('swal-class-fee') as HTMLInputElement).value);

                if (!name) {
                    Swal.showValidationMessage('Class designation is mandatory');
                    return false;
                }

                const fullName = section ? `${name} (${section})` : name;
                return { name: fullName, fee, wingKey, program };
            }
        });

        if (formValues) {
            addClass(formValues.name, formValues.fee);
            if (formValues.wingKey) {
                updateWingAssignments({ ...wingAssignments, [formValues.name]: formValues.wingKey });
            }
            if (formValues.program) {
                updateClassPrograms({ ...classPrograms, [formValues.name]: formValues.program });
            }
            Swal.fire({
                title: 'Unit Established',
                text: `${formValues.name} has been integrated into the institutional registry.`,
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleEditClass = async (className: string) => {
        const currentFee = feeStructure[className] || 0;

        let initialClassName = className;
        let initialSection = "";

        if (className.includes(" (") && className.endsWith(")")) {
            const parts = className.split(" (");
            initialClassName = parts[0];
            initialSection = parts[1].replace(")", "");
        }

        const { value: formValues } = await Swal.fire({
            title: '',
            html: `
                <div class="text-left font-outfit -mt-4">
                    <div class="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                        <div class="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center text-brand-primary shadow-sm shrink-0 -rotate-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-brand-primary uppercase tracking-tight leading-none">Edit Class</h3>
                            <p class="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Update Class Details</p>
                        </div>
                    </div>

                    <div class="space-y-2.5">
                        <div class="grid grid-cols-2 gap-2.5">
                            <div>
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Class Name</label>
                                <input id="swal-class-name" class="swal2-input !mt-0 !w-full !rounded-2xl !text-xs !border-slate-100 focus:!border-brand-primary transition-all !h-9 !px-4 !m-0" value="${initialClassName}">
                            </div>
                            <div>
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Section</label>
                                <input id="swal-class-section" class="swal2-input !mt-0 !w-full !rounded-2xl !text-xs !border-slate-100 !h-9 !px-4 !m-0" value="${initialSection}">
                            </div>
                        </div>

                        <div>
                            <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Monthly Fee</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary font-black text-[7px] pointer-events-none">PKR</span>
                                <input id="swal-class-fee" type="number" class="swal2-input !mt-0 !w-full !rounded-2xl !text-xs !pl-9 !border-slate-100 !h-9 !m-0" value="${currentFee}">
                            </div>
                        </div>

                        <div class="flex items-center gap-2 p-2 bg-amber-50/30 rounded-2xl border border-amber-50">
                            <svg class="text-amber-500 shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path></svg>
                            <p class="text-[7px] text-slate-400 leading-tight font-medium">Changes will be updated everywhere instantly.</p>
                        </div>
                    </div>
                </div>
            `,
            width: '320px',
            padding: '1.25rem',
            background: 'white',
            showCancelButton: true,
            confirmButtonText: 'Save Changes',
            confirmButtonColor: 'var(--brand-primary)',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'rounded-[2.5rem] border-0 shadow-2xl overflow-hidden',
                confirmButton: 'rounded-full px-8 py-2.5 !text-[9px] !font-black !uppercase !tracking-wider shadow-sm active:scale-95 transition-all !m-0',
                cancelButton: 'rounded-full px-8 py-2.5 !text-[9px] !font-black !uppercase !tracking-wider !bg-slate-50 !text-slate-400 hover:!bg-slate-100 transition-all !m-0 mr-2'
            },
            preConfirm: () => {
                const name = (document.getElementById('swal-class-name') as HTMLInputElement).value;
                const section = (document.getElementById('swal-class-section') as HTMLInputElement).value;
                const fee = Number((document.getElementById('swal-class-fee') as HTMLInputElement).value);

                if (!name) {
                    Swal.showValidationMessage('Unit designation is required for synchronization');
                    return false;
                }

                const fullName = section ? `${name} (${section})` : name;
                return { name: fullName, fee };
            }
        });

        if (formValues) {
            updateClass(className, formValues.name, formValues.fee);
            Swal.fire({
                title: 'Registry Synchronized',
                text: 'The unit parameters have been successfully updated in the master ledger.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleManageSubjects = async (className: string) => {
        const currentSubjects = (classSubjects[className] || []).join(', ');
        const { value: subjectsStr } = await Swal.fire({
            title: 'Manage Subjects',
            text: `Define curriculum for ${className} (Separated by commas)`,
            input: 'textarea',
            inputValue: currentSubjects,
            inputPlaceholder: 'English, Physics, Chemistry, Urdu...',
            showCancelButton: true,
            confirmButtonColor: 'var(--brand-primary)',
            confirmButtonText: 'Update Subjects'
        });

        if (subjectsStr !== undefined) {
            const subjects = subjectsStr.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            updateClassSubjects(className, subjects);

            if (subjects.length > 0) {
                const h = document.documentElement.classList.contains('dark');
                const { value: marksValues } = await Swal.fire({
                    title: 'Set Default Maximum Marks',
                    text: 'Define the total marks for each subject in this class. These will be used as defaults when entering exam marks.',
                    html: `
                        <div class="text-left font-outfit space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            ${subjects.map((s: string) => `
                                <div class="flex items-center justify-between gap-4 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/10">
                                    <label class="text-xs font-black uppercase text-brand-primary dark:text-brand-accent truncate flex-1">${s}</label>
                                    <input type="number" id="marks-${s.replace(/[^a-zA-Z0-9]/g, '-')}" class="w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/20 text-center py-1.5 outline-none rounded-lg text-xs font-black focus:border-brand-primary" value="${subjectTotalMarks[className]?.[s] || 100}" />
                                </div>
                            `).join('')}
                        </div>
                    `,
                    background: h ? 'var(--glass-bg)' : '#ffffff',
                    color: h ? 'var(--brand-accent)' : '#0f172a',
                    confirmButtonText: 'Save Curriculum & Marks',
                    confirmButtonColor: 'var(--brand-primary)',
                    preConfirm: () => {
                        const marks: Record<string, number> = {};
                        subjects.forEach((s: string) => {
                            const input = document.getElementById(`marks-${s.replace(/[^a-zA-Z0-9]/g, '-')}`) as HTMLInputElement;
                            marks[s] = Number(input?.value) || 100;
                        });
                        return marks;
                    }
                });

                if (marksValues) {
                    updateClassSubjectMarks(className, marksValues);
                    Swal.fire({ title: 'Curriculum Updated', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: h ? 'var(--glass-bg)' : '#ffffff', color: h ? 'var(--brand-accent)' : '#0f172a' });
                }
            } else {
                updateClassSubjectMarks(className, {});
                Swal.fire({ title: 'Curriculum Cleared', icon: 'info', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
            }
        }
    };

    const handleAssignInCharge = async (className: string) => {
        const teacherOptions = teachers.filter(t => t.status === 'Active' && (campusFilter === 'All' || t.campus?.trim().toLowerCase() === campusFilter.trim().toLowerCase())).reduce((acc, t) => {
            acc[t.id] = `${t.name} (${t.subject}) ${campusFilter === 'All' ? `- ${t.campus}` : ''}`;
            return acc;
        }, {} as Record<string, string>);

        const { value: teacherId } = await Swal.fire({
            title: 'Assign Class In-Charge',
            input: 'select',
            inputOptions: teacherOptions,
            inputPlaceholder: 'Select Faculty Lead...',
            showCancelButton: true,
            confirmButtonColor: 'var(--brand-primary)'
        });

        if (teacherId) {
            updateClassInCharge(className, teacherId);
            Swal.fire({ title: 'Lead Assigned', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        }
    };

    const handleAssignSubjectTeacher = async (className: string) => {
        const subjects = classSubjects[className] || [];
        if (subjects.length === 0) {
            Swal.fire({ title: 'No Subjects', text: 'Please define subjects first.', icon: 'warning' });
            return;
        }

        const currentAssignments = subjectTeachers[className] || {};
        const h = document.documentElement.classList.contains('dark');

        const { value: newAssignments } = await Swal.fire({
            title: '',
            html: `
                <div class="text-left font-outfit -mt-4">
                    <div class="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                        <div class="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-sm shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-indigo-600 uppercase tracking-tight leading-none">Faculty Allocation</h3>
                            <p class="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Assign Teachers to ${className}</p>
                        </div>
                    </div>

                    <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        ${subjects.map(s => `
                            <div class="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                <label class="text-[8px] font-black uppercase text-indigo-600 mb-1.5 block tracking-widest">${s}</label>
                                <select id="teacher-select-${s.replace(/\s+/g, '-')}" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider outline-none focus:ring-2 ring-indigo-500/20">
                                    <option value="">Select Teacher...</option>
                                    ${teachers.filter(t => t.status === 'Active' && (campusFilter === 'All' || t.campus?.trim().toLowerCase() === campusFilter.trim().toLowerCase())).map(t => `<option value="${t.id}" ${currentAssignments[s] === t.id ? 'selected' : ''}>${t.name} (${t.subject}) ${campusFilter === 'All' ? `- ${t.campus}` : ''}</option>`).join('')}
                                </select>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `,
            width: '400px',
            background: h ? 'var(--glass-bg)' : '#ffffff',
            color: h ? 'var(--brand-accent)' : '#0f172a',
            showCancelButton: true,
            confirmButtonText: 'Save All Changes',
            confirmButtonColor: '#6366f1',
            preConfirm: () => {
                const assignments: Record<string, string> = {};
                subjects.forEach(s => {
                    const select = document.getElementById(`teacher-select-${s.replace(/\s+/g, '-')}`) as HTMLSelectElement;
                    if (select.value) assignments[s] = select.value;
                });
                return assignments;
            }
        });

        if (newAssignments) {
            updateClassSubjectTeachers(className, newAssignments);
            Swal.fire({
                title: 'Allocation Matrix Saved',
                text: 'Faculty assignments for the entire unit have been synchronized.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        }
    };

    const handleImportStudents = (e: React.ChangeEvent<HTMLInputElement>, targetClass: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const rows = content.split('\n');
            if (rows.length < 2) return;

            const headers = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/ /g, ''));
            const studentRows = rows.slice(1).filter(r => r.trim());
            let count = 0;

            studentRows.forEach(row => {
                const values = [];
                let insideQuote = false;
                let currentWord = '';
                for (let i = 0; i < row.length; i++) {
                    const char = row[i];
                    if (char === '"') {
                        insideQuote = !insideQuote;
                    } else if (char === ',' && !insideQuote) {
                        values.push(currentWord);
                        currentWord = '';
                    } else {
                        currentWord += char;
                    }
                }
                values.push(currentWord);
                const cleanValues = values.map(val => val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

                const studentData: any = {};
                headers.forEach((key, index) => {
                    const val = cleanValues[index] || '';
                    if (key === 'id') studentData.id = val;
                    else if (key === 'name') studentData.name = val;
                    else if (key === 'fathername') studentData.fatherName = val;
                    else if (key === 'discipline') studentData.discipline = val;
                    else if (key === 'status') studentData.status = val;
                    else if (key === 'contactself') studentData.contactSelf = val;
                    else if (key === 'admissiondate') studentData.admissionDate = val;
                    else if (key === 'address') studentData.address = val;
                });

                // Always override the class with the target class
                studentData.class = targetClass;

                if (studentData.name) {
                    addStudent(studentData);
                    count++;
                }
            });
            e.target.value = '';
            Swal.fire({
                title: 'Import Successful',
                text: `${count} student(s) imported into ${targetClass}.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        };
        reader.readAsText(file);
    };

    const handleExportClassStudents = (className: string) => {
        const classStudents = students.filter(s => s.class === className);
        if (classStudents.length === 0) {
            Swal.fire({ title: 'No Students', text: `There are no students in ${className} to export.`, icon: 'info' });
            return;
        }

        const headers = [
            'ID                  ',
            'Name                                ',
            'Father Name                         ',
            'Class               ',
            'Discipline          ',
            'Status              ',
            'Contact Self        ',
            'Admission Date      ',
            'Address                                       '
        ];
        const csvRows = [
            headers.join(','),
            ...classStudents.map(s => [
                `"\t${s.id}"`,
                `"${(s.name || '').replace(/"/g, '""')}"`,
                `"${(s.fatherName || '').replace(/"/g, '""')}"`,
                `"${(s.class || '').replace(/"/g, '""')}"`,
                `"${(s.discipline || 'General').replace(/"/g, '""')}"`,
                `"${s.status}"`,
                `"\t${(s.contactSelf || '').replace(/"/g, '""')}"`,
                `"\t${(s.admissionDate || '').replace(/"/g, '""')}"`,
                `"${(s.address || '').replace(/"/g, '""')}"`
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${className.replace(/\s+/g, '_')}_Students_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDeleteClass = (className: string) => {
        const studentCount = students.filter(s => s.class === className).length;

        Swal.fire({
            title: 'Delete Class?',
            text: studentCount > 0
                ? `There are ${studentCount} students in this class. They will remain but their class field might become inconsistent.`
                : "This action will remove the class from the registry permanently.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--brand-primary)',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteClass(className);
                Swal.fire('Deleted', 'Class has been removed.', 'success');
            }
        });
    };

    const handleMigrateClass = async (className: string) => {
        const { value: migrationData } = await Swal.fire({
            title: 'Migrate Class Students',
            html: `
                <div class="text-left font-outfit p-4 bg-slate-50 rounded-3xl border border-slate-100 mb-4 items-center">
                    <p class="text-[9px] font-bold text-slate-500 mb-4">Move all students of <span class="text-brand-primary font-black">${className}</span> from one campus to another.</p>
                    <div class="space-y-4">
                        <div>
                            <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Source Campus (From)</label>
                            <select id="swal-from-campus" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest focus:ring-2 ring-brand-primary">
                                ${campuses.map(c => `<option value="${c.name}">${c.name.toUpperCase()}</option>`).join('')}
                            </select>
                        </div>
                        <div class="flex justify-center -my-2 relative z-10">
                            <div class="bg-brand-primary text-white p-1 rounded-full shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                            </div>
                        </div>
                        <div>
                            <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Destination Campus (To)</label>
                            <select id="swal-to-campus" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest focus:ring-2 ring-brand-primary">
                                ${campuses.map(c => `<option value="${c.name}">${c.name.toUpperCase()}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Execute Transfer',
            confirmButtonColor: 'var(--brand-primary)',
            customClass: {
                popup: 'rounded-[2.5rem] border-0 shadow-2xl',
                confirmButton: 'rounded-full px-8 py-2.5 !text-[9px] !font-black !uppercase !tracking-wider',
                cancelButton: 'rounded-full px-8 py-2.5 !text-[9px] !font-black !uppercase !tracking-wider'
            },
            preConfirm: () => {
                const f = (document.getElementById('swal-from-campus') as HTMLSelectElement).value;
                const t = (document.getElementById('swal-to-campus') as HTMLSelectElement).value;
                if (f === t) {
                    Swal.showValidationMessage('Source and target must be distinct');
                    return false;
                }
                return { from: f, to: t };
            }
        });

        if (migrationData) {
            migrateClass(className, migrationData.from, migrationData.to);
            Swal.fire({
                title: 'Migration Initiated',
                text: `${className} students are being transferred to ${migrationData.to}.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    const handlePassOutBatch = async (className: string) => {
        const matchingStudents = students.filter(s => s.class?.trim().toLowerCase() === className.trim().toLowerCase() && s.status === 'Active');
        const count = matchingStudents.length;
        const currentYear = new Date().getFullYear();
        const defaultSession = `${currentYear - 1}-${currentYear}`;

        const { value: passOutData } = await Swal.fire({
            title: `
                <div class="flex items-center justify-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-lg font-black">
                        🎓
                    </div>
                    <span class="font-outfit uppercase font-black text-base">Graduate / Pass-Out Batch</span>
                </div>
            `,
            html: `
                <div class="text-left font-outfit p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 mb-4">
                    <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-4">
                        You are about to graduate <span class="text-brand-primary dark:text-brand-accent font-black">${count} active students</span> from <span class="text-slate-800 dark:text-white font-black">${className}</span>.
                    </p>
                    <div class="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-4 text-[9px] font-bold text-amber-700 dark:text-amber-400">
                        ℹ️ All student records, father details, contact numbers, and certificates will remain <b>safely archived</b> in Alumni. They can be 1-Click Re-Admitted into College (1st Year) anytime!
                    </div>
                    <div class="space-y-3">
                        <div>
                            <label class="text-[8px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Passing Academic Session</label>
                            <input id="swal-passout-session" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-brand-primary outline-none" value="${defaultSession}" placeholder="e.g. 2025-2026" />
                        </div>
                        <div>
                            <label class="text-[8px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Batch Remarks / Notes</label>
                            <input id="swal-passout-remarks" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-white outline-none" value="${className} Matric / Graduation Passed Out Batch" />
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: `Graduate ${count} Students`,
            confirmButtonColor: '#003366',
            customClass: {
                popup: 'rounded-[2.5rem] border-0 shadow-2xl',
                confirmButton: 'rounded-full px-8 py-2.5 !text-[9px] !font-black !uppercase !tracking-wider',
                cancelButton: 'rounded-full px-8 py-2.5 !text-[9px] !font-black !uppercase !tracking-wider'
            },
            preConfirm: () => {
                const session = (document.getElementById('swal-passout-session') as HTMLInputElement)?.value.trim() || defaultSession;
                const remarks = (document.getElementById('swal-passout-remarks') as HTMLInputElement)?.value.trim() || 'Graduated Batch';
                return { session, remarks };
            }
        });

        if (passOutData) {
            await passOutClass(className, passOutData.session, passOutData.remarks);
            Swal.fire({
                title: '🎓 Batch Graduated!',
                text: `${count} students from ${className} moved to Alumni archive. Class is now clear for new admissions!`,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });
        }
    };

    const displayClasses = classes.filter(c => {
        const matchesSearch = c.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;

        // Section filter
        if (sectionFilter !== 'All') {
            const assignedWing = wingAssignments[c];
            if (assignedWing) {
                if (assignedWing !== sectionFilter) return false;
            } else {
                const cLow = c.toLowerCase();
                const isGirls = cLow.includes('girls');
                const isBoys = cLow.includes('boys') || ['6th', '7th', '8th', '9th', '10th', '1st year', '2nd year', '11th', '12th', 'inter', 'matric'].some(p => cLow.includes(p));
                let defaultWing = 'primary';
                if (isGirls) defaultWing = 'girls';
                else if (isBoys) defaultWing = 'boys';

                if (defaultWing !== sectionFilter) return false;
            }
        }

        if (campusFilter === 'All') return true;
        // Show class if it has students or teachers in this campus
        const hasStudents = students.some(s =>
            s.class?.trim().toLowerCase() === c.trim().toLowerCase() && s.campus?.toLowerCase() === campusFilter.toLowerCase()
        );
        const hasTeachers = teachers.some(t =>
            t.classes.some(tc => tc.trim().toLowerCase() === c.trim().toLowerCase()) && t.campus?.toLowerCase() === campusFilter.toLowerCase()
        );

        // CRITICAL FIX: To allow users to see and interactive with newly created (empty) classes
        // we show classes that have NO students or teachers anywhere yet.
        const isGloballyEmpty = !students.some(s => s.class?.trim().toLowerCase() === c.trim().toLowerCase()) &&
            !teachers.some(t => t.classes.some(tc => tc.trim().toLowerCase() === c.trim().toLowerCase()));

        return hasStudents || hasTeachers || isGloballyEmpty;
    });

    const isCollegeClass = (className: string) => {
        if (classPrograms && classPrograms[className]) {
            return classPrograms[className] === 'College';
        }
        const lower = className.toLowerCase();
        return ['year', 'fsc', 'ics', 'fa', 'i.com', '11th', '12th', 'inter'].some(kw => lower.includes(kw));
    };

    const schoolClasses = displayClasses.filter(c => !isCollegeClass(c));
    const collegeClasses = displayClasses.filter(c => isCollegeClass(c));

    const ClassCard = ({ className }: { className: string }) => {
        const studentCount = students.filter(s =>
            s.class?.trim().toLowerCase() === className.trim().toLowerCase() &&
            s.status === 'Active' &&
            (campusFilter === 'All' || s.campus?.toLowerCase() === campusFilter.toLowerCase())
        ).length;
        const totalAlumniCount = students.filter(s =>
            s.class?.trim().toLowerCase() === className.trim().toLowerCase() &&
            s.status === 'Passed Out'
        ).length;
        const fee = feeStructure[className] || 0;
        const isCollege = className.toLowerCase().includes('year');
        const subjects = classSubjects[className] || [];
        const inChargeId = classInCharge[className];
        const inCharge = teachers.find(t => t.id === inChargeId);

        // Determine Section Tag
        const assignedWing = wingAssignments[className];
        let sectionBadge = { label: '👶 Junior Section', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
        if (assignedWing === 'boys' || (!assignedWing && (className.toLowerCase().includes('boys') || ['6th', '7th', '8th', '9th', '10th', '1st year', '2nd year', '11th', '12th'].some(p => className.toLowerCase().includes(p)) && !className.toLowerCase().includes('girls')))) {
            sectionBadge = { label: '👦 Boys Section', bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
        } else if (assignedWing === 'girls' || (!assignedWing && className.toLowerCase().includes('girls'))) {
            sectionBadge = { label: '👧 Girls Section', bg: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
        } else if (assignedWing && !['primary', 'boys', 'girls'].includes(assignedWing)) {
            const customSec = (campusSections || []).find(s => s.id === assignedWing || s.key === assignedWing);
            sectionBadge = { label: `✨ ${customSec?.name || assignedWing}`, bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
        }

        // Dynamic capacity for visual strength meter
        const capacity = isCollege ? 60 : 45;
        const strengthPercentage = Math.min((studentCount / capacity) * 100, 100);

        return (
            <div key={className} className="group relative">
                {/* Visual Glow behind card on hover */}
                <div className={cn(
                    "absolute -inset-1 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-20 transition-all duration-700",
                    isCollege ? "bg-amber-500" : "bg-brand-primary"
                )}></div>

                <div className="relative h-full glass-card bg-white dark:bg-[#001a33] border border-slate-100 dark:border-white/5 rounded-[2.25rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col">

                    {/* Perspective Header Accent */}
                    <div className={cn(
                        "h-1.5 w-full",
                        isCollege ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" : "bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent"
                    )}></div>

                    {/* Quick Access Faculty Portal reveal on hover */}
                    <button
                        onClick={() => handleAssignSubjectTeacher(className)}
                        className="absolute top-4 right-4 translate-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-500 p-3 bg-brand-primary dark:bg-brand-accent text-white dark:text-[#001a33] rounded-2xl shadow-xl shadow-brand-primary/30 dark:shadow-brand-accent/20 z-10"
                        title="Quick Assign Faculty"
                    >
                        <UserPlus size={18} />
                    </button>

                    <div className="p-5 md:p-6 flex-1 flex flex-col gap-6">
                        {/* Header Section (Title + Tag) */}
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-all duration-700 group-hover:rotate-[360deg] shadow-lg",
                                isCollege ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" : "bg-brand-primary/5 text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent"
                            )}>
                                <GraduationCap className="w-6 h-6 md:w-7 md:h-7" />
                            </div>
                            <div className="min-w-0 flex-1 pt-1">
                                <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase leading-none mb-2 break-words relative overflow-hidden">
                                    <span className="relative z-10 group-hover:text-brand-primary dark:group-hover:text-brand-accent transition-colors">
                                        {className}
                                    </span>
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className={cn(
                                        "inline-block px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest whitespace-nowrap border",
                                        sectionBadge.bg
                                    )}>
                                        {sectionBadge.label}
                                    </span>
                                    <span className={cn(
                                        "inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap",
                                        isCollege ? "bg-amber-500/10 text-amber-600" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                                    )}>
                                        {isCollege ? 'College' : 'School'}
                                    </span>
                                    {totalAlumniCount > 0 && (
                                        <span className="inline-block px-2 py-0.5 bg-purple-500/10 text-purple-600 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                                            🎓 {totalAlumniCount} Alumni
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Three Column Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/80 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
                            <div className="text-center">
                                <p className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tuition</p>
                                <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">₨ {fee.toLocaleString()}</p>
                            </div>
                            <div className="text-center border-x border-slate-200/50 dark:border-white/5 px-1">
                                <p className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Students</p>
                                <p className="text-xs font-black text-brand-primary dark:text-brand-accent mt-0.5">{studentCount}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Subjects</p>
                                <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{subjects.length}</p>
                            </div>
                        </div>

                        {/* Class Capacity Strength Meter */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-[7.5px] font-black uppercase text-slate-400">
                                <span>Active Fill</span>
                                <span>{studentCount} / {capacity} ({Math.round(strengthPercentage)}%)</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className={cn(
                                        "h-full rounded-full transition-all duration-500",
                                        strengthPercentage > 90 ? "bg-rose-500" :
                                        strengthPercentage > 75 ? "bg-amber-500" :
                                        "bg-brand-primary dark:bg-brand-accent"
                                    )}
                                    style={{ width: `${strengthPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Class In-Charge Info */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-brand-primary/10 dark:bg-brand-accent/10 flex items-center justify-center text-brand-primary dark:text-brand-accent text-[10px] font-black">
                                    {inCharge ? inCharge.name[0] : '?'}
                                </div>
                                <div>
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Class In-Charge</p>
                                    <p className="text-[10px] font-black text-slate-700 dark:text-white truncate max-w-[120px]">{inCharge?.name || 'Unassigned'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleAssignInCharge(className)}
                                className="px-2.5 py-1 bg-white dark:bg-white/10 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-accent dark:hover:text-[#001a33] text-slate-600 dark:text-white rounded-lg text-[8px] font-black uppercase transition-all shadow-sm"
                            >
                                {inCharge ? 'Change' : 'Assign'}
                            </button>
                        </div>
                    </div>

                    {/* Card Actions Ribbon */}
                    <div className="grid grid-cols-7 border-t border-slate-100 dark:border-white/5 divide-x divide-slate-100 dark:divide-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                        <button
                            onClick={() => handleEditClass(className)}
                            className="p-3 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-brand-primary transition-colors"
                            title="Edit Configuration"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={() => handleManageSubjects(className)}
                            className="p-3 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-500 transition-colors"
                            title="Manage Curriculum"
                        >
                            <BookOpen size={14} />
                        </button>
                        <button
                            onClick={() => handlePassOutBatch(className)}
                            className="p-3 flex items-center justify-center text-slate-400 hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
                            title="Graduate / Pass-Out Batch to Alumni"
                        >
                            <GraduationCap size={14} />
                        </button>
                        <button
                            onClick={() => handleMigrateClass(className)}
                            className="p-3 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-purple-500 transition-colors"
                            title="Migrate Class Campus"
                        >
                            <ArrowRightLeft size={14} />
                        </button>
                        <button
                            onClick={() => document.getElementById(`import-students-${className}`)?.click()}
                            className="p-3 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-emerald-500 transition-colors"
                            title="Import Students CSV"
                        >
                            <UploadCloud size={14} />
                        </button>
                        <button
                            onClick={() => handleExportClassStudents(className)}
                            className="p-3 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-500 transition-colors"
                            title="Export Students CSV"
                        >
                            <DownloadCloud size={14} />
                        </button>
                        <button
                            onClick={() => handleDeleteClass(className)}
                            className="p-3 flex items-center justify-center text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                            title="Decommission Unit"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    <input
                        type="file"
                        id={`import-students-${className}`}
                        className="hidden"
                        accept=".csv"
                        onChange={(e) => handleImportStudents(e, className)}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in font-outfit pb-20">
            {/* Action Header */}
            <div className="relative">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[var(--brand-radius,1rem)] bg-brand-primary dark:bg-brand-accent flex items-center justify-center text-white dark:text-[#001a33] shadow-2xl shrink-0">
                                <Users size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-brand-primary dark:text-brand-accent uppercase leading-none">Class Registry</h2>
                        </div>
                        <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 font-bold max-w-lg leading-relaxed">
                            Configure institutional categories, define revenue tiers, and organize classes into Junior, Boys, and Girls sections.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-white/5 p-1 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 w-3 h-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent text-[10px] font-bold pl-8 pr-3 py-2 outline-none w-[110px] text-slate-700 dark:text-white"
                            />
                        </div>
                        <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10"></div>
                        <select
                            value={campusFilter}
                            onChange={(e) => setCampusFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-black px-3 py-2 outline-none cursor-pointer uppercase tracking-widest text-brand-primary dark:text-brand-accent"
                        >
                            <option value="All">All Campuses</option>
                            {campuses.map(c => <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>)}
                        </select>
                        <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10"></div>
                        <select
                            value={sectionFilter}
                            onChange={(e) => setSectionFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-black px-3 py-2 outline-none cursor-pointer uppercase tracking-widest text-emerald-600 dark:text-emerald-400"
                        >
                            <option value="All">All Sections</option>
                            <option value="primary">👶 Junior Section</option>
                            <option value="boys">👦 Boys Section</option>
                            <option value="girls">👧 Girls Section</option>
                            {(campusSections || []).filter(s => !['sec-junior', 'sec-boys', 'sec-girls'].includes(s.id)).map(s => (
                                <option key={s.id} value={s.key || s.id}>✨ {s.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleManageSections}
                            className="px-4 py-3 bg-white dark:bg-brand-primary-dark border border-slate-200 dark:border-white/10 text-brand-primary dark:text-white rounded-[var(--brand-radius,1rem)] text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                            title="Manage Campus Sections & Wings"
                        >
                            <Layers className="w-4 h-4 text-emerald-500" />
                            Sections
                        </button>
                        <button
                            onClick={handleRestoreDefaults}
                            className="px-4 py-3 border-2 border-brand-primary/10 text-brand-primary dark:text-white dark:border-white/10 rounded-[var(--brand-radius,1rem)] text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:border-brand-accent transition-all flex items-center justify-center gap-2 group"
                        >
                            <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            Defaults
                        </button>
                        <button
                            onClick={handleAddClass}
                            className="px-6 py-3 bg-brand-primary text-white rounded-[var(--brand-radius,1rem)] text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-brand-accent hover:text-brand-primary transition-all flex items-center justify-center gap-2 shadow-2xl active:scale-95 group"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Add Class
                        </button>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Total Classes', value: classes.length, icon: GraduationCap, color: 'text-brand-primary dark:text-white', bg: 'bg-brand-primary/10 dark:bg-white/10' },
                    { label: 'School Levels', value: schoolClasses.length, icon: Users, color: 'text-emerald-500 dark:text-brand-accent', bg: 'bg-emerald-500/10 dark:bg-brand-accent/10' },
                    { label: 'College Years', value: collegeClasses.length, icon: GraduationCap, color: 'text-amber-500 dark:text-white', bg: 'bg-amber-500/10 dark:bg-white/10' },
                    { label: 'Revenue Types', value: Object.keys(feeStructure).length, icon: Users, color: 'text-brand-accent dark:text-brand-accent', bg: 'bg-brand-accent/10 dark:bg-brand-accent/20' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 bg-white/5 dark:bg-[#001a33] backdrop-blur-sm border-white/10 dark:border-brand-accent/10 shadow-sm relative overflow-hidden group rounded-[var(--brand-radius,1.5rem)]">
                        <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg)}>
                            <stat.icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color)} />
                        </div>
                        <div>
                            <p className="text-[8px] md:text-[9px] font-black text-slate-400 dark:text-brand-accent/50 uppercase tracking-widest leading-tight whitespace-nowrap">{stat.label}</p>
                            <h4 className="text-lg md:text-xl font-black text-slate-800 dark:text-brand-accent leading-none mt-1">{stat.value}</h4>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 dark:bg-brand-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>
                ))}
            </div>

            <div className="space-y-12">
                {schoolClasses.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-primary dark:text-brand-accent whitespace-nowrap">
                                School Department
                            </h3>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-primary/20 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {schoolClasses.map(c => <ClassCard key={c} className={c} />)}
                        </div>
                    </div>
                )}

                {collegeClasses.length > 0 && (
                    <div className="space-y-6 pt-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-primary dark:text-brand-accent whitespace-nowrap">
                                College Department
                            </h3>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-primary/20 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {collegeClasses.map(c => <ClassCard key={c} className={c} />)}
                        </div>
                    </div>
                )}
            </div>

            {classes.length === 0 && (
                <div className="py-32 text-center glass-card border-dashed border-2 bg-slate-50/50 dark:bg-[#001a33]/50 border-slate-200 dark:border-brand-accent/20">
                    <div className="w-20 h-20 bg-white dark:bg-brand-accent rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-6">
                        <GraduationCap className="w-10 h-10 text-slate-300 dark:text-brand-primary" />
                    </div>
                    <h3 className="font-black text-slate-400 dark:text-brand-accent uppercase tracking-[0.3em] text-sm">Registry is Empty</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium max-w-xs mx-auto">Click "Restore Defaults" or "Add New Class" to begin institutional setup.</p>
                </div>
            )}
        </div>
    );
};
