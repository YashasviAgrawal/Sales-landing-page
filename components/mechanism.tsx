"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { links, mechanism } from "@/lib/content";
import { WordReveal } from "@/components/ui/word-reveal";
import { Reveal } from "@/components/ui/reveal";

const EASE = [0.22, 0.61, 0.36, 1] as const;

type Link = (typeof links)[number];

/*
  THE MECHANISM, as a selector rather than a scroll.

  Seven links only need to be understood as a set, and a set is better shown
  than scrolled: the rail holds all seven in view at once, and the panel
  answers whichever one the reader is curious about. Stacked as seven
  full-height panels this would be most of the page.

  The question is the heading of each panel because the question is what the
  copy actually specifies for each link; the definition, symptoms and repair
  underneath are the supporting detail a reader goes looking for only once
  the question has landed.

  TWO ARRANGEMENTS, ONE SELECTOR. The rail is the same numbered vertical list
  at every width - the design does not change, only where the answer appears:

    lg and up   rail on the left, the panel in the column beside it
    below lg    the panel drops open underneath the row that was tapped

  The rail used to become a horizontally scrolling row of pills on small
  screens. That hid four of the seven links off the right edge, which defeats
  the one thing the section is for - showing that the chain has seven links
  and only one of them is the problem - and it asked the reader to discover a
  sideways scroll on a page that scrolls vertically. An accordion keeps all
  seven visible and puts each answer where the question was.
*/
export function Mechanism() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const link = links[active];

  /* No border-t: the marquee above owns its own bottom edge, and two
     adjacent hairlines were drawing a 2px line here. */
  return (
    <section id="mechanism" className="section-y scroll-mt-24">
      <div className="mx-auto w-full max-w-[1240px] gutter-x">
        <WordReveal
          text={mechanism.heading}
          highlight="the weakest link."
          className="display-tight max-w-[20ch] text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
        />

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-body">
            {mechanism.lead}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
          {/* The rail. All seven visible at once, which is the whole point. */}
          <div className="lg:col-span-4">
            <ol className="flex flex-col">
              {links.map((s, i) => {
                const on = i === active;
                return (
                  <li key={s.id} className="border-b hairline last:border-0">
                    {/*
                      aria-expanded rather than aria-pressed: below lg this is
                      a disclosure, and above lg it reveals the same content in
                      the next column, so "expanded" describes both. There is
                      deliberately no aria-controls - the panel it points at
                      exists twice, once per arrangement, and one of the two is
                      always display:none, so the reference would resolve to a
                      hidden element at one of the breakpoints.

                      py-4 below lg gives the row a 48px tap target while
                      keeping the desktop rhythm at py-3.
                    */}
                    <button
                      type="button"
                      aria-expanded={on}
                      onClick={() => setActive(i)}
                      className="group flex w-full items-center gap-4 py-4 text-left transition-colors lg:py-3"
                    >
                      <span
                        className={`font-mono text-[11px] transition-colors ${
                          on ? "text-signal" : "text-muted"
                        }`}
                      >
                        0{s.n}
                      </span>
                      <span
                        className={`text-[17px] tracking-tight transition-colors lg:text-[18px] ${
                          on ? "text-paper" : "text-muted group-hover:text-body"
                        }`}
                      >
                        {s.name}
                      </span>
                      {on && (
                        <motion.span
                          layoutId="link-marker"
                          className="ml-auto h-px w-8 bg-signal"
                        />
                      )}
                    </button>

                    {/* Below lg only: the answer drops open under its own row. */}
                    <div className="lg:hidden">
                      <AnimatePresence initial={false}>
                        {on && (
                          <motion.div
                            key="panel"
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={
                              reduce ? undefined : { height: 0, opacity: 0 }
                            }
                            transition={{ duration: 0.34, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <LinkPanel link={s} className="pt-1 pb-8" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/*
            lg and up: one panel, swapped. Height is set by the tallest link,
            not by seven. Hidden below lg, where the accordion above is
            showing the same content inline.
          */}
          <div className="hidden lg:col-span-8 lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={link.id}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.32, ease: EASE }}
              >
                <LinkPanel link={link} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-10 max-w-[52ch] text-[17px] leading-relaxed text-paper">
            {mechanism.closer}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/*
  One link's answer. Shared by both arrangements so the accordion and the
  desktop column cannot drift apart - the previous version had this markup
  written once and reachable only from the right-hand column.
*/
function LinkPanel({
  link,
  className = "",
}: {
  link: Link;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="display-tight max-w-[20ch] text-2xl font-medium sm:text-[2rem]">
        {link.question}
      </h3>

      <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-body">
        {link.definition}
      </p>

      <div className="mt-7 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
        {link.symptoms.map((sym) => (
          <p key={sym} className="text-[14px] leading-snug text-muted">
            {sym}
          </p>
        ))}
      </div>

      <div className="relative mt-7 border-l-2 border-signal/50 pl-5">
        <p className="max-w-[58ch] text-[15px] leading-relaxed text-body">
          <span className="text-paper">If this is the leak: </span>
          {link.fix}
        </p>
      </div>
    </div>
  );
}
