/*
  Environment access for the Supabase layer, in one place.

  Everything else in lib/supabase imports from here rather than reading
  process.env directly, for two reasons:

    - the error message. A missing key surfaces as "SUPABASE_SERVICE_ROLE_KEY
      is not set" at the moment of use, naming the variable and pointing at
      .env.example, instead of as a Supabase client throwing about an invalid
      URL three frames deeper.

    - `isSupabaseConfigured`. The landing page has to survive a deploy where
      the keys have not been pasted in yet - a marketing site that 500s on
      every visit because the CRM is half-wired is a worse failure than one
      that quietly posts the enquiry to email. The contact form checks this
      and falls back; the admin panel checks it and explains what is missing.

  NEXT_PUBLIC_ on the first two is the Supabase convention and is correct:
  the anon key is designed to be public, and with RLS on and no policies (see
  supabase/schema.sql) it grants the holder nothing on the leads table. The
  service role key carries no prefix and must never gain one.
*/

function read(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env.local and fill it in - see SUPABASE.md.`,
    );
  }
  return value;
}

export const supabaseUrl = () => read("NEXT_PUBLIC_SUPABASE_URL");
export const supabaseAnonKey = () => read("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const supabaseServiceKey = () => read("SUPABASE_SERVICE_ROLE_KEY");

/** True when the three keys needed to talk to Supabase at all are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/*
  Who is allowed into /admin.

  A Supabase account alone is not enough. Anyone who can reach the project's
  auth endpoint can create a user; this list is what separates "has an
  account" from "may read the leads table", and it is checked on the server on
  every admin page load and every write.

  Comma-separated, case-insensitive:  ADMIN_EMAILS="you@co.com, ops@co.com"

  An empty list denies everyone. That is the safe direction to fail - the
  alternative, treating "unset" as "allow all", turns a forgotten variable in
  a new environment into an open lead database.
*/
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}
