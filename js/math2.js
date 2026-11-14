// Algebra Peaks: 9 harder levels (7th and 8th grade, pre-algebra and early algebra).
// Same shape as math.js: a lesson, a question generator, and a boss per level.
const PI = 3.14;
const pm = (b) => `${b < 0 ? '−' : '+'} ${Math.abs(b)}`;
const co = (a) => (a === 1 ? '' : a === -1 ? '−' : n2(a)); // coefficient in front of x
function rtTri(a, b, c, hide) { // right triangle with labels; hide = 'a' | 'b' | 'c'
  const L = (k, v) => (hide === k ? '?' : v);
  return `<svg class="vis shape" viewBox="0 0 260 170"><polygon points="40,140 220,140 40,30" class="sh"/><rect x="40" y="128" width="12" height="12" class="ra"/>${T(130, 162, L('b', b))}${T(32, 90, L('a', a), 'end')}${T(140, 76, L('c', c), 'start')}</svg>`;
}
function circSVG(label, isD) {
  return `<svg class="vis shape" viewBox="0 0 260 170"><circle cx="130" cy="85" r="68" class="sh"/><circle cx="130" cy="85" r="3.5" fill="#fff"/><line x1="${isD ? 62 : 130}" y1="85" x2="198" y2="85" class="dash"/>${T(isD ? 130 : 164, 78, label)}</svg>`;
}
function cylSVG(r, h, u = 'cm') {
  return `<svg class="vis shape" viewBox="0 0 260 170"><path d="M70 40 L70 130 A60 18 0 0 0 190 130 L190 40" class="sh"/><ellipse cx="130" cy="40" rx="60" ry="18" class="sh2"/><line x1="130" y1="40" x2="190" y2="40" class="dash"/>${T(160, 34, `r = ${r} ${u}`)}${T(198, 92, `h = ${h} ${u}`, 'start')}</svg>`;
}
// Coordinate grid from -6..6 with a line y = mx + b and optional points
function gridSVG(m, b, pts = []) {
  const S2 = 13, O = 100, px = x => O + x * S2, py = y => O - y * S2;
  let s = `<svg class="vis grid" viewBox="0 0 200 200">`;
  for (let i = -7; i <= 7; i++) s += `<line x1="${px(i)}" y1="${py(-7)}" x2="${px(i)}" y2="${py(7)}" class="gl"/><line x1="${px(-7)}" y1="${py(i)}" x2="${px(7)}" y2="${py(i)}" class="gl"/>`;
  s += `<line x1="${px(-7)}" y1="${O}" x2="${px(7)}" y2="${O}" class="ax"/><line x1="${O}" y1="${py(-7)}" x2="${O}" y2="${py(7)}" class="ax"/>`;
  if (m != null) s += `<line x1="${px(-7)}" y1="${py(m * -7 + b)}" x2="${px(7)}" y2="${py(m * 7 + b)}" class="ln" clip-path="inset(0)"/><circle cx="${O}" cy="${py(b)}" r="5" class="ic0"/>`;
  pts.forEach(([x, y, t]) => { s += `<circle cx="${px(x)}" cy="${py(y)}" r="5" class="pt"/>${t ? `<text x="${px(x) + 7}" y="${py(y) - 6}">${t}</text>` : ''}`; });
  return s + '</svg>';
}
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
const sup = n => `<sup>${typeof n === 'number' ? n2(n) : n}</sup>`;

