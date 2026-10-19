// Trailhead Math: game state, screens, map, lessons, practice, bosses, lightning round, shop.
const $ = s => document.querySelector(s);
const KEY = 'trailhead-math-v2';
const LEVELS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000];
const TITLES = ['Scout', 'Trail Walker', 'Explorer', 'Pathfinder', 'Climber', 'Ridge Runner', 'Ranger', 'Peak Seeker', 'Mountaineer', 'Summit Master', 'Legend', 'Mountain Myth'];
const unit = id => UNITS.find(u => u.id === id);
const starHTML = n => [0, 1, 2].map(i => `<span class="${i < n ? 'on' : ''}">★</span>`).join('');

/* ---------- Save data ---------- */
function load() {
  let s = null; try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  return Object.assign({ name: '', buddy: 'goat', owned: ['goat'], coins: 0, xp: 0, camps: {}, best: 0, unlockAll: false, sound: true, started: false }, s || {});
}
let S = load();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const camp = id => (S.camps[id] ||= { learn: false, stars: 0, boss: false });
const levelOf = xp => { let l = 0; while (l + 1 < LEVELS.length && xp >= LEVELS[l + 1]) l++; return l; };
const buddy = () => BUDDIES.find(b => b.id === S.buddy) || BUDDIES[0];
const campDone = id => { const c = camp(id); return c.boss || c.stars >= 2; };
const isOpen = i => S.unlockAll || i === 0 || campDone(UNITS[i - 1].id);
const summitOpen = () => S.unlockAll || UNITS.every(u => campDone(u.id));

/* ---------- Sound ---------- */
const Sfx = (() => {
  let ctx = null;
  const tone = (f, t0, dur, type = 'sine', vol = .12) => {
    if (!S.sound) return;
    try {
      ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain(); const t = ctx.currentTime + t0;
      o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur);
    } catch (e) {}
  };
  return {
    good: () => { tone(660, 0, .12); tone(880, .1, .18); },
    bad: () => { tone(220, 0, .22, 'triangle', .1); },
    tick: () => tone(520, 0, .05, 'square', .04),
    coin: () => { tone(988, 0, .08, 'square', .05); tone(1319, .07, .15, 'square', .05); },
    hit: () => { tone(160, 0, .15, 'sawtooth', .08); tone(90, .05, .2, 'square', .06); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .12, .3, 'triangle', .1)),
    lose: () => [392, 330, 262].forEach((f, i) => tone(f, i * .18, .3, 'triangle', .1)),
    level: () => [523, 784, 1047, 1319].forEach((f, i) => tone(f, i * .09, .25, 'square', .05))
  };
})();

/* ---------- Confetti ---------- */
const Confetti = (() => {
  const cv = $('#confetti'), cx = cv.getContext('2d'); let parts = [], raf = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = ['#E8902A', '#1F6B4F', '#2F6F96', '#F2B634', '#C0443A', '#5CC197'];
  const step = () => {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .15; p.r += p.vr; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); });
    parts = parts.filter(p => p.y < cv.height + 20);
    raf = parts.length ? requestAnimationFrame(step) : 0;
  };
  return { burst(n = 140) {
    if (reduce) return; cv.width = innerWidth; cv.height = innerHeight;
    for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight / 3, vx: (Math.random() - .5) * 12, vy: -Math.random() * 10 - 3, s: 6 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: colors[i % colors.length] });
    if (!raf) raf = requestAnimationFrame(step);
  } };
})();

let toastT = 0;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }

/* ---------- Rewards and HUD ---------- */
function reward(xp, coins) {
  const before = levelOf(S.xp); S.xp += xp; S.coins += coins; persist(); renderHUD();
  if (coins > 0) { $('.coins').classList.remove('bump'); void $('.coins').offsetWidth; $('.coins').classList.add('bump'); }
  const after = levelOf(S.xp);
  if (after > before) setTimeout(() => { toast(`Level up! You are now a ${TITLES[after]}.`); Sfx.level(); Confetti.burst(); }, 700);
}
function renderHUD() {
  const l = levelOf(S.xp), lo = LEVELS[l], hi = LEVELS[l + 1] ?? (lo + 1000);
  $('#hudFace').textContent = buddy().face; $('#hudName').textContent = S.name || 'Hiker'; $('#hudTitle').textContent = TITLES[l];
  $('#hudLvl').textContent = l + 1; $('#hudXp').textContent = `${S.xp - lo} / ${hi - lo} XP`;
  $('#hudXpFill').style.width = Math.min(100, (S.xp - lo) / (hi - lo) * 100) + '%';
  $('#hudCoins').textContent = n2(S.coins);
  $('#navSound').classList.toggle('off', !S.sound);
}

/* ---------- Screens ---------- */
const SCREENS = ['sStart', 'sMap', 'sCamp', 'sLesson', 'sPlay', 'sResult', 'sShop', 'sParents'];
function show(id) {
  SCREENS.forEach(s => { $('#' + s).hidden = s !== id; });
  $('#hud').hidden = id === 'sStart';
  if (id !== 'sPlay') stopTimers();
  window.scrollTo(0, 0);
}

