import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { useStore, StoreProvider } from './context/StoreContext';

const AppContent = () => {
  const { currentUser, logout } = useStore();

  return (
    <>
      {currentUser ? (
        <DashboardLayout user={currentUser} onLogout={logout} />
      ) : (
        <Login />
      )}
    </>
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
