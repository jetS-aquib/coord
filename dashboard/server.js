'use strict';
// Read-only coordination dashboard. No deps, localhost only, GET only.
//   node .coord/dashboard/server.js [port]
// Layout: a KPI row answers "is anything on me?" at a glance; everything else is
// secondary. Empty sections collapse to one line instead of eating a screen.
const http = require('http'), path = require('path');
const L = require('../bin/lib.js'), R = require('../bin/rules.js');
const { P } = L;

const PORT = Number(process.argv[2] || process.env.PORT || 4747);
const STALE_MIN = 30;

const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
function ago(iso) {
  if (!iso) return null;
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (!isFinite(m)) return null;
  return m < 1 ? 'now' : m < 60 ? `${m}m` : m < 1440 ? `${Math.floor(m / 60)}h` : `${Math.floor(m / 1440)}d`;
}

const CSS = `:root{
  --plane:#0d0d0d; --surface:#1a1a19; --ink:#f0efec; --ink2:#c3c2b7; --muted:#898781; --line:#2c2c2a;
  --good:#0ca30c; --warning:#fab219; --serious:#ec835a; --critical:#d03b3b; --accent:#6a9bf4;
}
@media (prefers-color-scheme: light){:root:not([data-theme="dark"]){
  --plane:#f9f9f7; --surface:#fcfcfb; --ink:#0b0b0b; --ink2:#52514e; --muted:#898781; --line:#e1e0d9;
}}
*{box-sizing:border-box}
body{background:var(--plane);color:var(--ink);margin:0;padding:1.6rem 1rem 3rem;
  font:13px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace}
.wrap{max-width:72rem;margin:0 auto}
header{display:flex;align-items:baseline;gap:1rem;flex-wrap:wrap;margin-bottom:1.1rem}
h1{font-size:1rem;letter-spacing:.22em;margin:0;font-weight:700}
.pill{font-size:.75rem;letter-spacing:.06em;padding:.18rem .6rem;border-radius:999px;border:1px solid currentColor}
.p-good{color:var(--good)}.p-warning{color:var(--warning)}.p-serious{color:var(--serious)}.p-critical{color:var(--critical)}
.meta{margin-left:auto;color:var(--muted);font-size:.75rem}

.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem;margin-bottom:1.4rem}
.tile{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:.7rem .85rem}
.tile .n{font-size:2rem;line-height:1.1;font-variant-numeric:tabular-nums;color:var(--muted)}
.tile .k{font-size:.68rem;letter-spacing:.11em;text-transform:uppercase;color:var(--muted);margin-top:.15rem}
.tile.on .n{color:var(--ink)}
.tile.on.t-warning{border-color:var(--warning)}.tile.on.t-warning .n{color:var(--warning)}
.tile.on.t-critical{border-color:var(--critical)}.tile.on.t-critical .n{color:var(--critical)}
.tile.on.t-accent{border-color:var(--accent)}.tile.on.t-accent .n{color:var(--accent)}

.cols{display:grid;grid-template-columns:1.45fr 1fr;gap:1.6rem;align-items:start}
@media (max-width:880px){.cols{grid-template-columns:1fr}.kpis{grid-template-columns:repeat(2,1fr)}}
section{margin-bottom:1.5rem}
h2{font-size:.68rem;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);margin:0 0 .5rem;font-weight:600}
table{border-collapse:collapse;width:100%}
td,th{padding:.33rem .5rem;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
tr:last-child td{border-bottom:0}
th{font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600}
.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
table.tix td:nth-child(1){width:4.5rem;white-space:nowrap}
table.tix td:nth-child(2){width:7.5rem;white-space:nowrap}
table.tix td:nth-child(4){width:3rem}
table.feed td:nth-child(1){width:3rem}
table.feed td:nth-child(2),table.feed td:nth-child(3){white-space:nowrap;padding-right:1rem}
.dim{color:var(--muted)}.sm{font-size:.72rem}
.none{color:var(--muted);margin:0;font-size:.8rem}
.chip{font-size:.65rem;letter-spacing:.06em;text-transform:uppercase;padding:.1rem .4rem;border-radius:3px;border:1px solid currentColor;white-space:nowrap}
.c-open{color:var(--warning)}.c-review{color:var(--accent)}.c-approved{color:var(--accent)}
.c-in_progress{color:var(--accent)}.c-done{color:var(--good)}.c-rejected{color:var(--critical)}
.s-working{color:var(--accent)}.s-blocked{color:var(--critical)}.s-waiting{color:var(--warning)}.s-idle{color:var(--muted)}
.tag{font-size:.6rem;letter-spacing:.07em;text-transform:uppercase;padding:.05rem .3rem;border-radius:3px;
  background:var(--critical);color:#fff;margin-left:.35rem}
.kanban{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.55rem;align-items:start}
@media (max-width:900px){.kanban{grid-template-columns:repeat(2,minmax(0,1fr))}}
.kcol{min-width:0}
.khead{font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
  padding:.25rem .45rem;border-bottom:1px solid var(--line);margin-bottom:.4rem;display:flex;gap:.4rem}
.khead .kn{margin-left:auto;font-variant-numeric:tabular-nums}
.khead.over{color:var(--critical);border-bottom-color:var(--critical)}
.khead.done{color:var(--good)}
.card{background:var(--surface);border:1px solid var(--line);border-radius:5px;padding:.4rem .5rem;margin-bottom:.4rem}
.card.aging{border-left:2px solid var(--warning)}
.card .cid{display:flex;font-size:.7rem;color:var(--muted)}
.card .cage{margin-left:auto;font-variant-numeric:tabular-nums}
.card.aging .cage{color:var(--warning)}
.card .ct{font-size:.78rem;line-height:1.35;margin:.15rem 0 .2rem;word-break:break-word}
.feed td{border:0;padding:.15rem .5rem .15rem 0;font-size:.76rem}
.x{color:var(--muted);font-size:.7rem}
footer{margin-top:1.5rem;color:var(--muted);font-size:.72rem}
code{color:var(--ink2)}
nav{display:flex;gap:.1rem;margin:0 0 1.1rem;flex-wrap:wrap}
nav a{color:var(--muted);text-decoration:none;font-size:.72rem;letter-spacing:.07em;text-transform:uppercase;
  padding:.25rem .65rem;border:1px solid var(--line);border-radius:999px}
nav a:hover{color:var(--ink)}
nav a.on{color:var(--ink);border-color:var(--ink2)}
.note{background:var(--surface);border:1px solid var(--line);border-left:2px solid var(--accent);
  border-radius:4px;padding:.5rem .7rem;margin:0 0 .5rem}
.note .when{color:var(--muted);font-size:.7rem}
`;

