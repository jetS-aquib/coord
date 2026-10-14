// Read-only coordination dashboard. No deps. localhost only.
//   node .coord/dashboard/server.js [port]
const http = require('http'), fs = require('fs'), path = require('path');

const COORD = path.resolve(__dirname, '..');
const ROOT = path.resolve(COORD, '..');
const PORT = Number(process.argv[2] || process.env.PORT || 4747);

const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const read = f => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } };

const repos = () => fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && fs.existsSync(path.join(ROOT, d.name, '.git')))
  .map(d => d.name).sort();

function board() {
  const rows = new Map();
  for (const line of read(path.join(COORD, 'board.md')).split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const c = line.split('|').slice(1, -1).map(s => s.trim());
    if (c.length < 4 || /^:?-{2,}/.test(c[0]) || c[0].toLowerCase() === 'repo') continue;
    rows.set(c[0], c.slice(0, 4));
  }
  for (const r of repos()) if (!rows.has(r)) rows.set(r, [r, '—', '—', '—']); // new repo, no setup needed
  return [...rows.values()];
}

function messages() {
  const dir = path.join(COORD, 'messages');
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_')); } catch {}
  const msgs = files.map(f => {
    const txt = read(path.join(dir, f));
    const field = k => (txt.match(new RegExp('^' + k + ':\\s*(.*)$', 'mi')) || [, ''])[1].trim();
    return { file: f, status: (field('Status') || 'pending').toLowerCase(), from: field('From'), to: field('To'), request: field('Request'), reason: field('Reason'), files: field('Related files') };
  });
  const rank = s => (s === 'pending' ? 0 : 1);
  return msgs.sort((a, b) => rank(a.status) - rank(b.status) || b.file.localeCompare(a.file));
}

const activity = () => read(path.join(COORD, 'activity.log')).trimEnd().split('\n').filter(Boolean).slice(-50).reverse();

function page() {
  const b = board().map(r => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td class="s s-${esc(r[2]).replace(/\s+/g, '-')}">${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join('');
  const m = messages().map(x => `<div class="msg ${esc(x.status)}">
    <div class="hd"><span class="tag">${esc(x.status)}</span> <b>${esc(x.from)}</b> → <b>${esc(x.to)}</b> <span class="fn">${esc(x.file)}</span></div>
    <div>${esc(x.request)}</div>
    <div class="dim">${esc(x.reason)}</div>
    <div class="dim">${esc(x.files)}</div></div>`).join('') || '<p class="dim">No messages.</p>';
  return `<!doctype html><html><head><meta charset="utf-8"><title>jetKreate coord</title>
<meta http-equiv="refresh" content="5">
<style>
:root{color-scheme:dark light}
body{font:14px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;margin:2rem auto;max-width:60rem;padding:0 1rem}
h2{margin:2rem 0 .5rem;font-size:1rem;text-transform:uppercase;letter-spacing:.1em;opacity:.6}
table{border-collapse:collapse;width:100%}
td,th{border-bottom:1px solid #8884;padding:.4rem .6rem;text-align:left;vertical-align:top}
.s-working{color:#3b82f6}.s-waiting-on-human{color:#f59e0b}.s-waiting-on-other-repo{color:#f59e0b}.s-done{color:#22c55e}
.msg{border-left:3px solid #8884;padding:.4rem .8rem;margin:.5rem 0}
.msg.pending{border-color:#f59e0b}.msg.approved{border-color:#3b82f6}.msg.done{border-color:#22c55e}.msg.rejected{border-color:#ef4444}
.tag{text-transform:uppercase;font-size:.75rem;letter-spacing:.08em}
.fn,.dim{opacity:.55}.hd{margin-bottom:.2rem}
pre{white-space:pre-wrap;font-size:.85rem;opacity:.8;margin:0}
</style></head><body>
<h1>jetKreate</h1>
<h2>Board</h2><table><tr><th>Repo</th><th>Current task</th><th>Status</th><th>Last updated</th></tr>${b}</table>
<h2>Messages</h2>${m}
<h2>Activity (last 50)</h2><pre>${esc(activity().join('\n')) || 'empty'}</pre>
<p class="dim">read-only · refreshes every 5s</p>
</body></html>`;
}

http.createServer((req, res) => {
  if (req.method !== 'GET') { res.writeHead(405).end(); return; }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(page());
}).listen(PORT, '127.0.0.1', () => console.log(`http://127.0.0.1:${PORT}`));