/* ---------- Start ---------- */
function renderStart() {
  const starters = BUDDIES.slice(0, 3); let chosen = 'goat';
  const box = $('#starters');
  const draw = () => {
    box.innerHTML = starters.map(b => `<button type="button" class="starter" data-id="${b.id}" aria-pressed="${b.id === chosen}"><span>${b.face}</span>${b.name}</button>`).join('');
    box.querySelectorAll('.starter').forEach(x => x.onclick = () => { chosen = x.dataset.id; Sfx.tick(); draw(); });
  };
  draw();
  $('#startForm').onsubmit = e => {
    e.preventDefault();
    S.name = $('#nameIn').value.trim().slice(0, 16) || 'Hiker'; S.buddy = chosen; S.owned = [...new Set([...S.owned, chosen])]; S.started = true; persist();
    Sfx.win(); renderHUD(); goMap(); toast(`Welcome to the trail, ${S.name}!`);
  };
  show('sStart'); $('#nameIn').focus();
}

/* ---------- Map ---------- */
const NODES = [[95, 905], [300, 825], [105, 742], [295, 660], [100, 578], [300, 496], [110, 414], [290, 332], [120, 250]];
const SUMMIT = [215, 120];
function goMap() { renderMap(); show('sMap'); }
function nextGoal() {
  for (let i = 0; i < UNITS.length; i++) {
    const u = UNITS[i], c = camp(u.id);
    if (!campDone(u.id) && isOpen(i)) return { i, u, c };
  }
  return null;
}
function renderMap() {
  const all = [...NODES, SUMMIT];
  let d = `M${all[0][0]} ${all[0][1] + 70} L${all[0][0]} ${all[0][1]}`;
  for (let i = 1; i < all.length; i++) { const [x0, y0] = all[i - 1], [x1, y1] = all[i]; d += ` C${x0} ${y0 - 50} ${x1} ${y1 + 50} ${x1} ${y1}`; }
  const trees = [[30, 960], [60, 940], [350, 930], [375, 880], [200, 870], [215, 890], [40, 800], [360, 760], [200, 700], [30, 640], [370, 600], [190, 540], [40, 470], [365, 420], [210, 380], [370, 270], [40, 330], [220, 460], [180, 790], [30, 560]];
  const goal = nextGoal();
  let s = `<defs><linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/></linearGradient></defs>
  <rect class="m-sky" width="400" height="980"/>
  <ellipse class="m-cloud" cx="70" cy="70" rx="40" ry="12"/><ellipse class="m-cloud" cx="340" cy="150" rx="46" ry="13"/><ellipse class="m-cloud" cx="330" cy="40" rx="26" ry="8"/>
  <polygon class="m-far" points="0,420 70,300 140,380 0,520"/><polygon class="m-far" points="400,380 330,280 260,360 400,520"/>
  <polygon class="m-main" points="-20,980 215,60 420,980"/>
  <polygon class="m-near" points="-20,980 -20,520 120,640 240,560 420,700 420,980"/>
  <polygon class="m-snow" points="215,60 176,170 196,158 208,178 222,156 240,172 252,160"/>
  ${trees.map(([x, y]) => `<polygon class="m-tree" points="${x},${y - 26} ${x - 11},${y} ${x + 11},${y}"/>`).join('')}
  <path class="m-trail" d="${d}"/>`;
  UNITS.forEach((u, i) => {
    const [x, y] = NODES[i], open = isOpen(i), done = campDone(u.id), c = camp(u.id);
    const right = x < 200, lx = right ? x + 38 : x - 38, anchor = right ? 'start' : 'end';
    const cur = goal && goal.i === i;
    s += `<g class="node${done ? ' done' : ''}${open ? '' : ' locked'}" data-i="${i}" tabindex="0" role="button" aria-label="Camp ${i + 1}: ${u.title}${open ? '' : ', locked'}">
      ${cur ? `<circle class="ring" cx="${x}" cy="${y}" r="26"/>` : ''}
      <circle class="base" cx="${x}" cy="${y}" r="26"/>
      <text class="num" x="${x}" y="${y + 1}">${open ? i + 1 : '🔒'}</text>
      <text class="lab" x="${lx}" y="${y - 4}" text-anchor="${anchor}">${u.camp}</text>
      <text class="lab lab2" x="${lx}" y="${y + 13}" text-anchor="${anchor}">${u.title}</text>
      <text x="${x}" y="${y + 46}" text-anchor="middle">${[0, 1, 2].map(k => `<tspan class="st${k < c.stars ? ' on' : ''}">★</tspan>`).join('')}${c.boss ? `<tspan class="st on"> ⚑</tspan>` : ''}</text>
      ${cur ? `<text class="you" x="${right ? x - 52 : x + 52}" y="${y + 10}" text-anchor="middle">${buddy().face}</text>` : ''}
    </g>`;
  });
  const sOpen = summitOpen(), sDone = camp('mix').boss;
  s += `<g class="node summit${sDone ? ' done' : ''}${sOpen ? '' : ' locked'}" data-i="mix" tabindex="0" role="button" aria-label="The Summit${sOpen ? '' : ', locked'}">
    ${sOpen && !goal && !sDone ? `<circle class="ring" cx="${SUMMIT[0]}" cy="${SUMMIT[1]}" r="30"/>` : ''}
    <circle class="base" cx="${SUMMIT[0]}" cy="${SUMMIT[1]}" r="30"/><text class="num" x="${SUMMIT[0]}" y="${SUMMIT[1] + 1}">${sOpen ? '🚩' : '🔒'}</text>
    <text class="lab" x="${SUMMIT[0]}" y="${SUMMIT[1] - 42}" text-anchor="middle">The Summit</text></g>`;
  const svg = $('#mapSvg'); svg.innerHTML = s;
  svg.querySelectorAll('.node').forEach(n => {
    const go = () => {
      const k = n.dataset.i;
      if (k === 'mix') { if (!summitOpen()) { Sfx.bad(); toast('Finish all 9 camps to unlock the Summit.'); return; } Sfx.tick(); openCamp('mix'); return; }
      if (!isOpen(+k)) { Sfx.bad(); toast(`Locked. Beat the boss at Camp ${+k} (or earn 2 stars) first.`); return; }
      Sfx.tick(); openCamp(UNITS[+k].id);
    };
    n.onclick = go; n.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
  });
  // Goal card
  const g = $('#goalCard'); const b = buddy();
  if (goal) {
    const step = !goal.c.learn ? 'Read the Field Guide' : goal.c.stars < 1 ? 'Try the practice' : 'Beat the boss';
    g.innerHTML = `<p class="eyebrow">Next stop · Camp ${goal.i + 1}</p><div class="row"><span class="bigface">${b.face}</span><div><h2>${goal.u.camp}</h2><p class="fmt">${goal.u.title}</p></div></div><p>Next step: <b>${step}</b></p><button class="btn big" id="goNext">Let's go</button>`;
    $('#goNext').onclick = () => openCamp(goal.u.id);
  } else {
    g.innerHTML = `<p class="eyebrow">All camps cleared</p><div class="row"><span class="bigface">${b.face}</span><h2>The Summit is open!</h2></div><p>Face the Summit Dragon or try the 60-second Lightning Round.</p><button class="btn big sun" id="goNext">Climb to the Summit</button>`;
    $('#goNext').onclick = () => openCamp('mix');
  }
}

