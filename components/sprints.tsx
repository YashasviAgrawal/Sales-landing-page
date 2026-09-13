"use client";

import { Reveal } from "@/components/ui/reveal";
import { StaggerText } from "@/components/ui/stagger-text";
import { AgentBentoGrid } from "@/components/ui/agent-bento-grid";

/*
  Five repairs, one per stage, and the visitor only ever buys one.

  This used to be a horizontal scroll rail of five text panels. It is now the
  bento grid, which carries the same five sprints but draws what each one
  actually produces - a deal path, a price architecture, six tagged angles,
  revenue by source, a post-sale sequence. The argument the page makes is
  that sales is a system with locatable parts, and a diagram of the parts
  makes that case better than five paragraphs describing them.

  The heading uses the masked word rise rather than the page's usual
  WordReveal, so this section has its own entrance and the two effects are
  never running against each other in the same viewport.
*/
export function Sprints() {
  return (
    <section className="section-y border-t hairline">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <h2 className="display-tight max-w-[20ch] text-3xl font-medium sm:text-5xl lg:text-[3.4rem]">
          <StaggerText>Once we know the stage, we fix that stage</StaggerText>
        </h2>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-body">
            Each repair is a fixed-scope, fixed-price sprint. You do not buy all
            five. You buy the one that is losing you money.
          </p>
        </Reveal>

        <AgentBentoGrid className="mt-10 max-w-none" />
      </div>
    </section>
  );
}
