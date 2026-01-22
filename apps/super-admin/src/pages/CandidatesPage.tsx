import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase, Candidate, getPartyColor } from '../lib/supabase';

// 선거 종류 라벨
const ELECTION_TYPE_LABELS: Record<string, string> = {
  metro_head: '광역자치단체장',
  local_head: '기초자치단체장',
  metro_council_district: '광역의원(지역구)',
  metro_council_proportional: '광역의원(비례)',
  local_council_district: '기초의원(지역구)',
  local_council_proportional: '기초의원(비례)',
  education: '교육감',
};

export default function CandidatesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 후보자 목록 조회
  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('후보자 목록을 불러오는데 실패했습니다.');
      console.error('Error fetching candidates:', error);
    } else {
      setCandidates(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // 후보자 삭제
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id);

    if (error) {
      alert('삭제에 실패했습니다.');
      console.error('Error deleting candidate:', error);
    } else {
      setCandidates(candidates.filter(c => c.id !== id));
      setDeleteConfirm(null);
    }
  };

  // 활성/비활성 토글
  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('candidates')
      .update({ is_active: !currentActive })
      .eq('id', id);

    if (error) {
      alert('상태 변경에 실패했습니다.');
      console.error('Error toggling active:', error);
    } else {
      setCandidates(candidates.map(c => 
        c.id === id ? { ...c, is_active: !currentActive } as any : c
      ));
    }
  };

  // 검색 필터
  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.includes(searchTerm) ||
      c.region.includes(searchTerm) ||
      c.party.includes(searchTerm) ||
      (c.district && c.district.includes(searchTerm))
  );

  // 선거구 표시 문자열
  const getDistrictDisplay = (candidate: Candidate) => {
    let display = candidate.region;
    if (candidate.district) display += ` ${candidate.district}`;
    if (candidate.constituency) display += ` ${candidate.constituency}`;
    return display;
  };

  // 유권자 앱 URL 생성
  const getVoterAppUrl = (candidate: Candidate) => {
    return `ebridge.kr/${candidate.party_code}/${candidate.candidate_code}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="이름, 선거구, 정당 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchCandidates}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            <span>새로고침</span>
          </button>
          <Link
            to="/candidates/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>후보자 등록</span>
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">후보자</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">정당</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">선거종류</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">선거구</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">URL / QR</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">상태</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    불러오는 중...
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? '검색 결과가 없습니다.' : '등록된 후보자가 없습니다.'}
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: getPartyColor(candidate.party) }}
                        >
                          {candidate.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{candidate.name}</p>
                          <p className="text-sm text-gray-500">{candidate.login_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getPartyColor(candidate.party) }}
                      >
                        {candidate.party}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {ELECTION_TYPE_LABELS[candidate.election_type] || candidate.election_type}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {getDistrictDisplay(candidate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`https://ebridge.kr/${candidate.party_code}/${candidate.candidate_code}`)}`}
                          alt="QR"
                          className="w-12 h-12 rounded"
                        />
                        <div>
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            /{candidate.party_code}/{candidate.candidate_code}
                          </code>
                          <button 
                            className="ml-1 p-1 hover:bg-gray-100 rounded"
                            title="새 탭에서 열기"
                            onClick={() => window.open(`/${candidate.party_code}/${candidate.candidate_code}`, '_blank')}
                          >
                            <ExternalLink size={12} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(candidate.id, (candidate as any).is_active !== false)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          (candidate as any).is_active !== false
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {(candidate as any).is_active !== false ? '활성' : '비활성'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/candidates/${candidate.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-lg" 
                          title="보기"
                        >
                          <Eye size={18} className="text-gray-500" />
                        </button>
                        <button 
                          onClick={() => navigate(`/candidates/${candidate.id}/edit`)}
                          className="p-2 hover:bg-gray-100 rounded-lg" 
                          title="수정"
                        >
                          <Edit size={18} className="text-gray-500" />
                        </button>
                        {deleteConfirm === candidate.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(candidate.id)}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              확인
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteConfirm(candidate.id)}
                            className="p-2 hover:bg-red-50 rounded-lg" 
                            title="삭제"
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
