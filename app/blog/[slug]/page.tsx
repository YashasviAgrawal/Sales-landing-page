import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { brand, CTA } from "@/lib/content";
import { renderMarkdown, markdownToText } from "@/lib/markdown";
import {
  getPublishedPost,
  listPublishedSlugs,
  listRelatedPosts,
} from "@/lib/posts-query";
import { seoDescription, seoTitle, shouldIndex } from "@/lib/posts";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import { PostBody } from "./post-body";

/*
  A single article. This page is the entire SEO surface of the blog, so almost
  every decision in it is a ranking or a crawling decision rather than a visual
  one. They are marked where they are not obvious.
*/

/*
  ISR. The page is built once and served from cache until a write invalidates
  it (the admin actions call revalidatePath) or an hour passes.

  Static HTML is the point: Googlebot renders JavaScript, but it does so on a
  second pass, days later, with no guarantee. A page that is already complete
  in the response body is indexed on the first visit. The hour is a backstop
  for edits made outside the app - straight in the Supabase table editor, say -
  which no revalidate call would ever hear about.
*/
export const revalidate = 3600;

/*
  Slugs not in the build manifest are still rendered on demand rather than
  404ing, which is what lets a post published five minutes ago be live
  immediately instead of waiting for a deploy.
*/
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) {
    /* A 404 must not be indexable, and must not inherit the site title. */
    return { title: "Not found", robots: { index: false, follow: false } };
  }

  const url = absoluteUrl(`/blog/${post.slug}`);
  const description = seoDescription(post);
  const title = seoTitle(post, brand.name);

  /*
    The cover image if there is one, otherwise the route's generated card
    (opengraph-image.tsx next to this file). Next resolves that automatically
    when `images` is omitted, but naming it explicitly here keeps the absolute
    URL under our control - relative OG image URLs are ignored by most
    scrapers, including LinkedIn's.
  */
  const image = post.cover_url
    ? { url: post.cover_url, alt: post.cover_alt ?? post.title }
    : { url: `${url}/opengraph-image`, alt: post.title };

  return {
    /*
      `absolute` bypasses the root layout's title template.

      seoTitle() already decides whether the brand fits inside the ~60
      character budget and appends it only when it does - that judgement is
      the whole point of the function. Letting the template append a second
      copy would both duplicate the brand and blow the budget, so the title is
      declared as final.
    */
    title: { absolute: title },
    description,
    /*
      The canonical. Points at our own URL unless the post says it was
      published elsewhere first, in which case it points there and tells
      Google not to rank this copy against the original.
    */
    alternates: { canonical: post.canonical_url || url },
    robots: shouldIndex(post)
      ? {
          index: true,
          follow: true,
          /* Let Google show a full snippet, a large image and any length of
             video preview. The defaults are conservative and shrink the
             result, which costs clicks for no benefit. */
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: true },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: brand.name,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [post.author_name ?? brand.founder],
      tags: post.tags,
      images: [{ ...image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) notFound();

  const { html, toc } = renderMarkdown(post.content);
  const related = await listRelatedPosts(post);

  const url = absoluteUrl(`/blog/${post.slug}`);
  const author = post.author_name ?? brand.founder;

  /*
    Structured data. Two graphs, both of which earn their bytes:

    BlogPosting is what makes the article eligible for the rich result that
    carries a date, an author and a thumbnail - the difference between a plain
    blue link and a result that takes up three times the space.

    BreadcrumbList replaces the raw URL under the title in a result with
    "Sales Brain › Blog › This post", which reads as a real site rather than a
    loose page.

    They are one script tag with @graph rather than two, so the entities can
    reference each other by @id instead of being repeated.
  */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title.slice(0, 110),
        description: seoDescription(post),
        /* mainEntityOfPage is how the article is bound to this specific URL;
           without it the markup is a floating object with no page. */
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished: post.published_at,
        dateModified: post.updated_at,
        author: {
          "@type": "Person",
          name: author,
          url: siteUrl(),
        },
        publisher: {
          "@type": "Organization",
          name: brand.name,
          url: siteUrl(),
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/icon.png"),
          },
        },
        image: post.cover_url ? [post.cover_url] : [`${url}/opengraph-image`],
        keywords: post.tags.join(", "),
        articleSection: post.tags[0],
        wordCount: markdownToText(post.content).split(/\s+/).filter(Boolean)
          .length,
        timeRequired: `PT${post.reading_minutes}M`,
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: brand.name,
            item: siteUrl(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: absoluteUrl("/blog"),
          },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <ScrollProgress />
      <Header />

      <main>
        {/*
          <article> wrapping the whole piece, and the metadata in a <header>
          inside it. Semantic containers are not decoration here: they are how
          a crawler, a reader-mode button and a screen reader all work out
          where the article starts and the navigation stops.
        */}
        <article className="relative">
          <div className="mx-auto w-full max-w-[720px] gutter-x pb-4 pt-28 sm:pt-32">
            {/*
              A visible breadcrumb as well as the structured one. The markup
              tells Google; this tells the reader, and gives every post a link
              back to the index - which is how crawl equity flows between them.
            */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                <li>
                  <Link href="/" className="transition-colors hover:text-paper">
                    {brand.name}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href="/blog"
                    className="transition-colors hover:text-paper"
                  >
                    Blog
                  </Link>
                </li>
              </ol>
            </nav>

            <header>
              {post.tags.length > 0 ? (
                <div className="mb-5 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[12px] text-body transition-colors hover:border-white/30 hover:text-paper"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              ) : null}

              {/*
                The only <h1> on the page, and it is the post title. The
                markdown renderer shifts body headings down a level so nothing
                can compete with it.
              */}
              <h1 className="display-tight text-[2rem] font-medium leading-[1.12] text-paper sm:text-[2.6rem]">
                {post.title}
              </h1>

              {post.excerpt ? (
                <p className="mt-5 text-[18px] leading-relaxed text-body">
                  {post.excerpt}
                </p>
              ) : null}

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t hairline pt-5 text-[13px] text-muted">
                <span>{author}</span>
                <span aria-hidden="true">·</span>
                {/*
                  <time datetime> with a machine-readable value. The visible
                  text is for people; the attribute is what a crawler reads,
                  and a date it cannot parse is a date it ignores.
                */}
                {post.published_at ? (
                  <time dateTime={post.published_at}>
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "Asia/Kolkata",
                    }).format(new Date(post.published_at))}
                  </time>
                ) : null}
                <span aria-hidden="true">·</span>
                <span>{post.reading_minutes} min read</span>
              </div>
            </header>
          </div>

          <PostBody html={html} toc={toc} />
        </article>

        {/*
          Closing CTA. Every post is a door into the same funnel, and a blog
          that ranks but never asks for anything is a cost centre. Same label
          as every other CTA on the site - see the note in lib/content.ts.
        */}
        <section className="border-t hairline bg-ink-900">
          <div className="mx-auto w-full max-w-[720px] gutter-x py-14 text-center">
            <p className="text-[19px] leading-relaxed text-paper">
              Wondering which of the seven links is costing you the most?
            </p>
            <p className="mx-auto mt-3 max-w-[46ch] text-[15px] leading-relaxed text-body">
              The audit names it in 45 minutes, and tells you the fix whether
              you hire us or not.
            </p>
            <Link
              href={brand.bookingUrl}
              className="tap-area mt-7 inline-block rounded-full bg-signal px-6 py-3 text-[15px] font-medium tracking-tight text-ink-950 transition-opacity hover:opacity-90"
            >
              {CTA}
            </Link>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="border-t hairline">
            <div className="mx-auto w-full max-w-[1000px] gutter-x py-14">
              <h2 className="text-[13px] uppercase tracking-[0.1em] text-muted">
                Keep reading
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/blog/${item.slug}`}
                    className="group rounded-[12px] border hairline bg-ink-900 p-5 transition-colors duration-300 hover:border-white/25"
                  >
                    <h3 className="text-[15px] font-medium leading-snug text-paper transition-colors group-hover:text-paper">
                      {item.title}
                    </h3>
                    {item.excerpt ? (
                      <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted">
                        {item.excerpt}
                      </p>
                    ) : null}
                    <p className="mt-3 text-[12px] text-muted">
                      {item.reading_minutes} min read
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
