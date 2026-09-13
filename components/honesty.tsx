import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { WordReveal } from "@/components/ui/word-reveal";
import { HoverCard } from "@/components/ui/hover-card";
import { honesty } from "@/lib/content";

/*
  Three commitments, one row.

  This was an asymmetric layout - one large lead card beside two stacked
  smaller ones - which stacked two cards' worth of height into the section
  for no argumentative gain. Three equal cards are the same three promises
  at a third less height, and they scan as a set, which is what a client
  skimming this page needs from them. The first still carries the accent,
  so the hierarchy survives the flattening.
*/
export function Honesty() {
  return (
    <Section className="border-t hairline">
      <WordReveal
        text={honesty.heading}
        highlight="not going to pretend otherwise"
        className="display-tight max-w-[20ch] text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
      />

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {honesty.points.map((p, i) => (
          <Reveal
            key={p.title}
            delay={0.08 * i}
            direction={i === 0 ? "right" : "left"}
            distance={24}
          >
            <HoverCard
              className={`h-full rounded-[12px] p-6 sm:p-7 ${
                i === 0
                  ? "bg-signal/10"
                  : "border hairline bg-ink-900"
              }`}
            >
              <p
                className={`text-[1.05rem] tracking-tight ${
                  i === 0 ? "font-medium text-signal" : "text-paper"
                }`}
              >
                {p.title}
              </p>
              <p className="mt-2.5 text-[14px] leading-relaxed text-body">
                {p.body}
              </p>
            </HoverCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
