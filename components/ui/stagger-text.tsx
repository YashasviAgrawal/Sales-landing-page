"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

/*
  From the VengeanceUI registry (stagger-text), with three changes:
    - imports come from motion/react, the animation runtime this project
      already declares, rather than pulling a second copy in as framer-motion
    - honours prefers-reduced-motion, which the original does not: the masked
      rise is a large vertical movement repeated once per word
    - accepts a `once` prop so a heading can replay if it needs to

  Each word sits in its own overflow-hidden box and rises from below that box,
  so the line assembles from behind a mask rather than fading in. That mask is
  why it reads as typeset rather than as an animation laid over text.
*/

const EASE = [0.22, 1, 0.36, 1] as const;

const container = (stagger: number, delay: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

const item = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: 0.6, ease: EASE },
  },
};

export interface StaggerTextProps {
  children: React.ReactNode;
  delay?: number;
  divideBy?: "word" | "letter";
  once?: boolean;
  className?: string;
}

export function StaggerText({
  children,
  delay = 0,
  divideBy = "word",
  once = true,
  className,
}: StaggerTextProps) {
  const reduce = useReducedMotion();

  if (typeof children !== "string") {
    if (typeof children === "number" || typeof children === "boolean") {
      children = String(children);
    } else {
      return <>{children}</>;
    }
  }

  const text = children as string;
  const parts = divideBy === "letter" ? text.split("") : text.split(" ");
  const stagger = divideBy === "letter" ? 0.02 : 0.05;

  /* Reduced motion keeps the text, drops the movement entirely - a masked
     rise per word is a lot of travel to sit through. */
  if (reduce) return <span className={className}>{text}</span>;

  return (
    <motion.span
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once }}
      style={{ display: "inline-block" }}
      className={className}
    >
      {parts.map((part, i) => (
        <span
          key={i}
          className="relative inline-block overflow-hidden"
          style={{ verticalAlign: "top" }}
        >
          {/* The separators below are U+00A0, not ordinary spaces. A normal
              trailing space is collapsed away inside an inline-block and the
              words run together. Lines still wrap, because the break happens
              between the word spans rather than inside one. */}
          <motion.span variants={item} className="inline-block will-change-transform">
            {divideBy === "letter" ? (part === " " ? " " : part) : part + " "}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export default StaggerText;
