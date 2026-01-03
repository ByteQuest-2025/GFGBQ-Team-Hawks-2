import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { SignInModal } from './components/SignInModal';
import { SidebarCopilot } from './components/SidebarCopilot';
import { useStore } from './lib/store';
import { signInWithGoogle } from './lib/firebase';
import { api } from './lib/api';
import './index.css';

// Wrapper to handle navigation logic inside Router context
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Initialize Auth State
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
          console.error("Auth Error", e);
          handleLogout(); // Corrupt data, forceful logout
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuth();
    // Listen for storage changes (e.g. from OnboardingPage)
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    // Custom event for internal updates
    window.addEventListener('auth-update', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-update', handleStorageChange);
    };
  }, []);

  const handleLoginSuccess = (userData: any) => {
    localStorage.setItem('user_session', 'active');
    // Ensure data looks consistent
    localStorage.setItem('onboarding_data', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
    setShowSignInModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  const handleResetDemo = () => {
    if (confirm("Reset Demo State? This will clear all data.")) {
      localStorage.clear();
      window.dispatchEvent(new Event('auth-update')); // Force update
      window.location.reload();
    }
  };

  const handleFirebaseLogin = async () => {
    try {
      const user = await signInWithGoogle();
      const backendResponse = await api.syncUser(user);

      // Update local state
      handleLoginSuccess(backendResponse.user || { ...backendResponse, id: backendResponse.uid });

      // Redirect Logic
      if (backendResponse.profileCompleted) {
        navigate('/dashboard');
      } else {
        navigate('/onboard');
      }
    } catch (error) {
      console.error("Firebase Login Failed", error);
      alert("Login Failed. Please check console.");
    }
  };

  return (
    <>
      <div className="bg-[#0A0A0A] min-h-screen text-white">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                isLoggedIn={isLoggedIn}
                user={user}
                onSignInClick={handleFirebaseLogin}
                onSignUpClick={handleFirebaseLogin}
                onLogoutClick={handleLogout}
                onResetDemo={handleResetDemo}
              />
            }
          />
          <Route path="/onboard" element={<OnboardingPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={isLoggedIn ? <div className="page"><Dashboard user={user} /></div> : <Navigate to="/" />} />
          <Route path="/calendar" element={isLoggedIn ? <Calendar /> : <Navigate to="/" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

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
