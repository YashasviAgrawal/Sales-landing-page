import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail, isSupabaseConfigured } from "@/lib/supabase/env";

/*
  The real authorisation boundary.

  Middleware redirects signed-out visitors away from /admin, but middleware is
  a routing convenience: a Server Action posts to the page it was rendered
  from and can be invoked directly, and route matchers are easy to get subtly
  wrong when a path is added later. So every admin page and every admin write
  calls this first, and treats its return value as the only proof of identity.

  Two conditions, both required:

    1. A verified session. getClaims() checks the JWT signature; the session
       object on its own is just a cookie the caller sent us.
    2. The email is on the ADMIN_EMAILS allowlist. Supabase will happily
       issue a valid token to any account in the project, so a valid session
       answers "who are you", never "may you read the leads table".
*/

export type AdminUser = { id: string; email: string };

/** Returns the signed-in admin, or null. Never throws for an ordinary visitor. */
export async function getAdminUser(): Promise<AdminUser | null> {
  /*
    No keys means no session is possible, so the answer is "nobody" - and it
    has to be returned rather than thrown. The env accessors throw a helpful
    error by design, but reaching them from here turns an unconfigured
    deployment into a 500 on /admin instead of the login screen, which is the
    one place that explains what is missing. "Not configured" is a state this
    function can answer, not an exception.
  */
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) return null;

  const email = (data.claims.email as string | undefined) ?? null;
  if (!isAdminEmail(email)) return null;

  return { id: String(data.claims.sub), email: email as string };
}

/**
 * Same, but redirects to the login page instead of returning null.
 * Use this at the top of every admin page and Server Action.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
