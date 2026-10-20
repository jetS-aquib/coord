'use strict';
// End-to-end self-test in a throwaway folder with two fake repos.
// Never touches real files: everything hangs off COORD_ROOT in a temp dir.
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const COORD_BIN = path.join(__dirname, 'coord');
const HOOK = path.join(__dirname, '..', 'hooks', 'hook.js');
const GUARD = path.join(__dirname, '..', 'hooks', 'guard.js');
const COORD_DIRNAME = path.basename(path.join(__dirname, '..'));

let pass = 0, fail = 0, TMP, CO, HOME;
const ok = (name, cond, detail = '') => {
  (cond ? pass++ : fail++);
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond || !detail ? '' : '\n        ' + String(detail).trim().split('\n').join('\n        ')}`);
};
const git = (args, cwd) => cp.spawnSync('git', args, { cwd, encoding: 'utf8' });
// Local offset, like L.nowISO(). Never toISOString(): the board compares these as strings.
const L_nowish = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().replace('Z', '+00:00');
const statusPath = (CO, repo) => {
  const d = path.join(CO, 'status', repo);
  const f = (fs.existsSync(d) ? fs.readdirSync(d) : []).find(n => n.endsWith('.md'));
  return path.join(d, f || 'drill.md');
};

function coord(args, { cwd = TMP, human = false } = {}) {
  const r = cp.spawnSync(process.execPath, [COORD_BIN, ...args], {
    cwd, encoding: 'utf8',
    // COORD_ROOT alone does not sandbox this: the agent-hook installers are rooted at
    // os.homedir(), not the board, so a plain `coord setup` here rewrites the real
    // ~/.claude/settings.json and ~/.copilot/hooks/coord.json to point into TMP — which
    // the drill then deletes, leaving every session on the machine failing its hooks.
    // USERPROFILE too: that is what os.homedir() reads on Windows.
    env: { ...process.env, COORD_ROOT: CO, COORD_ACTOR: human ? 'human' : 'repo',
           HOME, USERPROFILE: HOME },
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
  HOME = path.join(TMP, 'home');
  fs.mkdirSync(HOME, { recursive: true });
  console.log(`drill: ${TMP}\n`);
  try {
    setup();
    const id = lifecycle();
    const did = decision(id);
    commitAndWhy(id, did);
    hooks(id);
    guard();
    copilot();
    quiet();
    umbrella();
    navigating();
    graphs();
    colliding();
    captured();
    team();
    onboarding();
    archiving(id);
    superseding(did);
    resilience();
    scattered();
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
  // Tracked from the start, as bin/ is in the real board — a clone of the board has to
  // carry the CLI, or it looks like an ordinary repo sitting beside the platform.
  git(['add', '-f', 'bin/coord'], CO);

  coord(['list']);
  ok('discovered repos get no status file', !fs.existsSync(path.join(CO, 'status')) || !fs.readdirSync(path.join(CO, 'status')).length,
    fs.existsSync(path.join(CO, 'status')) ? fs.readdirSync(path.join(CO, 'status')).join(' ') : '');
  ok('an empty roster says so', /nobody on the roster/.test(coord(['who']).out), coord(['who']).out);
  ok('both fake repos listed as discovered', /discovered, not onboarded \(2\)/.test(coord(['repos']).out), coord(['repos']).out);

  for (const r of ['alpha', 'beta']) coord(['onboard', r, '--apply', '--stack', 'fixture'], { human: true });
  const st = fs.readdirSync(path.join(CO, 'status'));
  ok('onboarding creates a status folder per repo, one file per person',
    st.length === 2 && st.includes('alpha') && st.includes('beta') &&
    fs.readdirSync(path.join(CO, 'status', 'alpha')).some(f => f.endsWith('.md')), st.join(' '));
  ok('non-repo folder never appears', !st.includes('not-a-repo.md'));
  ok('tickets refused for an unregistered repo', !coord(['new', '--from', 'alpha', '--to', 'ghost', '--title', 'x']).ok);
}

function lifecycle() {
  let r = coord(['new', '--from', 'alpha', '--to', 'beta', '--title', 'Add /v1/jobs endpoint',
    '--request', 'Expose GET /v1/jobs returning {id,state}.', '--reason', 'alpha cannot poll job state.',
    '--understanding', 'One new GET route on the existing router. Assuming no pagination.',
    '--plan', '1. add the route\n2. add a zod schema for the response',
    '--files', 'src/api/jobs.js'], { cwd: path.join(TMP, 'alpha') });
  const id = (r.out.match(/JET-\d+/) || [])[0];
  ok('coord new creates a ticket in status open', r.ok && !!id && /status: - -> open/.test(readT(id)), r.out);

  // What a person reads before approving: the agent's own restatement and its plan.
  // Approving a one-line title is rubber-stamping.
  ok('the ticket records what the agent understood and how it will do it',
    /## Understanding/.test(readT(id)) && /Assuming no pagination/.test(readT(id)) &&
    /## Plan/.test(readT(id)) && /add a zod schema/.test(readT(id)), readT(id));
  const shown = coord(['show', id]);
  ok('coord show renders it for a person, not as raw markdown',
    shown.ok && /WHAT IT UNDERSTOOD THAT TO MEAN/.test(shown.out) && !/^---$/m.test(shown.out), shown.out);
  ok('coord show spells out every way of answering', (() => {
    const o = shown.out, n = id.replace(/^\D+/, '');
    return /WHAT YOU CAN DO/.test(o) && o.includes('coord ok ' + n) &&
      o.includes('coord no ' + n) && o.includes('coord note ' + n) && /revise /.test(o);
  })(), shown.out);
  ok('coord show --raw still gives the file', /^---$/m.test(coord(['show', id, '--raw']).out));

  // Discussion without commitment: the common case is one question, not a rejection.
  const n = coord(['note', id, 'does this need pagination?']);
  ok('coord note adds to the thread without moving the ticket',
    n.ok && /does this need pagination\?/.test(readT(id)) && /^status: open$/m.test(readT(id)), n.out);
  ok('and says nothing moved', /Nothing moved/.test(n.out) && /still waiting/.test(n.out), n.out);
  ok('a note with nothing in it is refused', !coord(['note', id]).ok);

  // A ticket filed without them should say so rather than look complete.
  const bare = coord(['new', '--from', 'alpha', '--to', 'beta', '--title', 'Bare one'], { cwd: path.join(TMP, 'alpha') });
  const bid = (bare.out.match(/JET-\d+/) || [])[0];
  ok('a ticket with no Understanding or Plan warns before approval',
    /does not say what it understood/.test(coord(['show', bid]).out), coord(['show', bid]).out);
  coord(['reject', bid, 'drill fixture'], { human: true });

  ok('bad repo name refused', !coord(['new', '--from', 'nope', '--to', 'beta', '--title', 'x']).ok);
  ok('invalid transition open -> done refused', !coord(['done', id], { human: true }).ok, coord(['done', id], { human: true }).out);
  ok('invalid transition open -> review refused', !coord(['review', id]).ok);

  r = coord(['approve', id]);
  ok('an agent cannot approve its own ticket', !r.ok && /a person's call, not an agent's/.test(r.out), r.out);
  ok('and it names who should', !r.ok && /Ask .+ to run: coord approve/.test(r.out), r.out);
  // before anyone is on the roster there is no filer to record; the field is still there
  // and an empty one must not lock the ticket, or a fresh board would be unusable
  ok('the ticket carries a filed_by field', /^filed_by:/m.test(readT(id)), readT(id).split('\n').slice(0, 8).join(' | '));
  ok('an unknown filer asks for anyone rather than naming nobody',
    /Ask whoever asked for this/.test(coord(['approve', id]).out), coord(['approve', id]).out);
  // The two verbs a person actually types. Everything long is the agent's job.
  ok('coord on its own shows what is waiting, not the usage dump', (() => {
    const o = coord([], { human: true }).out;
    return /waiting for you to approve it/.test(o) && /coord ok/.test(o) && !/cross-repo coordination/.test(o);
  })(), coord([], { human: true }).out);
  ok('a bare number is a ticket id', coord(['show', id.replace(/^\D+/, '')]).out.includes(id));
  ok('coord no needs a reason', !coord(['no', id.replace(/^\D+/, '')], { human: true }).ok);

  r = coord(['ok'], { human: true });
  ok('coord ok approves the one thing waiting, with no id at all',
    r.ok && /status: open -> approved/.test(readT(id)), r.out);
  ok('and it is recorded as a normal approval, not something new',
    /approve|approved/.test(readT(id)), readT(id));

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
  // The rules live in jetKreate/CLAUDE.md, which loads in every session under this folder.
  // Repeating them in the briefing costs ~100 tokens a session to say the same thing twice.
  ok('briefing does not repeat what CLAUDE.md already says',
    !/PreToolUse hook/.test(ctx) && !/full rules are in/.test(ctx), ctx.slice(0, 200));
  ok('briefing stays small', ctx.length < 700, `${ctx.length} chars`);

  n = lines().length;
  const edit = () => hook('edit', { cwd: path.join(TMP, 'beta'), tool_input: { file_path: path.join(TMP, 'beta', 'jobs.js') } });
  r = edit();
  ok('hook logs edits with a repo-relative path', r.status === 0 && /\tbeta\tedit\t[^\t]*\tjobs\.js$/.test(lines().at(-1)), lines().at(-1));

  // Twice, deliberately. The rate limits inside the edit path — the heartbeat clock and
  // the overlap reminder — both short-circuit on a first run, so a single edit never
  // reaches the code that reads them. That is how two constants sat in the temporal dead
  // zone for days, throwing on every edit after the first, with a green drill.
  r = edit();
  ok('a second edit works too, where the rate limits actually get read', r.status === 0 && lines().length > n + 1, r.stdout + r.stderr);

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

// Copilot speaks a different dialect of the same protocol: camelCase fields in, a flat
// decision out, exit 2 as a deny. Everything the guard promises has to hold in both, or
// three quarters of the team is running without a guard and nobody can tell.
function copilot() {
  const A = path.join(TMP, 'alpha'), B = path.join(TMP, 'beta');
  const askCp = (cwd, toolName, toolArgs) => cp.spawnSync(process.execPath, [GUARD], {
    input: JSON.stringify({ cwd, sessionId: 's1', timestamp: Date.now(), toolName, toolArgs }),
    encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });

  const denied = r => {
    try { return JSON.parse(r.stdout).permissionDecision === 'deny'; } catch { return false; }
  };
  const asked = r => { try { return JSON.parse(r.stdout).permissionDecision === 'ask'; } catch { return false; } };

  let r = askCp(A, 'createFile', { path: path.join(B, 'src.js') });
  ok('copilot dialect: a cross-repo write is put to the person', asked(r), r.stdout.slice(0, 120) + ' exit ' + r.status);
  // An "ask" that exited 2 would be a refusal, which is the opposite of asking.
  ok('copilot dialect: and asking does NOT exit 2', r.status === 0, 'exit ' + r.status);

  // A refusal is a different thing and still uses the strongest signal the harness has.
  r = askCp(A, 'createFile', { path: path.join(CO, 'repos.json') });
  ok('copilot dialect: what the CLI owns is still refused', denied(r), r.stdout.slice(0, 120));
  ok('copilot dialect: a refusal exits 2, which denies even if stdout is ignored', r.status === 2, 'exit ' + r.status);
  ok('copilot dialect: the reason reaches the agent on stderr too', /written only by the CLI/.test(r.stderr), r.stderr.slice(0, 80));

  // One answer, both dialects, so neither harness has to be detected correctly to be obeyed.
  const both = JSON.parse(r.stdout);
  ok('one answer carries both dialects at once',
    both.permissionDecision === 'deny' && both.hookSpecificOutput.permissionDecision === 'deny'
    && both.hookSpecificOutput.hookEventName === 'PreToolUse');

  // Claude's config filters tools before the guard sees them; Copilot's matcher is a
  // regex on names we are guessing at. So the guard has to know a read when it sees one
  // — otherwise the day a read slips through the matcher, reading goes from "always
  // fine" to blocked, and that is worse than not guarding at all.
  for (const t of ['readFile', 'viewFile', 'grepSearch', 'listDirectory', 'fileSearch']) {
    r = askCp(A, t, { path: path.join(B, 'src.js') });
    ok(`copilot dialect: ${t} on another repo is allowed`, r.status === 0 && !r.stdout.trim(), r.stdout.slice(0, 80));
  }
  r = askCp(A, 'runInTerminal', { command: `cat ${path.join(B, 'src.js')}` });
  ok('copilot dialect: a shell read of another repo is allowed', r.status === 0 && !r.stdout.trim(), r.stdout.slice(0, 80));
  r = askCp(A, 'runInTerminal', { command: `echo x > ${path.join(B, 'n.md')}` });
  ok('copilot dialect: a shell write into another repo is put to the person', asked(r), r.stdout.slice(0, 80));
  r = askCp(A, 'editFile', { filePath: path.join(A, 'src.js') });
  ok('copilot dialect: your own repo is yours', r.status === 0 && !r.stdout.trim(), r.stdout.slice(0, 80));
  r = askCp(A, 'applyPatch', { targetFile: path.join(B, 'src.js') });
  ok('copilot dialect: every spelling of the file argument is seen', asked(r), r.stdout.slice(0, 80));

  // The briefing has to arrive in a Copilot session too, or a Copilot dev is back to
  // typing "coord" by hand, which was the whole point of this.
  const brief = cp.spawnSync(process.execPath, [HOOK, 'session-start'], {
    input: JSON.stringify({ cwd: A, sessionId: 's1', timestamp: Date.now(), source: 'startup' }),
    encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  let out = {};
  try { out = JSON.parse(brief.stdout); } catch { /* reported by the assertion */ }
  ok('copilot dialect: session start still briefs the session', /alpha/.test(out.additionalContext || ''), brief.stdout.slice(0, 120));
  ok('the briefing is carried in both dialects', (out.additionalContext || '') === ((out.hookSpecificOutput || {}).additionalContext || ''));

  /* --- the config we write into ~/.copilot/hooks --- */
  const D = require('./devsetup.js');
  const cfgFile = path.join(TMP, 'copilot-hooks', 'coord.json');
  const lines = D.installCopilotHooks({ file: cfgFile });
  const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
  ok('the copilot hook file declares version 1', cfg.version === 1);
  ok('it wires all four moments', ['sessionStart', 'sessionEnd', 'postToolUse', 'preToolUse'].every(e => (cfg.hooks[e] || []).length === 1),
    Object.keys(cfg.hooks).join(','));
  const cmds = Object.values(cfg.hooks).flat();
  ok('every command is an absolute path to a hook that exists', cmds.every(h => {
    const m = /"([^"]+)"\s+"([^"]+)"/.exec(h.bash);
    return m && path.isAbsolute(m[2]) && fs.existsSync(m[2]);
  }), JSON.stringify(cmds[0]));
  ok('windows gets the same command through powershell', cmds.every(h => h.powershell === h.bash));
  ok('every hook has a timeout, so a wedged board cannot wedge a session', cmds.every(h => h.timeoutSec > 0));

  // The matchers are guesses at another vendor's tool names. They may be wrong; they
  // must not be wrong in the direction that silently stops guarding.
  const pre = cfg.hooks.preToolUse[0].matcher;
  for (const name of ['createFile', 'editFile', 'applyPatch', 'runInTerminal', 'insertEdit', 'str_replace_editor', 'bash'])
    ok(`preToolUse matcher catches ${name}`, new RegExp(`^(?:${pre})$`).test(name), pre);

  ok('re-running changes nothing', D.installCopilotHooks({ file: cfgFile }).join(' ').includes('already'), lines.join(' '));
  fs.writeFileSync(cfgFile, '{"version":1,"hooks":{"preToolUse":[{"type":"command","bash":"mine"}]}}');
  D.installCopilotHooks({ file: cfgFile });
  ok('a coord.json that was not ours is backed up, never just overwritten',
    fs.readdirSync(path.dirname(cfgFile)).some(n => n.includes('.bak.')), fs.readdirSync(path.dirname(cfgFile)).join(','));
}

// Batch 2: the lifecycle still runs, but a dev should never have to see it. These are
// the assertions that keep it that way — the moment an internal state name or the word
// "ticket" reaches a person, someone has been given a process to learn.
function quiet() {
  const L = require('./lib.js');
  const INTERNAL = /\bin_progress\b|\bapproved\b|\brejected\b/;

  ok('every internal state has a plain word', L.TICKET_STATUS.every(st => L.plain(st) && !INTERNAL.test(L.plain(st))),
    L.TICKET_STATUS.map(st => st + '->' + L.plain(st)).join(' '));
  ok('and there are only three of them, plus dropped',
    new Set(L.TICKET_STATUS.map(st => L.plain(st))).size === 4, [...new Set(L.TICKET_STATUS.map(st => L.plain(st)))].join(' '));

  for (const args of [['list'], ['show', 'JET-001'], []]) {
    const out = coord(args, { human: true }).out;
    ok(`"coord ${args.join(' ') || '(bare)'}" shows no internal state name`, !INTERNAL.test(out), out.slice(0, 200));
    ok(`"coord ${args.join(' ') || '(bare)'}" does not say "ticket"`, !/\bticket\b/i.test(out), out.slice(0, 200));
  }

  const help = coord(['help']).out, all = coord(['help', '--all']).out;
  ok('the default help does not list the commands an agent runs',
    !/approve <id>/.test(help) && !/coord start/.test(help) && !/review <id>/.test(help), help.slice(0, 300));
  ok('help --all does', /approve <id>/.test(all) && /review <id>/.test(all));
  ok('and the hidden commands still work', coord(['approve', 'JET-001'], { human: true }).out !== undefined);

  /* --- ask once, then stay out of the way --- */
  const A = path.join(TMP, 'alpha'), B = path.join(TMP, 'beta');
  const tryWrite = (session, file) => {
    const r = cp.spawnSync(process.execPath, [GUARD], {
      input: JSON.stringify({ cwd: A, session_id: session, tool_name: 'Write', tool_input: { file_path: file } }),
      encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
    });
    if (!r.stdout.trim()) return 'allow';
    try { return JSON.parse(r.stdout).permissionDecision; } catch { return 'unparseable: ' + r.stdout.slice(0, 60); }
  };
  const land = (session, file) => cp.spawnSync(process.execPath, [HOOK, 'edit'], {
    input: JSON.stringify({ cwd: A, session_id: session, tool_input: { file_path: file } }),
    encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  const other = path.join(B, 'shared.js');

  ok('the first cross-repo write is a question, not a refusal', tryWrite('s1', other) === 'ask', tryWrite('s1', other));
  land('s1', other);                                   // the person said yes, so the write happened
  ok('after a yes, the rest of that session passes without asking', tryWrite('s1', other) === 'allow', tryWrite('s1', other));
  ok('and a different file in the same pair passes too', tryWrite('s1', path.join(B, 'other.js')) === 'allow');
  ok('a different session is asked again — a licence is one sitting, not a policy', tryWrite('s2', other) === 'ask');

  // The things the CLI owns are not judgement calls and are still refused outright.
  ok('repos.json is still refused, not put to a vote', tryWrite('s1', path.join(CO, 'repos.json')) === 'deny');
  ok('a decision record is still refused', tryWrite('s1', path.join(CO, 'decisions', 'D-001-x.md')) === 'deny');

  // A licence is about this machine and this sitting. If one ever reached the shared
  // board, everyone else would silently inherit permission somebody gave on their own
  // laptop — which is the opposite of what the guard is for.
  const shared = ['state.json', 'repos.json', 'people.json', 'notify.json']
    .map(n => L.read(path.join(CO, n))).join('');
  ok('a licence never reaches the shared board', !/licence/i.test(shared));
  ok('it lives in local.json, which is not tracked',
    /licences/.test(fs.readFileSync(path.join(CO, 'local.json'), 'utf8')) &&
    git(['ls-files', 'local.json'], CO).stdout.trim() === '');
}

// Batch 3: the board was empty after four days not because nothing happened but because
// writing it down is a separate act performed after the interesting part is over. These
// assertions are about the note writing itself — and, just as much, about it staying
// honest: a note that guesses a reason is worse than no note, because the next person
// believes it.
function captured() {
  const L = require('./lib.js');
  // In a child with COORD_ROOT set, never in-process: lib resolves its paths once at
  // load, so calling capture() here would read and write the real board instead of the
  // fixture — and quietly pass while testing nothing.
  const CAP = path.join(__dirname, 'capture.js');
  const C = {
    capture: ({ since }) => {
      const r = cp.spawnSync(process.execPath,
        ['-e', `process.stdout.write(String(require(process.argv[1]).capture({ since: process.argv[2] }) || ''))`, CAP, since],
        { encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO } });
      return r.stdout.trim() || null;
    },
  };
  const log = path.join(CO, 'activity', `${new Date().toISOString().slice(0, 10)}.log`);
  // Whoever the FIXTURE thinks we are, which is not who this process thinks we are.
  const me = cp.spawnSync(process.execPath, ['-e', 'process.stdout.write(require(process.argv[1]).me() || "")',
    path.join(__dirname, 'lib.js')], { encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO } }).stdout;
  // L.nowISO(), not toISOString(): the activity log is written with this machine's
  // offset, and these timestamps are compared as strings. A UTC 'Z' here would sort
  // against a +05:30 line as if the clock said something different.
  const at = () => L.nowISO();
  const add = (repo, event, who, extra) => fs.appendFileSync(log, [at(), repo, event, who, extra].join('\t') + '\n');
  const noteFile = () => L.lsMd(path.join(CO, 'context')).filter(n => n.startsWith('together-'));
  // Earlier sections of this drill have been editing the same fixture all along. The
  // window starts now, so only what this section does is in scope.
  for (const n of noteFile()) fs.rmSync(path.join(CO, 'context', n));
  // Wait for the clock to tick first. These timestamps are second-resolution and the
  // window is "ts < since", so an edit logged in the same second as `since` is inside
  // it — which made this section pass or fail depending on when in the second it ran.
  const tick = at();
  while (at() === tick) { /* at most one second, once */ }
  const since = at();

  // One repo is just work. Only two is a fact nobody writes down.
  add('alpha', 'edit', me, 'src/only.js');
  ok('one repo in a sitting writes no note', C.capture({ since }) === null, noteFile().join(','));

  // The cross-repo line is also logged against the near repo as a bare basename, because
  // an edit outside the repo has no sensible relative path. Filing the far repo's file
  // under the near one would be a quiet lie in a note people are meant to trust.
  add('alpha', 'edit', me, 'shared.js');
  add('alpha', 'cross-repo', me, 'alpha + beta — shared.js');
  add('alpha', 'commit', me, 'abc123 JET-500: widen the job state enum');
  const slug = C.capture({ since });
  ok('two repos in a sitting writes one note', !!slug && noteFile().length === 1, String(slug));

  const read = () => fs.readFileSync(path.join(CO, 'context', slug + '.md'), 'utf8');
  let note = read();
  ok('it names both repos', /alpha and beta changed together/.test(note), note.slice(0, 200));
  ok('each file is filed under the repo it actually belongs to',
    /\*\*alpha\*\* — src\/only\.js/.test(note) && /\*\*beta\*\* — shared\.js/.test(note)
    && !/\*\*alpha\*\*[^\n]*shared\.js/.test(note), note);
  ok('it carries the commit subject, which is the dev\'s own words',
    /JET-500: widen the job state enum/.test(note));
  ok('it says a machine wrote it', /Written automatically/.test(note));
  // The one thing it must never do is supply a reason it does not have.
  ok('and says plainly that the reason is not in it', /is not recorded here/.test(note), note.slice(-250));

  // A day of going back and forth is one story, not six notes.
  add('beta', 'edit', me, 'src/later.js');
  const again = C.capture({ since });
  note = read();
  ok('a second sitting the same day updates that note rather than adding another',
    again === slug && noteFile().length === 1 && /later\.js/.test(note), noteFile().join(','));
  ok('and the earlier files are still in it', /src\/only\.js/.test(note) && /shared\.js/.test(note), note);

  // The valuable half of the note is the sentence a person adds. Losing it on the next
  // automatic run would teach everyone not to bother writing one.
  fs.writeFileSync(path.join(CO, 'context', slug + '.md'),
    read().trimEnd() + '\n\nThe enum had to widen on both sides in one go or the UI crashes on an unknown state.\n');
  add('alpha', 'edit', me, 'src/third.js');
  C.capture({ since });
  note = read();
  ok('a sentence a person wrote survives the next automatic run',
    /the UI crashes on an unknown state/.test(note), note.slice(-300));
  ok('and it is still one note, now with the new file too',
    noteFile().length === 1 && /third\.js/.test(note));

  // The activity log is shared, so somebody else's afternoon is in it too.
  {
    add('alpha', 'edit', 'Someone Else', 'theirs.js');
    add('alpha', 'cross-repo', 'Someone Else', 'alpha + beta — theirs.js');
    C.capture({ since });
    ok('somebody else\'s work in the shared log is not written up as yours',
      !/theirs\.js/.test(read()), read().slice(0, 400));
  }

  // And the wiring: a real session end produces one, through the hook, silently.
  fs.rmSync(path.join(CO, 'context', slug + '.md'));
  const r = cp.spawnSync(process.execPath, [HOOK, 'session-stop'], {
    input: JSON.stringify({ cwd: path.join(TMP, 'alpha'), session_id: 'cap1' }),
    encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  ok('session end writes it without printing anything at the session', r.status === 0 && !r.stdout, r.stdout + r.stderr);

  // Leave the fixture as this section found it: the context store is asserted on later.
  for (const n of noteFile()) fs.rmSync(path.join(CO, 'context', n));
}

// Not everyone opens one editor window per repo. Plenty of people open the folder that
// holds all of them, and some use one window per repo — the tool has to be identical
// either way, or it is only built for whoever wrote it. Before this existed, the
// umbrella session was asked on every single edit, the yes never stuck, and every edit
// was filed on the board under "platform-root" instead of the repo it belonged to.
function umbrella() {
  const A = path.join(TMP, 'alpha'), B = path.join(TMP, 'beta');
  const log = path.join(CO, 'activity', `${new Date().toISOString().slice(0, 10)}.log`);
  const sid = 'umbrella-1';
  const ask = file => {
    const r = cp.spawnSync(process.execPath, [GUARD], {
      input: JSON.stringify({ cwd: TMP, session_id: sid, tool_name: 'Write', tool_input: { file_path: file } }),
      encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
    });
    if (!r.stdout.trim()) return 'allow';
    try { return JSON.parse(r.stdout).permissionDecision; } catch { return 'unparseable'; }
  };
  const edit = file => cp.spawnSync(process.execPath, [HOOK, 'edit'], {
    input: JSON.stringify({ cwd: TMP, session_id: sid, tool_input: { file_path: file } }),
    encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  const tail = () => fs.readFileSync(log, 'utf8').trim().split('\n').slice(-1)[0];

  ok('from the folder above every repo, the first repo you write in is just yours',
    ask(path.join(A, 'one.js')) === 'allow', ask(path.join(A, 'one.js')));
  edit(path.join(A, 'one.js'));
  ok('and that edit is filed under the repo, not under the folder you opened',
    /\talpha\tedit\t[^\t]*\tone\.js$/.test(tail()), tail());

  ok('a second file in the same repo is still free', ask(path.join(A, 'two.js')) === 'allow');
  edit(path.join(A, 'two.js'));

  ok('the second repo is the crossing, and it asks once', ask(path.join(B, 'three.js')) === 'ask');
  edit(path.join(B, 'three.js'));
  ok('saying yes sticks, exactly as it does with one window per repo',
    ask(path.join(B, 'four.js')) === 'allow', ask(path.join(B, 'four.js')));
  ok('and the crossing is recorded against the repo you were working in',
    fs.readFileSync(log, 'utf8').includes('alpha\tcross-repo\t') , tail());

  // The anchor is this machine's business and this sitting's. On the shared board it
  // would be one more thing to conflict over, and it would reach people it is not about.
  ok('which repo a session settled into never reaches the board',
    !/anchors/.test(fs.readFileSync(path.join(CO, 'state.json'), 'utf8')) &&
    /anchors/.test(fs.readFileSync(path.join(CO, 'local.json'), 'utf8')));

  // A different window is a different sitting, even on the same machine.
  const other = cp.spawnSync(process.execPath, [GUARD], {
    input: JSON.stringify({ cwd: TMP, session_id: 'umbrella-2', tool_name: 'Write', tool_input: { file_path: path.join(B, 'five.js') } }),
    encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  ok('a second window starts its own anchor rather than inheriting one', !other.stdout.trim(), other.stdout.slice(0, 80));
}

// Nobody can read a 2M-token repo, and nobody tells you which ones those are. coord
// measures it at onboarding and puts the number where both agents will see it. The
// policy has to hold on a machine with nothing installed, because some of the people
// this is written for cannot install anything.
function navigating() {
  const O = require('./onboard.js'), D = require('./devsetup.js');
  const B = path.join(TMP, 'beta');

  const small = O.sizeOf(B);
  ok('a repo is measured in tokens, not files', small.tokens >= 0 && small.files > 0, JSON.stringify(small));

  // Push it over the line a real repo crosses, and the advice has to change with it.
  const filler = path.join(B, 'src', 'generated.ts');
  fs.mkdirSync(path.dirname(filler), { recursive: true });
  fs.writeFileSync(filler, '// generated\n' + 'export const row = { a: 1, b: 2, c: 3 };\n'.repeat(40000));
  const big = O.sizeOf(B);
  ok('a big repo reads as big', big.tokens > 150000, big.tokens + ' tokens');

  // Through the CLI, not D.copilotDoc() in this process: lib resolves its paths once at
  // load, against the real board rather than this fixture.
  const instr = path.join(B, '.github', 'copilot-instructions.md');
  const writeDoc = () => { coord(['devsetup', '--repo', 'beta']); return L0read(instr); };
  let doc = writeDoc();
  ok('the instruction file carries this repo\u2019s own size',
    new RegExp(String(Math.round(big.tokens / 1000)) + 'k tokens').test(doc), doc.slice(0, 500));
  ok('and tells the agent to search rather than browse', /Search first/.test(doc) && /grep -rn/.test(doc));
  // The whole point of the wording: followable on a machine with nothing installed.
  ok('it requires no tool to be installed',
    /neither installs nor requires one/.test(doc) && !/you must install/i.test(doc), doc.slice(-600));
  ok('and it points at the board for anything outside this repo', /coord ctx/.test(doc) && /contracts/.test(doc));

  fs.rmSync(filler);
  doc = writeDoc();
  ok('a small repo gets different advice', /affordable/.test(doc), doc.slice(0, 600));

  /* --- what an indexing tool leaves behind --- */
  // graphify-out is megabytes of build output. It is not in anyone’s .gitignore, and a
  // repo’s .gitignore is not coord’s file to edit — .git/info/exclude is local and is.
  fs.mkdirSync(path.join(B, 'graphify-out'), { recursive: true });
  fs.writeFileSync(path.join(B, 'graphify-out', 'graph.json'), '{}');
  const exFile = path.join(B, '.git', 'info', 'exclude');
  fs.writeFileSync(exFile, L0read(exFile).split('\n').filter(l => l.trim() !== 'graphify-out/').join('\n'));
  const rep = O.detect('beta', B);
  const gi = rep.indexes.find(i => i.name === 'graphify-out');
  ok('the preflight spots an index that is about to be committed', !!gi && gi.ignored === false, JSON.stringify(rep.indexes));
  ok('and the preflight prints the warning', /NOT IGNORED/.test(coord(['onboard', 'beta', '--preflight']).out),
    coord(['onboard', 'beta', '--preflight']).out.slice(0, 400));

  coord(['devsetup', '--repo', 'beta']);
  const ex = L0read(path.join(B, '.git', 'info', 'exclude'));
  ok('applying puts it in .git/info/exclude, which is never committed',
    ex.split('\n').some(l => l.trim() === 'graphify-out/'), ex);
  ok('and the repo\u2019s own .gitignore is left alone', !fs.existsSync(path.join(B, '.gitignore')) ||
    !/graphify/.test(fs.readFileSync(path.join(B, '.gitignore'), 'utf8')));
  fs.rmSync(path.join(B, 'graphify-out'), { recursive: true, force: true });
}
const L0read = f => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } };

// A graph of a repo costs real money to build and only the machine that built it can
// rebuild it — the tool is an agent-driven pipeline with model calls in it. So coord
// carries the readable half and the commit it was built from, and nothing else. The
// half it refuses to carry is the point: graph.json is twice the size of the source,
// is rewritten whole every rebuild, and git keeps every version of it forever.
function graphs() {
  const B = path.join(TMP, 'beta');
  const out = path.join(B, 'graphify-out');
  const board = path.join(CO, 'graphs', 'beta');

  ok('with no graph anywhere, it says so and says they are optional', (() => {
    const o = coord(['graph']).out;
    return /beta\s+none/.test(o) && /optional/.test(o);
  })(), coord(['graph']).out);

  ok('importing nothing is refused, with how to make one', (() => {
    const r = coord(['graph', 'beta']);
    return !r.ok && /no graph in beta/.test(r.out) && /graphify beta/.test(r.out);
  })(), coord(['graph', 'beta']).out);

  // What the tool actually leaves behind: a small report, an optional wiki, and two
  // very large files that must never reach a board which syncs every few minutes.
  fs.mkdirSync(path.join(out, 'wiki'), { recursive: true });
  fs.writeFileSync(path.join(out, 'GRAPH_REPORT.md'), '# Graph Report - beta\n\n- 711 nodes\n');
  fs.writeFileSync(path.join(out, 'wiki', 'index.md'), '# beta\n');
  fs.writeFileSync(path.join(out, 'wiki', 'auth.md'), '# Auth\n');
  fs.writeFileSync(path.join(out, 'cost.json'), JSON.stringify({ total_input_tokens: 32000 }));
  fs.writeFileSync(path.join(out, 'graph.json'), 'x'.repeat(700000));
  fs.writeFileSync(path.join(out, 'graph.html'), 'x'.repeat(724000));

  const r = coord(['graph', 'beta'], { human: true });
  ok('importing puts the report on the board', r.ok && fs.existsSync(path.join(board, 'REPORT.md')), r.out);
  ok('and the wiki pages with it', fs.existsSync(path.join(board, 'wiki', 'auth.md')));
  ok('the heavy files are left where they were built', 
    !fs.existsSync(path.join(board, 'graph.json')) && !fs.existsSync(path.join(board, 'graph.html')) &&
    fs.existsSync(path.join(out, 'graph.json')), fs.readdirSync(board).join(','));

  const built = JSON.parse(fs.readFileSync(path.join(board, 'built.json'), 'utf8'));
  // Without the commit it was built from, a graph is a confident answer about code that
  // may have changed three weeks ago — the exact failure this tool exists to reduce.
  ok('it records the commit it was built from', /^[0-9a-f]{7,40}$/.test(built.commit), JSON.stringify(built));
  ok('and who built it, when, and what it cost', !!built.built && !!built.by && built.tokens === 32000, JSON.stringify(built));

  ok('a fresh graph reads as current', /beta\s+on the board.*current/.test(coord(['graph']).out), coord(['graph']).out);

  // Move the repo on and the board has to admit the graph describes something older.
  for (let i = 0; i < 45; i++) {
    fs.writeFileSync(path.join(B, 'churn.js'), 'export const n = ' + i + ';\n');
    git(['add', 'churn.js'], B); git(['commit', '-q', '-m', 'no-ticket: churn ' + i], B);
  }
  const aged = coord(['graph']).out;
  ok('once the repo moves on, the board says how far behind the graph is', /45 commits behind/.test(aged), aged);
  ok('and says to treat it as history rather than leaving it to rot quietly', /history, or rebuild/.test(aged), aged);

  // The guard that keeps this feature from ruining the board later.
  fs.writeFileSync(path.join(out, 'wiki', 'huge.md'), 'x'.repeat(3 * 1024 * 1024));
  const big = coord(['graph', 'beta'], { human: true });
  ok('markdown too big for a board that syncs every few minutes is refused',
    !big.ok && /too much for a board/.test(big.out), big.out);
  ok('and refusing it leaves what was already shared alone', fs.existsSync(path.join(board, 'REPORT.md')));
  fs.rmSync(path.join(out, 'wiki', 'huge.md'));

  ok('the board actually commits graphs, or nobody else ever sees one', (() => {
    coord(['graph', 'beta'], { human: true });
    return git(['ls-files', 'graphs/beta/REPORT.md'], CO).stdout.trim() !== '';
  })(), git(['status', '--porcelain'], CO).stdout.slice(0, 200));
}

// Four machines pushing to one board on a four-minute timer. Every one of these was a
// real failure before it was a test: measured with two clones and a bare remote, where
// the second machine's sync stopped dead and then stayed stopped, silently, because
// hooks sync with --quiet. A board that quietly stops being shared is worse than none.
function colliding() {
  const J = path.join(__dirname, 'jsonmerge.js');

  // people.json and repos.json are sets. Two people running setup the same morning used
  // to collide on a line of JSON; merged by key there is nothing to collide over.
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'coord-merge-'));
  const w = (n, o) => { const f = path.join(d, n); fs.writeFileSync(f, JSON.stringify(o, null, 2)); return f; };
  const base = w('base.json', { version: 1, people: [] });
  const ours = w('ours.json', { version: 1, people: [{ name: 'Dev One', email: 'one@x', since: '2026-10-19' }] });
  const theirs = w('theirs.json', { version: 1, people: [{ name: 'Dev Two', email: 'two@x', since: '2026-10-19' }] });
  const r = cp.spawnSync(process.execPath, [J, base, ours, theirs], { encoding: 'utf8' });
  const merged = JSON.parse(fs.readFileSync(ours, 'utf8')).people.map(p => p.name);
  ok('two people added on two machines both survive the merge',
    r.status === 0 && merged.includes('Dev One') && merged.includes('Dev Two'), merged.join(' + '));

  // Same row on both sides: later wins, rather than a conflict nobody can answer.
  const b2 = w('b2.json', { version: 1, repos: [{ name: 'api', stack: 'old', updated: '2026-01-01' }] });
  const o2 = w('o2.json', { version: 1, repos: [{ name: 'api', stack: 'mine', updated: '2026-02-01' }] });
  const t2 = w('t2.json', { version: 1, repos: [{ name: 'api', stack: 'theirs', updated: '2026-03-01' }] });
  cp.spawnSync(process.execPath, [J, b2, o2, t2], { encoding: 'utf8' });
  ok('when both changed one row, the later write wins and nothing conflicts',
    JSON.parse(fs.readFileSync(o2, 'utf8')).repos[0].stack === 'theirs');

  // A row one side deleted stays deleted; a union that resurrects it would undo an
  // offboarding every time somebody else synced.
  const b3 = w('b3.json', { version: 1, repos: [{ name: 'gone' }, { name: 'api' }] });
  const o3 = w('o3.json', { version: 1, repos: [{ name: 'api' }] });
  const t3 = w('t3.json', { version: 1, repos: [{ name: 'gone' }, { name: 'api' }] });
  cp.spawnSync(process.execPath, [J, b3, o3, t3], { encoding: 'utf8' });
  ok('a row one side deleted is not resurrected by the merge',
    !JSON.parse(fs.readFileSync(o3, 'utf8')).repos.some(x => x.name === 'gone'));

  // Two machines pick the same next number when neither has seen the other's request.
  // Git is happy -- different filenames -- so it shows up only as an id that means two
  // things forever. The first version of this fix renumbered JET-001 to JET-001 and
  // deleted the file on the way past; losing somebody's request is far worse than a
  // duplicate id, so both halves are asserted.
  const t = path.join(CO, 'tickets');
  const mk = (id, slug, created) => fs.writeFileSync(path.join(t, `${id}-${slug}.md`),
    `---\nid: ${id}\ntitle: ${slug}\nfrom: alpha\nto: beta\nstatus: open\ncreated: ${created}\nupdated: ${created}\ndecisions: []\n---\n\n## Request\n\nr\n\n## Thread\n\n${created} drill: created ticket, status: - -> open\n`);
  mk('JET-700', 'machine-one', '2026-10-19T10:00:00+05:30');
  mk('JET-700', 'machine-two', '2026-10-19T10:00:05+05:30');
  const before = fs.readdirSync(t).length;
  coord(['sync', '--quiet'], { human: true });
  const after = fs.readdirSync(t);
  ok('a duplicate id is renumbered rather than left ambiguous',
    !after.includes('JET-700-machine-two.md') && after.some(f => /machine-two/.test(f)), after.filter(f=>/machine/.test(f)).join(' '));
  ok('and nothing is lost on the way', after.length === before, `${before} -> ${after.length}`);
  ok('the board is consistent afterwards', !coord(['check']).out.includes('duplicate'), coord(['check']).out.slice(0, 200));
  for (const f of after.filter(x => /machine-(one|two)/.test(x))) fs.rmSync(path.join(t, f));
}

