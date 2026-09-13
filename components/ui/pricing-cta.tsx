"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";

/*
  The button inside the entry pricing card. Separate from MagneticCta because
  a magnetic pull inside a card that itself lifts on hover fights itself; this
  one answers the pointer with an arrow that slides instead.
*/
export function PricingCta({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.a
      href={href}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="group mt-10 inline-flex items-center justify-center gap-2.5 rounded-full bg-signal px-6 py-3.5 text-[15px] font-medium text-ink-950 transition-colors duration-300 hover:bg-signal-lift"
    >
      {children}
      <span
        aria-hidden="true"
        className="inline-flex transition-transform duration-300 group-hover:translate-x-1"
      >
        <ArrowRight size={16} weight="bold" />
      </span>
    </motion.a>
  );
}
