#!/usr/bin/env node
// milestone-crew headless browser helper. Plain Node 18+, zero dependencies.
//
//   node browser.mjs shot <url> <out.png> [--wait 6000] [--size 1600x1000] [--scale 0.5]
//   node browser.mjs fps <url> [--seconds 10] [--size 1440x900] [--scale 2] [--match "[fps]"]
//   node browser.mjs console <url> [--seconds 8] [--match text]
//
// Env: CHROME_PATH, MC_MAX_BROWSERS (3), MC_SLOT_WAIT (180 s), MC_TIMEOUT (60 s).
// At most MC_MAX_BROWSERS run at once across every agent on the machine, via
// atomic mkdir slots in <tmpdir>/milestone-crew-browsers. Chrome is always
// killed, the slot freed and the scratch profile deleted, on every exit path.

import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const USAGE = `usage:
  node browser.mjs shot <url> <out.png> [--wait 6000] [--size 1600x1000] [--scale 0.5]
  node browser.mjs fps <url> [--seconds 10] [--size 1440x900] [--scale 2] [--match "[fps]"]
  node browser.mjs console <url> [--seconds 8] [--match text]`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = (s) => process.stdout.write(s + '\n');
const note = (s) => process.stderr.write(s + '\n');
class Fail extends Error {}

// ---------- args ----------
const [cmd, ...rest] = process.argv.slice(2);
const pos = [];
const opt = {};
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) opt[rest[i].slice(2)] = rest[++i];
  else pos.push(rest[i]);
}
const DEFAULTS = {
  shot: { wait: '6000', size: '1600x1000', scale: '0.5' },
  fps: { seconds: '10', size: '1440x900', scale: '2', match: '[fps]' },
  console: { seconds: '8', size: '1600x1000', scale: '1' },
};
if (!DEFAULTS[cmd] || !pos[0] || (cmd === 'shot' && !pos[1])) {
  note(USAGE);
  process.exit(2);
}
const o = { ...DEFAULTS[cmd], ...opt };
const [W, H] = o.size.split('x').map(Number);
const scale = Number(o.scale);
if (!(W > 0 && H > 0 && scale > 0)) {
  note('bad --size or --scale');
  process.exit(2);
}
const url = pos[0];

// ---------- state for cleanup ----------
let chrome = null;
let profile = null;
let slotDir = null;
let cleaned = false;

function killChrome() {
  if (!chrome || chrome.exitCode !== null || chrome.signalCode !== null) return;
  try {
    if (process.platform === 'win32') execFileSync('taskkill', ['/pid', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
    else process.kill(-chrome.pid, 'SIGKILL'); // whole process group
  } catch {
    try { chrome.kill('SIGKILL'); } catch {}
  }
}
function freeSlot() {
  if (!slotDir) return;
  try {
    if (fs.readFileSync(path.join(slotDir, 'pid'), 'utf8').trim() === String(process.pid)) {
      fs.rmSync(slotDir, { recursive: true, force: true });
    }
  } catch {}
  slotDir = null;
}
function removeProfile() {
  if (profile) try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
}
async function cleanup() {
  if (cleaned) return;
  cleaned = true;
  killChrome();
  if (chrome && chrome.exitCode === null && chrome.signalCode === null) {
    await Promise.race([new Promise((r) => chrome.once('exit', r)), sleep(3000)]);
  }
  removeProfile();
  freeSlot();
}
// Last-resort synchronous cleanup if the process exits any other way.
process.on('exit', () => { if (!cleaned) { killChrome(); removeProfile(); freeSlot(); } });
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sig, async () => { note(`stopped by ${sig}`); await cleanup(); process.exit(1); });
}
async function finish(code, msg) {
  if (msg) (code ? note : out)(msg);
  await cleanup();
  process.exit(code);
}

// ---------- slots ----------
function pidAlive(pid) {
  if (!pid) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}
