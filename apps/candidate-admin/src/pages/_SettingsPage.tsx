import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Phone, Mail, MapPin, Clock, ExternalLink, Save, Palette, Check } from 'lucide-react';

// ===== 테마 정의 (내장) =====
type ThemeMode = 'classic' | 'colorful' | 'dark';
type PartyCode = 'dmj' | 'ppp' | 'ind';

interface PartyTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryText: string;
  secondary: string;
  accent: string;
}

const PARTY_THEMES: Record<PartyCode, Record<ThemeMode, PartyTheme>> = {
  dmj: {
    classic: {
      primary: '#004EA2',
      primaryLight: '#E8F0FA',
      primaryDark: '#003670',
      primaryText: '#FFFFFF',
      secondary: '#0073E6',
      accent: '#00A3FF',
    },
    colorful: {
      primary: '#0066CC',
      primaryLight: '#CCE5FF',
      primaryDark: '#004499',
      primaryText: '#FFFFFF',
      secondary: '#00AAFF',
      accent: '#66D4FF',
    },
    dark: {
      primary: '#4D9FFF',
      primaryLight: '#1A3A5C',
      primaryDark: '#003366',
      primaryText: '#FFFFFF',
      secondary: '#6BB8FF',
      accent: '#99D1FF',
    },
  },
  ppp: {
    classic: {
      primary: '#E61E2B',
      primaryLight: '#FDECEE',
      primaryDark: '#B8161F',
      primaryText: '#FFFFFF',
      secondary: '#00B5E2',
      accent: '#004C7E',
    },
    colorful: {
      primary: '#E61E2B',
      primaryLight: '#EDB19D',
      primaryDark: '#E5554F',
      primaryText: '#FFFFFF',
      secondary: '#00B5E2',
      accent: '#F18070',
    },
    dark: {
      primary: '#E5554F',
      primaryLight: '#3D1A1D',
      primaryDark: '#990011',
      primaryText: '#FFFFFF',
      secondary: '#00B5E2',
      accent: '#BDE4F8',
    },
  },
  ind: {
    classic: {
      primary: '#6B7280',
      primaryLight: '#F3F4F6',
      primaryDark: '#4B5563',
      primaryText: '#FFFFFF',
      secondary: '#9CA3AF',
      accent: '#D1D5DB',
    },
    colorful: {
      primary: '#8B5CF6',
      primaryLight: '#EDE9FE',
      primaryDark: '#6D28D9',
      primaryText: '#FFFFFF',
      secondary: '#A78BFA',
      accent: '#C4B5FD',
    },
    dark: {
      primary: '#A1A1AA',
      primaryLight: '#27272A',
      primaryDark: '#52525B',
      primaryText: '#FFFFFF',
      secondary: '#D4D4D8',
      accent: '#E4E4E7',
    },
  },
};

const PARTY_CODE_MAP: Record<string, PartyCode> = {
  '더불어민주당': 'dmj',
  '국민의힘': 'ppp',
  '무소속': 'ind',
};
// ===== 테마 정의 끝 =====

interface Candidate {
  id: string;
  name: string;
  party: string;
  party_code: string;
  candidate_code: string;
  region: string;
  district: string | null;
  theme_mode: ThemeMode | null;
}

interface SettingsPageProps {
  candidateId: string;
  onLogout: () => void;
}

