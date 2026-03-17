import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';

// 내정보 탭 컴포넌트 (4개: 이미지, 프로필, 연락처, 공약)
import ImagesTab from './components/myinfo/ImagesTab';
import ProfileTab from './components/myinfo/ProfileTab';
import ContactTab from './components/myinfo/ContactTab';
import PledgesTab from './components/myinfo/PledgesTab';

// 콘텐츠 탭 컴포넌트
import FeedsTab from './components/content/FeedsTab';
import GalleryTab from './components/content/GalleryTab';
import CheersTab from './components/content/CheersTab';
import QnaTab from './components/content/QnaTab';
import SmsTab from './components/content/SmsTab';

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
        
        {/* 내정보 (이미지, 프로필, 연락처, 공약) */}
        <Route path="/my-info" element={<Navigate to="/my-info/images" replace />} />
        <Route path="/my-info/images" element={<ImagesTab candidateId={candidateId} />} />
        <Route path="/my-info/profile" element={<ProfileTab candidateId={candidateId} />} />
        <Route path="/my-info/contact" element={<ContactTab candidateId={candidateId} />} />
        <Route path="/my-info/pledges" element={<PledgesTab candidateId={candidateId} />} />
        
        {/* 콘텐츠 (소식, 응원, Q&A) */}
        <Route path="/content" element={<Navigate to="/content/feeds" replace />} />
        <Route path="/content/feeds" element={<FeedsTab candidateId={candidateId} />} />
        <Route path="/content/gallery" element={<GalleryTab candidateId={candidateId} />} />
        <Route path="/content/cheers" element={<CheersTab candidateId={candidateId} />} />
        <Route path="/content/qna" element={<QnaTab candidateId={candidateId} />} />
        <Route path="/content/sms" element={<SmsTab candidateId={candidateId} />} />
        
        {/* 설정 */}
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