/* ---------- Camp hub ---------- */
function openCamp(id) {
  const el = $('#sCamp');
  if (id === 'mix') {
    const c = camp('mix');
    el.innerHTML = `<div class="panel"><div class="camphead"><div><p class="eyebrow">The Summit</p><h2>The top of the mountain</h2><p class="fmt">Mixed questions from all 9 camps</p></div><button class="btn ghost small" id="cBack">Back to map</button></div>
      <div class="stages">
        <button class="stage bossy${c.boss ? ' done' : ''}" id="stBoss"><span class="ico">${SUMMIT_BOSS.face}</span><h3>Boss: ${SUMMIT_BOSS.name}</h3><p class="taunt">"${SUMMIT_BOSS.taunt}"</p><span class="sstat"><span>20 HP · 3 hearts</span>${c.boss ? '<span class="tag ok">Defeated</span>' : '<span class="tag">Final boss</span>'}</span></button>
        <button class="stage" id="stLight"><span class="ico">⚡</span><h3>Lightning Round</h3><p>Answer as many as you can in 60 seconds.</p><span class="sstat"><span>Best: ${S.best}</span><span class="tag">+2 coins each</span></span></button>
      </div></div>`;
    $('#cBack').onclick = goMap; $('#stBoss').onclick = () => startPlay('boss', 'mix'); $('#stLight').onclick = () => startPlay('lightning', 'mix');
    show('sCamp'); return;
  }
  const i = UNITS.findIndex(u => u.id === id), u = UNITS[i], c = camp(id);
  el.innerHTML = `<div class="panel"><div class="camphead"><div><p class="eyebrow">Camp ${i + 1} · ${u.camp}</p><h2>${u.title}</h2><p class="fmt">Standard ${u.std}</p></div><button class="btn ghost small" id="cBack">Back to map</button></div>
    <div class="stages">
      <button class="stage${c.learn ? ' done' : ''}" id="stLearn"><span class="ico">📖</span><h3>1. Field Guide</h3><p>Learn how it works with examples and hands-on tools.</p><span class="sstat"><span>${LESSONS[id].length} steps</span>${c.learn ? '<span class="tag ok">Done</span>' : '<span class="tag">+30 XP</span>'}</span></button>
      <button class="stage${c.stars >= 3 ? ' done' : ''}" id="stPrac"><span class="ico">🎯</span><h3>2. Practice</h3><p>8 questions. Hints and second tries allowed. Build a combo for bonus coins.</p><span class="sstat"><span class="stars">${starHTML(c.stars)}</span><span class="tag">Get 3 stars</span></span></button>
      <button class="stage bossy${c.boss ? ' done' : ''}" id="stBoss"><span class="ico">${u.boss.face}</span><h3>3. Boss: ${u.boss.name}</h3><p class="taunt">"${u.boss.taunt}"</p><span class="sstat"><span>10 HP · 3 hearts</span>${c.boss ? '<span class="tag ok">Defeated</span>' : '<span class="tag">Unlocks next camp</span>'}</span></button>
    </div></div>`;
  $('#cBack').onclick = goMap; $('#stLearn').onclick = () => openLesson(id); $('#stPrac').onclick = () => startPlay('practice', id); $('#stBoss').onclick = () => startPlay('boss', id);
  show('sCamp');
}

