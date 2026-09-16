#!/usr/bin/env node
/*
  One command to get from a fresh clone to a working site:  npm run setup

  It checks the environment, runs the migrations, and offers to create an admin
  user - in that order, stopping at the first thing it cannot do for you and
  saying exactly what to paste where.

  The point is that nobody should have to read SUPABASE.md to get started.
  A setup document is a list of steps a person executes by hand, which means
  it is a list of steps a person can get wrong, in an order they can forget,
  and it goes stale the moment the schema changes. This does the steps.

  Safe to run repeatedly: every stage is either idempotent or asks first.
*/

import { spawn } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnv, style } from "./lib/env.mjs";

const { bold, dim, green, red, yellow, cyan } = style;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* Create .env from the template before loading, so a fresh clone gets a file
   to fill in rather than an error about a variable it has never heard of. */
const envPath = join(root, ".env");
const envLocalPath = join(root, ".env.local");
const hasEnvFile = existsSync(envPath) || existsSync(envLocalPath);

if (!hasEnvFile) {
  copyFileSync(join(root, ".env.example"), envPath);
  console.log(`${green("✓")} Created ${bold(".env")} from the template.\n`);
}

loadEnv(root);

const rl = createInterface({ input: stdin, output: stdout });

const run = (command, args) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      /* npm is a .cmd on Windows and will not spawn without a shell. */
      shell: process.platform === "win32",
    });
    child.on("close", (code) => resolve(code ?? 1));
  });

function heading(n, text) {
  console.log(`\n${bold(`${n}.`)} ${bold(text)}`);
}

function dashboardLink(path) {
  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(
    /https:\/\/([a-z0-9]+)\.supabase\.co/,
  )?.[1];
  return ref
    ? `https://supabase.com/dashboard/project/${ref}/${path}`
    : "https://supabase.com/dashboard";
}

async function main() {
  console.log(bold("\nSales Brain — setup\n"));

  /* ---------------------------------------------------------------- 1 --- */
  heading(1, "Environment");

  const required = [
    ["NEXT_PUBLIC_SUPABASE_URL", "Project Settings → Data API → Project URL"],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Project Settings → API Keys → anon / publishable"],
    ["SUPABASE_SERVICE_ROLE_KEY", "Project Settings → API Keys → service_role (Reveal)"],
  ];

  const missing = required.filter(([key]) => !process.env[key]);

  for (const [key, where] of required) {
    const set = Boolean(process.env[key]);
    console.log(`   ${set ? green("✓") : red("✗")} ${key}${set ? "" : dim(`   ${where}`)}`);
  }

  /*
    The mistake worth catching by hand, because its error message points
    nowhere near the cause: supabase-js appends /rest/v1 itself, so a URL that
    already has it fails every query with "Invalid path specified in request
    URL" - which reads like a bug in the app.
  */
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (url && /\/rest\/v1/.test(url)) {
    console.log(
      `\n   ${yellow("!")} NEXT_PUBLIC_SUPABASE_URL has ${bold("/rest/v1")} on it. Use the bare project URL:`,
    );
    console.log(`     ${cyan(url.replace(/\/rest\/v1\/?$/, ""))}\n`);
    process.exit(1);
  }

  if (missing.length) {
    console.log(
      `\n   Fill these into ${bold(".env")}, then run ${bold("npm run setup")} again.`,
    );
    console.log(`   ${cyan(dashboardLink("settings/api-keys"))}\n`);
    process.exit(1);
  }

  /* ---------------------------------------------------------------- 2 --- */
  heading(2, "Database migrations");

  if (!process.env.SUPABASE_DB_URL) {
    console.log(`   ${red("✗")} SUPABASE_DB_URL is not set.\n`);
    console.log(
      `   Migrations create tables, and the service role key talks to the REST`,
    );
    console.log(`   API, which cannot do that. This is the one value to copy by hand.\n`);
    console.log(`   ${bold("a.")} ${cyan(dashboardLink("settings/database"))}`);
    console.log(`   ${bold("b.")} Connection string → ${bold("Session pooler")}`);
    console.log(`   ${bold("c.")} Replace ${bold("[YOUR-PASSWORD]")}, paste into ${bold(".env")} as SUPABASE_DB_URL`);
    console.log(`   ${bold("d.")} Run ${bold("npm run setup")} again\n`);
    process.exit(1);
  }

  const migrateCode = await run("node", ["scripts/migrate.mjs"]);
  if (migrateCode !== 0) {
    console.log(`\n${red("Setup stopped: migrations failed.")}\n`);
    process.exit(1);
  }

  /* ---------------------------------------------------------------- 3 --- */
  heading(3, "Admin user");

  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (allowlist.length === 0) {
    console.log(`   ${yellow("!")} ADMIN_EMAILS is empty, so nobody can open /admin.`);
    console.log(`     ${dim("An empty list denies everyone - the safe way for this to fail.")}\n`);
  } else {
    console.log(`   Allowlisted: ${allowlist.map((e) => cyan(e)).join(", ")}\n`);
  }

  const answer = (
    await rl.question(`   Create or reset an admin user now? ${dim("[Y/n]")} `)
  )
    .trim()
    .toLowerCase();

  rl.close();

  if (answer === "" || answer === "y" || answer === "yes") {
    console.log();
    /* Hands over stdin entirely - create-admin.mjs does its own prompting. */
    await run("node", ["scripts/create-admin.mjs"]);
  }

  /* ---------------------------------------------------------------- 4 --- */
  console.log(`\n${green("✓")} ${bold("Setup complete.")}\n`);
  console.log(`   ${bold("npm run dev")}        start the site`);
  console.log(`   ${dim("localhost:3000/admin")}        the panel`);
  console.log(`   ${dim("localhost:3000/admin/posts")}  write a post`);
  console.log(`   ${dim("localhost:3000/blog")}         read them\n`);
  console.log(
    `   ${dim("Optional:")} ${bold("npm run blog:seed")} ${dim("adds three SEO-ready drafts to start from.")}\n`,
  );
}

main().catch((error) => {
  console.error(`\n${red("Setup failed.")}\n\n  ${error.message}\n`);
  rl.close();
  process.exitCode = 1;
});
