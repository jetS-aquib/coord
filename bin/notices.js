'use strict';
// What each notice says, and how it gets out. Content is derived entirely from the board,
// so a notice can never say more than the board knows.
//
// SAFETY, deliberately: titles, ids, repo names, commit subjects, file paths. Never a
// diff, never file contents, never anything from outside .coord.
const fs = require('fs'), path = require('path');
const L = require('./lib.js');
const M = require('./mail.js');
const { P } = L;
const { esc, cmd, group, ticketRow, plainRow, shell, linePeople, C, SANS, MONO } = M;

const PAGE = 'https://claude.ai/artifact/7S4vf5VoEHjXiawhJcpJ1V';

/* ---------- reading the board ---------- */
const tickets = () => L.lsMd(P.tickets).map(f => L.parse(L.read(path.join(P.tickets, f))).fm);
const since = days => { const d = new Date(Date.now() - days * 864e5); return L.nowISO(d); };

// When a ticket last changed status, from its own thread — the same source the dashboard
// uses for card aging, so "not moved in 3 days" means the same thing everywhere.
function lastMoved(id) {
  const t = L.loadTicket(id);
  if (!t) return null;
  const moves = [...(t.sec.Thread || '').matchAll(/^(\S+) .*?status: (\S+) -> (\S+)/gm)];
  return moves.length ? moves[moves.length - 1][1] : t.fm.updated;
}

// Everything that happened in a window, grouped the way a person asks about it.
function digestData(name, { hours = 36 } = {}) {
  const cut = since(hours / 24);
  const all = tickets();
  const acts = L.recentActivity(3).filter(a => a.ts >= cut);

  const waiting = all.filter(t => ['open', 'review'].includes(t.status) &&
    (!t.filed_by || t.filed_by === name));
  const shipped = all.filter(t => t.status === 'done' && (lastMoved(t.id) || '') >= cut);
  const flight = all.filter(t => ['approved', 'in_progress'].includes(t.status));
  const stale = all.filter(t => !['done', 'rejected'].includes(t.status) &&
    L.daysAgo(lastMoved(t.id) || t.updated) >= 3);

  const commits = {};
  for (const a of acts) {
    if (a.event !== 'commit' || !a.repo) continue;
    (commits[a.repo] = commits[a.repo] || []).push({ who: a.who, text: a.line.split('\t').slice(4).join('\t') });
  }
  const movers = [...new Set(acts.filter(a => a.who && a.event === 'edit').map(a => a.who))];
  return { waiting, shipped, flight, stale, commits, movers, acts };
}

