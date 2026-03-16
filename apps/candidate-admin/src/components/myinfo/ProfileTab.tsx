import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Education {
  id: string;
  school: string;
  major: string;
  note: string;
}

interface Career {
  id: string;
  title: string;
  is_current: boolean;
  order: number;
}

interface ProfileTabProps {
  candidateId: string;
}

export default function ProfileTab({ candidateId }: ProfileTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 프로필 정보
  const [slogan, setSlogan] = useState('');
  const [tagline, setTagline] = useState('');
  const [introduction, setIntroduction] = useState('');
  
  // 학력/경력
  const [education, setEducation] = useState<Education[]>([]);
  const [career, setCareer] = useState<Career[]>([]);

  useEffect(() => {
    fetchData();
  }, [candidateId]);

  const fetchData = async () => {
    const [candidateRes, profileRes] = await Promise.all([
      supabase.from('candidates').select('slogan, tagline').eq('id', candidateId).single(),
      supabase.from('profiles').select('introduction, education, career').eq('candidate_id', candidateId).maybeSingle(),
    ]);

    if (candidateRes.data) {
      setSlogan(candidateRes.data.slogan || '');
      setTagline(candidateRes.data.tagline || '');
    }
    
    if (profileRes.data) {
      setIntroduction(profileRes.data.introduction || '');
      
      // 학력 데이터 변환
      const eduData = (profileRes.data.education || []).map((e: any, idx: number) => ({
        id: e.id || `edu-${idx}-${Date.now()}`,
        school: e.school || '',
        major: e.major || '',
        note: e.note || '',
      }));
      setEducation(eduData);
      
      // 경력 데이터 변환
      const careerData = (profileRes.data.career || []).map((c: any, idx: number) => ({
        id: c.id || `career-${idx}-${Date.now()}`,
        title: c.title || '',
        is_current: c.is_current !== undefined ? c.is_current : c.period === '現',
        order: c.order !== undefined ? c.order : idx,
      }));
      setCareer(careerData.sort((a: Career, b: Career) => a.order - b.order));
    }
    
    setLoading(false);
  };

  // 학력 관련 함수들
  const addEducation = () => {
    setEducation([
      ...education,
      { id: `edu-${Date.now()}`, school: '', major: '', note: '' }
    ]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(e => e.id !== id));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setEducation(education.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // 경력 관련 함수들
  const addCareer = () => {
    const maxOrder = career.length > 0 ? Math.max(...career.map(c => c.order)) : -1;
    setCareer([
      ...career,
      { id: `career-${Date.now()}`, title: '', is_current: false, order: maxOrder + 1 }
    ]);
  };

  const removeCareer = (id: string) => {
    setCareer(career.filter(c => c.id !== id));
  };

  const updateCareer = (id: string, field: string, value: any) => {
    setCareer(career.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const moveCareerUp = (index: number) => {
    if (index === 0) return;
    const newCareer = [...career];
    [newCareer[index - 1], newCareer[index]] = [newCareer[index], newCareer[index - 1]];
    newCareer.forEach((c, idx) => c.order = idx);
    setCareer(newCareer);
  };

  const moveCareerDown = (index: number) => {
    if (index === career.length - 1) return;
    const newCareer = [...career];
    [newCareer[index], newCareer[index + 1]] = [newCareer[index + 1], newCareer[index]];
    newCareer.forEach((c, idx) => c.order = idx);
    setCareer(newCareer);
  };

  const handleSave = async () => {
    setSaving(true);

    // candidates 테이블 업데이트
    await supabase
      .from('candidates')
      .update({ slogan, tagline })
      .eq('id', candidateId);

    // 학력 데이터 정리
    const cleanEducation = education
      .filter(e => e.school.trim())
      .map(e => ({
        school: e.school,
        major: e.major,
        note: e.note,
      }));

    // 경력 데이터 정리
    const cleanCareer = career
      .filter(c => c.title.trim())
      .map((c, idx) => ({
        title: c.title,
        is_current: c.is_current,
        order: idx,
        period: c.is_current ? '現' : '前',
      }));

    // profiles 테이블 upsert
    await supabase
      .from('profiles')
      .upsert({ 
        candidate_id: candidateId, 
        introduction,
        education: cleanEducation,
        career: cleanCareer,
      }, { 
        onConflict: 'candidate_id' 
      });

    setSaving(false);
    alert('저장되었습니다');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">프로필</h1>
        <p className="text-gray-500 mt-1">유권자 페이지에 표시될 기본 정보를 관리합니다.</p>
      </div>

      {/* 2열 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 좌측: 태그라인, 슬로건, 인사말 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">태그라인</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: MBC 아나운서 출신 · 소통전문가"
            />
            <p className="text-xs text-gray-400 mt-2">이름 아래에 표시되는 짧은 소개</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">슬로건</label>
            <textarea
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="예: 멀리 보고 크게 생각하는 새로운 시의원!"
            />
            <p className="text-xs text-gray-400 mt-2">히어로 섹션에 표시되는 핵심 메시지</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">인사말</label>
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="유권자에게 전하는 인사말을 작성하세요"
            />
          </div>
        </div>

        {/* 우측: 학력, 경력 */}
        <div className="space-y-6">
          {/* 학력 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">학력</h3>
              <button
                onClick={addEducation}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus size={16} />
                추가
              </button>
            </div>
            
            {education.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">등록된 학력이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                        placeholder="학교명"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => updateEducation(edu.id, 'major', e.target.value)}
                        placeholder="전공 (선택)"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={edu.note}
                        onChange={(e) => updateEducation(edu.id, 'note', e.target.value)}
                        placeholder="비고 (선택)"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 경력 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">주요 경력</h3>
              <button
                onClick={addCareer}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus size={16} />
                추가
              </button>
            </div>

            {career.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">등록된 경력이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {career.map((c, idx) => (
                  <div key={c.id} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                    {/* 순서 변경 */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveCareerUp(idx)}
                        disabled={idx === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveCareerDown(idx)}
                        disabled={idx === career.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* 現/前 토글 */}
                    <button
                      onClick={() => updateCareer(c.id, 'is_current', !c.is_current)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                        c.is_current 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {c.is_current ? '現' : '前'}
                    </button>

                    {/* 경력명 */}
                    <input
                      type="text"
                      value={c.title}
                      onChange={(e) => updateCareer(c.id, 'title', e.target.value)}
                      placeholder="경력명 (예: MBC 강원영동 아나운서)"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />

                    {/* 삭제 */}
                    <button
                      onClick={() => removeCareer(c.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-3">
              * 現/前 버튼을 클릭하여 현직/전직을 변경할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 hover:bg-blue-700"
        >
          <Save size={20} />
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
