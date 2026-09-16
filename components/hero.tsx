"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowDown } from "@phosphor-icons/react";
import { brand, hero, links } from "@/lib/content";
import { MagneticCta } from "@/components/ui/magnetic-cta";
import { WordReveal } from "@/components/ui/word-reveal";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

const EASE = [0.22, 0.61, 0.36, 1] as const;

/*
  THE FIRST SCREEN. One centred column, nothing beside it.

  The hero used to run copy against a diagram of the seven links. That
  diagram is now shown twice further down - as the selector rail in the
  mechanism section, and as a live chart the reader drives themselves in the
  symptom check - and showing it a third time in the first viewport bought
  nothing except a second place for the eye to start.

  So the first screen holds one thing: the claim, said once, in the middle of
  the screen with light behind it. Everything here is either the sentence or
  the light on the sentence; there is no third element to look at.

  The premium reads out of restraint plus timing, not out of ornament:

    - one entrance, choreographed in a single cascade rather than six
      components each animating on their own schedule
    - the accent phrase carries the turn and draws its own rule once the
      last word has landed
    - the light is centred on the headline, breathes, and follows the
      pointer, so the screen is never quite static and never moving enough
      to compete with the type
    - it all leaves together on scroll, slightly faster than the page

  Every motion below is off under prefers-reduced-motion. The layout is not.
*/
export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  /* The column lifts and dissolves as the page moves under it, which is the
     only depth cue a single centred column can have. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -96]);
  const fade = useTransform(scrollYProgress, [0, 0.72], [1, reduce ? 1 : 0]);

  /*
    A pool of light under the cursor. Percentages of the section rather than
    pixels, so it survives a resize, and heavily sprung so it trails the
    pointer instead of sticking to it - the difference between a light in a
    room and a torch taped to your hand.
  */
  const px = useMotionValue(50);
  const py = useMotionValue(34);
  const pointerX = useSpring(px, { stiffness: 40, damping: 24, mass: 0.8 });
  const pointerY = useSpring(py, { stiffness: 40, damping: 24, mass: 0.8 });

  function trackPointer(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 100);
    py.set(((e.clientY - r.top) / r.height) * 100);
  }

  return (
    <section
      ref={ref}
      id="top"
      onPointerMove={trackPointer}
      /* pt clears the 68px header; pb clears the scroll cue. The 8px the
         bottom carries over the top is deliberate - optical centre sits a
         little above true centre. */
      className="relative flex min-h-[100dvh] items-center overflow-hidden pt-24 pb-28"
    >
      <AmbientLight x={pointerX} y={pointerY} />

      <motion.div
        style={{ y: copyY, opacity: fade }}
        className="relative mx-auto w-full max-w-[920px] gutter-x text-center"
      >
        {/* A pill rather than a bare line: centred, a bare eyebrow has no
            left edge to sit against and reads as a stray line of type. */}
        <motion.p
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="inline-flex items-center gap-2.5 rounded-full border hairline bg-white/[0.035] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-signal backdrop-blur-sm"
        >
          <motion.span
            aria-hidden="true"
            animate={reduce ? undefined : { opacity: [1, 0.2, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-signal"
          />
          {hero.eyebrow}
        </motion.p>

        {/*
          Two sentences, and the second one is the argument. The measure is
          set in characters rather than pixels so the break holds at every
          size: the negation lands, then the correction.
        */}
        <WordReveal
          as="h1"
          trigger="mount"
          delay={0.18}
          stagger={0.055}
          text={hero.headline}
          highlight="process problem."
          highlightClassName="hl-accent"
          className="display-tight mx-auto mt-7 max-w-[21ch] text-[clamp(2.2rem,5.9vw,3.9rem)] font-medium"
        />

        <motion.p
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.62, ease: EASE }}
          className="mx-auto mt-7 max-w-[54ch] text-[17px] leading-relaxed text-body sm:text-[18px]"
        >
          <SubWithTooltip />
        </motion.p>

        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.76, ease: EASE }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
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
          transition={{ duration: 0.7, delay: 0.92 }}
          className="mx-auto mt-6 max-w-[46ch] text-[13px] leading-relaxed text-muted"
        >
          {hero.risk}
        </motion.p>

        {/* Three claims, no invented figures. A trust strip of numbers that
            are not yet true would be the first thing a founder tests. */}
        <motion.ul
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.02 }}
          className="mx-auto mt-10 flex max-w-[40rem] flex-wrap items-center justify-center gap-x-6 gap-y-2.5 border-t hairline pt-6"
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

      <ScrollCue />
    </section>
  );
}