/* ---------- Lesson engine ---------- */
let LS = null;
function openLesson(id) { LS = { id, i: 0, ok: new Set() }; show('sLesson'); drawStep(); }
function drawStep() {
  const steps = LESSONS[LS.id], st = steps[LS.i], u = unit(LS.id), idx = UNITS.indexOf(u);
  const el = $('#sLesson');
  el.innerHTML = `<div class="lessonhead"><div><p class="eyebrow">Camp ${idx + 1} · Field Guide</p><p class="fmt">${u.title}</p></div><div class="row"><div class="pills" aria-label="Step ${LS.i + 1} of ${steps.length}">${steps.map((_, k) => `<span class="${k < LS.i ? 'on' : k === LS.i ? 'cur' : ''}"></span>`).join('')}</div><button class="btn ghost small" id="lQuit">Leave</button></div></div>
    <div class="step"><h3>${st.title}</h3><div class="stephtml">${st.html}</div><div id="stepBody"></div></div>
    <div class="stepnav"><button class="btn ghost" id="lPrev" ${LS.i === 0 ? 'disabled' : ''}>Back</button><button class="btn" id="lNext">${LS.i === steps.length - 1 ? 'Finish' : 'Next'}</button></div>`;
  const body = $('#stepBody'), next = $('#lNext');
  const complete = () => { LS.ok.add(LS.i); next.disabled = false; };
  next.disabled = !(st.type === 'read' || LS.ok.has(LS.i));
  if (st.type === 'choice') {
    body.innerHTML = `<div class="choices">${st.opts.map((o, k) => `<button class="chip" data-k="${k}">${o}</button>`).join('')}</div><div class="lfb" aria-live="polite"></div>`;
    body.querySelectorAll('.chip').forEach(b => b.onclick = () => {
      const fbx = body.querySelector('.lfb');
      if (+b.dataset.k === st.correct) { b.classList.add('right'); Sfx.good(); fbx.innerHTML = `<div class="fb good pop"><strong>Yes!</strong><p>${st.explain}</p></div>`; complete(); }
      else { b.classList.add('wrong', 'shake'); Sfx.bad(); fbx.innerHTML = `<div class="fb hint pop"><p>Not that one. Try again!</p></div>`; }
    });
  } else if (st.type === 'try') {
    let tries = 0;
    body.innerHTML = `<form class="tryform" autocomplete="off"><input aria-label="Your answer" autocomplete="off" spellcheck="false"><button class="btn" type="submit">Check</button><button class="btn ghost" type="button" data-h>Hint</button></form><p class="fmt">${st.fmt || 'Type your answer.'}</p><div class="lfb" aria-live="polite"></div>`;
    const f = body.querySelector('form'), inp = f.querySelector('input'), fbx = body.querySelector('.lfb');
    f.querySelector('[data-h]').onclick = () => { fbx.innerHTML = `<div class="fb hint"><p>Hint: ${st.hint}</p></div>`; inp.focus(); };
    f.onsubmit = e => {
      e.preventDefault(); if (LS.ok.has(LS.i)) { next.click(); return; } if (!inp.value.trim()) return;
      if (isRight(st.ans, inp.value)) { Sfx.good(); fbx.innerHTML = `<div class="fb good pop"><strong>Correct!</strong><p>${st.explain}</p></div>`; complete(); next.focus(); }
      else if (++tries < 2) { Sfx.bad(); fbx.innerHTML = `<div class="fb hint pop"><strong>Not quite. Try once more.</strong><p>Hint: ${st.hint}</p></div>`; inp.select(); }
      else { Sfx.bad(); fbx.innerHTML = `<div class="fb bad pop"><strong>Here's how it works</strong><p>${st.explain}</p></div>`; complete(); }
    };
    if (!LS.ok.has(LS.i)) setTimeout(() => inp.focus(), 50);
  } else if (st.type === 'widget') {
    body.innerHTML = st.widget.html; st.widget.mount(body, complete);
  }
  $('#lPrev').onclick = () => { LS.i--; drawStep(); };
  next.onclick = () => { if (LS.i < steps.length - 1) { LS.i++; drawStep(); } else finishLesson(); };
  $('#lQuit').onclick = () => openCamp(LS.id);
}
function finishLesson() {
  const c = camp(LS.id), first = !c.learn; c.learn = true; persist();
  if (first) reward(30, 15);
  Sfx.win(); Confetti.burst(80);
  const u = unit(LS.id);
  resultScreen(`<span class="bigface">📖</span><p class="eyebrow">${u.camp}</p><h2>Field Guide complete!</h2><p class="lead">You know how ${u.title.toLowerCase()} works. Time to practice.</p>
    ${first ? `<div class="rewards"><span class="rw">+30 XP</span><span class="rw"><span class="coin"></span>+15</span></div>` : ''}`,
    [['Start practice', () => startPlay('practice', LS.id)], ['Back to camp', () => openCamp(LS.id), 'ghost']]);
}

