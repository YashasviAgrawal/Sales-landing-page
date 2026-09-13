"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/*
  Two-part pointer: a small filled dot pinned exactly to the cursor, and a
  larger ring that chases it on a spring. The lag is the whole effect - the
  ring is always a few frames behind, so movement leaves a short trail of
  intent rather than a rigid crosshair.

  Deliberately conservative about when it runs at all:
    - fine pointers only, so a phone or a stylus keeps its native behaviour
    - off entirely under prefers-reduced-motion, where a lagging element
      chasing the pointer is exactly the kind of thing that causes trouble
    - the native cursor is only hidden while this is actually drawing, and
      the class comes straight back off on unmount

  Any element can opt out or restyle by declaring `data-cursor`:
    data-cursor="hide"   the ring and dot fade out over that element
    data-cursor="expand" the ring opens wider than a normal hover
*/

const RING = 36; // resting ring diameter, px
const DOT = 7; // dot diameter, px

type CursorState = "idle" | "interactive" | "expand" | "hidden";

/* Everything that should widen the ring without needing an explicit attribute. */
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary';

export function AnimatedCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>("idle");
  const [pressed, setPressed] = useState(false);
  /* Stays false until the pointer first moves, so nothing flies in from 0,0. */
  const [seen, setSeen] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  /* The dot takes the raw values; only the ring is sprung. Damping is high
     enough that the ring settles rather than wobbling around the dot. */
  const ringX = useSpring(x, { stiffness: 420, damping: 34, mass: 0.55 });
  const ringY = useSpring(y, { stiffness: 420, damping: 34, mass: 0.55 });

  /* A fine pointer is the real gate - `hover` alone is true for some stylus
     and hybrid setups where a drawn cursor makes no sense. */
  useEffect(() => {
    if (reduce) return;
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [reduce]);

  useEffect(() => {
    if (!enabled) return;

    function onMove(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      /* Set unconditionally rather than guarding on `seen`. Reading that
         state here would put it in this effect's dependencies, which would
         tear down and re-attach every listener each time the pointer left
         and re-entered the document. React bails out of a re-render when the
         value is unchanged, so calling it on every move costs nothing. */
      setSeen(true);

      const el = e.target as Element | null;
      const tagged = el?.closest?.("[data-cursor]");
      const declared = tagged?.getAttribute("data-cursor");

      if (declared === "hide") setState("hidden");
      else if (declared === "expand") setState("expand");
      else if (el?.closest?.(INTERACTIVE)) setState("interactive");
      else setState("idle");
    }

    /* Leaving the document entirely should take the cursor with it, or it
       sits frozen at the edge of the viewport until the pointer returns. */
    const onLeave = () => setSeen(false);
    const onEnter = () => setSeen(true);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    document.documentElement.classList.add("has-custom-cursor");

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const hidden = state === "hidden" || !seen;

  /* Ring geometry per state. Pressing contracts it slightly, which reads as
     the click landing rather than as the ring simply changing size. */
  const ringScale = hidden
    ? 0.4
    : pressed
      ? 0.78
      : state === "expand"
        ? 2.1
        : state === "interactive"
          ? 1.55
          : 1;

  const ringOpacity = hidden ? 0 : state === "idle" ? 0.5 : 0.95;

  return (
    <>
      {/* Ring - sprung, so it trails the dot. */}
      <motion.div
        aria-hidden="true"
        style={{ x: ringX, y: ringY }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      >
        <div
          style={{ width: RING, height: RING, transform: "translate(-50%, -50%)" }}
          className="grid place-items-center"
        >
          <motion.span
            animate={{ scale: ringScale, opacity: ringOpacity }}
            transition={{ type: "spring", stiffness: 300, damping: 26, mass: 0.5 }}
            className="block h-full w-full rounded-full border border-signal"
            style={{
              /* A faint mint wash inside the ring so it reads as a lens over
                 the dark ground rather than as a hairline circle. */
              backgroundColor:
                state === "interactive" || state === "expand"
                  ? "color-mix(in srgb, var(--color-signal) 10%, transparent)"
                  : "transparent",
            }}
          />
        </div>
      </motion.div>

      {/* Dot - unsprung, so it is always exactly under the pointer. */}
      <motion.div
        aria-hidden="true"
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      >
        <div
          style={{ width: DOT, height: DOT, transform: "translate(-50%, -50%)" }}
          className="grid place-items-center"
        >
          <motion.span
            animate={{
              scale: hidden ? 0 : state === "interactive" || state === "expand" ? 0.5 : 1,
              opacity: hidden ? 0 : 1,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="block h-full w-full rounded-full bg-signal"
          />
        </div>
      </motion.div>
    </>
  );
}
