'use strict';
// Ticket / decision / status semantics: templates, the lifecycle, and `check`.
const path = require('path'), fs = require('fs');
const L = require('./lib.js');
const { P } = L;

const TICKET_SECTIONS = ['Request', 'Reason', 'Related files', 'Acceptance criteria', 'Test steps', 'Thread'];
const DECISION_SECTIONS = ['Context', 'Options considered', 'Decision', 'Reason', 'Consequences'];
const EMPTY = s => !s || /^[—\-\s]*$/.test(s);

/* ---------- templates ---------- */
const ticketBody = f => `## Request

${f.request || '—'}

## Reason

${f.reason || '—'}

## Related files

${f.files || '—'}

## Acceptance criteria

${f.acceptance || '—'}

## Test steps

${f.test || '—'}

## Thread
`;

const decisionBody = f => `## Context

${f.context || '—'}

## Options considered

${f.options || '—'}

## Decision

${f.decision || '—'}

## Reason

${f.reason || '—'}

## Consequences

${f.consequences || '—'}
`;

/* ---------- thread (append-only) ---------- */
function addThread(file, who, text) {
  const cur = L.read(file).replace(/\s*$/, '\n');
  L.atomicWrite(file, `${cur}${L.nowISO()} ${who}: ${text}\n`);
}

/* ---------- create ---------- */
function newTicket({ from, to, title, request, reason, files, acceptance, test }) {
  const who = L.actor();
  const r = L.createWithId(L.TICKET_PREFIX, P.tickets, L.slug(title), id => L.stringify(
    { id, title, from, to, status: 'open', created: L.nowISO(), updated: L.nowISO(), decisions: [] },
    ticketBody({ request, reason, files, acceptance, test })));
  addThread(r.file, who, `created ticket, status: - -> open`);
  return r;
}

function newDecision({ title, context, options, decision, reason, consequences, repos = [], tickets = [] }) {
  const r = L.createWithId('D', P.decisions, L.slug(title), id => L.stringify(
    { id, title, date: L.day(), status: 'active', superseded_by: '', repos, tickets },
    decisionBody({ context, options, decision, reason, consequences })));
  for (const t of tickets) {                       // keep the link bidirectional
    const tk = L.loadTicket(t);
    if (!tk) continue;
    const ds = new Set([...(tk.fm.decisions || []), r.id]);
    L.atomicWrite(tk.file, L.stringify({ ...tk.fm, decisions: [...ds], updated: L.nowISO() }, tk.body));
    addThread(tk.file, L.actor(), `linked decision ${r.id} (${title})`);
  }
  rebuildDecisionIndex();
  return r;
}

function supersede(oldId, newId) {
  const o = L.findDecision(oldId), n = L.findDecision(newId);
  if (!o) throw new Error(`no such decision: ${oldId}`);
  if (!n) throw new Error(`no such decision: ${newId}`);
  const { fm, body } = L.parse(L.read(o));
  if (fm.status === 'superseded') throw new Error(`${oldId} is already superseded by ${fm.superseded_by}`);
  L.atomicWrite(o, L.stringify({ ...fm, status: 'superseded', superseded_by: newId }, body));  // only mutation a decision allows
  rebuildDecisionIndex();
}

function rebuildDecisionIndex() {
  const rows = L.lsMd(P.decisions).filter(f => f !== 'index.md').map(f => {
    const { fm } = L.parse(L.read(path.join(P.decisions, f)));
    const st = fm.status === 'superseded' ? `superseded by ${fm.superseded_by}` : 'active';
    return `| ${fm.id} | ${fm.title} | ${fm.date} | ${st} | ${(fm.repos || []).join(' ')} | ${(fm.tickets || []).join(' ')} |`;
  });
  L.atomicWrite(path.join(P.decisions, 'index.md'),
    `# Decisions\n\n| id | title | date | status | repos | tickets |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}${rows.length ? '\n' : ''}`);
}

/* ---------- lifecycle ---------- */
function transition(id, to, note = '') {
  const t = L.loadTicket(id);
  if (!t) throw new Error(`no such ticket: ${id}`);
  if (t.archived) throw new Error(`${id} is archived and cannot change`);
  const from = t.fm.status;
  const allowed = L.TRANSITIONS[from] || {};
  if (!allowed[to]) throw new Error(`invalid transition ${from} -> ${to} (allowed: ${Object.keys(allowed).join(', ') || 'none'})`);
  if (allowed[to] === 'human' && !L.isHuman()) throw new Error(`${from} -> ${to} is the human's call. Ask them to run: coord ${to === 'approved' ? 'approve' : to} ${id}`);
  if (to === 'review' && EMPTY(t.sec['Test steps'])) throw new Error(`${id} needs Test steps filled in before review`);
  const fm = { ...t.fm, status: to, updated: L.nowISO() };
  if (to === 'done' || to === 'rejected') fm.closed = L.day();
  L.atomicWrite(t.file, L.stringify(fm, t.body));
  addThread(t.file, L.actor(), `status: ${from} -> ${to}${note ? ' — ' + note : ''}`);
  return { file: t.file, from, to };
}

