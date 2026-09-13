"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { WordReveal } from "@/components/ui/word-reveal";
import { MagneticCta } from "@/components/ui/magnetic-cta";
import { brand, call, hero } from "@/lib/content";

/*
  WHAT HAPPENS ON THE CALL.

  The objection this section answers is never stated out loud: "free" means
  "sales call". So it does not argue - it just publishes the agenda, minute
  by minute, and lets the specificity do the work. Four numbered lines a
  reader can hold someone to.

  The closing paragraph is the most load-bearing copy on the page and is set
  larger than the steps above it for that reason. It concedes the commercial
  motive rather than hiding it, which is the only move that makes a free
  diagnostic believable to someone who has been pitched before.
*/
export function Call() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  /* The photograph drifts against the scroll, so the sticky column does not
     read as a frozen screenshot while the list beside it moves. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : ["-5%", "5%"],
  );
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduce ? [1, 1, 1] : [1.06, 1.02, 1.06],
  );

  return (
    /* No border-t: the section above is tinted, so its edge is the divider. */
    <section id="call" className="section-y scroll-mt-24">
      <div
        ref={ref}
        className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-10 px-5 md:px-8 lg:grid-cols-12 lg:gap-14"
      >
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <ThroughTheGlasses y={imageY} scale={imageScale} />
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-7">
          <WordReveal
            text={call.heading}
            highlight="exactly what happens."
            className="display-tight max-w-[16ch] text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
          />

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-body">
              {call.lead}
            </p>
          </Reveal>

          <RevealGroup
            as="ol"
            stagger={0.08}
            className="mt-10 flex flex-col gap-6"
          >
            {call.steps.map((s, i) => (
              <RevealItem
                key={s.title}
                as="li"
                direction="left"
                distance={22}
                className="flex gap-4"
              >
                <span className="mt-[3px] font-mono text-[11px] text-signal">
                  0{i + 1}
                </span>
                <p className="max-w-[50ch] text-[16px] leading-relaxed text-body">
                  <span className="tracking-tight text-paper">{s.title} </span>
                  {s.body}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.12} blur>
            <p className="mt-10 max-w-[54ch] border-l-2 border-signal/50 pl-5 text-[17px] leading-relaxed text-paper">
              {call.closer}
            </p>
          </Reveal>

          {/* CTA three of four. */}
          <Reveal delay={0.16}>
            <div className="mt-10">
              <MagneticCta href={brand.bookingUrl}>
                {hero.primaryCta}
              </MagneticCta>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/*
  THROUGH THE GLASSES.

  The argument of this section is that you cannot fix a leak you have not
  located, and the photograph makes it without a caption: the book is blurred
  everywhere except through the lens, where it is sharp enough to read a page
  number. That is the audit - the business is the same business either way,
  and the only thing that changed is that someone put the right lens on it.

  Three deliberate moves:

  1. Cropped portrait onto one lens rather than shown as the landscape frame
     it was shot as. A single lens filling a tall column is a composition; two
     lenses squeezed into one would be a stock photo.

  2. Graded, not filtered. The original is warm sepia, which would fight the
     green-black everywhere else on the page. The source file is desaturated
     and re-tinted toward the palette before it ever reaches the browser, so
     there is no CSS filter running on every frame and no brown left to argue
     with the mint.

  3. No frame. The vignette takes the photograph’s own edges down into the
     page ground, so there is no rectangle and no border - the image emerges
     from the section instead of being pasted onto it. The one warm-free
     accent is a mint glow sitting exactly on the lens: the only place the
     picture is sharp is the only place the site’s colour appears.
*/
function ThroughTheGlasses({
  y,
  scale,
}: {
  y: MotionValue<string>;
  scale: MotionValue<number>;
}) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[12px]">
      {/* Oversized so the drift never pulls an edge into view. */}
      <motion.div style={{ y, scale }} className="absolute -inset-[6%]">
        <Image
          src="/audit-glasses.jpg"
          alt="Reading glasses over an open book: the page is a blur everywhere except through the lens, where the text is sharp enough to read."
          fill
          sizes="(max-width: 1024px) 92vw, 40vw"
          className="object-cover"
        />
      </motion.div>

      {/* Sits the photograph back from the page. A bright image on this ground
          reads as a light leak; multiply keeps the blacks black. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ink-950/32 mix-blend-multiply"
      />

      {/* Overlay, not screen. The lens is the brightest thing in the frame,
          and screen has almost nothing left to lift there - it tinted the
          dark surround instead of the one place that matters. */}
      <div
        aria-hidden="true"
        className="lens-glow absolute inset-0 mix-blend-overlay"
      />

      <div aria-hidden="true" className="vignette-photo absolute inset-0" />
    </div>
  );
}
