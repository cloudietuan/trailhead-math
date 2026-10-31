// Brain Brawl app: screens and game flow.
const WORLD_LEVELS = { math: MATH, code: CODE, ai: AI };
const WORLD_BOSS = {
  math: { id: 'mathboss', world: 'math', name: 'Math Titan', title: 'World Boss', hp: 160, gen: () => pick(MATH).gen(),
    boss: { name: 'The Calculatron', look: { color: '#FF8A3D', eyes: 'robot', mouth: 'teeth', acc: 'crown', spots: true }, taunt: 'I know EVERY math skill you learned. All of them. At once. Bring it.' } },
  code: { id: 'codeboss', world: 'code', name: 'Code Titan', title: 'World Boss', hp: 160, gen: () => luaQuestion(['basics', 'ifs', 'loops', 'funcs', 'tables']),
    boss: { name: 'The Bug King', look: { color: '#5BE36B', eyes: 'three', mouth: 'fangs', acc: 'crown', spots: true }, taunt: 'Every bug in every program bows to ME. Can you read code faster than I can break it?' } },
  ai: { id: 'aiboss', world: 'ai', name: 'AI Titan', title: 'World Boss', hp: 160, gen: () => pick(AI).gen(),
    boss: { name: 'The Deepfake Dragon', look: { color: '#3DD6FF', eyes: 'angry', mouth: 'teeth', acc: 'wings', spots: true }, taunt: 'Is this dragon real? Is anything real? Only a true AI expert can tell!' } },
};
const ALL = [...MATH, ...CODE, ...AI];
const level = id => ALL.find(l => l.id === id) || Object.values(WORLD_BOSS).find(b => b.id === id);
const isDone = id => { const v = S.lv[id]; return !!v && (v.boss || v.stars >= 2); };
const isOpen = l => { if (S.unlockAll) return true; const arr = WORLD_LEVELS[l.world]; const i = arr.indexOf(l); if (i < 0) return arr.every(x => isDone(x.id)); return i === 0 || isDone(arr[i - 1].id); };
const KIND_LABEL = { quiz: 'Practice', bot: 'Puzzles', lua: 'Challenges', lab: 'Lab' };
const kindOf = l => l.kind || 'quiz';
const bossGen = l => (kindOf(l) === 'lua' ? () => luaQuestion(l.pool) : l.gen);
const isTouch = matchMedia('(pointer: coarse)').matches;
const ROAD = [{ at: 5, coins: 50 }, { at: 10, coins: 80 }, { at: 15, coins: 100 }, { at: 20, coins: 120 }, { at: 30, coins: 150 }, { at: 40, hero: 'zap' }, { at: 50, coins: 200 }, { at: 60, coins: 250 }, { at: 75, coins: 300 }, { at: 90, coins: 400 }, { at: 100, hero: 'king' }, { at: 115, coins: 500 }, { at: 130, coins: 750 }];
function totalStars() { let s = 0; ALL.forEach(l => { const v = S.lv[l.id]; if (v) s += (v.stars || 0) + (v.boss ? 2 : 0); }); Object.values(WORLD_BOSS).forEach(b => { if (S.lv[b.id] && S.lv[b.id].boss) s += 5; }); return s; }
const roadReady = () => ROAD.filter(r => r.at <= totalStars() && !S.road.includes(r.at)).length;
const starsHTML = n => `<span class="stars">${[0, 1, 2].map(i => (i < n ? ICON.star : ICON.starOff)).join('')}</span>`;

// ═════════════ Screens ═════════════
const SCREENS = ['sStart', 'sLobby', 'sWorld', 'sLevel', 'sLesson', 'sPlay', 'sBot', 'sLua', 'sLab', 'sResult', 'sShop', 'sRoad', 'sParents'];
let P = null, timers = [];
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
function stopTimers() { timers.forEach(clearTimeout); timers = []; if (P && P.iv) { clearInterval(P.iv); P.iv = 0; } }
function show(id, world) {
  stopTimers();
  SCREENS.forEach(s => ($('#' + s).hidden = s !== id));
  $('#hud').hidden = id === 'sStart';
  document.body.dataset.screen = id;
  document.body.dataset.world = world || '';
  window.scrollTo(0, 0); renderHUD();
}
function reward(xp, coins) {
  const before = levelOf(S.xp); S.xp += xp; S.coins += coins; persist(); renderHUD();
  if (levelOf(S.xp) > before) setTimeout(() => { const l = levelOf(S.xp); toast(`⬆️ LEVEL UP! Level ${l + 1}: <b>${TITLES[l]}</b>`); Sfx.level(); Confetti.burst(90); }, 900);
}
function renderHUD() {
  if (!$('#hud')) return;
  const h = hero(S.hero), lv = levelOf(S.xp), cur = LEVELS[lv], nxt = LEVELS[lv + 1];
  $('#hudHead').innerHTML = creature(h.look);
  $('#hudName').textContent = S.name || 'Player';
  $('#hudTitle').textContent = TITLES[lv];
  $('#hudLvl').textContent = lv + 1;
  $('#hudXp').style.width = (nxt ? (S.xp - cur) / (nxt - cur) * 100 : 100) + '%';
  $('#hudXpT').textContent = nxt ? `${S.xp - cur} / ${nxt - cur} XP` : 'MAX';
  $('#hudCoins').textContent = S.coins.toLocaleString();
  $('#hudStars').textContent = totalStars();
  $('#hudStreak').textContent = S.streak.n || 1;
  $('#navRoad').classList.toggle('ping', roadReady() > 0);
  $('#navSound').classList.toggle('off', !S.sound);
}

// ─── Start ───
function renderStart() {
  let sel = HEROES.find(h => h.start && h.id === S.hero) ? S.hero : 'bolt';
  const el = $('#sStart');
  el.innerHTML = `<div class="start">
    <div class="logo"><span class="l1">BRAIN</span><span class="l2">BRAWL</span></div>
    <p class="tagline">Math. Code. AI. <b>Beat the bosses.</b></p>
    <div class="startheroes">${HEROES.slice(0, 5).map((h, i) => `<div class="sh sh${i}">${creature(h.look)}</div>`).join('')}</div>
    <form id="startForm" class="card startcard" autocomplete="off">
      ${S.migrated ? '<p class="welcome">👋 Welcome back from Trailhead Math! Your coins came with you.</p>' : ''}
      <label for="nameIn">Your player nickname</label>
      <input id="nameIn" maxlength="14" placeholder="Type a nickname" value="${esc(S.name || '')}">
      <p class="label">Pick your first hero</p>
      <div class="starters">${HEROES.filter(h => h.start).map(h => `<button type="button" class="starter ${h.id === sel ? 'on' : ''}" data-h="${h.id}">${creature(h.look)}<b>${h.name}</b><small>${h.role}</small></button>`).join('')}</div>
      <button class="btn big" type="submit">LET'S BRAWL</button>
    </form></div>`;
  el.querySelectorAll('.starter').forEach(b => b.onclick = () => { sel = b.dataset.h; el.querySelectorAll('.starter').forEach(x => x.classList.toggle('on', x === b)); Sfx.tap(); });
  $('#startForm').onsubmit = e => {
    e.preventDefault();
    const n = $('#nameIn').value.trim(); if (!n) { $('#nameIn').focus(); $('#nameIn').classList.add('shake'); setTimeout(() => $('#nameIn').classList.remove('shake'), 500); return; }
    S.name = n; S.hero = sel; if (!S.owned.includes(sel)) S.owned.push(sel); persist(); Sfx.win(); goLobby();
    setTimeout(() => toast(`Welcome to the arena, <b>${esc(n)}</b>!`), 300);
  };
  show('sStart'); if (!isTouch) $('#nameIn').focus();
}

