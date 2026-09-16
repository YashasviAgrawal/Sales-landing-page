"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/supabase/env";
import { requireAdmin } from "@/lib/admin-auth";
import { isLeadStatus, LEAD_STATUSES } from "@/lib/leads";

/*
  Every Server Action in the admin panel.

  The rule this file follows without exception: each exported action calls
  requireAdmin() - or, for sign-in, is itself the thing that establishes the
  identity - before it touches the database. A "use server" export is a public
  HTTP endpoint with a generated name; it is reachable by anyone who can guess
  or replay that name, and the middleware matcher does not save it. Treat a
  missing requireAdmin() in a new action here as a hole straight into the
  leads table.
*/

export type ActionState = { error?: string; ok?: boolean };

/* -------------------------------------------------------------------------- */
/*  Auth                                                                      */
/* -------------------------------------------------------------------------- */

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { error: "Enter an email and password." };
  }

  /*
    Allowlist first, before the password is ever checked against Supabase.

    Two reasons. It keeps a non-admin account - a customer, if this project
    ever grows a customer-facing login - from being issued an admin session
    cookie it would then have to be cleaned up out of. And it means a stranger
    probing this form cannot use it as an oracle for which accounts exist,
    because every address that is not on the list gets the same reply whether
    it has an account or not.
  */
  if (!isAdminEmail(email)) {
    return { error: "Those credentials don’t match an admin account." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    /*
      One message for every failure. "No such user" and "wrong password" told
      apart is a free account-enumeration tool, and the real admin - who knows
      their own email is correct - loses nothing by not being told which half
      was wrong.
    */
    return { error: "Those credentials don’t match an admin account." };
  }

  /*
    Outside any try/catch on purpose: redirect() works by throwing a control
    signal that Next catches, so a catch block around it swallows the
    navigation and the action appears to do nothing.

    Only same-origin paths are honoured. `next` arrives from the query string,
    so without this check a link to /admin/login?next=https://evil.example
    would turn our own login into an open redirect - the classic way a
    phishing page borrows a real domain's credibility.
  */
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  redirect(safeNext);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* -------------------------------------------------------------------------- */
/*  Lead mutations                                                            */
/* -------------------------------------------------------------------------- */

export async function updateLeadStatus(
  id: string,
  status: string,
): Promise<ActionState> {
  await requireAdmin();

  /*
    Validated here as well as by the CHECK constraint in Postgres. The
    constraint is the guarantee; this is so a bad value comes back as a
    sentence the panel can show rather than a database error, and so the set
    of statuses the UI believes in is asserted on the way in.
  */
  if (!isLeadStatus(status)) {
    return { error: `Status must be one of: ${LEAD_STATUSES.join(", ")}.` };
  }

  const { error } = await supabaseAdmin()
    .from("leads")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[admin] status update failed:", error.message);
    return { error: "Could not save that status." };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function updateLeadNotes(
  id: string,
  notes: string,
): Promise<ActionState> {
  await requireAdmin();

  const trimmed = notes.trim().slice(0, 10_000);

  const { error } = await supabaseAdmin()
    .from("leads")
    /* Empty becomes NULL, not "". One representation of "no notes" keeps the
       filters and the CSV export from having to test for both. */
    .update({ notes: trimmed || null })
    .eq("id", id);

  if (error) {
    console.error("[admin] notes update failed:", error.message);
    return { error: "Could not save those notes." };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteLead(id: string): Promise<ActionState> {
  await requireAdmin();

  const { error } = await supabaseAdmin().from("leads").delete().eq("id", id);

  if (error) {
    console.error("[admin] delete failed:", error.message);
    return { error: "Could not delete that lead." };
  }

  revalidatePath("/admin");
  return { ok: true };
}
