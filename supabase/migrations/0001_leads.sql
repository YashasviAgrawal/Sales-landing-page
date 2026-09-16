-- ============================================================================
--  0001 - LEADS
--
--  Applied by `npm run db:migrate`. Do not run this by hand and do not edit it
--  once it has been applied anywhere - a migration that has already run is
--  history, and changing history means two databases that claim to be at the
--  same version disagree about their shape. Corrections go in a new numbered
--  file.
--
--  Every statement is written to be safe to re-run, because this file was
--  originally pasted into the SQL editor by hand and may already have been
--  applied to a database that has no record of it.
--
--  SECURITY MODEL, stated up front because it is the thing most likely to be
--  broken by a well-meaning later change:
--
--    Row Level Security is ON and this table has NO policies. That is
--    deliberate, not an oversight. With RLS enabled and no policy, the anon
--    and authenticated keys - the ones that ship to the browser - can read
--    nothing and write nothing. Every real operation goes through the Next.js
--    server using the service role key, which bypasses RLS and never leaves
--    the server.
--
--    So: do not add a "public can insert" policy to make the contact form
--    work. It already works, through /api/leads. A public insert policy would
--    let anyone on the internet write rows directly into this table with a
--    key that is printed in the page source.
-- ============================================================================

-- ----------------------------------------------------------------------------
--  The lead status ladder.
--
--  Six states, in the order a lead actually moves through them, plus 'spam'
--  as the exit hatch. Kept as a CHECK constraint rather than a Postgres enum:
--  adding a value to an enum is a migration, editing a CHECK is one line, and
--  this list will change the first time the sales process does.
-- ----------------------------------------------------------------------------
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- What the form collects. Only name and email are required of the visitor;
  -- the other two are the qualifying detail and are frequently blank.
  name        text not null,
  email       text not null,
  website     text,
  context     text,

  -- What the admin panel writes back.
  status      text not null default 'new'
              check (status in ('new','contacted','qualified','won','lost','spam')),
  notes       text,

  -- Attribution, captured server-side so it cannot be spoofed by the form.
  -- Useful the first time someone asks "where do the good leads come from?"
  source      text default 'landing-book-form',
  referrer    text,
  user_agent  text,
  ip_hash     text
);

comment on table public.leads is
  'Contact form submissions from the landing page. Written only by the Next.js server via the service role key; see the security note at the top of schema.sql.';
comment on column public.leads.ip_hash is
  'Salted SHA-256 of the submitting IP. Stored instead of the raw address so duplicate and abuse detection stay possible without the site holding personal data it does not need.';

-- ----------------------------------------------------------------------------
--  Indexes.
--
--  The admin panel only ever sorts by newest-first and filters by status, so
--  those are the two that earn their keep. The trigram index backs the search
--  box, which does ILIKE '%term%' across name, email and website - a query a
--  plain B-tree cannot help with at all.
-- ----------------------------------------------------------------------------
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx     on public.leads (status);

create extension if not exists pg_trgm;
create index if not exists leads_name_trgm_idx    on public.leads using gin (name gin_trgm_ops);
create index if not exists leads_email_trgm_idx   on public.leads using gin (email gin_trgm_ops);
create index if not exists leads_website_trgm_idx on public.leads using gin (website gin_trgm_ops);

-- ----------------------------------------------------------------------------
--  updated_at maintenance.
--
--  In the database rather than the application, so a row edited from the
--  Supabase table editor gets the same treatment as one edited from the admin
--  panel. An updated_at the app maintains is an updated_at that lies the first
--  time anyone touches the data another way.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
--  Lock it down. See the security note at the top of this file.
-- ----------------------------------------------------------------------------
alter table public.leads enable row level security;

-- Belt and braces: even without policies, revoking the grants means the
-- browser-facing roles cannot so much as describe the table.
revoke all on public.leads from anon, authenticated;
