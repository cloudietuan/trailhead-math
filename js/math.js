// Math Arena: 10 levels of 6th grade (and a bit of 7th) math.
// Each level: a lesson (steps + interactive widgets + quick checks), a question generator, and a boss.
const ex = s => `<span class="expr">${s}</span>`;
const X = '<i>x</i>';

// Little slider widgets used by lessons
const sl = (name, label, min, max, val, step = 1) => `<label class="sl"><span>${label} <b data-o="${name}">${val}</b></span><input type="range" name="${name}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
function wire(el, draw, fmt = {}) {
  const read = () => { const v = {}; el.querySelectorAll('input[type=range]').forEach(i => { v[i.name] = +i.value; const o = el.querySelector(`[data-o="${i.name}"]`); if (o) o.textContent = fmt[i.name] ? fmt[i.name](+i.value) : n2(+i.value); }); return v; };
  el.addEventListener('input', () => draw(read()));
  draw(read());
}

// Number line SVG from lo to hi with optional marks and a hop arrow
function numberLine(lo, hi, marks = [], hop) {
  const W = 340, x = v => 20 + (v - lo) * (W - 40) / (hi - lo);
  let s = `<svg class="vis nl" viewBox="0 0 ${W} 86">`;
  s += `<line x1="10" y1="56" x2="${W - 10}" y2="56" class="axis"/>`;
  for (let v = lo; v <= hi; v++) {
    const big = v % 5 === 0;
    s += `<line x1="${x(v)}" y1="${big ? 48 : 51}" x2="${x(v)}" y2="${big ? 64 : 61}" class="${v === 0 ? 'zero' : 'tick'}"/>`;
    if (big || hi - lo <= 12) s += `<text x="${x(v)}" y="80" text-anchor="middle" class="${v === 0 ? 'zt' : ''}">${n2(v)}</text>`;
  }
  if (hop) {
    const a = x(hop[0]), b = x(hop[1]), mid = (a + b) / 2;
    s += `<path d="M${a} 50 Q${mid} ${50 - Math.min(44, Math.abs(b - a) * 0.5 + 10)} ${b} 50" class="hop"/><circle cx="${b}" cy="50" r="4" class="hopend"/>`;
  }
  marks.forEach(m => { s += `<circle cx="${x(m.v)}" cy="56" r="8" class="${m.cls || 'mk'}"/>${m.label ? `<text x="${x(m.v)}" y="${m.up ? 12 : 30}" text-anchor="middle" class="ml">${m.label}</text>` : ''}`; });
  return s + '</svg>';
}

// Shape drawings for the area level
const T = (x, y, t, a = 'middle') => `<text x="${x}" y="${y}" text-anchor="${a}">${t}</text>`;
function rectSVG(l, w, u = 'cm') { return `<svg class="vis shape" viewBox="0 0 260 170"><rect x="40" y="25" width="180" height="110" class="sh"/>${T(130, 158, `${l} ${u}`)}${T(32, 84, `${w} ${u}`, 'end')}</svg>`; }
function paraSVG(b, h, u = 'cm') { return `<svg class="vis shape" viewBox="0 0 260 170"><polygon points="30,140 190,140 235,30 75,30" class="sh"/><line x1="75" y1="30" x2="75" y2="140" class="dash"/><rect x="75" y="130" width="10" height="10" class="ra"/>${T(110, 162, `base ${b} ${u}`)}${T(82, 90, `h = ${h} ${u}`, 'start')}</svg>`; }
function triSVG(b, h, u = 'cm') { const ax = R(70, 170); return `<svg class="vis shape" viewBox="0 0 260 170"><polygon points="30,140 230,140 ${ax},25" class="sh"/><line x1="${ax}" y1="25" x2="${ax}" y2="140" class="dash"/><rect x="${ax}" y="130" width="10" height="10" class="ra"/>${T(130, 162, `base ${b} ${u}`)}${T(ax + 8, 90, `h = ${h} ${u}`, 'start')}</svg>`; }
function trapSVG(a, b, h, u = 'cm') { const tw = Math.max(60, 200 * a / b); return `<svg class="vis shape" viewBox="0 0 260 175"><polygon points="30,140 230,140 ${130 + tw / 2},35 ${130 - tw / 2},35" class="sh"/><line x1="${130 - tw / 2 + 6}" y1="35" x2="${130 - tw / 2 + 6}" y2="140" class="dash"/>${T(130, 26, `${a} ${u}`)}${T(130, 162, `${b} ${u}`)}${T(130 - tw / 2 + 14, 95, `h = ${h}`, 'start')}</svg>`; }
function lSVG(W, H, w, h, u = 'm') {
  const s = Math.min(190 / W, 120 / H), x0 = 35, y0 = 20, X1 = x0 + W * s, Y1 = y0 + H * s, nx = x0 + (W - w) * s, ny = y0 + h * s;
  return `<svg class="vis shape" viewBox="0 0 260 175"><polygon points="${x0},${y0} ${nx},${y0} ${nx},${ny} ${X1},${ny} ${X1},${Y1} ${x0},${Y1}" class="sh"/>
  ${T((x0 + X1) / 2, Y1 + 20, `${W} ${u}`)}${T(x0 - 7, (y0 + Y1) / 2 + 5, `${H} ${u}`, 'end')}${T((nx + X1) / 2, ny - 7, `${w} ${u}`)}${T(nx + 6, (y0 + ny) / 2 + 5, `${h} ${u}`, 'start')}</svg>`;
}
function boxSVG(l, w, h, u = 'in') {
  return `<svg class="vis shape" viewBox="0 0 260 170"><polygon points="50,60 90,28 210,28 170,60" class="sh2"/><polygon points="170,60 210,28 210,110 170,142" class="sh3"/><polygon points="50,60 170,60 170,142 50,142" class="sh"/>
  ${T(110, 162, `${l} ${u}`)}${T(198, 136, `${w} ${u}`, 'start')}${T(42, 106, `${h} ${u}`, 'end')}</svg>`;
}
const factors = n => { const f = []; for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i); return f; };
const chips = arr => `<div class="chips">${arr.map(v => `<span>${n2(v)}</span>`).join('')}</div>`;

const MATH = [
// 1 ───────────────────────────────────────────
{ id: 'neg', name: 'Below Zero', title: 'Negative Numbers', std: '6.NS.5–7, 7.NS.1–2',
  boss: { name: 'Chill Bill', look: { color: '#9FE3FF', eyes: 'angry', mouth: 'teeth', acc: 'horns' }, taunt: 'Everything I touch drops below zero. Can you handle the cold?' },
  fmt: 'Type a number. Use - for negative, like -7.',
  lesson: [
    { t: 'Numbers below zero', html: `<p>Negative numbers are <b>less than zero</b>. You see them everywhere: <b>−5°</b> on a cold morning, the <b>B2</b> basement floor, or owing a friend <b>10 coins</b>.</p><p>On a number line, negatives sit to the <b>left</b> of 0. The further left, the smaller. So <b>−8 is smaller than −2</b>, even though 8 is bigger than 2.</p>`,
      widget(el) { el.innerHTML = sl('v', 'Move the dot:', -10, 10, -6) + '<div class="out"></div>'; wire(el, ({ v }) => { el.querySelector('.out').innerHTML = numberLine(-10, 10, [{ v, label: n2(v) }, { v: -v, cls: 'mk2', label: v ? `opposite: ${n2(-v)}` : '', up: true }]) + `<p class="note">${v < 0 ? `${n2(v)} is ${-v} steps <b>left</b> of zero.` : v > 0 ? `${v} is ${v} steps <b>right</b> of zero.` : 'Zero is neither positive nor negative.'}</p>`; }); },
      check: choice('Which number is <b>greater</b>?', '−2', ['−8', '−11'], '−2 is furthest right on the number line, so it is the greatest.', 'Greater = further right.') },
    { t: 'Adding and subtracting', html: `<p>Adding a <b>positive</b> moves you <b>right</b>. Adding a <b>negative</b> moves you <b>left</b>.</p><p>Subtracting a negative flips into adding: <b>5 − (−3) = 5 + 3 = 8</b>. Two minus signs in a row make a plus.</p>`,
      widget(el) { el.innerHTML = sl('a', 'Start at', -10, 10, -4) + sl('b', 'Add', -10, 10, 7) + '<div class="out"></div>'; wire(el, ({ a, b }) => { const v = a + b; el.querySelector('.out').innerHTML = `<p class="eq">${n2(a)} + ${sgn(b)} = <b>${n2(v)}</b></p>` + (v >= -12 && v <= 12 ? numberLine(-12, 12, [{ v: a, cls: 'mk2' }, { v, label: n2(v) }], [a, v]) : ''); }); },
      check: num(5, `Solve it.${ex('−4 + 9')}`, 'Start at −4 and move 9 right. You land on 5.', 'Start at −4, then move right.') },
    { t: 'Absolute value', html: `<p><b>Absolute value</b> means distance from zero. Distance is never negative.</p><p>|−7| = 7 and |7| = 7. Both are 7 steps from 0.</p>`, check: num(12, `What is ${ex('|−12|')}`, '−12 is 12 steps from zero.', 'How far is it from 0?') },
    { t: 'Multiplying negatives', html: `<p>The sign rules for × and ÷:</p><ul><li><b>Same signs</b> → positive. (−3) × (−4) = <b>12</b></li><li><b>Different signs</b> → negative. (−3) × 4 = <b>−12</b></li></ul>`, check: num(-20, `Solve it.${ex('5 × (−4)')}`, 'Different signs give a negative: 5 × 4 = 20, so the answer is −20.', 'Different signs → negative.') },
  ],
  gen() {
    const t = R(0, 6);
    if (t === 0) { const a = R(-12, 12), b = R(-12, -1), v = a + b; return num(v, `Solve it.${ex(`${n2(a)} + ${sgn(b)}`)}`, `Adding a negative moves left. Start at ${n2(a)}, move ${-b} left, land on ${n2(v)}.`, 'Adding a negative number moves LEFT on the number line.'); }
    if (t === 1) { const a = R(-12, 8), b = R(3, 15), v = a - b; return num(v, `Solve it.${ex(`${n2(a)} − ${b}`)}`, `Subtracting moves left. ${n2(a)} − ${b} = ${n2(v)}.`, 'Subtracting a positive number moves LEFT.'); }
    if (t === 2) { const a = R(-10, 10), b = R(-12, -2), v = a - b; return num(v, `Solve it.${ex(`${n2(a)} − ${sgn(b)}`)}`, `Subtracting a negative is adding: ${n2(a)} + ${-b} = ${n2(v)}.`, 'Two minus signs in a row (− −) turn into a plus.'); }
    if (t === 3) { const set = new Set(); while (set.size < 3) set.add(set.size < 2 ? R(-15, -1) : R(-9, 5)); const vals = shuffle([...set]); const big = R(0, 1); const v = big ? Math.max(...vals) : Math.min(...vals);
      return choice(`Which number is the <b>${big ? 'greatest' : 'least'}</b>?`, n2(v), vals.filter(x => x !== v).map(n2), `On a number line, ${n2(v)} is furthest ${big ? 'right' : 'left'}, so it is the ${big ? 'greatest' : 'least'}.`, big ? 'Further RIGHT means greater. −2 beats −9!' : 'Further LEFT means less. −9 is less than −2!'); }
    if (t === 4) { const a = R(-30, -2); return num(-a, `What is ${ex(`|${n2(a)}|`)}`, `Absolute value is distance from 0. ${n2(a)} is ${-a} steps from 0.`, 'Absolute value = distance from zero. Distance is never negative.'); }
    if (t === 5) { let a = R(-9, 9) || 3; const b = R(-9, -2), div = R(0, 2) === 0; if (div) { const v = a; const p = a * b; return num(v, `Solve it.${ex(`${n2(p)} ÷ ${sgn(b)}`)}`, `${Math.abs(p)} ÷ ${Math.abs(b)} = ${Math.abs(v)}. ${(p < 0) === (b < 0) ? 'Same signs, so positive' : 'Different signs, so negative'}: ${n2(v)}.`, 'Same signs → positive. Different signs → negative.'); }
      const v = a * b; return num(v, `Solve it.${ex(`${sgn(a)} × ${sgn(b)}`)}`, `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(v)}. ${(a < 0) === (b < 0) ? 'Same signs, so positive' : 'Different signs, so negative'}: ${n2(v)}.`, 'Same signs → positive. Different signs → negative.'); }
    const k = R(0, 2);
    if (k === 0) { const s = R(-15, -2), r = R(5, 22), v = s + r; return num(v, `At 6 a.m. it was <b>${n2(s)}°F</b>. By noon it warmed up <b>${r}°</b>. What was the temperature at noon?`, `${n2(s)} + ${r} = ${n2(v)}°F.`, 'Warming up means adding.'); }
    if (k === 1) { const d = R(5, 40), e = R(5, 30), v = -(d + e); return num(v, `A diver is at <b>${n2(-d)} feet</b>. She swims down <b>${e} more feet</b>. What is her new depth?`, `${n2(-d)} − ${e} = ${n2(v)} feet.`, 'Going down makes the number more negative.'); }
    const h = R(5, 20), o = R(h + 3, h + 25), v = h - o; return num(v, `You have <b>${h} coins</b> but you owe a friend <b>${o} coins</b>. If you pay back everything you can, what is your balance?`, `${h} − ${o} = ${n2(v)}. You still owe ${-v} coins.`, 'Start with what you have, subtract what you owe.');
  } },

// 2 ───────────────────────────────────────────
{ id: 'pow', name: 'Power Up', title: 'Exponents & Order of Operations', std: '6.EE.1–2',
  boss: { name: 'Mega Muncher', look: { color: '#FF8A3D', eyes: 'one', mouth: 'teeth', acc: 'spikes' }, taunt: 'I get BIGGER every time I eat. Squared! Cubed! CHOMP!' },
  fmt: 'Type a whole number.',
  lesson: [
    { t: 'Exponents = repeated multiplying', html: `<p>An exponent tells you how many times to multiply a number by itself.</p><p class="eq">2<sup>5</sup> = 2 × 2 × 2 × 2 × 2 = <b>32</b></p><p>The big number (2) is the <b>base</b>. The small raised number (5) is the <b>exponent</b>. Careful: 2<sup>5</sup> is <b>not</b> 2 × 5.</p>`,
      widget(el) { el.innerHTML = sl('b', 'Base', 2, 10, 3) + sl('e', 'Exponent', 1, 6, 4) + '<div class="out"></div>'; wire(el, ({ b, e }) => { const v = b ** e; el.querySelector('.out').innerHTML = `<p class="eq">${b}<sup>${e}</sup> = ${Array(e).fill(b).join(' × ')} = <b>${n2(v)}</b></p><div class="growbar"><span style="width:${Math.min(100, Math.log10(v + 1) / 6 * 100)}%"></span></div><p class="note">Exponents grow FAST. That's why bosses love them.</p>`; }); },
      check: num(81, `Solve it.${ex('3<sup>4</sup>')}`, '3 × 3 × 3 × 3 = 81.', 'Multiply 3 by itself 4 times.') },
    { t: 'Special powers', html: `<ul><li>Anything to the power of <b>1</b> is itself: 9<sup>1</sup> = 9</li><li>Any number (not 0) to the power of <b>0</b> is <b>1</b></li><li><b>10<sup>n</sup></b> is a 1 with n zeros: 10<sup>4</sup> = 10,000</li><li>"Squared" means <sup>2</sup>, "cubed" means <sup>3</sup></li><li>A <b>square root</b> goes backwards: √49 = 7 because 7 × 7 = 49</li></ul>`, check: num(100000, `Solve it.${ex('10<sup>5</sup>')}`, 'A 1 followed by 5 zeros: 100,000.', 'Count the zeros.') },
    { t: 'Order of operations', html: `<p>When a problem has lots of steps, do them in this order:</p><ol class="pemdas"><li><b>P</b>arentheses ( )</li><li><b>E</b>xponents</li><li><b>M</b>ultiply and <b>D</b>ivide, left to right</li><li><b>A</b>dd and <b>S</b>ubtract, left to right</li></ol><p>Example: 3 + 2<sup>3</sup> × 2 → exponent first: 3 + 8 × 2 → multiply: 3 + 16 → <b>19</b>.</p>`, check: num(18, `Solve it.${ex('(1 + 2)<sup>2</sup> × 2')}`, 'Parentheses: 1 + 2 = 3. Exponent: 3² = 9. Multiply: 9 × 2 = 18.', 'Parentheses, then the exponent, then multiply.') },
  ],
  gen() {
    const t = R(0, 6);
    if (t === 0) { const b = R(2, 9), e = b <= 3 ? R(2, 5) : b <= 5 ? R(2, 4) : R(2, 3), v = b ** e; return num(v, `Solve it.${ex(`${b}<sup>${e}</sup>`)}`, `${b}<sup>${e}</sup> = ${Array(e).fill(b).join(' × ')} = ${n2(v)}.`, `Multiply ${b} by itself ${e} times. Not ${b} × ${e}!`); }
    if (t === 1) { const b = R(2, 12), e = R(3, 6); return num(e, `Write it as a power. What is the exponent?${ex(`${Array(e).fill(b).join(' × ')} = ${b}<sup>?</sup>`)}`, `${b} shows up ${e} times, so it's ${b}<sup>${e}</sup>.`, 'Count how many times the number is multiplied.'); }
    if (t === 2) { const f = R(0, 3);
      if (f === 0) { const a = R(1, 20), b = R(2, 5), c = R(2, 4), v = a + b * b * c; return num(v, `Solve it.${ex(`${a} + ${b}<sup>2</sup> × ${c}`)}`, `Exponent first: ${b}² = ${b * b}. Multiply: ${b * b} × ${c} = ${b * b * c}. Add: ${a} + ${b * b * c} = ${v}.`, 'Exponents first, then multiply, then add.'); }
      if (f === 1) { const a = R(1, 5), b = R(1, 5), s = (a + b) ** 2, c = R(1, s - 1), v = s - c; return num(v, `Solve it.${ex(`(${a} + ${b})<sup>2</sup> − ${c}`)}`, `Parentheses: ${a + b}. Exponent: ${a + b}² = ${s}. Subtract: ${s} − ${c} = ${v}.`, 'Parentheses first, then the exponent.'); }
      if (f === 2) { let a, b, c; do { a = R(5, 12); b = R(2, 6); c = R(2, 6); } while (a * a <= b * c); const v = a * a - b * c; return num(v, `Solve it.${ex(`${a}<sup>2</sup> − ${b} × ${c}`)}`, `Exponent: ${a}² = ${a * a}. Multiply: ${b} × ${c} = ${b * c}. Subtract: ${a * a} − ${b * c} = ${v}.`, 'Exponent and multiplication happen before subtracting.'); }
      const a = R(5, 12), b = R(Math.max(1, a - 6), a - 1), v = 2 * (a - b) ** 2; return num(v, `Solve it.${ex(`2 × (${a} − ${b})<sup>2</sup>`)}`, `Parentheses: ${a - b}. Exponent: ${(a - b) ** 2}. Multiply: 2 × ${(a - b) ** 2} = ${v}.`, 'Inside the parentheses first.'); }
    if (t === 3) { if (R(0, 1)) { const k = R(2, 6); return num(10 ** k, `Solve it.${ex(`10<sup>${k}</sup>`)}`, `A 1 followed by ${k} zeros: ${n2(10 ** k)}.`, 'Count the zeros.'); } const n = R(2, 9), k = R(2, 4); return num(n * 10 ** k, `Solve it.${ex(`${n} × 10<sup>${k}</sup>`)}`, `10<sup>${k}</sup> = ${n2(10 ** k)}, and ${n} × ${n2(10 ** k)} = ${n2(n * 10 ** k)}.`, `10<sup>${k}</sup> is a 1 with ${k} zeros.`); }
    if (t === 4) { const s = R(2, 15); return num(s, `Solve it.${ex(`√${s * s}`)}`, `${s} × ${s} = ${s * s}, so √${s * s} = ${s}.`, 'What number times itself makes it?'); }
    if (t === 5) { const b = R(-5, -2), e = R(2, 3), v = b ** e; return num(v, `Solve it.${ex(`(${n2(b)})<sup>${e}</sup>`)}`, `${Array(e).fill(sgn(b)).join(' × ')} = ${n2(v)}. ${e === 2 ? 'Two negatives make a positive.' : 'Three negatives make a negative.'}`, 'Count the negative signs. Even number of them → positive.'); }
    const a = R(2, 4), b = R(2, 3); return num(a ** 2 + b ** 3, `Solve it.${ex(`${a}<sup>2</sup> + ${b}<sup>3</sup>`)}`, `${a}² = ${a * a} and ${b}³ = ${b ** 3}. ${a * a} + ${b ** 3} = ${a * a + b ** 3}.`, 'Do each exponent, then add.');
  } },

