// Brain Brawl extras: adaptive question mixing, weak-spot drills, the weekly raid boss,
// Obby Builder (Lua controls a character), the grown-up report, and transfer codes.

// ─── Adaptive difficulty: remember what gets missed, and ask it more often ───
function recordQ(lid, ok) {
  S.log ||= {}; const d = (S.log[today()] ||= { ok: 0, miss: 0, sec: 0 }); if (ok) d.ok++; else d.miss++;
  if (!lid || lid === 'wild') return;
  S.skill ||= {}; const k = (S.skill[lid] ||= { r: 0, w: 0, m: 0 });
  if (ok) { k.r++; k.m = Math.max(0, k.m - 0.5); } else { k.w++; k.m = Math.min(6, k.m + 1); }
}
const missOf = id => ((S.skill || {})[id] || {}).m || 0;
function mix(levels) {
  const ls = levels.filter(l => l.gen); let tot = ls.reduce((s, l) => s + 1 + missOf(l.id) * 0.8, 0), t = Math.random() * tot;
  const l = ls.find(x => (t -= 1 + missOf(x.id) * 0.8) <= 0) || ls[0], q = l.gen(); q.lid = l.id; return q;
}
const weakLevels = () => ALL.filter(l => l.gen && missOf(l.id) >= 1).sort((a, b) => missOf(b.id) - missOf(a.id)).slice(0, 3);
function startDrill() {
  const weak = weakLevels();
  if (!weak.length) { toast('No weak spots right now. Miss a few questions and I\'ll build a drill from them.'); return; }
  startQuiz('practice', null, { l: { id: 'drill', world: weak[0].world, name: 'Weak Spot Drill', gen: () => mix(weak) }, back: goLobby,
    onEnd(_, p) { const stars = p.pts >= 7 ? 3 : p.pts >= 5 ? 2 : p.pts >= 3 ? 1 : 0; gainEnergy(stars * 2); reward(p.xp + stars * 10, p.coins + stars * 5); persist(); if (stars) { Sfx.win(); Confetti.burst(stars * 50); } else Sfx.lose();
      resultScreen({ world: weak[0].world, face: creature(hero(S.hero).look), title: stars === 3 ? 'WEAK SPOT CRUSHED!' : stars ? 'GETTING STRONGER' : 'KEEP AT IT', sub: `${p.right} of 8 right on your toughest topics: ${weak.map(l => l.title).join(', ')}.${stars ? ` +${stars * 2} bonus energy.` : ''}`, stars, xp: p.xp + stars * 10, coins: p.coins + stars * 5, buttons: [['Drill again', startDrill, ''], ['Lobby', goLobby, 'ghost']] }); } });
}

