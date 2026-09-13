"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";

/*
  Magnetic pull on the primary CTA only. Motivated: feedback. It makes the
  single most important target on the page feel physically attracted to the
  cursor. Pointer values stay outside React state so nothing re-renders.

  The solid variant carries an arrow, because the copy brief specifies one
  and a directional mark on the primary action is worth the pixels. It is
  rendered here rather than typed into the label so it cannot go missing on
  one of the four placements or end up doubled when someone pastes "→" into
  the string. The ghost variant has none: two arrows side by side would give
  the secondary action the same weight as the primary one.
*/
export function MagneticCta({
  href,
  children,
  variant = "solid",
  className = "",
  arrow,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
  /** Defaults to on for solid, off for ghost. */
  arrow?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 18, mass: 0.4 });

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.28);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  const base =
    "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-7 py-3.5 text-[15px] font-medium transition-colors duration-300 active:scale-[0.985]";
  const skin =
    variant === "solid"
      ? "glow-cta bg-signal text-ink-950 hover:bg-signal-lift"
      : "border border-white/20 text-paper hover:border-signal hover:text-signal";

  const showArrow = arrow ?? variant === "solid";

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={`${base} ${skin} ${className}`}
    >
      {children}
      {showArrow && (
        <ArrowRight
          size={16}
          weight="bold"
          aria-hidden="true"
          /* Nudges forward under the pointer. Transform only, and it sits
             still under prefers-reduced-motion like everything else here. */
          className={
            reduce
              ? "shrink-0"
              : "shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
          }
        />
      )}
    </motion.a>
  );
}