// 3 ───────────────────────────────────────────
{ id: 'gcf', name: 'Factor Factory', title: 'Factors, GCF & LCM', std: '6.NS.4',
  boss: { name: 'Factorbot 3000', look: { color: '#B9C4D6', eyes: 'robot', mouth: 'flat', acc: 'antenna' }, taunt: 'FACTORING... FACTORING... You cannot out-factor a factory.' },
  fmt: 'Type a whole number.',
  lesson: [
    { t: 'Factors and the GCF', html: `<p><b>Factors</b> are numbers that divide in evenly. Factors of 12: 1, 2, 3, 4, 6, 12.</p><p>The <b>GCF</b> (greatest common factor) is the biggest factor two numbers share.</p>`,
      widget(el) { el.innerHTML = sl('a', 'First number', 2, 48, 18) + sl('b', 'Second number', 2, 48, 24) + '<div class="out"></div>'; wire(el, ({ a, b }) => { const fa = factors(a), fb = factors(b), g = gcd(a, b); const row = (n, f, o) => `<p class="flist"><b>${n}:</b> ${f.map(x => `<span class="${o.includes(x) ? (x === g ? 'hit big' : 'hit') : ''}">${x}</span>`).join('')}</p>`; el.querySelector('.out').innerHTML = row(a, fa, fb) + row(b, fb, fa) + `<p class="note">Shared factors are highlighted. GCF = <b>${g}</b></p>`; }); },
      check: num(6, 'What is the GCF of <b>18</b> and <b>24</b>?', 'Both lists share 1, 2, 3 and 6. The greatest is 6.', 'List the factors of each. Find the biggest match.') },
    { t: 'Multiples and the LCM', html: `<p><b>Multiples</b> are what you get when you skip count: 4, 8, 12, 16...</p><p>The <b>LCM</b> (least common multiple) is the first number on both lists.</p>`,
      widget(el) { el.innerHTML = sl('a', 'First number', 2, 12, 4) + sl('b', 'Second number', 2, 12, 6) + '<div class="out"></div>'; wire(el, ({ a, b }) => { const L = lcm(a, b); const row = n => `<p class="flist"><b>${n}:</b> ${Array.from({ length: Math.min(12, Math.ceil(L / n) + 2) }, (_, i) => (i + 1) * n).map(x => `<span class="${x === L ? 'hit big' : ''}">${x}</span>`).join('')}</p>`; el.querySelector('.out').innerHTML = row(a) + row(b) + `<p class="note">LCM = <b>${L}</b></p>`; }); },
      check: num(12, 'What is the LCM of <b>4</b> and <b>6</b>?', '4, 8, 12... and 6, 12... They first meet at 12.', 'Skip count both. Where do they first match?') },
    { t: 'Which one do I use?', html: `<ul><li><b>GCF</b> when you split things into the <b>biggest equal groups</b>. (Like making identical loot bags.)</li><li><b>LCM</b> when you want things to <b>line up</b>. (Like buying hot dogs and buns so none are left over.)</li></ul><p>Bonus: the GCF lets you factor sums. 36 + 8 = 4 × (9 + 2).</p>`, check: num(24, 'Hot dogs come in packs of <b>8</b>. Buns come in packs of <b>6</b>. What is the smallest number of hot dogs you can buy to have exactly the same number of buns?', 'The LCM of 8 and 6 is 24.', 'Things lining up → LCM.') },
  ],
  gen() {
    const t = R(0, 5);
    const pair = () => { let m, n; do { m = R(1, 9); n = R(1, 9); } while (m === n || gcd(m, n) !== 1); return [m, n]; };
    if (t === 0 || t === 2) { let g, m, n; do { g = R(2, 12); [m, n] = pair(); } while (g * m > 100 || g * n > 100); const a = g * m, b = g * n;
      if (t === 2) return num(g, `You have <b>${a}</b> red gems and <b>${b}</b> blue gems. You want identical loot bags with nothing left over. What is the greatest number of bags you can make?`, `The GCF of ${a} and ${b} is ${g}. Each bag gets ${m} red and ${n} blue.`, 'Biggest equal groups → GCF.');
      return num(g, `What is the GCF of <b>${a}</b> and <b>${b}</b>?`, `Factors of ${a}: ${factors(a).join(', ')}. Factors of ${b}: ${factors(b).join(', ')}. The greatest shared one is ${g}.`, 'List the factors of each. Find the biggest match.'); }
    if (t === 1) { let a, b; do { a = R(2, 15); b = R(2, 15); } while (a === b || lcm(a, b) > 120 || lcm(a, b) === Math.max(a, b) && R(0, 2)); const L = lcm(a, b); return num(L, `What is the LCM of <b>${a}</b> and <b>${b}</b>?`, `Multiples of ${a}: ${Array.from({ length: L / a }, (_, i) => (i + 1) * a).join(', ')}. ${L} is also a multiple of ${b}. LCM = ${L}.`, 'Skip count by the bigger number until the smaller one divides it.'); }
    if (t === 3) { const [a, b] = pick([[8, 6], [10, 8], [12, 8], [6, 4], [10, 6], [12, 9], [9, 6], [15, 10], [12, 10]]); const L = lcm(a, b); const thing = pick([['Juice boxes', 'straws'], ['Cards', 'sleeves'], ['Hot dogs', 'buns'], ['Burgers', 'buns']]); return num(L, `${thing[0]} come in packs of <b>${a}</b>. ${thing[1][0].toUpperCase() + thing[1].slice(1)} come in packs of <b>${b}</b>. What is the smallest number of ${thing[0].toLowerCase()} you can buy to match the ${thing[1]} exactly?`, `The LCM of ${a} and ${b} is ${L}.`, 'Making things line up → LCM.'); }
    if (t === 4) { let g, m, n; do { g = R(2, 9); [m, n] = pair(); } while (m < 2 || n < 2); const a = g * m, b = g * n; return num(n, `Fill in the missing number.${ex(`${a} + ${b} = ${g} × (${m} + ?)`)}`, `${a} = ${g} × ${m} and ${b} = ${g} × ${n}. So ${a} + ${b} = ${g} × (${m} + ${n}).`, `What times ${g} makes ${b}?`); }
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47], comps = [9, 15, 21, 25, 27, 33, 35, 39, 49, 51, 57, 12, 14, 16, 18];
    const p = pick(primes.slice(3)); return choice('Which number is <b>prime</b>?', String(p), shuffle(comps).slice(0, 3).map(String), `${p} has exactly two factors: 1 and ${p}. The others can be split into smaller factors.`, 'A prime number can only be divided evenly by 1 and itself.');
  } },

