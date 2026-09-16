import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { brand } from "@/lib/content";
import { listPublishedPosts, listTags } from "@/lib/posts-query";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

export const revalidate = 3600;

const PAGE_SIZE = 12;

/*
  The blog index.

  Its SEO job is different from a post's. A post targets a query; this page
  exists to be crawled - it is the hub that gives every article an inbound
  link from a page the crawler already knows about. That is why the whole
  list renders as server HTML with real <a> hrefs, including the pagination:
  a "load more" button would leave every post past the twelfth reachable only
  by running JavaScript, and those are exactly the posts that need the help.
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
    Blog + ItemList structured data. It tells Google this is a listing rather
    than an article, and names what is on it - which keeps the index itself
    from competing with the posts for the same queries.
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

  return (
    <>
      <ScrollProgress />
      <Header />

      <main>
        <section className="mx-auto w-full max-w-[1000px] gutter-x pb-10 pt-28 sm:pt-32">
          <h1 className="display-tight max-w-[16ch] text-[2.2rem] font-medium leading-[1.1] text-paper sm:text-[3rem]">
            Where the money is leaving.
          </h1>
          <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-body">
            Field notes on the seven links revenue runs through, and how to
            work out which one of them is broken in your business.
          </p>

          {tags.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Link
                href={hrefWith({ tag: undefined })}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-200 ${
                  tag
                    ? "border-white/10 text-muted hover:border-white/25 hover:text-paper"
                    : "border-signal/40 bg-signal/10 text-signal"
                }`}
              >
                All
              </Link>
              {tags.map(({ tag: name, count }) => (
                <Link
                  key={name}
                  href={hrefWith({ tag: tag === name ? undefined : name })}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-200 ${
                    tag === name
                      ? "border-signal/40 bg-signal/10 text-signal"
                      : "border-white/10 text-muted hover:border-white/25 hover:text-paper"
                  }`}
                >
                  {name}{" "}
                  <span className="tabular-nums opacity-60">{count}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        <section className="mx-auto w-full max-w-[1000px] gutter-x pb-20">
          {posts.length === 0 ? (
            <div className="rounded-[12px] border hairline bg-ink-900 px-6 py-16 text-center">
              <p className="text-[16px] text-paper">
                {tag ? `Nothing tagged “${tag}” yet.` : "Nothing published yet."}
              </p>
              <p className="mx-auto mt-2 max-w-[44ch] text-[14px] leading-relaxed text-muted">
                {tag
                  ? "Try another tag, or read everything."
                  : "The first field notes are being written. In the meantime, the audit is free."}
              </p>
              <Link
                href={tag ? "/blog" : brand.bookingUrl}
                className="mt-6 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] text-paper transition-colors duration-200 hover:border-signal/50 hover:text-signal"
              >
                {tag ? "Read everything" : "Book the audit"}
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-white/[0.07] border-y hairline">
              {posts.map((post) => (
                <li key={post.id}>
                  {/*
                    The whole card is one link. Two links to the same place -
                    a title link and a "read more" - give a crawler two
                    anchors for one destination and give a screen-reader user
                    the same target twice in the links list.
                  */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-2 py-7 transition-colors duration-300"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
                      {post.published_at ? (
                        <time dateTime={post.published_at}>
                          {new Intl.DateTimeFormat("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            timeZone: "Asia/Kolkata",
                          }).format(new Date(post.published_at))}
                        </time>
                      ) : null}
                      <span aria-hidden="true">·</span>
                      <span>{post.reading_minutes} min read</span>
                      {post.tags[0] ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{post.tags[0]}</span>
                        </>
                      ) : null}
                    </div>

                    <h2 className="max-w-[30ch] text-[22px] font-medium leading-snug tracking-tight text-paper transition-colors duration-300 group-hover:text-signal sm:text-[26px]">
                      {post.title}
                    </h2>

                    {post.excerpt ? (
                      <p className="max-w-[62ch] text-[15px] leading-relaxed text-body">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {pageCount > 1 ? (
            <nav
              aria-label="Pagination"
              className="mt-10 flex items-center justify-between gap-4"
            >
              {page > 1 ? (
                <Link
                  href={hrefWith({ page: page - 1 })}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] text-paper transition-colors duration-200 hover:border-signal/50 hover:text-signal"
                  rel="prev"
                >
                  ← Newer
                </Link>
              ) : (
                <span />
              )}

              <span className="text-[13px] tabular-nums text-muted">
                {page} / {pageCount}
              </span>

              {page < pageCount ? (
                <Link
                  href={hrefWith({ page: page + 1 })}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] text-paper transition-colors duration-200 hover:border-signal/50 hover:text-signal"
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
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
