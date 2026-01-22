import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Vote, MessageCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SearchResult {
  id: string;
  name: string;
  party: string;
  party_code: string;
  candidate_code: string;
  region: string;
  district: string | null;
  constituency: string | null;
  photo_url: string | null;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    setHasSearched(true);

    const { data } = await supabase
      .from('candidates')
      .select('id, name, party, party_code, candidate_code, region, district, constituency, photo_url')
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,region.ilike.%${searchTerm}%,district.ilike.%${searchTerm}%,constituency.ilike.%${searchTerm}%`)
      .limit(10);

    setResults(data || []);
    setSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getPartyColor = (party: string): string => {
    const colors: Record<string, string> = {
      '더불어민주당': '#004EA2',
      '국민의힘': '#E61E2B',
      '조국혁신당': '#004098',
      '개혁신당': '#FF6600',
      '진보당': '#D6001C',
      '기본소득당': '#82C8A0',
      '사회민주당': '#F5A623',
      '무소속': '#808080',
    };
    return colors[party] || '#808080';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <header className="pt-12 pb-8 px-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">E-Bridge</h1>
        <p className="text-gray-600">유권자와 후보자를 잇는 다리</p>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="px-6 pb-12 max-w-lg mx-auto">
        {/* 검색 박스 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Vote size={20} className="text-blue-500" />
            후보자 찾기
          </h2>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="이름 또는 지역으로 검색"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {searching ? '검색 중...' : '검색'}
            </button>
          </div>

          {/* 검색 결과 */}
          {hasSearched && (
            <div className="mt-4">
              {results.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">
                  검색 결과가 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {results.map((candidate) => (
                    <button
                      key={candidate.id}
                      onClick={() => navigate(`/${candidate.party_code}/${candidate.candidate_code}`)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                    >
                      {candidate.photo_url ? (
                        <img
                          src={candidate.photo_url}
                          alt={candidate.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: getPartyColor(candidate.party) }}
                        >
                          {candidate.name[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{candidate.name}</p>
                        <p className="text-xs text-gray-500">
                          {candidate.party} · {candidate.region} {candidate.district} {candidate.constituency}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 후보 등록 문의 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <UserPlus size={20} className="text-green-500" />
            후보 등록 문의
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            E-Bridge에 후보자 페이지를 등록하고 싶으시다면 문의해주세요.
          </p>
          <div className="flex gap-3">
            <a
              href="https://pf.kakao.com/_xkxkxk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-400 text-yellow-900 rounded-xl hover:bg-yellow-500 font-medium text-sm"
            >
              <MessageCircle size={18} />
              카카오톡 문의
            </a>
            <a
              href="mailto:contact@ebridge.kr"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm"
            >
              이메일 문의
            </a>
          </div>
        </div>

        {/* 서비스 소개 */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-bold mb-3">E-Bridge란?</h2>
          <p className="text-sm text-blue-100 leading-relaxed">
            E-Bridge는 지방선거 후보자들이 유권자와 직접 소통할 수 있는 플랫폼입니다. 
            후보자의 공약, 경력, 최신 소식을 한눈에 확인하고, 
            질문과 응원 메시지를 보낼 수 있습니다.
          </p>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="py-6 text-center text-sm text-gray-400">
        <p>© 2026 E-Bridge. All rights reserved.</p>
      </footer>
    </div>
  );
}
