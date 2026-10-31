// Brain Brawl core: helpers, answer checking, save data, sound, confetti, toasts.
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[R(0, a.length - 1)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = R(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
const r4 = x => Math.round(x * 10000) / 10000;
const n2 = x => (x < 0 ? '−' : '') + Math.abs(x).toLocaleString('en-US');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sgn = x => (x < 0 ? `(−${Math.abs(x)})` : String(x));
const NAMES = ['Maya', 'Leo', 'Ava', 'Kai', 'Noah', 'Zoe', 'Eli', 'Mia', 'Sam', 'Rosa', 'Jay', 'Lena', 'Omar', 'Ivy'];
const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

// Fractions
const fr = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
function simp(n, d) { const g = gcd(n, d) || 1; if (d < 0) { n = -n; d = -d; } return [n / g, d / g]; }
function fracHTML(n, d) {
  [n, d] = simp(n, d);
  const neg = n < 0; n = Math.abs(n);
  let s;
  if (d === 1) s = String(n);
  else if (n > d) { const w = Math.floor(n / d), r = n % d; s = r ? `${w}${fr(r, d)}` : String(w); }
  else s = fr(n, d);
  return (neg ? '−' : '') + s;
}

// Question builders
// num: typed number answer. choice: tap an option. All carry a hint and a "why" explanation.
const num = (value, q, why, hint, show) => ({ kind: 'num', value, q, why, hint, show: show ?? n2(value) });
const fracQ = (n, d, q, why, hint) => ({ kind: 'num', value: n / d, q, why, hint, show: fracHTML(n, d), frac: true });
const choice = (q, right, wrongs, why, hint, opts = {}) => {
  const all = shuffle([right, ...wrongs.filter((w, i, a) => w !== right && a.indexOf(w) === i)]);
  return { kind: 'choice', q, choices: all, correct: all.indexOf(right), why, hint, code: opts.code };
};

// Answer checking: whole numbers, negatives, decimals, $, %, commas, fractions, mixed numbers
function parseNum(s) {
  s = String(s).replace(/[−–—]/g, '-').replace(/[$,%]/g, '').trim().replace(/\s+/g, ' ').replace(/^- /, '-');
  let m;
  if ((m = s.match(/^(-?)(\d+) (\d+)\/(\d+)$/))) return (m[1] ? -1 : 1) * (+m[2] + +m[3] / +m[4]);
  if ((m = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/))) return +m[1] / +m[2];
  if (s === '' || s === '-') return NaN;
  return Number(s.replace(/ /g, ''));
}
const isRight = (q, s) => { const v = parseNum(s); return !isNaN(v) && Math.abs(v - q.value) < 1e-6; };

// Save data
const KEY = 'brain-brawl-v1';
const LEVELS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000, 6200, 7600, 9200, 11000];
const TITLES = ['Rookie', 'Challenger', 'Brawler', 'Thinker', 'Solver', 'Builder', 'Hacker', 'Strategist', 'Champion', 'Mastermind', 'Legend', 'Mythic', 'Grandmaster', 'Titan', 'Brain Boss', 'Ultra Brain'];
function freshSave() {
  return { name: '', hero: 'bolt', owned: ['bolt'], coins: 0, xp: 0, lv: {}, puz: {}, sound: true, unlockAll: false,
    quests: null, streak: { day: '', n: 0 }, stats: { ok: 0, lua: 0, bot: 0, boss: 0, speed: 0 }, road: [], made: Date.now() };
}
function loadSave() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.lv) return Object.assign(freshSave(), s); } catch (e) {}
  const s = freshSave();
  // Carry over name and coins from the old Trailhead Math save, if there is one
  try { const o = JSON.parse(localStorage.getItem('trailhead-math-v2')); if (o) { s.name = o.name || ''; s.coins = Math.min(o.coins || 0, 2000); s.migrated = true; } } catch (e) {}
  return s;
}
let S = loadSave();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const lvState = id => (S.lv[id] ||= { learn: false, stars: 0, boss: false });
const levelOf = xp => { let l = 0; while (l + 1 < LEVELS.length && xp >= LEVELS[l + 1]) l++; return l; };