// ─── Lobby ───
function nextUp() {
  const order = [S.lastWorld || 'math', 'math', 'code', 'ai'];
  for (const w of order) { const l = WORLD_LEVELS[w].find(x => !isDone(x.id) && isOpen(x)); if (l) return l; if (!(S.lv[WORLD_BOSS[w].id] || {}).boss && isOpen(WORLD_BOSS[w])) return WORLD_BOSS[w]; }
  return null;
}
function worldProgress(w) { const arr = WORLD_LEVELS[w]; return { done: arr.filter(l => isDone(l.id)).length, total: arr.length }; }
function questsHTML() {
  ensureQuests();
  return S.quests.list.map((q, i) => { const d = QUEST_POOL.find(p => p.id === q.id);
    return `<div class="quest ${q.claimed ? 'claimed' : q.done ? 'ready' : ''}"><div class="qinfo"><b>${d.text}</b><div class="qbar"><i style="width:${q.n / d.goal * 100}%"></i></div><small>${q.n} / ${d.goal}</small></div>${q.claimed ? `<span class="qok">${ICON.check}</span>` : `<button class="btn small ${q.done ? 'green' : 'ghost'}" data-claim="${i}" ${q.done ? '' : 'disabled'}>${ICON.coin}${d.coins}</button>`}</div>`; }).join('');
}
function goLobby() {
  ensureQuests();
  const h = hero(S.hero), nx = nextUp(), ts = totalStars(), nextRoad = ROAD.find(r => r.at > ts), prevAt = [...ROAD].reverse().find(r => r.at <= ts);
  $('#sLobby').innerHTML = `<div class="lobby">
    <section class="stage card">
      <div class="heroWrap">${creature(h.look, 'big')}</div><div class="plat"></div>
      <h2 class="stroke pname">${esc(S.name)}</h2><p class="sub">${h.name} · ${TITLES[levelOf(S.xp)]}</p>
      <button class="btn small purple" id="toShop">Change hero</button>
    </section>
    <section class="mainc">
      <button class="playbtn" id="playBtn"><span class="pb1">PLAY</span><span class="pb2">${nx ? `${WORLDS[nx.world].short}: ${nx.boss && WORLD_BOSS[nx.world] === nx ? nx.boss.name : nx.name}` : 'Everything beaten! Replay any level'}</span></button>
      <div class="worlds">${['math', 'code', 'ai'].map(w => { const p = worldProgress(w); return `<button class="wcard w-${w}" data-w="${w}">${emblem(w)}<div class="wtxt"><h3>${WORLDS[w].name}</h3><p>${WORLDS[w].blurb}</p><div class="wbar"><i style="width:${p.done / p.total * 100}%"></i></div><small>${p.done} / ${p.total} levels${(S.lv[WORLD_BOSS[w].id] || {}).boss ? ' · 👑 Titan beaten' : ''}</small></div></button>`; }).join('')}</div>
    </section>
    <aside class="sidec">
      <div class="card quests"><h3>${ICON.target} Daily Quests</h3><p class="streak">${ICON.flame} ${S.streak.n || 1} day streak</p><div id="questList">${questsHTML()}</div></div>
      <button class="card roadcard" id="toRoad"><h3>${ICON.star} Star Road ${roadReady() ? '<span class="ping-dot">!</span>' : ''}</h3><div class="rbar"><i style="width:${nextRoad ? (ts - (prevAt ? prevAt.at : 0)) / (nextRoad.at - (prevAt ? prevAt.at : 0)) * 100 : 100}%"></i></div><small>${ts} stars${nextRoad ? ` · next reward at ${nextRoad.at}` : ' · road complete!'}</small></button>
      <button class="card speedcard" id="toSpeed"><span class="bolt">⚡</span><span><b>Speed Run</b><small>60 seconds of math. Best: ${(S.best && S.best.speed) || 0}</small></span></button>
    </aside></div>`;
  $('#playBtn').onclick = () => { Sfx.tap(); if (nx) { if (Object.values(WORLD_BOSS).includes(nx)) goLevel(nx.id); else goLevel(nx.id); } else goWorld(S.lastWorld || 'math'); };
  $$('.wcard').forEach(b => b.onclick = () => { Sfx.tap(); goWorld(b.dataset.w); });
  $('#toShop').onclick = openShop; $('#toRoad').onclick = openRoad; $('#toSpeed').onclick = () => startQuiz('speed');
  $('#questList').onclick = e => { const b = e.target.closest('[data-claim]'); if (!b) return; const q = S.quests.list[+b.dataset.claim], d = QUEST_POOL.find(p => p.id === q.id); q.claimed = true; reward(20, d.coins); Sfx.coin(); toast(`+${d.coins} coins!`); $('#questList').innerHTML = questsHTML(); };
  show('sLobby');
}

// ─── World map ───
function goWorld(w) {
  S.lastWorld = w; persist();
  const levels = WORLD_LEVELS[w], wb = WORLD_BOSS[w], nodes = [...levels, wb], ROW = 132, H = nodes.length * ROW + 70;
  const xs = [30, 56, 74, 46], pos = nodes.map((n, i) => ({ x: xs[i % 4], y: 110 + i * ROW }));
  let path = `M ${pos[0].x} ${pos[0].y}`; for (let i = 1; i < pos.length; i++) { const a = pos[i - 1], b = pos[i]; path += ` C ${a.x} ${a.y + ROW * 0.55}, ${b.x} ${b.y - ROW * 0.55}, ${b.x} ${b.y}`; }
  const curI = nodes.findIndex(n => isOpen(n) && !(n === wb ? (S.lv[wb.id] || {}).boss : isDone(n.id)));
  const p = worldProgress(w);
  $('#sWorld').innerHTML = `<div class="worldtop card w-${w}"><button class="btn ghost small" id="wBack">← Lobby</button>${emblem(w)}<div><h1 class="stroke">${WORLDS[w].name}</h1><p>${p.done} of ${p.total} levels done</p></div></div>
    <div class="mapwrap w-${w}" style="height:${H}px"><svg class="mappath" viewBox="0 0 100 ${H}" preserveAspectRatio="none"><path d="${path}" class="pbg"/><path d="${path}" class="pfg"/></svg>
    ${nodes.map((n, i) => { const isB = n === wb, open = isOpen(n), v = S.lv[n.id] || {}, done = isB ? v.boss : isDone(n.id), right = pos[i].x < 50;
      return `<button class="node ${isB ? 'nboss' : ''} ${open ? '' : 'locked'} ${done ? 'done' : ''} ${i === curI ? 'cur' : ''}" style="left:${pos[i].x}%;top:${pos[i].y}px" data-id="${n.id}" ${open ? '' : 'aria-disabled="true"'}>
        ${i === curI ? `<span class="you">${creature(hero(S.hero).look)}</span>` : ''}
        <span class="ntile">${isB ? (open ? creature(n.boss.look) : ICON.lock) : open ? `<b>${i + 1}</b>` : ICON.lock}</span>
        ${!isB && open ? starsHTML(v.stars || 0) : ''}${v.boss && !isB ? '<span class="crown">👑</span>' : ''}
        <span class="nlab ${right ? 'r' : 'l'}"><b>${isB ? n.boss.name : n.name}</b><small>${isB ? 'WORLD BOSS' : n.title}</small></span></button>`; }).join('')}</div>`;
  $('#wBack').onclick = goLobby;
  $$('#sWorld .node').forEach(b => b.onclick = () => { const n = level(b.dataset.id); if (!isOpen(n)) { Sfx.bad(); toast(n === wb ? 'Finish every level in this world to face the Titan!' : 'Beat the level before this one to unlock it.'); return; } Sfx.tap(); goLevel(n.id); });
  show('sWorld', w);
  const c = $('#sWorld .node.cur'); if (c && curI > 2) setTimeout(() => c.scrollIntoView({ block: 'center', behavior: 'smooth' }), 150);
}