// 4 ───────────────────────────────────────────
{ id: 'ratio', name: 'Ratio Rumble', title: 'Ratios & Rates', std: '6.RP.1–3',
  boss: { name: 'Ratzilla', look: { color: '#A6A3C7', eyes: 'angry', mouth: 'fangs', acc: 'ears' }, taunt: 'For every 1 of you, there are 3 of me. Do the math!' },
  fmt: 'Type a number. Money can be like 2.50.',
  lesson: [
    { t: 'What is a ratio?', html: `<p>A <b>ratio</b> compares two amounts. 3 gems for every 2 coins is <b>3 : 2</b> (say "3 to 2"). Order matters!</p><p>Equivalent ratios scale both parts by the <b>same number</b>, like making a recipe bigger.</p>`,
      widget(el) { el.innerHTML = sl('k', 'Batches', 1, 6, 1) + '<div class="out"></div>'; wire(el, ({ k }) => { el.querySelector('.out').innerHTML = `<div class="ratio-row"><div><b>${3 * k}</b> gems<br>${'<i class="rgem"></i>'.repeat(3 * k)}</div><div class="ratio-c">:</div><div><b>${2 * k}</b> coins<br>${'<i class="rcn"></i>'.repeat(2 * k)}</div></div><table class="rt"><tr><th>Gems</th>${[1, 2, 3, 4, 5, 6].map(i => `<td class="${i === k ? 'on' : ''}">${3 * i}</td>`).join('')}</tr><tr><th>Coins</th>${[1, 2, 3, 4, 5, 6].map(i => `<td class="${i === k ? 'on' : ''}">${2 * i}</td>`).join('')}</tr></table>`; }); },
      check: num(15, 'A team has <b>2 healers for every 5 attackers</b>. If there are <b>6 healers</b>, how many attackers?', '6 is 2 × 3, so multiply 5 by 3 too: 15.', 'What did you multiply 2 by to get 6?') },
    { t: 'Unit rates', html: `<p>A <b>unit rate</b> tells you how much for <b>one</b>. Divide!</p><ul><li>$12 for 4 snacks → $12 ÷ 4 = <b>$3 each</b></li><li>150 miles in 3 hours → 150 ÷ 3 = <b>50 miles per hour</b></li></ul>`, check: num(3, '<b>5 skins</b> cost <b>15 gems</b>. How many gems for 1 skin?', '15 ÷ 5 = 3 gems each.', 'Divide the total by how many.') },
    { t: 'Find the better deal', html: `<p>To compare deals, find the unit price of each. <b>Lower price per item wins.</b></p><p>4 for $6 → $1.50 each. 6 for $8 → $1.33 each. The second deal is better.</p>`, check: choice('Which deal is better?', '10 for $5', ['4 for $3', 'They are the same']), why: '' },
  ],
  gen() {
    const t = R(0, 5), nm = pick(NAMES);
    if (t === 0) { const n = R(3, 9), e = R(2, 12), tot = n * e; return num(e, `<b>${n} packs</b> of trading cards cost <b>$${tot}</b>. How much does 1 pack cost?`, `$${tot} ÷ ${n} = $${e} per pack.`, 'Divide the total cost by the number of packs.', '$' + e); }
    if (t === 1) { const h = R(2, 6), m = pick([15, 20, 30, 45, 50, 55, 60, 65]); return num(m, `A train travels <b>${h * m} miles</b> in <b>${h} hours</b>. How many miles per hour is that?`, `${h * m} ÷ ${h} = ${m} miles per hour.`, 'Miles ÷ hours.'); }
    if (t === 2) { let a, b; do { a = R(1, 9); b = R(2, 9); } while (a === b); const k = R(2, 8); return num(b * k, `Find the missing number.${ex(`${a} : ${b} = ${a * k} : ?`)}`, `${a} × ${k} = ${a * k}, so multiply ${b} by ${k} too: ${b * k}.`, `What did you multiply ${a} by?`); }
    if (t === 3) { const a = R(2, 5), b = R(2, 6), k = R(2, 6); return num(b * k, `A smoothie uses <b>${a} cups of berries</b> for every <b>${b} cups of yogurt</b>. ${nm} uses <b>${a * k} cups of berries</b>. How many cups of yogurt?`, `${a * k} ÷ ${a} = ${k} batches. ${k} × ${b} = ${b * k} cups of yogurt.`, 'How many batches is that?'); }
    if (t === 4) { const a = R(1, 5), b = R(1, 5), k = R(2, 8), tot = (a + b) * k; return num(a * k, `The ratio of red to blue marbles is <b>${a} : ${b}</b>. There are <b>${tot}</b> marbles in all. How many are red?`, `Each group of ${a + b} marbles has ${a} red. ${tot} ÷ ${a + b} = ${k} groups. ${k} × ${a} = ${a * k} red.`, `Each "group" has ${a} + ${b} = ${a + b} marbles.`); }
    let u1, u2; do { u1 = pick([0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]); u2 = pick([0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]); } while (u1 === u2);
    const n1 = R(2, 6), n2_ = R(3, 9), p1 = n1 * u1, p2 = n2_ * u2, A = `${n1} for $${p1.toFixed(2)}`, B = `${n2_} for $${p2.toFixed(2)}`;
    return choice('Which deal is better?', u1 < u2 ? A : B, [u1 < u2 ? B : A, 'They cost the same'], `Unit prices: $${p1.toFixed(2)} ÷ ${n1} = $${u1.toFixed(2)} each, and $${p2.toFixed(2)} ÷ ${n2_} = $${u2.toFixed(2)} each. Cheaper per item wins.`, 'Find the price for ONE item in each deal.');
  } },

