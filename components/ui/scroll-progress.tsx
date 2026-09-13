"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";

/*
  Reading progress, drawn as a hairline in the accent colour along the top edge.
  Motivated: this is a long argument page, and a founder deciding whether to
  keep scrolling benefits from knowing how much argument is left.
*/
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: reduce ? scrollYProgress : scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-signal"
    />
  );
}
