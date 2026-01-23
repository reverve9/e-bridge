import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Info, Copy, Check } from 'lucide-react';
import { supabase, CandidateInsert, PARTIES, getPartyCode, generateCandidateCode, getPartyColor } from '../lib/supabase';

const partyOptions = Object.keys(PARTIES);

// 선거 종류 (비례대표 포함)
const ELECTION_TYPES = [
  { id: 'metro_head', label: '광역자치단체장', description: '시장, 도지사' },
  { id: 'local_head', label: '기초자치단체장', description: '구청장, 시장, 군수' },
  { id: 'metro_council_district', label: '광역의원 (지역구)', description: '시·도의원 지역구' },
  { id: 'metro_council_proportional', label: '광역의원 (비례대표)', description: '시·도의원 비례대표' },
  { id: 'local_council_district', label: '기초의원 (지역구)', description: '구·시·군의원 지역구' },
  { id: 'local_council_proportional', label: '기초의원 (비례대표)', description: '구·시·군의원 비례대표' },
  { id: 'education', label: '교육감', description: '시·도 교육감' },
];

// 시/도 목록
const REGIONS = [
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
  '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도',
  '충청북도', '충청남도', '전북특별자치도', '전라남도', '경상북도', '경상남도', '제주특별자치도',
];

// 강원도 기초자치단체
const GANGWON_DISTRICTS = [
  '춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시',
  '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'
];

// 강원도 광역의원 선거구
const GANGWON_METRO_COUNCILS = [
  '춘천시 제1선거구', '춘천시 제2선거구',
  '원주시 제1선거구', '원주시 제2선거구', '원주시 제3선거구',
  '강릉시 제1선거구', '강릉시 제2선거구',
  '동해시·삼척시·태백시', '속초시·고성군·양양군',
  '홍천군·횡성군', '영월군·평창군·정선군', '철원군·화천군·양구군·인제군',
];

// 강원도 기초의원 선거구
const GANGWON_LOCAL_COUNCILS: Record<string, string[]> = {
  '춘천시': ['가선거구', '나선거구', '다선거구', '라선거구', '마선거구'],
  '원주시': ['가선거구', '나선거구', '다선거구', '라선거구', '마선거구', '바선거구'],
  '강릉시': ['가선거구', '나선거구', '다선거구', '라선거구', '마선거구'],
  '동해시': ['가선거구', '나선거구', '다선거구'],
  '태백시': ['가선거구', '나선거구'],
  '속초시': ['가선거구', '나선거구', '다선거구'],
  '삼척시': ['가선거구', '나선거구', '다선거구'],
  '홍천군': ['가선거구', '나선거구', '다선거구'],
  '횡성군': ['가선거구', '나선거구'],
  '영월군': ['가선거구', '나선거구'],
  '평창군': ['가선거구', '나선거구'],
  '정선군': ['가선거구', '나선거구'],
  '철원군': ['가선거구', '나선거구'],
  '화천군': ['가선거구', '나선거구'],
  '양구군': ['가선거구', '나선거구'],
  '인제군': ['가선거구', '나선거구'],
  '고성군': ['가선거구', '나선거구'],
  '양양군': ['가선거구', '나선거구'],
};

