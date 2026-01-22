import { useState, useEffect } from 'react';
import { supabase, Pledge } from '../lib/supabase';
import { Plus, Trash2, X, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PledgesPageProps {
  candidateId: string;
}

export default function PledgesPage({ candidateId }: PledgesPageProps) {
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
      .order('priority', { ascending: true });

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
      description: newPledge.description,
      priority: pledges.length + 1,
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

  const emojiOptions = ['📌', '🏛️', '🤝', '🌿', '👨‍💼', '⚡', '👥', '🚌', '🏠', '💼', '🎓', '🏥', '🌳', '💰'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">공약 관리</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
        >
          <Plus size={18} />
          공약 추가
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : pledges.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          등록된 공약이 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {pledges.map((pledge, idx) => (
            <div key={pledge.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
              <GripVertical size={20} className="text-gray-300" />
              <span className="text-2xl">{pledge.emoji}</span>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{pledge.title}</h3>
                {pledge.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{pledge.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(pledge.id)}
                className="p-2 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 공약 추가 모달 */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-3xl p-6"
              style={{ maxWidth: '430px', margin: '0 auto' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">공약 추가</h2>
                <button onClick={() => setShowModal(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">아이콘</label>
                  <div className="flex flex-wrap gap-2">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewPledge({ ...newPledge, emoji })}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center ${
                          newPledge.emoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-100'
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
                className="w-full mt-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold"
              >
                추가하기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
