import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Send,
  MapPin,
  Phone,
  Mail,
  ThumbsUp,
  Play,
  Image,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import NotFoundPage from './NotFoundPage';
import {
  Theme,
  ThemeMode,
  ThemeColors,
  createTheme,
  getPartyCode,
} from '@e-bridge/ui';

// ========================================
// 마크다운 렌더링
// ========================================
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
    const h3Match = line.match(/^###\s+(.+)/);
    const h2Match = line.match(/^##\s+(.+)/);
    const h1Match = line.match(/^#\s+(.+)/);
    const quoteMatch = line.match(/^>\s+(.+)/);
    const ulMatch = line.match(/^[-*]\s+(.+)/);
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

// ========================================
// 테마 헬퍼
// ========================================
function getTheme(partyName: string, themeMode: string | null): Theme {
  const partyCode = getPartyCode(partyName);
  const mode: ThemeMode = themeMode === 'dark' ? 'dark' : 'classic';
  return createTheme(partyCode, mode);
}

// ========================================
// 타입 정의
// ========================================
interface CandidateExt {
  id: string;
  name: string;
  party: string;
  party_code: string;
  party_logo_url: string | null;
  election_type: string;
  election_name: string | null;
  region: string;
  district: string | null;
  constituency: string | null;
  constituency_detail: string | null;
  candidate_number: string | null;
  photo_url: string | null;
  thumbnail_url: string | null;
  gallery_images: string[] | null;
  slogan: string | null;
  tagline: string | null;
  candidate_code: string;
  created_at: string;
  show_election_info: boolean;
  show_candidate_info: boolean;
  signature_url: string | null;
  contact_address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  is_active: boolean;
  theme_mode: string | null;
}

interface Profile {
  education: any[];
  career: any[];
  introduction: string | null;
}

interface Pledge {
  id: string;
  emoji: string;
  title: string;
  description: string | null;
  likes_count: number;
}

interface Feed {
  id: string;
  type: string;
  title: string;
  content: string | null;
  summary: string | null;
  source_url: string | null;
  likes_count: number;
  published_at: string;
}

interface Cheer {
  id: string;
  name: string;
  message: string;
  likes_count: number;
  created_at: string;
}

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
}

interface SmsLanding {
  id: number;
  candidate_id: string;
  greeting: string | null;
  body: string | null;
  closing: string | null;
  selected_pledge_ids: string[];
  sections: string[];
}

// ========================================
// 유틸 함수
// ========================================
function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getVideoThumbnail(url: string, thumbnailUrl: string | null): string | null {
  if (thumbnailUrl) return thumbnailUrl;
  const ytId = getYoutubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
  return null;
}

// ========================================
// FeedItem 서브 컴포넌트
// ========================================
function FeedItemComponent({
  item,
  theme,
  formatTime,
}: {
  item: Feed;
  theme: Theme;
  formatTime: (dateStr: string) => string;
}) {
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
            <p
              className="text-sm mt-2 whitespace-pre-line leading-relaxed"
              style={{ color: c.textSecondary }}
            >
              {item.content}
            </p>
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
        !item.summary &&
        item.content && (
          <p
            className="text-sm mt-1 truncate"
            style={{ color: c.textMuted }}
          >
            {item.content}
          </p>
        )
      )}
    </div>
  );
}

