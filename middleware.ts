import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/*
  Scoped to /admin deliberately.

  The usual Supabase starter runs this on every route except static assets,
  because in a typical app every route is personalised. This site is a public
  landing page: the marketing pages have no session, no personalisation and
  nothing to protect, and putting an auth round-trip in front of them would
  cost every visitor latency to gain nothing. /admin is the only thing here
  that knows who you are.

  /api/leads is intentionally NOT matched. It is the public write path for the
  contact form and must stay reachable to signed-out visitors; it does its own
  validation and rate limiting.
*/
export const config = {
  matcher: ["/admin/:path*"],
};
