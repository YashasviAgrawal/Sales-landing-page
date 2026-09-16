"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type ActionState } from "../actions";

/*
  The sign-in form.

  Deliberately plain. This screen is seen by one or two people, a few times a
  month, and every second spent on its personality is a second not spent on
  the table behind it. What it does owe them is the things a login gets wrong
  most often: the password manager can read it, the error says something, and
  the button cannot be pressed twice.
*/

const field =
  "w-full rounded-[12px] border border-white/15 bg-ink-950 px-4 py-3 text-[16px] text-paper placeholder:text-muted transition-colors duration-200 focus:border-signal focus:outline-none";

/*
  A child component purely so it can call useFormStatus, which only reports on
  the <form> above it in the tree - called from the component that renders the
  form, it always returns pending: false.
*/
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="tap-area w-full rounded-full bg-signal px-6 py-3 text-[15px] font-medium tracking-tight text-ink-950 transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(signIn, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <label className="flex flex-col gap-2">
        <span className="text-[13px] text-muted">Email</span>
        <input
          className={field}
          name="email"
          type="email"
          /*
            autoComplete on both fields is what lets a password manager fill
            and, more importantly, save these credentials. Without it the
            admin ends up choosing a password they can retype, which is a
            worse password.
          */
          autoComplete="email"
          required
          autoFocus
          placeholder="you@company.com"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] text-muted">Password</span>
        <input
          className={field}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </label>

      {/*
        role="alert" so the failure is announced. A sighted user sees red text
        appear; without this, a screen reader user gets a page that silently
        did not navigate and no explanation of why.
      */}
      {state.error ? (
        <p role="alert" className="text-[13px] leading-relaxed text-fall">
          {state.error}
        </p>
      ) : null}

      <div className="mt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
