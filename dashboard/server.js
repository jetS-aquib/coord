'use strict';
// Read-only coordination dashboard. No deps, localhost only, GET only.
//   node .coord/dashboard/server.js [port]
const http = require('http'), path = require('path');
const L = require('../bin/lib.js'), R = require('../bin/rules.js');
const { P } = L;

const PORT = Number(process.argv[2] || process.env.PORT || 4747);
const STALE_MIN = 30;

const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const ago = iso => {
  if (!iso) return null;
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (!isFinite(m)) return null;
  return m < 1 ? 'just now' : m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago`;
};

const tickets = () => L.lsMd(P.tickets).map(f => L.parse(L.read(path.join(P.tickets, f))).fm);

function board() {
  const beat = L.lastActivityPerRepo();
  L.ensureStatusFiles();                         // onboarded repos only
  return L.onboarded().map(r => {
    const s = L.readStatus(r);
    const last = beat[r];
    const mins = last ? (Date.now() - new Date(last).getTime()) / 60000 : Infinity;
    const e = L.regGet(r) || {};
    const here = L.repos().includes(r);
    return { ...s, heartbeat: last, stale: s.status === 'working' && mins > STALE_MIN, stack: e.stack, deps: e.depends_on || [], here };
  });
}

function page() {
  const probs = R.check();                       // ponytail: re-run per request; fine at this tree size
  const errs = probs.filter(p => p.level === 'error');
  const t = tickets();
  const waiting = t.filter(x => ['open', 'review'].includes(x.status));
  const active = t.filter(x => ['approved', 'in_progress'].includes(x.status));
  const closed = t.filter(x => ['done', 'rejected'].includes(x.status))
    .sort((a, b) => String(b.updated).localeCompare(String(a.updated))).slice(0, 10);

  const decisions = L.lsMd(P.decisions).filter(f => f !== 'index.md')
    .map(f => L.parse(L.read(path.join(P.decisions, f))).fm)
    .filter(d => d.status === 'active')
    .sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 8);

  const row = x => `<tr>
    <td><b>${esc(x.repo)}</b></td><td>${esc(x.task || '—')}</td>
    <td class="s s-${esc(x.status).replace(/\s+/g, '-')}">${esc(x.status)}${x.stale ? ' <span class="stale">STALE</span>' : ''}</td>
    <td>${esc(x.blockers || '—')}</td>
    <td class="dim">${esc(ago(x.heartbeat) || 'no activity')}</td></tr>
    <tr class="sub"><td colspan="5" class="dim">${esc(x.stack || '—')}${x.deps.length ? ' · depends on ' + esc(x.deps.join(', ')) : ''}${x.here ? '' : ' · not cloned on this machine'}</td></tr>`;

  const tix = (arr, empty) => arr.length ? arr.map(x => `<div class="t ${esc(x.status)}">
      <span class="tag">${esc(x.status)}</span> <b>${esc(x.id)}</b>
      <span class="dim">${esc(x.from)} → ${esc(x.to)}</span> ${esc(x.title)}
      ${(x.decisions || []).length ? `<span class="dim">[${esc((x.decisions || []).join(' '))}]</span>` : ''}
      <span class="dim">${esc(ago(x.updated) || '')}</span></div>`).join('') : `<p class="dim">${empty}</p>`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>jetKreate coord</title>
<meta http-equiv="refresh" content="5"><style>
:root{color-scheme:dark light}
body{font:13px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;margin:2rem auto;max-width:64rem;padding:0 1rem}
h1{font-size:1.1rem;letter-spacing:.15em;text-transform:uppercase}
h2{margin:2rem 0 .5rem;font-size:.8rem;text-transform:uppercase;letter-spacing:.12em;opacity:.55}
table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #8883;padding:.35rem .6rem;text-align:left;vertical-align:top}
th{font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;opacity:.5}
.s-working{color:#3b82f6}.s-blocked{color:#ef4444}.s-waiting-on-human{color:#f59e0b}.s-idle{opacity:.6}
.stale{background:#ef4444;color:#fff;padding:0 .3rem;border-radius:3px;font-size:.7rem}
.banner{background:#ef4444;color:#fff;padding:.6rem .9rem;border-radius:4px;margin:1rem 0}
.banner ul{margin:.3rem 0 0;padding-left:1.1rem}
.t{border-left:3px solid #8884;padding:.2rem .7rem;margin:.25rem 0}
.t.open{border-color:#f59e0b}.t.review{border-color:#a855f7}.t.in_progress{border-color:#3b82f6}
.t.approved{border-color:#3b82f6}.t.done{border-color:#22c55e}.t.rejected{border-color:#ef4444}
.tag{text-transform:uppercase;font-size:.68rem;letter-spacing:.08em;opacity:.75}
.sub td{border:0;padding-top:0;font-size:.75rem}code{opacity:.8}
.tool{font-size:.75rem}.t-claude-code{color:#a855f7}.t-copilot{color:#3b82f6}.t-both{color:#22c55e}.t-other{opacity:.6}
.dim{opacity:.55}pre{white-space:pre-wrap;font-size:.8rem;opacity:.8;margin:0}
</style></head><body>
<h1>jetKreate</h1>
${errs.length ? `<div class="banner"><b>coord check found ${errs.length} problem${errs.length > 1 ? 's' : ''}</b><ul>${errs.slice(0, 8).map(p => `<li>${esc(p.where)}: ${esc(p.msg)}</li>`).join('')}</ul></div>` : ''}

<h2>Board</h2>
<table><tr><th>Repo</th><th>Current task</th><th>Status</th><th>Blockers</th><th>Last activity</th></tr>${board().map(row).join('')}</table>

${(() => { const d = L.discovered(), off = L.offboarded();
  if (!d.length && !off.length) return '';
  return `<h2>Not onboarded</h2>${d.map(r => `<div class="t open"><span class="tag">discovered</span> <b>${esc(r)}</b> <span class="dim">a git repo with no registry entry — run <code>coord onboard ${esc(r)} --preflight</code>, or say "onboard ${esc(r)}"</span></div>`).join('')}${off.map(r => `<div class="t rejected"><span class="tag">offboarded</span> <b>${esc(r)}</b> <span class="dim">history kept in archive/</span></div>`).join('')}`;
})()}

${(() => {
  const crew = L.whosAround();
  if (!crew.length) return '';
  const you = L.me();
  // People, not repos: one person can be in several repos and one repo can have several people.
  return `<h2>Who's around</h2><table><tr><th>Who</th><th>Tool</th><th>Last seen in</th><th>When</th></tr>${
    crew.map(p => `<tr><td><b>${esc(p.name)}</b>${p.name === you ? ' <span class="dim">(you)</span>' : ''}</td>
      <td class="tool t-${esc(p.tool)}">${esc(p.tool)}</td>
      <td>${esc(p.repo || '—')}</td>
      <td class="dim">${esc(ago(p.ts) || 'no activity yet')}</td></tr>`).join('')}</table>`;
})()}

<h2>Waiting on you — ${waiting.length}</h2>${tix(waiting, 'Nothing needs your call.')}
<h2>In flight — ${active.length}</h2>${tix(active, 'Nothing in progress.')}
<h2>Recently closed</h2>${tix(closed, 'Nothing closed yet.')}

<h2>Active decisions</h2>${decisions.length ? decisions.map(d => `<div class="t"><b>${esc(d.id)}</b> ${esc(d.title)} <span class="dim">${esc(d.date)} · ${esc((d.repos || []).join(' '))} ${esc((d.tickets || []).join(' '))}</span></div>`).join('') : '<p class="dim">No decisions recorded.</p>'}

<h2>Today</h2><pre>${esc(L.activityLines(50).join('\n')) || 'no activity today'}</pre>

<p class="dim">read-only · refreshes every 5s · last archive: ${esc(L.state().lastArchive || 'never')}${probs.length && !errs.length ? ` · ${probs.length} warning(s)` : ''}</p>
</body></html>`;
}

http.createServer((req, res) => {
  if (req.method !== 'GET') return res.writeHead(405).end();
  let body;
  try { body = page(); } catch (e) { body = `<pre>dashboard error:\n${esc(e.stack)}</pre>`; }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(body);
}).listen(PORT, '127.0.0.1', () => console.log(`coord dashboard: http://127.0.0.1:${PORT}`));
