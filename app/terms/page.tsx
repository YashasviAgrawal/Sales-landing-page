import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { brand, legal } from "@/lib/content";

export const metadata: Metadata = {
  title: `${legal.terms.title} - ${brand.name}`,
  description:
    "What we sell, what we do not promise, how fees and cancellation work, and who owns what.",
  robots: { index: true, follow: true },
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
