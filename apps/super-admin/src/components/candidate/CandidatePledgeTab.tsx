import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Pledge {
  id?: string;
  candidate_id: string;
  emoji: string;
  title: string;
  description: string;
  priority: number;
}

interface PledgeDetail {
  id?: string;
  candidate_id: string;
  category: string;
  content: string;
  priority: number;
}

interface CandidatePledgeTabProps {
  candidateId: string;
}

const EMOJI_OPTIONS = ['📌', '🏛️', '🤝', '🌿', '👨‍💼', '⚡', '👥', '🚌', '🏠', '💼', '🎓', '🏥', '🌳', '💰', '🛡️', '🎯'];
const CATEGORY_OPTIONS = ['청년', '경제', '복지', '교육', '문화', '관광', '교통', '환경', '주거', '안전', '행정'];

export default function CandidatePledgeTab({ candidateId }: CandidatePledgeTabProps) {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [pledgeDetails, setPledgeDetails] = useState<PledgeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'core' | 'detail'>('core');

  const fetchData = async () => {
    const [pledgesRes, detailsRes] = await Promise.all([
      supabase.from('pledges').select('*').eq('candidate_id', candidateId).order('priority'),
      supabase.from('pledge_details').select('*').eq('candidate_id', candidateId).order('category').order('priority'),
    ]);

    if (pledgesRes.data) setPledges(pledgesRes.data);
    if (detailsRes.data) setPledgeDetails(detailsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [candidateId]);

  // 핵심 공약
  const addPledge = () => {
    setPledges([
      ...pledges,
      { candidate_id: candidateId, emoji: '📌', title: '', description: '', priority: pledges.length + 1 },
    ]);
  };

  const updatePledge = (index: number, field: keyof Pledge, value: any) => {
    const newPledges = [...pledges];
    newPledges[index] = { ...newPledges[index], [field]: value };
    setPledges(newPledges);
  };

  const removePledge = async (index: number) => {
    const pledge = pledges[index];
    if (pledge.id) {
      await supabase.from('pledges').delete().eq('id', pledge.id);
    }
    setPledges(pledges.filter((_, i) => i !== index));
  };

  // 세부 공약
  const addPledgeDetail = () => {
    setPledgeDetails([
      ...pledgeDetails,
      { candidate_id: candidateId, category: '청년', content: '', priority: 0 },
    ]);
  };

  const updatePledgeDetail = (index: number, field: keyof PledgeDetail, value: any) => {
    const newDetails = [...pledgeDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setPledgeDetails(newDetails);
  };

  const removePledgeDetail = async (index: number) => {
    const detail = pledgeDetails[index];
    if (detail.id) {
      await supabase.from('pledge_details').delete().eq('id', detail.id);
    }
    setPledgeDetails(pledgeDetails.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);

    // 핵심 공약 저장
    for (const pledge of pledges) {
      if (pledge.id) {
        await supabase.from('pledges').update({
          emoji: pledge.emoji,
          title: pledge.title,
          description: pledge.description,
          priority: pledge.priority,
        }).eq('id', pledge.id);
      } else if (pledge.title) {
        await supabase.from('pledges').insert({
          candidate_id: candidateId,
          emoji: pledge.emoji,
          title: pledge.title,
          description: pledge.description,
          priority: pledge.priority,
        });
      }
    }

    // 세부 공약 저장
    for (const detail of pledgeDetails) {
      if (detail.id) {
        await supabase.from('pledge_details').update({
          category: detail.category,
          content: detail.content,
          priority: detail.priority,
        }).eq('id', detail.id);
      } else if (detail.content) {
        await supabase.from('pledge_details').insert({
          candidate_id: candidateId,
          category: detail.category,
          content: detail.content,
          priority: detail.priority,
        });
      }
    }

    await fetchData();
    setSaving(false);
    alert('저장되었습니다.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // 카테고리별 그룹화
  const groupedDetails = pledgeDetails.reduce((acc, detail) => {
    if (!acc[detail.category]) acc[detail.category] = [];
    acc[detail.category].push(detail);
    return acc;
  }, {} as Record<string, PledgeDetail[]>);

  return (
    <div className="space-y-6">
      {/* 섹션 토글 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSection('core')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeSection === 'core'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          핵심 공약 ({pledges.length})
        </button>
        <button
          onClick={() => setActiveSection('detail')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeSection === 'detail'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          세부 공약 ({pledgeDetails.length})
        </button>
      </div>

      {/* 핵심 공약 */}
      {activeSection === 'core' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <Target size={20} />
              핵심 공약
            </h3>
            <button
              onClick={addPledge}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Plus size={16} />
              추가
            </button>
          </div>

          {pledges.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center bg-gray-50 rounded-lg">
              등록된 핵심 공약이 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {pledges.map((pledge, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex gap-3 items-start mb-3">
                    <select
                      value={pledge.emoji}
                      onChange={(e) => updatePledge(index, 'emoji', e.target.value)}
                      className="px-2 py-2 border border-gray-300 rounded-lg text-xl bg-white"
                    >
                      {EMOJI_OPTIONS.map((emoji) => (
                        <option key={emoji} value={emoji}>{emoji}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={pledge.title}
                      onChange={(e) => updatePledge(index, 'title', e.target.value)}
                      placeholder="공약 제목"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removePledge(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={pledge.description}
                    onChange={(e) => updatePledge(index, 'description', e.target.value)}
                    placeholder="간단한 설명 (선택)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 세부 공약 */}
      {activeSection === 'detail' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">세부 공약</h3>
            <button
              onClick={addPledgeDetail}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Plus size={16} />
              추가
            </button>
          </div>

          {pledgeDetails.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center bg-gray-50 rounded-lg">
              등록된 세부 공약이 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {pledgeDetails.map((detail, index) => (
                <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg">
                  <select
                    value={detail.category}
                    onChange={(e) => updatePledgeDetail(index, 'category', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={detail.content}
                    onChange={(e) => updatePledgeDetail(index, 'content', e.target.value)}
                    placeholder="공약 내용"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removePledgeDetail(index)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 저장 버튼 */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
}
