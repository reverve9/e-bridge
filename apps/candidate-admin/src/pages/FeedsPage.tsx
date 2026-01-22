import { useState, useEffect } from 'react';
import { supabase, Feed } from '../lib/supabase';
import { Plus, Camera, Newspaper, Trash2, Pin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedsPageProps {
  candidateId: string;
}

export default function FeedsPage({ candidateId }: FeedsPageProps) {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFeed, setNewFeed] = useState({
    type: 'activity' as Feed['type'],
    title: '',
    content: '',
  });

  const fetchFeeds = async () => {
    const { data } = await supabase
      .from('feeds')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('published_at', { ascending: false });

    if (data) setFeeds(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeds();
  }, [candidateId]);

  const handleCreate = async () => {
    if (!newFeed.title.trim()) return;

    const { error } = await supabase.from('feeds').insert({
      candidate_id: candidateId,
      type: newFeed.type,
      title: newFeed.title,
      content: newFeed.content,
    });

    if (!error) {
      setShowModal(false);
      setNewFeed({ type: 'activity', title: '', content: '' });
      fetchFeeds();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    
    await supabase.from('feeds').delete().eq('id', id);
    fetchFeeds();
  };

  const getTypeIcon = (type: Feed['type']) => {
    switch (type) {
      case 'activity': return <Camera size={16} className="text-blue-500" />;
      case 'news': return <Newspaper size={16} className="text-green-500" />;
      default: return <Pin size={16} className="text-orange-500" />;
    }
  };

  const getTypeLabel = (type: Feed['type']) => {
    switch (type) {
      case 'activity': return '활동';
      case 'news': return '뉴스';
      default: return '공지';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    if (hours < 48) return '어제';
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">소식 관리</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
        >
          <Plus size={18} />
          새 소식
        </button>
      </div>

      {/* 피드 목록 */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : feeds.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          등록된 소식이 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {feeds.map((feed) => (
            <div key={feed.id} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(feed.type)}
                  <span className="text-xs text-gray-400">{getTypeLabel(feed.type)}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{formatDate(feed.published_at)}</span>
                </div>
                <button
                  onClick={() => handleDelete(feed.id)}
                  className="p-1 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{feed.title}</h3>
              {feed.content && (
                <p className="text-sm text-gray-500 line-clamp-2">{feed.content}</p>
              )}
              <div className="mt-2 text-xs text-gray-400">
                ❤️ {feed.likes_count}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 새 소식 모달 */}
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
                <h2 className="text-lg font-bold">새 소식 등록</h2>
                <button onClick={() => setShowModal(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">종류</label>
                  <div className="flex gap-2">
                    {(['activity', 'news', 'notice'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewFeed({ ...newFeed, type })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                          newFeed.type === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {getTypeLabel(type)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                  <input
                    type="text"
                    value={newFeed.title}
                    onChange={(e) => setNewFeed({ ...newFeed, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="소식 제목"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                  <textarea
                    value={newFeed.content}
                    onChange={(e) => setNewFeed({ ...newFeed, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="소식 내용을 입력하세요"
                  />
                </div>
              </div>

              <button
                onClick={handleCreate}
                className="w-full mt-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold"
              >
                등록하기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