/* ---------- 1. welcome ---------- */
function welcome(person, { toTeam = false } = {}) {
  const roster = L.people();
  const names = roster.map(p => p.name);
  const repos = L.onboarded();
  const others = roster.filter(p => p.name !== person.name);

  if (toTeam) {
    const body = linePeople(names, person.name) +
      group('what they are set up with', 'muted', [
        plainRow(`${esc(person.name)} · ${esc(person.tool)}`, esc(person.email)),
      ]) +
      `<p class="muted" style="margin:0;font:400 14px/1.65 ${SANS};color:${C.muted}">
        They can see the board, file tickets and pick up anything that is open. If you are
        mid-way through something in a repo they will touch, now is a good moment to leave a
        handoff note.
      </p>`;
    return {
      subject: `${person.name} joined the platform`,
      preheader: `${person.name} is on the board, set up with ${person.tool}.`,
      html: shell({
        preheader: `${person.name} is on the board.`, eyebrow: 'someone joined',
        title: `${esc(person.name)} is on the board`,
        lead: `Set up with <strong style="color:${C.ink}">${esc(person.tool)}</strong>, and already able to see everything the rest of us can.`,
        body, footer: `${repos.length} repos · ${names.length} people · <a href="${PAGE}" style="color:${C.signalInk}">how this works</a>`,
      }),
      text: `${person.name} joined the platform. Set up with ${person.tool}. ${names.length} of us now.`,
    };
  }

  const todo = [];
  const here = L.repoDirs();
  for (const r of repos) if (!here[r]) todo.push(plainRow(`${esc(r)} is not on your machine`, `coord where ${esc(r)} &lt;path&gt;  ·  or clone it`));
  const onPath = (process.env.PATH || '').split(path.delimiter).some(p => p && L.real(p) === path.join(P.coord, 'bin'));
  if (!onPath) todo.push(plainRow(`coord is not on your PATH`, `re-run coord setup, or add .coord/bin yourself`));

  const body = linePeople(names, person.name) +
    group('the repos', 'signal', repos.map(r => {
      const e = L.regGet(r) || {};
      return plainRow(esc(r), esc(e.stack || '—'));
    })) +
    group('who else is here', 'muted', others.length
      ? others.map(p => plainRow(esc(p.name), esc(p.tool)))
      : [plainRow('just you, so far', 'the rest will appear as they run coord setup')]) +
    (todo.length ? group('still to do on your machine', 'warn', todo) : '') +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 0">
      <tr><td align="center" style="padding:6px 0 2px">
        <a href="${PAGE}" class="btn" style="display:inline-block;background:${C.signalInk};color:#fff;text-decoration:none;
           font:600 14px/1 ${SANS};padding:13px 22px;border-radius:9px">Read this first — five minutes</a>
      </td></tr>
      <tr><td align="center" class="faint" style="padding:11px 0 0;font:400 12px/1.6 ${MONO};color:${C.subtle}">
        then: ${esc('coord')} &nbsp;·&nbsp; ${esc('coord repos')}
      </td></tr>
    </table>`;

  return {
    subject: `Welcome to the platform, ${person.name.split(' ')[0]}`,
    preheader: `${repos.length} repos, ${names.length} of us, one board. Here is where everything is.`,
    html: shell({
      preheader: `${repos.length} repos, ${names.length} of us, one board.`, eyebrow: 'welcome',
      title: `You are on the board, ${esc(person.name.split(' ')[0])}`,
      lead: `Everything we coordinate lives in one small git repo beside the code. Nothing to log into, nothing running in the background.`,
      body, footer: `Anything odd? <span style="color:${C.ink}">coord fix</span> · in the way? <span style="color:${C.ink}">coord pause</span>`,
    }),
    text: `Welcome. ${repos.length} repos: ${repos.join(', ')}. Start here: ${PAGE}`,
  };
}

/* ---------- 2. daily digest, one per person ---------- */
function digest(person) {
  const d = digestData(person.name);
  if (!d.waiting.length && !d.shipped.length && !d.flight.length && !Object.keys(d.commits).length) return null;

  const first = person.name.split(' ')[0];
  const idle = t => Math.round(L.daysAgo(lastMoved(t.id) || t.updated));
  // A ticket already listed as waiting on you should not reappear three lines later under
  // a different heading. Its age goes on the row it is already on.
  const waitingIds = new Set(d.waiting.map(t => t.id));
  const stale = d.stale.filter(t => !waitingIds.has(t.id));
  const shippedRows = d.shipped.map(t => ticketRow(t, 'done')).concat(
    Object.entries(d.commits).map(([r, cs]) =>
      plainRow(`${esc(r)}`, `${cs.length} commit${cs.length > 1 ? 's' : ''} · ${esc([...new Set(cs.map(c => c.who).filter(Boolean))].join(', ') || 'unattributed')}`)));

  const body =
    group(`waiting on you (${d.waiting.length})`, d.waiting.length ? 'warn' : 'muted',
      d.waiting.map(t => ticketRow(t, `${t.status === 'open' ? 'needs your yes' : 'built, needs your check'}${idle(t) >= 3 ? ` · ${idle(t)} days now` : ''}`)), { delay: '' }) +
    // the count is of rows, not of tickets — "shipped (0)" above a list of commits is a lie
    group(`shipped (${shippedRows.length})`, 'good', shippedRows, { delay: 'rise2' }) +
    group(`in flight (${d.flight.length})`, 'signal',
      d.flight.map(t => ticketRow(t, t.status === 'in_progress' ? 'being worked on' : 'open to anyone')), { delay: 'rise3' }) +
    group(`not moved in a while (${stale.length})`, 'muted',
      stale.map(t => ticketRow(t, `${idle(t)} days`)), { delay: 'rise4' }) +
    (d.waiting.length ? `<div style="padding:4px 0 0">${cmd('coord')} <span class="faint" style="font:400 13px/1.7 ${SANS};color:${C.subtle}">&nbsp;shows this in your terminal, with the commands to answer it.</span></div>` : '');

  const head = d.waiting.length
    ? `${d.waiting.length} waiting on you`
    : d.shipped.length ? `${d.shipped.length} shipped` : `nothing needs you`;
  return {
    subject: `${head}${d.shipped.length && d.waiting.length ? ` · ${d.shipped.length} shipped` : ''}`,
    preheader: `${d.flight.length} in flight across ${L.onboarded().length} repos.`,
    html: shell({
      preheader: `${d.flight.length} in flight.`, eyebrow: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
      title: d.waiting.length
        ? `${d.waiting.length} thing${d.waiting.length > 1 ? 's are' : ' is'} waiting on you, ${esc(first)}`
        : `Nothing is waiting on you, ${esc(first)}`,
      lead: d.movers.length ? `${esc(d.movers.join(', '))} ${d.movers.length > 1 ? 'were' : 'was'} in the code since yesterday.` : '',
      body, footer: `<a href="${PAGE}" style="color:${C.signalInk}">how this works</a> · you get this on weekdays, and only when something happened`,
    }),
    text: `${head}. ${d.waiting.map(t => `${t.id} ${t.title}`).join('; ')}`,
  };
}

/* ---------- 3. weekly wrap, the same for everyone ---------- */
function weekly() {
  const all = tickets();
  const cut = since(7);
  const shipped = all.filter(t => t.status === 'done' && (lastMoved(t.id) || '') >= cut);
  const acts = L.recentActivity(7).filter(a => a.ts >= cut);
  const commits = acts.filter(a => a.event === 'commit');
  const byRepo = {};
  for (const a of commits) (byRepo[a.repo] = byRepo[a.repo] || []).push(a);
  const decisions = L.lsMd(P.decisions).filter(f => f !== 'index.md')
    .map(f => L.parse(L.read(path.join(P.decisions, f))).fm)
    .filter(fm => (fm.created || '') >= cut);
  const facts = L.lsMd(P.context).map(f => L.parse(L.read(path.join(P.context, f))))
    .filter(x => (x.fm.updated || '') >= L.day(new Date(Date.now() - 7 * 864e5)));
  const people = L.people().filter(p => (p.since || '') >= L.day(new Date(Date.now() - 7 * 864e5)));

  if (!shipped.length && !commits.length && !decisions.length) return null;

  const body =
    group(`shipped this week (${shipped.length})`, 'good', shipped.map(t => ticketRow(t, 'done')), {}) +
    group('where the work went', 'signal', Object.entries(byRepo)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([r, cs]) => plainRow(esc(r), `${cs.length} commit${cs.length > 1 ? 's' : ''}`)), { delay: 'rise2' }) +
    group(`decisions recorded (${decisions.length})`, 'signal',
      decisions.map(d => plainRow(`<span style="font-family:${MONO};font-size:13px">${esc(d.id)}</span>&nbsp; ${esc(d.title)}`,
        esc((d.repos || []).join(', ')))), { delay: 'rise3' }) +
    group('facts written down', 'muted', facts.map(f => plainRow(esc(f.fm.title), esc(f.fm.by || ''))), { delay: 'rise4' }) +
    group('new on the board', 'muted', people.map(p => plainRow(esc(p.name), esc(p.tool))), { delay: 'rise4' });

  return {
    subject: `This week: ${shipped.length} shipped, ${commits.length} commits`,
    preheader: `Across ${Object.keys(byRepo).length} repos.`,
    html: shell({
      preheader: `${shipped.length} shipped.`, eyebrow: 'the week',
      title: shipped.length ? `${shipped.length} shipped this week` : `A quiet week`,
      lead: `${commits.length} commits across ${Object.keys(byRepo).length} repo${Object.keys(byRepo).length === 1 ? '' : 's'}.`,
      body, footer: `Every Friday · <a href="${PAGE}" style="color:${C.signalInk}">how this works</a>`,
    }),
    text: `This week: ${shipped.length} shipped, ${commits.length} commits.`,
  };
}

/* ---------- 4. stale nudge: one person, one ticket, once a week ---------- */
// The version worth sending. A list of everything stale is a newsletter; one line about
// the one thing that is actually yours is a reminder.
const NUDGE_AFTER_DAYS = 3, RENUDGE_AFTER_DAYS = 7;
function nudges() {
  const sent = L.notifyState().nudged || {};
  const out = [];
  for (const t of tickets()) {
    if (!['open', 'review'].includes(t.status)) continue;
    const idle = L.daysAgo(lastMoved(t.id) || t.updated);
    if (idle < NUDGE_AFTER_DAYS) continue;
    if (sent[t.id] && L.daysAgo(sent[t.id]) < RENUDGE_AFTER_DAYS) continue;
    const who = t.filed_by && L.personNamed(t.filed_by);
    if (!who) continue;                                  // nobody specific to nudge
    out.push({ person: who, ticket: t, days: Math.round(idle) });
  }
  return out;
}
function nudge({ person, ticket, days }) {
  const n = ticket.id.replace(/^\D+/, '');
  const verb = ticket.status === 'open' ? 'approve it' : 'check it and close it';
  const body =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="b-warn rise" style="background:${C.warnSoft};border-radius:12px;margin:0 0 20px">
      <tr><td style="padding:18px 20px">
        ${ticketRow(ticket, `${days} days without moving`)}
      </td></tr></table>` +
    `<p class="muted" style="margin:0 0 16px;font:400 14px/1.65 ${SANS};color:${C.muted}">
      You filed it, so you are the one who ${esc(verb)}. Nobody else is blocked on this —
      it is just sitting there.
    </p>` +
    `<div>${cmd(`coord ok ${n}`)} &nbsp; ${cmd(`coord no ${n} "<why>"`)}</div>` +
    `<p class="faint" style="margin:14px 0 0;font:400 13px/1.6 ${SANS};color:${C.subtle}">
      Not yours any more? ${cmd(`coord note ${n} "..."`)} and someone else can pick it up.
    </p>`;
  return {
    subject: `${ticket.id} has been waiting ${days} days`,
    preheader: `${ticket.title} — ${verb}.`,
    html: shell({
      preheader: ticket.title, eyebrow: 'still waiting',
      title: `${esc(ticket.id)} has not moved in ${days} days`,
      lead: '', body,
      footer: `You will not get this again for a week`,
    }),
    text: `${ticket.id} ${ticket.title} — waiting ${days} days. coord ok ${n}`,
  };
}

