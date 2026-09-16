import { Star } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { WordReveal } from "@/components/ui/word-reveal";
import { HoverCard } from "@/components/ui/hover-card";
import { proof } from "@/lib/content";

/*
  PROOF, as six reviews.

  This was a Was → Now grid with the leak and the repair broken out into
  labelled rows. It was a good case-study card and the wrong instrument: the
  labels made it read as something we had written about the client, and a
  founder discounts our account of their result far more heavily than they
  discount the client's own sentences. So the scaffolding is gone. A rating,
  what the person said, who they are. Nothing between the reader and the
  speech.

  The rating row is what does the work the labels used to. It is the one
  element on the card that can carry a reservation, which is why the ratings
  are mixed and the four-star card is left in place rather than quietly
  rounded up - six identical five-star cards is the shape of a fabricated
  review wall, and one honest four is what makes the fives worth reading.

  `proof.hasReviews` swaps the whole section for the honest alternative.
  Being new is not a weakness to hide behind stock quotes; it is the reason
  the audit is free, and saying so converts better than a fabricated wall of
  percentages would.
*/
export function Proof() {
  if (!proof.hasReviews) return <Fallback />;

  return (
    <Section id="proof" className="border-t hairline">
      <WordReveal
        text={proof.heading}
        highlight="after the audit."
        className="display-tight text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
      />
      <Reveal delay={0.08} blur>
        <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-muted">
          {proof.lead}
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {proof.reviews.map((r, i) => (
          /* Staggered across the row, not down the whole grid - at six cards
             a cumulative delay leaves the last one arriving half a second
             after the reader has already looked at it. */
          <Reveal key={r.name} delay={0.07 * (i % 3)} distance={24}>
            <HoverCard className="flex h-full flex-col rounded-[12px] border hairline bg-ink-900 p-6 sm:p-7">
              <div className="flex items-center gap-2.5">
                <Stars rating={r.rating} />
                <span className="text-[12px] tabular-nums text-muted">
                  {r.rating.toFixed(1)}
                </span>
              </div>

              <p className="mt-5 text-[15px] leading-relaxed text-paper">
                {r.body}
              </p>

              <div className="mt-auto pt-6">
                <p className="text-[14px] font-medium text-paper">{r.name}</p>
                <p className="mt-1 text-[13px] leading-snug text-muted">
                  {r.role}
                </p>
                <p className="mt-0.5 text-[12px] text-muted/80">{r.meta}</p>
              </div>
            </HoverCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/*
  Five stars, filled to `rating`.

  Each star is drawn twice: a dim one as the track, and a mint one clipped to
  the fraction of that star the rating covers. It is more markup than a row
  of half-star glyphs and it is the only version where 4.5 lands exactly on
  the middle of the fifth star rather than a pixel or two short of it.
*/
function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="flex items-center gap-[3px]"
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1);
        return (
          <span key={i} className="relative inline-flex">
            <Star size={14} weight="fill" className="shrink-0 text-ink-700" />
            {fill > 0 && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  size={14}
                  weight="fill"
                  className="shrink-0 text-signal"
                />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

/* Shipped on its own when there is nothing measured to publish yet. */
function Fallback() {
  return (
    <Section id="proof" className="border-t hairline">
      <WordReveal
        text={proof.fallback.heading}
        highlight="the audit is free."
        className="display-tight max-w-[18ch] text-3xl font-medium sm:text-5xl lg:text-[3.4rem]"
      />
      <Reveal delay={0.1} blur>
        <p className="mt-7 max-w-[58ch] text-[17px] leading-relaxed text-body">
          {proof.fallback.body}
        </p>
      </Reveal>
    </Section>
  );
}
