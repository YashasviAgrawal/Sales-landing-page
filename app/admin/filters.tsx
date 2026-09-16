import Link from "next/link";
import { LEAD_STATUSES, STATUS_META } from "@/lib/leads";

/*
  Search box and status filter.

  A plain GET form and a row of links - no client state, no debounce, no
  router.replace on every keystroke. That is a decision, not a shortcut.

  Typing-as-you-search means a server round trip per keystroke, and every
  implementation of it has to then fight React over caret position and focus
  when the results swap underneath the input. This panel is opened a few times
  a day by one person who already knows what they are looking for. Pressing
  Enter costs them nothing, the URL is the whole of the state - so a filtered
  view is a link that can be bookmarked or pasted - and it works with
  JavaScript disabled or still loading.
*/

type Props = {
  q: string;
  status: string;
  /** Builds a URL with one parameter changed, preserving the others. */
  hrefWith: (changes: Record<string, string | undefined>) => string;
};

export function Filters({ q, status, hrefWith }: Props) {
  const chip =
    "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-200";

  return (
    <div className="flex flex-col gap-4">
      <form
        action="/admin"
        method="get"
        className="flex flex-wrap items-center gap-3"
      >
        {/*
          The active status rides along as a hidden field. Without it, running
          a search silently drops the status filter - the reader would see the
          chip still highlighted while the results ignored it, which is the
          kind of small lie that makes someone stop trusting a tool.
        */}
        {status ? <input type="hidden" name="status" value={status} /> : null}

        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name, email, website or what they wrote…"
          className="min-w-[220px] flex-1 rounded-[12px] border border-white/15 bg-ink-950 px-4 py-2.5 text-[15px] text-paper placeholder:text-muted transition-colors duration-200 focus:border-signal focus:outline-none"
        />

        <button
          type="submit"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[14px] text-paper transition-colors duration-200 hover:border-signal/50 hover:text-signal"
        >
          Search
        </button>

        {q ? (
          <Link
            href={hrefWith({ q: undefined, page: undefined })}
            className="text-[13px] text-muted transition-colors hover:text-signal"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {/*
        Status filters as links rather than a <select>. Six options is few
        enough that showing all of them costs one line and saves a click, and
        the current filter stays legible at a glance instead of being hidden
        inside a closed control.

        Changing a filter always resets to page 1 - landing on "page 4 of 1"
        and seeing an empty table is the standard bug here.
      */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={hrefWith({ status: undefined, page: undefined })}
          className={`${chip} ${
            status
              ? "border-white/10 text-muted hover:border-white/25 hover:text-paper"
              : "border-signal/40 bg-signal/10 text-signal"
          }`}
        >
          All
        </Link>

        {LEAD_STATUSES.map((s) => {
          const active = status === s;
          const meta = STATUS_META[s];
          return (
            <Link
              key={s}
              href={hrefWith({ status: active ? undefined : s, page: undefined })}
              className={`${chip} ${
                active
                  ? meta.chip
                  : "border-white/10 text-muted hover:border-white/25 hover:text-paper"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
