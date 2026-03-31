import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Theme } from '@e-bridge/ui';
import type { Profile } from '@/lib/types';

interface IntroSectionProps {
  theme: Theme;
  profile: Profile | null;
  candidateName: string;
  signatureUrl: string | null;
}

export function IntroSection({ theme, profile, candidateName, signatureUrl }: IntroSectionProps) {
  const c = theme.colors;
  const [showAllIntro, setShowAllIntro] = useState(false);

  if (!profile?.introduction) return null;

  const intro = profile.introduction;
  const introLines = intro.split('\n');
  const needsTruncation = introLines.length > 6;
  const truncatedIntro = needsTruncation ? introLines.slice(0, 6).join('\n') + '...' : intro;

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
          <span style={{ color: c.primary }}>인사말</span>
        </h3>
        <div className="text-sm leading-relaxed" style={{ color: c.textSecondary }}>
          <p className="whitespace-pre-line">
            {showAllIntro ? intro : truncatedIntro}
          </p>
          {showAllIntro && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-sm italic" style={{ color: c.textSecondary }}>
                {candidateName} 올림
              </span>
              {signatureUrl && (
                <img src={signatureUrl} alt="싸인" className="h-8 object-contain" />
              )}
            </div>
          )}
          {needsTruncation && (
            <div className="flex justify-end mt-3">
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
        </div>
      </div>
    </section>
  );
}

interface ProfileSectionProps {
  theme: Theme;
  profile: Profile | null;
}

export default function ProfileSection({ theme, profile }: ProfileSectionProps) {
  const c = theme.colors;
  const [showAllProfile, setShowAllProfile] = useState(false);

  const educationList = profile?.education || [];
  const careerList = profile?.career || [];
  const totalProfileItems = educationList.length + careerList.length;

  if (totalProfileItems === 0) return null;

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
          <span style={{ color: c.primary }}>프로필</span>
        </h3>
        {educationList.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold mb-2" style={{ color: c.textMuted }}>학력</h4>
            <ul className="space-y-1">
              {(showAllProfile ? educationList : educationList.slice(0, 5)).map((edu: any, idx: number) => (
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
              {(showAllProfile ? careerList : careerList.slice(0, 4)).map((career: any, idx: number) => (
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
        {(educationList.length > 5 || careerList.length > 4) && (
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
      </div>
    </section>
  );
}
