export type Course = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  cover_image: string | null;
  price_cents: number;
  expert_name: string | null;
  status: 'draft' | 'published' | 'archived';
  tags_json: string | null;
  created_at?: string;
};
