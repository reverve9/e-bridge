import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown,
  ChevronLeft,
  MessageCircle,
  Heart,
  Send,
  Newspaper,
  User,
  Camera,
  X,
  Share2,
  MapPin,
  Phone,
  Mail,
  Users,
  ChevronRight,
  ThumbsUp,
  Image,
  Play,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import NotFoundPage from './NotFoundPage';
import { 
  Theme, 
  ThemeMode, 
  PartyCode, 
  ThemeColors,
  createTheme, 
  getPartyCode 
} from '@e-bridge/ui';

// ========================================
// 테마 헬퍼 함수
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
  gallery_images: string[] | null;
  slogan: string | null;
  tagline: string | null;
  candidate_code: string;
  created_at: string;
  show_election_info: boolean;
  show_candidate_info: boolean;
  sns_youtube: string | null;
  sns_instagram: string | null;
  sns_facebook: string | null;
  sns_twitter: string | null;
  sns_blog: string | null;
  sns_kakao: string | null;
  sns_order: string[] | null;
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

// ========================================
// 마크다운 렌더링
// ========================================
function renderInline(text: string) {
  const parts: (string | JSX.Element)[] = [];
  const regex = /(!\[([^\]]*)\]\(([^)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2] !== undefined && match[3]) {
      // ![alt](url) 이미지
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
// 서브 컴포넌트
// ========================================

// FeedItem 컴포넌트
function FeedItemComponent({ 
  item, 
  theme,
  formatTime 
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
      {/* 첫째줄: 배지 + 제목 + 시간 */}
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

      {/* 요약문 (부제 스타일) - 항상 표시 */}
      {item.summary && (
        <p 
          className={`text-sm font-medium italic mt-1 pl-3 ${expanded ? '' : 'truncate'}`} 
          style={{ color: c.primary }}
        >
          "{item.summary}"
        </p>
      )}

      {/* 본문 - 펼침 상태에서만 표시 */}
      {expanded ? (
        <>
          {item.content && (
            <div
              className="text-sm mt-2 leading-relaxed"
              style={{ color: c.textSecondary }}
            >
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

// SNS 아이콘 컴포넌트
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const BlogIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.273 12.845 7.376 24H0l8.899-11.155L0 0h7.377l8.896 12.845zm0 0L24 0h-7.377l-5.753 7.158 5.403 5.687z"/>
  </svg>
);

const KakaoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.907 8.06l1.47-1.424a.472.472 0 0 0-.656-.678l-1.928 1.866V9.282a.472.472 0 0 0-.944 0v2.557a.471.471 0 0 0 0 .222v2.218a.472.472 0 0 0 .944 0v-1.58l.478-.464 1.495 2.278a.472.472 0 0 0 .788-.518l-1.647-2.435zM8.438 9.28a.472.472 0 0 0-.943 0v4.995a.472.472 0 0 0 .943 0V9.28zm-2.592 4.027l-.005-.002a.47.47 0 0 0-.122-.1l-.002-.001a.469.469 0 0 0-.136-.051l-.003-.001H4.28a.472.472 0 0 0 0 .944h.769l-1.442 2.06a.47.47 0 0 0-.1.291v.012a.47.47 0 0 0 .471.46h1.943a.472.472 0 0 0 0-.943H4.86l1.456-2.082a.47.47 0 0 0 .093-.28V13.6a.47.47 0 0 0-.063-.293zm8.303-.074h-1.138V9.28a.472.472 0 0 0-.943 0v4.413c0 .26.21.472.471.472h1.61a.472.472 0 0 0 0-.944v.012z"/>
  </svg>
);

const SNS_CONFIG: Record<string, { Icon: any; color: string; label: string }> = {
  youtube: { Icon: YoutubeIcon, color: '#FF0000', label: 'YouTube' },
  instagram: { Icon: InstagramIcon, color: '#E4405F', label: 'Instagram' },
  facebook: { Icon: FacebookIcon, color: '#1877F2', label: 'Facebook' },
  twitter: { Icon: TwitterIcon, color: '#000000', label: 'X (Twitter)' },
  blog: { Icon: BlogIcon, color: '#03C75A', label: 'Blog' },
  kakao: { Icon: KakaoIcon, color: '#FEE500', label: 'KakaoTalk' },
};

// ========================================
// 메인 컴포넌트
// ========================================
export default function CandidatePage() {
  const { partyCode, candidateCode } = useParams<{ partyCode: string; candidateCode: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateExt | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [cheers, setCheers] = useState<Cheer[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheerModal, setShowCheerModal] = useState(false);
  const [showCheerCompleteModal, setShowCheerCompleteModal] = useState(false);
  const [selectedCheer, setSelectedCheer] = useState<Cheer | null>(null);
  const [cheerName, setCheerName] = useState('');
  const [cheerMessage, setCheerMessage] = useState('');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [galleryTab, setGalleryTab] = useState<'image' | 'video'>('image');
  const [showGalleryAll, setShowGalleryAll] = useState(false);
  const [galleryFeaturedIndex, setGalleryFeaturedIndex] = useState(0);

  // 프로필 더보기 상태
  const [showAllProfile, setShowAllProfile] = useState(false);
  const [showAllIntro, setShowAllIntro] = useState(false);
  const [showAllPledges, setShowAllPledges] = useState(false);
  const [showAllFeeds, setShowAllFeeds] = useState(false);
  const [feedDisplayCount, setFeedDisplayCount] = useState(3);
  const [cheerStartIndex, setCheerStartIndex] = useState(0);
  const [expandedPledgeId, setExpandedPledgeId] = useState<string | null>(null);
  const [likedPledges, setLikedPledges] = useState<Set<string>>(new Set());
  
  // 페이지 진입 시 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [partyCode, candidateCode]);

  // localStorage에서 좋아요한 공약 불러오기
  useEffect(() => {
    const stored = localStorage.getItem('likedPledges');
    if (stored) {
      setLikedPledges(new Set(JSON.parse(stored)));
    }
  }, []);
  
  // 프로필/인사말 탭 상태
  const [profileTab, setProfileTab] = useState<'profile' | 'intro'>('profile');
  
  // 갤러리 슬라이드 상태
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // 내 선거구 확인 드롭다운
  const [showConstituencyInfo, setShowConstituencyInfo] = useState(false);
  
  // 같은 당 후보 응원하기
  const [showPartyCandidatesModal, setShowPartyCandidatesModal] = useState(false);
  const [partyCandidates, setPartyCandidates] = useState<CandidateExt[]>([]);
  
  // 자동 슬라이드 (5초마다)
  useEffect(() => {
    if (!candidate) return;
    
    const galleryImages = [
      candidate.photo_url,
      ...(candidate.gallery_images || [])
    ].filter(Boolean);
    
    if (galleryImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [candidate]);

  // 갤러리 대표 이미지 랜덤 로테이션 (5초)
  useEffect(() => {
    const currentItems = galleryTab === 'image'
      ? gallery.filter(g => g.type === 'image')
      : gallery.filter(g => g.type === 'video');
    if (currentItems.length <= 1) return;

    const interval = setInterval(() => {
      setGalleryFeaturedIndex((prev) => {
        let next;
        do { next = Math.floor(Math.random() * currentItems.length); } while (next === prev);
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [gallery, galleryTab]);

  // 탭 전환 시 인덱스 리셋
  useEffect(() => {
    setGalleryFeaturedIndex(0);
  }, [galleryTab]);

  // 응원 메시지 롤링 (4초마다, 6개 이상일 때만)
  useEffect(() => {
    if (cheers.length <= 5) return;
    
    const interval = setInterval(() => {
      setCheerStartIndex((prev) => {
        const next = prev + 1;
        if (next >= cheers.length) {
          return 0;
        }
        return next;
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, [cheers.length]);

  useEffect(() => {
    const fetchData = async () => {
      if (!partyCode || !candidateCode) return;

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

      // 방문 기록 저장 (1시간 중복 방지)
      const visitKey = `visited_${candidateData.id}`;
      const lastVisit = localStorage.getItem(visitKey);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      if (!lastVisit || now - parseInt(lastVisit) > oneHour) {
        const { error: visitError } = await supabase
          .from('page_visits')
          .insert({ candidate_id: candidateData.id });
        
        if (!visitError) {
          localStorage.setItem(visitKey, now.toString());
        }
      }

      const [profileRes, pledgesRes, feedsRes, cheersRes, galleryRes, partyCandidatesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('candidate_id', candidateData.id).maybeSingle(),
        supabase.from('pledges').select('*').eq('candidate_id', candidateData.id).order('order'),
        supabase.from('feeds').select('*').eq('candidate_id', candidateData.id).order('published_at', { ascending: false }),
        supabase.from('cheers').select('*').eq('candidate_id', candidateData.id).eq('is_visible', true).order('created_at', { ascending: false }),
        supabase.from('gallery').select('*').eq('candidate_id', candidateData.id).eq('is_visible', true).order('sort_order'),
        supabase.from('candidates').select('*').eq('party_code', candidateData.party_code).neq('id', candidateData.id).eq('is_active', true).order('name'),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      else setProfile(null);
      if (pledgesRes.data) setPledges(pledgesRes.data);
      else setPledges([]);
      if (feedsRes.data) setFeeds(feedsRes.data);
      else setFeeds([]);
      if (cheersRes.data) setCheers(cheersRes.data);
      else setCheers([]);
      if (galleryRes.data) setGallery(galleryRes.data);
      else setGallery([]);
      if (partyCandidatesRes.data) setPartyCandidates(partyCandidatesRes.data);

      setLoading(false);
    };

    fetchData();
  }, [partyCode, candidateCode]);

  // 같은 당 후보 조회
  const fetchPartyCandidates = async () => {
    if (!candidate) return;
    
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .eq('party_code', candidate.party_code)
      .neq('id', candidate.id)
      .eq('is_active', true)
      .order('name');
    
    if (data) setPartyCandidates(data);
    setShowPartyCandidatesModal(true);
  };

  // 이름 마스킹 함수 (김민석 → 김*석)
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

    const displayName = cheerName.trim() ? maskName(cheerName) : '익명';

    await supabase.from('cheers').insert({
      candidate_id: candidate.id,
      name: displayName,
      message: cheerMessage,
    });

    setCheerName('');
    setCheerMessage('');
    setShowCheerModal(false);
    setShowCheerCompleteModal(true);
    
    const { data } = await supabase
      .from('cheers')
      .select('*')
      .eq('candidate_id', candidate.id)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });
    if (data) setCheers(data);
  };

  // 테마 가져오기 (candidate 로드 후)
  const theme = candidate ? getTheme(candidate.party, candidate.theme_mode) : getTheme('무소속', null);
  const c = theme.colors; // shorthand

  // ========================================
  // 로딩 상태
  // ========================================
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: c.cardBg }}
      >
        <div 
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: c.border, borderTopColor: c.textPrimary }}
        />
      </div>
    );
  }

  // ========================================
  // 후보 없음
  // ========================================
  if (!candidate) {
    return <NotFoundPage />;
  }

  // ========================================
  // 비활성 후보자 랜딩 페이지
  // ========================================
  if (candidate.is_active === false) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: c.background }}
      >
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: c.border }}
        >
          <User size={40} style={{ color: c.textMuted }} />
        </div>
        <h1 
          className="text-xl font-bold mb-2"
          style={{ color: c.textSecondary }}
        >
          페이지 준비 중입니다
        </h1>
        <p 
          className="text-center mb-6"
          style={{ color: c.textMuted }}
        >
          {candidate.name} 후보의 페이지가<br />
          아직 공개되지 않았습니다.
        </p>
        <p 
          className="text-sm"
          style={{ color: c.textMuted }}
        >
          곧 만나요! 👋
        </p>
      </div>
    );
  }

  // ========================================
  // 헬퍼 함수들
  // ========================================
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    if (hours < 48) return '어제';
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const parseNumber = (num: string | null) => {
    if (!num) return { digit: '', text: '' };
    const match = num.match(/^([\d\-]+)(.*)$/);
    if (match) {
      return { digit: match[1], text: match[2] };
    }
    return { digit: num, text: '' };
  };
  
  const { digit: numberDigit, text: numberText } = parseNumber(candidate.candidate_number);

  // 표시 옵션
  const showElectionInfo = candidate.show_election_info !== false;
  const showCandidateInfo = candidate.show_candidate_info !== false;

  // 프로필 데이터
  const educationList = profile?.education || [];
  const careerList = profile?.career || [];
  const totalProfileItems = educationList.length + careerList.length;

  // SNS 데이터
  const snsUrls: Record<string, string | null> = {
    youtube: candidate.sns_youtube,
    instagram: candidate.sns_instagram,
    facebook: candidate.sns_facebook,
    twitter: candidate.sns_twitter,
    blog: candidate.sns_blog,
    kakao: candidate.sns_kakao,
  };
  
  const defaultOrder = ['youtube', 'instagram', 'facebook', 'twitter', 'blog', 'kakao'];
  const snsOrder = candidate.sns_order || defaultOrder;
  
  const activeSns = snsOrder
    .filter(key => snsUrls[key])
    .map(key => ({
      key,
      url: snsUrls[key]!,
      ...SNS_CONFIG[key]
    }));

  // ========================================
  // 렌더링
  // ========================================
  return (
    <div 
      className="min-h-screen relative"
      style={{ backgroundColor: c.background }}
    >
      {/* ========== 상단 헤더 ========== */}
      <header style={{ background: theme.header.background }}>
        <div className="flex items-center justify-between px-4 py-[15px]">
          {theme.header.logoUrl ? (
            <img
              src={theme.header.logoUrl}
              alt={candidate.party}
              className="h-[30px] w-auto object-contain"
            />
          ) : candidate.party_logo_url ? (
            <img
              src={candidate.party_logo_url}
              alt={candidate.party}
              className="h-[20px] w-auto object-contain brightness-0 invert"
            />
          ) : (
            <span
              className="text-sm font-bold"
              style={{ color: theme.header.textColor }}
            >
              {candidate.party}
            </span>
          )}
          {/* SNS 아이콘 */}
          {activeSns.length > 0 && (
            <div className="flex gap-3">
              {activeSns.map(({ key, url, Icon }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.header.iconBgColor }}
                >
                  <Icon className="w-4 h-4" style={{ color: theme.header.textColor }} />
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ========== 히어로 섹션 (16:9 슬라이드) ========== */}
      <section 
        className="relative"
        style={{ backgroundColor: c.cardBg }}
      >
        {(() => {
          const galleryImages = [
            candidate.photo_url,
            ...(candidate.gallery_images || [])
          ].filter(Boolean) as string[];
          
          return (
            <div 
              className="relative w-full overflow-hidden" 
              style={{ paddingBottom: '56.25%' }}
            >
              {galleryImages.length > 0 ? (
                galleryImages.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`${candidate.name} ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))
              ) : (
                <div 
                  className="absolute inset-0 w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${c.primary}40 0%, ${c.primary}20 100%)` }}
                >
                  <span className="text-8xl font-bold" style={{ color: c.textInverse, opacity: 0.5 }}>
                    {candidate.name[0]}
                  </span>
                </div>
              )}

              {/* QR코드 (우측 하단) - 항상 흰색 배경 */}
              <div className="absolute bottom-2 right-5 z-10">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`https://ebridge.kr/${candidate.party_code}/${candidate.candidate_code}`)}`}
                  alt="QR코드"
                  className="w-[72px] h-[72px] rounded-lg p-1 shadow-lg"
                  style={{ backgroundColor: '#FFFFFF' }}
                />
              </div>

            </div>
          );
        })()}
      </section>

      {/* ========== 슬로건 바 ========== */}
      {candidate.slogan && (
        <section
          className="px-4 py-3"
          style={{ backgroundColor: c.primary }}
        >
          <p
            className="font-score text-center"
            style={{ fontSize: '16px', fontWeight: 700, color: c.primaryText }}
          >
            {candidate.slogan}
          </p>
        </section>
      )}

      {/* ========== 태그라인 ========== */}
      {candidate.tagline && (
        <section 
          className="px-6 py-4"
          style={{ backgroundColor: c.cardBg }}
        >
          <p 
            className="text-sm"
            style={{ color: c.textSecondary }}
          >
            {candidate.tagline}
          </p>
        </section>
      )}

      {/* ========== 프로필/인사말 탭 카드 ========== */}
      {(profile?.introduction || totalProfileItems > 0) && (
        <section className="px-4 mt-3">
          {/* 탭 버튼 (파일철 스타일) */}
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
          </div>
          
          {/* 카드 본문 */}
          <div 
            className="rounded-b-2xl rounded-tr-2xl p-4 shadow-sm"
            style={{ 
              backgroundColor: c.cardBg,
              border: theme.isDark ? `1px solid ${c.border}` : 'none'
            }}
          >
            {profileTab === 'profile' ? (
              <>
                {/* 학력 */}
                {educationList.length > 0 && (
                  <div className="mb-3">
                    <h4 
                      className="text-xs font-semibold mb-2"
                      style={{ color: c.textMuted }}
                    >
                      학력
                    </h4>
                    <ul className="space-y-1">
                      {(showAllProfile ? educationList : educationList.slice(0, 2)).map((edu: any, idx: number) => (
                        <li 
                          key={`edu-${idx}`} 
                          className="text-sm"
                          style={{ color: c.textSecondary }}
                        >
                          • {edu.school} {edu.major && `(${edu.major})`} {edu.note && `- ${edu.note}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 경력 */}
                {careerList.length > 0 && (
                  <div>
                    <h4 
                      className="text-xs font-semibold mb-2"
                      style={{ color: c.textMuted }}
                    >
                      주요 경력
                    </h4>
                    <ul className="space-y-1.5">
                      {(showAllProfile ? careerList : careerList.slice(0, 2)).map((career: any, idx: number) => (
                        <li key={`career-${idx}`} className="flex items-start gap-2 text-sm">
                          <span 
                            className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                            style={career.is_current ? {
                              backgroundColor: c.primaryLight,
                              color: c.primary
                            } : {
                              backgroundColor: c.cardBgAlt,
                              color: c.textMuted
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
                
                {/* 프로필 더보기/접기 */}
                {(educationList.length > 2 || careerList.length > 2) && (
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => setShowAllProfile(!showAllProfile)}
                      className="text-xs flex items-center gap-0.5 hover:opacity-80"
                      style={{ color: c.textMuted }}
                    >
                      {showAllProfile ? '접기' : '더보기'}
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform ${showAllProfile ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* 인사말 탭 */
              profile?.introduction && (
                <div 
                  className="text-sm leading-relaxed"
                  style={{ color: c.textSecondary }}
                >
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
                              fontFamily: "'S-CoreDream', sans-serif" 
                            }}
                          >
                            {intro[0]}
                          </span>
                          {showAllIntro ? intro.slice(1) : truncatedIntro.slice(1)}
                        </p>
                        
                        {/* 이름 + 싸인 (펼쳤을 때만) */}
                        {showAllIntro && (
                          <div className="flex items-center justify-center gap-2 mt-4 clear-both">
                            <span 
                              className="text-sm italic"
                              style={{ color: c.textSecondary }}
                            >
                              {candidate.name} 올림
                            </span>
                            {candidate.signature_url && (
                              <img 
                                src={candidate.signature_url} 
                                alt="싸인" 
                                className="h-8 object-contain"
                              />
                            )}
                          </div>
                        )}
                        
                        {/* 인사말 더보기/접기 */}
                        {intro.length > 200 && (
                          <div className="flex justify-end mt-3 clear-both">
                            <button
                              onClick={() => setShowAllIntro(!showAllIntro)}
                              className="text-xs flex items-center gap-0.5 hover:opacity-80"
                              style={{ color: c.textMuted }}
                            >
                              {showAllIntro ? '접기' : '더보기'}
                              <ChevronDown 
                                size={14} 
                                className={`transition-transform ${showAllIntro ? 'rotate-180' : ''}`}
                              />
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
      )}

      {/* ========== 핵심공약 섹션 ========== */}
      {pledges.length > 0 && (
        <section className="px-4 mt-3">
          <div 
            className="rounded-2xl p-4 shadow-sm"
            style={{ 
              backgroundColor: c.cardBg,
              border: theme.isDark ? `1px solid ${c.border}` : 'none'
            }}
          >
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span 
                className="w-1 h-5 rounded-full" 
                style={{ backgroundColor: c.primary }} 
              />
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
                    
                    {/* 펼쳐진 상태 */}
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
      )}

      {/* ========== 최근 소식 섹션 ========== */}
      <section className="px-4 mt-4">
        <div 
          className="rounded-2xl p-4 shadow-sm"
          style={{ 
            backgroundColor: c.cardBg,
            border: theme.isDark ? `1px solid ${c.border}` : 'none'
          }}
        >
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span 
              className="w-1 h-5 rounded-full" 
              style={{ backgroundColor: c.primary }} 
            />
            <span style={{ color: c.primary }}>최근 소식</span>
          </h3>
          <div className="space-y-3">
            {feeds.length === 0 ? (
              <p 
                className="text-center py-4"
                style={{ color: c.textMuted }}
              >
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
                    onClick={() => setFeedDisplayCount(prev => prev + 5)}
                    className="w-full py-3 text-sm rounded-xl hover:opacity-90"
                    style={{ 
                      backgroundColor: c.cardBgAlt, 
                      color: c.textMuted 
                    }}
                  >
                    소식 더보기 ({feeds.length - feedDisplayCount}개)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========== 갤러리 ========== */}
      {gallery.length > 0 && (() => {
        const images = gallery.filter(g => g.type === 'image');
        const videos = gallery.filter(g => g.type === 'video');
        const currentItems = galleryTab === 'image' ? images : videos;
        const GRID_MAX = 4;
        const featIdx = galleryFeaturedIndex % currentItems.length;
        const featured = currentItems[featIdx];
        const otherItems = currentItems.filter((_, i) => i !== featIdx);
        const gridItems = otherItems.slice(0, GRID_MAX);
        const remaining = otherItems.length - GRID_MAX;

        return (
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
              <span
                className="w-1 h-5 rounded-full"
                style={{ backgroundColor: c.primary }}
              />
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
            <p
              className="text-center py-6 text-sm"
              style={{ color: c.textMuted }}
            >
              {galleryTab === 'image' ? '등록된 사진이 없습니다' : '등록된 영상이 없습니다'}
            </p>
          ) : (
            <div className="space-y-1">
              {/* 첫번째 크게 */}
              <div
                className="relative overflow-hidden cursor-pointer"
                style={{ paddingBottom: galleryTab === 'video' ? '56.25%' : '66%' }}
                onClick={() => setSelectedGalleryItem(featured)}
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
                            setShowGalleryAll(true);
                          } else {
                            setSelectedGalleryItem(item);
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
        );
      })()}

      {/* ========== 응원 메시지 ========== */}
      <section className="px-4 pb-6 mt-3">
        <div 
          className="rounded-2xl p-4 shadow-sm"
          style={{ 
            backgroundColor: c.cardBg,
            border: theme.isDark ? `1px solid ${c.border}` : 'none'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <span 
                className="w-1 h-5 rounded-full" 
                style={{ backgroundColor: c.primary }} 
              />
              <span style={{ color: c.primary }}>응원 메시지</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCheerModal(true)}
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: c.primaryLight, color: c.primary }}
              >
                + 남기기
              </button>
              <span 
                className="text-xs"
                style={{ color: c.textMuted }}
              >
                {cheers.length}개
              </span>
            </div>
          </div>
          <div 
            className="relative overflow-hidden" 
            style={{ height: cheers.length === 0 ? 'auto' : `${Math.min(cheers.length, 5) * 36}px` }}
          >
            {cheers.length === 0 ? (
              <p 
                className="text-center py-4"
                style={{ color: c.textMuted }}
              >
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
                    className="flex items-center gap-2 h-9 cursor-pointer"
                    onClick={() => setSelectedCheer(cheer)}
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
                      <span 
                        className="text-xs"
                        style={{ color: c.textMuted }}
                      >
                        {formatTime(cheer.created_at)}
                      </span>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
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
        </div>
      </section>

      {/* ========== 같은 당 후보 응원하기 ========== */}
      {partyCandidates.length > 0 && (
      <section className="px-4 mt-3">
        <button
          onClick={() => setShowPartyCandidatesModal(true)}
          className="w-full rounded-2xl p-4 shadow-sm flex items-center justify-between"
          style={{ 
            backgroundColor: c.cardBg,
            border: theme.isDark ? `1px solid ${c.border}` : 'none'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: c.primaryLight }}
            >
              <Users size={20} style={{ color: c.primary }} />
            </div>
            <span 
              className="font-medium"
              style={{ color: c.textPrimary }}
            >
              {candidate.party} 후보 응원하러 가기
            </span>
          </div>
          <ChevronRight size={20} style={{ color: c.textMuted }} />
        </button>
      </section>
      )}

      {/* ========== D-Day + 내 선거구 확인 (임시 숨김) ========== */}

      {/* ========== 연락사무소 푸터 ========== */}
      {(candidate.contact_address || candidate.contact_phone || candidate.contact_email) && (
        <footer 
          className="px-6 py-6 mt-6"
          style={{ backgroundColor: c.cardBgAlt }}
        >
          <h3 
            className="font-bold mb-3 text-sm"
            style={{ color: c.textPrimary }}
          >
            선거운동 연락사무소
          </h3>
          <div className="space-y-2 text-sm">
            {candidate.contact_address && (
              <p 
                className="flex items-start gap-2"
                style={{ color: c.textSecondary }}
              >
                <MapPin size={16} className="flex-shrink-0 mt-0.5" style={{ color: c.textMuted }} />
                <span>{candidate.contact_address}</span>
              </p>
            )}
            {candidate.contact_phone && (
              <p 
                className="flex items-center gap-2"
                style={{ color: c.textSecondary }}
              >
                <Phone size={16} className="flex-shrink-0" style={{ color: c.textMuted }} />
                <a 
                  href={`tel:${candidate.contact_phone.replace(/-/g, '')}`} 
                  style={{ color: c.primary }}
                >
                  {candidate.contact_phone}
                </a>
              </p>
            )}
            {candidate.contact_email && (
              <p 
                className="flex items-center gap-2"
                style={{ color: c.textSecondary }}
              >
                <Mail size={16} className="flex-shrink-0" style={{ color: c.textMuted }} />
                <a 
                  href={`mailto:${candidate.contact_email}`} 
                  style={{ color: c.primary }}
                >
                  {candidate.contact_email}
                </a>
              </p>
            )}
          </div>
        </footer>
      )}

      {/* ========== 면책 문구 + 카피라이트 ========== */}
      <footer 
        className="px-6 py-6"
        style={{ backgroundColor: c.border }}
      >
        <p 
          className="text-xs leading-relaxed mb-4"
          style={{ color: c.textMuted }}
        >
          본 페이지에 게시된 모든 선거 관련 정보(공약, 프로필, 이미지 등)는 해당 후보자 또는 선거캠프가 직접 작성·제공한 것입니다. (주)브릿지나인는 플랫폼 기술 제공 및 운영만을 담당하며, 게시된 내용의 정확성·적법성에 대한 책임은 해당 후보자에게 있습니다.
        </p>
        <p 
          className="text-xs text-center"
          style={{ color: c.textMuted }}
        >
          © 2026 (주)브릿지나인. All rights reserved.
        </p>
      </footer>

      <div className="h-24" />

      {/* ========== 플로팅 버튼들 ========== */}
      <div className="fixed bottom-6 right-4 flex flex-col gap-2" style={{ maxWidth: '430px' }}>
        {/* 공유 버튼 */}
        <button 
          onClick={() => {
            const shareUrl = `https://ebridge.kr/${candidate.party_code}/${candidate.candidate_code}`;
            if (navigator.share) {
              navigator.share({
                title: `${candidate.candidate_number} ${candidate.name}`,
                text: candidate.slogan ? `${candidate.slogan}\n${shareUrl}` : shareUrl,
                url: shareUrl,
              });
            } else {
              navigator.clipboard.writeText(shareUrl);
              alert('링크가 복사되었습니다!');
            }
          }}
          className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
          style={{ backgroundColor: c.primary, color: c.primaryText }}
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* ========== 응원 모달 ========== */}
      <AnimatePresence>
        {showCheerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: c.overlay }}
            onClick={() => setShowCheerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ backgroundColor: c.cardBg }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="font-bold text-lg"
                  style={{ color: c.textPrimary }}
                >
                  응원 메시지
                </h3>
                <button onClick={() => setShowCheerModal(false)}>
                  <X size={24} style={{ color: c.textMuted }} />
                </button>
              </div>
              <input
                type="text"
                value={cheerName}
                onChange={(e) => setCheerName(e.target.value)}
                placeholder="이름 (비우면 익명)"
                className="w-full p-4 rounded-xl mb-3 focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: c.cardBgAlt, 
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`
                }}
              />
              <textarea
                value={cheerMessage}
                onChange={(e) => setCheerMessage(e.target.value)}
                placeholder="후보자에게 응원 메시지를 남겨주세요!"
                className="w-full h-28 p-4 rounded-xl resize-none focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: c.cardBgAlt, 
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`
                }}
              />
              <p 
                className="text-xs mt-2 mb-3"
                style={{ color: c.textMuted }}
              >
                * 응원 외 메시지는 비공개 처리될 수 있습니다.
              </p>
              <button 
                onClick={handleCheerSubmit}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: c.primary, color: c.primaryText }}
              >
                <Send size={18} />
                응원 보내기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== 같은 당 후보 모달 ========== */}
      <AnimatePresence>
        {showPartyCandidatesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: c.overlay }}
            onClick={() => setShowPartyCandidatesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl max-h-[70vh] overflow-hidden flex flex-col"
              style={{ backgroundColor: c.cardBg }}
            >
              <div 
                className="flex items-center justify-between p-4"
                style={{ borderBottom: `1px solid ${c.border}` }}
              >
                <h3 
                  className="font-bold text-lg"
                  style={{ color: c.textPrimary }}
                >
                  {candidate.party} 후보
                </h3>
                <button onClick={() => setShowPartyCandidatesModal(false)}>
                  <X size={24} style={{ color: c.textMuted }} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                {partyCandidates.length === 0 ? (
                  <p 
                    className="text-center py-8"
                    style={{ color: c.textMuted }}
                  >
                    다른 후보가 없습니다
                  </p>
                ) : (
                  <div className="space-y-3">
                    {partyCandidates.map((cand) => (
                      <button
                        key={cand.id}
                        onClick={() => {
                          setShowPartyCandidatesModal(false);
                          window.open(`/${cand.party_code}/${cand.candidate_code}`, '_blank');
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:opacity-90"
                        style={{ backgroundColor: c.cardBgAlt }}
                      >
                        {(cand as any).thumbnail_url || cand.photo_url ? (
                          <img 
                            src={(cand as any).thumbnail_url || cand.photo_url} 
                            alt={cand.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                            style={{ backgroundColor: c.primary, color: c.primaryText }}
                          >
                            {cand.name[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <p 
                            className="font-medium"
                            style={{ color: c.textPrimary }}
                          >
                            {cand.candidate_number} {cand.name}
                          </p>
                          <p 
                            className="text-sm"
                            style={{ color: c.textMuted }}
                          >
                            {cand.region} {cand.district} {cand.constituency}
                          </p>
                        </div>
                        <ChevronRight size={18} style={{ color: c.textMuted }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== 응원 완료 + 공유 모달 ========== */}
      <AnimatePresence>
        {showCheerCompleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: c.overlay }}
            onClick={() => setShowCheerCompleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ backgroundColor: c.cardBg }}
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: c.primaryLight }}
              >
                <Heart size={32} style={{ color: c.primary }} fill={c.primary} />
              </div>
              <h3 
                className="font-bold text-xl mb-2"
                style={{ color: c.textPrimary }}
              >
                응원 완료! 🎉
              </h3>
              <p 
                className="mb-6"
                style={{ color: c.textMuted }}
              >
                {candidate.name} 후보에게 응원이 전달되었어요.<br />
                친구들에게도 알려주세요!
              </p>
              
              <button
                onClick={() => {
                  const shareUrl = `https://ebridge.kr/${candidate.party_code}/${candidate.candidate_code}`;
                  const shareText = `나도 ${candidate.candidate_number} ${candidate.name} 후보를 응원했어요! 🎉`;
                  
                  if (navigator.share) {
                    navigator.share({
                      title: `${candidate.candidate_number} ${candidate.name}`,
                      text: shareText,
                      url: shareUrl,
                    });
                  } else {
                    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                    alert('링크가 복사되었습니다!');
                  }
                }}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3"
                style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.89 5.29 4.68 6.68l-.86 3.18c-.1.37.32.68.65.48l3.89-2.57c.53.07 1.07.1 1.64.1 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                </svg>
                친구에게 공유하기
              </button>
              
              <button
                onClick={() => {
                  const shareUrl = `https://ebridge.kr/${candidate.party_code}/${candidate.candidate_code}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert('링크가 복사되었습니다!');
                }}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: c.cardBgAlt, color: c.textSecondary }}
              >
                <Share2 size={18} />
                링크 복사
              </button>
              
              <button
                onClick={() => setShowCheerCompleteModal(false)}
                className="mt-4 text-sm"
                style={{ color: c.textMuted }}
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== 갤러리 전체보기 모달 ========== */}
      <AnimatePresence>
        {showGalleryAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: c.cardBg }}
          >
            {/* 모달 헤더 */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: c.border }}
            >
              <h3
                className="font-bold"
                style={{ color: c.textPrimary }}
              >
                {galleryTab === 'image' ? '사진' : '영상'} 전체보기
              </h3>
              <button onClick={() => setShowGalleryAll(false)}>
                <X size={24} style={{ color: c.textMuted }} />
              </button>
            </div>
            {/* 그리드 */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-3 gap-1.5">
                {(galleryTab === 'image'
                  ? gallery.filter(g => g.type === 'image')
                  : gallery.filter(g => g.type === 'video')
                ).map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-lg overflow-hidden cursor-pointer"
                    style={{ paddingBottom: '100%' }}
                    onClick={() => {
                      setShowGalleryAll(false);
                      setSelectedGalleryItem(item);
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== 갤러리 뷰어 모달 (스와이프 지원) ========== */}
      <AnimatePresence>
        {selectedGalleryItem && (() => {
          const currentIdx = gallery.findIndex(g => g.id === selectedGalleryItem.id);
          const hasPrev = currentIdx > 0;
          const hasNext = currentIdx < gallery.length - 1;
          return (
            <motion.div
              key="gallery-viewer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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

              {/* 콘텐츠 (이미지일 때 스와이프) */}
              <motion.div
                key={selectedGalleryItem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                drag={selectedGalleryItem.type === 'image' ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50 && hasNext) {
                    setSelectedGalleryItem(gallery[currentIdx + 1]);
                  } else if (info.offset.x > 50 && hasPrev) {
                    setSelectedGalleryItem(gallery[currentIdx - 1]);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg mx-4"
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
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ========== 응원 메시지 상세 모달 ========== */}
      <AnimatePresence>
        {selectedCheer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: c.overlay }}
            onClick={() => setSelectedCheer(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-5"
              style={{ backgroundColor: c.cardBg }}
            >
              <div className="flex items-center justify-between mb-4">
                <span 
                  className="font-bold text-lg"
                  style={{ color: c.textPrimary }}
                >
                  {selectedCheer.name}
                </span>
                <button onClick={() => setSelectedCheer(null)}>
                  <X size={24} style={{ color: c.textMuted }} />
                </button>
              </div>
              
              <p 
                className="leading-relaxed mb-4 whitespace-pre-wrap"
                style={{ color: c.textSecondary }}
              >
                {selectedCheer.message}
              </p>
              
              <div 
                className="flex items-center justify-between pt-3"
                style={{ borderTop: `1px solid ${c.border}` }}
              >
                <span 
                  className="text-sm"
                  style={{ color: c.textMuted }}
                >
                  {formatTime(selectedCheer.created_at)}
                </span>
                <button 
                  onClick={async () => {
                    await supabase.rpc('increment_cheer_likes', { cheer_id: selectedCheer.id });
                    const { data } = await supabase
                      .from('cheers')
                      .select('*')
                      .eq('candidate_id', candidate.id)
                      .eq('is_visible', true)
                      .order('created_at', { ascending: false });
                    if (data) {
                      setCheers(data);
                      const updated = data.find(ch => ch.id === selectedCheer.id);
                      if (updated) setSelectedCheer(updated);
                    }
                  }}
                  className="flex items-center gap-1.5 hover:text-red-500"
                  style={{ color: c.textMuted }}
                >
                  <Heart size={18} />
                  <span>{selectedCheer.likes_count || 0}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