// ========================================
// 메인 컴포넌트
// ========================================
export default function SmsLandingPage() {
  const { partyCode, candidateCode, landingId } = useParams<{
    partyCode: string;
    candidateCode: string;
    landingId: string;
  }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<CandidateExt | null>(null);
  const [landing, setLanding] = useState<SmsLanding | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [cheers, setCheers] = useState<Cheer[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  // UI 상태
  const [profileTab, setProfileTab] = useState<'profile' | 'intro'>('profile');
  const [showAllProfile, setShowAllProfile] = useState(false);
  const [showAllIntro, setShowAllIntro] = useState(false);
  const [showAllPledges, setShowAllPledges] = useState(false);
  const [expandedPledgeId, setExpandedPledgeId] = useState<string | null>(null);
  const [likedPledges, setLikedPledges] = useState<Set<string>>(new Set());
  const [feedDisplayCount, setFeedDisplayCount] = useState(3);
  const [cheerStartIndex, setCheerStartIndex] = useState(0);
  const [cheerName, setCheerName] = useState('');
  const [cheerMessage, setCheerMessage] = useState('');
  const [cheerSubmitting, setCheerSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('likedPledges');
    if (stored) setLikedPledges(new Set(JSON.parse(stored)));
  }, []);

  // 응원 메시지 롤링
  useEffect(() => {
    if (cheers.length <= 5) return;
    const interval = setInterval(() => {
      setCheerStartIndex((prev) => (prev + 1 >= cheers.length ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [cheers.length]);

  useEffect(() => {
    const fetchData = async () => {
      if (!partyCode || !candidateCode || !landingId) return;

      // 1. 후보자 조회
      const { data: candidateData } = await supabase
        .from('candidates')
        .select('*')
        .eq('party_code', partyCode)
        .eq('candidate_code', candidateCode)
        .maybeSingle();

      if (!candidateData) {
        setLoading(false);
        return;
      }
      setCandidate(candidateData);

      // 2. 랜딩 데이터 조회
      const { data: landingData } = await supabase
        .from('sms_landings')
        .select('*')
        .eq('id', parseInt(landingId))
        .eq('candidate_id', candidateData.id)
        .maybeSingle();

      if (!landingData) {
        setLoading(false);
        return;
      }
      setLanding(landingData);

      const sections = new Set(landingData.sections || []);

      // 3. 섹션에 따라 필요한 데이터만 로드
      const fetchProfile = async () => {
        if (!sections.has('profile') && !sections.has('intro')) return;
        const res = await supabase.from('profiles').select('*').eq('candidate_id', candidateData.id).maybeSingle();
        if (res.data) setProfile(res.data);
      };
      const fetchPledges = async () => {
        if (!sections.has('pledges')) return;
        const res = await supabase.from('pledges').select('*').eq('candidate_id', candidateData.id).order('order');
        if (res.data) setPledges(res.data);
      };
      const fetchFeeds = async () => {
        if (!sections.has('feeds')) return;
        const res = await supabase.from('feeds').select('*').eq('candidate_id', candidateData.id).order('published_at', { ascending: false });
        if (res.data) setFeeds(res.data);
      };
      const fetchCheers = async () => {
        if (!sections.has('cheers')) return;
        const res = await supabase.from('cheers').select('*').eq('candidate_id', candidateData.id).eq('is_visible', true).order('created_at', { ascending: false });
        if (res.data) setCheers(res.data);
      };
      const fetchGallery = async () => {
        if (!sections.has('gallery')) return;
        const res = await supabase.from('gallery').select('*').eq('candidate_id', candidateData.id).eq('is_visible', true).order('sort_order');
        if (res.data) setGallery(res.data);
      };

      await Promise.all([fetchProfile(), fetchPledges(), fetchFeeds(), fetchCheers(), fetchGallery()]);

      // 방문 기록
      const visitKey = `visited_landing_${landingData.id}`;
      const lastVisit = localStorage.getItem(visitKey);
      const now = Date.now();
      if (!lastVisit || now - parseInt(lastVisit) > 3600000) {
        await supabase.from('page_visits').insert({ candidate_id: candidateData.id });
        localStorage.setItem(visitKey, now.toString());
      }

      setLoading(false);
    };

    fetchData();
  }, [partyCode, candidateCode, landingId]);

  // ========================================
  // 헬퍼 함수
  // ========================================
  const formatTime = (dateStr: string) => {
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
  };

  const maskName = (name: string) => {
    if (!name || name.trim() === '') return '익명';
    const trimmed = name.trim();
    if (trimmed.length === 1) return trimmed;
    if (trimmed.length === 2) return trimmed[0] + '*';
    const limited = trimmed.length > 5 ? trimmed.slice(0, 5) : trimmed;
    return limited[0] + '*'.repeat(limited.length - 2) + limited[limited.length - 1];
  };

  const handleCheerSubmit = async () => {
    if (!cheerMessage.trim() || !candidate) return;
    setCheerSubmitting(true);
    const displayName = cheerName.trim() ? maskName(cheerName) : '익명';
    await supabase.from('cheers').insert({
      candidate_id: candidate.id,
      name: displayName,
      message: cheerMessage,
    });
    setCheerName('');
    setCheerMessage('');
    setCheerSubmitting(false);
    const { data } = await supabase
      .from('cheers')
      .select('*')
      .eq('candidate_id', candidate.id)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });
    if (data) setCheers(data);
  };

  // ========================================
  // 로딩 / 404
  // ========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!candidate || !landing) return <NotFoundPage />;

  const theme = getTheme(candidate.party, candidate.theme_mode);
  const c = theme.colors;
  const sections = landing.sections || [];

  // 선택된 공약만 필터
  const selectedPledgeIds = new Set(landing.selected_pledge_ids || []);
  const selectedPledges = pledges.filter((p) => selectedPledgeIds.has(p.id));
  const displayPledges = selectedPledges.length > 0 ? selectedPledges : pledges;

  // 프로필 데이터
  const educationList = profile?.education || [];
  const careerList = profile?.career || [];
  const totalProfileItems = educationList.length + careerList.length;

  const fullPageUrl = `/${candidate.party_code}/${candidate.candidate_code}`;

  // ========================================
  // 렌더링
  // ========================================
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: c.background }}>
      {/* ========== 후보자 정보 ========== */}
      <section className="px-4 py-4" style={{ backgroundColor: c.cardBg }}>
        <div className="flex items-center gap-4">
          {/* 프로필 이미지 */}
          {(candidate.thumbnail_url || candidate.photo_url) ? (
            <img
              src={candidate.thumbnail_url || candidate.photo_url!}
              alt={candidate.name}
              className="w-20 h-20 rounded-full object-cover flex-shrink-0"
              style={{ border: `3px solid ${c.primary}` }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: c.primaryLight, border: `3px solid ${c.primary}` }}
            >
              <span className="text-2xl font-bold" style={{ color: c.primary }}>
                {candidate.name[0]}
              </span>
            </div>
          )}
          <div>
            <p
              className="text-sm"
              style={{ color: c.textMuted }}
            >
              {candidate.election_name} {candidate.constituency}
            </p>
            <p
              style={{
                fontSize: '22px',
                fontWeight: 900,
                fontFamily: "'S-CoreDream', sans-serif",
                color: c.textPrimary,
              }}
            >
              {candidate.candidate_number} {candidate.name}
            </p>
            <p className="text-sm font-medium" style={{ color: c.primary }}>
              {candidate.party}
            </p>
          </div>
        </div>
      </section>

      {/* ========== 문자 내용 카드 ========== */}
      <section className="px-4 mt-3">
        <div
          className="rounded-2xl p-5 shadow-sm"
          style={{
            backgroundColor: c.cardBg,
            border: theme.isDark ? `1px solid ${c.border}` : 'none',
          }}
        >
          {/* 선거운동정보 */}
          <div
            className="rounded-lg px-3 py-2 mb-4"
            style={{ backgroundColor: c.cardBgAlt }}
          >
            <span className="text-xs" style={{ color: c.textMuted }}>
              (선거운동정보)
            </span>
          </div>

          {/* 공약 키워드 태그칩 */}
          {selectedPledges.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-bold mb-2" style={{ color: c.textPrimary }}>
                ★ 후보자의 약속
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedPledges.map((p) => (
                  <span
                    key={p.id}
                    className="inline-block text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ backgroundColor: c.primaryLight, color: c.primary }}
                  >
                    {p.emoji} {p.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 인사말 */}
          {landing.greeting && (
            <p
              className="text-sm mb-3 leading-relaxed"
              style={{ color: c.textSecondary }}
            >
              {renderMarkdownBlock(landing.greeting)}
            </p>
          )}

          {/* 본문 */}
          {landing.body && (
            <p
              className="text-sm mb-3 leading-relaxed"
              style={{ color: c.textSecondary }}
            >
              {renderMarkdownBlock(landing.body)}
            </p>
          )}

          {/* 마무리 */}
          {landing.closing && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: c.textSecondary }}
            >
              {renderMarkdownBlock(landing.closing)}
            </p>
          )}
        </div>
      </section>

      {/* ========== 동적 섹션 렌더링 ========== */}
      {sections.map((sectionKey) => {
        switch (sectionKey) {
          case 'profile':
            if (totalProfileItems === 0) return null;
            return (
              <section key="profile" className="px-4 mt-3">
                <div className="flex">
                  <button
                    onClick={() => { setProfileTab('profile'); setShowAllProfile(false); setShowAllIntro(false); }}
                    className="px-5 py-1.5 font-bold rounded-t-lg transition-colors"
                    style={profileTab === 'profile'
                      ? { backgroundColor: c.cardBg, color: c.primary, letterSpacing: '0.05em' }
                      : { backgroundColor: c.cardBgAlt, color: c.textMuted, letterSpacing: '0.05em' }
                    }
                  >
                    프로필
                  </button>
                  {sections.includes('intro') && profile?.introduction && (
                    <button
                      onClick={() => { setProfileTab('intro'); setShowAllProfile(false); setShowAllIntro(false); }}
                      className="px-5 py-1.5 font-bold rounded-t-lg transition-colors"
                      style={profileTab === 'intro'
                        ? { backgroundColor: c.cardBg, color: c.primary, letterSpacing: '0.05em' }
                        : { backgroundColor: c.cardBgAlt, color: c.textMuted, letterSpacing: '0.05em' }
                      }
                    >
                      인사말
                    </button>
                  )}
                </div>
                <div
                  className="rounded-b-2xl rounded-tr-2xl p-4 shadow-sm"
                  style={{
                    backgroundColor: c.cardBg,
                    border: theme.isDark ? `1px solid ${c.border}` : 'none',
                  }}
                >
                  {profileTab === 'profile' ? (
                    <>
                      {educationList.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold mb-2" style={{ color: c.textMuted }}>학력</h4>
                          <ul className="space-y-1">
                            {(showAllProfile ? educationList : educationList.slice(0, 2)).map((edu: any, idx: number) => (
                              <li key={`edu-${idx}`} className="text-sm" style={{ color: c.textSecondary }}>
                                • {edu.school} {edu.major && `(${edu.major})`} {edu.note && `- ${edu.note}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {careerList.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold mb-2" style={{ color: c.textMuted }}>주요 경력</h4>
                          <ul className="space-y-1.5">
                            {(showAllProfile ? careerList : careerList.slice(0, 2)).map((career: any, idx: number) => (
                              <li key={`career-${idx}`} className="flex items-start gap-2 text-sm">
                                <span
                                  className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                                  style={career.is_current ? {
                                    backgroundColor: c.primaryLight,
                                    color: c.primary,
                                  } : {
                                    backgroundColor: c.cardBgAlt,
                                    color: c.textMuted,
                                  }}
                                >
                                  {career.is_current ? '現' : '前'}
                                </span>
                                <span style={{ color: c.textSecondary }}>{career.title}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(educationList.length > 2 || careerList.length > 2) && (
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() => setShowAllProfile(!showAllProfile)}
                            className="text-xs flex items-center gap-0.5 hover:opacity-80"
                            style={{ color: c.textMuted }}
                          >
                            {showAllProfile ? '접기' : '더보기'}
                            <ChevronDown size={14} className={`transition-transform ${showAllProfile ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    profile?.introduction && (
                      <div className="text-sm leading-relaxed" style={{ color: c.textSecondary }}>
                        {(() => {
                          const intro = profile.introduction;
                          const truncatedIntro = intro.length > 200 ? intro.slice(0, 200) + '...' : intro;
                          return (
                            <>
                              <p className={showAllIntro ? 'whitespace-pre-line' : ''}>
                                <span
                                  className="float-left mr-1.5 flex items-center justify-center"
                                  style={{
                                    backgroundColor: c.primary,
                                    color: c.primaryText,
                                    fontSize: '1.5rem',
                                    fontWeight: 800,
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '4px',
                                    fontFamily: "'S-CoreDream', sans-serif",
                                  }}
                                >
                                  {intro[0]}
                                </span>
                                {showAllIntro ? intro.slice(1) : truncatedIntro.slice(1)}
                              </p>
                              {showAllIntro && (
                                <div className="flex items-center justify-center gap-2 mt-4 clear-both">
                                  <span className="text-sm italic" style={{ color: c.textSecondary }}>
                                    {candidate.name} 올림
                                  </span>
                                  {candidate.signature_url && (
                                    <img src={candidate.signature_url} alt="싸인" className="h-8 object-contain" />
                                  )}
                                </div>
                              )}
                              {intro.length > 200 && (
                                <div className="flex justify-end mt-3 clear-both">
                                  <button
                                    onClick={() => setShowAllIntro(!showAllIntro)}
                                    className="text-xs flex items-center gap-0.5 hover:opacity-80"
                                    style={{ color: c.textMuted }}
                                  >
                                    {showAllIntro ? '접기' : '더보기'}
                                    <ChevronDown size={14} className={`transition-transform ${showAllIntro ? 'rotate-180' : ''}`} />
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )
                  )}
                </div>
              </section>
            );

          case 'intro':
            // intro는 profile 섹션과 탭으로 합쳐서 처리 (profile이 없을 때만 단독 표시)
            if (sections.includes('profile')) return null;
            if (!profile?.introduction) return null;
            return (
              <section key="intro" className="px-4 mt-3">
                <div
                  className="rounded-2xl p-4 shadow-sm"
                  style={{
                    backgroundColor: c.cardBg,
                    border: theme.isDark ? `1px solid ${c.border}` : 'none',
                  }}
                >
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full" style={{ backgroundColor: c.primary }} />
                    <span style={{ color: c.primary }}>인사말</span>
                  </h3>
                  <div className="text-sm leading-relaxed" style={{ color: c.textSecondary }}>
                    <p className="whitespace-pre-line">{profile.introduction}</p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <span className="text-sm italic" style={{ color: c.textSecondary }}>
                        {candidate.name} 올림
                      </span>
                      {candidate.signature_url && (
                        <img src={candidate.signature_url} alt="싸인" className="h-8 object-contain" />
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'pledges':
            if (displayPledges.length === 0) return null;
            return (
              <section key="pledges" className="px-4 mt-3">
                <div
                  className="rounded-2xl p-4 shadow-sm"
                  style={{
                    backgroundColor: c.cardBg,
                    border: theme.isDark ? `1px solid ${c.border}` : 'none',
                  }}
                >
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full" style={{ backgroundColor: c.primary }} />
                    <span style={{ color: c.primary }}>핵심공약</span>
                  </h3>
                  <div className="space-y-2">
                    {(showAllPledges ? displayPledges : displayPledges.slice(0, 5)).map((pledge, idx) => {
                      const isExpanded = expandedPledgeId === pledge.id;
                      const isLiked = likedPledges.has(pledge.id);
                      return (
                        <div
                          key={pledge.id}
                          className="rounded-xl p-3 cursor-pointer transition-all"
                          style={{
                            backgroundColor: idx % 2 === 0
                              ? (theme.isDark ? c.cardBgAlt : `${c.primary}08`)
                              : (theme.isDark ? c.border : `${c.primary}04`),
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
                                fontWeight: 600,
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
                                    .eq('candidate_id', candidate.id)
                                    .order('order');
                                  if (data) setPledges(data);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all"
                                style={isLiked ? {
                                  backgroundColor: theme.isDark ? '#7F1D1D' : '#FEF2F2',
                                  color: '#EF4444',
                                } : {
                                  backgroundColor: c.cardBgAlt,
                                  color: c.textMuted,
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
                  {displayPledges.length > 5 && (
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => setShowAllPledges(!showAllPledges)}
                        className="text-xs flex items-center gap-0.5 hover:opacity-80"
                        style={{ color: c.textMuted }}
                      >
                        {showAllPledges ? '접기' : `더보기 (${displayPledges.length - 5}개)`}
                        <ChevronDown size={14} className={`transition-transform ${showAllPledges ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>
              </section>
            );

          case 'feeds':
            return (
              <section key="feeds" className="px-4 mt-3">
                <div
                  className="rounded-2xl p-4 shadow-sm"
                  style={{
                    backgroundColor: c.cardBg,
                    border: theme.isDark ? `1px solid ${c.border}` : 'none',
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
                          <FeedItemComponent
                            key={item.id}
                            item={item}
                            theme={theme}
                            formatTime={formatTime}
                          />
                        ))}
                        {feeds.length > feedDisplayCount && (
                          <button
                            onClick={() => setFeedDisplayCount((prev) => prev + 5)}
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

          case 'cheers':
            return (
              <section key="cheers" className="px-4 mt-3">
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
                    <span className="text-xs" style={{ color: c.textMuted }}>
                      {cheers.length}개
                    </span>
                  </div>
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
                            className="flex items-center gap-2 h-9"
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
                                onClick={async () => {
                                  await supabase.rpc('increment_cheer_likes', { cheer_id: cheer.id });
                                  const { data } = await supabase
                                    .from('cheers')
                                    .select('*')
                                    .eq('candidate_id', candidate.id)
                                    .eq('is_visible', true)
                                    .order('created_at', { ascending: false });
                                  if (data) setCheers(data);
                                }}
                                className="flex items-center gap-0.5 hover:text-red-500"
                                style={{ color: c.textMuted }}
                              >
                                <Heart size={12} />
                                <span className="text-xs">{cheer.likes_count || 0}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 응원 메시지 작성 */}
                  <div
                    className="mt-3 pt-3"
                    style={{ borderTop: `1px solid ${c.borderLight}` }}
                  >
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={cheerName}
                        onChange={(e) => setCheerName(e.target.value)}
                        placeholder="이름 (선택)"
                        className="w-24 px-3 py-2 rounded-lg text-sm outline-none"
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
                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
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
                        className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                        style={{ backgroundColor: c.primary, color: c.primaryText }}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'gallery':
            if (gallery.length === 0) return null;
            return (
              <section key="gallery" className="px-4 mt-3">
                <div
                  className="rounded-2xl p-4 shadow-sm"
                  style={{
                    backgroundColor: c.cardBg,
                    border: theme.isDark ? `1px solid ${c.border}` : 'none',
                  }}
                >
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full" style={{ backgroundColor: c.primary }} />
                    <span style={{ color: c.primary }}>갤러리</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {gallery.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="relative rounded-lg overflow-hidden cursor-pointer"
                        style={{ paddingBottom: '100%' }}
                        onClick={() => setSelectedGalleryItem(item)}
                      >
                        <img
                          src={item.type === 'image' ? item.url : (getVideoThumbnail(item.url, item.thumbnail_url) || '')}
                          alt={item.caption || ''}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {item.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play size={16} className="text-white" fill="white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {gallery.length > 6 && (
                    <p className="text-center text-xs mt-2" style={{ color: c.textMuted }}>
                      +{gallery.length - 6}장 더보기
                    </p>
                  )}
                </div>
              </section>
            );

          case 'contact':
            if (!candidate.contact_address && !candidate.contact_phone && !candidate.contact_email) return null;
            return (
              <section key="contact" className="px-4 mt-3">
                <div
                  className="rounded-2xl p-4 shadow-sm"
                  style={{
                    backgroundColor: c.cardBg,
                    border: theme.isDark ? `1px solid ${c.border}` : 'none',
                  }}
                >
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full" style={{ backgroundColor: c.primary }} />
                    <span style={{ color: c.primary }}>선거운동 연락사무소</span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    {candidate.contact_address && (
                      <p className="flex items-start gap-2" style={{ color: c.textSecondary }}>
                        <MapPin size={16} className="flex-shrink-0 mt-0.5" style={{ color: c.textMuted }} />
                        <span>{candidate.contact_address}</span>
                      </p>
                    )}
                    {candidate.contact_phone && (
                      <p className="flex items-center gap-2" style={{ color: c.textSecondary }}>
                        <Phone size={16} className="flex-shrink-0" style={{ color: c.textMuted }} />
                        <a href={`tel:${candidate.contact_phone.replace(/-/g, '')}`} style={{ color: c.primary }}>
                          {candidate.contact_phone}
                        </a>
                      </p>
                    )}
                    {candidate.contact_email && (
                      <p className="flex items-center gap-2" style={{ color: c.textSecondary }}>
                        <Mail size={16} className="flex-shrink-0" style={{ color: c.textMuted }} />
                        <a href={`mailto:${candidate.contact_email}`} style={{ color: c.primary }}>
                          {candidate.contact_email}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}

      {/* ========== 갤러리 뷰어 모달 (스와이프 지원) ========== */}
      {selectedGalleryItem && (() => {
        const currentIdx = gallery.findIndex(g => g.id === selectedGalleryItem.id);
        const hasPrev = currentIdx > 0;
        const hasNext = currentIdx < gallery.length - 1;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
            onClick={() => setSelectedGalleryItem(null)}
          >
            <button
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white"
              onClick={() => setSelectedGalleryItem(null)}
            >
              <X size={28} />
            </button>

            {/* 카운터 */}
            <div className="absolute top-4 left-4 z-10 text-white/70 text-sm font-medium">
              {currentIdx + 1} / {gallery.length}
            </div>

            {/* 이전 버튼 */}
            {hasPrev && (
              <button
                className="absolute left-2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white/80 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setSelectedGalleryItem(gallery[currentIdx - 1]); }}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {/* 다음 버튼 */}
            {hasNext && (
              <button
                className="absolute right-2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white/80 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setSelectedGalleryItem(gallery[currentIdx + 1]); }}
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* 콘텐츠 (스와이프) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg mx-4"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                (e.currentTarget as any)._touchStartX = touch.clientX;
              }}
              onTouchEnd={(e) => {
                const startX = (e.currentTarget as any)._touchStartX;
                if (startX == null) return;
                const endX = e.changedTouches[0].clientX;
                const diff = endX - startX;
                if (diff < -50 && hasNext) setSelectedGalleryItem(gallery[currentIdx + 1]);
                else if (diff > 50 && hasPrev) setSelectedGalleryItem(gallery[currentIdx - 1]);
              }}
            >
              {selectedGalleryItem.type === 'image' ? (
                <img
                  src={selectedGalleryItem.url}
                  alt={selectedGalleryItem.caption || '갤러리 이미지'}
                  className="w-full rounded-xl select-none pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  {getYoutubeId(selectedGalleryItem.url) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYoutubeId(selectedGalleryItem.url)}?autoplay=1`}
                      className="absolute inset-0 w-full h-full rounded-xl"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={selectedGalleryItem.url}
                      className="absolute inset-0 w-full h-full rounded-xl object-contain"
                      controls
                      autoPlay
                    />
                  )}
                </div>
              )}
              {selectedGalleryItem.caption && (
                <p className="text-white/80 text-sm text-center mt-3">
                  {selectedGalleryItem.caption}
                </p>
              )}
            </div>
          </div>
        );
      })()}

      {/* ========== 전체 페이지 보기 CTA ========== */}
      <section className="px-4 mt-6 pb-6">
        <button
          onClick={() => { window.scrollTo(0, 0); navigate(fullPageUrl); }}
          className="w-full rounded-2xl py-4 font-bold text-center transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: c.primary,
            color: c.primaryText,
          }}
        >
          전체 페이지 보기
          <ChevronRight size={20} />
        </button>
      </section>

    </div>
  );
}
