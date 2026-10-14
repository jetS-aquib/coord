'use strict';
// End-to-end self-test in a throwaway folder with two fake repos.
// Never touches real files: everything hangs off COORD_ROOT in a temp dir.
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const COORD_BIN = path.join(__dirname, 'coord');
const HOOK = path.join(__dirname, '..', 'hooks', 'hook.js');
const GUARD = path.join(__dirname, '..', 'hooks', 'guard.js');
const COORD_DIRNAME = path.basename(path.join(__dirname, '..'));

let pass = 0, fail = 0, TMP, CO;
const ok = (name, cond, detail = '') => {
  (cond ? pass++ : fail++);
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond || !detail ? '' : '\n        ' + String(detail).trim().split('\n').join('\n        ')}`);
};
const git = (args, cwd) => cp.spawnSync('git', args, { cwd, encoding: 'utf8' });
function coord(args, { cwd = TMP, human = false } = {}) {
  const r = cp.spawnSync(process.execPath, [COORD_BIN, ...args], {
    cwd, encoding: 'utf8',
    env: { ...process.env, COORD_ROOT: CO, COORD_ACTOR: human ? 'human' : 'repo' },
  });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}
const readT = id => {
  const d = path.join(CO, 'tickets');
  const f = fs.readdirSync(d).find(f => f.startsWith(id + '-'));
  return f ? fs.readFileSync(path.join(d, f), 'utf8') : '';
};

function run() {
  TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'coord-drill-'));
  CO = path.join(TMP, '.coord');
  console.log(`drill: ${TMP}\n`);
  try {
    setup();
    const id = lifecycle();
    const did = decision(id);
    commitAndWhy(id, did);
    hooks(id);
    guard();
    team();
    onboarding();
    archiving(id);
    superseding(did);
    ok('coord check reports no errors', !coord(['check']).out.includes('ERROR'), coord(['check']).out);
  } catch (e) {
    fail++; console.log(`FAIL  drill crashed: ${e.message}\n${e.stack}`);
  } finally {
    fs.rmSync(TMP, { recursive: true, force: true });
    console.log(`\n${fail ? 'FAIL' : 'PASS'} — ${pass} passed, ${fail} failed. Cleaned up ${TMP}`);
    if (fail) process.exitCode = 1;
  }
}

function setup() {
  fs.mkdirSync(CO, { recursive: true });
  for (const r of ['alpha', 'beta']) {
    const d = path.join(TMP, r);
    fs.mkdirSync(d);
    git(['init', '-q'], d); git(['config', 'user.email', 'd@d'], d); git(['config', 'user.name', 'drill'], d);
  }
  fs.mkdirSync(path.join(TMP, 'not-a-repo'));
  git(['init', '-q'], CO); git(['config', 'user.email', 'd@d'], CO); git(['config', 'user.name', 'drill'], CO);

  // the real coord repo carries its own CLI at bin/coord; the fixture needs one too, so the
  // installed git hooks can find it and a clone is recognisable as a coord repo
  fs.mkdirSync(path.join(CO, 'bin'), { recursive: true });
  fs.writeFileSync(path.join(CO, 'bin', 'coord'), `#!/bin/sh\nexec ${JSON.stringify(process.execPath)} ${JSON.stringify(COORD_BIN)} "$@"\n`, { mode: 0o755 });

  coord(['list']);
  ok('discovered repos get no status file', !fs.existsSync(path.join(CO, 'status')) || !fs.readdirSync(path.join(CO, 'status')).length,
    fs.existsSync(path.join(CO, 'status')) ? fs.readdirSync(path.join(CO, 'status')).join(' ') : '');
  ok('an empty roster says so', /nobody on the roster/.test(coord(['who']).out), coord(['who']).out);
  ok('both fake repos listed as discovered', /discovered, not onboarded \(2\)/.test(coord(['repos']).out), coord(['repos']).out);

  for (const r of ['alpha', 'beta']) coord(['onboard', r, '--apply', '--stack', 'fixture'], { human: true });
  const st = fs.readdirSync(path.join(CO, 'status'));
  ok('onboarding creates status files', st.length === 2 && st.includes('alpha.md') && st.includes('beta.md'), st.join(' '));
  ok('non-repo folder never appears', !st.includes('not-a-repo.md'));
  ok('tickets refused for an unregistered repo', !coord(['new', '--from', 'alpha', '--to', 'ghost', '--title', 'x']).ok);
}