// One chrome for every view: nav, headline pill, footer.
function shell(active, headline, body, meta, warnCount) {
  const links = [['team', '/', 'Team']]
    .concat(L.people().map(p => [p.name, `/who/${encodeURIComponent(p.name)}`, p.name + (p.name === L.me() ? ' (you)' : '')]));
  return `<!doctype html><html><head><meta charset="utf-8"><title>jetKreate${active === 'team' ? '' : ' · ' + esc(active)}</title>
<meta http-equiv="refresh" content="5"><style>${CSS}</style></head><body><div class="wrap">
<header>
  <h1>JETKREATE</h1>
  <span class="pill p-${headline.tone}">${esc(headline.text)}</span>
  <span class="meta">${esc(meta)}</span>
</header>
<nav>${links.map(([k, href, label]) =>
  `<a href="${esc(href)}"${k === active ? ' class="on"' : ''}>${esc(label)}</a>`).join('')}</nav>
${body}
<footer>read-only · refreshes every 5s${warnCount ? ` · ${warnCount} warning(s)` : ''}</footer>
</div></body></html>`;
}

const tickets = () => ticketsFull().map(t => t.fm);

// The thread records every "status: a -> b" with a timestamp, so time-in-column is exact
// rather than guessed from `updated`. That is the whole point of card aging.
function ticketsFull() {
  return L.lsMd(P.tickets).map(f => {
    const { fm, body } = L.parse(L.read(path.join(P.tickets, f)));
    const sec = L.sections(body);
    const moves = [...(sec.Thread || '').matchAll(/^(\S+) .*?status: (\S+) -> (\S+)/gm)];
    const lastMove = moves.length ? moves[moves.length - 1][1] : fm.updated;
    return { fm, enteredAt: lastMove || fm.updated };
  });
}