// ─── History for the grown-up report ───
function logEvent(t, id) { S.hist ||= []; S.hist.push({ d: today(), t, id }); if (S.hist.length > 120) S.hist.shift(); }
setInterval(() => { if (document.visibilityState === 'visible' && S.name && document.body.dataset.screen !== 'sStart') { S.log ||= {}; (S.log[today()] ||= { ok: 0, miss: 0, sec: 0 }).sec += 15; const ks = Object.keys(S.log); if (ks.length > 40) delete S.log[ks[0]]; persist(); } }, 15000);
const dayKey = back => { const d = new Date(); d.setDate(d.getDate() - back); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function reportData() {
  const days = Array.from({ length: 7 }, (_, i) => { const k = dayKey(6 - i), v = (S.log || {})[k] || { ok: 0, miss: 0, sec: 0 }, d = new Date(); d.setDate(d.getDate() - (6 - i)); return { k, name: d.toLocaleDateString('en-US', { weekday: 'short' }), ...v }; });
  const tot = days.reduce((a, d) => ({ ok: a.ok + d.ok, miss: a.miss + d.miss, sec: a.sec + d.sec }), { ok: 0, miss: 0, sec: 0 });
  const sk = Object.entries(S.skill || {}).map(([id, k]) => ({ l: level(id), n: k.r + k.w, acc: k.r / Math.max(1, k.r + k.w) })).filter(x => x.l && x.n >= 5);
  const strong = [...sk].sort((a, b) => b.acc - a.acc).slice(0, 3), weak = [...sk].sort((a, b) => a.acc - b.acc).filter(x => x.acc < 0.8).slice(0, 3);
  const keys = new Set(days.map(d => d.k)), recent = (S.hist || []).filter(h => keys.has(h.d));
  return { days, tot, strong, weak, recent, active: days.filter(d => d.ok + d.miss > 0).length };
}
function reportHTML() {
  const r = reportData(), acc = r.tot.ok + r.tot.miss ? Math.round(r.tot.ok / (r.tot.ok + r.tot.miss) * 100) : 0, max = Math.max(1, ...r.days.map(d => d.ok + d.miss));
  const nm = h => { const l = level(h.id); return l ? (l.boss && h.t !== 'lesson' ? `beat ${l.boss.name} (${l.title || l.name})` : `finished the ${l.title} lesson`) : h.t === 'raid' ? 'won the weekly raid' : h.t === 'guard' ? `cleared the ${h.id} zone` : h.t; };
  return `<h3>This week</h3><div class="repgrid"><div><b>${r.tot.ok + r.tot.miss}</b><small>questions answered</small></div><div><b>${acc}%</b><small>correct</small></div><div><b>${Math.round(r.tot.sec / 60)}</b><small>minutes played</small></div><div><b>${r.active} / 7</b><small>days active</small></div></div>
    <div class="repbars">${r.days.map(d => `<div><i style="height:${(d.ok + d.miss) / max * 100}%"><em style="height:${d.ok + d.miss ? d.ok / (d.ok + d.miss) * 100 : 0}%"></em></i><small>${d.name}</small></div>`).join('')}</div><p class="note">Bar height is questions answered. The green part is how many were right.</p>
    <div class="reptwo"><div><h4>Strongest</h4>${r.strong.length ? r.strong.map(x => `<p>${x.l.title} <b>${Math.round(x.acc * 100)}%</b></p>`).join('') : '<p class="note">Not enough answers yet.</p>'}</div><div><h4>Needs work</h4>${r.weak.length ? r.weak.map(x => `<p>${x.l.title} <b>${Math.round(x.acc * 100)}%</b></p>`).join('') : '<p class="note">Nothing below 80% right now.</p>'}</div></div>
    ${r.recent.length ? `<h4>Milestones this week</h4><ul class="about">${r.recent.slice(-8).reverse().map(h => `<li>${nm(h)}</li>`).join('')}</ul>` : ''}
    <div class="row"><button class="btn small cyan" id="repCopy">Copy report as text</button></div>`;
}
function reportText() {
  const r = reportData(), acc = r.tot.ok + r.tot.miss ? Math.round(r.tot.ok / (r.tot.ok + r.tot.miss) * 100) : 0;
  return [`Brain Brawl weekly report for ${S.name || 'Player'}`, `Questions answered: ${r.tot.ok + r.tot.miss} (${acc}% correct)`, `Minutes played: ${Math.round(r.tot.sec / 60)} across ${r.active} of the last 7 days`, `Level ${levelOf(S.xp) + 1}, ${totalStars()} stars, ${S.owned.length} characters, streak ${S.streak.n || 1} day(s)`,
    `Strongest: ${r.strong.map(x => `${x.l.title} ${Math.round(x.acc * 100)}%`).join(', ') || 'not enough data yet'}`, `Needs work: ${r.weak.map(x => `${x.l.title} ${Math.round(x.acc * 100)}%`).join(', ') || 'nothing below 80%'}`].join('\n');
}

// ─── Transfer code: move progress to another device without an account ───
const saveCode = () => btoa(unescape(encodeURIComponent(JSON.stringify(S))));
function loadCode(code) { try { const s = JSON.parse(decodeURIComponent(escape(atob(code.trim())))); if (!s || typeof s !== 'object' || !s.lv || typeof s.name !== 'string') return false; S = Object.assign(freshSave(), s); persist(); return true; } catch (e) { return false; } }
function transferHTML() {
  return `<h3>Move progress to another device</h3><p class="note">Progress is saved in this browser only. To move it, copy this code here, then paste it on the other device.</p>
    <div class="row wrap"><button class="btn small cyan" id="tcCopy">Copy my transfer code</button><button class="btn small ghost" id="tcShow">Paste a code</button></div><div id="tcBox" hidden><textarea id="tcIn" rows="3" placeholder="Paste a transfer code here" spellcheck="false"></textarea><div class="row"><button class="btn small pink" id="tcLoad">Replace this device's progress</button></div></div>`;
}
function wireParentsExtras() {
  const copy = (txt, msg) => { (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(msg)).catch(() => { const m = modal(`<p class="eyebrow">Copy this</p><textarea rows="8" style="width:100%" readonly>${esc(txt)}</textarea><div class="row center"><button class="btn" id="rvOk">Done</button></div>`); m.querySelector('#rvOk').onclick = closeModal; m.querySelector('textarea').select(); }); };
  $('#repCopy').onclick = () => copy(reportText(), 'Report copied.');
  $('#tcCopy').onclick = () => copy(saveCode(), 'Transfer code copied. Paste it on the other device.');
  $('#tcShow').onclick = () => { $('#tcBox').hidden = false; $('#tcIn').focus(); };
  $('#tcLoad').onclick = e => { const b = e.currentTarget; if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = 'Tap again to replace everything here'; return; } if (loadCode($('#tcIn').value)) { toast('Progress loaded!'); Sfx.win(); goLobby(); } else { toast('That code didn\'t work. Copy the whole thing and try again.'); Sfx.bad(); delete b.dataset.sure; b.textContent = 'Replace this device\'s progress'; } };
}

