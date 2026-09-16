import { Section } from "@/components/ui/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { WordReveal } from "@/components/ui/word-reveal";
import { problem, symptomCheck } from "@/lib/content";

/*
  THE REFRAME.

  It opens on the line that closes the symptom marquee above it. The marquee
  is the recognition beat - a founder reading their own sentences go past -
  and this sentence is the turn it sets up, so the two belong to one move and
  the line sits with the heading rather than floating above the section on
  its own.

  Laid out as two columns, like the FAQ and the call section, rather than as
  one narrow measure pinned to the left of a 1240px container: at full width
  the heading, the list and both paragraphs all stacked inside the left half
  and the right half of the section was empty.

  The three "ask a vendor" lines are the argument. Set as prose they read as
  three similar sentences; set in aligned columns on rules, the pattern is
  visible at a glance - same question, three answers, each one the thing that
  vendor happens to sell. The rules also match the chart in the section below
  and the capability grid further down, so the page keeps one way of drawing
  a list.
*/
export function Problem() {
  return (
    <Section id="problem" className="border-t hairline">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="mb-6 max-w-[34ch] text-[15px] leading-relaxed text-muted">
                {symptomCheck.closer}
              </p>
            </Reveal>

            <WordReveal
              text={problem.heading}
              highlight="nobody diagnosed."
              className="display-tight text-3xl font-medium sm:text-4xl lg:text-[2.9rem]"
            />
          </div>
        </div>

        <div className="lg:col-span-7">
          <RevealGroup as="ul" stagger={0.09} className="border-t hairline">
            {problem.asks.map((a) => (
              <RevealItem
                key={a.who}
                as="li"
                direction="right"
                distance={18}
                className="flex flex-col gap-1 border-b hairline py-4 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <span className="text-[17px] leading-snug tracking-tight text-paper sm:w-[15rem] sm:shrink-0">
                  {a.who}
                </span>
                <span className="text-[17px] leading-snug text-muted">
                  {a.answer}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>

          {/* The punchline. It gets its own air and the largest body size in
              the section, because it is the sentence the three rows above
              exist to earn. */}
          <Reveal delay={0.1} blur>
            <p className="mt-10 max-w-[34ch] text-[1.4rem] font-medium leading-snug tracking-tight text-paper sm:text-[1.6rem]">
              {problem.body[0]}
            </p>
          </Reveal>

          <Reveal delay={0.16} blur>
            <p className="mt-7 max-w-[56ch] text-[17px] leading-relaxed text-body">
              {problem.body[1]}
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
