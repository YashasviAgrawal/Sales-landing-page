import type { Post } from "@/lib/posts";

/*
  The card photograph.

  A cover set by hand in the post editor (`cover_url`) always wins. This picks
  a relevant stock photograph when there isn't one, so a post published in a
  hurry still looks finished.

  HOW THE PHOTO IS CHOSEN. Each entry below owns a set of keywords; the post's
  own title and tags are matched against them. That is the whole reason this
  is a library rather than three hardcoded URLs: an article written next year
  about pricing gets the pricing photograph without anybody wiring it up. A
  post that matches nothing falls back to the chain image - the site's central
  metaphor - rather than to something arbitrary.

  WHY THESE URLS ARE SAFE TO HOTLINK. They are Unsplash's own image CDN, which
  is what the Unsplash API hands out and what their guidelines ask you to use.
  The licence covers commercial use with no attribution required. Every URL
  here was checked to return a real image/jpeg rather than a 404 - worth
  redoing if you ever swap one, because a dead cover fails silently as a blank
  grey box.

  The query string is doing real work: `w=1200` caps the download at roughly
  what a card needs instead of a 4000px original, `q=75` is the point where
  JPEG artefacts stop being visible at this size, and `auto=format` serves
  WebP or AVIF to browsers that accept them. Together that is the difference
  between a ~90KB cover and a ~2MB one, twelve times over on a full index.
*/

type Cover = {
  /** Unsplash CDN id, e.g. "photo-1634781326931-71154135679e". */
  id: string;
  /** Describes the picture, not the headline - see the note in schema.sql. */
  alt: string;
  /** Lower-cased words matched against the post's title and tags. */
  keywords: string[];
};

/*
  Order matters, because titles legitimately match more than one entry. "How
  to run a revenue leak audit" contains both "audit" and "leak"; the worksheet
  photograph is the better picture for it, so the procedural words are tested
  before the general leak/chain words that the fallback owns. Most specific
  first.
*/
const COVERS: Cover[] = [
  {
    id: "photo-1686061592689-312bbfb5c055",
    alt: "A cohort analysis table on a screen, with each row shaded by retention rate",
    keywords: ["how to", "audit", "checklist", "step", "diy", "spreadsheet", "measure"],
  },
  {
    id: "photo-1526628953301-3e589a6a8b74",
    alt: "An advertising dashboard showing click-through rate, cost per conversion and quality score",
    keywords: ["lead", "leads", "traffic", "volume", "pipeline", "prospect", "ads", "campaign"],
  },
  {
    id: "photo-1600880292203-757bb62b4baf",
    alt: "Two colleagues celebrating across a desk after closing a deal",
    keywords: ["conversion", "close", "closing", "proposal", "deal", "follow-up", "won"],
  },
  {
    id: "photo-1676287565869-6992e7df9bb4",
    alt: "A notepad with “marketing strategy” written on it beside a pen",
    keywords: ["pricing", "price", "fee", "discount", "margin", "cost", "packaging"],
  },
  {
    id: "photo-1532622785990-d2c36a76f5a6",
    alt: "Two people working through an idea on a whiteboard",
    keywords: ["message", "messaging", "copy", "positioning", "offer", "pitch", "brand"],
  },
  {
    id: "photo-1517048676732-d65bc937f952",
    alt: "A row of people taking notes around a long table during a working session",
    keywords: ["ecosystem", "referral", "retention", "churn", "onboarding", "client", "delivery"],
  },
];

/* The house image: a single heavy chain link. The site's central claim is that
   revenue is a chain that breaks in one place, so this is the right default. */
const FALLBACK: Cover = {
  id: "photo-1634781326931-71154135679e",
  alt: "A single heavy steel chain link against a soft grey background",
  keywords: [],
};

function coverFor(post: Post): Cover {
  const text = `${post.title} ${post.tags.join(" ")}`.toLowerCase();
  return (
    COVERS.find((c) => c.keywords.some((k) => text.includes(k))) ?? FALLBACK
  );
}

/** Built once here so every caller requests the same, already-cached size. */
function unsplashUrl(id: string, width: number): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=75`;
}

export function PostCover({
  post,
  className = "",
  /** Rendered width in CSS pixels at the largest breakpoint. */
  width = 800,
}: {
  post: Post;
  className?: string;
  width?: number;
}) {
  const custom = post.cover_url;
  const chosen = custom ? null : coverFor(post);

  const src = custom ?? unsplashUrl(chosen!.id, width);
  const alt = custom ? (post.cover_alt ?? "") : chosen!.alt;

  return (
    <>
      {/*
        A plain <img>, not next/image. These are arbitrary hosts - Unsplash
        here, whatever an admin pastes into the editor otherwise - and
        next/image needs every one declared in next.config.ts, which turns
        "paste a link" into "edit the config and redeploy". The card's
        aspect-ratio box fixes the geometry, so there is no layout shift
        either way.

        srcSet only for our own Unsplash covers, where we control the sizes.
        A pasted URL is passed through untouched, because appending width
        parameters to somebody else's CDN either does nothing or breaks it.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        {...(chosen
          ? {
              srcSet: `${unsplashUrl(chosen.id, 480)} 480w, ${unsplashUrl(chosen.id, 800)} 800w, ${unsplashUrl(chosen.id, 1200)} 1200w`,
              sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
            }
          : null)}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />

      {/*
        A dark scrim over the photograph.

        Stock photography is lit for white pages; dropped straight onto this
        one it glares against a near-black card and pulls the eye off the
        headline, which is the thing that actually has to be read. The gradient
        is heavier at the bottom, where the image meets the card's text.
        Purely decorative, so it is hidden from assistive tech.
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/15 to-transparent"
      />
    </>
  );
}
