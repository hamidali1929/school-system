import { useState } from 'react';
import { UserPlus, GraduationCap, Mail, Search, Edit, Trash2, Download, Plus, X, CheckCircle2 } from 'lucide-react';
import { useStore, type Teacher } from '../context/StoreContext';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';
import { TeacherForm } from '../components/TeacherForm';
import { TeacherIDCardGenerator } from '../components/TeacherIDCardGenerator';
import { FacultyProfileModal } from '../components/FacultyProfileModal';
import { Contact, FileText } from 'lucide-react';

export const Teachers = () => {
    const { teachers, deleteTeacher, addTeacher } = useStore();
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | undefined>();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [campusFilter, setCampusFilter] = useState('All');
    const [selectedTeacherForId, setSelectedTeacherForId] = useState<Teacher | null>(null);
    const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState<Teacher | null>(null);
    const { campuses } = useStore();

    const filteredTeachers = teachers.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.subject.toLowerCase().includes(search.toLowerCase());
        const matchesCampus = campusFilter === 'All' || t.campus === campusFilter;
        return matchesSearch && matchesCampus;
    });

    const stats = {
        total: teachers.length,
        active: teachers.filter(t => t.status === 'Active').length,
        subjects: new Set(teachers.map(t => t.subject)).size
    };

    const handleEditTeacher = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setIsFormOpen(true);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        Swal.fire({
            title: `Delete ${selectedIds.length} Teachers?`,
            text: `This will permanently remove the records from the school database.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
            background: '#ffffff',
            customClass: {
                title: 'text-xl font-black text-brand-primary dark:text-brand-accent',
                popup: 'rounded-3xl border-none shadow-2xl'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                selectedIds.forEach(id => deleteTeacher(id));
                setSelectedIds([]);
                Swal.fire({
                    title: 'Deleted!',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        });
    };

    const handleExportTeachers = () => {
        if (filteredTeachers.length === 0) return;
        const headers = ['ID', 'Name', 'Subject', 'Phone', 'Status', 'Classes', 'Email', 'Address'];
        const csvRows = [headers.join(','), ...filteredTeachers.map(t => [t.id || '', `"${t.name}"`, `"${t.subject}"`, `"${t.phone || ''}"`, t.status, `"${(t.classes || []).join('; ')}"`, `"${t.email || ''}"`, `"${(t.address || '').replace(/"/g, '""')}"`].join(','))];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Teachers_Export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleImportTeachers = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const rows = content.split('\n').filter(r => r.trim());
            if (rows.length < 2) return;
            const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
            let count = 0;
            rows.slice(1).forEach(row => {
                const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                const data: any = { status: 'Active', classes: [], permissions: [] };
                headers.forEach((h, i) => {
                    let v = (values[i] || '').trim().replace(/^"|"$/g, '').replace(/""/g, '"');
                    if (h.includes('name')) data.name = v;
                    else if (h.includes('subject')) data.subject = v;
                    else if (h.includes('phone')) data.phone = v;
                    else if (h.includes('email')) data.email = v;
                    else if (h.includes('class')) data.classes = v.split(';').map(x => x.trim()).filter(Boolean);
                });
                if (data.name && data.subject) {
                    addTeacher(data);
                    count++;
                }
            });
            Swal.fire({ title: 'Import Complete', text: `${count} teachers added.`, icon: 'success' });
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    const handleDeleteTeacher = (id: string, name: string) => {
        Swal.fire({
            title: `Remove ${name}?`,
            text: 'This record will be permanently deleted.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete'
        }).then((res) => {
            if (res.isConfirmed) {
                deleteTeacher(id);
                Swal.fire({ title: 'Deleted', icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
            }
        });
    };

    return (
        <div className="space-y-8 animate-fade-in font-outfit pb-10">
            {/* Premium Compact Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary to-brand-primary/80 dark:from-brand-primary/20 dark:to-brand-primary/10 rounded-[var(--brand-radius,2.5rem)] p-4 md:p-10 shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-8">
                    <div className="space-y-1.5 md:space-y-3 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-white/90">Faculty Matrix</span>
                        </div>
                        <h2 className="text-xl md:text-4xl font-black text-white dark:text-yellow-400 tracking-tighter leading-none uppercase">Faculty Dashboard</h2>
                        <p className="hidden md:block text-[10px] md:text-sm text-white/40 dark:text-yellow-400/30 font-bold max-w-xl leading-relaxed">Strategic management of institutional educators & academic personnel.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-2xl p-1 rounded-xl md:rounded-2xl border border-white/10 w-full sm:w-auto justify-center">
                            <div
                                onClick={() => {
                                    if (selectedIds.length === filteredTeachers.length && filteredTeachers.length > 0) setSelectedIds([]);
                                    else setSelectedIds(filteredTeachers.map(s => s.id));
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/10 rounded-lg transition-all cursor-pointer group"
                            >
                                <div className={cn(
                                    "w-3.5 h-3.5 rounded-md border-2 flex items-center justify-center transition-all duration-300",
                                    selectedIds.length === filteredTeachers.length && filteredTeachers.length > 0
                                        ? "bg-white border-white text-brand-primary scale-110"
                                        : "border-white/30 group-hover:border-white"
                                )}>
                                    {selectedIds.length === filteredTeachers.length && filteredTeachers.length > 0 && <CheckCircle2 className="w-2.5 h-2.5 text-brand-primary" />}
                                </div>
                                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-white/90">Select</span>
                            </div>
                            <div className="w-[1px] h-4 bg-white/10 mx-0.5"></div>
                            <button onClick={handleBulkDelete} disabled={selectedIds.length === 0} className={cn("px-3 py-1.5 rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest transition-all", selectedIds.length > 0 ? "bg-rose-500 text-white shadow-xl shadow-rose-500/30" : "text-white/20 cursor-not-allowed")}>
                                Delete ({selectedIds.length})
                            </button>
                        </div>
                        <button
                            onClick={() => { setEditingTeacher(undefined); setIsFormOpen(true); }}
                            className="w-full sm:w-auto px-6 py-2.5 md:py-4 bg-white dark:bg-brand-accent text-brand-primary dark:text-[#000816] rounded-xl md:rounded-[var(--brand-radius,1.5rem)] text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] hover:bg-blue-600 dark:hover:bg-brand-accent/80 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            <UserPlus className="w-3.5 h-3.5 group-hover:rotate-6 transition-transform" /> <span className="md:hidden">Add Faculty</span><span className="hidden md:inline">Hire Faculty</span>
                        </button>
                    </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="mt-4 md:mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-6 border-t border-white/5 pt-4 md:pt-8">
                    <div className="grid grid-cols-3 gap-2 md:gap-4 w-full sm:w-auto">
                        <div className="bg-white/5 backdrop-blur-md rounded-xl md:rounded-2xl px-3 py-2 md:px-5 md:py-3 border border-white/5">
                            <p className="text-[6px] md:text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Total</p>
                            <p className="text-xs md:text-xl font-black text-white leading-none">{stats.total}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-xl md:rounded-2xl px-3 py-2 md:px-5 md:py-3 border border-white/5">
                            <p className="text-[6px] md:text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Active</p>
                            <p className="text-xs md:text-xl font-black text-white leading-none">{stats.active}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-xl md:rounded-2xl px-3 py-2 md:px-5 md:py-3 border border-white/5">
                            <p className="text-[6px] md:text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Fields</p>
                            <p className="text-xs md:text-xl font-black text-white leading-none">{stats.subjects}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                        <input type="file" id="import-teachers-input" className="hidden" accept=".csv" onChange={handleImportTeachers} />
                        <button onClick={() => document.getElementById('import-teachers-input')?.click()} className="flex-1 sm:flex-none px-3 py-2 bg-white/5 rounded-lg md:rounded-xl border border-white/10 text-white hover:bg-white hover:text-brand-primary transition-all flex items-center justify-center gap-1.5 text-[7px] md:text-[9px] font-black uppercase tracking-widest group"><Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" /> Import</button>
                        <button onClick={handleExportTeachers} className="flex-1 sm:flex-none px-3 py-2 bg-white/5 rounded-lg md:rounded-xl border border-white/10 text-white hover:bg-white hover:text-brand-primary transition-all flex items-center justify-center gap-1.5 text-[7px] md:text-[9px] font-black uppercase tracking-widest group"><Download className="w-3 h-3 group-hover:-translate-y-1 transition-transform" /> Export</button>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="glass-card flex flex-col md:flex-row items-center gap-3 px-4 py-3 rounded-2xl -mt-4 relative z-20">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search faculty..."
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none focus:ring-4 ring-brand-primary/5 focus:bg-white transition-all"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><X className="w-3.5 h-3.5 text-slate-400" /></button>}
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                        value={campusFilter}
                        onChange={(e) => setCampusFilter(e.target.value)}
                        className="bg-slate-50 dark:bg-[#000d1a] border border-slate-100 dark:border-white/5 rounded-xl md:rounded-2xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-blue-500 w-full md:min-w-[180px] cursor-pointer appearance-none hover:bg-white transition-colors h-10 flex items-center"
                    >
                        <option value="All">All Campuses</option>
                        {campuses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Premium Adaptive Grid Content */}
            <div className="relative">
                {/* Mobile View: Compact Touch Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-5 px-1">
                    {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => {
                        const isSelected = selectedIds.includes(teacher.id);
                        return (
                            <div key={teacher.id} className={cn(
                                "group relative bg-white dark:bg-[#001529] rounded-[2.5rem] p-6 border-2 transition-all duration-500",
                                isSelected ? "border-brand-primary dark:border-brand-accent shadow-2xl scale-[1.02]" : "border-slate-100 dark:border-white/5 shadow-xl hover:border-brand-primary/20 dark:hover:border-brand-accent/20"
                            )}>
                                <div className="absolute top-5 right-5 z-10" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => e.target.checked ? setSelectedIds(prev => [...prev, teacher.id]) : setSelectedIds(prev => prev.filter(id => id !== teacher.id))}
                                        className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-white/10 checked:bg-brand-primary dark:checked:bg-brand-accent transition-all cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-center gap-5 mb-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary dark:from-brand-accent dark:to-brand-accent/60 flex items-center justify-center font-black text-white dark:text-[#000816] text-2xl shadow-xl shadow-brand-primary/20 dark:shadow-brand-accent/20 shrink-0 border-2 border-white dark:border-[#001529]">
                                        {teacher.avatar && teacher.avatar.length > 5 ? <img src={teacher.avatar} className="w-full h-full object-cover rounded-2xl" /> : <span>{teacher.name.charAt(0)}</span>}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-lg text-brand-primary dark:text-white tracking-tighter truncate pr-8 leading-none mb-1">{teacher.name}</h4>
                                        <p className="inline-block px-3 py-0.5 bg-brand-primary/5 dark:bg-white/5 text-brand-primary dark:text-brand-accent text-[8px] font-black uppercase tracking-widest rounded-full">{teacher.subject}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <p className="text-[7px] font-black text-slate-400 dark:text-brand-accent/40 uppercase tracking-[0.2em] leading-none mb-1.5">Enroll ID</p>
                                        <p className="text-[10px] font-black text-slate-800 dark:text-white truncate">{teacher.id}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <p className="text-[7px] font-black text-slate-400 dark:text-brand-accent/40 uppercase tracking-[0.2em] leading-none mb-1.5">Staff Status</p>
                                        <span className={cn("text-[7px] font-black uppercase px-2 py-0.5 rounded-md inline-block", teacher.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white')}>{teacher.status}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedTeacherForProfile(teacher)}
                                            className="p-3 bg-brand-primary/5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-brand-primary dark:hover:text-brand-accent transition-all"
                                        >
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedTeacherForId(teacher)}
                                            className="p-3 bg-blue-500/5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-brand-primary dark:hover:text-brand-accent transition-all"
                                        >
                                            <Contact className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleEditTeacher(teacher)} className="p-3 bg-emerald-500/5 rounded-xl text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"><Edit className="w-4 h-4" /></button>
                                    </div>
                                    <button onClick={() => handleDeleteTeacher(teacher.id, teacher.name)} className="p-3 bg-rose-500/5 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full py-20 text-center bg-white dark:bg-[#001529] rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-white/5">
                            <Plus className="w-16 h-16 text-slate-200 dark:text-white/5 mx-auto mb-6 opacity-20" />
                            <p className="text-slate-400 dark:text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">No faculty records match your query</p>
                        </div>
                    )}
                </div>

                {/* Desktop View: Full Detail Cards */}
                <div className="hidden lg:grid grid-cols-2 2xl:grid-cols-3 gap-8">
                    {filteredTeachers.map((teacher) => {
                        const isSelected = selectedIds.includes(teacher.id);
                        return (
                            <div key={teacher.id} className={cn(
                                "relative group bg-white dark:bg-[#001a33] rounded-[2.5rem] p-8 transition-all duration-500 border-2",
                                isSelected
                                    ? "border-brand-primary dark:border-brand-accent shadow-2xl scale-[0.98]"
                                    : "border-slate-50 dark:border-white/5 hover:border-brand-primary/20 hover:shadow-xl"
                            )}>
                                {/* Card Decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/[0.02] dark:bg-brand-accent/5 rounded-full translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-150"></div>

                                {/* Selection Overlay */}
                                <div className="absolute top-6 left-6 z-10">
                                    <button
                                        onClick={() => isSelected ? setSelectedIds(prev => prev.filter(id => id !== teacher.id)) : setSelectedIds(prev => [...prev, teacher.id])}
                                        className={cn(
                                            "w-8 h-8 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl active:scale-90 border-2",
                                            isSelected
                                                ? "bg-brand-primary dark:bg-brand-accent border-brand-primary dark:border-brand-accent text-white dark:text-[#000816] rotate-[360deg]"
                                                : "bg-white dark:bg-[#001529] border-slate-100 dark:border-white/10 text-transparent hover:border-brand-primary"
                                        )}
                                    >
                                        <CheckCircle2 className={cn("w-5 h-5", isSelected ? "opacity-100" : "opacity-0")} />
                                    </button>
                                </div>

                                {/* Action Menu */}
                                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                    <button onClick={() => setSelectedTeacherForId(teacher)} className="p-3 bg-white dark:bg-[#001529] border border-slate-100 dark:border-white/10 text-[#003366] dark:text-brand-accent hover:bg-[#003366] hover:text-white rounded-2xl shadow-xl transition-all active:scale-95"><Contact className="w-5 h-5" /></button>
                                    <button onClick={() => handleEditTeacher(teacher)} className="p-3 bg-white dark:bg-[#001529] border border-slate-100 dark:border-white/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-2xl shadow-xl transition-all active:scale-95"><Edit className="w-5 h-5" /></button>
                                    <button onClick={() => handleDeleteTeacher(teacher.id, teacher.name)} className="p-3 bg-white dark:bg-[#001529] border border-slate-100 dark:border-white/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-2xl shadow-xl transition-all active:scale-95"><Trash2 className="w-5 h-5" /></button>
                                </div>

                                {/* Profile Section */}
                                <div className="flex flex-col items-center text-center mt-4">
                                    <div className="relative">
                                        <div className="w-28 h-28 rounded-[var(--brand-radius,2.5rem)] bg-gradient-to-tr from-brand-primary to-brand-secondary dark:from-brand-accent dark:to-brand-accent/60 p-1 shadow-2xl overflow-hidden group-hover:rotate-6 transition-transform duration-500">
                                            <div className="w-full h-full rounded-[2.2rem] bg-white dark:bg-[#001529] p-1 overflow-hidden">
                                                {teacher.avatar && teacher.avatar.length > 5 ? (
                                                    <img src={teacher.avatar} className="w-full h-full object-cover rounded-[2rem]" alt={teacher.name} />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-50 dark:bg-white/5 flex items-center justify-center rounded-[var(--brand-radius,2rem)] text-3xl font-black text-brand-primary dark:text-brand-accent">
                                                        {teacher.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white dark:border-[#001529] shadow-lg flex items-center justify-center",
                                            teacher.status === 'Active' ? "bg-emerald-400" : "bg-amber-400"
                                        )}></div>
                                    </div>

                                    <div className="mt-6 space-y-1">
                                        <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-tight group-hover:text-brand-primary dark:group-hover:text-brand-accent transition-colors uppercase">{teacher.name}</h3>
                                        <p className="inline-block px-4 py-1.5 bg-brand-primary/5 dark:bg-white/5 text-brand-primary dark:text-brand-accent rounded-full text-[10px] font-black uppercase tracking-widest">{teacher.subject}</p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 gap-3 mt-8">
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] group-hover:bg-blue-50 dark:group-hover:bg-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm"><GraduationCap className="w-5 h-5 text-brand-primary dark:text-brand-accent" /></div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">Classes Assigned</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-white/80 truncate">{(teacher.classes || []).join(', ') || 'No classes'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] group-hover:bg-blue-50 dark:group-hover:bg-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm"><Mail className="w-5 h-5 text-brand-secondary dark:text-brand-accent" /></div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">Email Identity</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-white/80 truncate">{teacher.email || 'faculty@edunova.com'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest leading-none">Record Status</span>
                                        <span className={cn("text-xs font-bold mt-1", teacher.status === 'Active' ? "text-emerald-500" : "text-amber-500")}>{teacher.status}</span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTeacherForProfile(teacher)}
                                        className="px-6 py-3 bg-brand-primary dark:bg-brand-accent text-white dark:text-[#000816] rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 dark:hover:bg-brand-accent/80 transition-all shadow-lg active:scale-95"
                                    >
                                        Full Profile
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isFormOpen && (
                <TeacherForm
                    onClose={() => setIsFormOpen(false)}
                    editTeacher={editingTeacher}
                />
            )}
            {selectedTeacherForId && (
                <TeacherIDCardGenerator
                    teacher={selectedTeacherForId}
                    onClose={() => setSelectedTeacherForId(null)}
                />
            )}
            {selectedTeacherForProfile && (
                <FacultyProfileModal
                    teacher={selectedTeacherForProfile}
                    onClose={() => setSelectedTeacherForProfile(null)}
                />
            )}
        </div>
    );
};
