import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail, isSupabaseConfigured } from "./env";

/*
  Session refresh plus the first gate on /admin.

  Two jobs, and it has to be middleware for both:

    1. Refreshing the auth token. Supabase access tokens are short-lived, and
       a Server Component cannot write the rotated cookie back (see the note
       in server.ts). Middleware can, so it does it here for every admin
       request and everything downstream sees a valid session.

    2. Bouncing signed-out visitors before a page renders. This is a fast
       redirect, NOT the security boundary - it is defeated by anything that
       reaches a Server Action or Route Handler without passing through the
       matcher. The real check is requireAdmin() in lib/admin-auth.ts, which
       runs inside every admin page and every write. Both exist on purpose:
       this one for the experience, that one for the guarantee.

  getClaims() rather than getSession(): the session object is read straight
  from the cookie and a cookie is attacker-controllable, so it is only safe
  for "is someone probably signed in?". getClaims verifies the JWT signature,
  which is what turns the answer into something worth acting on.
*/
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  /*
    Without keys there is no auth to check and no leads to protect. Let the
    request through so /admin can render its own "not configured yet" screen,
    which is far more useful than a redirect loop into a login page that
    cannot possibly succeed.
  */
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const email = (data?.claims?.email as string | undefined) ?? null;
  const allowed = isAdminEmail(email);

  if (isAdminRoute && !isLoginRoute && !allowed) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    /* Where they were heading, so the login can send them back to it. */
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  /* Already signed in and looking at the login page: skip it. */
  if (isLoginRoute && allowed) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
