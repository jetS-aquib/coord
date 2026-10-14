'use strict';
// `coord setup` — everything a dev needs after cloning the board, in one command.
// Asks only where it genuinely cannot tell: cloning missing repos, and editing a shell
// profile. Everything else it just does. Safe to re-run; each step is idempotent.
const fs = require('fs'), path = require('path'), os = require('os');
const L = require('./lib.js'), R = require('./rules.js'), D = require('./devsetup.js');
const { P } = L;

const BIN = path.join(P.coord, 'bin');
const MARK = '# added by coord setup';

/* ---------- a synchronous prompt, so the whole CLI stays synchronous ---------- */
function ask(question, { def = 'y', choices = 'y/n' } = {}) {
  if (!process.stdin.isTTY) return null;                 // not a terminal: caller falls back
  process.stdout.write(`\n${question} [${choices}] (${def}) `);
  const buf = Buffer.alloc(256);
  let n = 0;
  try { n = fs.readSync(0, buf, 0, 256); } catch { return def; }
  return buf.toString('utf8', 0, n).trim() || def;
}
const yesish = a => /^y(es)?$/i.test(String(a || ''));

/* ---------- steps ---------- */
function setup({ yes = false, noPath = false } = {}) {
  const say = m => console.log(m);
  const step = (n, t) => console.log(`\n[${n}/6] ${t}`);
  const todo = [];                                        // things the dev must finish by hand
  const interactive = !!process.stdin.isTTY && !yes;

  say(`coord setup — board at ${P.coord}`);
  if (!interactive) say(yes ? '(non-interactive: taking safe defaults)' : '(no terminal: taking safe defaults, manual steps listed at the end)');

  /* 1. environment */
  step(1, 'Checking the basics');
  const major = Number(process.versions.node.split('.')[0]);
  say(`  node ${process.versions.node}${major < 18 ? '  << too old, please upgrade to 18+' : ''}`);
  if (major < 18) throw new Error('node 18 or newer is required');
  const g = L.sh('git', ['--version'], P.coord);
  if (!g.ok) throw new Error('git is not on your PATH');
  say(`  ${g.out}`);
  const hasRemote = !!L.coordGit(['remote']).out;
  say(`  board remote: ${hasRemote ? L.coordGit(['remote', 'get-url', 'origin']).out : 'none — this board is local only'}`);

  /* 2. latest board */
  step(2, 'Fetching the latest board');
  if (hasRemote) {
    const before = L.coordGit(['rev-parse', 'HEAD']).out;
    L.sh(process.execPath, [path.join(BIN, 'coord'), 'sync', '--quiet'], P.coord);
    const after = L.coordGit(['rev-parse', 'HEAD']).out;
    say(before === after ? '  already up to date' : '  pulled new changes');
  } else say('  skipped (no remote yet)');

  /* 3. where the repos are */
  step(3, 'Locating the repos');
  const active = L.registry().filter(r => r.status === 'active');
  if (!active.length) say('  the registry is empty — nothing onboarded yet');
  const here = new Set(L.repos());
  const missing = active.filter(r => !here.has(r.name));
  for (const r of active) say(`  ${here.has(r.name) ? '[x]' : '[ ]'} ${r.name}${here.has(r.name) ? '' : '  not cloned here'}`);

  backfillRemotes(active, here, say);

  if (missing.length) {
    const withUrl = missing.filter(r => r.remote);
    say(`\n  ${missing.length} repo(s) are on the board but not on this machine.`);
    say('  That is fine if you do not work on them — they just stay off your disk.');
    const a = interactive && withUrl.length
      ? ask(`  Clone ${withUrl.length} of them into ${P.root} now?`)
      : 'n';
    if (yesish(a)) {
      for (const r of withUrl) {
        process.stdout.write(`  cloning ${r.name}... `);
        const res = L.sh('git', ['clone', '--quiet', r.remote, path.join(P.root, r.name)], P.root);
        say(res.ok ? 'done' : `failed: ${res.err.split('\n')[0]}`);
        if (res.ok) here.add(r.name);
      }
    } else if (withUrl.length) {
      todo.push(`clone the repos you need:\n${withUrl.map(r => `       git clone ${r.remote} ${path.join(P.root, r.name)}`).join('\n')}`);
    }
    for (const r of missing.filter(r => !r.remote)) todo.push(`${r.name} has no clone URL recorded — ask whoever onboarded it`);
  }

  /* 3b. who you are */
  introduce(interactive, say, todo);

  /* 4. PATH */
  step(4, 'Making `coord` available everywhere');
  const onPath = (process.env.PATH || '').split(path.delimiter).some(p => p && L.real(p) === BIN);
  if (onPath) say('  already on your PATH');
  else if (noPath) { say('  skipped (--no-path)'); todo.push(`put coord on your PATH:  export PATH="${BIN}:$PATH"`); }
  else {
    const profile = shellProfile();
    const line = `${MARK}\nexport PATH="${BIN}:$PATH"\n`;
    const already = L.read(profile).includes(BIN);
    if (already) say(`  ${tilde(profile)} already has it — open a new shell to pick it up`);
    else {
      const a = interactive ? ask(`  Add it to ${tilde(profile)}?`) : 'n';
      if (yesish(a)) {
        fs.appendFileSync(profile, `\n${line}`);
        say(`  added to ${tilde(profile)} — open a new shell, or: source ${tilde(profile)}`);
      } else {
        say(`  not on your PATH — left ${tilde(profile)} alone, see the list below`);
        todo.push(`put coord on your PATH — add to ${tilde(profile)}:\n       export PATH="${BIN}:$PATH"`);
      }
    }
  }

  /* 5. hooks + editor instructions */
  step(5, 'Setting up the repos on this machine');
  if (!here.size) say('  no repos here yet — re-run coord setup once you have cloned some');
  else for (const line of D.devsetup({})) say(`  ${line}`);

  /* 6. verify */
  step(6, 'Checking everything lines up');
  const probs = R.check();
  const errs = probs.filter(p => p.level === 'error');
  for (const p of probs.filter(p => p.level !== 'info')) say(`  ${p.level.toUpperCase()}  ${p.where}: ${p.msg}`);
  for (const p of probs.filter(p => p.level === 'info')) say(`  note: ${p.msg}`);
  if (!errs.length) say('  check: OK');

  /* report */
  const dirty = [...here].map(r => ({ r, out: L.sh('git', ['status', '--porcelain'], path.join(P.root, r)).out }))
    .filter(x => x.out.includes('.github/') || x.out.includes('AGENTS.md'));
  if (dirty.length) {
    todo.push('review and commit the editor instruction file in each repo:\n' +
      dirty.map(x => `       ${x.r}:  git add .github AGENTS.md 2>/dev/null; git commit -m "no-ticket: add platform coordination rules"`).join('\n'));
  }

  console.log('\n' + '-'.repeat(60));
  if (todo.length) {
    console.log(`Nearly there — ${todo.length} thing(s) left for you:\n`);
    todo.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  } else {
    console.log('Setup complete. Nothing left to do.');
  }
  console.log(`\nStart here:  coord repos   ·   coord list   ·   node ${path.relative(process.cwd(), path.join(P.coord, 'dashboard', 'server.js'))}`);
  if (errs.length) process.exitCode = 1;
}

