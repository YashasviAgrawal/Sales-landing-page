import "server-only";

import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isPostStatus, type Post } from "@/lib/posts";

/*
  Reading posts.

  Two families of function, and the difference between them is the whole
  security model of the blog:

    getPublished* / listPublished*   filtered to live posts. Safe for public
                                     pages. A draft cannot come back from
                                     these even if the caller asks by slug.

    admin*                           unfiltered. Every caller must have
                                     passed requireAdmin() first.

  Naming them apart is deliberate: `getPost(slug)` on a public page that
  quietly returns a draft is a mistake nobody notices until an unfinished
  article is indexed, and by then it is in someone's search results.
*/

const PUBLIC_COLUMNS =
  "id,created_at,updated_at,published_at,slug,title,excerpt,content,status,seo_title,seo_description,canonical_url,noindex,cover_url,cover_alt,tags,author_name,reading_minutes";

/*
  React's `cache` dedupes within a single render pass.

  A post page calls getPublishedPost for the article, and generateMetadata
  calls it again for the title and description - Next runs those separately,
  so without this every page render is two identical round trips. The cache
  is per-request, so it never serves one visitor's data to another.
*/
export const getPublishedPost = cache(
  async (slug: string): Promise<Post | null> => {
    const { data, error } = await supabaseAdmin()
      .from("posts")
      .select(PUBLIC_COLUMNS)
      .eq("slug", slug)
      .eq("status", "published")
      /*
        The scheduling guard, repeated here even though the RLS policy also
        enforces it. This client uses the service role key, which bypasses
        RLS entirely - so on this path the policy is not protecting anything
        and the filter has to be explicit.
      */
      .lte("published_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error("[posts] fetch failed:", error.message);
      return null;
    }

    return (data as Post | null) ?? null;
  },
);

export type PublishedListOptions = {
  limit?: number;
  offset?: number;
  tag?: string;
  /** Omit this slug — for the "more reading" block on a post page. */
  excludeSlug?: string;
};

export async function listPublishedPosts(
  options: PublishedListOptions = {},
): Promise<{ posts: Post[]; total: number }> {
  const { limit = 12, offset = 0, tag, excludeSlug } = options;

  let query = supabaseAdmin()
    .from("posts")
    .select(PUBLIC_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (tag) query = query.contains("tags", [tag]);
  if (excludeSlug) query = query.neq("slug", excludeSlug);

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("[posts] list failed:", error.message);
    return { posts: [], total: 0 };
  }

  return { posts: (data ?? []) as Post[], total: count ?? 0 };
}

/**
 * Every published slug, for the sitemap and for generateStaticParams.
 * Columns are kept to the minimum — the sitemap needs two fields, and pulling
 * the body of every article to build it would be pointless work.
 */
export async function listPublishedSlugs(): Promise<
  { slug: string; updated_at: string; published_at: string | null }[]
> {
  const { data, error } = await supabaseAdmin()
    .from("posts")
    .select("slug,updated_at,published_at")
    .eq("status", "published")
    .eq("noindex", false)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(5_000);

  if (error) {
    console.error("[posts] slug list failed:", error.message);
    return [];
  }

  return data ?? [];
}