// 5 ───────────────────────────────────────────
{ id: 'pct', name: 'Percent Power', title: 'Percents', std: '6.RP.3, 7.RP.3',
  boss: { name: 'Percy Cent', look: { color: '#5BE36B', eyes: 'three', mouth: 'grin', acc: 'cap', cap: '#FF4F7B' }, taunt: 'EVERYTHING is 300% off today! ...Wait, that can\'t be right.' },
  fmt: 'Type a number. Money can be like 7.50. The % sign is optional.',
  lesson: [
    { t: 'Percent means "per 100"', html: `<p><b>45%</b> means 45 out of 100. As a decimal it's 0.45. As a fraction it's 45/100.</p>`,
      widget(el) { el.innerHTML = sl('p', 'Percent', 0, 100, 35) + '<div class="out"></div>'; wire(el, ({ p }) => { el.querySelector('.out').innerHTML = `<div class="hgrid">${Array.from({ length: 100 }, (_, i) => `<i class="${i < p ? 'on' : ''}"></i>`).join('')}</div><p class="eq">${p}% = ${p}/100 = ${(p / 100).toFixed(2).replace(/\.?0+$/, '') || 0}</p>`; }, { p: v => v + '%' }); },
      check: num(60, 'What percent is <b>3/5</b>?', '3/5 = 6/10 = 60/100 = 60%.', 'Make the bottom 100.') },
    { t: 'Percent of a number', html: `<p>To find a percent of a number, turn the percent into a decimal and multiply.</p><p class="eq">25% of 80 = 0.25 × 80 = <b>20</b></p><p>Shortcuts: <b>10%</b> → move the decimal one place left. <b>50%</b> → half. <b>25%</b> → a quarter.</p>`,
      widget(el) { el.innerHTML = sl('p', 'Percent', 5, 100, 25, 5) + sl('n', 'Of', 20, 200, 80, 20) + '<div class="out"></div>'; wire(el, ({ p, n }) => { el.querySelector('.out').innerHTML = `<p class="eq">${p}% of ${n} = ${p / 100} × ${n} = <b>${r4(p * n / 100)}</b></p>`; }, { p: v => v + '%' }); },
      check: num(10, `What is ${ex('20% of 50')}`, '0.20 × 50 = 10.', '10% of 50 is 5. So 20% is double that.') },
    { t: 'Sales and scores', html: `<ul><li><b>Sale price</b> = price − discount. A $40 game 25% off: 25% of 40 = 10, so it costs <b>$30</b>.</li><li><b>What percent?</b> Divide part by whole, then × 100. 18 out of 24 → 0.75 → <b>75%</b>.</li></ul>`, check: num(30, 'A <b>$40</b> game is <b>25% off</b>. What is the sale price?', '25% of $40 = $10 off. $40 − $10 = $30.', 'Find the discount first, then subtract.', '$30') },
  ],
  gen() {
    const t = R(0, 5);
    if (t === 0) { const p = pick([10, 20, 25, 50, 75, 5, 15, 30, 40, 60]), unit = 100 / gcd(p, 100); let n; do { n = R(1, 20) * unit; } while (n > 400); const v = p * n / 100; return num(v, `What is ${ex(`${p}% of ${n}`)}`, `${p}% = ${p / 100}. ${p / 100} × ${n} = ${v}.`, p === 50 ? 'Half of it!' : p === 25 ? 'A quarter of it. Divide by 4.' : 'Find 10% first by moving the decimal one place left.'); }
    if (t === 1) { let price, p; do { price = pick([20, 40, 60, 80, 24, 48, 120, 36, 50, 200]); p = pick([10, 25, 50, 20, 30, 75]); } while (price * p % 100); const off = price * p / 100, v = price - off; return num(v, `A <b>$${price}</b> ${pick(['skateboard', 'game', 'hoodie', 'controller', 'pair of shoes'])} is <b>${p}% off</b>. What is the sale price?`, `${p}% of $${price} = $${off} off. $${price} − $${off} = $${v}.`, 'Find the discount, then subtract it from the price.', '$' + v); }
    if (t === 2) { let w, p; do { w = pick([20, 25, 50, 40, 10, 200, 80, 60]); p = pick([10, 20, 25, 30, 40, 50, 60, 75, 80, 90]); } while (w * p % 100); const part = w * p / 100; return num(p, `You got <b>${part} out of ${w}</b> questions right. What percent is that?`, `${part} ÷ ${w} = ${p / 100}. × 100 = ${p}%.`, 'Part ÷ whole, then × 100.', p + '%'); }
    if (t === 3) { const p = pick([10, 20, 25, 50]), w = R(2, 20) * (100 / p), part = w * p / 100; return num(w, `${ex(`${p}% of what number is ${part}?`)}`, `If ${p}% is ${part}, then 100% is ${part} × ${100 / p} = ${w}.`, `${p}% fits into 100% ${100 / p} times.`); }
    if (t === 4) { if (R(0, 1)) { const b = pick([2, 4, 5, 10, 20, 25, 50]); let a; do { a = R(1, b - 1); } while (gcd(a, b) !== 1 && b !== 10); const v = a / b * 100; return num(v, `Write ${fr(a, b)} as a percent.`, `${fr(a, b)} = ${fr(v, 100)} = ${v}%.`, 'Make the bottom number 100.', v + '%'); }
      const v = R(1, 99); return num(v, `Write <b>${(v / 100).toFixed(2)}</b> as a percent.`, `Move the decimal two places right: ${v}%.`, 'Multiply by 100.', v + '%'); }
    const meal = pick([20, 40, 50, 60, 80, 30]), tip = pick([15, 20, 10, 25]), v = meal * tip / 100; return num(v, `Dinner costs <b>$${meal}</b>. You leave a <b>${tip}% tip</b>. How much is the tip?`, `${tip}% of $${meal} = ${tip / 100} × ${meal} = $${v}.`, 'Find 10% first, then build up.', '$' + (v % 1 ? v.toFixed(2) : v));
  } },

