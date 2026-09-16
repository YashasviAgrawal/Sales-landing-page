import { getAdminUser } from "@/lib/admin-auth";
import { fetchAllLeads } from "@/lib/leads-query";
import { leadsToCsv } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  CSV export of the current view.

  It takes the same `q` and `status` parameters the page does and runs them
  through the same query builder, so the file matches what was on screen when
  the button was pressed. An export that quietly ignores the filters is the
  one people notice a week later, after they have already sent it to someone.

  getAdminUser() rather than requireAdmin() here: requireAdmin redirects, and
  redirecting a download to an HTML login page hands the browser a file called
  export.csv full of markup. A 401 is the honest answer to an unauthenticated
  fetch, and it is what the browser will show if the session expired while the
  tab was open.
*/
export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return new Response("Not authorised.", { status: 401 });
  }

  const url = new URL(request.url);

  let leads;
  try {
    leads = await fetchAllLeads({
      q: url.searchParams.get("q") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
    });
  } catch {
    return new Response("Could not build the export.", { status: 500 });
  }

  /* Date-stamped, because these end up in a downloads folder next to the
     last four. ISO order so they sort chronologically by name. */
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(leadsToCsv(leads), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="salesbrain-leads-${stamp}.csv"`,
      /* Lead data must never sit in a shared or browser cache. */
      "Cache-Control": "no-store, private",
    },
  });
}
