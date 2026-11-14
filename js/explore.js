// Brain Brawl explore: the Grid map, wild characters, relics, capsules, badges and the Codex.
// The loop: answer questions anywhere → earn energy → scan tiles on the map → catch characters and find loot.

const mulberry = seed => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const RELICS = [
  { id: 'chip', name: 'Lucky Chip', text: '+15% coins from everything', coin: 0.15, color: '#FFC93C', glyph: '◈' },
  { id: 'clock', name: 'Overclock Core', text: '+2 seconds to land critical hits', crit: 2, color: '#5BE36B', glyph: '◷' },
  { id: 'lens', name: 'Prism Lens', text: '+20% XP from everything', xp: 0.2, color: '#BDEBFF', glyph: '◭' },
  { id: 'link', name: 'Mind Link', text: 'Hints work during boss fights', hint: true, color: '#B26BFF', glyph: '✦' },
  { id: 'heart', name: 'Heart Reactor', text: '+1 heart in every boss fight', heart: 1, color: '#FF4F7B', glyph: '♥' },
  { id: 'cell', name: 'Infinity Cell', text: 'Double energy from correct answers', energy: 2, color: '#FF4FD8', glyph: '∞' },
];
const ZONES = [
  { name: 'Neon Harbor', color: '#3DD6FF', world: 'math', blurb: 'Glowing docks where the first wild characters hang out.', topic: 'Math Arena, levels 1 to 5', gen: () => mix(MATH.slice(0, 5)) },
  { name: 'Circuit Canyon', color: '#5BE36B', world: 'code', blurb: 'Canyons carved by running code.', topic: 'Reading Lua code', gen: () => luaQuestion(['basics', 'ifs', 'loops']) },
  { name: 'Prism Peaks', color: '#FF8A3D', world: 'math', blurb: 'Crystal mountains that split light into numbers.', topic: 'Math Arena, levels 6 to 10', gen: () => mix(MATH.slice(5)) },
  { name: 'Neural Nebula', color: '#B26BFF', world: 'ai', blurb: 'A thinking cloud of a billion sparks.', topic: 'AI Academy', gen: () => mix(AI) },
  { name: 'Algebra Abyss', color: '#FF4FD8', world: 'math2', blurb: 'Deep, dark and full of x.', topic: 'Algebra Peaks', gen: () => mix(MATH2) },
  { name: 'Titan Core', color: '#FFE14D', world: 'math2', blurb: 'The center of the Grid. Everything you know, all at once.', topic: 'Everything', gen: () => (R(0, 4) === 0 ? luaQuestion(['basics', 'ifs', 'loops', 'funcs', 'tables']) : mix([...MATH, ...MATH2, ...AI])) },
];
const GW = 7, GH = 6, START = '0,5', GUARD = '6,0';
const WILD_HP = { common: 60, rare: 90, epic: 120, legendary: 180, mythic: 240 };

// Save helpers
function exState() { S.ex ||= { z: {} }; S.ex.z ||= {}; return S.ex; }
function zState(zi) { const e = exState(); return (e.z[zi] ||= { seen: { [START]: 1 }, done: {}, guard: false }); }
const zoneOpen = zi => zi === 0 || S.unlockAll || zState(zi - 1).guard;
const ownsHero = id => S.owned.includes(id);
function gainEnergy(n) { const m = (S.relics || []).includes('cell') ? 2 : 1; S.energy = (S.energy || 0) + n * m; }
function perk() {
  const r = RARITY[hero(S.hero).rar] || RARITY.common, p = { coin: r.coin + 0.05 * (heroLv(S.hero) - 1), crit: r.crit, heart: r.heart, xp: 0, hint: false };
  (S.relics || []).forEach(id => { const x = RELICS.find(q => q.id === id); if (!x) return; p.coin += x.coin || 0; p.crit += x.crit || 0; p.heart += x.heart || 0; p.xp += x.xp || 0; if (x.hint) p.hint = true; });
  return p;
}
const heroLv = id => (S.hlv || {})[id] || 1;
const lvStars = id => (heroLv(id) > 1 ? ` <span class="hlv">${'★'.repeat(heroLv(id))}</span>` : '');
const boostC = c => Math.round(c * (1 + perk().coin));
const boostX = x => Math.round(x * (1 + perk().xp));

