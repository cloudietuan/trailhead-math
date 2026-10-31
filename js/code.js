// Code Lab: robot puzzles (block coding) and real Lua (the language Roblox games use).

// ═════════════ Lua runner (fengari runs real Lua 5.3 in the browser) ═════════════
const Lua = (() => {
  const norm = s => s.replace(/(\d)\.0(?!\d)/g, '$1');
  const fmtNum = n => (Number.isInteger(n) ? String(n) : String(+n.toPrecision(14)));
  function friendly(e, userLines) {
    if (/STEPS/.test(e)) return { line: null, msg: 'Your code ran too long.', tip: 'Is there a loop that never ends? Check that your <b>while</b> loop changes something each time.' };
    if (/PRINTS/.test(e)) return { line: null, msg: 'Too much printing!', tip: 'Your code printed hundreds of lines. Check your loop numbers.' };
    const m = e.match(/^code:(\d+): ([\s\S]*)$/); let line = m ? +m[1] : null; const msg = m ? m[2] : e; let tip = ''; let mm;
    if (line && line > userLines) line = null;
    if ((mm = msg.match(/attempt to call a nil value \((?:global|field) '(\w+)'\)/))) tip = `Lua doesn't know anything called <b>${esc(mm[1])}</b>. Check the spelling (capital letters count!) and make sure you created it.`;
    else if ((mm = msg.match(/attempt to (?:perform arithmetic|concatenate|compare|index).*?\((?:global|local|field|upvalue) '(\w+)'\)/))) tip = `<b>${esc(mm[1])}</b> is empty (nil). Did you give it a value? Is it spelled the same way everywhere?`;
    else if (/nil/.test(msg)) tip = 'Something is empty (nil). Check that every variable has a value and is spelled the same everywhere.';
    else if (/'end' expected/.test(msg)) tip = 'Missing an <b>end</b>. Every <b>if</b>, <b>for</b>, <b>while</b> and <b>function</b> needs one.';
    else if (/'then' expected/.test(msg)) tip = 'An <b>if</b> line needs <b>then</b> at the end.';
    else if (/'do' expected/.test(msg)) tip = 'A <b>for</b> or <b>while</b> line needs <b>do</b> at the end.';
    else if (/unfinished string/.test(msg)) tip = 'A string is missing its closing quote mark <b>"</b>.';
    else if (/'=' expected/.test(msg)) tip = 'Lua expected an <b>=</b> here. Look for a typo. (Comparing? Use <b>==</b> inside an if.)';
    else if (/unexpected symbol|syntax error|near/.test(msg)) tip = 'Lua got confused here. Look for a typo, a missing quote, or a missing ( ).';
    return { line, msg, tip };
  }
  function run(code, test) {
    const F = window.fengari; if (!F) return { out: [], tout: [], err: { msg: 'The Lua engine did not load. Try refreshing the page.', tip: '' } };
    const { lua, lauxlib, lualib, to_luastring, to_jsstring } = F;
    const out = [], tout = []; let buf = out;
    const L = lauxlib.luaL_newstate(); lualib.luaL_openlibs(L);
    const str = (L, i) => { if (lua.lua_type(L, i) === lua.LUA_TNUMBER) return fmtNum(lua.lua_tonumber(L, i)); const s = to_jsstring(lauxlib.luaL_tolstring(L, i)); lua.lua_pop(L, 1); return s; };
    lua.lua_pushjsfunction(L, L => { const n = lua.lua_gettop(L), parts = []; for (let i = 1; i <= n; i++) parts.push(str(L, i)); buf.push(parts.join('   ')); if (out.length + tout.length > 400) lauxlib.luaL_error(L, to_luastring('PRINTS')); return 0; });
    lua.lua_setglobal(L, to_luastring('print'));
    lua.lua_pushjsfunction(L, () => { buf = tout; return 0; }); lua.lua_setglobal(L, to_luastring('__T'));
    lua.lua_sethook(L, L => lauxlib.luaL_error(L, to_luastring('STEPS')), lua.LUA_MASKCOUNT, 400000);
    const full = test ? code + '\n__T()\n' + test : code;
    let err = null;
    if (lauxlib.luaL_loadbuffer(L, to_luastring(full), null, to_luastring('=code')) !== lua.LUA_OK) err = to_jsstring(lua.lua_tostring(L, -1));
    else if (lua.lua_pcall(L, 0, 0, 0) !== lua.LUA_OK) { const e = lua.lua_tostring(L, -1); err = e ? to_jsstring(e) : 'Unknown error'; }
    return { out: out.map(norm), tout: tout.map(norm), err: err && friendly(err, code.split('\n').length) };
  }
  // Syntax highlighting for the editor
  function hl(src) {
    const re = /(--[^\n]*)|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|\b(local|function|end|if|then|else|elseif|for|do|while|return|and|or|not|nil|true|false|in|repeat|until|break)\b|\b(\d+(?:\.\d+)?)\b|\b(print|math|string|table|ipairs|pairs|tostring|tonumber|game|workspace)\b/g;
    let o = '', last = 0, m;
    while ((m = re.exec(src))) { o += esc(src.slice(last, m.index)); const c = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 'n' : 'b'; o += `<span class="t${c}">${esc(m[0])}</span>`; last = re.lastIndex; }
    return o + esc(src.slice(last)) + '\n';
  }
  return { run, hl, norm };
})();

// A code editor: textarea on top of a highlighted <pre>
function editor(el, code, onRun) {
  el.innerHTML = `<div class="ed"><pre class="hl" aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Code editor"></textarea></div>`;
  const ta = el.querySelector('textarea'), pre = el.querySelector('.hl');
  const sync = () => { pre.innerHTML = Lua.hl(ta.value); pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; const lines = ta.value.split('\n').length; ta.style.height = pre.style.height = Math.max(4, lines + 1) * 1.55 + 'em'; };
  ta.value = code; sync();
  // Line "end", "else", "elseif" and "until" up with the line that opened their block, like a real code editor
  const OPEN = /(\bthen|\bdo|\brepeat|function\s*[\w.:]*\s*\(.*\))\s*$/;
  const blockIndent = lines => { const st = []; lines.forEach(l => { const t = l.trim(); if (/^(end|until)\b/.test(t)) st.pop(); else if (OPEN.test(t) && !/^(else|elseif)\b/.test(t)) st.push(l.match(/^ */)[0].length); }); return st.length ? st[st.length - 1] : 0; };
  const realign = () => {
    const pos = ta.selectionStart, v = ta.value, ls = v.lastIndexOf('\n', pos - 1) + 1; let le = v.indexOf('\n', pos); if (le < 0) le = v.length;
    const line = v.slice(ls, le); if (!/^\s*(end|else|elseif|until)\b/.test(line)) return;
    const want = blockIndent(v.slice(0, Math.max(0, ls - 1)).split('\n')), have = line.match(/^ */)[0].length;
    if (want === have) return;
    ta.setSelectionRange(ls, ls + have); document.execCommand('insertText', false, ' '.repeat(want)); const np = pos + want - have; ta.setSelectionRange(np, np);
  };
  ta.addEventListener('input', e => { if (e.inputType === 'insertText' && /[def ]/.test(e.data || '')) realign(); sync(); });
  ta.addEventListener('scroll', sync);
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertText', false, '  '); }
    else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onRun && onRun(); }
    else if (e.key === 'Enter') {
      e.preventDefault(); realign();
      const pos = ta.selectionStart, v = ta.value, ls = v.lastIndexOf('\n', pos - 1) + 1, line = v.slice(ls, pos);
      let ind = line.match(/^\s*/)[0]; if (OPEN.test(line) || /\belse\s*$/.test(line)) ind += '  ';
      document.execCommand('insertText', false, '\n' + ind); sync();
    }
  });
  return { get: () => ta.value, set: v => { ta.value = v; sync(); }, focus: () => ta.focus() };
}
function consoleHTML(res, opts = {}) {
  const lines = [...res.out, ...(opts.showTest ? res.tout : [])];
  let s = lines.length ? lines.map(l => `<div>${esc(l) || '&nbsp;'}</div>`).join('') : (res.err ? '' : '<div class="dim">(nothing printed)</div>');
  if (res.err) s += `<div class="cerr"><b>${res.err.line ? `Line ${res.err.line}: ` : ''}${esc(res.err.msg)}</b>${res.err.tip ? `<br><span>${res.err.tip}</span>` : ''}</div>`;
  return s;
}
// "Try it" box used inside lessons
function luaTry(el, code, note) {
  el.innerHTML = `<div class="try"><div class="try-ed"></div><div class="row"><button class="btn small green run">▶ Run</button>${note ? `<span class="note">${note}</span>` : ''}</div><div class="console"><div class="ctitle">OUTPUT</div><div class="cbody"><div class="dim">Press Run to see what happens.</div></div></div></div>`;
  const ed = editor(el.querySelector('.try-ed'), code, () => go());
  const go = () => { const r = Lua.run(ed.get()); el.querySelector('.cbody').innerHTML = consoleHTML(r); Sfx.tap(); S.stats.lua++; questEvent('lua'); };
  el.querySelector('.run').onclick = go;
}

