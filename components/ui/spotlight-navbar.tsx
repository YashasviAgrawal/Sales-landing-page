"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { cn } from "@/lib/utils";

/*
  From the VengeanceUI registry (spotlight-navbar), rethemed and corrected.

  Two lights, both positioned by CSS custom properties that JS writes on the
  nav element rather than by React state, so pointer movement never re-renders
  the tree:

    --spotlight-x  a soft pool that tracks the pointer directly
    --ambience-x   a hard bar under the active item, sprung so it slides

  Changes from the original:
    - motion/react instead of a second framer-motion copy
    - the mint accent, and no light theme. The original sniffed a `.dark`
      class on <html>; this site has no theme switch and is dark always, so
      that observer is gone and the colours are simply the palette's.
    - links are no longer preventDefault()ed. The original swallowed every
      click, which meant an anchor nav navigated nowhere - fatal here, where
      the header also renders on /terms and /privacy and the hrefs are
      root-relative ("/#pricing") specifically so they can leave those pages.
    - optional scroll spy, so the light tracks the section you are actually
      reading instead of only the last thing clicked
*/

export interface NavItem {
  label: string;
  href: string;
}

export interface SpotlightNavbarProps {
  items: NavItem[];
  className?: string;
  onItemClick?: (item: NavItem, index: number) => void;
  defaultActiveIndex?: number;
  /**
   * Track the visible section and move the ambience light to match. Ids are
   * read off each href's fragment. Off when the nav is not on the page the
   * sections live on.
   */
  scrollSpy?: boolean;
}

export function SpotlightNavbar({
  items,
  className,
  onItemClick,
  defaultActiveIndex = 0,
  scrollSpy = false,
}: SpotlightNavbarProps) {
  const navRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [hovering, setHovering] = useState(false);

  const spotlightX = useRef(0);
  const ambienceX = useRef(0);

  /* Centre of an item, in nav-local coordinates. */
  const centreOf = useCallback((index: number) => {
    const nav = navRef.current;
    const item = nav?.querySelector(`[data-index="${index}"]`);
    if (!nav || !item) return null;
    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    return itemRect.left - navRect.left + itemRect.width / 2;
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - nav.getBoundingClientRect().left;
      setHovering(true);
      spotlightX.current = x;
      nav.style.setProperty("--spotlight-x", `${x}px`);
    };

    /* On leave the pool springs back to the active item rather than snapping,
       so the nav settles instead of blinking. */
    const handleMouseLeave = () => {
      setHovering(false);
      const target = centreOf(activeIndex);
      if (target == null) return;
      animate(spotlightX.current, target, {
        type: "spring",
        stiffness: 200,
        damping: 20,
        onUpdate: (v) => {
          spotlightX.current = v;
          nav.style.setProperty("--spotlight-x", `${v}px`);
        },
      });
    };

    nav.addEventListener("mousemove", handleMouseMove);
    nav.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      nav.removeEventListener("mousemove", handleMouseMove);
      nav.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [activeIndex, centreOf]);

  /* Ambience follows the active item, and is re-measured on resize because
     the pill's items reflow with the viewport. */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const settle = () => {
      const target = centreOf(activeIndex);
      if (target == null) return;
      animate(ambienceX.current, target, {
        type: "spring",
        stiffness: 200,
        damping: 20,
        onUpdate: (v) => {
          ambienceX.current = v;
          nav.style.setProperty("--ambience-x", `${v}px`);
        },
      });
    };

    settle();
    window.addEventListener("resize", settle);
    return () => window.removeEventListener("resize", settle);
  }, [activeIndex, centreOf]);

  /* Scroll spy. Sections are keyed off the fragment in each href, and the one
     nearest the top of the viewport while still on screen wins. */
  useEffect(() => {
    if (!scrollSpy) return;

    const ids = items.map((i) => i.href.split("#")[1]).filter(Boolean) as string[];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!visible) return;
        const idx = ids.indexOf(visible.target.id);
        if (idx >= 0) setActiveIndex(idx);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [scrollSpy, items]);

  return (
    <nav
      ref={navRef}
      className={cn(
        "relative h-10 overflow-hidden rounded-full border border-white/10 bg-ink-900/70 backdrop-blur-xl",
        className,
      )}
    >
      <ul className="relative z-10 flex h-full items-center gap-0 px-1.5">
        {items.map((item, idx) => (
          <li key={item.href} className="flex h-full items-center justify-center">
            <a
              href={item.href}
              data-index={idx}
              onClick={() => {
                setActiveIndex(idx);
                onItemClick?.(item, idx);
              }}
              className={cn(
                "rounded-full px-3.5 py-2 text-[13px] transition-colors duration-200",
                activeIndex === idx ? "text-paper" : "text-body hover:text-paper",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Pool of light under the pointer. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-[1] h-full w-full transition-opacity duration-300"
        style={{
          opacity: hovering ? 1 : 0,
          background:
            "radial-gradient(120px circle at var(--spotlight-x) 100%, color-mix(in srgb, var(--color-signal) 22%, transparent) 0%, transparent 50%)",
        }}
      />

      {/* Hard bar marking the active item. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-[2] h-px w-full"
        style={{
          background:
            "radial-gradient(60px circle at var(--ambience-x) 0%, var(--color-signal) 0%, transparent 100%)",
        }}
      />
    </nav>
  );
}

export default SpotlightNavbar;
