import { useEffect, useState, lazy, Suspense } from 'react';
import { useStore, StoreProvider } from './context/StoreContext';
import { getWhatsAppServerUrl } from './utils/whatsapp';

// 🚀 Dynamic Lazy-Loaded Routes for Instant Performance
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const OnlineAdmission = lazy(() => import('./pages/OnlineAdmission').then(m => ({ default: m.OnlineAdmission })));

const checkIsAdmissionRoute = () => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path.startsWith('/apply') ||
    path.startsWith('/admission') ||
    path.startsWith('/online-admission') ||
    path.startsWith('/admission-portal') ||
    path.startsWith('/parent-portal') ||
    hash.includes('apply') ||
    hash.includes('admission') ||
    search.includes('apply') ||
    search.includes('mode=admission') ||
    search.includes('portal=parent')
  );
};

// ⚡ Ultra-fast Lightweight Fallback
const PageLoader = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Loading...</span>
    </div>
  </div>
);

const AppContent = () => {
  const { currentUser, logout } = useStore();
  const [isAdmissionPage, setIsAdmissionPage] = useState(checkIsAdmissionRoute);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdmissionPage(checkIsAdmissionRoute());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // 🔄 10-Minute Keep-Alive Ping for WhatsApp Server to prevent sleep
  useEffect(() => {
    const pingServer = async () => {
      try {
        const url = getWhatsAppServerUrl();
        await fetch(`${url}/health`, { method: 'GET', cache: 'no-store' });
        console.log('[WhatsApp Gateway] Keep-alive ping sent successfully');
      } catch (e) {
        // Silently ignore ping errors
      }
    };

    // Initial ping on load
    pingServer();

    // Repeat ping every 8 minutes (480,000 ms) before Render's 15-min sleep threshold
    const interval = setInterval(pingServer, 8 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 🌐 Direct Public Access for Parents
  if (isAdmissionPage) {
    return (
      <Suspense fallback={<PageLoader />}>
        <OnlineAdmission />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      {currentUser ? (
        <DashboardLayout user={currentUser} onLogout={logout} />
      ) : (
        <Login />
      )}
    </Suspense>
  );
};

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
