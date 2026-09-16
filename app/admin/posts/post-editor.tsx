"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  POST_STATUSES,
  POST_STATUS_META,
  SEO_LIMITS,
  seoChecks,
  slugify,
  truncateAtWord,
  type Post,
  type PostStatus,
} from "@/lib/posts";
import { deletePost, type PostActionState } from "./actions";

/*
  The writing surface.

  Laid out as two columns on a wide screen: the piece on the left, everything
  that decides how it is found on the right. That split is the whole design
  idea - SEO fields put underneath a long markdown box are SEO fields nobody
  scrolls to, and the result is a blog of untitled, undescribed posts. Beside
  the text, the checklist is in view while the words are being written, which
  is the only time any of it is cheap to fix.

  The checks are advisory and never block saving. A writer who knows why they
  are breaking a rule should be able to; only genuine errors - no title, a
  taken URL, an empty post being published - actually refuse, and those are
  enforced on the server where they cannot be bypassed.
*/

type Props = {
  post?: Post;
  action: (prev: PostActionState, formData: FormData) => Promise<PostActionState>;
  defaultAuthor: string;
};

const field =
  "w-full rounded-[12px] border border-white/15 bg-ink-950 px-3.5 py-2.5 text-[14px] text-paper placeholder:text-muted transition-colors duration-200 focus:border-signal focus:outline-none";

const label = "mb-1.5 block text-[12px] uppercase tracking-[0.08em] text-muted";

