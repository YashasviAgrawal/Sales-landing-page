import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/*
  /robots.txt

  Two jobs, and the second is the one people forget: it points at the sitemap.
  That is the most reliable way a crawler discovers one without anybody
  submitting anything in Search Console.

  On disallowing:

    /admin and /api are blocked because crawling them is pure waste - they are
    behind auth or they only accept POST, and every request a crawler spends
    on them is one it does not spend on an article. Note that robots.txt
    controls CRAWLING, not indexing: a disallowed URL can still appear in
    results if something links to it. That is why /admin ALSO sends
    noindex headers from its own metadata. The two mechanisms answer different
    questions and both are needed.

    Nothing else is blocked. Blocking CSS or JS - still common in old
    boilerplate - actively harms rankings now, because Google renders the page
    to judge it and a page it cannot style looks broken.
*/
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
