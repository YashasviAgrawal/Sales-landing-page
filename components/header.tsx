"use client";

import { useState } from "react";
import Image from "next/image";
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
      <div className="mx-auto flex h-[68px] w-full max-w-[1240px] items-center justify-between gutter-x">
        {/* The negative margin cancels the padding, so the lockup sits exactly
            where it did while the tap area covers the full 44px a thumb needs
            rather than the 28px the mark and its label happen to occupy. */}
        <motion.a
          href="/#top"
          className="group -my-2 flex items-center gap-2.5 py-2"
          whileHover={reduce ? undefined : { x: 2 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <BrandMark />
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
          {/* 44px square. This is the only control on a phone that opens the
              nav, and at p-2 it was a 36px circle - under every platform's
              minimum and noticeably fiddly next to the screen edge. The icon
              is unchanged; the button grew around it. */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full border hairline text-paper transition-colors duration-200 active:bg-white/10 lg:hidden"
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
              className="mx-auto flex max-w-[1240px] flex-col gutter-x py-3"
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

/*
  The brand mark, replacing the geometric funnel monogram that stood in for
  it. The supplied artwork is the designer's dark-ground lockup - white brain
  body, black gyri, white keyline, transparent exterior - so it needs no
  treatment to sit on this page's black, and the keyline gives it a defined
  edge instead of letting it bleed into the ground.

  Left deliberately uncoloured. The monogram it replaces was mint, which put
  the accent in two places in one bar; mint now marks only the CTA on the
  right, which is the one thing in the header worth pointing at.

  The funnel drew itself in on load via pathLength. A raster cannot do that,
  so the entrance is a fade and a short rise in scale - same timing curve, so
  it still arrives with the rest of the bar rather than popping in.
*/
function BrandMark() {
  const reduce = useReducedMotion();

  return (
    <motion.span
      className="inline-flex"
      initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.86 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1], delay: 0.08 }}
    >
      {/* Decorative: the brand name is spelled out in the text beside it, so
          announcing the mark too would just read the name twice. */}
      <Image
        src="/brand/mark.png"
        alt=""
        width={256}
        height={219}
        priority
        className="h-7 w-auto"
      />
    </motion.span>
  );
}
