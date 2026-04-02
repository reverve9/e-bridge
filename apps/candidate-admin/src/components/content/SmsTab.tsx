import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Copy, RotateCcw, Check, MessageSquare, ExternalLink, Link2, Loader2, ChevronRight, HelpCircle, Plus, X, Image as ImageIcon, ChevronLeft, ChevronUp, ChevronDown } from 'lucide-react';

// 인라인 마크다운 렌더링: **볼드**, *이탤릭*, ~~취소선~~, [링크](url)
function renderInline(text: string) {
  const parts: (string | JSX.Element)[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2]) parts.push(<strong key={key++} className="font-bold">{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={key++} className="italic">{match[3]}</em>);
    else if (match[4]) parts.push(<del key={key++} className="line-through">{match[4]}</del>);
    else if (match[5] && match[6]) parts.push(
      <a key={key++} href={match[6]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{match[5]}</a>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// 블록 레벨 마크다운 렌더링
function renderMarkdownBlock(text: string) {
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
    // 헤딩
    const h3Match = line.match(/^###\s+(.+)/);
    const h2Match = line.match(/^##\s+(.+)/);
    const h1Match = line.match(/^#\s+(.+)/);
    // 인용문
    const quoteMatch = line.match(/^>\s+(.+)/);
    // 비순서 목록
    const ulMatch = line.match(/^[-*]\s+(.+)/);
    // 순서 목록
    const olMatch = line.match(/^\d+\.\s+(.+)/);

    if (h1Match) { flushList(); elements.push(<p key={key++} className="text-xl font-bold my-1">{renderInline(h1Match[1])}</p>); }
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

// 마크다운 도움말 항목
const MARKDOWN_HELP = [
  { input: '# 제목', result: <span className="text-xl font-bold">제목</span> },
  { input: '## 소제목', result: <span className="text-lg font-bold">소제목</span> },
  { input: '### 작은제목', result: <span className="text-base font-bold">작은제목</span> },
  { input: '**굵게**', result: <span className="font-bold">굵게</span> },
  { input: '*기울임*', result: <span className="italic">기울임</span> },
  { input: '~~취소선~~', result: <span className="line-through">취소선</span> },
  { input: '[링크](URL)', result: <span className="text-blue-600 underline">링크</span> },
  { input: '- 목록', result: <span>• 목록</span> },
  { input: '1. 번호목록', result: <span>1. 번호목록</span> },
  { input: '> 인용문', result: <span className="text-gray-500 italic border-l-2 border-blue-400 pl-2">인용문</span> },
];

// 도움말 모달 컴포넌트
function MarkdownHelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <HelpCircle size={15} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-[420px] max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800">서식 도움말</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-blue-600">
                    <th className="text-left px-6 py-3 font-medium">입력</th>
                    <th className="text-left px-6 py-3 font-medium">결과</th>
                  </tr>
                </thead>
                <tbody>
                  {MARKDOWN_HELP.map((item, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-6 py-3.5 text-sm font-mono text-gray-600">{item.input}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-800">{item.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface Candidate {
  name: string;
  party: string;
  party_code: string;
  candidate_code: string;
  region: string;
  district: string | null;
  photo_url: string | null;
  thumbnail_url: string | null;
  candidate_number: string | null;
  election_name: string | null;
  constituency: string | null;
}

interface Pledge {
  id: string;
  emoji: string;
  title: string;
}

interface SmsTabProps {
  candidateId: string;
}

// 랜딩페이지에 포함할 수 있는 섹션 목록
const LANDING_SECTIONS = [
  { key: 'profile', label: '프로필/학력/경력', emoji: '👤' },
  { key: 'intro', label: '자기소개', emoji: '📝' },
  { key: 'pledges', label: '핵심공약', emoji: '📋' },
  { key: 'gallery', label: '갤러리', emoji: '🖼️' },
  { key: 'feeds', label: '최근 소식', emoji: '📰' },
  { key: 'cheers', label: '응원 메시지', emoji: '💬' },
  { key: 'contact', label: '선거사무소', emoji: '📍' },
] as const;

interface SmsLanding {
  id: number;
  greeting: string | null;
  body: string | null;
  closing: string | null;
  selected_pledge_ids: string[];
  sections: string[];
  slide_images: string[];
  created_at: string;
}

export default function SmsTab({ candidateId }: SmsTabProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [selectedPledgeIds, setSelectedPledgeIds] = useState<Set<string>>(new Set());
  const [greeting, setGreeting] = useState('');
  const [body, setBody] = useState('');
  const [closing, setClosing] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // 콘텐츠 순서 통합 관리 (sms_content, sms_images, 랜딩 섹션 모두 포함)
  const [contentOrder, setContentOrder] = useState<string[]>(['sms_content', 'profile', 'pledges']);
  const [generatingLanding, setGeneratingLanding] = useState(false);
  const [landingUrl, setLandingUrl] = useState<string | null>(null);
  const [landingCopied, setLandingCopied] = useState(false);

  // 이미지 슬라이드 상태
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [uploadingSlide, setUploadingSlide] = useState(false);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const slideFileInputRef = useRef<HTMLInputElement>(null);

  // 파생 상태
  const showSlideImages = contentOrder.includes('sms_images');

  useEffect(() => {
    const fetchData = async () => {
      const [candidateRes, pledgesRes, landingsRes] = await Promise.all([
        supabase.from('candidates').select('name, party, party_code, candidate_code, region, district, photo_url, thumbnail_url, candidate_number, election_name, constituency').eq('id', candidateId).single(),
        supabase.from('pledges').select('id, emoji, title').eq('candidate_id', candidateId).order('order'),
        supabase.from('sms_landings').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false }),
      ]);

      if (candidateRes.data) {
        const c = candidateRes.data;
        setCandidate(c);
        setGreeting(`안녕하세요, ${c.region}${c.district ? ' ' + c.district : ''} 주민 여러분!\n${c.party} ${c.name}입니다.`);
        setClosing(`${c.name}에게 소중한 한 표를 부탁드립니다.\n감사합니다.`);
      }
      if (pledgesRes.data) {
        setPledges(pledgesRes.data);
      }
      if (landingsRes.data && landingsRes.data.length > 0) {
        const latest = landingsRes.data[0];
        if (candidateRes.data) {
          const c = candidateRes.data;
          setLandingUrl(`ebridge.kr/${c.party_code}/${c.candidate_code}/${latest.id}`);
        }
        if (latest.greeting) setGreeting(latest.greeting);
        if (latest.body) setBody(latest.body);
        if (latest.closing) setClosing(latest.closing);
        if (latest.selected_pledge_ids) setSelectedPledgeIds(new Set(latest.selected_pledge_ids));
        if (latest.sections) {
          // 기존 데이터 호환: sms_content가 없으면 맨 앞에 추가
          const sections = latest.sections as string[];
          if (!sections.includes('sms_content')) {
            setContentOrder(['sms_content', ...sections]);
          } else {
            setContentOrder(sections);
          }
        }
        if (latest.slide_images && latest.slide_images.length > 0) {
          setSlideImages(latest.slide_images);
          // sms_images가 contentOrder에 없으면 sms_content 뒤에 추가
          setContentOrder((prev) =>
            prev.includes('sms_images') ? prev : [
              ...prev.slice(0, prev.indexOf('sms_content') + 1),
              'sms_images',
              ...prev.slice(prev.indexOf('sms_content') + 1),
            ]
          );
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [candidateId]);

  const togglePledge = (id: string) => {
    setSelectedPledgeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSection = (key: string) => {
    setContentOrder((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleSlideImages = () => {
    setContentOrder((prev) =>
      prev.includes('sms_images')
        ? prev.filter((k) => k !== 'sms_images')
        : [...prev.slice(0, prev.indexOf('sms_content') + 1), 'sms_images', ...prev.slice(prev.indexOf('sms_content') + 1)]
    );
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setContentOrder((prev) => {
      const next = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= next.length) return prev;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  };

  // 콘텐츠 블록 라벨 맵
  const BLOCK_LABELS: Record<string, { label: string; emoji: string }> = {
    sms_content: { label: '문자 내용', emoji: '💬' },
    sms_images: { label: '이미지 슬라이드', emoji: '🖼️' },
    ...Object.fromEntries(LANDING_SECTIONS.map((s) => [s.key, { label: s.label, emoji: s.emoji }])),
  };

  const handleSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (slideImages.length >= 6) {
      alert('이미지는 최대 6장까지 추가할 수 있습니다.');
      return;
    }

    setUploadingSlide(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `sms-slide-${candidateId}-${Date.now()}.${fileExt}`;
    const filePath = `sms-slides/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('candidates')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('이미지 업로드에 실패했습니다.');
      setUploadingSlide(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('candidates')
      .getPublicUrl(filePath);

    setSlideImages((prev) => [...prev, `${publicUrl}?t=${Date.now()}`]);
    setUploadingSlide(false);
    if (e.target) e.target.value = '';
  };

  const handleRemoveSlide = async (index: number) => {
    const url = slideImages[index];
    const cleanUrl = url.split('?')[0];
    const pathMatch = cleanUrl.match(/sms-slides\/sms-slide-[^/]+$/);
    if (pathMatch) {
      await supabase.storage.from('candidates').remove([pathMatch[0]]);
    }
    setSlideImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewSlideIndex(0);
  };

  const selectedPledges = pledges.filter((p) => selectedPledgeIds.has(p.id));

  const buildFullText = () => {
    const lines: string[] = [];
    lines.push('(선거운동정보)');
    lines.push('');

    if (selectedPledges.length > 0) {
      lines.push('★ 후보자의 약속');
      lines.push(selectedPledges.map((p) => `${p.emoji} ${p.title}`).join(', '));
      lines.push('');
    }

    if (greeting.trim()) {
      lines.push(greeting.trim());
      lines.push('');
    }

    if (body.trim()) {
      lines.push(body.trim());
      lines.push('');
    }

    if (closing.trim()) {
      lines.push(closing.trim());
      lines.push('');
    }

    const linkUrl = landingUrl
      ? `https://${landingUrl}`
      : candidate ? `https://ebridge.kr/${candidate.party_code}/${candidate.candidate_code}` : '';

    if (linkUrl) {
      lines.push(`▶ 더 알아보기: ${linkUrl}`);
    }

    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = buildFullText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedPledgeIds(new Set());
    setBody('');
    setContentOrder(['sms_content', 'profile', 'pledges']);
    setSlideImages([]);
    setPreviewSlideIndex(0);
    if (candidate) {
      setGreeting(`안녕하세요, ${candidate.region}${candidate.district ? ' ' + candidate.district : ''} 주민 여러분!\n${candidate.party} ${candidate.name}입니다.`);
      setClosing(`${candidate.name}에게 소중한 한 표를 부탁드립니다.\n감사합니다.`);
    }
  };

  const handleGenerateLanding = async () => {
    if (!candidate) return;
    setGeneratingLanding(true);

    try {
      // sms_content 보장 + 이전 랜딩 삭제
      const sectionsToSave = contentOrder.includes('sms_content')
        ? contentOrder
        : ['sms_content', ...contentOrder];
      const imagesToSave = contentOrder.includes('sms_images') ? slideImages : [];

      // 이전 랜딩페이지 삭제 (후보자당 1개 유지)
      await supabase.from('sms_landings').delete().eq('candidate_id', candidateId);

      const { data, error } = await supabase
        .from('sms_landings')
        .insert({
          candidate_id: candidateId,
          greeting: greeting.trim() || null,
          body: body.trim() || null,
          closing: closing.trim() || null,
          selected_pledge_ids: [...selectedPledgeIds],
          sections: sectionsToSave,
          slide_images: imagesToSave,
        })
        .select('id')
        .single();

      if (error) throw error;

      const url = `ebridge.kr/${candidate.party_code}/${candidate.candidate_code}/${data.id}`;
      setLandingUrl(url);
    } catch (err) {
      console.error('랜딩페이지 생성 실패:', err);
      alert('랜딩페이지 생성에 실패했습니다.');
    } finally {
      setGeneratingLanding(false);
    }
  };

  const handleCopyLandingUrl = async () => {
    if (!landingUrl) return;
    await navigator.clipboard.writeText(`https://${landingUrl}`);
    setLandingCopied(true);
    setTimeout(() => setLandingCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={22} className="text-blue-600" />
        <h1 className="text-xl font-bold">선거 문자 작성</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ===== 좌측: 작성 폼 ===== */}
        <div className="space-y-6">
          {/* 공약 키워드 선택 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">공약 키워드 선택</label>
            {pledges.length === 0 ? (
              <p className="text-sm text-gray-400">등록된 공약이 없습니다. 내정보 &gt; 공약에서 추가하세요.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {pledges.map((pledge) => {
                  const selected = selectedPledgeIds.has(pledge.id);
                  return (
                    <button
                      key={pledge.id}
                      onClick={() => togglePledge(pledge.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selected
                          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {pledge.emoji} {pledge.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 인사말 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">인사말</label>
              <MarkdownHelpButton />
            </div>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              placeholder="인사말을 입력하세요"
            />
          </div>

          {/* 본문 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">본문</label>
              <MarkdownHelpButton />
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              placeholder="본문 내용을 자유롭게 작성하세요"
            />
          </div>

          {/* 마무리 인사 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">마무리 인사</label>
              <MarkdownHelpButton />
            </div>
            <textarea
              value={closing}
              onChange={(e) => setClosing(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              placeholder="마무리 인사를 입력하세요"
            />
          </div>

          {/* ===== 랜딩페이지 섹션 선택 ===== */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">랜딩페이지 섹션 선택</label>
            <p className="text-xs text-gray-400 mb-3">문자 링크를 클릭했을 때 추가로 보여줄 섹션을 선택하세요</p>
            <div className="flex flex-wrap gap-2">
              {LANDING_SECTIONS.map((section) => {
                const selected = contentOrder.includes(section.key);
                return (
                  <button
                    key={section.key}
                    onClick={() => toggleSection(section.key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selected
                        ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {section.emoji} {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 이미지 슬라이드 (최대 6장) — 문자 전용 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">이미지 슬라이드</label>
              <button
                type="button"
                onClick={toggleSlideImages}
                className={`relative w-10 h-5 rounded-full transition-colors ${showSlideImages ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${showSlideImages ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">문자 랜딩페이지에만 표시되는 이미지 슬라이드입니다</p>

            {showSlideImages && (
              <>
                <input
                  ref={slideFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSlideUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-end mb-2">
                  <span className="text-xs text-gray-400">{slideImages.length} / 6</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {slideImages.map((url, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 group">
                      <img src={url} alt={`슬라이드 ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveSlide(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                      <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">{i + 1}</span>
                    </div>
                  ))}
                  {slideImages.length < 6 && (
                    <button
                      onClick={() => slideFileInputRef.current?.click()}
                      disabled={uploadingSlide}
                      className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex flex-col items-center justify-center gap-1 text-gray-400"
                    >
                      {uploadingSlide ? (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Plus size={20} />
                          <span className="text-xs">추가</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ===== 콘텐츠 순서 관리 ===== */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">콘텐츠 순서</label>
            <p className="text-xs text-gray-400 mb-3">랜딩페이지에 표시될 순서를 변경할 수 있습니다</p>
            <div className="space-y-1.5">
              {contentOrder.map((key, index) => {
                const block = BLOCK_LABELS[key];
                if (!block) return null;
                return (
                  <div key={key} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl">
                    <span className="text-sm w-5 text-center text-gray-400 font-medium">{index + 1}</span>
                    <span className="text-sm">{block.emoji}</span>
                    <span className="text-sm font-medium text-gray-700 flex-1">{block.label}</span>
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => moveBlock(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-20 transition-colors"
                      >
                        <ChevronUp size={16} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => moveBlock(index, 'down')}
                        disabled={index === contentOrder.length - 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-20 transition-colors"
                      >
                        <ChevronDown size={16} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 랜딩페이지 생성 버튼 */}
          <button
            onClick={handleGenerateLanding}
            disabled={generatingLanding}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingLanding ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Link2 size={18} />
                랜딩페이지 생성
              </>
            )}
          </button>

          {/* 생성된 랜딩페이지 URL */}
          {landingUrl && (
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
              <label className="block text-sm font-semibold text-indigo-700 mb-2">랜딩페이지 URL</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white rounded-xl text-sm text-gray-700 border border-indigo-200">
                  <ExternalLink size={16} className="text-indigo-500 flex-shrink-0" />
                  <span className="truncate">https://{landingUrl}</span>
                </div>
                <button
                  onClick={handleCopyLandingUrl}
                  className="flex items-center gap-1.5 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex-shrink-0"
                >
                  {landingCopied ? <Check size={16} /> : <Copy size={16} />}
                  {landingCopied ? '완료' : '복사'}
                </button>
              </div>
              <p className="text-xs text-indigo-500 mt-2">이 URL이 문자의 "더 알아보기" 링크에 자동으로 반영됩니다</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? '복사 완료!' : '전체 문자 복사'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-5 py-3.5 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={18} />
              초기화
            </button>
          </div>
        </div>

        {/* ===== 우측: 실시간 랜딩페이지 미리보기 ===== */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <label className="block text-sm font-semibold text-gray-700 mb-3">랜딩페이지 미리보기</label>
          <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl mx-auto" style={{ width: '375px' }}>
            {/* 노치 */}
            <div className="flex justify-center mb-1">
              <div className="w-28 h-5 bg-gray-900 rounded-b-2xl" />
            </div>
            <div className="rounded-[2rem] overflow-y-auto bg-gray-50" style={{ height: '680px' }}>
              {/* 후보자 정보 */}
              <div className="bg-white px-4 py-4">
                <div className="flex items-center gap-3">
                  {(candidate?.thumbnail_url || candidate?.photo_url) ? (
                    <img
                      src={candidate.thumbnail_url || candidate.photo_url!}
                      alt={candidate.name}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-blue-600">{candidate?.name?.[0]}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400">
                      {candidate?.election_name} {candidate?.constituency}
                    </p>
                    <p className="text-lg font-black">
                      {candidate?.candidate_number} {candidate?.name}
                    </p>
                    <p className="text-xs font-medium text-blue-600">{candidate?.party}</p>
                  </div>
                </div>
              </div>

              {/* 콘텐츠 순서대로 렌더링 */}
              {contentOrder.map((key) => {
                if (key === 'sms_content') {
                  const fullText = [greeting.trim(), body.trim(), closing.trim()].filter(Boolean).join('\n');
                  const totalLines = fullText.split('\n').length;
                  const needsTruncate = totalLines > 15;
                  const showFull = previewExpanded || !needsTruncate;
                  const truncated = (() => {
                    if (showFull) return { greeting: greeting.trim(), body: body.trim(), closing: closing.trim() };
                    let remaining = 15;
                    const result = { greeting: '', body: '', closing: '' };
                    for (const [k, val] of [['greeting', greeting.trim()], ['body', body.trim()], ['closing', closing.trim()]] as const) {
                      if (!val) continue;
                      if (remaining <= 0) break;
                      const lines = val.split('\n');
                      if (lines.length <= remaining) { result[k] = val; remaining -= lines.length; }
                      else { result[k] = lines.slice(0, remaining).join('\n') + '...'; remaining = 0; }
                    }
                    return result;
                  })();
                  return (
                    <div key="sms_content" className="px-4 mt-2">
                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="bg-gray-100 rounded-lg px-3 py-2 mb-4">
                          <span className="text-xs text-gray-500">(선거운동정보)</span>
                        </div>
                        {selectedPledges.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-bold text-gray-800 mb-2">★ 후보자의 약속</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedPledges.map((p) => (
                                <span key={p.id} className="inline-block bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                  {p.emoji} {p.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {truncated.greeting && <p className="text-sm text-gray-700 mb-3 leading-relaxed">{renderMarkdownBlock(truncated.greeting)}</p>}
                        {truncated.body && <p className="text-sm text-gray-700 mb-3 leading-relaxed">{renderMarkdownBlock(truncated.body)}</p>}
                        {truncated.closing && <p className="text-sm text-gray-700 leading-relaxed">{renderMarkdownBlock(truncated.closing)}</p>}
                        {needsTruncate && (
                          <button onClick={() => setPreviewExpanded(!previewExpanded)} className="mt-3 text-sm font-medium text-blue-600">
                            {previewExpanded ? '접기' : '더보기'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                if (key === 'sms_images' && slideImages.length > 0) {
                  return (
                    <div key="sms_images" className="px-4 mt-2">
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="relative">
                          <img src={slideImages[previewSlideIndex]} alt={`슬라이드 ${previewSlideIndex + 1}`} className="w-full h-auto" />
                          {slideImages.length > 1 && (
                            <>
                              <button onClick={() => setPreviewSlideIndex((prev) => (prev - 1 + slideImages.length) % slideImages.length)} className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/40 text-white rounded-full flex items-center justify-center"><ChevronLeft size={14} /></button>
                              <button onClick={() => setPreviewSlideIndex((prev) => (prev + 1) % slideImages.length)} className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/40 text-white rounded-full flex items-center justify-center"><ChevronRight size={14} /></button>
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {slideImages.map((_, i) => (<div key={i} className={`w-1.5 h-1.5 rounded-full ${i === previewSlideIndex ? 'bg-white' : 'bg-white/50'}`} />))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // 랜딩 섹션 placeholder
                const section = LANDING_SECTIONS.find(s => s.key === key);
                if (!section) return null;
                return (
                  <div key={key} className="px-4 mt-2">
                    <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-2">
                      <span className="text-sm">{section.emoji}</span>
                      <span className="text-sm font-medium text-gray-600">{section.label}</span>
                      <span className="ml-auto text-xs text-gray-300">섹션 영역</span>
                    </div>
                  </div>
                );
              })}

              {/* 전체 페이지 보기 */}
              <div className="px-4 mt-4 pb-4">
                <div className="bg-blue-600 text-white rounded-xl py-3 text-center text-sm font-bold flex items-center justify-center gap-1">
                  전체 페이지 보기
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
