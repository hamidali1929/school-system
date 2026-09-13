// @ts-nocheck
import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Laptop, Plus, Users, Award, Trash2, X, Search, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';
import { CertificateGenerator } from '../components/CertificateGenerator';

export const Courses = () => {
    const { skillCourses, addSkillCourse, deleteSkillCourse, courseEnrollments, addCourseEnrollment, students, teachers, settings } = useStore();
    const [activeTab, setActiveTab] = useState<'catalog' | 'enrollments'>('catalog');
    const [isCreatingCourse, setIsCreatingCourse] = useState(false);
    
    // New Course Form State
    const [courseForm, setCourseForm] = useState({
        title: '',
        category: '',
        duration: '',
        fee: '',
        schedule: '',
        instructorId: '',
        capacity: ''
    });

    // Enrollment Modal State
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [enrollType, setEnrollType] = useState<'internal' | 'external'>('internal');
    const [enrollCourseId, setEnrollCourseId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    
    // External Student Form
    const [isCertificateOpen, setIsCertificateOpen] = useState(false);
    const [certificateData, setCertificateData] = useState({ studentName: '', courseName: '', enrollmentDate: '' });
    const [externalForm, setExternalForm] = useState({
        name: '',
        fatherName: '',
        phone: '',
        cnic: '',
        gender: 'Male',
        address: ''
    });

    const handleSaveCourse = () => {
        if (!courseForm.title || !courseForm.duration || !courseForm.fee) {
            Swal.fire('Missing Details', 'Please fill the required course details', 'error');
            return;
        }
        addSkillCourse({
            ...courseForm,
            fee: Number(courseForm.fee),
            capacity: Number(courseForm.capacity) || 30,
            status: 'Ongoing'
        });
        setIsCreatingCourse(false);
        Swal.fire('Saved', 'New Skill Course Added', 'success');
        setCourseForm({ title: '', category: '', duration: '', fee: '', schedule: '', instructorId: '', capacity: '' });
    };

    const handleDeleteCourse = (id: string) => {
        Swal.fire({
            title: 'Delete Course?',
            text: 'This will remove the course from the catalog.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444'
        }).then((res) => {
            if (res.isConfirmed) deleteSkillCourse(id);
        });
    };

    const handleEnroll = () => {
        if (!enrollCourseId) {
            Swal.fire('Error', 'Please select a course', 'error');
            return;
        }

        if (enrollType === 'internal') {
            if (!selectedStudentId) {
                Swal.fire('Error', 'Please select a student', 'error');
                return;
            }
            addCourseEnrollment({
                studentId: selectedStudentId,
                courseId: enrollCourseId,
                isOutsider: false,
                
            });
        } else {
            if (!externalForm.name || !externalForm.phone) {
                Swal.fire('Error', 'Name and Phone are required for external students', 'error');
                return;
            }
            addCourseEnrollment({
                courseId: enrollCourseId,
                isOutsider: true,
                outsiderDetails: {
                    ...externalForm
                },
                
            });
        }

        Swal.fire('Success', 'Student enrolled successfully!', 'success');
        setIsEnrollModalOpen(false);
        setExternalForm({ name: '', fatherName: '', phone: '', cnic: '', gender: 'Male', address: '' });
        setSelectedStudentId('');
    };

    const generateCertificate = (enrollment: any, course: any) => {
        const studentName = enrollment.isOutsider ? enrollment.outsiderDetails?.name : students.find(s => s.id === enrollment.studentId)?.name;
        setCertificateData({
            studentName: studentName || 'Unknown Student',
            courseName: course?.title || 'Unknown Course',
            enrollmentDate: enrollment.enrollmentDate
        });
        setIsCertificateOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section identical to other pages */}
            <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                        <Laptop className="w-7 h-7 text-brand-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase text-slate-800 dark:text-white tracking-tight">Skill Courses Lab</h1>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Manage Computer & Short Courses</p>
                    </div>
                </div>
                
                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab('catalog')} 
                        className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all", activeTab === 'catalog' ? "bg-white dark:bg-slate-800 text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                        Course Catalog
                    </button>
                    <button 
                        onClick={() => setActiveTab('enrollments')} 
                        className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all", activeTab === 'enrollments' ? "bg-white dark:bg-slate-800 text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                        Enrollments
                    </button>
                </div>
            </div>

            {activeTab === 'catalog' && (
                <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                    {isCreatingCourse ? (
                        <div className="max-w-3xl animate-in fade-in zoom-in-95 duration-300">
                            <h2 className="text-lg font-black uppercase text-slate-800 mb-6">Create New Course</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Course Title</label>
                                    <input value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20" placeholder="e.g. Web Development" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Category</label>
                                    <input value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20" placeholder="e.g. IT & Software" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Instructor / Teacher</label>
                                    <select value={courseForm.instructorId} onChange={e => setCourseForm({...courseForm, instructorId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20">
                                        <option value="">Select Instructor...</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Capacity (Seats)</label>
                                    <input type="number" value={courseForm.capacity} onChange={e => setCourseForm({...courseForm, capacity: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20" placeholder="e.g. 30" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Duration</label>
                                    <input value={courseForm.duration} onChange={e => setCourseForm({...courseForm, duration: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20" placeholder="e.g. 3 Months" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Course Fee (Rs)</label>
                                    <input type="number" value={courseForm.fee} onChange={e => setCourseForm({...courseForm, fee: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20" placeholder="e.g. 5000" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Schedule / Timing</label>
                                    <input value={courseForm.schedule} onChange={e => setCourseForm({...courseForm, schedule: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20" placeholder="e.g. Sat-Sun 4PM to 6PM" />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setIsCreatingCourse(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm uppercase">Cancel</button>
                                <button onClick={handleSaveCourse} className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl text-sm uppercase">Save Course</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-end mb-6">
                                <button onClick={() => setIsCreatingCourse(true)} className="px-5 py-2.5 bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                                    <Plus className="w-4 h-4" /> Add Course
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {skillCourses.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-slate-500 font-semibold">No courses created yet.</div>
                                ) : skillCourses.map(course => {
                                    const enrolledCount = courseEnrollments.filter(e => e.courseId === course.id).length;
                                    const capacity = (course as any).capacity || 30;
                                    const instructor = teachers.find(t => t.id === course.instructorId)?.name || 'Admin';

                                    return (
                                        <div key={course.id} className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-100 relative group flex flex-col">
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDeleteCourse(course.id)} className="p-2 bg-slate-100 text-rose-500 rounded-full hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                            
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                    <Laptop className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-lg text-slate-800 dark:text-white leading-tight">{course.title}</h3>
                                                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">{course.category}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3 mb-6 flex-1">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-semibold text-xs uppercase">Instructor</span>
                                                    <span className="font-bold text-slate-700 dark:text-white">{instructor}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-semibold text-xs uppercase">Duration</span>
                                                    <span className="font-bold text-slate-700 dark:text-white">{course.duration}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-semibold text-xs uppercase">Fee</span>
                                                    <span className="font-black text-emerald-600">Rs. {course.fee}</span>
                                                </div>
                                            </div>

                                            {/* Capacity Bar */}
                                            <div className="mt-auto pt-4 border-t border-slate-100">
                                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                    <span>Enrolled: {enrolledCount}</span>
                                                    <span>Capacity: {capacity}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={cn("h-full rounded-full", (enrolledCount / capacity) > 0.9 ? "bg-rose-500" : "bg-brand-primary")} 
                                                        style={{ width: `\${Math.min((enrolledCount / capacity) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'enrollments' && (
                <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 relative">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black uppercase text-slate-800">Course Enrollments</h2>
                        <button onClick={() => setIsEnrollModalOpen(true)} className="px-5 py-2.5 bg-brand-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                            <Plus className="w-4 h-4" /> Enroll Student
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Student Profile</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Course</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Origin</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Enrolled On</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseEnrollments.map(enr => {
                                    const course = skillCourses.find(c => c.id === enr.courseId);
                                    let studentName, phone, origin;
                                    
                                    if (enr.isOutsider) {
                                        studentName = enr.outsiderDetails?.name;
                                        phone = enr.outsiderDetails?.phone;
                                        origin = 'External';
                                    } else {
                                        const std = students.find(s => s.id === enr.studentId);
                                        studentName = std?.name;
                                        phone = std?.id ? `Roll: ${std.rollNumber}` : '';
                                        origin = 'School Student';
                                    }
                                    
                                    return (
                                        <tr key={enr.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-slate-800">{studentName}</div>
                                                <div className="text-[10px] font-semibold text-slate-500">{phone}</div>
                                            </td>
                                            <td className="py-4 px-4 font-bold text-slate-700">{course?.title || 'Unknown'}</td>
                                            <td className="py-4 px-4">
                                                <span className={cn("px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest", enr.isOutsider ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                                                    {origin}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-xs font-semibold text-slate-500">{enr.enrollmentDate}</td>
                                            <td className="py-4 px-4 text-right">
                                                <button onClick={() => generateCertificate(enr, course)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 ml-auto transition-colors">
                                                    <Award className="w-3.5 h-3.5" /> Certificate
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {courseEnrollments.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-12 text-slate-500 font-semibold">No active enrollments.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Smart Enrollment Modal */}
            {isEnrollModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black uppercase text-slate-800">Course Admission</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enroll a student into a skill course</p>
                            </div>
                            <button onClick={() => setIsEnrollModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            {/* Toggle Switch */}
                            <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
                                <button 
                                    onClick={() => setEnrollType('internal')}
                                    className={cn("flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2", enrollType === 'internal' ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}
                                >
                                    <CheckCircle2 className={cn("w-4 h-4", enrollType === 'internal' ? "text-brand-primary" : "hidden")} />
                                    Existing School Student
                                </button>
                                <button 
                                    onClick={() => setEnrollType('external')}
                                    className={cn("flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2", enrollType === 'external' ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                                >
                                    <CheckCircle2 className={cn("w-4 h-4", enrollType === 'external' ? "text-amber-600" : "hidden")} />
                                    External Candidate
                                </button>
                            </div>

                            {/* Select Course (Always Visible) */}
                            <div className="mb-8 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-blue-800">Select Target Course</label>
                                <select 
                                    value={enrollCourseId} 
                                    onChange={e => setEnrollCourseId(e.target.value)} 
                                    className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="">-- Choose Course --</option>
                                    {skillCourses.map(c => (
                                        <option key={c.id} value={c.id}>{c.title} (Fee: Rs.{c.fee})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Internal Student Form */}
                            {enrollType === 'internal' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Search & Select Enrolled Student</label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select 
                                                value={selectedStudentId} 
                                                onChange={e => setSelectedStudentId(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20 appearance-none"
                                            >
                                                <option value="">Search student by name or roll number...</option>
                                                {students.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} - Roll: {s.rollNumber} ({s.class})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {selectedStudentId && (
                                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">✓</div>
                                            <div>
                                                <p className="text-sm font-bold text-emerald-800">Student Profile Linked</p>
                                                <p className="text-xs font-semibold text-emerald-600/80">Course fee and records will be linked to their main account.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* External Candidate Form */}
                            {enrollType === 'external' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Candidate Name *</label>
                                        <input value={externalForm.name} onChange={e => setExternalForm({...externalForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20" placeholder="Full Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Father's Name</label>
                                        <input value={externalForm.fatherName} onChange={e => setExternalForm({...externalForm, fatherName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20" placeholder="Father Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Phone / WhatsApp *</label>
                                        <input value={externalForm.phone} onChange={e => setExternalForm({...externalForm, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20" placeholder="03XX-XXXXXXX" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">CNIC / B-Form</label>
                                        <input value={externalForm.cnic} onChange={e => setExternalForm({...externalForm, cnic: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20" placeholder="XXXXX-XXXXXXX-X" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Gender</label>
                                        <select value={externalForm.gender} onChange={e => setExternalForm({...externalForm, gender: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20">
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Address</label>
                                        <input value={externalForm.address} onChange={e => setExternalForm({...externalForm, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary/20" placeholder="Home Address" />
                                    </div>
                                </div>
                            )}

                        </div>
                        
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 mt-auto">
                            <button onClick={() => setIsEnrollModalOpen(false)} className="px-6 py-3 bg-white text-slate-600 border border-slate-200 font-bold rounded-xl text-xs uppercase hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleEnroll} className="px-8 py-3 bg-brand-primary text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-brand-primary/25 hover:scale-105 transition-all flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Confirm Enrollment
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <CertificateGenerator
                isOpen={isCertificateOpen}
                onClose={() => setIsCertificateOpen(false)}
                studentName={certificateData.studentName}
                courseName={certificateData.courseName}
                enrollmentDate={certificateData.enrollmentDate}
                logoUrl={settings.logo1}
            />
        </div>
    );
};
