/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  tagline: string | null;
  candidate_code: string;
  login_email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  candidate_id: string;
  birth_date: string | null;
  education: any[];
  career: any[];
  introduction: string | null;
}

export interface Pledge {
  id: string;
  candidate_id: string;
  emoji: string;
  title: string;
  description: string | null;
  priority: number;
}

export interface PledgeDetail {
  id: string;
  candidate_id: string;
  category: string;
  content: string;
  priority: number;
}

export interface Feed {
  id: string;
  candidate_id: string;
  type: 'activity' | 'news' | 'notice';
  title: string;
  content: string | null;
  image_url: string | null;
  source: string | null;
  external_url: string | null;
  likes_count: number;
  is_pinned: boolean;
  published_at: string;
}

export interface Cheer {
  id: string;
  candidate_id: string;
  name: string;
  message: string;
  is_visible: boolean;
  created_at: string;
}

export interface QnA {
  id: string;
  candidate_id: string;
  question: string;
  answer: string | null;
  questioner_name: string | null;
  is_answered: boolean;
  is_visible: boolean;
  answered_at: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  candidate_id: string;
  phone: string | null;
  email: string | null;
  office_address: string | null;
  office_hours: string | null;
}
