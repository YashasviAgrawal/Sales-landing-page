import { ScrollProgress } from "@/components/ui/scroll-progress";
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
    </>
  );
}
