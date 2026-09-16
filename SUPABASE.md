# Database, admin panel and blog

The booking form writes leads to Supabase, `/admin` reads them, and `/admin/posts`
is a blog CMS whose articles are served from the same database at `/blog`.

Setup is one command. Read the next section and nothing else.

---

## Setup

```bash
npm install
npm run setup
```

`npm run setup` creates `.env` if it is missing, checks the keys, applies every
database migration, and offers to create your admin user. It stops at the first
thing it cannot do for you and tells you exactly what to paste where. It is safe
to run again as many times as you like.

You will be asked for four values, all from the Supabase dashboard:

| Variable | Dashboard location |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → Data API → Project URL. **Bare URL, no `/rest/v1`.** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API Keys → `anon` / publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API Keys → `service_role` → Reveal |
| `SUPABASE_DB_URL` | Project Settings → Database → Connection string → **Session pooler** |

Plus `ADMIN_EMAILS`, which is just the address you want to sign in with.

Then:

```bash
npm run dev
```

- <http://localhost:3000/admin> — leads
- <http://localhost:3000/admin/posts> — blog
- <http://localhost:3000/blog> — the public blog

Optionally, `npm run blog:seed` adds three SEO-ready articles as **drafts** to
start from. They are never published automatically.

### Why `SUPABASE_DB_URL` is separate

The service role key talks to the REST API, and the REST API cannot create a
table. Migrations need a real Postgres connection, so this is a second and
different credential. It is used **only** by `npm run db:migrate` — the app
never opens a Postgres socket — so it does not need to exist in production at
all. Run migrations from your laptop or from CI.

---

## Commands

| Command | What it does |
|---|---|
| `npm run setup` | Everything below, in order, with guidance. Start here. |
| `npm run db:migrate` | Applies pending migrations. Idempotent. |
| `npm run db:status` | Lists which migrations have run. Read-only. |
| `npm run admin:create` | Creates an admin user, or resets their password. |
| `npm run blog:seed` | Inserts three starter articles as drafts. |

`npm run admin:create -- you@company.com --generate-password` is the
non-interactive form. Press Enter at the password prompt to generate a strong
one rather than choosing your own — this account guards every lead the site
collects.

---

## Migrations

SQL lives in `supabase/migrations/`, numbered, applied in filename order, and
recorded in a `schema_migrations` table so a database can say what it has had.

```
supabase/migrations/
  0001_leads.sql     the leads table, indexes, RLS
  0002_posts.sql     the posts table, indexes, RLS
```

**To change the schema, add a new numbered file.** Never edit one that has
already been applied — the edit does not reach any database that ran the old
version, and two environments then silently disagree about their shape.
`db:migrate` checksums each file and warns when this has happened.

Each file runs inside its own transaction, so a failure halfway through leaves
nothing behind. Fix the file, run again.

After a schema change, update `lib/supabase/database.types.ts` to match. It and
the SQL are the same contract written twice — once for Postgres, once for
TypeScript — and they have to change together or the build starts lying about
what the database contains.

---

## Security model

Two tables, two deliberately different models. The difference is the point.

**`leads` — private.** RLS is on with **no policies at all**, and the grants are
revoked. The keys that ship to the browser can read nothing and write nothing.
Every operation goes through the Next.js server with the service role key.

> If the contact form ever breaks, **do not fix it by adding a public insert
> policy.** It already works, through `/api/leads`. A public insert policy would
> let anyone on the internet write rows using a key printed in the page source.

**`posts` — published writing.** A SELECT policy exposes rows that are
`published`, dated, and not scheduled for the future. That is not a weakening —
it is an accurate description of what a blog post is — and it buys real defence
in depth for the part that *is* private: an unpublished draft is invisible to
the anon key at the database level, so a future client component cannot leak a
half-written article even if someone forgets to filter by status. Writes still
have no policy, so creating and editing stay server-side.

**Admin access needs two things**, and both are checked on the server:

1. A verified Supabase session (`getClaims()` — the signature is checked, not
   just the cookie).
2. The email on the `ADMIN_EMAILS` allowlist.

A Supabase project will issue a valid session to any account in it, so the
allowlist is what separates "has an account" from "may read the leads table".
An empty `ADMIN_EMAILS` denies everyone, which is the correct direction to fail.

`middleware.ts` redirects signed-out visitors away from `/admin`, but that is a
routing convenience, not the boundary. The boundary is `requireAdmin()` in
`lib/admin-auth.ts`, called inside every admin page and every write.

> **Every new Server Action calls `requireAdmin()` first.** A `"use server"`
> export is a public HTTP endpoint with a generated name. The middleware matcher
> does not protect it. A missing `requireAdmin()` is a hole straight into the
> database.

