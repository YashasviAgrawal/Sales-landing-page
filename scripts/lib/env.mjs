/*
  Shared helpers for the scripts in this folder.

  The scripts are plain Node, run outside Next.js, so nothing loads .env for
  them. Rather than add dotenv for one function, this parses the file - the
  format is simple enough that the parser fits in twenty lines, and it keeps
  the scripts dependency-free apart from `pg`, which does real work.

  Precedence matches Next's: .env.local overrides .env, and a variable already
  present in the real environment beats both. That last part is what lets CI
  set SUPABASE_DB_URL as a secret without a file existing at all.
*/

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function loadEnv(root) {
  /* Loaded in order of increasing priority; a later file does not overwrite
     an earlier one only because we check `in process.env` before setting. */
  for (const file of [".env.local", ".env"]) {
    const path = join(root, file);
    if (!existsSync(path)) continue;

    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;

      const key = trimmed.slice(0, eq).trim();
      if (!key || key in process.env) continue;

      let value = trimmed.slice(eq + 1).trim();
      /* Strip one matching pair of surrounding quotes, if present. */
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

/*
  Colour, when the terminal is actually a terminal.

  Guarded on isTTY and on NO_COLOR because these scripts get run in CI and
  piped into log files, and escape codes in a log file are noise that makes
  the message harder to read rather than easier.
*/
const enabled =
  process.stdout.isTTY && !process.env.NO_COLOR && process.env.TERM !== "dumb";

const wrap = (open, close) => (text) =>
  enabled ? `[${open}m${text}[${close}m` : String(text);

export const style = {
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  red: wrap(31, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  blue: wrap(34, 39),
  magenta: wrap(35, 39),
  cyan: wrap(36, 39),
};
