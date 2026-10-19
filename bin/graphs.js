'use strict';
// A knowledge graph of a repo is expensive to build and cheap to read. coord does not
// build one: the tools that do are agent-driven pipelines with model calls in the middle,
// and depending on one would break the promise that coord is plain node and git with
// nothing to install. What coord does is the part no single-repo tool can: take the
// readable half of somebody's build, put it on the board with the commit it was built
// from, and hand it to everyone else — including the people whose editor cannot run the
// tool at all.
//
// The heavy half (graph.json, graph.html, the cache) stays on the machine that built it.
// It is 2.26x the size of the source, it is rewritten whole on every rebuild, and git
// keeps every version of it forever. The board is kilobytes of markdown and stays that way.
const fs = require('fs'), path = require('path');
const L = require('./lib.js');

const dir = repo => path.join(L.P.coord, 'graphs', repo);
const OUT = 'graphify-out';                       // what the tool leaves inside the repo

// A graph describes the code as it was at one commit. Said out loud, that is useful
// context; left unsaid, it is a confident answer about code that changed three weeks ago,
// which is the thing this whole tool exists to reduce.
function behind(repo, sha) {
  if (!sha) return null;
  const r = L.sh('git', ['rev-list', '--count', `${sha}..HEAD`], L.repoDir(repo));
  return r.ok && /^\d+$/.test(r.out) ? Number(r.out) : null;
}

function built(repo) {
  try { return JSON.parse(L.read(path.join(dir(repo), 'built.json'), '{}')); } catch { return {}; }
}

// Everything worth knowing about one repo's graph, for the board and for the briefing.
function statusOf(repo) {
  const b = built(repo);
  const onBoard = L.exists(path.join(dir(repo), 'REPORT.md'));
  const local = L.exists(path.join(L.repoDir(repo), OUT, 'GRAPH_REPORT.md'));
  return {
    repo, onBoard, local,
    builtAt: b.built || '', commit: b.commit || '', by: b.by || '',
    behind: onBoard ? behind(repo, b.commit) : null,
    tokens: b.tokens || 0,
  };
}

const status = () => L.onboarded().map(statusOf);

/* ---------- bringing one onto the board ---------- */

// Only the readable half, and only if it really is small. A guard rather than a guess:
// if a future version of the tool starts writing something enormous into the report, the
// board should refuse it rather than carry it forever.
const MAX_KB = 2048;

function sizeOfTree(p) {
  let n = 0;
  const walk = d => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f); else { try { n += fs.statSync(f).size; } catch { /* gone */ } }
    }
  };
  try { walk(p); } catch { /* missing */ }
  return n;
}

function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyTree(a, b);
    else if (e.name.endsWith('.md')) fs.copyFileSync(a, b);   // markdown only: both agents read it, nothing else needs a viewer
  }
}

function importGraph(repo) {
  if (!L.isOnboarded(repo)) throw new Error(`${repo} is not onboarded — coord repos`);
  const src = path.join(L.repoDir(repo), OUT);
  const report = path.join(src, 'GRAPH_REPORT.md');
  if (!L.exists(report)) throw new Error(`no graph in ${repo}/${OUT}/ — build one first:  ${buildHint(repo)}`);

  const wiki = path.join(src, 'wiki');
  const kb = Math.round((sizeOfTree(wiki) + fs.statSync(report).size) / 1024);
  if (kb > MAX_KB) {
    throw new Error(`that is ${kb} KB of markdown — too much for a board that syncs every few minutes. ` +
      `Keep it in ${repo}/${OUT}/ and share the report alone.`);
  }

  const to = dir(repo);
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(to, { recursive: true });
  fs.copyFileSync(report, path.join(to, 'REPORT.md'));
  let pages = 0;
  if (L.exists(wiki)) { copyTree(wiki, path.join(to, 'wiki')); pages = sizeOfTree(path.join(to, 'wiki')) ? fs.readdirSync(path.join(to, 'wiki')).length : 0; }

  const head = L.sh('git', ['rev-parse', 'HEAD'], L.repoDir(repo));
  let cost = {};
  try { cost = JSON.parse(L.read(path.join(src, 'cost.json'), '{}')); } catch { /* optional */ }
  L.atomicWrite(path.join(to, 'built.json'), JSON.stringify({
    repo,
    commit: head.ok ? head.out : '',
    built: L.nowISO(),
    by: L.me() || L.actor(),
    tokens: cost.total_input_tokens || 0,
    source: OUT,
  }, null, 2) + '\n');

  L.logActivity(repo, 'graph', `imported (${kb} KB${pages ? `, ${pages} pages` : ''})`);
  return { repo, kb, pages, commit: head.ok ? head.out.slice(0, 7) : '?' };
}

// What to run to build one. coord does not run it: the pipeline is agent-driven and has
// model calls in it, so the person whose tokens it spends should be the one asking for it.
const buildHint = repo => `ask your agent: "graphify ${repo}" (then: coord graph ${repo})`;

module.exports = { status, statusOf, importGraph, buildHint, dir, MAX_KB };
