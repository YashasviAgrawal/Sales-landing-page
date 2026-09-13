import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { WordReveal } from "@/components/ui/word-reveal";
import { hero, problem } from "@/lib/content";

export function Problem() {
  return (
    <Section className="border-t hairline">
      <Reveal>
        <p className="mb-10 max-w-[52ch] text-[15px] text-muted">
          {hero.audience}
        </p>
      </Reveal>

      <WordReveal
        text={problem.heading}
        highlight="usually wrong"
        className="display-tight max-w-[18ch] text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
      />

      <div className="mt-9 max-w-[62ch] space-y-5">
        {problem.body.map((p, i) => (
          <Reveal key={i} delay={0.08 * i} blur>
            <p className="text-[17px] leading-relaxed text-body">{p}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
