import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { Copilot } from './pages/Copilot';
import { SignInModal } from './components/SignInModal';
import './index.css';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const session = localStorage.getItem('user_session');
      const data = localStorage.getItem('onboarding_data');

      if (session === 'active' && data) {
        try {
          const parsedUser = JSON.parse(data);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (e) {
          console.error("Failed to parse user data");
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLoginSuccess = (userData: any) => {
    localStorage.setItem('user_session', 'active');
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  const handleResetDemo = () => {
    if (confirm("Reset Demo State? This will clear all data.")) {
      localStorage.clear();
      setIsLoggedIn(false);
      setUser(null);
      window.location.reload();
    }
  };

  return (
    <>
      <main className="">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                isLoggedIn={isLoggedIn}
                user={user}
                onSignInClick={() => setShowSignInModal(true)}
                onLogoutClick={handleLogout}
                onResetDemo={handleResetDemo}
              />
            }
          />
          <Route path="/onboard" element={<OnboardingPage />} />

          <Route path="/dashboard" element={<> <Navbar /><div className="page"><Dashboard /></div> </>} />
          <Route path="/calendar" element={<> <Navbar /><div className="page"><Calendar /></div> </>} />
          <Route path="/copilot" element={<> <Navbar /><div className="page"><Copilot /></div> </>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;
