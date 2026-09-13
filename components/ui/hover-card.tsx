"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/*
  Surface that lifts under the cursor. Motivated: feedback. The pricing ladder,
  the sprint rail and the honesty panels are all things a visitor scans by
  pointing at them, and a surface that answers the pointer reads as scannable.
  Kept to a 4px rise and a hairline brightening, so the page does not bounce.
*/
export function HoverCard({
  children,
  className = "",
  as = "div",
  lift = 4,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
  lift?: number;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      whileHover={reduce ? undefined : { y: -lift }}
      transition={{ type: "spring", stiffness: 260, damping: 24, mass: 0.6 }}
    >
      {children}
    </Tag>
  );
}
