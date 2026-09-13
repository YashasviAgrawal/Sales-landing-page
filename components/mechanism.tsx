"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { links, mechanism } from "@/lib/content";
import { WordReveal } from "@/components/ui/word-reveal";
import { Reveal } from "@/components/ui/reveal";

/*
  THE MECHANISM, as a selector rather than a scroll.

  Seven links only need to be understood as a set, and a set is better shown
  than scrolled: the rail holds all seven in view at once, and the panel
  beside it answers whichever one the reader is curious about. Stacked as
  seven full-height panels this would be most of the page.

  The question is the heading of each panel because the question is what the
  copy actually specifies for each link; the definition, symptoms and repair
  underneath are the supporting detail a reader goes looking for only once
  the question has landed.
*/
export function Mechanism() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const link = links[active];

  /* No border-t: the marquee above owns its own bottom edge, and two
     adjacent hairlines were drawing a 2px line here. */
  return (
    <section id="mechanism" className="section-y scroll-mt-24">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
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
            <ol className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
              {links.map((s, i) => {
                const on = i === active;
                return (
                  <li
                    key={s.id}
                    className="shrink-0 lg:shrink lg:border-b lg:hairline lg:last:border-0"
                  >
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setActive(i)}
                      className={`group flex w-full items-center gap-3 rounded-full border px-4 py-2.5 text-left transition-colors lg:gap-4 lg:rounded-none lg:border-0 lg:px-0 lg:py-3 ${
                        on
                          ? "border-signal bg-signal/12 lg:bg-transparent"
                          : "border-white/12 hover:border-white/30 lg:border-0"
                      }`}
                    >
                      <span
                        className={`font-mono text-[11px] transition-colors ${
                          on ? "text-signal" : "text-muted"
                        }`}
                      >
                        0{s.n}
                      </span>
                      <span
                        className={`text-[15px] tracking-tight transition-colors lg:text-[18px] ${
                          on ? "text-paper" : "text-muted group-hover:text-body"
                        }`}
                      >
                        {s.name}
                      </span>
                      {on && (
                        <motion.span
                          layoutId="link-marker"
                          className="ml-auto hidden h-px w-8 bg-signal lg:block"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* One panel, swapped. Height is set by the tallest link, not by seven. */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={link.id}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
              >
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
