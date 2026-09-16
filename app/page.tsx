import type { Metadata } from "next";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { brand, faqs } from "@/lib/content";
import { siteUrl, absoluteUrl } from "@/lib/site-url";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Voices } from "@/components/voices";
import { Problem } from "@/components/problem";
import { Mechanism } from "@/components/mechanism";
import { Diagnose } from "@/components/diagnose";
import { Steps } from "@/components/steps";
import { Fixes } from "@/components/fixes";
import { Call } from "@/components/call";
import { Proof } from "@/components/proof";
import { Fit } from "@/components/fit";
import { Faq } from "@/components/faq";
import { Book } from "@/components/book";
import { Footer } from "@/components/footer";

/*
  One page, one action: book the audit.

  The order is an argument, and each section only earns its place by setting
  up the next one:

    Hero       the claim - the leak is in one place
    Voices     recognition, in the founder’s own sentences
    Problem    the reframe, opening on the line the marquee sets up
    Mechanism  the seven links, so "one place" becomes something specific
    Diagnose   the reader runs it on themselves, for nothing
    Steps      what we would actually do about it        [CTA]
    Fixes      and what we can build once we know
    Call       what the free 45 minutes contains         [CTA]
    Proof      evidence that it works
    Fit        who it does not work for, said plainly
    Faq        the objections that survive all of that
    Book       the only thing on the page to do          [CTA]

  There is no pricing section. The audit is free, and the cost of the repair
  depends entirely on which link is broken - the FAQ answers that honestly
  ("we’ll give you the number on the call"), and a price list would flatly
  contradict it.
*/
/*
  The home page's canonical, restated here rather than inherited.

  The root layout already sets alternates.canonical: "/", and this would be
  redundant if nothing else ever changed - but a canonical is the kind of tag
  that is silently lost when a layout is refactored, and losing it splits the
  authority of the single most linked-to URL on the site. Declared where the
  page is.
*/
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/*
  Structured data that belongs to THIS page, not to the site.

  FAQPage was previously in the root layout, which meant every route on the
  site - the blog, the legal pages, the admin panel - claimed to contain these
  questions. Markup describing content a page does not have is a spam signal,
  so it now sits with the FAQ section it describes, on the only page that
  renders it.

  Service describes the actual offer. It is what allows a result for "sales
  audit Jaipur" to carry the price and area served rather than a bare link,
  and `price: "0"` is a real, checkable fact about this offer rather than a
  marketing claim - the audit is free, and the FAQ says so in the same words.
*/
const pageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "@id": `${siteUrl()}#faq`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "Service",
      "@id": `${siteUrl()}#service`,
      name: "Revenue Leak Audit",
      serviceType: "Sales process audit",
      description:
        "A free 45-minute diagnostic that names which of the seven links in your revenue chain — offer, message, leads, funnel, conversion, pricing or ecosystem — is costing you the most, and what to do about it.",
      provider: { "@id": `${siteUrl()}#organization` },
      areaServed: { "@type": "Country", name: "India" },
      /*
        availableChannel points at where the service is actually requested.
        Without it the offer is an abstract claim; with it, the booking form is
        part of the described entity.
      */
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: absoluteUrl("/#book"),
        servicePhone: undefined,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: absoluteUrl("/#book"),
      },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl()}#webpage`,
      url: siteUrl(),
      name: `${brand.name} · Find the one thing costing you revenue`,
      isPartOf: { "@id": `${siteUrl()}#website` },
      about: { "@id": `${siteUrl()}#organization` },
      primaryImageOfPage: { "@id": `${siteUrl()}#logo` },
      inLanguage: "en-IN",
    },
  ],
};

export default function Page() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <Voices />
        <Problem />
        <Mechanism />
        <Diagnose />
        <Steps />
        <Fixes />
        <Call />
        <Proof />
        <Fit />
        <Faq />
        {/*
          Every CTA on the page lands here, so it sits last. It carries the
          closing argument as well as the form, so the reader reaches the end
          of the page once rather than twice.
        */}
        <Book />
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
    </>
  );
}
