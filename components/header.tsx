"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { brand, nav, hero } from "@/lib/content";
import { SpotlightNavbar } from "@/components/ui/spotlight-navbar";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <motion.header
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b hairline bg-ink-950/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] w-full max-w-[1240px] items-center justify-between px-5 md:px-8">
        <motion.a
          href="/#top"
          className="group flex items-center gap-2.5"
          whileHover={reduce ? undefined : { x: 2 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <Wordmark />
          <span className="text-[15px] font-medium tracking-tight">
            {brand.name}
          </span>
        </motion.a>

        {/*
          The spotlight pill replaces the row of underlined links. Scroll spy
          is on, so the light under the pill tracks the section actually in
          view - which is the only reading of "active" that means anything on
          a one-page site. The underlined links survive in the mobile panel
          below and in the footer.
        */}
        <div className="hidden lg:block">
          <SpotlightNavbar items={nav} scrollSpy />
        </div>

        <div className="flex items-center gap-3">
          <motion.a
            href={brand.bookingUrl}
            whileHover={reduce ? undefined : { y: -2 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="hidden rounded-full bg-signal px-5 py-2.5 text-[14px] font-medium text-ink-950 transition-colors duration-300 hover:bg-signal-lift sm:inline-flex"
          >
            {hero.navCta}
          </motion.a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border hairline p-2 text-paper lg:hidden"
          >
            {open ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
          </button>
        </div>
      </div>

      {/* AnimatePresence so the panel closes with motion instead of vanishing. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
            className="overflow-hidden border-t hairline bg-ink-950/95 backdrop-blur-xl lg:hidden"
          >
            <motion.div
              initial="hidden"
              animate="shown"
              variants={{
                hidden: {},
                shown: {
                  transition: { staggerChildren: reduce ? 0 : 0.05 },
                },
              }}
              className="mx-auto flex max-w-[1240px] flex-col px-5 py-3"
            >
              {nav.map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  variants={{
                    hidden: reduce ? { opacity: 1 } : { opacity: 0, x: -12 },
                    shown: { opacity: 1, x: 0 },
                  }}
                  className="border-b hairline py-3.5 text-[15px] text-body last:border-0"
                >
                  {item.label}
                </motion.a>
              ))}
              <a
                href={brand.bookingUrl}
                onClick={() => setOpen(false)}
                className="mt-4 mb-2 inline-flex justify-center rounded-full bg-signal px-5 py-3 text-[15px] font-medium text-ink-950 sm:hidden"
              >
                {/* The open mobile panel has room, so this one carries the
                    full page-wide label rather than the shortened header
                    version. */}
                {hero.primaryCta}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* Simple geometric monogram: a funnel narrowing to a point. */
function Wordmark() {
  const reduce = useReducedMotion();

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <motion.path
        d="M2 3h18l-6.4 8v7.3L8.4 21v-10L2 3Z"
        fill="none"
        stroke="var(--color-signal)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
      />
    </svg>
  );
}
