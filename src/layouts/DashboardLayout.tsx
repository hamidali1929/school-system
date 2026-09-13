import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileArcMenu } from '../components/MobileArcMenu';
import { PullToRefresh } from '../components/PullToRefresh';

// 🚀 Dynamic Lazy-Loaded Subpages for Fast Navigation
const Dashboard = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Students = lazy(() => import('../pages/Students').then(m => ({ default: m.Students })));
const Fees = lazy(() => import('../pages/Fees').then(m => ({ default: m.Fees })));
const Exams = lazy(() => import('../pages/Exams').then(m => ({ default: m.Exams })));
const Teachers = lazy(() => import('../pages/Teachers').then(m => ({ default: m.Teachers })));
const AdminPanel = lazy(() => import('../pages/Admin').then(m => ({ default: m.AdminPanel })));
const Attendance = lazy(() => import('../pages/Attendance').then(m => ({ default: m.Attendance })));
const ClassesPage = lazy(() => import('../pages/Classes').then(m => ({ default: m.ClassesPage })));
const TimetablePage = lazy(() => import('../pages/Timetable').then(m => ({ default: m.TimetablePage })));
const Courses = lazy(() => import('../pages/Courses').then(m => ({ default: m.Courses })));
const FinancePage = lazy(() => import('../pages/Finance').then(m => ({ default: m.FinancePage })));
const Documents = lazy(() => import('../pages/Documents').then(m => ({ default: m.Documents })));
const Analytics = lazy(() => import('../pages/Analytics').then(m => ({ default: m.Analytics })));
const StudentPanel = lazy(() => import('../pages/StudentPanel').then(m => ({ default: m.StudentPanel })));
const ParentPanel = lazy(() => import('../pages/Parents').then(m => ({ default: m.ParentPanel })));

const ModuleLoader = () => (
    <div className="flex items-center justify-center min-h-[300px] w-full">
        <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
            <span className="text-[11px] font-semibold text-slate-400">Loading module...</span>
        </div>
    </div>
);

export const DashboardLayout = ({ user, onLogout }: { user: { id: string; name: string; role: string; permissions?: string[] }; onLogout: () => void }) => {
    const [activeTab, setActiveTab] = useState(() => {
        const hash = typeof window !== 'undefined' ? window.location.hash.replace('#/', '') : '';
        const validTabs = ['dashboard', 'students', 'classes', 'courses', 'teachers', 'fees', 'exams', 'admin', 'attendance', 'timetable', 'finance', 'documents', 'analytics', 'parents', 'academic', 'attendance_log', 'fees_ledger', 'communication'];
        if (hash && validTabs.includes(hash)) return hash;
        return user.role === 'teacher' ? 'attendance' : user.role === 'student' ? 'dashboard' : 'dashboard';
    });

    useEffect(() => {
        window.location.hash = `/${activeTab}`;
    }, [activeTab]);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = useCallback(async () => {
        // Quick synthetic sync
        await new Promise(resolve => setTimeout(resolve, 800));
        setRefreshKey(prev => prev + 1);
    }, []);

    const renderContent = () => {
        // Strict Role-Based Containment
        if (user.role === 'student') {
            if (activeTab === 'timetable') return <TimetablePage />;

            // Map sidebar IDs to StudentPanel sections
            const tabMap: Record<string, string> = {
                'dashboard': 'overview',
                'academic': 'academic',
                'attendance_log': 'attendance',
                'fees_ledger': 'fees',
                'communication': 'communication'
            };

            return <StudentPanel
                key={refreshKey}
                activeTab={tabMap[activeTab] as any || 'overview'}
                onNavigate={setActiveTab}
            />;
        }

        switch (activeTab) {
            case 'dashboard':
                return <Dashboard key={refreshKey} onNavigate={setActiveTab} />;
            case 'students':
                return (user.role === 'admin' || user.role === 'teacher') ? <Students key={refreshKey} /> : <StudentPanel key={refreshKey} />;
            case 'parents':
                return <ParentPanel key={refreshKey} />;
            case 'classes':
                return <ClassesPage key={refreshKey} />;
            case 'courses':
                return <Courses key={refreshKey} />;
            case 'teachers':
                return <Teachers key={refreshKey} />;
            case 'fees':
                return <Fees key={refreshKey} />;
            case 'exams':
                return <Exams key={refreshKey} />;
            case 'admin':
                return <AdminPanel key={refreshKey} />;
            case 'attendance':
                return <Attendance key={refreshKey} />;
            case 'timetable':
                return <TimetablePage key={refreshKey} />;
            case 'finance':
                return <FinancePage key={refreshKey} />;
            case 'documents':
                return <Documents key={refreshKey} />;
            case 'analytics':
                return <Analytics key={refreshKey} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#000d1a] overflow-hidden">
            {/* Desktop Sidebar only */}
            <div className="hidden lg:block">
                <Sidebar
                    user={user}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLogout={onLogout}
                />
            </div>

            {/* Futuristic Mobile Arc Menu */}
            <MobileArcMenu
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
            />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Topbar
                    onOpenSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />

                <main className="flex-1 overflow-hidden relative">
                    <PullToRefresh onRefresh={handleRefresh}>
                        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 w-full">
                            <Suspense fallback={<ModuleLoader />}>
                                {renderContent()}
                            </Suspense>
                        </div>
                    </PullToRefresh>

                    {/* Background Orbs */}
                    <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
                    <div className="fixed top-0 left-72 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
                </main>
            </div>
        </div>
    );
};

