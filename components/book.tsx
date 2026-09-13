"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { book, brand } from "@/lib/content";
import { WordReveal } from "@/components/ui/word-reveal";
import { Reveal } from "@/components/ui/reveal";
import { CreepyButton } from "@/components/ui/creepy-button";

type Status = "idle" | "invalid" | "sent";

/*
  The closing section, and the destination for every CTA on the page.

  It used to be two sections: a full-height wall that said "find out where
  the money is leaving" with a button, and then, immediately below it, the
  form that button scrolled to. That asked the reader to reach the end of
  the page twice. The closing headline now sits beside the form, so the
  argument and the action happen in one screen.

  The watching button survives that merge and gets a better job. It was the
  CTA on the wall, one scroll above the real control; here it is the control
  itself - the page argues that finding a leak takes paying attention, and
  the thing you actually press to book watches you back.

  The form hands the enquiry to an ordinary email rather than pretending to
  have a backend, so nothing here can break.
*/
export function Book() {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    context: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (status !== "idle") setStatus("idle");
  }

  function submit() {
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!form.name.trim() || !validEmail) {
      setStatus("invalid");
      return;
    }

    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.company ? `Company: ${form.company}` : null,
      "",
      "Where sales feels like it is leaking:",
      form.context || "(not said yet)",
    ]
      .filter(Boolean)
      .join("\n");

    const href =
      `mailto:${brand.email}` +
      `?subject=${encodeURIComponent(`Leak audit request - ${form.name}`)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = href;
    setStatus("sent");
  }

  const field =
    "w-full rounded-[12px] border border-white/15 bg-ink-950 px-5 py-3.5 text-[15px] text-paper placeholder:text-muted transition-colors duration-300 focus:border-signal focus:outline-none";

  return (
    /*
      Slightly more air than the page rhythm, and no border-t. This is the
      last thing before the footer and the only section that asks for an
      action, so it gets to sit apart; the tint change already divides it.
    */
    <section
      id="book"
      className="relative scroll-mt-24 overflow-hidden bg-ink-900 py-16 md:py-24"
    >
      {/* The closing glow, kept from the section this replaced. */}
      <motion.div
        aria-hidden="true"
        className="wash-close pointer-events-none absolute inset-0"
        animate={
          reduce ? undefined : { opacity: [0.65, 1, 0.65], scale: [1, 1.06, 1] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="wash-book pointer-events-none absolute inset-0"
        animate={reduce ? undefined : { x: [0, -50, 0], y: [0, 30, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-10 px-5 md:px-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <WordReveal
            text={book.heading}
            highlight="is leaving"
            stagger={0.07}
            className="display-tight max-w-[13ch] text-4xl font-medium sm:text-5xl lg:text-[3.6rem]"
          />
          <Reveal delay={0.12} blur>
            <p className="mt-6 max-w-[42ch] text-[16px] leading-relaxed text-body">
              {book.lead}
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-6 max-w-[38ch] text-[14px] leading-relaxed text-muted">
              {book.support}
            </p>
            <p className="mt-6 text-[14px] text-muted">{brand.city}</p>
            <a
              href={`mailto:${brand.email}`}
              className="link-underline mt-1 inline-block text-[14px] text-body transition-colors hover:text-signal"
            >
              {brand.email}
            </a>
          </Reveal>
        </div>

        <Reveal direction="left" delay={0.1} className="lg:col-span-7">
          <div className="rounded-[12px] border hairline bg-ink-950 p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-[13px] text-muted">
                  {book.fields.name}
                </span>
                <input
                  className={field}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  autoComplete="name"
                  placeholder="Priya Raghavan"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[13px] text-muted">
                  {book.fields.email}
                </span>
                <input
                  className={field}
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                  placeholder="you@company.com"
                />
              </label>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-[13px] text-muted">
                  {book.fields.company}
                </span>
                <input
                  className={field}
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  autoComplete="organization"
                  placeholder="Company name"
                />
              </label>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-[13px] text-muted">
                  {book.fields.context}
                </span>
                <textarea
                  className={`${field} min-h-[96px] resize-y`}
                  value={form.context}
                  onChange={(e) => set("context", e.target.value)}
                  placeholder="Good calls, then silence. Two of the last six proposals closed and I cannot say why."
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-5">
              <CreepyButton onClick={submit} className="text-[15px]">
                {book.submit}
              </CreepyButton>

              <p className="max-w-[32ch] text-[13px] leading-relaxed text-muted">
                {status === "invalid" ? (
                  <span className="text-signal">{book.invalid}</span>
                ) : status === "sent" ? (
                  <span className="text-body">
                    {book.sent}{" "}
                    <a
                      href={`mailto:${brand.email}`}
                      className="text-signal underline"
                    >
                      {brand.email}
                    </a>
                    .
                  </span>
                ) : (
                  book.note
                )}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