// ─── Weekly raid: a new boss every week, with a character you can only win that week ───
const RAID_HEROES = [
  { id: 'r_vortex', name: 'Vortex', role: 'Raid Champion', look: { color: '#22D3C5', eyes: 'cyber', mouth: 'grin', acc: 'wings', glow: '#22D3C5' } },
  { id: 'r_ember', name: 'Ember Knight', role: 'Raid Champion', look: { color: '#FF5A3C', eyes: 'angry', mouth: 'flat', acc: 'cape', cape: '#FFC93C', glow: '#FF8A3D' } },
  { id: 'r_lumen', name: 'Lumen', role: 'Raid Champion', look: { color: '#FFF6C9', eyes: 'happy', mouth: 'smile', acc: 'halo', glow: '#FFE14D', belly: true } },
  { id: 'r_byte', name: 'Rogue Byte', role: 'Raid Champion', look: { color: '#3A2FA3', eyes: 'glitch', mouth: 'fangs', acc: 'mohawk', hair: '#FF4FD8', glow: '#FF4FD8' } },
];
RAID_HEROES.forEach(h => { h.rar = 'legendary'; h.cost = -1; h.wild = true; h.raid = true; HEROES.push(h); });
const raidWeek = () => Math.floor((Date.now() / 864e5 + 3) / 7);
function raidInfo() {
  const w = raidWeek(), rnd = mulberry(w * 131 + 7), pk = a => a[Math.floor(rnd() * a.length)];
  const name = pk(['Glitchzilla', 'Null Pointer', 'Kraken.exe', 'Overlord 404', 'Lagmaw', 'Zero Day', 'The Firewall', 'Stack Smasher']);
  const look = { color: pk(['#FF4F7B', '#8C7CFF', '#22D3C5', '#FF8A3D', '#5BE36B', '#3DA8FF']), eyes: pk(['angry', 'three', 'cyber', 'glitch', 'one']), mouth: pk(['teeth', 'fangs']), acc: pk(['horns', 'spikes', 'crown', 'wings']), spots: true, glow: '#FF4FD8' };
  const left = 7 - Math.floor((Date.now() / 864e5 + 3) % 7);
  return { w, name, look, hero: RAID_HEROES[w % RAID_HEROES.length], left, won: (S.raid || {}).w === w };
}
function startRaid() {
  const r = raidInfo();
  startQuiz('boss', null, { l: { id: 'wild', world: 'math2', boss: { name: r.name, look: r.look }, gen: () => mix(ALL) }, hp: 320, back: goLobby,
    onEnd(win, p) {
      const first = win && !r.won, xp = p.xp + (win ? (first ? 300 : 60) : 15), coins = p.coins + (win ? (first ? 200 : 30) : 0); reward(xp, coins);
      if (!win) { Sfx.lose(); return resultScreen({ world: 'math2', face: creature(r.look, 'boss'), title: 'RAID FAILED', sub: `${r.name} has 320 HP and questions from every world. You landed ${p.right} hit${p.right === 1 ? '' : 's'}. It's here for ${r.left} more day${r.left === 1 ? '' : 's'}.`, xp, coins, lose: true, buttons: [['Try again', startRaid, ''], ['Lobby', goLobby, 'ghost']] }); }
      S.stats.boss++; questEvent('boss'); gainEnergy(8);
      if (first) { S.raid = { w: r.w }; S.caps = (S.caps || 0) + 2; logEvent('raid', r.name); }
      persist(); checkBadges(); goLobby(); Sfx.win(); Confetti.burst(240);
      if (first) revealHero(grantHero(r.hero.id, 'raid'), () => toast('Raid cleared! +2 capsules. A new raid boss arrives next week.')); else toast(`${r.name} beaten again. Rewards are once per week.`);
    } });
}

