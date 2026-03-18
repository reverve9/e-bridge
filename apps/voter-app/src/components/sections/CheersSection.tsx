import { useState, useEffect } from 'react';
import { Heart, Send } from 'lucide-react';
import type { Theme } from '@e-bridge/ui';
import type { Cheer } from '@/lib/types';
import { formatTime, maskName } from '@/lib/markdown';
import { supabase } from '@/lib/supabase';

interface CheersSectionProps {
  theme: Theme;
  cheers: Cheer[];
  candidateId: string;
  onCheersUpdate: (cheers: Cheer[]) => void;
  variant: 'inline' | 'button';
  onAddClick?: () => void;
  onCheerClick?: (cheer: Cheer) => void;
}

export default function CheersSection({
  theme, cheers, candidateId, onCheersUpdate, variant, onAddClick, onCheerClick,
}: CheersSectionProps) {
  const c = theme.colors;
  const [cheerStartIndex, setCheerStartIndex] = useState(0);
  const [likedCheers, setLikedCheers] = useState<Set<string>>(new Set());
  const [cheerName, setCheerName] = useState('');
  const [cheerMessage, setCheerMessage] = useState('');
  const [cheerSubmitting, setCheerSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('likedCheers');
    if (stored) setLikedCheers(new Set(JSON.parse(stored)));
  }, []);

  useEffect(() => {
    if (cheers.length <= 5) return;
    const interval = setInterval(() => {
      setCheerStartIndex((prev) => (prev + 1 >= cheers.length ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [cheers.length]);

  const refreshCheers = async () => {
    const { data } = await supabase
      .from('cheers')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });
    if (data) onCheersUpdate(data);
  };

  const handleCheerSubmit = async () => {
    if (!cheerMessage.trim()) return;
    setCheerSubmitting(true);
    const displayName = cheerName.trim() ? maskName(cheerName) : '익명';
    await supabase.from('cheers').insert({
      candidate_id: candidateId,
      name: displayName,
      message: cheerMessage,
    });
    setCheerName('');
    setCheerMessage('');
    setCheerSubmitting(false);
    await refreshCheers();
  };

  const handleLike = async (cheerId: string) => {
    if (likedCheers.has(cheerId)) return;
    await supabase.rpc('increment_cheer_likes', { cheer_id: cheerId });
    const newLiked = new Set(likedCheers);
    newLiked.add(cheerId);
    setLikedCheers(newLiked);
    localStorage.setItem('likedCheers', JSON.stringify([...newLiked]));
    await refreshCheers();
  };

  return (
    <section className={`px-4 mt-3 ${variant === 'button' ? 'pb-6' : ''}`}>
      <div
        className="rounded-2xl p-4 shadow-sm"
        style={{
          backgroundColor: c.cardBg,
          border: theme.isDark ? `1px solid ${c.border}` : 'none',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <span className="w-1 h-5 rounded-full" style={{ backgroundColor: c.primary }} />
            <span style={{ color: c.primary }}>응원 메시지</span>
          </h3>
          <div className="flex items-center gap-2">
            {variant === 'button' && onAddClick && (
              <button
                onClick={onAddClick}
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: c.primaryLight, color: c.primary }}
              >
                + 남기기
              </button>
            )}
            <span className="text-xs" style={{ color: c.textMuted }}>
              {cheers.length}개
            </span>
          </div>
        </div>

        {/* 롤링 리스트 */}
        <div
          className="relative overflow-hidden"
          style={{ height: cheers.length === 0 ? 'auto' : `${Math.min(cheers.length, 5) * 36}px` }}
        >
          {cheers.length === 0 ? (
            <p className="text-center py-4" style={{ color: c.textMuted }}>
              첫 번째 응원을 남겨주세요!
            </p>
          ) : (
            <div
              className={cheerStartIndex === 0 ? '' : 'transition-transform duration-700 ease-in-out'}
              style={{ transform: `translateY(-${cheerStartIndex * 36}px)` }}
            >
              {[...cheers, ...cheers.slice(0, 5)].map((cheer, idx) => (
                <div
                  key={`${cheer.id}-${idx}`}
                  className={`flex items-center gap-2 h-9 ${onCheerClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onCheerClick?.(cheer)}
                >
                  <span
                    className="font-semibold text-sm w-14 flex-shrink-0"
                    style={{ color: c.textPrimary }}
                  >
                    {cheer.name}
                  </span>
                  <p
                    className="text-sm flex-1 min-w-0 truncate"
                    style={{ color: c.textSecondary }}
                  >
                    {cheer.message}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs" style={{ color: c.textMuted }}>
                      {formatTime(cheer.created_at)}
                    </span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleLike(cheer.id);
                      }}
                      className="flex items-center gap-0.5"
                      style={{ color: likedCheers.has(cheer.id) ? '#EF4444' : c.textMuted }}
                    >
                      <Heart size={12} className={likedCheers.has(cheer.id) ? 'fill-current' : ''} />
                      <span className="text-xs">{cheer.likes_count || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 인라인 입력 폼 */}
        {variant === 'inline' && (
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${c.borderLight}` }}>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={cheerName}
                onChange={(e) => setCheerName(e.target.value)}
                placeholder="이름 (선택)"
                className="w-24 flex-shrink-0 px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: c.cardBgAlt,
                  color: c.textPrimary,
                  border: `1px solid ${c.borderLight}`,
                }}
              />
              <input
                type="text"
                value={cheerMessage}
                onChange={(e) => setCheerMessage(e.target.value)}
                placeholder="응원 메시지를 남겨주세요"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: c.cardBgAlt,
                  color: c.textPrimary,
                  border: `1px solid ${c.borderLight}`,
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCheerSubmit(); }}
              />
              <button
                onClick={handleCheerSubmit}
                disabled={!cheerMessage.trim() || cheerSubmitting}
                className="flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                style={{ backgroundColor: c.primary, color: c.primaryText }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
