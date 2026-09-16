import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { brand } from "@/lib/content";
import { siteUrl, absoluteUrl } from "@/lib/site-url";
import { AnimatedCursor } from "@/components/ui/animated-cursor";

/*
  Site-wide metadata.

  Everything here is inherited by every route and overridden per page where it
  should be. The rule followed throughout: state a thing once, in the place
  that owns it. A title tag written out by hand on six pages is six chances for
  the brand suffix to drift.
*/

export const metadata: Metadata = {
  /*
    The base every relative URL in metadata resolves against - canonicals,
    OpenGraph images, the lot. Read from lib/site-url.ts rather than built from
    brand.domain directly, so NEXT_PUBLIC_SITE_URL wins in production and a
    preview deployment does not publish canonical tags pointing at the live
    domain.
  */
  metadataBase: new URL(siteUrl()),

  /*
    `template` is what keeps the suffix consistent. A page sets
    title: "Privacy policy" and gets "Privacy policy · Sales Brain"; the
    landing page uses `default`, because "Sales Brain · Sales Brain" is what
    happens if you let the template touch the home page too.

    Separator is a middot rather than a hyphen. In a search result a hyphen
    reads as part of the phrase - "Find the one thing costing you revenue -
    Sales Brain" looks like one long sentence - where a middot visibly
    separates the page from the site.
  */
  title: {
    default: `${brand.name} · Find the one thing costing you revenue`,
    template: `%s · ${brand.name}`,
  },

  description:
    "Your revenue isn’t broken everywhere. It’s broken in one place. A free 45-minute audit names the leak — offer, message, leads, funnel, conversion, pricing or ecosystem — and tells you the fix, whether you hire us or not.",

  /*
    The home page's canonical. Relative, resolved against metadataBase.

    Every page on this site declares one. It is the single cheapest piece of
    technical SEO there is: without it, "/", "/?ref=twitter", "/?fbclid=…" and
    "/#book" are four URLs serving one page, and any authority earned by links
    to them is split four ways instead of pooled.
  */
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": absoluteUrl("/blog/feed.xml") },
  },

  applicationName: brand.name,
  authors: [{ name: brand.founder }],
  creator: brand.founder,
  publisher: brand.name,
  category: "business",

  /*
    Deliberately no `keywords`. The meta keywords tag has been ignored by
    Google since 2009 and by Bing since 2014; filling it in signals nothing
    except that whoever built the site last read about SEO a long time ago.
  */

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: brand.name,
    title: "Your revenue isn’t broken everywhere. It’s broken in one place.",
    description:
      "Every agency sells you a cure. We find the disease first. Free 45-minute sales audit, no pitch.",
    /* Resolved from app/opengraph-image.tsx. Named explicitly with its
       dimensions because several scrapers - LinkedIn's in particular - skip a
       card whose image size they have to discover by fetching it. */
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Sales Brain — your revenue isn’t broken everywhere. It’s broken in one place.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Your revenue isn’t broken everywhere. It’s broken in one place.",
    description:
      "Every agency sells you a cure. We find the disease first. Free 45-minute sales audit, no pitch.",
    images: ["/opengraph-image"],
  },

  robots: {
    index: true,
    follow: true,
    /*
      The googleBot block lifts the defaults on how much of the page may be
      shown in a result. -1 means "no limit": a full snippet, a large image
      preview, any length of video. The defaults are conservative and shrink
      the result, which costs clicks and buys nothing.
    */
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  /*
    Stops iOS Safari turning anything that looks like a phone number into a
    blue tel: link. The page quotes figures and dates; none of them are numbers
    to call, and auto-linked ones break the typography.
  */
  formatDetection: { telephone: false, address: false, email: false },

  /*
    Search Console and Bing verification go here once the properties are
    claimed. Left empty rather than filled with a placeholder: a wrong
    verification token is worse than none, because it fails silently.

    verification: { google: "…", other: { "msvalidate.01": "…" } },
  */
};

/*
  Mobile browser chrome. Without a theme colour, Chrome on Android draws its
  address bar in its own default and iOS Safari tints its bars from the top
  of the page - so a site whose ground is #000000 arrived framed in grey.
  Matching it to the ink makes the page run to the edges of the device.

  `colorScheme: "dark"` is the other half: it tells the browser to render the
  things the stylesheet does not own - form-field autofill, the caret,
  scrollbars, the tap-and-hold menus - from its dark set rather than dropping
  a white autofill box into the booking form.

  Deliberately no `maximumScale` or `userScalable: false`. Pinch-zoom is an
  accessibility guarantee, and the usual reason people disable it - iOS
  zooming the page when a small input is focused - is fixed properly in
  globals.css by giving the fields a 16px font size.
*/
export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

/*
  Site-wide structured data: who we are, and what the site is.

  Organization is the entity Google attaches a Knowledge Panel to, and it is
  what lets a brand search resolve to the business rather than to a page.
  WebSite declares the site itself and carries the publisher relationship.

  Both are genuinely site-wide, which is why they live here. The FAQPage graph
  used to sit in this file too and was wrong to: it was injected into every
  route, so /blog, /terms, /privacy and the admin panel all claimed to be FAQ
  pages carrying questions that appear nowhere on them. Structured data that
  describes content the page does not contain is a spam signal, and Google
  treats repeated offences as grounds to stop trusting a site's markup
  entirely. It now lives in app/page.tsx, with the FAQ section it describes.
*/
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl()}#organization`,
      name: brand.name,
      url: siteUrl(),
      description: brand.tagline,
      email: brand.email,
      logo: {
        "@type": "ImageObject",
        "@id": `${siteUrl()}#logo`,
        url: absoluteUrl("/icon.png"),
        contentUrl: absoluteUrl("/icon.png"),
      },
      image: { "@id": `${siteUrl()}#logo` },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaipur",
        addressRegion: "Rajasthan",
        addressCountry: "IN",
      },
      founder: { "@type": "Person", name: brand.founder },
      /*
        `sameAs` is where verified social and directory profiles go, and it is
        the main way Google confirms an Organization is the same entity across
        the web. Left out entirely rather than guessed - a sameAs pointing at a
        profile that is not ours, or does not exist, weakens the entity rather
        than strengthening it.

        sameAs: ["https://www.linkedin.com/company/…"],
      */
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl()}#website`,
      url: siteUrl(),
      name: brand.name,
      description: brand.tagline,
      publisher: { "@id": `${siteUrl()}#organization` },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
      lang="en-IN" rather than plain "en". The business is in Jaipur, the copy
      is Indian English, and the locale is one of the signals that decides
      which regional index a page competes in.

      "dark" pins the registry components' paired light/dark classes to their
      dark half; see the note in globals.css. It is not a toggle - there is no
      light theme - it just makes the variant resolve predictably.
    */
    <html
      lang="en-IN"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans">
        {/* Sits in the layout rather than the page so the pointer is the same
            on /terms and /privacy. It removes itself on coarse pointers, under
            prefers-reduced-motion, and inside /admin. */}
        <AnimatedCursor />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </body>
    </html>
  );
}
