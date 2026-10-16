'use strict';
// Email: the four notices, and the one function that sends them.
//
// Three constraints shape everything here, and they are not negotiable:
//   1. No JavaScript runs in an email client. Ever.
//   2. Outlook renders with Word, so layout is tables and inline styles, not flex or grid.
//   3. CSS animation works in Apple Mail and iOS, and is ignored by Gmail and Outlook.
// So every animation is written as progressive enhancement over a resting state that is
// already correct. If it never animates, it still reads as a finished design.
//
// Palette and type are lifted from iris (packages/do-ui): warm near-white canvas, indigo
// ink, a violet signal. Converted from oklch, which no mail client understands.
const path = require('path');
const L = require('./lib.js');
const { P } = L;

const C = {
  canvas: '#fafaf8', panel: '#ffffff', sunken: '#f5f4f2',
  ink: '#121417', muted: '#56585d', subtle: '#808286', faint: '#a6a8ac',
  line: '#e6e5e3', lineStrong: '#d6d5d2',
  signal: '#4e61c4', signalInk: '#3e4eb3', signalSoft: '#eef0fb',
  good: '#249057', warn: '#cd8817', bad: '#cc272e',
  goodSoft: '#e9f4ee', warnSoft: '#fbf2e4', badSoft: '#fbeaea',
};
const SANS = `-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
const MONO = `'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- the shell every notice sits in ---------- */
// One 560px table, centred. Dark mode is handled by a media query that mail clients which
// support it will apply and the rest will drop — the light values are the real design.
function shell({ preheader, eyebrow, title, lead, body, footer }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<style>
  :root { color-scheme: light dark; }
  body { margin:0; padding:0; background:${C.canvas}; }
  a { color:${C.signalInk}; }
  .wrap { width:100%; background:${C.canvas}; }
  .card { width:560px; max-width:100%; }
  @media (max-width:600px){ .card{ width:100%!important } .pad{ padding-left:22px!important; padding-right:22px!important } }
  @media (prefers-color-scheme: dark) {
    body,.wrap,.bg { background:#0d0e11!important }
    .card,.panel { background:#161719!important }
    .ink { color:#edeef0!important } .muted { color:#a3a5a8!important } .faint { color:#75777a!important }
    .rule { border-color:#26272a!important }
    .sunk { background:#1a1b1d!important; border-color:#26272a!important; color:#edeef0!important }
    .sig { color:#7b91ee!important } .sigbox { background:#1b1f33!important }
    .t-good { color:#4fbd80!important } .t-warn { color:#e8ab4e!important } .t-bad { color:#ef6f74!important }
    .b-warn { background:#2a2114!important } .b-good { background:#132218!important }
    .btn { background:#5d72d8!important }
  }
  /* Progressive enhancement, and nothing more. Most clients run none of this, so no rule
     below may hide anything: animations move things that are already visible. A keyframe
     that starts at opacity 0 would blank the email everywhere it is ignored. */
  @media (prefers-reduced-motion: no-preference) {
    .rise { animation: rise .55s cubic-bezier(.2,.8,.2,1) both; }
    .rise2 { animation-delay:.08s } .rise3 { animation-delay:.16s } .rise4 { animation-delay:.24s }
    @keyframes rise { from { transform:translateY(7px) } to { transform:none } }
    .draw { animation: draw 1.2s cubic-bezier(.2,.8,.2,1) both .25s; }
    @keyframes draw { from { transform:scaleX(0) } to { transform:scaleX(1) } }
    .pulse { animation: pulse 2.6s ease-in-out infinite .9s; }
    @keyframes pulse { 0%,100% { transform:none } 50% { transform:translateY(-4px) } }
    .glow { animation: glow 2.6s ease-in-out infinite .9s; }
    @keyframes glow { 0%,100% { opacity:.25 } 50% { opacity:.6 } }
  }
</style></head>
<body>
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" class="wrap bg" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.canvas}">
<tr><td align="center" style="padding:28px 12px 40px">
  <table role="presentation" class="card panel" width="560" cellpadding="0" cellspacing="0" border="0"
         style="width:560px;max-width:100%;background:${C.panel};border:1px solid ${C.line};border-radius:14px;overflow:hidden">
    <tr><td class="pad" style="padding:30px 34px 0">
      <div class="faint" style="font:500 11px/1.4 ${MONO};letter-spacing:.14em;text-transform:uppercase;color:${C.faint}">${esc(eyebrow)}</div>
      <h1 class="ink rise" style="margin:12px 0 0;font:600 25px/1.22 ${SANS};letter-spacing:-.021em;color:${C.ink}">${title}</h1>
      ${lead ? `<p class="muted rise rise2" style="margin:11px 0 0;font:400 15px/1.6 ${SANS};color:${C.muted}">${lead}</p>` : ''}
    </td></tr>
    <tr><td class="pad" style="padding:24px 34px 30px">${body}</td></tr>
    <tr><td class="pad sunk" style="padding:16px 34px 18px;background:${C.sunken};border-top:1px solid ${C.line}">
      <div class="faint" style="font:400 12px/1.6 ${MONO};color:${C.subtle}">${footer}</div>
    </td></tr>
  </table>
  <div class="faint" style="padding:14px 8px 0;font:400 11px/1.6 ${MONO};color:${C.faint};max-width:560px">
    coord · the board, not a person. Reply to nobody.<br>
    Stop these: <span style="color:${C.subtle}">coord who --quiet</span>
  </div>
</td></tr></table>
</body></html>`;
}

/* ---------- pieces ---------- */
// A labelled group of rows. The label carries the colour; the rows stay quiet.
function group(label, tone, rows, { delay = '' } = {}) {
  if (!rows.length) return '';
  const col = { signal: C.signalInk, good: C.good, warn: C.warn, bad: C.bad, muted: C.subtle }[tone] || C.subtle;
  const cls = { signal: 'sig', good: 't-good', warn: 't-warn', bad: 't-bad', muted: 'faint' }[tone] || 'faint';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="rise ${delay}" style="margin:0 0 20px">
    <tr><td style="padding:0 0 9px">
      <span class="${cls}" style="font:600 11px/1 ${MONO};letter-spacing:.13em;text-transform:uppercase;color:${col}">${esc(label)}</span>
    </td></tr>
    ${rows.map(r => `<tr><td class="rule" style="padding:9px 0;border-top:1px solid ${C.line}">${r}</td></tr>`).join('')}
  </table>`;
}

// id · title · who, on one line that wraps sanely on a phone.
function ticketRow(fm, note) {
  return `<div class="ink" style="font:500 14px/1.5 ${SANS};color:${C.ink}">
      <span class="sig" style="font-family:${MONO};font-size:13px;color:${C.signalInk}">${esc(fm.id)}</span>
      &nbsp;${esc(fm.title)}
    </div>
    <div class="faint" style="font:400 12px/1.5 ${MONO};color:${C.subtle};padding-top:2px">
      ${esc(fm.from)} → ${esc(fm.to)}${note ? ` · ${esc(note)}` : ''}
    </div>`;
}

const plainRow = (main, sub) => `<div class="ink" style="font:400 14px/1.5 ${SANS};color:${C.ink}">${main}</div>` +
  (sub ? `<div class="faint" style="font:400 12px/1.5 ${MONO};color:${C.subtle};padding-top:2px">${sub}</div>` : '');

// The command, as a thing you can see is a command.
const cmd = s => `<span class="sunk ink" style="font:500 13px/1.7 ${MONO};background:${C.sunken};border:1px solid ${C.line};border-radius:6px;padding:3px 7px;color:${C.ink};white-space:nowrap">${esc(s)}</span>`;

/* ---------- the line people ---------- */
// Coordination drawn literally: a figure per person, joined by a line, the new one lit up
// and standing a little taller. Built from table cells and borders so it survives Outlook;
// Gmail shows it still, Apple Mail draws the line in and bobs the new arrival.
function linePeople(names, newcomer) {
  const fig = (name, isNew) => {
    const col = isNew ? C.signalInk : C.faint;
    return `<td align="center" valign="bottom" style="padding:0 6px">
      <div class="${isNew ? 'pulse' : ''}" style="width:34px">
        <div style="width:13px;height:13px;border:2px solid ${col};border-radius:50%;margin:0 auto 3px"></div>
        <div style="width:2px;height:15px;background:${col};margin:0 auto"></div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto"><tr>
          <td style="width:9px;height:11px;border-left:2px solid ${col};border-bottom:0"></td>
          <td style="width:9px;height:11px;border-right:2px solid ${col};border-bottom:0"></td>
        </tr></table>
      </div>
      <div class="${isNew ? 'sig' : 'faint'}" style="font:${isNew ? 600 : 400} 11px/1.5 ${MONO};color:${col};padding-top:6px;white-space:nowrap">${esc(name)}</div>
    </td>`;
  };
  const all = [...names.filter(n => n !== newcomer), newcomer];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sigbox" style="background:${C.signalSoft};border-radius:12px;margin:0 0 22px">
    <tr><td style="padding:24px 18px 18px">
      <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0"><tr>
        ${all.map(n => fig(n, n === newcomer)).join('')}
      </tr></table>
      <div style="padding:16px 10px 0">
        <div class="draw glow" style="height:2px;background:${C.signalInk};opacity:.28;border-radius:2px;transform-origin:left center"></div>
      </div>
      <div class="sig" style="text-align:center;font:500 12px/1.6 ${MONO};color:${C.signalInk};padding-top:12px">
        ${esc(String(all.length))} of us now
      </div>
    </td></tr>
  </table>`;
}

module.exports = { C, SANS, MONO, esc, shell, group, ticketRow, plainRow, cmd, linePeople };
