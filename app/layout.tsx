import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { brand, faqs } from "@/lib/content";
import { AnimatedCursor } from "@/components/ui/animated-cursor";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${brand.domain}`),
  title: `${brand.name} - Find where your sales is leaking`,
  description:
    "Sales is not random. It leaks at one of five stages. We run a paid one-week diagnostic, name the stage, fix it, and show you what changed.",
  openGraph: {
    title: "Your sales problem has a location.",
    description:
      "Some months close, some don't, and you can't say why. Sales leaks at one specific stage. We find it.",
    url: `https://${brand.domain}`,
    siteName: brand.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your sales problem has a location.",
  },
  robots: { index: true, follow: true },
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