/* ---------- Play engine: practice, boss, lightning ---------- */
let P = null, timers = [];
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
function stopTimers() { timers.forEach(clearTimeout); timers = []; if (P && P.iv) { clearInterval(P.iv); P.iv = 0; } }
function startPlay(mode, id) {
  stopTimers();
  const isSummit = id === 'mix';
  P = { mode, id, i: 0, res: [], tries: 0, combo: 0, best: 0, state: 'ask', score: 0, coins: 0, xp: 0, hearts: 3, hp: isSummit ? 20 : 10, maxhp: isSummit ? 20 : 10, t: 60, correct: 0 };
  P.boss = isSummit ? SUMMIT_BOSS : unit(id)?.boss;
  show('sPlay');
  $('#arena').hidden = mode !== 'boss';
  $('#hintBtn').hidden = mode !== 'practice';
  if (mode === 'lightning') { P.iv = setInterval(() => { P.t--; drawHud(); if (P.t <= 0) { clearInterval(P.iv); P.iv = 0; finishPlay(); } }, 1000); }
  drawArena(); nextQ();
  if (mode === 'boss') toast(`${P.boss.name}: "${P.boss.taunt}"`);
}
function drawHud() {
  const h = $('#playHud');
  if (P.mode === 'practice') {
    h.innerHTML = `<div class="dots" aria-hidden="true">${Array.from({ length: 8 }, (_, k) => `<span class="${P.res[k] || ''}${k === P.i && P.state !== 'end' ? ' cur' : ''}"></span>`).join('')}</div>
      ${P.combo >= 2 ? `<span class="combo">Combo ×${P.combo}${P.combo >= 3 ? ` (coins ×${P.combo >= 6 ? 3 : 2})` : ''}</span>` : ''}<span class="earn"><span class="coin"></span>+${P.coins}</span>`;
  } else if (P.mode === 'boss') {
    h.innerHTML = `<span>Question ${P.i + 1}</span>${P.combo >= 2 ? `<span class="combo">Combo ×${P.combo}</span>` : ''}`;
  } else {
    h.innerHTML = `<div class="lightning"><span class="timer${P.t <= 10 ? ' low' : ''}">${Math.max(0, P.t)}s</span><span>Score: <b>${P.score}</b></span><span class="fmt">Best: ${S.best}</span></div>`;
  }
}
function drawArena() {
  if (P.mode !== 'boss') return;
  $('#arena').innerHTML = `<div class="fighter"><span class="big" id="meF">${buddy().face}</span><span class="who">${S.name || 'You'}</span><span class="hearts">${[0, 1, 2].map(k => `<span class="${k < P.hearts ? '' : 'lost'}">♥</span>`).join('')}</span></div>
    <span class="vs">VS</span>
    <div class="fighter"><span class="big" id="bossF">${P.boss.face}</span><span class="who">${P.boss.name}</span><div class="hpbar" aria-label="Boss health ${P.hp} of ${P.maxhp}"><span style="width:${P.hp / P.maxhp * 100}%"></span></div></div>
    <div class="quick" id="quick" title="Answer before the gold bar runs out for a critical hit"><span></span></div>`;
}
function genQ() { const u = P.id === 'mix' ? pick(UNITS) : unit(P.id); return u.gen(); }
function fmtFor(q) {
  if (P.id !== 'mix') return unit(P.id).fmt;
  return q.ans.kind === 'point' ? 'Type a point like (3, 5).' : q.frac ? 'Type a fraction like 3/4 or a mixed number like 1 1/2.' : 'Type a number.';
}
function nextQ() {
  P.cur = genQ(); P.tries = 0; P.state = 'ask'; P.qStart = performance.now();
  const label = P.mode === 'practice' ? `Question ${P.i + 1} of 8` : P.mode === 'boss' ? `Attack ${P.i + 1}` : `Lightning`;
  $('#qnum').textContent = label + (P.id === 'mix' ? '' : ` · ${unit(P.id).title}`);
  $('#qtext').innerHTML = P.cur.q; $('#fmt').textContent = fmtFor(P.cur);
  $('#fb').innerHTML = ''; const a = $('#ans'); a.value = ''; a.disabled = false;
  $('#goBtn').textContent = P.mode === 'boss' ? 'Attack!' : 'Check'; $('#goBtn').disabled = false;
  $('#hintBtn').hidden = P.mode !== 'practice';
  if (P.mode === 'boss') { const q = $('#quick'); q.classList.remove('run'); void q.offsetWidth; q.classList.add('run'); }
  drawHud(); a.focus();
}
const CHEERS = ['Nice work!', 'You got it!', 'Right on!', 'Sharp thinking!', 'Nailed it!', 'Boom!', 'Awesome!'];
function check() {
  const s = $('#ans').value; if (!s.trim()) { $('#fb').innerHTML = `<div class="fb hint"><p>Type an answer first.</p></div>`; return; }
  const q = P.cur, ok = isRight(q.ans, s);
  if (P.mode === 'practice') practiceCheck(ok, q);
  else if (P.mode === 'boss') bossCheck(ok, q);
  else lightningCheck(ok, q);
}
function practiceCheck(ok, q) {
  if (ok) {
    const first = P.tries === 0; P.res[P.i] = first ? 'y' : 'h';
    if (first) { P.combo++; P.score += 1; const mult = P.combo >= 6 ? 3 : P.combo >= 3 ? 2 : 1; P.coins += 5 * mult; P.xp += 10; Sfx.coin(); }
    else { P.combo = 0; P.score += .5; P.coins += 2; P.xp += 5; Sfx.good(); }
    $('#fb').innerHTML = `<div class="fb good pop"><strong>${pick(CHEERS)}${first ? '' : ' (second try)'}</strong><p>${q.why}</p></div>`; endQ();
  } else if (P.tries === 0) {
    P.tries = 1; Sfx.bad(); $('#fb').innerHTML = `<div class="fb hint pop"><strong>Not quite. Try once more.</strong><p>Hint: ${q.hint}</p></div>`; $('#hintBtn').hidden = true; $('#ans').select();
  } else {
    P.res[P.i] = 'n'; P.combo = 0; Sfx.bad();
    $('#fb').innerHTML = `<div class="fb bad pop"><strong>The answer is ${q.showHTML}</strong><p>${q.why}</p></div>`; endQ();
  }
  drawHud();
}
function endQ() { P.state = 'next'; $('#ans').disabled = true; $('#hintBtn').hidden = true; $('#goBtn').textContent = P.mode === 'practice' && P.i === 7 ? 'See results' : 'Next'; $('#goBtn').focus(); drawHud(); }
function bossCheck(ok, q) {
  const bf = $('#bossF'), mf = $('#meF');
  if (ok) {
    const quick = performance.now() - P.qStart < 15000; P.combo++;
    const dmg = (quick ? 3 : 2) + (P.combo >= 3 ? 1 : 0); P.hp = Math.max(0, P.hp - dmg); P.correct++;
    Sfx.hit(); drawArena(); const b2 = $('#bossF'); b2.classList.add('hit'); b2.insertAdjacentHTML('beforeend', `<span class="dmg">−${dmg}</span>`);
    $('#quick').classList.remove('run');
    $('#fb').innerHTML = `<div class="fb good pop"><strong>${quick ? 'Critical hit!' : 'Hit!'} ${dmg} damage${P.combo >= 3 ? ' (combo bonus)' : ''}</strong><p>${q.why}</p></div>`;
    P.state = 'wait'; $('#ans').disabled = true; $('#goBtn').disabled = true;
    later(() => { if (P.hp <= 0) finishPlay(); else { P.i++; nextQ(); } }, 1500);
  } else {
    P.hearts--; P.combo = 0; Sfx.bad(); drawArena(); $('#meF').classList.add('ouch'); $('#quick').classList.remove('run');
    $('#fb').innerHTML = `<div class="fb bad pop"><strong>${P.boss.name} strikes back! The answer was ${q.showHTML}</strong><p>${q.why}</p></div>`;
    P.state = 'next'; $('#ans').disabled = true; $('#goBtn').textContent = P.hearts <= 0 ? 'See results' : 'Keep fighting'; $('#goBtn').focus();
  }
  drawHud(); void bf; void mf;
}
function lightningCheck(ok, q) {
  if (ok) { P.score++; Sfx.coin(); $('#fb').innerHTML = `<div class="fb good pop"><strong>${pick(CHEERS)}</strong></div>`; P.state = 'wait'; later(() => { if (P.t > 0) { P.i++; nextQ(); } }, 450); }
  else { Sfx.bad(); $('#fb').innerHTML = `<div class="fb bad pop"><strong>The answer was ${q.showHTML}</strong></div>`; P.state = 'wait'; $('#ans').disabled = true; later(() => { if (P.t > 0) { P.i++; nextQ(); } }, 1600); }
  drawHud();
}
$('#ansForm').onsubmit = e => {
  e.preventDefault(); if (!P) return;
  if (P.state === 'ask') check();
  else if (P.state === 'next') {
    if (P.mode === 'practice') { if (P.i < 7) { P.i++; nextQ(); } else finishPlay(); }
    else if (P.mode === 'boss') { if (P.hearts <= 0) finishPlay(); else { P.i++; nextQ(); } }
  }
};
$('#hintBtn').onclick = () => { $('#fb').innerHTML = `<div class="fb hint"><p>Hint: ${P.cur.hint}</p></div>`; $('#ans').focus(); };
$('#quitBtn').onclick = () => { stopTimers(); P.state = 'end'; P.id === 'mix' ? openCamp('mix') : openCamp(P.id); };

