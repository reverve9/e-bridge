import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase, Candidate, PARTIES, getPartyCode, getPartyColor } from '../lib/supabase';

const partyOptions = Object.keys(PARTIES);

const ELECTION_TYPES = [
  { id: 'metro_head', label: '광역자치단체장' },
  { id: 'local_head', label: '기초자치단체장' },
  { id: 'metro_council_district', label: '광역의원 (지역구)' },
  { id: 'metro_council_proportional', label: '광역의원 (비례대표)' },
  { id: 'local_council_district', label: '기초의원 (지역구)' },
  { id: 'local_council_proportional', label: '기초의원 (비례대표)' },
  { id: 'education', label: '교육감' },
];

const REGIONS = [
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
  '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도',
  '충청북도', '충청남도', '전북특별자치도', '전라남도', '경상북도', '경상남도', '제주특별자치도',
];

export default function CandidateEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    party: '',
    election_type: '',
    region: '',
    district: '',
    constituency: '',
    slogan: '',
    login_email: '',
    theme_mode: 'classic',
  });

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching candidate:', error);
        setError('후보자 정보를 불러오는데 실패했습니다.');
      } else if (data) {
        setFormData({
          name: data.name,
          party: data.party,
          election_type: data.election_type,
          region: data.region,
          district: data.district || '',
          constituency: data.constituency || '',
          slogan: data.slogan || '',
          login_email: data.login_email,
          theme_mode: data.theme_mode || 'classic',
        });
      }
      setLoading(false);
    };

    fetchCandidate();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const partyCode = getPartyCode(formData.party);

    const updateData = {
      name: formData.name,
      party: formData.party,
      party_code: partyCode,
      election_type: formData.election_type,
      region: formData.region,
      district: formData.district || null,
      constituency: formData.constituency || null,
      slogan: formData.slogan || null,
      login_email: formData.login_email,
      theme_mode: formData.theme_mode,
    };

    const { error } = await supabase
      .from('candidates')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating candidate:', error);
      setError('수정에 실패했습니다.');
      setSaving(false);
      return;
    }

    navigate(`/candidates/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(`/candidates/${id}`)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">후보자 수정</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* 기본 정보 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">정당</label>
              <select
                name="party"
                value={formData.party}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {partyOptions.map((party) => (
                  <option key={party} value={party}>{party}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 선거 정보 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">선거 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">선거 종류</label>
              <select
                name="election_type"
                value={formData.election_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {ELECTION_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시·도</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {REGIONS.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">구·시·군</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="선택사항"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">선거구</label>
                <input
                  type="text"
                  name="constituency"
                  value={formData.constituency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="선택사항"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">슬로건</label>
              <textarea
                name="slogan"
                value={formData.slogan}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="후보자 슬로건"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">로그인 이메일</label>
              <input
                type="email"
                name="login_email"
                value={formData.login_email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">테마 모드</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme_mode"
                    value="classic"
                    checked={formData.theme_mode === 'classic'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">클래식 (라이트)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme_mode"
                    value="dark"
                    checked={formData.theme_mode === 'dark'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">다크</span>
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">유권자 페이지에 적용되는 테마입니다.</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/candidates/${id}`)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
