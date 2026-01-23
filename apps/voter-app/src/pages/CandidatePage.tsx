import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown,
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
} from 'lucide-react';
import { supabase, getPartyColor } from '../lib/supabase';
import NotFoundPage from './NotFoundPage';
import PartyHeader from '../components/PartyHeader';

// 확장된 Candidate 타입
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

// 섹션 카드 레이아웃 컴포넌트
function SectionCard({ 
  title, 
  partyColor, 
  rightElement,
  children 
}: { 
  title: string; 
  partyColor: string; 
  rightElement?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 mt-3">
      <div className="bg-white rounded-2xl shadow-sm">
        {/* 타이틀 영역 - p-3 */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h3 className="font-bold flex items-center gap-2">
            <span className="w-1 h-5 rounded-full" style={{ backgroundColor: partyColor }} />
            <span style={{ color: partyColor }}>{title}</span>
          </h3>
          {rightElement}
        </div>
        {/* 콘텐츠 영역 - px-4 pb-4 */}
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </section>
  );
}

// FeedItem 컴포넌트 (깜빡임 방지를 위해 외부 정의)
function FeedItemComponent({ 
  item, 
  partyColor, 
  formatTime 
}: { 
  item: Feed; 
  partyColor: string; 
  formatTime: (dateStr: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className="border-b border-gray-100 last:border-0 pb-3 last:pb-0 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* 첫째줄: 배지 + 제목 + 시간 */}
      <div className="flex items-center gap-2">
        <span 
          className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
          style={{ backgroundColor: `${partyColor}15`, color: partyColor }}
        >
          {item.type === 'activity' ? '활동' : item.type === 'news' ? '뉴스' : '공지'}
        </span>
        <h4 className="font-semibold text-gray-900 flex-1 truncate">{item.title}</h4>
        <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(item.published_at)}</span>
      </div>

      {/* 요약문 (부제 스타일) - 항상 표시 */}
      {item.summary && (
        <p className={`text-sm font-medium italic mt-1 pl-3 ${expanded ? '' : 'truncate'}`} style={{ color: partyColor }}>
          "{item.summary}"
        </p>
      )}

      {/* 본문 - 펼침 상태에서만 표시 */}
      {expanded ? (
        <>
          {item.content && (
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-line leading-relaxed">
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
              style={{ color: partyColor }}
            >
              원문 보기 →
            </a>
          )}
        </>
      ) : (
        /* 요약이 없을 때만 본문 첫 줄 표시 */
        !item.summary && item.content && (
          <p className="text-sm text-gray-500 mt-1 truncate">
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

// SNS 설정
const SNS_CONFIG: Record<string, { Icon: any; color: string; label: string }> = {
  youtube: { Icon: YoutubeIcon, color: '#FF0000', label: 'YouTube' },
  instagram: { Icon: InstagramIcon, color: '#E4405F', label: 'Instagram' },
  facebook: { Icon: FacebookIcon, color: '#1877F2', label: 'Facebook' },
  twitter: { Icon: TwitterIcon, color: '#000000', label: 'X (Twitter)' },
  blog: { Icon: BlogIcon, color: '#03C75A', label: 'Blog' },
  kakao: { Icon: KakaoIcon, color: '#FEE500', label: 'KakaoTalk' },
};

export default function CandidatePage() {
  const { partyCode, candidateCode } = useParams<{ partyCode: string; candidateCode: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateExt | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [cheers, setCheers] = useState<Cheer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheerModal, setShowCheerModal] = useState(false);
  const [showCheerCompleteModal, setShowCheerCompleteModal] = useState(false);
  const [selectedCheer, setSelectedCheer] = useState<Cheer | null>(null);
  const [cheerName, setCheerName] = useState('');
  const [cheerMessage, setCheerMessage] = useState('');
  
  // 프로필 더보기 상태
  const [showAllProfile, setShowAllProfile] = useState(false);
  const [showAllIntro, setShowAllIntro] = useState(false);
  const [showAllPledges, setShowAllPledges] = useState(false);
  const [showAllFeeds, setShowAllFeeds] = useState(false);
  const [feedDisplayCount, setFeedDisplayCount] = useState(3);
  const [cheerStartIndex, setCheerStartIndex] = useState(0);
  const [expandedPledgeId, setExpandedPledgeId] = useState<string | null>(null);
  const [likedPledges, setLikedPledges] = useState<Set<string>>(new Set());
  
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

  // 응원 메시지 롤링 (4초마다, 6개 이상일 때만)
  useEffect(() => {
    if (cheers.length <= 5) return;
    
    const interval = setInterval(() => {
      setCheerStartIndex((prev) => {
        const next = prev + 1;
        // 원본 리스트 끝에 도달하면 리셋 (무한 롤링)
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

      const [profileRes, pledgesRes, feedsRes, cheersRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('candidate_id', candidateData.id).maybeSingle(),
        supabase.from('pledges').select('*').eq('candidate_id', candidateData.id).order('order'),
        supabase.from('feeds').select('*').eq('candidate_id', candidateData.id).order('published_at', { ascending: false }),
        supabase.from('cheers').select('*').eq('candidate_id', candidateData.id).eq('is_visible', true).order('created_at', { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      else setProfile(null);
      if (pledgesRes.data) setPledges(pledgesRes.data);
      else setPledges([]);
      if (feedsRes.data) setFeeds(feedsRes.data);
      else setFeeds([]);
      if (cheersRes.data) setCheers(cheersRes.data);
      else setCheers([]);

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
    // 5자 초과면 5자로 제한 후 마스킹
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!candidate) {
    return <NotFoundPage />;
  }

  // 비활성 후보자 랜딩 페이지
  if (candidate.is_active === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
          <User size={40} className="text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-700 mb-2">
          페이지 준비 중입니다
        </h1>
        <p className="text-gray-500 text-center mb-6">
          {candidate.name} 후보의 페이지가<br />
          아직 공개되지 않았습니다.
        </p>
        <p className="text-sm text-gray-400">
          곧 만나요! 👋
        </p>
      </div>
    );
  }

  const partyColor = getPartyColor(candidate.party);

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

  // 선거구 정보 조합
  const electionInfo = [
    candidate.election_name,
    candidate.constituency
  ].filter(Boolean).join(' ');
  
  const constituencyDetail = candidate.constituency_detail 
    ? `(${candidate.constituency_detail})` 
    : '';

  // 기호 파싱
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
  
  // 미리보기: 학력 1개, 경력 1개
  const PREVIEW_EDU_COUNT = 2;
  const PREVIEW_CAREER_COUNT = 2;
  const hasMoreItems = educationList.length > PREVIEW_EDU_COUNT || careerList.length > PREVIEW_CAREER_COUNT;

  const visibleEducation = showAllProfile ? educationList : educationList.slice(0, PREVIEW_EDU_COUNT);
  const visibleCareer = showAllProfile ? careerList : careerList.slice(0, PREVIEW_CAREER_COUNT);

  // SNS 데이터 - 등록된 것만 + 순서 적용
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
  
  // 등록된 SNS만 순서대로 필터링
  const activeSns = snsOrder
    .filter(key => snsUrls[key])
    .map(key => ({
      key,
      url: snsUrls[key]!,
      ...SNS_CONFIG[key]
    }));

  // 정당별 헤더 배경 스타일
  const getHeaderStyle = () => {
    if (candidate.party_code === 'tmj' || candidate.party === '더불어민주당') {
      return {
        background: 'linear-gradient(90deg, #00B050 0%, #00A0E0 50%, #004EA2 100%)'
      };
    }
    return { backgroundColor: partyColor };
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* ========== 상단 헤더 ========== */}
      <header style={getHeaderStyle()}>
        <div className="flex items-center justify-between px-4 py-[15px]">
          {candidate.party_logo_url ? (
            <img 
              src={candidate.party_logo_url} 
              alt={candidate.party}
              className="h-[20px] w-auto object-contain brightness-0 invert"
            />
          ) : (
            <span className="text-sm font-bold text-white">
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
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20"
                >
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ========== 히어로 섹션 (16:9 슬라이드) ========== */}
      <section className="relative bg-white">
        {(() => {
          // 갤러리 이미지 배열 (photo_url을 첫번째로)
          const galleryImages = [
            candidate.photo_url,
            ...(candidate.gallery_images || [])
          ].filter(Boolean) as string[];
          
          return (
            <div 
              className="relative w-full overflow-hidden" 
              style={{ paddingBottom: '56.25%' }}
            >
              {/* 페이드 슬라이드 */}
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
                  style={{ background: `linear-gradient(135deg, ${partyColor}40 0%, ${partyColor}20 100%)` }}
                >
                  <span className="text-8xl font-bold text-white/50">{candidate.name[0]}</span>
                </div>
              )}

              {/* QR코드 (우측 하단) */}
              <div className="absolute bottom-10 right-6 z-10">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`https://ebridge.kr/${candidate.party_code}/${candidate.candidate_code}`)}`}
                  alt="QR코드"
                  className="w-[72px] h-[72px] rounded-lg bg-white p-1 shadow-lg"
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent flex items-end px-4 pb-3">
                {candidate.slogan && (
                  <p 
                    className="font-score text-white"
                    style={{ fontSize: '16px', fontWeight: 700 }}
                  >
                    {candidate.slogan}
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </section>

      {/* ========== 선거구 + 기호/이름 영역 ========== */}
      <section className="bg-white px-4 py-4">
        <div className="grid grid-cols-2">
          {/* 좌측: 선거구 정보 (오른쪽 정렬) */}
          <div className="text-right pr-4">
            <p className="font-semibold text-gray-900 leading-tight" style={{ fontSize: '15px' }}>
              {candidate.election_name} {candidate.constituency}
            </p>
            {candidate.constituency_detail && (
              <p className="text-gray-500 leading-tight" style={{ fontSize: '13px' }}>
                ({candidate.constituency_detail})
              </p>
            )}
          </div>
          
          {/* 우측: 기호 + 이름 */}
          <div className="flex items-center justify-center">
            <p style={{ fontSize: '26px', fontWeight: 900, fontFamily: "'S-CoreDream', sans-serif", color: '#000' }}>
              {candidate.candidate_number} {candidate.name}
            </p>
          </div>
        </div>
      </section>

      {/* ========== 태그라인 ========== */}
      {candidate.tagline && (
        <section className="bg-white px-6 py-4">
          <p className="text-gray-600 text-sm">{candidate.tagline}</p>
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
                ? { backgroundColor: 'white', color: partyColor, letterSpacing: '0.05em' }
                : { backgroundColor: '#f3f4f6', color: '#9ca3af', letterSpacing: '0.05em' }
              }
            >
              프로필
            </button>
            <button
              onClick={() => { setProfileTab('intro'); setShowAllProfile(false); setShowAllIntro(false); }}
              className="px-5 py-1.5 font-bold rounded-t-lg transition-colors"
              style={profileTab === 'intro'
                ? { backgroundColor: 'white', color: partyColor, letterSpacing: '0.05em' }
                : { backgroundColor: '#f3f4f6', color: '#9ca3af', letterSpacing: '0.05em' }
              }
            >
              인사말
            </button>
          </div>
          
          {/* 카드 본문 */}
          <div className="bg-white rounded-b-2xl rounded-tr-2xl p-4 shadow-sm">
            {profileTab === 'profile' ? (
              <>
                {/* 학력 */}
                {educationList.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">학력</h4>
                    <ul className="space-y-1">
                      {(showAllProfile ? educationList : educationList.slice(0, 2)).map((edu: any, idx: number) => (
                        <li key={`edu-${idx}`} className="text-sm text-gray-700">
                          • {edu.school} {edu.major && `(${edu.major})`} {edu.note && `- ${edu.note}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 경력 */}
                {careerList.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">주요 경력</h4>
                    <ul className="space-y-1.5">
                      {(showAllProfile ? careerList : careerList.slice(0, 2)).map((c: any, idx: number) => (
                        <li key={`career-${idx}`} className="flex items-start gap-2 text-sm">
                          <span 
                            className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                            style={c.is_current ? {
                              backgroundColor: `${partyColor}20`,
                              color: partyColor
                            } : {
                              backgroundColor: '#f3f4f6',
                              color: '#9ca3af'
                            }}
                          >
                            {c.is_current ? '現' : '前'}
                          </span>
                          <span className="text-gray-700">{c.title}</span>
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
                      className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
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
                <div className="text-sm text-gray-700 leading-relaxed">
                  {(() => {
                    const intro = profile.introduction;
                    const truncatedIntro = intro.length > 200 ? intro.slice(0, 200) + '...' : intro;
                    
                    return (
                      <>
                        <p className={showAllIntro ? 'whitespace-pre-line' : ''}>
                          <span 
                            className="float-left mr-1.5 flex items-center justify-center text-white"
                            style={{ backgroundColor: partyColor, fontSize: '1.5rem', fontWeight: 800, width: '40px', height: '40px', borderRadius: '4px', fontFamily: "'S-CoreDream', sans-serif" }}
                          >
                            {intro[0]}
                          </span>
                          {showAllIntro ? intro.slice(1) : truncatedIntro.slice(1)}
                        </p>
                        
                        {/* 이름 + 싸인 (펼쳤을 때만) */}
                        {showAllIntro && (
                          <div className="flex items-center justify-center gap-2 mt-4 clear-both">
                            <span className="text-sm italic text-gray-600">{candidate.name} 올림</span>
                            {(candidate as any).signature_url && (
                              <img 
                                src={(candidate as any).signature_url} 
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
                              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
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

      {/* ========== 핵심공약 섹션 (고정) ========== */}
      {pledges.length > 0 && (
        <section className="px-4 mt-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full" style={{ backgroundColor: partyColor }} />
              <span style={{ color: partyColor }}>핵심공약</span>
            </h3>
            <div className="space-y-2">
              {(showAllPledges ? pledges : pledges.slice(0, 4)).map((pledge, idx) => {
                const isExpanded = expandedPledgeId === pledge.id;
                const isLiked = likedPledges.has(pledge.id);
                
                return (
                  <div 
                    key={pledge.id} 
                    className="rounded-xl p-3 cursor-pointer transition-all"
                    style={{ backgroundColor: idx % 2 === 0 ? `${partyColor}08` : `${partyColor}04` }}
                    onClick={() => setExpandedPledgeId(isExpanded ? null : pledge.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: partyColor, fontSize: '11px', fontWeight: 600 }}
                      >
                        {idx + 1}
                      </div>
                      <h4 className="flex-1 text-gray-900 leading-snug" style={{ fontSize: '15px', fontWeight: 600 }}>
                        {pledge.title}
                      </h4>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                    
                    {/* 펼쳐진 상태 */}
                    {isExpanded && (
                      <div className="mt-2 pl-7">
                        {pledge.description && (
                          <p className="text-gray-600 leading-relaxed mb-3" style={{ fontSize: '13px' }}>
                            {pledge.description}
                          </p>
                        )}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (isLiked) return;
                            
                            await supabase.rpc('increment_pledge_likes', { pledge_id: pledge.id });
                            
                            // localStorage 업데이트
                            const newLiked = new Set(likedPledges);
                            newLiked.add(pledge.id);
                            setLikedPledges(newLiked);
                            localStorage.setItem('likedPledges', JSON.stringify([...newLiked]));
                            
                            // pledges 새로고침
                            const { data } = await supabase
                              .from('pledges')
                              .select('*')
                              .eq('candidate_id', candidate.id)
                              .order('order');
                            if (data) setPledges(data);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                            isLiked 
                              ? 'bg-red-50 text-red-500' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
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
            {pledges.length > 4 && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => setShowAllPledges(!showAllPledges)}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
                >
                  {showAllPledges ? '접기' : `더보기 (${pledges.length - 4}개)`}
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
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full" style={{ backgroundColor: partyColor }} />
            <span style={{ color: partyColor }}>최근 소식</span>
          </h3>
          <div className="space-y-3">
            {feeds.length === 0 ? (
              <p className="text-center text-gray-400 py-4">등록된 소식이 없습니다</p>
            ) : (
              <>
                {feeds.slice(0, feedDisplayCount).map((item) => (
                  <FeedItemComponent 
                    key={item.id} 
                    item={item} 
                    partyColor={partyColor} 
                    formatTime={formatTime}
                  />
                ))}
                {feeds.length > feedDisplayCount && (
                  <button
                    onClick={() => setFeedDisplayCount(prev => prev + 5)}
                    className="w-full py-3 text-sm text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100"
                  >
                    소식 더보기 ({feeds.length - feedDisplayCount}개)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========== 응원 메시지 ========== */}
      <section className="px-4 pb-6 mt-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <span className="w-1 h-5 rounded-full" style={{ backgroundColor: partyColor }} />
              <span style={{ color: partyColor }}>응원 메시지</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCheerModal(true)}
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${partyColor}15`, color: partyColor }}
              >
                + 남기기
              </button>
              <span className="text-xs text-gray-400">{cheers.length}개</span>
            </div>
          </div>
          <div className="relative overflow-hidden" style={{ height: cheers.length === 0 ? 'auto' : `${Math.min(cheers.length, 5) * 36}px` }}>
            {cheers.length === 0 ? (
              <p className="text-center text-gray-400 py-4">첫 번째 응원을 남겨주세요!</p>
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
                    <span className="font-semibold text-gray-900 text-sm w-14 flex-shrink-0">{cheer.name}</span>
                    <p className="text-sm text-gray-700 flex-1 min-w-0 truncate">
                      {cheer.message}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-gray-400 text-xs">{formatTime(cheer.created_at)}</span>
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
                        className="text-gray-400 hover:text-red-500 flex items-center gap-0.5"
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
      <section className="px-4 mt-3">
        <button
          onClick={fetchPartyCandidates}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${partyColor}20` }}
            >
              <Users size={20} style={{ color: partyColor }} />
            </div>
            <span className="font-medium text-gray-900">
              {candidate.party} 후보 응원하러 가기
            </span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </section>

      {/* ========== D-Day + 내 선거구 확인 ========== */}
      <section className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
          {/* D-Day (1/4) */}
          {(() => {
            const voteDate = new Date('2026-06-03T00:00:00+09:00');
            const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
            now.setHours(0, 0, 0, 0);
            const diffDays = Math.max(0, Math.ceil((voteDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            const isUrgent = diffDays <= 20;
            
            return (
              <div className="w-1/4 flex flex-col items-center justify-center border-r border-gray-100 pr-4">
                <span className="text-xs text-gray-400">투표일까지</span>
                <span 
                  className="text-2xl my-0.5"
                  style={{ 
                    fontFamily: "'S-CoreDream', sans-serif", 
                    fontWeight: 800,
                    color: isUrgent ? '#EF4444' : '#1F2937'
                  }}
                >
                  {diffDays}
                </span>
                <span className="text-xs text-gray-400">2026.6.3(수)</span>
              </div>
            );
          })()}
          
          {/* 내 선거구 확인 (3/4) */}
          <div className="w-3/4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowConstituencyInfo(!showConstituencyInfo)}
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: partyColor }} />
                <span className="font-medium text-gray-900 text-sm">내 선거구 확인</span>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform ${showConstituencyInfo ? 'rotate-180' : ''}`}
              />
            </div>
            {showConstituencyInfo && (
              <div className="mt-3 bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-sm text-gray-400">현재 조회기간이 아닙니다</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== 연락사무소 푸터 ========== */}
      {(candidate.contact_address || candidate.contact_phone || candidate.contact_email) && (
        <footer className="bg-gray-100 px-6 py-6 mt-6">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">선거운동 연락사무소</h3>
          <div className="space-y-2 text-sm">
            {candidate.contact_address && (
              <p className="text-gray-600 flex items-start gap-2">
                <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <span>{candidate.contact_address}</span>
              </p>
            )}
            {candidate.contact_phone && (
              <p className="text-gray-600 flex items-center gap-2">
                <Phone size={16} className="text-gray-400 flex-shrink-0" />
                <a href={`tel:${candidate.contact_phone.replace(/-/g, '')}`} className="text-blue-600">
                  {candidate.contact_phone}
                </a>
              </p>
            )}
            {candidate.contact_email && (
              <p className="text-gray-600 flex items-center gap-2">
                <Mail size={16} className="text-gray-400 flex-shrink-0" />
                <a href={`mailto:${candidate.contact_email}`} className="text-blue-600">
                  {candidate.contact_email}
                </a>
              </p>
            )}
          </div>
        </footer>
      )}

      {/* ========== 면책 문구 + 카피라이트 ========== */}
      <footer className="bg-gray-200 px-6 py-6">
        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          본 페이지에 게시된 모든 선거 관련 정보(공약, 프로필, 이미지 등)는 해당 후보자 또는 선거캠프가 직접 작성·제공한 것입니다. (주)나인브릿지는 플랫폼 기술 제공 및 운영만을 담당하며, 게시된 내용의 정확성·적법성에 대한 책임은 해당 후보자에게 있습니다.
        </p>
        <p className="text-xs text-gray-400 text-center">
          © 2026 (주)나인브릿지. All rights reserved.
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
          className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white"
          style={{ backgroundColor: partyColor }}
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            onClick={() => setShowCheerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">응원 메시지</h3>
                <button onClick={() => setShowCheerModal(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <input
                type="text"
                value={cheerName}
                onChange={(e) => setCheerName(e.target.value)}
                placeholder="이름 (비우면 익명)"
                className="w-full p-4 bg-gray-50 rounded-xl mb-3 focus:outline-none focus:ring-2"
              />
              <textarea
                value={cheerMessage}
                onChange={(e) => setCheerMessage(e.target.value)}
                placeholder="후보자에게 응원 메시지를 남겨주세요!"
                className="w-full h-28 p-4 bg-gray-50 rounded-xl resize-none focus:outline-none focus:ring-2"
              />
              <p className="text-xs text-gray-400 mt-2 mb-3">
                * 응원 외 메시지는 비공개 처리될 수 있습니다.
              </p>
              <button 
                onClick={handleCheerSubmit}
                className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: partyColor }}
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            onClick={() => setShowPartyCandidatesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-2xl max-h-[70vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold text-lg">{candidate.party} 후보</h3>
                <button onClick={() => setShowPartyCandidatesModal(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                {partyCandidates.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">다른 후보가 없습니다</p>
                ) : (
                  <div className="space-y-3">
                    {partyCandidates.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setShowPartyCandidatesModal(false);
                          window.open(`/${c.party_code}/${c.candidate_code}`, '_blank');
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 text-left"
                      >
                        {(c as any).thumbnail_url || c.photo_url ? (
                          <img 
                            src={(c as any).thumbnail_url || c.photo_url} 
                            alt={c.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: partyColor }}
                          >
                            {c.name[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{c.candidate_number} {c.name}</p>
                          <p className="text-sm text-gray-500">{c.region} {c.district} {c.constituency}</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            onClick={() => setShowCheerCompleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-2xl p-6 text-center"
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${partyColor}20` }}
              >
                <Heart size={32} style={{ color: partyColor }} fill={partyColor} />
              </div>
              <h3 className="font-bold text-xl mb-2">응원 완료! 🎉</h3>
              <p className="text-gray-500 mb-6">
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
                className="w-full py-3.5 rounded-xl font-semibold text-amber-900 flex items-center justify-center gap-2 mb-3"
                style={{ backgroundColor: '#FEE500' }}
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
                className="w-full py-3.5 rounded-xl font-semibold text-gray-700 bg-gray-100 flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                링크 복사
              </button>
              
              <button
                onClick={() => setShowCheerCompleteModal(false)}
                className="mt-4 text-sm text-gray-400"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== 응원 메시지 상세 모달 ========== */}
      <AnimatePresence>
        {selectedCheer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            onClick={() => setSelectedCheer(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-lg text-gray-900">{selectedCheer.name}</span>
                <button onClick={() => setSelectedCheer(null)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                {selectedCheer.message}
              </p>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-gray-400 text-sm">{formatTime(selectedCheer.created_at)}</span>
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
                      const updated = data.find(c => c.id === selectedCheer.id);
                      if (updated) setSelectedCheer(updated);
                    }
                  }}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-red-500"
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
