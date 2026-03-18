export interface Profile {
  education: any[];
  career: any[];
  introduction: string | null;
}

export interface Pledge {
  id: string;
  emoji: string;
  title: string;
  description: string | null;
  likes_count: number;
}

export interface Feed {
  id: string;
  type: string;
  title: string;
  content: string | null;
  summary: string | null;
  source_url: string | null;
  likes_count: number;
  published_at: string;
}

export interface Cheer {
  id: string;
  name: string;
  message: string;
  likes_count: number;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
}
