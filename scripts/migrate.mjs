#!/usr/bin/env node
/*
  Database migrations.   Run with:  npm run db:migrate

  Applies every .sql file in supabase/migrations that this database has not
  seen yet, in filename order, and records each one. Running it twice is a
  no-op; running it on a fresh database builds the whole schema.

  WHY THIS EXISTS RATHER THAN "paste the SQL into the dashboard"

  Pasting works exactly once, for one person, on one database. The moment
  there is a second environment - a staging project, a new laptop, a
  colleague - nobody can answer "which changes has this database had?"
  without reading its tables and guessing. A migrations table answers it in
  one query, and makes the answer the same for everyone.

  DESIGN NOTES

  Each migration runs inside its own transaction. If statement four of a file
  fails, statements one to three roll back and the file is not recorded, so
  the fix is to correct the file and run again - never to hunt for which half
  of it landed. (Postgres does transactional DDL, which is what makes this
  possible; on MySQL it would not be.)

  The checksum is a tripwire, not a lock. It warns when an already-applied
  file has been edited, because that edit did not reach any database that ran
  the old version, and two environments now silently disagree about their
  shape. The fix is always a new migration, never a change to an old one.
*/

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

import { loadEnv, style } from "./lib/env.mjs";

const { bold, dim, green, red, yellow, cyan } = style;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "supabase", "migrations");

loadEnv(root);

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error(`
${red("SUPABASE_DB_URL is not set.")}

Migrations change the shape of the database, and that needs a direct Postgres
connection - the service role key talks to the REST API, which cannot create
a table. This is the one value that has to be copied by hand, once.

  ${bold("1.")} Open your project's database settings:
     ${cyan(dashboardLink("settings/database"))}

  ${bold("2.")} Under ${bold("Connection string")}, choose ${bold("Session pooler")}
     (it works from networks without IPv6, which most are).

  ${bold("3.")} Copy it, replace ${bold("[YOUR-PASSWORD]")} with the database password
     you set when the project was created, and add it to ${bold(".env")}:

     ${dim('SUPABASE_DB_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"')}

  ${bold("4.")} Run ${bold("npm run db:migrate")} again.

${dim("Lost the password? Same page, Database password -> Reset. It is not used")}
${dim("anywhere else in this project, so resetting it breaks nothing.")}
`);
  process.exit(1);
}

/* Best-effort deep link, built from the project ref in the public URL. */
function dashboardLink(path) {
  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(
    /https:\/\/([a-z0-9]+)\.supabase\.co/,
  )?.[1];
  return ref
    ? `https://supabase.com/dashboard/project/${ref}/${path}`
    : `https://supabase.com/dashboard  (project -> ${path})`;
}

const client = new pg.Client({
  connectionString,
  /*
    Supabase terminates TLS with a certificate this client has no root for.
    The connection is still encrypted; what is skipped is verifying the far
    end is who it claims to be. Acceptable for a migration run against a
    hostname you just pasted from your own dashboard, and it is what every
    Supabase example does. It would NOT be acceptable in the application
    itself, which is why the app talks to PostgREST over verified HTTPS and
    never opens a socket like this.
  */
  ssl: { rejectUnauthorized: false },
  /* A migration that cannot connect should say so in seconds, not hang. */
  connectionTimeoutMillis: 15_000,
  /*
    No statement timeout. Adding an index to a large table legitimately takes
    minutes, and killing it halfway is worse than waiting.
  */
  statement_timeout: 0,
});

