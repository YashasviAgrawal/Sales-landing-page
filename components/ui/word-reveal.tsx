"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ElementType } from "react";

const EASE = [0.22, 0.61, 0.36, 1] as const;

/*
  Word-by-word headline reveal. Motivated: the headlines on this page are the
  argument, not decoration. Landing them one word at a time makes the reader
  finish the sentence instead of skimming past it.

  Words animate on opacity, offset and blur rather than inside a clip mask,
  because a clip mask crops descenders at these display sizes.

  `trigger` controls when it runs: "view" for section headings that arrive on
  scroll, "mount" for the hero, which is already on screen at load.
*/
export function WordReveal({
  text,
  as: Tag = "h2",
  className = "",
  highlight,
  highlightClassName = "italic text-signal",
  delay = 0,
  stagger = 0.045,
  trigger = "view",
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /* Exact substring to render in the accent style, e.g. "location." */
  highlight?: string;
  highlightClassName?: string;
  delay?: number;
  stagger?: number;
  trigger?: "view" | "mount";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[Tag as "h2"];

  const words = text.split(" ");
  const highlightWords = highlight ? highlight.split(" ") : [];
  const firstHighlight = highlight
    ? words.findIndex((_, i) =>
        highlightWords.every((w, k) => words[i + k] === w),
      )
    : -1;

  const container = {
    hidden: {},
    shown: {
      transition: reduce
        ? { staggerChildren: 0 }
        : { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const word = {
    hidden: reduce
      ? { opacity: 1 }
      : { opacity: 0, y: "0.45em", filter: "blur(8px)" },
    shown: {
      opacity: 1,
      y: "0em",
      filter: "blur(0px)",
      transition: reduce ? { duration: 0 } : { duration: 0.7, ease: EASE },
    },
  };

  const runWhen =
    trigger === "mount"
      ? { animate: "shown" as const }
      : {
          whileInView: "shown" as const,
          viewport: { once: true, margin: "-10% 0px -10% 0px" },
        };

  return (
    <MotionTag
      className={className}
      initial="hidden"
      variants={container}
      {...runWhen}
    >
      {words.map((w, i) => {
        const inHighlight =
          firstHighlight >= 0 &&
          i >= firstHighlight &&
          i < firstHighlight + highlightWords.length;

        /* The space sits outside the inline-block so lines still wrap. */
        return (
          <span key={`${w}-${i}`}>
            <motion.span
              variants={word}
              className={`inline-block will-change-[transform,filter] ${
                inHighlight ? highlightClassName : ""
              }`}
            >
              {w}
            </motion.span>
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </MotionTag>
  );
}
