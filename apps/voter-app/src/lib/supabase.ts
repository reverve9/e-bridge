import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 정당 정보
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

export const getPartyByCode = (code: string): PartyName | null => {
  for (const [name, info] of Object.entries(PARTIES)) {
    if (info.code === code) return name as PartyName;
  }
  return null;
};

export const getPartyColor = (partyName: string): string => {
  return PARTIES[partyName as PartyName]?.color || '#808080';
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

export interface Profile {
  candidate_id: string;
  birth_date: string | null;
  education: string | null;
  career: string | null;
  assets: string | null;
  contact: string | null;
}

export interface Pledge {
  id: string;
  candidate_id: string;
  category: string;
  title: string;
  content: string;
  priority: number;
}

export interface SnsLink {
  id: string;
  candidate_id: string;
  platform: string;
  url: string;
}

export interface News {
  id: string;
  candidate_id: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  is_featured: boolean;
}
