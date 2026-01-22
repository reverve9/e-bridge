import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Pledge {
  id: string;
  title: string;
  description: string;
  order: number;
}

interface CandidatePledgeTabProps {
  candidateId: string;
  onUpdate?: () => void;
}

export default function CandidatePledgeTab({ candidateId, onUpdate }: CandidatePledgeTabProps) {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPledges();
  }, [candidateId]);

  const fetchPledges = async () => {
    const { data } = await supabase
      .from('pledges')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('order', { ascending: true });

    if (data) {
      setPledges(data.map((p, idx) => ({ ...p, order: p.order ?? idx })));
    }
    setLoading(false);
  };

  const addPledge = () => {
    const newPledge: Pledge = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      order: pledges.length,
    };
    setPledges([...pledges, newPledge]);
  };

  const updatePledge = (id: string, field: keyof Pledge, value: string | number) => {
    setPledges(pledges.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePledge = (id: string) => {
    setPledges(pledges.filter(p => p.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPledges = [...pledges];
    [newPledges[index - 1], newPledges[index]] = [newPledges[index], newPledges[index - 1]];
    newPledges.forEach((p, idx) => p.order = idx);
    setPledges(newPledges);
  };

  const moveDown = (index: number) => {
    if (index === pledges.length - 1) return;
    const newPledges = [...pledges];
    [newPledges[index], newPledges[index + 1]] = [newPledges[index + 1], newPledges[index]];
    newPledges.forEach((p, idx) => p.order = idx);
    setPledges(newPledges);
  };

  const handleSave = async () => {
    setSaving(true);

    // 기존 공약 삭제
    await supabase
      .from('pledges')
      .delete()
      .eq('candidate_id', candidateId);

    // 새 공약 저장
    const validPledges = pledges.filter(p => p.title.trim());
    if (validPledges.length > 0) {
      const { error } = await supabase
        .from('pledges')
        .insert(validPledges.map((p, idx) => ({
          candidate_id: candidateId,
          title: p.title,
          description: p.description || null,
          order: idx,
        })));

      if (error) {
        alert('저장에 실패했습니다: ' + error.message);
      } else {
        alert('저장되었습니다.');
        onUpdate?.();
      }
    } else {
      alert('저장되었습니다.');
    }

    setSaving(false);
    fetchPledges();
  };

  if (loading) {
    return <div className="py-8 text-center text-gray-400">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">핵심 공약</h3>
          <p className="text-sm text-gray-500 mt-1">유권자 앱에서 인사말 아래에 표시됩니다.</p>
        </div>
        <button
          onClick={addPledge}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <Plus size={16} />
          추가
        </button>
      </div>

      {pledges.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">등록된 공약이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {pledges.map((pledge, idx) => (
            <div key={pledge.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
              {/* 순서 변경 */}
              <div className="flex flex-col gap-0.5 pt-2">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === pledges.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* 번호 */}
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                {idx + 1}
              </div>

              {/* 내용 */}
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={pledge.title}
                  onChange={(e) => updatePledge(pledge.id, 'title', e.target.value)}
                  placeholder="공약 제목"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <textarea
                  value={pledge.description}
                  onChange={(e) => updatePledge(pledge.id, 'description', e.target.value)}
                  placeholder="상세 설명 (선택)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                />
              </div>

              {/* 삭제 */}
              <button
                onClick={() => removePledge(pledge.id)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

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
