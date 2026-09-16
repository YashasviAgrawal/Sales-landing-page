"use client";

import { useState, useTransition } from "react";
import {
  LEAD_STATUSES,
  STATUS_META,
  formatDateTime,
  formatRelative,
  type Lead,
  type LeadStatus,
} from "@/lib/leads";
import { deleteLead, updateLeadNotes, updateLeadStatus } from "./actions";

/*
  One lead: a scannable summary line that expands into the whole record.

  Why a list of expandable rows rather than a wide table. The interesting
  field here is free text - a founder describing, in their own words, what is
  broken - and that is the field a table has no room for. Every column beyond
  four squeezes it into an ellipsis, and an ellipsis on the only column that
  carries any judgement makes the table useless: you end up clicking every
  row anyway.

  So the closed row carries exactly what triage needs - when, who, and a
  glance at what they said - and opening one gives the full text, their site,
  the notes field and the status control. One click, no navigation, no modal,
  and the reader never loses their place in the list.
*/

export function LeadRow({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [savedNotes, setSavedNotes] = useState(lead.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const meta = STATUS_META[status];
  const dirtyNotes = notes !== savedNotes;

  /*
    Optimistic, with a rollback.

    The select shows the new status the instant it is chosen, because waiting
    on a round trip to see your own click land is what makes an internal tool
    feel slow. If the write fails the value goes back to what the database
    actually holds and the error says so - an optimistic update that fails
    silently is worse than no optimism at all, because the reader walks away
    believing something that is not true.
  */
  function changeStatus(next: LeadStatus) {
    const previous = status;
    setStatus(next);
    setError(null);

    startTransition(async () => {
      const result = await updateLeadStatus(lead.id, next);
      if (result?.error) {
        setStatus(previous);
        setError(result.error);
      }
    });
  }

  function saveNotes() {
    if (!dirtyNotes) return;
    setError(null);

    startTransition(async () => {
      const result = await updateLeadNotes(lead.id, notes);
      if (result?.error) setError(result.error);
      else setSavedNotes(notes.trim());
    });
  }

  function remove() {
    /*
      Two presses, no dialog. The first turns the button into "Really delete?"
      and the second does it. A window.confirm would be one line, but it steals
      focus, cannot be styled, and is the control people dismiss reflexively -
      the button relabelling itself in place is harder to click through by
      accident and does not interrupt anything.
    */
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteLead(lead.id);
      if (result?.error) {
        setError(result.error);
        setConfirmDelete(false);
      }
    });
  }

  /* One line of what they wrote, for the closed row. */
  const preview = lead.context?.replace(/\s+/g, " ").trim();

  return (
    <li className="border-b border-white/[0.07] last:border-b-0">
      {/*
        The whole summary is the toggle, so the target is the full width of
        the row rather than a chevron. It is a real <button> with
        aria-expanded, which is what makes the disclosure work on a keyboard
        and announce its state to a screen reader.
      */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-4 px-4 py-4 text-left transition-colors duration-200 hover:bg-white/[0.03] sm:px-6"
      >
        <span
          aria-hidden="true"
          className={`mt-2 h-2 w-2 shrink-0 rounded-full ${meta.dot}`}
        />

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[15px] font-medium text-paper">
              {lead.name}
            </span>
            <span className="text-[13px] text-body">{lead.email}</span>
          </span>

          {preview ? (
            /*
              line-clamp-1 rather than a JS truncate: the browser cuts at the
              real rendered width, so it stays right at every viewport size
              instead of guessing a character count that is wrong on half of
              them.
            */
            <span className="mt-1 block line-clamp-1 text-[13px] leading-relaxed text-muted">
              {preview}
            </span>
          ) : (
            <span className="mt-1 block text-[13px] italic text-muted">
              No context given.
            </span>
          )}
        </span>

        <span className="flex shrink-0 items-center gap-3">
          <span
            className={`hidden rounded-full border px-2.5 py-1 text-[12px] sm:inline-flex ${meta.chip}`}
          >
            {meta.label}
          </span>
          {/*
            title carries the absolute timestamp, so "3d ago" is hoverable
            back into a real date without spending a column on it.
          */}
          <span
            title={formatDateTime(lead.created_at)}
            className="w-[64px] text-right text-[12px] tabular-nums text-muted"
          >
            {formatRelative(lead.created_at)}
          </span>
        </span>
      </button>

      {open ? (
        <div className="border-t border-white/[0.07] bg-ink-950/60 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* What they sent. Read-only, because it is theirs. */}
            <div className="flex flex-col gap-4">
              <Detail label="What’s holding revenue back">
                {lead.context ? (
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-paper">
                    {lead.context}
                  </p>
                ) : (
                  <p className="text-[14px] italic text-muted">
                    They left this blank.
                  </p>
                )}
              </Detail>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Detail label="Email">
                  <a
                    href={`mailto:${lead.email}?subject=${encodeURIComponent("Your free sales audit")}`}
                    className="break-all text-[14px] text-signal underline decoration-signal/40 underline-offset-2 hover:decoration-signal"
                  >
                    {lead.email}
                  </a>
                </Detail>

                <Detail label="Website">
                  {lead.website ? (
                    <a
                      href={toUrl(lead.website)}
                      target="_blank"
                      /*
                        noopener is the one that matters: without it the page
                        we open gets a handle on this window and can navigate
                        it elsewhere, and these URLs are typed by strangers.
                      */
                      rel="noopener noreferrer"
                      className="break-all text-[14px] text-signal underline decoration-signal/40 underline-offset-2 hover:decoration-signal"
                    >
                      {lead.website}
                    </a>
                  ) : (
                    <span className="text-[14px] text-muted">—</span>
                  )}
                </Detail>

                <Detail label="Received">
                  <span className="text-[14px] text-paper">
                    {formatDateTime(lead.created_at)}
                  </span>
                </Detail>

                <Detail label="Source">
                  <span className="text-[14px] text-body">
                    {lead.source ?? "—"}
                  </span>
                </Detail>
              </div>
            </div>

            {/* What we do about it. Everything editable lives on this side. */}
            <div className="flex flex-col gap-4">
              <Detail label="Status">
                <select
                  value={status}
                  disabled={pending}
                  onChange={(e) => changeStatus(e.target.value as LeadStatus)}
                  className="w-full rounded-[12px] border border-white/15 bg-ink-950 px-3 py-2.5 text-[14px] text-paper transition-colors duration-200 focus:border-signal focus:outline-none disabled:opacity-60"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-ink-900">
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </Detail>

              <Detail label="Notes">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  /*
                    Blur saves. Someone typing a note and clicking straight to
                    the next lead should not lose it to a Save button they
                    never looked at; the explicit button stays for the people
                    who want to see the write happen.
                  */
                  onBlur={saveNotes}
                  placeholder="Called 14th, asked for a Tuesday slot. Runs a 6-person team."
                  className="min-h-[104px] w-full resize-y rounded-[12px] border border-white/15 bg-ink-950 px-3 py-2.5 text-[14px] leading-relaxed text-paper placeholder:text-muted transition-colors duration-200 focus:border-signal focus:outline-none"
                />
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={saveNotes}
                    disabled={!dirtyNotes || pending}
                    className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] text-paper transition-colors duration-200 hover:border-signal/50 hover:text-signal disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-paper"
                  >
                    {pending ? "Saving…" : dirtyNotes ? "Save notes" : "Saved"}
                  </button>

                  <button
                    type="button"
                    onClick={remove}
                    disabled={pending}
                    className={`ml-auto rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-200 disabled:opacity-40 ${
                      confirmDelete
                        ? "border border-fall/50 bg-fall/15 text-fall"
                        : "border border-transparent text-muted hover:text-fall"
                    }`}
                  >
                    {confirmDelete ? "Really delete?" : "Delete"}
                  </button>
                </div>
              </Detail>

              {error ? (
                <p role="alert" className="text-[13px] text-fall">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] uppercase tracking-[0.08em] text-muted">
        {label}
      </p>
      {children}
    </div>
  );
}

/*
  People type "acme.co", not "https://acme.co". Without a scheme the browser
  reads the value as a relative path and the link lands on /admin/acme.co,
  which looks like the panel is broken rather than like the lead typed
  shorthand. https rather than http because a site that only answers on http
  will redirect, and guessing the other way exposes the request first.
*/
function toUrl(website: string): string {
  const trimmed = website.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
