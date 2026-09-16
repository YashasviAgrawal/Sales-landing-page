import type { LeadStatus } from "@/lib/leads";
import type { PostStatus } from "@/lib/posts";

/*
  The database schema, as TypeScript sees it.

  supabase-js is generic over this type. Without it every table resolves to
  `never`, and the failure is genuinely confusing: `.insert({ name: "..." })`
  reports "Argument of type {...} is not assignable to parameter of type
  never", which reads like a problem with the object rather than a missing
  type parameter.

  With it, every query in the app is checked - a typo in a column name is a
  build error rather than a runtime PostgREST 400 nobody sees until a lead is
  lost.

  Hand-written rather than generated. `npx supabase gen types` is the usual
  route and is the right answer for a schema with thirty tables; this has one,
  and generating it would mean the Supabase CLI, a linked project and a login
  before anyone can run `npm run build`. The trade is that this file has to be
  kept in step with supabase/schema.sql by hand - they are the same contract
  written twice, so change them together.

  The three shapes per table are not redundant:
    Row     what comes back from a select
    Insert  what may be written; anything with a DEFAULT is optional
    Update  the same, all optional, because updates are partial
*/

type LeadRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  website: string | null;
  context: string | null;
  status: LeadStatus;
  notes: string | null;
  source: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_hash: string | null;
};

type PostRow = {
  id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: PostStatus;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  noindex: boolean;
  cover_url: string | null;
  cover_alt: string | null;
  tags: string[];
  author_name: string | null;
  reading_minutes: number;
};

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: LeadRow;
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          email: string;
          website?: string | null;
          context?: string | null;
          status?: LeadStatus;
          notes?: string | null;
          source?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          ip_hash?: string | null;
        };
        Update: Partial<LeadRow>;
        Relationships: [];
      };
      posts: {
        Row: PostRow;
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          slug: string;
          title: string;
          excerpt?: string | null;
          content?: string;
          status?: PostStatus;
          seo_title?: string | null;
          seo_description?: string | null;
          canonical_url?: string | null;
          noindex?: boolean;
          cover_url?: string | null;
          cover_alt?: string | null;
          tags?: string[];
          author_name?: string | null;
          reading_minutes?: number;
        };
        Update: Partial<PostRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