// ─── Level hub ───
function goLevel(id) {
  const l = level(id), v = lvState(id), isWB = Object.values(WORLD_BOSS).includes(l), k = kindOf(l);
  const idx = WORLD_LEVELS[l.world].indexOf(l);
  const card = (n, icon, title, sub, state, act, extra = '') => `<button class="stepcard ${state}" data-act="${act}"><span class="snum">${state === 'done' ? ICON.check : state === 'locked' ? ICON.lock : n}</span><span class="sic">${icon}</span><span class="stxt"><b>${title}</b><small>${sub}</small>${extra}</span></button>`;
  const practiceSub = { quiz: '8 questions. Earn up to 3 stars.', bot: `${l.puzzles ? l.puzzles.length : 0} robot puzzles. Beat par for 3 stars.`, lua: '3 real coding challenges.', lab: 'A hands-on experiment.' }[k];
  const pDone = v.stars > 0;
  $('#sLevel').innerHTML = `<div class="lvhead card w-${l.world}"><button class="btn ghost small" id="lvBack">← ${WORLDS[l.world].name}</button>
    <p class="eyebrow">${isWB ? `World Boss · ${WORLDS[l.world].name}` : `Level ${idx + 1} · ${l.title}`}</p><h1 class="stroke">${isWB ? l.boss.name : l.name}</h1>${l.std ? `<p class="std">${l.std}</p>` : ''}</div>
    <div class="lvbody">
      <div class="bosspreview card w-${l.world}"><div class="bubble">“${l.boss.taunt}”</div><div class="bossart">${creature(l.boss.look, 'boss')}</div><p class="bname">BOSS: ${l.boss.name}</p></div>
      <div class="steps">${isWB ? card(1, ICON.sword, `Fight ${l.boss.name}`, `Questions from every level in ${WORLDS[l.world].name}. 3 hearts.`, v.boss ? 'done' : '', 'boss')
        : card(1, ICON.book, 'Learn', 'Short lesson with things to try.', v.learn ? 'done' : '', 'learn')
        + card(2, k === 'lua' ? '⌨️' : k === 'bot' ? '🤖' : k === 'lab' ? '🧪' : '🎯', KIND_LABEL[k], practiceSub, pDone ? 'done' : '', 'practice', `<span class="sstars">${starsHTML(v.stars || 0)}</span>`)
        + card(3, ICON.sword, `Boss: ${l.boss.name}`, v.learn ? (k === 'bot' ? 'One big puzzle. 3 hearts.' : '3 hearts. Fast answers hit harder!') : 'Finish the lesson first.', v.boss ? 'done' : v.learn ? '' : 'locked', 'boss')}
      ${!isWB ? `<p class="unlocknote">${isDone(id) ? '✅ Level complete! The next level is unlocked.' : 'Beat the boss <b>or</b> earn 2 stars to unlock the next level.'}</p>` : ''}</div></div>`;
  $('#lvBack').onclick = () => goWorld(l.world);
  $$('#sLevel .stepcard').forEach(b => b.onclick = () => {
    Sfx.tap(); const a = b.dataset.act;
    if (a === 'learn') openLesson(id);
    if (a === 'practice') { if (k === 'bot') openPuzzles(id); else if (k === 'lua') openLua(id); else if (k === 'lab') openLab(id); else startQuiz('practice', id); }
    if (a === 'boss') { if (!isWB && !v.learn && !S.unlockAll) { toast('Finish the lesson first. Bosses are tough!'); Sfx.bad(); return; } if (k === 'bot' && !isWB) openBossPuzzle(id); else startQuiz('boss', id); }
  });
  show('sLevel', l.world);
}

// ─── Lessons ───
let LS = null;
function openLesson(id) { LS = { id, i: 0, passed: new Set() }; show('sLesson', level(id).world); drawStep(); }
function drawStep() {
  const l = level(LS.id), st = l.lesson[LS.i], n = l.lesson.length, need = st.check && !LS.passed.has(LS.i);
  $('#sLesson').innerHTML = `<div class="card lesson w-${l.world}">
    <div class="lestop"><button class="btn ghost small" id="lesX">✕</button><div class="pips">${l.lesson.map((_, i) => `<i class="${i < LS.i ? 'done' : i === LS.i ? 'on' : ''}"></i>`).join('')}</div><span class="lesn">${LS.i + 1} / ${n}</span></div>
    <p class="eyebrow">${l.name} · Lesson</p><h2>${st.t}</h2><div class="lesbody">${st.html}</div>
    ${st.widget ? '<div class="widget" id="wid"></div>' : ''}${st.try ? '<div id="tryBox"></div>' : ''}${st.check ? '<div class="check" id="chk"></div>' : ''}
    <div class="lesnav"><button class="btn ghost" id="lesBack" ${LS.i === 0 ? 'disabled' : ''}>Back</button><button class="btn ${need ? '' : 'green'}" id="lesNext" ${need ? 'disabled' : ''}>${LS.i === n - 1 ? 'Finish lesson' : 'Next'}</button></div></div>`;
  if (st.widget) st.widget($('#wid'));
  if (st.try) luaTry($('#tryBox'), st.try);
  if (st.check) mountCheck($('#chk'), st.check, () => { LS.passed.add(LS.i); const b = $('#lesNext'); b.disabled = false; b.classList.add('green'); });
  $('#lesX').onclick = () => goLevel(LS.id);
  $('#lesBack').onclick = () => { LS.i--; drawStep(); window.scrollTo(0, 0); };
  $('#lesNext').onclick = () => { Sfx.tap(); if (LS.i < n - 1) { LS.i++; drawStep(); window.scrollTo(0, 0); } else finishLesson(); };
}
function finishLesson() {
  const l = level(LS.id), v = lvState(LS.id), first = !v.learn; v.learn = true; persist();
  if (first) { reward(30, 20); questEvent('learn'); }
  Sfx.win(); Confetti.burst(80);
  resultScreen({ world: l.world, face: ICON.book, title: 'LESSON DONE!', sub: `You learned ${l.title.toLowerCase()}. ${kindOf(l) === 'quiz' ? 'Time to practice.' : 'Time to put it to work.'}`, xp: first ? 30 : 0, coins: first ? 20 : 0,
    buttons: [[KIND_LABEL[kindOf(l)] + ' now', () => { if (kindOf(l) === 'bot') openPuzzles(l.id); else if (kindOf(l) === 'lua') openLua(l.id); else if (kindOf(l) === 'lab') openLab(l.id); else startQuiz('practice', l.id); }, ''], ['Back to level', () => goLevel(l.id), 'ghost']] });
}