// Check a Lua challenge: required patterns, output, and function tests
function checkLua(ch, code) {
  const clean = x => String(x).trim().toLowerCase().replace(/\s+/g, ' ');
  const same = (got, exp) => got.length === exp.length && got.every((g, i) => clean(g) === clean(exp[i]));
  const show = a => `<code class="outc">${a.length ? a.map(esc).join('<br>') : '(nothing)'}</code>`;
  for (const [re, msg] of ch.need || []) if (!re.test(code)) return { pass: false, res: Lua.run(code), msg };
  if (ch.vary) {
    if (!ch.vary.re.test(code)) return { pass: false, res: Lua.run(code), msg: 'Keep the starting variable line at the top. We change its value to test your code.' };
    for (const [line, exp] of ch.vary.cases) {
      const r = Lua.run(code.replace(ch.vary.re, line));
      if (r.err) return { pass: false, res: r, msg: 'Your code has an error. Read the red message in the Output.' };
      if (!same(r.out, exp)) return { pass: false, res: Lua.run(code), msg: `We tested with <code>${esc(line.replace(/\n/g, ', '))}</code>. It should print ${show(exp)} but it printed ${show(r.out)}` };
    }
    return { pass: true, res: Lua.run(code) };
  }
  const r = Lua.run(code, ch.test);
  if (r.err) return { pass: false, res: r, msg: 'Your code has an error. Read the red message in the Output.' };
  const got = ch.test ? r.tout : r.out;
  if (!same(got, ch.expect)) return { pass: false, res: r, msg: `${ch.test ? 'We tested your function. ' : ''}Expected ${show(ch.expect)} but got ${show(got)}` };
  return { pass: true, res: r };
}

// ═════════════ Robot puzzles ═════════════
const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const BLOCKS = {
  F: { label: 'Forward', icon: '▲', cls: 'b-move' },
  L: { label: 'Turn left', icon: '↺', cls: 'b-turn' },
  R: { label: 'Turn right', icon: '↻', cls: 'b-turn' },
  P: { label: 'Grab gem', icon: '✋', cls: 'b-grab' },
  M: { label: 'Mine', icon: '⛏', cls: 'b-mine' },
  rep: { label: 'Repeat', icon: '🔁', cls: 'b-loop', box: true },
  ifg: { label: 'If on a gem', icon: '💎', cls: 'b-if', box: true },
  ifb: { label: 'If blocked ahead', icon: '🧱', cls: 'b-if', box: true },
  until: { label: 'Repeat until flag', icon: '🏁', cls: 'b-loop', box: true },
};
function parseMap(rows) {
  const W = { grid: [], gems: new Set(), goal: null, bot: null, w: rows[0].length, h: rows.length, got: 0 };
  rows.forEach((r, y) => { W.grid.push([...r].map((c, x) => {
    if ('^>v<'.includes(c)) W.bot = { x, y, d: '^>v<'.indexOf(c) };
    if (c === '*' || c === 'X') W.gems.add(x + ',' + y);
    if (c === 'G' || c === 'X') W.goal = { x, y };
    return c === '~' ? 'water' : c === '#' ? 'stone' : 'floor';
  })); });
  W.total = W.gems.size;
  return W;
}
const cellAt = (W, x, y) => (x < 0 || y < 0 || x >= W.w || y >= W.h ? 'edge' : W.grid[y][x]);
const ahead = W => ({ x: W.bot.x + DIRS[W.bot.d][0], y: W.bot.y + DIRS[W.bot.d][1] });
const blocked = W => { const a = ahead(W); return cellAt(W, a.x, a.y) !== 'floor'; };
const onGem = W => W.gems.has(W.bot.x + ',' + W.bot.y);
const atGoal = W => W.bot.x === W.goal.x && W.bot.y === W.goal.y;
function* execProg(nodes, base, W, ctr) {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i], p = base === '' ? '' + i : base + '.' + i;
    if (++ctr.n > 600) throw new Error('loop');
    if (n.op === 'rep') { for (let k = 0; k < n.n; k++) { yield { p, act: 'loop' }; yield* execProg(n.body, p, W, ctr); } }
    else if (n.op === 'until') { let g = 0; while (!atGoal(W)) { if (++g > 80) throw new Error('loop'); yield { p, act: 'loop' }; yield* execProg(n.body, p, W, ctr); } }
    else if (n.op === 'ifg') { const ok = onGem(W); yield { p, act: 'check', ok }; if (ok) yield* execProg(n.body, p, W, ctr); }
    else if (n.op === 'ifb') { const ok = blocked(W); yield { p, act: 'check', ok }; if (ok) yield* execProg(n.body, p, W, ctr); }
    else yield { p, act: n.op };
  }
}
function applyAct(W, act) {
  if (act === 'F') { const a = ahead(W), c = cellAt(W, a.x, a.y); if (c !== 'floor') return { crash: c === 'stone' ? 'Bonk! A stone block is in the way. Try Mine first.' : c === 'water' ? 'Splash! Robots can\'t swim.' : 'Bonk! That\'s the edge of the map.' }; W.bot.x = a.x; W.bot.y = a.y; return { moved: true }; }
  if (act === 'L') { W.bot.d = (W.bot.d + 3) % 4; return {}; }
  if (act === 'R') { W.bot.d = (W.bot.d + 1) % 4; return {}; }
  if (act === 'P') { const k = W.bot.x + ',' + W.bot.y; if (W.gems.has(k)) { W.gems.delete(k); W.got++; return { grab: k }; } return { note: 'Nothing to grab here.' }; }
  if (act === 'M') { const a = ahead(W); if (cellAt(W, a.x, a.y) === 'stone') { W.grid[a.y][a.x] = 'floor'; return { mined: a }; } return { note: 'Nothing to mine.' }; }
  return {};
}
const countBlocks = nodes => nodes.reduce((s, n) => s + 1 + (n.body ? countBlocks(n.body) : 0), 0);
const GEM_SVG = `<svg viewBox="0 0 40 40"><path d="M10 6 L30 6 L38 16 L20 36 L2 16 Z" fill="#FF6BD5" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M10 6 L15 16 L20 6 L25 16 L30 6 M2 16 L38 16 M15 16 L20 36 L25 16" fill="none" stroke="${INK}" stroke-width="2"/><path d="M12 9 L15 14 L7 14 Z" fill="#fff" opacity=".7"/></svg>`;
const FLAG_SVG = `<svg viewBox="0 0 40 40"><rect x="9" y="4" width="4" height="32" rx="2" fill="#E8ECFF" stroke="${INK}" stroke-width="2.5"/><path d="M13 6 L34 12 L13 20 Z" fill="#FFC93C" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="11" cy="36" rx="8" ry="3" fill="rgba(0,0,0,.25)"/></svg>`;

