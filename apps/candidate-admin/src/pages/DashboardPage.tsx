import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Candidate } from '../lib/supabase';
import { Eye, Heart, Newspaper, ChevronRight, ExternalLink, Download, Camera, Megaphone } from 'lucide-react';

interface DashboardPageProps {
  candidateId: string;
}

export default function DashboardPage({ candidateId }: DashboardPageProps) {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [stats, setStats] = useState({
    totalVisits: 0,
    todayVisits: 0,
    cheers: 0,
    totalLikes: 0,
    feeds: 0,
    feedsByType: { activity: 0, news: 0, notice: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: candidateData } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (candidateData) setCandidate(candidateData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalVisitsRes, todayVisitsRes, cheersRes, feedsRes] = await Promise.all([
        supabase.from('page_visits').select('id', { count: 'exact' }).eq('candidate_id', candidateId),
        supabase.from('page_visits').select('id', { count: 'exact' }).eq('candidate_id', candidateId).gte('visited_at', today.toISOString()),
        supabase.from('cheers').select('id, likes_count').eq('candidate_id', candidateId),
        supabase.from('feeds').select('id, type').eq('candidate_id', candidateId),
      ]);

      // 좋아요 합계
      const totalLikes = cheersRes.data?.reduce((sum, c) => sum + (c.likes_count || 0), 0) || 0;

      // 소식 타입별 카운트
      const feedsByType = { activity: 0, news: 0, notice: 0 };
      feedsRes.data?.forEach(f => {
        if (f.type === 'activity') feedsByType.activity++;
        else if (f.type === 'news') feedsByType.news++;
        else if (f.type === 'notice') feedsByType.notice++;
      });

      setStats({
        totalVisits: totalVisitsRes.count || 0,
        todayVisits: todayVisitsRes.count || 0,
        cheers: cheersRes.data?.length || 0,
        totalLikes,
        feeds: feedsRes.data?.length || 0,
        feedsByType,
      });

      setLoading(false);
    };

    fetchData();
  }, [candidateId]);

  const handleDownloadQR = async () => {
    if (!candidate) return;
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://ebridge.kr/${candidate.party_code}/${candidate.candidate_code}`)}`;
    
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${candidate.name}_${candidate.candidate_code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('QR코드 다운로드에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const pageUrl = `https://ebridge.kr/${candidate?.party_code}/${candidate?.candidate_code}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(pageUrl)}`;

  return (
    <div className="p-6 md:p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <p className="text-sm text-gray-500">안녕하세요,</p>
        <h1 className="text-2xl font-bold text-gray-900">{candidate?.name} 후보님</h1>
      </div>

      {/* 메인 그리드 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 좌측: QR + 통계 */}
        <div className="flex-1 space-y-6">
          {/* QR 카드 */}
          <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <img 
                src={qrCodeUrl}
                alt="QR코드"
                className="w-28 h-28 rounded-lg bg-white flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm text-blue-600 font-medium mb-1">내 유권자 페이지</p>
                <p className="text-xs text-blue-400 mb-4 break-all">{pageUrl.replace('https://', '')}</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    <ExternalLink size={16} />
                    페이지 열기
                  </a>
                  <button
                    onClick={handleDownloadQR}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 text-sm rounded-lg border border-blue-200 hover:bg-blue-50"
                  >
                    <Download size={16} />
                    QR 다운로드
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 통계 카드 (1/4 + 1/4 + 2/4) */}
          <div className="flex gap-4">
            {/* 방문자 (1/4) */}
            <div className="flex-1 bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={18} className="text-blue-600" />
                <span className="text-xs text-gray-500">오늘 방문자</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.todayVisits}</p>
              <p className="text-xs text-gray-400 mt-1">누적 {stats.totalVisits.toLocaleString()}</p>
            </div>

            {/* 응원 (1/4) */}
            <div className="flex-1 bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={18} className="text-red-500" />
                <span className="text-xs text-gray-500">응원 메시지</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.cheers}</p>
              <p className="text-xs text-gray-400 mt-1">❤️ {stats.totalLikes}</p>
            </div>

            {/* 소식 (2/4) */}
            <div 
              className="flex-[2] bg-white rounded-2xl p-5 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/feeds')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Newspaper size={18} className="text-green-600" />
                  <span className="text-xs text-gray-500">등록 소식</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.feeds}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-gray-400">활동 {stats.feedsByType.activity}</span>
                <span className="text-xs text-gray-400">뉴스 {stats.feedsByType.news}</span>
                <span className="text-xs text-gray-400">공지 {stats.feedsByType.notice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 빠른 메뉴 */}
        <div className="lg:w-80">
          <h2 className="text-lg font-bold text-gray-900 mb-4">빠른 메뉴</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
            <button
              onClick={() => navigate('/feeds')}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">새 소식 등록</span>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
            <button
              onClick={() => navigate('/cheers')}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">응원 메시지 관리</span>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
