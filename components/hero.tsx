"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowDown } from "@phosphor-icons/react";
import { brand, hero, links } from "@/lib/content";
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

          {/* Two sentences rather than one, so the type steps down a size and
              the line length opens up. The turn is the whole idea, and it
              needs to land as a turn, not as a wrapped fragment. */}
          <WordReveal
            as="h1"
            trigger="mount"
            delay={0.1}
            stagger={0.055}
            text={hero.headline}
            highlight="one place."
            highlightClassName="italic leading-[1.1] text-signal"
            className="display-tight text-[2.3rem] font-medium sm:max-w-[17ch] sm:text-[3.2rem] lg:text-[3.6rem]"
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

          {/* The risk reversal sits directly under the button, where the
              hesitation actually happens. Small, quiet, and the last thing
              read before the click. */}
          <motion.p
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-5 max-w-[42ch] text-[13px] leading-relaxed text-muted"
          >
            {hero.risk}
          </motion.p>

          {/* Three claims, no invented figures. A trust strip of numbers that
              are not yet true would be the first thing a founder tests. */}
          <motion.ul
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.95 }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t hairline pt-6"
          >
            {hero.trust.map((t) => (
              <li
                key={t}
                className="flex items-center gap-2 text-[12px] text-muted"
              >
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-signal/70"
                />
                {t}
              </li>
            ))}
          </motion.ul>
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
  hoverable. "The exact leak" is the claim the rest of the page spends itself
  proving, and a reader meeting it in the first viewport has no idea yet
  which links are meant - so the answer sits on the phrase rather than
  forcing a scroll.

  One tooltip, not seven. The link names in the section below live inside
  buttons, and a tooltip trigger there would nest a control inside a control.

  The split is derived from the copy rather than hardcoded, so editing
  hero.sub in lib/content.ts cannot leave a stale fragment behind: if the
  phrase is ever removed, this renders the sentence plainly.
*/
const TOOLTIP_PHRASE = "the exact leak";

function SubWithTooltip() {
  const at = hero.sub.indexOf(TOOLTIP_PHRASE);
  if (at === -1) return <>{hero.sub}</>;

  return (
    <>
      {hero.sub.slice(0, at)}
      <AnimatedTooltip
        variant="indis"
        restColor="var(--color-paper)"
        content="Offer, Message, Leads, Funnel, Conversion, Pricing or Ecosystem. Almost never all seven at once."
      >
        {TOOLTIP_PHRASE}
      </AnimatedTooltip>
      {hero.sub.slice(at + TOOLTIP_PHRASE.length)}
    </>
  );
}

/*
  Ambient light. Two large green washes drifting at different speeds, plus a
  fine grain layer. Motivated: the reference’s surfaces sit on a lit forest
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
  The mechanism, drawn. Each bar is one link in the revenue chain and its
  width is how much volume survives that link. The narrowing is the argument
  the whole page makes, so it belongs in the first viewport rather than in a
  body paragraph.

  Seven bars rather than five, so the rhythm is tighter than the page’s usual
  spacing: at the old gap this panel grew past the fold on a laptop.
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

      <p className="mb-6 text-[13px] text-muted">
        A hundred conversations, seven links, one constriction.
      </p>

      <div className="flex flex-col gap-3.5">
        {links.map((s, i) => {
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

              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.055]">
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
                  className="mt-1.5 text-[12px] text-signal/80"
                >
                  Where most founders are quietly losing the most money
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
      href="/#mechanism"
      initial={reduce ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.3 }}
      aria-label="Scroll to the seven links"
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
