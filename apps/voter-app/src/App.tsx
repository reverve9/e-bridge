import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CandidatePage from './pages/CandidatePage';
import SmsLandingPage from './pages/SmsLandingPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* 메인 페이지 */}
      <Route path="/" element={<HomePage />} />
      {/* 문자 랜딩페이지 */}
      <Route path="/:partyCode/:candidateCode/:landingId" element={<SmsLandingPage />} />
      {/* /:partyCode/:candidateCode 형식 */}
      <Route path="/:partyCode/:candidateCode" element={<CandidatePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