// Random layouts for "smart bot" puzzles, so the program has to really check
const randLine = (len, ch, p) => '>' + Array.from({ length: len }, () => (Math.random() < p ? ch : '.')).join('') + 'G';
const SPIRAL = ['>....', '~~~~.', '.G~~.', '.~~~.', '.....'];
function spiralGems() { const path = [[1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [3, 4], [2, 4], [1, 4], [0, 4], [0, 3], [0, 2]]; const m = SPIRAL.map(r => [...r]); let n = 0; path.forEach(([x, y]) => { if (Math.random() < 0.4) { m[y][x] = '*'; n++; } }); if (!n) m[4][2] = '*'; return m.map(r => r.join('')); }

// BotUI: board + block editor. opts: { tools, max, par, maps (array of map arrays), tip, boss }
function botPuzzle(el, pz, onDone) {
  let prog = [], cursor = 'root', running = false, W = null, world = null;
  const tools = pz.tools;
  const freshMaps = () => (pz.make ? Array.from({ length: 3 }, () => pz.make()) : [pz.map]);
  let maps = freshMaps();
  el.innerHTML = `<div class="botwrap">
    <div class="boardcol"><div class="board"></div><div class="botmsg" aria-live="polite"></div></div>
    <div class="progcol">
      <div class="pal">${tools.map(t => `<button class="blk ${BLOCKS[t].cls}" data-add="${t}"><i>${BLOCKS[t].icon}</i>${BLOCKS[t].label}</button>`).join('')}</div>
      <div class="progbox"><div class="ptitle"><span>YOUR PROGRAM</span><span class="cnt"></span></div><div class="inbar" hidden></div><div class="blocks" data-root="1"></div></div>
      <div class="row prow"><button class="btn green run">▶ Run</button><button class="btn ghost small reset">↺ Reset</button><button class="btn ghost small clear">Clear</button></div>
    </div></div>`;
  const board = el.querySelector('.board'), msg = el.querySelector('.botmsg');
  const say = (h, cls = '') => { msg.className = 'botmsg ' + cls; msg.innerHTML = h; };
  function drawBoard(Wd) {
    world = Wd;
    board.style.setProperty('--cols', Wd.w); board.style.setProperty('--rows', Wd.h);
    let s = '';
    for (let y = 0; y < Wd.h; y++) for (let x = 0; x < Wd.w; x++) s += `<div class="tile ${Wd.grid[y][x]} ${(x + y) % 2 ? 'alt' : ''}" data-xy="${x},${y}"></div>`;
    s += `<div class="flag" style="--x:${Wd.goal.x};--y:${Wd.goal.y}">${FLAG_SVG}</div>`;
    Wd.gems.forEach(k => { const [x, y] = k.split(','); s += `<div class="gem" data-g="${k}" style="--x:${x};--y:${y}">${GEM_SVG}</div>`; });
    s += `<div class="robot" style="--x:${Wd.bot.x};--y:${Wd.bot.y}"><div class="rface">${creature(hero(S.hero).look)}</div><div class="rdir" data-r="${Wd.bot.d * 90}" style="--r:${Wd.bot.d * 90}deg">▲</div></div>`;
    board.innerHTML = s;
  }
  function moveBot() { const r = board.querySelector('.robot'); r.style.setProperty('--x', world.bot.x); r.style.setProperty('--y', world.bot.y); const d = r.querySelector('.rdir'); const cur = parseFloat(d.dataset.r); let target = world.bot.d * 90; let diff = ((target - cur) % 360 + 540) % 360 - 180; d.dataset.r = cur + diff; d.style.setProperty('--r', (cur + diff) + 'deg'); }
  const getBody = path => { if (path === 'root') return prog; let n = null, arr = prog; path.split('.').forEach(i => { n = arr[+i]; arr = n.body; }); return n.body; };
  const nodeAt = path => { let n = null, arr = prog; path.split('.').forEach(i => { n = arr[+i]; arr = n && n.body; }); return n; };
  function nodeHTML(n, p) {
    const b = BLOCKS[n.op];
    if (!b.box) return `<div class="blk ${b.cls}" data-p="${p}"><i>${b.icon}</i>${b.label}<button class="x" data-del="${p}" aria-label="Delete">×</button></div>`;
    return `<div class="blk box ${b.cls} ${cursor === p ? 'sel' : ''}" data-p="${p}"><div class="bhead" data-sel="${p}"><i>${b.icon}</i>${b.label}${n.op === 'rep' ? ` <button class="nb" data-dec="${p}">−</button><b>${n.n}</b><button class="nb" data-inc="${p}">+</button> times` : ''}<button class="x" data-del="${p}" aria-label="Delete">×</button></div>
      <div class="bbody">${n.body.map((c, i) => nodeHTML(c, p + '.' + i)).join('')}${cursor === p ? '<div class="ins">new blocks go here</div>' : n.body.length ? '' : '<div class="empty">tap here, then add blocks</div>'}</div></div>`;
  }
  function drawProg() {
    const box = el.querySelector('.blocks');
    box.innerHTML = prog.map((n, i) => nodeHTML(n, '' + i)).join('') + (cursor === 'root' ? `<div class="ins">${prog.length ? 'new blocks go here' : 'Tap the blocks above to build your program'}</div>` : '');
    box.classList.toggle('sel', cursor === 'root');
    const ib = el.querySelector('.inbar'), cn = cursor !== 'root' && nodeAt(cursor);
    ib.hidden = !cn; if (cn) ib.innerHTML = `<span>Adding blocks inside <b>${BLOCKS[cn.op].icon} ${BLOCKS[cn.op].label}</b></span><button class="btn small cyan" data-out="1">Done with ${cn.op === 'rep' || cn.op === 'until' ? 'loop' : 'if'} ⤴</button>`;
    const c = countBlocks(prog);
    el.querySelector('.cnt').innerHTML = `Blocks <b class="${c > pz.max ? 'over' : ''}">${c}</b> / ${pz.max} · Par ${pz.par}`;
  }
  el.querySelector('.pal').onclick = e => {
    const b = e.target.closest('[data-add]'); if (!b || running) return;
    if (countBlocks(prog) >= pz.max) { say(`You can only use <b>${pz.max}</b> blocks here. ${tools.includes('rep') ? 'Try a Repeat loop to do more with fewer blocks!' : ''}`, 'warn'); Sfx.bad(); return; }
    const op = b.dataset.add, n = { op }; if (BLOCKS[op].box) { n.body = []; if (op === 'rep') n.n = 3; }
    const body = getBody(cursor); body.push(n);
    if (BLOCKS[op].box) cursor = cursor === 'root' ? '' + (body.length - 1) : cursor + '.' + (body.length - 1);
    Sfx.tap(); drawProg(); resetWorld();
  };
  el.querySelector('.inbar').onclick = e => { if (!e.target.closest('[data-out]') || running) return; cursor = cursor.includes('.') ? cursor.split('.').slice(0, -1).join('.') : 'root'; Sfx.tap(); drawProg(); };
  el.querySelector('.blocks').onclick = e => {
    if (running) return;
    const del = e.target.closest('[data-del]'), inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), sel = e.target.closest('[data-sel]');
    if (del) { const p = del.dataset.del, parts = p.split('.'), idx = +parts.pop(), parent = parts.length ? parts.join('.') : 'root'; getBody(parent).splice(idx, 1); cursor = parent; if (cursor !== 'root' && !nodeAt(cursor)) cursor = 'root'; Sfx.tap(); drawProg(); resetWorld(); return; }
    if (inc || dec) { const n = nodeAt((inc || dec).dataset[inc ? 'inc' : 'dec']); n.n = Math.max(1, Math.min(12, n.n + (inc ? 1 : -1))); Sfx.tap(); drawProg(); resetWorld(); return; }
    if (sel) { const p = sel.dataset.sel; cursor = cursor === p ? (p.includes('.') ? p.split('.').slice(0, -1).join('.') : 'root') : p; Sfx.tap(); drawProg(); return; }
    if (e.target.closest('.blocks') && !e.target.closest('.blk')) { cursor = 'root'; drawProg(); }
  };
  function resetWorld() { W = parseMap(maps[0]); drawBoard(W); el.querySelectorAll('.blk.run').forEach(b => b.classList.remove('run')); say(pz.tip || 'Build a program, then press Run.'); }
  el.querySelector('.reset').onclick = () => { if (!running) { if (pz.make) maps = freshMaps(); resetWorld(); } };
  el.querySelector('.clear').onclick = () => { if (!running) { prog = []; cursor = 'root'; drawProg(); resetWorld(); } };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function runOn(map, speed, label) {
    W = parseMap(map); drawBoard(W); await wait(150);
    const it = execProg(prog, '', W, { n: 0 });
    let steps = 0;
    try {
      for (const st of it) {
        if (!el.isConnected) return { stop: true };
        el.querySelectorAll('.blk.run').forEach(b => b.classList.remove('run'));
        const be = el.querySelector(`.blocks [data-p="${st.p}"]`); if (be) be.classList.add('run');
        if (st.act === 'loop') { await wait(speed * 0.25); continue; }
        if (st.act === 'check') { if (be) { be.classList.add(st.ok ? 'yes' : 'no'); setTimeout(() => be.classList.remove('yes', 'no'), speed); } await wait(speed * 0.5); continue; }
        const r = applyAct(W, st.act); steps++;
        if (r.crash) { moveBot(); board.querySelector('.robot').classList.add('bonk'); Sfx.bad(); return { fail: r.crash }; }
        if (r.grab) { const g = board.querySelector(`[data-g="${r.grab}"]`); if (g) g.classList.add('got'); Sfx.coin(); }
        else if (r.mined) { const t = board.querySelector(`[data-xy="${r.mined.x},${r.mined.y}"]`); if (t) { t.className = 'tile floor mined'; } Sfx.hit(); }
        else Sfx.step();
        moveBot(); await wait(speed);
      }
    } catch (e) { return { fail: 'Your robot got stuck in a loop that never reaches the flag!' }; }
    if (!atGoal(W)) return { fail: steps ? 'Your robot stopped before reaching the flag.' : 'Your program is empty. Add some blocks!' };
    if (W.gems.size) return { fail: `You missed ${W.gems.size} gem${W.gems.size > 1 ? 's' : ''}! Grab every gem before the flag.` };
    return { win: true };
  }
  el.querySelector('.run').onclick = async () => {
    if (running) return; if (!prog.length) { say('Add some blocks first!', 'warn'); return; }
    running = true; el.classList.add('running'); S.stats.bot++;
    let res;
    for (let i = 0; i < maps.length; i++) {
      if (maps.length > 1) say(`Test ${i + 1} of ${maps.length}${i ? ': a new random layout!' : ''}`);
      res = await runOn(maps[i], i ? 170 : 330);
      if (res.stop) return;
      if (!res.win) break;
      if (i < maps.length - 1) await new Promise(r => setTimeout(r, 450));
    }
    running = false; el.classList.remove('running');
    const blocks = countBlocks(prog);
    if (res.win) { say(`<b>Solved!</b> ${blocks <= pz.par ? `${blocks} blocks, that's par or better!` : `${blocks} blocks. Par is ${pz.par}. Can you do it in fewer?`}`, 'good'); Sfx.good(); questEvent('bot'); onDone({ win: true, blocks, par: blocks <= pz.par }); }
    else { say(res.fail, 'bad'); onDone({ win: false, msg: res.fail }); if (pz.make) maps = freshMaps(); }
  };
  drawProg(); resetWorld();
}

// ═════════════ Predict-the-output questions (checked by really running the Lua) ═════════════
const WORDS = ['sword', 'shield', 'potion', 'map', 'torch', 'gem', 'key', 'bow', 'helmet', 'rope'];
const NAMES_CODE = ['Max', 'Ava', 'Kai', 'Zoe', 'Leo', 'Mia'];
const LUAQ = {
  basics: [
    () => { const a = R(2, 9), b = R(2, 9), c = R(2, 5); return { code: `local a = ${a}\nlocal b = ${b}\nprint(a + b * ${c})`, alts: [`print((${a} + ${b}) * ${c})`, `print(${a} * ${c} + ${b})`, `print(${a + b + c})`] }; },
    () => { const a = R(10, 40), b = R(2, 9); return { code: `local coins = ${a}\ncoins = coins - ${b}\ncoins = coins * 2\nprint(coins)`, alts: [`print(${a} - ${b} * 2)`, `print(${a} - ${b})`, `print(${(a - b) * 2 + 2})`] }; },
    () => { const n = pick(NAMES_CODE); return { code: `local name = "${n}"\nprint("GG " .. name .. "!")`, alts: [`print("GG name!")`, `print("GG ${n}")`, `print("GG .. name .. !")`] }; },
    () => { const a = R(2, 9), b = R(10, 20); return { code: `local x = ${a}\nlocal y = x\nx = ${b}\nprint(y)`, alts: [`print(${b})`, `print("y")`, `print(${a + b})`] }; },
    () => { const a = R(2, 9), b = R(2, 9); return { code: `print(${a} .. ${b})`, alts: [`print(${a + b})`, `print("${a} .. ${b}")`, `print(${a * b})`] }; },
    () => { const a = R(3, 9); return { code: `local level = ${a}\nlevel = level + 1\nlevel = level + 1\nprint("Level " .. level)`, alts: [`print("Level ${a + 1}")`, `print("Level ${a}")`, `print("Level level")`] }; },
  ],
  ifs: [
    () => { const h = R(5, 100); return { code: `local hp = ${h}\nif hp > 50 then\n  print("Healthy")\nelseif hp > 20 then\n  print("Hurt")\nelse\n  print("Danger")\nend`, alts: ['print("Healthy")', 'print("Hurt")', 'print("Danger")', 'print("Healthy")\nprint("Hurt")'] }; },
    () => { const a = R(1, 5), b = R(0, 1) ? a : R(1, 5); return { code: `local a = ${a}\nlocal b = ${b}\nif a == b then\n  print("same")\nelse\n  print("different")\nend`, alts: ['print("same")', 'print("different")', 'print("same")\nprint("different")'] }; },
    () => { const c = pick([40, 80, 120, 150]), l = R(2, 8); return { code: `local coins = ${c}\nlocal level = ${l}\nif coins >= 100 and level >= 5 then\n  print("Unlocked!")\nelse\n  print("Locked")\nend`, alts: ['print("Unlocked!")', 'print("Locked")', 'print("Unlocked!")\nprint("Locked")'] }; },
    () => { const x = R(1, 6), y = R(0, 1) ? x : R(1, 6); return { code: `local x = ${x}\nif x ~= ${y} then\n  print("yes")\nelse\n  print("no")\nend`, alts: ['print("yes")', 'print("no")', 'print("yes")\nprint("no")'] }; },
    () => { const s = R(0, 30); return { code: `local score = ${s}\nif score >= 20 or score == 0 then\n  print("Special")\nend\nprint("Done")`, alts: ['print("Special")\nprint("Done")', 'print("Done")', 'print("Special")'] }; },
  ],
  loops: [
    () => { const n = R(3, 5), k = R(2, 5); return { code: `for i = 1, ${n} do\n  print(i * ${k})\nend`, alts: [`for i = 1, ${n - 1} do print(i * ${k}) end`, `for i = 0, ${n} do print(i * ${k}) end`, `for i = 1, ${n} do print(i + ${k}) end`] }; },
    () => { const n = R(4, 10); return { code: `local total = 0\nfor i = 1, ${n} do\n  total = total + i\nend\nprint(total)`, alts: [`print(${n})`, `print(${n * (n + 1) / 2 - n})`, `print(${n * (n + 1) / 2 + n + 1})`] }; },
    () => { const a = pick([2, 3, 5]), b = a * R(4, 6), st = a; return { code: `local count = 0\nfor i = ${a}, ${b}, ${st} do\n  count = count + 1\nend\nprint(count)`, alts: [`print(${b / st - 1})`, `print(${b})`, `print(${b - a})`] }; },
    () => { const b = R(2, 4), a = b * R(2, 4) + R(0, b - 1); return { code: `local n = ${a}\nwhile n >= ${b} do\n  n = n - ${b}\nend\nprint(n)`, alts: [`print(0)`, `print(${a - b})`, `print(${b})`] }; },
    () => { const s = R(3, 5); return { code: `for i = ${s}, 1, -1 do\n  print(i)\nend\nprint("GO!")`, alts: [`for i = 1, ${s} do print(i) end print("GO!")`, `for i = ${s}, 0, -1 do print(i) end print("GO!")`, `print("GO!")`] }; },
  ],
  funcs: [
    () => { const a = R(2, 5), b = R(1, 9), c = R(2, 6); return { code: `local function f(x)\n  return x * ${a} + ${b}\nend\nprint(f(${c}))`, alts: [`print(${c * (a + b)})`, `print(${c + a + b})`, `print(${c * a})`] }; },
    () => { const a = R(1, 20), b = R(1, 20); return { code: `local function biggest(a, b)\n  if a > b then\n    return a\n  else\n    return b\n  end\nend\nprint(biggest(${a}, ${b}))`, alts: [`print(${Math.min(a, b)})`, `print(${a + b})`, `print("a")`] }; },
    () => { const a = R(2, 6); return { code: `local function twice(x)\n  return x * 2\nend\nprint(twice(twice(${a})))`, alts: [`print(${a * 2})`, `print(${a * 8})`, `print(${a + 4})`] }; },
    () => { const n = pick(NAMES_CODE); return { code: `local function greet(name)\n  return "Hi, " .. name\nend\nlocal msg = greet("${n}")\nprint(msg .. "!")`, alts: [`print("Hi, ${n}")`, `print("Hi, name!")`, `print("greet(${n})!")`] }; },
    () => { const d = R(5, 30), a = R(2, 40); return { code: `local function damage(power, armor)\n  local d = power - armor\n  if d < 0 then\n    d = 0\n  end\n  return d\nend\nprint(damage(${d}, ${a}))`, alts: [`print(${d - a})`, `print(${d + a})`, `print(${Math.max(0, a - d) || 1})`] }; },
  ],
  tables: [
    () => { const w = shuffle(WORDS).slice(0, R(3, 5)); return { code: `local items = {${w.map(x => `"${x}"`).join(', ')}}\nprint(#items)`, alts: [`print(${w.length - 1})`, `print(${w.length + 1})`, `print("items")`] }; },
    () => { const w = shuffle(WORDS).slice(0, 4), k = R(1, 3); return { code: `local items = {${w.map(x => `"${x}"`).join(', ')}}\nprint(items[${k}])`, alts: [`print("${w[k]}")`, `print("${w[k - 1 === 0 ? 3 : k - 2]}")`, 'print("nil")'] }; },
    () => { const a = R(5, 50), b = R(5, 25); return { code: `local player = {name = "${pick(NAMES_CODE)}", coins = ${a}}\nplayer.coins = player.coins + ${b}\nprint(player.coins)`, alts: [`print(${a})`, `print(${b})`, `print(${a + b + 1})`] }; },
    () => { const v = [R(1, 9), R(1, 9), R(1, 9)]; return { code: `local nums = {${v.join(', ')}}\nlocal sum = 0\nfor i = 1, #nums do\n  sum = sum + nums[i]\nend\nprint(sum)`, alts: [`print(${v[0] + v[1]})`, `print(${v.length})`, `print(${v[0] + v[1] + v[2] + v[2]})`] }; },
    () => { const n = pick(NAMES_CODE), h = R(20, 90); return { code: `local p = {name = "${n}", health = ${h}}\np.health = p.health - 30\nif p.health <= 0 then\n  print(p.name .. " is out!")\nelse\n  print(p.name .. " has " .. p.health)\nend`, alts: [`print("${n} is out!")`, `print("${n} has ${h}")`, `print("p.name has ${h - 30}")`] }; },
  ],
};
function luaQuestion(pools) {
  for (let tries = 0; tries < 8; tries++) {
    const t = pick(LUAQ[pick(pools)])(), r = Lua.run(t.code); if (r.err) continue;
    const right = r.out.join('\n');
    const wrongs = [];
    for (const a of shuffle(t.alts)) { const o = Lua.run(a); if (!o.err) { const s = o.out.join('\n'); if (s !== right && !wrongs.includes(s)) wrongs.push(s); } if (wrongs.length === 3) break; }
    if (wrongs.length < 2) wrongs.push(right === 'nil' ? 'Error' : 'nil');
    const fmt = s => `<code class="outc">${s.split('\n').map(esc).join('<br>')}</code>`;
    return choice(`What does this code print?<pre class="codeq">${Lua.hl(t.code)}</pre>`, fmt(right), wrongs.slice(0, 3).map(fmt), `It prints:<br>${fmt(right)}`, 'Read it top to bottom, one line at a time. Keep track of each variable\'s value.', { code: true });
  }
}

// ═════════════ Code Lab levels ═════════════
const CODE = [
{ id: 'bot1', name: 'Robot Moves', title: 'Sequences', kind: 'bot', std: 'Algorithms',
  boss: { name: 'Bonk Bot', look: { color: '#B9C4D6', eyes: 'angry', mouth: 'teeth', acc: 'antenna' }, taunt: 'BEEP. Your robot will bonk into EVERYTHING. BEEP BOOP.' },
  lesson: [
    { t: 'Robots follow instructions exactly', html: `<p>A <b>program</b> is a list of instructions. A robot does them <b>in order, exactly as written</b>. It can't guess what you meant!</p><p>Your robot knows these blocks:</p><ul><li><b>▲ Forward</b>: move one tile in the direction it faces</li><li><b>↺ Turn left</b> / <b>↻ Turn right</b>: turn in place (it does not move)</li><li><b>✋ Grab gem</b>: pick up a gem on the tile it's standing on</li></ul><p>The little arrow shows which way your robot faces. Turning is from the <b>robot's</b> point of view, not yours.</p>`,
      check: choice('Your robot faces <b>right</b>. It does <b>Turn left</b>. Which way does it face now?', 'Up', ['Down', 'Left', 'Still right']), why: '' },
    { t: 'Bugs and debugging', html: `<p>A mistake in a program is called a <b>bug</b>. Finding and fixing it is <b>debugging</b>. Every coder, even pros, writes bugs all the time.</p><p>Debugging tips:</p><ol><li>Run it and watch where it goes wrong.</li><li>Pretend you're the robot. Follow each block with your finger.</li><li>Fix one thing, then run again.</li></ol>`,
      check: choice('Your robot crashed into a wall on block 3. What\'s the best first move?', 'Look at what happens right before block 3', ['Delete the whole program', 'Add more Forward blocks at the end', 'Give up']), why: '' },
  ],
  puzzles: [
    { map: ['~~~~~~', '>....G', '~~~~~~'], tools: ['F', 'L', 'R'], max: 8, par: 5, tip: 'Get to the flag!' },
    { map: ['.....', '>..~.', '~~.~.', '~~..G'], tools: ['F', 'L', 'R'], max: 12, par: 8, tip: 'You\'ll need to turn. Remember: turn from the robot\'s point of view.' },
    { map: ['~~~~~~', '>*.*.G', '~~~~~~'], tools: ['F', 'L', 'R', 'P'], max: 10, par: 7, tip: 'Grab both gems, then reach the flag.' },
    { map: ['>..*', '~~~.', 'G...'], tools: ['F', 'L', 'R', 'P'], max: 14, par: 11, tip: 'Grab the gem, then make the U-turn.' },
  ],
  bossPuzzle: { map: ['>.*..', '~~~~.', 'G.*..'], tools: ['F', 'L', 'R', 'P'], max: 16, par: 14, tip: 'BOSS: grab both gems and reach the flag. 3 hearts. Each failed run costs one!' } },

{ id: 'bot2', name: 'Loop Power', title: 'Loops', kind: 'bot', std: 'Loops',
  boss: { name: 'Loop Goop', look: { color: '#7CF06B', eyes: 'three', mouth: 'o', acc: 'sprout' }, taunt: 'I repeat myself. I repeat myself. I repeat myself.' },
  lesson: [
    { t: 'Repeat yourself (the smart way)', html: `<p>Need to do the same thing many times? Don't stack 9 Forward blocks. Use a <b>loop</b>!</p><p class="eq">🔁 Repeat 9 times: ▲ Forward</p><p>That's 2 blocks instead of 9. Loops are one of the most powerful ideas in coding. Every game uses them.</p><p><b>How to use it:</b> tap <b>Repeat</b>, then the blocks you tap next go <b>inside</b> the loop (look for the glowing line). Tap the loop's header to step back out.</p>`,
      check: choice('How many blocks does <b>Repeat 5 times: [Forward, Turn right]</b> use?', '3', ['10', '5', '7']), why: '' },
    { t: 'Find the pattern', html: `<p>The trick to loops is spotting the <b>pattern</b>. A staircase is "forward, turn, forward, turn back" over and over.</p><p>Watch the <b>Par</b> number. That's the fewest blocks we found. Beat par to earn 3 stars!</p><p>Loops can even go <b>inside</b> other loops. That's called <b>nesting</b>.</p>`,
      check: choice('A robot must walk a square path, 4 sides of 3 steps. Which is shortest?', 'Repeat 4: [Repeat 3: Forward, Turn right]', ['Forward ×12 and 4 turns', 'Repeat 12: Forward', 'Repeat 3: Turn right']), why: '' },
  ],
  puzzles: [
    { map: ['~~~~~~~~~~~', '>.........G', '~~~~~~~~~~~'], tools: ['F', 'L', 'R', 'rep'], max: 3, par: 2, tip: 'Only 3 blocks allowed! Use a Repeat.' },
    { map: ['~~~~~~~', '>*.*.*G', '~~~~~~~'], tools: ['F', 'L', 'R', 'P', 'rep'], max: 5, par: 4, tip: 'Spot the pattern: step, grab, step...' },
    { map: ['>.~~~~', '~..~~~', '~~..~~', '~~~..~', '~~~~.G'], tools: ['F', 'L', 'R', 'rep'], max: 7, par: 6, tip: 'A staircase! What\'s the pattern for one step?' },
    { map: ['*..*', '.~~.', '.~~.', '^~~X'], tools: ['F', 'L', 'R', 'P', 'rep'], max: 7, par: 5, tip: 'Grab the 3 corner gems and end on the flag. Try a loop inside a loop!' },
  ],
  bossPuzzle: { map: ['>.~~~~', '~*.~~~', '~~*.~~', '~~~*.~', '~~~~*G'], tools: ['F', 'L', 'R', 'P', 'rep'], max: 8, par: 7, tip: 'BOSS: a gem on every stair. 3 hearts!' } },

{ id: 'bot3', name: 'Smart Bot', title: 'If Statements', kind: 'bot', std: 'Conditionals',
  boss: { name: 'Glitch Golem', look: { color: '#8E8CA8', eyes: 'one', mouth: 'teeth', acc: 'spikes', spots: true }, taunt: 'I scramble the map every time. Your robot will never know what\'s coming!' },
  lesson: [
    { t: 'Robots that decide', html: `<p>In these puzzles, the gems and stones land in <b>random</b> places, and we test your program on <b>3 different layouts</b>. You can't just memorize one map!</p><p>So your robot needs to <b>check</b> and <b>decide</b>. That's an <b>if</b> block:</p><ul><li><b>💎 If on a gem</b>: do the blocks inside only when standing on a gem</li><li><b>🧱 If blocked ahead</b>: do the blocks inside only when something is in front</li><li><b>⛏ Mine</b>: break the stone block in front of you</li></ul>`,
      check: choice('Your loop runs: <b>Forward, If on a gem: [Grab gem]</b>. On a tile with no gem, what happens?', 'The robot skips Grab and keeps going', ['The robot crashes', 'The robot grabs anyway', 'The program stops']), why: '' },
    { t: 'Repeat until...', html: `<p><b>🏁 Repeat until flag</b> keeps looping until the robot reaches the flag. You don't need to know how many steps!</p><p>Mix it with <b>If blocked ahead: Turn right</b> and your robot can follow a twisty path all by itself. This is how real robots and game characters find their way.</p>`,
      check: choice('What goes wrong if a "Repeat until flag" loop never moves the robot?', 'It loops forever', ['Nothing', 'It skips the loop', 'It moves anyway']), why: '' },
  ],
  puzzles: [
    { make: () => ['~~~~~~~~~~', randLine(8, '*', 0.45), '~~~~~~~~~~'], tools: ['F', 'P', 'rep', 'ifg'], max: 5, par: 4, tip: 'The gems move every test! Check for a gem on each tile.' },
    { make: () => ['~~~~~~~~~', randLine(7, '#', 0.45), '~~~~~~~~~'], tools: ['F', 'M', 'rep', 'ifb'], max: 5, par: 4, tip: 'Stones pop up in random spots. Mine only when something blocks you.' },
    { map: SPIRAL, tools: ['F', 'L', 'R', 'ifb', 'until'], max: 5, par: 4, tip: 'A spiral! Keep going until the flag. Turn whenever you\'re blocked.' },
    { make: () => ['~~~~~~~~~~', '>' + Array.from({ length: 8 }, () => pick(['.', '.', '*', '#'])).join('') + 'G', '~~~~~~~~~~'], tools: ['F', 'P', 'M', 'ifg', 'ifb', 'until'], max: 7, par: 6, tip: 'Gems AND stones, all random. Mine, step, grab... until the flag.' },
  ],
  bossPuzzle: { make: spiralGems, tools: ['F', 'L', 'R', 'P', 'ifg', 'ifb', 'until'], max: 8, par: 6, tip: 'BOSS: a spiral with random gems. 3 hearts!' } },

// ── Lua levels ──
{ id: 'lua1', name: 'Hello, Lua', title: 'Print & Variables', kind: 'lua', std: 'Variables', pool: ['basics'],
  boss: { name: 'Syntax Snake', look: { color: '#5BE36B', eyes: 'angry', mouth: 'fangs', acc: 'horns' }, taunt: 'Ssssay goodbye! One missing quote and your code is MINE.' },
  lesson: [
    { t: 'Meet Lua', html: `<p><b>Lua</b> is a real programming language. A version of it called <b>Luau</b> runs every game on Roblox, so everything you learn here works in Roblox Studio.</p><p>Code runs <b>top to bottom</b>, one line at a time. <code>print</code> shows text in the Output window. Text goes inside quotes.</p><p>Edit the code below and press Run. Try changing the words!</p>`,
      try: 'print("Hello, world!")\nprint("I am learning Lua")' },
    { t: 'Variables', html: `<p>A <b>variable</b> is a box with a name that holds a value. <code>local</code> creates a new one.</p><p><code>coins = coins + 5</code> means "take what's in coins, add 5, put it back."</p><p>Lines that start with <code>--</code> are <b>comments</b>. Lua ignores them. They're notes for humans.</p>`,
      try: '-- Make a variable\nlocal coins = 10\nprint(coins)\n\n-- Change it\ncoins = coins + 5\nprint(coins)',
      check: choice(`What does this print?<pre class="codeq">${Lua.hl('local gems = 3\ngems = gems + 4\nprint(gems)')}</pre>`, '7', ['3', '4', 'gems + 4']), why: '' },
    { t: 'Strings and math', html: `<p>Text in quotes is called a <b>string</b>. Join strings with two dots <code>..</code></p><p>Math works like you'd expect: <code>+ - * /</code>. And <code>^</code> is an exponent, just like in Math Arena!</p>`,
      try: 'local name = "Max"\nlocal level = 7\nprint("Player: " .. name)\nprint("Next level: " .. level + 1)\nprint(2 ^ 5)' },
  ],
  challenges: [
    { title: 'Battle cry', prompt: 'Make your program print exactly: <code>Ready to brawl!</code>', start: '-- Write your code below\n', expect: ['Ready to brawl!'], hint: 'Use print with the words in quotes: print("...")', solution: 'print("Ready to brawl!")' },
    { title: 'Coin counter', prompt: 'Make a variable <code>coins</code> that starts at <b>50</b>. Then add <b>25</b> to it with <code>coins = coins + 25</code>. Then print it.', start: 'local coins = 50\n', expect: ['75'], need: [[/coins\s*=\s*coins\s*\+/, 'Use <code>coins = coins + 25</code> to change the variable.']], hint: 'Line 2: coins = coins + 25. Line 3: print(coins)', solution: 'local coins = 50\ncoins = coins + 25\nprint(coins)' },
    { title: 'Name tag', prompt: 'Use <code>..</code> to join strings and print <code>Welcome, Max!</code> using the <code>player</code> variable.', start: 'local player = "Max"\n', expect: ['Welcome, Max!'], need: [[/\.\.\s*player|player\s*\.\./, 'Use the <code>player</code> variable with <code>..</code> instead of typing Max yourself.']], hint: 'print("Welcome, " .. player .. "!")', solution: 'local player = "Max"\nprint("Welcome, " .. player .. "!")' },
  ] },

{ id: 'lua2', name: 'If This, Then That', title: 'If Statements', kind: 'lua', std: 'Conditionals', pool: ['ifs', 'basics'],
  boss: { name: 'Iffy the Imp', look: { color: '#FF4F7B', eyes: 'big', mouth: 'grin', acc: 'horns' }, taunt: 'IF you beat me THEN I\'ll leave. ELSE... you lose!' },
  lesson: [
    { t: 'if ... then ... end', html: `<p>An <b>if</b> runs code only when something is true. Just like the robot's If blocks!</p><p>Change <code>coins</code> to 30 and run it again.</p>`, try: 'local coins = 120\n\nif coins >= 100 then\n  print("You can buy the skin!")\nend\n\nprint("Done shopping")' },
    { t: 'else and elseif', html: `<p><code>else</code> runs when the if is false. <code>elseif</code> checks another condition.</p><table class="rt words"><tr><td><code>==</code></td><td>equal to</td></tr><tr><td><code>~=</code></td><td>NOT equal to (in Lua!)</td></tr><tr><td><code>&lt;  &gt;</code></td><td>less than, greater than</td></tr><tr><td><code>&lt;=  &gt;=</code></td><td>or equal to</td></tr></table><p>Careful: <code>=</code> puts a value in a variable. <code>==</code> compares two values.</p>`, try: 'local health = 40\n\nif health > 70 then\n  print("Feeling great")\nelseif health > 25 then\n  print("Ouch, find a potion")\nelse\n  print("DANGER!")\nend' },
    { t: 'and, or, not', html: `<ul><li><code>and</code>: both must be true</li><li><code>or</code>: at least one must be true</li><li><code>not</code>: flips true and false</li></ul>`, try: 'local level = 6\nlocal hasKey = true\n\nif level >= 5 and hasKey then\n  print("The door opens!")\nelse\n  print("Locked.")\nend',
      check: choice(`What does this print?<pre class="codeq">${Lua.hl('local hp = 0\nif hp > 0 or hp == 0 then\n  print("A")\nelse\n  print("B")\nend')}</pre>`, 'A', ['B', 'A and B', 'Nothing']), why: '' },
  ],
  challenges: [
    { title: 'Shop check', prompt: 'If <code>coins</code> is <b>100 or more</b>, print <code>Buy it!</code>. Otherwise print <code>Keep saving</code>. (We\'ll test it with different coin amounts.)', start: 'local coins = 120\n\n', vary: { re: /local\s+coins\s*=\s*-?\d+/, cases: [['local coins = 120', ['Buy it!']], ['local coins = 100', ['Buy it!']], ['local coins = 40', ['Keep saving']]] }, hint: 'if coins >= 100 then ... else ... end', solution: 'local coins = 120\n\nif coins >= 100 then\n  print("Buy it!")\nelse\n  print("Keep saving")\nend' },
    { title: 'Health bar', prompt: 'Print <code>Full</code> if <code>health</code> is exactly 100, <code>Hurt</code> if it\'s more than 25, and <code>Danger!</code> otherwise.', start: 'local health = 30\n\n', vary: { re: /local\s+health\s*=\s*-?\d+/, cases: [['local health = 100', ['Full']], ['local health = 30', ['Hurt']], ['local health = 10', ['Danger!']]] }, hint: 'Use if, elseif and else. Use == to check for exactly 100.', solution: 'local health = 30\n\nif health == 100 then\n  print("Full")\nelseif health > 25 then\n  print("Hurt")\nelse\n  print("Danger!")\nend' },
    { title: 'Secret door', prompt: 'Print <code>Door opens</code> only if <code>hasKey</code> is true <b>and</b> <code>level</code> is 5 or more. Otherwise print <code>Locked</code>.', start: 'local hasKey = true\nlocal level = 7\n\n', vary: { re: /local\s+hasKey\s*=\s*\w+\s*\n\s*local\s+level\s*=\s*-?\d+/, cases: [['local hasKey = true\nlocal level = 7', ['Door opens']], ['local hasKey = false\nlocal level = 9', ['Locked']], ['local hasKey = true\nlocal level = 3', ['Locked']]] }, hint: 'if hasKey and level >= 5 then', solution: 'local hasKey = true\nlocal level = 7\n\nif hasKey and level >= 5 then\n  print("Door opens")\nelse\n  print("Locked")\nend' },
  ] },

{ id: 'lua3', name: 'Loop Lab', title: 'For & While Loops', kind: 'lua', std: 'Loops', pool: ['loops', 'ifs'],
  boss: { name: 'Infinite Ike', look: { color: '#A070FF', eyes: 'sleepy', mouth: 'o', acc: 'goggles' }, taunt: 'I just keep going and going and going and going and going and...' },
  lesson: [
    { t: 'for loops', html: `<p>A <code>for</code> loop is the Lua version of the robot's Repeat block. <code>i</code> counts up each time.</p><p class="eq">for i = <b>start</b>, <b>stop</b> do ... end</p>`, try: 'for i = 1, 5 do\n  print("Jump number " .. i)\nend' },
    { t: 'Counting by steps', html: `<p>Add a third number to count by steps. Use a negative step to count down!</p>`, try: '-- Count by 2s\nfor i = 2, 10, 2 do\n  print(i)\nend\n\n-- Countdown\nfor i = 3, 1, -1 do\n  print(i)\nend\nprint("Blast off!")',
      check: choice(`How many lines does this print?<pre class="codeq">${Lua.hl('for i = 5, 15, 5 do\n  print(i)\nend')}</pre>`, '3', ['15', '10', '2']), why: '' },
    { t: 'Adding up, and while loops', html: `<p>A loop can build up a total, like collecting coins each round.</p><p>A <code>while</code> loop repeats <b>while</b> something is true. Make sure something changes, or it will loop forever!</p>`, try: 'local total = 0\nfor round = 1, 10 do\n  total = total + round\nend\nprint("Total coins: " .. total)\n\nlocal hp = 50\nwhile hp > 0 do\n  hp = hp - 20\n  print("Hit! HP is " .. hp)\nend' },
  ],
  challenges: [
    { title: 'Countdown', prompt: 'Use a loop to print <code>5</code>, <code>4</code>, <code>3</code>, <code>2</code>, <code>1</code> on separate lines, then <code>GO!</code>', start: '', expect: ['5', '4', '3', '2', '1', 'GO!'], need: [[/\bfor\b|\bwhile\b/, 'Use a loop! Don\'t write 5 print lines.']], hint: 'for i = 5, 1, -1 do ... end, then print("GO!") after the loop.', solution: 'for i = 5, 1, -1 do\n  print(i)\nend\nprint("GO!")' },
    { title: 'Even steps', prompt: 'Print every even number from <b>2 to 20</b>, one per line.', start: '', expect: ['2', '4', '6', '8', '10', '12', '14', '16', '18', '20'], need: [[/\bfor\b|\bwhile\b/, 'Use a loop!']], hint: 'Count by 2s: for i = 2, 20, 2 do', solution: 'for i = 2, 20, 2 do\n  print(i)\nend' },
    { title: 'Coin rain', prompt: 'In round 1 you get 1 coin, round 2 gets 2 coins, all the way to round <b>50</b>. Use a loop to add them all up, then print the total.', start: 'local total = 0\n\n', expect: ['1275'], need: [[/\bfor\b|\bwhile\b/, 'Use a loop to add them up.']], hint: 'Inside the loop: total = total + i. Print after the loop ends.', solution: 'local total = 0\n\nfor i = 1, 50 do\n  total = total + i\nend\nprint(total)' },
  ] },

{ id: 'lua4', name: 'Function Junction', title: 'Functions', kind: 'lua', std: 'Functions', pool: ['funcs', 'loops'],
  boss: { name: 'Funky Func', look: { color: '#FFC93C', eyes: 'three', mouth: 'grin', acc: 'cap', cap: '#A070FF' }, taunt: 'You call me, I return... TROUBLE!' },
  lesson: [
    { t: 'Make your own commands', html: `<p>A <b>function</b> is a set of instructions with a name. Write it once, use it as many times as you want.</p>`, try: 'local function cheer()\n  print("GG!")\n  print("Well played!")\nend\n\ncheer()\ncheer()' },
    { t: 'Inputs (parameters)', html: `<p>Functions can take <b>inputs</b> called <b>parameters</b>. They go in the parentheses.</p>`, try: 'local function greet(name, level)\n  print("Hi " .. name .. ", you are level " .. level)\nend\n\ngreet("Ava", 3)\ngreet("Kai", 12)' },
    { t: 'Outputs (return)', html: `<p><code>return</code> sends a value back out of the function. Then you can print it, save it, or use it in math.</p>`, try: 'local function double(n)\n  return n * 2\nend\n\nprint(double(21))\nlocal big = double(double(5))\nprint(big)',
      check: choice(`What does this print?<pre class="codeq">${Lua.hl('local function add3(n)\n  return n + 3\nend\nprint(add3(10) * 2)')}</pre>`, '26', ['16', '13', '23']), why: '' },
  ],
  challenges: [
    { title: 'Doubler', prompt: 'Write a function <code>double(n)</code> that <b>returns</b> n times 2. We\'ll test it with different numbers.', start: 'local function double(n)\n  -- your code here\nend\n', test: 'print(double(4))\nprint(double(-3))\nprint(double(50))', expect: ['8', '-6', '100'], hint: 'Inside the function: return n * 2', solution: 'local function double(n)\n  return n * 2\nend\n' },
    { title: 'Damage calculator', prompt: 'Write <code>damage(power, armor)</code> that returns <code>power - armor</code>, but never less than <b>0</b>.', start: 'local function damage(power, armor)\n  -- your code here\nend\n', test: 'print(damage(10, 3))\nprint(damage(5, 8))\nprint(damage(7, 7))', expect: ['7', '0', '0'], hint: 'Save power - armor in a variable. If it\'s less than 0, set it to 0. Then return it.', solution: 'local function damage(power, armor)\n  local d = power - armor\n  if d < 0 then\n    d = 0\n  end\n  return d\nend\n' },
    { title: 'Rank up', prompt: 'Write <code>rank(xp)</code> that returns <code>"Bronze"</code> if xp is under 100, <code>"Silver"</code> if under 500, and <code>"Gold"</code> otherwise.', start: 'local function rank(xp)\n  -- your code here\nend\n', test: 'print(rank(50))\nprint(rank(250))\nprint(rank(900))\nprint(rank(100))', expect: ['Bronze', 'Silver', 'Gold', 'Silver'], hint: 'if xp < 100 then return "Bronze" elseif xp < 500 then ...', solution: 'local function rank(xp)\n  if xp < 100 then\n    return "Bronze"\n  elseif xp < 500 then\n    return "Silver"\n  else\n    return "Gold"\n  end\nend\n' },
  ] },

{ id: 'lua5', name: 'Game Scripts', title: 'Tables & Events', kind: 'lua', std: 'Data & Events', pool: ['tables', 'funcs'],
  boss: { name: 'Lag Lord', look: { color: '#3E4380', eyes: 'robot', mouth: 'teeth', acc: 'crown' }, taunt: 'Your game is... loading... loading... HAHAHA. I am the lag.' },
  lesson: [
    { t: 'Tables: lists', html: `<p>A <b>table</b> holds lots of values in one variable. Lua counts from <b>1</b> (not 0 like some languages). <code>#items</code> tells you how many things are in it.</p>`, try: 'local backpack = {"sword", "shield", "potion"}\n\nprint(backpack[1])\nprint(#backpack)\n\nfor i = 1, #backpack do\n  print("Slot " .. i .. ": " .. backpack[i])\nend' },
    { t: 'Tables: objects', html: `<p>Tables can also have <b>named</b> values, like a character sheet. Use a dot to read or change them.</p><p>In Roblox, everything works like this! A part has <code>part.Color</code> and <code>part.Size</code>. A player has <code>player.Name</code>.</p>`, try: 'local player = {name = "Max", coins = 10, health = 100}\n\nplayer.coins = player.coins + 25\nplayer.health = player.health - 30\n\nprint(player.name .. " has " .. player.coins .. " coins")\nprint("Health: " .. player.health)' },
    { t: 'Events: code that waits', html: `<p>Games run code when something <b>happens</b>, like a player touching a coin. That's an <b>event</b>. In Roblox Studio it looks like this:</p><pre class="codeq">${Lua.hl('part.Touched:Connect(function(hit)\n  print("Something touched the part!")\nend)')}</pre><p>In Brain Brawl, our mini game engine calls your <code>onTouch(player)</code> function whenever a player touches the block. Try it:</p>`, try: 'function onTouch(player)\n  player.coins = player.coins + 10\n  print(player.name .. " grabbed a coin!")\nend\n\n-- Our engine does this when a player touches it:\nlocal p = {name = "Ava", coins = 0}\nonTouch(p)\nonTouch(p)\nprint("Ava has " .. p.coins .. " coins")' },
    { t: 'Coding with AI', html: `<p>AI tools can write code fast. Roblox Studio even has an AI assistant. But AI code can have bugs, just like human code.</p><p><b>The rule:</b> you're the boss. Read the code, run it, and test it before you trust it. Your last challenge is fixing code an AI wrote!</p>`,
      check: choice('An AI wrote a script for your game. What should you do first?', 'Read it and test it to see if it really works', ['Publish the game right away', 'Delete all your own code', 'Assume it\'s perfect because AI wrote it']), why: '' },
  ],
  challenges: [
    { title: 'Coin pickup', prompt: 'Write <code>onTouch(player)</code> so it adds <b>10</b> to <code>player.coins</code>.', start: 'function onTouch(player)\n  -- your code here\nend\n', test: 'local p = {name = "Ava", coins = 5, health = 100}\nonTouch(p)\nprint(p.coins)\nonTouch(p)\nprint(p.coins)', expect: ['15', '25'], hint: 'player.coins = player.coins + 10', solution: 'function onTouch(player)\n  player.coins = player.coins + 10\nend\n' },
    { title: 'Lava block', prompt: 'Write <code>onTouch(player)</code> for a lava block: set <code>player.health</code> to <b>0</b> and print the player\'s name followed by <code> fell in lava!</code>', start: 'function onTouch(player)\n  -- your code here\nend\n', test: 'local p = {name = "Kai", coins = 5, health = 100}\nonTouch(p)\nprint(p.health)', expect: ['Kai fell in lava!', '0'], hint: 'player.health = 0, then print(player.name .. " fell in lava!")', solution: 'function onTouch(player)\n  player.health = 0\n  print(player.name .. " fell in lava!")\nend\n' },
    { title: 'Fix the AI\'s code', prompt: 'An AI wrote this code to count the items in a backpack. It should print <b>3</b>, but it has <b>2 bugs</b>. Run it, find them, and fix them!', start: '-- Written by an AI helper. It has 2 bugs!\nlocal backpack = {"sword", "shield", "potion"}\nlocal count = 0\n\nfor i = 0, #backpack do\n  count = count + 1\nend\n\nprint(Count)\n', expect: ['3'], need: [[/\bfor\b/, 'Keep the for loop. Fix it instead of removing it.']], hint: 'Bug 1: Lua tables start at 1, not 0. Bug 2: Lua cares about capital letters. Is it count or Count?', solution: '-- Fixed!\nlocal backpack = {"sword", "shield", "potion"}\nlocal count = 0\n\nfor i = 1, #backpack do\n  count = count + 1\nend\n\nprint(count)\n' },
  ] },
];
// Fill in "why" for lesson checks built inline above
(() => {
  const W = { bot1: ['Turning left from facing right points the robot up.', 'Bugs usually start right before things go wrong. Look there first.'], bot2: ['Repeat (1) + Forward (1) + Turn right (1) = 3 blocks.', 'Two nested loops: repeat 4 sides, and inside, repeat 3 steps then turn.'], bot3: ['If the condition is false, the robot just skips what\'s inside.', 'If nothing changes, the robot never reaches the flag, so the loop never ends.'], lua1: [null, 'gems starts at 3. Then gems = 3 + 4 = 7.'], lua2: [null, null, 'hp == 0 is true, and "or" only needs one true side. So it prints A.'], lua3: [null, 'i is 5, then 10, then 15. That\'s 3 lines.'], lua4: [null, null, 'add3(10) returns 13. 13 × 2 = 26.'], lua5: [null, null, null, 'Always read and test code before you trust it, no matter who wrote it.'] };
  CODE.forEach(l => l.lesson.forEach((s, i) => { if (s.check && W[l.id] && W[l.id][i]) { s.check.why = W[l.id][i]; s.check.hint ||= 'Think it through step by step.'; } }));
})();
CODE.forEach(l => (l.world = 'code'));
