import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { brand, faqs } from "@/lib/content";
import { AnimatedCursor } from "@/components/ui/animated-cursor";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${brand.domain}`),
  title: `${brand.name} - Find the one thing costing you revenue`,
  description:
    "Your revenue isn’t broken everywhere. It’s broken in one place. A free 45-minute audit names the leak - offer, message, leads, funnel, conversion, pricing or ecosystem - and tells you the fix, whether you hire us or not.",
  openGraph: {
    title: "Your revenue isn’t broken everywhere. It’s broken in one place.",
    description:
      "Every agency sells you a cure. We find the disease first. Free 45-minute sales audit, no pitch.",
    url: `https://${brand.domain}`,
    siteName: brand.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your revenue isn’t broken everywhere. It’s broken in one place.",
  },
  robots: { index: true, follow: true },
};

/*
  Mobile browser chrome. Without a theme colour, Chrome on Android draws its
  address bar in its own default and iOS Safari tints its bars from the top
  of the page - so a site whose ground is #000000 arrived framed in grey.
  Matching it to the ink makes the page run to the edges of the device.

  `colorScheme: "dark"` is the other half: it tells the browser to render the
  things the stylesheet does not own - form-field autofill, the caret,
  scrollbars, the tap-and-hold menus - from its dark set rather than
  dropping a white autofill box into the booking form.

  Deliberately no `maximumScale` or `userScalable: false`. Pinch-zoom is an
  accessibility guarantee, and the usual reason people disable it - iOS
  zooming the page when a small input is focused - is fixed properly in
  globals.css by giving the fields a 16px font size.

  Width and initial scale are Next's defaults and are already correct.
*/
export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
      "dark" pins the registry components' paired light/dark classes to their
      dark half; see the note in globals.css. It is not a toggle - there is no
      light theme - it just makes the variant resolve predictably.
    */
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans">
        {/* Sits in the layout rather than the page so the pointer is the same
            on /terms and /privacy. It removes itself on coarse pointers and
            under prefers-reduced-motion. */}
        <AnimatedCursor />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </body>
    </html>
  );
}