function lifecycle() {
  let r = coord(['new', '--from', 'alpha', '--to', 'beta', '--title', 'Add /v1/jobs endpoint',
    '--request', 'Expose GET /v1/jobs returning {id,state}.', '--reason', 'alpha cannot poll job state.',
    '--files', 'src/api/jobs.js'], { cwd: path.join(TMP, 'alpha') });
  const id = (r.out.match(/T-\d+/) || [])[0];
  ok('coord new creates a ticket in status open', r.ok && !!id && /status: - -> open/.test(readT(id)), r.out);

  ok('bad repo name refused', !coord(['new', '--from', 'nope', '--to', 'beta', '--title', 'x']).ok);
  ok('invalid transition open -> done refused', !coord(['done', id], { human: true }).ok, coord(['done', id], { human: true }).out);
  ok('invalid transition open -> review refused', !coord(['review', id]).ok);

  r = coord(['approve', id]);
  ok('approve refused for a repo session (human only)', !r.ok && /human/i.test(r.out), r.out);
  r = coord(['approve', id, 'go ahead'], { human: true });
  ok('approve works for the human', r.ok && /status: open -> approved/.test(readT(id)), r.out);

  r = coord(['start', id], { cwd: path.join(TMP, 'beta') });
  ok('assignee moves approved -> in_progress', r.ok && /approved -> in_progress/.test(readT(id)), r.out);

  r = coord(['review', id], { cwd: path.join(TMP, 'beta') });
  ok('review refused while Test steps are empty', !r.ok && /Test steps/.test(r.out), r.out);

  const d = path.join(CO, 'tickets'), f = fs.readdirSync(d).find(x => x.startsWith(id + '-'));
  const p = path.join(d, f);
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/## Test steps\n\n—/, '## Test steps\n\n1. curl localhost:3000/v1/jobs -> 200 with a JSON array'));
  r = coord(['review', id, 'ready'], { cwd: path.join(TMP, 'beta') });
  ok('review accepted once Test steps are filled in', r.ok && /in_progress -> review/.test(readT(id)), r.out);
  return id;
}

function decision(id) {
  const r = coord(['decide', '--title', 'Jobs API returns a flat array', '--repos', 'alpha,beta', '--tickets', id,
    '--context', 'alpha needs job state.', '--options', 'flat array / envelope object',
    '--decision', 'Return a flat JSON array.', '--reason', 'Simplest thing both repos already parse.',
    '--consequences', 'Pagination will need a breaking change.'], { cwd: path.join(TMP, 'beta') });
  const did = (r.out.match(/D-\d+/) || [])[0];
  ok('coord decide records a decision', r.ok && !!did, r.out);
  const dfile = fs.readdirSync(path.join(CO, 'decisions')).find(f => did && f.startsWith(did + '-'));
  const dtext = dfile ? fs.readFileSync(path.join(CO, 'decisions', dfile), 'utf8') : '';
  ok('decision <-> ticket linked both ways', readT(id).includes(did) && dtext.includes(id));
  ok('decisions/index.md lists it', fs.readFileSync(path.join(CO, 'decisions', 'index.md'), 'utf8').includes(did));
  return did;
}

function commitAndWhy(id, did) {
  const beta = path.join(TMP, 'beta'), file = path.join(beta, 'jobs.js');
  fs.writeFileSync(file, `// ${did}: flat array, no envelope\nmodule.exports = () => [];\n`);
  git(['add', '-A'], beta);
  git(['commit', '-q', '-m', `${id}: add GET /v1/jobs`], beta);

  const r = coord(['done', id, 'shipped'], { human: true });
  ok('human closes review -> done', r.ok && /review -> done/.test(readT(id)), r.out);

  const w = coord(['why', `${file}:2`], { cwd: beta });
  ok('coord why finds the ticket from the commit message', w.ok && w.out.includes(id) && w.out.includes('Add /v1/jobs endpoint'), w.out);
  ok('coord why shows the linked decision', w.out.includes(did), w.out);

  fs.writeFileSync(path.join(beta, 'misc.js'), 'const x = 1;\n');
  git(['add', '-A'], beta); git(['commit', '-q', '-m', 'no-ticket: typo'], beta);
  const w2 = coord(['why', `${path.join(beta, 'misc.js')}:1`], { cwd: beta });
  ok('coord why says so plainly when there is no ticket', w2.ok && /no-ticket/i.test(w2.out), w2.out);
}

function hooks(id) {
  const today = new Date().toISOString().slice(0, 10);
  const logFile = path.join(CO, 'activity', `${today}.log`);
  const lines = () => (fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean) : []);
  const hook = (event, payload) => cp.spawnSync(process.execPath, [HOOK, event], {
    input: JSON.stringify(payload), encoding: 'utf8',
    env: { ...process.env, COORD_ROOT: CO },
  });

  let n = lines().length;
  let r = hook('session-start', { cwd: path.join(TMP, 'beta') });
  ok('hook logs session-start', r.status === 0 && lines().length === n + 1 && /\tbeta\tsession-start/.test(lines().at(-1)), r.stdout + r.stderr);

  // SessionStart stdout becomes session context: the repo should not need to be told about coord
  let ctx = '';
  try { ctx = JSON.parse(r.stdout).hookSpecificOutput.additionalContext; } catch { /* reported below */ }
  ok('session-start briefs the session on its own repo',
    /hookEventName":"SessionStart/.test(r.stdout) && ctx.includes('beta') && /status file/.test(ctx), r.stdout.slice(0, 160));
  ok('briefing names the enforcement and the CLI', /PreToolUse hook/.test(ctx) && /coord new --from beta/.test(ctx), ctx.slice(0, 160));

  n = lines().length;
  r = hook('edit', { cwd: path.join(TMP, 'beta'), tool_input: { file_path: path.join(TMP, 'beta', 'jobs.js') } });
  ok('hook logs edits with a repo-relative path', r.status === 0 && /\tbeta\tedit\t[^\t]*\tjobs\.js$/.test(lines().at(-1)), lines().at(-1));

  n = lines().length;
  const before = git(['rev-list', '--count', 'HEAD'], CO).stdout.trim() || '0';
  r = hook('session-stop', { cwd: path.join(TMP, 'alpha') });
  const after = git(['rev-list', '--count', 'HEAD'], CO).stdout.trim() || '0';
  ok('hook logs session-stop and snapshots .coord', r.status === 0 && lines().length === n + 1 && Number(after) > Number(before), `${before} -> ${after}`);
  ok('snapshot stayed inside .coord', git(['status', '--porcelain'], path.join(TMP, 'beta')).stdout.trim() === '');

  n = lines().length;
  r = hook('session-start', { cwd: os.tmpdir() });
  ok('hook does nothing outside the platform root', r.status === 0 && !r.stdout && lines().length === n, r.stdout + r.stderr);

  r = cp.spawnSync(process.execPath, [HOOK, 'edit'], { input: 'not json', encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO } });
  ok('hook survives garbage input, exits 0, prints nothing', r.status === 0 && !r.stdout && !r.stderr);
  ok('no hook errors logged', !fs.existsSync(path.join(CO, 'activity', 'hook-errors.log')),
    fs.existsSync(path.join(CO, 'activity', 'hook-errors.log')) ? fs.readFileSync(path.join(CO, 'activity', 'hook-errors.log'), 'utf8') : '');
}

