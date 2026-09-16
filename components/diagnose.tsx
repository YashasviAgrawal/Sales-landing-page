"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowCounterClockwise } from "@phosphor-icons/react";
import { brand, links, symptomCheck } from "@/lib/content";
import { WordReveal } from "@/components/ui/word-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";

const EASE = [0.22, 0.61, 0.36, 1] as const;

/* Highest weight on the scale, and the denominator each bar is drawn
   against. Derived, so extending the scale cannot leave the bars wrong. */
const MAX = symptomCheck.scale.length - 1;

/* Enough answers for a reading. Below this the panel stays a prompt. */
const MIN_ANSWERS = 3;

/*
  SELF-DIAGNOSIS, as a working instrument rather than a form.

  This is the belief hinge of the page: the visitor has to feel the chain
  working on their own situation before booking a call is a reasonable ask.
  So the reading is live and sits beside the chart rather than underneath it.
  Answering a row moves a bar immediately, which is the same promise the call
  section makes in words - "all seven links, scored live, you watch it
  happen" - delivered here for free, before anyone is asked for an email.

  The panel is sticky on desktop so it stays in view while the reader works
  down the rows.
*/
export function Diagnose() {
  /* linkId -> weight. Absent means unanswered, which is not the same as
     "Rarely" and must not be scored as a zero the reader did not choose. */
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const reduce = useReducedMotion();

  const answered = Object.keys(answers).length;

  const result = useMemo(() => {
    if (answered < MIN_ANSWERS) return null;

    /* Rank by weight, and break ties by position in the chain. An earlier
       link usually causes the later one, so when two score the same the
       earlier is the one worth fixing first. */
    const ranked = links
      .map((l, i) => ({ link: l, score: answers[l.id] ?? 0, order: i }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.order - b.order);

    if (!ranked.length) return null;
    const tied = ranked.length > 1 && ranked[0].score === ranked[1].score;
    return { top: ranked[0].link, second: ranked[1]?.link, tied };
  }, [answers, answered]);

  /* No border-t: the tint change is already the divider, and a hairline on
     top of it as well draws the section as an inset box. */
  return (
    <section id="diagnose" className="section-y scroll-mt-24 bg-ink-900">
      <div className="mx-auto w-full max-w-[1240px] gutter-x">
        <WordReveal
          text={symptomCheck.heading}
          highlight="one of these is true."
          className="display-tight max-w-[16ch] text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
        />
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-body">
            {symptomCheck.lead}
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Chart
              answers={answers}
              onAnswer={(linkId, weight) =>
                setAnswers((a) => ({ ...a, [linkId]: weight }))
              }
            />
          </div>

          <Reveal direction="left" delay={0.12} className="lg:col-span-5">
            <LiveReading
              answers={answers}
              result={result}
              answered={answered}
              onReset={() => setAnswers({})}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/*
  THE CHART.

  Seven rows on hairlines rather than seven cards, because a ruled chart is
  what a diagnostic instrument looks like and because rules cost no vertical
  space. The statement and its scale share a row on desktop and stack on
  phones, where a three-segment control beside 45 characters of text would
  crush both.

  The three segments escalate in colour rather than all highlighting the same
  way, so severity is legible in the control itself and not only in the bars
  beside it.
*/
function Chart({
  answers,
  onAnswer,
}: {
  answers: Record<string, number>;
  onAnswer: (linkId: string, weight: number) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <RevealGroup
      as="ol"
      stagger={0.06}
      className="border-t hairline"
      aria-label="Symptom frequency chart"
    >
      {symptomCheck.probes.map((p, i) => {
        const chosen = answers[p.linkId];

        return (
          <RevealItem
            key={p.linkId}
            as="li"
            distance={14}
            className="flex flex-col gap-3 border-b hairline py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-[3px] shrink-0 font-mono text-[11px] text-muted">
                0{i + 1}
              </span>
              <span
                className={`text-[15px] leading-snug transition-colors duration-300 ${
                  chosen === undefined ? "text-body" : "text-paper"
                }`}
              >
                {p.text}
              </span>
            </div>

            <div
              role="radiogroup"
              aria-label={p.text}
              /* flex-wrap is a safety net, not a layout: the row fits at
                 320px, but a wider font fallback would otherwise push the
                 third option off the screen instead of onto a second line. */
              className="flex flex-wrap gap-1.5 pl-[26px] sm:flex-nowrap sm:pl-0 sm:shrink-0"
            >
              {symptomCheck.scale.map((label, weight) => {
                const on = chosen === weight;

                /* Unselected is always the same quiet hairline. Selected
                   escalates, so a row answered "Constantly" reads hotter
                   than one answered "Rarely" at a glance. */
                const skin = !on
                  ? "border-white/12 text-muted hover:border-white/30 hover:text-body"
                  : weight === 0
                    ? "border-white/30 bg-white/[0.07] text-body"
                    : weight === 1
                      ? "border-signal/50 bg-signal/10 text-paper"
                      : "border-signal bg-signal/20 text-signal";

                return (
                  <motion.button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => onAnswer(p.linkId, weight)}
                    whileTap={reduce ? undefined : { scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 380, damping: 24 }}
                    /* The symptom checker is the one thing on this page a
                       reader is asked to operate, and on a phone it is
                       operated with a thumb. These were 32px tall - below
                       every platform's minimum for a tap target, in a row of
                       three.

                       Height only: the three labels plus their gaps already
                       come to 246px of the 254px a 320px screen has left
                       after the indent, so widening the padding would push
                       the row off the edge. Growing them downward costs
                       nothing horizontally. */
                    className={`inline-flex min-h-11 items-center justify-center rounded-full border px-3 text-[12px] transition-colors duration-200 sm:min-h-0 sm:py-1.5 ${skin}`}
                  >
                    {label}
                  </motion.button>
                );
              })}
            </div>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}

type Result = {
  top: (typeof links)[number];
  second?: (typeof links)[number];
  tied: boolean;
} | null;

/*
  THE READOUT.

  Seven bars in the hero's visual language, deliberately: the first screen
  draws the chain narrowing, and this is the reader's own chain drawn the
  same way. Reusing the shape is what makes the quiz feel like part of the
  argument rather than a widget dropped into the page.

  The leading link takes the accent and nothing else does, so the answer is
  legible at a glance well before the text underneath spells it out.
*/
function LiveReading({
  answers,
  result,
  answered,
  onReset,
}: {
  answers: Record<string, number>;
  result: Result;
  answered: number;
  onReset: () => void;
}) {
  const reduce = useReducedMotion();
  const leadId = result?.top.id;

  return (
    <div className="glow-panel rounded-[12px] border hairline bg-ink-950 p-6 sm:p-7 lg:sticky lg:top-28">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-signal">
          {symptomCheck.panel}
        </p>
        <p className="font-mono text-[11px] tabular-nums text-muted">
          {answered} / {symptomCheck.probes.length}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {links.map((l) => {
          const score = answers[l.id] ?? 0;
          const isLead = l.id === leadId;

          return (
            <div key={l.id} className="flex items-center gap-3">
              <span
                className={`w-[68px] shrink-0 text-[12px] tracking-tight transition-colors duration-300 ${
                  isLead
                    ? "text-signal"
                    : score > 0
                      ? "text-body"
                      : "text-muted"
                }`}
              >
                {l.name}
              </span>

              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={false}
                  animate={{ width: `${(score / MAX) * 100}%` }}
                  transition={
                    reduce ? { duration: 0 } : { duration: 0.45, ease: EASE }
                  }
                  className={`h-full rounded-full ${
                    isLead ? "bg-signal" : "bg-white/25"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t hairline pt-5">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.p
              key="empty"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-[13px] leading-relaxed text-muted"
            >
              {answered === 0 ? symptomCheck.panelHint : symptomCheck.nearly}
            </motion.p>
          ) : (
            <motion.div
              key={result.top.id + String(result.tied)}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <p className="text-[12px] text-muted">{symptomCheck.result}</p>
              <p className="mt-1 text-[1.75rem] font-medium tracking-tight text-signal">
                {result.top.name}
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-body">
                {result.top.question}
              </p>

              {result.tied && result.second && (
                <p className="mt-3 text-[13px] leading-relaxed text-muted">
                  {result.second.name} {symptomCheck.tie}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-2.5">
                <a
                  href={brand.bookingUrl}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-signal px-5 py-3 text-[14px] font-medium text-ink-950 transition-colors duration-300 hover:bg-signal-lift active:scale-[0.985]"
                >
                  {symptomCheck.cta}
                  <ArrowRight
                    size={15}
                    weight="bold"
                    aria-hidden="true"
                    className={
                      reduce
                        ? "shrink-0"
                        : "shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                    }
                  />
                </a>
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[13px] text-body transition-colors duration-300 hover:border-white/40 hover:text-paper"
                >
                  <ArrowCounterClockwise size={14} aria-hidden="true" />
                  {symptomCheck.reset}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
