import { Routes, Route } from 'react-router-dom';
import CandidatePage from './pages/CandidatePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* /:partyCode/:candidateCode 형식 */}
      <Route path="/:partyCode/:candidateCode" element={<CandidatePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