// 테마 미리보기 컴포넌트
function ThemePreview({ 
  theme, 
  mode, 
  isSelected, 
  onClick 
}: { 
  theme: PartyTheme; 
  mode: ThemeMode; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const modeLabels = {
    classic: '클래식',
    colorful: '컬러풀',
    dark: '다크',
  };

  return (
    <button
      onClick={onClick}
      className={`relative flex-1 p-2 rounded-xl border-2 transition-all ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      )}
      
      {/* 컬러 프리뷰 */}
      <div className="flex justify-center gap-1 mb-2">
        <div 
          className="w-5 h-5 rounded" 
          style={{ backgroundColor: theme.primary }}
        />
        <div 
          className="w-5 h-5 rounded" 
          style={{ backgroundColor: theme.secondary }}
        />
        <div 
          className="w-5 h-5 rounded" 
          style={{ backgroundColor: theme.primaryLight }}
        />
      </div>
      
      {/* 버튼 미리보기 */}
      <div 
        className="w-full py-1 rounded-md text-[10px] font-medium mb-1"
        style={{ 
          backgroundColor: theme.primary,
          color: theme.primaryText,
        }}
      >
        버튼
      </div>
      
      <p className="text-[10px] font-medium text-gray-700">{modeLabels[mode]}</p>
    </button>
  );
}

export default function SettingsPage({ candidateId, onLogout }: SettingsPageProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [contact, setContact] = useState({
    phone: '',
    email: '',
    office_address: '',
    office_hours: '',
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>('classic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [candidateRes, contactRes] = await Promise.all([
        supabase.from('candidates').select('*').eq('id', candidateId).single(),
        supabase.from('contacts').select('*').eq('candidate_id', candidateId).maybeSingle(),
      ]);

      if (candidateRes.data) {
        setCandidate(candidateRes.data);
        setThemeMode(candidateRes.data.theme_mode || 'classic');
      }
      if (contactRes.data) {
        setContact({
          phone: contactRes.data.phone || '',
          email: contactRes.data.email || '',
          office_address: contactRes.data.office_address || '',
          office_hours: contactRes.data.office_hours || '',
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [candidateId]);

  const handleSaveContact = async () => {
    setSaving(true);
    
    await supabase.from('contacts').upsert({
      candidate_id: candidateId,
      ...contact,
    });

    setSaving(false);
    alert('저장되었습니다');
  };

  const handleSaveTheme = async (mode: ThemeMode) => {
    setSavingTheme(true);
    setThemeMode(mode);
    
    const { error } = await supabase
      .from('candidates')
      .update({ theme_mode: mode })
      .eq('id', candidateId);

    setSavingTheme(false);
    
    if (!error) {
      alert('테마가 저장되었습니다');
    }
  };

  // 현재 정당의 테마 가져오기
  const getPartyThemes = (): Record<ThemeMode, PartyTheme> | null => {
    if (!candidate) return null;
    const partyCode = PARTY_CODE_MAP[candidate.party];
    if (!partyCode || !PARTY_THEMES[partyCode]) return null;
    return PARTY_THEMES[partyCode];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const partyThemes = getPartyThemes();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">설정</h1>

      {/* 내 정보 */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">내 정보</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">이름</span>
            <span className="font-medium">{candidate?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">정당</span>
            <span className="font-medium">{candidate?.party}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">선거구</span>
            <span className="font-medium text-sm">{candidate?.region} {candidate?.district}</span>
          </div>
        </div>
      </div>

      {/* 유권자 페이지 링크 */}
      <a
        href={`https://ebridge.kr/${candidate?.party_code}/${candidate?.candidate_code}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-700">내 유권자 페이지</p>
            <p className="text-sm text-blue-500 mt-1">
              ebridge.kr/{candidate?.party_code}/{candidate?.candidate_code}
            </p>
          </div>
          <ExternalLink size={20} className="text-blue-500" />
        </div>
      </a>

      {/* 테마 설정 - 유권자 페이지 바로 아래 */}
      {partyThemes && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
            <Palette size={16} />
            테마 설정
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            유권자에게 보여지는 페이지의 테마를 선택하세요
          </p>
          
          {/* 테마 선택 - 균등 분할 */}
          <div className="flex gap-2">
            {(['classic', 'colorful', 'dark'] as ThemeMode[]).map((mode) => (
              <ThemePreview
                key={mode}
                theme={partyThemes[mode]}
                mode={mode}
                isSelected={themeMode === mode}
                onClick={() => handleSaveTheme(mode)}
              />
            ))}
          </div>
          
          {savingTheme && (
            <p className="text-xs text-blue-500 mt-2 text-center">저장 중...</p>
          )}
        </div>
      )}

      {/* 연락처 설정 */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-4">연락처 설정</h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Phone size={16} />
              전화번호
            </label>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="010-0000-0000"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Mail size={16} />
              이메일
            </label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin size={16} />
              선거사무소 주소
            </label>
            <input
              type="text"
              value={contact.office_address}
              onChange={(e) => setContact({ ...contact, office_address: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="강릉시 강릉대로 122"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Clock size={16} />
              운영 시간
            </label>
            <input
              type="text"
              value={contact.office_hours}
              onChange={(e) => setContact({ ...contact, office_hours: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="평일 09:00 - 18:00"
            />
          </div>
        </div>
        <button
          onClick={handleSaveContact}
          disabled={saving}
          className="w-full mt-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {saving ? '저장 중...' : '연락처 저장'}
        </button>
      </div>

      {/* 로그아웃 */}
      <button
        onClick={onLogout}
        className="w-full py-3 border border-red-200 text-red-500 rounded-xl font-medium flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        로그아웃
      </button>

      <p className="text-center text-xs text-gray-400 mt-6">
        E-Bridge v0.0.1
      </p>
    </div>
  );
}
