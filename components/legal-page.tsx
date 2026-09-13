import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/ui/reveal";
import { WordReveal } from "@/components/ui/word-reveal";

/*
  Shared shell for the terms and privacy routes. Both were linked from the
  footer before they existed, which is why the footer used to 404.
*/
export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { h: string; p: string }[];
}) {
  return (
    <>
      <Header />
      <main>
        <section className="border-b hairline pt-40 pb-20 md:pt-48">
          <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
            <WordReveal
              as="h1"
              trigger="mount"
              text={title}
              className="display-tight max-w-[16ch] text-4xl font-medium sm:text-6xl"
            />
            <Reveal delay={0.2}>
              <p className="mt-7 text-[14px] text-muted">{updated}</p>
            </Reveal>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
            <ol className="flex max-w-[68ch] flex-col gap-12">
              {sections.map((s, i) => (
                <Reveal key={s.h} delay={0.04 * i}>
                  <li className="flex gap-6">
                    <span className="mt-1.5 font-mono text-[11px] text-signal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="text-[1.25rem] font-medium tracking-tight text-paper">
                        {s.h}
                      </h2>
                      <p className="mt-3 text-[16px] leading-relaxed text-body">
                        {s.p}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
