'use strict';
// Archiving. Snapshots .coord before and after, records the run time.
const fs = require('fs'), os = require('os'), path = require('path');
const L = require('./lib.js');
const { P } = L;

const ACTIVITY_DAYS = 14, TICKET_DAYS = 30, KEEP_HANDOFFS = 5;

function archive({ dryRun = false } = {}) {
  const acts = [];
  if (!dryRun) L.snapshot('coord: before archive');

  archiveActivity(acts, dryRun);
  archiveTickets(acts, dryRun);
  trimHandoffs(acts, dryRun);

  if (!dryRun) {
    L.setState({ lastArchive: L.nowISO() });
    L.snapshot(`coord: archive run (${acts.length} action${acts.length === 1 ? '' : 's'})`);
  }
  return acts;
}

/* activity logs older than 14 days -> archive/activity/YYYY-MM.tar.gz + a summary */
function archiveActivity(acts, dryRun) {
  const old = L.ls(P.activity).filter(f => /^\d{4}-\d{2}-\d{2}\.log$/.test(f) && L.daysAgo(f.slice(0, 10)) > ACTIVITY_DAYS);
  const months = {};
  for (const f of old) (months[f.slice(0, 7)] ||= []).push(f);

  for (const [month, files] of Object.entries(months)) {
    acts.push(`activity: ${files.length} log(s) -> archive/activity/${month}.tar.gz`);
    if (dryRun) continue;
    const dest = path.join(P.archive, 'activity');
    fs.mkdirSync(dest, { recursive: true });
    const tgz = path.join(dest, `${month}.tar.gz`);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'coord-arch-'));
    try {
      if (L.exists(tgz)) L.sh('tar', ['-xzf', tgz, '-C', tmp]);          // fold into the existing month
      for (const f of files) fs.renameSync(path.join(P.activity, f), path.join(tmp, f));
      const all = L.ls(tmp).filter(f => f.endsWith('.log'));
      L.sh('tar', ['-czf', tgz, '-C', tmp, ...all]);
      L.atomicWrite(path.join(dest, `${month}-summary.md`), summarize(month, tmp, all));
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  }
}

function summarize(month, dir, files) {
  const perRepo = {}, tickets = new Set();
  for (const f of files) for (const line of L.read(path.join(dir, f)).split('\n')) {
    const [, repo] = line.split('\t');
    if (!repo) continue;
    perRepo[repo] = (perRepo[repo] || 0) + 1;
    for (const m of line.matchAll(new RegExp(L.TICKET_RE.source, 'g'))) tickets.add(m[0]);
  }
  const rows = Object.entries(perRepo).sort((a, b) => b[1] - a[1]).map(([r, n]) => `| ${r} | ${n} |`);
  return `# Activity ${month}\n\nArchived ${files.length} daily log(s) into ${month}.tar.gz.\n\n| repo | events |\n| --- | --- |\n${rows.join('\n')}\n\nTickets touched: ${[...tickets].sort().join(', ') || '—'}\n`;
}

/* tickets done/rejected for 30+ days -> archive/tickets/YYYY-MM/ + index row */
function archiveTickets(acts, dryRun) {
  const rows = [];
  for (const f of L.lsMd(P.tickets)) {
    const file = path.join(P.tickets, f);
    const { fm } = L.parse(L.read(file));
    if (!['done', 'rejected'].includes(fm.status)) continue;
    const closed = fm.closed || (fm.updated || '').slice(0, 10);
    if (!closed || L.daysAgo(closed) < TICKET_DAYS) continue;
    const month = closed.slice(0, 7);
    acts.push(`ticket: ${fm.id} (${fm.status}, closed ${closed}) -> archive/tickets/${month}/`);
    rows.push(`| ${fm.id} | ${fm.title} | ${fm.from} | ${fm.to} | ${closed} | ${(fm.decisions || []).join(' ') || '—'} |`);
    if (dryRun) continue;
    const dest = path.join(P.archive, 'tickets', month);
    fs.mkdirSync(dest, { recursive: true });
    fs.renameSync(file, path.join(dest, f));
  }
  if (rows.length && !dryRun) {
    const idx = path.join(P.archive, 'tickets-index.md');
    L.atomicWrite(idx, L.read(idx).replace(/\s*$/, '\n') + rows.join('\n') + '\n');
  }
}

/* keep the latest 5 handoff notes per status file; older ones -> archive/handoffs/<repo>.md */
function trimHandoffs(acts, dryRun) {
  for (const f of L.lsMd(P.status)) {
    const file = path.join(P.status, f), text = L.read(file);
    const h = splitHandoffs(text);
    if (!h || h.notes.length <= KEEP_HANDOFFS) continue;
    const move = h.notes.slice(KEEP_HANDOFFS);
    acts.push(`handoffs: ${f} ${move.length} note(s) -> archive/handoffs/${f}`);
    if (dryRun) continue;
    L.atomicWrite(file, h.head + h.hdr + h.pre + h.notes.slice(0, KEEP_HANDOFFS).join(''));
    const dest = path.join(P.archive, 'handoffs', f);
    const prev = L.read(dest, `# Archived handoff notes — ${f.replace(/\.md$/, '')}\n\n`);
    const [hdr, ...rest] = [prev.slice(0, prev.indexOf('\n\n') + 2), prev.slice(prev.indexOf('\n\n') + 2)];
    L.atomicWrite(dest, hdr + move.join('') + rest.join(''));       // newest first
  }
}

function splitHandoffs(text) {
  const i = text.indexOf('## Handoff notes');
  if (i < 0) return null;
  const head = text.slice(0, i), rest = text.slice(i), nl = rest.indexOf('\n');
  const hdr = rest.slice(0, nl + 1), after = rest.slice(nl + 1);
  const first = after.search(/^### /m);
  return {
    head, hdr,
    pre: first < 0 ? after : after.slice(0, first),
    notes: first < 0 ? [] : after.slice(first).split(/(?=^### )/m).filter(s => s.trim()),
  };
}

module.exports = { archive, splitHandoffs, ACTIVITY_DAYS, TICKET_DAYS, KEEP_HANDOFFS };
