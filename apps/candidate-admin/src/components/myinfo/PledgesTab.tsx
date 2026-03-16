import { useState, useEffect } from 'react';
import { Plus, Trash2, X, GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Pledge {
  id: string;
  emoji: string;
  title: string;
  description: string | null;
  order: number;
}

interface PledgesTabProps {
  candidateId: string;
}

const emojiOptions = ['📌', '🏛️', '🤝', '🌿', '👨‍💼', '⚡', '👥', '🚌', '🏠', '💼', '🎓', '🏥', '🌳', '💰'];

export default function PledgesTab({ candidateId }: PledgesTabProps) {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPledge, setNewPledge] = useState({
    emoji: '📌',
    title: '',
    description: '',
  });

  const fetchPledges = async () => {
    const { data } = await supabase
      .from('pledges')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('order', { ascending: true });

    if (data) setPledges(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPledges();
  }, [candidateId]);

  const handleCreate = async () => {
    if (!newPledge.title.trim()) return;

    const { error } = await supabase.from('pledges').insert({
      candidate_id: candidateId,
      emoji: newPledge.emoji,
      title: newPledge.title,
      description: newPledge.description || null,
      order: pledges.length,
    });

    if (!error) {
      setShowModal(false);
      setNewPledge({ emoji: '📌', title: '', description: '' });
      fetchPledges();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    
    await supabase.from('pledges').delete().eq('id', id);
    fetchPledges();
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">공약 관리</h1>
          <p className="text-gray-500 mt-1">핵심 공약을 등록하고 관리합니다.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
        >
          <Plus size={20} />
          공약 추가
        </button>
      </div>

      {/* 공약 목록 */}
      {pledges.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          등록된 공약이 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {pledges.map((pledge) => (
            <div key={pledge.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
              <GripVertical size={20} className="text-gray-300 flex-shrink-0" />
              <span className="text-3xl">{pledge.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{pledge.title}</h3>
                {pledge.description && (
                  <p className="text-sm text-gray-500 mt-1">{pledge.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(pledge.id)}
                className="p-2 hover:bg-red-50 rounded-lg flex-shrink-0"
              >
                <Trash2 size={20} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 공약 추가 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">공약 추가</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">아이콘</label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewPledge({ ...newPledge, emoji })}
                      className={`w-11 h-11 rounded-lg text-xl flex items-center justify-center ${
                        newPledge.emoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">공약 제목</label>
                <input
                  type="text"
                  value={newPledge.title}
                  onChange={(e) => setNewPledge({ ...newPledge, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="청년 일자리 500개 창출"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명 (선택)</label>
                <input
                  type="text"
                  value={newPledge.description}
                  onChange={(e) => setNewPledge({ ...newPledge, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="청년마을 조성, 사회적기업 지원"
                />
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={!newPledge.title.trim()}
              className="w-full mt-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-700"
            >
              추가하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
