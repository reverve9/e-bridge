import { useState, useEffect } from 'react';
import { ChevronDown, ThumbsUp } from 'lucide-react';
import type { Theme } from '@e-bridge/ui';
import type { Pledge } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface PledgesSectionProps {
  theme: Theme;
  pledges: Pledge[];
  candidateId: string;
  onPledgesUpdate: (pledges: Pledge[]) => void;
}

export default function PledgesSection({ theme, pledges, candidateId, onPledgesUpdate }: PledgesSectionProps) {
  const c = theme.colors;
  const [showAllPledges, setShowAllPledges] = useState(false);
  const [expandedPledgeId, setExpandedPledgeId] = useState<string | null>(null);
  const [likedPledges, setLikedPledges] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('likedPledges');
    if (stored) setLikedPledges(new Set(JSON.parse(stored)));
  }, []);

  if (pledges.length === 0) return null;

  return (
    <section className="px-4 mt-3">
      <div
        className="rounded-2xl p-4 shadow-sm"
        style={{
          backgroundColor: c.cardBg,
          border: theme.isDark ? `1px solid ${c.border}` : 'none'
        }}
      >
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full" style={{ backgroundColor: c.primary }} />
          <span style={{ color: c.primary }}>핵심공약</span>
        </h3>
        <div className="space-y-2">
          {(showAllPledges ? pledges : pledges.slice(0, 5)).map((pledge, idx) => {
            const isExpanded = expandedPledgeId === pledge.id;
            const isLiked = likedPledges.has(pledge.id);
            return (
              <div
                key={pledge.id}
                className="rounded-xl p-3 cursor-pointer transition-all"
                style={{
                  backgroundColor: idx % 2 === 0
                    ? (theme.isDark ? c.cardBgAlt : `${c.primary}08`)
                    : (theme.isDark ? c.border : `${c.primary}04`)
                }}
                onClick={() => setExpandedPledgeId(isExpanded ? null : pledge.id)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: c.primary,
                      color: c.primaryText,
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    {idx + 1}
                  </div>
                  <h4
                    className="flex-1 leading-snug"
                    style={{ fontSize: '15px', fontWeight: 600, color: c.textPrimary }}
                  >
                    {pledge.title}
                  </h4>
                  <ChevronDown
                    size={16}
                    className={`transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                    style={{ color: c.textMuted }}
                  />
                </div>
                {isExpanded && (
                  <div className="mt-2 pl-7">
                    {pledge.description && (
                      <p
                        className="leading-relaxed mb-3"
                        style={{ fontSize: '13px', color: c.textSecondary }}
                      >
                        {pledge.description}
                      </p>
                    )}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (isLiked) return;
                        await supabase.rpc('increment_pledge_likes', { pledge_id: pledge.id });
                        const newLiked = new Set(likedPledges);
                        newLiked.add(pledge.id);
                        setLikedPledges(newLiked);
                        localStorage.setItem('likedPledges', JSON.stringify([...newLiked]));
                        const { data } = await supabase
                          .from('pledges')
                          .select('*')
                          .eq('candidate_id', candidateId)
                          .order('order');
                        if (data) onPledgesUpdate(data);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all"
                      style={isLiked ? {
                        backgroundColor: theme.isDark ? '#7F1D1D' : '#FEF2F2',
                        color: '#EF4444'
                      } : {
                        backgroundColor: c.cardBgAlt,
                        color: c.textMuted
                      }}
                    >
                      <ThumbsUp size={14} className={isLiked ? 'fill-current' : ''} />
                      <span>{pledge.likes_count || 0}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {pledges.length > 5 && (
          <div className="flex justify-end mt-3">
            <button
              onClick={() => setShowAllPledges(!showAllPledges)}
              className="text-xs flex items-center gap-0.5 hover:opacity-80"
              style={{ color: c.textMuted }}
            >
              {showAllPledges ? '접기' : `더보기 (${pledges.length - 5}개)`}
              <ChevronDown
                size={14}
                className={`transition-transform ${showAllPledges ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
