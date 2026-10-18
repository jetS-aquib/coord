'use strict';
// Both agent harnesses hand a hook JSON on stdin and read a JSON decision from stdout —
// but not in the same dialect. Claude Code sends snake_case fields and wraps its answer
// in hookSpecificOutput. Copilot's CLI sends camelCase and reads a flat object, and
// honours exit code 2 as a deny whatever stdout said. VS Code's Copilot sits between the
// two and its own examples use the Claude shapes.
//
// Rather than ship two guards and two briefings, normalise on the way in and answer in
// both dialects at once: one object carrying both shapes, which each harness reads the
// half it knows of and ignores the rest. There is no branch left to get wrong.
const fs = require('fs');

const pick = (o, ...keys) => { for (const k of keys) if (o && o[k] != null) return o[k]; return undefined; };

function input() {
  let raw = {};
  try { raw = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { /* no payload: an empty one */ }
  // camelCase with no snake_case twin is Copilot's own CLI and nothing else. Anything we
  // are unsure about gets treated as Claude, because that is the dialect VS Code's
  // documented examples read and the one that does not rely on an exit code.
  const dialect = (raw.toolName || raw.toolArgs || raw.sessionId) && !raw.tool_name && !raw.session_id
    ? 'copilot' : 'claude';
  return {
    raw,
    dialect,
    cwd: pick(raw, 'cwd') || process.cwd(),
    session: pick(raw, 'session_id', 'sessionId') || '',
    tool: pick(raw, 'tool_name', 'toolName') || '',
    input: pick(raw, 'tool_input', 'toolArgs') || {},
  };
}

// Edit tools do not agree on what the file argument is called either, and the set is
// open-ended across harnesses — so look for any of the names any of them use.
const FILE_KEYS = ['file_path', 'filePath', 'notebook_path', 'notebookPath', 'path', 'target_file', 'targetFile'];
const fileOf = inp => { for (const k of FILE_KEYS) if (typeof (inp || {})[k] === 'string') return inp[k]; return undefined; };

// fs.writeSync, not process.stdout.write: stdout to a pipe is asynchronous and these
// processes exit the moment they are done, so an async write can be dropped on the floor.
const write = (s, fd = 1) => { try { fs.writeSync(fd, s); } catch { /* nobody listening */ } };

function say(eventName, fields) {
  write(JSON.stringify({ ...fields, hookSpecificOutput: { hookEventName: eventName, ...fields } }));
}

module.exports = { input, fileOf, say, write, FILE_KEYS };
