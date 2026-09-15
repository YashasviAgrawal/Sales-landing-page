"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { brand, nav } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";
import { AnimatedFooter } from "@/components/ui/animated-footer";

type Status = "idle" | "loading" | "done" | "error";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const reduce = useReducedMotion();

  /*
    ⚠ PLACEHOLDER - THIS SENDS NOTHING AND MUST BE WIRED BEFORE LAUNCH.

    The label above this field promises the seven-point checklist and the
    success state says to go and check your inbox. Right now the "request"
    is a 700ms timer: the address is discarded and no email is ever sent.

    Left as-is, the first thing a prospect experiences is the page breaking
    a promise - on a site whose entire argument is that we tell you the
    truth even when it costs us the deal. That is a worse failure here than
    on an ordinary newsletter box.

    Replace the timer with a real POST to your list provider, and keep the
    thrown error: the catch already shows the failure state rather than
    claiming success.
  */
  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await new Promise((r) => setTimeout(r, 700));
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="border-t hairline bg-ink-900">
      {/*
        The ASCII band sits above the functional rows rather than replacing
        them. It carries no links, contact details or legal routes of its own,
        so swapping it in wholesale would have taken the newsletter, the nav
        and the Terms and Privacy links off the page with it. Composed this
        way the drama is additive and nothing is lost.

        The two source images are funnels that narrow stage by stage - the
        page’s own argument, sampled into glyphs that light under the pointer.
      */}
      {/* Half the height it was. It is a signature, not a section. */}
      <div className="h-[240px] w-full border-b hairline sm:h-[280px] md:h-[340px]">
        <AnimatedFooter
          headingLines={["SALES", "BRAIN"]}
          background="#0a0d0b"
          columns={44}
          cellSize={13}
          fontSize={12}
        />
      </div>

      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-10 px-5 py-12 md:grid-cols-12 md:px-8">
        <Reveal className="md:col-span-5">
          {/* Same lockup as the header, one step larger to sit with the
              1.5rem name. The mark closes the page where the header opens
              it. */}
          <div className="flex items-center gap-3">
            <Image
              src="/brand/mark.png"
              alt=""
              width={256}
              height={219}
              className="h-8 w-auto"
            />
            <p className="text-[1.5rem] font-medium tracking-tight">
              {brand.name}
            </p>
          </div>
          {/* The positioning line, verbatim, in the last place it can be read.
              The hero opens on it and the footer closes on it; saying it two
              different ways is what makes a position stop landing. */}
          <p className="mt-4 max-w-[34ch] text-[17px] leading-relaxed text-paper">
            {brand.tagline}
          </p>
          <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-body">
            Every agency sells you a cure. We find the disease first.
          </p>
          <p className="mt-8 text-[14px] text-muted">{brand.city}</p>
          <a
            href={`mailto:${brand.email}`}
            className="link-underline mt-1 inline-block text-[14px] text-body transition-colors hover:text-signal"
          >
            {brand.email}
          </a>
        </Reveal>

        <Reveal className="md:col-span-3" delay={0.08}>
          <p className="text-[13px] text-muted">Page</p>
          <ul className="mt-5 flex flex-col gap-3">
            {nav.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="link-underline text-[15px] text-body transition-colors hover:text-paper"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="md:col-span-4" delay={0.16}>
          <label
            htmlFor="footer-email"
            className="block text-[13px] text-muted"
          >
            The 7-point checklist we use in every audit. Run it on your own
            business tonight.
          </label>
          <div className="mt-5 flex gap-2">
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="you@company.com"
              className="w-full rounded-full border border-white/15 bg-ink-950 px-5 py-3 text-[15px] text-paper placeholder:text-muted transition-colors duration-300 focus:border-signal focus:outline-none"
            />
            <motion.button
              type="button"
              onClick={submit}
              disabled={status === "loading"}
              aria-label="Subscribe"
              whileHover={reduce ? undefined : { scale: 1.06 }}
              whileTap={reduce ? undefined : { scale: 0.94 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="shrink-0 rounded-full bg-signal px-5 text-ink-950 transition-colors duration-300 hover:bg-signal-lift disabled:opacity-60"
            >
              <motion.span
                animate={
                  status === "loading" && !reduce
                    ? { x: [0, 5, 0] }
                    : { x: 0 }
                }
                transition={
                  status === "loading"
                    ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.2 }
                }
                className="inline-flex"
              >
                <ArrowRight size={17} weight="bold" />
              </motion.span>
            </motion.button>
          </div>

          <p className="mt-3 min-h-[20px] text-[13px]">
            {status === "error" && (
              <span className="text-signal">
                That address does not look right. Try again.
              </span>
            )}
            {status === "loading" && (
              <span className="text-muted">Adding you.</span>
            )}
            {status === "done" && (
              <span className="text-body">
                Sent. Check your inbox for the checklist.
              </span>
            )}
          </p>
        </Reveal>
      </div>

      <div className="border-t hairline">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 px-5 py-7 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>
            &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          {/* Both routes exist now. They used to be dead links. */}
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="link-underline transition-colors hover:text-body"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="link-underline transition-colors hover:text-body"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
