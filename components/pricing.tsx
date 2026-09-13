import { Reveal } from "@/components/ui/reveal";
import { WordReveal } from "@/components/ui/word-reveal";
import { HoverCard } from "@/components/ui/hover-card";
import { PricingCta } from "@/components/ui/pricing-cta";
import { brand, pricing } from "@/lib/content";

export function Pricing() {
  return (
    /* No border-t: the tint change is the divider. */
    <section id="pricing" className="section-y scroll-mt-24 bg-ink-900">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <WordReveal
          text={pricing.heading}
          highlight="costs"
          stagger={0.08}
          className="display-tight text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
        />
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-body">
            {pricing.lead}
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* The entry product carries the weight. Everything else is quoted after it. */}
          <Reveal className="lg:col-span-5" direction="right" distance={28}>
            <HoverCard
              lift={6}
              className="flex h-full flex-col justify-between rounded-[12px] border border-signal/35 bg-ink-950 p-8 sm:p-10"
            >
              <div>
                <p className="text-[13px] text-signal">Start here</p>
                <h3 className="mt-4 text-[1.6rem] font-medium tracking-tight">
                  {pricing.entry.name}
                </h3>
                <p className="mt-6 text-[2.6rem] font-medium tracking-tight text-paper">
                  {pricing.entry.price}
                </p>
                <p className="mt-1 text-[14px] text-muted">
                  {pricing.entry.duration}
                </p>
                <p className="mt-6 max-w-[38ch] text-[15px] leading-relaxed text-body">
                  {pricing.entry.summary}
                </p>
              </div>
              <PricingCta href={brand.bookingUrl}>
                {pricing.entry.cta}
              </PricingCta>
            </HoverCard>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
            {pricing.ladder.map((p, i) => (
              <Reveal key={p.name} delay={0.08 * (i + 1)}>
                <HoverCard className="flex h-full flex-col rounded-[12px] border hairline p-7 transition-colors duration-300 hover:border-signal/30">
                  <p className="text-[17px] tracking-tight text-paper">{p.name}</p>
                  <p className="mt-4 text-[1.05rem] text-signal">{p.price}</p>
                  <p className="mt-1 text-[13px] text-muted">{p.duration}</p>
                  <p className="mt-5 text-[14px] leading-relaxed text-body">
                    {p.note}
                  </p>
                </HoverCard>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.08}>
          <p className="mt-9 max-w-[60ch] text-[15px] leading-relaxed text-muted">
            {pricing.rule}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