export default function CandidateCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [candidateCode] = useState(generateCandidateCode());
  
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    election_type: '',
    region: '',
    district: '',
    constituency: '',
    login_email: '',
    login_password: '',
  });

  // 정당 코드 자동 계산
  const partyCode = getPartyCode(formData.party);

  // 선거 종류에 따른 선거구 레벨 결정
  const getDistrictLevel = () => {
    switch (formData.election_type) {
      case 'metro_head':
      case 'education':
      case 'metro_council_proportional':
        return 'region';
      case 'local_head':
      case 'local_council_proportional':
        return 'district';
      case 'metro_council_district':
        return 'metro_council';
      case 'local_council_district':
        return 'local_council';
      default:
        return null;
    }
  };

  const districtLevel = getDistrictLevel();

  // 선거 종류 변경 시 하위 선거구 초기화
  useEffect(() => {
    setFormData(prev => ({ ...prev, region: '', district: '', constituency: '' }));
  }, [formData.election_type]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, district: '', constituency: '' }));
  }, [formData.region]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, constituency: '' }));
  }, [formData.district]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const copyUrl = () => {
    const url = `ebridge.kr/${partyCode}/${candidateCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const candidateData: CandidateInsert = {
      name: formData.name,
      party: formData.party,
      party_code: partyCode,
      election_type: formData.election_type,
      region: formData.region,
      district: formData.district || null,
      constituency: formData.constituency || null,
      photo_url: null,
      slogan: null,
      candidate_code: candidateCode,
      login_email: formData.login_email,
    };

    const { data, error } = await supabase
      .from('candidates')
      .insert([candidateData])
      .select()
      .single();

    if (error) {
      console.error('Error creating candidate:', error);
      if (error.code === '23505') {
        if (error.message.includes('candidate_code')) {
          setError('코드 충돌이 발생했습니다. 다시 시도해주세요.');
        } else if (error.message.includes('login_email')) {
          setError('이미 사용 중인 이메일입니다.');
        } else {
          setError('중복된 데이터가 있습니다.');
        }
      } else {
        setError('후보자 등록에 실패했습니다.');
      }
      setIsSubmitting(false);
      return;
    }

    console.log('Created candidate:', data);
    navigate('/candidates');
  };

  // 선거 종류에 따른 안내 메시지
  const getElectionTypeGuide = () => {
    switch (formData.election_type) {
      case 'metro_head':
        return '광역자치단체장은 시·도 전체를 선거구로 합니다.';
      case 'local_head':
        return '기초자치단체장은 구·시·군 전체를 선거구로 합니다.';
      case 'metro_council_district':
        return '광역의원(지역구)은 시·도 내 광역의원 선거구에서 선출됩니다.';
      case 'metro_council_proportional':
        return '광역의원(비례대표)은 시·도 전체를 선거구로 하며, 정당 명부에 따라 선출됩니다.';
      case 'local_council_district':
        return '기초의원(지역구)은 구·시·군 내 기초의원 선거구에서 선출됩니다.';
      case 'local_council_proportional':
        return '기초의원(비례대표)은 구·시·군 전체를 선거구로 하며, 정당 명부에 따라 선출됩니다.';
      case 'education':
        return '교육감은 시·도 전체를 선거구로 합니다.';
      default:
        return '';
    }
  };

  const renderDistrictSelectors = () => {
    if (!districtLevel) return null;

    const isGangwon = formData.region === '강원특별자치도';

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            시·도 <span className="text-red-500">*</span>
          </label>
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

        {(districtLevel === 'district') && formData.region && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              구·시·군 <span className="text-red-500">*</span>
            </label>
            {isGangwon ? (
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {GANGWON_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            ) : (
              <div className="px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-500">
                해당 지역 데이터 준비중입니다.
              </div>
            )}
          </div>
        )}

        {districtLevel === 'metro_council' && formData.region && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              광역의원 선거구 <span className="text-red-500">*</span>
            </label>
            {isGangwon ? (
              <select
                name="constituency"
                value={formData.constituency}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {GANGWON_METRO_COUNCILS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <div className="px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-500">
                해당 지역 데이터 준비중입니다.
              </div>
            )}
          </div>
        )}

        {districtLevel === 'local_council' && formData.region && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                구·시·군 <span className="text-red-500">*</span>
              </label>
              {isGangwon ? (
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {GANGWON_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : (
                <div className="px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-500">
                  해당 지역 데이터 준비중입니다.
                </div>
              )}
            </div>

            {formData.district && isGangwon && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기초의원 선거구 <span className="text-red-500">*</span>
                </label>
                <select
                  name="constituency"
                  value={formData.constituency}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {GANGWON_LOCAL_COUNCILS[formData.district]?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/candidates')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">후보자 등록</h1>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* 기본 정보 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="홍길동"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정당 <span className="text-red-500">*</span>
              </label>
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
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              선거 종류 <span className="text-red-500">*</span>
            </label>
            <select
              name="election_type"
              value={formData.election_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택하세요</option>
              {ELECTION_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label} ({type.description})
                </option>
              ))}
            </select>
          </div>

          {formData.election_type && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
              <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{getElectionTypeGuide()}</p>
            </div>
          )}

          {renderDistrictSelectors()}
        </div>

        {/* 유권자 앱 URL (자동 생성) */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">유권자 앱 URL</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">자동 생성된 URL</p>
                <p className="font-mono text-lg">
                  ebridge.kr/
                  <span 
                    className="font-bold"
                    style={{ color: formData.party ? getPartyColor(formData.party) : '#808080' }}
                  >
                    {partyCode || 'xxx'}
                  </span>
                  /<span className="font-bold">{candidateCode}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={copyUrl}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                <span>{copied ? '복사됨' : '복사'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              * URL은 자동 생성되며 변경할 수 없습니다. QR코드로 접속합니다.
            </p>
          </div>
        </div>

        {/* 로그인 정보 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">후보자 어드민 로그인 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="login_email"
                value={formData.login_email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="candidate@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                초기 비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="login_password"
                value={formData.login_password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="초기 비밀번호"
              />
              <p className="mt-1 text-sm text-gray-500">
                후보자 측에 전달할 초기 비밀번호입니다.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/candidates')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={20} />
            <span>{isSubmitting ? '등록 중...' : '후보자 등록'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
