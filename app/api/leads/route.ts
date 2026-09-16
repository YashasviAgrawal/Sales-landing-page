import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { validateLead } from "@/lib/leads";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/*
  The one public write path into the leads table.

  The contact form posts here; the server validates, rate limits and inserts
  using the service role key. Nothing about the database is reachable from the
  browser - see the security note at the top of supabase/schema.sql for why
  the table has RLS on and no policies, and why "just let anon insert" is the
  wrong fix if this ever stops working.

  Node runtime, not edge: the service role key must stay on a server we
  control, and node:crypto does the IP hashing.
*/
export const runtime = "nodejs";
/* Never cached, never prerendered - it only ever writes. */
export const dynamic = "force-dynamic";

/* Five submissions per address per ten minutes. A real visitor sends one. */
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

/*
  Hash the address rather than store it.

  Knowing two submissions came from the same place is worth having - it is how
  you spot a script, or the same founder filling the form twice. The address
  itself is personal data under the GDPR and under India's DPDP Act, and this
  site has no use for it that a salted hash does not also serve. So we keep
  the comparison and throw away the identity.

  The salt is what stops the hash being reversible: the IPv4 space is small
  enough to brute-force an unsalted SHA-256 of every address in minutes.
  LEAD_IP_SALT is the place to set one; it falls back to the service role key,
  which is already a server-only secret of the right shape, so the fallback is
  safe rather than merely convenient. Changing the salt makes old and new
  hashes stop matching, which is the expected trade.
*/
function hashIp(ip: string): string | null {
  if (ip === "unknown") return null;
  const salt = process.env.LEAD_IP_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export async function POST(request: Request) {
  /*
    A deploy without keys should not take the contact form down with it. The
    form reads this specific status and falls back to opening the visitor's
    email client, so the enquiry still arrives - just the old way.
  */
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Lead storage is not configured.", fallback: true },
      { status: 503 },
    );
  }

  const ip = clientIp(request.headers);
  const limited = rateLimit(`leads:${ip}`, LIMIT, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Try again shortly, or email us." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  /*
    The honeypot. A field that is present in the DOM, hidden from people and
    from screen readers, and left empty by anyone who is not a bot filling in
    every input it can find.

    It answers 200, not 400. A bot that gets an error learns to try again
    differently; one that gets a cheerful success moves on and the row never
    exists. Cheap, silent, and it costs a real visitor nothing.
  */
  const honeypot = (body as Record<string, unknown>)?.company;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = validateLead(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  /*
    Attribution is read from the request, never from the posted JSON. The
    form could send us a `source` and a `referrer`, and then both would be
    whatever the sender felt like typing. Taken from the headers, they are at
    least as trustworthy as the request itself.
  */
  const { error } = await supabaseAdmin()
    .from("leads")
    .insert({
      ...parsed.value,
      source: "landing-book-form",
      referrer: request.headers.get("referer"),
      user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
      ip_hash: hashIp(ip),
    });

  if (error) {
    /*
      Logged in full for us, summarised for them. A database error message can
      name tables, columns and constraints, and there is no reason to publish
      the schema to whoever is poking at the endpoint. `fallback: true` tells
      the form to open the email client so the enquiry is not simply lost.
    */
    console.error("[leads] insert failed:", error.message, error.details ?? "");
    return NextResponse.json(
      { error: "Could not save that. Please email us instead.", fallback: true },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
