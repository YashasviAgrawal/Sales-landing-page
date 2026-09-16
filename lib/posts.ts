/*
  The blog domain: what a post is, what makes one valid, and every rule that
  decides what search engines are told about it.

  The SEO rules live here rather than in the page components on purpose. The
  title tag, the meta description, the canonical URL and the JSON-LD all have
  to agree with each other - a page whose <title> says one thing and whose
  structured data says another is worse than one with neither, because Google
  has to pick, and it may not pick yours. Deriving all of them from one place
  is what keeps them consistent.

  Kept free of server-only imports so the admin editor (a client component)
  can run the same slug, character-count and validation logic the server does,
  and show the writer what will actually be saved.
*/

export const POST_STATUSES = ["draft", "published", "archived"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_STATUS_META: Record<
  PostStatus,
  { label: string; dot: string; chip: string }
> = {
  draft: {
    label: "Draft",
    dot: "bg-paper/60",
    chip: "border-white/15 bg-white/5 text-body",
  },
  published: {
    label: "Published",
    dot: "bg-signal",
    chip: "border-signal/40 bg-signal/10 text-signal",
  },
  archived: {
    label: "Archived",
    dot: "bg-muted",
    chip: "border-white/10 bg-white/[0.03] text-muted",
  },
};

export function isPostStatus(value: unknown): value is PostStatus {
  return (
    typeof value === "string" &&
    (POST_STATUSES as readonly string[]).includes(value)
  );
}

export type Post = {
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

/* -------------------------------------------------------------------------- */
/*  Slugs                                                                     */
/* -------------------------------------------------------------------------- */

/*
  Title -> URL segment.

  Lowercase, ASCII, hyphen-separated, no stop-word stripping. Each of those is
  a decision:

    Lowercase, because URLs are case-sensitive on most servers and
    /blog/My-Post and /blog/my-post would be two pages with identical content
    competing with each other.

    NFD normalisation before stripping marks, so "Café" becomes "cafe" rather
    than "caf". Decomposing first separates the accent from the letter, and
    only the accent is dropped.

    No stop-word removal, though most slug libraries do it. Turning "how to
    find the leak" into "find-leak" makes the URL shorter and less readable,
    and readable URLs are the ones people quote, link and click - which is
    worth more than the handful of characters saved.
*/
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    /* Typographic punctuation vanishes rather than becoming a hyphen, so
       "don’t" is "dont" and not "don-t". */
    .replace(/['’‘"“”]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    /* The slice can land mid-word and leave a trailing hyphen. */
    .replace(/-+$/g, "");
}

/* -------------------------------------------------------------------------- */
/*  Reading time                                                              */
/* -------------------------------------------------------------------------- */

/*
  238 words per minute is the median silent reading speed for adult non-fiction
  in the literature, and rounding up means the estimate is never optimistic -
  a post that says "4 min" and takes six feels like a lie, where one that says
  "5 min" and takes four feels generous.

  Markdown syntax is stripped first so a post heavy in links and code is not
  credited for its punctuation.
*/
export function readingMinutes(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~\-|]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 238));
}

/* -------------------------------------------------------------------------- */
/*  The SEO rules                                                             */
/* -------------------------------------------------------------------------- */

/*
  Length budgets, in characters.

  Google renders results in pixels, not characters, so no character count is
  exact - but these are the widely-measured points where truncation starts for
  average-width text, and they are what the editor's counters are drawn
  against. Going over does not hurt rankings; it just means the end of your
  sentence is replaced by an ellipsis, and the end of the sentence is usually
  where the reason to click was.
*/
export const SEO_LIMITS = {
  title: 60,
  description: 155,
  /* Below this, a description is too thin to earn the click. */
  descriptionMin: 70,
  slug: 75,
} as const;

/**
 * The <title>. Falls back to the headline, and appends the brand only when
 * there is room - a truncated brand name is worse than none.
 */
export function seoTitle(post: Post, brandName: string): string {
  if (post.seo_title?.trim()) return post.seo_title.trim();

  const suffix = ` · ${brandName}`;
  return post.title.length + suffix.length <= SEO_LIMITS.title
    ? `${post.title}${suffix}`
    : post.title;
}

/**
 * The meta description. Falls back to the excerpt, then to the opening of the
 * post itself - a missing description lets Google invent one from the page,
 * and it reliably picks worse sentences than the writer would.
 */
export function seoDescription(post: Post): string {
  const chosen =
    post.seo_description?.trim() ||
    post.excerpt?.trim() ||
    firstProse(post.content);

  return truncateAtWord(chosen, SEO_LIMITS.description);
}