/*
  The hero subhead, with the phrase that carries the whole argument made
  hoverable. "Seven stages" is a number the reader has no reason to trust in
  the first viewport, so the names sit on the phrase itself rather than
  behind a scroll.

  The list is derived from `links`, not typed out again, so renaming a link
  cannot leave a stale enumeration here. The split is derived from the copy
  for the same reason: if the phrase is ever edited out of hero.sub, this
  renders the sentence plainly instead of dropping a fragment.

  One tooltip, not seven. The link names in the section below live inside
  buttons, and a tooltip trigger there would nest a control inside a control.
*/
const TOOLTIP_PHRASE = "seven stages";

function SubWithTooltip() {
  const at = hero.sub.indexOf(TOOLTIP_PHRASE);
  if (at === -1) return <>{hero.sub}</>;

  const names = links.map((l) => l.name);
  const list = `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}.`;

  return (
    <>
      {hero.sub.slice(0, at)}
      <AnimatedTooltip
        variant="indis"
        restColor="var(--color-paper)"
        content={`${list} Deals almost never die in more than one.`}
      >
        {TOOLTIP_PHRASE}
      </AnimatedTooltip>
      {hero.sub.slice(at + TOOLTIP_PHRASE.length)}
    </>
  );
}

/*
  Ambient light, rebuilt around the middle of the screen.

  Four layers, in the order light actually stacks: the pool behind the
  headline, the two flanks drifting in from off-screen, the pale sweep that
  crosses every few seconds, then the fall-off that pulls the corners down so
  the eye starts on the type. Grain last, over all of it - a wash this large
  bands on cheap panels, and the reference ground is visibly grained.

  No image to download, and nothing here that moves fast enough to compete
  with a sentence.
*/
function AmbientLight({
  x,
  y,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const reduce = useReducedMotion();

  /* The cursor light. Kept faint on purpose: it should register as the room
     being lit unevenly, not as an effect the reader can name. */
  const pointerLight = useMotionTemplate`radial-gradient(460px 460px at ${x}% ${y}%, color-mix(in srgb, var(--color-signal) 8%, transparent), transparent 72%)`;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Behind the headline. Breathing, slowly enough to be felt rather
          than watched. */}
      <motion.div
        className="wash-hero-core absolute inset-0"
        animate={reduce ? undefined : { scale: [1, 1.07, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />

      {/*
        The flanks drift, so they are oversized by more than they travel. At
        `inset-0` a wash translated 60px to the right leaves 60px of unlit
        section behind it, and a radial gradient that bright near its own
        corner turns that into a visible hard seam across the top of the
        screen. 128px of bleed on every side is comfortably past the 70px
        either of them moves.
      */}
      <motion.div
        className="wash-hero-near absolute -inset-32"
        animate={
          reduce ? undefined : { x: [0, 60, -30, 0], y: [0, 40, 10, 0] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="wash-hero-far absolute -inset-32"
        animate={
          reduce ? undefined : { x: [0, -70, 20, 0], y: [0, 50, -20, 0] }
        }
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />

      {!reduce && (
        <motion.div
          className="absolute inset-0"
          style={{ background: pointerLight }}
        />
      )}

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

      <div className="hero-vignette absolute inset-0" />
      <div className="grain absolute inset-0" />
    </div>
  );
}

function ScrollCue() {
  const reduce = useReducedMotion();

  return (
    <motion.a
      href="/#mechanism"
      initial={reduce ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.35 }}
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