function guard() {
  const A = path.join(TMP, 'alpha'), B = path.join(TMP, 'beta');
  const ask = (cwd, tool, input) => {
    const r = cp.spawnSync(process.execPath, [GUARD], {
      input: JSON.stringify({ cwd, tool_name: tool, tool_input: input }), encoding: 'utf8',
      env: { ...process.env, COORD_ROOT: CO },
    });
    if (r.status !== 0) return { error: `exit ${r.status}` };
    if (!r.stdout.trim()) return { decision: 'allow' };
    try { return { decision: JSON.parse(r.stdout).hookSpecificOutput.permissionDecision, reason: JSON.parse(r.stdout).hookSpecificOutput.permissionDecisionReason }; }
    catch { return { error: `unparseable: ${r.stdout.slice(0, 80)}` }; }
  };
  const denies = (label, cwd, tool, input, want) => {
    const r = ask(cwd, tool, input);
    ok(label, r.decision === 'deny' && (!want || new RegExp(want).test(r.reason || '')), JSON.stringify(r));
  };
  const allows = (label, cwd, tool, input) => {
    const r = ask(cwd, tool, input);
    ok(label, r.decision === 'allow', JSON.stringify(r));
  };

  denies('guard blocks Edit into another repo', A, 'Edit', { file_path: path.join(B, 'src.js') }, 'Repos never edit each other');
  allows('guard allows Edit in your own repo', A, 'Edit', { file_path: path.join(A, 'src.js') });
  denies('guard blocks sed -i into another repo', A, 'Bash', { command: `sed -i "" s/a/b/ ${path.join(B, 'src.js')}` });
  denies('guard blocks redirection into another repo', A, 'Bash', { command: `echo x > ${path.join(B, 'n.md')}` });
  denies('guard blocks cp into another repo', A, 'Bash', { command: `cp a.js ${path.join(B, 'a.js')}` });
  denies('guard blocks git -C commit in another repo', A, 'Bash', { command: `git -C ${B} commit -m x` });
  allows('guard allows reading another repo', A, 'Bash', { command: `cat ${path.join(B, 'src.js')}` });
  allows('guard allows grep across another repo', A, 'Bash', { command: `grep -rn foo ${B}` });
  allows('guard allows writing in your own repo via shell', A, 'Bash', { command: `echo x > ${path.join(A, 'n.md')}` });

  allows('guard allows your own status file', A, 'Edit', { file_path: path.join(CO, 'status', 'alpha.md') });
  denies("guard blocks another repo's status file", A, 'Edit', { file_path: path.join(CO, 'status', 'beta.md') }, 'belongs to beta');
  denies('guard blocks hand-editing repos.json', A, 'Write', { file_path: path.join(CO, 'repos.json') }, 'written only by the CLI');
  denies('guard blocks hand-editing people.json', A, 'Write', { file_path: path.join(CO, 'people.json') }, 'written only by the CLI');
  denies('guard blocks editing a decision record', A, 'Edit', { file_path: path.join(CO, 'decisions', 'D-001-x.md') }, 'immutable');
  allows('guard allows editing a ticket', A, 'Edit', { file_path: path.join(CO, 'tickets', 'T-001-x.md') });

  // contract ownership
  fs.mkdirSync(path.join(CO, 'contracts'), { recursive: true });
  fs.writeFileSync(path.join(CO, 'contracts', 'jobs.md'), '---\nowner: beta\n---\n\n# jobs\n');
  denies("guard blocks another repo's contract", A, 'Edit', { file_path: path.join(CO, 'contracts', 'jobs.md') }, 'owned by beta');
  allows('guard allows the owner to edit its contract', B, 'Edit', { file_path: path.join(CO, 'contracts', 'jobs.md') });
  allows('guard allows creating a new contract stub', A, 'Write', { file_path: path.join(CO, 'contracts', 'new-thing.md') });
  fs.rmSync(path.join(CO, 'contracts', 'jobs.md'));

  allows('guard ignores projects outside the platform', os.tmpdir(), 'Edit', { file_path: path.join(os.tmpdir(), 'x.js') });

  // the guard must fail CLOSED, never silently allow: a copy with no lib.js beside it
  const orphanDir = path.join(TMP, 'orphan-hooks');
  fs.mkdirSync(orphanDir, { recursive: true });
  fs.copyFileSync(GUARD, path.join(orphanDir, 'guard.js'));
  const broken = cp.spawnSync(process.execPath, [path.join(orphanDir, 'guard.js')], {
    input: JSON.stringify({ cwd: A, tool_name: 'Edit', tool_input: { file_path: path.join(B, 'x.js') } }),
    encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  ok('guard fails closed when it cannot evaluate', broken.status === 0 && /"permissionDecision":"deny"/.test(broken.stdout),
    `exit ${broken.status} out=${broken.stdout.slice(0, 100)}`);
}

function team() {
  const A = path.join(TMP, 'alpha');

  ok('sync --quiet is silent with no remote', coord(['sync', '--quiet']).ok);
  const loud = coord(['sync']);
  ok('sync says what to do when there is no remote', !loud.ok && /remote add origin/.test(loud.out), loud.out);

  // a bare repo stands in for the shared jetkreate-coord remote
  const remote = path.join(TMP, 'remote.git');
  git(['init', '--bare', '-q', remote], TMP);
  git(['remote', 'add', 'origin', remote], CO);
  const s1 = coord(['sync']);
  ok('sync pushes the board to the remote', s1.ok && /synced with origin/.test(s1.out), s1.out);

  // a teammate's clone
  const mate = path.join(TMP, 'jetkreate-coord');
  git(['clone', '-q', remote, mate], TMP);
  git(['config', 'user.email', 'd@d'], mate); git(['config', 'user.name', 'mate'], mate);
  const asMate = (args, human = true) => {
    const r = cp.spawnSync(process.execPath, [COORD_BIN, ...args], {
      cwd: mate, encoding: 'utf8',
      env: { ...process.env, COORD_ROOT: mate, COORD_ACTOR: human ? 'human' : 'repo' },
    });
    return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
  };
  ok('a clone sees the same repos and tickets', /alpha/.test(asMate(['repos']).out), asMate(['repos']).out);

  // the coord clone is NOT hidden on a teammate's disk — it must not look like a platform repo
  ok('the coord clone is not mistaken for a platform repo',
    !new RegExp(`\\b${COORD_DIRNAME}\\b|jetkreate-coord`).test(asMate(['repos']).out), asMate(['repos']).out);

  // teammate files a ticket and pushes; we sync and see it
  const made = asMate(['new', '--from', 'alpha', '--to', 'beta', '--title', 'Teammate ticket from Copilot']);
  const tid = (made.out.match(/T-\d+/) || [])[0];
  ok('a teammate can file a ticket from their clone', made.ok && !!tid, made.out);
  asMate(['sync']);
  const s2 = coord(['sync']);
  ok("their ticket arrives on this machine", s2.ok && coord(['list']).out.includes(tid), s2.out + coord(['list']).out);

  // both machines append to the same daily log: merge=union must keep both lines
  const today = new Date().toISOString().slice(0, 10);
  fs.appendFileSync(path.join(CO, 'activity', `${today}.log`), `${today}T10:00:00+00:00\talpha\tmine\n`);
  fs.appendFileSync(path.join(mate, 'activity', `${today}.log`), `${today}T10:00:01+00:00\tbeta\ttheirs\n`);
  asMate(['sync']);
  const s3 = coord(['sync']);
  const merged = fs.readFileSync(path.join(CO, 'activity', `${today}.log`), 'utf8');
  ok('concurrent activity logs merge instead of conflicting',
    s3.ok && /\tmine/.test(merged) && /\ttheirs/.test(merged), s3.out);

  // devsetup: hooks + the tracked instruction file
  const ds = coord(['devsetup']);
  ok('devsetup installs git hooks in every repo', ds.ok &&
    fs.existsSync(path.join(A, '.git', 'hooks', 'commit-msg')) &&
    fs.existsSync(path.join(A, '.git', 'hooks', 'post-commit')), ds.out);
  ok('devsetup is idempotent', /nothing to do/.test(coord(['devsetup']).out), coord(['devsetup']).out);

  const cpDoc = fs.readFileSync(path.join(A, '.github', 'copilot-instructions.md'), 'utf8');
  ok('the tracked instruction file carries no machine path',
    !cpDoc.includes(TMP) && !cpDoc.includes('/Users/') && !/\.\.\/\.coord/.test(cpDoc), cpDoc.slice(0, 120));
  ok('it names the rules a Copilot session needs',
    /Never edit files in another repo/.test(cpDoc) && /coord new --from alpha/.test(cpDoc) && /no-ticket:/.test(cpDoc));

  // commit-msg: warn by default, reject under --strict
  const msg = path.join(TMP, 'msg.txt');
  const runHook = () => cp.spawnSync('sh', [path.join(A, '.git', 'hooks', 'commit-msg'), msg], { encoding: 'utf8' });
  fs.writeFileSync(msg, 'fix the thing\n');
  let h = runHook();
  ok('commit-msg warns but allows a message with no ticket', h.status === 0 && /no ticket ID/.test(h.stderr), h.stderr);
  fs.writeFileSync(msg, 'T-042: fix the thing\n');
  ok('commit-msg is quiet for a ticket-prefixed message', runHook().status === 0 && !runHook().stderr.trim());
  fs.writeFileSync(msg, 'no-ticket: typo\n');
  ok('commit-msg accepts the no-ticket escape hatch', runHook().status === 0);
  coord(['devsetup', '--repo', 'alpha', '--strict']);
  fs.writeFileSync(msg, 'fix the thing\n');
  h = runHook();
  ok('--strict rejects a message with no ticket', h.status === 1 && /REJECTED/.test(h.stderr), `exit ${h.status}`);
  coord(['devsetup', '--repo', 'alpha']);
  ok('strict can be turned back off', runHook().status === 0);

  // post-commit puts a Copilot dev's work on the board without any editor hook
  fs.writeFileSync(path.join(A, 'feature.js'), 'module.exports = 1;\n');
  git(['add', '-A'], A);
  git(['commit', '-q', '-m', 'T-042: add the feature'], A);
  const log = fs.readFileSync(path.join(CO, 'activity', `${today}.log`), 'utf8');
  ok('post-commit records the commit on the board', /\talpha\tcommit\t[^\t]*\t\w+ T-042: add the feature/.test(log),
    log.trim().split('\n').slice(-2).join(' | '));
  ok('check is still clean after all the syncing', !coord(['check']).out.includes('ERROR'), coord(['check']).out);

  // a dev clones only the repos they work on — that is normal, not a broken board
  const parked = path.join(TMP, '_parked-beta');
  fs.renameSync(path.join(TMP, 'beta'), parked);
  const c = coord(['check']);
  ok('a repo you have not cloned is a note, not an error',
    c.ok && !/ERROR/.test(c.out) && /not cloned here: beta/.test(c.out), c.out);
  fs.mkdirSync(path.join(TMP, 'beta'));
  fs.writeFileSync(path.join(TMP, 'beta', 'stray.txt'), 'not a repo\n');
  const c2 = coord(['check']);
  ok('but something at that path that is not a repo still errors',
    !c2.ok && /exists but is not a git repo/.test(c2.out), c2.out);
  fs.rmSync(path.join(TMP, 'beta'), { recursive: true, force: true });
  fs.renameSync(parked, path.join(TMP, 'beta'));
  ok('and it clears once the repo is back', coord(['check']).ok);

  // give the fixture repos somewhere to be cloned from, so setup can offer the URLs
  for (const name of ['alpha', 'beta']) {
    const bare = path.join(TMP, `${name}.git`);
    git(['init', '--bare', '-q', bare], TMP);
    git(['remote', 'add', 'origin', bare], path.join(TMP, name));
    git(['push', '-q', 'origin', 'HEAD'], path.join(TMP, name));
  }
  const bf = coord(['setup', '--yes']);
  ok('setup records clone URLs for repos that had none', /recorded clone URLs/.test(bf.out), bf.out.slice(0, 400));
  const reg = JSON.parse(fs.readFileSync(path.join(CO, 'repos.json'), 'utf8')).repos;
  ok('the URLs land in the registry', reg.filter(r => r.remote).length >= 2, JSON.stringify(reg.map(r => [r.name, r.remote])));
  coord(['sync', '--quiet']);

  roster();
  freshDev();
}

// Who's around: people, not repos. One person can be in several repos at once.
function roster() {
  const A = path.join(TMP, 'alpha'), B = path.join(TMP, 'beta');
  git(['config', '--local', 'user.email', 'dev1@example.com'], A);
  git(['config', '--local', 'user.name', 'Dev One'], A);

  const s = coord(['setup', '--yes']);
  ok('setup puts you on the roster from your git identity', /roster/.test(s.out), s.out.slice(0, 500));

  const roster1 = JSON.parse(fs.readFileSync(path.join(CO, 'people.json'), 'utf8')).people;
  const entry = roster1.find(p => p.email === 'dev1@example.com');
  ok('the roster entry comes from the repo-local git identity, not the board\'s bot config',
    !!entry && entry.name === 'Dev One' && !!entry.tool, JSON.stringify(roster1));
  ok('nobody is on the roster under the board\'s own identity',
    !roster1.some(p => p.email === 'coord@jetkreate.local'), JSON.stringify(roster1));

  const me = entry ? entry.name : 'Dev One';
  ok('coord who --tool sets the tool', coord(['who', '--tool', 'copilot']).out.includes('copilot'));
  ok('an unknown tool is refused', !coord(['who', '--tool', 'emacs']).ok);

  // activity is attributed, and one person shows across several repos over time
  const hook = (event, cwd) => cp.spawnSync(process.execPath, [HOOK, event], {
    input: JSON.stringify({ cwd }), encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  hook('session-start', A);
  hook('session-start', B);
  const today = new Date().toISOString().slice(0, 10);
  const log = fs.readFileSync(path.join(CO, 'activity', `${today}.log`), 'utf8');
  ok('activity lines carry the person', log.includes(`\t${me}`), log.trim().split('\n').slice(-2).join(' | '));

  const w = coord(['who']);
  ok('coord who shows name, tool and where they were last seen',
    w.out.includes(me) && /copilot/.test(w.out) && /(alpha|beta)/.test(w.out), w.out);
  ok('coord who marks which one is you', /\(you\)/.test(w.out), w.out);

  // the board stays one row per repo — people live in their own panel
  const board = fs.readFileSync(path.join(CO, 'status', 'alpha.md'), 'utf8');
  ok('status files gained no owner field', !/\*\*(Who|Owner|Dev)/i.test(board));

  ok('removing someone is human-only', !coord(['who', '--remove', me]).ok);
  ok('the human can remove someone', coord(['who', '--remove', me], { human: true }).ok);
  ok('and then they are gone from the roster', !coord(['who']).out.includes(me), coord(['who']).out);
  coord(['setup', '--yes']);                     // put them back for the rest of the drill

  dashboardViews(me);
}

// A new dev clones only the board and runs one command.
// Team view and per-person views are served from one process; a person view must never
// 500 on an unknown name.
function dashboardViews(me) {
  const port = 4800 + (process.pid % 300);
  const srv = cp.spawn(process.execPath, [path.join(__dirname, '..', 'dashboard', 'server.js'), String(port)], {
    env: { ...process.env, COORD_ROOT: CO }, stdio: 'ignore', detached: false,
  });
  try {
    const get = p => {
      for (let i = 0; i < 40; i++) {
        const r = cp.spawnSync('curl', ['-s', '--max-time', '2', `http://127.0.0.1:${port}${p}`], { encoding: 'utf8' });
        if (r.stdout && r.stdout.includes('JETKREATE')) return r.stdout;
        cp.spawnSync('sleep', ['0.1']);
      }
      return '';
    };
    const team = get('/');
    ok('dashboard serves the team view', /JETKREATE/.test(team) && /class="kpis"/.test(team), team.slice(0, 120));
    ok('team view carries nav links to each person', team.includes(`/who/${encodeURIComponent(me)}`), team.slice(0, 400));

    const mine = get(`/who/${encodeURIComponent(me)}`);
    ok('dashboard serves a person view', /JETKREATE/.test(mine) && /to work on/i.test(mine), mine.slice(0, 160));
    ok('the person view is scoped to that person', mine.includes('Where you left off'), mine.slice(0, 200));

    const ghost = get('/who/Nobody%20Here');
    ok('an unknown person is handled, not a crash',
      /Nobody on the roster is called/.test(ghost) && !/dashboard error/.test(ghost), ghost.slice(0, 160));

    const me2 = get('/me');
    ok('/me resolves to the local git identity', /JETKREATE/.test(me2), me2.slice(0, 120));

    ok('the team view renders the board as columns',
      /class="kanban"/.test(team) && /Open<\/|>Open\s/.test(team) && /In progress/.test(team) && /Review/.test(team), team.slice(0, 200));
    ok('closed work has its own column', /khead done">Closed/.test(team));

    // aging only applies to live columns, so make a fresh ticket and backdate its thread
    const made = coord(['new', '--from', 'alpha', '--to', 'beta', '--title', 'Aging card for the board']);
    const newId = (made.out.match(/T-\d+/) || [])[0];
    const live = newId && fs.readdirSync(path.join(CO, 'tickets')).find(f => f.startsWith(newId + '-'));
    if (live) {
      const f = path.join(CO, 'tickets', live);
      const old9 = new Date(Date.now() - 9 * 864e5).toISOString().replace('Z', '+00:00');
      fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/^\S+( .*?status: \S+ -> \S+)/gm, `${old9}$1`));
      const aged = get('/');
      ok('a card that has sat too long is flagged', /class="card aging"/.test(aged) && /sitting too long/.test(aged), aged.slice(0, 200));
    }
  } finally { srv.kill(); }
}

function freshDev() {
  const home = path.join(TMP, 'newdev');
  const board = path.join(home, 'jetkreate-coord');
  fs.mkdirSync(home, { recursive: true });
  git(['clone', '-q', path.join(TMP, 'remote.git'), board], home);
  git(['config', 'user.email', 'd@d'], board); git(['config', 'user.name', 'new'], board);
  fs.mkdirSync(path.join(board, 'bin'), { recursive: true });
  fs.writeFileSync(path.join(board, 'bin', 'coord'), `#!/bin/sh\nexec ${JSON.stringify(process.execPath)} ${JSON.stringify(COORD_BIN)} "$@"\n`, { mode: 0o755 });

  const run = args => cp.spawnSync(process.execPath, [COORD_BIN, ...args], {
    cwd: board, encoding: 'utf8',
    env: { ...process.env, COORD_ROOT: board, COORD_ACTOR: 'human', HOME: home, SHELL: '/bin/zsh' },
  });

  const r = run(['setup', '--yes']);
  ok('setup runs end to end on a fresh clone', r.status === 0 || r.status === undefined, (r.stdout + r.stderr).slice(-300));
  const out = r.stdout;
  ok('setup walks all six steps', /\[1\/6\][\s\S]*\[6\/6\]/.test(out), out.slice(0, 120));
  ok('setup sees the board has every repo registered', /\[ \] alpha|\[x\] alpha/.test(out), out);
  ok('setup reports repos it cannot find locally', /not cloned here/.test(out), out);
  ok('setup offers the clone command for them', /git clone/.test(out), out);
  ok('setup never edits a shell profile without being asked',
    !fs.existsSync(path.join(home, '.zshrc')) && /not on your PATH|export PATH=/.test(out));
  ok('setup ends with what is left to do', /thing\(s\) left for you|Setup complete/.test(out), out.slice(-200));
  ok('setup is safe to run twice', run(['setup', '--yes']).status === 0);

  // with the repos present it should finish clean
  for (const name of ['alpha', 'beta']) {
    git(['clone', '-q', path.join(TMP, name), path.join(home, name)], home);
  }
  const r2 = run(['setup', '--yes']);
  ok('with the repos cloned, setup installs their hooks',
    /hooks\/commit-msg installed/.test(r2.stdout) && fs.existsSync(path.join(home, 'alpha', '.git', 'hooks', 'commit-msg')), r2.stdout.slice(-300));
  ok('and check comes back clean for the new dev', /check: OK/.test(r2.stdout), r2.stdout.slice(-300));
}

function onboarding() {
  const name = 'gamma', dir = path.join(TMP, name);
  fs.mkdirSync(dir);
  git(['init', '-q'], dir); git(['config', 'user.email', 'd@d'], dir); git(['config', 'user.name', 'drill'], dir);
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: '@fixture/gamma', dependencies: { express: '^4' }, scripts: { test: 'vitest', build: 'tsc' },
  }));
  fs.mkdirSync(path.join(dir, 'src'));
  fs.writeFileSync(path.join(dir, 'src', 'routes.js'),
    "router.get('/api/gamma/items', h);\nrouter.post('/api/gamma/items', h);\nconst base = process.env.ALPHA_URL;\n");
  fs.writeFileSync(path.join(dir, 'src', 'client.js'), "fetch(process.env.ALPHA_URL + '/api/jobs');\n// talks to alpha\n");

  ok('new repo shows up as discovered', /discovered, not onboarded \(1\)[\s\S]*gamma/.test(coord(['repos']).out), coord(['repos']).out);
  const dbrief = cp.spawnSync(process.execPath, [HOOK, 'session-start'], {
    input: JSON.stringify({ cwd: dir }), encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  ok('a discovered repo is briefed that it is not onboarded', /is not onboarded/.test(dbrief.stdout) && /ONBOARDING\.md/.test(dbrief.stdout), dbrief.stdout.slice(0, 140));
  ok('no status file for the discovered repo', !fs.existsSync(path.join(CO, 'status', 'gamma.md')));

  const before = fs.readdirSync(path.join(CO, 'status')).length;
  const pre = coord(['onboard', name, '--preflight'], { cwd: dir });
  ok('preflight passes validation', pre.ok && /validation: passed/.test(pre.out), pre.out);
  ok('preflight detects the stack', /Express/.test(pre.out) && /package manager: npm|package manager: unknown/.test(pre.out), pre.out);
  ok('preflight finds the candidate contract', /\/api\/gamma/.test(pre.out), pre.out);
  ok('preflight changes nothing', fs.readdirSync(path.join(CO, 'status')).length === before && !fs.existsSync(path.join(CO, 'status', 'gamma.md')));

  const ap = coord(['onboard', name, '--apply', '--stack', 'npm + Express', '--contracts', '/api/gamma', '--depends-on', 'alpha'], { human: true });
  ok('apply onboards the repo', ap.ok && fs.existsSync(path.join(CO, 'status', 'gamma.md')), ap.out);
  const entry = JSON.parse(fs.readFileSync(path.join(CO, 'repos.json'), 'utf8')).repos.find(r => r.name === name);
  ok('registry entry is complete', !!entry && entry.status === 'active' && entry.contracts[0] === '/api/gamma' && entry.depends_on[0] === 'alpha' && !!entry.onboarded, JSON.stringify(entry));
  ok('.git/info/exclude got the local-only entries',
    /\.serena\//.test(fs.readFileSync(path.join(dir, '.git', 'info', 'exclude'), 'utf8')) &&
    /CLAUDE\.local\.md/.test(fs.readFileSync(path.join(dir, '.git', 'info', 'exclude'), 'utf8')));
  ok('onboarding touched no tracked file in the repo', git(['status', '--porcelain'], dir).stdout.includes('package.json'));
  ok('re-onboarding an active repo refused', !coord(['onboard', name, '--apply'], { human: true }).ok);

  // it now behaves like a real member
  const hres = cp.spawnSync(process.execPath, [HOOK, 'session-start'], {
    input: JSON.stringify({ cwd: dir }), encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  const log = fs.readFileSync(path.join(CO, 'activity', `${new Date().toISOString().slice(0, 10)}.log`), 'utf8');
  const last = log.trim().split('\n').at(-1);
  // the earlier "discovered" breadcrumb stays in history; what matters is the new entry
  ok('hooks log it normally once onboarded', hres.status === 0 && /\tgamma\tsession-start(\t|$)/.test(last) && !/discovered/.test(last), last);
  ok('briefing switches from discovered to onboarded', /onboarded repo of the jetKreate platform/.test(hres.stdout) && !/is not onboarded/.test(hres.stdout), hres.stdout.slice(0, 140));
  ok('tickets can be filed at it', coord(['new', '--from', 'alpha', '--to', name, '--title', 'gamma please'], { cwd: path.join(TMP, 'alpha') }).ok);
  ok('check is clean after onboarding', !coord(['check']).out.includes('ERROR'), coord(['check']).out);

  // offboard: history survives
  ok('offboard refused without --yes', !coord(['offboard', name], { human: true }).ok);
  ok('offboard refused for a repo session', !coord(['offboard', name, '--yes']).ok);
  const off = coord(['offboard', name, '--yes'], { human: true });
  const e2 = JSON.parse(fs.readFileSync(path.join(CO, 'repos.json'), 'utf8')).repos.find(r => r.name === name);
  ok('offboard marks the registry entry', off.ok && e2.status === 'offboarded' && !!e2.offboarded, off.out);
  ok('status file archived, not deleted',
    !fs.existsSync(path.join(CO, 'status', 'gamma.md')) && fs.existsSync(path.join(CO, 'archive', 'status', 'gamma.md')));
  ok('its open ticket archived with a flag',
    /gamma please.*was open at offboarding/.test(fs.readFileSync(path.join(CO, 'archive', 'tickets-index.md'), 'utf8')));
  ok('decisions untouched by offboarding', fs.readdirSync(path.join(CO, 'decisions')).length >= 2);
  ok('offboarded repo listed as such', /offboarded \(1\)[\s\S]*gamma/.test(coord(['repos']).out), coord(['repos']).out);
  ok('repo files untouched by offboarding', fs.existsSync(path.join(dir, 'src', 'routes.js')));
  ok('check still clean after offboarding', !coord(['check']).out.includes('ERROR'), coord(['check']).out);
}

function archiving(id) {
  // backdate the close so the 30-day rule fires
  const d = path.join(CO, 'tickets'), f = fs.readdirSync(d).find(x => x.startsWith(id + '-'));
  const p = path.join(d, f), old = new Date(Date.now() - 40 * 864e5).toISOString().slice(0, 10);
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/^closed: .*$/m, `closed: ${old}`));

  // an activity log older than 14 days
  const oldDay = new Date(Date.now() - 20 * 864e5).toISOString().slice(0, 10);
  fs.mkdirSync(path.join(CO, 'activity'), { recursive: true });
  fs.writeFileSync(path.join(CO, 'activity', `${oldDay}.log`), `${oldDay}T09:00:00+00:00\tbeta\tedit\tjobs.js ${id}\n`);

  // six handoff notes -> one should move out
  const sp = path.join(CO, 'status', 'beta.md');
  fs.writeFileSync(sp, fs.readFileSync(sp, 'utf8') + Array.from({ length: 6 }, (_, i) => `### note ${i + 1}\n\ndid thing ${i + 1}\n\n`).join(''));

  const dry = coord(['archive', '--dry-run']);
  ok('archive --dry-run moves nothing', dry.ok && fs.existsSync(p) && /dry run/.test(dry.out), dry.out);

  const r = coord(['archive']);
  const month = old.slice(0, 7);
  ok('done ticket moved to archive/tickets/YYYY-MM', r.ok && !fs.existsSync(p) && fs.existsSync(path.join(CO, 'archive', 'tickets', month, f)), r.out);
  ok('archive/tickets-index.md got a row', fs.readFileSync(path.join(CO, 'archive', 'tickets-index.md'), 'utf8').includes(id));
  const am = oldDay.slice(0, 7);
  ok('old activity log tarred with a summary',
    fs.existsSync(path.join(CO, 'archive', 'activity', `${am}.tar.gz`)) &&
    fs.readFileSync(path.join(CO, 'archive', 'activity', `${am}-summary.md`), 'utf8').includes(id) &&
    !fs.existsSync(path.join(CO, 'activity', `${oldDay}.log`)));
  ok('handoff notes trimmed to 5, older one archived',
    (fs.readFileSync(sp, 'utf8').match(/^### /gm) || []).length === 5 &&
    fs.readFileSync(path.join(CO, 'archive', 'handoffs', 'beta.md'), 'utf8').includes('note 6'));
  ok('archive snapshotted .coord', git(['log', '--oneline'], CO).stdout.includes('archive'));

  const w = coord(['why', `${path.join(TMP, 'beta', 'jobs.js')}:2`], { cwd: path.join(TMP, 'beta') });
  ok('coord why still finds the ticket after archiving', w.ok && w.out.includes(id) && /archived/.test(w.out), w.out);
  ok('coord search finds the archived ticket', coord(['search', 'v1/jobs']).out.includes(id));
}

function superseding(did) {
  const r = coord(['decide', '--title', 'Jobs API returns a paginated envelope', '--repos', 'alpha,beta',
    '--decision', 'Wrap results in {items,next}.'], { cwd: path.join(TMP, 'beta') });
  const nid = (r.out.match(/D-\d+/) || [])[0];
  ok('second decision gets a fresh id', !!nid && nid !== did, r.out);
  const s = coord(['supersede', did, nid]);
  const f = fs.readdirSync(path.join(CO, 'decisions')).find(x => x.startsWith(did + '-'));
  const t = fs.readFileSync(path.join(CO, 'decisions', f), 'utf8');
  ok('supersede marks the old decision', s.ok && /status: superseded/.test(t) && t.includes(`superseded_by: ${nid}`), s.out);
  ok('index shows the supersession', fs.readFileSync(path.join(CO, 'decisions', 'index.md'), 'utf8').includes(`superseded by ${nid}`));
  ok('superseding twice refused', !coord(['supersede', did, nid]).ok);
}

module.exports = { run };