// Deterministic layout for each zone, so the map is the same every time you come back
const _layouts = {};
function zoneLayout(zi) {
  if (_layouts[zi]) return _layouts[zi];
  const rnd = mulberry(zi * 977 + 31), cells = [];
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { const k = x + ',' + y; if (k !== START && k !== GUARD) cells.push(k); }
  for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  const roam = WILD.filter(h => h.zone === zi && !h.guard), tiles = {};
  const take = () => cells.pop();
  for (let i = 0; i < 7; i++) { let h = roam[i]; if (!h) { let tot = roam.reduce((s, r) => s + RARITY[r.rar].w, 0), t = rnd() * tot; h = roam.find(r => (t -= RARITY[r.rar].w) <= 0) || roam[0]; } tiles[take()] = { t: 'wild', h: h.id }; }
  for (let i = 0; i < 3; i++) tiles[take()] = { t: 'chest' };
  tiles[take()] = { t: 'relic', r: RELICS[zi].id };
  for (let i = 0; i < 3; i++) tiles[take()] = { t: 'energy', n: 4 + Math.floor(rnd() * 4) };
  for (let i = 0; i < 10; i++) tiles[take()] = { t: 'coin', n: (2 + Math.floor(rnd() * 6)) * 5 * (zi + 1) };
  cells.forEach(k => (tiles[k] = { t: 'empty' }));
  tiles[START] = { t: 'start' }; tiles[GUARD] = { t: 'guard', h: WILD.find(h => h.zone === zi && h.guard).id };
  return (_layouts[zi] = tiles);
}
const neighbors = k => { const [x, y] = k.split(',').map(Number); return [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [x + a, y + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < GW && b < GH).map(p => p.join(',')); };
const zonePct = zi => Math.round(Object.keys(zState(zi).seen).length / (GW * GH) * 100);

// ─── Small art ───
const capsuleSVG = (cls = '') => `<svg class="capsule ${cls}" viewBox="0 0 80 100" aria-hidden="true"><ellipse cx="40" cy="94" rx="24" ry="5" fill="rgba(0,0,0,.35)"/><path d="M12 50 Q12 12 40 12 Q68 12 68 50 Z" fill="#FF4FD8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M12 50 Q12 88 40 88 Q68 88 68 50 Z" fill="#EEF1FF" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><rect x="8" y="44" width="64" height="12" rx="6" fill="#241A5E" stroke="${INK}" stroke-width="4"/><circle cx="40" cy="50" r="8" fill="#7FF8FF" stroke="${INK}" stroke-width="3.5"/><path d="M22 34 Q24 22 36 20" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/></svg>`;
const relicSVG = r => `<svg class="relic" viewBox="0 0 60 60" aria-hidden="true"><path d="M30 4 L54 18 L54 42 L30 56 L6 42 L6 18 Z" fill="${r.color}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M30 4 L54 18 L30 30 L6 18 Z" fill="#fff" opacity=".35"/><text x="30" y="39" text-anchor="middle" font-size="24" font-weight="900" fill="${INK}">${r.glyph}</text></svg>`;
const boltIcon = `<svg class="ic" viewBox="0 0 24 24"><path d="M13.5 2 L5 13.5 h5.5 L9 22 l9.5-12 H13z" fill="#7FF8FF" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
const rarTag = h => `<span class="rar" style="--rc:${RARITY[h.rar].color}">${RARITY[h.rar].name}</span>`;

// ─── Modal ───
function modal(html, cls = '') {
  closeModal();
  const m = document.createElement('div'); m.id = 'modal'; m.className = cls;
  m.innerHTML = `<div class="modalcard card">${html}</div>`; document.body.appendChild(m);
  return m;
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); }

// ─── Characters: add one to the team ───
function grantHero(id, source) {
  const h = hero(id), dupe = ownsHero(id);
  let up = false;
  if (dupe && heroLv(id) < 5) { S.hlv ||= {}; S.hlv[id] = heroLv(id) + 1; up = true; } else if (dupe) { S.coins += RARITY[h.rar].dupe; } else { S.owned.push(id); exState().caught = (exState().caught || 0) + 1; }
  persist(); renderHUD();
  return { h, dupe, up, coins: dupe && !up ? RARITY[h.rar].dupe : 0, source };
}
function revealHero(res, after) {
  const { h, dupe, coins, up } = res;
  const m = modal(`<div class="reveal" style="--rc:${RARITY[h.rar].color}"><div class="rays"></div><p class="eyebrow">${up ? 'Power up!' : dupe ? 'Duplicate' : 'New character!'}</p><div class="revart">${creature(h.look, 'big')}</div><h2 class="stroke">${h.name}</h2><p>${rarTag(h)} <span class="note">${h.role}</span></p>
    <p class="perk">${up ? `Duplicate! ${h.name} powered up to <b>${'★'.repeat(heroLv(h.id))}</b>. Each star adds <b>+5% coins</b> when equipped.` : dupe ? `${h.name} is already maxed out, so it turned into ${ICON.coin} <b>${coins}</b> coins.` : `Power: <b>${perkText(h)}</b>`}</p>
    <div class="row center">${dupe ? '' : '<button class="btn green" id="rvEq">Equip</button>'}<button class="btn ${dupe ? '' : 'ghost'}" id="rvOk">${dupe ? 'Nice' : 'Later'}</button></div></div>`, 'revealm');
  Sfx.win(); Confetti.burst(h.rar === 'common' ? 60 : h.rar === 'rare' ? 110 : 220);
  const fin = () => { closeModal(); if (after) after(); };
  m.querySelector('#rvOk').onclick = fin;
  const eq = m.querySelector('#rvEq'); if (eq) eq.onclick = () => { S.hero = h.id; persist(); renderHUD(); toast(`<b>${h.name}</b> is now your hero!`); fin(); };
}

// ─── Capsules ───
function capsulePool() {
  return HEROES.filter(h => (h.cap || (h.wild && !h.guard && h.zone != null && zoneOpen(h.zone)) || (!h.wild && h.cost > 0)));
}
function openCapsule(after) {
  if (!(S.caps > 0)) { toast('No capsules yet. Find them on the map, beat Elite bosses, or earn badges.'); Sfx.bad(); return; }
  S.caps--; persist();
  const pool = capsulePool(); let tot = pool.reduce((s, h) => s + RARITY[h.rar].w, 0), t = Math.random() * tot;
  const h = pool.find(x => (t -= RARITY[x.rar].w) <= 0) || pool[0];
  const m = modal(`<div class="capopen"><p class="eyebrow">Opening capsule</p>${capsuleSVG('shakey')}<p class="note">Decrypting...</p></div>`, 'revealm');
  [0, 250, 500, 750].forEach(d => setTimeout(() => Sfx.step(), d));
  setTimeout(() => { if (!m.isConnected) return; revealHero(grantHero(h.id, 'capsule'), after); }, 1200);
}

// ─── Badges ───
const BADGES = [
  { id: 'b1', name: 'First Blood', text: 'Beat your first boss', ok: () => S.stats.boss >= 1 },
  { id: 'b2', name: 'Boss Hunter', text: 'Beat 10 bosses', ok: () => S.stats.boss >= 10 },
  { id: 'b3', name: 'Boss Legend', text: 'Beat 30 bosses', ok: () => S.stats.boss >= 30 },
  { id: 'b4', name: 'Sharp', text: '100 correct answers', ok: () => S.stats.ok >= 100 },
  { id: 'b5', name: 'Sharper', text: '500 correct answers', ok: () => S.stats.ok >= 500 },
  { id: 'b6', name: 'Razor', text: '1,500 correct answers', ok: () => S.stats.ok >= 1500 },
  { id: 'b7', name: 'Collector', text: 'Own 10 characters', ok: () => S.owned.length >= 10 },
  { id: 'b8', name: 'Zookeeper', text: 'Own 25 characters', ok: () => S.owned.length >= 25 },
  { id: 'b9', name: 'Gotta Brain \'Em All', text: 'Own every character', ok: () => S.owned.length >= HEROES.length },
  { id: 'b10', name: 'Pathfinder', text: 'Beat a zone guardian', ok: () => ZONES.some((_, i) => zState(i).guard) },
  { id: 'b11', name: 'Grid Master', text: 'Beat all 6 zone guardians', ok: () => ZONES.every((_, i) => zState(i).guard) },
  { id: 'b12', name: 'Relic Hunter', text: 'Find 3 relics', ok: () => (S.relics || []).length >= 3 },
  { id: 'b13', name: 'On Fire', text: '7 day streak', ok: () => S.streak.n >= 7 },
  { id: 'b14', name: 'Speed Demon', text: 'Score 20 in a Speed Run', ok: () => ((S.best || {}).speed || 0) >= 20 },
  { id: 'b15', name: 'Elite', text: 'Win 5 Elite rematches', ok: () => Object.values(S.lv).filter(v => v.elite).length >= 5 },
  { id: 'b16', name: 'Coder', text: 'Run 50 Lua programs', ok: () => S.stats.lua >= 50 },
  { id: 'b17', name: 'Titan Slayer', text: 'Beat every world Titan', ok: () => Object.values(WORLD_BOSS).every(b => (S.lv[b.id] || {}).boss) },
  { id: 'b18', name: 'Mapmaker', text: 'Fully explore a zone', ok: () => ZONES.some((_, i) => zonePct(i) >= 100) },
];
function checkBadges() {
  S.badges ||= []; let fresh = [];
  BADGES.forEach(b => { if (!S.badges.includes(b.id) && b.ok()) { S.badges.push(b.id); fresh.push(b); } });
  if (fresh.length) { S.caps = (S.caps || 0) + fresh.length; persist(); setTimeout(() => { toast(`🏅 Badge earned: <b>${fresh.map(b => b.name).join(', ')}</b>! +${fresh.length} capsule${fresh.length > 1 ? 's' : ''}`); Sfx.level(); }, 600); }
}

// ─── The Grid: zone overview ───
function openMap() {
  show('sMap');
  const P2 = [[14, 74], [34, 40], [52, 72], [66, 30], [84, 62], [92, 18]];
  let path = `M ${P2[0][0]} ${P2[0][1]}`; for (let i = 1; i < P2.length; i++) path += ` Q ${(P2[i - 1][0] + P2[i][0]) / 2} ${P2[i - 1][1] - 14}, ${P2[i][0]} ${P2[i][1]}`;
  $('#sMap').innerHTML = `<div class="card shophead maphead"><button class="btn ghost small" id="mBack">← Lobby</button><h1 class="stroke">The Grid</h1><span class="pill big" title="Energy">${boltIcon}<b>${S.energy || 0}</b></span></div>
    <p class="note center">Every correct answer anywhere in the game gives you <b>energy</b>. Spend it to scan the map, catch wild characters and find relics.</p>
    <div class="sector card"><svg class="sectorpath" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${path}" class="sp1"/><path d="${path}" class="sp2"/></svg>
      ${ZONES.map((z, i) => { const open = zoneOpen(i), zs = zState(i), found = WILD.filter(h => h.zone === i && ownsHero(h.id)).length, all = WILD.filter(h => h.zone === i).length;
        return `<button class="znode ${open ? '' : 'locked'} ${zs.guard ? 'cleared' : ''}" style="left:${P2[i][0]}%;top:${P2[i][1]}%;--zc:${z.color}" data-z="${i}"><span class="zorb">${open ? `<b>${zonePct(i)}%</b>` : ICON.lock}</span><span class="zlab"><b>${z.name}</b><small>${open ? `${found}/${all} characters${zs.guard ? ' · 👑' : ''}` : 'Beat the guardian before it'}</small></span></button>`; }).join('')}</div>
    <div class="maprow"><button class="card mapcard" id="mCaps">${capsuleSVG()}<span><b>Capsules: ${S.caps || 0}</b><small>${S.caps ? 'Tap to open one!' : 'Find them in chests, Elite fights and badges.'}</small></span></button>
      <button class="card mapcard" id="mCodex"><span class="mcic">${creature(hero(S.hero).look)}</span><span><b>Codex</b><small>${S.owned.length} / ${HEROES.length} characters · ${(S.relics || []).length} / ${RELICS.length} relics</small></span></button></div>`;
  $('#mBack').onclick = goLobby; $('#mCodex').onclick = () => openCodex(); $('#mCaps').onclick = () => openCapsule(openMap);
  $$('#sMap .znode').forEach(b => b.onclick = () => { const i = +b.dataset.z; if (!zoneOpen(i)) { Sfx.bad(); toast(`Beat the guardian of <b>${ZONES[i - 1].name}</b> to open this zone.`); return; } Sfx.tap(); openZone(i); });
}

// ─── A zone: fog-of-war grid ───
function tileHTML(zi, k) {
  const zs = zState(zi), t = zoneLayout(zi)[k], seen = zs.seen[k], done = zs.done[k];
  const reach = !seen && neighbors(k).some(n => zs.seen[n]);
  if (!seen) return `<button class="tile fog ${reach ? 'reach' : ''}" data-k="${k}" aria-label="${reach ? 'Scan this tile' : 'Hidden tile'}">${reach ? '<span class="scan">?</span>' : ''}</button>`;
  let inner = '', cls = t.t;
  if (t.t === 'start') inner = `<span class="tyou">${creature(hero(S.hero).look)}</span>`;
  if (t.t === 'coin') inner = done ? '' : ICON.coin;
  if (t.t === 'energy') inner = done ? '' : boltIcon;
  if (t.t === 'chest') inner = done ? '' : capsuleSVG();
  if (t.t === 'relic') { const r = RELICS.find(x => x.id === t.r); inner = done ? '' : relicSVG(r); }
  if (t.t === 'wild') inner = done ? `<span class="pawdone">${ICON.check}</span>` : creature(hero(t.h).look);
  if (t.t === 'guard') inner = creature(hero(t.h).look) + (zs.guard ? `<span class="pawdone">${ICON.check}</span>` : '<span class="gcrown">👑</span>');
  const act = !done && ['wild', 'guard'].includes(t.t) && !(t.t === 'guard' && zs.guard);
  return `<button class="tile seen ${cls} ${done ? 'done' : ''} ${act ? 'act' : ''}" data-k="${k}" ${t.t === 'wild' && !done ? `style="--rc:${RARITY[hero(t.h).rar].color}"` : ''}>${inner}</button>`;
}
function openZone(zi) {
  const z = ZONES[zi], zs = zState(zi); exState().last = zi;
  show('sZone', z.world);
  const roster = WILD.filter(h => h.zone === zi);
  $('#sZone').innerHTML = `<div class="card shophead zonehead" style="--zc:${z.color}"><button class="btn ghost small" id="zBack">← The Grid</button><div><h1 class="stroke">${z.name}</h1><p class="note">${z.blurb} Questions here: <b>${z.topic}</b>.</p></div><span class="pill big" id="zEn">${boltIcon}<b>${S.energy || 0}</b></span></div>
    <div class="zonewrap"><div class="grid7" id="zGrid" style="--zc:${z.color}">${Array.from({ length: GH }, (_, y) => Array.from({ length: GW }, (_, x) => tileHTML(zi, x + ',' + y)).join('')).join('')}</div>
    <aside class="card zside"><h3>Who lives here</h3><div class="roster">${roster.map(h => `<div class="rost ${ownsHero(h.id) ? 'own' : 'unk'}" title="${ownsHero(h.id) ? h.name : '???'}">${creature(h.look)}<small style="color:${RARITY[h.rar].color}">${ownsHero(h.id) ? h.name : '???'}</small></div>`).join('')}</div>
      <p class="note"><b>${zonePct(zi)}%</b> explored. Tap a glowing <b>?</b> tile to scan it for 1 energy. Tap a character to battle it. Beat it and it joins your team.</p>
      <p class="note">Relic here: <b>${(S.relics || []).includes(RELICS[zi].id) ? RELICS[zi].name + ' ✓' : 'not found yet'}</b></p></aside></div>`;
  $('#zBack').onclick = openMap;
  $('#zGrid').onclick = e => { const b = e.target.closest('.tile'); if (b) tapTile(zi, b.dataset.k, b); };
}
function tapTile(zi, k, btn) {
  const zs = zState(zi), t = zoneLayout(zi)[k];
  if (!zs.seen[k]) {
    if (!neighbors(k).some(n => zs.seen[n])) { Sfx.bad(); toast('Too far. Scan a tile next to one you\'ve already explored.'); return; }
    if ((S.energy || 0) < 1) { Sfx.bad(); toast('Out of energy! Every correct answer in any world gives you more.'); return; }
    S.energy--; zs.seen[k] = 1; Sfx.step();
    let msg = '';
    if (t.t === 'coin') { zs.done[k] = 1; S.coins += t.n; msg = `+${t.n} coins!`; Sfx.coin(); }
    if (t.t === 'energy') { zs.done[k] = 1; S.energy += t.n; msg = `Power cell! +${t.n} energy`; Sfx.coin(); }
    if (t.t === 'chest') { zs.done[k] = 1; S.caps = (S.caps || 0) + 1; msg = 'You found a <b>capsule</b>! Open it from the Grid screen.'; Sfx.win(); Confetti.burst(50); }
    if (t.t === 'wild') msg = `A wild <b>${ownsHero(t.h) ? hero(t.h).name : RARITY[hero(t.h).rar].name.toLowerCase() + ' character'}</b> appeared! Tap it to battle.`;
    if (t.t === 'guard') msg = `The zone guardian! Beat <b>${hero(t.h).name}</b> to open the next zone.`;
    persist(); renderHUD(); if (msg) toast(msg);
    if (t.t === 'relic') { zs.done[k] = 1; S.relics ||= []; if (!S.relics.includes(t.r)) S.relics.push(t.r); persist(); const r = RELICS.find(x => x.id === t.r); Sfx.level(); Confetti.burst(160);
      const m = modal(`<div class="reveal" style="--rc:${r.color}"><div class="rays"></div><p class="eyebrow">Relic found!</p><div class="revart relicbig">${relicSVG(r)}</div><h2 class="stroke">${r.name}</h2><p class="perk"><b>${r.text}</b></p><p class="note">Relics work all the time, in every world. You keep them forever.</p><div class="row center"><button class="btn green" id="rvOk">Awesome</button></div></div>`, 'revealm'); m.querySelector('#rvOk').onclick = () => { closeModal(); openZone(zi); }; return; }
    checkBadges(); openZone(zi);
    const nb = $(`#zGrid [data-k="${k}"]`); if (nb) nb.classList.add('flip');
    return;
  }
  if (t.t === 'wild' && !zs.done[k]) return wildBattle(zi, k);
  if (t.t === 'guard' && !zs.guard) return wildBattle(zi, k);
  if (t.t === 'guard' && zs.guard) toast('Guardian beaten. The next zone is open!');
}
function wildBattle(zi, k) {
  const z = ZONES[zi], t = zoneLayout(zi)[k], h = hero(t.h), guard = t.t === 'guard', zs = zState(zi);
  const m = modal(`<div class="reveal" style="--rc:${RARITY[h.rar].color}"><p class="eyebrow">${guard ? 'Zone guardian' : 'Wild character'}</p><div class="revart">${creature(h.look, 'big')}</div><h2 class="stroke">${ownsHero(h.id) || guard ? h.name : '???'}</h2><p>${rarTag(h)} <span class="note">${h.role}</span></p>
    <p class="perk">${guard ? `Beat it to open <b>${ZONES[zi + 1] ? ZONES[zi + 1].name : 'the final reward'}</b> and add it to your team.` : ownsHero(h.id) ? (heroLv(h.id) < 5 ? `You already have this one. Win to <b>power it up</b> a star.` : `Already maxed. Win for ${ICON.coin} <b>${RARITY[h.rar].dupe}</b> coins.`) : `Win the battle and it joins your team. Power: <b>${perkText(h)}</b>`}</p>
    <p class="note">Questions: ${z.topic}. Tougher characters have more HP.</p><div class="row center"><button class="btn" id="wbGo">${ICON.sword} Battle</button><button class="btn ghost" id="wbNo">Not yet</button></div></div>`, 'revealm');
  m.querySelector('#wbNo').onclick = closeModal;
  m.querySelector('#wbGo').onclick = () => {
    closeModal();
    startQuiz('boss', null, { l: { id: 'wild', world: z.world, boss: { name: h.name, look: h.look }, gen: z.gen }, hp: WILD_HP[h.rar] + (guard ? 40 : 0), back: () => openZone(zi),
      onEnd(win, p) {
        const xp = p.xp + (win ? (guard ? 150 : 40) : 10), coins = p.coins + (win ? (guard ? 100 : 15) : 0);
        reward(xp, coins);
        if (!win) { Sfx.lose(); return resultScreen({ world: z.world, face: creature(h.look, 'boss'), title: 'IT GOT AWAY', sub: `${h.name} won this round, but it's still on the map. Train up and try again.`, xp, coins, lose: true, buttons: [['Try again', () => wildBattle(zi, k), ''], ['Back to the map', () => openZone(zi), 'ghost']] }); }
        if (guard) { zs.guard = true; S.caps = (S.caps || 0) + 2; logEvent('guard', z.name); } else zs.done[k] = 1;
        S.stats.boss++; persist(); questEvent('boss'); checkBadges();
        const res = grantHero(h.id, 'wild');
        openZone(zi);
        revealHero(res, guard ? () => toast(ZONES[zi + 1] ? `<b>${ZONES[zi + 1].name}</b> is now open! +2 capsules.` : 'You beat the Titan Core. You are the Grid Master! +2 capsules.') : null);
      } });
  };
}

