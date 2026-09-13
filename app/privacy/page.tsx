import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { brand, legal } from "@/lib/content";

export const metadata: Metadata = {
  title: `${legal.privacy.title} - ${brand.name}`,
  description:
    "No analytics, no trackers. What we collect when you write to us, why we hold it, and how long for.",
  robots: { index: true, follow: true },
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
