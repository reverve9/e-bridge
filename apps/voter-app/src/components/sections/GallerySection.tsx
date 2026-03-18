import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import type { Theme } from '@e-bridge/ui';
import type { GalleryItem } from '@/lib/types';
import { getYoutubeId, getVideoThumbnail } from '@/lib/markdown';

interface GallerySectionProps {
  theme: Theme;
  gallery: GalleryItem[];
}

export default function GallerySection({ theme, gallery }: GallerySectionProps) {
  const c = theme.colors;
  const [galleryTab, setGalleryTab] = useState<'image' | 'video'>('image');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const images = gallery.filter(g => g.type === 'image');
  const videos = gallery.filter(g => g.type === 'video');
  const currentItems = galleryTab === 'image' ? images : videos;

  // 대표 이미지 랜덤 로테이션 (5초)
  useEffect(() => {
    if (currentItems.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => {
        let next;
        do { next = Math.floor(Math.random() * currentItems.length); } while (next === prev);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [currentItems.length, galleryTab]);

  // 탭 전환 시 인덱스 리셋
  useEffect(() => {
    setFeaturedIndex(0);
  }, [galleryTab]);

  if (gallery.length === 0) return null;

  const GRID_MAX = 4;
  const featIdx = featuredIndex % (currentItems.length || 1);
  const featured = currentItems[featIdx];
  const otherItems = currentItems.filter((_, i) => i !== featIdx);
  const gridItems = otherItems.slice(0, GRID_MAX);
  const remaining = otherItems.length - GRID_MAX;

  return (
    <>
      <section className="px-4 mt-3">
        <div
          className="rounded-2xl p-4 shadow-sm"
          style={{
            backgroundColor: c.cardBg,
            border: theme.isDark ? `1px solid ${c.border}` : 'none'
          }}
        >
          {/* 헤더 + 탭 */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <span className="w-1 h-5 rounded-full" style={{ backgroundColor: c.primary }} />
              <span style={{ color: c.primary }}>갤러리</span>
            </h3>
            <div
              className="flex rounded-lg overflow-hidden text-xs"
              style={{ border: `1px solid ${c.borderLight}` }}
            >
              <button
                onClick={() => setGalleryTab('image')}
                className="px-3 py-1.5 font-medium transition-colors"
                style={{
                  backgroundColor: galleryTab === 'image' ? c.primary : 'transparent',
                  color: galleryTab === 'image' ? '#fff' : c.textMuted,
                }}
              >
                사진 {images.length > 0 && <span className="ml-0.5">{images.length}</span>}
              </button>
              <button
                onClick={() => setGalleryTab('video')}
                className="px-3 py-1.5 font-medium transition-colors"
                style={{
                  backgroundColor: galleryTab === 'video' ? c.primary : 'transparent',
                  color: galleryTab === 'video' ? '#fff' : c.textMuted,
                }}
              >
                영상 {videos.length > 0 && <span className="ml-0.5">{videos.length}</span>}
              </button>
            </div>
          </div>

          {currentItems.length === 0 ? (
            <p className="text-center py-6 text-sm" style={{ color: c.textMuted }}>
              {galleryTab === 'image' ? '등록된 사진이 없습니다' : '등록된 영상이 없습니다'}
            </p>
          ) : (
            <div className="space-y-1">
              {/* 대표 이미지 */}
              <div
                className="relative overflow-hidden cursor-pointer"
                style={{ paddingBottom: galleryTab === 'video' ? '56.25%' : '66%' }}
                onClick={() => setSelectedItem(featured)}
              >
                {featured.type === 'image' ? (
                  <img
                    src={featured.url}
                    alt={featured.caption || '갤러리 이미지'}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <img
                      src={getVideoThumbnail(featured.url, featured.thumbnail_url) || ''}
                      alt={featured.caption || '영상'}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: c.primary }}
                      >
                        <Play size={22} className="text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  </>
                )}
                {featured.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm">{featured.caption}</p>
                  </div>
                )}
              </div>

              {/* 나머지 그리드 */}
              {gridItems.length > 0 && (
                <div className="grid grid-cols-4 gap-1">
                  {gridItems.map((item, idx) => {
                    const isLast = idx === gridItems.length - 1 && remaining > 0;
                    return (
                      <div
                        key={item.id}
                        className="relative overflow-hidden cursor-pointer"
                        style={{ paddingBottom: '100%' }}
                        onClick={() => {
                          if (isLast) {
                            setShowAll(true);
                          } else {
                            setSelectedItem(item);
                          }
                        }}
                      >
                        <img
                          src={item.type === 'image' ? item.url : (getVideoThumbnail(item.url, item.thumbnail_url) || '')}
                          alt={item.caption || ''}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {item.type === 'video' && !isLast && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play size={14} className="text-white" fill="white" />
                          </div>
                        )}
                        {isLast && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="text-white text-sm font-bold">+{remaining}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 전체보기 모달 */}
      {showAll && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: c.cardBg }}>
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: c.border }}
          >
            <h3 className="font-bold" style={{ color: c.textPrimary }}>
              {galleryTab === 'image' ? '사진' : '영상'} 전체보기
            </h3>
            <button onClick={() => setShowAll(false)}>
              <X size={24} style={{ color: c.textMuted }} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-3 gap-1.5">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-lg overflow-hidden cursor-pointer"
                  style={{ paddingBottom: '100%' }}
                  onClick={() => {
                    setShowAll(false);
                    setSelectedItem(item);
                  }}
                >
                  <img
                    src={item.type === 'image' ? item.url : (getVideoThumbnail(item.url, item.thumbnail_url) || '')}
                    alt={item.caption || ''}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play size={18} className="text-white" fill="white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 뷰어 모달 (스와이프) */}
      {selectedItem && (() => {
        const currentIdx = gallery.findIndex(g => g.id === selectedItem.id);
        const hasPrev = currentIdx > 0;
        const hasNext = currentIdx < gallery.length - 1;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
            onClick={() => setSelectedItem(null)}
          >
            <button
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white"
              onClick={() => setSelectedItem(null)}
            >
              <X size={28} />
            </button>
            <div className="absolute top-4 left-4 z-10 text-white/70 text-sm font-medium">
              {currentIdx + 1} / {gallery.length}
            </div>
            {hasPrev && (
              <button
                className="absolute left-2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white/80 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setSelectedItem(gallery[currentIdx - 1]); }}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {hasNext && (
              <button
                className="absolute right-2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white/80 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setSelectedItem(gallery[currentIdx + 1]); }}
              >
                <ChevronRight size={24} />
              </button>
            )}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg mx-4"
              onTouchStart={(e) => {
                (e.currentTarget as any)._touchStartX = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                const startX = (e.currentTarget as any)._touchStartX;
                if (startX == null) return;
                const diff = e.changedTouches[0].clientX - startX;
                if (diff < -50 && hasNext) setSelectedItem(gallery[currentIdx + 1]);
                else if (diff > 50 && hasPrev) setSelectedItem(gallery[currentIdx - 1]);
              }}
            >
              {selectedItem.type === 'image' ? (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.caption || '갤러리 이미지'}
                  className="w-full rounded-xl select-none pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  {getYoutubeId(selectedItem.url) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYoutubeId(selectedItem.url)}?autoplay=1`}
                      className="absolute inset-0 w-full h-full rounded-xl"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={selectedItem.url}
                      className="absolute inset-0 w-full h-full rounded-xl object-contain"
                      controls
                      autoPlay
                    />
                  )}
                </div>
              )}
              {selectedItem.caption && (
                <p className="text-white/80 text-sm text-center mt-3">
                  {selectedItem.caption}
                </p>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}
