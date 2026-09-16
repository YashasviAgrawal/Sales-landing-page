import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/content";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

/*
  Keep this page - and everything under /admin - out of search results and out
  of any crawler's index. The panel is protected by auth, so being listed
  would not expose the leads, but there is no version of "our CRM login is the
  third Google result for our brand" that helps.
*/
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false, nocache: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-6 py-16">
      <div className="w-full max-w-[380px]">
        <div className="mb-8">
          <Link
            href="/"
            className="text-[13px] text-muted transition-colors hover:text-signal"
          >
            ← {brand.name}
          </Link>
          <h1 className="mt-4 text-[26px] font-medium tracking-tight text-paper">
            Leads
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-body">
            Sign in to read the enquiries from the booking form.
          </p>
        </div>

        <div className="rounded-[12px] border border-white/10 bg-ink-900 p-6">
          {configured ? (
            <LoginForm next={next ?? "/admin"} />
          ) : (
            /*
              No keys, so there is nothing to sign in to. Rather than render a
              form that can only ever fail, say what is missing and where the
              instructions are - this screen is seen exactly once, on a fresh
              clone, by someone who has not read the setup doc yet.
            */
            <div className="text-[14px] leading-relaxed text-body">
              <p className="font-medium text-paper">Supabase isn’t connected.</p>
              <p className="mt-2">
                Copy{" "}
                <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[13px] text-signal">
                  .env.example
                </code>{" "}
                to{" "}
                <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[13px] text-signal">
                  .env.local
                </code>
                , fill in the project URL and keys, and restart the dev server.
              </p>
              <p className="mt-2 text-muted">
                Full instructions are in SUPABASE.md.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
