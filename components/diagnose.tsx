"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowCounterClockwise } from "@phosphor-icons/react";
import { brand, stages } from "@/lib/content";
import { WordReveal } from "@/components/ui/word-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";

type Symptom = { text: string; stageId: string };

const symptoms: Symptom[] = stages.flatMap((s) =>
  s.symptoms.map((text) => ({ text, stageId: s.id })),
);

/*
  Self-diagnosis before commitment. Motivated: this is the belief hinge.
  The visitor has to feel the framework working on their own situation
  before a paid diagnostic is a reasonable ask.
*/
export function Diagnose() {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const reduce = useReducedMotion();

  const result = useMemo(() => {
    if (picked.size < 2) return null;
    const tally = new Map<string, number>();
    picked.forEach((text) => {
      const s = symptoms.find((x) => x.text === text);
      if (!s) return;
      tally.set(s.stageId, (tally.get(s.stageId) ?? 0) + 1);
    });
    const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1]);
    const top = stages.find((s) => s.id === ranked[0][0])!;
    const second =
      ranked.length > 1 ? stages.find((s) => s.id === ranked[1][0]) : undefined;
    const tied = ranked.length > 1 && ranked[0][1] === ranked[1][1];
    return { top, second, tied };
  }, [picked]);

  function toggle(text: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  }

  /* No border-t: the tint change is already the divider, and a hairline on
     top of it as well draws the section as an inset box. */
  return (
    <section id="diagnose" className="section-y scroll-mt-24 bg-ink-900">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <WordReveal
          text="Which of these sound like your last quarter?"
          highlight="last quarter?"
          className="display-tight max-w-[16ch] text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
        />
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-body">
            Tick everything that is true. Two or more and this names the stage
            your answers point at. A rough instrument, not the audit.
          </p>
        </Reveal>

        <RevealGroup stagger={0.035} className="mt-9 flex flex-wrap gap-2.5">
          {symptoms.map((s) => {
            const on = picked.has(s.text);
            return (
              <RevealItem key={s.text} distance={12} duration={0.5}>
                <motion.button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(s.text)}
                  whileHover={reduce ? undefined : { y: -2 }}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 380, damping: 24 }}
                  className={`rounded-full border px-4 py-2.5 text-left text-[14px] leading-snug transition-colors duration-200 ${
                    on
                      ? "border-signal bg-signal/12 text-paper"
                      : "border-white/12 text-body hover:border-white/30 hover:text-paper"
                  }`}
                >
                  {s.text}
                </motion.button>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {/*
          Reserved height matches the empty state, not the result card. It
          used to reserve 200px for a 90px card, leaving a permanent hole at
          the bottom of the section that the section's own padding then sat
          underneath. The card's arrival animates the difference.
        */}
        <div className="mt-9 min-h-[112px]">
          <AnimatePresence mode="wait">
            {!result ? (
              /* Empty state */
              <motion.div
                key="empty"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-[12px] border border-dashed border-white/12 p-8"
              >
                <p className="text-[15px] text-muted">
                  {picked.size === 0
                    ? "Nothing selected yet. Most founders tick between three and six."
                    : "One more and this can point somewhere."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={result.top.id + String(result.tied)}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                className="rounded-[12px] border hairline bg-ink-850 p-7 sm:p-9"
              >
                <p className="text-[13px] text-muted">
                  Your answers cluster around
                </p>
                <p className="mt-2 text-[2rem] font-medium tracking-tight text-signal sm:text-[2.5rem]">
                  {result.top.name}
                </p>
                <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-body">
                  {result.top.question} {result.top.definition}
                </p>

                {result.tied && result.second && (
                  <p className="mt-4 max-w-[58ch] text-[15px] text-muted">
                    {result.second.name} scored the same. When two stages tie,
                    the earlier one usually causes the later one, so start
                    there.
                  </p>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href={brand.bookingUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-signal px-6 py-3 text-[15px] font-medium text-ink-950 transition-colors duration-300 hover:bg-signal-lift active:scale-[0.985]"
                  >
                    Confirm this with real data
                    <ArrowRight size={16} weight="bold" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setPicked(new Set())}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-[15px] text-body transition-colors duration-300 hover:border-white/40 hover:text-paper"
                  >
                    <ArrowCounterClockwise size={16} />
                    Start over
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
