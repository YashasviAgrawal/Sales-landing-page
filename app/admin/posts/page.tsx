import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { adminListPosts, adminPostStats } from "@/lib/posts-query";
import { POST_STATUSES, POST_STATUS_META, isPostStatus } from "@/lib/posts";
import { formatDateTime, formatRelative } from "@/lib/leads";
import { brand } from "@/lib/content";
import { AdminNav } from "@/components/admin/admin-nav";
import { PostRow } from "./post-row";

/* Page name only; the root layout template appends the brand. */
export const metadata: Metadata = { title: "Posts" };
export const dynamic = "force-dynamic";

type SearchParams = { q?: string; status?: string; page?: string };

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireAdmin();

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = isPostStatus(params.status) ? params.status : "";
  const page = Number.parseInt(params.page ?? "1", 10) || 1;

  const [{ posts, total, pageCount }, stats] = await Promise.all([
    adminListPosts({ q, status, page }),
    adminPostStats(),
  ]);

  const hrefWith = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q, status, page: String(page), ...changes };
    for (const [key, value] of Object.entries(merged)) {
      if (value && !(key === "page" && value === "1")) next.set(key, value);
    }
    const query = next.toString();
    return query ? `/admin/posts?${query}` : "/admin/posts";
  };

  const chip =
    "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-200";

  return (
    <div className="min-h-screen bg-ink-950">
      <AdminNav
        email={admin.email}
        current="posts"
        action={
          <Link
            href="/admin/posts/new"
            className="rounded-full bg-signal px-3.5 py-1.5 text-[13px] font-medium text-ink-950 transition-opacity duration-200 hover:opacity-90"
          >
            New post
          </Link>
        }
      />

      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Stat label="All posts" value={stats.total} />
          <Stat label="Published" value={stats.published} accent />
          <Stat label="Drafts" value={stats.drafts} />
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <form
            action="/admin/posts"
            method="get"
            className="flex flex-wrap items-center gap-3"
          >
            {status ? (
              <input type="hidden" name="status" value={status} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search titles, URLs and excerpts…"
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
            {POST_STATUSES.map((s) => {
              const active = status === s;
              const meta = POST_STATUS_META[s];
              return (
                <Link
                  key={s}
                  href={hrefWith({
                    status: active ? undefined : s,
                    page: undefined,
                  })}
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

        <div className="mt-6 overflow-hidden rounded-[12px] border border-white/10 bg-ink-900">
          {posts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-[15px] text-paper">
                {q || status ? "Nothing matches that." : "No posts yet."}
              </p>
              <p className="mx-auto mt-2 max-w-[44ch] text-[14px] leading-relaxed text-muted">
                {q || status
                  ? "Try a shorter search, or clear the status filter."
                  : "Write the first one, or run npm run blog:seed for three SEO-ready drafts to start from."}
              </p>
              <Link
                href={q || status ? "/admin/posts" : "/admin/posts/new"}
                className="mt-5 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] text-paper transition-colors duration-200 hover:border-signal/50 hover:text-signal"
              >
                {q || status ? "Clear filters" : "New post"}
              </Link>
            </div>
          ) : (
            <ul>
              {posts.map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  /*
                    Dates are formatted on the server and passed down as
                    strings. The row is a client component, and formatting a
                    date there would read the browser's clock and time zone -
                    producing different text on the server and the client, and
                    a hydration mismatch on every row.
                  */
                  dateLabel={
                    post.published_at
                      ? formatDateTime(post.published_at)
                      : `Created ${formatDateTime(post.created_at)}`
                  }
                  relativeLabel={formatRelative(post.updated_at)}
                />
              ))}
            </ul>
          )}
        </div>

        {pageCount > 1 ? (
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-[13px] text-muted">
              <span className="tabular-nums text-body">{total}</span> post
              {total === 1 ? "" : "s"}
            </p>
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