export function PostEditor({ post, action, defaultAuthor }: Props) {
  const [state, formAction] = useActionState<PostActionState, FormData>(
    action,
    {},
  );
  const [pendingDelete, startDelete] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  /*
    Controlled only for the fields the checklist reads. Everything else is
    uncontrolled with a defaultValue - re-rendering a 5,000-word textarea on
    every keystroke to power a character counter is a real cost, and the
    fields below are the ones whose length or content actually feeds a check.
  */
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [seoTitleValue, setSeoTitleValue] = useState(post?.seo_title ?? "");
  const [seoDescValue, setSeoDescValue] = useState(post?.seo_description ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverUrl, setCoverUrl] = useState(post?.cover_url ?? "");
  const [coverAlt, setCoverAlt] = useState(post?.cover_alt ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");

  /*
    The slug follows the title until someone types in the slug box, then stops
    forever. Two reasons it latches: a slug typed by hand is a deliberate
    choice that the title should not silently overwrite, and on a PUBLISHED
    post the URL must not drift at all - changing it breaks every inbound link
    and every ranking that URL has earned.
  */
  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  const tagList = useMemo(
    () =>
      tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    [tags],
  );

  const checks = useMemo(
    () =>
      seoChecks({
        title,
        slug,
        excerpt,
        seo_title: seoTitleValue,
        seo_description: seoDescValue,
        content,
        cover_url: coverUrl,
        cover_alt: coverAlt,
        tags: tagList,
      }),
    [
      title,
      slug,
      excerpt,
      seoTitleValue,
      seoDescValue,
      content,
      coverUrl,
      coverAlt,
      tagList,
    ],
  );

  const slugChanged = Boolean(post && post.status === "published" && slug !== post.slug);

  return (
    <form action={formAction} className="pb-24">
      {/*
        Sticky action bar. The save button is reachable from anywhere in a long
        post, which matters because the alternative - scrolling to the bottom
        of 2,000 words to press Save - is how unsaved work gets lost.
      */}
      <div className="sticky top-[61px] z-10 -mx-4 mb-8 border-b border-white/10 bg-ink-950/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/posts"
            className="text-[13px] text-muted transition-colors hover:text-paper"
          >
            ← All posts
          </Link>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            {post?.status === "published" ? (
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-muted transition-colors hover:text-signal"
              >
                View ↗
              </a>
            ) : null}

            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PostStatus)}
              className="rounded-full border border-white/15 bg-ink-950 px-3 py-1.5 text-[13px] text-paper focus:border-signal focus:outline-none"
            >
              {POST_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-ink-900">
                  {POST_STATUS_META[s].label}
                </option>
              ))}
            </select>

            <SaveButton isNew={!post} status={status} />
          </div>
        </div>

        {state.error ? (
          <p role="alert" className="mt-2 text-[13px] text-fall">
            {state.error}
          </p>
        ) : state.ok ? (
          <p aria-live="polite" className="mt-2 text-[13px] text-signal">
            Saved.
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        {/* ------------------------------------------------ the piece --- */}
        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <label className={label} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="The seven places B2B revenue leaks"
              className={`${field} !text-[20px] !py-3 font-medium`}
              required
            />
          </div>

          <div>
            <label className={label} htmlFor="excerpt">
              Excerpt{" "}
              <span className="normal-case tracking-normal text-muted/70">
                — the card summary, and the fallback meta description
              </span>
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Most teams try to fix all seven at once. Here is how to find the one that is actually costing you."
              className={`${field} resize-y`}
            />
            <Counter value={excerpt.length} max={SEO_LIMITS.description} />
          </div>

          <div>
            <label className={label} htmlFor="content">
              Post{" "}
              <span className="normal-case tracking-normal text-muted/70">
                — markdown. Use ## for sections; the title is already the H1.
              </span>
            </label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={30}
              /*
                spellCheck on, and a monospace font. Monospace because markdown
                is structured text - list markers, link brackets and table
                pipes all line up, and misaligned ones are visible errors
                rather than invisible ones.
              */
              spellCheck
              placeholder={"## Where it usually breaks\n\nMost founders describe the same symptom…\n\n- Good calls, then silence\n- Proposals that go quiet\n\nRead more about [the audit](/#book)."}
              className={`${field} resize-y font-mono !text-[13.5px] leading-relaxed`}
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 text-[12px] text-muted">
              <span>
                {content.trim() ? content.trim().split(/\s+/).length : 0} words
              </span>
              <span>·</span>
              <span>Markdown: **bold**, ## heading, [text](/link), - list</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------- how it gets found --- */}
        <aside className="flex flex-col gap-6">
          {/*
            The search-result preview. Showing the writer the actual thing
            they are optimising - a blue title, a green URL, two grey lines -
            does more than any number of character counters, because the
            truncation is visible rather than described.
          */}
          <Panel title="Search result preview">
            <div className="rounded-[10px] bg-ink-950 px-3.5 py-3">
              <p className="truncate text-[12px] text-muted">
                yoursite.com › blog › {slug || "…"}
              </p>
              <p className="mt-1 line-clamp-2 text-[15px] leading-snug text-[#8ab4f8]">
                {truncateAtWord(
                  seoTitleValue.trim() || title || "Untitled post",
                  SEO_LIMITS.title,
                )}
              </p>
              <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-body">
                {truncateAtWord(
                  seoDescValue.trim() ||
                    excerpt.trim() ||
                    "No description yet — Google will invent one from the page.",
                  SEO_LIMITS.description,
                )}
              </p>
            </div>
          </Panel>

          <Panel title="Checklist">
            <ul className="flex flex-col gap-2.5">
              {checks.map((check) => (
                <li key={check.id} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      check.state === "good"
                        ? "bg-signal"
                        : check.state === "warn"
                          ? "bg-[#e0a800]"
                          : "bg-fall"
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block text-[13px] text-paper">
                      {check.label}
                    </span>
                    <span className="block text-[12px] leading-relaxed text-muted">
                      {check.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="URL">
            <div className="flex items-center gap-1 rounded-[12px] border border-white/15 bg-ink-950 px-3 py-2">
              <span className="shrink-0 text-[13px] text-muted">/blog/</span>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="seven-places-revenue-leaks"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-paper placeholder:text-muted focus:outline-none"
              />
            </div>
            {slugChanged ? (
              /*
                The warning that saves the most damage in this whole editor.
                Changing a published slug silently 404s every existing link to
                it and discards whatever ranking that URL had earned, and it
                is a one-character mistake to make.
              */
              <p className="mt-2 rounded-[10px] border border-fall/30 bg-fall/10 px-3 py-2 text-[12px] leading-relaxed text-fall">
                This post is live at <strong>/blog/{post?.slug}</strong>.
                Changing the URL breaks every existing link to it and loses its
                ranking. Only do this if the old URL was never shared.
              </p>
            ) : null}
          </Panel>

          <Panel title="Search appearance">
            <div className="flex flex-col gap-4">
              <div>
                <label className={label} htmlFor="seo_title">
                  Title tag override
                </label>
                <input
                  id="seo_title"
                  name="seo_title"
                  value={seoTitleValue}
                  onChange={(e) => setSeoTitleValue(e.target.value)}
                  placeholder={title ? `${title} · Sales Brain` : "Leave blank to use the title"}
                  className={field}
                />
                <Counter
                  value={(seoTitleValue || title).length}
                  max={SEO_LIMITS.title}
                />
              </div>

              <div>
                <label className={label} htmlFor="seo_description">
                  Meta description
                </label>
                <textarea
                  id="seo_description"
                  name="seo_description"
                  value={seoDescValue}
                  onChange={(e) => setSeoDescValue(e.target.value)}
                  rows={3}
                  placeholder="Leave blank to use the excerpt."
                  className={`${field} resize-y`}
                />
                <Counter
                  value={(seoDescValue || excerpt).length}
                  max={SEO_LIMITS.description}
                />
              </div>
            </div>
          </Panel>

          <Panel title="Social card">
            <div className="flex flex-col gap-4">
              <div>
                <label className={label} htmlFor="cover_url">
                  Image URL
                </label>
                <input
                  id="cover_url"
                  name="cover_url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://… or /images/post.jpg"
                  className={field}
                />
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
                  1200×630. Left blank, a card is generated from the title.
                </p>
              </div>

              <div>
                <label className={label} htmlFor="cover_alt">
                  Alt text
                </label>
                <input
                  id="cover_alt"
                  name="cover_alt"
                  value={coverAlt}
                  onChange={(e) => setCoverAlt(e.target.value)}
                  placeholder="What the image shows — not the headline again."
                  className={field}
                />
              </div>
            </div>
          </Panel>

          <Panel title="Filing">
            <div className="flex flex-col gap-4">
              <div>
                <label className={label} htmlFor="tags">
                  Tags{" "}
                  <span className="normal-case tracking-normal text-muted/70">
                    — comma separated, up to 8
                  </span>
                </label>
                <input
                  id="tags"
                  name="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="sales process, diagnostics"
                  className={field}
                />
                {tagList.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tagList.slice(0, 8).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11.5px] text-body"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <label className={label} htmlFor="author_name">
                  Author
                </label>
                <input
                  id="author_name"
                  name="author_name"
                  defaultValue={post?.author_name ?? defaultAuthor}
                  className={field}
                />
              </div>

              <div>
                <label className={label} htmlFor="canonical_url">
                  Canonical URL
                </label>
                <input
                  id="canonical_url"
                  name="canonical_url"
                  defaultValue={post?.canonical_url ?? ""}
                  placeholder="Only if published elsewhere first"
                  className={field}
                />
              </div>

              <label className="flex items-start gap-2.5 text-[13px] text-body">
                <input
                  type="checkbox"
                  name="noindex"
                  defaultChecked={post?.noindex ?? false}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-signal)]"
                />
                <span>
                  Hide from search engines
                  <span className="block text-[11.5px] leading-relaxed text-muted">
                    Live and linkable, but not indexed.
                  </span>
                </span>
              </label>
            </div>
          </Panel>

          {post ? (
            <Panel title="Danger">
              <button
                type="button"
                disabled={pendingDelete}
                onClick={() => {
                  if (!confirmDelete) {
                    setConfirmDelete(true);
                    return;
                  }
                  startDelete(async () => {
                    await deletePost(post.id);
                    window.location.href = "/admin/posts";
                  });
                }}
                className={`w-full rounded-full px-4 py-2 text-[13px] transition-colors duration-200 disabled:opacity-40 ${
                  confirmDelete
                    ? "border border-fall/50 bg-fall/15 text-fall"
                    : "border border-white/10 text-muted hover:border-fall/40 hover:text-fall"
                }`}
              >
                {pendingDelete
                  ? "Deleting…"
                  : confirmDelete
                    ? "Really delete this post?"
                    : "Delete post"}
              </button>
              {confirmDelete ? (
                <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                  This cannot be undone. If the post is live, consider
                  archiving instead — a deleted URL 404s for anyone who linked
                  to it.
                </p>
              ) : null}
            </Panel>
          ) : null}
        </aside>
      </div>
    </form>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[12px] border border-white/10 bg-ink-900 p-4">
      <h2 className="mb-3 text-[12px] uppercase tracking-[0.08em] text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

/*
  Over-budget turns amber, not red. Exceeding a soft SEO limit is a trade-off
  a writer is allowed to make - red would read as an error, and it is not one.
*/
function Counter({ value, max }: { value: number; max: number }) {
  return (
    <p
      className={`mt-1.5 text-[11.5px] tabular-nums ${
        value > max ? "text-[#e0a800]" : "text-muted"
      }`}
    >
      {value} / {max}
    </p>
  );
}

function SaveButton({ isNew, status }: { isNew: boolean; status: PostStatus }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-signal px-4 py-1.5 text-[13px] font-medium text-ink-950 transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
    >
      {pending
        ? "Saving…"
        : isNew
          ? status === "published"
            ? "Publish"
            : "Create draft"
          : "Save"}
    </button>
  );
}