const MATH2 = [
// 1 ───────────────────────────────────────────
{ id: 'prop', world: 'math2', name: 'Scale Up', title: 'Proportions & Percent Change', std: '7.RP.1–3',
  boss: { name: 'Stretch', look: { color: '#FF6BD5', eyes: 'one', mouth: 'grin', acc: 'mohawk' }, taunt: 'I can scale ANYTHING. Bigger, smaller, weirder. Keep up, tiny human!' },
  lesson: [
    { t: 'Two ratios, one equation', html: `<p>A <b>proportion</b> says two ratios are equal: ${ex(`${fr(3, 4)} = ${fr('x', 20)}`)}</p><p>Find what the bottom was multiplied by (4 × <b>5</b> = 20), then do the same to the top: 3 × 5 = <b>15</b>. Or <b>cross-multiply</b>: 3 × 20 = 4 × x, so x = 60 ÷ 4 = 15.</p>`,
      widget(el) { el.innerHTML = sl('k', 'Scale factor', 1, 10, 5) + '<div class="out"></div>'; wire(el, ({ k }) => { el.querySelector('.out').innerHTML = `<p class="eq">${fr(3, 4)} = ${fr(`<b>${3 * k}</b>`, 4 * k)}</p><div class="ratio-row"><div>${'<i class="rgem"></i>'.repeat(3)}<br>${'<i class="rcn"></i>'.repeat(4)}</div><div class="ratio-c">× ${k}</div></div><p class="note">Every 3 gems still go with 4 coins. The ratio never changes, only the size.</p>`; }); },
      check: num(18, `Solve for ${X}.${ex(`${fr(2, 5)} = ${fr('x', 45)}`)}`, '5 × 9 = 45, so 2 × 9 = 18.', 'What did 5 get multiplied by to become 45?') },
    { t: 'The constant of proportionality', html: `<p>If <b>y = kx</b>, then y is <b>proportional</b> to x and <b>k</b> is the constant. It's just the unit rate.</p><p>5 tickets cost $40, so k = 40 ÷ 5 = <b>$8 per ticket</b>, and cost = 8 × tickets.</p>`, check: num(7, 'y is proportional to x. When x = 6, y = 42. What is k?', 'k = y ÷ x = 42 ÷ 6 = 7.', 'k = y ÷ x') },
    { t: 'Percent change', html: `<p>How much did something grow or shrink, compared to where it <b>started</b>?</p><p class="eq">percent change = change ÷ original × 100</p><p>A skin goes from 80 coins to 100 coins. Change = 20. 20 ÷ 80 = 0.25 = <b>25% increase</b>.</p>`, check: num(20, 'A game drops from $50 to $40. What is the percent <b>decrease</b>?', 'Change = 10. 10 ÷ 50 = 0.20 = 20%.', 'Divide the change by the ORIGINAL price.') },
  ],
  gen() {
    const t = R(0, 5);
    if (t === 0) { const b = R(2, 9), k = R(2, 9), a = R(1, 12); return num(a * k, `Solve for ${X}.${ex(`${fr(a, b)} = ${fr('x', b * k)}`)}`, `${b} × ${k} = ${b * k}, so x = ${a} × ${k} = ${a * k}.`, 'Find what the bottom was multiplied by. Do the same to the top.'); }
    if (t === 1) { const b = R(2, 9), k = R(2, 9), a = R(1, 12); return num(b * k, `Solve for ${X}.${ex(`${fr(a, b)} = ${fr(a * k, 'x')}`)}`, `${a} × ${k} = ${a * k}, so x = ${b} × ${k} = ${b * k}.`, 'Find what the top was multiplied by. Do the same to the bottom.'); }
    if (t === 2) { const s = pick([5, 10, 20, 25, 50]), c = R(3, 12); return num(s * c, `A map scale is <b>1 cm : ${s} km</b>. Two cities are <b>${c} cm</b> apart on the map. How many km apart are they really?`, `Each cm is ${s} km. ${c} × ${s} = ${s * c} km.`, 'Multiply the map distance by the scale.'); }
    if (t === 3) { const o = pick([20, 40, 50, 60, 80, 120, 200]), p = pick([10, 20, 25, 50, 75]), up = R(0, 1), n = up ? o * (1 + p / 100) : o * (1 - p / 100); return num(p, `A price goes from <b>$${o}</b> to <b>$${n}</b>. What is the percent <b>${up ? 'increase' : 'decrease'}</b>?`, `Change = ${Math.abs(n - o)}. ${Math.abs(n - o)} ÷ ${o} = ${p / 100} = ${p}%.`, 'change ÷ original × 100', `${p}%`); }
    if (t === 4) { const k = R(2, 12), x = R(2, 9); return num(k, `y is proportional to x. When x = ${x}, y = ${k * x}. What is the constant of proportionality k?`, `k = y ÷ x = ${k * x} ÷ ${x} = ${k}.`, 'k = y ÷ x'); }
    const b = pick([2, 4, 6]), a = b * R(1, 3) / 2, d = b * R(2, 5), nm = pick(NAMES); return num(a * d / b, `${nm}'s recipe uses <b>${n2(a)} cups</b> of flour for <b>${b}</b> people. How many cups for <b>${d}</b> people?`, `${d} ÷ ${b} = ${d / b} times as many people, so ${n2(a)} × ${d / b} = ${n2(a * d / b)} cups.`, 'How many times bigger is the group?');
  } },

// 2 ───────────────────────────────────────────
{ id: 'twostep', world: 'math2', name: 'Double Lock', title: 'Multi-Step Equations', std: '7.EE.4, 8.EE.7',
  boss: { name: 'Lockjaw', look: { color: '#8C7CFF', eyes: 'angry', mouth: 'teeth', acc: 'helmet' }, taunt: 'One step? Cute. My equations have LAYERS. You\'ll never peel them all.' },
  fmt: 'Type the value of x. Negatives like -4 work.',
  lesson: [
    { t: 'Undo in reverse order', html: `<p>To solve ${ex('3x + 5 = 20')} think: x was <b>multiplied by 3</b>, then <b>5 was added</b>. Undo the last thing first, like taking off shoes before socks.</p><ol><li>Subtract 5 from both sides: 3x = 15</li><li>Divide both sides by 3: x = <b>5</b></li></ol>`,
      widget(el) { el.innerHTML = sl('a', 'Multiply x by', 2, 9, 3) + sl('b', 'Then add', -9, 9, 5) + sl('x', 'Secret x', -6, 9, 5) + '<div class="out"></div>'; wire(el, ({ a, b, x }) => { const c = a * x + b; el.querySelector('.out').innerHTML = `<p class="eq">${a}x ${pm(b)} = ${n2(c)}</p><table class="rt ev"><tr><th>${b >= 0 ? 'subtract' : 'add'} ${Math.abs(b)}</th><td>${a}x = ${n2(c - b)}</td></tr><tr><th>divide by ${a}</th><td>x = ${n2(x)}</td></tr></table>`; }); },
      check: num(6, `Solve for ${X}.${ex('4x − 7 = 17')}`, 'Add 7: 4x = 24. Divide by 4: x = 6.', 'Undo the −7 first.') },
    { t: 'Parentheses: distribute first', html: `<p>${ex('2(x + 3) = 16')}</p><p>Either divide both sides by 2 right away (x + 3 = 8, so x = 5), or <b>distribute</b>: 2x + 6 = 16, then solve.</p>`, check: num(4, `Solve for ${X}.${ex('5(x − 1) = 15')}`, 'Divide by 5: x − 1 = 3. Add 1: x = 4.', 'Divide both sides by 5 first.') },
    { t: 'x on both sides', html: `<p>${ex('5x + 2 = 3x + 10')}</p><p>Get every x on one side. Subtract 3x from both sides: 2x + 2 = 10. Now it's a regular two-step: 2x = 8, x = <b>4</b>.</p><p>Always check: 5(4) + 2 = 22 and 3(4) + 10 = 22. ✔</p>`, check: num(3, `Solve for ${X}.${ex('6x = 2x + 12')}`, 'Subtract 2x: 4x = 12. Divide by 4: x = 3.', 'Subtract 2x from both sides.') },
  ],
  gen() {
    const t = R(0, 5), x = R(-9, 12) || 4;
    if (t === 0) { const a = R(2, 9), b = (R(1, 15)) * pick([1, -1]), c = a * x + b; const q = num(x, `Solve for ${X}.${ex(`${a}x ${pm(b)} = ${n2(c)}`)}`, `${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)}: ${a}x = ${n2(c - b)}. Divide by ${a}: x = ${n2(x)}.`, `Undo the ${pm(b)} first, then divide.`); if (a <= 4 && b > 0 && b <= 12 && x > 0) q.viz = vizBalance(a, b, x); return q; }
    if (t === 1) { const a = R(2, 6), q = R(-6, 9) || 2, b = R(1, 12), c = q + b; return num(q * a, `Solve for ${X}.${ex(`${fr('x', a)} + ${b} = ${n2(c)}`)}`, `Subtract ${b}: x/${a} = ${n2(q)}. Multiply by ${a}: x = ${n2(q * a)}.`, `Subtract ${b} first, then multiply by ${a}.`); }
    if (t === 2) { const a = R(2, 8), b = R(1, 9) * pick([1, -1]), c = a * (x + b); return num(x, `Solve for ${X}.${ex(`${a}(x ${pm(b)}) = ${n2(c)}`)}`, `Divide by ${a}: x ${pm(b)} = ${n2(x + b)}. So x = ${n2(x)}.`, `Divide both sides by ${a} first.`); }
    if (t === 3) { const c = R(1, 5), a = c + R(1, 5), b = R(-12, 12), d = (a - c) * x + b; return num(x, `Solve for ${X}.${ex(`${a}x ${pm(b)} = ${co(c)}x ${pm(d)}`)}`, `Subtract ${co(c)}x from both sides: ${co(a - c)}x ${pm(b)} = ${n2(d)}. Then ${co(a - c)}x = ${n2(d - b)}, so x = ${n2(x)}.`, `Subtract ${co(c)}x from both sides to collect the x terms.`); }
    if (t === 4) { const a = R(2, 5), c = R(1, 4), b = R(1, 12), tot = (a + c) * x - b; return num(x, `Solve for ${X}.${ex(`${a}x + ${co(c)}x − ${b} = ${n2(tot)}`)}`, `Combine like terms: ${a + c}x − ${b} = ${n2(tot)}. Add ${b}: ${a + c}x = ${n2(tot + b)}. x = ${n2(x)}.`, 'Combine the x terms first.'); }
    const p = R(3, 9), n = R(2, 8), f = R(5, 20), nm = pick(NAMES); return num(n, `${nm} pays a <b>$${f}</b> sign-up fee plus <b>$${p}</b> per month for a game pass. The total so far is <b>$${f + p * n}</b>. How many months?`, `${p}m + ${f} = ${f + p * n}. Subtract ${f}: ${p}m = ${p * n}. m = ${n}.`, `Write it as ${p}m + ${f} = total.`);
  } },

// 3 ───────────────────────────────────────────
{ id: 'circ', world: 'math2', name: 'Round Zone', title: 'Circles', std: '7.G.4',
  boss: { name: 'Orbitron', look: { color: '#3DD6FF', eyes: 'cyber', mouth: 'flat', acc: 'halo' }, taunt: 'Round and round and round. You\'ll get dizzy before you find my area!' },
  fmt: 'Use 3.14 for π. Decimals like 78.5 are fine.',
  lesson: [
    { t: 'Meet π', html: `<p>Measure <b>around</b> any circle (the <b>circumference</b>) and divide by the distance <b>across</b> (the <b>diameter</b>). You always get the same number: <b>π ≈ 3.14</b>.</p><p class="eq">C = π × d &nbsp; or &nbsp; C = 2 × π × r</p><p>The <b>radius</b> r is half the diameter.</p>`,
      widget(el) { el.innerHTML = sl('r', 'Radius', 1, 12, 5) + '<div class="out"></div>'; wire(el, ({ r }) => { el.querySelector('.out').innerHTML = `<svg class="vis shape" viewBox="0 0 260 150"><circle cx="130" cy="75" r="${r * 5.5}" class="sh"/><line x1="130" y1="75" x2="${130 + r * 5.5}" y2="75" class="dash"/></svg><table class="rt ev"><tr><th>diameter = 2 × ${r}</th><td>${2 * r}</td></tr><tr><th>C = 3.14 × ${2 * r}</th><td>${n2(r4(PI * 2 * r))}</td></tr><tr><th>A = 3.14 × ${r}²</th><td>${n2(r4(PI * r * r))}</td></tr></table>`; }); },
      check: num(31.4, 'A circle has a diameter of <b>10 cm</b>. What is its circumference? Use π = 3.14.', 'C = π × d = 3.14 × 10 = 31.4 cm.', 'C = 3.14 × diameter') },
    { t: 'Area of a circle', html: `<p class="eq">A = π × r²</p><p>Square the <b>radius</b> first, then multiply by 3.14. If you're given the diameter, cut it in half first. That's the classic trap.</p>`, check: num(12.56, 'A circle has a radius of <b>2 m</b>. What is its area? Use π = 3.14.', 'r² = 4. 3.14 × 4 = 12.56 m².', 'Square the radius, then × 3.14.') },
  ],
  gen() {
    const t = R(0, 4), u = pick(['cm', 'm', 'in', 'ft']);
    if (t === 0) { const r = R(2, 15), v = r4(2 * PI * r); return num(v, `Find the <b>circumference</b>. Use π = 3.14.${circSVG(`r = ${r} ${u}`)}`, `C = 2 × 3.14 × ${r} = ${n2(v)} ${u}.`, 'C = 2 × π × r'); }
    if (t === 1) { const d = R(3, 30), v = r4(PI * d); return num(v, `Find the <b>circumference</b>. Use π = 3.14.${circSVG(`d = ${d} ${u}`, true)}`, `C = 3.14 × ${d} = ${n2(v)} ${u}.`, 'C = π × d'); }
    if (t === 2) { const r = R(2, 12), v = r4(PI * r * r); return num(v, `Find the <b>area</b>. Use π = 3.14.${circSVG(`r = ${r} ${u}`)}`, `r² = ${r * r}. 3.14 × ${r * r} = ${n2(v)} ${u}².`, 'A = π × r². Square the radius first.'); }
    if (t === 3) { const r = R(2, 10), v = r4(PI * r * r); return num(v, `Find the <b>area</b>. Use π = 3.14.${circSVG(`d = ${2 * r} ${u}`, true)}`, `Radius = ${2 * r} ÷ 2 = ${r}. r² = ${r * r}. 3.14 × ${r * r} = ${n2(v)} ${u}².`, 'Careful! That\'s the diameter. Cut it in half first.'); }
    const d = R(2, 20); return num(d, `A circular track has a circumference of <b>${n2(r4(PI * d))} m</b>. What is its <b>diameter</b>? Use π = 3.14.`, `d = C ÷ π = ${n2(r4(PI * d))} ÷ 3.14 = ${d} m.`, 'Work backwards: d = C ÷ 3.14');
  } },

// 4 ───────────────────────────────────────────
{ id: 'vol', world: 'math2', name: 'Fill It Up', title: 'Volume', std: '7.G.6, 8.G.9',
  boss: { name: 'Tank', look: { color: '#5BE36B', eyes: 'visor', mouth: 'teeth', acc: 'jet', spots: true }, taunt: 'I\'m 100% full of bad attitude. Calculate THAT, cube-brain.' },
  fmt: 'Use 3.14 for π when you need it.',
  lesson: [
    { t: 'Base times height', html: `<p><b>Volume</b> is how much space fills a 3D shape, measured in <b>cubic units</b> (cm³).</p><p>For any prism or cylinder, the trick is the same:</p><p class="eq">V = area of the base × height</p><ul><li>Box: (l × w) × h</li><li>Triangular prism: (½ × b × h) × length</li><li>Cylinder: (π × r²) × h</li></ul>`,
      widget(el) { el.innerHTML = sl('r', 'Radius', 1, 6, 3) + sl('h', 'Height', 1, 10, 5) + '<div class="out"></div>'; wire(el, ({ r, h }) => { el.querySelector('.out').innerHTML = cylSVG(r, h) + `<p class="eq">3.14 × ${r}² × ${h} = <b>${n2(r4(PI * r * r * h))}</b> cm³</p><p class="note">Double the height and the volume doubles. Double the radius and it goes up <b>4 times</b>, because the radius is squared.</p>`; }); },
      check: num(120, 'A box is 5 cm long, 4 cm wide and 6 cm tall. What is its volume?', '5 × 4 × 6 = 120 cm³.', 'l × w × h') },
    { t: 'Cones are one third', html: `<p>A cone that fits exactly inside a cylinder holds exactly <b>one third</b> as much.</p><p class="eq">V = ⅓ × π × r² × h</p>`, check: num(314, 'A cone has radius 5 and height 12. Find its volume. Use π = 3.14.', '3.14 × 25 × 12 = 942. One third of that is 314.', 'Find the cylinder volume, then divide by 3.') },
  ],
  gen() {
    const t = R(0, 5), u = pick(['cm', 'm', 'in']);
    if (t === 0) { const l = R(2, 12), w = R(2, 9), h = R(2, 10); return num(l * w * h, `Find the volume.${boxSVG(l, w, h, u)}`, `${l} × ${w} × ${h} = ${l * w * h} ${u}³.`, 'V = length × width × height'); }
    if (t === 1) { const s = R(2, 9); return num(s ** 3, `A cube has sides of <b>${s} ${u}</b>. What is its volume?`, `${s} × ${s} × ${s} = ${s ** 3} ${u}³.`, 'V = s × s × s'); }
    if (t === 2) { const r = R(2, 6), h = R(2, 10), v = r4(PI * r * r * h); return num(v, `Find the volume. Use π = 3.14.${cylSVG(r, h, u)}`, `Base = 3.14 × ${r}² = ${n2(r4(PI * r * r))}. Times ${h} = ${n2(v)} ${u}³.`, 'V = π × r² × h'); }
    if (t === 3) { const b = R(2, 6) * 2, h = R(2, 8), L = R(3, 12); return num(b * h / 2 * L, `A triangular prism (like a tent) has a triangle end with base <b>${b} ${u}</b> and height <b>${h} ${u}</b>. The tent is <b>${L} ${u}</b> long. Find its volume.`, `Triangle area = ½ × ${b} × ${h} = ${b * h / 2}. Times ${L} = ${b * h / 2 * L} ${u}³.`, 'Area of the triangle end × the length.'); }
    if (t === 4) { const l = R(2, 9), w = R(2, 8), h = R(2, 9); return num(h, `A fish tank holds <b>${l * w * h} ${u}³</b> of water. It is ${l} ${u} long and ${w} ${u} wide. How <b>tall</b> is it?`, `${l} × ${w} = ${l * w}. ${l * w * h} ÷ ${l * w} = ${h} ${u}.`, 'Divide the volume by (length × width).'); }
    const r = R(2, 6), h = R(1, 5) * 3, v = r4(PI * r * r * h / 3); return num(v, `A cone has radius <b>${r} ${u}</b> and height <b>${h} ${u}</b>. Find its volume. Use π = 3.14.`, `3.14 × ${r * r} × ${h} = ${n2(r4(PI * r * r * h))}. One third = ${n2(v)} ${u}³.`, 'V = ⅓ × π × r² × h');
  } },

// 5 ───────────────────────────────────────────
{ id: 'prob', world: 'math2', name: 'Lucky Odds', title: 'Probability', std: '7.SP.5–8',
  boss: { name: 'Loot Goblin', look: { color: '#FFC93C', eyes: 'big', mouth: 'fangs', acc: 'tophat' }, taunt: 'Legendary drop rate: 0.5%. Feeling lucky? Math says you shouldn\'t.' },
  fmt: 'Type a fraction like 3/8. Any equal fraction counts.',
  lesson: [
    { t: 'Chance as a fraction', html: `<p><b>Probability</b> is a number from <b>0</b> (impossible) to <b>1</b> (certain).</p><p class="eq">P = ways you win ÷ all possible outcomes</p><p>A loot box has 2 legendary, 3 rare and 5 common items. P(legendary) = 2 ÷ 10 = <b>${fr(1, 5)}</b>, or 20%.</p>`,
      widget(el) { el.innerHTML = sl('r', 'Gold tokens', 0, 10, 2) + sl('b', 'Blue tokens', 0, 10, 6) + '<div class="out"></div>'; wire(el, ({ r, b }) => { const t = r + b; el.querySelector('.out').innerHTML = `<div class="tokens">${'<i class="tk g"></i>'.repeat(r)}${'<i class="tk"></i>'.repeat(b)}</div>` + (t ? `<p class="eq">P(gold) = ${fr(r, t)} = <b>${Math.round(r / t * 100)}%</b></p><div class="growbar"><span style="width:${r / t * 100}%"></span></div>` : '<p class="note">Add some tokens!</p>'); }); },
      check: fracQ(3, 8, 'A bag has 3 red and 5 blue marbles. What is P(red)?', '3 red out of 8 total = 3/8.', 'red ÷ total') },
    { t: 'Two things at once', html: `<p>For two <b>independent</b> events (one doesn't affect the other), <b>multiply</b> the probabilities.</p><p>Flip heads <b>and</b> roll a 6: ${fr(1, 2)} × ${fr(1, 6)} = <b>${fr(1, 12)}</b>.</p><p>And P(something does <b>not</b> happen) = 1 − P(it happens).</p>`, check: fracQ(1, 4, 'You flip a coin twice. What is P(heads both times)?', '1/2 × 1/2 = 1/4.', 'Multiply the two chances.') },
  ],
  gen() {
    const t = R(0, 5);
    if (t === 0) { const r = R(1, 6), b = R(1, 6), g = R(1, 6), c = pick([['red', r], ['blue', b], ['green', g]]); return Object.assign(fracQ(c[1], r + b + g, `A bag has <b>${r} red</b>, <b>${b} blue</b> and <b>${g} green</b> marbles. You grab one without looking. What is P(${c[0]})?`, `${c[1]} ${c[0]} out of ${r + b + g} total = ${fracHTML(c[1], r + b + g)}.`, 'favorable ÷ total'), { viz: vizBag([[r, '#FF4F7B', 'red'], [b, '#3DA8FF', 'blue'], [g, '#5BE36B', 'green']], c[0]) }); }
    if (t === 1) { const ev = pick([['an even number', 3], ['a number greater than 4', 2], ['a prime number (2, 3 or 5)', 3], ['a 1 or a 6', 2], ['a number less than 6', 5], ['a multiple of 3', 2]]); return fracQ(ev[1], 6, `You roll a regular 6-sided die. What is P(${ev[0]})?`, `${ev[1]} of the 6 sides work, so ${fracHTML(ev[1], 6)}.`, 'Count the sides that work, then divide by 6.'); }
    if (t === 2) { const n = pick([4, 5, 8, 10]), a = R(1, n - 1); return fracQ(a, n * 2, `A spinner has <b>${n}</b> equal sections and <b>${a}</b> ${a === 1 ? 'is' : 'are'} gold. You spin it <b>and</b> flip a coin. What is P(gold and heads)?`, `${fracHTML(a, n)} × ${fracHTML(1, 2)} = ${fracHTML(a, n * 2)}.`, 'Independent events: multiply.'); }
    if (t === 3) { const p = pick([10, 15, 20, 30, 35, 40, 60, 75, 85]); return num(100 - p, `The chance of a legendary drop is <b>${p}%</b>. What is the percent chance you do <b>not</b> get one?`, `100% − ${p}% = ${100 - p}%.`, 'The two chances add up to 100%.', `${100 - p}%`); }
    if (t === 4) { const d = pick([4, 5, 8, 10]), a = R(1, d - 1), n = d * R(4, 12); return num(a * n / d, `A spinner lands on purple with probability ${fracHTML(a, d)}. In <b>${n}</b> spins, about how many times should you <b>expect</b> purple?`, `${fracHTML(a, d)} of ${n} = ${a * n / d}.`, 'Multiply the probability by the number of spins.'); }
    const r = R(2, 5), b = R(2, 5), tt = r + b; return fracQ(r * (r - 1), tt * (tt - 1), `A bag has <b>${r} red</b> and <b>${b} blue</b> marbles. You take out two, <b>without putting the first one back</b>. What is P(both red)?`, `First: ${fracHTML(r, tt)}. Second (one red is gone): ${fracHTML(r - 1, tt - 1)}. Multiply: ${fracHTML(r * (r - 1), tt * (tt - 1))}.`, 'After the first red, there is one fewer red AND one fewer marble.');
  } },

// 6 ───────────────────────────────────────────
{ id: 'exp2', world: 'math2', name: 'Power Laws', title: 'Exponent Rules, Roots & Scientific Notation', std: '8.EE.1–4',
  boss: { name: 'Megabyte', look: { color: '#B26BFF', eyes: 'star', mouth: 'grin', acc: 'bolt' }, taunt: 'My power level is 9 × 10⁹. Yours is... adorable.' },
  lesson: [
    { t: 'Three exponent laws', html: `<table class="rt words"><tr><th>Rule</th><th>Example</th></tr><tr><td><b>Multiply</b> same base → <b>add</b> exponents</td><td>x³ · x⁴ = x⁷</td></tr><tr><td><b>Divide</b> same base → <b>subtract</b></td><td>x⁹ ÷ x² = x⁷</td></tr><tr><td><b>Power of a power</b> → <b>multiply</b></td><td>(x³)² = x⁶</td></tr></table><p>Why? x³ · x⁴ is just (x·x·x)·(x·x·x·x). Count them: seven x's.</p>`, check: num(11, `${ex(`x${sup(5)} · x${sup(6)} = x${sup('?')}`)}What is the missing exponent?`, 'Same base, multiplying: add the exponents. 5 + 6 = 11.', 'Multiplying same bases → add.') },
    { t: 'Zero and negative exponents', html: `<p>Anything (except 0) to the <b>zero</b> power is <b>1</b>. A <b>negative</b> exponent means "one over": 2${sup(-3)} = ${fr(1, '2³')} = ${fr(1, 8)}.</p><p>Follow the pattern: 2³ = 8, 2² = 4, 2¹ = 2, 2⁰ = 1, 2⁻¹ = ½. Each step divides by 2.</p>`, check: fracQ(1, 9, `What is ${ex(`3${sup(-2)}`)}`, '3² = 9, so 3⁻² = 1/9.', 'Negative exponent = 1 over the positive power.') },
    { t: 'Roots and giant numbers', html: `<p>A <b>square root</b> undoes squaring: √49 = 7 because 7² = 49.</p><p><b>Scientific notation</b> writes huge numbers as a number from 1 to 10, times a power of 10: 4.5 × 10⁶ = 4,500,000. The exponent tells you how many places the decimal point jumps.</p>`,
      widget(el) { el.innerHTML = sl('n', 'Power of 10', 0, 9, 4) + '<div class="out"></div>'; wire(el, ({ n }) => { el.querySelector('.out').innerHTML = `<p class="eq">3.2 × 10${sup(n)} = <b>${(3.2 * 10 ** n).toLocaleString('en-US', { maximumFractionDigits: 1 })}</b></p><p class="note">The decimal point jumped ${n} place${n === 1 ? '' : 's'} to the right.</p>`; }); },
      check: num(52000, `Write as a regular number.${ex(`5.2 × 10${sup(4)}`)}`, 'Move the decimal 4 places right: 52,000.', 'Jump the decimal point 4 places right.') },
  ],
  gen() {
    const t = R(0, 7);
    if (t === 0) { const a = R(2, 9), b = R(2, 9); return num(a + b, `${ex(`x${sup(a)} · x${sup(b)} = x${sup('?')}`)}What is the missing exponent?`, `Multiplying same bases: add. ${a} + ${b} = ${a + b}.`, 'Multiply same base → ADD exponents.'); }
    if (t === 1) { const b = R(2, 7), a = b + R(1, 8); return num(a - b, `${ex(`${fr(`x${sup(a)}`, `x${sup(b)}`)} = x${sup('?')}`)}What is the missing exponent?`, `Dividing same bases: subtract. ${a} − ${b} = ${a - b}.`, 'Divide same base → SUBTRACT exponents.'); }
    if (t === 2) { const a = R(2, 6), b = R(2, 5); return num(a * b, `${ex(`(x${sup(a)})${sup(b)} = x${sup('?')}`)}What is the missing exponent?`, `Power of a power: multiply. ${a} × ${b} = ${a * b}.`, 'Power of a power → MULTIPLY exponents.'); }
    if (t === 3) { const b = pick([2, 3, 4, 5, 10]), e = b === 2 ? R(1, 4) : b === 10 ? R(1, 3) : R(1, 2); return fracQ(1, b ** e, `What is ${ex(`${b}${sup(-e)}`)}`, `${b}${sup(e)} = ${b ** e}, so ${b}${sup(-e)} = ${fracHTML(1, b ** e)}.`, 'A negative exponent means 1 over the positive power.'); }
    if (t === 4) { const r = R(4, 15); return num(r, `What is ${ex(`√${r * r}`)}`, `${r} × ${r} = ${r * r}, so √${r * r} = ${r}.`, 'What number times itself gives this?'); }
    if (t === 5) { const m = pick([1.5, 2.4, 3.2, 4.7, 5.1, 6.8, 7.5, 9.9]), e = R(2, 6), v = Math.round(m * 10 ** e); return num(v, `Write as a regular number.${ex(`${m} × 10${sup(e)}`)}`, `Move the decimal ${e} places right: ${n2(v)}.`, `Jump the decimal point ${e} places to the right.`); }
    if (t === 6) { const m = pick([1.2, 2.5, 3.6, 4.8, 6.1, 7.3, 8.4]), e = R(3, 8), v = Math.round(m * 10 ** e); return num(e, `${ex(`${n2(v)} = ${m} × 10${sup('?')}`)}What is the missing exponent?`, `The decimal moved ${e} places, so the exponent is ${e}.`, 'Count how many places the decimal point has to jump.'); }
    const r = R(2, 6); return num(r, `What is the <b>cube root</b>? ${ex(`∛${r ** 3}`)}`, `${r} × ${r} × ${r} = ${r ** 3}.`, 'What number, used 3 times in a multiplication, gives this?');
  } },

// 7 ───────────────────────────────────────────
{ id: 'pyth', world: 'math2', name: 'Triangle Force', title: 'The Pythagorean Theorem', std: '8.G.6–8',
  boss: { name: 'Hypotenoose', look: { color: '#FF8A3D', eyes: 'three', mouth: 'fangs', acc: 'spikes' }, taunt: 'a² + b² = you losing. That\'s the theorem. Look it up.' },
  lesson: [
    { t: 'a² + b² = c²', html: `<p>In every <b>right triangle</b>, square the two short sides (the <b>legs</b>), add them, and you get the square of the long side (the <b>hypotenuse</b>, across from the right angle).</p><p class="eq">a² + b² = c²</p>`,
      widget(el) { el.innerHTML = sl('a', 'Leg a', 1, 12, 3) + sl('b', 'Leg b', 1, 12, 4) + '<div class="out"></div>'; wire(el, ({ a, b }) => { const c = Math.sqrt(a * a + b * b), whole = Number.isInteger(c); el.querySelector('.out').innerHTML = rtTri(a, b, whole ? c : c.toFixed(2)) + `<p class="eq">${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}, so c = √${a * a + b * b} ${whole ? '=' : '≈'} <b>${whole ? c : c.toFixed(2)}</b></p>${whole ? '<p class="note">All three sides are whole numbers. That\'s a <b>Pythagorean triple</b>!</p>' : ''}`; }); },
      check: num(10, `Find the hypotenuse.${rtTri(6, 8, 10, 'c')}`, '6² + 8² = 36 + 64 = 100. √100 = 10.', 'Square both legs, add, then take the square root.') },
    { t: 'Finding a missing leg', html: `<p>If you know the hypotenuse, <b>subtract</b> instead: a² = c² − b².</p><p>Hypotenuse 13, one leg 5: 169 − 25 = 144, and √144 = <b>12</b>.</p><p>This is also how games find the <b>distance</b> between two points: the gap in x and the gap in y are the legs.</p>`, check: num(8, 'A right triangle has hypotenuse <b>17</b> and one leg <b>15</b>. How long is the other leg?', '17² − 15² = 289 − 225 = 64. √64 = 8.', 'c² − b², then square root.') },
  ],
  gen() {
    const t = R(0, 5), tr = pick(TRIPLES.slice(0, 4)), k = tr[2] > 20 ? 1 : R(1, 3), [a, b, c] = tr.map(v => v * k);
    if (t === 0) return Object.assign(num(c, `Find the <b>hypotenuse</b>.${rtTri(a, b, c, 'c')}`, `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}. √${c * c} = ${c}.`, 'a² + b² = c². Add the squares, then take the square root.'), { viz: vizPyth(a, b, c, 'c') });
    if (t === 1) { const hideA = R(0, 1); return num(hideA ? a : b, `Find the <b>missing leg</b>.${rtTri(a, b, c, hideA ? 'a' : 'b')}`, `${c}² − ${hideA ? b : a}² = ${c * c} − ${(hideA ? b : a) ** 2} = ${(hideA ? a : b) ** 2}. Square root: ${hideA ? a : b}.`, 'Subtract: c² − (the leg you know)², then take the square root.'); }
    if (t === 2) { const good = R(0, 1), s = good ? [a, b, c] : [a, b, c + pick([1, 2, -1])]; return choice(`Is a triangle with sides <b>${s[0]}, ${s[1]} and ${s[2]}</b> a right triangle?`, good ? 'Yes' : 'No', [good ? 'No' : 'Yes'], `${s[0]}² + ${s[1]}² = ${s[0] ** 2 + s[1] ** 2} and ${s[2]}² = ${s[2] ** 2}. ${good ? 'They match, so yes.' : 'They don\'t match, so no.'}`, 'Check whether a² + b² equals c².'); }
    if (t === 3) { const x1 = R(-5, 3), y1 = R(-5, 3); return num(c, `In a game, your character is at <b>(${n2(x1)}, ${n2(y1)})</b> and the chest is at <b>(${n2(x1 + a)}, ${n2(y1 + b)})</b>. How far away is the chest in a straight line?`, `The x gap is ${a} and the y gap is ${b}. ${a}² + ${b}² = ${c * c}. √${c * c} = ${c}.`, 'The x gap and the y gap are the legs of a right triangle.'); }
    if (t === 4) return num(b, `A <b>${c} ft</b> ladder leans on a wall. Its bottom is <b>${a} ft</b> from the wall. How high up the wall does it reach?`, `${c}² − ${a}² = ${c * c - a * a}. √${c * c - a * a} = ${b} ft.`, 'The ladder is the hypotenuse.');
    return num(c, `A TV screen is <b>${b} in</b> wide and <b>${a} in</b> tall. What is its <b>diagonal</b>?`, `${a}² + ${b}² = ${c * c}. √${c * c} = ${c} in.`, 'The diagonal is the hypotenuse.');
  } },

// 8 ───────────────────────────────────────────
{ id: 'slope', world: 'math2', name: 'Line Rider', title: 'Slope & Linear Functions', std: '8.EE.5–6, 8.F.1–4',
  boss: { name: 'Steep Steve', look: { color: '#4FD18B', eyes: 'focus', mouth: 'grin', acc: 'fin' }, taunt: 'My slope is undefined. Like your chances. Straight up!' },
  fmt: 'Type a number. Fractions like 2/3 and negatives like -2 work.',
  lesson: [
    { t: 'Slope: rise over run', html: `<p><b>Slope</b> tells you how steep a line is: how far <b>up</b> for each step <b>right</b>.</p><p class="eq">slope = rise ÷ run = (y₂ − y₁) ÷ (x₂ − x₁)</p><p>Going uphill left to right is <b>positive</b>. Downhill is <b>negative</b>.</p>`,
      widget(el) { el.innerHTML = sl('m', 'Slope m', -4, 4, 2, 0.5) + sl('b', 'y-intercept b', -5, 5, 1) + '<div class="out"></div>'; wire(el, ({ m, b }) => { el.querySelector('.out').innerHTML = gridSVG(m, b) + `<p class="eq">y = ${m}x ${pm(b)}</p><p class="note">The line crosses the y-axis at <b>${n2(b)}</b> (the yellow dot) and goes ${m === 0 ? 'perfectly flat' : `${m > 0 ? 'up' : 'down'} ${Math.abs(m)} for every 1 step right`}.</p>`; }); },
      check: num(3, 'A line passes through <b>(1, 2)</b> and <b>(3, 8)</b>. What is its slope?', 'Rise = 8 − 2 = 6. Run = 3 − 1 = 2. 6 ÷ 2 = 3.', 'rise ÷ run') },
    { t: 'y = mx + b', html: `<p>Every straight line can be written as <b>y = mx + b</b>.</p><ul><li><b>m</b> is the slope (the rate of change)</li><li><b>b</b> is the <b>y-intercept</b> (where it starts, when x = 0)</li></ul><p>A ride costs $3 to start plus $2 per mile: <b>y = 2x + 3</b>. For 5 miles: 2(5) + 3 = <b>$13</b>.</p>`, check: num(-4, `What is the y-intercept of ${ex('y = 5x − 4')}`, 'In y = mx + b, b is the number without the x. Here b = −4.', 'It\'s the number that is not attached to x.') },
  ],
  gen() {
    const t = R(0, 5);
    if (t === 0) { const m = R(-4, 4) || 2, x1 = R(-4, 3), y1 = R(-6, 6), dx = R(1, 4); return Object.assign(num(m, `A line passes through <b>(${n2(x1)}, ${n2(y1)})</b> and <b>(${n2(x1 + dx)}, ${n2(y1 + m * dx)})</b>. What is its slope?`, `Rise = ${n2(m * dx)}. Run = ${dx}. ${n2(m * dx)} ÷ ${dx} = ${n2(m)}.`, 'slope = (y₂ − y₁) ÷ (x₂ − x₁)'), { viz: vizSlope(x1, y1, x1 + dx, y1 + m * dx) }); }
    if (t === 1) { const dy = pick([1, 2, 3, 5]) * pick([1, -1]), dx = pick([2, 3, 4, 5].filter(d => gcd(d, dy) === 1)), x1 = R(-3, 2), y1 = R(-4, 4); return fracQ(dy, dx, `A line passes through <b>(${n2(x1)}, ${n2(y1)})</b> and <b>(${n2(x1 + dx)}, ${n2(y1 + dy)})</b>. What is its slope?`, `Rise = ${n2(dy)}. Run = ${dx}. Slope = ${fracHTML(dy, dx)}.`, 'rise ÷ run. It can be a fraction.'); }
    if (t === 2) { const m = R(-5, 6) || 3, b = R(-9, 9), x = R(-4, 6); return num(m * x + b, `${ex(`y = ${co(m)}x ${pm(b)}`)}What is y when x = <b>${n2(x)}</b>?`, `${n2(m)}(${n2(x)}) ${pm(b)} = ${n2(m * x)} ${pm(b)} = ${n2(m * x + b)}.`, 'Swap x for the number, then multiply before you add.'); }
    if (t === 3) { const m = R(-6, 8) || 4, b = R(1, 12) * pick([1, -1]), askM = R(0, 1); return num(askM ? m : b, `${ex(`y = ${co(m)}x ${pm(b)}`)}What is the <b>${askM ? 'slope' : 'y-intercept'}</b>?`, `In y = mx + b, m = ${n2(m)} is the slope and b = ${n2(b)} is the y-intercept.`, askM ? 'The slope is the number multiplied by x.' : 'The y-intercept is the number without an x.'); }
    if (t === 4) { const m = R(2, 9), b = R(1, 12), xs = [0, 1, 2, 3]; return num(m, `This table shows a line. What is its <b>slope</b> (rate of change)?<table class="rt"><tr><th>x</th>${xs.map(x => `<td>${x}</td>`).join('')}</tr><tr><th>y</th>${xs.map(x => `<td>${m * x + b}</td>`).join('')}</tr></table>`, `Each time x goes up 1, y goes up ${m}. Slope = ${m}.`, 'How much does y change each time x goes up by 1?'); }
    const m = R(2, 5), x = R(1, 5), y = R(-3, 12); return num(y - m * x, `A line has slope <b>${m}</b> and passes through <b>(${x}, ${n2(y)})</b>. What is its y-intercept b?`, `y = mx + b → ${n2(y)} = ${m}(${x}) + b → b = ${n2(y)} − ${m * x} = ${n2(y - m * x)}.`, 'Plug the point into y = mx + b and solve for b.');
  } },

// 9 ───────────────────────────────────────────
{ id: 'sys', world: 'math2', name: 'Double Trouble', title: 'Systems of Equations', std: '8.EE.8',
  boss: { name: 'Twin Glitch', look: { color: '#FF4F7B', eyes: 'glitch', mouth: 'teeth', acc: 'horns', spots: true }, taunt: 'Two equations. Two unknowns. Two of me. Double the pain!' },
  fmt: 'Type the number it asks for.',
  lesson: [
    { t: 'Two clues, two unknowns', html: `<p>A <b>system</b> is two equations that are both true at once. One clue isn't enough to find x and y. Two clues are.</p>${ex('x + y = 10')}${ex('x − y = 4')}<p><b>Elimination:</b> add the two equations. The y's cancel: 2x = 14, so x = <b>7</b>. Then 7 + y = 10, so y = <b>3</b>.</p>`,
      widget(el) { el.innerHTML = sl('x', 'Try x', 0, 10, 5) + sl('y', 'Try y', 0, 10, 5) + '<div class="out"></div>'; wire(el, ({ x, y }) => { const a = x + y === 10, b = x - y === 4; el.querySelector('.out').innerHTML = `<table class="rt ev"><tr><th>x + y = 10</th><td>${x + y} ${a ? '✔' : '✘'}</td></tr><tr><th>x − y = 4</th><td>${x - y} ${b ? '✔' : '✘'}</td></tr></table><p class="note">${a && b ? '<b>Both true!</b> (7, 3) is the solution: the one point where the two lines cross.' : 'Slide until BOTH equations get a check mark.'}</p>`; }); },
      check: num(8, `${ex('x + y = 13')}${ex('x − y = 3')}What is <b>x</b>?`, 'Add the equations: 2x = 16, so x = 8.', 'Add the two equations together so y cancels.') },
    { t: 'Substitution', html: `<p>If one equation already tells you what y equals, <b>swap it in</b>.</p>${ex('y = 2x')}${ex('x + y = 12')}<p>Replace y with 2x: x + 2x = 12, so 3x = 12 and x = <b>4</b>. Then y = 2(4) = <b>8</b>.</p><p>On a graph, the solution is where the two lines <b>cross</b>.</p>`, check: num(5, `${ex('y = 3x')}${ex('x + y = 20')}What is <b>x</b>?`, 'x + 3x = 20, so 4x = 20 and x = 5.', 'Replace y with 3x in the second equation.') },
  ],
  gen() {
    const t = R(0, 5), x = R(1, 12), y = R(1, 9);
    if (t === 0) { const big = Math.max(x, y) + (x === y ? 1 : 0), sm = Math.min(x, y), askX = R(0, 1); return num(askX ? big : sm, `${ex(`x + y = ${big + sm}`)}${ex(`x − y = ${big - sm}`)}What is <b>${askX ? 'x' : 'y'}</b>?`, `Add them: 2x = ${2 * big}, so x = ${big}. Then y = ${big + sm} − ${big} = ${sm}.`, 'Add the two equations. The y terms cancel.'); }
    if (t === 1) { const k = R(2, 5), askX = R(0, 1); return num(askX ? x : k * x, `${ex(`y = ${k}x`)}${ex(`x + y = ${x + k * x}`)}What is <b>${askX ? 'x' : 'y'}</b>?`, `Substitute: x + ${k}x = ${x + k * x} → ${k + 1}x = ${x + k * x} → x = ${x}, y = ${k * x}.`, `Replace y with ${k}x in the second equation.`); }
    if (t === 2) { const c = R(1, 3), a = c + R(1, 4), b = R(-8, 8), d = (a - c) * x + b; return num(x, `Two lines:${ex(`y = ${a}x ${pm(b)}`)}${ex(`y = ${co(c)}x ${pm(d)}`)}At what <b>x</b> do they cross?`, `Set them equal: ${a}x ${pm(b)} = ${co(c)}x ${pm(d)}. Then ${co(a - c)}x = ${n2(d - b)}, so x = ${x}.`, 'Both equal y, so set the right sides equal to each other.'); }
    if (t === 3) { const bg = R(3, 9), dr = R(1, 4), nm = pick(NAMES); return num(bg, `${nm} buys <b>2 burgers and 1 drink</b> for <b>$${2 * bg + dr}</b>. A friend buys <b>1 burger and 1 drink</b> for <b>$${bg + dr}</b>. How much is one <b>burger</b>?`, `Subtract the orders: one extra burger costs $${2 * bg + dr} − $${bg + dr} = $${bg}.`, 'The only difference between the two orders is one burger.', `$${bg}`); }
    if (t === 4) { const a = R(2, 4), A = a * x + y, B = x + y; return num(y, `${ex(`${a}x + y = ${A}`)}${ex(`x + y = ${B}`)}What is <b>y</b>?`, `Subtract the second from the first: ${co(a - 1)}x = ${A - B}, so x = ${x}. Then y = ${B} − ${x} = ${y}.`, 'Subtract one equation from the other to cancel y, find x, then find y.'); }
    const s = x + y, d = 2 * x - y, right = `(${x}, ${y})`; return choice(`Which point solves <b>both</b> equations?${ex(`x + y = ${s}`)}${ex(`2x − y = ${n2(d)}`)}`, right, [`(${y}, ${x})`, `(${x + 1}, ${y - 1})`, `(${x - 1}, ${y + 2})`], `Check ${right}: ${x} + ${y} = ${s} ✔ and 2(${x}) − ${y} = ${n2(d)} ✔.`, 'Plug each point into BOTH equations.');
  } },
];