async function acquireSlot() {
  const max = Math.max(1, Number(process.env.MC_MAX_BROWSERS) || 3);
  const waitMs = (Number(process.env.MC_SLOT_WAIT) || 180) * 1000;
  const base = path.join(os.tmpdir(), 'milestone-crew-browsers');
  fs.mkdirSync(base, { recursive: true });
  const start = Date.now();
  let told = false;
  for (;;) {
    for (let n = 1; n <= max; n++) {
      const dir = path.join(base, `slot-${n}`);
      try {
        fs.mkdirSync(dir); // atomic: only one process wins
        fs.writeFileSync(path.join(dir, 'pid'), String(process.pid));
        return dir;
      } catch (e) {
        if (e.code !== 'EEXIST') throw e;
      }
      // Slot taken: reclaim it if its owner is dead.
      let pid = 0;
      try { pid = Number(fs.readFileSync(path.join(dir, 'pid'), 'utf8')); } catch {}
      let age = 0;
      try { age = Date.now() - fs.statSync(dir).mtimeMs; } catch { continue; }
      if (pidAlive(pid) || (!pid && age < 10000)) continue; // busy, or just being created
      const trash = `${dir}.stale-${process.pid}-${Date.now()}`;
      try { fs.renameSync(dir, trash); } catch { continue; } // someone else got there first
      fs.rmSync(trash, { recursive: true, force: true });
      n--; // retry this slot now
    }
    if (Date.now() - start > waitMs) throw new Fail(`no browser slot free after ${waitMs / 1000}s (${max} in use)`);
    if (!told) {
      note(`waiting for a browser slot (${max} in use, max wait ${waitMs / 1000}s)...`);
      told = true;
    }
    await sleep(2000);
  }
}

// ---------- chrome ----------
function onPath(name) {
  const exts = process.platform === 'win32' ? ['.exe', ''] : [''];
  for (const d of (process.env.PATH || '').split(path.delimiter)) {
    for (const x of exts) {
      const p = path.join(d, name + x);
      try { fs.accessSync(p, fs.constants.X_OK); return p; } catch {}
    }
  }
  return null;
}
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (process.platform === 'darwin' && fs.existsSync(mac)) return mac;
  for (const n of ['google-chrome', 'chromium', 'chromium-browser']) {
    const p = onPath(n);
    if (p) return p;
  }
  if (process.platform === 'win32') {
    for (const b of [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA,
      'C:\\Program Files', 'C:\\Program Files (x86)']) {
      const p = b && path.join(b, 'Google', 'Chrome', 'Application', 'chrome.exe');
      if (p && fs.existsSync(p)) return p;
    }
  }
  throw new Fail('Chrome not found: set CHROME_PATH');
}
function launch(extra) {
  profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-chrome-'));
  const args = [
    '--headless=new', `--user-data-dir=${profile}`, `--window-size=${W},${H}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    ...(process.platform === 'darwin' ? ['--use-angle=metal'] : []),
    ...extra,
  ];
  chrome = spawn(findChrome(), args, { stdio: 'ignore', detached: process.platform !== 'win32' });
  chrome.on('error', (e) => finish(1, `could not start Chrome: ${e.message}`));
}
function pngSize(file) {
  const b = fs.readFileSync(file);
  return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`;
}

// ---------- CDP ----------
function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    const handlers = [];
    ws.onerror = () => reject(new Fail('DevTools connection failed'));
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const p = pending.get(m.id);
        pending.delete(m.id);
        m.error ? p.reject(new Fail(m.error.message)) : p.resolve(m.result);
      } else if (m.method) handlers.forEach((h) => h(m));
    };
    ws.onopen = () => resolve({
      send: (method, params = {}) => new Promise((res, rej) => {
        pending.set(++id, { resolve: res, reject: rej });
        ws.send(JSON.stringify({ id, method, params }));
      }),
      on: (h) => handlers.push(h),
      close: () => ws.close(),
    });
  });
}
async function openPage() {
  launch(['--remote-debugging-port=0', 'about:blank']);
  const portFile = path.join(profile, 'DevToolsActivePort');
  let port = 0;
  for (let i = 0; i < 150 && !port; i++) {
    try { port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0]); } catch {}
    if (!port) await sleep(100);
  }
  if (!port) throw new Fail('Chrome did not open a DevTools port');
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = list.find((t) => t.type === 'page');
  if (!page) throw new Fail('no page target in Chrome');
  const c = await connect(page.webSocketDebuggerUrl);
  await c.send('Page.enable');
  await c.send('Runtime.enable');
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: scale, mobile: false });
  return c;
}
async function navigate(c) {
  const loaded = new Promise((r) => c.on((m) => m.method === 'Page.loadEventFired' && r()));
  const nav = await c.send('Page.navigate', { url });
  if (nav.errorText) throw new Fail(`could not load ${url}: ${nav.errorText}`);
  await loaded;
}
const fmtArg = (a) => (a.value !== undefined ? String(a.value) : a.description ?? a.type);
const clip = (s) => (s.length > 300 ? s.slice(0, 300) + '...' : s);

