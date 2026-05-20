// Post-seed enrichment: EmDash's $media resolver writes captions to the
// `media.caption` column but drops them from the inline `gallery` snapshot on
// `ec_projects`. The template reads gallery directly, so captions never reach
// the page. This script joins media.caption back into each gallery item and
// UPDATEs ec_projects in place. Run AFTER `emdash seed`, BEFORE dumping for
// remote sync.

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

const db = new Database(dbPath);

// Gallery items reference media via storage_key, not media.id. The inline id
// on a gallery item is a snapshot id; the canonical media row is found by
// matching its storage_key to gallery_item.meta.storageKey.
const captionByStorageKey = db.prepare(
  "SELECT caption FROM media WHERE storage_key = ? AND caption IS NOT NULL AND caption != '' LIMIT 1",
);
const updateGallery = db.prepare("UPDATE ec_projects SET gallery = ? WHERE id = ?");

let projectsUpdated = 0;
let itemsEnriched = 0;

const rows = db.prepare("SELECT id, gallery FROM ec_projects").all();
for (const row of rows) {
  if (!row.gallery) continue;
  let gallery;
  try {
    gallery = JSON.parse(row.gallery);
  } catch {
    continue;
  }
  if (!Array.isArray(gallery)) continue;

  let changed = false;
  for (const item of gallery) {
    if (item.caption) continue;
    const storageKey = item?.meta?.storageKey;
    if (!storageKey) continue;
    const mediaRow = captionByStorageKey.get(storageKey);
    const caption = mediaRow?.caption;
    if (caption && caption.trim()) {
      item.caption = caption;
      changed = true;
      itemsEnriched++;
    }
  }

  if (changed) {
    updateGallery.run(JSON.stringify(gallery), row.id);
    projectsUpdated++;
  }
}

console.log(
  `Enriched ${itemsEnriched} gallery items across ${projectsUpdated} projects.`,
);