// 6 ───────────────────────────────────────────
{ id: 'divf', name: 'Flip It', title: 'Dividing Fractions', std: '6.NS.1',
  boss: { name: 'Flipper Shark', look: { color: '#5E8BFF', eyes: 'angry', mouth: 'teeth', acc: 'wings' }, taunt: 'Keep. Change. FLIP! I\'ll flip your answers upside down!' },
  fmt: 'Type a whole number or a fraction like 3/4 or 1 1/2.',
  lesson: [
    { t: 'How many fit?', html: `<p>Dividing asks: <b>how many groups fit?</b></p><p class="eq">3 ÷ ${fr(1, 4)} = "how many quarters fit in 3?" = <b>12</b></p>`,
      widget(el) { el.innerHTML = sl('w', 'Wholes', 1, 4, 3) + sl('d', 'Cut into', 2, 6, 4) + '<div class="out"></div>'; wire(el, ({ w, d }) => { let s = '<div class="pieces">'; for (let i = 0; i < w; i++) s += `<div class="whole">${Array.from({ length: d }, () => '<i></i>').join('')}</div>`; el.querySelector('.out').innerHTML = s + `</div><p class="eq">${w} ÷ ${fr(1, d)} = <b>${w * d}</b> pieces</p>`; }, { d: v => `${v} pieces` }); },
      check: num(10, `Solve it.${ex(`5 ÷ ${fr(1, 2)}`)}`, 'Each whole has 2 halves. 5 × 2 = 10.', 'How many halves fit in 5?') },
    { t: 'Keep, Change, Flip', html: `<p>The fast way to divide by a fraction:</p><ol><li><b>Keep</b> the first fraction</li><li><b>Change</b> ÷ to ×</li><li><b>Flip</b> the second fraction</li></ol><p class="eq">${fr(2, 3)} ÷ ${fr(1, 6)} = ${fr(2, 3)} × ${fr(6, 1)} = ${fr(12, 3)} = <b>4</b></p>`, check: num(6, `Solve it.${ex(`${fr(3, 4)} ÷ ${fr(1, 8)}`)}`, `Keep, change, flip: ${fr(3, 4)} × ${fr(8, 1)} = ${fr(24, 4)} = 6.`, 'Flip 1/8 to 8/1, then multiply.') },
    { t: 'Whole numbers and mixed numbers', html: `<ul><li>A whole number is a fraction over 1: 4 = ${fr(4, 1)}. So ${fr(1, 2)} ÷ 4 = ${fr(1, 2)} × ${fr(1, 4)} = <b>${fr(1, 8)}</b></li><li>Turn mixed numbers into improper fractions first: 2${fr(1, 2)} = ${fr(5, 2)}</li></ul>`, check: fracQ(1, 8, `Solve it.${ex(`${fr(1, 2)} ÷ 4`)}`, `${fr(1, 2)} × ${fr(1, 4)} = ${fr(1, 8)}.`, 'Flip 4 into 1/4, then multiply.') },
  ],
  gen() {
    const t = R(0, 5);
    if (t === 0) { const w = R(2, 9), d = R(2, 8); return num(w * d, `Solve it.${ex(`${w} ÷ ${fr(1, d)}`)}`, `How many ${fr(1, d)}s fit in ${w}? Each whole has ${d}, so ${w} × ${d} = ${w * d}.`, `How many pieces of size 1/${d} fit in ${w}?`); }
    if (t === 1) { const b = R(2, 10), a = R(1, b - 1), d = R(2, 10), c = R(1, d - 1); return fracQ(a * d, b * c, `Solve it.${ex(`${fr(a, b)} ÷ ${fr(c, d)}`)}`, `Keep, change, flip: ${fr(a, b)} × ${fr(d, c)} = ${fr(a * d, b * c)}${simp(a * d, b * c)[1] !== b * c || a * d > b * c ? ' = ' + fracHTML(a * d, b * c) : ''}.`, `Flip ${c}/${d} to ${d}/${c}, then multiply.`); }
    if (t === 2) { const b = R(2, 6), a = R(1, b - 1), w = R(2, 6); return fracQ(a, b * w, `Solve it.${ex(`${fr(a, b)} ÷ ${w}`)}`, `${w} = ${fr(w, 1)}. Flip it: ${fr(a, b)} × ${fr(1, w)} = ${fr(a, b * w)}${gcd(a, b * w) > 1 ? ' = ' + fracHTML(a, b * w) : ''}.`, `Dividing by ${w} is the same as multiplying by 1/${w}.`); }
    if (t === 3) { const d = pick([2, 3, 4]), n = R(1, d - 1), w = R(1, 4), k = R(2, 4), top = w * d + n; return fracQ(top * k, d, `Solve it.${ex(`${w}${fr(n, d)} ÷ ${fr(1, k)}`)}`, `${w}${fr(n, d)} = ${fr(top, d)}. Flip: ${fr(top, d)} × ${k} = ${fr(top * k, d)}${simp(top * k, d)[1] !== d || top * k > d ? ' = ' + fracHTML(top * k, d) : ''}.`, 'Turn the mixed number into an improper fraction first.'); }
    if (t === 4) { const b = pick([2, 3, 4]), m = R(1, 3), k = b * m, a = R(1, b - 1); return num(a * m, `You have ${fr(a, b)} pound of trail mix. Each bag holds ${fr(1, k)} pound. How many bags can you fill?`, `${fr(a, b)} ÷ ${fr(1, k)} = ${fr(a, b)} × ${k} = ${a * m}.`, `How many 1/${k}s fit in ${a}/${b}?`); }
    let w, c, d; do { w = R(2, 6); d = R(2, 6); c = R(1, d - 1); } while ((w * d) % c); return num(w * d / c, `There are <b>${w} pizzas</b>. Each player eats ${fr(c, d)} of a pizza. How many players can eat?`, `${w} ÷ ${fr(c, d)} = ${w} × ${fr(d, c)} = ${w * d / c}.`, 'Divide the pizzas by the amount each player eats.');
  } },

