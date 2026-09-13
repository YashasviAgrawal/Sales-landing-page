import { Check, Prohibit } from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { WordReveal } from "@/components/ui/word-reveal";
import { fit } from "@/lib/content";

export function Fit() {
  return (
    <Section className="border-t hairline">
      <WordReveal
        text={fit.heading}
        highlight="Not everyone."
        className="display-tight text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
      />

      <div className="mt-10 grid grid-cols-1 gap-x-14 gap-y-10 md:grid-cols-2">
        <div>
          <Reveal>
            <p className="mb-5 text-[13px] text-rise">{fit.yes.label}</p>
          </Reveal>
          <RevealGroup as="ul" stagger={0.07} className="flex flex-col gap-3.5">
            {fit.yes.items.map((item) => (
              <RevealItem
                key={item}
                as="li"
                direction="right"
                distance={20}
                className="flex gap-3.5"
              >
                <Check
                  size={17}
                  weight="bold"
                  className="mt-0.5 shrink-0 text-rise"
                />
                <span className="text-[15px] leading-relaxed text-body">
                  {item}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <div>
          <Reveal delay={0.06}>
            <p className="mb-5 text-[13px] text-muted">{fit.no.label}</p>
          </Reveal>
          <RevealGroup
            as="ul"
            stagger={0.07}
            delay={0.06}
            className="flex flex-col gap-3.5"
          >
            {fit.no.items.map((item) => (
              <RevealItem
                key={item}
                as="li"
                direction="left"
                distance={20}
                className="flex gap-3.5"
              >
                <Prohibit size={17} className="mt-0.5 shrink-0 text-fall/70" />
                <span className="text-[15px] leading-relaxed text-muted">
                  {item}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>

      <Reveal delay={0.1} blur>
        <p className="mt-11 max-w-[56ch] text-[17px] leading-relaxed text-paper">
          {fit.closer}
        </p>
      </Reveal>
    </Section>
  );
}