// ─── Answer widgets shared by quizzes and lesson checks ───
const KEYS = ['7', '8', '9', '⌫', '4', '5', '6', '−', '1', '2', '3', '/', '0', '.', '␣', '%'];
function answerHTML(q, opts = {}) {
  if (q.kind === 'choice') return `<div class="choices ${q.code ? 'codech' : ''}">${q.choices.map((c, i) => `<button class="choice" data-i="${i}"><span class="key">${'ABCD'[i]}</span><span class="ctext">${c}</span></button>`).join('')}</div>${opts.hint !== false && q.hint ? '<div class="row"><button type="button" class="btn ghost small hintBtn">💡 Hint</button></div>' : ''}`;
  return `<form class="ansrow" autocomplete="off"><input class="ans" aria-label="Your answer" ${isTouch ? 'inputmode="none"' : 'inputmode="text"'} autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Answer"><button class="btn goBtn">Check</button>${opts.hint !== false && q.hint ? '<button type="button" class="btn ghost hintBtn" aria-label="Hint">💡</button>' : ''}</form>${isTouch ? `<div class="keypad">${KEYS.map(k => `<button type="button" data-k="${k}">${k}</button>`).join('')}</div>` : ''}`;
}
function wireAnswer(el, q, onAnswer) {
  const inp = el.querySelector('.ans');
  if (inp) {
    el.querySelector('form').onsubmit = e => { e.preventDefault(); if (inp.value.trim() === '') { inp.focus(); return; } onAnswer(isRight(q, inp.value), inp.value); };
    el.querySelectorAll('.keypad button').forEach(b => b.onclick = () => { const k = b.dataset.k; Sfx.tap(); if (k === '⌫') inp.value = inp.value.slice(0, -1); else inp.value += k === '−' ? '-' : k === '␣' ? ' ' : k; });
    if (!isTouch) setTimeout(() => inp.focus(), 30);
  }
  el.querySelectorAll('.choice').forEach(b => b.onclick = () => { if (b.disabled) return; onAnswer(+b.dataset.i === q.correct, +b.dataset.i, b); });
  const hb = el.querySelector('.hintBtn'); if (hb) hb.onclick = () => { hb.disabled = true; const h = document.createElement('p'); h.className = 'hint'; h.innerHTML = '💡 ' + q.hint; hb.closest('.row, form').after(h); };
}
const answerText = q => (q.kind === 'choice' ? q.choices[q.correct] : q.show);
function mountCheck(el, q, onPass) {
  let tries = 0;
  el.innerHTML = `<p class="cklab">⚡ QUICK CHECK</p><div class="qtext">${q.q}</div><div class="cka">${answerHTML(q)}</div><div class="ckfb"></div>`;
  wireAnswer(el.querySelector('.cka'), q, (ok, val, btn) => {
    tries++; const fb = el.querySelector('.ckfb');
    if (ok) { if (btn) btn.classList.add('right'); el.querySelectorAll('.choice,.ans,.goBtn').forEach(x => (x.disabled = true)); fb.innerHTML = `<div class="fbx good"><b>${pick(CHEERS)}</b> ${q.why || ''}</div>`; Sfx.good(); onPass(); }
    else if (tries < 2) { if (btn) { btn.classList.add('wrong'); btn.disabled = true; } fb.innerHTML = `<div class="fbx bad"><b>Not quite. Try again!</b> ${q.hint ? '💡 ' + q.hint : ''}</div>`; Sfx.bad(); const i = el.querySelector('.ans'); if (i) { i.value = ''; i.focus(); } }
    else { if (btn) btn.classList.add('wrong'); el.querySelectorAll('.choice,.ans,.goBtn').forEach(x => (x.disabled = true)); if (q.kind === 'choice') el.querySelectorAll('.choice')[q.correct].classList.add('right'); fb.innerHTML = `<div class="fbx info"><b>The answer is ${answerText(q)}.</b> ${q.why || ''}</div>`; Sfx.bad(); onPass(); }
  });
}
const CHEERS = ['Nice!', 'Nailed it!', 'Boom!', 'Correct!', 'Big brain!', 'Let\'s go!', 'Awesome!', 'Clean!'];

