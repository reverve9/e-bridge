export type Database = {
  public: {
    Tables: {
      candidates: {
        Row: {
          id: string;
          name: string;
          party: string;
          district: string;
          election_type: string;
          photo_url: string | null;
          slogan: string | null;
          subdomain: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['candidates']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['candidates']['Insert']>;
      };
      profiles: {
        Row: {
          candidate_id: string;
          birth_date: string | null;
          education: string | null;
          career: string | null;
          assets: string | null;
          contact: string | null;
        };
        Insert: Database['public']['Tables']['profiles']['Row'];
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      pledges: {
        Row: {
          id: string;
          candidate_id: string;
          category: string;
          title: string;
          content: string;
          priority: number;
        };
        Insert: Omit<Database['public']['Tables']['pledges']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['pledges']['Insert']>;
      };
      sns_links: {
        Row: {
          id: string;
          candidate_id: string;
          platform: string;
          url: string;
        };
        Insert: Omit<Database['public']['Tables']['sns_links']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['sns_links']['Insert']>;
      };
      news: {
        Row: {
          id: string;
          candidate_id: string;
          title: string;
          source: string;
          url: string;
          published_at: string;
          is_featured: boolean;
        };
        Insert: Omit<Database['public']['Tables']['news']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['news']['Insert']>;
      };
    };
  };
};
