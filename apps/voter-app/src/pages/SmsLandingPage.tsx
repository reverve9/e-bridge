import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Play,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import NotFoundPage from './NotFoundPage';
import {
  Theme,
  ThemeMode,
  createTheme,
  getPartyCode,
} from '@e-bridge/ui';
import { renderMarkdownBlock } from '@/lib/markdown';
import { getYoutubeId, getVideoThumbnail } from '@/lib/markdown';
import type { Profile, Pledge, Feed, Cheer, GalleryItem } from '@/lib/types';
import ProfileSection from '@/components/sections/ProfileSection';
import PledgesSection from '@/components/sections/PledgesSection';
import FeedsSection from '@/components/sections/FeedsSection';
import CheersSection from '@/components/sections/CheersSection';

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

  useEffect(() => {
    const fetchData = async () => {
      if (!partyCode || !candidateCode || !landingId) return;

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

  const selectedPledgeIds = new Set(landing.selected_pledge_ids || []);
  const selectedPledges = pledges.filter((p) => selectedPledgeIds.has(p.id));
  const displayPledges = selectedPledges.length > 0 ? selectedPledges : pledges;

  const fullPageUrl = `/${candidate.party_code}/${candidate.candidate_code}`;

  // ========================================
  // 렌더링
  // ========================================
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: c.background }}>
      {/* ========== 후보자 정보 ========== */}
      <section className="px-4 py-4" style={{ backgroundColor: c.cardBg }}>
        <div className="flex items-center gap-4">
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
            <p className="text-sm" style={{ color: c.textMuted }}>
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
          <div className="rounded-lg px-3 py-2 mb-4" style={{ backgroundColor: c.cardBgAlt }}>
            <span className="text-xs" style={{ color: c.textMuted }}>
              (선거운동정보)
            </span>
          </div>

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

          {landing.greeting && (
            <p className="text-sm mb-3 leading-relaxed" style={{ color: c.textSecondary }}>
              {renderMarkdownBlock(landing.greeting)}
            </p>
          )}
          {landing.body && (
            <p className="text-sm mb-3 leading-relaxed" style={{ color: c.textSecondary }}>
              {renderMarkdownBlock(landing.body)}
            </p>
          )}
          {landing.closing && (
            <p className="text-sm leading-relaxed" style={{ color: c.textSecondary }}>
              {renderMarkdownBlock(landing.closing)}
            </p>
          )}
        </div>
      </section>

      {/* ========== 동적 섹션 렌더링 ========== */}
      {sections.map((sectionKey) => {
        switch (sectionKey) {
          case 'profile':
            return (
              <ProfileSection
                key="profile"
                theme={theme}
                profile={profile}
                candidateName={candidate.name}
                signatureUrl={candidate.signature_url}
                showIntroTab={sections.includes('intro')}
              />
            );

          case 'intro':
            if (sections.includes('profile')) return null;
            return (
              <ProfileSection
                key="intro"
                theme={theme}
                profile={profile}
                candidateName={candidate.name}
                signatureUrl={candidate.signature_url}
                showIntroTab={true}
              />
            );

          case 'pledges':
            return (
              <PledgesSection
                key="pledges"
                theme={theme}
                pledges={displayPledges}
                candidateId={candidate.id}
                onPledgesUpdate={setPledges}
              />
            );

          case 'feeds':
            return (
              <FeedsSection
                key="feeds"
                theme={theme}
                feeds={feeds}
              />
            );

          case 'cheers':
            return (
              <CheersSection
                key="cheers"
                theme={theme}
                cheers={cheers}
                candidateId={candidate.id}
                onCheersUpdate={setCheers}
                variant="inline"
              />
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

      {/* ========== 갤러리 뷰어 모달 ========== */}
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
            <div className="absolute top-4 left-4 z-10 text-white/70 text-sm font-medium">
              {currentIdx + 1} / {gallery.length}
            </div>
            {hasPrev && (
              <button
                className="absolute left-2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white/80 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setSelectedGalleryItem(gallery[currentIdx - 1]); }}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {hasNext && (
              <button
                className="absolute right-2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white/80 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setSelectedGalleryItem(gallery[currentIdx + 1]); }}
              >
                <ChevronRight size={24} />
              </button>
            )}
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