// ─── Quiz player: practice, boss battles, speed run ───
function startQuiz(mode, id) {
  const l = id ? level(id) : null, isWB = l && Object.values(WORLD_BOSS).includes(l);
  const speedPool = () => { const ok = MATH.filter(m => S.lv[m.id] && (S.lv[m.id].learn || isDone(m.id))); return ok.length >= 2 ? ok : MATH.slice(0, 3); };
  P = { mode, id, l, isWB, i: 0, n: mode === 'practice' ? 8 : 999, pts: 0, right: 0, combo: 0, bestCombo: 0, hp: isWB ? l.hp : 100, maxhp: isWB ? l.hp : 100, hearts: 3, coins: 0, xp: 0, time: 60, state: 'ask', iv: 0 };
  P.gen = mode === 'speed' ? () => pick(speedPool()).gen() : mode === 'boss' ? bossGen(l) : l.gen;
  const world = l ? l.world : 'math', boss = mode === 'boss';
  show('sPlay', world);
  $('#sPlay').innerHTML = `<div class="play w-${world} ${boss ? 'isboss' : ''}">
    <div class="playtop"><button class="btn ghost small" id="quitBtn">✕ Leave</button><div class="phud" id="phud"></div></div>
    ${boss ? `<div class="arena card"><div class="fighter me"><div class="fart">${creature(hero(S.hero).look)}</div><div class="hearts" id="hearts"></div><p class="fname">${esc(S.name)}</p></div><div class="vs">VS</div><div class="fighter foe"><div class="hpbar"><i id="hpFill"></i><span id="hpTxt"></span></div><div class="fart" id="foeArt">${creature(l.boss.look, 'boss')}</div><p class="fname">${l.boss.name}</p></div><div id="pops"></div></div>` : ''}
    ${mode === 'speed' ? '<div class="speedbar"><i id="spFill"></i></div>' : ''}
    <div class="qcard card"><p class="qnum" id="qnum"></p><div class="qtext" id="qtext"></div><div id="ansZone"></div><p class="fmt" id="fmt"></p><div id="fb" aria-live="polite"></div></div></div>`;
  $('#quitBtn').onclick = () => { stopTimers(); P = null; if (l) goLevel(l.id); else goLobby(); };
  if (mode === 'speed') P.iv = setInterval(() => { P.time--; drawPlayHud(); if (P.time <= 0) finishQuiz(); }, 1000);
  nextQ();
}
function drawPlayHud() {
  if (!P) return;
  let h = '';
  if (P.mode === 'practice') h = `<div class="pips big">${Array.from({ length: P.n }, (_, i) => `<i class="${i < P.i ? (P.res && P.res[i] ? 'ok' : 'no') : i === P.i ? 'on' : ''}"></i>`).join('')}</div>`;
  if (P.mode === 'speed') { h = `<span class="pill">⏱ <b>${P.time}s</b></span><span class="pill">✅ <b>${P.right}</b></span>`; const f = $('#spFill'); if (f) f.style.width = P.time / 60 * 100 + '%'; }
  h += P.combo >= 2 ? `<span class="combo">🔥 ${P.combo}x COMBO</span>` : '';
  h += `<span class="pill">${ICON.coin}<b>+${P.coins}</b></span>`;
  $('#phud').innerHTML = h;
  if (P.mode === 'boss') { $('#hearts').innerHTML = [0, 1, 2].map(i => (i < P.hearts ? ICON.heart : ICON.heartOff)).join(''); $('#hpFill').style.width = Math.max(0, P.hp) / P.maxhp * 100 + '%'; $('#hpTxt').textContent = `${Math.max(0, P.hp)} / ${P.maxhp}`; }
}
function nextQ() {
  if (!P) return;
  if (P.mode === 'practice' && P.i >= P.n) return finishQuiz();
  P.q = P.gen(); P.tries = 0; P.state = 'ask'; P.t0 = Date.now();
  $('#qnum').textContent = P.mode === 'practice' ? `Question ${P.i + 1} of ${P.n}` : P.mode === 'speed' ? 'SPEED RUN' : `Round ${P.i + 1}`;
  $('#qtext').innerHTML = P.q.q;
  const z = $('#ansZone'); z.innerHTML = answerHTML(P.q, { hint: P.mode === 'practice' });
  $('#fmt').textContent = P.q.kind === 'num' ? (P.l && P.l.fmt) || 'Type a number. Fractions like 3/4 and negatives like -5 work too.' : '';
  $('#fb').innerHTML = '';
  wireAnswer(z, P.q, onAnswer);
  drawPlayHud();
}
function lockAnswers() { $$('#ansZone .choice, #ansZone .ans, #ansZone .goBtn, #ansZone .hintBtn').forEach(x => (x.disabled = true)); }
function nextBtn(label = 'Next') { $('#fb').insertAdjacentHTML('beforeend', `<div class="row center"><button class="btn green" id="nextBtn">${label} ➜</button></div>`); const b = $('#nextBtn'); b.onclick = () => { P.i++; nextQ(); }; b.focus(); P.state = 'next'; }
function onAnswer(ok, val, btn) {
  if (!P || P.state !== 'ask') return;
  const q = P.q, fb = $('#fb'), ai = P.l && P.l.world === 'ai';
  if (P.mode === 'speed') {
    lockAnswers();
    if (ok) { P.right++; P.combo++; P.coins += 1; P.xp += 5; S.stats.ok++; questEvent('ok'); if (btn) btn.classList.add('right'); Sfx.good(); fb.innerHTML = `<div class="fbx good"><b>${pick(CHEERS)}</b></div>`; P.state = 'wait'; later(() => { P.i++; nextQ(); }, 380); }
    else { P.combo = 0; if (btn) btn.classList.add('wrong'); Sfx.bad(); fb.innerHTML = `<div class="fbx bad"><b>It was ${answerText(q)}</b></div>`; P.state = 'wait'; later(() => { P.i++; nextQ(); }, 1300); }
    drawPlayHud(); return;
  }
  if (P.mode === 'practice') {
    P.res ||= [];
    if (ok) {
      const first = P.tries === 0; P.pts += first ? 1 : 0.5; P.right++; P.res[P.i] = true;
      if (first) { P.combo++; P.bestCombo = Math.max(P.bestCombo, P.combo); if (P.combo === 5) questEvent('combo5'); } else P.combo = 0;
      const c = 2 + (first ? Math.floor(P.combo / 3) : 0); P.coins += c; P.xp += first ? 10 : 5; S.stats.ok++; questEvent('ok'); if (ai) questEvent('ai');
      lockAnswers(); if (btn) btn.classList.add('right'); Sfx.good(); if (P.combo >= 3 && first) Sfx.coin();
      fb.innerHTML = `<div class="fbx good"><b>${pick(CHEERS)}</b> ${q.why || ''}</div>`; nextBtn(P.i === P.n - 1 ? 'See results' : 'Next');
    } else if (P.tries === 0) {
      P.tries = 1; P.combo = 0; Sfx.bad(); if (btn) { btn.classList.add('wrong'); btn.disabled = true; }
      fb.innerHTML = `<div class="fbx bad"><b>Not quite. One more try!</b>${q.hint ? `<br>💡 ${q.hint}` : ''}</div>`; const i = $('#ansZone .ans'); if (i) { i.select(); }
      $('#qtext').closest('.qcard').classList.add('shake'); setTimeout(() => $('#qtext') && $('#qtext').closest('.qcard').classList.remove('shake'), 400);
    } else {
      P.res[P.i] = false; lockAnswers(); if (btn) btn.classList.add('wrong'); if (q.kind === 'choice') $$('#ansZone .choice')[q.correct].classList.add('right'); Sfx.bad();
      fb.innerHTML = `<div class="fbx info"><b>The answer is ${answerText(q)}.</b> ${q.why || ''}</div>`; nextBtn(P.i === P.n - 1 ? 'See results' : 'Next');
    }
    drawPlayHud(); return;
  }
  // Boss battle: one try each
  lockAnswers();
  if (ok) {
    const fast = (Date.now() - P.t0) / 1000 < (q.kind === 'choice' ? 8 : 12), dmg = fast ? 30 : 20;
    P.hp -= dmg; P.right++; P.combo++; P.coins += 3; P.xp += 12; S.stats.ok++; questEvent('ok'); if (ai) questEvent('ai'); if (P.combo === 5) questEvent('combo5');
    if (btn) btn.classList.add('right'); Sfx.hit(); pop(`−${dmg}${fast ? ' CRIT!' : ''}`, 'foe', fast);
    $('#foeArt').classList.add('hit'); setTimeout(() => $('#foeArt') && $('#foeArt').classList.remove('hit'), 450);
    fb.innerHTML = `<div class="fbx good"><b>${fast ? '⚡ CRITICAL HIT!' : pick(CHEERS)}</b> ${q.why || ''}</div>`;
    drawPlayHud();
    if (P.hp <= 0) { P.state = 'end'; later(finishQuiz, 1100); return; }
  } else {
    P.hearts--; P.combo = 0; if (btn) btn.classList.add('wrong'); if (q.kind === 'choice') $$('#ansZone .choice')[q.correct].classList.add('right');
    Sfx.bad(); pop('−1 ❤', 'me'); $('.fighter.me .fart').classList.add('hit'); setTimeout(() => $('.fighter.me .fart') && $('.fighter.me .fart').classList.remove('hit'), 450);
    fb.innerHTML = `<div class="fbx bad"><b>Ouch! The answer was ${answerText(q)}.</b> ${q.why || ''}</div>`;
    drawPlayHud();
    if (P.hearts <= 0) { P.state = 'end'; later(finishQuiz, 1400); return; }
  }
  nextBtn('Next round');
}
function pop(txt, side, big) { const p = document.createElement('div'); p.className = `pop ${side} ${big ? 'crit' : ''}`; p.textContent = txt; $('#pops').appendChild(p); setTimeout(() => p.remove(), 1100); }
function finishQuiz() {
  if (!P) return; stopTimers();
  const p = P; P = null;
  if (p.mode === 'speed') {
    S.best ||= {}; const best = p.right > (S.best.speed || 0); if (best) S.best.speed = p.right; if (p.right >= 10) questEvent('speed10');
    reward(p.xp, p.coins); Sfx.win(); if (best && p.right) Confetti.burst();
    return resultScreen({ world: 'math', face: '⚡', title: `${p.right} CORRECT!`, sub: best && p.right ? 'New personal best!' : `Your best is ${S.best.speed}.`, xp: p.xp, coins: p.coins, buttons: [['Go again', () => startQuiz('speed'), ''], ['Lobby', goLobby, 'ghost']] });
  }
  const l = p.l, v = lvState(l.id);
  if (p.mode === 'practice') {
    const stars = p.pts >= 7 ? 3 : p.pts >= 5 ? 2 : p.pts >= 3 ? 1 : 0, wasDone = isDone(l.id);
    v.stars = Math.max(v.stars || 0, stars); persist(); reward(p.xp, p.coins);
    if (stars) { Sfx.win(); Confetti.burst(stars * 50); } else Sfx.lose();
    return resultScreen({ world: l.world, face: creature(hero(S.hero).look), title: stars === 3 ? 'PERFECT!' : stars ? 'NICE WORK!' : 'KEEP TRAINING', sub: `${p.right} of ${p.n} right${p.bestCombo >= 3 ? ` · best combo ${p.bestCombo}x` : ''}.${!wasDone && isDone(l.id) ? ' <b>Next level unlocked!</b>' : ''}`, stars, xp: p.xp, coins: p.coins,
      buttons: [[v.learn ? 'Fight the boss!' : 'Back to level', () => (v.learn ? startQuiz('boss', l.id) : goLevel(l.id)), ''], ['Practice again', () => startQuiz('practice', l.id), 'ghost'], ['Level', () => goLevel(l.id), 'ghost']] });
  }
  if (p.hp <= 0) {
    const first = !v.boss, wasDone = isDone(l.id); v.boss = true; S.stats.boss++; persist(); questEvent('boss');
    const xp = p.xp + (first ? (p.isWB ? 250 : 100) : 25), coins = p.coins + (first ? (p.isWB ? 150 : 50) : 10); reward(xp, coins); Sfx.win(); Confetti.burst(200);
    const nxt = WORLD_LEVELS[l.world][WORLD_LEVELS[l.world].indexOf(l) + 1];
    return resultScreen({ world: l.world, face: creature(l.boss.look, 'boss ko'), title: 'VICTORY!', sub: `You beat <b>${l.boss.name}</b>!${first ? ` +${p.isWB ? 5 : 2} stars on the Star Road.` : ''}${!wasDone && !p.isWB ? ' <b>Next level unlocked!</b>' : ''}`, xp, coins,
      buttons: [nxt && !p.isWB ? [`Next: ${nxt.name}`, () => goLevel(nxt.id), ''] : ['Back to the map', () => goWorld(l.world), ''], ['Lobby', goLobby, 'ghost']] });
  }
  reward(Math.round(p.xp / 2) + 10, p.coins); Sfx.lose();
  resultScreen({ world: l.world, face: creature(l.boss.look, 'boss'), title: 'DEFEATED', sub: `${l.boss.name} wins this round. You hit it ${p.right} time${p.right === 1 ? '' : 's'}. ${p.isWB ? 'Replay a few levels and come back!' : 'More practice makes your hits land.'}`, xp: Math.round(p.xp / 2) + 10, coins: p.coins, lose: true,
    buttons: [['Rematch', () => startQuiz('boss', l.id), ''], [p.isWB ? 'Map' : 'Practice', () => (p.isWB ? goWorld(l.world) : kindOf(l) === 'lua' ? openLua(l.id) : startQuiz('practice', l.id)), 'ghost']] });
}