/* The first real paragraph: not a heading, an image, a quote or a fence. */
function firstProse(markdown: string): string {
  const block = markdown
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .find((b) => b && !/^(#|!\[|>|```|\||-{3,})/.test(b));

  return block ? stripInlineMarkdown(block) : "";
}

export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/*
  Cut at a word boundary and add a true ellipsis character.

  Cutting mid-word is the tell of a generated description, and "…" is one
  character where "..." is three - which matters when the budget is 155 and
  the difference decides whether the last word survives.
*/
export function truncateAtWord(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\-\s]+$/, "")}…`;
}

/**
 * Whether search engines should index this post.
 *
 * Archived posts are excluded as well as explicitly flagged ones: an archived
 * post is one we have decided is no longer worth reading, and leaving it in
 * the index spends crawl budget and domain authority on a page we would not
 * recommend ourselves.
 */
export function shouldIndex(post: Post): boolean {
  return !post.noindex && post.status === "published";
}

/** Absolute URL for a post. Canonical tags and feeds cannot use relative ones. */
export function postUrl(slug: string, origin: string): string {
  return `${origin.replace(/\/$/, "")}/blog/${slug}`;
}

/* -------------------------------------------------------------------------- */
/*  Validation                                                                */
/* -------------------------------------------------------------------------- */

export type PostInput = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: PostStatus;
  published_at: string | null;
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

export type PostValidation =
  | { ok: true; value: PostInput }
  | { ok: false; error: string };

const trim = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "";

export function validatePost(raw: Record<string, unknown>): PostValidation {
  const title = trim(raw.title, 200);
  if (!title) return { ok: false, error: "Give the post a title." };

  /* An empty slug field means "derive it", which is what the writer wants
     almost every time and saves them typing the title twice. */
  const slug = slugify(trim(raw.slug, 100) || title);
  if (!slug) {
    return {
      ok: false,
      error: "That title makes an empty URL. Add a slug by hand.",
    };
  }

  const status = isPostStatus(raw.status) ? raw.status : "draft";
  const content = typeof raw.content === "string" ? raw.content : "";

  if (status === "published" && !content.trim()) {
    return { ok: false, error: "An empty post cannot be published." };
  }

  /*
    Publishing stamps the date if it is not already set, and keeps it if it
    is. Re-publishing an edited post must NOT move the date forward: the
    published date is a fact about when the piece appeared, it is what Google
    shows in results, and silently resetting it on every typo fix makes a
    two-year-old article claim to be new.
  */
  const existingPublishedAt =
    typeof raw.published_at === "string" && raw.published_at
      ? raw.published_at
      : null;

  const published_at =
    status === "published"
      ? (existingPublishedAt ?? new Date().toISOString())
      : existingPublishedAt;

  const canonical = trim(raw.canonical_url, 500);
  if (canonical && !/^https?:\/\/.+\..+/.test(canonical)) {
    return {
      ok: false,
      error: "The canonical URL must be absolute, starting with https://.",
    };
  }

  const cover = trim(raw.cover_url, 500);
  if (cover && !/^(https?:\/\/|\/)/.test(cover)) {
    return {
      ok: false,
      error: "The cover image must be an absolute URL or start with /.",
    };
  }

  /*
    Tags are lowercased and de-duplicated. "Sales", "sales" and "SALES" are
    one tag that a case-sensitive store would render as three, and the filter
    would then match a third of the posts it should.
  */
  const tags = Array.from(
    new Set(
      (Array.isArray(raw.tags)
        ? raw.tags
        : String(raw.tags ?? "").split(",")
      )
        .map((t) => String(t).trim().toLowerCase())
        .filter(Boolean)
        .map((t) => t.slice(0, 40)),
    ),
  ).slice(0, 8);

  return {
    ok: true,
    value: {
      slug,
      title,
      excerpt: trim(raw.excerpt, 400) || null,
      content,
      status,
      published_at,
      seo_title: trim(raw.seo_title, 200) || null,
      seo_description: trim(raw.seo_description, 400) || null,
      canonical_url: canonical || null,
      noindex: Boolean(raw.noindex),
      cover_url: cover || null,
      cover_alt: trim(raw.cover_alt, 300) || null,
      tags,
      author_name: trim(raw.author_name, 120) || null,
      reading_minutes: readingMinutes(content),
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Editor feedback                                                           */
/* -------------------------------------------------------------------------- */

export type SeoCheck = {
  id: string;
  label: string;
  state: "good" | "warn" | "bad";
  detail: string;
};

/*
  The checklist beside the editor.

  Advisory, never blocking. A writer who knows why they are breaking a rule
  should be able to publish anyway - the checks exist so the ordinary case is
  done right without thinking, not to hold the post hostage. Only genuine
  errors, handled in validatePost above, actually refuse.

  Ordered by how much each one costs when it is wrong: a missing description
  loses clicks on every impression forever; a thin post ranks for nothing; a
  missing alt is an accessibility failure on one image.
*/
export function seoChecks(draft: {
  title: string;
  slug: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  content: string;
  cover_url: string;
  cover_alt: string;
  tags: string[];
}): SeoCheck[] {
  const checks: SeoCheck[] = [];

  const effectiveTitle = draft.seo_title.trim() || draft.title.trim();
  checks.push({
    id: "title",
    label: "Title length",
    state:
      effectiveTitle.length === 0
        ? "bad"
        : effectiveTitle.length > SEO_LIMITS.title
          ? "warn"
          : effectiveTitle.length < 25
            ? "warn"
            : "good",
    detail:
      effectiveTitle.length === 0
        ? "No title yet."
        : effectiveTitle.length > SEO_LIMITS.title
          ? `${effectiveTitle.length} characters — Google will cut it near ${SEO_LIMITS.title}.`
          : effectiveTitle.length < 25
            ? `${effectiveTitle.length} characters — room for more of the query.`
            : `${effectiveTitle.length} characters.`,
  });

  const description = draft.seo_description.trim() || draft.excerpt.trim();
  checks.push({
    id: "description",
    label: "Meta description",
    state:
      description.length === 0
        ? "bad"
        : description.length > SEO_LIMITS.description ||
            description.length < SEO_LIMITS.descriptionMin
          ? "warn"
          : "good",
    detail:
      description.length === 0
        ? "Empty — Google will invent one from the page, and it will pick worse sentences than you would."
        : description.length > SEO_LIMITS.description
          ? `${description.length} characters — the end will be cut.`
          : description.length < SEO_LIMITS.descriptionMin
            ? `${description.length} characters — short enough to waste the space.`
            : `${description.length} characters.`,
  });

  const words = draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0;
  checks.push({
    id: "length",
    label: "Depth",
    state: words === 0 ? "bad" : words < 600 ? "warn" : "good",
    detail:
      words === 0
        ? "Nothing written yet."
        : words < 600
          ? `${words} words — thin pages rarely rank for anything competitive.`
          : `${words} words, about ${readingMinutes(draft.content)} min.`,
  });

  /*
    Exactly one H1, and the page itself supplies it from the title - so a
    markdown "# " in the body would produce a second. Two H1s is not fatal
    any more, but it does blur what the page is about, which is the one thing
    the heading structure exists to state.
  */
  const h1s = (draft.content.match(/^#\s+/gm) ?? []).length;
  const h2s = (draft.content.match(/^##\s+/gm) ?? []).length;
  checks.push({
    id: "headings",
    label: "Headings",
    state: h1s > 0 ? "warn" : h2s === 0 ? "warn" : "good",
    detail:
      h1s > 0
        ? "Use ## for sections — the page already renders the title as the H1."
        : h2s === 0
          ? "No sections. ## headings are what earn the jump-links in results."
          : `${h2s} section${h2s === 1 ? "" : "s"}.`,
  });

  checks.push({
    id: "slug",
    label: "URL",
    state: !draft.slug
      ? "bad"
      : draft.slug.length > SEO_LIMITS.slug
        ? "warn"
        : "good",
    detail: !draft.slug
      ? "No URL yet."
      : draft.slug.length > SEO_LIMITS.slug
        ? `/blog/${draft.slug} — long URLs get truncated in results.`
        : `/blog/${draft.slug}`,
  });

  checks.push({
    id: "cover",
    label: "Social image",
    state: !draft.cover_url ? "warn" : !draft.cover_alt ? "warn" : "good",
    detail: !draft.cover_url
      ? "None set — a generated card will be used instead."
      : !draft.cover_alt
        ? "Add alt text describing the image."
        : "Set, with alt text.",
  });

  /*
    Internal links. The single most under-used ranking lever on a small blog:
    they pass authority between your own pages and give crawlers a reason to
    find the new post at all.
  */
  const internalLinks = (draft.content.match(/\]\((\/|#)/g) ?? []).length;
  checks.push({
    id: "links",
    label: "Internal links",
    state: internalLinks === 0 ? "warn" : "good",
    detail:
      internalLinks === 0
        ? "None. Link to the audit page or another post — it is how authority moves between them."
        : `${internalLinks} link${internalLinks === 1 ? "" : "s"} to your own pages.`,
  });

  return checks;
}
