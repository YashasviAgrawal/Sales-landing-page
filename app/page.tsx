import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Problem } from "@/components/problem";
import { Voices } from "@/components/voices";
import { Stages } from "@/components/stages";
import { Diagnose } from "@/components/diagnose";
import { Audit } from "@/components/audit";
import { Sprints } from "@/components/sprints";
import { Honesty } from "@/components/honesty";
import { Pricing } from "@/components/pricing";
import { Fit } from "@/components/fit";
import { Faq } from "@/components/faq";
import { Book } from "@/components/book";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <Problem />
        <Voices />
        <Stages />
        <Diagnose />
        <Audit />
        <Sprints />
        <Honesty />
        <Pricing />
        <Fit />
        <Faq />
        {/*
          Every CTA on the page lands here, so it sits last. It carries the
          closing argument as well as the form; the separate full-height
          final-CTA wall that used to sit above it was a second ending.
        */}
        <Book />
      </main>
      <Footer />
    </>
  );
}
