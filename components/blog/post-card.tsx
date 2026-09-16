import Link from "next/link";
import type { Post } from "@/lib/posts";
import { PostCover } from "./post-cover";

/*
  One post, as a card.

  IT IS NOT WRAPPED IN A SCROLL REVEAL, and that is deliberate rather than an
  omission. The previous version of this index animated each row in on scroll,
  and when the observer did not fire - a client-side navigation that restored
  scroll position was enough - the row stayed at opacity 0 and a post that
  existed looked deleted. On a page whose entire job is to list things, a
  flourish that can hide content is a bad trade. The entrance here is a plain
  CSS animation: it cannot fail closed, because an animation that never runs
  leaves the element at its normal, visible state.

  The whole card is one anchor. Two links to the same place - a title link and
  a "Read more" - hand a crawler two anchors for one destination and hand a
  screen-reader user the same target twice in the links list, so "Read more"
  is a <span> that happens to look like a link.
*/
export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const date = post.published_at
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(new Date(post.published_at))
    : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card-in group flex h-full flex-col overflow-hidden rounded-[12px] border hairline bg-ink-900 transition-colors duration-300 hover:border-white/25"
      /*
        A short stagger so the grid arrives as a sequence rather than a block.
        Capped at six steps - beyond that the last card on a twelve-card page
        would be waiting most of a second for no reason.
      */
      style={{ animationDelay: `${Math.min(index, 5) * 70}ms` }}
    >
      {/*
        aspect-ratio reserves the box before anything paints, so the grid never
        reflows as covers arrive. That is what keeps Cumulative Layout Shift at
        zero here, which is a measured ranking signal as well as a courtesy.
      */}
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b hairline">
        <PostCover
          post={post}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        {post.tags[0] ? (
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
            {post.tags[0]}
          </span>
        ) : (
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
            Field notes
          </span>
        )}

        {/*
          h2, not h1 - the page's h1 is its own headline. A grid of h1s would
          blur what the index is about, which is the one job the heading tree
          has on a listing page.
        */}
        <h2 className="mt-2.5 text-[17px] font-medium leading-snug tracking-tight text-paper transition-colors duration-300">
          {post.title}
        </h2>

        {post.excerpt ? (
          <p className="mt-2.5 line-clamp-3 text-[14px] leading-relaxed text-muted">
            {post.excerpt}
          </p>
        ) : null}

        {/*
          mt-auto pins this row to the bottom of the card, so the "Read more"
          line sits level across a row of cards whose excerpts are different
          lengths. Without it each card's footer floats at its own height and
          the grid looks accidental.
        */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-body transition-colors duration-300 group-hover:text-paper">
            Read more
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>

          <span className="flex items-center gap-2 text-[11.5px] text-muted">
            {date ? <time dateTime={post.published_at!}>{date}</time> : null}
            <span aria-hidden="true" className="text-muted/40">
              ·
            </span>
            <span className="whitespace-nowrap">
              {post.reading_minutes} min
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
