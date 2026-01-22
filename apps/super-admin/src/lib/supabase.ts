import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 정당 정보 (이름, 코드, 색상)
export const PARTIES = {
  '더불어민주당': { code: 'dmj', color: '#004EA2' },
  '국민의힘': { code: 'ppp', color: '#E61E2B' },
  '조국혁신당': { code: 'rnp', color: '#004098' },
  '개혁신당': { code: 'ref', color: '#FF6600' },
  '진보당': { code: 'prg', color: '#D6001C' },
  '기본소득당': { code: 'bas', color: '#82C8A0' },
  '사회민주당': { code: 'sdp', color: '#F5A623' },
  '무소속': { code: 'ind', color: '#808080' },
} as const;

export type PartyName = keyof typeof PARTIES;

// 정당 코드로 정당명 찾기
export const getPartyByCode = (code: string): PartyName | null => {
  for (const [name, info] of Object.entries(PARTIES)) {
    if (info.code === code) return name as PartyName;
  }
  return null;
};

// 정당명으로 코드 찾기
export const getPartyCode = (partyName: string): string => {
  return PARTIES[partyName as PartyName]?.code || 'ind';
};

// 정당 색상 가져오기
export const getPartyColor = (partyName: string): string => {
  return PARTIES[partyName as PartyName]?.color || '#808080';
};

// 6자리 랜덤 코드 생성
export const generateCandidateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 타입 정의
export interface Candidate {
  id: string;
  name: string;
  party: string;
  party_code: string;
  election_type: string;
  region: string;
  district: string | null;
  constituency: string | null;
  photo_url: string | null;
  slogan: string | null;
  candidate_code: string;
  login_email: string;
  created_at: string;
}

export type CandidateInsert = Omit<Candidate, 'id' | 'created_at'>;
export type CandidateUpdate = Partial<CandidateInsert>;
