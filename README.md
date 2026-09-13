# Sales Brain landing page

Conversion landing page for a sales-diagnostic company. Next.js 15 (App Router),
Tailwind v4, Motion, Phosphor Icons. No purchased template code is used.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Design system

Locked tokens live in `app/globals.css` under `@theme`.

| Token | Value | Use |
| --- | --- | --- |
| `--color-ink-950` | `#0b0b0c` | page base, never pure black |
| `--color-ink-900` | `#101012` | alternating section ground |
| `--color-ink-850` | `#16161a` | raised panels |
| `--color-paper` | `#f4f3f1` | headings |
| `--color-body` | `#a7a5a2` | body copy |
| `--color-muted` | `#6e6c6a` | labels, secondary rows |
| `--color-signal` | `#f0a93b` | the single accent |

Rules that are locked and must not drift:

- One accent on the whole page. Signal amber, nothing else.
- One theme. Every section is dark. No inverted section.
- Shape: interactive elements are full pill, surfaces are 12px. Nothing else.
- Hairline dividers at `rgb(255 255 255 / 0.09)` instead of card borders
  wherever grouping is enough.
- Type scale: display `clamp` from `2.6rem` to `4.4rem` at `-0.035em` tracking,
  body 15px to 17px at 1.7 line height.
- Exactly one marquee on the page.

## Motion

Every animation has a job.

| Element | Motion | Reason |
| --- | --- | --- |
| Hero pipeline | staggered width fill, 0.9s | the narrowing is the argument |
| Section content | fade and 18px rise on enter, once | sequences the argument |
| Stage index | IntersectionObserver highlight, layout marker | position in a five part system |
| Symptom picker | state transitions on select and result | feedback |
| Sprint rail | scroll snap plus arrow controls | breadth without demanding a full read |
| Voices strip | 42s linear marquee, pauses on hover | recognition |
| Primary CTA | magnetic pull via `useMotionValue` | feedback on the one target that matters |
| FAQ | height and opacity accordion | state transition |

All of it is disabled under `prefers-reduced-motion`. No `window` scroll
listeners anywhere.

## Before launch

Search `lib/content.ts` for `PLACEHOLDER`. Every price, the founder name,
the booking URL, the quiz URL and the founding-client terms are indicative
values and must be replaced with real ones.

The hero pipeline numbers are illustrative of the mechanism, not client data.
The audit photograph is a Picsum placeholder. Swap it for a real image before
launch, or drop the image and let the type carry the section.