/** Distinct tags across published posts, most used first. */
export async function listTags(): Promise<{ tag: string; count: number }[]> {
  const { data, error } = await supabaseAdmin()
    .from("posts")
    .select("tags")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());

  if (error) {
    console.error("[posts] tag list failed:", error.message);
    return [];
  }

  /*
    Counted in JavaScript rather than with a Postgres unnest + group by.
    It needs one array column from published posts - a few kilobytes at any
    plausible size for this blog - and doing it here avoids adding an RPC
    function that would then need its own migration and its own permissions.
    Revisit at a few thousand posts.
  */
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    for (const tag of (row as { tags: string[] }).tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/*
  "More reading" on a post page.

  Posts that share a tag first, then recent ones to fill the gap. Not a
  relevance model - just the cheapest thing that beats "three most recent",
  and the reason it is here at all is internal linking: every related-post
  link is a path a crawler can follow to an article that might otherwise have
  nothing pointing at it.
*/
export async function listRelatedPosts(
  post: Post,
  limit = 3,
): Promise<Post[]> {
  const collected: Post[] = [];
  const seen = new Set([post.slug]);

  if (post.tags.length > 0) {
    const { data } = await supabaseAdmin()
      .from("posts")
      .select(PUBLIC_COLUMNS)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .neq("slug", post.slug)
      .overlaps("tags", post.tags)
      .order("published_at", { ascending: false })
      .limit(limit);

    for (const row of (data ?? []) as Post[]) {
      if (!seen.has(row.slug)) {
        collected.push(row);
        seen.add(row.slug);
      }
    }
  }

  if (collected.length < limit) {
    const { posts } = await listPublishedPosts({
      limit: limit + seen.size,
      excludeSlug: post.slug,
    });
    for (const row of posts) {
      if (collected.length >= limit) break;
      if (!seen.has(row.slug)) {
        collected.push(row);
        seen.add(row.slug);
      }
    }
  }

  return collected.slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/*  Admin reads — unfiltered. requireAdmin() before any of these.             */
/* -------------------------------------------------------------------------- */

export const ADMIN_PAGE_SIZE = 20;

export async function adminListPosts(filters: {
  q?: string;
  status?: string;
  page?: number;
}): Promise<{ posts: Post[]; total: number; page: number; pageCount: number }> {
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const from = (page - 1) * ADMIN_PAGE_SIZE;

  let query = supabaseAdmin()
    .from("posts")
    .select(PUBLIC_COLUMNS, { count: "exact" })
    /*
      Newest activity first, by updated_at rather than published_at - the
      admin list is a work queue, and a draft touched an hour ago belongs at
      the top even though it has no publication date at all.
    */
    .order("updated_at", { ascending: false });

  if (isPostStatus(filters.status)) query = query.eq("status", filters.status);

  /* Same filter-grammar sanitising as the leads search; see leads-query.ts. */
  const term = (filters.q ?? "")
    .replace(/[,()%*\\"':]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

  if (term) {
    query = query.or(
      [`title.ilike.%${term}%`, `slug.ilike.%${term}%`, `excerpt.ilike.%${term}%`].join(","),
    );
  }

  const { data, error, count } = await query.range(
    from,
    from + ADMIN_PAGE_SIZE - 1,
  );

  if (error) {
    console.error("[admin/posts] list failed:", error.message);
    return { posts: [], total: 0, page, pageCount: 1 };
  }

  const total = count ?? 0;
  return {
    posts: (data ?? []) as Post[],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
  };
}

export async function adminGetPost(id: string): Promise<Post | null> {
  const { data, error } = await supabaseAdmin()
    .from("posts")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin/posts] fetch failed:", error.message);
    return null;
  }

  return (data as Post | null) ?? null;
}

export async function adminPostStats(): Promise<{
  total: number;
  published: number;
  drafts: number;
}> {
  const db = supabaseAdmin();
  const head = () => db.from("posts").select("id", { count: "exact", head: true });

  const [total, published, drafts] = await Promise.all([
    head(),
    head().eq("status", "published"),
    head().eq("status", "draft"),
  ]);

  const value = (r: { count: number | null; error: unknown }) =>
    r.error ? 0 : (r.count ?? 0);

  return {
    total: value(total),
    published: value(published),
    drafts: value(drafts),
  };
}

/** True when another post already owns this slug. */
export async function slugTaken(
  slug: string,
  exceptId?: string,
): Promise<boolean> {
  let query = supabaseAdmin().from("posts").select("id").eq("slug", slug);
  if (exceptId) query = query.neq("id", exceptId);

  const { data, error } = await query.limit(1);
  if (error) return false;
  return (data ?? []).length > 0;
}