/* ---------- what was being worked on, and when ---------- */
// The thread timestamps every status change, so we can reconstruct which tickets were
// live for a repo at any moment. That is how `coord why` answers for a commit whose
// message carries no ticket ID.
function ticketsActiveAt(repo, when) {
  const t = new Date(when).getTime();
  if (!isFinite(t)) return [];
  const out = [];
  for (const dir of L.idDirs(L.TICKET_PREFIX)) for (const f of L.lsMd(dir)) {
    const { fm, body } = L.parse(L.read(path.join(dir, f)));
    if (fm.to !== repo && fm.from !== repo) continue;
    const moves = [...(L.sections(body).Thread || '').matchAll(/^(\S+) .*?status: (\S+) -> (\S+)/gm)]
      .map(m => ({ at: new Date(m[1]).getTime(), to: m[3] }))
      .filter(m => isFinite(m.at));
    if (!moves.length) continue;
    // the state the ticket was in at time t
    let state = null;
    for (const m of moves) { if (m.at <= t) state = m.to; else break; }
    if (!['approved', 'in_progress', 'review'].includes(state)) continue;
    // Both directions can explain a line: the repo doing the work, and the repo that
    // asked and may have stubbed its own side. Say which, rather than implying either.
    out.push({ fm, state, role: fm.to === repo ? 'work for this repo' : 'this repo asked for it' });
  }
  return out.sort((a, b) => (a.role === 'work for this repo' ? -1 : 1) - (b.role === 'work for this repo' ? -1 : 1));
}