function finishPlay() {
  stopTimers(); P.state = 'end';
  const id = P.id, c = camp(id), wasDone = id !== 'mix' && campDone(id), idx = UNITS.findIndex(u => u.id === id);
  const label = id === 'mix' ? 'The Summit' : unit(id).camp;
  const unlockMsg = () => {
    if (id === 'mix' || wasDone || !campDone(id)) return '';
    return idx < UNITS.length - 1 ? `<p class="tag ok">New camp unlocked: ${UNITS[idx + 1].camp}!</p>` : `<p class="tag ok">The Summit is now open!</p>`;
  };
  if (P.mode === 'practice') {
    const st = P.score >= 7.5 ? 3 : P.score >= 6 ? 2 : P.score >= 4 ? 1 : 0;
    const gained = Math.max(0, st - c.stars); if (st > c.stars) c.stars = st; persist();
    const bonus = gained * 10; reward(P.xp, P.coins + bonus);
    st >= 2 ? (Sfx.win(), Confetti.burst(st === 3 ? 160 : 80)) : Sfx.tick();
    const msg = st === 3 ? 'Perfect climb! This skill is mastered.' : st === 2 ? 'Strong work! One more run could earn the third star.' : st === 1 ? 'Good start. Peek at the Field Guide and try again.' : 'This one is tricky. Read the Field Guide, then give it another go.';
    resultScreen(`<p class="eyebrow">${label} · Practice</p><div class="bigstars" aria-label="${st} of 3 stars">${starHTML(st)}</div><h2>${P.score} out of 8</h2><p class="lead">${msg}</p>
      <div class="rewards"><span class="rw">+${P.xp} XP</span><span class="rw"><span class="coin"></span>+${P.coins + bonus}</span>${gained ? `<span class="rw">${gained} new star${gained > 1 ? 's' : ''}!</span>` : ''}</div>${unlockMsg()}`,
      [['Practice again', () => startPlay('practice', id)], ...(c.boss ? [] : [[`Fight ${P.boss.name}`, () => startPlay('boss', id), 'sun']]), ['Back to camp', () => openCamp(id), 'ghost']]);
  } else if (P.mode === 'boss') {
    if (P.hp <= 0) {
      const first = !c.boss; c.boss = true; persist();
      const big = id === 'mix'; const xp = big ? 150 : 60, coins = (big ? 100 : 40) + (P.hearts === 3 ? 15 : 0);
      reward(xp, coins); Sfx.win(); Confetti.burst(big ? 260 : 160);
      resultScreen(`<span class="bigface">${buddy().face}</span><p class="eyebrow">${label} · Boss defeated</p><h2>You beat ${P.boss.name}!</h2><p class="lead">${P.hearts === 3 ? 'Flawless victory! Not a single heart lost.' : `You won with ${P.hearts} heart${P.hearts > 1 ? 's' : ''} left.`}${big ? ' You conquered the whole mountain!' : ''}</p>
        <div class="rewards"><span class="rw">+${xp} XP</span><span class="rw"><span class="coin"></span>+${coins}</span>${first ? '<span class="rw">⚑ Camp flag earned</span>' : ''}</div>${unlockMsg()}`,
        [['Back to map', goMap], ['Shop for buddies', openShop, 'ghost']]);
    } else {
      reward(10, 5); Sfx.lose();
      resultScreen(`<span class="bigface">${P.boss.face}</span><p class="eyebrow">${label} · Boss battle</p><h2>${P.boss.name} got away!</h2><p class="lead">You landed ${P.correct} hit${P.correct === 1 ? '' : 's'}. Practice a little more, then come back stronger.</p><div class="rewards"><span class="rw">+10 XP</span><span class="rw"><span class="coin"></span>+5</span></div>`,
        [['Try again', () => startPlay('boss', id), 'sun'], ...(id === 'mix' ? [] : [['Practice first', () => startPlay('practice', id)]]), ['Back to camp', () => openCamp(id), 'ghost']]);
    }
  } else {
    const newBest = P.score > S.best; if (newBest) S.best = P.score; persist();
    reward(P.score * 5, P.score * 2); newBest && P.score ? (Sfx.win(), Confetti.burst()) : Sfx.tick();
    resultScreen(`<span class="bigface">⚡</span><p class="eyebrow">Lightning Round</p><h2>${P.score} correct in 60 seconds</h2><p class="lead">${newBest && P.score ? 'New personal best!' : `Your best is ${S.best}. Can you beat it?`}</p><div class="rewards"><span class="rw">+${P.score * 5} XP</span><span class="rw"><span class="coin"></span>+${P.score * 2}</span></div>`,
      [['Go again', () => startPlay('lightning', 'mix'), 'sun'], ['Back to the Summit', () => openCamp('mix'), 'ghost']]);
  }
}
function resultScreen(html, buttons) {
  const el = $('#sResult');
  el.innerHTML = html + `<div class="row">${buttons.map((b, k) => `<button class="btn ${b[2] || ''}" data-k="${k}">${b[0]}</button>`).join('')}</div>`;
  el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => buttons[+b.dataset.k][1]());
  show('sResult'); el.querySelector('.btn').focus();
}

