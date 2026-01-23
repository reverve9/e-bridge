import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Candidate } from '../lib/supabase';
import { Eye, Heart, MessageCircle, ChevronRight, ExternalLink, ThumbsUp } from 'lucide-react';

interface Pledge {
  id: string;
  title: string;
  likes_count: number;
}

interface DashboardPageProps {
  candidateId: string;
}

export default function DashboardPage({ candidateId }: DashboardPageProps) {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [stats, setStats] = useState({
    totalVisits: 0,
    todayVisits: 0,
    cheers: 0,
    feeds: 0,
    totalPledgeLikes: 0,
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

      // 오늘 날짜 (UTC 기준)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // 통계
      const [cheersRes, feedsRes, visitsRes, todayVisitsRes, pledgesRes] = await Promise.all([
        supabase.from('cheers').select('id', { count: 'exact' }).eq('candidate_id', candidateId),
        supabase.from('feeds').select('id', { count: 'exact' }).eq('candidate_id', candidateId),
        supabase.from('page_visits').select('id', { count: 'exact' }).eq('candidate_id', candidateId),
        supabase.from('page_visits').select('id', { count: 'exact' }).eq('candidate_id', candidateId).gte('visited_at', todayISO),
        supabase.from('pledges').select('id, title, likes_count').eq('candidate_id', candidateId).order('order'),
      ]);

      const pledgesList = pledgesRes.data || [];
      const totalPledgeLikes = pledgesList.reduce((sum, p) => sum + (p.likes_count || 0), 0);

      setPledges(pledgesList);
      setStats({
        totalVisits: visitsRes.count || 0,
        todayVisits: todayVisitsRes.count || 0,
        cheers: cheersRes.count || 0,
        feeds: feedsRes.count || 0,
        totalPledgeLikes,
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
        href={`https://ebridge.kr/${candidate?.party_code}/${candidate?.candidate_code}`}
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
              <p className="text-2xl font-bold text-gray-900">{stats.todayVisits}</p>
              <p className="text-xs text-gray-500">오늘 방문자</p>
              <p className="text-xs text-gray-400">총 {stats.totalVisits}명</p>
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
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ThumbsUp size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPledgeLikes}</p>
              <p className="text-xs text-gray-500">공약 공감</p>
            </div>
          </div>
        </div>
      </div>

      {/* 공약별 공감 순위 */}
      {pledges.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <ThumbsUp size={16} className="text-blue-600" />
            공약별 공감
          </h3>
          <div className="space-y-2">
            {pledges
              .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
              .map((pledge, idx) => (
                <div key={pledge.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-white' :
                    idx === 1 ? 'bg-gray-300 text-white' :
                    idx === 2 ? 'bg-orange-400 text-white' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{pledge.title}</span>
                  <span className="text-sm font-medium text-blue-600">{pledge.likes_count || 0}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 빠른 메뉴 */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
        <button
          onClick={() => navigate('/feeds')}
          className="w-full flex items-center justify-between p-4"
        >
          <span className="font-medium">소식 등록</span>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
        <button
          onClick={() => navigate('/cheers')}
          className="w-full flex items-center justify-between p-4"
        >
          <span className="font-medium">응원 메시지 관리</span>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}
