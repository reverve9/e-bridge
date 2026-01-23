import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import PledgesPage from './pages/PledgesPage';
import FeedsPage from './pages/FeedsPage';
import CheersPage from './pages/CheersPage';
import SettingsPage from './pages/SettingsPage';

function AppContent({ candidateId, onLogout }: { candidateId: string; onLogout: () => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 후 대시보드로 이동
    navigate('/dashboard', { replace: true });
  }, []);

  return (
    <MainLayout candidateId={candidateId} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage candidateId={candidateId} />} />
        <Route path="/profile" element={<ProfilePage candidateId={candidateId} />} />
        <Route path="/pledges" element={<PledgesPage candidateId={candidateId} />} />
        <Route path="/feeds" element={<FeedsPage candidateId={candidateId} />} />
        <Route path="/cheers" element={<CheersPage candidateId={candidateId} />} />
        <Route path="/settings" element={<SettingsPage candidateId={candidateId} onLogout={onLogout} />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('candidate-id');
    if (stored) setCandidateId(stored);
    setLoading(false);
  }, []);

  const handleLogin = (id: string) => {
    localStorage.setItem('candidate-id', id);
    setCandidateId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('candidate-id');
    setCandidateId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!candidateId) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <AppContent candidateId={candidateId} onLogout={handleLogout} />;
}

export default App;
