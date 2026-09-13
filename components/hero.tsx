"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowDown } from "@phosphor-icons/react";
import { brand, hero, stages } from "@/lib/content";
import { MagneticCta } from "@/components/ui/magnetic-cta";
import { WordReveal } from "@/components/ui/word-reveal";
import { CountUp } from "@/components/ui/count-up";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  /* Parallax: the copy and the diagram leave the viewport at different rates,
     which gives the first screen depth without a background image. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -70]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -150]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.15]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative min-h-[100dvh] overflow-hidden pt-24 pb-16 md:pt-24"
    >
      <AmbientLight />

      <motion.div
        style={{ opacity: fade }}
        className="relative mx-auto grid min-h-[calc(100dvh-10rem)] w-full max-w-[1240px] grid-cols-1 items-center gap-14 px-5 md:px-8 lg:grid-cols-12 lg:gap-10"
      >
        <motion.div style={{ y: copyY }} className="lg:col-span-6">
          <motion.p
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-signal"
          >
            <motion.span
              aria-hidden="true"
              animate={reduce ? undefined : { opacity: [1, 0.25, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-signal"
            />
            {hero.eyebrow}
          </motion.p>

          <WordReveal
            as="h1"
            trigger="mount"
            delay={0.1}
            stagger={0.07}
            text={hero.headline}
            highlight="location."
            highlightClassName="italic leading-[1.1] text-signal"
            className="display-tight max-w-[13ch] text-[2.6rem] font-medium sm:text-6xl lg:text-[4.2rem]"
          />

          <motion.p
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.55, ease: EASE }}
            className="mt-7 max-w-[46ch] text-[17px] leading-relaxed text-body"
          >
            <SubWithTooltip />
          </motion.p>

          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.68, ease: EASE }}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <MagneticCta href={brand.bookingUrl}>{hero.primaryCta}</MagneticCta>
            <MagneticCta href={brand.quizUrl} variant="ghost">
              {hero.secondaryCta}
            </MagneticCta>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: panelY }} className="lg:col-span-6 lg:pl-6">
          <LeakPipeline />
        </motion.div>
      </motion.div>

      <ScrollCue />
    </section>
  );
}

/*
  The hero subhead, with the phrase that carries the whole argument made
  hoverable. "One stage" is the claim the rest of the page spends itself
  proving, and a reader meeting it in the first viewport has no idea yet
  which five stages are meant - so the answer sits on the phrase rather than
  forcing a scroll.

  One tooltip, not five. The stage names in the section below live inside
  buttons, and a tooltip trigger there would nest a control inside a control.

  The split is derived from the copy rather than hardcoded, so editing
  hero.sub in lib/content.ts cannot leave a stale fragment behind: if the
  phrase is ever removed, this renders the sentence plainly.
*/
const TOOLTIP_PHRASE = "one stage";

function SubWithTooltip() {
  const at = hero.sub.indexOf(TOOLTIP_PHRASE);
  if (at === -1) return <>{hero.sub}</>;

  return (
    <>
      {hero.sub.slice(0, at)}
      <AnimatedTooltip
        variant="indis"
        restColor="var(--color-paper)"
        content="Offer, Message, Demand, Conversion or Retention. Almost never all five at once."
      >
        {TOOLTIP_PHRASE}
      </AnimatedTooltip>
      {hero.sub.slice(at + TOOLTIP_PHRASE.length)}
    </>
  );
}

/*
  Ambient light. Two large green washes drifting at different speeds, plus a
  fine grain layer. Motivated: the reference's surfaces sit on a lit forest
  ground that falls off to near-black at the edges, and the grain is visible
  in it. This is that, in CSS, with no image to download and nothing that
  competes with the type.
*/
function AmbientLight() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* The lit corner, falling off across the screen as in the reference. */}
      <motion.div
        className="wash-hero-near absolute inset-0"
        animate={
          reduce ? undefined : { x: [0, 60, -30, 0], y: [0, 40, 10, 0] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="wash-hero-far absolute inset-0"
        animate={
          reduce ? undefined : { x: [0, -70, 20, 0], y: [0, 50, -20, 0] }
        }
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* A slow sweep of light across the whole first screen. */}
      <motion.div
        className="wash-sweep absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-14deg]"
        animate={reduce ? undefined : { x: ["0%", "420%"] }}
        transition={{
          duration: 11,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut",
        }}
      />

      <div className="grain absolute inset-0" />
    </div>
  );
}

/*
  The mechanism, drawn. Each bar is one sales stage and its width is how much
  volume survives that stage. The narrowing is the argument the whole page
  makes, so it belongs in the first viewport rather than in a body paragraph.
*/
function LeakPipeline() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
      className="glow-panel relative rounded-[12px] border hairline bg-ink-900/60 p-6 backdrop-blur-sm sm:p-8"
    >
      {/* A hairline that traces the panel edge once on arrival. */}
      <motion.span
        aria-hidden="true"
        initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
        className="absolute inset-x-0 top-0 h-px origin-left bg-signal/60"
      />

      <p className="mb-7 text-[13px] text-muted">
        A hundred conversations, five stages, one constriction.
      </p>

      <div className="flex flex-col gap-5">
        {stages.map((s, i) => {
          const isLeak = s.id === "conversion";
          return (
            <div key={s.id}>
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <span
                  className={`text-[13px] font-medium tracking-tight ${
                    isLeak ? "text-signal" : "text-paper"
                  }`}
                >
                  {s.name}
                </span>
                <CountUp
                  to={s.flow}
                  delay={0.35 + i * 0.11}
                  duration={0.9}
                  className="font-mono text-[11px] text-muted"
                />
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.055]">
                <motion.div
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${s.flow}%` }}
                  transition={{
                    duration: 0.9,
                    delay: 0.35 + i * 0.11,
                    ease: EASE,
                  }}
                  className={`relative h-full rounded-full ${
                    isLeak ? "hatch" : "bg-white/25"
                  }`}
                >
                  {/* The leaking stage keeps pulsing. Nothing else moves. */}
                  {isLeak && !reduce && (
                    <motion.span
                      aria-hidden="true"
                      animate={{ opacity: [0, 0.55, 0] }}
                      transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.4,
                      }}
                      className="absolute inset-0 rounded-full bg-paper"
                    />
                  )}
                </motion.div>
              </div>

              {isLeak && (
                <motion.p
                  initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="mt-2 text-[12px] text-signal/80"
                >
                  The most common leak, and the least served by software
                </motion.p>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ScrollCue() {
  const reduce = useReducedMotion();

  return (
    <motion.a
      href="/#stages"
      initial={reduce ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.3 }}
      aria-label="Scroll to the five stages"
      className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted transition-colors hover:text-signal md:flex"
    >
      <span className="text-[10px] uppercase tracking-[0.22em]">Scroll</span>
      <motion.span
        animate={reduce ? undefined : { y: [0, 7, 0] }}
        transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown size={14} />
      </motion.span>
    </motion.a>
  );
}