// ─── Result screen ───
function resultScreen(o) {
  show('sResult', o.world);
  $('#sResult').innerHTML = `<div class="card result ${o.lose ? 'lose' : ''} w-${o.world || 'math'}"><div class="rays"></div><div class="rface">${o.face && o.face.startsWith('<') ? o.face : `<span class="bigemoji">${o.face || '🏆'}</span>`}</div>
    <h1 class="stroke rtitle">${o.title}</h1>${o.stars != null ? `<div class="rstars">${[0, 1, 2].map(i => `<span class="rs ${i < o.stars ? 'on' : ''}" style="animation-delay:${0.3 + i * 0.25}s">${i < o.stars ? ICON.star : ICON.starOff}</span>`).join('')}</div>` : ''}
    <p class="lead">${o.sub || ''}</p>${o.xp || o.coins ? `<div class="loot">${o.xp ? `<span>${ICON.xp}<b>+${o.xp}</b> XP</span>` : ''}${o.coins ? `<span>${ICON.coin}<b>+${o.coins}</b></span>` : ''}</div>` : ''}
    <div class="row center wrap">${o.buttons.map((b, i) => `<button class="btn ${b[2]}" data-b="${i}">${b[0]}</button>`).join('')}</div></div>`;
  $$('#sResult [data-b]').forEach(b => b.onclick = () => { Sfx.tap(); o.buttons[+b.dataset.b][1](); });
  setTimeout(() => { const b = $('#sResult [data-b="0"]'); if (b) b.focus(); }, 50);
}

// ─── Robot puzzles ───
function botStars(l) { const n = l.puzzles.length, st = l.puzzles.map((_, i) => S.puz[l.id + ':' + i] || {}); const solved = st.filter(s => s.done).length, par = st.filter(s => s.par).length; return solved < n ? 0 : par === n ? 3 : par >= n / 2 ? 2 : 1; }
function openPuzzles(id, pi) {
  const l = level(id), n = l.puzzles.length;
  if (pi == null) { pi = l.puzzles.findIndex((_, i) => !(S.puz[id + ':' + i] || {}).done); if (pi < 0) pi = 0; }
  show('sBot', 'code');
  $('#sBot').innerHTML = `<div class="bothead card w-code"><button class="btn ghost small" id="bBack">← Level</button><div class="bh"><p class="eyebrow">${l.name} · Puzzle ${pi + 1} of ${n}</p></div><div class="ptabs">${l.puzzles.map((_, i) => { const s = S.puz[id + ':' + i] || {}; return `<button class="ptab ${i === pi ? 'on' : ''} ${s.done ? 'done' : ''}" data-i="${i}" aria-label="Puzzle ${i + 1}">${i + 1}${s.par ? '<em>★</em>' : ''}</button>`; }).join('')}</div></div><div id="botArea"></div><div id="botAfter" class="row center"></div>`;
  $('#bBack').onclick = () => goLevel(id);
  $$('#sBot .ptab').forEach(b => b.onclick = () => openPuzzles(id, +b.dataset.i));
  botPuzzle($('#botArea'), l.puzzles[pi], res => {
    if (!res.win) return;
    const key = id + ':' + pi, prev = S.puz[key] || {}, allBefore = botStars(l) > 0;
    if (!prev.done) reward(15, 10); if (res.par && !prev.par) reward(5, 5);
    S.puz[key] = { done: true, par: prev.par || res.par };
    const v = lvState(id), st = botStars(l); v.stars = Math.max(v.stars || 0, st); persist();
    const nextI = l.puzzles.findIndex((_, i) => !(S.puz[id + ':' + i] || {}).done);
    if (!allBefore && st > 0) { setTimeout(() => { Sfx.win(); Confetti.burst(); resultScreen({ world: 'code', face: creature(hero(S.hero).look), title: 'PUZZLES CLEARED!', sub: `All ${n} puzzles solved.${st < 3 ? ' Beat par on every puzzle for 3 stars.' : ''}`, stars: st, buttons: [['Fight the boss!', () => (v.learn ? openBossPuzzle(id) : goLevel(id)), ''], ['Back to level', () => goLevel(id), 'ghost']] }); }, 1200); return; }
    $('#botAfter').innerHTML = `${pi < n - 1 ? `<button class="btn" id="bNext">Next puzzle ➜</button>` : nextI >= 0 ? `<button class="btn" id="bNext">Puzzle ${nextI + 1} ➜</button>` : `<button class="btn" id="bLvl">Back to level</button>`}${!res.par ? '<button class="btn ghost" id="bAgain">Try for par</button>' : ''}`;
    const nb = $('#bNext'); if (nb) nb.onclick = () => openPuzzles(id, pi < n - 1 ? pi + 1 : nextI);
    const lb = $('#bLvl'); if (lb) lb.onclick = () => goLevel(id);
    const ab = $('#bAgain'); if (ab) ab.onclick = () => openPuzzles(id, pi);
  });
}
function openBossPuzzle(id) {
  const l = level(id); let hearts = 3;
  show('sBot', 'code');
  $('#sBot').innerHTML = `<div class="bothead card w-code bossmode"><button class="btn ghost small" id="bBack">← Level</button><div class="bh"><p class="eyebrow">BOSS PUZZLE</p><b>${l.boss.name}</b></div><div class="bossmini">${creature(l.boss.look, 'boss')}</div><div class="hearts" id="bh"></div></div><div id="botArea"></div>`;
  const drawH = () => ($('#bh').innerHTML = [0, 1, 2].map(i => (i < hearts ? ICON.heart : ICON.heartOff)).join(''));
  drawH(); $('#bBack').onclick = () => goLevel(id);
  botPuzzle($('#botArea'), l.bossPuzzle, res => {
    const v = lvState(id);
    if (res.win) { const first = !v.boss, wasDone = isDone(id); v.boss = true; S.stats.boss++; persist(); questEvent('boss'); const xp = first ? 120 : 25, coins = first ? 60 : 10; reward(xp, coins); setTimeout(() => { Sfx.win(); Confetti.burst(200); const nxt = CODE[CODE.indexOf(l) + 1]; resultScreen({ world: 'code', face: creature(l.boss.look, 'boss ko'), title: 'VICTORY!', sub: `Your robot outsmarted <b>${l.boss.name}</b>!${!wasDone ? ' <b>Next level unlocked!</b>' : ''}`, xp, coins, buttons: [nxt ? [`Next: ${nxt.name}`, () => goLevel(nxt.id), ''] : ['Map', () => goWorld('code'), ''], ['Lobby', goLobby, 'ghost']] }); }, 1300); return; }
    hearts--; drawH(); Sfx.hit();
    if (hearts <= 0) setTimeout(() => { Sfx.lose(); resultScreen({ world: 'code', face: creature(l.boss.look, 'boss'), title: 'DEFEATED', sub: `${l.boss.name} wins this time. Practice the puzzles and come back!`, lose: true, buttons: [['Rematch', () => openBossPuzzle(id), ''], ['Puzzles', () => openPuzzles(id), 'ghost']] }); }, 1500);
  });
}

