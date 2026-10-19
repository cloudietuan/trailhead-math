// The 9 camps: practice-question generators, bosses, and answer formats.
const UNITS = [
{ id: 'oa', camp: 'Base Camp', title: 'Order of Operations', std: '5.OA.1',
  boss: { face: '🦝', name: 'Mixup the Raccoon', taunt: 'I do math in whatever order I want! Prove me wrong.' },
  fmt: 'Type a whole number.',
  gen() { const t = R(0, 4); let a, b, c, d, v, q, why; const hint = 'Work inside ( ) and [ ] first. Then × and ÷. Then + and −.';
    if (t === 0) { a = R(2, 12); b = R(2, 12); c = R(2, 9); v = (a + b) * c; q = `(${a} + ${b}) × ${c}`; why = `Parentheses first: ${a} + ${b} = ${a + b}. Then ${a + b} × ${c} = ${v}.`; }
    else if (t === 1) { a = R(2, 9); b = R(8, 20); c = R(1, b - 2); v = a * (b - c); q = `${a} × (${b} − ${c})`; why = `Parentheses first: ${b} − ${c} = ${b - c}. Then ${a} × ${b - c} = ${v}.`; }
    else if (t === 2) { a = R(5, 30); b = R(2, 9); c = R(2, 9); v = a + b * c; q = `${a} + ${b} × ${c}`; why = `Multiply before adding: ${b} × ${c} = ${b * c}. Then ${a} + ${b * c} = ${v}.`; }
    else if (t === 3) { a = R(2, 8); b = R(2, 8); c = R(2, 5); d = R(1, (a + b) * c - 1); v = (a + b) * c - d; q = `[(${a} + ${b}) × ${c}] − ${d}`; why = `Innermost first: ${a} + ${b} = ${a + b}. Then ${a + b} × ${c} = ${(a + b) * c}. Then ${(a + b) * c} − ${d} = ${v}.`; }
    else { a = R(3, 9); b = R(4, 9); c = R(2, 5); d = R(1, Math.floor((a * b - 1) / c)); v = a * b - c * d; q = `${a} × ${b} − ${c} × ${d}`; why = `Do both multiplications first: ${a} × ${b} = ${a * b} and ${c} × ${d} = ${c * d}. Then ${a * b} − ${c * d} = ${v}.`; }
    return num(v, why, hint, `Solve it.<span class="expr">${q}</span>`); } },

{ id: 'pv', camp: 'Tenfold Falls', title: 'Powers of 10 & Place Value', std: '5.NBT.1–4',
  boss: { face: '🦅', name: 'Tenfold the Eagle', taunt: 'I swoop the decimal point around. Can you keep up?' },
  fmt: 'Type a number. Decimals are fine, like 4.56.',
  gen() { const t = R(0, 4); const k = R(1, 3), p = 10 ** k; let n, v;
    if (t === 0) { n = R(101, 9999) / 100; v = r4(n * p); return num(v, `Multiplying by ${n2(p)} slides every digit ${k} place${k > 1 ? 's' : ''} to the left. ${n} becomes ${v}.`, 'Count the zeros. Slide the decimal point that many places right.', `Solve it.<span class="expr">${n} × ${n2(p)}</span>`, String(v)); }
    if (t === 1) { n = R(12, 9800) / 10; v = r4(n / p); return num(v, `Dividing by ${n2(p)} slides every digit ${k} place${k > 1 ? 's' : ''} to the right. ${n} becomes ${v}.`, 'Count the zeros. Slide the decimal point that many places left.', `Solve it.<span class="expr">${n} ÷ ${n2(p)}</span>`, String(v)); }
    if (t === 2) { n = R(1001, 9999) / 1000; const tenth = R(0, 1) === 0; const f = tenth ? 10 : 100; v = Math.round(n * f + 1e-9) / f; const word = tenth ? 'tenth' : 'hundredth';
      return num(v, `Look at the digit right after the ${word}s place. 5 or more rounds up, 4 or less stays. ${n} rounds to ${v}.`, `Find the ${word}s place, then peek at the digit to its right.`, `Round <b>${n}</b> to the nearest ${word}.`, String(v)); }
    if (t === 3) { let a, b; do { a = r4(R(1, 9) / 10 + R(0, 9) / 100); b = r4(R(1, 9) / 10 + R(0, 9) / 100 + R(1, 9) / 1000); } while (a === b);
      const [x, y] = R(0, 1) ? [a, b] : [b, a]; v = Math.max(a, b); return num(v, `Line them up and compare from the left: tenths first, then hundredths. ${v} is greater.`, 'Write both with the same number of digits (add zeros), then compare.', `Which number is greater? Type it.<span class="expr">${x} &nbsp;or&nbsp; ${y}</span>`, String(v)); }
    n = R(2, 95); v = n * p; return num(v, `10<sup>${k}</sup> = ${n2(p)}. So ${n} × ${n2(p)} = ${n2(v)}.`, `10<sup>${k}</sup> is a 1 followed by ${k} zero${k > 1 ? 's' : ''}.`, `Solve it.<span class="expr">${n} × 10<sup>${k}</sup></span>`); } },

{ id: 'dec', camp: 'Decimal Creek', title: 'Adding & Subtracting Decimals', std: '5.NBT.7',
  boss: { face: '🦫', name: 'Dot the Beaver', taunt: 'I built a dam out of crooked decimal points. Ha!' },
  fmt: 'Type a decimal, like 16.25. A $ sign is optional.',
  gen() { const t = R(0, 4); let a, b, v; const hint = 'Line up the decimal points. Fill empty places with zeros.';
    if (t === 0) { a = R(100, 9999) / 100; b = R(100, 9999) / 100; v = r4(a + b); return num(v, `Line up the points: ${a.toFixed(2)} + ${b.toFixed(2)} = ${v.toFixed(2)}.`, hint, `Solve it.<span class="expr">${a} + ${b}</span>`, v.toFixed(2)); }
    if (t === 1) { a = R(500, 9999) / 100; b = R(100, Math.floor(a * 100) - 50) / 100; v = r4(a - b); return num(v, `Line up the points: ${a.toFixed(2)} − ${b.toFixed(2)} = ${v.toFixed(2)}.`, hint, `Solve it.<span class="expr">${a} − ${b}</span>`, v.toFixed(2)); }
    if (t === 2) { a = R(250, 900) / 100; b = R(150, 800) / 100; v = r4(20 - a - b); const nm = pick(NAMES); return num(v, `Total cost: $${a.toFixed(2)} + $${b.toFixed(2)} = $${(a + b).toFixed(2)}. Change: $20.00 − $${(a + b).toFixed(2)} = $${v.toFixed(2)}.`, 'First add the two prices. Then subtract that from $20.00.', `${nm} buys a sketchbook for <b>$${a.toFixed(2)}</b> and markers for <b>$${b.toFixed(2)}</b>, and pays with a $20 bill. How much change does ${nm} get?`, '$' + v.toFixed(2)); }
    if (t === 3) { const t10 = R(11, 99); a = t10 / 10; const m = R(2, 9); v = r4(a * m); return num(v, `Multiply like whole numbers: ${t10} × ${m} = ${t10 * m}. ${a} has 1 decimal place, so the answer gets 1 too: ${v}.`, 'Ignore the decimal point, multiply, then put the point back.', `Solve it.<span class="expr">${a} × ${m}</span>`, String(v)); }
    a = R(10, 99) + R(1, 9) / 10; b = R(1, 20) + R(1, 99) / 100; v = r4(a + b); return num(v, `Write ${a} as ${a.toFixed(2)}. Then ${a.toFixed(2)} + ${b.toFixed(2)} = ${v.toFixed(2)}.`, hint, `Solve it.<span class="expr">${a} + ${b}</span>`, v.toFixed(2)); } },

{ id: 'mul', camp: 'Product Ridge', title: 'Multi-Digit Multiplication', std: '5.NBT.5',
  boss: { face: '🐏', name: 'Multi the Ram', taunt: 'My horns are made of giant numbers. Charge!' },
  fmt: 'Type a whole number. Commas are optional.',
  gen() { const t = R(0, 3); let a, b;
    const why = (a, b) => { const tn = Math.floor(b / 10) * 10, o = b % 10; return tn && o ? `Break ${b} into ${tn} + ${o}. ${n2(a)} × ${tn} = ${n2(a * tn)}, and ${n2(a)} × ${o} = ${n2(a * o)}. Add: ${n2(a * b)}.` : `${n2(a)} × ${b} = ${n2(a * b)}.`; };
    const hint = 'Split the smaller number into tens and ones. Multiply each part, then add.';
    if (t === 0) { a = R(102, 989); b = R(12, 89); return num(a * b, why(a, b), hint, `Solve it.<span class="expr">${a} × ${b}</span>`); }
    if (t === 1) { a = R(1020, 9890); b = R(3, 9); return num(a * b, `Multiply each place and carry as you go. ${n2(a)} × ${b} = ${n2(a * b)}.`, 'Start with the ones place and carry.', `Solve it.<span class="expr">${n2(a)} × ${b}</span>`); }
    if (t === 2) { a = R(18, 45); b = R(22, 38); return num(a * b, why(b, a), hint, `A stadium section has <b>${a}</b> rows with <b>${b}</b> seats in each row. How many seats are in the section?`); }
    a = R(12, 48); b = pick([24, 36, 48, 144]); return num(a * b, why(b, a), hint, `A school orders <b>${a}</b> boxes of pencils. Each box holds <b>${b}</b> pencils. How many pencils in all?`); } },

{ id: 'div', camp: 'Divide Pass', title: 'Long Division', std: '5.NBT.6',
  boss: { face: '🐺', name: 'Splitwolf', taunt: 'I split everything into groups. Bet you can\'t count them.' },
  fmt: 'Type a whole number.',
  gen() { const t = R(0, 2);
    if (t === 0) { const d = R(12, 48), q = R(21, 215), n = d * q; return num(q, `Estimate first, then check: ${q} × ${d} = ${n2(n)}. So ${n2(n)} ÷ ${d} = ${q}.`, `Round ${d} to a friendly number to estimate. Then check by multiplying.`, `Solve it.<span class="expr">${n2(n)} ÷ ${d}</span>`); }
    if (t === 1) { const cap = pick([32, 36, 40, 44]), full = R(4, 9), kids = cap * full + R(1, cap - 4), v = full + 1; return num(v, `${kids} ÷ ${cap} = ${full} with ${kids - cap * full} left over. Those ${kids - cap * full} students still need a ride, so you need ${v} buses.`, 'Divide, then ask: what happens to the leftover students?', `<b>${kids}</b> students are going on a field trip. Each bus holds <b>${cap}</b> students. How many buses are needed?`); }
    const per = pick([12, 16, 24, 25]), boxes = R(15, 60), n = per * boxes; return num(boxes, `${n2(n)} ÷ ${per} = ${boxes}. Check: ${boxes} × ${per} = ${n2(n)}.`, 'How many groups of the box size fit into the total?', `A baker makes <b>${n2(n)}</b> cookies and packs <b>${per}</b> in each box. How many boxes can she fill?`); } },

{ id: 'fadd', camp: 'Fraction Forest', title: 'Adding & Subtracting Fractions', std: '5.NF.1–2',
  boss: { face: '🦉', name: 'Pieces the Owl', taunt: 'Whooo can add pieces of different sizes? Not you!' },
  fmt: 'Type a fraction like 7/12 or a mixed number like 1 5/12.',
  gen() { const D = [2, 3, 4, 5, 6, 8, 10, 12]; let d1 = pick(D), d2; do { d2 = pick(D); } while (d2 === d1);
    let n1 = R(1, d1 - 1), m2 = R(1, d2 - 1); const L = d1 * d2 / gcd(d1, d2); let a1 = n1 * L / d1, a2 = m2 * L / d2;
    const hint = `Find a number both ${d1} and ${d2} divide into. Rename both fractions with it.`; const t = R(0, 3);
    if (t === 1) { if (a1 === a2) return this.gen(); if (a1 < a2) { [n1, m2, d1, d2, a1, a2] = [m2, n1, d2, d1, a2, a1]; } const r = a1 - a2;
      return fracA(r, L, `Common denominator ${L}: ${fr(n1, d1)} = ${fr(a1, L)} and ${fr(m2, d2)} = ${fr(a2, L)}. So ${fr(a1, L)} − ${fr(a2, L)} = ${fr(r, L)}${simp(r, L)[1] !== L ? ` = ${fracHTML(r, L)}` : ''}.`, hint, `Solve it.<span class="expr">${fr(n1, d1)} − ${fr(m2, d2)}</span>`); }
    if (t === 2) { const w1 = R(1, 4), w2 = R(1, 3), r = (w1 + w2) * L + a1 + a2; return fracA(r, L, `Add the wholes: ${w1} + ${w2} = ${w1 + w2}. Add the fractions: ${fr(a1, L)} + ${fr(a2, L)} = ${fracHTML(a1 + a2, L)}. Total: ${fracHTML(r, L)}.`, 'Add the whole numbers and the fractions separately, then combine.', `Solve it.<span class="expr">${w1}${fr(n1, d1)} + ${w2}${fr(m2, d2)}</span>`); }
    const r = a1 + a2; const why = `Common denominator ${L}: ${fr(n1, d1)} = ${fr(a1, L)} and ${fr(m2, d2)} = ${fr(a2, L)}. So ${fr(a1, L)} + ${fr(a2, L)} = ${fr(r, L)}${(simp(r, L)[1] !== L || r > L) ? ` = ${fracHTML(r, L)}` : ''}.`;
    if (t === 3) { const nm = pick(NAMES); return fracA(r, L, why, hint, `${nm} runs ${fr(n1, d1)} mile on Monday and ${fr(m2, d2)} mile on Tuesday. How many miles is that in all?`); }
    return fracA(r, L, why, hint, `Solve it.<span class="expr">${fr(n1, d1)} + ${fr(m2, d2)}</span>`); } },

{ id: 'fmul', camp: 'Scaling Cliffs', title: 'Multiplying Fractions', std: '5.NF.4–6',
  boss: { face: '🐻', name: 'Scaler the Bear', taunt: 'Multiplying always makes things bigger. Right? RIGHT?' },
  fmt: 'Type a whole number, a fraction like 3/8, or a mixed number like 1 1/5.',
  gen() { const t = R(0, 3);
    if (t === 0) { const b = R(2, 9), d = R(2, 9), a = R(1, b - 1), c = R(1, d - 1); return fracA(a * c, b * d, `Tops: ${a} × ${c} = ${a * c}. Bottoms: ${b} × ${d} = ${b * d}. ${fr(a * c, b * d)}${simp(a * c, b * d)[1] !== b * d ? ` simplifies to ${fracHTML(a * c, b * d)}` : ''}.`, 'Multiply top × top and bottom × bottom. Then simplify.', `Solve it.<span class="expr">${fr(a, b)} × ${fr(c, d)}</span>`); }
    if (t === 1) { const d = pick([3, 4, 5, 6, 8, 10]), n = R(1, d - 1), w = d * R(2, 12), v = n * w / d; return num(v, `${w} ÷ ${d} = ${w / d} in each group. Take ${n} group${n > 1 ? 's' : ''}: ${w / d} × ${n} = ${v}.`, `Split ${w} into ${d} equal groups first.`, `What is ${fr(n, d)} of <b>${w}</b>?`); }
    if (t === 2) { const d = pick([3, 4, 5, 6, 8]), n = R(1, d - 1), w = R(2, 7); if ((n * w) % d === 0) return this.gen(); return fracA(n * w, d, `${w} × ${fr(n, d)} = ${fr(n * w, d)}${n * w > d ? ` = ${fracHTML(n * w, d)}` : ''}.`, `Think of ${w} as ${fr(w, 1)}. Multiply the tops.`, `Solve it.<span class="expr">${w} × ${fr(n, d)}</span>`); }
    const b = R(2, 6), d = R(2, 6), a = R(1, b - 1), c = R(1, d - 1); return fracA(a * c, b * d, `Area = length × width = ${fr(a, b)} × ${fr(c, d)} = ${fracHTML(a * c, b * d)} square yards.`, 'Area of a rectangle is length × width.', `A garden is ${fr(a, b)} yard long and ${fr(c, d)} yard wide. What is its area in square yards?`); } },

{ id: 'vol', camp: 'Volume Caves', title: 'Volume', std: '5.MD.3–5',
  boss: { face: '🦇', name: 'Cubic the Bat', taunt: 'My cave is full of cubes. Count them all, if you dare.' },
  fmt: 'Type a whole number. Leave off the units.',
  gen() { const t = R(0, 3); const u = pick(['cm', 'in', 'ft']);
    if (t === 0) { const l = R(2, 12), w = R(2, 9), h = R(2, 10), v = l * w * h; return num(v, `One layer: ${l} × ${w} = ${l * w} cubes. ${h} layers: ${l * w} × ${h} = ${n2(v)} ${u}³.`, 'Multiply length × width × height.', `What is the volume of this box in cubic ${u}?${boxSVG(l, w, h, u)}`); }
    if (t === 1) { const s = R(2, 10), v = s ** 3; return num(v, `Every side is ${s}. ${s} × ${s} × ${s} = ${n2(v)} ${u}³.`, 'A cube has the same length, width, and height.', `A cube is <b>${s} ${u}</b> on each side. What is its volume in cubic ${u}?`); }
    if (t === 2) { const l = R(2, 10), w = R(2, 8), h = R(2, 9), v = l * w * h; return num(h, `One layer holds ${l} × ${w} = ${l * w} cubes. ${n2(v)} ÷ ${l * w} = ${h} layers tall.`, 'Find how many cubes fit in one layer, then divide.', `A box holds <b>${n2(v)}</b> cubic ${u}. It is ${l} ${u} long and ${w} ${u} wide. How tall is it in ${u}?`); }
    const a = [R(2, 6), R(2, 6), R(2, 6)], b = [R(2, 8), R(2, 6), R(2, 5)], va = a[0] * a[1] * a[2], vb = b[0] * b[1] * b[2]; return num(va + vb, `First box: ${a.join(' × ')} = ${va}. Second box: ${b.join(' × ')} = ${vb}. Together: ${va + vb} ${u}³.`, 'Find each box\'s volume, then add.', `A toy chest is made of two boxes stacked together. One is ${a.join(' × ')} ${u}. The other is ${b.join(' × ')} ${u}. What is the total volume in cubic ${u}?`); } },

{ id: 'grid', camp: 'Lookout Grid', title: 'The Coordinate Plane', std: '5.G.1–2',
  boss: { face: '🦊', name: 'Gridfox', taunt: 'I hide on the grid. Find my address or I win!' },
  fmt: 'Type a point like (3, 5), or a whole number for a distance.',
  gen() { const t = R(0, 2);
    if (t === 0) { const x = R(0, 10), y = R(0, 10); return pt(x, y, `Walk right ${x}, then climb up ${y}. The point is (${x}, ${y}).`, 'How far right is it? That is x. How far up? That is y.', `What are the coordinates of the orange point?${gridSVG([{ x, y }])}`); }
    if (t === 1) { const x = R(0, 6), y = R(0, 6), dx = R(1, 10 - x), dy = R(1, 10 - y); return pt(x + dx, y + dy, `Start at (${x}, ${y}). Right ${dx} adds to x: ${x + dx}. Up ${dy} adds to y: ${y + dy}. You land on (${x + dx}, ${y + dy}).`, 'Moving right changes x. Moving up changes y.', `A hiker starts at point A. She walks <b>${dx} right</b> and <b>${dy} up</b>. Where does she end up?${gridSVG([{ x, y, label: 'A' }])}`); }
    const x = R(1, 9), y1 = R(0, 4), y2 = R(y1 + 2, 10); const vert = R(0, 1); const A = vert ? { x, y: y1 } : { x: y1, y: x }, B = vert ? { x, y: y2 } : { x: y2, y: x };
    return num(y2 - y1, `Both points share ${vert ? 'x = ' + x : 'y = ' + x}, so count along the line: ${y2} − ${y1} = ${y2 - y1} units.`, 'The two points are on the same line. Subtract the numbers that change.', `Point A is at (${A.x}, ${A.y}) and point B is at (${B.x}, ${B.y}). How many units apart are they?${gridSVG([{ ...A, label: 'A' }, { ...B, label: 'B' }])}`); } }
];

const SUMMIT_BOSS = { face: '🐉', name: 'The Summit Dragon', taunt: 'Every trick from every camp. All at once. Ready?' };

const BUDDIES = [
  { id: 'goat', face: '🐐', name: 'Goat', cost: 0 },
  { id: 'fox', face: '🦊', name: 'Fox', cost: 60 },
  { id: 'penguin', face: '🐧', name: 'Penguin', cost: 100 },
  { id: 'panda', face: '🐼', name: 'Panda', cost: 150 },
  { id: 'octopus', face: '🐙', name: 'Octopus', cost: 220 },
  { id: 'trex', face: '🦖', name: 'T-Rex', cost: 300 },
  { id: 'unicorn', face: '🦄', name: 'Unicorn', cost: 400 },
  { id: 'robot', face: '🤖', name: 'Robot', cost: 500 }
];
