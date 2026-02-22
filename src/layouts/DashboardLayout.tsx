import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Dashboard } from '../pages/Dashboard';
import { Students } from '../pages/Students';
import { Fees } from '../pages/Fees';
import { Exams } from '../pages/Exams';
import { Teachers } from '../pages/Teachers';
import { AdminPanel } from '../pages/Admin';

import { Attendance } from '../pages/Attendance';
import { ClassesPage } from '../pages/Classes';
import { TimetablePage } from '../pages/Timetable';

import { FinancePage } from '../pages/Finance';
import { Documents } from '../pages/Documents';
import { Analytics } from '../pages/Analytics';
import { MobileArcMenu } from '../components/MobileArcMenu';
import { StudentPanel } from '../pages/StudentPanel';
import { ParentPanel } from '../pages/Parents';

export const DashboardLayout = ({ user, onLogout }: { user: { id: string; name: string; role: string }; onLogout: () => void }) => {
    const [activeTab, setActiveTab] = useState(user.role === 'teacher' ? 'attendance' : user.role === 'student' ? 'dashboard' : 'dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                activeTab={tabMap[activeTab] as any || 'overview'}
                onNavigate={setActiveTab}
            />;
        }

        switch (activeTab) {
            case 'dashboard':
                return <Dashboard onNavigate={setActiveTab} />;
            case 'students':
                return user.role === 'admin' ? <Students /> : <StudentPanel />;
            case 'parents':
                return <ParentPanel />;
            case 'classes':
                return <ClassesPage />;
            case 'teachers':
                return <Teachers />;
            case 'fees':
                return <Fees />;
            case 'exams':
                return <Exams />;
            case 'admin':
                return <AdminPanel />;
            case 'attendance':
                return <Attendance />;
            case 'timetable':
                return <TimetablePage />;
            case 'finance':
                return <FinancePage />;
            case 'documents':
                return <Documents />;
            case 'analytics':
                return <Analytics />;
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

                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
                    <div className="max-w-7xl mx-auto pb-12 w-full">
                        {renderContent()}
                    </div>

                    {/* Background Orbs */}
                    <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
                    <div className="fixed top-0 left-72 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
                </main>
            </div>
        </div>
    );
};