// ─── Lua challenges ───
function openLua(id, ci) {
  const l = level(id), n = l.challenges.length;
  if (ci == null) { ci = l.challenges.findIndex((_, i) => !(S.puz[id + ':c' + i] || {}).done); if (ci < 0) ci = 0; }
  const ch = l.challenges[ci], key = id + ':c' + ci; let fails = 0;
  S.drafts ||= {};
  show('sLua', 'code');
  $('#sLua').innerHTML = `<div class="bothead card w-code"><button class="btn ghost small" id="lBack">← Level</button><div class="bh"><p class="eyebrow">${l.name} · Challenge ${ci + 1} of ${n}</p></div><div class="ptabs">${l.challenges.map((_, i) => { const s = S.puz[id + ':c' + i] || {}; return `<button class="ptab ${i === ci ? 'on' : ''} ${s.done ? 'done' : ''}" data-i="${i}">${i + 1}${s.done && !s.peek ? '<em>★</em>' : ''}</button>`; }).join('')}</div></div>
    <div class="luawrap"><div class="card chal"><h2>${ch.title}</h2><p>${ch.prompt}</p>${ch.expect && !ch.vary ? `<div class="expect"><span>${ch.test ? 'Our test should print' : 'Should print'}</span><code class="outc">${ch.expect.map(esc).join('<br>')}</code></div>` : ''}</div>
    <div class="card edcard"><div class="edtop"><span>📄 script.lua</span><button class="linkbtn" id="lReset">Reset code</button></div><div id="ed"></div>
      <div class="row"><button class="btn green" id="lRun">▶ Run &amp; Check</button><button class="btn ghost small" id="lHint">💡 Hint</button><button class="btn ghost small" id="lSol" hidden>Show answer</button></div></div>
    <div class="card console"><div class="ctitle">OUTPUT</div><div class="cbody" id="cbody"><div class="dim">Press Run to test your code. Tip: Ctrl+Enter runs it too.</div></div></div><div id="lfb"></div></div>`;
  $('#lBack').onclick = () => goLevel(id);
  $$('#sLua .ptab').forEach(b => b.onclick = () => openLua(id, +b.dataset.i));
  const ed = editor($('#ed'), S.drafts[key] ?? ch.start, () => run());
  $('#ed textarea').addEventListener('input', () => { S.drafts[key] = ed.get(); persist(); });
  $('#lReset').onclick = () => { ed.set(ch.start); S.drafts[key] = ch.start; persist(); };
  $('#lHint').onclick = () => { $('#lfb').innerHTML = `<div class="fbx info">💡 ${ch.hint}</div>`; };
  $('#lSol').onclick = () => { ed.set(ch.solution); S.drafts[key] = ch.solution; const s = S.puz[key] || {}; if (!s.done) S.puz[key] = { ...s, peek: true }; persist(); $('#lfb').innerHTML = '<div class="fbx info">Here\'s one way to solve it. Read each line, then press Run to see it work.</div>'; };
  function run() {
    const code = ed.get(), r = checkLua(ch, code); S.stats.lua++; questEvent('lua');
    $('#cbody').innerHTML = consoleHTML(r.res, { showTest: true });
    if (r.pass) {
      const prev = S.puz[key] || {}; const first = !prev.done; S.puz[key] = { done: true, peek: !!prev.peek };
      const v = lvState(id), stars = l.challenges.filter((_, i) => { const s = S.puz[id + ':c' + i] || {}; return s.done && !s.peek; }).length, all = l.challenges.every((_, i) => (S.puz[id + ':c' + i] || {}).done);
      v.stars = Math.max(v.stars || 0, stars); persist();
      if (first) reward(25, 15); Sfx.good(); Confetti.burst(60);
      const nextI = l.challenges.findIndex((_, i) => !(S.puz[id + ':c' + i] || {}).done);
      $('#lfb').innerHTML = `<div class="fbx good"><b>✅ It works!</b> ${first ? '+25 XP, +15 coins.' : ''}</div><div class="row center">${nextI >= 0 ? `<button class="btn" id="lNext">Challenge ${nextI + 1} ➜</button>` : `<button class="btn" id="lDone">${all && first ? 'See results' : 'Back to level'}</button>`}</div>`;
      $$('#sLua .ptab')[ci].classList.add('done');
      const nb = $('#lNext'); if (nb) nb.onclick = () => openLua(id, nextI);
      const db = $('#lDone'); if (db) db.onclick = () => (all && first ? resultScreen({ world: 'code', face: '⌨️', title: 'CODE COMPLETE!', sub: `You solved every challenge in ${l.name}.${stars < 3 ? ' Solve them without peeking at answers for 3 stars.' : ''}`, stars, buttons: [['Fight the boss!', () => (v.learn ? startQuiz('boss', id) : goLevel(id)), ''], ['Back to level', () => goLevel(id), 'ghost']] }) : goLevel(id));
    } else {
      fails++; Sfx.bad();
      $('#lfb').innerHTML = `<div class="fbx bad"><b>Not yet.</b> ${r.msg}</div>`;
      if (fails >= 2) $('#lSol').hidden = false;
    }
  }
  $('#lRun').onclick = run;
}

// ─── AI labs ───
function openLab(id) {
  const l = level(id);
  show('sLab', 'ai');
  $('#sLab').innerHTML = `<div class="bothead card w-ai"><button class="btn ghost small" id="aBack">← Level</button><div class="bh"><p class="eyebrow">${l.name} · Lab</p></div></div><div class="card labcard" id="labArea"></div>`;
  $('#aBack').onclick = () => goLevel(id);
  l.lab($('#labArea'), stars => {
    const v = lvState(id), first = !v.stars; v.stars = Math.max(v.stars || 0, stars); persist();
    reward(first ? 20 * stars + 20 : 10, first ? 10 * stars + 10 : 5); questEvent('ai', stars); Sfx.win(); Confetti.burst();
    resultScreen({ world: 'ai', face: '🧪', title: 'LAB COMPLETE!', sub: stars < 3 ? 'Finish each step on your first try for 3 stars.' : 'Every step on the first try. Genius!', stars, buttons: [['Fight the boss!', () => (v.learn ? startQuiz('boss', id) : goLevel(id)), ''], ['Back to level', () => goLevel(id), 'ghost']] });
  });
}

