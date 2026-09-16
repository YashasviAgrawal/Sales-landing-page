import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

/*
  The session-aware client. This one runs as the logged-in admin rather than
  as the server, and its only job is auth: sign in, sign out, and answer "who
  is this request?". It never reads the leads table - with RLS on and no
  policies, it could not anyway.

  Auth state lives in cookies rather than localStorage so that Server
  Components and Server Actions can see it. @supabase/ssr handles the token
  refresh; the getAll/setAll pair below is how it reaches the cookie jar.

  The try/catch around setAll is required, not defensive noise. Server
  Components are not allowed to set cookies - only Route Handlers, Server
  Actions and middleware are - so a page that happens to trigger a token
  refresh while rendering will throw here. Swallowing it is correct because
  middleware.ts refreshes the session on every request to /admin and writes
  the rotated cookies from a place that is allowed to, so the write this
  catch discards has already happened.
*/
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* Rendering a Server Component; middleware owns the refresh. */
        }
      },
    },
  });
}