// Soft WIP limit, alert not hard stop: with four people a fifth in-progress ticket means
// someone has two. Aging thresholds differ per column because the norms differ --
// "open" waits on a human, "in_progress" is real work.
const COLUMNS = [
  { key: 'open',        title: 'Open',        ageDays: 1 },
  { key: 'approved',    title: 'Approved',    ageDays: 2 },
  { key: 'in_progress', title: 'In progress', ageDays: 5, wip: () => Math.max(2, L.people().length) },
  { key: 'review',      title: 'Review',      ageDays: 1 },
];

function board() {
  const beat = L.lastActivityPerRepo();
  L.ensureStatusFiles();
  return L.onboarded().map(r => {
    const s = L.readStatus(r);
    const last = beat[r];
    const mins = last ? (Date.now() - new Date(last).getTime()) / 60000 : Infinity;
    const e = L.regGet(r) || {};
    return { ...s, heartbeat: last, stale: s.status === 'working' && mins > STALE_MIN,
      stack: e.stack, deps: e.depends_on || [], here: L.repos().includes(r), mins };
  }).sort((a, b) => rank(a) - rank(b) || a.mins - b.mins);
}
const rank = r => (r.status === 'blocked' ? 0 : r.status === 'working' ? 1 : r.status === 'waiting on human' ? 2 : 3);

// Consecutive identical events collapse: twelve session-stops are one line, not twelve.
function activityFeed(limit = 14, who = null) {
  const rows = [];
  for (const a of L.recentActivity(who ? 7 : 1).reverse()) {
    if (!a.ts) continue;
    if (who && a.who !== who) continue;
    const extra = a.line.split('\t').slice(4).join(' ');
    const key = `${a.repo}|${a.event}|${a.who}|${extra}`;
    const top = rows[rows.length - 1];
    if (top && top.key === key) { top.n++; continue; }
    rows.push({ key, n: 1, ts: a.ts, repo: a.repo, event: a.event, who: a.who, extra });
    if (rows.length >= limit) break;
  }
  return rows;
}

// The board as a board. Columns are the lifecycle; the value over a flat list is seeing
// where work piles up and how long each card has sat where it is.
function kanban() {
  const all = ticketsFull();
  const live = all.filter(t => !['done', 'rejected'].includes(t.fm.status));
  const closed = all.filter(t => ['done', 'rejected'].includes(t.fm.status))
    .sort((a, b) => String(b.fm.updated).localeCompare(String(a.fm.updated))).slice(0, 4);
  if (!all.length) return `<section><h2>Board</h2><p class="none">No tickets yet. <code>coord new --from &lt;repo&gt; --to &lt;repo&gt; --title "..."</code></p></section>`;

  const days = iso => (Date.now() - new Date(iso).getTime()) / 86400000;

  const card = (t, col) => {
    const age = days(t.enteredAt);
    const old = col && age > col.ageDays;
    return `<article class="card${old ? ' aging' : ''}">
      <div class="cid"><b>${esc(t.fm.id)}</b><span class="cage">${esc(ago(t.enteredAt) || '')}</span></div>
      <div class="ct">${esc(t.fm.title)}</div>
      <div class="dim sm">${esc(t.fm.from)} → ${esc(t.fm.to)}${(t.fm.decisions || []).length ? ' · ' + esc(t.fm.decisions.join(' ')) : ''}</div>
    </article>`;
  };

  const cols = COLUMNS.map(col => {
    const items = live.filter(t => t.fm.status === col.key);
    const limit = col.wip ? col.wip() : null;
    const over = limit && items.length > limit;
    return `<div class="kcol">
      <div class="khead${over ? ' over' : ''}">${esc(col.title)}
        <span class="kn">${items.length}${limit ? `/${limit}` : ''}</span></div>
      ${items.map(t => card(t, col)).join('') || '<p class="none sm">—</p>'}
      ${over ? `<p class="none sm s-blocked">over the WIP limit</p>` : ''}
    </div>`;
  }).join('');

  const closedCol = `<div class="kcol">
    <div class="khead done">Closed <span class="kn">${closed.length}</span></div>
    ${closed.map(t => card(t, null)).join('') || '<p class="none sm">—</p>'}
  </div>`;

  const aging = live.filter(t => {
    const col = COLUMNS.find(c => c.key === t.fm.status);
    return col && days(t.enteredAt) > col.ageDays;
  });

  return `<section><h2>Board${aging.length ? ` <span class="s-blocked">· ${aging.length} sitting too long</span>` : ''}</h2>
    <div class="kanban">${cols}${closedCol}</div></section>`;
}

