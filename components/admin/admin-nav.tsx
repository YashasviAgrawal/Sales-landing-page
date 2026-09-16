import Link from "next/link";
import { brand } from "@/lib/content";
import { signOut } from "@/app/admin/actions";

/*
  The header bar shared by every signed-in admin page.

  It lives in components rather than in app/admin/layout.tsx because the login
  page sits under /admin too and must not inherit it - a signed-out visitor
  should not be shown an "Export" button and a sign-out link above the form
  they have not passed yet. Each authenticated page renders this itself.

  `current` rather than deriving the active tab from usePathname, because that
  hook would make this a client component for the sake of one string, and the
  pages rendering it already know which one they are.
*/
export function AdminNav({
  email,
  current,
  action,
}: {
  email: string;
  current: "leads" | "posts";
  /** Optional page-specific control, e.g. "Export CSV" or "New post". */
  action?: React.ReactNode;
}) {
  const tab = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      /* aria-current is what tells a screen reader which tab is the open one;
         the colour alone says it only to people who can see it. */
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 text-[13px] transition-colors duration-200 ${
        active
          ? "bg-white/10 text-paper"
          : "text-muted hover:text-paper"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-5 gap-y-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-[15px] font-medium tracking-tight text-paper transition-colors hover:text-signal"
        >
          {brand.name}
        </Link>

        <nav className="flex items-center gap-1">
          {tab("/admin", "Leads", current === "leads")}
          {tab("/admin/posts", "Posts", current === "posts")}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <span className="hidden text-[13px] text-muted lg:inline">{email}</span>
          {action}
          {/*
            A form, not a link. A GET link that ends a session can be fired by
            anything that renders a URL - a link prefetch, an <img> on another
            site - and logs the admin out sideways.
          */}
          <form action={signOut}>
            <button
              type="submit"
              className="text-[13px] text-muted transition-colors duration-200 hover:text-fall"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
