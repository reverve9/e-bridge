import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Candidate } from '../lib/supabase';
import { Eye, Heart, MessageCircle, HelpCircle, ChevronRight, ExternalLink } from 'lucide-react';

interface DashboardPageProps {
  candidateId: string;
}

export default function DashboardPage({ candidateId }: DashboardPageProps) {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [stats, setStats] = useState({
    visits: 0,
    cheers: 0,
    feeds: 0,
    unansweredQna: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 후보자 정보
      const { data: candidateData } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (candidateData) setCandidate(candidateData);

      // 통계
      const [cheersRes, feedsRes, qnaRes] = await Promise.all([
        supabase.from('cheers').select('id', { count: 'exact' }).eq('candidate_id', candidateId),
        supabase.from('feeds').select('id', { count: 'exact' }).eq('candidate_id', candidateId),
        supabase.from('qna').select('id', { count: 'exact' }).eq('candidate_id', candidateId).eq('is_answered', false),
      ]);

      setStats({
        visits: 0, // 방문자 수는 별도 구현
        cheers: cheersRes.count || 0,
        feeds: feedsRes.count || 0,
        unansweredQna: qnaRes.count || 0,
      });

      setLoading(false);
    };

    fetchData();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">안녕하세요,</p>
        <h1 className="text-2xl font-bold text-gray-900">{candidate?.name} 후보님</h1>
      </div>

      {/* 유권자 앱 바로가기 */}
      <a
        href={`http://localhost:5174/${candidate?.party_code}/${candidate?.candidate_code}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">내 유권자 페이지</p>
            <p className="text-xs text-blue-400 mt-1">ebridge.kr/{candidate?.party_code}/{candidate?.candidate_code}</p>
          </div>
          <ExternalLink size={20} className="text-blue-500" />
        </div>
      </a>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Eye size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.visits}</p>
              <p className="text-xs text-gray-500">오늘 방문자</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Heart size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.cheers}</p>
              <p className="text-xs text-gray-500">총 응원</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.feeds}</p>
              <p className="text-xs text-gray-500">등록 소식</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <HelpCircle size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.unansweredQna}</p>
              <p className="text-xs text-gray-500">미답변 질문</p>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center justify-between p-4"
        >
          <span className="font-medium">프로필 수정</span>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
        <button
          onClick={() => navigate('/feeds')}
          className="w-full flex items-center justify-between p-4"
        >
          <span className="font-medium">새 소식 등록</span>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
        <button
          onClick={() => navigate('/pledges')}
          className="w-full flex items-center justify-between p-4"
        >
          <span className="font-medium">공약 관리</span>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
        <button
          onClick={() => navigate('/qna')}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">Q&A 답변하기</span>
            {stats.unansweredQna > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {stats.unansweredQna}
              </span>
            )}
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}
