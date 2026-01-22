import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase, Candidate, getPartyColor } from '../../lib/supabase';

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

interface CandidateProfileTabProps {
  candidate: Candidate;
  onUpdate: () => void;
}

export default function CandidateProfileTab({ candidate, onUpdate }: CandidateProfileTabProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [education, setEducation] = useState<Education[]>([]);
  const [career, setCareer] = useState<Career[]>([]);
  const [introduction, setIntroduction] = useState('');

  // candidate가 없으면 early return
  if (!candidate) {
    return <div className="py-8 text-center text-gray-400">후보자 정보를 불러오는 중...</div>;
  }

  const partyColor = getPartyColor(candidate.party);

  useEffect(() => {
    if (candidate?.id) {
      fetchProfile();
    }
  }, [candidate?.id]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('candidate_id', candidate.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      // 학력 데이터 변환 (id 추가)
      const eduData = (data.education || []).map((e: any, idx: number) => ({
        id: e.id || `edu-${idx}-${Date.now()}`,
        school: e.school || '',
        major: e.major || '',
        note: e.note || '',
      }));
      setEducation(eduData);
      
      // 경력 데이터 변환 (is_current, order 추가)
      const careerData = (data.career || []).map((c: any, idx: number) => ({
        id: c.id || `career-${idx}-${Date.now()}`,
        title: c.title || '',
        is_current: c.is_current !== undefined ? c.is_current : c.period === '現',
        order: c.order !== undefined ? c.order : idx,
      }));
      setCareer(careerData.sort((a: Career, b: Career) => a.order - b.order));
      setIntroduction(data.introduction || '');
    } else {
      setEducation([]);
      setCareer([]);
      setIntroduction('');
    }
    setLoading(false);
  };

  // 학력 추가
  const addEducation = () => {
    setEducation([
      ...education,
      { id: `edu-${Date.now()}`, school: '', major: '', note: '' }
    ]);
  };

  // 학력 삭제
  const removeEducation = (id: string) => {
    setEducation(education.filter(e => e.id !== id));
  };

  // 학력 수정
  const updateEducation = (id: string, field: string, value: string) => {
    setEducation(education.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // 경력 추가
  const addCareer = () => {
    const maxOrder = career.length > 0 ? Math.max(...career.map(c => c.order)) : -1;
    setCareer([
      ...career,
      { id: `career-${Date.now()}`, title: '', is_current: false, order: maxOrder + 1 }
    ]);
  };

  // 경력 삭제
  const removeCareer = (id: string) => {
    setCareer(career.filter(c => c.id !== id));
  };

  // 경력 수정
  const updateCareer = (id: string, field: string, value: any) => {
    setCareer(career.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // 경력 순서 위로
  const moveCareerUp = (index: number) => {
    if (index === 0) return;
    const newCareer = [...career];
    [newCareer[index - 1], newCareer[index]] = [newCareer[index], newCareer[index - 1]];
    newCareer.forEach((c, idx) => c.order = idx);
    setCareer(newCareer);
  };

  // 경력 순서 아래로
  const moveCareerDown = (index: number) => {
    if (index === career.length - 1) return;
    const newCareer = [...career];
    [newCareer[index], newCareer[index + 1]] = [newCareer[index + 1], newCareer[index]];
    newCareer.forEach((c, idx) => c.order = idx);
    setCareer(newCareer);
  };

  // 저장
  const handleSave = async () => {
    setSaving(true);

    // 학력 데이터 정리 (빈 항목 제외, id 제거)
    const cleanEducation = education
      .filter(e => e.school.trim())
      .map(e => ({
        school: e.school,
        major: e.major,
        note: e.note,
      }));

    // 경력 데이터 정리 (빈 항목 제외)
    const cleanCareer = career
      .filter(c => c.title.trim())
      .map((c, idx) => ({
        title: c.title,
        is_current: c.is_current,
        order: idx,
        period: c.is_current ? '現' : '前', // 호환성 유지
      }));

    const profileData = {
      candidate_id: candidate.id,
      education: cleanEducation,
      career: cleanCareer,
      introduction: introduction.trim() || null,
    };

    try {
      if (profile) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', profile.id);
        
        if (error) {
          console.error('프로필 업데이트 오류:', error);
          alert('저장에 실패했습니다: ' + error.message);
        } else {
          alert('저장되었습니다.');
        }
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert(profileData);
        
        if (error) {
          console.error('프로필 생성 오류:', error);
          alert('저장에 실패했습니다: ' + error.message);
        } else {
          alert('저장되었습니다.');
        }
      }
    } catch (err) {
      console.error('저장 중 오류:', err);
      alert('저장 중 오류가 발생했습니다.');
    }

    setSaving(false);
    onUpdate();
    fetchProfile();
  };

  if (loading) {
    return <div className="py-8 text-center text-gray-400">로딩 중...</div>;
  }

  return (
    <div className="space-y-8">
      {/* 학력 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">학력</h3>
          <button
            onClick={addEducation}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Plus size={16} />
            추가
          </button>
        </div>
        
        {education.length === 0 ? (
          <p className="text-gray-400 text-sm py-4">등록된 학력이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                    placeholder="학교명"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={edu.major}
                    onChange={(e) => updateEducation(edu.id, 'major', e.target.value)}
                    placeholder="전공 (선택)"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={edu.note}
                    onChange={(e) => updateEducation(edu.id, 'note', e.target.value)}
                    placeholder="비고 (선택)"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 경력 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">주요 경력</h3>
          <button
            onClick={addCareer}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Plus size={16} />
            추가
          </button>
        </div>

        {career.length === 0 ? (
          <p className="text-gray-400 text-sm py-4">등록된 경력이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {career.map((c, idx) => (
              <div key={c.id} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg">
                {/* 순서 변경 버튼 */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveCareerUp(idx)}
                    disabled={idx === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveCareerDown(idx)}
                    disabled={idx === career.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                {/* 現/前 체크 */}
                <button
                  onClick={() => updateCareer(c.id, 'is_current', !c.is_current)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                  style={c.is_current ? {
                    backgroundColor: `${partyColor}20`,
                    color: partyColor
                  } : {
                    backgroundColor: '#f3f4f6',
                    color: '#9ca3af'
                  }}
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
        
        <p className="text-xs text-gray-400 mt-2">
          * 現/前 버튼을 클릭하여 현직/전직을 변경할 수 있습니다. 화살표로 순서를 변경하세요.
        </p>
      </div>

      {/* 인사말 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">인사말</h3>
        <textarea
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
          rows={5}
          placeholder="후보자 인사말을 입력하세요..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none"
        />
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
}