function teamView() {
  const probs = R.check();
  const errs = probs.filter(p => p.level === 'error');
  const t = tickets();
  const needsYou = t.filter(x => ['open', 'review'].includes(x.status));
  const inFlight = t.filter(x => ['approved', 'in_progress'].includes(x.status));
  const closed = t.filter(x => ['done', 'rejected'].includes(x.status))
    .sort((a, b) => String(b.updated).localeCompare(String(a.updated))).slice(0, 5);
  const rows = board();
  const blocked = rows.filter(r => r.status === 'blocked' || r.stale);
  const working = rows.filter(r => r.status === 'working');
  const crew = L.whosAround();
  const you = L.me();

  const decisions = L.lsMd(P.decisions).filter(f => f !== 'index.md')
    .map(f => L.parse(L.read(path.join(P.decisions, f))).fm)
    .filter(d => d.status === 'active')
    .sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5);

  const headline = errs.length ? { tone: 'critical', text: `${errs.length} problem${errs.length > 1 ? 's' : ''} — run coord check` }
    : needsYou.length ? { tone: 'warning', text: `${needsYou.length} ticket${needsYou.length > 1 ? 's' : ''} waiting on you` }
    : blocked.length ? { tone: 'serious', text: `${blocked.length} repo${blocked.length > 1 ? 's' : ''} blocked or stale` }
    : { tone: 'good', text: 'all clear' };

  const tile = (n, label, tone) =>
    `<div class="tile${n ? ` on t-${tone}` : ''}"><div class="n">${n}</div><div class="k">${esc(label)}</div></div>`;

  const chip = s => `<span class="chip c-${esc(s)}">${esc(s.replace('_', ' '))}</span>`;
  const ticketRow = x => `<tr>
    <td><b>${esc(x.id)}</b></td><td>${chip(x.status)}</td>
    <td>${esc(x.title)}<div class="dim sm">${esc(x.from)} → ${esc(x.to)}${(x.decisions || []).length ? ' · ' + esc(x.decisions.join(' ')) : ''}</div></td>
    <td class="dim num">${esc(ago(x.updated) || '')}</td></tr>`;

  const section = (title, body, empty) =>
    `<section><h2>${esc(title)}</h2>${body || `<p class="none">${esc(empty)}</p>`}</section>`;

  const ticketTable = list => list.length
    ? `<table class="tix">${list.map(ticketRow).join('')}</table>` : '';

  const body = `
<div class="kpis">
  ${tile(needsYou.length, 'waiting on you', 'warning')}
  ${tile(inFlight.length, 'in flight', 'accent')}
  ${tile(blocked.length, 'blocked or stale', 'critical')}
  ${tile(working.length, 'repos working', 'accent')}
</div>

${errs.length ? `<section><h2>Problems</h2><table>${errs.slice(0, 6).map(p => `<tr><td class="s-blocked">${esc(p.where)}</td><td>${esc(p.msg)}</td></tr>`).join('')}</table></section>` : ''}

${kanban()}

<div class="cols">
<div>
  ${section('Repos', `<table><tr><th>Repo</th><th>Status</th><th>Current task</th><th class="num">Seen</th></tr>${
    rows.map(r => `<tr>
      <td><b>${esc(r.repo)}</b>${r.here ? '' : ' <span class="dim sm">not cloned</span>'}</td>
      <td class="s-${esc(r.status).split(' ')[0]}">${esc(r.status)}${r.stale ? '<span class="tag">stale</span>' : ''}</td>
      <td>${esc(r.task && r.task !== '—' ? r.task : '')}${r.blockers && r.blockers !== '—' ? `<div class="sm s-blocked">${esc(r.blockers)}</div>` : ''}</td>
      <td class="num dim">${esc(ago(r.heartbeat) || '—')}</td></tr>`).join('')}</table>`, 'No repos onboarded yet.')}
</div>

<div>
  ${section("Who's around", crew.length ? `<table>${crew.map(p => `<tr>
      <td><b>${esc(p.name)}</b>${p.name === you ? ' <span class="dim sm">you</span>' : ''}<div class="dim sm">${esc(p.tool || '—')}</div></td>
      <td>${esc(p.repo || '—')}<div class="dim sm">${esc(ago(p.ts) ? ago(p.ts) + ' ago' : 'no activity')}</div></td>
    </tr>`).join('')}</table>` : '', 'Nobody on the roster — run coord setup.')}

  ${section('Active decisions', decisions.length ? `<table>${decisions.map(d => `<tr>
      <td><b>${esc(d.id)}</b></td><td>${esc(d.title)}<div class="dim sm">${esc(d.date)}${(d.repos || []).length ? ' · ' + esc(d.repos.join(' ')) : ''}</div></td>
    </tr>`).join('')}</table>` : '', 'No decisions recorded yet.')}

  ${L.discovered().length || L.offboarded().length ? section('Not onboarded',
    `<table>${L.discovered().map(r => `<tr><td><b>${esc(r)}</b></td><td class="dim sm">discovered · <code>coord onboard ${esc(r)} --preflight</code></td></tr>`).join('')}${
      L.offboarded().map(r => `<tr><td><b>${esc(r)}</b></td><td class="dim sm">offboarded · history in archive/</td></tr>`).join('')}</table>`) : ''}
</div>
</div>

${section('Today', activityFeed().length ? `<table class="feed">${activityFeed().map(a => `<tr>
    <td class="num dim">${esc(ago(a.ts))}</td>
    <td>${esc(a.repo)}</td>
    <td>${esc(a.event)}${a.n > 1 ? ` <span class="x">×${a.n}</span>` : ''}</td>
    <td class="dim">${esc(a.who || '')}${a.extra ? ' ' + esc(a.extra) : ''}</td>
  </tr>`).join('')}</table>` : '', 'Nothing logged today.')}

`;
  return shell('team', headline, body,
    `${L.onboarded().length} repos · last archive ${L.state().lastArchive ? ago(L.state().lastArchive) + ' ago' : 'never'}`,
    probs.filter(p => p.level === 'warn').length);
}

