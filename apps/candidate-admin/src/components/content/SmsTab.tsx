import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Copy, RotateCcw, Check, MessageSquare, ExternalLink, Link2, Loader2, ChevronRight } from 'lucide-react';

interface Candidate {
  name: string;
  party: string;
  party_code: string;
  candidate_code: string;
  region: string;
  district: string | null;
  photo_url: string | null;
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

  // 랜딩페이지 관련 상태
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set(['profile', 'pledges']));
  const [generatingLanding, setGeneratingLanding] = useState(false);
  const [landingUrl, setLandingUrl] = useState<string | null>(null);
  const [landingCopied, setLandingCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [candidateRes, pledgesRes, landingsRes] = await Promise.all([
        supabase.from('candidates').select('name, party, party_code, candidate_code, region, district, photo_url, candidate_number, election_name, constituency').eq('id', candidateId).single(),
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
        if (latest.sections) setSelectedSections(new Set(latest.sections));
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
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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
    if (candidate) {
      setGreeting(`안녕하세요, ${candidate.region}${candidate.district ? ' ' + candidate.district : ''} 주민 여러분!\n${candidate.party} ${candidate.name}입니다.`);
      setClosing(`${candidate.name}에게 소중한 한 표를 부탁드립니다.\n감사합니다.`);
    }
  };

  const handleGenerateLanding = async () => {
    if (!candidate) return;
    setGeneratingLanding(true);

    try {
      // 이전 랜딩페이지 삭제
      await supabase
        .from('sms_landings')
        .delete()
        .eq('candidate_id', candidateId);

      const { data, error } = await supabase
        .from('sms_landings')
        .insert({
          candidate_id: candidateId,
          greeting: greeting.trim() || null,
          body: body.trim() || null,
          closing: closing.trim() || null,
          selected_pledge_ids: [...selectedPledgeIds],
          sections: [...selectedSections],
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
            <label className="block text-sm font-semibold text-gray-700 mb-3">인사말</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-3">본문</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-3">마무리 인사</label>
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
                const selected = selectedSections.has(section.key);
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
                  {candidate?.photo_url ? (
                    <img
                      src={candidate.photo_url}
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

              {/* 문자 내용 */}
              <div className="px-4 mt-2">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  {/* 선거운동정보 */}
                  <div className="bg-gray-100 rounded-lg px-3 py-2 mb-4">
                    <span className="text-xs text-gray-500">(선거운동정보)</span>
                  </div>

                  {/* 공약 키워드 */}
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

                  {/* 인사말 */}
                  {greeting.trim() && (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3 leading-relaxed">{greeting.trim()}</p>
                  )}

                  {/* 본문 */}
                  {body.trim() && (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3 leading-relaxed">{body.trim()}</p>
                  )}

                  {/* 마무리 */}
                  {closing.trim() && (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{closing.trim()}</p>
                  )}
                </div>
              </div>

              {/* 선택된 섹션 표시 */}
              {selectedSections.size > 0 && (
                <div className="px-4 mt-2 space-y-2">
                  {LANDING_SECTIONS.filter(s => selectedSections.has(s.key)).map((section) => (
                    <div key={section.key} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-2">
                      <span className="text-sm">{section.emoji}</span>
                      <span className="text-sm font-medium text-gray-600">{section.label}</span>
                      <span className="ml-auto text-xs text-gray-300">섹션 영역</span>
                    </div>
                  ))}
                </div>
              )}

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
