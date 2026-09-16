import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { PostCard } from "@/components/blog/post-card";
import { brand, CTA } from "@/lib/content";
import { listPublishedPosts, listTags } from "@/lib/posts-query";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

export const revalidate = 3600;

const PAGE_SIZE = 12;

/*
  The blog index.

  Its SEO job is different from a post's. A post targets a query; this page
  exists to be crawled - it is the hub that gives every article an inbound
  link from a page the crawler already knows about. That is why the whole
  grid renders as server HTML with real <a> hrefs, including the pagination:
  a "load more" button would leave every post past the twelfth reachable only
  by running JavaScript, and those are exactly the posts that need the help.

  A uniform grid, with no featured-post slot. An earlier version promoted the
  newest post to a large block above the others, which looked better on a page
  with six posts and actively misled on a page with three - it read as "one
  article and some links" rather than as a library. Every post gets the same
  card, so the count is obvious and nothing can appear to be missing.
*/

export const metadata: Metadata = {
  /*
    The page name only. The root layout's title template appends the brand, so
    writing it out here produces "Blog · Sales Brain · Sales Brain".
  */
  title: "Blog",
  description:
    "Field notes on why revenue breaks in one place - offer, message, leads, funnel, conversion, pricing or ecosystem - and how to find which one it is.",
  alternates: {
    canonical: absoluteUrl("/blog"),
    /* Discoverable feed. Readers and aggregators look for exactly this tag. */
    types: { "application/rss+xml": absoluteUrl("/blog/feed.xml") },
  },
  openGraph: {
    type: "website",
    title: `Blog · ${brand.name}`,
    description:
      "Field notes on why revenue breaks in one place, and how to find which one it is.",
    url: absoluteUrl("/blog"),
    siteName: brand.name,
  },
};

type Props = {
  searchParams: Promise<{ tag?: string; page?: string }>;
};

