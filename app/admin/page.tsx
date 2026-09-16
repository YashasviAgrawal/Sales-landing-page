import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { fetchLeadStats, fetchLeads, PAGE_SIZE } from "@/lib/leads-query";
import { STATUS_META, isLeadStatus } from "@/lib/leads";
import { brand } from "@/lib/content";
import { AdminNav } from "@/components/admin/admin-nav";
import { Filters } from "./filters";
import { LeadRow } from "./lead-row";

export const metadata: Metadata = {
  /* Page name only; the root layout template appends the brand. */
  title: "Leads",
};

/*
  Never cached, never prerendered. The page is a live view of a table that
  changes from outside the app - a visitor submitting the form at two in the
  morning - and a cached CRM is a CRM that shows you yesterday's pipeline.
*/
export const dynamic = "force-dynamic";

type SearchParams = { q?: string; status?: string; page?: string };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  /*
    First line of the page, before anything reads the database. Middleware has
    already redirected signed-out visitors, but this is the check that is
    actually load-bearing - see the note in lib/admin-auth.ts.
  */
  const admin = await requireAdmin();

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = isLeadStatus(params.status) ? params.status : "";
  const page = Number.parseInt(params.page ?? "1", 10) || 1;

  const [{ leads, total, pageCount }, stats] = await Promise.all([
    fetchLeads({ q, status, page }),
    fetchLeadStats(),
  ]);

  /*
    URL builder for the filters and the pager. Every navigation on this page
    is "the current view, with one thing changed", and writing that out by
    hand at each call site is how a filter ends up being dropped by the
    pagination links.
  */
  const hrefWith = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q, status, page: String(page), ...changes };
    for (const [key, value] of Object.entries(merged)) {
      /* page=1 is the default; leaving it out keeps the URL readable. */
      if (value && !(key === "page" && value === "1")) next.set(key, value);
    }
    const query = next.toString();
    return query ? `/admin?${query}` : "/admin";
  };

  const exportQuery = new URLSearchParams();
  if (q) exportQuery.set("q", q);
  if (status) exportQuery.set("status", status);
  const exportHref = `/admin/export${exportQuery.toString() ? `?${exportQuery}` : ""}`;

  const firstOnPage = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastOnPage = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="min-h-screen bg-ink-950">
      {/*
        The shared admin header, which also carries the Leads/Posts tabs. It is
        sticky: the panel is a long scroll once there are more than a screen of
        leads, and the controls that matter when you are deep in it - export the
        view you have filtered to, switch to the blog, get out - should not
        require scrolling back to the top.
      */}
      <AdminNav
        email={admin.email}
        current="leads"
        action={
          /*
            A plain anchor, not a fetch. The browser's own download handling
            reads Content-Disposition and writes the file straight to disk;
            doing it in JavaScript would mean buffering the whole CSV in memory
            to hand back something the browser already does better.
          */
          <a
            href={exportHref}
            className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] text-paper transition-colors duration-200 hover:border-signal/50 hover:text-signal"
          >
            Export CSV
          </a>
        }
      />

      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10">
        {/*
          Four figures, in the order they get read: how big is the pipeline,
          what needs me today, is the top of the funnel alive, and did any of
          it pay. "New" is the accent because it is the only one that implies
          an action.
        */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Stat label="Total leads" value={stats.total} />
          <Stat label="New" value={stats.new} accent />
          <Stat label="Last 7 days" value={stats.last7} />
          <Stat label="Won" value={stats.won} />
        </div>

        <div className="mt-8">
          <Filters q={q} status={status} hrefWith={hrefWith} />
        </div>

        <div className="mt-6 overflow-hidden rounded-[12px] border border-white/10 bg-ink-900">
          {leads.length === 0 ? (
            <EmptyState filtered={Boolean(q || status)} />
          ) : (
            <ul>
              {leads.map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </ul>
          )}
        </div>

        {total > 0 ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[13px] text-muted">
              Showing{" "}
              <span className="tabular-nums text-body">
                {firstOnPage}–{lastOnPage}
              </span>{" "}
              of <span className="tabular-nums text-body">{total}</span>
              {status ? ` ${STATUS_META[status].label.toLowerCase()}` : ""} lead
              {total === 1 ? "" : "s"}
            </p>

            {pageCount > 1 ? (
              <div className="flex items-center gap-2">
                <PageLink
                  href={hrefWith({ page: String(page - 1) })}
                  disabled={page <= 1}
                >
                  ← Newer
                </PageLink>
                <span className="px-2 text-[13px] tabular-nums text-muted">
                  {page} / {pageCount}
                </span>
                <PageLink
                  href={hrefWith({ page: String(page + 1) })}
                  disabled={page >= pageCount}
                >
                  Older →
                </PageLink>
              </div>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[12px] border border-white/10 bg-ink-900 px-4 py-4 sm:px-5 sm:py-5">
      <p className="text-[12px] uppercase tracking-[0.08em] text-muted">
        {label}
      </p>
      {/* tabular-nums so the four tiles do not jiggle as the counts change. */}
      <p
        className={`mt-2 text-[28px] font-medium tabular-nums tracking-tight sm:text-[32px] ${
          accent ? "text-signal" : "text-paper"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/*
  Two different empty states, because they mean opposite things. "No leads
  match that" is a dead end the reader created and can undo; "nothing has come
  in yet" is a working panel waiting on the site, and telling someone their
  brand-new CRM is empty is not the same as telling them their search failed.
*/
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-[15px] text-paper">
        {filtered ? "Nothing matches that." : "No leads yet."}
      </p>
      <p className="mx-auto mt-2 max-w-[42ch] text-[14px] leading-relaxed text-muted">
        {filtered
          ? "Try a shorter search, or clear the status filter."
          : "Enquiries from the booking form land here the moment they are sent."}
      </p>
      {filtered ? (
        <Link
          href="/admin"
          className="mt-5 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] text-paper transition-colors duration-200 hover:border-signal/50 hover:text-signal"
        >
          Clear filters
        </Link>
      ) : null}
    </div>
  );
}

/*
  A disabled pager control renders as a <span>, not a greyed-out <a>. An
  anchor with no href is not focusable and announces as a link that goes
  nowhere; a span with the same styling is honestly nothing at all.
*/
function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const base =
    "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-200";

  if (disabled) {
    return (
      <span className={`${base} border-white/5 text-muted/50`}>{children}</span>
    );
  }

  return (
    <Link
      href={href}
      className={`${base} border-white/15 bg-white/5 text-paper hover:border-signal/50 hover:text-signal`}
    >
      {children}
    </Link>
  );
}