// 7 ───────────────────────────────────────────
{ id: 'expr', name: 'Variable Vault', title: 'Expressions & Variables', std: '6.EE.2–4',
  boss: { name: 'Vexx', look: { color: '#B26BFF', eyes: 'one', mouth: 'fangs', acc: 'horns' }, taunt: 'I\'m X. I could be ANY number. You\'ll never figure me out.' },
  fmt: 'Type a number, or tap an answer.',
  lesson: [
    { t: 'Variables are boxes', html: `<p>A <b>variable</b> is a letter that holds a number, like a box with a label. (Coders use variables all the time. You'll see them again in the Code Lab!)</p><p><b>3${X}</b> means 3 × ${X}. If ${X} = 5, then 3${X} + 2 = 15 + 2 = <b>17</b>.</p>`,
      widget(el) { el.innerHTML = sl('x', '<i>x</i> =', 0, 12, 5) + '<div class="out"></div>'; wire(el, ({ x }) => { el.querySelector('.out').innerHTML = `<table class="rt ev"><tr><th>3${X} + 2</th><td>${3 * x + 2}</td></tr><tr><th>2(${X} + 1)</th><td>${2 * (x + 1)}</td></tr><tr><th>${X}<sup>2</sup> − 1</th><td>${x * x - 1}</td></tr><tr><th>20 − ${X}</th><td>${n2(20 - x)}</td></tr></table>`; }); },
      check: num(17, `If ${X} = 5, what is ${ex(`4${X} − 3`)}`, '4 × 5 = 20. 20 − 3 = 17.', 'Swap x for 5, then do the math.') },
    { t: 'Words into math', html: `<table class="rt words"><tr><td>5 more than <i>n</i></td><td><i>n</i> + 5</td></tr><tr><td>twice <i>n</i></td><td>2<i>n</i></td></tr><tr><td>7 less than <i>n</i></td><td><i>n</i> − 7</td></tr><tr><td><i>n</i> split into 4</td><td><i>n</i> ÷ 4</td></tr><tr><td><i>n</i> squared</td><td><i>n</i><sup>2</sup></td></tr></table><p>Watch out: "7 less than <i>n</i>" is <i>n</i> − 7, not 7 − <i>n</i>.</p>`, check: choice('Which expression means "<b>3 less than twice <i>n</i></b>"?', '2<i>n</i> − 3', ['3 − 2<i>n</i>', '2(<i>n</i> − 3)', '3<i>n</i> − 2'], 'Twice n is 2n. 3 less than that is 2n − 3.', 'Build "twice n" first.') },
    { t: 'Like terms and distributing', html: `<ul><li><b>Like terms</b> have the same variable. Combine them: 4${X} + 3${X} = <b>7${X}</b></li><li><b>Distribute</b> by multiplying everything inside: 3(${X} + 5) = <b>3${X} + 15</b></li></ul>`, check: choice(`Which is equal to ${ex(`4(${X} + 2)`)}`, `4${X} + 8`, [`4${X} + 2`, `${X} + 8`, `6${X}`], `Multiply both parts by 4: 4 × ${X} = 4${X} and 4 × 2 = 8.`, 'The 4 multiplies BOTH things inside.') },
  ],
  gen() {
    const t = R(0, 6);
    if (t === 0) { const a = R(2, 9), b = R(1, 15), x = R(2, 10), plus = R(0, 1) || a * x <= b; const v = plus ? a * x + b : a * x - b; return num(v, `If ${X} = ${x}, what is ${ex(`${a}${X} ${plus ? '+' : '−'} ${b}`)}`, `${a} × ${x} = ${a * x}. ${a * x} ${plus ? '+' : '−'} ${b} = ${v}.`, `Swap ${X} for ${x}. Multiply first.`); }
    if (t === 1) { const a = R(2, 6), b = R(1, 9), x = R(1, 9), v = a * (x + b); return num(v, `If ${X} = ${x}, what is ${ex(`${a}(${X} + ${b})`)}`, `Inside first: ${x} + ${b} = ${x + b}. Then ${a} × ${x + b} = ${v}.`, 'Parentheses first.'); }
    if (t === 2) { const x = R(2, 9), b = R(1, 20), v = x * x + b; return num(v, `If ${X} = ${x}, what is ${ex(`${X}<sup>2</sup> + ${b}`)}`, `${x}² = ${x * x}. ${x * x} + ${b} = ${v}.`, `${X}² means ${X} × ${X}.`); }
    if (t === 3) { const a = R(2, 6), b = R(2, 6), p = R(2, 5), v = p * a + b * b; return num(v, `If <i>a</i> = ${a} and <i>b</i> = ${b}, what is ${ex(`${p}<i>a</i> + <i>b</i><sup>2</sup>`)}`, `${p} × ${a} = ${p * a}. ${b}² = ${b * b}. ${p * a} + ${b * b} = ${v}.`, 'Plug in both numbers, then use the order of operations.'); }
    if (t === 4) { const bank = [['5 more than <i>n</i>', '<i>n</i> + 5', ['5<i>n</i>', '<i>n</i> − 5', '5 − <i>n</i>']], ['twice a number <i>n</i>', '2<i>n</i>', ['<i>n</i> + 2', '<i>n</i><sup>2</sup>', '<i>n</i> ÷ 2']], ['7 less than <i>n</i>', '<i>n</i> − 7', ['7 − <i>n</i>', '7<i>n</i>', '<i>n</i> + 7']], ['<i>n</i> divided by 4', '<i>n</i> ÷ 4', ['4 ÷ <i>n</i>', '4<i>n</i>', '<i>n</i> − 4']], ['3 times the sum of <i>n</i> and 2', '3(<i>n</i> + 2)', ['3<i>n</i> + 2', '<i>n</i> + 3 × 2', '3 + <i>n</i> + 2']], ['the product of 6 and <i>n</i>, minus 1', '6<i>n</i> − 1', ['6(<i>n</i> − 1)', '6 + <i>n</i> − 1', '<i>n</i> − 6']], ['half of <i>n</i>, plus 10', '<i>n</i> ÷ 2 + 10', ['2<i>n</i> + 10', '<i>n</i> ÷ 12', '10 ÷ <i>n</i> + 2']], ['<i>n</i> squared', '<i>n</i><sup>2</sup>', ['2<i>n</i>', '<i>n</i> + 2', '<i>n</i> × 2']]];
      const [w, r, wr] = pick(bank); return choice(`Which expression means "<b>${w}</b>"?`, r, wr, `"${w}" → ${r}.`, 'Read it slowly. Which operation is each word?'); }
    if (t === 5) { const a = R(2, 9), b = R(1, 9), minus = R(0, 1), op = minus ? '−' : '+'; return choice(`Which is equal to ${ex(`${a}(${X} ${op} ${b})`)}`, `${a}${X} ${op} ${a * b}`, [`${a}${X} ${op} ${b}`, `${X} ${op} ${a * b}`, `${a + b}${X}`], `Multiply both parts by ${a}: ${a} × ${X} = ${a}${X} and ${a} × ${b} = ${a * b}.`, `The ${a} multiplies BOTH things inside.`); }
    const a = R(2, 9), b = R(2, 9), c = R(1, a + b - 1), v = a + b - c; return num(v, `Combine like terms. What number goes in front of ${X}?${ex(`${a}${X} + ${b}${X} − ${c}${X} = ?${X}`)}`, `${a} + ${b} − ${c} = ${v}. So it's ${v}${X}.`, 'Just add and subtract the numbers in front of x.');
  } },

