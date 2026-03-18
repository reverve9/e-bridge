import { useState } from 'react';
import type { Theme } from '@e-bridge/ui';
import type { Feed } from '@/lib/types';
import { renderMarkdownBlock } from '@/lib/markdown';
import { formatTime } from '@/lib/markdown';

function FeedItemComponent({ item, theme }: { item: Feed; theme: Theme }) {
  const [expanded, setExpanded] = useState(false);
  const c = theme.colors;

  return (
    <div
      className="last:border-0 pb-3 last:pb-0 cursor-pointer"
      style={{ borderBottom: `1px solid ${c.borderLight}` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
          style={{ backgroundColor: c.primaryLight, color: c.primary }}
        >
          {item.type === 'activity' ? '활동' : item.type === 'news' ? '뉴스' : '공지'}
        </span>
        <h4
          className="font-semibold flex-1 truncate"
          style={{ color: c.textPrimary }}
        >
          {item.title}
        </h4>
        <span
          className="text-xs flex-shrink-0"
          style={{ color: c.textMuted }}
        >
          {formatTime(item.published_at)}
        </span>
      </div>
      {item.summary && (
        <p
          className={`text-sm font-medium italic mt-1 pl-3 ${expanded ? '' : 'truncate'}`}
          style={{ color: c.primary }}
        >
          "{item.summary}"
        </p>
      )}
      {expanded ? (
        <>
          {item.content && (
            <div className="text-sm mt-2 leading-relaxed" style={{ color: c.textSecondary }}>
              {renderMarkdownBlock(item.content)}
            </div>
          )}
          {item.source_url && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-block mt-2 text-xs font-medium"
              style={{ color: c.primary }}
            >
              원문 보기 →
            </a>
          )}
        </>
      ) : (
        !item.summary && item.content && (
          <p className="text-sm mt-1 truncate" style={{ color: c.textMuted }}>
            {item.content}
          </p>
        )
      )}
    </div>
  );
}

interface FeedsSectionProps {
  theme: Theme;
  feeds: Feed[];
}

export default function FeedsSection({ theme, feeds }: FeedsSectionProps) {
  const c = theme.colors;
  const [feedDisplayCount, setFeedDisplayCount] = useState(3);

  return (
    <section className="px-4 mt-4">
      <div
        className="rounded-2xl p-4 shadow-sm"
        style={{
          backgroundColor: c.cardBg,
          border: theme.isDark ? `1px solid ${c.border}` : 'none'
        }}
      >
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full" style={{ backgroundColor: c.primary }} />
          <span style={{ color: c.primary }}>최근 소식</span>
        </h3>
        <div className="space-y-3">
          {feeds.length === 0 ? (
            <p className="text-center py-4" style={{ color: c.textMuted }}>
              등록된 소식이 없습니다
            </p>
          ) : (
            <>
              {feeds.slice(0, feedDisplayCount).map((item) => (
                <FeedItemComponent key={item.id} item={item} theme={theme} />
              ))}
              {feeds.length > feedDisplayCount && (
                <button
                  onClick={() => setFeedDisplayCount(prev => prev + 5)}
                  className="w-full py-3 text-sm rounded-xl hover:opacity-90"
                  style={{ backgroundColor: c.cardBgAlt, color: c.textMuted }}
                >
                  소식 더보기 ({feeds.length - feedDisplayCount}개)
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
