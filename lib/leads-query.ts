import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { isLeadStatus, type Lead, type LeadStatus } from "@/lib/leads";

/*
  Reading the leads table.

  Shared by the admin page and the CSV export so that the file someone
  downloads is exactly the set of rows they were looking at - the moment those
  are two different query builders, the export silently starts disagreeing
  with the screen about what "filtered" means.

  Every function here assumes the caller has already proved it is an admin.
  It uses the service role client, which bypasses RLS, so importing this
  module is equivalent to unrestricted read access. requireAdmin() first,
  always.
*/

export const PAGE_SIZE = 25;

export type LeadFilters = {
  q?: string;
  status?: string;
  page?: number;
};

/*
  Make a search term safe to interpolate into a PostgREST filter expression.

  This matters more than it looks. `.or()` takes a single string in
  PostgREST's own filter grammar - `name.ilike.%x%,email.ilike.%x%` - where
  commas separate conditions, parentheses group them, and `%` is the LIKE
  wildcard. A raw search term carrying any of those does not cause SQL
  injection (PostgREST parameterises the values) but it does let the term
  rewrite the *filter*: typing `a,status.eq.won` would append a condition
  nobody asked for, and a stray `(` returns a parse error instead of results.

  So the term is reduced to characters that can appear in the things people
  actually search this table for - a name, an email, a domain, a phrase from
  the context field - and everything structural is dropped.
*/
function sanitiseTerm(raw: string): string {
  return raw
    .replace(/[,()%*\\"':]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

export type LeadsPage = {
  leads: Lead[];
  total: number;
  page: number;
  pageCount: number;
};

export async function fetchLeads(filters: LeadFilters): Promise<LeadsPage> {
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;

  let query = supabaseAdmin()
    .from("leads")
    /* `count: "exact"` on the same round trip as the rows - a separate count
       query would double the latency of every page load and could disagree
       with the rows if something was inserted between the two. */
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (isLeadStatus(filters.status)) {
    query = query.eq("status", filters.status);
  }

  const term = sanitiseTerm(filters.q ?? "");
  if (term) {
    /*
      Four columns, because those are the four a person searching this table
      is thinking of: they remember a name, an address, a domain, or a phrase
      from what the lead wrote. Leading-wildcard ILIKE cannot use a B-tree
      index, which is why schema.sql puts trigram indexes on the first three.
    */
    query = query.or(
      [
        `name.ilike.%${term}%`,
        `email.ilike.%${term}%`,
        `website.ilike.%${term}%`,
        `context.ilike.%${term}%`,
      ].join(","),
    );
  }

  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);

  if (error) {
    console.error("[admin] lead query failed:", error.message);
    throw new Error("Could not load leads.");
  }

  const total = count ?? 0;

  return {
    leads: (data ?? []) as Lead[],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Every matching row, unpaginated. For the CSV export only. */
export async function fetchAllLeads(filters: LeadFilters): Promise<Lead[]> {
  let query = supabaseAdmin()
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    /*
      A hard ceiling on an unpaginated read. The export is a convenience, not
      a backup: without a limit, one click on a table that has grown to six
      figures builds the whole thing in memory and times the function out.
      Ten thousand rows is a ~3MB CSV, which every spreadsheet opens happily.
    */
    .limit(10_000);

  if (isLeadStatus(filters.status)) {
    query = query.eq("status", filters.status);
  }

  const term = sanitiseTerm(filters.q ?? "");
  if (term) {
    query = query.or(
      [
        `name.ilike.%${term}%`,
        `email.ilike.%${term}%`,
        `website.ilike.%${term}%`,
        `context.ilike.%${term}%`,
      ].join(","),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("[admin] export query failed:", error.message);
    throw new Error("Could not export leads.");
  }

  return (data ?? []) as Lead[];
}

export type LeadStats = {
  total: number;
  new: number;
  last7: number;
  won: number;
};

/*
  The four figures above the table.

  All four are head-only count queries: `head: true` asks Postgres for the
  count and returns no rows at all, so this costs four cheap round trips
  rather than pulling the table in to count it in JavaScript. They run in
  parallel because none of them depends on another.

  What each one is for: `total` is the size of the pipeline, `new` is the
  only number that implies work today, `last7` says whether the top of the
  funnel is alive this week, and `won` is the only one that pays for the site.
*/
export async function fetchLeadStats(): Promise<LeadStats> {
  const db = supabaseAdmin();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const head = () => db.from("leads").select("id", { count: "exact", head: true });

  const [total, fresh, last7, won] = await Promise.all([
    head(),
    head().eq("status", "new" satisfies LeadStatus),
    head().gte("created_at", weekAgo),
    head().eq("status", "won" satisfies LeadStatus),
  ]);

  /*
    A failed stat tile returns 0 rather than taking the page down with it.
    These four numbers are context, not the content: an admin who can see
    their leads but not the "won" count has lost almost nothing, and one
    staring at an error page because a count query timed out has lost the
    whole panel.
  */
  const value = (result: { count: number | null; error: unknown }) => {
    if (result.error) {
      console.error("[admin] stat count failed:", result.error);
      return 0;
    }
    return result.count ?? 0;
  };

  return {
    total: value(total),
    new: value(fresh),
    last7: value(last7),
    won: value(won),
  };
}
