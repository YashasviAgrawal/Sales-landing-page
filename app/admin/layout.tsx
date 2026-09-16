import type { Metadata } from "next";

/*
  Deliberately thin.

  A layout here would be the obvious place for the panel's header bar, but the
  login page is also under /admin and would inherit it - a signed-out visitor
  would get a nav with an "Export" button and a sign-out link above a form
  they have not passed yet. The chrome therefore lives in page.tsx, which only
  renders for an authenticated admin, and this file carries the one thing that
  genuinely belongs to the whole segment.

  robots applies to /admin and everything beneath it. The panel is behind auth
  so indexing could not leak a lead, but an admin login that ranks for the
  brand name is an invitation to credential-stuff it.
*/
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