/* ---------- sending ---------- */
// Resend over plain HTTPS. Node has fetch built in, so coord stays dependency-free.
const CONFIG = () => {
  try { return JSON.parse(L.read(path.join(P.coord, 'mail.json'), '{}')); } catch { return {}; }
};
const apiKey = () => process.env.RESEND_API_KEY || CONFIG().apiKey || '';
const from = () => process.env.COORD_MAIL_FROM || CONFIG().from || 'coord <onboarding@resend.dev>';
const allowedDomains = () => CONFIG().domains || ['jetsynthesys.com'];

// A committed roster plus a typo should never be able to mail a stranger.
function allowed(email) {
  const d = String(email || '').split('@')[1] || '';
  return allowedDomains().some(x => d.toLowerCase() === x.toLowerCase());
}

async function send(to, notice) {
  if (!allowed(to)) throw new Error(`refusing to mail ${to} — not on an allowed domain (${allowedDomains().join(', ')})`);
  const key = apiKey();
  if (!key) throw new Error('no RESEND_API_KEY — set it in the environment, or in .coord/mail.json (gitignored)');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: from(), to: [to], subject: notice.subject, html: notice.html, text: notice.text }),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`resend ${r.status}: ${body.message || JSON.stringify(body)}`);
  return body.id;
}

const recipients = () => L.people().filter(p => p.email && p.notify !== false);

module.exports = { welcome, digest, weekly, nudges, nudge, send, recipients, allowed, from, apiKey, digestData, PAGE };