// 8 ───────────────────────────────────────────
{ id: 'eq', name: 'Balance Battle', title: 'Equations & Inequalities', std: '6.EE.5–8, 7.EE.4',
  boss: { name: 'Tipsy Scales', look: { color: '#FFC93C', eyes: 'big', mouth: 'teeth', acc: 'goggles' }, taunt: 'Whoa, whoa! One wrong move and EVERYTHING tips over!' },
  fmt: 'Type the number that x equals.',
  lesson: [
    { t: 'An equation is a balance', html: `<p>An <b>equation</b> says two sides are equal, like a balanced scale. To solve it, get ${X} alone. Whatever you do to one side, <b>do to the other side too</b>.</p>`,
      widget(el) { const a = 5, b = 12; let done = false; const draw = () => { el.innerHTML = `<svg class="vis scale" viewBox="0 0 300 150"><polygon points="150,140 135,150 165,150" class="sbase"/><line x1="150" y1="40" x2="150" y2="140" class="spole"/><line x1="40" y1="40" x2="260" y2="40" class="sbeam"/><path d="M20 90 L100 90 L90 110 L30 110 Z" class="span"/><path d="M200 90 L280 90 L270 110 L210 110 Z" class="span"/><line x1="40" y1="40" x2="40" y2="90" class="sstr"/><line x1="260" y1="40" x2="260" y2="90" class="sstr"/>
        <rect x="${done ? 45 : 28}" y="62" width="28" height="28" rx="6" class="xbox"/><text x="${done ? 59 : 42}" y="82" text-anchor="middle" class="xt">x</text>${done ? '' : `<g class="wts">${Array.from({ length: a }, (_, i) => `<circle cx="${64 + (i % 3) * 11}" cy="${84 - Math.floor(i / 3) * 11}" r="5"/>`).join('')}</g>`}
        <text x="240" y="82" text-anchor="middle" class="wt">${done ? b - a : b}</text></svg><p class="eq">${done ? `${X} = <b>${b - a}</b>` : `${X} + ${a} = ${b}`}</p><button class="btn small cyan">${done ? 'Reset' : `Take ${a} off both sides`}</button>`;
        el.querySelector('button').onclick = () => { done = !done; Sfx.tap(); draw(); }; }; draw(); },
      check: num(8, `Solve for ${X}.${ex(`${X} + 7 = 15`)}`, 'Subtract 7 from both sides: x = 15 − 7 = 8.', 'Undo the +7.') },
    { t: 'Undo with the opposite', html: `<table class="rt words"><tr><td>${X} + 4 = 10</td><td>subtract 4</td><td>${X} = 6</td></tr><tr><td>${X} − 4 = 10</td><td>add 4</td><td>${X} = 14</td></tr><tr><td>4${X} = 28</td><td>divide by 4</td><td>${X} = 7</td></tr><tr><td>${X} ÷ 3 = 6</td><td>multiply by 3</td><td>${X} = 18</td></tr></table><p>Always check: put your answer back in. Does it work?</p>`, check: num(18, `Solve for ${X}.${ex(`${X} ÷ 3 = 6`)}`, 'Multiply both sides by 3: x = 18.', 'The opposite of ÷ is ×.') },
    { t: 'Two-step equations', html: `<p>For <b>2${X} + 3 = 11</b>, undo in <b>reverse order</b>:</p><ol><li>Subtract 3: 2${X} = 8</li><li>Divide by 2: ${X} = <b>4</b></li></ol>`, check: num(8, `Solve for ${X}.${ex(`3${X} − 4 = 20`)}`, 'Add 4: 3x = 24. Divide by 3: x = 8.', 'First undo the −4. Then undo the ×3.') },
    { t: 'Inequalities', html: `<p><b>${X} &gt; 5</b> means ${X} can be <b>any</b> number bigger than 5 (but not 5 itself). <b>${X} ≥ 5</b> includes 5.</p><p>Solve them like equations: ${X} + 3 &gt; 10 → ${X} &gt; 7.</p>`, check: choice(`Which value makes ${ex(`${X} + 3 > 10`)} true?`, '9', ['7', '4', '2'], 'x has to be more than 7. Only 9 works. (7 makes it equal, not greater.)', 'Solve it like an equation first.') },
  ],
  gen() {
    const t = R(0, 7), nm = pick(NAMES);
    const q = s => `Solve for ${X}.${ex(s)}`;
    if (t === 0) { const a = R(2, 30), x = R(1, 40); return num(x, q(`${X} + ${a} = ${x + a}`), `Subtract ${a} from both sides: ${X} = ${x + a} − ${a} = ${x}.`, `Undo the + ${a}.`); }
    if (t === 1) { const a = R(2, 20), x = R(a + 1, 50); return num(x, q(`${X} − ${a} = ${x - a}`), `Add ${a} to both sides: ${X} = ${x - a} + ${a} = ${x}.`, `Undo the − ${a}.`); }
    if (t === 2) { const a = R(2, 12), x = R(2, 12); return num(x, q(`${a}${X} = ${a * x}`), `Divide both sides by ${a}: ${X} = ${a * x} ÷ ${a} = ${x}.`, `${a}${X} means ${a} × ${X}. Undo it by dividing.`); }
    if (t === 3) { const a = R(2, 9), b = R(2, 12); return num(a * b, q(`${X} ÷ ${a} = ${b}`), `Multiply both sides by ${a}: ${X} = ${b} × ${a} = ${a * b}.`, 'Undo ÷ by multiplying.'); }
    if (t === 4) { const a = R(2, 9), x = R(1, 12), b = R(1, 20); return num(x, q(`${a}${X} + ${b} = ${a * x + b}`), `Subtract ${b}: ${a}${X} = ${a * x}. Divide by ${a}: ${X} = ${x}.`, 'Undo the + first, then the ×.'); }
    if (t === 5) { const a = R(2, 9), x = R(3, 12), b = R(1, a * x - 1); return num(x, q(`${a}${X} − ${b} = ${a * x - b}`), `Add ${b}: ${a}${X} = ${a * x}. Divide by ${a}: ${X} = ${x}.`, 'Undo the − first, then the ×.'); }
    if (t === 6) { const k = R(0, 2);
      if (k === 0) { const s = R(5, 40), g = R(3, 25); return num(s, `${nm} has some stickers. After getting <b>${g} more</b>, ${nm} has <b>${s + g}</b>. How many did ${nm} start with?`, `${X} + ${g} = ${s + g}, so ${X} = ${s}.`, 'Write an equation: x + ' + g + ' = ' + (s + g)); }
      if (k === 1) { const a = R(2, 6), b = R(5, 30); return num(a * b, `<b>${a} friends</b> split a prize equally and each gets <b>${b} coins</b>. How many coins was the prize?`, `${X} ÷ ${a} = ${b}, so ${X} = ${a * b}.`, 'The prize divided by ' + a + ' is ' + b + '.'); }
      const a = R(4, 12), n = R(2, 8), f = R(2, 9); return num(n, `Tickets cost <b>$${a} each</b> plus a <b>$${f} fee</b>. You paid <b>$${a * n + f}</b>. How many tickets did you buy?`, `${a}${X} + ${f} = ${a * n + f}. Subtract ${f}: ${a}${X} = ${a * n}. Divide: ${X} = ${n}.`, 'Take away the fee first.'); }
    const a = R(2, 9), b = R(a + 3, a + 15), edge = b - a, right = edge + R(1, 5); const gt = R(0, 1);
    if (gt) return choice(`Which value of ${X} makes ${ex(`${X} + ${a} > ${b}`)} true?`, String(right), [String(edge), String(edge - R(1, 4)), String(Math.max(0, edge - R(5, 9)))], `${X} must be more than ${edge}. Only ${right} works. ${edge} makes the two sides equal, not greater.`, 'Solve it like an equation first: x > ?');
    const lo = edge - R(1, 5); return choice(`Which value of ${X} makes ${ex(`${X} + ${a} < ${b}`)} true?`, String(lo), [String(edge), String(edge + R(1, 4)), String(edge + R(5, 9))], `${X} must be less than ${edge}. Only ${lo} works.`, 'Solve it like an equation first: x < ?');
  } },

// 9 ───────────────────────────────────────────
{ id: 'area', name: 'Shape Shifter', title: 'Area & Surface Area', std: '6.G.1, 6.G.4',
  boss: { name: 'Polygon Pete', look: { color: '#FF4F7B', eyes: 'three', mouth: 'grin', acc: 'spikes' }, taunt: 'Triangles! Trapezoids! I change shape faster than you can measure!' },
  fmt: 'Type a number (just the number, no units).',
  lesson: [
    { t: 'Rectangles and parallelograms', html: `<p><b>Rectangle:</b> Area = length × width.</p><p><b>Parallelogram:</b> slice off the slanted end and slide it over. It becomes a rectangle! Area = <b>base × height</b>. Use the straight-up height, not the slanted side.</p>${paraSVG(8, 5)}`, check: num(40, 'A parallelogram has base <b>8 cm</b> and height <b>5 cm</b>. What is its area?', '8 × 5 = 40 square cm.', 'Base × height.') },
    { t: 'Triangles are half a rectangle', html: `<p>Every triangle is exactly <b>half</b> of a rectangle. Area = <b>½ × base × height</b>.</p>`,
      widget(el) { el.innerHTML = sl('b', 'Base', 2, 12, 8) + sl('h', 'Height', 2, 8, 5) + '<div class="out"></div>'; wire(el, ({ b, h }) => { const W = b * 18, H = h * 16, x0 = 150 - W / 2, y0 = 150 - H; el.querySelector('.out').innerHTML = `<svg class="vis shape" viewBox="0 0 300 165"><rect x="${x0}" y="${y0}" width="${W}" height="${H}" class="ghost"/><polygon points="${x0},150 ${x0 + W},150 ${x0 + W * 0.35},${y0}" class="sh"/></svg><p class="eq">Rectangle: ${b} × ${h} = ${b * h}. Triangle: half of that = <b>${r4(b * h / 2)}</b></p>`; }); },
      check: num(30, 'A triangle has base <b>10</b> and height <b>6</b>. What is its area?', '10 × 6 = 60. Half of 60 is 30.', 'Multiply, then cut in half.') },
    { t: 'Trapezoids and combo shapes', html: `<p><b>Trapezoid:</b> average the two parallel sides, then × height. Area = ½ × (a + b) × h.</p><p><b>Combo shapes:</b> split them into rectangles and triangles, or find the big rectangle and subtract the missing piece.</p>${lSVG(10, 8, 4, 3)}<p class="note">Big rectangle 10 × 8 = 80. Missing corner 4 × 3 = 12. Area = 80 − 12 = <b>68</b>.</p>`, check: num(28, 'A trapezoid has parallel sides <b>5</b> and <b>9</b> and height <b>4</b>. What is its area?', '5 + 9 = 14. Half of 14 is 7. 7 × 4 = 28.', 'Add the two parallel sides, halve it, times the height.') },
    { t: 'Surface area of a box', html: `<p><b>Surface area</b> is the total area of all the outside faces, like wrapping paper. A box has 6 faces in 3 matching pairs:</p><p class="eq">SA = 2 × (l×w + l×h + w×h)</p>${boxSVG(4, 3, 2)}<p class="note">2 × (12 + 8 + 6) = 2 × 26 = <b>52</b> square inches.</p>`, check: num(94, 'A box is <b>5 × 4 × 3</b>. What is its surface area?', '5×4 = 20, 5×3 = 15, 4×3 = 12. 20 + 15 + 12 = 47. 2 × 47 = 94.', 'Find the 3 different faces, add them, then double.') },
  ],
  gen() {
    const t = R(0, 6), u = pick(['cm', 'in', 'ft', 'm']);
    if (t === 0) { const l = R(3, 15), w = R(2, 12); return num(l * w, `What is the area of this rectangle?${rectSVG(l, w, u)}`, `${l} × ${w} = ${l * w} square ${u}.`, 'Length × width.'); }
    if (t === 1) { const b = R(4, 14), h = R(3, 10); return num(b * h, `What is the area of this parallelogram?${paraSVG(b, h, u)}`, `Base × height = ${b} × ${h} = ${b * h}.`, 'Base × the straight-up height.'); }
    if (t === 2) { const b = R(2, 9) * 2 - (R(0, 1) ? 1 : 0), h = R(3, 12); return num(b * h / 2, `What is the area of this triangle?${triSVG(b, h, u)}`, `½ × ${b} × ${h} = ${b * h} ÷ 2 = ${b * h / 2}.`, 'Base × height, then cut it in half.'); }
    if (t === 3) { let a, b, h; do { a = R(3, 10); b = R(a + 2, a + 10); h = R(2, 10); } while ((a + b) * h % 2); return num((a + b) * h / 2, `What is the area of this trapezoid?${trapSVG(a, b, h, u)}`, `½ × (${a} + ${b}) × ${h} = ½ × ${a + b} × ${h} = ${(a + b) * h / 2}.`, 'Add the parallel sides, halve it, times the height.'); }
    if (t === 4) { const W = R(6, 14), H = R(5, 12), w = R(2, W - 3), h = R(2, H - 3); return num(W * H - w * h, `What is the area of this shape?${lSVG(W, H, w, h, u)}`, `Big rectangle: ${W} × ${H} = ${W * H}. Missing corner: ${w} × ${h} = ${w * h}. ${W * H} − ${w * h} = ${W * H - w * h}.`, 'Find the big rectangle, then subtract the missing corner.'); }
    if (t === 5) { const l = R(2, 8), w = R(2, 8), h = R(2, 8), v = 2 * (l * w + l * h + w * h); return num(v, `What is the surface area of this box?${boxSVG(l, w, h, u)}`, `${l}×${w} = ${l * w}, ${l}×${h} = ${l * h}, ${w}×${h} = ${w * h}. Add: ${l * w + l * h + w * h}. Double it: ${v}.`, 'Three different faces, each one twice.'); }
    const l = R(3, 12), w = R(2, 12); return num(w, `A rectangle has an area of <b>${l * w} square ${u}</b> and a length of <b>${l} ${u}</b>. How wide is it?`, `${l * w} ÷ ${l} = ${w} ${u}.`, 'Area ÷ length = width.');
  } },

