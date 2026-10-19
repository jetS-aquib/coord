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
  let here = new Set(L.repos());
  const mapped = L.pathMap();
  for (const r of active) {
    const at = L.repoDirs()[r.name];
    say(`  ${here.has(r.name) ? '[x]' : '[ ]'} ${r.name.padEnd(24)} ${at ? (mapped[r.name] ? at : 'beside the board') : 'not on this machine'}`);
  }

  backfillRemotes(active, here, say);

  // A repo missing from the default place is usually one of three things: you do not
  // work on it, you keep it somewhere else, or you have not cloned it yet. Guessing
  // "clone it" for all three is how a setup script makes a second copy of a repo
  // somebody already has open in their editor.
  const missing = active.filter(r => !here.has(r.name));
  if (missing.length) {
    say(`\n  ${missing.length} repo(s) on the board are not beside it on this machine.`);
    say('  Fine if you do not work on them, or if you keep them somewhere else.');
    for (const r of missing) {
      // A guess is a guess. Pointing someone's board at the wrong copy of a repo without
      // asking is worse than asking — with no terminal it goes on the list instead.
      const guess = guessLocation(r.name);
      if (guess && interactive && yesish(ask(`  Found ${r.name} at ${tilde(guess)} — use that one?`))) {
        L.setRepoPath(r.name, guess); here = new Set(L.repos());
        say(`  ${r.name} -> ${tilde(guess)}`);
        continue;
      }
      if (guess && !interactive) {
        todo.push(`${r.name} looks like it is at ${tilde(guess)}. If that is the one you work on:  coord where ${r.name} ${guess}`);
        continue;
      }
      const a = interactive
        ? ask(`  ${r.name}: [c]lone it, give me a [p]ath, or [s]kip?`, { def: r.remote ? 'c' : 's', choices: 'c/p/s' })
        : 's';
      if (/^c/i.test(a) && r.remote) {
        process.stdout.write(`  cloning ${r.name}... `);
        const res = L.sh('git', ['clone', '--quiet', r.remote, path.join(P.root, r.name)], P.root);
        say(res.ok ? 'done' : `failed: ${res.err.split('\n')[0]}`);
        if (res.ok) here = new Set(L.repos());
      } else if (/^p/i.test(a)) {
        const p = ask(`  Full path to ${r.name}?`, { def: '', choices: 'path' });
        const abs = p && L.real(path.resolve(p.replace(/^~/, os.homedir())));
        if (abs && L.isRepoAt(abs)) { L.setRepoPath(r.name, abs); here = new Set(L.repos()); say(`  ${r.name} -> ${abs}`); }
        else { say(`  ${p || '(nothing)'} is not a git repo — skipped`); todo.push(`tell coord where ${r.name} is:  coord where ${r.name} <path>`); }
      } else {
        todo.push(r.remote
          ? `${r.name}: clone it  (git clone ${r.remote} ${path.join(P.root, r.name)})  or, if you already have it:  coord where ${r.name} <path>`
          : `${r.name} has no clone URL recorded — ask whoever onboarded it, or: coord where ${r.name} <path>`);
      }
    }
  }

  /* 3b. who you are */
  introduce(interactive, say, todo);

  /* 4. PATH */
  step(4, 'Making `coord` available everywhere');
  const onPath = (process.env.PATH || '').split(path.delimiter).some(p => p && L.real(p) === BIN);
  if (onPath) say('  already on your PATH');
  else if (noPath) { say('  skipped (--no-path)'); todo.push(`put coord on your PATH:\n       ${pathLine()}`); }
  else if (L.isWindows) {
    // No profile to append to that is the same on PowerShell, cmd and Git Bash — and
    // setx writes the registry. Print it; the dev runs it once.
    say('  Windows: run this once, in PowerShell, then open a new terminal');
    todo.push(`put coord on your PATH (PowerShell, once):\n       ${pathLine()}`);
  } else {
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
        todo.push(`put coord on your PATH — add to ${tilde(profile)}:\n       ${pathLine()}`);
      }
    }
  }

  /* 5. hooks + editor instructions */
  step(5, 'Setting up the repos on this machine');
  if (!here.size) say('  no repos here yet — re-run coord setup once you have cloned some');
  else for (const line of D.devsetup({})) say(`  ${line}`);
  agentHooks(say, todo);
  heavyRepos(say);

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

