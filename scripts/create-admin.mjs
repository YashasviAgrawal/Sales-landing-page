#!/usr/bin/env node
/*
  Create (or reset the password of) an admin user.

    npm run admin:create                      prompts for email and password
    npm run admin:create -- you@co.com        prompts for the password only
    npm run admin:create -- you@co.com --generate-password

  This replaces clicking through Authentication -> Users -> Add user, and does
  the two things that step gets wrong by hand: it confirms the address
  immediately (an unconfirmed user cannot sign in, and the confirmation email
  has nowhere to go until SMTP is set up), and it tells you when the address is
  missing from ADMIN_EMAILS - which is the actual reason a freshly created
  admin still cannot get in.

  Needs only SUPABASE_SERVICE_ROLE_KEY. The Auth admin API is HTTP, so unlike
  migrations this needs no database password.
*/

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

import { loadEnv, style } from "./lib/env.mjs";

const { bold, dim, green, red, yellow, cyan } = style;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(root);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(`
${red("Supabase is not configured.")}

  NEXT_PUBLIC_SUPABASE_URL      ${url ? green("set") : red("missing")}
  SUPABASE_SERVICE_ROLE_KEY     ${serviceKey ? green("set") : red("missing")}

Copy ${bold(".env.example")} to ${bold(".env")} and fill them in - see SUPABASE.md.
`);
  process.exit(1);
}

const args = process.argv.slice(2);
const generate = args.includes("--generate-password");
const emailArg = args.find((a) => !a.startsWith("--"));

/*
  A password worth defaulting to.

  base64url of 18 random bytes is 24 characters and about 144 bits of entropy,
  which is far past anything brute-forceable. It is generated rather than
  chosen because this account guards every lead the site collects, and a
  human-chosen password for an account used twice a month is reliably the
  weakest one that person owns.
*/
const generatePassword = () => randomBytes(18).toString("base64url");

const rl = createInterface({ input: stdin, output: stdout });

async function main() {
  const email = (emailArg ?? (await rl.question(`${bold("Admin email")}: `)))
    .trim()
    .toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`\n${red("That is not an email address.")}\n`);
    process.exit(1);
  }

  let password;
  if (generate) {
    password = generatePassword();
  } else {
    /*
      Not hidden as it is typed. Node's readline has no portable way to mask
      input on Windows, and the usual workarounds - raw mode, rewriting the
      line - break inside npm scripts and CI. Rather than ship something that
      half works, this says plainly that the password is visible and offers
      --generate-password, which never puts one on screen for longer than it
      takes to copy.
    */
    const answer = await rl.question(
      `${bold("Password")} ${dim("(visible - press Enter to generate a strong one)")}: `,
    );
    password = answer.trim() || generatePassword();
    if (!answer.trim()) console.log(dim("  Generated."));
  }

  if (password.length < 8) {
    console.error(
      `\n${red("Supabase requires at least 8 characters.")} Press Enter next time to generate one.\n`,
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log();

  /*
    Create, and fall back to updating if the address is taken.

    "Already registered" is the single most likely outcome of running this a
    second time, and failing there would be unhelpful - the reason someone
    re-runs it is almost always that they have forgotten the password. So the
    script finds the existing user and resets it instead, which is the thing
    they actually wanted.
  */
  let userId;
  let created = true;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    /* The whole point of the script: skip the confirmation email. */
    email_confirm: true,
  });

  if (error) {
    const alreadyExists =
      /already/i.test(error.message) || error.status === 422;

    if (!alreadyExists) {
      console.error(`${red("Could not create the user.")}\n\n  ${error.message}\n`);
      if (error.status === 401 || /invalid/i.test(error.message)) {
        console.error(
          `  ${yellow("That looks like a key problem.")} SUPABASE_SERVICE_ROLE_KEY must be\n  the ${bold("service_role")} key, not the anon/publishable one.\n`,
        );
      }
      process.exit(1);
    }

    created = false;
    const existing = await findUserByEmail(supabase, email);

    if (!existing) {
      console.error(
        `${red("The address is taken but the user could not be found.")}\n  Check it in the dashboard.\n`,
      );
      process.exit(1);
    }

    userId = existing.id;
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password, email_confirm: true },
    );

    if (updateError) {
      console.error(
        `${red("Could not reset the password.")}\n\n  ${updateError.message}\n`,
      );
      process.exit(1);
    }
  } else {
    userId = data.user.id;
  }

  console.log(
    `${green("✓")} ${created ? "Created" : "Password reset for"} ${bold(email)}`,
  );
  console.log(`  ${dim(`user id ${userId}`)}`);
  console.log(`\n  ${bold("Password:")} ${cyan(password)}`);
  console.log(
    `  ${dim("Save it in a password manager now - it is not stored anywhere else.")}\n`,
  );

  /*
    The check that catches the real failure. A Supabase account is necessary
    and not sufficient: /admin also requires the address to be on the
    ADMIN_EMAILS allowlist, and someone who has just watched this script
    print a success line will not think to look there when the login refuses
    them.
  */
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allowlist.includes(email)) {
    console.log(`${yellow("!")} ${bold("This address cannot sign in yet.")}`);
    console.log(
      `  A Supabase account is only half of it - ${bold("/admin")} also checks ADMIN_EMAILS.\n`,
    );
    console.log(`  Add it to ${bold(".env")}:\n`);
    console.log(
      `    ${dim("ADMIN_EMAILS=")}${cyan(`"${[...allowlist, email].join(",")}"`)}\n`,
    );
    console.log(`  Then restart the dev server.\n`);
  } else {
    console.log(`${green("✓")} On the ADMIN_EMAILS allowlist. Sign in at ${bold("/admin")}.\n`);
  }
}

/*
  The Auth admin API has no get-user-by-email, only a paginated list, so this
  walks the pages. Capped at 50 pages because an admin project with 5,000
  users is not a thing this site will ever have, and an unbounded loop against
  a remote API is how a script hangs forever on an unexpected response.
*/
async function findUserByEmail(supabase, email) {
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (error || !data?.users?.length) return null;

    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email,
    );
    if (match) return match;

    if (data.users.length < 100) return null;
  }
  return null;
}

main()
  .catch((error) => {
    console.error(`\n${red("Failed.")}\n\n  ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => rl.close());