/* ---------- Shop ---------- */
function openShop() {
  const el = $('#sShop');
  el.innerHTML = `<div class="camphead"><div><p class="eyebrow">Buddy Shop</p><h2>Pick a trail buddy</h2><p class="fmt">Earn coins from practice, bosses, and the Lightning Round.</p></div><div class="row"><span class="coins"><span class="coin"></span>${n2(S.coins)}</span><button class="btn ghost small" id="shBack">Back to map</button></div></div>
    <div class="shopgrid">${BUDDIES.map(b => { const own = S.owned.includes(b.id), eq = S.buddy === b.id, can = S.coins >= b.cost;
      return `<div class="item${eq ? ' eq' : ''}${!own && !can ? ' cant' : ''}"><span class="big">${b.face}</span><b>${b.name}</b>${eq ? '<span class="tag ok">With you</span>' : own ? `<button class="btn small" data-eq="${b.id}">Choose</button>` : `<button class="btn small sun" data-buy="${b.id}" ${can ? '' : 'disabled'}><span class="coin" style="width:16px;height:16px;vertical-align:-3px"></span> ${b.cost}</button>`}</div>`; }).join('')}</div>`;
  $('#shBack').onclick = goMap;
  el.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => { S.buddy = b.dataset.eq; persist(); renderHUD(); Sfx.tick(); openShop(); });
  el.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
    const it = BUDDIES.find(x => x.id === b.dataset.buy); if (S.coins < it.cost) return;
    S.coins -= it.cost; S.owned.push(it.id); S.buddy = it.id; persist(); renderHUD(); Sfx.win(); Confetti.burst(90); toast(`${it.name} joined your hike!`); openShop();
  });
  show('sShop');
}

