"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { book, brand } from "@/lib/content";
import { WordReveal } from "@/components/ui/word-reveal";
import { Reveal } from "@/components/ui/reveal";
import { CreepyButton } from "@/components/ui/creepy-button";

type Status = "idle" | "invalid" | "sending" | "sent" | "failed";

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

  The form used to hand the enquiry to a mailto rather than pretend to have a
  backend. It has one now: POST /api/leads writes the row to Supabase and the
  admin panel at /admin reads it. The mailto did not go away, though - it is
  the fallback for when the API cannot take the write, because the worst
  outcome for a form at the bottom of a page someone just read is that their
  answers evaporate. See the `failed` branch below.
*/
export function Book() {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    context: "",
    /*
      The honeypot. Hidden from people and from screen readers, so only a bot
      filling in every field it finds will put anything here. The server sees
      a non-empty value, answers 200, and writes nothing.
    */
    company: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    /* Clear a validation or failure message as soon as they start fixing it,
       but never interrupt a send in flight. */
    if (status === "invalid" || status === "failed") setStatus("idle");
  }

  /* The enquiry as an email, used only when the write fails. */
  function mailtoHref() {
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.website ? `Website: ${form.website}` : null,
      "",
      "Biggest thing holding revenue back right now:",
      form.context || "(not said yet)",
    ]
      .filter(Boolean)
      .join("\n");

    return (
      `mailto:${brand.email}` +
      `?subject=${encodeURIComponent(`Sales audit request - ${form.name}`)}` +
      `&body=${encodeURIComponent(body)}`
    );
  }

  async function submit() {
    if (status === "sending") return;

    /*
      The same expression the server validates with, deliberately. Two
      validators that disagree produce the worst possible bug: a form that
      accepts a value and an API that rejects it, with the reader in the
      middle being told to fix something that looks fine.
    */
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!form.name.trim() || !validEmail) {
      setStatus("invalid");
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setStatus("sent");
      setForm({ name: "", email: "", website: "", context: "", company: "" });
    } catch {
      /*
        The write failed - the keys are missing, the database is down, or
        they are offline. Rather than lose four fields of considered writing,
        open their email client with the same answers filled in. They still
        reach us; we just find out by inbox instead of by panel.
      */
      setStatus("failed");
      window.location.href = mailtoHref();
    }
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

      <div className="relative mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-10 gutter-x lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <WordReveal
            text={book.heading}
            highlight="Then decide."
            stagger={0.07}
            className="display-tight max-w-[12ch] text-4xl font-medium sm:text-5xl lg:text-[3.6rem]"
          />
          <Reveal delay={0.12} blur>
            <p className="mt-6 max-w-[40ch] text-[17px] leading-relaxed text-paper">
              {book.lead}
            </p>
            <p className="mt-3 max-w-[40ch] text-[17px] leading-relaxed text-body">
              {book.support}
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-7 text-[14px] text-muted">{book.scarcity}</p>

            {/*
              The P.S. The cost of waiting, stated once, at the last possible
              moment. It is italic and quiet on purpose: an aggressive version
              of this sentence would undo the whole no-pitch promise above it.
            */}
            <p className="mt-7 max-w-[42ch] border-l-2 border-signal/40 pl-4 text-[14px] italic leading-relaxed text-muted">
              {book.ps}
            </p>

            <p className="mt-7 text-[14px] text-muted">{brand.city}</p>
            <a
              href={`mailto:${brand.email}`}
              className="link-underline tap-area mt-1 inline-block text-[14px] text-body transition-colors hover:text-signal"
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
                  {book.fields.website}
                </span>
                <input
                  className={field}
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  autoComplete="url"
                  placeholder="yourcompany.com"
                />
              </label>

              {/*
                The qualifier. It is the fourth and last field because it is
                the one that earns its place twice: it filters out tyre-kickers
                and it gives us the first half of the call before it starts.
              */}
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-[13px] text-muted">
                  {book.fields.context}
                </span>
                <textarea
                  className={`${field} min-h-[96px] resize-y`}
                  value={form.context}
                  onChange={(e) => set("context", e.target.value)}
                  placeholder="Good calls, then silence. Two of the last six proposals closed and I can’t say why."
                />
              </label>

              {/*
                The honeypot, and the three separate things it takes to hide
                one properly. `hidden` alone would do it, but a bot that
                respects `hidden` is not the kind that needs catching:

                  aria-hidden + tabIndex   keeps it off the screen reader and
                                           out of the tab order, so nobody
                                           using a keyboard or a screen reader
                                           ever lands in a field they cannot
                                           see and fails their own submission
                  autoComplete="off"       stops the browser helpfully filling
                                           it with a saved company name, which
                                           would silently discard a real lead
                  the wrapper, not input   position/opacity on a container is
                                           harder to spot than display:none on
                                           the field itself

                It is named "company" because that is a field name a form
                filler expects to find and will populate. A field called
                "leave-this-blank" teaches the bot exactly what to skip.
              */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0"
              >
                <label>
                  Company
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-5">
              <CreepyButton
                onClick={submit}
                disabled={status === "sending"}
                className={`text-[15px] ${status === "sending" ? "pointer-events-none opacity-70" : ""}`}
              >
                {status === "sending" ? book.sending : book.submit}
              </CreepyButton>

              {/*
                One line, five states, same slot. The message replaces the
                privacy note rather than appearing beneath it, so the block
                never changes height and the button never moves under the
                cursor at the moment it is pressed.

                aria-live="polite" is what makes the result reach a screen
                reader at all: the text swaps in without any focus change, so
                without it the only feedback on a successful submission is
                visual.
              */}
              <p
                aria-live="polite"
                className="max-w-[32ch] text-[13px] leading-relaxed text-muted"
              >
                {status === "invalid" ? (
                  <span className="text-signal">{book.invalid}</span>
                ) : status === "sending" ? (
                  <span className="text-body">{book.sending}</span>
                ) : status === "sent" ? (
                  <span className="text-signal">{book.sent}</span>
                ) : status === "failed" ? (
                  <span className="text-body">
                    {book.failed}{" "}
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
