import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, FileText, Target, Phone, ExternalLink, Eye, RotateCcw } from 'lucide-react';
import { supabase, Candidate, getPartyColor } from '../lib/supabase';
import CandidateInfoTab from '../components/candidate/CandidateInfoTab';
import CandidateProfileTab from '../components/candidate/CandidateProfileTab';
import CandidatePledgeTab from '../components/candidate/CandidatePledgeTab';
import CandidateContactTab from '../components/candidate/CandidateContactTab';

type TabType = 'info' | 'profile' | 'pledge' | 'contact';

const TABS: { id: TabType; label: string; icon: typeof User }[] = [
  { id: 'info', label: '기본정보', icon: User },
  { id: 'profile', label: '프로필', icon: FileText },
  { id: 'pledge', label: '공약', icon: Target },
  { id: 'contact', label: '연락처', icon: Phone },
];

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [visitStats, setVisitStats] = useState({ total: 0, today: 0 });
  const [resetConfirm, setResetConfirm] = useState(false);

  const fetchCandidate = async () => {
    if (!id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      navigate('/candidates');
      return;
    }

    setCandidate(data);
    await fetchVisitStats(id);
    setLoading(false);
  };

  const fetchVisitStats = async (candidateId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRes, todayRes] = await Promise.all([
      supabase.from('page_visits').select('id', { count: 'exact' }).eq('candidate_id', candidateId),
      supabase.from('page_visits').select('id', { count: 'exact' }).eq('candidate_id', candidateId).gte('visited_at', today.toISOString()),
    ]);

    setVisitStats({
      total: totalRes.count || 0,
      today: todayRes.count || 0,
    });
  };

  const handleResetVisits = async () => {
    if (!id) return;

    const { error } = await supabase
      .from('page_visits')
      .delete()
      .eq('candidate_id', id);

    if (error) {
      alert('초기화에 실패했습니다.');
    } else {
      alert('방문자 기록이 초기화되었습니다.');
      setVisitStats({ total: 0, today: 0 });
    }
    setResetConfirm(false);
  };

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  if (loading || !candidate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  const partyColor = getPartyColor(candidate.party);

  return (
    <div className="space-y-6">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/candidates')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            {candidate.photo_url ? (
              <img
                src={candidate.photo_url}
                alt={candidate.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: partyColor }}
              >
                {candidate.name[0]}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{candidate.name}</h1>
              <p className="text-sm text-gray-500">
                {candidate.party} · {candidate.region}
              </p>
            </div>
          </div>
        </div>
        <Link
          to={`https://ebridge.kr/${candidate.party_code}/${candidate.candidate_code}`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ExternalLink size={18} />
          유권자 페이지
        </Link>
      </div>

      {/* 방문자 통계 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-blue-500" />
              <span className="text-sm text-gray-500">총 방문자</span>
              <span className="font-bold text-gray-900">{visitStats.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-purple-500" />
              <span className="text-sm text-gray-500">오늘 방문자</span>
              <span className="font-bold text-gray-900">{visitStats.today}</span>
            </div>
          </div>
          {resetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">정말 초기화?</span>
              <button
                onClick={handleResetVisits}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                확인
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirm(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <RotateCcw size={14} />
              방문자 초기화
            </button>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-6">
          {activeTab === 'info' && (
            <CandidateInfoTab candidate={candidate} onUpdate={fetchCandidate} />
          )}
          {activeTab === 'profile' && (
            <CandidateProfileTab candidate={candidate} onUpdate={fetchCandidate} />
          )}
          {activeTab === 'pledge' && (
            <CandidatePledgeTab candidateId={candidate.id} onUpdate={fetchCandidate} />
          )}
          {activeTab === 'contact' && (
            <CandidateContactTab candidate={candidate} onUpdate={fetchCandidate} />
          )}
        </div>
      </div>
    </div>
  );
}
