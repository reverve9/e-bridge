import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Camera, Newspaper, Trash2, Pin, X, Link, ExternalLink, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Feed {
  id: string;
  type: 'activity' | 'news' | 'notice';
  title: string;
  content: string | null;
  source_url: string | null;
  likes_count: number;
  published_at: string;
}

interface FeedsPageProps {
  candidateId: string;
}

export default function FeedsPage({ candidateId }: FeedsPageProps) {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [formData, setFormData] = useState({
    type: 'activity' as Feed['type'],
    title: '',
    content: '',
    source_url: '',
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

  const openCreateModal = () => {
    setEditingFeed(null);
    setFormData({ type: 'activity', title: '', content: '', source_url: '' });
    setShowModal(true);
  };

  const openEditModal = (feed: Feed) => {
    setEditingFeed(feed);
    setFormData({
      type: feed.type,
      title: feed.title,
      content: feed.content || '',
      source_url: feed.source_url || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    if (editingFeed) {
      // 수정
      const { error } = await supabase
        .from('feeds')
        .update({
          type: formData.type,
          title: formData.title,
          content: formData.content || null,
          source_url: formData.source_url || null,
        })
        .eq('id', editingFeed.id);

      if (!error) {
        setShowModal(false);
        setEditingFeed(null);
        fetchFeeds();
      }
    } else {
      // 생성
      const { error } = await supabase.from('feeds').insert({
        candidate_id: candidateId,
        type: formData.type,
        title: formData.title,
        content: formData.content || null,
        source_url: formData.source_url || null,
      });

      if (!error) {
        setShowModal(false);
        fetchFeeds();
      }
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
          onClick={openCreateModal}
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
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(feed)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 size={16} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(feed.id)}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{feed.title}</h3>
              {feed.content && (
                <p className="text-sm text-gray-500 line-clamp-2">{feed.content}</p>
              )}
              {feed.source_url && (
                <a 
                  href={feed.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-blue-500 hover:text-blue-600"
                >
                  <ExternalLink size={12} />
                  원문 보기
                </a>
              )}
              <div className="mt-2 text-xs text-gray-400">
                ❤️ {feed.likes_count}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 등록/수정 모달 */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold">
                  {editingFeed ? '소식 수정' : '새 소식 등록'}
                </h2>
                <button onClick={() => setShowModal(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              {/* 모달 컨텐츠 */}
              <div className="p-4 overflow-y-auto flex-1">
                <div className="space-y-4">
                  {/* 종류 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">종류</label>
                    <div className="flex gap-2">
                      {(['activity', 'news', 'notice'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFormData({ ...formData, type })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                            formData.type === type
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {getTypeLabel(type)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 제목 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="소식 제목"
                    />
                  </div>

                  {/* 내용 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="소식 내용을 입력하세요"
                    />
                  </div>

                  {/* 원문 링크 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">원문 링크 (선택)</label>
                    <div className="relative">
                      <Link size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={formData.source_url}
                        onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">페이스북, 인스타그램 등 원문 URL</p>
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleSubmit}
                  disabled={!formData.title.trim()}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {editingFeed ? '수정하기' : '등록하기'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
