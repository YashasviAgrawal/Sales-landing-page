import type { MetadataRoute } from "next";
import { listPublishedSlugs } from "@/lib/posts-query";
import { siteUrl } from "@/lib/site-url";

/*
  /sitemap.xml

  What a sitemap is actually for: telling a crawler that a page EXISTS and
  when it last changed. It is not a ranking input and `priority` has been
  publicly ignored by Google for years - the values below are set sensibly and
  nothing is riding on them.

  What does matter is `lastModified`, because it is how a crawler decides
  whether re-fetching a URL is worth it. So it comes from the post's real
  updated_at rather than from `new Date()` - a sitemap that claims every page
  changed at build time is a sitemap that gets ignored.

  Only indexable pages belong here. listPublishedSlugs already excludes drafts,
  scheduled posts and anything flagged noindex; listing a noindex URL asks a
  crawler to fetch a page in order to be told not to keep it.

  Deliberately omitted: /terms and /privacy are in, because they are real
  pages a crawler should know about, but /admin is not - it is noindexed and
  behind auth, and advertising the login URL helps nobody.
*/
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const posts = await listPublishedSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/blog`,
      /* The index changes whenever the newest post does. */
      lastModified: posts[0]?.updated_at
        ? new Date(posts[0].updated_at)
        : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${base}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
