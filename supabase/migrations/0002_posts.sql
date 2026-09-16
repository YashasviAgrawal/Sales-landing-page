-- ============================================================================
--  0002 - BLOG POSTS
--
--  Applied by `npm run db:migrate`. Never edit an applied migration; correct
--  it with a new numbered file.
--
--  SECURITY MODEL - and note it is deliberately NOT the same as leads.
--
--    Leads are private: RLS on, no policies at all, server-only access.
--
--    Posts are published writing. The whole point of them is to be read by
--    strangers and indexed by Google, so a SELECT policy for published rows
--    is not a weakening - it is the correct description of what they are. It
--    also buys real defence in depth for the thing here that IS private:
--    drafts. With the policy below, an unpublished post is invisible to the
--    anon key at the DATABASE level, so a future client component that
--    queries posts cannot leak a half-written article even if the developer
--    forgets to filter by status.
--
--    Writes have no policy, so creating, editing and deleting still happen
--    only through the Next.js server with the service role key.
-- ============================================================================

create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  /*
    Separate from created_at on purpose, and nullable until the post goes
    live. It is the date Google shows and the date the feed sorts by, so it
    has to be the date of PUBLICATION, not of the first draft - a post begun
    in March and finished in July is a July post. Nullable also means a draft
    carries no date to leak, and setting it by hand lets a post be backdated
    when it is migrated in from somewhere else.
  */
  published_at  timestamptz,

  /*
    The URL. Unique, because it addresses the page.

    Slugs are stable once published: changing one silently breaks every
    inbound link and every ranking the old URL earned, which is the most
    expensive mistake a blog can make. The admin panel warns before allowing
    it on a published post.
  */
  slug          text not null unique,

  title         text not null,

  /*
    One or two sentences. Does double duty as the card summary on the index
    and as the fallback meta description, which is why the editor counts
    characters against the ~155 Google will show.
  */
  excerpt       text,

  /* Markdown. Rendered to HTML on the server at request time. */
  content       text not null default '',

  status        text not null default 'draft'
                check (status in ('draft','published','archived')),

  /*
    SEO overrides. NULL means "derive it from the fields above", which is what
    almost every post should do.

    They exist because the <title> and the <h1> genuinely want to differ. The
    h1 is read by a person who has already arrived and can be short and
    human - "The seven links". The title tag is read in a search result by
    someone scanning ten of them, and wants the query in it - "The 7 places
    B2B revenue leaks (and how to find yours)". Forcing them to be the same
    string means one of the two jobs is always done badly.
  */
  seo_title       text,
  seo_description text,

  /*
    For a post also published elsewhere - a newsletter, Medium, a client's
    site. It tells Google which copy is the original so the two do not
    compete, and the duplicate does not cannibalise the ranking of the one
    you actually own.
  */
  canonical_url text,

  /*
    Live but deliberately not indexed. For a page that must exist and be
    linkable - a terms update, a landing page for one campaign, a thin post
    kept for a link - without adding a weak page to what Google has crawled
    of this domain.
  */
  noindex       boolean not null default false,

  /*
    The social card image and its alt text.

    alt is a separate column rather than something derived from the title
    because they are different sentences: the title names the article, the alt
    describes what is in the picture, and a screen reader that is handed the
    headline twice has learned nothing the second time.
  */
  cover_url     text,
  cover_alt     text,

  /*
    Postgres array rather than a join table. Tags here are a handful of
    strings used for filtering and for the tag line under a heading - there is
    no tag page, no tag description, nothing else hanging off a tag. A join
    table would be three more queries to render an index page and buy nothing
    until tags become first-class objects, at which point migrating to one is
    a contained job.
  */
  tags          text[] not null default '{}',

  author_name   text,

  /*
    Computed from the word count on save rather than at render.

    It goes in the JSON-LD as `timeRequired`, and Google has been known to
    show it, so it wants to be stable and cheap to read - not recalculated on
    every request from markdown that has not changed since the last one.
  */
  reading_minutes int not null default 1
);

comment on table public.posts is
  'Blog articles. Public reads are limited to published rows by RLS; all writes go through the Next.js server with the service role key.';

-- ----------------------------------------------------------------------------
--  Indexes
-- ----------------------------------------------------------------------------

/*
  The index that matters most. Every public page - the blog index, the
  sitemap, the RSS feed, the "more reading" block - asks the same question:
  published rows, newest first. The partial WHERE keeps drafts out of the
  index entirely, so it stays small and the planner can use it for exactly
  that query.
*/
create index if not exists posts_published_idx
  on public.posts (published_at desc)
  where status = 'published';

create index if not exists posts_status_idx  on public.posts (status);
create index if not exists posts_tags_idx    on public.posts using gin (tags);

/* Backs the admin search box, same reasoning as the leads table. */
create extension if not exists pg_trgm;
create index if not exists posts_title_trgm_idx on public.posts using gin (title gin_trgm_ops);

-- ----------------------------------------------------------------------------
--  updated_at
--
--  Reuses the trigger function created in 0001. It is `create or replace`
--  there, so it exists regardless of which order these ran in.
-- ----------------------------------------------------------------------------
drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
--  Row Level Security. See the note at the top of this file.
-- ----------------------------------------------------------------------------
alter table public.posts enable row level security;

drop policy if exists "published posts are public" on public.posts;
create policy "published posts are public"
  on public.posts
  for select
  to anon, authenticated
  using (
    status = 'published'
    and published_at is not null
    /*
      The scheduling half. A row published_at some point in the future is
      invisible until that moment arrives, enforced by the database rather
      than by whichever query remembered to check - so a post can be written
      on Friday and go live on Monday with nothing running in between.
    */
    and published_at <= now()
  );

/*
  SELECT only. No insert, update or delete policy exists, so the browser-facing
  keys can read published posts and nothing else - writing stays with the
  service role key on the server.
*/
grant select on public.posts to anon, authenticated;
