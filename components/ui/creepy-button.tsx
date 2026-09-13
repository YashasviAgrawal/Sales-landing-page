"use client";

import React, { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/*
  From the VengeanceUI registry (creepy-button), rethemed onto this palette
  and pulled into the page's shape rule. Changes from the original:

    - imports from motion/react rather than a second copy of framer-motion
    - full pill, not rounded-xl: the locked shape rule in globals.css puts
      every interactive element on a pill and reserves 12px for surfaces
    - mint cover over an ink base, replacing blue-over-black
    - renders an <a> when given an href, because every CTA on this page is a
      link to the booking section rather than a form control
    - the blink stops under prefers-reduced-motion, and the pupils stop
      tracking, leaving a static face rather than removing the eyes

  Note it does NOT set a "hide" cursor state. Hiding the pointer here seemed
  tidy at first and is actively wrong: the native cursor is suppressed while
  <AnimatedCursor> is drawing, so hiding the drawn one too leaves the eyes
  tracking something invisible and the joke stops landing. As a plain anchor
  it matches the cursor's interactive selector and the ring widens over it,
  which is the referent the pupils need.

  The eyes track the real cursor, which is the reason this button is on the
  closing CTA specifically: the product finds where attention leaks, and the
  control that books it watches you back.
*/

type CreepyButtonOwnProps = {
  children: React.ReactNode;
  className?: string;
  /** Classes for the coloured cover that tilts on hover. */
  coverClassName?: string;
  /** Renders an anchor instead of a button. */
  href?: string;
  /** Widened to HTMLElement so the same handler fits either element. */
  onClick?: React.MouseEventHandler<HTMLElement>;
};

type CreepyButtonProps = CreepyButtonOwnProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CreepyButtonOwnProps>;

type Coords = { x: number; y: number };

export function CreepyButton({
  children,
  className,
  coverClassName,
  href,
  onClick,
  ...props
}: CreepyButtonProps) {
  const eyesRef = useRef<HTMLSpanElement>(null);
  const [eyeCoords, setEyeCoords] = useState<Coords>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const reduce = useReducedMotion();

  const updateEyes = (e: React.MouseEvent | React.TouchEvent) => {
    if (reduce) return;
    const userEvent = "touches" in e ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent);
    if (!eyesRef.current || !userEvent) return;

    const eyesRect = eyesRef.current.getBoundingClientRect();
    const eyesCenter = {
      x: eyesRect.left + eyesRect.width / 2,
      y: eyesRect.top + eyesRect.height / 2,
    };

    const dx = userEvent.clientX - eyesCenter.x;
    const dy = userEvent.clientY - eyesCenter.y;
    const angle = Math.atan2(-dy, dx) + Math.PI / 2;

    /* How far the pupil travels is clamped separately per axis, so the eyes
       roll further sideways than they do up and down. */
    const visionRangeX = 180;
    const visionRangeY = 75;
    const distance = Math.hypot(dx, dy);

    setEyeCoords({
      x: (Math.sin(angle) * Math.min(distance, visionRangeX)) / visionRangeX,
      y: (Math.cos(angle) * Math.min(distance, visionRangeY)) / visionRangeY,
    });
  };

  const resetEyes = () => {
    setEyeCoords({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const pupilStyle = {
    transform: `translate(calc(-50% + ${eyeCoords.x * 50}%), calc(-50% + ${eyeCoords.y * 50}%))`,
  };

  const blink = reduce
    ? undefined
    : { height: ["0.75em", "0.75em", "0em", "0.75em"] };

  const interaction = {
    onMouseMove: (e: React.MouseEvent) => {
      updateEyes(e);
      setIsHovered(true);
    },
    onTouchMove: updateEyes,
    onMouseLeave: resetEyes,
    onFocus: () => setIsHovered(true),
    onBlur: () => setIsHovered(false),
  };

  const body = (
    <>
      {/* Eyes sit on the base layer; the cover tilts away to reveal them. */}
      <span
        ref={eyesRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[0.5em] right-[1.4em] z-0 flex h-[0.75em] items-center gap-[0.375em]"
      >
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            className="relative w-[0.75em] overflow-hidden rounded-full bg-paper"
            animate={blink}
            transition={{
              duration: 3,
              times: [0, 0.92, 0.96, 1],
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span
              className="absolute left-1/2 top-1/2 h-[0.375em] w-[0.375em] rounded-full bg-ink-950 transition-transform duration-75 ease-out"
              style={pupilStyle}
            />
          </motion.span>
        ))}
      </span>

      <motion.span
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full px-7 py-3.5",
          "bg-signal font-medium tracking-tight text-ink-950",
          "shadow-[inset_0_0_0_0.1em_var(--color-ink-950)]",
          /* Hinged at the left edge, so the cover swings open like a lid. */
          "origin-[1.25em_50%]",
          coverClassName,
        )}
        animate={{ rotate: isHovered && !reduce ? -12 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.8 }}
      >
        {children}
      </motion.span>

      {/* The cover is absolute, so an invisible copy holds the real size. */}
      <span className="block px-7 py-3.5 font-medium tracking-tight opacity-0">
        {children}
      </span>
    </>
  );

  const shell = cn(
    "group relative inline-block min-w-[9em] select-none rounded-full bg-ink-900 text-center outline-none",
    "[-webkit-tap-highlight-color:transparent]",
    className,
  );

  if (href) {
    return (
      <a href={href} className={shell} onClick={onClick} {...interaction}>
        {body}
      </a>
    );
  }

  return (
    <button type="button" className={shell} onClick={onClick} {...interaction} {...props}>
      {body}
    </button>
  );
}

export default CreepyButton;
