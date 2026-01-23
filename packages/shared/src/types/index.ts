export interface Candidate {
  id: string;
  name: string;
  party: string;
  district: string;
  election_type: string;
  photo_url?: string;
  slogan?: string;
  subdomain: string;
  created_at: string;
}

export interface Profile {
  candidate_id: string;
  birth_date?: string;
  education?: string;
  career?: string;
  assets?: string;
  contact?: string;
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
