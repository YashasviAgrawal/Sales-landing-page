import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { legal } from "@/lib/content";
import { absoluteUrl } from "@/lib/site-url";

/* Title is the page name only; the layout template appends the brand. */
export const metadata: Metadata = {
  title: legal.terms.title,
  description:
    "What we sell, what we do not promise, how fees and cancellation work, and who owns what.",
  alternates: { canonical: absoluteUrl("/terms") },
  openGraph: {
    type: "article",
    title: legal.terms.title,
    description:
      "What we sell, what we do not promise, how fees and cancellation work, and who owns what.",
    url: absoluteUrl("/terms"),
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      title={legal.terms.title}
      updated={legal.terms.updated}
      sections={legal.terms.sections}
    />
  );
}
