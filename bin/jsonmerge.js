#!/usr/bin/env node
'use strict';
// git merge driver for the board's registries. people.json and repos.json are SETS --
// one row per person, one per repo -- and git merges them as text, so two people running
// setup the same morning collide on a line of JSON and the second one's sync stops dead.
//
// Merged as data instead: union the rows by their key, and where both sides changed the
// same row, keep the one that says it was updated later. No conflict is possible, because
// there is no question a human would answer differently.
//
// Called by git as: jsonmerge.js %O %A %B   (base, ours, theirs). Write the result to
// %A and exit 0, or exit 1 and let git mark a conflict the ordinary way.
const fs = require('fs');
const [, , base, ours, theirs] = process.argv;

const read = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };

// The list inside, and what identifies a row in it.
const SHAPES = [
  { list: 'people', key: r => String(r.email || r.name || '').toLowerCase() },
  { list: 'repos', key: r => String(r.name || '') },
];

function merge(a, b, base) {
  const shape = SHAPES.find(s => Array.isArray(a[s.list]) && Array.isArray(b[s.list]));
  if (!shape) return null;
  const { list, key } = shape;
  const by = new Map();
  // Base first, then both sides over the top. A row only one side touched survives
  // untouched; a row both touched goes to whichever was written later.
  for (const src of [(base && base[list]) || [], a[list], b[list]]) {
    for (const row of src) {
      const k = key(row);
      if (!k) continue;
      const had = by.get(k);
      const newer = !had || String(row.updated || row.since || '') >= String(had.updated || had.since || '');
      if (newer) by.set(k, row);
    }
  }
  // A row present in base and dropped by one side was a deliberate removal.
  const gone = new Set();
  for (const row of (base && base[list]) || []) {
    const k = key(row);
    const inA = a[list].some(r => key(r) === k), inB = b[list].some(r => key(r) === k);
    if (!inA || !inB) gone.add(k);
  }
  for (const k of gone) by.delete(k);

  const rows = [...by.values()].sort((x, y) => key(x).localeCompare(key(y)));
  return { ...a, ...b, version: a.version || b.version || 1, updated: new Date().toISOString(), [list]: rows };
}

const A = read(ours), B = read(theirs);
if (!A || !B) process.exit(1);                 // unreadable on either side: let git flag it
const out = merge(A, B, read(base));
if (!out) process.exit(1);                     // not a shape we understand
fs.writeFileSync(ours, JSON.stringify(out, null, 2) + '\n');
