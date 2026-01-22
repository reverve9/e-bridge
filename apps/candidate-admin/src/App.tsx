import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import PledgesPage from './pages/PledgesPage';
import FeedsPage from './pages/FeedsPage';
import CheersPage from './pages/CheersPage';
import QnaPage from './pages/QnaPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [candidateId, setCandidateId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('candidate-id');
    if (stored) setCandidateId(stored);
  }, []);

  const handleLogin = (id: string) => {
    localStorage.setItem('candidate-id', id);
    setCandidateId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('candidate-id');
    setCandidateId(null);
  };

  if (!candidateId) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <MainLayout candidateId={candidateId} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage candidateId={candidateId} />} />
        <Route path="/profile" element={<ProfilePage candidateId={candidateId} />} />
        <Route path="/pledges" element={<PledgesPage candidateId={candidateId} />} />
        <Route path="/feeds" element={<FeedsPage candidateId={candidateId} />} />
        <Route path="/cheers" element={<CheersPage candidateId={candidateId} />} />
        <Route path="/qna" element={<QnaPage candidateId={candidateId} />} />
        <Route path="/settings" element={<SettingsPage candidateId={candidateId} onLogout={handleLogout} />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