// Sound: tiny WebAudio blips, no files
const Sfx = (() => {
  let ctx;
  const tone = (f, t, dur = 0.12, type = 'square', vol = 0.06) => {
    if (!S.sound) return;
    try {
      ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
      const now = ctx.currentTime + t; g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.start(now); o.stop(now + dur + 0.02);
    } catch (e) {}
  };
  return {
    tap: () => tone(660, 0, 0.05, 'triangle', 0.05),
    good: () => { tone(660, 0, 0.09); tone(880, 0.08, 0.09); tone(1320, 0.16, 0.12); },
    bad: () => { tone(220, 0, 0.16, 'sawtooth', 0.05); tone(160, 0.12, 0.2, 'sawtooth', 0.05); },
    coin: () => { tone(988, 0, 0.06, 'square', 0.04); tone(1319, 0.06, 0.14, 'square', 0.04); },
    hit: () => { tone(140, 0, 0.12, 'square', 0.08); tone(90, 0.06, 0.15, 'triangle', 0.08); },
    win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.1, 0.18, 'square', 0.05)),
    lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.14, 0.2, 'triangle', 0.06)),
    step: () => tone(520 + R(0, 80), 0, 0.04, 'triangle', 0.035),
    level: () => [523, 784, 1047, 784, 1047, 1568].forEach((f, i) => tone(f, i * 0.08, 0.14, 'square', 0.05)),
  };
})();

// Confetti
const Confetti = (() => {
  let parts = [], raf = 0;
  const cols = ['#FFC93C', '#3DD6FF', '#5BE36B', '#FF4F7B', '#A070FF', '#FF8A3D'];
  function burst(n = 140) {
    const c = $('#confetti'); c.width = innerWidth; c.height = innerHeight;
    for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2 + R(-120, 120), y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 4, s: R(6, 12), c: pick(cols), r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, life: 0 });
    if (!raf) loop();
  }
  function loop() {
    const c = $('#confetti'), g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
    parts.forEach(p => { p.vy += 0.42; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66); g.restore(); });
    parts = parts.filter(p => p.y < c.height + 30 && p.life < 260);
    raf = parts.length ? requestAnimationFrame(loop) : (g.clearRect(0, 0, c.width, c.height), 0);
  }
  return { burst };
})();

let toastT = 0;
function toast(msg) { const t = $('#toast'); t.innerHTML = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }

// Daily quests
const QUEST_POOL = [
  { id: 'ok10', text: 'Get 10 answers right', goal: 10, ev: 'ok', coins: 40 },
  { id: 'ok20', text: 'Get 20 answers right', goal: 20, ev: 'ok', coins: 70 },
  { id: 'lua3', text: 'Run 3 Lua programs', goal: 3, ev: 'lua', coins: 50 },
  { id: 'bot2', text: 'Solve 2 robot puzzles', goal: 2, ev: 'bot', coins: 50 },
  { id: 'boss1', text: 'Beat a boss', goal: 1, ev: 'boss', coins: 60 },
  { id: 'learn1', text: 'Finish a lesson', goal: 1, ev: 'learn', coins: 40 },
  { id: 'combo5', text: 'Hit a 5x combo', goal: 1, ev: 'combo5', coins: 50 },
  { id: 'speed10', text: 'Score 10+ in Speed Run', goal: 1, ev: 'speed10', coins: 60 },
  { id: 'ai5', text: 'Get 5 AI questions right', goal: 5, ev: 'ai', coins: 50 },
];
function ensureQuests() {
  const d = today();
  if (S.quests && S.quests.day === d) return;
  // Pick 3 different quests, seeded by the date so it feels like "today's" quests
  let seed = [...d].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
  const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
  const pool = [...QUEST_POOL], list = [];
  while (list.length < 3) { const i = Math.floor(rnd() * pool.length); list.push({ id: pool[i].id, n: 0, done: false, claimed: false }); pool.splice(i, 1); }
  S.quests = { day: d, list };
  // Streak
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yd = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
  S.streak = { day: d, n: S.streak.day === yd ? S.streak.n + 1 : 1 };
  persist();
}
function questEvent(ev, amt = 1) {
  ensureQuests();
  S.quests.list.forEach(q => {
    const def = QUEST_POOL.find(p => p.id === q.id);
    if (def.ev === ev && !q.done) { q.n = Math.min(def.goal, q.n + amt); if (q.n >= def.goal) { q.done = true; setTimeout(() => toast(`Quest done: <b>${def.text}</b>! Claim it in the lobby.`), 700); } }
  });
  persist();
}