// ─── Shop ───
function openShop() {
  show('sShop');
  const ts = totalStars();
  $('#sShop').innerHTML = `<div class="card shophead"><button class="btn ghost small" id="sBack">← Lobby</button><h1 class="stroke">Heroes</h1><span class="pill big">${ICON.coin}<b>${S.coins.toLocaleString()}</b></span></div>
    <div class="herogrid">${HEROES.map(h => { const own = S.owned.includes(h.id), eq = S.hero === h.id;
      const btn = eq ? '<button class="btn small" disabled>Equipped</button>' : own ? `<button class="btn small green" data-eq="${h.id}">Equip</button>` : h.road ? `<button class="btn small ghost" disabled>${ICON.star} ${h.road} on Star Road</button>` : `<button class="btn small ${S.coins >= h.cost ? '' : 'ghost'}" data-buy="${h.id}" ${S.coins >= h.cost ? '' : 'disabled'}>${h.cost ? `${ICON.coin} ${h.cost}` : 'Free'}</button>`;
      return `<div class="herocard ${own ? '' : 'notown'} ${eq ? 'equipped' : ''}"><div class="hart">${creature(h.look)}</div><b>${h.name}</b><small>${h.role}</small>${btn}</div>`; }).join('')}</div>
    <p class="note center">Earn coins from lessons, practice, puzzles, bosses and daily quests. ${ts < 40 ? 'Some heroes only unlock on the Star Road.' : ''}</p>`;
  $('#sBack').onclick = goLobby;
  $$('#sShop [data-eq]').forEach(b => b.onclick = () => { S.hero = b.dataset.eq; persist(); Sfx.tap(); openShop(); });
  $$('#sShop [data-buy]').forEach(b => b.onclick = () => { const h = hero(b.dataset.buy); if (S.coins < h.cost) return; S.coins -= h.cost; S.owned.push(h.id); S.hero = h.id; persist(); Sfx.coin(); Confetti.burst(100); toast(`<b>${h.name}</b> joined your team!`); openShop(); });
}

// ─── Star Road ───
function openRoad() {
  show('sRoad');
  const ts = totalStars();
  $('#sRoad').innerHTML = `<div class="card shophead"><button class="btn ghost small" id="rBack">← Lobby</button><h1 class="stroke">Star Road</h1><span class="pill big">${ICON.star}<b>${ts}</b></span></div>
    <p class="note center">Earn stars from practice (up to 3 per level), bosses (+2) and world Titans (+5). Rewards unlock as you climb.</p>
    <div class="road">${ROAD.map(r => { const got = S.road.includes(r.at), ready = !got && ts >= r.at;
      const art = r.hero ? `<div class="rhero">${creature(hero(r.hero).look)}</div><b>${hero(r.hero).name}</b>` : `<div class="rcoins">${ICON.coin}</div><b>${r.coins} coins</b>`;
      return `<div class="rstop ${got ? 'got' : ready ? 'ready' : 'locked'}"><span class="rat">${ICON.star}${r.at}</span>${art}${got ? `<span class="rok">${ICON.check}</span>` : ready ? `<button class="btn small green" data-at="${r.at}">Claim</button>` : `<small>${r.at - ts} more</small>`}</div>`; }).join('')}</div>`;
  $('#rBack').onclick = goLobby;
  $$('#sRoad [data-at]').forEach(b => b.onclick = () => { const r = ROAD.find(x => x.at === +b.dataset.at); S.road.push(r.at); if (r.hero) { if (!S.owned.includes(r.hero)) S.owned.push(r.hero); toast(`<b>${hero(r.hero).name}</b> unlocked! Equip it in the shop.`); } else { S.coins += r.coins; toast(`+${r.coins} coins!`); } persist(); Sfx.coin(); Confetti.burst(120); openRoad(); });
}

// ─── Grown-ups ───
function openParents() {
  show('sParents');
  const row = l => { const v = S.lv[l.id] || {}; return `<tr><td>${l.name}<small>${l.title}</small></td><td>${v.learn ? '✅' : '·'}</td><td>${starsHTML(v.stars || 0)}</td><td>${v.boss ? '✅' : '·'}</td></tr>`; };
  $('#sParents').innerHTML = `<div class="card shophead"><button class="btn ghost small" id="pBack">← Lobby</button><h1 class="stroke">For Grown-ups</h1></div>
    <div class="card parents">
      <p><b>${esc(S.name || 'Your player')}</b> is level ${levelOf(S.xp) + 1} with ${totalStars()} stars, ${S.stats.ok} correct answers, ${S.stats.lua} Lua runs, and ${S.stats.boss} bosses beaten. Current streak: ${S.streak.n || 1} day(s).</p>
      ${['math', 'code', 'ai'].map(w => `<h3>${WORLDS[w].name}</h3><table class="ptable"><tr><th>Level</th><th>Lesson</th><th>Stars</th><th>Boss</th></tr>${WORLD_LEVELS[w].map(row).join('')}<tr><td>${WORLD_BOSS[w].boss.name}<small>World boss</small></td><td></td><td></td><td>${(S.lv[WORLD_BOSS[w].id] || {}).boss ? '✅' : '·'}</td></tr></table>`).join('')}
      <h3>Settings</h3>
      <div class="row wrap"><button class="btn small ${S.sound ? 'green' : 'ghost'}" id="pSound">Sound: ${S.sound ? 'on' : 'off'}</button><button class="btn small ${S.unlockAll ? 'green' : 'ghost'}" id="pUnlock">Unlock all levels: ${S.unlockAll ? 'on' : 'off'}</button><button class="btn small pink" id="pReset">Reset all progress</button></div>
      <h3>About Brain Brawl</h3>
      <ul class="about"><li><b>Math Arena</b> covers the Common Core grade 6 domains (ratios, the number system, expressions and equations, geometry, statistics) plus a few grade 7 skills. Standards are listed on each level.</li>
      <li><b>Code Lab</b> starts with block coding (sequences, loops, conditionals) and moves to real Lua 5.3, which matches the basics of Luau, the language used in Roblox Studio. Code runs only inside this page.</li>
      <li><b>AI Academy</b> follows the AI4K12 "Five Big Ideas" and teaches prompting, fact-checking, privacy and bias. <b>No real chatbot is connected.</b> All AI replies are pre-written, so nothing your child types leaves the device.</li>
      <li>A good pace is one level every few days, 15 to 20 minutes at a time. Progress saves in this browser only. No accounts, no ads, no data collected.</li></ul>
    </div>`;
  $('#pBack').onclick = goLobby;
  $('#pSound').onclick = () => { S.sound = !S.sound; persist(); openParents(); };
  $('#pUnlock').onclick = () => { S.unlockAll = !S.unlockAll; persist(); openParents(); };
  $('#pReset').onclick = e => { const b = e.currentTarget; if (b.dataset.sure) { localStorage.removeItem(KEY); S = freshSave(); persist(); renderStart(); } else { b.dataset.sure = 1; b.textContent = 'Tap again to erase everything'; } };
}

// ─── Keyboard shortcuts ───
document.addEventListener('keydown', e => {
  if (document.body.dataset.screen !== 'sPlay' || !P) return;
  if (P.state === 'ask' && /^[1-4a-d]$/i.test(e.key) && P.q.kind === 'choice' && document.activeElement.tagName !== 'INPUT') { const i = /\d/.test(e.key) ? +e.key - 1 : 'abcd'.indexOf(e.key.toLowerCase()); const b = $$('#ansZone .choice')[i]; if (b && !b.disabled) b.click(); }
});

// ─── Boot ───
function boot() {
  $('#hudMe').onclick = openShop; $('#navHome').onclick = goLobby; $('#navShop').onclick = openShop; $('#navRoad').onclick = openRoad; $('#navParents').onclick = openParents;
  $('#navSound').onclick = () => { S.sound = !S.sound; persist(); renderHUD(); toast(S.sound ? '🔊 Sound on' : '🔇 Sound off'); };
  ensureQuests();
  if (S.name) goLobby(); else renderStart();
}
boot();
