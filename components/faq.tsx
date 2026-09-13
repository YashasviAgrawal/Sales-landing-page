"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "@phosphor-icons/react";
import { faqs } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";
import { WordReveal } from "@/components/ui/word-reveal";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="section-y scroll-mt-24 border-t hairline">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-12 px-5 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <WordReveal
              text="Questions founders actually ask"
              highlight="actually ask"
              className="display-tight text-3xl font-medium sm:text-5xl"
            />
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="border-t hairline">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <Reveal
                  key={f.q}
                  delay={0.05 * i}
                  distance={14}
                  className="border-b hairline"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left"
                  >
                    <span
                      className={`text-[17px] tracking-tight transition-colors ${
                        isOpen ? "text-signal" : "text-paper"
                      }`}
                    >
                      {f.q}
                    </span>
                    <motion.span
                      animate={reduce ? undefined : { rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-1 shrink-0 text-muted"
                    >
                      <Plus size={17} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[62ch] pb-6 text-[15px] leading-relaxed text-body">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
