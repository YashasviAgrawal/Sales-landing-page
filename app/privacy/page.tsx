import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { legal } from "@/lib/content";
import { absoluteUrl } from "@/lib/site-url";

/*
  The title is just the page name - the root layout's template appends the
  brand, so writing it out here would produce "Privacy policy - Sales Brain ·
  Sales Brain".

  Indexable on purpose. A privacy policy and terms page are two of the signals
  Google's quality guidance names for a business site: their absence is a mark
  against a commercial domain, and noindexing them wastes the credibility they
  buy. They are low priority in the sitemap, which is the honest description.
*/
export const metadata: Metadata = {
  title: legal.privacy.title,
  description:
    "No analytics, no trackers. What we collect when you write to us, where it is stored, why we hold it, and how long for.",
  alternates: { canonical: absoluteUrl("/privacy") },
  openGraph: {
    type: "article",
    title: legal.privacy.title,
    description:
      "What we collect, where it is stored, why we hold it, and how long for.",
    url: absoluteUrl("/privacy"),
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title={legal.privacy.title}
      updated={legal.privacy.updated}
      sections={legal.privacy.sections}
    />
  );
}
