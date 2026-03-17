import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, X, Image, Film, GripVertical, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

interface GalleryTabProps {
  candidateId: string;
}

function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function GalleryTab({ candidateId }: GalleryTabProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalType, setModalType] = useState<'image' | 'video'>('image');
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGallery = async () => {
    const { data } = await supabase
      .from('gallery')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('sort_order');

    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, [candidateId]);

  const openModal = (type: 'image' | 'video') => {
    setModalType(type);
    setVideoUrl('');
    setCaption('');
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `gallery-${candidateId}-${Date.now()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('candidates')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('이미지 업로드에 실패했습니다.');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('candidates')
      .getPublicUrl(filePath);

    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 0;

    const { error } = await supabase.from('gallery').insert({
      candidate_id: candidateId,
      type: 'image',
      url: `${publicUrl}?t=${Date.now()}`,
      caption: caption || null,
      sort_order: maxOrder,
    });

    if (!error) {
      setShowModal(false);
      fetchGallery();
    }
    setUploading(false);
  };

  const handleVideoSubmit = async () => {
    if (!videoUrl.trim()) return;

    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 0;
    const ytId = getYoutubeId(videoUrl);
    const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

    const { error } = await supabase.from('gallery').insert({
      candidate_id: candidateId,
      type: 'video',
      url: videoUrl.trim(),
      thumbnail_url: thumbnailUrl,
      caption: caption || null,
      sort_order: maxOrder,
    });

    if (!error) {
      setShowModal(false);
      fetchGallery();
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm('삭제하시겠습니까?')) return;

    // 이미지인 경우 스토리지에서도 삭제
    if (item.type === 'image') {
      const url = item.url.split('?')[0]; // 타임스탬프 제거
      const pathMatch = url.match(/gallery\/gallery-[^/]+$/);
      if (pathMatch) {
        await supabase.storage.from('candidates').remove([pathMatch[0]]);
      }
    }

    await supabase.from('gallery').delete().eq('id', item.id);
    fetchGallery();
  };

  const toggleVisibility = async (item: GalleryItem) => {
    await supabase
      .from('gallery')
      .update({ is_visible: !item.is_visible })
      .eq('id', item.id);
    fetchGallery();
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const currentItem = items[index];
    const swapItem = items[swapIndex];

    await Promise.all([
      supabase.from('gallery').update({ sort_order: swapItem.sort_order }).eq('id', currentItem.id),
      supabase.from('gallery').update({ sort_order: currentItem.sort_order }).eq('id', swapItem.id),
    ]);
    fetchGallery();
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">갤러리 관리</h1>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('image')}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
          >
            <Image size={18} />
            이미지
          </button>
          <button
            onClick={() => openModal('video')}
            className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium"
          >
            <Film size={18} />
            영상
          </button>
        </div>
      </div>

      {/* 갤러리 목록 */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Image size={48} className="mx-auto mb-3 text-gray-300" />
          <p>등록된 갤러리가 없습니다</p>
          <p className="text-sm mt-1">이미지나 영상을 추가해보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 ${
                !item.is_visible ? 'opacity-50' : ''
              }`}
            >
              {/* 순서 버튼 */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"
                >
                  <GripVertical size={14} className="text-gray-400 rotate-180" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"
                >
                  <GripVertical size={14} className="text-gray-400" />
                </button>
              </div>

              {/* 썸네일 */}
              <div className="w-20 h-15 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.caption || '갤러리'}
                    className="w-full h-full object-cover"
                    style={{ height: '60px' }}
                  />
                ) : (
                  <>
                    <img
                      src={item.thumbnail_url || ''}
                      alt={item.caption || '영상'}
                      className="w-full h-full object-cover"
                      style={{ height: '60px' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Film size={16} className="text-white" />
                    </div>
                  </>
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    item.type === 'image'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-purple-50 text-purple-600'
                  }`}>
                    {item.type === 'image' ? '이미지' : '영상'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 truncate">
                  {item.caption || (item.type === 'video' ? item.url : '캡션 없음')}
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleVisibility(item)}
                  className="p-1.5 hover:bg-gray-100 rounded"
                  title={item.is_visible ? '숨기기' : '보이기'}
                >
                  {item.is_visible ? (
                    <Eye size={16} className="text-gray-400" />
                  ) : (
                    <EyeOff size={16} className="text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1.5 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 등록 모달 */}
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
              className="bg-white w-full max-w-md rounded-2xl overflow-hidden"
            >
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  {modalType === 'image' ? (
                    <><Image size={20} className="text-blue-600" /> 이미지 추가</>
                  ) : (
                    <><Film size={20} className="text-purple-600" /> 영상 추가</>
                  )}
                </h2>
                <button onClick={() => setShowModal(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              {/* 모달 컨텐츠 */}
              <div className="p-4 space-y-4">
                {modalType === 'image' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이미지 선택</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex flex-col items-center gap-2 text-gray-500"
                    >
                      {uploading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                          <span className="text-sm">업로드 중...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={24} />
                          <span className="text-sm">클릭하여 이미지 선택</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">영상 URL</label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-gray-400 mt-1">YouTube, YouTube Shorts URL 지원</p>
                    {videoUrl && getYoutubeId(videoUrl) && (
                      <div className="mt-3 rounded-xl overflow-hidden">
                        <img
                          src={`https://img.youtube.com/vi/${getYoutubeId(videoUrl)}/mqdefault.jpg`}
                          alt="영상 미리보기"
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 캡션 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">캡션 (선택)</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="갤러리에 표시될 설명"
                  />
                </div>
              </div>

              {/* 모달 푸터 (영상만) */}
              {modalType === 'video' && (
                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={handleVideoSubmit}
                    disabled={!videoUrl.trim()}
                    className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    등록하기
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
