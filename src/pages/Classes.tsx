import { Plus, Edit2, Trash2, GraduationCap, Users, RotateCcw, BookOpen, UserPlus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Swal from 'sweetalert2';
import { cn } from '../utils/cn';

export const ClassesPage = () => {
    const {
        classes, feeStructure, addClass, updateClass, deleteClass, students, teachers,
        classSubjects, classInCharge, updateClassSubjects, updateClassInCharge,
        assignSubjectTeacher, campuses
    } = useStore();

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

    const handleAddClass = async () => {
        const campusOptions = campuses.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});

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
                            <p class="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Add New Class</p>
                        </div>
                    </div>

                    <div class="space-y-2.5">
                        <div class="grid grid-cols-2 gap-2.5">
                            <div>
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Class Name</label>
                                <input id="swal-class-name" class="swal2-input !mt-0 !w-full !rounded-2xl !text-xs !border-slate-100 focus:!border-brand-primary transition-all !h-9 !px-4 !m-0" placeholder="e.g. Grade 10">
                            </div>
                            <div>
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Section</label>
                                <input id="swal-class-section" class="swal2-input !mt-0 !w-full !rounded-2xl !text-xs !border-slate-100 !h-9 !px-4 !m-0" placeholder="e.g. A">
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
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Admission Fee</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary font-black text-[7px] pointer-events-none">PKR</span>
                                    <input id="swal-admission-fee" type="number" class="swal2-input !mt-0 !w-full !rounded-2xl !text-xs !pl-9 !border-slate-100 !h-9 !m-0" placeholder="5000">
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2.5">
                            <div>
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Campus</label>
                                <select id="swal-campus" class="swal2-input !mt-0 !w-full !rounded-2xl !text-[10px] !border-slate-100 !h-9 !px-3 !m-0 !bg-white">
                                    <option value="" disabled selected>Select...</option>
                                    ${Object.entries(campusOptions).map(([id, name]) => `<option value="${id}">${name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="text-[7px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Student Capacity</label>
                                <input id="swal-capacity" type="number" class="swal2-input !mt-0 !w-full !rounded-2xl !text-xs !border-slate-100 !h-9 !px-4 !m-0" placeholder="45">
                            </div>
                        </div>

                        <div class="flex items-center gap-2 p-2 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                            <svg class="text-brand-primary shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            <p class="text-[7px] text-slate-400 font-medium">Information will be saved automatically.</p>
                        </div>
                    </div>
                </div>
            `,
            width: '360px',
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
            preConfirm: () => {
                const name = (document.getElementById('swal-class-name') as HTMLInputElement).value;
                const section = (document.getElementById('swal-class-section') as HTMLInputElement).value;
                const fee = Number((document.getElementById('swal-class-fee') as HTMLInputElement).value);

                if (!name) {
                    Swal.showValidationMessage('Unit designation is mandatory');
                    return false;
                }

                const fullName = section ? `${name} (${section})` : name;
                return { name: fullName, fee };
            }
        });

        if (formValues) {
            addClass(formValues.name, formValues.fee);
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
            Swal.fire({ title: 'Curriculum Updated', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        }
    };

    const handleAssignInCharge = async (className: string) => {
        const teacherOptions = teachers.reduce((acc, t) => {
            acc[t.id] = `${t.name} (${t.subject})`;
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

        const { value: subject } = await Swal.fire({
            title: 'Select Subject',
            input: 'select',
            inputOptions: subjects.reduce((acc, s) => ({ ...acc, [s]: s }), {}),
            inputPlaceholder: 'Choose subject...',
            showCancelButton: true,
            confirmButtonColor: 'var(--brand-primary)'
        });

        if (subject) {
            const teacherOptions = teachers.reduce((acc, t) => {
                acc[t.id] = `${t.name} (${t.subject})`;
                return acc;
            }, {} as Record<string, string>);

            const { value: teacherId } = await Swal.fire({
                title: `Teacher for ${subject}`,
                input: 'select',
                inputOptions: teacherOptions,
                inputPlaceholder: 'Select subject teacher...',
                showCancelButton: true,
                confirmButtonColor: 'var(--brand-primary)'
            });

            if (teacherId) {
                assignSubjectTeacher(className, subject, teacherId);
                Swal.fire({ title: 'Allocation Saved', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
            }
        }
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

    const schoolClasses = classes.filter(c => !c.toLowerCase().includes('year'));
    const collegeClasses = classes.filter(c => c.toLowerCase().includes('year'));

    const ClassCard = ({ className }: { className: string }) => {
        const studentCount = students.filter(s => s.class === className).length;
        const fee = feeStructure[className] || 0;
        const isCollege = className.toLowerCase().includes('year');
        const subjects = classSubjects[className] || [];
        const inChargeId = classInCharge[className];
        const inCharge = teachers.find(t => t.id === inChargeId);

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

                    <div className="p-6 space-y-6 flex-1 flex flex-col">
                        {/* Title & Revenue Sector */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:rotate-[360deg] shadow-lg",
                                    isCollege ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" : "bg-brand-primary/5 text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent"
                                )}>
                                    <GraduationCap className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase leading-none mb-1.5 group-hover:text-brand-primary dark:group-hover:text-brand-accent transition-colors">{className}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                            isCollege ? "bg-amber-500/10 text-amber-600" : "bg-brand-primary/10 text-brand-primary dark:text-brand-accent"
                                        )}>
                                            {isCollege ? 'College Level' : 'School Level'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Tuition Rate</p>
                                <div className="flex items-baseline justify-end gap-1">
                                    <span className="text-[10px] font-black text-slate-400">RS</span>
                                    <span className="text-xl font-black text-brand-primary dark:text-white leading-none tracking-tighter">
                                        {fee.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Enrollment Intensity Meter */}
                        <div className="space-y-3 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Users className="w-3 h-3 text-slate-400" />
                                    <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Enrollment Density</p>
                                </div>
                                <p className="text-[10px] font-black text-slate-800 dark:text-white">{studentCount} <span className="text-slate-400">/ {capacity}</span></p>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000 ease-in-out rounded-full",
                                        isCollege ? "bg-amber-500" : "bg-gradient-to-r from-brand-primary to-brand-secondary shadow-[0_0_10px_rgba(var(--glow-shadow),0.4)]"
                                    )}
                                    style={{ width: `${strengthPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Curriculum Overview */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-3 h-3 text-slate-400" />
                                <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mapped Curriculum</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {subjects.length > 0 ? (
                                    subjects.slice(0, 3).map(s => (
                                        <div key={s} className="px-2.5 py-1 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg text-[9px] font-bold text-slate-600 dark:text-slate-400 hover:border-brand-accent transition-colors">
                                            {s}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[10px] text-slate-400 italic font-medium">No subjects allocated yet</div>
                                )}
                                {subjects.length > 3 && (
                                    <div className="px-2 py-1 bg-brand-primary/10 text-brand-primary dark:text-brand-accent rounded-lg text-[9px] font-black">
                                        +{subjects.length - 3} Units
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Coordinator Block */}
                        <div className="mt-auto pt-5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                            {inCharge ? (
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-11 h-11 rounded-[1.25rem] bg-gradient-to-tr from-brand-primary to-brand-secondary p-0.5 shadow-xl">
                                            <div className="w-full h-full rounded-[1.15rem] overflow-hidden bg-white dark:bg-[#001a33] flex items-center justify-center text-xs font-black text-brand-primary">
                                                {inCharge.avatar && inCharge.avatar.length > 5 ? (
                                                    <img src={inCharge.avatar} className="w-full h-full object-cover" alt={inCharge.name} />
                                                ) : (
                                                    <span>{inCharge.avatar || inCharge.name.charAt(0)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#001a33]"></div>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1.5">Academic Lead</p>
                                        <p className="text-xs font-black text-slate-700 dark:text-white truncate max-w-[100px]">{inCharge.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleAssignInCharge(className)}
                                    className="flex items-center gap-3 group/btn"
                                >
                                    <div className="w-11 h-11 rounded-[1.25rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-300 group-hover/btn:border-brand-primary group-hover/btn:text-brand-primary transition-all">
                                        <UserPlus size={18} />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover/btn:text-brand-primary transition-colors">Assign Lead</p>
                                </button>
                            )}

                            <div className="flex gap-1.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                <button
                                    onClick={() => handleEditClass(className)}
                                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-primary dark:hover:text-brand-accent hover:bg-white dark:hover:bg-white/10 shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-white/10 transition-all"
                                    title="Edit Configuration"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleManageSubjects(className)}
                                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-white/10 shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-white/10 transition-all"
                                    title="Manage Curriculum"
                                >
                                    <BookOpen size={14} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClass(className)}
                                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-white/10 shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-white/10 transition-all"
                                    title="Decommission Unit"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Faculty Portal reveal on hover */}
                    <button
                        onClick={() => handleAssignSubjectTeacher(className)}
                        className="absolute top-4 right-4 translate-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-500 p-3 bg-brand-primary dark:bg-brand-accent text-white dark:text-[#001a33] rounded-2xl shadow-xl shadow-brand-primary/30 dark:shadow-brand-accent/20 z-10"
                        title="Quick Assign Faculty"
                    >
                        <UserPlus size={18} />
                    </button>

                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in font-outfit pb-20 px-4 md:px-0">
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
                            Configure institutional categories, define revenue tiers, and optimize enrollment density across departments.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                            onClick={handleRestoreDefaults}
                            className="px-5 py-3 border-2 border-brand-primary/10 text-brand-primary dark:text-white dark:border-white/10 rounded-[var(--brand-radius,1rem)] text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:border-brand-accent transition-all flex items-center justify-center gap-2 group"
                        >
                            <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            Restore Defaults
                        </button>
                        <button
                            onClick={handleAddClass}
                            className="px-8 py-3 bg-brand-primary text-white rounded-[var(--brand-radius,1rem)] text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-brand-accent hover:text-brand-primary transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 group"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Add New Class
                        </button>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Classes', value: classes.length, icon: GraduationCap, color: 'text-brand-primary dark:text-white', bg: 'bg-brand-primary/10 dark:bg-white/10' },
                    { label: 'School Levels', value: schoolClasses.length, icon: Users, color: 'text-emerald-500 dark:text-brand-accent', bg: 'bg-emerald-500/10 dark:bg-brand-accent/10' },
                    { label: 'College Years', value: collegeClasses.length, icon: GraduationCap, color: 'text-amber-500 dark:text-white', bg: 'bg-amber-500/10 dark:bg-white/10' },
                    { label: 'Revenue Types', value: Object.keys(feeStructure).length, icon: Users, color: 'text-brand-accent dark:text-brand-accent', bg: 'bg-brand-accent/10 dark:bg-brand-accent/20' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-4 flex items-center gap-4 bg-white/5 dark:bg-[#001a33] backdrop-blur-sm border-white/10 dark:border-brand-accent/10 shadow-sm relative overflow-hidden group rounded-[var(--brand-radius,1.5rem)]">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg)}>
                            <stat.icon className={cn("w-6 h-6", stat.color)} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 dark:text-brand-accent/50 uppercase tracking-widest leading-tight">{stat.label}</p>
                            <h4 className="text-xl font-black text-slate-800 dark:text-brand-accent leading-none mt-1">{stat.value}</h4>
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