/* Name and tool. The name is a confirm, not a question — git already knows it.
   The tool matters because Copilot sessions have no guard and no briefing. */
function introduce(interactive, say, todo) {
  const email = L.gitConfig('user.email');
  if (!email) {
    todo.push('set your git identity, then re-run setup:  git config --global user.email you@example.com');
    say('  no git email configured — skipping the roster');
    return;
  }
  const existing = L.people().find(p => (p.email || '').toLowerCase() === email.toLowerCase());
  if (existing && !interactive) { say(`  you are ${existing.name} (${existing.tool}) on the roster`); return; }

  const guess = existing ? existing.name : (L.gitConfig('user.name') || email.split('@')[0]);

  if (!interactive) {
    L.putPerson({ name: guess, email, tool: 'other', since: existing ? existing.since : L.day() });
    say(`  added ${guess} to the roster (tool: other — set it with: coord who --tool claude-code)`);
    return;
  }

  const name = ask(`  What should we call you?`, { def: guess, choices: 'name' }) || guess;
  const t = ask(`  Which do you use? 1) Claude Code  2) Copilot  3) both  4) something else`,
    { def: existing ? String(L.TOOLS.indexOf(existing.tool) + 1) : '1', choices: '1-4' });
  const tool = L.TOOLS[(Number(t) || 1) - 1] || 'other';
  L.putPerson({ name, email, tool, since: existing ? existing.since : L.day() });
  say(`  ${existing ? 'updated' : 'added'} ${name} (${tool}) on the roster`);
}

/* a repo cloned here but with no URL on the board: record it so others can clone it */
function backfillRemotes(active, here, say) {
  const filled = [];
  for (const r of active) {
    if (r.remote || !here.has(r.name)) continue;
    const u = L.sh('git', ['remote', 'get-url', 'origin'], path.join(P.root, r.name));
    if (u.ok && u.out) { L.regPut({ ...r, remote: u.out }); filled.push(r.name); }
  }
  if (filled.length) say(`  recorded clone URLs for ${filled.join(', ')} so others can fetch them`);
}

function shellProfile() {
  const sh = path.basename(process.env.SHELL || 'zsh');
  const home = os.homedir();
  if (sh === 'fish') return path.join(home, '.config', 'fish', 'config.fish');
  if (sh === 'bash') return L.exists(path.join(home, '.bashrc')) ? path.join(home, '.bashrc') : path.join(home, '.bash_profile');
  return path.join(home, '.zshrc');
}
const tilde = p => p.replace(os.homedir(), '~');

module.exports = { setup };
