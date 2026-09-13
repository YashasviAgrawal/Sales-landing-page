"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 0.61, 0.36, 1] as const;

type Direction = "up" | "down" | "left" | "right" | "none";

function offset(dir: Direction, distance: number) {
  switch (dir) {
    case "up":
      return { y: distance, x: 0 };
    case "down":
      return { y: -distance, x: 0 };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

/*
  Scroll reveal. Motivated: it sequences the argument so a founder reads
  one claim at a time instead of meeting a wall of text.

  The element is always a motion element so the server and client render the
  same DOM. Reduced motion is handled by flattening the animation values,
  never by swapping the tag, which used to risk a hydration mismatch.
*/
export function Reveal({
  children,
  delay = 0,
  className,
  direction = "up",
  distance = 18,
  duration = 0.7,
  blur = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: Direction;
  distance?: number;
  duration?: number;
  blur?: boolean;
}) {
  const reduce = useReducedMotion();
  const { x, y } = offset(direction, distance);

  const hidden = reduce
    ? { opacity: 1 }
    : { opacity: 0, x, y, filter: blur ? "blur(10px)" : "blur(0px)" };

  const shown = reduce
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0, filter: "blur(0px)" };

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={{ once: true, margin: "-8% 0px -6% 0px" }}
      transition={
        reduce ? { duration: 0 } : { duration, delay, ease: EASE }
      }
    >
      {children}
    </motion.div>
  );
}

/*
  Stagger container. Children declared with <RevealItem> inherit the timing,
  so a grid of six deliverables arrives as a sequence rather than a block.
*/
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  /* So a list of deliverables can stay an <ol> rather than becoming divs. */
  as?: "div" | "ol" | "ul";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-6% 0px -6% 0px" }}
      variants={{
        hidden: {},
        shown: {
          transition: reduce
            ? { staggerChildren: 0 }
            : { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({
  children,
  className,
  direction = "up",
  distance = 22,
  duration = 0.65,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  distance?: number;
  duration?: number;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const { x, y } = offset(direction, distance);
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      variants={{
        hidden: reduce ? { opacity: 1 } : { opacity: 0, x, y },
        shown: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: reduce ? { duration: 0 } : { duration, ease: EASE },
        },
      }}
    >
      {children}
    </Tag>
  );
}
