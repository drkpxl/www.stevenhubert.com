// Dump local D1 content as INSERT statements that can apply to the remote D1.
// Skips FTS5 virtual tables (auto-rebuilt via triggers on the remote side) and
// migration lock state. Generates schema-free dump — assumes the remote schema
// is already created by EmDash's auto-bootstrap on first request.
//
// Usage:
//   node scripts/dump-local-d1.mjs > /tmp/content-dump.sql
//   wrangler d1 execute stevenhubert-content --remote --file /tmp/content-dump.sql

import Database from "better-sqlite3";
import { execSync } from "node:child_process";

const dbPath = execSync(
  "find .wrangler/state/v3/d1/miniflare-D1DatabaseObject -name '*.sqlite' -not -name 'metadata*' | head -1",
  { encoding: "utf-8" },
).trim();

if (!dbPath) {
  console.error("No local D1 sqlite file found. Run `npm run dev` once first.");
  process.exit(1);
}

const db = new Database(dbPath, { readonly: true });

// Skip: FTS5 virtual tables (rebuilt by triggers), migrations lock (Worker-managed),
// _cf_METADATA (D1 system table), revisions (not strictly needed for first deploy)
const SKIP_PATTERNS = [
  /^_emdash_fts_/,
  /^_emdash_migrations_lock$/,
  /^_cf_METADATA$/,
];

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table'")
  .all()
  .map((r) => r.name)
  .filter((name) => !SKIP_PATTERNS.some((p) => p.test(name)));

const escapeValue = (v) => {
  if (v === null) return "NULL";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(v);
  if (typeof v === "bigint") return v.toString();
  if (Buffer.isBuffer(v)) return `X'${v.toString("hex")}'`;
  // String — escape single quotes
  return `'${String(v).replace(/'/g, "''")}'`;
};

const escapeIdent = (s) => `"${s.replace(/"/g, '""')}"`;

console.log("-- EmDash content dump for remote D1 import");
console.log(`-- Generated ${new Date().toISOString()}`);
console.log("-- Apply with: wrangler d1 execute stevenhubert-content --remote --file <this-file>");
console.log("");
console.log("PRAGMA foreign_keys = OFF;");
console.log("");

let totalRows = 0;
for (const table of tables) {
  const rows = db.prepare(`SELECT * FROM ${escapeIdent(table)}`).all();
  if (rows.length === 0) continue;
  const cols = Object.keys(rows[0]);
  const colList = cols.map(escapeIdent).join(", ");
  console.log(`-- ${table} (${rows.length} rows)`);
  console.log(`DELETE FROM ${escapeIdent(table)};`);
  for (const row of rows) {
    const values = cols.map((c) => escapeValue(row[c])).join(", ");
    console.log(`INSERT INTO ${escapeIdent(table)} (${colList}) VALUES (${values});`);
  }
  console.log("");
  totalRows += rows.length;
}

console.log("PRAGMA foreign_keys = ON;");
console.error(`Dumped ${totalRows} rows from ${tables.length} tables to stdout.`);
