import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CandidatesPage from './pages/CandidatesPage';
import CandidateCreatePage from './pages/CandidateCreatePage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import CandidateEditPage from './pages/CandidateEditPage';
import DistrictsPage from './pages/DistrictsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('super-admin-auth');
    if (auth) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('super-admin-auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('super-admin-auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <MainLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/create" element={<CandidateCreatePage />} />
        <Route path="/candidates/:id" element={<CandidateDetailPage />} />
        <Route path="/candidates/:id/edit" element={<CandidateEditPage />} />
        <Route path="/districts" element={<DistrictsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
