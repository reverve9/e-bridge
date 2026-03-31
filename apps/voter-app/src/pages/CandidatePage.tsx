import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Heart,
  Send,
  User,
  X,
  Share2,
  MapPin,
  Phone,
  Mail,
  Users,
  ChevronRight,
  Play,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import NotFoundPage from './NotFoundPage';
import {
  Theme,
  ThemeMode,
  createTheme,
  getPartyCode
} from '@e-bridge/ui';
import { getYoutubeId, getVideoThumbnail, formatTime, maskName } from '@/lib/markdown';
import type { Profile, Pledge, Feed, Cheer, GalleryItem } from '@/lib/types';
import ProfileSection, { IntroSection } from '@/components/sections/ProfileSection';
import PledgesSection from '@/components/sections/PledgesSection';
import FeedsSection from '@/components/sections/FeedsSection';
import CheersSection from '@/components/sections/CheersSection';
import GallerySection from '@/components/sections/GallerySection';

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

  // 페이지 진입 시 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [partyCode, candidateCode]);
  
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

      {/* ========== 인사말 ========== */}
      <IntroSection
        theme={theme}
        profile={profile}
        candidateName={candidate.name}
        signatureUrl={candidate.signature_url}
      />

      {/* ========== 프로필 ========== */}
      <ProfileSection
        theme={theme}
        profile={profile}
      />

      {/* ========== 핵심공약 섹션 ========== */}
      <PledgesSection
        theme={theme}
        pledges={pledges}
        candidateId={candidate.id}
        onPledgesUpdate={setPledges}
      />

      {/* ========== 최근 소식 섹션 ========== */}
      <FeedsSection theme={theme} feeds={feeds} />

      {/* ========== 갤러리 ========== */}
      <GallerySection theme={theme} gallery={gallery} />

      {/* ========== 응원 메시지 ========== */}
      <CheersSection
        theme={theme}
        cheers={cheers}
        candidateId={candidate.id}
        onCheersUpdate={setCheers}
        variant="button"
        onAddClick={() => setShowCheerModal(true)}
        onCheerClick={(cheer) => setSelectedCheer(cheer)}
      />

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
