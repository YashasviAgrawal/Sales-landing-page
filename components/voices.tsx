import { voices } from "@/lib/content";

/*
  The only marquee on the page. Motivated: recognition. These are the exact
  sentences founders use, and seeing them move past in their own words does
  more work than a paragraph claiming we understand the problem.

  Two rows running against each other, because a single row reads as a ticker
  and a counter-running pair reads as noise a founder is standing inside.
*/
export function Voices() {
  const row = [...voices, ...voices];
  const reversed = [...voices].reverse();
  const rowB = [...reversed, ...reversed];

  return (
    <section
      aria-label="What founders say about their own sales"
      className="marquee-pause overflow-hidden border-y hairline bg-ink-900 py-7"
    >
      <div className="marquee-track flex w-max items-center gap-10 will-change-transform">
        {row.map((v, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className="text-[1.25rem] tracking-tight text-body sm:text-[1.6rem]">
              {v}
            </span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-signal/60" />
          </span>
        ))}
      </div>

      {/* Second row is decoration only, so it is hidden from assistive tech. */}
      <div
        aria-hidden="true"
        className="marquee-track-reverse mt-4 flex w-max items-center gap-10 will-change-transform"
      >
        {rowB.map((v, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className="text-[1.25rem] tracking-tight text-muted/70 sm:text-[1.6rem]">
              {v}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/15" />
          </span>
        ))}
      </div>
    </section>
  );
}
