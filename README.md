# Sales Brain

Conversion landing page, blog and admin panel for a sales-diagnostic
consultancy in Jaipur, India. Next.js 15 (App Router), React 19, Tailwind v4,
Motion, Supabase. No purchased template code is used.

**One page, one action: book the free 45-minute Revenue Leak Audit.**

---

## Run

```bash
npm install
npm run setup     # creates .env, checks keys, runs migrations, offers an admin user
npm run dev       # http://localhost:3000
```

`npm run setup` is idempotent. It stops at the first thing it cannot do for
you and names exactly what to paste where.

| | |
|---|---|
| `http://localhost:3000` | The landing page |
| `http://localhost:3000/blog` | Blog index |
| `http://localhost:3000/admin` | Leads |
| `http://localhost:3000/admin/posts` | Blog CMS |

| Command | What |
|---|---|
| `npm run build` / `npm start` | Production build, then serve it |
| `npm run db:migrate` | Apply pending migrations. Idempotent |
| `npm run db:status` | Which migrations have run. Read-only |
| `npm run admin:create` | Create an admin user, or reset their password |
| `npm run blog:seed` | Three starter articles, inserted as drafts |

---

## Documentation

| Read this | For |
|---|---|
| **[DOCUMENTATION.md](DOCUMENTATION.md)** | The full technical reference — architecture, design system, database, security model, and a *Things not to break* list |
| **[SUPABASE.md](SUPABASE.md)** | Database, admin panel and blog operations in depth |
| **[HANDOVER.md](HANDOVER.md)** | The client-facing operating manual and access checklist |
| **[.env.example](.env.example)** | Every environment variable, explained in place |

This file is the orientation. `DOCUMENTATION.md` is the reference, and it is
the one that was checked against the source.

---

## Design system

Locked tokens live in [app/globals.css](app/globals.css) under `@theme`.
**There is no `tailwind.config.js`** — Tailwind v4 reads tokens from CSS.

| Token | Value | Use |
| --- | --- | --- |
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
| `--color-rise` / `--color-fall` | `#3ddc97` / `#e879f9` | Direction of travel. The magenta is the only non-green value in the system |
| `--radius-surface` | `12px` | Every non-pill surface |

The ground is black and the green lives in the light, not the surfaces. Mint
on black is 11.1:1 both ways — as type on the ground and as a fill under ink —
which is why one accent value covers both jobs. **Mint fills always carry dark
text**; mint under white is 1.8:1 and unreadable.

Rules that are locked and must not drift:

- **One accent on the whole page.** Mint, nothing else — and it belongs to
  calls to action, not to eyebrows, labels, hover states, links or washes.
- **One theme.** Every section is dark. No inverted section, no light mode.
- **Shape:** interactive elements are full pill, surfaces are 12px. Nothing else.
- **Hairline dividers** at `rgb(255 255 255 / 0.09)` — the `.hairline` utility —
  instead of card borders wherever grouping is enough.
- **Rhythm and gutters come from `.section-y` and `.gutter-x`**, never
  hand-rolled `py-*` / `px-*`. A section boundary is the *sum* of two paddings;
  eleven hand-rolled seams is roughly 2,000px of empty scroll.
- **Type scale:** display uses `.display-tight` (`-0.035em`, `1.02` leading);
  body 15–17px at ~1.7.
- **Exactly one marquee** on the page — the Voices strip.

---

## Motion

Every animation has a job. If you cannot name it, it should not be there.

| Element | Motion | Reason |
| --- | --- | --- |
| Hero entrance | One choreographed cascade, not six components on six schedules | The premium reads out of restraint and timing, not ornament |
| Hero headline | Per-word reveal; the accent rule draws itself at 1.45s | The turn is visible before it is read |
| Hero field | Particles drift and lean toward the pointer | Never quite static, never enough to compete with the type |
| Hero exit | Copy lifts and dissolves faster than the page; the field stays put | The only depth cue a flat black screen has |
| Section content | Fade and 18px rise on enter, once | Sequences the argument |
| Steps connector | Three segments draw left to right | The repair process is a chain too |
| Mechanism | Selector transitions; accordion below `lg` | All seven links stay in view at every width |
| Symptom picker | Bars move live as each answer lands | Seeing the instrument weigh and rank is the payoff |
| Voices strip | 42s / 54s linear marquee, pauses on hover | Recognition |
| Primary CTA | Magnetic pull via `useMotionValue` | Feedback on the one target that matters |
| FAQ | Height and opacity accordion | State transition |
| Blog cards | Plain CSS `card-in` | It cannot fail closed — a scroll reveal that never fires looks like deleted content |

All of it is disabled under `prefers-reduced-motion`. **No `window` scroll
listeners anywhere** — use `useScroll` or an `IntersectionObserver`.

---

## Before launch

Two things break a promise to the visitor and must be fixed:

1. **The footer newsletter sends nothing.**
   [components/footer.tsx](components/footer.tsx#L20) — the "request" is a
   700ms `setTimeout`. The label promises a checklist and the success state
   says to check your inbox. Wire it to a real list provider, or delete the
   box.
2. **Every review in `proof.reviews` is invented.** Replace them with
   recorded, permissioned quotes, or set `proof.hasReviews = false` and ship
   the honest `fallback` block that is already written.

Then search [lib/content.ts](lib/content.ts) for `PLACEHOLDER`: the founder
name, the "six audits a month" cap, the legal page dates and the governing-law
clause are all indicative and must be replaced or deleted.

`DOCUMENTATION.md` §20 has the complete list, including the optional items
left deliberately empty (Search Console tokens, `sameAs` social profiles).

---

## The four rules a new contributor breaks first

1. **`requireAdmin()` is the first line of every Server Action.** A
   `"use server"` export is a public HTTP endpoint with a generated name; the
   middleware matcher does not protect it.
2. **The `leads` table has RLS on with no policies, deliberately.** If the
   contact form breaks, the bug is in `/api/leads`. Do not add a public insert
   policy — the browser-facing key is printed in the page source.
3. **Never edit an applied migration**, and keep
   `lib/supabase/database.types.ts` in step with the SQL.
4. **Never change a published post's slug, and never move its
   `published_at`.**

The rest are in `DOCUMENTATION.md` §21.

---

## A note on the comments

This codebase is heavily commented, and the comments explain *why*. They are
not noise — most of them record a problem that was hit and solved, and several
describe a fix that looks wrong until you know what it prevents. **Read the
comment before changing the line under it.**
