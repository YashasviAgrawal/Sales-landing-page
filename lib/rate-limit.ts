import "server-only";

/*
  A small fixed-window rate limiter, in process memory.

  Scope and honesty about it: this holds counters in a Map on the server
  instance that handled the request. On a single container it is exactly
  right. Spread across several serverless instances each one keeps its own
  window, so the effective limit is the configured one times the number of
  warm instances - and a cold start resets it.

  That is a real weakness and it is still the correct thing to ship here. The
  threat is a bored script filling the leads table, not a funded attacker, and
  five submissions per instance per ten minutes stops that at zero
  infrastructure cost. If this ever guards something that matters - a billing
  endpoint, an auth attempt counter - replace it with Upstash Redis or
  Supabase's own rate limiting rather than tuning the numbers here.

  The sweep on write keeps the Map from growing without bound on a long-lived
  process. It is O(n) over expired keys only, and runs at most once a minute.
*/

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, window] of buckets) {
    if (window.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the window resets. For the Retry-After header. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
  return { ok: existing.count <= limit, retryAfter };
}

/*
  The caller's address, as best we can know it.

  Behind a proxy - Vercel, Cloudflare, nginx - the socket address is the
  proxy's, so the client's is whatever the proxy wrote into a header. Order
  matters: x-real-ip and Vercel's own header are set by infrastructure we
  control, x-forwarded-for is a client-supplied list that a proxy appends to,
  so we take its FIRST entry and trust it least.

  Anyone can forge x-forwarded-for, which caps what this is good for: it
  limits accidents and lazy scripts, and it is not an identity. Nothing
  security-relevant should hang off it.
*/
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "unknown"
  );
}
