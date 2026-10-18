'use strict';
// Nobody narrates finished work. Four days in, this board had one context note and zero
// requests on it — not because nothing happened, but because writing something down is a
// separate act of discipline performed after the interesting part is over, and it loses
// every time. So read what happened instead of asking for it.
//
// Facts only, and the dev's own words where there are any: which repos moved together,
// which files, which commit subjects. Where the reason is not recorded, say that plainly
// rather than inventing one — a note that guesses is worse than no note, because the next
// person believes it.
const path = require('path');
const L = require('./lib.js');

const EXCERPT = 10;                               // enough to recognise the change, not a changelog

// Everything this machine did in one sitting, grouped by repo. The window is the session,
// not the day: two unrelated sittings should not become one story.
function sessionWork(since) {
  const by = {}, crossed = new Set();
  const me = L.me();
  const slot = r => (by[r] = by[r] || { files: new Set(), commits: new Set() });
  for (const a of L.recentActivity(2)) {
    if (!a.ts || a.ts < since) continue;
    // The raw field, not a.who: recentActivity blanks a name that is not on the roster,
    // which is exactly the case where telling people apart matters most — a colleague
    // who has not run setup yet would otherwise read as "no name", the same as you, and
    // their afternoon would be written up as yours.
    const cols = a.line.split('\t');
    if ((cols[3] || '') !== (me || '')) continue;
    if (a.repo === 'platform-root') continue;
    const extra = cols.slice(4).join('\t');
    if (a.event === 'edit' && extra) slot(a.repo).files.add(extra);
    if (a.event === 'commit' && extra) slot(a.repo).commits.add(extra.replace(/^\S+\s+/, ''));  // drop the hash
    // A cross-repo line names the far side, which the near repo's own feed never does.
    // The edit hook also logged that same file against the near repo, because an edit
    // outside the repo has no sensible relative path and falls back to the basename —
    // so remember it and take it back off the near repo below. A note that files the
    // frontend's hook under the backend is worse than no note.
    if (a.event === 'cross-repo') {
      const m = /^(\S+) \+ (\S+) — (.+)$/.exec(extra);
      if (m) { slot(m[2]).files.add(m[3]); crossed.add(`${m[1]}:${m[3]}`); }
    }
  }
  for (const k of crossed) {
    const [repo, file] = k.split(':');
    if (by[repo]) by[repo].files.delete(file);
  }
  return by;
}

const some = (set, n = EXCERPT) => {
  const all = [...set];
  return all.slice(0, n).join(', ') + (all.length > n ? `, +${all.length - n} more` : '');
};

// One note per set of repos per day, updated rather than duplicated: a day of going back
// and forth between two repos is one story, not six.
function capture({ since, day = L.day() } = {}) {
  const by = sessionWork(since);
  const repos = Object.keys(by).filter(r => by[r].files.size || by[r].commits.size).sort();
  if (repos.length < 2) return null;              // one repo is just work; two is a fact nobody writes down

  const slug = `together-${repos.join('-')}-${day}`;
  const file = path.join(L.P.context, slug + '.md');
  const was = L.exists(file) ? L.parse(L.read(file)) : null;

  // Merge with whatever an earlier session today already recorded, and keep anything a
  // person wrote underneath — their sentence is the valuable half of this note.
  const theirs = was ? (was.body.split(WRITTEN_BY)[1] || '').trim() : '';
  const prior = was ? parseBack(was.body) : {};
  for (const r of repos) {
    for (const f of prior[r] ? prior[r].files : []) by[r].files.add(f);
    for (const c of prior[r] ? prior[r].commits : []) by[r].commits.add(c);
  }

  const human = repos.slice(0, -1).join(', ') + ' and ' + repos[repos.length - 1];
  const lines = [`${L.me() || 'someone'} changed ${human} in the same sitting.`, ''];
  for (const r of repos) {
    if (by[r].files.size) lines.push(`**${r}** — ${some(by[r].files)}`);
    if (by[r].commits.size) for (const c of by[r].commits) lines.push(`  - ${c}`);
  }
  lines.push('', WRITTEN_BY.trim(), '',
    'Why they moved together is not recorded here. If you know, write it under this line —',
    'that sentence is the whole point, and the rest is only there so you recognise the change.',
    ...(theirs ? ['', theirs] : []));

  L.atomicWrite(file, L.stringify(
    { title: `${human} changed together, ${day}`, added: was ? was.fm.added : day, updated: day, by: L.me() || L.actor() },
    lines.join('\n') + '\n'));
  return slug;
}

const WRITTEN_BY = '\n_Written automatically from the activity log._\n';

// Read back what a previous run wrote, so re-running merges instead of replacing. Only
// the generated half is parsed; anything a person added survives untouched.
function parseBack(body) {
  const out = {};
  let cur = null;
  for (const line of body.split('\n')) {
    const h = /^\*\*(\S+)\*\* — (.+)$/.exec(line);
    if (h) { cur = out[h[1]] = { files: h[2].replace(/, \+\d+ more$/, '').split(', '), commits: [] }; continue; }
    const c = /^ {2}- (.+)$/.exec(line);
    if (c && cur) cur.commits.push(c[1]);
    if (line.startsWith('_Written')) break;
  }
  return out;
}

module.exports = { capture, sessionWork };
