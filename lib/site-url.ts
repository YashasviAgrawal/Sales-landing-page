import { brand } from "@/lib/content";

/*
  The one place that answers "what is this site's address?".

  It matters more than it looks. Canonical tags, sitemap entries, RSS links,
  OpenGraph URLs and JSON-LD `@id`s all have to be absolute, and they all have
  to agree - if the canonical tag says https://salesbrain.in/blog/x and the
  sitemap says https://salesbrain.vercel.app/blog/x, Google sees two URLs for
  one article and has to guess which is authoritative. It guesses wrong often
  enough that this is a well-known way to lose rankings during a migration.

  Order of preference:

    1. NEXT_PUBLIC_SITE_URL   - set it in production. Always correct.
    2. VERCEL_PROJECT_PRODUCTION_URL - the project's stable production
       hostname on Vercel. Note this is NOT VERCEL_URL: that one is the
       per-deployment hostname, unique to every build, and using it would
       publish canonical tags pointing at a deployment that will be
       superseded within the hour.
    3. brand.domain          - the value already in the copy deck.

  No trailing slash, ever: everything downstream concatenates a path onto it,
  and a double slash is a different URL to a crawler.
*/
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return normalise(explicit);

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return normalise(vercel);

  return normalise(brand.domain);
}

function normalise(value: string): string {
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withScheme.replace(/\/+$/, "");
}

/** An absolute URL for a path like "/blog/foo". */
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
