import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './lib/store';
import { Navbar } from './components/Navbar';
import { OnboardWizard } from './components/OnboardWizard';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { Copilot } from './pages/Copilot';
import './index.css';

// Main App content with routing
function AppContent() {
  const { isOnboarded } = useStore();

  // If not onboarded, show the wizard
  if (!isOnboarded) {
    return <OnboardWizard />;
  }

  // Main app with navigation
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/copilot" element={<Copilot />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

// App wrapper with providers
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
