# Sales Brain — technical documentation

Complete reference for the Sales Brain website: what every part of it does,
why it was built that way, and what must not be broken.

Written for developers. If you are the client and want the operating manual
rather than the source-code tour, read [HANDOVER.md](HANDOVER.md) instead.

**Last verified against the codebase:** 18 September 2026, commit `3e751e3`,
`npm run build` passing (20 routes).

---

## Contents

1. [What this is](#1-what-this-is)
2. [Stack and versions](#2-stack-and-versions)
3. [Repository map](#3-repository-map)
4. [Running it locally](#4-running-it-locally)
5. [Environment variables](#5-environment-variables)
6. [The design system](#6-the-design-system)
7. [Content architecture](#7-content-architecture)
8. [The landing page, section by section](#8-the-landing-page-section-by-section)
9. [Component reference](#9-component-reference)
10. [Motion system](#10-motion-system)
11. [The database](#11-the-database)
12. [Lead capture pipeline](#12-lead-capture-pipeline)
13. [The admin panel](#13-the-admin-panel)
14. [The blog](#14-the-blog)
15. [SEO surface](#15-seo-surface)
16. [Security model](#16-security-model)
17. [Scripts and commands](#17-scripts-and-commands)
18. [Build and deployment](#18-build-and-deployment)
19. [Accessibility](#19-accessibility)
20. [Known placeholders and outstanding work](#20-known-placeholders-and-outstanding-work)
21. [Things not to break](#21-things-not-to-break)

---

## 1. What this is

A single-page conversion site for **Sales Brain**, a sales-diagnostic
consultancy in Jaipur, India, with a blog, a lead-capture form, and a
self-hosted admin panel behind it.

**The positioning the whole site is built on** — stated once in
[lib/content.ts](lib/content.ts) and never paraphrased:

| | |
|---|---|
| Big idea | It isn't a sales problem. It's a process problem, and the process breaks in exactly one place. |
| Mechanism | The Revenue Leak Audit — a diagnosis before a prescription. |
| The enemy | Guesswork. Buying solutions for an undiagnosed problem. |
| One line | Every agency sells you a cure. We find the disease first. |

Everything else follows from that. The page has **one action** — book the free
45-minute audit — and one CTA label repeated at four placements. There is no
pricing section, deliberately: the audit is free and the cost of the repair
depends on which of the seven links is broken, so a price list would
contradict the FAQ.

### The three subsystems

| Subsystem | Routes | Data |
|---|---|---|
| **Marketing site** | `/`, `/terms`, `/privacy`, `/404` | Static, from `lib/content.ts` |
| **Blog** | `/blog`, `/blog/[slug]`, `/blog/feed.xml` | Supabase `posts` table, ISR-cached |
| **Admin panel** | `/admin`, `/admin/posts`, `/admin/login` | Supabase `leads` + `posts`, auth-gated |

---

## 2. Stack and versions

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | Next.js App Router | 15.5.25 | Server Components by default; `"use client"` is opt-in |
| Runtime | React | 19 | |
| Language | TypeScript | 5.7 | `strict: true`, `@/*` path alias to repo root |
| Styling | Tailwind CSS | v4 | **CSS-first — there is no `tailwind.config.js`.** Tokens live in `@theme` in [app/globals.css](app/globals.css) |
| PostCSS | `@tailwindcss/postcss` | 4 | Only plugin; see [postcss.config.mjs](postcss.config.mjs) |
| Animation | Motion (`motion/react`) | 11 | 22 components use it |
| Animation (one case) | GSAP | 3.15 | Only [components/ui/animated-footer.tsx](components/ui/animated-footer.tsx) |
| Icons | `@phosphor-icons/react` | 2.1 | 9 components |
| Fonts | `geist` (Sans + Mono) | 1.3 | Self-hosted via `next/font`, no network request |
| Markdown | `marked` | 18 | Server-side only, custom renderer |
| Database | Supabase (Postgres) | `supabase-js` 2.116, `@supabase/ssr` 0.12 | |
| Migrations | `pg` | 8.23 | **Scripts only.** The app never opens a Postgres socket |
| Utilities | `clsx`, `tailwind-merge`, `server-only` | | `cn()` helper in [lib/utils.ts](lib/utils.ts) |

`lucide-react` is a dependency but is only imported by
[components/ui/mega-menu-navbar.tsx](components/ui/mega-menu-navbar.tsx),
which nothing renders. See [§9.4](#94-unused-components).

---

## 3. Repository map

```
salesbrain/
├── app/                              Next.js App Router
│   ├── layout.tsx                    Root layout: fonts, site metadata,
│   │                                 Organization + WebSite JSON-LD, cursor
│   ├── page.tsx                      The landing page — 12 sections in order,
│   │                                 plus FAQPage/Service/WebPage JSON-LD
│   ├── globals.css                   THE design system. Tokens, rhythm,
│   │                                 washes, article prose, keyframes
│   ├── not-found.tsx                 Branded 404, noindex, canonical: null
│   ├── manifest.ts                   /manifest.webmanifest
│   ├── robots.ts                     /robots.txt
│   ├── sitemap.ts                    /sitemap.xml (ISR 1h)
│   ├── opengraph-image.tsx           Generated 1200×630 card for /
│   ├── icon.png / apple-icon.png / favicon.ico
│   ├── terms/page.tsx                Renders legal.terms from content.ts
│   ├── privacy/page.tsx              Renders legal.privacy
│   ├── api/leads/route.ts            The ONE public write path (POST)
│   ├── blog/
│   │   ├── page.tsx                  Index, paginated, tag-filterable
│   │   ├── opengraph-image.tsx       Generated card for /blog
│   │   ├── feed.xml/route.ts         Hand-built RSS 2.0
│   │   └── [slug]/
│   │       ├── page.tsx              Article. ISR 1h + generateStaticParams
│   │       ├── post-body.tsx         Server Component: prose + sticky TOC
│   │       └── opengraph-image.tsx   Generated per-post card
│   └── admin/
│       ├── layout.tsx                noindex metadata wrapper
│       ├── page.tsx                  Leads table + stats + filters
│       ├── actions.ts                signIn, signOut, lead status/notes/delete
│       ├── filters.tsx               Search + status filter (client)
│       ├── lead-row.tsx              One expandable lead row (client)
│       ├── export/route.ts           GET → CSV of the current filter
│       ├── login/{page,login-form}.tsx
│       └── posts/
│           ├── page.tsx              Post list + stats
│           ├── actions.ts            create/update/setStatus/delete/duplicate
│           ├── post-editor.tsx       The editor (client) + live SEO checks
│           ├── post-row.tsx          One post row
│           ├── new/page.tsx
│           └── [id]/page.tsx
│
├── components/
│   ├── header.tsx  footer.tsx        Site chrome
│   ├── hero.tsx … book.tsx           The 12 landing-page sections
│   ├── legal-page.tsx                Shared shell for /terms and /privacy
│   ├── admin/admin-nav.tsx
│   ├── blog/{post-card,post-cover}.tsx
│   └── ui/                           Primitives + registry components
│
├── lib/
│   ├── content.ts                    ★ SINGLE SOURCE OF TRUTH for copy
│   ├── site-url.ts                   The one answer to "what is our address?"
│   ├── utils.ts                      cn()
│   ├── rate-limit.ts                 In-memory fixed-window limiter
│   ├── admin-auth.ts                 ★ THE authorisation boundary
│   ├── leads.ts                      Lead type, validation, CSV, formatting
│   ├── leads-query.ts                Lead reads (service role)
│   ├── posts.ts                      Post type, slugs, SEO rules, validation
│   ├── posts-query.ts                Post reads, public + admin families
│   ├── markdown.ts                   marked → HTML + TOC, server-only
│   └── supabase/{env,admin,server,middleware,database.types}.ts
│
├── supabase/migrations/
│   ├── 0001_leads.sql
│   └── 0002_posts.sql
│
├── scripts/
│   ├── setup.mjs                     `npm run setup` — the one command
│   ├── migrate.mjs                   Checksummed, transactional migrations
│   ├── create-admin.mjs              Create/reset an admin user
│   ├── seed-posts.mjs                Three starter articles, as drafts
│   └── lib/env.mjs                   .env loader + ANSI styling
│
├── public/
│   ├── brand/mark.png                The logo mark used in header/footer/404
│   ├── audit-glasses.jpg             The Call section photograph
│   ├── audit-lens.png
│   ├── animated-footer/funnel-{left,right}.svg
│   └── Sales_brain*.png              Supplied logo variants
│
├── middleware.ts                     Scoped to /admin/:path* only
├── next.config.ts                    Empty — no remote image hosts declared
├── README.md                         ⚠ Partly stale — see §20
└── SUPABASE.md                       Database/admin/blog operations guide
```

**Empty directories:** `db/migrations/` and `lib/auth/` exist on disk but are
empty and untracked. They are leftovers from an abandoned migration away from
Supabase Auth. Safe to delete.

---

## 4. Running it locally

```bash
npm install
npm run setup     # creates .env, checks keys, runs migrations, offers admin user
npm run dev       # http://localhost:3000
```

| URL | What |
|---|---|
| `http://localhost:3000` | The landing page |
| `http://localhost:3000/blog` | Blog index |
| `http://localhost:3000/admin` | Leads (redirects to login) |
| `http://localhost:3000/admin/posts` | Blog CMS |

`npm run setup` is idempotent — run it as often as you like. It stops at the
first thing it cannot do for you and tells you exactly what to paste where.

---

## 5. Environment variables

All seven live in `.env` (gitignored). [.env.example](.env.example) is the
committed template and carries a full explanation of each.

| Variable | Required | Exposed to browser | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Project URL. **Bare, no `/rest/v1`** — supabase-js appends that itself |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Admin sign-in only. Grants nothing on `leads` (RLS, no policies) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Never** | Bypasses RLS entirely. Every real read/write uses it |
| `SUPABASE_DB_URL` | Migrations only | No | Direct Postgres (**Session pooler**). Not needed in production |
| `ADMIN_EMAILS` | Yes | No | Comma-separated allowlist. Empty denies everyone |
| `NEXT_PUBLIC_SITE_URL` | Production | Yes | Canonical origin, no trailing slash |
| `LEAD_IP_SALT` | Optional | No | Salt for the one-way IP hash. Falls back to the service key |

**Why `SUPABASE_DB_URL` is separate:** the service role key talks to the REST
API, and the REST API cannot create a table. Migrations need a real Postgres
connection, so this is a second and different credential — used **only** by
`npm run db:migrate`. Leave it out of production entirely and run migrations
from a laptop or CI.

**Missing keys do not take the site down.** `isSupabaseConfigured()` in
[lib/supabase/env.ts](lib/supabase/env.ts) is checked at every boundary: the
build succeeds, the landing page renders, the booking form falls back to
opening the visitor's email client, and `/admin` explains what is
unconfigured. A half-wired CRM should never break the marketing site.

---

## 6. The design system

All of it lives in the `@theme` block of
[app/globals.css](app/globals.css#L28-L75). There is no `tailwind.config.js` —
Tailwind v4 reads tokens from CSS.

### 6.1 Colour tokens

| Token | Value | Use |
|---|---|---|
| `--color-ink-950` | `#000000` | Page ground. True black |
| `--color-ink-900` | `#0a0d0b` | Alternating section ground |
| `--color-ink-850` | `#0f1311` | Raised panels |
| `--color-ink-800` | `#151a17` | Inline code, deeper panels |
| `--color-ink-700` | `#202823` | Highest surface step |
| `--color-paper` | `#eaf2ed` | Headings, figures |
| `--color-body` | `#9daea5` | Body copy |
| `--color-muted` | `#64756b` | Labels, secondary rows |
| `--color-signal` | `#3ddc97` | **The single accent — mint** |
| `--color-signal-lift` | `#6ae9b4` | CTA hover |
| `--color-signal-deep` | `#0f5c3d` | Base under hatched fills |
| `--color-aura` | `#0f7a4f` | Ambient washes only. Never type, never a control |
| `--color-rise` | `#3ddc97` | Direction of travel: up |
| `--color-fall` | `#e879f9` | Direction of travel: down. The only non-green value |
| `--radius-surface` | `12px` | Every non-pill surface |

**The ground is black and the green lives in the light, not the surfaces.** An
earlier palette tinted every surface green, which left the mint CTA sitting on
a field of its own colour with nothing to push against. Mint on black is
11.1:1 both ways — as type on the ground, and as a fill under ink. That
symmetry is why there is one accent value rather than a two-role split. **Mint
fills always carry dark text**; mint under white is 1.8:1 and unreadable.

**The mint accent belongs to calls to action.** Not to eyebrows, labels, hover
states, links or background washes — those use `--color-muted`,
`--color-body`, or the aura washes. Keeping the accent scarce is what makes
the four CTAs read as the only thing to do on the page.

### 6.2 Locked rules

These are load-bearing. Breaking one is a visible regression:

- **One accent on the whole page.** Mint, nothing else.
- **One theme.** Every section is dark. There is no inverted section and no
  light mode. `<html class="dark">` is set unconditionally in the root layout
  so registry components' paired `bg-x dark:bg-y` classes resolve to their
  dark half regardless of the visitor's OS setting.
- **Shape:** interactive elements are full pill, surfaces are 12px. Nothing else.
- **Hairline dividers** at `rgb(255 255 255 / 0.09)` — the `.hairline` utility —
  instead of card borders wherever grouping is enough.
- **Type scale:** display uses `.display-tight` (`-0.035em` tracking,
  `1.02` line-height) with a `clamp`-style responsive size per section;
  body 15–17px at ~1.7 line-height.
- **Exactly one marquee** on the page (the Voices strip).

### 6.3 Layout utilities

| Utility | Mobile | ≥768px | Why |
|---|---|---|---|
| `.section-y` | `3.5rem` / `3rem` | `6rem` / `5rem` | **Sized for the seam, not one side of it.** A section boundary is the *sum* of two paddings — `py-24` on both sides is 192px, not 96px. Asymmetric on purpose: more room below a divider than above, because what follows a seam is always a display heading that needs the lead-in |
| `.gutter-x` | `max(1.25rem, safe-area)` | `max(2rem, safe-area)` | Replaces the `px-5 md:px-8` that was repeated in twelve places, and adds a notched-phone-in-landscape floor |
| `.display-tight` | — | — | Display tracking and leading |
| `.hairline` | — | — | The one divider colour |
| `.tap-area` | — | — | Grows a small control's touch target via an absolutely positioned `::before`, without moving anything on screen. Height is set per case with `--tap` |
| `.link-underline` | — | — | Nav underline that draws in from the left on hover |

### 6.4 Decorative utilities

| Class | What it paints |
|---|---|
| `.grain` | ~400-byte inline SVG fractal-noise tile, `mix-blend-mode: screen`, 8s stepped drift. Screen not overlay — overlay against `#000` resolves to `#000` and the grain vanished exactly where banding shows |
| `.hero-vignette` | Radial edge fall-off. Transparent across the middle 46%, so nothing is laid over the headline or button |
| `.hl-accent` | The mint italic accent words in the hero, lit from behind, with an underline rule that draws itself once at 1.45s. Cancelled outright under reduced motion |
| `.wash-book` / `.wash-close` | Ambient aura washes behind the closing section |
| `.glow-cta` / `.glow-panel` | Spread-negative, heavily offset green shadows. `glow-cta` under the one button that matters; `glow-panel` pools under a surface so it lifts off the black |
| `.vignette-photo` | Dissolves a photograph's edges into the ground so it emerges from the page rather than sitting on it |
| `.lens-glow` | The one sharp point on the audit photograph, sized onto the lens |
| `.wash-sweep` | The pale sweep that crosses the hero every few seconds |
| `.hatch` | Banded gradient fill for small bars — reads as "measured so far" rather than "this is the value". ⚠ **Currently unused**, orphaned with the hero pipeline |
| `.marquee-track` / `-reverse` | 42s / 54s linear loops, paused on hover via `.marquee-pause` |
| `.card-in` | Blog card entrance. **A plain CSS animation, not a scroll reveal** — see [§21](#21-things-not-to-break) |

### 6.5 Global base rules worth knowing

- **`html { overflow-x: clip }`** — not `hidden`. `overflow-x: hidden` forces
  the other axis to `auto`, which turns the root into a scroll container and
  breaks `position: sticky`; the Call section's photograph is sticky on large
  screens. `clip` creates no scroll container, so sticky, smooth scrolling and
  the scroll-spy all keep working.
- **16px form fields below `md`, declared *outside* any `@layer`.** iOS Safari
  zooms the page when a focused control is under 16px and does not zoom back
  out. The fields set their size with a Tailwind utility, and utilities beat
  `@layer base`, so this rule is unlayered — unlayered declarations beat every
  layered one, which is what makes it hold without `!important`. **Do not move
  it into `@layer base`.**
- `-webkit-tap-highlight-color: transparent` and `touch-action: manipulation`
  on all interactive elements: the iOS grey flash is the wrong colour on a
  black page, and `manipulation` drops the 300ms double-tap delay.
- `:focus-visible` is a 2px mint outline at 3px offset, everywhere.
- `prefers-reduced-motion` collapses every animation and transition to
  0.001ms and switches `scroll-behavior` to `auto`.
- `.prose-post` (article typography) is scoped so it can never reach the
  landing page. Body measure is capped at 68ch. Article images get an
  `aspect-ratio: 16/9` box so the page does not reflow as they load.

---

## 7. Content architecture

**[lib/content.ts](lib/content.ts) is the single source of truth for every
visible string on the marketing site.** Nothing else hard-codes copy. Blog
articles are the one exception — they live in the database.

### 7.1 Exports

| Export | Shape | Feeds |
|---|---|---|
| `brand` | `{ name, domain, bookingUrl, quizUrl, email, founder, city, tagline }` | Everything absolute, all JSON-LD, every CTA target |
| `nav` | 4 × `{ label, href }` | Header pill, mobile panel, footer |
| `CTA` | The string | **All four CTA placements** |
| `hero` | eyebrow, headline, sub, CTAs, risk, 3 trust claims | `<Hero>` |
| `links` | 7 × `Link` | Hero pipeline, `<Mechanism>`, `<Diagnose>` |
| `voices` | 8 strings | `<Voices>` marquee |
| `symptomCheck` | heading, lead, scale, 7 probes, result copy | `<Diagnose>` |
| `problem` | heading, 3 asks, 2 body lines | `<Problem>` |
| `mechanism` | heading, lead, closer | `<Mechanism>` |
| `steps` | heading, 3 items | `<Steps>` |
| `fixes` | heading, lead, 9 items, closer | `<Fixes>` |
| `proof` | heading, lead, `hasReviews`, 6 reviews, `fallback` | `<Proof>` |
| `fit` | heading, yes/no lists, closer | `<Fit>` |
| `call` | heading, lead, 4 steps, closer | `<Call>` |
| `faqs` | 6 × `{ q, a }` | `<Faq>` **and the FAQPage JSON-LD** |
| `book` | heading, lead, scarcity, PS, field labels, all form states | `<Book>` |
| `legal` | `terms` + `privacy`, each `{ title, updated, sections[] }` | `/terms`, `/privacy` |

### 7.2 The `Link` type — the seven links of the revenue chain

```ts
type Link = {
  id: string;        // "offer" | "message" | … — stable, referenced by id
  n: number;         // 1–7
  name: string;      // "Offer"
  question: string;  // the one line the reader sees first
  definition: string;
  symptoms: string[];
  fix: string;
  flow: number;      // 0–100. Currently UNUSED — see below
};
```

| # | id | Name | `flow` |
|---|---|---|---|
| 1 | `offer` | Offer | 100 |
| 2 | `message` | Message | 88 |
| 3 | `leads` | Leads | 74 |
| 4 | `funnel` | Funnel | 58 |
| 5 | `conversion` | Conversion | 31 |
| 6 | `pricing` | Pricing | 26 |
| 7 | `ecosystem` | Ecosystem | 19 |

`links` is consumed in three places: the hero tooltip enumerates `name` (from
the array, never a second copy — so a renamed link cannot leave a stale
enumeration in the first viewport), `<Mechanism>` renders `question`,
`definition`, `symptoms` and `fix` in its selector panel, and `<Diagnose>`
maps one probe per `id`.

> ⚠ **`flow` is currently read by nothing.** It fed the narrowing pipeline
> diagram that used to sit in the hero; that diagram was removed (see §8) and
> the field was left behind. Either delete it or give it a consumer — a typed
> field nothing reads is a field the next person will trust and be wrong
> about. The `.hatch` CSS utility is orphaned for the same reason.

### 7.3 One CTA label, four placements

`CTA = "Book My Free Sales Audit"` is a constant so the hero, the Steps
section, the quiz result and the form submit cannot drift apart. The arrow is
added by the button components, never typed into the string.

`hero.navCta = "Book My Sales Audit"` is the **one deliberate exception**: the
header pill is a persistent reminder rather than a fifth ask, and at 14px the
full label crowds the wordmark off the line on a small laptop.

---

## 8. The landing page, section by section

[app/page.tsx](app/page.tsx) renders twelve sections. **The order is an
argument, and each section only earns its place by setting up the next.**

| # | Component | Anchor | Job | CTA |
|---|---|---|---|---|
| 1 | `<Hero>` | `#top` | The claim: the leak is in one place | ✅ |
| 2 | `<Voices>` | — | Recognition, in the founder's own sentences (the marquee) | |
| 3 | `<Problem>` | `#problem` | The reframe, opening on the line the marquee sets up | |
| 4 | `<Mechanism>` | `#mechanism`, `#how` | The seven links — "one place" becomes specific | |
| 5 | `<Diagnose>` | `#diagnose` | The reader runs it on themselves, free | ✅ |
| 6 | `<Steps>` | — | Diagnose → Fix → Scale | ✅ |
| 7 | `<Fixes>` | — | What we can build once we know | |
| 8 | `<Call>` | `#call` | What the free 45 minutes contains | ✅ |
| 9 | `<Proof>` | `#proof` | Evidence that it works |  |
| 10 | `<Fit>` | — | Who it does *not* work for, said plainly | |
| 11 | `<Faq>` | `#faq` | The objections that survive all of that | |
| 12 | `<Book>` | `#book` | The only thing on the page to do | ✅ |

Every CTA on the page lands on `#book`, which is why `<Book>` sits last and
carries the closing argument beside the form — so the reader reaches the end
of the page once rather than twice.

### Section notes

**Hero** — one centred column and nothing beside it. The first screen holds
the claim, said once, in the middle of a black room: everything on it is
either the sentence or the room, and there is no third element to look at.

It used to run the copy against a diagram of the seven links. That diagram is
now shown twice further down — as the selector rail in `<Mechanism>` and as
the live chart the reader drives in `<Diagnose>` — and a third showing in the
first viewport bought nothing except a second place for the eye to start. The
three green washes that used to fill the ground went with it: on a page whose
only accent is mint, a hero full of green light leaves the CTA sitting on a
field of its own colour with nothing to push against.

What is left: a drifting particle canvas that leans toward the pointer (which
also replaced a second cursor light — two cursor effects was one too many), a
pale sweep, an edge vignette, and the copy. The accent words are set with
`.hl-accent` (mint, italic, lit from behind) via `<WordReveal>`, and the
underline rule draws itself after the last word lands. `"seven stages"` in the
sub-headline carries an `<AnimatedTooltip>` that names the links **from
`links`**, not from a second copy of the list.

**Voices** — the page's only marquee. Two rows running against each other at
42s and 54s, paused on hover.

**Problem** — three vendors, three self-serving answers, set in aligned
columns. The repetition is the joke: run together as prose the pattern is
something you work out; in a column it is something you see.

**Diagnose** — the symptom check. Seven statements on a 0/1/2 frequency scale
(Rarely / Sometimes / Constantly), one per link, in chain order. It replaced a
28-chip wrap that filled most of a screen to collect five answers. Bars move
live as you answer; it reads after three answers. Ties resolve toward the
earlier link, because the earlier link usually causes the later one. **The
whole thing runs in the browser — nothing is sent anywhere**, which is what
the privacy policy promises.

**Fixes** — two registers. The nine-item grid is the claim, built to be
scanned in three seconds. The `<AgentBentoGrid>` underneath is the evidence,
and rewards a slower reader. A founder who only reads the grid has still got
the point; that is intended, not a compromise.

**Call** — the audit photograph (`/audit-glasses.jpg`) is sticky on large
screens, with `.vignette-photo` dissolving its edges into the ground and
`.lens-glow` putting the one site colour into the glass.

**Proof** — plain star-rated reviews, **not** case-study cards. Two rules the
copy holds to: every review names a checkable number, and the ratings are
mixed with the four-star ones saying why. A wall of six identical five-star
cards is the clearest signal of a fabricated testimonial page; the one review
that admits revenue has not caught up yet is what makes the other five
readable. Set `proof.hasReviews = false` to ship the honest pre-proof
`fallback` block alone.

**Fit** — the disqualifier list is as long as the qualifier list, on purpose.

---

## 9. Component reference

### 9.1 Page sections

| File | Client? | Notes |
|---|---|---|
| [header.tsx](components/header.tsx) | ✅ | Fixed, blurs and gains a hairline past 24px scroll. `<SpotlightNavbar scrollSpy>` on `lg+`, underlined links in the mobile panel |
| [hero.tsx](components/hero.tsx) | ✅ | Particles, sweep, tooltip, scroll-linked exit, scroll cue |
| [voices.tsx](components/voices.tsx) | — | Server. Pure CSS marquee |
| [problem.tsx](components/problem.tsx) | — | Server |
| [mechanism.tsx](components/mechanism.tsx) | ✅ | Seven links + selectable `<LinkPanel>` |
| [diagnose.tsx](components/diagnose.tsx) | ✅ | `<Chart>` + `<LiveReading>`; all state local |
| [steps.tsx](components/steps.tsx) | ✅ | IntersectionObserver stage index |
| [fixes.tsx](components/fixes.tsx) | ✅ | `<StaggerText>` heading + bento grid |
| [call.tsx](components/call.tsx) | ✅ | `<ThroughTheGlasses>` sticky photograph |
| [proof.tsx](components/proof.tsx) | — | Server. `<Stars>` renders halves; `<Fallback>` for pre-proof |
| [fit.tsx](components/fit.tsx) | — | Server |
| [faq.tsx](components/faq.tsx) | ✅ | Height + opacity accordion |
| [book.tsx](components/book.tsx) | ✅ | The form. See [§12](#12-lead-capture-pipeline) |
| [footer.tsx](components/footer.tsx) | ✅ | `<AnimatedFooter>` ASCII canvas, nav, newsletter box ⚠ |
| [legal-page.tsx](components/legal-page.tsx) | — | Shared shell for `/terms` and `/privacy` |

### 9.2 UI primitives

| File | Export | What it does |
|---|---|---|
| [reveal.tsx](components/ui/reveal.tsx) | `Reveal`, `RevealGroup`, `RevealItem` | Fade + 18px rise on enter, **once**. The page's workhorse — 13 files |
| [word-reveal.tsx](components/ui/word-reveal.tsx) | `WordReveal` | Per-word entrance with a `highlight` substring that gets `.hl-accent`. 12 files |
| [magnetic-cta.tsx](components/ui/magnetic-cta.tsx) | `MagneticCta` | The primary button. Magnetic pull via `useMotionValue`. `variant="ghost"` for secondary |
| [scroll-progress.tsx](components/ui/scroll-progress.tsx) | `ScrollProgress` | Top progress bar. On `/`, `/blog`, `/blog/[slug]` |
| [section.tsx](components/ui/section.tsx) | `Section` | Section wrapper applying `.section-y` + `.gutter-x` |
| [stagger-text.tsx](components/ui/stagger-text.tsx) | `StaggerText` | Masked word rise. Only `<Fixes>`, so the two heading effects never run against each other in one viewport |
| [animated-cursor.tsx](components/ui/animated-cursor.tsx) | `AnimatedCursor` | 36px ring + 7px dot. Mounted in the root layout. Removes itself on coarse pointers, under reduced motion, and inside `/admin`. Adds/removes `html.has-custom-cursor` itself, which is what gates the `cursor: none` rule |
| [particles.tsx](components/ui/particles.tsx) | `Particles` | Canvas particle field behind the hero |
| [animated-tooltip.tsx](components/ui/animated-tooltip.tsx) | `AnimatedTooltip` | Variant-driven tooltip; used on "seven stages" |
| [hover-card.tsx](components/ui/hover-card.tsx) | `HoverCard` | Lift-on-hover wrapper, used by `<Proof>` |
| [creepy-button.tsx](components/ui/creepy-button.tsx) | `CreepyButton` | The form's submit button |

### 9.3 Registry components (larger, third-party-derived)

| File | Lines | Used by |
|---|---|---|
| [agent-bento-grid.tsx](components/ui/agent-bento-grid.tsx) | 919 | `<Fixes>` |
| [animated-footer.tsx](components/ui/animated-footer.tsx) | 586 | `<Footer>` — the only GSAP consumer |
| [spotlight-navbar.tsx](components/ui/spotlight-navbar.tsx) | 213 | `<Header>` |

Pulled in via the `@vengeanceui` registry declared in
[components.json](components.json). They are written for light **and** dark,
which is why the root layout pins `class="dark"`.

### 9.4 Unused components

Nothing imports these. They are dead weight in the repo but not in the bundle
(Next tree-shakes them out — the build confirms it):

- [components/ui/count-up.tsx](components/ui/count-up.tsx)
- [components/ui/mega-menu-navbar.tsx](components/ui/mega-menu-navbar.tsx) —
  816 lines, and the **only** consumer of `lucide-react`

Deleting `mega-menu-navbar.tsx` would let you drop `lucide-react` from
`package.json` entirely.

### 9.5 Blog components

| File | Notes |
|---|---|
| [post-card.tsx](components/blog/post-card.tsx) | The whole card is **one** anchor. Two links to the same place hand a crawler two anchors for one destination and a screen-reader user the same target twice, so "Read more" is a `<span>` that looks like a link |
| [post-cover.tsx](components/blog/post-cover.tsx) | Picks a real Unsplash photograph by keyword-matching the title and tags, most specific first, with a chain-link house image as the fallback. A plain `<img>`, **not** `next/image` — arbitrary hosts would each need declaring in `next.config.ts`. `srcSet` only for our own Unsplash covers; a pasted URL passes through untouched. A dark scrim sits over it because stock photography is lit for white pages |

---

## 10. Motion system

Every animation has a job. If you cannot name it, it should not be there.

| Element | Motion | Reason |
|---|---|---|
| Hero entrance | **One** choreographed cascade (0.62s → 1.35s delays), not six components on six schedules | The premium reads out of restraint and timing, not ornament |
| Hero headline | Per-word reveal; the accent rule draws itself at 1.45s, once the last word has landed | The turn is visible before it is read |
| Hero field | Particles drift and lean toward the pointer | The screen is never quite static, and never moving enough to compete with the type |
| Hero exit | Copy lifts and dissolves on scroll, slightly faster than the page; the field stays put | The only depth cue a flat black screen has |
| Section content | Fade + 18px rise on enter, **once** (`whileInView`) | Sequences the argument |
| Steps connector | Three short segments draw left to right, one per gap | The repair process is a chain too — and the only diagram on the page that widens |
| Mechanism | Selector state transitions; accordion below `lg` | All seven stay in view at every width |
| Symptom picker | Bars move live as each answer lands | Feedback — seeing the instrument weigh and rank is the payoff |
| Voices strip | 42s / 54s linear marquee, pauses on hover | Recognition |
| Primary CTA | Magnetic pull via `useMotionValue` | Feedback on the one target that matters |
| FAQ | Height + opacity accordion | State transition |
| Blog cards | Plain CSS `card-in`, capped 6-step stagger | Arrival as a sequence — **and it cannot fail closed** |

**Two rules:**

1. **All of it is disabled under `prefers-reduced-motion`.** Components read
   `useReducedMotion()` and pass `undefined` instead of an animation; the
   global CSS rule collapses whatever is left.
2. **No `window` scroll listeners anywhere.** Scroll-driven effects use
   Motion's `useScroll` / `useMotionValueEvent` or an `IntersectionObserver`.

---

## 11. The database

Two tables, two **deliberately different** security models.

### 11.1 `leads` — private

[supabase/migrations/0001_leads.sql](supabase/migrations/0001_leads.sql)

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `created_at` / `updated_at` | `timestamptz` | `updated_at` maintained by trigger |
| `name` | `text NOT NULL` | |
| `email` | `text NOT NULL` | Lower-cased on the way in |
| `website` | `text` | |
| `context` | `text` | "What's holding your revenue back?" |
| `status` | `text NOT NULL` | CHECK: `new`/`contacted`/`qualified`/`won`/`lost`/`spam` |
| `notes` | `text` | Written by the panel |
| `source` | `text` | Defaults `landing-book-form` |
| `referrer` / `user_agent` | `text` | **Read from headers, never from the posted JSON** |
| `ip_hash` | `text` | Salted SHA-256, first 32 hex chars |

Indexes: `created_at desc`, `status`, and **trigram GIN** on `name`, `email`,
`website` (the search box does leading-wildcard `ILIKE`, which a B-tree cannot
help with at all).

> **RLS is ON with no policies, and the grants are revoked.** The anon and
> authenticated keys — the ones printed in the page source — can read nothing
> and write nothing. Every operation goes through the Next.js server with the
> service role key.
>
> **If the contact form ever breaks, do not fix it by adding a public insert
> policy.** It already works, through `/api/leads`.

`status` is a CHECK constraint rather than a Postgres enum: adding a value to
an enum is a migration, editing a CHECK is one line, and this list will change
the first time the sales process does.

### 11.2 `posts` — published writing

[supabase/migrations/0002_posts.sql](supabase/migrations/0002_posts.sql)

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `created_at` / `updated_at` | `timestamptz` | |
| `published_at` | `timestamptz` | **Nullable until live.** The date Google shows and the feed sorts by |
| `slug` | `text NOT NULL UNIQUE` | The URL |
| `title` | `text NOT NULL` | |
| `excerpt` | `text` | Card summary **and** meta-description fallback |
| `content` | `text NOT NULL` | Markdown |
| `status` | `text NOT NULL` | CHECK: `draft`/`published`/`archived` |
| `seo_title` / `seo_description` | `text` | NULL = derive from the fields above |
| `canonical_url` | `text` | For a post published elsewhere first |
| `noindex` | `boolean NOT NULL` | Live but deliberately not indexed |
| `cover_url` / `cover_alt` | `text` | Separate columns — the title names the article, the alt describes the picture |
| `tags` | `text[] NOT NULL` | Postgres array, not a join table |
| `author_name` | `text` | |
| `reading_minutes` | `int NOT NULL` | Computed on save, not at render |

Indexes: a **partial** `(published_at desc) WHERE status='published'` — the
question every public page asks — plus `status`, a GIN on `tags`, and a
trigram GIN on `title`.

**RLS policy:** `SELECT` for `anon, authenticated` where
`status='published' AND published_at IS NOT NULL AND published_at <= now()`.
That is not a weakening — it is an accurate description of what a blog post
is — and it buys real defence in depth for the part that *is* private. An
unpublished draft is invisible to the anon key **at the database level**, so a
future client component cannot leak a half-written article even if someone
forgets to filter by status. The third clause is the scheduling half: a post
can be written on Friday and go live on Monday with nothing running in
between. **Writes have no policy**, so creating and editing stay server-side.

### 11.3 Migrations

SQL lives in `supabase/migrations/`, numbered, applied in filename order, and
recorded in a `schema_migrations` table. Each file runs inside its own
transaction, so a failure halfway through leaves nothing behind.

**To change the schema, add a new numbered file.** Never edit one that has
already been applied — the edit does not reach any database that ran the old
version, and two environments then silently disagree about their shape.
`db:migrate` checksums each file and warns when this has happened.

After a schema change, update
[lib/supabase/database.types.ts](lib/supabase/database.types.ts) to match. It
and the SQL are the same contract written twice — once for Postgres, once for
TypeScript — and they have to change together or the build starts lying about
what the database contains.

---

## 12. Lead capture pipeline

```
<Book> form (client)
   │  client-side check: non-empty name + EMAIL_RE
   ▼
POST /api/leads                      ← the ONE public write path
   │  1. isSupabaseConfigured()?     → 503 { fallback: true }
   │  2. rateLimit(`leads:${ip}`, 5, 10min)  → 429 + Retry-After
   │  3. honeypot `company` non-empty?       → 200, writes nothing
   │  4. validateLead(body)                  → 400 with a sentence
   │  5. insert via service role +
   │     source / referrer / user-agent / hashed IP from HEADERS
   ▼
Supabase `leads`
   ▼
/admin  ← requireAdmin() → fetchLeads() → table, filters, CSV export
```

### Design decisions worth keeping

**The honeypot answers 200, not 400.** A bot that gets an error learns to try
again differently; one that gets a cheerful success moves on and the row never
exists.

**Attribution is read from the request, never the body.** The form *could*
send a `source` and a `referrer`, and then both would be whatever the sender
felt like typing.

**The IP is hashed, never stored.** Knowing two submissions came from the same
place is worth having; the address itself is personal data under GDPR and
India's DPDP Act and this site has no use for it a salted hash does not also
serve. The salt is what stops it being reversible — the IPv4 space is small
enough to brute-force an unsalted SHA-256 of every address in minutes.

**One validator, two places.** `EMAIL_RE` in [lib/leads.ts](lib/leads.ts) is
used by both the form and the API. Two validators that disagree produce the
worst possible bug: a form that accepts a value and an API that rejects it,
with the reader in the middle being told to fix something that looks fine. It
is deliberately loose — RFC 5322 in a regex is a famous mistake, and a
rejected good lead costs far more than a bad one that reaches the panel and
gets marked spam.

**Failure opens the email client.** If the write fails for any reason — keys
missing, database down, visitor offline — the form opens a `mailto:` with all
four answers pre-filled. The enquiry survives our outage; we just find out by
inbox instead of by panel.

**The rate limiter is per-instance.** [lib/rate-limit.ts](lib/rate-limit.ts)
keeps counters in a `Map`, so across several serverless instances the
effective limit multiplies and a cold start resets it. That is a real weakness
and still the right thing to ship: the threat is a bored script, not a funded
attacker. If it ever guards something that matters, use Upstash Redis rather
than tuning the numbers.

### CSV export

[app/admin/export/route.ts](app/admin/export/route.ts) reuses the **same query
builder** as the screen, so the file someone downloads is exactly the set of
rows they were looking at. Capped at 10,000 rows — the export is a
convenience, not a backup.

Every field is quoted and every inner quote doubled (RFC 4180), and a value
starting with `=`, `+`, `-` or `@` gets a leading apostrophe. Excel and Sheets
execute a cell that opens with those characters, so `=HYPERLINK(...)` typed
into the website field of a public form would otherwise become a live formula
the moment someone opens the export. The file carries a UTF-8 BOM and CRLF
endings, both concessions to Excel.

---

## 13. The admin panel

### 13.1 The authorisation boundary

**Two conditions, both checked on the server, both required:**

1. A **verified** Supabase session — `getClaims()`, which checks the JWT
   signature. The session object on its own is just a cookie the caller sent us.
2. The email is on the `ADMIN_EMAILS` allowlist. Supabase will happily issue a
   valid token to any account in the project, so a valid session answers *who
   are you*, never *may you read the leads table*. An empty `ADMIN_EMAILS`
   denies everyone, which is the correct direction to fail.

`requireAdmin()` in [lib/admin-auth.ts](lib/admin-auth.ts) is **the boundary**.

[middleware.ts](middleware.ts) redirects signed-out visitors away from
`/admin` and refreshes the auth token, but that is a routing convenience, not
the boundary. It is scoped to `/admin/:path*` only — the marketing pages have
no session and nothing to protect, and putting an auth round-trip in front of
them would cost every visitor latency to gain nothing. `/api/leads` is
intentionally **not** matched; it is the public write path and does its own
validation and rate limiting.

> **Every new Server Action calls `requireAdmin()` first.** A `"use server"`
> export is a public HTTP endpoint with a generated name. The middleware
> matcher does not protect it. A missing `requireAdmin()` is a hole straight
> into the database.

**Sign-in checks the allowlist *before* the password reaches Supabase.** Two
reasons: it keeps a non-admin account from being issued a session cookie that
would then have to be cleaned up, and it means a stranger probing the form
cannot use it as an oracle for which accounts exist. Every failure returns the
same message for the same reason.

The `?next=` parameter is validated to same-origin paths only —
`next.startsWith("/") && !next.startsWith("//")` — or the login becomes an
open redirect.

### 13.2 Routes and actions

| Route | Rendering | What |
|---|---|---|
| `/admin` | `force-dynamic` | Four stat tiles, filters, paginated table (25/page), inline status + notes |
| `/admin/export` | `nodejs`, dynamic | CSV of the current filter |
| `/admin/login` | dynamic | Email + password, or a "not configured" explainer |
| `/admin/posts` | dynamic | Post list (20/page), stats, one-click publish |
| `/admin/posts/new` | dynamic | Editor, empty |
| `/admin/posts/[id]` | dynamic | Editor, loaded |

**Lead actions** ([app/admin/actions.ts](app/admin/actions.ts)) — `signIn`,
`signOut`, `updateLeadStatus`, `updateLeadNotes`, `deleteLead`.

**Post actions** ([app/admin/posts/actions.ts](app/admin/posts/actions.ts)) —
`createPost`, `updatePost`, `setPostStatus`, `deletePost`, `duplicatePost`.

Every post write calls `revalidatePost()`, which invalidates `/admin/posts`,
`/blog`, `/sitemap.xml`, `/blog/feed.xml` and `/blog/<slug>`. **Miss one and
the site lies** — a published post that does not appear on the index, or an
edited headline still showing the old words. When the slug changes, *both*
slugs are revalidated, or the old page keeps serving the article from cache at
an address that no longer exists.

`duplicatePost` always produces a **draft** with a free slug and
`canonical_url: null` — copying the canonical would tell Google the new post
is a duplicate of something else entirely.

The four stat tiles are `head: true` count queries run in parallel, and a
failed one returns 0 rather than taking the page down. An admin who can see
their leads but not the "won" count has lost almost nothing; one staring at an
error page has lost the whole panel.

### 13.3 Search-term sanitising

`.or()` takes a single string in PostgREST's own filter grammar —
`name.ilike.%x%,email.ilike.%x%` — where commas separate conditions,
parentheses group them and `%` is a wildcard. A raw term carrying any of those
does not cause SQL injection (PostgREST parameterises values) but it **does
let the term rewrite the filter**: typing `a,status.eq.won` would append a
condition nobody asked for. `sanitiseTerm()` in
[lib/leads-query.ts](lib/leads-query.ts) strips `,()%*\"':` and caps at 100
characters. [lib/posts-query.ts](lib/posts-query.ts) does the same.

---

## 14. The blog

### 14.1 Rendering

| Route | Strategy |
|---|---|
| `/blog` | ISR, `revalidate = 3600`, 12 per page, tag-filterable |
| `/blog/[slug]` | ISR + `generateStaticParams()` + `dynamicParams = true` |
| `/blog/feed.xml` | ISR 1h, `Cache-Control: max-age=3600, stale-while-revalidate=86400` |
| `/sitemap.xml` | ISR 1h |

`dynamicParams = true` is what lets a post published five minutes ago be live
immediately instead of waiting for a deploy. Static HTML is the point:
Googlebot renders JavaScript, but on a second pass, days later, with no
guarantee. A page already complete in the response body is indexed on the
first visit. The hour is a backstop for edits made outside the app — straight
in the Supabase table editor, say — which no `revalidatePath` call would ever
hear about.

### 14.2 The query families

[lib/posts-query.ts](lib/posts-query.ts) has two deliberately-separated
families:

| Family | Filters | Callers |
|---|---|---|
| `getPublishedPost`, `listPublishedPosts`, `listPublishedSlugs`, `listTags`, `listRelatedPosts` | Published, dated, not future | Public pages. **A draft cannot come back from these even if the caller asks by slug** |
| `adminListPosts`, `adminGetPost`, `adminPostStats`, `slugTaken` | None | Must have passed `requireAdmin()` |

Naming them apart is deliberate: `getPost(slug)` on a public page that quietly
returns a draft is a mistake nobody notices until an unfinished article is
indexed, and by then it is in someone's search results.

Note that the public functions **repeat** the `published_at <= now()` filter
even though the RLS policy enforces it — these queries use the service role
key, which bypasses RLS entirely, so on this path the policy protects nothing
and the filter has to be explicit.

`getPublishedPost` is wrapped in React's `cache()`. The post page calls it for
the article and `generateMetadata` calls it again for the title; Next runs
those separately, so without the cache every render is two identical round
trips. The cache is per-request, so it never serves one visitor's data to
another.

### 14.3 Markdown rendering

[lib/markdown.ts](lib/markdown.ts), server-only. Three things are deliberate:

1. **A new `Marked` instance per call**, not the shared singleton. The
   singleton is global mutable state in a long-lived server process:
   configuring it in one module changes rendering everywhere, and two
   overlapping requests produce mixed output.
2. **Rendered on the server.** A markdown parser is ~40KB the visitor should
   never download, and HTML that only exists after JavaScript runs is HTML
   that ranks worse.
3. **A hand-written renderer** for headings, links and images, because each
   has an SEO or accessibility job the default does not do.

| Override | Behaviour |
|---|---|
| `heading` | Shifts every level **down one** (`##` → `<h2>`, and the page's `<h1>` is the title). Slugified `id`s, de-duplicated with a `-2` suffix. Collects `<h2>`/`<h3>` into the TOC. Appends an `aria-hidden`, `tabindex="-1"` anchor link |
| `link` | `safeHref()` allows only `http(s)`, root-relative, `#`, `mailto:` and `tel:` — which is what stops `javascript:` and `data:text/html`. External links get `target="_blank" rel="noopener noreferrer"`, **not** `nofollow` — reflexively nofollowing every outbound link is cargo-culted advice |
| `image` | `loading="lazy" decoding="async"`. An empty alt stays empty rather than being filled with the filename |
| `html` | **Returns `""`.** Raw HTML is stripped entirely |

That last one is why `dangerouslySetInnerHTML` in
[post-body.tsx](app/blog/[slug]/post-body.tsx) is safe. **If either guarantee
is relaxed, that line becomes an XSS hole.**

The TOC renders only at **three or more** entries — two entries is not a table
of contents, it is a list of the two things that were going to be visible
anyway. It is sticky on `lg+` and hidden entirely on phones.

### 14.4 SEO derivation

[lib/posts.ts](lib/posts.ts) is deliberately free of server-only imports so
the client-side editor runs the *same* slug, character-count and validation
logic the server does.

| Function | Rule |
|---|---|
| `slugify` | NFD-normalise, strip marks, drop typographic punctuation (`don't` → `dont`, not `don-t`), lowercase, hyphenate, 80 chars. **No stop-word removal** — readable URLs are the ones people quote and click |
| `readingMinutes` | 238 wpm (median adult silent non-fiction), rounded **up**, markdown stripped first |
| `seoTitle` | `seo_title` → title + ` · Brand` **only if it fits in 60 chars** → bare title |
| `seoDescription` | `seo_description` → `excerpt` → first real prose paragraph, truncated at a word boundary with a true `…` |
| `shouldIndex` | `!noindex && status === "published"`. Archived posts are excluded too — leaving one indexed spends crawl budget on a page we would not recommend ourselves |
| `validatePost` | **Publishing stamps `published_at` only if unset.** Re-publishing an edited post must not move the date forward |
| `seoChecks` | The live checklist beside the editor. **Advisory, never blocking** — only genuine errors in `validatePost` actually refuse |

`SEO_LIMITS`: title 60, description 155 (min 70), slug 75. Google renders in
pixels not characters, so no count is exact; these are the widely-measured
points where truncation starts.

---

## 15. SEO surface

| Signal | Where |
|---|---|
| Server-rendered HTML, ISR-cached | `app/blog/[slug]/page.tsx` |
| Per-page `<title>` with a `%s · Sales Brain` template | `app/layout.tsx` |
| Per-post title/description with overrides | `lib/posts.ts` |
| **Canonical on every page** | `generateMetadata` + `lib/site-url.ts` |
| `Organization` + `WebSite` JSON-LD | `app/layout.tsx` (genuinely site-wide) |
| `FAQPage` + `Service` + `WebPage` JSON-LD | `app/page.tsx` (page-scoped — see below) |
| `BlogPosting` + `BreadcrumbList` JSON-LD | `app/blog/[slug]/page.tsx` |
| OpenGraph + Twitter cards, generated | `opengraph-image.tsx` × 3 |
| `sitemap.xml` with real `lastModified` | `app/sitemap.ts` |
| `robots.txt` pointing at the sitemap | `app/robots.ts` |
| RSS 2.0 | `app/blog/feed.xml/route.ts` |
| Internal linking | nav, breadcrumbs, `listRelatedPosts`, post CTA |
| One `<h1>`, anchored `<h2>`s | `lib/markdown.ts` |
| No layout shift on images | `aspect-ratio` in `globals.css` |
| Live SEO checklist while writing | `lib/posts.ts` → `seoChecks` |

### Decisions worth not undoing

**`FAQPage` lives on `/`, not in the layout.** It used to be site-wide, which
meant `/blog`, `/terms`, `/privacy` and the admin panel all claimed to contain
questions that appear nowhere on them. Structured data describing content a
page does not have is a spam signal, and Google treats repeated offences as
grounds to stop trusting a site's markup entirely.

**`lib/site-url.ts` is the one answer to "what is our address?"** Order:
`NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `brand.domain`.
Note that is **not** `VERCEL_URL`, which is the per-deployment hostname,
unique to every build — using it would publish canonical tags pointing at a
deployment superseded within the hour. No trailing slash, ever.

**No `keywords` meta tag.** Ignored by Google since 2009 and Bing since 2014;
filling it in signals only that whoever built the site last read about SEO a
long time ago.

**`googleBot: { "max-snippet": -1, "max-image-preview": "large" }`** lifts the
conservative defaults on how much of the page may be shown in a result.

**The 404 sets `robots: { index: false, follow: true }` and
`alternates: { canonical: null }`.** Without the explicit `null` it inherits
the layout's `canonical: "/"` and every 404 declares itself a duplicate of the
home page — the textbook soft-404 signal.

**`robots.txt` disallows `/admin` and `/api`, and `/admin` *also* sends
noindex headers.** robots.txt controls crawling, not indexing: a disallowed
URL can still appear in results if something links to it. The two mechanisms
answer different questions and both are needed. Nothing else is blocked —
blocking CSS or JS actively harms rankings now.

**One manual step:** submit the sitemap once in Google Search Console at
`https://salesbrain.in/sitemap.xml`. It is the only thing in this document
with no script.

---

## 16. Security model

| Threat | Control |
|---|---|
| Public read of leads | RLS on + **no policies** + `REVOKE ALL` from `anon, authenticated` |
| Public write of leads | Only `/api/leads`, which validates, rate limits and inserts server-side |
| Service key leaking to the browser | `import "server-only"` at the top of `lib/supabase/admin.ts`, `lib/leads-query.ts`, `lib/posts-query.ts`, `lib/markdown.ts`, `lib/rate-limit.ts`, `lib/admin-auth.ts` — any client import fails the **build** |
| Draft leak | RLS SELECT policy restricts the anon key to published+dated+not-future rows |
| Unauthorised admin access | `requireAdmin()` in every page and every Server Action |
| Account enumeration | Allowlist checked before the password; one message for every failure |
| Open redirect | `?next=` validated to same-origin paths |
| Form spam | Honeypot (`company`) + 5/10min per IP |
| CSV injection | `'` prefix on `=`/`+`/`-`/`@` in `csvCell()` |
| XSS in articles | `marked` `html()` override returns `""`; `safeHref()` allowlist |
| PostgREST filter injection | `sanitiseTerm()` in both query modules |
| PII retention | IP stored only as a salted SHA-256, truncated to 32 hex chars |
| Schema disclosure | Database errors logged in full server-side, summarised to the caller |

**The one rule to internalise:** the anon key is printed in the page source.
Everything it can do, anyone can do. That is why `leads` grants it nothing and
`posts` grants it exactly "read what is already public".

---

## 17. Scripts and commands

| Command | What |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the build |
| `npm run lint` | `next lint` |
| `npm run setup` | **Start here.** Creates `.env`, checks keys, runs migrations, offers to create an admin user. Idempotent |
| `npm run db:migrate` | Applies pending migrations. Checksummed, transactional, idempotent |
| `npm run db:status` | Read-only: which migrations have run |
| `npm run admin:create` | Creates an admin user, or resets their password |
| `npm run blog:seed` | Inserts three starter articles **as drafts** |

Non-interactive admin creation:

```bash
npm run admin:create -- you@company.com --generate-password
```

Press Enter at the password prompt to generate a strong one rather than
choosing your own — this account guards every lead the site collects.

`npm run blog:seed` inserts three SEO-ready articles as drafts. They are never
published automatically:

- `seven-places-b2b-revenue-leaks`
- `more-leads-is-usually-the-wrong-diagnosis`
- `run-your-own-revenue-leak-audit`

All three are currently **published** in the live database.

---

## 18. Build and deployment

### Build output (verified 18 Sep 2026)

20 routes. Shared first-load JS **103 kB**; the landing page is 232 kB
first-load, blog pages 206 kB, admin pages ~109 kB. Middleware 94.7 kB.

| Marker | Meaning | Routes |
|---|---|---|
| `○` Static | Prerendered | `/`, `/terms`, `/privacy`, `/404`, `robots.txt`, `sitemap.xml`, `manifest`, feed, OG images |
| `●` SSG | Prerendered from `generateStaticParams` | `/blog/[slug]` × 3 |
| `ƒ` Dynamic | Server-rendered on demand | `/admin/*`, `/api/leads`, `/blog` |

### Deploying

1. Set the environment variables in the host's settings (Vercel: Project →
   Settings → Environment Variables). **`SUPABASE_DB_URL` is not needed there.**
2. Set `NEXT_PUBLIC_SITE_URL` to the live origin, no trailing slash. Without
   it on a custom domain, every canonical tag points at the `.vercel.app`
   address and the real domain is treated as the duplicate.
3. Run `npm run db:migrate` against production **once per schema change**,
   from a laptop or a CI step.
4. After the first deploy, submit the sitemap in Google Search Console.

---

## 19. Accessibility

- Every animation respects `prefers-reduced-motion`, at the component level
  and again globally.
- `:focus-visible` is a 2px mint outline at 3px offset on everything.
- Touch targets: `.tap-area` grows small controls to 44px without moving
  layout; the mobile menu button is a 44px square.
- Pinch-zoom is **not** disabled. No `maximumScale`, no `userScalable: false`.
  The usual reason people disable it — iOS zooming on a small focused input —
  is fixed properly with the 16px field rule.
- `colorScheme: "dark"` means the browser draws autofill, the caret and
  scrollbars from its dark set rather than dropping a white autofill box into
  the booking form.
- Decorative elements (washes, scrims, separators) carry `aria-hidden="true"`.
- Heading anchors are `aria-hidden` and `tabindex="-1"`, so a keyboard user
  does not tab through two stops per heading for a whole article.
- Blog cards are one anchor, not two links to the same place.
- `formatDetection: { telephone: false }` stops iOS turning quoted figures
  into `tel:` links.

---

## 20. Known placeholders and outstanding work

### 20.1 Blocking — must be fixed before launch

**The footer newsletter form sends nothing.**
[components/footer.tsx:20-48](components/footer.tsx#L20) — the "request" is a
700ms `setTimeout`. The address is discarded and no email is ever sent, while
the label promises the seven-point checklist and the success state tells the
visitor to check their inbox. On a site whose entire argument is that we tell
you the truth even when it costs us the deal, this is the worst possible bug.
Replace the timer with a real POST to a list provider and keep the thrown
error — the `catch` already shows the failure state rather than claiming
success.

**Every review in `proof.reviews` is invented.**
[lib/content.ts:434-495](lib/content.ts#L434) — six reviews, six names, six
ratings, all written to the shape a real one should take, none of them a real
client. Replace with recorded, permissioned quotes, **or** set
`proof.hasReviews = false` and ship the honest `fallback` block alone. Being
new is not a weakness you have to hide; it is the reason the audit is free.
One invented number discredits every true claim on the page.

### 20.2 Marked `// PLACEHOLDER`

| Location | Value | Action |
|---|---|---|
| [lib/content.ts:39](lib/content.ts#L39) | `founder: "Aarav Menon"` | Real founder name. Feeds `authors`, `creator`, JSON-LD `founder`, and the default blog byline |
| [lib/content.ts:597](lib/content.ts#L597) | `"Limited to six audits a month."` | Set the real cap or **delete the line**. A cap you do not enforce is the one lie on this page a buyer can catch |
| [lib/content.ts:635, 677](lib/content.ts#L635) | `"Last updated 12 September 2026"` | Real dates on both legal pages |
| [lib/content.ts:671](lib/content.ts#L671) | Governing law: Jaipur, Rajasthan | Confirm with whoever signs the contracts |

### 20.3 Optional, deliberately left empty

| Item | Where |
|---|---|
| Search Console / Bing verification tokens | [app/layout.tsx:126-132](app/layout.tsx#L126) — commented out. A wrong token is worse than none, because it fails silently |
| `sameAs` social profiles in Organization JSON-LD | [app/layout.tsx:195-203](app/layout.tsx#L195) — a `sameAs` pointing at a profile that is not ours weakens the entity rather than strengthening it |
| External scheduler | `brand.bookingUrl` is `/#book`, which always works. Paste a Cal.com/Calendly link to switch every CTA at once |

### 20.4 Repository hygiene

| Item | Note |
|---|---|
| Empty `db/migrations/` and `lib/auth/` | Leftovers from an abandoned auth migration. Safe to delete |
| `Link.flow` in `lib/content.ts` | Read by nothing since the hero pipeline was removed. Delete it or give it a consumer |
| `.hatch` in `globals.css` | Orphaned by the same change |
| `components/ui/count-up.tsx` | Unused |
| `components/ui/mega-menu-navbar.tsx` | Unused, 816 lines, the only `lucide-react` consumer |
| `tsconfig.tsbuildinfo` (711 KB) | Tracked in the working tree but matched by `.gitignore`'s `*.tsbuildinfo` |

[README.md](README.md) was rewritten alongside this file and is now accurate.
It is the short orientation; this file is the reference. When they disagree,
**this file is the one that was checked against the source.**

---

## 21. Things not to break

A checklist of decisions that look like bugs, arbitrary choices or dead code,
and are not. Each one was arrived at by hitting the problem it prevents.

1. **`html { overflow-x: clip }` — never `hidden`.** `hidden` turns the root
   into a scroll container and kills `position: sticky`, which the Call
   section's photograph depends on.

2. **The 16px mobile input rule stays outside `@layer`.** Inside `@layer base`
   it loses to the `text-[15px]` utility on the fields, and iOS starts zooming
   the page on focus again.

3. **Blog cards use CSS `card-in`, not a scroll reveal.** An earlier version
   used an IntersectionObserver, and when it did not fire — a client-side
   navigation that restored scroll position was enough — cards stayed at
   opacity 0 and posts that existed looked deleted. The end state of
   `card-in` is the element's normal state, so if the animation is blocked,
   dropped or unsupported the card is simply visible. **Never gate listing
   content behind a scroll reveal.**

4. **Do not add a public insert policy to `leads`.** If the form breaks, the
   bug is in `/api/leads`. A public insert policy lets anyone on the internet
   write rows using a key printed in the page source.

5. **Do not remove `import "server-only"`** from any file in `lib/` that has
   it, and do not re-export the admin client from a file a `"use client"`
   component imports. That import is the only thing standing between the
   service role key and every visitor's browser.

6. **`requireAdmin()` is the first line of every Server Action.** No
   exceptions, ever, including one-line helpers.

7. **Never change the slug of a published post.** It breaks every inbound link
   and discards whatever ranking the URL earned. The editor shows a red
   warning; the warning is right.

8. **Never move `published_at`.** `validatePost` protects this already — a
   re-publish keeps the original date — because a two-year-old article that
   claims to be new is one Google learns not to trust.

9. **Never edit an applied migration.** Add a numbered file. `db:migrate`
   checksums and will warn you, but by then two databases already disagree.

10. **Keep `lib/supabase/database.types.ts` in step with the SQL.** They are
    one contract written twice.

11. **`marked`'s `html()` override must keep returning `""`.** It is what
    makes `dangerouslySetInnerHTML` in `post-body.tsx` safe.

12. **The public post queries keep their explicit `published_at <= now()`
    filter** even though RLS enforces it — they run as service role, which
    bypasses RLS.

13. **`revalidatePost()` must invalidate all five paths**, plus the old slug
    when a URL changes.

14. **One accent, mint, and it belongs to CTAs.** Not eyebrows, not labels,
    not hover states, not links, not washes.

15. **One CTA label.** `CTA` is a constant for a reason: a reader who meets
    four differently-worded buttons has to re-decide what each one does.

16. **No `window` scroll listeners.** Use `useScroll` or an
    `IntersectionObserver`.

17. **Real photographs for blog covers, not generated or abstract art.**
    `post-cover.tsx` keyword-matches a relevant Unsplash image; the fallback
    is a chain link, which is the site's central claim.

18. **`.section-y` and `.gutter-x` instead of per-section padding.** A section
    boundary is the sum of two paddings; eleven hand-rolled seams is roughly
    2,000px of empty scroll. If a section genuinely needs to break the rhythm,
    say why in a comment.

19. **Never invent proof.** Fabricated testimonials, case-study numbers,
    client logos and trust-badge figures stay out regardless of who asks. The
    correct response to missing proof is `proof.hasReviews = false` and the
    honest pre-proof block.

---

## Further reading

- [README.md](README.md) — short orientation and quick start
- [HANDOVER.md](HANDOVER.md) — the client-facing operating manual and access
  checklist
- [SUPABASE.md](SUPABASE.md) — database, admin and blog operations in depth
- [.env.example](.env.example) — every environment variable, explained in place
