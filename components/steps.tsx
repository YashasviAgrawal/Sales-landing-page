"use client";

import { motion, useReducedMotion } from "motion/react";
import { brand, steps } from "@/lib/content";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { WordReveal } from "@/components/ui/word-reveal";
import { MagneticCta } from "@/components/ui/magnetic-cta";

const EASE = [0.22, 0.61, 0.36, 1] as const;

/*
  HOW IT WORKS. Three steps, and the only section on the page that describes
  the engagement rather than the problem.

  The numerals sit on a line that draws itself left to right as the section
  arrives. That is deliberate: the page has just spent a section arguing that
  revenue is a chain, and the process that repairs it is drawn as one too. It
  is also the only place the page shows forward motion - every other diagram
  here narrows.

  Two things about how the line is built, both learned the hard way:

  1. The label sits BELOW its numeral, not beside it. With the two on one
     row the connector ran at badge-centre height straight through the words
     "Diagnose", "Fix" and "Scale", and a hairline crossing letterforms reads
     as a rendering fault rather than as a diagram.

  2. It is three short segments, one per gap, rather than one rule laid under
     the whole grid. A single rule has to start at the left edge and stop at
     an arbitrary width, so it emerged from nothing on the left and dangled
     into nothing on the right. Each segment instead starts just past its own
     badge and stops just short of the next one, which is the only geometry
     that actually says "these three are connected". The last step has no
     segment, because there is nothing after it to connect to.

  Everything is hidden below lg, where the steps stack vertically and a
  horizontal connector between them would mean nothing.
*/
export function Steps() {
  const reduce = useReducedMotion();

  return (
    <section id="how" className="section-y scroll-mt-24 border-t hairline">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <WordReveal
          text={steps.heading}
          highlight="Scale."
          className="display-tight text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
        />

        <RevealGroup
          as="ol"
          stagger={0.12}
          className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12"
        >
          {steps.items.map((s, i) => {
            const isLast = i === steps.items.length - 1;

            return (
              <RevealItem key={s.n} as="li" distance={24} className="relative">
                {/*
                  The connector for this step, living in the gap to its right.
                  -right-10 reaches 40px into the 48px grid gap, so it stops
                  8px short of the next badge instead of touching it.
                */}
                {!isLast && (
                  <motion.span
                    aria-hidden="true"
                    initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: "-15% 0px" }}
                    transition={{
                      duration: 0.7,
                      delay: 0.3 + i * 0.18,
                      ease: EASE,
                    }}
                    className="absolute -right-10 left-[34px] top-[13px] hidden h-px origin-left bg-gradient-to-r from-signal/55 to-signal/15 lg:block"
                  />
                )}

                <span className="relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-signal font-mono text-[11px] font-medium text-ink-950">
                  {s.n}
                </span>

                <p className="mt-4 text-[1.35rem] font-medium tracking-tight text-paper">
                  {s.name}
                </p>

                <p className="mt-3 max-w-[38ch] text-[16px] leading-relaxed text-body">
                  {s.body}
                </p>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {/*
          CTA two of four, centred.

          The page is otherwise left-aligned to the container and this is the
          deliberate exception: it is the only CTA that closes a symmetric
          three-column row rather than sitting inside a column of prose. Left
          against that grid it read as orphaned in the bottom corner; centred
          it reads as the conclusion the three steps were building to.
        */}
        <Reveal delay={0.12}>
          <div className="mt-16 flex justify-center">
            <MagneticCta href={brand.bookingUrl}>{steps.cta}</MagneticCta>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