// ─── Codex: everything you can collect ───
function openCodex(tab = 'chars') {
  show('sCodex');
  const groups = [['Starters and shop', HEROES.filter(h => !h.wild)], ...ZONES.map((z, i) => [z.name, WILD.filter(h => h.zone === i)]), ['Capsule only', WILD.filter(h => h.cap)], ['Weekly raid rewards', HEROES.filter(h => h.raid)]];
  const card = h => { const own = ownsHero(h.id), eq = S.hero === h.id; return `<button class="cx ${own ? 'own' : 'unk'} ${eq ? 'eq' : ''}" data-h="${h.id}" style="--rc:${RARITY[h.rar].color}"><span class="cxart">${creature(h.look)}</span><b>${own ? h.name + lvStars(h.id) : '???'}</b>${rarTag(h)}<small>${own ? perkText(h) + (heroLv(h.id) > 1 ? ` · +${(heroLv(h.id) - 1) * 5}% coins` : '') : h.raid ? 'Weekly raid reward' : h.wild ? (h.cap ? 'Found in capsules' : h.guard ? 'Zone guardian' : 'Roams the map') : h.road ? `Star Road: ${h.road} stars` : 'In the shop'}</small>${eq ? '<em>EQUIPPED</em>' : ''}</button>`; };
  const pk = perk();
  $('#sCodex').innerHTML = `<div class="card shophead"><button class="btn ghost small" id="cBack">← Back</button><h1 class="stroke">Codex</h1><span class="pill big">${S.owned.length} / ${HEROES.length}</span></div>
    <div class="tabs">${[['chars', 'Characters'], ['relics', 'Relics'], ['badges', 'Badges']].map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" data-t="${k}">${n}</button>`).join('')}</div>
    <div class="card bonusbar">Active bonuses: <b>+${Math.round(pk.coin * 100)}% coins</b> · <b>+${Math.round(pk.xp * 100)}% XP</b> · <b>+${pk.crit}s crit time</b> · <b>${3 + pk.heart} boss hearts</b>${pk.hint ? ' · <b>boss hints</b>' : ''}</div>
    ${tab === 'chars' ? groups.map(([n, list]) => `<h3 class="cxh">${n} <small>${list.filter(h => ownsHero(h.id)).length}/${list.length}</small></h3><div class="cxgrid">${list.map(card).join('')}</div>`).join('')
    : tab === 'relics' ? `<div class="cxgrid wide">${RELICS.map((r, i) => { const own = (S.relics || []).includes(r.id); return `<div class="cx relicc ${own ? 'own' : 'unk'}" style="--rc:${r.color}"><span class="cxart">${relicSVG(r)}</span><b>${own ? r.name : '???'}</b><small>${own ? r.text : `Hidden somewhere in ${ZONES[i].name}`}</small></div>`; }).join('')}</div>`
    : `<div class="cxgrid wide">${BADGES.map(b => { const own = (S.badges || []).includes(b.id); return `<div class="cx badge ${own ? 'own' : 'unk'}"><span class="bmedal">${own ? '🏅' : '🔒'}</span><b>${b.name}</b><small>${b.text}</small></div>`; }).join('')}</div><p class="note center">Every badge gives you a free capsule.</p>`}`;
  $('#cBack').onclick = goLobby;
  $$('#sCodex .tab').forEach(b => b.onclick = () => { Sfx.tap(); openCodex(b.dataset.t); });
  $$('#sCodex .cx[data-h]').forEach(b => b.onclick = () => { const id = b.dataset.h; if (!ownsHero(id)) { Sfx.bad(); const h = hero(id); toast(h.raid ? 'Win this one from a weekly raid boss.' : h.wild ? (h.cap ? 'This one only comes from capsules.' : `Find it in <b>${ZONES[h.zone].name}</b>.`) : 'Get this one in the shop or on the Star Road.'); return; } S.hero = id; persist(); Sfx.tap(); toast(`<b>${hero(id).name}</b> equipped. ${perkText(hero(id))}`); openCodex('chars'); });
}
