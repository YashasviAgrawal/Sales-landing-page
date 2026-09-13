import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { WordReveal } from "@/components/ui/word-reveal";
import { HoverCard } from "@/components/ui/hover-card";
import { proof } from "@/lib/content";

/*
  PROOF.

  The card is built around one move: Was → Now, with the leak and the repair
  explaining the distance between them. Everything else on the card is
  support, so the two figures carry the type weight and the two middle rows
  are set small and labelled. A reader who only looks at the numbers has got
  the case; a reader who wants the mechanism reads four more lines.

  Vague praise is deliberately impossible to render here. There is no field
  for "great to work with" - the shape demands a broken metric, a named
  cause, a named repair and a fixed metric with a timeframe, because that is
  the only kind of testimonial a sceptical founder reads.

  `proof.hasCases` swaps the whole section for the honest alternative. Being
  new is not a weakness to hide behind stock quotes; it is the reason the
  audit is free, and saying so converts better than a fabricated wall of
  percentages would.
*/
export function Proof() {
  if (!proof.hasCases) return <Fallback />;

  return (
    <Section id="proof" className="border-t hairline">
      <WordReveal
        text={proof.heading}
        highlight="came for."
        className="display-tight text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
      />

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {proof.cases.map((c, i) => (
          <Reveal key={i} delay={0.08 * i} distance={24}>
            <HoverCard className="flex h-full flex-col rounded-[12px] border hairline bg-ink-900 p-6 sm:p-7">
              <p className="text-[12px] uppercase tracking-[0.14em] text-muted">
                {c.who}
              </p>

              {/* Was → Now. The whole card in two lines. */}
              <p className="mt-6 text-[15px] leading-snug text-muted line-through decoration-fall/50">
                {c.was}
              </p>
              <p className="mt-2 flex items-start gap-2 text-[1.15rem] font-medium leading-snug tracking-tight text-signal">
                <ArrowRight
                  size={15}
                  weight="bold"
                  className="mt-[6px] shrink-0"
                />
                {c.now}
              </p>

              <dl className="mt-6 flex flex-col gap-3 border-t hairline pt-5 text-[14px] leading-relaxed">
                <div>
                  <dt className="text-[12px] text-muted">The leak</dt>
                  <dd className="mt-0.5 text-body">{c.leak}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-muted">The fix</dt>
                  <dd className="mt-0.5 text-body">{c.fix}</dd>
                </div>
              </dl>

              <blockquote className="mt-auto border-t hairline pt-5">
                <p className="text-[14px] leading-relaxed text-paper">
                  “{c.quote}”
                </p>
                <footer className="mt-3 text-[13px] text-muted">
                  {c.name} — {c.role}
                </footer>
              </blockquote>
            </HoverCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* Shipped on its own when there is nothing measured to publish yet. */
function Fallback() {
  return (
    <Section id="proof" className="border-t hairline">
      <WordReveal
        text={proof.fallback.heading}
        highlight="the audit is free."
        className="display-tight max-w-[18ch] text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
      />
      <Reveal delay={0.1} blur>
        <p className="mt-7 max-w-[58ch] text-[17px] leading-relaxed text-body">
          {proof.fallback.body}
        </p>
      </Reveal>
    </Section>
  );
}
