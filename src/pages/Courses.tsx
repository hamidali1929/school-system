import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Laptop, Plus, Users, Award, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';
import Swal from 'sweetalert2';

export const Courses = () => {
    const { skillCourses, addSkillCourse, deleteSkillCourse, courseEnrollments, addCourseEnrollment, students, settings } = useStore();
    const [activeTab, setActiveTab] = useState<'catalog' | 'enrollments'>('catalog');
    const [isCreatingCourse, setIsCreatingCourse] = useState(false);
    
    // New Course Form State
    const [courseForm, setCourseForm] = useState({
        title: '',
        category: '',
        duration: '',
        fee: '',
        schedule: '',
        instructorId: 'TCH-Admin'
    });

    const handleSaveCourse = () => {
        if (!courseForm.title || !courseForm.duration || !courseForm.fee) {
            Swal.fire('Missing Details', 'Please fill the required course details', 'error');
            return;
        }
        addSkillCourse({
            ...courseForm,
            fee: Number(courseForm.fee),
            status: 'Upcoming'
        });
        setIsCreatingCourse(false);
        Swal.fire('Saved', 'New Skill Course Added', 'success');
        setCourseForm({ title: '', category: '', duration: '', fee: '', schedule: '', instructorId: 'TCH-Admin' });
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

    const enrollOutsider = () => {
        Swal.fire({
            title: 'Enroll New Student',
            html: `
                <input id="swal-name" class="swal2-input" placeholder="Student Name">
                <input id="swal-phone" class="swal2-input" placeholder="Phone Number">
                <input id="swal-cnic" class="swal2-input" placeholder="CNIC / B-Form">
                <select id="swal-course" class="swal2-input">
                    ${skillCourses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Enroll Student',
            preConfirm: () => {
                const name = (document.getElementById('swal-name') as HTMLInputElement).value;
                const phone = (document.getElementById('swal-phone') as HTMLInputElement).value;
                const cnic = (document.getElementById('swal-cnic') as HTMLInputElement).value;
                const courseId = (document.getElementById('swal-course') as HTMLSelectElement).value;
                
                if (!name || !phone || !courseId) {
                    Swal.showValidationMessage('Name, Phone and Course are required');
                    return false;
                }
                return { name, phone, cnic, courseId };
            }
        }).then((res) => {
            if (res.isConfirmed && res.value) {
                addCourseEnrollment({
                    courseId: res.value.courseId,
                    isOutsider: true,
                    outsiderDetails: {
                        name: res.value.name,
                        phone: res.value.phone,
                        cnic: res.value.cnic
                    },
                    enrollmentDate: new Date().toISOString().split('T')[0],
                    status: 'Active',
                    feeStatus: 'Pending'
                });
                Swal.fire('Enrolled', 'Student successfully enrolled in course.', 'success');
            }
        });
    };

    const generateCertificate = (enrollment: any, course: any) => {
        const studentName = enrollment.isOutsider ? enrollment.outsiderDetails?.name : students.find(s => s.id === enrollment.studentId)?.name;
        
        const printWindow = window.open('', '', 'width=1000,height=800');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Certificate - ${studentName}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Montserrat:wght@400;700&display=swap');
                        @page { size: A4 landscape; margin: 0; }
                        body { 
                            font-family: 'Montserrat', sans-serif; 
                            margin: 0; 
                            padding: 20px; 
                            background: #fff;
                            height: 100vh;
                            box-sizing: border-box;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .certificate {
                            border: 15px solid #0f172a;
                            padding: 50px;
                            width: 100%;
                            height: 100%;
                            box-sizing: border-box;
                            position: relative;
                            text-align: center;
                            background: radial-gradient(circle, #ffffff 0%, #f8fafc 100%);
                        }
                        .certificate::before {
                            content: '';
                            position: absolute;
                            top: 5px; left: 5px; right: 5px; bottom: 5px;
                            border: 2px solid #cbd5e1;
                        }
                        .header {
                            font-family: 'Cinzel', serif;
                            color: #0f172a;
                            margin-bottom: 40px;
                        }
                        .header h1 { font-size: 48px; margin: 0; letter-spacing: 5px; }
                        .header h2 { font-size: 24px; color: #64748b; margin-top: 10px; font-weight: 400; letter-spacing: 2px; }
                        
                        .content { margin-top: 50px; }
                        .content p { font-size: 18px; color: #475569; margin: 10px 0; }
                        .content .name { font-family: 'Cinzel', serif; font-size: 42px; font-weight: bold; color: #0f172a; margin: 20px 0; border-bottom: 2px solid #cbd5e1; display: inline-block; padding: 0 40px; }
                        .content .course { font-size: 28px; font-weight: bold; color: #2563eb; margin: 20px 0; }
                        
                        .footer {
                            position: absolute;
                            bottom: 60px;
                            left: 50px;
                            right: 50px;
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                        }
                        .signature {
                            text-align: center;
                            width: 200px;
                        }
                        .signature .line {
                            border-bottom: 2px solid #0f172a;
                            margin-bottom: 10px;
                        }
                        .signature p { margin: 0; font-size: 14px; font-weight: bold; color: #0f172a; }
                    </style>
                </head>
                <body>
                    <div class="certificate">
                        <div class="header">
                            <h1>CERTIFICATE</h1>
                            <h2>OF COMPLETION</h2>
                        </div>
                        <div class="content">
                            <p>This is to certify that</p>
                            <div class="name">${studentName?.toUpperCase()}</div>
                            <p>has successfully completed the skill course</p>
                            <div class="course">${course.title}</div>
                            <p>with outstanding performance and dedication.</p>
                            <p style="margin-top: 30px; font-size: 14px;"><strong>Duration:</strong> ${course.duration} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        <div class="footer">
                            <div class="signature">
                                <div class="line"></div>
                                <p>Course Instructor</p>
                            </div>
                            <div>
                                <h3 style="margin:0; font-family:'Cinzel';">${settings.schoolName}</h3>
                                <p style="margin:5px 0 0; font-size:12px; color:#64748b;">Official Skill Lab Program</p>
                            </div>
                            <div class="signature">
                                <div class="line"></div>
                                <p>Principal / Director</p>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-white dark:bg-slate-800/50 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase text-slate-800 dark:text-white flex items-center gap-3">
                        <Laptop className="w-8 h-8 text-brand-primary" />
                        Skill Courses Lab
                    </h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Manage Computer & Short Courses</p>
                </div>
                
                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                            activeTab === 'catalog' ? "bg-white dark:bg-slate-800 text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Course Catalog
                    </button>
                    <button
                        onClick={() => setActiveTab('enrollments')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                            activeTab === 'enrollments' ? "bg-white dark:bg-slate-800 text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Enrollments
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'catalog' && (
                <div className="space-y-6">
                    {isCreatingCourse ? (
                        <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-8 border border-slate-100">
                            <h2 className="text-xl font-black uppercase mb-6">Create New Course</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Course Title</label>
                                    <input value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border outline-none font-bold text-sm" placeholder="e.g. Web Development" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Category</label>
                                    <input value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border outline-none font-bold text-sm" placeholder="e.g. IT & Software" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Duration</label>
                                    <input value={courseForm.duration} onChange={e => setCourseForm({...courseForm, duration: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border outline-none font-bold text-sm" placeholder="e.g. 3 Months" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Course Fee (Rs)</label>
                                    <input type="number" value={courseForm.fee} onChange={e => setCourseForm({...courseForm, fee: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border outline-none font-bold text-sm" placeholder="e.g. 5000" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Schedule / Timing</label>
                                    <input value={courseForm.schedule} onChange={e => setCourseForm({...courseForm, schedule: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border outline-none font-bold text-sm" placeholder="e.g. Sat-Sun 4PM" />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setIsCreatingCourse(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm uppercase">Cancel</button>
                                <button onClick={handleSaveCourse} className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl text-sm uppercase">Save Course</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setIsCreatingCourse(true)} className="px-5 py-2.5 bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                                    <Plus className="w-4 h-4" /> Add Course
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {skillCourses.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-slate-500">No courses created yet.</div>
                                ) : skillCourses.map(course => (
                                    <div key={course.id} className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-100 relative group">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDeleteCourse(course.id)} className="p-2 bg-slate-100 text-rose-500 rounded-full"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                        <h3 className="font-black text-lg text-slate-800 dark:text-white mb-1">{course.title}</h3>
                                        <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-4">{course.category}</p>
                                        
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Duration</span>
                                                <span className="font-bold text-slate-800 dark:text-white">{course.duration}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Fee</span>
                                                <span className="font-bold text-emerald-600">Rs. {course.fee}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Schedule</span>
                                                <span className="font-bold text-slate-800 dark:text-white">{course.schedule}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'enrollments' && (
                <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black uppercase text-slate-800">Course Students</h2>
                        <button onClick={enrollOutsider} className="px-4 py-2 bg-brand-primary text-white text-xs font-black uppercase rounded-xl flex items-center gap-2">
                            <Users className="w-4 h-4" /> Enroll Student
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Student Name</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Course</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Type</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Enrolled On</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseEnrollments.map(enr => {
                                    const course = skillCourses.find(c => c.id === enr.courseId);
                                    const studentName = enr.isOutsider ? enr.outsiderDetails?.name : students.find(s => s.id === enr.studentId)?.name;
                                    
                                    return (
                                        <tr key={enr.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-4 font-bold text-slate-800">{studentName}</td>
                                            <td className="py-4 px-4 font-semibold text-slate-600">{course?.title || 'Unknown'}</td>
                                            <td className="py-4 px-4">
                                                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", enr.isOutsider ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                                                    {enr.isOutsider ? 'Outsider' : 'Regular'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm font-semibold text-slate-500">{enr.enrollmentDate}</td>
                                            <td className="py-4 px-4 text-right">
                                                <button onClick={() => generateCertificate(enr, course)} className="px-3 py-1.5 bg-slate-800 text-white text-[10px] font-black uppercase rounded-lg flex items-center gap-1 ml-auto">
                                                    <Award className="w-3.5 h-3.5" /> Certificate
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {courseEnrollments.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-8 text-slate-500">No enrollments yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