// ---------- commands ----------
async function shotFallback() {
  const file = path.resolve(pos[1]);
  note('note: this Node has no global WebSocket (needs Node 22+), using Chrome --screenshot fallback: no --wait, shot is taken at page load');
  launch([`--force-device-scale-factor=${scale}`, `--screenshot=${file}`, url]);
  await new Promise((r) => chrome.once('exit', r));
  if (!fs.existsSync(file)) throw new Fail('fallback screenshot failed');
  return `saved ${pos[1]} ${pngSize(file)} (fallback, no wait)`;
}
async function shot() {
  if (typeof WebSocket === 'undefined') return shotFallback();
  const c = await openPage();
  await navigate(c);
  await sleep(Number(o.wait));
  const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
  const file = path.resolve(pos[1]);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
  return `saved ${pos[1]} ${pngSize(file)}`;
}
async function listen(kind) {
  if (typeof WebSocket === 'undefined') throw new Fail(`"${kind}" needs Node 22+ (global WebSocket); only "shot" has a fallback`);
  const c = await openPage();
  const lines = [];
  let errors = 0;
  c.on((m) => {
    if (m.method === 'Runtime.consoleAPICalled') {
      const text = m.params.args.map(fmtArg).join(' ');
      const hit = o.match ? text.includes(o.match) : ['error', 'warning', 'assert'].includes(m.params.type);
      if (hit) { lines.push(text); out(kind === 'fps' ? clip(text) : `[${m.params.type}] ${clip(text)}`); }
    } else if (m.method === 'Runtime.exceptionThrown' && kind === 'console') {
      const d = m.params.exceptionDetails;
      errors++;
      out(`[pageerror] ${clip(d.exception?.description?.split('\n')[0] ?? d.text)}`);
    }
  });
  await navigate(c);
  await sleep(Number(o.seconds) * 1000);
  if (kind === 'console') return `console: ${lines.length} matching lines, ${errors} page errors`;
  const nums = lines.map((l) => Number((l.slice(l.indexOf(o.match) + o.match.length).match(/-?\d+(\.\d+)?/) || [])[0]))
    .filter(Number.isFinite).sort((a, b) => a - b);
  if (!nums.length) throw new Fail(`no console lines matching "${o.match}" in ${o.seconds}s (is the ?fps hook on?)`);
  const med = nums.length % 2 ? nums[(nums.length - 1) / 2] : (nums[nums.length / 2 - 1] + nums[nums.length / 2]) / 2;
  return `fps min ${nums[0]} med ${Math.round(med)} max ${nums[nums.length - 1]} (n=${nums.length})`;
}

// ---------- main ----------
try {
  const limit = (Number(process.env.MC_TIMEOUT) || 60) * 1000;
  const needs = cmd === 'shot' ? Number(o.wait) : Number(o.seconds) * 1000;
  if (needs + 5000 > limit) throw new Fail(`run needs more than MC_TIMEOUT (${limit / 1000}s); raise MC_TIMEOUT`);
  slotDir = await acquireSlot();
  setTimeout(() => finish(1, `timeout: killed Chrome after ${limit / 1000}s (MC_TIMEOUT)`), limit).unref();
  const result = await (cmd === 'shot' ? shot() : listen(cmd));
  await finish(0, result);
} catch (e) {
  await finish(1, e instanceof Fail ? e.message : `error: ${e.message}`);
}