// 10 ──────────────────────────────────────────
{ id: 'stats', name: 'Stat Attack', title: 'Mean, Median, Mode & Range', std: '6.SP.3–5',
  boss: { name: 'Meanie Median', look: { color: '#3DD6FF', eyes: 'angry', mouth: 'fangs', acc: 'crown' }, taunt: 'I\'m right in the middle of everything. And I\'m MEAN about it.' },
  fmt: 'Type a number. Decimals are fine, like 7.5.',
  lesson: [
    { t: 'The four stats', html: `<ul><li><b>Mean</b> (average): add them all up, divide by how many.</li><li><b>Median</b>: sort them. The middle one. (Two middles? Average them.)</li><li><b>Mode</b>: the one that shows up most.</li><li><b>Range</b>: biggest − smallest.</li></ul>`,
      widget(el) { el.innerHTML = [6, 9, 4, 9, 12].map((v, i) => sl('v' + i, `Score ${i + 1}:`, 1, 20, v)).join('') + '<div class="out"></div>'; wire(el, vals => { const a = Object.values(vals), s = [...a].sort((x, y) => x - y), sum = a.reduce((x, y) => x + y, 0), mean = sum / a.length; const cnt = {}; a.forEach(x => cnt[x] = (cnt[x] || 0) + 1); const mx = Math.max(...Object.values(cnt)); const modes = Object.keys(cnt).filter(k => cnt[k] === mx);
        el.querySelector('.out').innerHTML = `<div class="bars">${a.map(v => `<i style="height:${v * 5}px"><b>${v}</b></i>`).join('')}<span class="meanline" style="bottom:${mean * 5}px">mean ${r4(mean).toFixed(1)}</span></div><p class="eq">Sorted: ${s.join(', ')}</p><table class="rt ev"><tr><th>Mean</th><td>${sum} ÷ 5 = ${r4(mean)}</td></tr><tr><th>Median</th><td>${s[2]}</td></tr><tr><th>Mode</th><td>${mx > 1 ? modes.join(' and ') : 'none'}</td></tr><tr><th>Range</th><td>${s[4]} − ${s[0]} = ${s[4] - s[0]}</td></tr></table>`; }); },
      check: num(6, 'What is the <b>mean</b> of 4, 6, 8?', '4 + 6 + 8 = 18. 18 ÷ 3 = 6.', 'Add them, then divide by 3.') },
    { t: 'Median with an even count', html: `<p>With an even number of values, there are <b>two middles</b>. The median is their average.</p><p class="eq">3, 5, <b>7, 9</b>, 10, 12 → (7 + 9) ÷ 2 = <b>8</b></p>`, check: num(5.5, 'What is the <b>median</b> of 2, 4, 7, 9?', 'Two middles: 4 and 7. (4 + 7) ÷ 2 = 5.5.', 'Average the two middle numbers.') },
    { t: 'Outliers', html: `<p>An <b>outlier</b> is a value way bigger or smaller than the rest. It drags the <b>mean</b> a lot, but barely moves the <b>median</b>.</p><p>Scores 8, 9, 10 have mean 9. Add one score of 41 and the mean jumps to 17. The median only moves from 9 to 9.5.</p>`, check: choice('You add an outlier of <b>100</b> to the data 4, 5, 6. Which changes more?', 'The mean', ['The median', 'They change the same']), why: '' },
  ],
  gen() {
    const t = R(0, 5);
    if (t === 0) { let a, k, m; do { k = R(4, 6); m = R(5, 20); a = Array.from({ length: k - 1 }, () => Math.max(0, m + R(-6, 6))); a.push(m * k - a.reduce((x, y) => x + y, 0)); } while (a[k - 1] < 0 || a[k - 1] > 40); a = shuffle(a);
      return num(m, `What is the <b>mean</b>?${chips(a)}`, `Sum: ${a.join(' + ')} = ${m * k}. ${m * k} ÷ ${k} = ${m}.`, `Add them up, then divide by ${k}.`); }
    if (t === 1) { const k = pick([5, 7]), a = Array.from({ length: k }, () => R(1, 30)), s = [...a].sort((x, y) => x - y); return num(s[(k - 1) / 2], `What is the <b>median</b>?${chips(a)}`, `Sorted: ${s.join(', ')}. The middle one is ${s[(k - 1) / 2]}.`, 'Sort them first!'); }
    if (t === 2) { const k = pick([4, 6]), a = Array.from({ length: k }, () => R(1, 30)), s = [...a].sort((x, y) => x - y), v = (s[k / 2 - 1] + s[k / 2]) / 2; return num(v, `What is the <b>median</b>?${chips(a)}`, `Sorted: ${s.join(', ')}. Two middles: ${s[k / 2 - 1]} and ${s[k / 2]}. Average: ${v}.`, 'Sort them. Two middles? Average them.'); }
    if (t === 3) { const m = R(1, 20); let others = []; while (others.length < R(3, 5)) { const x = R(1, 25); if (x !== m && !others.includes(x)) others.push(x); } const a = shuffle([m, m, ...(R(0, 1) ? [m] : []), ...others]); return num(m, `What is the <b>mode</b>?${chips(a)}`, `${m} shows up more than any other number.`, 'Which number appears most often?'); }
    if (t === 4) { const a = Array.from({ length: R(5, 7) }, () => R(1, 60)), mx = Math.max(...a), mn = Math.min(...a); return num(mx - mn, `What is the <b>range</b>?${chips(a)}`, `Biggest ${mx} − smallest ${mn} = ${mx - mn}.`, 'Biggest minus smallest.'); }
    const s = [R(70, 95), R(70, 95), R(70, 95)], tgt = R(80, 92), need = tgt * 4 - s.reduce((x, y) => x + y, 0);
    if (need < 50 || need > 100) { const a = [R(2, 9), R(2, 9), R(2, 9)], tm = Math.ceil((a[0] + a[1] + a[2]) / 3) + R(1, 3), nd = tm * 4 - a[0] - a[1] - a[2]; return num(nd, `${pick(NAMES)} scored <b>${a.join(', ')}</b> goals in 3 games. How many goals in game 4 to get a mean of <b>${tm}</b>?`, `A mean of ${tm} over 4 games needs ${tm * 4} total. ${tm * 4} − ${a[0] + a[1] + a[2]} = ${nd}.`, 'Mean × how many = total needed.'); }
    return num(need, `Your quiz scores are <b>${s.join(', ')}</b>. What do you need on quiz 4 to get a mean of <b>${tgt}</b>?`, `A mean of ${tgt} over 4 quizzes needs ${tgt * 4} points total. You have ${s.reduce((x, y) => x + y, 0)}. ${tgt * 4} − ${s.reduce((x, y) => x + y, 0)} = ${need}.`, 'Mean × how many = total needed.');
  } },
];
// Lesson checks that use choice() need a "why". Fill the two that were left blank above.
MATH[3].lesson[2].check = choice('Which deal is better?', '10 for $5', ['4 for $3', 'They are the same'], '10 for $5 is $0.50 each. 4 for $3 is $0.75 each. $0.50 is cheaper.', 'Find the price of ONE in each deal.');
MATH[9].lesson[2].check = choice('You add an outlier of <b>100</b> to the data 4, 5, 6. Which changes more?', 'The mean', ['The median', 'They change the same'], 'The mean jumps from 5 to 28.75. The median only moves from 5 to 5.5.', 'Outliers drag the average.');
MATH.forEach(l => (l.world = 'math'));