// ─── Obby Builder: write Lua that runs a character through an obstacle course ───
const OBBY = [
  { name: 'First Steps', goal: 'Get to the flag. <code>walk()</code> moves one tile. <code>walk(3)</code> moves three.', course: () => '......F', par: 1, start: '-- Walk to the flag!\nwalk()\n', hint: 'Count the tiles between you and the flag, then use walk with that number.' },
  { name: 'Mind the Gap', goal: 'Lava! <code>jump()</code> leaps over one tile and lands two tiles ahead. Grab the coins on the way.', course: () => '.c_.c._.F', par: 5, start: '-- jump() clears one lava tile\nwalk()\n', hint: 'Walk up to the edge of the lava, then jump. Repeat for the second gap.' },
  { name: 'Loop It', goal: 'Same move, six times. Use a <b>for</b> loop so you only write it once.', course: () => '.' + '_c'.repeat(6) + 'F', par: 4, need: [/\bfor\b/, 'Use a <b>for</b> loop for this one.'], start: '-- for i = 1, 6 do ... end\n', hint: 'Every step is the same: jump(). Put it inside for i = 1, 6 do ... end, then walk to the flag if you need to.' },
  { name: 'Look Before You Leap', goal: 'This course <b>changes every time</b>. Use <code>gapAhead()</code> and <code>atFlag()</code> so your code can handle any course.', random: [12, 0.3, 0], par: 7, need: [/\bwhile\b/, 'Use a <b>while</b> loop so your code keeps going until the flag.'], start: '-- gapAhead() is true when lava is next\n-- atFlag() is true when you made it\nwhile not atFlag() do\n  \nend\n', hint: 'Inside the loop: if gapAhead() then jump() else walk() end' },
  { name: 'Mega Obby', goal: 'A long random course full of coins. Write a <b>function</b> called <code>step</code> that makes one smart move, then call it in a loop.', random: [18, 0.3, 0.5], par: 9, need: [/\bfunction\s+step\b/, 'Define a function named <b>step</b>.'], start: 'function step()\n  \nend\n\nwhile not atFlag() do\n  step()\nend\n', hint: 'step() should check gapAhead(), then jump or walk. The loop calls it until atFlag().' },
];
function randCourse([len, pg, pc]) { let s = '.'; while (s.length < len) { const prev = s[s.length - 1]; if (prev !== '_' && s.length > 1 && Math.random() < pg) s += '_'; else s += Math.random() < pc ? 'c' : '.'; } if (s[s.length - 1] === '_') s += '.'; return s + 'F'; }
const obbyPrelude = c => `local __c="${c}" local __p=1 local __n=0 local function __m() __n=__n+1 if __n>300 then error("TIRED",0) end end function atFlag() return __c:sub(__p,__p)=="F" end function gapAhead() return __c:sub(__p+1,__p+1)=="_" end function coinAhead() return __c:sub(__p+1,__p+1)=="c" end local function __land(t) __p=math.min(__p,#__c) print("@"..t..__p) if __c:sub(__p,__p)=="_" then error("FELL",0) end end function walk(n) for i=1,(n or 1) do if atFlag() then return end __m() __p=__p+1 __land("w") end end function jump() if atFlag() then return end __m() __p=__p+2 __land("j") end`;
function runObby(code, course) {
  const r = Lua.run(obbyPrelude(course) + '\n' + code);
  const moves = r.out.filter(l => /^@[wj]\d+$/.test(l)).map(l => ({ t: l[1], p: +l.slice(2) - 1 }));
  r.out = r.out.filter(l => !/^@[wj]\d+$/.test(l));
  const fell = r.err && /FELL/.test(r.err.msg), tired = r.err && /TIRED/.test(r.err.msg);
  if (r.err && r.err.line) r.err.line = r.err.line > 1 ? r.err.line - 1 : null;
  const end = moves.length ? moves[moves.length - 1].p : 0, coins = new Set(moves.map(m => m.p).filter(p => course[p] === 'c')).size;
  return { r, moves, fell, tired, win: !r.err && course[end] === 'F', coins, total: [...course].filter(ch => ch === 'c').length };
}
function openObby(i) {
  S.obby ||= {}; if (i == null) { i = OBBY.findIndex((_, k) => !S.obby[k]); if (i < 0) i = 0; }
  const lv = OBBY[i]; let course = lv.random ? randCourse(lv.random) : lv.course(), busy = false, fails = 0;
  S.drafts ||= {}; const key = 'obby' + i;
  show('sObby', 'code'); Guide.setCtx(i === 2 ? 'lua3' : i === 4 ? 'lua4' : null);
  $('#sObby').innerHTML = `<div class="bothead card w-code"><button class="btn ghost small" id="oBack">← Lobby</button><div class="bh"><p class="eyebrow">Obby Builder · Course ${i + 1} of ${OBBY.length}</p><b>${lv.name}</b></div><div class="ptabs">${OBBY.map((_, k) => `<button class="ptab ${k === i ? 'on' : ''} ${S.obby[k] ? 'done' : ''}" data-i="${k}">${k + 1}${S.obby[k] === 3 ? '<em>★</em>' : ''}</button>`).join('')}</div></div>
    <div class="card obbystage"><div class="obby" id="obby"></div></div>
    <div class="luawrap"><div class="card chal"><h2>${lv.name}</h2><p>${lv.goal}</p><p class="note">Commands: <code>walk(n)</code> <code>jump()</code> <code>gapAhead()</code> <code>coinAhead()</code> <code>atFlag()</code></p><p class="note">⭐ reach the flag · ⭐ grab every coin · ⭐ ${lv.par} lines of code or fewer</p></div>
    <div class="card edcard"><div class="edtop"><span>📄 obby.lua</span><button class="linkbtn" id="oReset">Reset code</button></div><div id="oEd"></div><div class="row"><button class="btn green" id="oRun">▶ Run</button><button class="btn ghost small" id="oHint">💡 Hint</button>${lv.random ? '<button class="btn ghost small" id="oNew">🎲 New course</button>' : ''}</div></div>
    <div class="card console"><div class="ctitle">OUTPUT</div><div class="cbody" id="oOut"><div class="dim">Write your code, then press Run.</div></div></div><div id="oFb"></div></div>`;
  const draw = (c, pos = 0, got = new Set(), state = '') => { $('#obby').style.setProperty('--n', c.length); $('#obby').innerHTML = [...c].map((ch, k) => `<div class="ocell ${ch === '_' ? 'lava' : 'ground'}">${ch === 'c' && !got.has(k) ? `<span class="ocoin">${ICON.coin}</span>` : ''}${ch === 'F' ? `<span class="oflag">${FLAG_SVG}</span>` : ''}</div>`).join('') + `<div class="orun ${state}" style="--x:${pos}">${creature(hero(S.hero).look)}</div>`; };
  draw(course);
  const ed = editor($('#oEd'), S.drafts[key] ?? lv.start, () => run());
  $('#oEd textarea').addEventListener('input', () => { S.drafts[key] = ed.get(); persist(); });
  $('#oBack').onclick = goLobby; $('#oReset').onclick = () => { ed.set(lv.start); S.drafts[key] = lv.start; persist(); };
  $('#oHint').onclick = () => { $('#oFb').innerHTML = `<div class="fbx info">💡 ${lv.hint}</div>`; };
  const nb = $('#oNew'); if (nb) nb.onclick = () => { if (busy) return; course = randCourse(lv.random); draw(course); };
  $$('#sObby .ptab').forEach(b => b.onclick = () => { if (!busy) openObby(+b.dataset.i); });
  function run() {
    if (busy) return; const code = ed.get(); S.stats.lua++; questEvent('lua');
    for (const pair of [lv.need].filter(Boolean)) if (!pair[0].test(code)) { $('#oFb').innerHTML = `<div class="fbx bad"><b>Not yet.</b> ${pair[1]}</div>`; Sfx.bad(); return; }
    // Random courses are checked on three different layouts, so the code has to really work
    const tests = lv.random ? [course, randCourse(lv.random), randCourse(lv.random)] : [course], runs = tests.map(c => runObby(code, c));
    const bad = runs.findIndex(x => !x.win), showI = bad < 0 ? 0 : bad, res = runs[showI], c = tests[showI];
    course = c; busy = true; $('#oOut').innerHTML = consoleHTML(res.r); $('#oFb').innerHTML = '';
    const got = new Set(); let k = 0; draw(c);
    const tick = () => {
      if (!$('#obby') || !$('#obby').isConnected) { busy = false; return; }
      if (k >= res.moves.length) return finish();
      const m = res.moves[k++]; if (c[m.p] === 'c' && !got.has(m.p)) { got.add(m.p); Sfx.coin(); } else Sfx.step();
      draw(c, m.p, got, m.t === 'j' ? 'jumping' : ''); setTimeout(tick, m.t === 'j' ? 330 : 190);
    };
    const finish = () => {
      busy = false; const pos = res.moves.length ? res.moves[res.moves.length - 1].p : 0;
      if (res.fell) { draw(c, pos, got, 'fell'); Sfx.bad(); fails++; $('#oFb').innerHTML = `<div class="fbx bad"><b>Splash! Right into the lava.</b> ${lv.random && showI ? 'Your code worked on one course but not on this one. It needs to check before every move.' : 'Check where you need to jump instead of walk.'}</div>`; return; }
      if (!res.win) { Sfx.bad(); fails++; $('#oFb').innerHTML = `<div class="fbx bad"><b>${res.r.err ? 'Your code hit an error.' : res.tired ? 'Too many moves!' : 'You stopped before the flag.'}</b> ${res.r.err ? 'Read the red message in the Output.' : 'Add more moves, or loop until atFlag().'}</div>`; return; }
      const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('--')).length, allCoins = runs.every(x => x.coins === x.total);
      const stars = 1 + (allCoins ? 1 : 0) + (lines <= lv.par ? 1 : 0), first = !S.obby[i]; S.obby[i] = Math.max(S.obby[i] || 0, stars);
      if (first) { reward(40, 25); gainEnergy(4); logEvent('obby', lv.name); } persist(); Sfx.win(); Confetti.burst(120);
      $('#oFb').innerHTML = `<div class="fbx good"><b>🏁 Course cleared!</b> ${starsHTML(stars)} ${first ? '+40 XP, +25 coins, +4 energy.' : ''}<br>${allCoins ? '' : 'You missed some coins. '}${lines <= lv.par ? '' : `You used ${lines} lines. Can you do it in ${lv.par}?`}</div><div class="row center">${i < OBBY.length - 1 ? '<button class="btn" id="oNext">Next course ➜</button>' : '<button class="btn" id="oNext">Back to lobby</button>'}</div>`;
      $('#oNext').onclick = () => (i < OBBY.length - 1 ? openObby(i + 1) : goLobby());
      $$('#sObby .ptab')[i].classList.add('done');
    };
    setTimeout(tick, 250);
  }
  $('#oRun').onclick = run;
}

