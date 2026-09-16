import { listPublishedPosts } from "@/lib/posts-query";
import { brand } from "@/lib/content";
import { seoDescription } from "@/lib/posts";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

/*
  RSS 2.0 feed at /blog/feed.xml

  Still worth shipping in 2026. Not for raw traffic - it is for the small
  number of people who follow an industry closely enough to subscribe to it,
  which for a B2B consultancy is exactly the audience worth having. It is also
  how aggregators and newsletter tools pick posts up automatically, and each
  of those is a link nobody had to ask for.

  Hand-built rather than pulled from a library: RSS 2.0 is about forty lines
  of XML and adding a dependency for it means auditing that dependency
  forever.
*/
export const revalidate = 3600;

/*
  XML escaping. Five characters, and all five matter: an unescaped ampersand
  in a title - "Sales & marketing" - makes the whole document malformed, and
  a strict parser rejects the entire feed rather than the one item.
*/
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = siteUrl();
  /* Twenty is the convention: enough that a new subscriber has something to
     read, small enough that the document stays a sensible size. */
  const { posts } = await listPublishedPosts({ limit: 20 });

  const updated = posts[0]?.published_at ?? new Date().toISOString();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <description>${escapeXml(seoDescription(post))}</description>
      <pubDate>${new Date(post.published_at ?? post.created_at).toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  /*
    atom:link rel="self" is required by the RSS validators and by several
    readers, which use it to know the feed's own canonical address after it
    has been copied around.
  */
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${brand.name} — field notes`)}</title>
    <link>${escapeXml(`${base}/blog`)}</link>
    <description>${escapeXml("Why revenue breaks in one place, and how to find which one.")}</description>
    <language>en</language>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${base}/blog/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      /* Cached at the edge for an hour, and served stale for a day while it
         refreshes - a feed reader polling every few minutes should never
         cause a database read. */
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