async function main() {
  try {
    await client.connect();
  } catch (error) {
    console.error(`\n${red("Could not connect to the database.")}\n`);
    console.error(`  ${error.message}\n`);
    if (/password authentication failed/i.test(error.message)) {
      console.error(
        `  ${yellow("The password in SUPABASE_DB_URL is wrong.")} Reset it at:\n  ${cyan(dashboardLink("settings/database"))}\n`,
      );
    } else if (/ENOTFOUND|EAI_AGAIN/i.test(error.message)) {
      console.error(
        `  ${yellow("That host does not resolve.")} Check the connection string was copied whole.\n`,
      );
    } else if (/ENETUNREACH/i.test(error.message)) {
      console.error(
        `  ${yellow("Network unreachable - this is usually the IPv6 direct connection.")}\n  Use the ${bold("Session pooler")} string instead.\n`,
      );
    }
    process.exit(1);
  }

  /*
    The ledger. Created before anything else, and by the same mechanism it
    tracks, so a brand-new database needs no preparation at all.
  */
  await client.query(`
    create table if not exists public.schema_migrations (
      name        text primary key,
      checksum    text not null,
      applied_at  timestamptz not null default now()
    );
  `);

  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    /*
      Plain lexicographic sort, which is why the files are numbered with
      leading zeros. 0002 sorts before 0010; "2" would not.
    */
    .sort();

  if (files.length === 0) {
    console.log(yellow("No migration files found."));
    return;
  }

  const { rows: applied } = await client.query(
    "select name, checksum, applied_at from public.schema_migrations",
  );
  const appliedMap = new Map(applied.map((r) => [r.name, r.checksum]));

  /*
    `npm run db:status` - read-only. Worth its few lines: the question "is this
    database up to date?" comes up before every deploy, and the alternative is
    running the migration itself to find out, which answers it by changing it.
  */
  if (process.argv.includes("--status")) {
    const at = new Map(applied.map((r) => [r.name, r.applied_at]));
    console.log(`\n${bold("Migrations")}\n`);
    for (const file of files) {
      const sql = await readFile(join(migrationsDir, file), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex").slice(0, 16);
      if (!appliedMap.has(file)) {
        console.log(`  ${yellow("pending")}  ${file}`);
      } else if (appliedMap.get(file) !== checksum) {
        console.log(`  ${yellow("changed")}  ${file} ${dim("(edited after being applied)")}`);
      } else {
        console.log(
          `  ${green("applied")}  ${file} ${dim(at.get(file)?.toISOString().slice(0, 10) ?? "")}`,
        );
      }
    }
    const pending = files.filter((f) => !appliedMap.has(f)).length;
    console.log(
      `\n${pending === 0 ? `${green("✓")} Up to date.` : `${yellow("!")} ${pending} pending. Run ${bold("npm run db:migrate")}.`}\n`,
    );
    return;
  }

  let ran = 0;

  for (const file of files) {
    const sql = await readFile(join(migrationsDir, file), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex").slice(0, 16);

    if (appliedMap.has(file)) {
      if (appliedMap.get(file) !== checksum) {
        console.log(
          `${yellow("~")} ${file} ${dim("already applied, but the file has changed since")}`,
        );
        console.log(
          `  ${dim("Databases that ran the old version never saw your edit. Add a new")}`,
        );
        console.log(
          `  ${dim("migration instead of editing this one.")}`,
        );
      } else {
        console.log(`${dim("·")} ${dim(file)} ${dim("already applied")}`);
      }
      continue;
    }

    process.stdout.write(`${cyan("→")} ${file} `);

    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into public.schema_migrations (name, checksum) values ($1, $2)",
        [file, checksum],
      );
      await client.query("commit");
      ran += 1;
      console.log(green("applied"));
    } catch (error) {
      await client.query("rollback");
      console.log(red("failed"));
      console.error(`\n${red(error.message)}`);
      if (error.position) {
        /* Point at the offending line rather than making them count bytes. */
        const upto = sql.slice(0, Number(error.position));
        const line = upto.split("\n").length;
        console.error(
          `${dim(`  at ${file}:${line}`)}\n${dim(`  ${sql.split("\n")[line - 1]?.trim() ?? ""}`)}`,
        );
      }
      console.error(
        `\n${dim("Nothing from this file was applied - the transaction rolled back.")}`,
      );
      console.error(`${dim("Fix the file and run npm run db:migrate again.")}\n`);
      process.exit(1);
    }
  }

  console.log(
    ran === 0
      ? `\n${green("✓")} Database is up to date. ${dim(`(${files.length} migration${files.length === 1 ? "" : "s"})`)}`
      : `\n${green("✓")} Applied ${bold(String(ran))} migration${ran === 1 ? "" : "s"}.`,
  );
}

main()
  .catch((error) => {
    console.error(`\n${red("Migration run failed.")}\n\n  ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => {});
  });
