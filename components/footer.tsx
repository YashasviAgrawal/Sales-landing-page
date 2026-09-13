"use client";

import { useState } from "react";
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

  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      // Wire this to your list provider.
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
        page's own argument, sampled into glyphs that light under the pointer.
      */}
      {/* Half the height it was. It is a signature, not a section. */}
      <div className="h-[240px] w-full border-b hairline sm:h-[280px] md:h-[340px]">
        <AnimatedFooter
          headingLines={["SALES", "BRAIN"]}
          background="#0b1611"
          columns={44}
          cellSize={13}
          fontSize={12}
        />
      </div>

      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-10 px-5 py-12 md:grid-cols-12 md:px-8">
        <Reveal className="md:col-span-5">
          <p className="text-[1.5rem] font-medium tracking-tight">{brand.name}</p>
          <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-body">
            We find the stage where your sales leaks, fix that stage, and show
            you what changed.
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
            One leaking sales system, taken apart, every week
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
                You are on the list. First issue lands Tuesday.
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