function guard() {
  const A = path.join(TMP, 'alpha'), B = path.join(TMP, 'beta');
  const ask = (cwd, tool, input) => {
    const r = cp.spawnSync(process.execPath, [GUARD], {
      input: JSON.stringify({ cwd, tool_name: tool, tool_input: input }), encoding: 'utf8',
      env: { ...process.env, COORD_ROOT: CO },
    });
    if (r.status !== 0 && r.status !== 2) return { error: `exit ${r.status}` };
    if (!r.stdout.trim()) return { decision: 'allow' };
    try { const j = JSON.parse(r.stdout); return { decision: j.hookSpecificOutput.permissionDecision, reason: j.hookSpecificOutput.permissionDecisionReason }; }
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
  // A write into another repo is a question put to the person, not a refusal: one
  // change across both ends is the commonest shape of work here, and making someone
  // file a request and then approve it to themselves is theatre. What the CLI owns is
  // different — that is not a judgement call, and is still refused outright.
  const asks = (label, cwd, tool, input, want) => {
    const r = ask(cwd, tool, input);
    ok(label, r.decision === 'ask' && (!want || new RegExp(want).test(r.reason || '')), JSON.stringify(r));
  };

  asks('guard stops an Edit into another repo to ask', A, 'Edit', { file_path: path.join(B, 'src.js') }, 'If you asked for this');
  ok('and the question says how to turn it into a request instead',
    /coord new --from alpha --to beta/.test(ask(A, 'Edit', { file_path: path.join(B, 'src.js') }).reason || ''));
  allows('guard allows Edit in your own repo', A, 'Edit', { file_path: path.join(A, 'src.js') });
  asks('guard stops sed -i into another repo', A, 'Bash', { command: `sed -i "" s/a/b/ ${path.join(B, 'src.js')}` });
  asks('guard stops redirection into another repo', A, 'Bash', { command: `echo x > ${path.join(B, 'n.md')}` });
  asks('guard stops cp into another repo', A, 'Bash', { command: `cp a.js ${path.join(B, 'a.js')}` });
  asks('guard stops git -C commit in another repo', A, 'Bash', { command: `git -C ${B} commit -m x` });
  allows('guard allows reading another repo', A, 'Bash', { command: `cat ${path.join(B, 'src.js')}` });
  allows('guard allows grep across another repo', A, 'Bash', { command: `grep -rn foo ${B}` });
  allows('guard allows writing in your own repo via shell', A, 'Bash', { command: `echo x > ${path.join(A, 'n.md')}` });

  allows('guard allows your own status file', A, 'Edit', { file_path: statusPath(CO, 'alpha') });
  denies("guard blocks another repo's status folder", A, 'Edit', { file_path: statusPath(CO, 'beta') }, 'belongs to beta');
  // With nobody on the roster yet coord cannot tell whose file is whose, and a guard
  // that guesses would block real work. It allows, and the block is asserted below,
  // where an identity exists.
  allows('with no identity known, it does not guess whose note is whose', A, 'Edit',
    { file_path: path.join(CO, 'status', 'alpha', 'someone-else.md') });
  denies('guard blocks hand-editing repos.json', A, 'Write', { file_path: path.join(CO, 'repos.json') }, 'written only by the CLI');
  denies('guard blocks hand-editing people.json', A, 'Write', { file_path: path.join(CO, 'people.json') }, 'written only by the CLI');
  denies('guard blocks editing a decision record', A, 'Edit', { file_path: path.join(CO, 'decisions', 'D-001-x.md') }, 'immutable');
  allows('guard allows editing a ticket', A, 'Edit', { file_path: path.join(CO, 'tickets', 'JET-001-x.md') });

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
  // Its own COORD_ROOT: this deliberately broken guard records a real failure, and the
  // fixture's failure log is something other assertions read.
  const broken = cp.spawnSync(process.execPath, [path.join(orphanDir, 'guard.js')], {
    input: JSON.stringify({ cwd: A, tool_name: 'Edit', tool_input: { file_path: path.join(B, 'x.js') } }),
    encoding: 'utf8', env: { ...process.env, COORD_ROOT: orphanDir },
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
  const tid = (made.out.match(/JET-\d+/) || [])[0];
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
    /stops and asks them/.test(cpDoc) && /coord new --from alpha/.test(cpDoc) && /no-ticket:/.test(cpDoc), cpDoc.slice(0, 200));
  // The tracked file is what a Copilot session reads instead of CLAUDE.md, so the rule
  // about not making a person read a workflow has to be in it too.
  ok('and tells the agent not to narrate internal states at people',
    /Never show them an internal state name/.test(cpDoc) && /waiting \/ go \/ done/.test(cpDoc));
  // The note is written from the activity log, which cannot know why. The agent can, and
  // this is the only place a Copilot session is told to write it down.
  ok('and tells it to fill in the why on a note that was written for it',
    /together-<repos>-<date>/.test(cpDoc) && /You know why/.test(cpDoc), cpDoc.slice(-700));

  // commit-msg: warn by default, reject under --strict
  const msg = path.join(TMP, 'msg.txt');
  const runHook = () => cp.spawnSync('sh', [path.join(A, '.git', 'hooks', 'commit-msg'), msg], { encoding: 'utf8' });
  fs.writeFileSync(msg, 'fix the thing\n');
  let h = runHook();
  // silent by default: prepare-commit-msg already adds the ID when one is known, and a
  // genuinely ticket-less commit is normal. Nagging every time was the friction.
  ok('commit-msg says nothing about a message with no ticket', h.status === 0 && !h.stderr.trim(), h.stderr);
  fs.writeFileSync(msg, 'JET-042: fix the thing\n');
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
  git(['commit', '-q', '-m', 'JET-042: add the feature'], A);
  const log = fs.readFileSync(path.join(CO, 'activity', `${today}.log`), 'utf8');
  ok('post-commit records the commit on the board', /\talpha\tcommit\t[^\t]*\t\w+ JET-042: add the feature/.test(log),
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
  const board = fs.readFileSync(statusPath(CO, 'alpha'), 'utf8');
  ok('status files gained no owner field', !/\*\*(Who|Owner|Dev)/i.test(board));
  // One writer per file is what removes the collision. Now that coord knows who this
  // machine is, writing somebody else's note has to be refused or the guarantee is void.
  ok("another person's note is refused once coord knows who you are", (() => {
    const r = cp.spawnSync(process.execPath, [GUARD], {
      input: JSON.stringify({ cwd: A, session_id: 'own', tool_name: 'Edit',
        tool_input: { file_path: path.join(CO, 'status', 'alpha', 'somebody-else.md') } }),
      encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
    });
    return /somebody else's handoff note/.test(r.stdout);
  })());

  onBehalf();
  ok('removing someone is human-only', !coord(['who', '--remove', me]).ok);
  ok('the human can remove someone', coord(['who', '--remove', me], { human: true }).ok);
  ok('and then they are gone from the roster', !coord(['who']).out.includes(me), coord(['who']).out);
  coord(['setup', '--yes']);                     // put them back for the rest of the drill

  dashboardViews(me);
  noTyping();
}

// A new dev clones only the board and runs one command.
// Team view and per-person views are served from one process; a person view must never
// 500 on an unknown name.
// The requester approves and closes; anyone else may, and the thread says so.
function onBehalf() {
  const A = path.join(TMP, 'alpha');
  const made = coord(['new', '--from', 'alpha', '--to', 'beta', '--title', 'Filed by one, closed by another'], { cwd: A });
  const id = (made.out.match(/JET-\d+/) || [])[0];
  const filer = (/^filed_by: (.+)$/m.exec(readT(id)) || [])[1];
  ok('the filer is recorded on the ticket', !!filer, readT(id).split('\n').slice(0, 8).join(' | '));

  coord(['approve', id], { human: true });
  coord(['start', id], { cwd: path.join(TMP, 'beta') });
  const d = path.join(CO, 'tickets'), f = fs.readdirSync(d).find(x => x.startsWith(id + '-'));
  fs.writeFileSync(path.join(d, f), fs.readFileSync(path.join(d, f), 'utf8')
    .replace(/## Test steps\n\n—/, '## Test steps\n\n1. check it'));
  coord(['review', id], { cwd: path.join(TMP, 'beta') });

  // someone else closes it: allowed, but written down
  const other = cp.spawnSync(process.execPath, [COORD_BIN, 'done', id], {
    cwd: TMP, encoding: 'utf8',
    env: { ...process.env, COORD_ROOT: CO, COORD_ACTOR: 'human', COORD_TEST_ME: 'Someone Else' },
  });
  const thread = readT(id);
  ok('a different person may still act on it', /status: review -> done/.test(thread), thread.slice(-200));
  ok('the thread records the filer either way', thread.includes(filer), thread.slice(-200));
}

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

    ok('the team view groups work by who it is waiting on',
      /class="kanban"/.test(team) && /Waiting on a person/.test(team) && /Being worked on/.test(team), team.slice(0, 200));
    ok('and shows what was closed recently', /Recently closed/.test(team));
    // The five-column kanban with WIP limits and card aging measured a process nobody
    // follows. If any of that language comes back, somebody has rebuilt a worse Linear.
    ok('and invents no process of its own',
      !/WIP/.test(team) && !/sitting too long/.test(team) && !/In progress</.test(team), team.slice(0, 200));

    const made = coord(['new', '--from', 'alpha', '--to', 'beta', '--title', 'One more for the board']);
    const newId = (made.out.match(/JET-\d+/) || [])[0];
    const withOne = get('/');
    ok('a new request shows up as waiting on a person',
      newId && withOne.includes(newId) && /· 1 waiting on someone|waiting on someone/.test(withOne), withOne.slice(0, 200));
  } finally { srv.kill(); }
}

// The point of the whole thing: a dev who runs no coord commands at all.
function noTyping() {
  const A = path.join(TMP, 'alpha'), B = path.join(TMP, 'beta');
  coord(['devsetup'], { human: true });

  // assistant files it, human approves — the dev has done nothing
  const made = coord(['new', '--from', 'alpha', '--to', 'beta', '--title', 'Hands-free ticket'], { cwd: A });
  const id = (made.out.match(/JET-\d+/) || [])[0];
  coord(['approve', id], { human: true });

  // the dev simply starts editing
  cp.spawnSync(process.execPath, [HOOK, 'edit'], {
    input: JSON.stringify({ cwd: B, tool_input: { file_path: path.join(B, 'auto.js') } }),
    encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  const tk = L_loadStatus(id);
  ok('the board moves itself when work starts', tk === 'in_progress', `status is ${tk}`);
  ok('the repo is pointed at the ticket automatically',
    fs.readFileSync(path.join(B, '.git', 'coord-ticket'), 'utf8').trim() === id);

  // ...and commits with a plain message
  fs.writeFileSync(path.join(B, 'auto.js'), 'module.exports = 2;\n');
  git(['add', '-A'], B);
  git(['commit', '-q', '-m', 'add the hands-free thing'], B);
  const subject = git(['log', '-1', '--format=%s'], B).stdout.trim();
  ok('the commit message gets the ticket prefix without anyone typing it',
    subject === `${id}: add the hands-free thing`, subject);

  // a repo with nothing in flight is left completely alone
  fs.writeFileSync(path.join(A, 'untouched.md'), 'hi\n');
  git(['add', '-A'], A);
  git(['commit', '-q', '-m', 'fix typo in README'], A);
  const plain = git(['log', '-1', '--format=%s'], A).stdout.trim();
  ok('a commit with nothing in flight is left exactly as typed', plain === 'fix typo in README', plain);

  // two approved tickets for one repo: guessing would be worse than doing nothing
  fs.rmSync(path.join(B, '.git', 'coord-ticket'), { force: true });
  const m2 = coord(['new', '--from', 'alpha', '--to', 'beta', '--title', 'Second candidate'], { cwd: A });
  const id2 = (m2.out.match(/JET-\d+/) || [])[0];
  coord(['approve', id2], { human: true });
  const m3 = coord(['new', '--from', 'alpha', '--to', 'beta', '--title', 'Third candidate'], { cwd: A });
  const id3 = (m3.out.match(/JET-\d+/) || [])[0];
  coord(['approve', id3], { human: true });
  cp.spawnSync(process.execPath, [HOOK, 'edit'], {
    input: JSON.stringify({ cwd: B, tool_input: { file_path: path.join(B, 'amb.js') } }),
    encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  ok('with two candidates it guesses nothing', !fs.existsSync(path.join(B, '.git', 'coord-ticket')) &&
    L_loadStatus(id2) === 'approved' && L_loadStatus(id3) === 'approved',
    `${L_loadStatus(id2)} / ${L_loadStatus(id3)}`);

  // coord why still answers a commit that carries no ID
  const w = coord(['why', `${path.join(A, 'untouched.md')}:1`], { cwd: A });
  ok('coord why falls back to what was open at the time',
    w.ok && /a guess from timing/.test(w.out) && /this repo asked for it|work for this repo/.test(w.out), w.out);

  ok('coord on reports what the repo is tagged with', /is not on anything|is on JET-/.test(coord(['on'], { cwd: B }).out), coord(['on'], { cwd: B }).out);
  coord(['on', id], { cwd: B });
  ok('coord on sets it by hand when you want to', fs.existsSync(path.join(B, '.git', 'coord-ticket')));
  coord(['on', '--clear'], { cwd: B });
  ok('coord on --clear removes it', !fs.existsSync(path.join(B, '.git', 'coord-ticket')));

  // ids continue the series the code already cites, never collide with it
  fs.writeFileSync(path.join(B, 'legacy.ts'), '// JET-900 explains this\nexport const q = 1;\n');
  const after = coord(['new', '--from', 'alpha', '--to', 'beta', '--title', 'After a high code reference'], { cwd: A });
  const afterId = (after.out.match(/JET-(\d+)/) || [])[0];
  ok('a new ticket never reuses an id the code already cites',
    !!afterId && Number(afterId.split('-')[1]) > 900, after.out);
  ok('coord show finds an id that only exists in code',
    /no request on the board/.test(coord(['show', 'JET-900']).out) && /legacy\.ts/.test(coord(['show', 'JET-900']).out),
    coord(['show', 'JET-900']).out.slice(0, 200));
  fs.rmSync(path.join(B, 'legacy.ts'));

  // a number inside a markdown example is documentation, not a claim on that id
  fs.writeFileSync(path.join(B, 'EXAMPLES.md'), 'Commit like `JET-9999: do the thing`.\n');
  ok('a JET number in a markdown example does not burn the id',
    L_codeMax() < 9999, `code max is ${L_codeMax()}`);
  fs.rmSync(path.join(B, 'EXAMPLES.md'));
  ok('check is clean after all of it', !coord(['check']).out.includes('ERROR'), coord(['check']).out);
}

function L_codeMax() {
  const r = cp.spawnSync(process.execPath, ['-e',
    `process.env.COORD_ROOT=${JSON.stringify(CO)};console.log(require(${JSON.stringify(path.join(__dirname, 'lib.js'))}).codeMaxTicket())`],
    { encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO } });
  return Number((r.stdout || '0').trim()) || 0;
}

function L_loadStatus(id) {
  const d = path.join(CO, 'tickets');
  const f = fs.readdirSync(d).find(x => x.startsWith(id + '-'));
  if (!f) return null;
  const m = /^status: (.+)$/m.exec(fs.readFileSync(path.join(d, f), 'utf8'));
  return m ? m[1].trim() : null;
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
  ok('setup reports repos it cannot find locally', /not on this machine/.test(out), out);
  ok('setup gives an actionable next step for each', /coord where/.test(out), out);
  // A guessed location is offered, never adopted: with no terminal to confirm at, it
  // must end up on the to-do list rather than silently pointing at the wrong clone.
  ok('setup never adopts a guessed path unasked', !fs.existsSync(path.join(board, 'paths.json')),
    fs.existsSync(path.join(board, 'paths.json')) ? fs.readFileSync(path.join(board, 'paths.json'), 'utf8') : '');
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

  // Mount chains. Every one of these shapes once reported its routes at the path written
  // inside the file instead of the path it is served at, which named contracts after
  // words another repo also uses.
  fs.mkdirSync(path.join(dir, 'src', 'routes'));
  fs.writeFileSync(path.join(dir, "src", "app.js"), "import registerRoutes from './routes/index';\nconst app = express();\napp.use('/internal', registerRoutes());\n");
  fs.writeFileSync(path.join(dir, "src", "routes", "index.js"), "import deep from '../deep.routes';\nimport { attach } from '../attach';\nconst router = Router();\nconst v1 = Router();\nrouter.use('/v1', v1);\nv1.use('/deep', requireAuth, requireSignature, deep);\nrouter.use('/legacy', deep);\nattach(router);\nexport default router;\n");
  fs.writeFileSync(path.join(dir, "src", "deep.routes.js"), "const router = Router();\nrouter.get('/items', h);\nexport default router;\n");
  fs.writeFileSync(path.join(dir, "src", "attach.js"), "export function attach(router) { router.get('/attached', h); }\n");
  fs.writeFileSync(path.join(dir, "src", "jobs.py"), "router = APIRouter(prefix=\"/api/v1\", tags=[\"jobs\"])\n@router.get(\"/jobs/{job_id}\")\ndef get_job(job_id): pass\n");

  // A long-lived process -- the dashboard is one -- used to memoise the repo map for its
  // whole life, so a repo cloned afterwards stayed invisible and `check` called it "exists
  // but is not a git repo". Spawned, never in-process: lib resolves its paths once at load.
  const cacheProbe = cp.spawnSync(process.execPath, ['-e', `
    const L = require(${JSON.stringify(path.join(__dirname, 'lib.js'))});
    const fs = require('fs'), path = require('path'), cp = require('child_process');
    const before = L.repos().length;
    const d = path.join(${JSON.stringify(TMP)}, 'latecomer');
    fs.mkdirSync(d, { recursive: true });
    cp.spawnSync('git', ['init', '-q'], { cwd: d });
    console.log(JSON.stringify({ before, after: L.repos().length, sees: L.repos().includes('latecomer') }));
  `], { encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO } });
  const probe = (() => { try { return JSON.parse(cacheProbe.stdout.trim().split('\n').pop()); } catch { return {}; } })();
  ok('a repo cloned while a process is running becomes visible to it',
    probe.sees === true && probe.after === probe.before + 1, cacheProbe.stdout + cacheProbe.stderr);
  fs.rmSync(path.join(TMP, 'latecomer'), { recursive: true, force: true });

  ok('new repo shows up as discovered', /discovered, not onboarded \(1\)[\s\S]*gamma/.test(coord(['repos']).out), coord(['repos']).out);
  const dbrief = cp.spawnSync(process.execPath, [HOOK, 'session-start'], {
    input: JSON.stringify({ cwd: dir }), encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  ok('a discovered repo is briefed that it is not onboarded', /is not onboarded/.test(dbrief.stdout) && /ONBOARDING\.md/.test(dbrief.stdout), dbrief.stdout.slice(0, 140));
  ok('no status file for the discovered repo', !fs.existsSync(path.join(CO, 'status', 'gamma')));

  const before = fs.readdirSync(path.join(CO, 'status')).length;
  const pre = coord(['onboard', name, '--preflight'], { cwd: dir });
  ok('preflight passes validation', pre.ok && /validation: passed/.test(pre.out), pre.out);
  ok('preflight detects the stack', /Express/.test(pre.out) && /package manager: npm|package manager: unknown/.test(pre.out), pre.out);
  ok('preflight finds the candidate contract', /\/api\/gamma/.test(pre.out), pre.out);
  ok('a default-imported router inherits its mount', /\/internal\/v1\b/.test(pre.out), pre.out);
  ok('middleware between the path and the router does not break the chain', /\/internal\/v1\/deep\/items/.test(pre.out), pre.out);
  ok('a router handed to a function serves where that router serves', /\/internal\/attached/.test(pre.out), pre.out);
  ok('a file\'s own `const router` is its root, not a level of its own', !/\s\/deep\b/.test(pre.out) && !/\s\/items\b/.test(pre.out), pre.out);
  ok('a version is not a contract of its own — /internal/v1 groups by what is under it',
    /^\s+\/internal\/v1\/deep\s+\[/m.test(pre.out) && !/^\s+\/internal\/v1\s+\[/m.test(pre.out), pre.out);
  ok('a mount line is not a route', !/^\s+\/internal\s+\[/m.test(pre.out), pre.out);
  ok('a router mounted twice is reported at both paths',
    /\/internal\/v1\/deep\/items/.test(pre.out) && /\/internal\/legacy\/items/.test(pre.out), pre.out);
  ok('the preflight no longer claims --apply writes contract stubs',
    !/create\s+\.coord\/contracts/.test(pre.out) && /by hand/.test(pre.out), pre.out);
  ok('FastAPI routes carry the APIRouter prefix', /\/api\/v1\/jobs\/\{job_id\}/.test(pre.out), pre.out);
  ok('and a python route is not also counted unprefixed', !/\s\/jobs\/\{job_id\}/.test(pre.out), pre.out);
  // The display caps the list; the LIST must not cap itself. `coord contracts` diffs the
  // board against it, so a truncated tail once reported real registered contracts as
  // missing from the code -- creater-ai-backend's /api/models was the 31st of 33.
  const wide = path.join(TMP, 'elsewhere', 'wide');
  fs.mkdirSync(wide, { recursive: true });
  git(['init', '-q'], wide);
  fs.writeFileSync(path.join(wide, 'routes.js'),
    Array.from({ length: 35 }, (_, i) => `router.get('/thing${i}/one', h);`).join('\n') + '\n');
  const wpre = coord(['onboard', 'wide', '--at', wide, '--preflight']);
  const wcount = Number((/## Candidate contracts \((\d+)\)/.exec(wpre.out) || [, 0])[1]);
  ok('every contract is counted, not just the ones that fit on screen', wcount >= 35, wpre.out.slice(0, 300));
  ok('and the display says what it left out', /and \d+ more/.test(wpre.out), wpre.out.slice(-600));
  fs.rmSync(wide, { recursive: true, force: true });

  ok('preflight changes nothing', fs.readdirSync(path.join(CO, 'status')).length === before && !fs.existsSync(path.join(CO, 'status', 'gamma')));

  const ap = coord(['onboard', name, '--apply', '--stack', 'npm + Express', '--contracts', '/api/gamma', '--depends-on', 'alpha'], { human: true });
  ok('apply onboards the repo', ap.ok && fs.existsSync(path.join(CO, 'status', 'gamma')), ap.out);
  const entry = JSON.parse(fs.readFileSync(path.join(CO, 'repos.json'), 'utf8')).repos.find(r => r.name === name);
  ok('registry entry is complete', !!entry && entry.status === 'active' && entry.contracts[0] === '/api/gamma' && entry.depends_on[0] === 'alpha' && !!entry.onboarded, JSON.stringify(entry));
  ok('only the contract I named is registered, not everything the scanner found',
    entry.contracts.length === 1, JSON.stringify(entry.contracts));
  ok('the rest are printed as suggestions and written nowhere',
    /suggestions, nothing written/.test(ap.out) && /coord contracts gamma --add \/internal/.test(ap.out), ap.out);

  // coord contracts -- a row is written once at onboarding and nothing else re-reads it
  const cshow = coord(['contracts', 'gamma']);
  ok('coord contracts shows the row and re-scans the code', cshow.ok
    && /gamma owns: \/api\/gamma/.test(cshow.out) && /in the code, not on the board/.test(cshow.out), cshow.out);
  ok('and the re-scan writes nothing', JSON.parse(fs.readFileSync(path.join(CO, 'repos.json'), 'utf8'))
    .repos.find(r => r.name === 'gamma').contracts.length === 1);
  // A registry row is a data correction, not an approval, so an agent may make one --
  // and the row records that it did. The guards that matter are on the content.
  const cadd = coord(['contracts', 'gamma', '--add', '/internal/legacy']);
  ok('an agent can correct a registry row', cadd.ok && /OK  gamma owns/.test(cadd.out) && /added:\s+\/internal\/legacy/.test(cadd.out), cadd.out + cadd.err);
  ok('and the change says it was an agent', /recorded as an agent change/.test(cadd.out), cadd.out);
  ok('the activity log keeps it', /\tgamma\tregistry\t/.test(fs.readFileSync(path.join(CO, 'activity', `${new Date().toISOString().slice(0, 10)}.log`), 'utf8')), '');
  ok('and it lands in the registry', JSON.parse(fs.readFileSync(path.join(CO, 'repos.json'), 'utf8'))
    .repos.find(r => r.name === 'gamma').contracts.join(',') === '/api/gamma,/internal/legacy');
  // One contract, one owner. Two of the real repos are forks that both serve /api/auth,
  // so a --own pasted from the wrong repo silently moved rows out from under their owner.
  // A pre-migration status file must never reach the board: `add -A` was committing it,
  // a later command migrated it away, and the next snapshot committed the removal -- 33
  // of each on the real board. The CLI migrates at startup, so only a caller that is not
  // the CLI reaches snapshot() with one on disk: a hook, or the dashboard server.
  const snapProbe = cp.spawnSync(process.execPath, ['-e', `
    const L = require(${JSON.stringify(path.join(__dirname, 'lib.js'))});
    const fs = require('fs'), path = require('path');
    fs.writeFileSync(path.join(L.P.status, 'alpha.md'), '# alpha\\n\\n- **Status:** idle\\n\\n## Handoff notes\\n');
    L.snapshot('drill: snapshot with a pre-migration status file on disk');
    console.log(JSON.stringify({ left: fs.existsSync(path.join(L.P.status, 'alpha.md')) }));
  `], { encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO } });
  const sp = (() => { try { return JSON.parse(snapProbe.stdout.trim().split('\n').pop()); } catch { return {}; } })();
  ok('a snapshot migrates the old status file instead of committing it', sp.left === false,
    snapProbe.stdout + snapProbe.stderr);
  ok('and it never entered git', !git(['log', '--oneline', '--', 'status/alpha.md'], CO).stdout.trim(),
    git(['log', '--oneline', '--', 'status/alpha.md'], CO).stdout);

  const giveAlpha = coord(['contracts', 'alpha', '--add', '/api/alpha'], { human: true });
  ok('a contract nobody owns can be claimed', giveAlpha.ok, giveAlpha.out + giveAlpha.err);
  const steal = coord(['contracts', 'gamma', '--add', '/api/alpha'], { human: true });
  ok('taking a contract another repo owns is refused',
    !steal.ok && /already owned by another repo/.test(steal.out + steal.err), steal.out + steal.err);
  ok('and the refusal names the owner and how to free it',
    /\/api\/alpha\s+->\s+alpha/.test(steal.out + steal.err) && /coord contracts alpha --rm \/api\/alpha/.test(steal.out + steal.err), steal.out + steal.err);
  ok('nothing moved', JSON.parse(fs.readFileSync(path.join(CO, 'repos.json'), 'utf8'))
    .repos.find(r => r.name === 'alpha').contracts.includes('/api/alpha'));
  coord(['contracts', 'alpha', '--rm', '/api/alpha'], { human: true });   // leave the fixture as found

  // --own replaces the set. That is the move that silently dropped twelve real
  // contracts off creater-ai-backend, so dropping anything needs saying so -- and it
  // needs saying by a person or an agent alike, because typing was never the risk.
  const wipe = coord(['contracts', 'gamma', '--own', '/api/gamma'], { human: true });
  ok('replacing the set refuses to drop silently', !wipe.ok
    && /drops 1/.test(wipe.out + wipe.err) && /\/internal\/legacy/.test(wipe.out + wipe.err), wipe.out + wipe.err);
  ok('nothing dropped', JSON.parse(fs.readFileSync(path.join(CO, 'repos.json'), 'utf8'))
    .repos.find(r => r.name === 'gamma').contracts.includes('/internal/legacy'));
  const wipeYes = coord(['contracts', 'gamma', '--own', '/api/gamma', '--yes']);
  ok('and does it when told to, agent or not', wipeYes.ok && /removed:\s+\/internal\/legacy/.test(wipeYes.out), wipeYes.out + wipeYes.err);
  coord(['contracts', 'gamma', '--add', '/internal/legacy']);

  const cbad = coord(['contracts', 'gamma', '--own', 'notapath'], { human: true });
  ok('a contract has to be a path', !cbad.ok && /starts with/.test(cbad.out + cbad.err), cbad.out + cbad.err);
  const crm = coord(['contracts', 'gamma', '--rm', '/internal/legacy']);
  ok('and can be taken off again', crm.ok && /removed:\s+\/internal\/legacy/.test(crm.out), crm.out);
  const cre = coord(['onboard', 'gamma', '--apply'], { human: true });
  ok('onboarding an onboarded repo says so in words, and writes nothing',
    !cre.ok && /already onboarded/.test(cre.out + cre.err) && /coord contracts gamma/.test(cre.out + cre.err), cre.out + cre.err);
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
  // A map nobody is told about is not a map. The briefing has to name the index and say
  // to stop there, or an agent either never opens it or reads four megabytes of it. And
  // a map is only true as of the commit it was built at, so the drift goes in the same
  // line -- a session that has to run a command to learn it is a session that will not.
  const wdir = path.join(CO, 'graphs', 'gamma', 'wiki');
  fs.mkdirSync(wdir, { recursive: true });
  fs.writeFileSync(path.join(wdir, 'index.md'), '# Knowledge Graph Index\n\n## Communities\n- [Thing](Thing.md) - 3 nodes\n');
  fs.writeFileSync(path.join(CO, 'graphs', 'gamma', 'REPORT.md'), '# gamma graph\n');
  git(['add', '-A'], dir);
  git(['-c', 'user.email=d@d', '-c', 'user.name=drill', 'commit', '-qm', 'gamma base'], dir);
  const atHead = git(['rev-parse', 'HEAD'], dir).stdout.trim();
  fs.writeFileSync(path.join(CO, 'graphs', 'gamma', 'built.json'),
    JSON.stringify({ repo: 'gamma', commit: atHead, built: L_nowish(), by: 'drill' }));
  const brf = () => cp.spawnSync(process.execPath, [HOOK, 'session-start'], {
    input: JSON.stringify({ cwd: dir }), encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  }).stdout;
  const wbrief = brf();
  ok('the briefing names the repo its own graph index', /graphs\/gamma\/wiki\/index\.md/.test(wbrief), wbrief.slice(0, 400));
  ok('and says to read the index, not the wiki', /Never read the whole wiki/.test(wbrief), wbrief.slice(0, 400));
  ok('a graph built at HEAD is called current', /It is current with HEAD/.test(wbrief), wbrief.slice(0, 600));

  fs.writeFileSync(path.join(dir, 'drift.js'), '// moved on\n');
  git(['add', '-A'], dir);
  git(['-c', 'user.email=d@d', '-c', 'user.name=drill', 'commit', '-qm', 'drift'], dir);
  const sbrief = brf();
  ok('a graph behind HEAD says how far, without being asked',
    /built 1 commit\(s\) before gamma's HEAD/.test(sbrief), sbrief.slice(0, 600));
  ok('and names what brings it up to date', /coord graph gamma/.test(sbrief), sbrief.slice(0, 600));

  fs.rmSync(path.join(CO, 'graphs', 'gamma'), { recursive: true, force: true });
  ok('and says nothing about a graph that does not exist', !/wiki\/index\.md/.test(brf()), brf().slice(0, 300));

  ok('briefing switches from discovered to onboarded', /onboarded repo of the jetKreate platform/.test(hres.stdout) && !/is not onboarded/.test(hres.stdout), hres.stdout.slice(0, 140));
  ok('tickets can be filed at it', coord(['new', '--from', 'alpha', '--to', name, '--title', 'gamma please'], { cwd: path.join(TMP, 'alpha') }).ok);
  ok('check is clean after onboarding', !coord(['check']).out.includes('ERROR'), coord(['check']).out);

  // offboard: history survives
  ok('offboard refused without --yes', !coord(['offboard', name], { human: true }).ok);
  ok('offboard refused for a repo session', !coord(['offboard', name, '--yes']).ok);
  const off = coord(['offboard', name, '--yes'], { human: true });
  const e2 = JSON.parse(fs.readFileSync(path.join(CO, 'repos.json'), 'utf8')).repos.find(r => r.name === name);
  ok('offboard marks the registry entry', off.ok && e2.status === 'offboarded' && !!e2.offboarded, off.out);
  ok('status folder archived, not deleted',
    !fs.existsSync(path.join(CO, 'status', 'gamma')) &&
    fs.readdirSync(path.join(CO, 'archive', 'status', 'gamma')).some(f => f.endsWith('.md')));
  ok('its open ticket archived with a flag',
    /gamma please.*was open at offboarding/.test(fs.readFileSync(path.join(CO, 'archive', 'tickets-index.md'), 'utf8')));
  ok('decisions untouched by offboarding', fs.readdirSync(path.join(CO, 'decisions')).length >= 2);
  ok('offboarded repo listed as such', /offboarded \(1\)[\s\S]*gamma/.test(coord(['repos']).out), coord(['repos']).out);
  ok('repo files untouched by offboarding', fs.existsSync(path.join(dir, 'src', 'routes.js')));
  ok('check still clean after offboarding', !coord(['check']).out.includes('ERROR'), coord(['check']).out);

  // Bringing one back. regPut replaces the row rather than merging, and an offboarded
  // repo passes the "not already onboarded" check -- so a bare --apply here used to
  // silently empty everything it owned.
  const back = coord(['onboard', name, '--apply'], { human: true });
  const e3 = JSON.parse(fs.readFileSync(path.join(CO, 'repos.json'), 'utf8')).repos.find(r => r.name === name);
  ok('an offboarded repo can be onboarded again', back.ok && e3.status === 'active', back.out + back.err);
  ok('and comes back owning what it owned, not nothing',
    e3.contracts.join(',') === '/api/gamma', JSON.stringify(e3.contracts));
  ok('it says so rather than leaving you to diff the registry', /already owned/.test(back.out), back.out);
  ok('check clean after the round trip', !coord(['check']).out.includes('ERROR'), coord(['check']).out);
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
  const sp = statusPath(CO, 'beta');
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
    fs.readFileSync(path.join(CO, 'archive', 'handoffs', 'beta', path.basename(statusPath(CO, 'beta'))), 'utf8').includes('note 6'));
  ok('archive snapshotted .coord', git(['log', '--oneline'], CO).stdout.includes('archive'));

  const w = coord(['why', `${path.join(TMP, 'beta', 'jobs.js')}:2`], { cwd: path.join(TMP, 'beta') });
  ok('coord why still finds the ticket after archiving', w.ok && w.out.includes(id) && /archived/.test(w.out), w.out);
  ok('coord search finds the archived ticket', coord(['search', 'v1/jobs']).out.includes(id));
}

// The three promises that are not about tickets at all: nothing automatic fails
// silently, a dev can always switch the whole thing off, and none of it needs a Mac.
function resilience() {
  const L = require('./lib.js');
  const hook = (event, payload) => cp.spawnSync(process.execPath, [HOOK, event], {
    input: JSON.stringify(payload), encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  const guardCall = (cwd, file) => cp.spawnSync(process.execPath, [GUARD], {
    input: JSON.stringify({ cwd, tool_name: 'Write', tool_input: { file_path: file } }),
    encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  }).stdout;
  // Another repo's status file is refused on ownership, never on a ticket — so this
  // probe measures the guard being on or off, and nothing else.
  const beta = path.join(TMP, 'beta'), alphaFile = statusPath(CO, 'alpha');
  const today = path.join(CO, 'activity', `${new Date().toISOString().slice(0, 10)}.log`);
  const failLog = path.join(CO, 'activity', 'failures.log');

  /* --- failures surface, and say how to do it by hand --- */
  ok('nothing failed, nothing to report', coord(['fix']).out.includes('quietly'));
  fs.appendFileSync(failLog, `${new Date().toISOString()}\tsync\tfetch failed: no route to host\tcoord sync\n`.repeat(3));
  const f1 = coord(['fix']);
  ok('coord fix shows what failed', f1.out.includes('no route to host'), f1.out);
  ok('coord fix shows the manual command', /by hand:\s+coord sync/.test(f1.out), f1.out);
  ok('repeats collapse into one row with a count', /\(3x/.test(f1.out) && (f1.out.match(/no route to host/g) || []).length === 1, f1.out);
  // The board has a working remote by this point, so a sync that succeeds should forget
  // the sync failures — and only those. A guard crash is a different problem.
  fs.appendFileSync(failLog, `${new Date().toISOString()}\tguard\tcrashed\tcoord drill\n`);
  const f2 = coord(['sync', '--quiet']).ok && coord(['fix']).out;
  ok('a good sync clears its own backlog and nothing else',
    f2 && !f2.includes('no route to host') && f2.includes('crashed'), String(f2));
  const bh = hook('session-start', { cwd: TMP });
  ok('a failure reaches the session briefing',
    /coord fix/.test(((JSON.parse(bh.stdout || '{}').hookSpecificOutput) || {}).additionalContext || ''),
    'stdout=' + bh.stdout + ' stderr=' + bh.stderr);
  const ck = coord(['check']);
  ok('coord check points at it too', ck.out.includes('coord fix'), ck.out);
  ok('coord fix --clear empties it', coord(['fix', '--clear']).ok && !fs.existsSync(failLog));
  ok('failures.log is gitignored', fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8').includes('activity/failures.log'));
  // Ignoring a file does nothing once it is tracked — somebody's hook crashes were
  // riding along on the shared board for two days before anyone noticed.
  // The other half of the same rule: the files that ARE shared must say nothing about
  // one machine, or a pull would hand everyone someone else's disk layout.
  // Every string in a shared file, checked one by one. "/models" is an API route, not a
  // disk path, so look for what only a filesystem has. `remote` is exempt: a clone URL is
  // shared on purpose, and in this drill it happens to be a local bare repo.
  const machineSpecific = () => {
    const DISK = /^(\/(Users|home|var|tmp|private|mnt|opt|srv)\/|[A-Za-z]:[\\\\/])/;
    const hits = [];
    const walk = (v, where) => {
      if (typeof v === 'string') {
        if (DISK.test(v) || v.includes(os.homedir()) || v.includes(TMP)) hits.push(`${where} = ${v}`);
      } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== 'remote') walk(x, `${where}.${k}`);
    };
    for (const f of ['repos.json', 'people.json', 'state.json']) {
      walk(JSON.parse(fs.readFileSync(path.join(CO, f), 'utf8')), f);
    }
    return hits;
  };
  ok('nothing shared describes one machine', !machineSpecific().length, machineSpecific().join('; '));
  ok('the registry carries no path field at all',
    !JSON.parse(fs.readFileSync(path.join(CO, 'repos.json'), 'utf8')).repos.some(r => 'path' in r),
    fs.readFileSync(path.join(CO, 'repos.json'), 'utf8').slice(0, 300));
  ok('and a path field from an older board is dropped on the next write', (() => {
    const f = path.join(CO, 'repos.json');
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    j.repos[0].path = '/somebody/elses/disk/' + j.repos[0].name;
    fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
    coord(['where']);                                  // any command that touches the registry
    cp.spawnSync(process.execPath, ['-e',
      `const L=require('${path.join(__dirname, 'lib.js').replace(/\\/g, '/')}');L.writeRegistry(L.registry())`],
      { env: { ...process.env, COORD_ROOT: CO } });
    return !/somebody\/elses\/disk/.test(fs.readFileSync(f, 'utf8'));
  })(), fs.readFileSync(path.join(CO, 'repos.json'), 'utf8').slice(0, 200));

  ok('no machine-local file is actually tracked on the board', (() => {
    const tracked = git(['ls-files'], path.join(__dirname, '..')).stdout.split('\n');
    return !tracked.some(f => ['activity/hook-errors.log', 'activity/failures.log', 'paths.json', 'local.json', 'paused'].includes(f));
  })(), git(['ls-files'], path.join(__dirname, '..')).stdout.split('\n').filter(f => /hook-errors|failures\.log|paths\.json|local\.json|paused/.test(f)).join(' '));

  /* --- pause: the escape hatch --- */
  ok('guard blocks a cross-repo write while running', /permissionDecision":"deny/.test(guardCall(beta, alphaFile)));
  const p = coord(['pause', 'drill']);
  ok('coord pause says what it switched off', p.ok && /no guard/.test(p.out), p.out);
  ok('paused: the guard allows everything', guardCall(beta, alphaFile) === '', guardCall(beta, alphaFile));
  const before = fs.readFileSync(today, 'utf8');
  hook('edit', { cwd: beta, tool_input: { file_path: path.join(beta, 'jobs.js') } });
  ok('paused: nothing is recorded', fs.readFileSync(today, 'utf8') === before);
  ok('paused: session start says so, once', /paused on this machine/.test(
    JSON.parse(hook('session-start', { cwd: beta }).stdout || '{}').hookSpecificOutput.additionalContext));
  ok('paused: coord check says so', coord(['check']).out.includes('PAUSED'));
  ok('paused: the git hooks bail out first', (() => {
    const h = fs.readFileSync(path.join(beta, '.git', 'hooks', 'post-commit'), 'utf8');
    const i = h.indexOf('paused'), j = h.indexOf('log-commit');
    return i > 0 && j > i;
  })());
  ok('the paused file is gitignored', fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8').split('\n').includes('paused'));
  ok('coord resume brings it back', coord(['resume']).ok && /permissionDecision":"deny/.test(guardCall(beta, alphaFile)));
  ok('resume twice is harmless', coord(['resume']).out.includes('already running'));

  /* --- crossing a session boundary --- */
  // A new window, a /clear, a compaction, a crash. Everything the next session needs has
  // to be on disk, because the conversation that knew it is gone.
  const sess = path.join(TMP, 'beta');
  const statusOf = () => fs.readFileSync(statusPath(CO, 'beta'), 'utf8');
  const brief = cwd => {
    const r = hook('session-start', { cwd });
    try { return JSON.parse(r.stdout || '{}').hookSpecificOutput.additionalContext || ''; } catch { return ''; }
  };
  const notesIn = t => (t.match(/^### /gm) || []).length;

  const notes0 = notesIn(statusOf());
  hook('session-start', { cwd: sess });
  hook('edit', { cwd: sess, tool_input: { file_path: path.join(sess, 'src', 'queue.js') } });
  hook('session-stop', { cwd: sess });
  ok('a session that ends writes its own handoff note', notesIn(statusOf()) === notes0 + 1, statusOf().slice(-400));
  ok('and the note says what it touched', /queue\.js/.test(statusOf()), statusOf().slice(-300));
  ok('the notes stay separate blocks', /\n\n### note 1/.test(statusOf()), JSON.stringify(statusOf().slice(-260)));
  ok('it admits it was written automatically', /written automatically/.test(statusOf()));
  ok('the next session is told where the last one left off',
    /left off/.test(brief(sess)) && /queue\.js/.test(brief(sess)), brief(sess));

  // The agent's own note is always better than a generated one.
  hook('session-start', { cwd: sess });
  hook('edit', { cwd: sess, tool_input: { file_path: path.join(sess, 'src', 'other.js') } });
  cp.spawnSync(process.execPath, ['-e',
    `require('${path.join(__dirname, 'lib.js').replace(/\\/g, '/')}').addHandoff('beta','Deliberate note: next is the empty state.')`],
    { env: { ...process.env, COORD_ROOT: CO } });
  const n2 = notesIn(statusOf());
  hook('session-stop', { cwd: sess });
  // ^### with /m, so the "### <timestamp>" inside the template's HTML comment is skipped.
  const topNote = () => (statusOf().split(/^### /m)[1] || '');
  ok('a session does not overwrite the note the agent already wrote',
    notesIn(statusOf()) === n2 && /Deliberate note/.test(topNote()),
    `notes ${notesIn(statusOf())} vs ${n2}; top: ${topNote().slice(0, 90)}`);

  // A session that changed nothing should leave no trace.
  hook('session-start', { cwd: sess });
  const n3 = notesIn(statusOf());
  hook('session-stop', { cwd: sess });
  ok('a session that changed nothing writes no note', notesIn(statusOf()) === n3);

  // The ticket a repo is on survives too — it lives in .git/, not in any conversation.
  ok('coord inside a repo answers "where was I"', (() => {
    const o = coord([], { cwd: sess, human: true }).out;
    return /beta/.test(o) && /last session here/.test(o);
  })(), coord([], { cwd: sess, human: true }).out);
  ok('the tracked file still says what to do if no briefing arrived', (() => {
    const d = require('./devsetup.js').copilotDoc('beta');
    return /Start of every session/.test(d) && /run .?coord.?/.test(d) && /handoff note/.test(d);
  })());

  /* --- somebody else's instructions --- */
  // The file coord writes into each repo is TRACKED. Overwriting one a person wrote is
  // destroying their work, and it is the kind of thing nobody notices until review.
  const instr = path.join(TMP, 'beta', '.github', 'copilot-instructions.md');
  const theirs = '# beta\n\n## House style\n\n- zod on every request body.\n';
  fs.mkdirSync(path.dirname(instr), { recursive: true });
  fs.writeFileSync(instr, theirs);

  const dev = (...a) => coord(['devsetup', '--repo', 'beta', ...a], { human: false });
  ok('instructions we did not write are left completely alone', (() => {
    const r = dev();
    return fs.readFileSync(instr, 'utf8') === theirs && /LEFT ALONE/.test(r.out);
  })(), dev().out);
  ok('and it says exactly how to add ours if you want to', /--merge/.test(dev().out));

  ok('--merge keeps every line of theirs and adds one marked block', (() => {
    dev('--merge');
    const after = fs.readFileSync(instr, 'utf8');
    return after.startsWith(theirs.trim()) && after.includes('BEGIN:coord') && after.includes('END:coord');
  })(), fs.readFileSync(instr, 'utf8').slice(0, 200));

  ok('re-running refreshes only the block, never the rest', (() => {
    const before = fs.readFileSync(instr, 'utf8');
    dev();
    const after = fs.readFileSync(instr, 'utf8');
    // their half survives, and exactly one block exists
    return after.includes('zod on every request body') &&
      (after.match(/BEGIN:coord/g) || []).length === 1 &&
      after.startsWith(theirs.trim());
  })(), fs.readFileSync(instr, 'utf8').slice(0, 160));

  ok('a block already present needs no second permission', (() => {
    // change the generated content by changing the board, then plain devsetup must update
    const after = fs.readFileSync(instr, 'utf8');
    return !/LEFT ALONE/.test(dev().out) && after.includes('BEGIN:coord');
  })());

  fs.rmSync(path.join(TMP, 'beta', '.github'), { recursive: true, force: true });
  ok('with no file at all, it writes the whole thing', (() => {
    dev();
    const after = fs.readFileSync(instr, 'utf8');
    return after.startsWith('# beta — platform rules');
  })(), fs.readFileSync(instr, 'utf8').slice(0, 80));
  ok('and that one it owns, so a re-run updates it in place', (() => {
    const r = dev();
    return !/LEFT ALONE/.test(r.out);
  })());

  /* --- mail --- */
  // Four notices built from the board. The rails matter more than the copy: nothing is
  // sent without --send, nothing reaches an address off the allowed domains, and nothing
  // leaks anything the board does not already hold.
  const mail = (...a) => coord(['mail', ...a], { human: true });
  ok('coord mail prints and does not send', (() => {
    const o = mail('digest').out;
    return /not sent/.test(o) && !/sent to/.test(o);
  })(), mail('digest').out);
  ok('a quiet week produces no weekly wrap at all', /quiet week|not sent/.test(mail('weekly').out));
  const someone = JSON.parse(fs.readFileSync(path.join(CO, 'people.json'), 'utf8')).people[0];
  ok('welcome names the person and the repos', (() => {
    const f = path.join(TMP, 'welcome.html');
    const r = mail('welcome', '--to', someone.name, '--html', f);
    if (!fs.existsSync(f)) return false;
    const h = fs.readFileSync(f, 'utf8');
    return h.includes(someone.name) && h.includes('alpha') && h.includes('beta');
  })(), someone && someone.name);
  ok('the welcome draws everyone, with the newcomer marked', (() => {
    const f = path.join(TMP, 'welcome.html');
    if (!fs.existsSync(f)) return false;
    const h = fs.readFileSync(f, 'utf8');
    return /of us now/.test(h) && /pulse/.test(h);
  })());
  ok('--new sends to nobody when nobody is new', /nobody new/.test(mail('welcome', '--new').out), mail('welcome', '--new').out);

  // Email clients mostly ignore CSS animation, so no animation may hide content.
  ok('no animation starts from invisible', (() => {
    const css = fs.readFileSync(path.join(__dirname, 'mail.js'), 'utf8');
    const frames = [...css.matchAll(/@keyframes\s+\w+\s*\{([^}]*\}[^}]*)\}/g)].map(m => m[1]);
    return frames.length > 0 && !frames.some(f => /from\s*\{[^}]*opacity\s*:\s*0/.test(f));
  })(), 'a keyframe starts at opacity:0 — it would blank the mail in Gmail and Outlook');
  ok('every inline colour has a theme class beside it', (() => {
    const src = fs.readFileSync(path.join(__dirname, 'mail.js'), 'utf8');
    // the dark block must redefine every class the helpers actually use
    const used = ['ink', 'muted', 'faint', 'sunk', 'sig', 'rule'];
    const dark = (src.match(/prefers-color-scheme: dark\)[\s\S]*?\n  \}/) || [''])[0];
    return used.every(c => dark.includes('.' + c + ' ') || dark.includes('.' + c + '{') || dark.includes('.' + c + ','));
  })());

  const N = require('./notices.js');
  ok('it refuses any address off the allowed domains', (() => {
    return !N.allowed('someone@gmail.com') && !N.allowed('') && N.allowed('a@jetsynthesys.com');
  })());
  ok('people who opted out get nothing', (() => {
    // Both counts have to come from a process pointed at the drill board, not this one.
    const count = () => Number(cp.spawnSync(process.execPath, ['-e',
      `console.log(require('${path.join(__dirname, 'notices.js').replace(/\\/g, '/')}').recipients().length)`],
      { encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO } }).stdout.trim());
    const pf = path.join(CO, 'people.json');
    const before = count();
    const roster = JSON.parse(fs.readFileSync(pf, 'utf8'));
    roster.people[0].notify = false;
    fs.writeFileSync(pf, JSON.stringify(roster, null, 2) + '\n');
    const after = count();
    delete roster.people[0].notify;
    fs.writeFileSync(pf, JSON.stringify(roster, null, 2) + '\n');
    return before > 0 && after === before - 1;
  })());
  ok('the nudge record is shared, not per-machine', (() => {
    const gi = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
    const src = fs.readFileSync(path.join(__dirname, 'notices.js'), 'utf8');
    return !gi.split('\n').includes('notify.json') && /notifyState\(\)\.nudged/.test(src);
  })());
  ok('the API key is never written to the board', (() => {
    const gi = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
    const wf = path.join(__dirname, '..', '.github', 'workflows', 'notices.yml');
    const y = fs.existsSync(wf) ? fs.readFileSync(wf, 'utf8') : '';
    return gi.split('\n').includes('mail.json') && /secrets\.RESEND_API_KEY/.test(y) && !/re_[A-Za-z0-9]{8}/.test(y);
  })());

  /* --- the context store: a shared fact that belongs to no repo --- */
  ok('an empty context store says how to fill it', coord(['ctx']).out.includes('--add'));
  const add = coord(['ctx', '--add', 'Staging URL', '--body', 'https://staging.example.test — reset nightly.'], { cwd: path.join(TMP, 'beta') });
  ok('coord ctx --add writes a note', add.ok && fs.existsSync(path.join(CO, 'context', 'staging-url.md')), add.out);
  ok('listing is titles only, so it stays cheap', (() => {
    const o = coord(['ctx']).out;
    return o.includes('Staging URL') && !o.includes('reset nightly');
  })(), coord(['ctx']).out);
  ok('searching the notes prints them in full', coord(['ctx', 'nightly']).out.includes('reset nightly'));
  ok('the note records who wrote it', /by: /.test(fs.readFileSync(path.join(CO, 'context', 'staging-url.md'), 'utf8')));
  ok('coord search covers context notes', coord(['search', 'staging.example']).out.includes('context/staging-url.md'));
  ok('re-adding the same title updates in place', (() => {
    const r = coord(['ctx', '--add', 'Staging URL', '--body', 'moved to https://stg.example.test']);
    return r.out.includes('updated') && fs.readdirSync(path.join(CO, 'context')).length === 1;
  })());
  ok('a note with no body is refused', !coord(['ctx', '--add', 'Empty']).ok);
  ok('coord ctx --rm drops it', coord(['ctx', '--rm', 'staging-url']).ok && !fs.readdirSync(path.join(CO, 'context')).length);
  ok('dropping one that is not there says so', !coord(['ctx', '--rm', 'nope']).ok);
  ok('a board snapshot commits the board, not coord\'s own source', (() => {
    fs.mkdirSync(path.join(CO, 'bin'), { recursive: true });
    fs.writeFileSync(path.join(CO, 'bin', 'halfdone.js'), '// mid-edit\n');
    coord(['ctx', '--add', 'Snapshot scope', '--body', 'checking what gets committed']);
    const staged = git(['status', '--short'], CO).stdout;
    return /bin\/halfdone\.js/.test(staged);          // still uncommitted, as it should be
  })(), git(['status', '--short'], CO).stdout);

  /* --- no Mac required --- */
  ok('a Windows launcher ships beside the CLI', (() => {
    const c = fs.readFileSync(path.join(__dirname, 'coord.cmd'), 'utf8');
    return /%~dp0coord/.test(c) && /\r\n/.test(c);                  // CRLF: cmd.exe needs it
  })());
  ok('scanning the repos spawns nothing', !/sh\('grep'/.test(fs.readFileSync(path.join(__dirname, 'lib.js'), 'utf8')));
  ok('the id scan finds a JET tag in source', (() => {
    fs.writeFileSync(path.join(TMP, 'alpha', 'tagged.js'), '// JET-401: why this exists\n');
    const hits = cp.spawnSync(process.execPath, ['-e',
      `const L=require('${path.join(__dirname, 'lib.js').replace(/\\/g, '/')}');console.log(L.codeMaxTicket())`],
      { encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO } });
    fs.rmSync(path.join(TMP, 'alpha', 'tagged.js'));
    return hits.stdout.trim() === '401';
  })());
  ok('setup prints a PowerShell PATH line on Windows', (() => {
    const s = fs.readFileSync(path.join(__dirname, 'setup.js'), 'utf8');
    return /isWindows/.test(s) && /setx PATH/.test(s);
  })());

  /* --- Claude Code's hooks are installed, not assumed --- */
  const settings = path.join(TMP, 'settings.json');
  const foreign = { hooks: { SessionStart: [{ hooks: [{ type: 'command', command: 'bash /somebody/else.sh' }] }] }, other: 1 };
  fs.writeFileSync(settings, JSON.stringify(foreign, null, 2) + '\n');
  const D = require('./devsetup.js');
  const r1 = D.installClaudeHooks({ file: settings });
  const got = JSON.parse(fs.readFileSync(settings, 'utf8'));
  const cmds = Object.values(got.hooks).flat().flatMap(e => e.hooks).map(h => h.command);
  ok('installing coord hooks keeps everyone else\'s', cmds.includes('bash /somebody/else.sh') && got.other === 1, r1.join('; '));
  ok('all four coord hooks land', ['hook.js" session-start', 'hook.js" session-stop', 'hook.js" edit', 'guard.js']
    .every(s => cmds.some(c => c.includes(s))), cmds.join('\n'));
  ok('it backs the old settings up first', fs.readdirSync(TMP).some(f => /^settings\.json\.bak\./.test(f)));
  D.installClaudeHooks({ file: settings });
  const twice = JSON.parse(fs.readFileSync(settings, 'utf8'));
  ok('running it twice does not stack hooks',
    Object.values(twice.hooks).flat().flatMap(e => e.hooks).length === cmds.length);
  fs.writeFileSync(settings, '{ this is not json');
  ok('it refuses to touch settings it cannot parse',
    D.installClaudeHooks({ file: settings })[0].includes('not valid JSON') &&
    fs.readFileSync(settings, 'utf8') === '{ this is not json');
}

// Not everyone keeps their repos in one folder. The board must not care, and the guard
// must not quietly stop working for the people who don't.
function scattered() {
  const away = path.join(TMP, 'elsewhere', 'delta');
  fs.mkdirSync(away, { recursive: true });
  git(['init', '-q'], away); git(['config', 'user.email', 'd@d'], away); git(['config', 'user.name', 'drill'], away);
  fs.writeFileSync(path.join(away, 'package.json'), JSON.stringify({ name: 'delta' }));
  fs.writeFileSync(path.join(away, 'index.js'), 'module.exports = 1;\n');
  git(['add', '-A'], away); git(['commit', '-qm', 'init'], away);

  ok('a repo outside the root is invisible until you say where it is',
    !coord(['repos']).out.includes('delta'), coord(['repos']).out);
  const pre = coord(['onboard', 'delta', '--at', away, '--preflight']);
  ok('preflight works on a repo anywhere on disk', pre.ok && /\[x\] contains \.git/.test(pre.out), pre.out);
  const ap = coord(['onboard', 'delta', '--at', away, '--apply'], { human: true });
  ok('onboarding records where it is, on this machine only',
    ap.ok && /paths\.json/.test(ap.out) && fs.existsSync(path.join(CO, 'paths.json')), ap.out);
  ok('paths.json is gitignored — your disk is not theirs',
    fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8').split('\n').includes('paths.json'));
  ok('the registry stays machine-independent', (() => {
    const e = JSON.parse(fs.readFileSync(path.join(CO, 'repos.json'), 'utf8')).repos.find(r => r.name === 'delta');
    return e && !JSON.stringify(e).includes(TMP);     // no absolute path travels to anyone else
  })(), fs.readFileSync(path.join(CO, 'repos.json'), 'utf8').slice(0, 300));
  ok('coord where lists it', /delta/.test(coord(['where']).out), coord(['where']).out);

  const guardCall = (cwd, file) => cp.spawnSync(process.execPath, [GUARD], {
    input: JSON.stringify({ cwd, tool_name: 'Write', tool_input: { file_path: file } }),
    encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  }).stdout;
  const betaFile = path.join(TMP, 'beta', 'jobs.js');
  ok('the guard still fires from a scattered repo into a normal one',
    /permissionDecision":"ask/.test(guardCall(away, betaFile)), guardCall(away, betaFile));
  ok('and from a normal repo into the scattered one',
    /permissionDecision":"ask/.test(guardCall(path.join(TMP, 'beta'), path.join(away, 'index.js'))));
  ok('its own files are still its own', guardCall(away, path.join(away, 'index.js')) === '');

  // Everyone owns every repo, so a sanctioned cross-repo change must not need a second
  // terminal — but only a ticket somebody approved counts as sanction.
  const betaDir = path.join(TMP, 'beta'), deltaFile = path.join(away, 'index.js');
  ok('an unsanctioned cross-repo write still stops to ask',
    /permissionDecision":"ask/.test(guardCall(betaDir, deltaFile)));
  const span = coord(['new', '--from', 'beta', '--to', 'delta', '--title', 'Spanning change',
    '--request', 'r', '--reason', 'r'], { cwd: betaDir });
  const sid = (span.out.match(/JET-\d+/) || [])[0];
  ok('an approved-but-not-started request is not yet a licence', (() => {
    coord(['approve', sid], { human: true });
    return /permissionDecision":"ask/.test(guardCall(betaDir, deltaFile));
  })(), sid + ' ' + span.out);
  ok('an in-progress ticket licenses the write, both ways', (() => {
    coord(['start', sid], { cwd: betaDir });
    return guardCall(betaDir, deltaFile) === '' && guardCall(away, path.join(TMP, 'beta', 'jobs.js')) === '';
  })(), guardCall(betaDir, deltaFile));
  ok('closing the request closes the licence', (() => {
    coord(['reject', sid, 'done with the span'], { human: true });
    return /permissionDecision":"ask/.test(guardCall(betaDir, deltaFile));
  })(), guardCall(betaDir, deltaFile));
  ok('the licence does not open up a third repo',
    /permissionDecision":"ask/.test(guardCall(path.join(TMP, 'alpha'), deltaFile)));
  ok('a repo nobody registered is left alone', (() => {
    const outside = path.join(TMP, 'elsewhere', 'notours');
    fs.mkdirSync(outside, { recursive: true });
    git(['init', '-q'], outside);
    return guardCall(outside, path.join(outside, 'x.js')) === '';
  })());

  const hook = (event, payload) => cp.spawnSync(process.execPath, [HOOK, event], {
    input: JSON.stringify(payload), encoding: 'utf8', env: { ...process.env, COORD_ROOT: CO },
  });
  ok('it gets briefed like any other repo', /delta/.test(
    JSON.parse(hook('session-start', { cwd: away }).stdout || '{}').hookSpecificOutput.additionalContext));
  ok('tickets can be filed at it', coord(['new', '--from', 'beta', '--to', 'delta', '--title', 'Across disks'],
    { cwd: path.join(TMP, 'beta') }).ok);
  ok('coord where --forget puts it back to the default', (() => {
    if (!coord(['where', '--forget', 'delta']).ok) return false;
    const m = JSON.parse(fs.readFileSync(path.join(CO, 'paths.json'), 'utf8')).paths;
    return !m.delta && /delta\s+not on this machine/.test(coord(['where']).out);
  })(), coord(['where']).out);

  /* --- two people in one file --- */
  // Activity lines only name a person the roster knows, so put a second person on it.
  const pf = path.join(CO, 'people.json');
  const roster = JSON.parse(fs.readFileSync(pf, 'utf8'));
  roster.people.push({ name: 'Riya', email: 'riya@d', tool: 'copilot', since: '2026-01-01' });
  fs.writeFileSync(pf, JSON.stringify(roster, null, 2) + '\n');

  const today = path.join(CO, 'activity', `${new Date().toISOString().slice(0, 10)}.log`);
  const stamp = m => new Date(Date.now() - m * 60000).toISOString();
  fs.appendFileSync(today, `${stamp(20)}\tbeta\tedit\tRiya\tsrc/Checkout.tsx\n`);
  const r = hook('edit', { cwd: path.join(TMP, 'beta'), tool_input: { file_path: path.join(TMP, 'beta', 'src', 'Checkout.tsx') } });
  const ctx = (JSON.parse(r.stdout || '{}').hookSpecificOutput || {}).additionalContext || '';
  ok('editing a file someone else is in says so', /Riya/.test(ctx) && /Checkout\.tsx/.test(ctx), r.stdout);
  ok('the warning is honest about how fresh it is', /last sync/.test(ctx), ctx);
  // Said once, not on every keystroke — a tool that repeats itself gets switched off.
  ok('it says it once, not on every edit', (() => {
    const r2 = hook('edit', { cwd: path.join(TMP, 'beta'), tool_input: { file_path: path.join(TMP, 'beta', 'src', 'Checkout.tsx') } });
    return !/coord:/.test(r2.stdout || '');
  })());
  ok('a file only you have touched says nothing', (() => {
    const r3 = hook('edit', { cwd: path.join(TMP, 'beta'), tool_input: { file_path: path.join(TMP, 'beta', 'src', 'Mine.tsx') } });
    return !/coord:/.test(r3.stdout || '');
  })());
  fs.appendFileSync(today, `${stamp(600)}\tbeta\tedit\tRiya\tsrc/Old.tsx\n`);
  ok('a touch from yesterday is not a collision', (() => {
    const r3 = hook('edit', { cwd: path.join(TMP, 'beta'), tool_input: { file_path: path.join(TMP, 'beta', 'src', 'Old.tsx') } });
    return !/Riya/.test(r3.stdout || '');
  })());
  ok('the heartbeat clock is local, never shared',
    !fs.readFileSync(path.join(CO, 'state.json'), 'utf8').includes('lastSync') &&
    fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8').split('\n').includes('local.json'));
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