// One person's plate. Tickets carry no assignee, so "yours" means the repos you have
// actually been working in — see lib.reposFor.
function personView(name) {
  const person = L.personNamed(name);
  if (!person) return shell('team', { tone: 'critical', text: 'no such person' },
    `<section><h2>Unknown</h2><p class="none">Nobody on the roster is called "${esc(name)}". Run <code>coord who</code>.</p></section>`, '', 0);

  const mine = L.reposFor(name);
  const t = tickets();
  const inMine = f => mine.includes(f);
  const queue = t.filter(x => inMine(x.to) && ['approved', 'in_progress'].includes(x.status));
  const blockedOn = t.filter(x => inMine(x.from) && !['done', 'rejected'].includes(x.status));
  const needsHuman = t.filter(x => (inMine(x.to) || inMine(x.from)) && ['open', 'review'].includes(x.status));
  const rows = board().filter(r => mine.includes(r.repo));
  const last = L.whosAround().find(p => p.name === name) || {};

  const headline = queue.length ? { tone: 'warning', text: `${queue.length} ticket${queue.length > 1 ? 's' : ''} to work on` }
    : blockedOn.length ? { tone: 'serious', text: `waiting on ${blockedOn.length} ticket${blockedOn.length > 1 ? 's' : ''}` }
    : { tone: 'good', text: 'nothing queued' };

  const tile = (n, label, tone) =>
    `<div class="tile${n ? ` on t-${tone}` : ''}"><div class="n">${n}</div><div class="k">${esc(label)}</div></div>`;
  const chip = x => `<span class="chip c-${esc(x)}">${esc(x.replace('_', ' '))}</span>`;
  const tix = list => list.length ? `<table class="tix">${list.map(x => `<tr>
      <td><b>${esc(x.id)}</b></td><td>${chip(x.status)}</td>
      <td>${esc(x.title)}<div class="dim sm">${esc(x.from)} → ${esc(x.to)}</div></td>
      <td class="dim num">${esc(ago(x.updated) || '')}</td></tr>`).join('')}</table>` : '';
  const section = (title, body, empty) =>
    `<section><h2>${esc(title)}</h2>${body || `<p class="none">${esc(empty)}</p>`}</section>`;

  const handoffs = mine.map(r => [r, L.latestHandoff(r)]).filter(([, h]) => h);

  const body = `<div class="kpis">
  ${tile(queue.length, 'to work on', 'warning')}
  ${tile(blockedOn.length, 'waiting on others', 'accent')}
  ${tile(needsHuman.length, 'needs a human call', 'critical')}
  ${tile(mine.length, 'repos this week', 'accent')}
</div>

<div class="cols">
<div>
  ${section('To work on', tix(queue), 'Nothing approved and waiting for you.')}
  ${section('You are waiting on', tix(blockedOn), 'You have not asked anyone for anything.')}
  ${section('Your repos this week', rows.length ? `<table><tr><th>Repo</th><th>Status</th><th>Current task</th><th class="num">Seen</th></tr>${
    rows.map(r => `<tr><td><b>${esc(r.repo)}</b></td>
      <td class="s-${esc(r.status).split(' ')[0]}">${esc(r.status)}${r.stale ? '<span class="tag">stale</span>' : ''}</td>
      <td>${esc(r.task && r.task !== '—' ? r.task : '')}</td>
      <td class="num dim">${esc(ago(r.heartbeat) || '—')}</td></tr>`).join('')}</table>` : '',
    'No activity in any repo this week.')}
</div>
<div>
  ${section('Where you left off', handoffs.length ? handoffs.map(([r, h]) =>
    `<div class="note"><b>${esc(r)}</b> <span class="when">${esc(h.when)}</span><div class="sm">${esc(h.text).slice(0, 400)}</div></div>`).join('') : '',
    'No handoff notes yet — add one before you stop for the day.')}
  ${section('Recent activity', activityFeed(12, name).length ? `<table class="feed">${activityFeed(12, name).map(a => `<tr>
      <td class="num dim">${esc(ago(a.ts))}</td><td>${esc(a.repo)}</td>
      <td>${esc(a.event)}${a.n > 1 ? ` <span class="x">×${a.n}</span>` : ''}</td>
      <td class="dim">${esc(a.extra)}</td></tr>`).join('')}</table>` : '', 'Nothing logged yet.')}
</div>
</div>`;

  return shell(name, headline, body,
    `${esc(person.tool)} · last seen ${last.repo ? esc(last.repo) + ' ' + (ago(last.ts) || '') + ' ago' : 'never'}`, 0);
}

http.createServer((req, res) => {
  if (req.method !== 'GET') return res.writeHead(405).end();
  let body;
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    const who = url.startsWith('/who/') ? url.slice(5) : (url === '/me' ? L.me() : null);
    body = who ? personView(who) : teamView();
  } catch (e) { body = `<pre>dashboard error:\n${esc(e.stack)}</pre>`; }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(body);
}).listen(PORT, '127.0.0.1', () => console.log(`coord dashboard: http://127.0.0.1:${PORT}`));