// ─── Lobby cards for all of the above ───
function extrasLobbyHTML() {
  const r = raidInfo(), weak = weakLevels(), done = OBBY.filter((_, k) => (S.obby || {})[k]).length;
  return `<button class="card xcard raidcard" id="toRaid"><span class="xart">${creature(r.look)}</span><span><b>Weekly Raid: ${r.name}</b><small>${r.won ? `Beaten! New boss in ${r.left} day${r.left === 1 ? '' : 's'}.` : `320 HP. Win <u>${r.hero.name}</u>, only this week. ${r.left} day${r.left === 1 ? '' : 's'} left.`}</small></span></button>
    <button class="card xcard obbycard" id="toObby"><span class="xart xemoji">🏃</span><span><b>Obby Builder</b><small>Write Lua to run an obstacle course. ${done} / ${OBBY.length} cleared.</small></span></button>
    <button class="card xcard drillcard ${weak.length ? '' : 'dimmed'}" id="toDrill"><span class="xart xemoji">🎯</span><span><b>Weak Spot Drill</b><small>${weak.length ? `8 questions on: ${weak.map(l => l.title).join(', ')}` : 'Nothing to drill yet. The game is tracking what you miss.'}</small></span></button>`;
}
function wireExtrasLobby() { $('#toRaid').onclick = () => { Sfx.tap(); startRaid(); }; $('#toObby').onclick = () => { Sfx.tap(); openObby(); }; $('#toDrill').onclick = () => { Sfx.tap(); startDrill(); }; }