/* ---------- check ---------- */
function check() {
  const out = [];
  const err = (where, msg) => out.push({ level: 'error', where, msg });
  const warn = (where, msg) => out.push({ level: 'warn', where, msg });
  const info = (where, msg) => out.push({ level: 'info', where, msg });
  const repos = L.onboarded(), repoSet = new Set(repos);
  const ticketIds = new Set(), decisionIds = new Set();

  // registry
  const onDisk = new Set(L.repos());
  const notCloned = [];
  for (const e of L.registry()) {
    const where = `repos.json:${e.name}`;
    for (const k of ['name', 'path', 'status', 'onboarded']) if (!e[k]) err(where, `missing field "${k}"`);
    if (!['active', 'offboarded'].includes(e.status)) err(where, `status "${e.status}" must be active or offboarded`);
    if (e.status === 'active' && !onDisk.has(e.name)) {
      // Not cloned here is normal — you only clone what you work on. Only flag the case
      // where something IS at that path but is not a git repo, which is a real mix-up.
      if (L.exists(path.join(P.root, e.path))) err(where, `${e.path} exists but is not a git repo`);
      else notCloned.push(e.name);
    }
    for (const d of e.depends_on || []) if (!repoSet.has(d) && d !== e.name) warn(where, `depends_on "${d}" is not an active repo`);
  }
  for (const d of L.discovered()) warn(`${d}/`, 'git repo present but not onboarded — run: coord onboard ' + d + ' --preflight');
  if (notCloned.length) info('this machine', `${notCloned.length} active repo(s) not cloned here: ${notCloned.join(', ')} — clone them beside the board if you need them`);

  // status files
  for (const r of repos) if (!L.exists(path.join(P.status, `${r}.md`))) err(`status/${r}.md`, 'missing status file for an active repo');
  for (const f of L.lsMd(P.status)) {
    const repo = f.replace(/\.md$/, '');
    if (!repoSet.has(repo)) { warn(`status/${f}`, L.regGet(repo) ? 'repo is offboarded — run coord archive' : 'not an onboarded repo'); continue; }
    const s = L.readStatus(repo);
    if (!L.REPO_STATUS.includes(s.status)) err(`status/${f}`, `Status "${s.status}" not one of: ${L.REPO_STATUS.join(' / ')}`);
    if (!s.updated) err(`status/${f}`, 'missing Last updated');
    if (s.notes > 5) warn(`status/${f}`, `${s.notes} handoff notes — run "coord archive" to trim to 5`);
  }

  // decisions
  const decFiles = L.lsMd(P.decisions).filter(f => f !== 'index.md');
  const decTickets = new Map();
  for (const f of decFiles) {
    const { fm, body } = L.parse(L.read(path.join(P.decisions, f)));
    const where = `decisions/${f}`;
    if (!fm.id || !f.startsWith(fm.id + '-')) err(where, `id "${fm.id}" does not match filename`);
    decisionIds.add(fm.id);
    if (!['active', 'superseded'].includes(fm.status)) err(where, `status "${fm.status}" must be active or superseded`);
    if (fm.status === 'superseded' && !fm.superseded_by) err(where, 'superseded but superseded_by is empty');
    if (fm.superseded_by && !L.findDecision(fm.superseded_by)) err(where, `superseded_by ${fm.superseded_by} does not exist`);
    const sec = L.sections(body);
    for (const s of DECISION_SECTIONS) if (!(s in sec)) err(where, `missing section "${s}"`);
    for (const r of fm.repos || []) if (!repoSet.has(r)) warn(where, `unknown repo "${r}"`);
    decTickets.set(fm.id, fm.tickets || []);
  }

  // tickets (active + archived, so links resolve either way)
  for (const dir of L.idDirs(L.TICKET_PREFIX)) for (const f of L.lsMd(dir)) {
    const file = path.join(dir, f), where = path.relative(P.coord, file);
    const { fm, body } = L.parse(L.read(file));
    const sec = L.sections(body);
    if (!fm.id || !f.startsWith(fm.id + '-')) { err(where, `id "${fm.id}" does not match filename`); continue; }
    if (ticketIds.has(fm.id)) err(where, `duplicate ticket id ${fm.id}`);
    ticketIds.add(fm.id);
    if (!L.TICKET_STATUS.includes(fm.status)) err(where, `status "${fm.status}" not one of: ${L.TICKET_STATUS.join(', ')}`);
    for (const s of TICKET_SECTIONS) if (!(s in sec)) err(where, `missing section "${s}"`);
    const closedT = ['done', 'rejected'].includes(fm.status);
    for (const k of ['from', 'to']) if (fm[k] && fm[k] !== 'human' && !repoSet.has(fm[k])) {
      (closedT || L.regGet(fm[k]) ? warn : err)(where, `${k}: "${fm[k]}" is not an onboarded repo`);
    }
    if (fm.status === 'review' && EMPTY(sec['Test steps'])) err(where, 'in review with empty Test steps');
    // replay the thread's recorded transitions
    let st = null;
    for (const m of (sec.Thread || '').matchAll(/status:\s*(\S+)\s*->\s*(\S+)/g)) {
      const [, a, b] = m;
      if (st !== null && a !== st) err(where, `thread jumps from ${st} to ${a} with no recorded transition`);
      if (a !== '-' && !(L.TRANSITIONS[a] || {})[b]) err(where, `thread records illegal transition ${a} -> ${b}`);
      st = b;
    }
    if (st && st !== fm.status) err(where, `frontmatter says ${fm.status} but the thread ends at ${st}`);
    // links both ways
    for (const d of fm.decisions || []) {
      if (!decisionIds.has(d)) { err(where, `links decision ${d} which does not exist`); continue; }
      if (!(decTickets.get(d) || []).includes(fm.id)) err(where, `links ${d}, but ${d} does not list ${fm.id}`);
    }
  }
  for (const [d, ts] of decTickets) for (const t of ts) {
    if (!ticketIds.has(t)) { err(`decisions/${d}`, `links ticket ${t} which does not exist`); continue; }
    const tk = L.loadTicket(t);
    if (tk && !(tk.fm.decisions || []).includes(d)) err(`decisions/${d}`, `links ${t}, but ${t} does not list ${d}`);
  }

  // decision index in sync
  const idx = L.read(path.join(P.decisions, 'index.md'));
  for (const d of decisionIds) if (!idx.includes(d)) err('decisions/index.md', `${d} is missing from the index — run any coord decide/supersede to rebuild`);

  // contracts
  for (const f of L.lsMd(P.contracts).filter(f => f !== 'README.md')) {
    const { fm } = L.parse(L.read(path.join(P.contracts, f)));
    if (!fm.owner) err(`contracts/${f}`, 'missing frontmatter `owner: <repo>`');
    else if (!repoSet.has(fm.owner)) err(`contracts/${f}`, `owner "${fm.owner}" is not an onboarded repo`);
  }
  return out;
}

module.exports = { ticketsActiveAt, TICKET_SECTIONS, DECISION_SECTIONS, EMPTY, newTicket, newDecision, supersede, transition, addThread, rebuildDecisionIndex, check, ticketBody, decisionBody };
