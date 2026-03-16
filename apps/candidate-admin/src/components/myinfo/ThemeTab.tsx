import { useState, useEffect } from 'react';
import { Save, Sun, Moon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ThemeTabProps {
  candidateId: string;
}

export default function ThemeTab({ candidateId }: ThemeTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeMode, setThemeMode] = useState<'classic' | 'dark'>('classic');
  const [candidateName, setCandidateName] = useState('');
  const [partyCode, setPartyCode] = useState('');
  const [candidateCode, setCandidateCode] = useState('');

  useEffect(() => {
    fetchData();
  }, [candidateId]);

  const fetchData = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('name, theme_mode, party_code, candidate_code')
      .eq('id', candidateId)
      .single();

    if (data) {
      setThemeMode(data.theme_mode || 'classic');
      setCandidateName(data.name || '');
      setPartyCode(data.party_code || '');
      setCandidateCode(data.candidate_code || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('candidates')
      .update({ theme_mode: themeMode })
      .eq('id', candidateId);

    if (error) {
      alert('저장에 실패했습니다: ' + error.message);
    } else {
      alert('저장되었습니다');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const pageUrl = `https://ebridge.kr/${partyCode}/${candidateCode}`;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">테마 설정</h1>
        <p className="text-sm text-gray-500 mt-1">유권자 페이지의 테마를 설정합니다.</p>
      </div>

      {/* 테마 선택 */}
      <div className="space-y-4">
        {/* 클래식 (라이트) */}
        <button
          onClick={() => setThemeMode('classic')}
          className={`w-full p-4 rounded-2xl border-2 transition-all ${
            themeMode === 'classic' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* 프리뷰 */}
            <div className="w-20 h-32 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-gray-200">
              <div className="h-8 bg-gradient-to-r from-blue-600 to-blue-400" />
              <div className="h-24 bg-gray-100 p-2">
                <div className="w-full h-3 bg-gray-300 rounded mb-1" />
                <div className="w-3/4 h-2 bg-gray-200 rounded mb-2" />
                <div className="w-full h-6 bg-white rounded border border-gray-200" />
              </div>
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Sun size={18} className="text-yellow-500" />
                <span className="font-semibold text-gray-900">클래식 (라이트)</span>
                {themeMode === 'classic' && (
                  <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">선택됨</span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                밝은 배경에 깔끔한 디자인.<br/>
                가독성이 높고 친근한 느낌을 줍니다.
              </p>
            </div>
          </div>
        </button>

        {/* 다크 */}
        <button
          onClick={() => setThemeMode('dark')}
          className={`w-full p-4 rounded-2xl border-2 transition-all ${
            themeMode === 'dark' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* 프리뷰 */}
            <div className="w-20 h-32 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-gray-700">
              <div className="h-8 bg-gradient-to-r from-blue-800 to-blue-600" />
              <div className="h-24 bg-slate-900 p-2">
                <div className="w-full h-3 bg-slate-700 rounded mb-1" />
                <div className="w-3/4 h-2 bg-slate-800 rounded mb-2" />
                <div className="w-full h-6 bg-slate-800 rounded border border-slate-700" />
              </div>
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Moon size={18} className="text-indigo-400" />
                <span className="font-semibold text-gray-900">다크</span>
                {themeMode === 'dark' && (
                  <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">선택됨</span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                어두운 배경에 세련된 디자인.<br/>
                모던하고 차분한 느낌을 줍니다.
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* 미리보기 링크 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-500 mb-2">저장 후 아래 링크에서 확인하세요:</p>
        <a 
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 text-sm font-medium hover:underline break-all"
        >
          {pageUrl}
        </a>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save size={20} />
        {saving ? '저장 중...' : '저장하기'}
      </button>
    </div>
  );
}
