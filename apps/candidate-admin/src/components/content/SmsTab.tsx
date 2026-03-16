import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Copy, RotateCcw, Check, MessageSquare, ExternalLink } from 'lucide-react';

interface Candidate {
  name: string;
  party: string;
  party_code: string;
  candidate_code: string;
  region: string;
  district: string | null;
}

interface Pledge {
  id: string;
  emoji: string;
  title: string;
}

interface SmsTabProps {
  candidateId: string;
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

  useEffect(() => {
    const fetchData = async () => {
      const [candidateRes, pledgesRes] = await Promise.all([
        supabase.from('candidates').select('name, party, party_code, candidate_code, region, district').eq('id', candidateId).single(),
        supabase.from('pledges').select('id, emoji, title').eq('candidate_id', candidateId).order('order'),
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

  const selectedPledges = pledges.filter((p) => selectedPledgeIds.has(p.id));
  const voterUrl = candidate ? `ebridge.kr/${candidate.party_code}/${candidate.candidate_code}` : '';

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

    if (voterUrl) {
      lines.push(`▶ 더 알아보기: https://${voterUrl}`);
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

          {/* 더보기 링크 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">더보기 링크</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-600">
              <ExternalLink size={16} className="text-blue-500 flex-shrink-0" />
              <span className="truncate">https://{voterUrl}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">유권자 앱 링크가 자동으로 포함됩니다</p>
          </div>

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

        {/* ===== 우측: 실시간 미리보기 ===== */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <label className="block text-sm font-semibold text-gray-700 mb-3">미리보기</label>
          <div className="bg-gradient-to-b from-gray-50 to-white shadow-lg rounded-3xl border border-gray-200 overflow-hidden">
            {/* 상단 바 */}
            <div className="bg-gray-100 px-5 py-3 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">문자 메시지</span>
              <span className="text-xs text-gray-400">{buildFullText().length}자</span>
            </div>

            {/* 메시지 본문 */}
            <div className="p-5">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                {/* 법적 표기 */}
                <div className="bg-gray-100 rounded-lg px-3 py-2 mb-3">
                  <span className="text-xs text-gray-500">(선거운동정보)</span>
                </div>

                {/* 공약 키워드 */}
                {selectedPledges.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-bold text-gray-800 mb-1">★ 후보자의 약속</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPledges.map((p) => (
                        <span key={p.id} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          {p.emoji} {p.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 인사말 */}
                {greeting.trim() && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{greeting.trim()}</p>
                )}

                {/* 본문 */}
                {body.trim() && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{body.trim()}</p>
                )}

                {/* 마무리 */}
                {closing.trim() && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{closing.trim()}</p>
                )}

                {/* 더보기 링크 */}
                {voterUrl && (
                  <div className="border-t border-gray-100 pt-3 mt-2">
                    <p className="text-xs text-blue-600 font-medium">
                      ▶ 더 알아보기: https://{voterUrl}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
