import "server-only";

import { createClient } from "@supabase/supabase-js";
import { supabaseServiceKey, supabaseUrl } from "./env";
import type { Database } from "./database.types";

/*
  The service role client. It bypasses Row Level Security completely, which
  is exactly why it is the only thing that can read or write the leads table
  (see the security note in supabase/schema.sql).

  `import "server-only"` is the guard that matters here: if any client
  component ever imports this file, even transitively, the build fails with a
  clear error rather than shipping a key that grants full database access to
  every visitor. Do not remove it, and do not re-export the client from a file
  that a "use client" component imports.

  Sessions are off because there is no user here - this client acts as the
  server itself, and letting it try to persist or refresh a session would have
  it writing auth state into a shared module on a long-lived process.
*/
let cached: ReturnType<typeof createClient<Database>> | null = null;

export function supabaseAdmin() {
  if (!cached) {
    cached = createClient<Database>(supabaseUrl(), supabaseServiceKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cached;
}
