"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/*
  PARTICLE FIELD.

  A canvas of slow-drifting dust that parallaxes against the pointer. It is
  the hero's entire background now that the green washes are gone, so it has
  to survive a long look: the drift is a tenth of a pixel a frame, the alpha
  tops out at 0.7, and every dot fades out as it approaches an edge rather
  than popping at the boundary.

  Adapted from the reference implementation in three ways, all of them
  required by this page rather than by taste:

    - Reduced motion is honoured. The field is painted once and the loop
      never starts, which is the rule every other animation on this site
      follows.
    - The pointer is read into a ref rather than React state. The original
      called setState on every mousemove, which is sixty renders a second to
      move dots a canvas is already redrawing itself.
    - The loop stops when the hero leaves the viewport. This is a long page;
      there is no reason to keep painting a screen nobody is looking at.

  The whole engine lives in one effect on purpose. Split across callbacks it
  needs a dependency array per function and grows a stale-closure bug the
  first time somebody adds a prop.
*/

interface Circle {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
}

export interface ParticlesProps {
  className?: string;
  children?: ReactNode;
  /* Dots in the field. Cheap - 150 costs well under a millisecond a frame. */
  quantity?: number;
  /* Higher is stiller: how much of the pointer offset a dot ignores. */
  staticity?: number;
  /* Higher is lazier: how slowly a dot catches up to its parallax target. */
  ease?: number;
  /* Floor for the dot radius in CSS pixels; each dot adds 0-1 on top. */
  size?: number;
  /* Flip to reseed the field - a new random arrangement, same settings. */
  refresh?: boolean;
  color?: string;
  /* Constant drift, in pixels per frame. Useful for a slow rise or fall. */
  vx?: number;
  vy?: number;
}

function hexToRgb(hex: string): string {
  let normalized = hex.replace("#", "");

  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const int = Number.parseInt(normalized, 16);
  return `${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}`;
}

export function Particles({
  className,
  children,
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rgb = hexToRgb(color);
    const mouse = { x: 0, y: 0 };

    let circles: Circle[] = [];
    let w = 0;
    let h = 0;
    let frame = 0;
    let running = false;

    const spawn = (): Circle => ({
      x: Math.floor(Math.random() * w),
      y: Math.floor(Math.random() * h),
      translateX: 0,
      translateY: 0,
      size: Math.random() + size,
      alpha: 0,
      targetAlpha: Number.parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
      dx: (Math.random() - 0.5) * 0.1,
      dy: (Math.random() - 0.5) * 0.1,
      magnetism: 0.1 + Math.random() * 4,
    });

    /* Setting width or height wipes the canvas and resets the transform, so
       every call to this has to be followed by a paint. */
    const resize = () => {
      w = container.offsetWidth;
      h = container.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (c: Circle) => {
      ctx.translate(c.translateX, c.translateY);
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, ${c.alpha})`;
      ctx.fill();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* 0 at the edge, 1 once a dot is 20px clear of it. */
    const edgeFade = (distance: number) => {
      const v = distance / 20;
      return v > 0 ? Number.parseFloat(v.toFixed(2)) : 0;
    };

    const step = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      for (const c of circles) {
        const nearest = Math.min(
          c.x + c.translateX - c.size,
          w - c.x - c.translateX - c.size,
          c.y + c.translateY - c.size,
          h - c.y - c.translateY - c.size,
        );
        const fade = edgeFade(nearest);

        if (fade > 1) {
          c.alpha = Math.min(c.alpha + 0.02, c.targetAlpha);
        } else {
          c.alpha = c.targetAlpha * fade;
        }

        c.x += c.dx + vx;
        c.y += c.dy + vy;
        c.translateX += (mouse.x / (staticity / c.magnetism) - c.translateX) / ease;
        c.translateY += (mouse.y / (staticity / c.magnetism) - c.translateY) / ease;

        draw(c);

        /*
          Recycled in place. The reference spliced the dot out mid-iteration
          and pushed a replacement onto the same array, which skips the next
          dot and grows the array while it is being walked.
        */
        if (
          c.x < -c.size ||
          c.x > w + c.size ||
          c.y < -c.size ||
          c.y > h + c.size
        ) {
          Object.assign(c, spawn());
        }
      }

      frame = window.requestAnimationFrame(step);
    };

    /* Reduced motion: one frame, at rest, at full alpha. */
    const paintStill = () => {
      ctx.clearRect(0, 0, w, h);
      for (const c of circles) {
        c.alpha = c.targetAlpha;
        draw(c);
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(step);
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - w / 2;
      const y = e.clientY - rect.top - h / 2;
      if (x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2) {
        mouse.x = x;
        mouse.y = y;
      }
    };

    resize();
    circles = Array.from({ length: quantity }, spawn);

    if (reduce) {
      paintStill();
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    /*
      Width changes are a real layout change and get a fresh field. Height
      changes are not: a phone collapsing its address bar fires a resize on
      every scroll, and reseeding there makes the whole field visibly
      reshuffle under the headline. Dots left outside the new bounds are
      recycled by the loop on their own.
    */
    let queued = false;
    const observer = new ResizeObserver(() => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        const previous = w;
        resize();
        if (w !== previous) circles = Array.from({ length: quantity }, spawn);
        if (reduce) paintStill();
      });
    });
    observer.observe(container);

    /* Paint only while the hero is on screen. */
    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (reduce) return;
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    visibility.observe(container);

    return () => {
      stop();
      observer.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [quantity, staticity, ease, size, refresh, color, vx, vy, reduce]);

  return (
    <div
      ref={containerRef}
      aria-hidden={children ? undefined : "true"}
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}

export default Particles;