export default async function BlogIndex({ searchParams }: Props) {
  const params = await searchParams;
  const tag = params.tag?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [{ posts, total }, tags] = await Promise.all([
    listPublishedPosts({
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      tag,
    }),
    listTags(),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hrefWith = (changes: { tag?: string; page?: number }) => {
    const next = new URLSearchParams();
    const t = "tag" in changes ? changes.tag : tag;
    const p = changes.page ?? 1;
    if (t) next.set("tag", t);
    if (p > 1) next.set("page", String(p));
    const query = next.toString();
    return query ? `/blog?${query}` : "/blog";
  };

  /*
    Blog + BlogPosting structured data. It tells Google this is a listing
    rather than an article, and names what is on it - which keeps the index
    itself from competing with the posts for the same queries.
  */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${absoluteUrl("/blog")}#blog`,
    name: `${brand.name} blog`,
    url: absoluteUrl("/blog"),
    publisher: { "@type": "Organization", name: brand.name, url: siteUrl() },
    blogPost: posts.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.published_at,
    })),
  };

  const chip =
    "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-200";

  return (
    <>
      <ScrollProgress />
      <Header />

      <main>
        {/* ------------------------------------------------- masthead --- */}
        <section className="relative overflow-hidden">
          {/*
            No ambient green wash here, unlike the landing page sections.

            The blog is a reading surface, and mint on this site means "this is
            the thing to click". Spending it on a background glow behind an
            index of headlines dilutes it twice over: the page reads as tinted
            rather than neutral, and the one genuine call to action at the
            bottom has nothing left to stand out against.
          */}
          <div className="relative mx-auto w-full max-w-[1240px] gutter-x pb-10 pt-28 sm:pt-32">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Field notes
            </p>

            <h1 className="display-tight mt-5 max-w-[16ch] text-[2.2rem] font-medium leading-[1.1] text-paper sm:text-[3rem]">
              Where the money is leaving.
            </h1>

            <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-body">
              The seven links revenue runs through, how each one breaks, and
              how to work out which of them is costing you the most.
            </p>

            {tags.length > 0 ? (
              <div className="mt-9 flex flex-wrap items-center gap-2">
                <Link
                  href={hrefWith({ tag: undefined })}
                  className={`${chip} ${
                    tag
                      ? "border-white/10 text-muted hover:border-white/25 hover:text-paper"
                      : "border-white/25 bg-white/10 text-paper"
                  }`}
                >
                  All{" "}
                  <span className="tabular-nums opacity-60">{total}</span>
                </Link>
                {tags.map(({ tag: name, count }) => (
                  <Link
                    key={name}
                    href={hrefWith({ tag: tag === name ? undefined : name })}
                    className={`${chip} ${
                      tag === name
                        ? "border-white/25 bg-white/10 text-paper"
                        : "border-white/10 text-muted hover:border-white/25 hover:text-paper"
                    }`}
                  >
                    {name}{" "}
                    <span className="tabular-nums opacity-60">{count}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {/* ---------------------------------------------------- grid --- */}
        <section className="mx-auto w-full max-w-[1240px] gutter-x pb-20">
          {posts.length === 0 ? (
            <div className="rounded-[12px] border hairline bg-ink-900 px-6 py-20 text-center">
              <p className="text-[17px] text-paper">
                {tag ? `Nothing tagged “${tag}” yet.` : "Nothing published yet."}
              </p>
              <p className="mx-auto mt-2 max-w-[44ch] text-[14px] leading-relaxed text-muted">
                {tag
                  ? "Try another tag, or read everything."
                  : "The first field notes are being written. In the meantime, the audit is free."}
              </p>
              <Link
                href={tag ? "/blog" : brand.bookingUrl}
                className="tap-area mt-7 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] text-paper transition-colors duration-200 hover:border-white/30 hover:text-paper"
              >
                {tag ? "Read everything" : "Book the audit"}
              </Link>
            </div>
          ) : (
            /*
              One column on a phone, two from 640px, three from 1024px. The
              card itself never changes shape - the grid just carries fewer of
              them per row, so the mobile layout is the desktop one folded
              rather than a different design.

              items-stretch (the grid default) plus h-full on the card is what
              makes every card in a row the same height regardless of excerpt
              length.
            */
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {posts.map((post, i) => (
                <li key={post.id} className="flex">
                  <PostCard post={post} index={i} />
                </li>
              ))}
            </ul>
          )}

          {pageCount > 1 ? (
            <nav
              aria-label="Pagination"
              className="mt-12 flex items-center justify-between gap-4"
            >
              {page > 1 ? (
                <Link
                  href={hrefWith({ page: page - 1 })}
                  className="tap-area rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] text-paper transition-colors duration-200 hover:border-white/30 hover:text-paper"
                  rel="prev"
                >
                  ← Newer
                </Link>
              ) : (
                <span />
              )}

              <span className="font-mono text-[12px] tabular-nums text-muted">
                {page} / {pageCount}
              </span>

              {page < pageCount ? (
                <Link
                  href={hrefWith({ page: page + 1 })}
                  className="tap-area rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] text-paper transition-colors duration-200 hover:border-white/30 hover:text-paper"
                  rel="next"
                >
                  Older →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </section>

        {/* ---------------------------------------------------- the ask --- */}
        {/*
          The index gets the same closing CTA as a post. Someone who has read
          three headlines and not clicked one is still someone with a revenue
          problem, and sending them back to the nav to find the button is a
          worse outcome than asking here.
        */}
        <section className="border-t hairline bg-ink-900">
          <div className="mx-auto w-full max-w-[720px] gutter-x py-14 text-center">
            <p className="text-[19px] leading-relaxed text-paper">
              Rather skip the reading?
            </p>
            <p className="mx-auto mt-3 max-w-[46ch] text-[15px] leading-relaxed text-body">
              The audit names your leak in 45 minutes, and tells you the fix
              whether you hire us or not.
            </p>
            <Link
              href={brand.bookingUrl}
              className="tap-area mt-7 inline-block rounded-full bg-signal px-6 py-3 text-[15px] font-medium tracking-tight text-ink-950 transition-opacity hover:opacity-90"
            >
              {CTA}
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