---

## The blog

### What makes these pages rank

Nothing here is a trick; it is the ordinary list, done completely.

| | Where |
|---|---|
| Server-rendered HTML, ISR-cached | `app/blog/[slug]/page.tsx` |
| Per-post `<title>` and meta description, with overrides | `lib/posts.ts` → `seoTitle`, `seoDescription` |
| Canonical URL on every page | `generateMetadata`, `lib/site-url.ts` |
| `BlogPosting` + `BreadcrumbList` JSON-LD | `app/blog/[slug]/page.tsx` |
| OpenGraph + Twitter cards, generated per post | `app/blog/[slug]/opengraph-image.tsx` |
| `sitemap.xml` with real `lastModified` | `app/sitemap.ts` |
| `robots.txt` pointing at the sitemap | `app/robots.ts` |
| RSS feed | `app/blog/feed.xml/route.ts` |
| Internal linking (nav, breadcrumbs, related posts) | index, post page, `listRelatedPosts` |
| Heading hierarchy — one H1, anchored H2s | `lib/markdown.ts` |
| No layout shift on images | `aspect-ratio` in `globals.css` |
| Live SEO checklist while writing | `lib/posts.ts` → `seoChecks` |

The post pages are statically generated and revalidated hourly; publishing from
the panel invalidates the affected paths immediately, so a new post is live at
once rather than at the next deploy.

### The two rules that matter most when writing

**Never change the slug of a published post.** It breaks every inbound link and
discards whatever ranking that URL earned. The editor shows a red warning when
you try.

**Never move `published_at` backwards or forwards on an edit.** The code already
protects this — a re-publish keeps the original date — because the publication
date is a fact, and a two-year-old article that claims to be new is one Google
learns not to trust.

### Markdown

Standard GFM. Raw HTML is stripped, and only `http(s)`, root-relative, `#`,
`mailto:` and `tel:` links survive — so `javascript:` URLs cannot be smuggled in.

Use `##` for sections. The page renders the post title as the only `<h1>`, and
body headings are shifted down one level automatically.

### Setting the live domain

Set `NEXT_PUBLIC_SITE_URL` in production, with no trailing slash:

```
NEXT_PUBLIC_SITE_URL="https://salesbrain.in"
```

Canonical tags, sitemap entries, RSS links and OpenGraph URLs all have to be
absolute and all have to agree. Without this on a custom domain, every canonical
tag points at the `.vercel.app` address and your real domain is treated as the
duplicate.

---

## Deploying

Set the environment variables in the host's settings — on Vercel, Project →
Settings → Environment Variables. `SUPABASE_DB_URL` is not needed there.

Run `npm run db:migrate` against production once per schema change, from your
laptop or a CI step.

Two things worth knowing:

- **Missing keys do not take the site down.** The build succeeds, the landing
  page renders, the booking form falls back to opening the visitor's email
  client, and `/admin` explains what is unconfigured. A half-wired CRM should
  never break the marketing site.
- **The rate limiter is per-instance.** `lib/rate-limit.ts` keeps counters in
  memory, so across several serverless instances the effective limit multiplies.
  Fine for what it guards against — a bored script, not a funded attacker. If it
  ever needs to be real, use Upstash Redis rather than tuning the numbers.

After the first deploy, submit the sitemap once in Google Search Console
(`https://yourdomain.com/sitemap.xml`). It is the only step in this document
that has no script.

---

## Troubleshooting

**"Invalid path specified in request URL"** — `NEXT_PUBLIC_SUPABASE_URL` has a
path on it. Use the bare project URL; supabase-js appends `/rest/v1` itself.

**"Could not find the table 'public.posts' in the schema cache"** — migrations
have not run. `npm run db:migrate`.

**Sign-in says the credentials don't match, and they do** — the address is not
in `ADMIN_EMAILS`, or the user was created without confirmation. Run
`npm run admin:create` with that address; it confirms the user and tells you if
the allowlist is the problem. Restart the dev server after editing `.env`.

**`db:migrate` says "Network unreachable"** — that is the IPv6 direct
connection string. Use the **Session pooler** one.

**`db:migrate` says "password authentication failed"** — reset the database
password at Project Settings → Database. It is not used anywhere else in this
project, so resetting it breaks nothing.

**A published post does not appear on `/blog`** — check `published_at` is not in
the future, and that the post is not flagged "Hide from search engines" (that
only affects indexing, not listing). Otherwise the page cache is stale; it
clears within the hour, or immediately on the next save.

**Form submits but nothing appears in the panel** — check the server console.
Insert failures are logged there in full; the visitor only sees a short message,
because a database error can name tables and columns.
