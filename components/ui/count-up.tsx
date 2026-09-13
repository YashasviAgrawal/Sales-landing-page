"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useReducedMotion, animate } from "motion/react";

/*
  Counts a number up once it is on screen. Motivated: the pipeline numbers are
  the quantity being lost at each stage, and watching 100 fall to 34 across the
  five bars is the page's whole claim, stated without a sentence.
*/
export function CountUp({
  to,
  from = 0,
  duration = 1.1,
  delay = 0,
  className,
}: {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const value = useMotionValue(from);
  const [shown, setShown] = useState(reduce ? to : from);

  useEffect(() => {
    if (reduce) {
      setShown(to);
      return;
    }
    if (!inView) return;

    const controls = animate(value, to, {
      duration,
      delay,
      ease: [0.22, 0.61, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration, delay, value]);

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
}