/* ---------- Grown-ups ---------- */
function openParents() {
  const el = $('#sParents');
  const rows = UNITS.map((u, i) => { const c = camp(u.id); return `<tr><td><b>${i + 1}. ${u.title}</b><br><span class="fmt">${u.std}</span></td><td>${c.learn ? '✔' : '–'}</td><td><span class="stars">${starHTML(c.stars)}</span></td><td>${c.boss ? '✔' : '–'}</td></tr>`; }).join('');
  el.innerHTML = `<div class="camphead"><div><p class="eyebrow">For grown-ups</p><h2>Progress and settings</h2></div><button class="btn ghost small" id="paBack">Back to map</button></div>
    <div class="ptable-wrap"><table class="ptable"><thead><tr><th>Camp</th><th>Field Guide</th><th>Practice</th><th>Boss</th></tr></thead><tbody>${rows}
      <tr><td><b>Summit</b><br><span class="fmt">Mixed review</span></td><td></td><td>Lightning best: ${S.best}</td><td>${camp('mix').boss ? '✔' : '–'}</td></tr></tbody></table></div>
    <ul class="tips">
      <li>Each camp covers one 5th grade Common Core standard. A good pace is one camp a week, about 15 minutes a day.</li>
      <li>Every camp has a Field Guide (teaching), Practice (8 questions with hints and second tries), and a Boss battle (one try per question, 3 hearts).</li>
      <li>The next camp unlocks after the boss is beaten or practice earns 2 stars.</li>
      <li>Questions are generated fresh every time, so replays never repeat the same set.</li>
      <li>Answers can be whole numbers, decimals, fractions (3/4), mixed numbers (1 1/2), or points (3, 5).</li>
      <li>Progress is saved in this browser on this device only.</li>
    </ul>
    <label class="toggle"><input type="checkbox" id="unlockAll" ${S.unlockAll ? 'checked' : ''}> Unlock all camps (skip ahead or review)</label>
    <label class="toggle"><input type="checkbox" id="sndT" ${S.sound ? 'checked' : ''}> Sound effects</label>
    <div class="row"><button class="btn ghost small" id="rsBtn">Reset all progress</button><span id="rsConfirm" class="row" hidden><span class="fmt">Erase everything, including coins and buddies?</span><button class="btn warn small" id="rsYes">Yes, reset</button><button class="btn ghost small" id="rsNo">Cancel</button></span></div>`;
  $('#paBack').onclick = goMap;
  $('#unlockAll').onchange = e => { S.unlockAll = e.target.checked; persist(); };
  $('#sndT').onchange = e => { S.sound = e.target.checked; persist(); renderHUD(); };
  $('#rsBtn').onclick = () => { $('#rsConfirm').hidden = false; $('#rsBtn').hidden = true; };
  $('#rsNo').onclick = () => { $('#rsConfirm').hidden = true; $('#rsBtn').hidden = false; };
  $('#rsYes').onclick = () => { try { localStorage.removeItem(KEY); } catch (e) {} S = load(); renderStart(); };
  show('sParents');
}

/* ---------- Nav + boot ---------- */
$('#navMap').onclick = goMap;
$('#navShop').onclick = openShop;
$('#hudMe').onclick = openShop;
$('#navParents').onclick = openParents;
$('#navSound').onclick = () => { S.sound = !S.sound; persist(); renderHUD(); if (S.sound) Sfx.tick(); };
renderHUD();
if (S.started) goMap(); else renderStart();
