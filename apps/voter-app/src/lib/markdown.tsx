export function renderInline(text: string) {
  const parts: (string | JSX.Element)[] = [];
  const regex = /(!\[([^\]]*)\]\(([^)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2] !== undefined && match[3]) {
      parts.push(<img key={key++} src={match[3]} alt={match[2]} className="w-full rounded-lg my-2" />);
    } else if (match[4]) parts.push(<strong key={key++} className="font-bold">{match[4]}</strong>);
    else if (match[5]) parts.push(<em key={key++} className="italic">{match[5]}</em>);
    else if (match[6]) parts.push(<del key={key++} className="line-through">{match[6]}</del>);
    else if (match[7] && match[8]) parts.push(
      <a key={key++} href={match[8]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{match[7]}</a>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export function renderMarkdownBlock(text: string) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: { type: 'ul' | 'ol'; text: string }[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    const type = listItems[0].type;
    const Tag = type === 'ol' ? 'ol' : 'ul';
    elements.push(
      <Tag key={key++} className={type === 'ol' ? 'list-decimal pl-5 my-1' : 'list-disc pl-5 my-1'}>
        {listItems.map((item, i) => <li key={i} className="text-sm">{renderInline(item.text)}</li>)}
      </Tag>
    );
    listItems = [];
  };

  for (const line of lines) {
    const h3Match = line.match(/^###\s+(.+)/);
    const h2Match = line.match(/^##\s+(.+)/);
    const h1Match = line.match(/^#\s+(.+)/);
    const quoteMatch = line.match(/^>\s+(.+)/);
    const ulMatch = line.match(/^[-*]\s+(.+)/);
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

    if (imgMatch) { flushList(); elements.push(<img key={key++} src={imgMatch[2]} alt={imgMatch[1]} className="w-full rounded-lg my-2" />); }
    else if (h1Match) { flushList(); elements.push(<p key={key++} className="text-xl font-bold my-1">{renderInline(h1Match[1])}</p>); }
    else if (h2Match) { flushList(); elements.push(<p key={key++} className="text-lg font-bold my-1">{renderInline(h2Match[1])}</p>); }
    else if (h3Match) { flushList(); elements.push(<p key={key++} className="text-base font-bold my-1">{renderInline(h3Match[1])}</p>); }
    else if (quoteMatch) { flushList(); elements.push(<div key={key++} className="border-l-3 border-blue-400 pl-3 my-1 text-gray-500 italic">{renderInline(quoteMatch[1])}</div>); }
    else if (ulMatch) { listItems.push({ type: 'ul', text: ulMatch[1] }); }
    else if (olMatch) { listItems.push({ type: 'ol', text: olMatch[1] }); }
    else if (line.trim() === '') { flushList(); elements.push(<br key={key++} />); }
    else { flushList(); elements.push(<span key={key++}>{renderInline(line)}<br /></span>); }
  }
  flushList();
  return elements;
}

export function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function getVideoThumbnail(url: string, thumbnailUrl: string | null): string | null {
  if (thumbnailUrl) return thumbnailUrl;
  const ytId = getYoutubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
  return null;
}

export function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function maskName(name: string) {
  if (!name || name.trim() === '') return '익명';
  const trimmed = name.trim();
  if (trimmed.length === 1) return trimmed;
  if (trimmed.length === 2) return trimmed[0] + '*';
  const limited = trimmed.length > 5 ? trimmed.slice(0, 5) : trimmed;
  return limited[0] + '*'.repeat(limited.length - 2) + limited[limited.length - 1];
}
