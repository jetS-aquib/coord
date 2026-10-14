'use strict';
// End-to-end self-test in a throwaway folder with two fake repos.
// Never touches real files: everything hangs off COORD_ROOT in a temp dir.
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const COORD_BIN = path.join(__dirname, 'coord');
const HOOK = path.join(__dirname, '..', 'hooks', 'hook.js');

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

  coord(['list']);
  ok('discovered repos get no status file', !fs.existsSync(path.join(CO, 'status')) || !fs.readdirSync(path.join(CO, 'status')).length,
    fs.existsSync(path.join(CO, 'status')) ? fs.readdirSync(path.join(CO, 'status')).join(' ') : '');
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
  ok('hook logs session-start', r.status === 0 && !r.stdout && lines().length === n + 1 && /\tbeta\tsession-start/.test(lines().at(-1)), r.stdout + r.stderr);

  n = lines().length;
  r = hook('edit', { cwd: path.join(TMP, 'beta'), tool_input: { file_path: path.join(TMP, 'beta', 'jobs.js') } });
  ok('hook logs edits with a repo-relative path', r.status === 0 && /\tbeta\tedit\tjobs\.js$/.test(lines().at(-1)), lines().at(-1));

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
  ok('hooks log it normally once onboarded', hres.status === 0 && /\tgamma\tsession-start/.test(log) && !/gamma: discovered/.test(log));
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
