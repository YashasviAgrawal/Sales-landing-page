"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { POST_STATUS_META, type Post } from "@/lib/posts";
import { duplicatePost, setPostStatus } from "./actions";

/*
  One row in the post list.

  The row is a link to the editor, with the two actions that are worth doing
  without opening anything - publish/unpublish and duplicate - sitting beside
  it. Those two are here because they are what someone actually does from a
  list: push the finished draft live, or copy the post whose shape worked.
  Everything else is editing, and editing belongs in the editor.
*/

export function PostRow({
  post,
  dateLabel,
  relativeLabel,
}: {
  post: Post;
  dateLabel: string;
  relativeLabel: string;
}) {
  const [status, setStatus] = useState(post.status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const meta = POST_STATUS_META[status];
  const isPublished = status === "published";

  function toggle() {
    const next = isPublished ? "draft" : "published";
    const previous = status;
    /* Optimistic, with a rollback if the write is refused - an empty post
       cannot be published, and the server is where that is decided. */
    setStatus(next);
    setError(null);

    startTransition(async () => {
      const result = await setPostStatus(post.id, next);
      if (result?.error) {
        setStatus(previous);
        setError(result.error);
      }
    });
  }

  return (
    <li className="border-b border-white/[0.07] last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 transition-colors duration-200 hover:bg-white/[0.03] sm:px-6">
        <span
          aria-hidden="true"
          className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`}
        />

        <Link
          href={`/admin/posts/${post.id}`}
          className="min-w-0 flex-1 basis-[280px]"
        >
          <span className="block truncate text-[15px] font-medium text-paper">
            {post.title || "Untitled"}
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-muted">
            /blog/{post.slug} · {dateLabel} · {post.reading_minutes} min
          </span>
        </Link>

        <span
          className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-[12px] sm:inline-flex ${meta.chip}`}
        >
          {meta.label}
        </span>

        <span className="hidden w-[70px] shrink-0 text-right text-[12px] tabular-nums text-muted lg:inline">
          {relativeLabel}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12.5px] text-paper transition-colors duration-200 hover:border-signal/50 hover:text-signal disabled:opacity-40"
          >
            {pending ? "…" : isPublished ? "Unpublish" : "Publish"}
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => void duplicatePost(post.id))}
            title="Duplicate as a new draft"
            className="rounded-full border border-transparent px-2 py-1.5 text-[12.5px] text-muted transition-colors duration-200 hover:text-paper disabled:opacity-40"
          >
            Copy
          </button>

          {isPublished ? (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-1 text-[12.5px] text-muted transition-colors hover:text-signal"
              title="View the live post"
            >
              ↗
            </a>
          ) : null}
        </span>
      </div>

      {error ? (
        <p role="alert" className="px-4 pb-3 text-[12.5px] text-fall sm:px-6">
          {error}
        </p>
      ) : null}
    </li>
  );
}
