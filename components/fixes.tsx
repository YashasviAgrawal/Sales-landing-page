"use client";

import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { StaggerText } from "@/components/ui/stagger-text";
import { AgentBentoGrid } from "@/components/ui/agent-bento-grid";
import { fixes } from "@/lib/content";

/*
  WHAT WE FIX.

  Two registers, deliberately. The nine-item grid is the claim and is built
  to be scanned in about three seconds - two or three words each, no
  descriptions, nothing to read. The bento grid underneath is the evidence,
  and rewards the reader who slows down: each panel draws what one of these
  repairs actually produces rather than describing it.

  A founder who only reads the grid has still got the point. That is the
  intended behaviour, not a compromise.

  The heading uses the masked word rise rather than the page’s usual
  WordReveal, so this section has its own entrance and the two effects are
  never running against each other in the same viewport.
*/
export function Fixes() {
  return (
    <section className="section-y border-t hairline">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <h2 className="display-tight max-w-[20ch] text-3xl font-medium sm:text-5xl lg:text-[3.4rem]">
          <StaggerText>{fixes.heading}</StaggerText>
        </h2>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-body">
            {fixes.lead}
          </p>
        </Reveal>

        <RevealGroup
          as="ul"
          stagger={0.05}
          className="mt-10 grid grid-cols-1 gap-x-8 border-t hairline sm:grid-cols-2 lg:grid-cols-3"
        >
          {fixes.items.map((item) => (
            <RevealItem
              key={item}
              as="li"
              distance={14}
              className="flex items-center gap-3 border-b hairline py-4"
            >
              <span
                aria-hidden="true"
                className="h-1 w-1 shrink-0 rounded-full bg-signal"
              />
              <span className="text-[16px] tracking-tight text-paper">
                {item}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1}>
          <p className="mt-8 max-w-[52ch] text-[17px] leading-relaxed text-paper">
            {fixes.closer}
          </p>
        </Reveal>

        <AgentBentoGrid className="mt-14 max-w-none" />
      </div>
    </section>
  );
}