// Git hooks cover every dev whatever they code in. These are the agent hooks, and they
// are where the guard, the session briefing, the overlap warning and the handoff note
// actually live — so a dev without them has no enforcement at all and no way to know it.
// Both tools have them now, so nobody is second-class and nobody types "coord" to start.
function agentHooks(say, todo) {
  const mine = L.people().find(p => p.name === L.me());
  const tool = (mine && mine.tool) || 'other';
  const wants = t => tool === t || tool === 'both' || tool === 'other';
  let any = false;

  for (const [t, label, dir, install] of [
    ['claude-code', 'Claude Code', path.dirname(D.claudeSettings()), D.installClaudeHooks],
    ['copilot', 'Copilot', path.dirname(path.dirname(D.copilotHooksFile())), D.installCopilotHooks],
  ]) {
    if (!wants(t)) continue;
    // "other" means we are guessing, so only act where the tool has actually been run.
    if (tool === 'other' && !L.exists(dir)) continue;
    any = true;
    for (const line of install()) say(`  ${line}`);
  }

  if (!any) say(`  no agent hooks installed — set which tool you use: coord who --tool claude-code|copilot|both`);
  else if (wants('claude-code')) todo.push('restart Claude Code so it picks up the new hooks');
}

// The one thing worth saying out loud on a new machine: which of these repos is too
// big to read. It goes in each repo’s instruction file as well, but a person setting
// up for the first time should hear it from the setup they just ran. Not a task: there
// is nothing to install and nothing to fix, it is just true about the code.
function heavyRepos(say) {
  const O = require('./onboard.js');
  const rows = [];
  for (const r of L.onboarded()) {
    const dir = L.repoDir(r);
    if (!L.isRepoAt(dir)) continue;
    try {
      const s = O.sizeOf(dir);
      if (s.tokens > 150000) rows.push([r, Math.round(s.tokens / 1000)]);
    } catch { /* a repo we cannot scan is not worth failing setup over */ }
  }
  if (!rows.length) return;
  say(`  these are too big for an agent to read whole — search, do not browse:`);
  for (const [r, k] of rows) say(`    ${r.padEnd(24)} ~${k}k tokens`);
  say(`  each repo’s .github/copilot-instructions.md now says so, with its own numbers.`);
}

const pathLine = () => L.isWindows
  ? `setx PATH "$env:PATH;${BIN}"`
  : `export PATH="${BIN}:$PATH"`;

// Before asking, look where people actually put things: beside the board, one level up,
// and the usual ~/work-style folders. Costs nothing and saves the question most of the time.
function guessLocation(name) {
  const home = os.homedir();
  const roots = [P.root, path.dirname(P.root), home,
    ...['work', 'code', 'projects', 'dev', 'src', 'repos', 'Developer'].map(d => path.join(home, d))];
  for (const r of roots) {
    const c = path.join(r, name);
    if (L.isRepoAt(c) && L.real(c) !== path.join(P.root, name)) return L.real(c);
  }
  return null;
}

function shellProfile() {
  const sh = path.basename(process.env.SHELL || 'zsh');
  const home = os.homedir();
  if (sh === 'fish') return path.join(home, '.config', 'fish', 'config.fish');
  if (sh === 'bash') return L.exists(path.join(home, '.bashrc')) ? path.join(home, '.bashrc') : path.join(home, '.bash_profile');
  return path.join(home, '.zshrc');
}
// Only a LEADING home directory becomes ~. A blind replace turns
// /private/tmp/me/work into /private~/work, which is nobody's path.
const tilde = p => {
  const h = L.real(os.homedir()), r = L.real(p);
  return r === h ? '~' : r.startsWith(h + path.sep) ? '~' + r.slice(h.length) : p;
};

module.exports = { setup, ask, yesish };
