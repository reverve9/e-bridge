import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  Send,
  MapPin,
  Phone,
  Mail,
  ThumbsUp,
  ChevronRight,
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

      await Promise.all([fetchProfile(), fetchPledges(), fetchFeeds(), fetchCheers()]);

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
      {/* ========== 상단 헤더 ========== */}
      <header style={{ background: theme.header.background }}>
        <div className="flex items-center justify-between px-4 py-[15px]">
          {candidate.party_logo_url ? (
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
        </div>
      </header>

      {/* ========== 후보자 정보 ========== */}
      <section className="px-4 py-4" style={{ backgroundColor: c.cardBg }}>
        <div className="flex items-center gap-4">
          {/* 프로필 이미지 */}
          {candidate.photo_url ? (
            <img
              src={candidate.photo_url}
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
              className="text-sm whitespace-pre-wrap mb-3 leading-relaxed"
              style={{ color: c.textSecondary }}
            >
              {landing.greeting}
            </p>
          )}

          {/* 본문 */}
          {landing.body && (
            <p
              className="text-sm whitespace-pre-wrap mb-3 leading-relaxed"
              style={{ color: c.textSecondary }}
            >
              {landing.body}
            </p>
          )}

          {/* 마무리 */}
          {landing.closing && (
            <p
              className="text-sm whitespace-pre-wrap leading-relaxed"
              style={{ color: c.textSecondary }}
            >
              {landing.closing}
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
                    {(showAllPledges ? displayPledges : displayPledges.slice(0, 4)).map((pledge, idx) => {
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
                  {displayPledges.length > 4 && (
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => setShowAllPledges(!showAllPledges)}
                        className="text-xs flex items-center gap-0.5 hover:opacity-80"
                        style={{ color: c.textMuted }}
                      >
                        {showAllPledges ? '접기' : `더보기 (${displayPledges.length - 4}개)`}
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
                        아직 응원 메시지가 없습니다
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
                              <div
                                className="flex items-center gap-0.5"
                                style={{ color: c.textMuted }}
                              >
                                <Heart size={12} />
                                <span className="text-xs">{cheer.likes_count || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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

      {/* ========== 전체 페이지 보기 CTA ========== */}
      <section className="px-4 mt-6 pb-6">
        <button
          onClick={() => navigate(fullPageUrl)}
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

      {/* ========== 면책 문구 ========== */}
      <footer className="px-6 py-6" style={{ backgroundColor: c.border }}>
        <p className="text-xs leading-relaxed mb-4" style={{ color: c.textMuted }}>
          본 페이지에 게시된 모든 선거 관련 정보(공약, 프로필, 이미지 등)는 해당 후보자 또는 선거캠프가 직접 작성·제공한 것입니다. (주)나인브릿지는 플랫폼 기술 제공 및 운영만을 담당하며, 게시된 내용의 정확성·적법성에 대한 책임은 해당 후보자에게 있습니다.
        </p>
        <p className="text-xs text-center" style={{ color: c.textMuted }}>
          © 2026 (주)나인브릿지. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
