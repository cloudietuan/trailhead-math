// Echo: the guide. An original hover-drone buddy who lives in the corner, flies a pointer around the
// screen to show you things, and plays animated "holo-board" explanations of how the math and the AI work.

function echoSVG(mood = 'happy', cls = '') {
  const eyes = {
    happy: '<path d="M37 49 Q44 40 51 49 M69 49 Q76 40 83 49" stroke="#7FF8FF" stroke-width="5.5" fill="none" stroke-linecap="round"/>',
    wow: '<circle cx="44" cy="47" r="7" fill="#7FF8FF"/><circle cx="76" cy="47" r="7" fill="#7FF8FF"/>',
    think: '<path d="M37 47 L51 47" stroke="#7FF8FF" stroke-width="5.5" stroke-linecap="round"/><circle cx="76" cy="46" r="7" fill="#7FF8FF"/>',
    talk: '<ellipse cx="44" cy="46" rx="6" ry="8" fill="#7FF8FF"/><ellipse cx="76" cy="46" rx="6" ry="8" fill="#7FF8FF"/>',
  }[mood];
  return `<svg class="echo ${cls}" viewBox="0 0 120 120" aria-hidden="true">
  <ellipse class="ering" cx="60" cy="104" rx="26" ry="6" fill="none" stroke="#7FF8FF" stroke-width="4"/>
  <path d="M60 12 L60 2" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M60 -6 l3 6 6.5 .8 -4.8 4.4 1.3 6.4 -6 -3.3 -6 3.3 1.3 -6.4 -4.8 -4.4 6.5 -.8z" fill="#FF4FD8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="6" y="38" width="18" height="30" rx="8" fill="#FF4FD8" stroke="${INK}" stroke-width="4.5"/><rect x="96" y="38" width="18" height="30" rx="8" fill="#FF4FD8" stroke="${INK}" stroke-width="4.5"/>
  <path d="M18 52 Q18 12 60 12 Q102 12 102 52 Q102 86 60 90 Q18 86 18 52 Z" fill="#F4F6FF" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
  <path d="M26 68 Q60 86 94 68 Q90 84 60 86 Q30 84 26 68 Z" fill="#C9D2F0"/>
  <rect x="27" y="30" width="66" height="34" rx="16" fill="#120C33" stroke="${INK}" stroke-width="4"/>${eyes}
  <path d="M34 36 Q42 31 52 32" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".5"/>
  <path d="M52 74 Q60 80 68 74" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
}

// ─── Scene helpers (holo-board is a 400 × 220 SVG) ───
const an = (c, d = 0, st = '') => `class="a-${c}" style="--d:${d}s;${st}"`;
const tx = (x, y, s, d = 0, cls = '') => `<text x="${x}" y="${y}" text-anchor="middle" class="a-fade ${cls}" style="--d:${d}s">${s}</text>`;
const NLX = (v, lo, hi) => 30 + (v - lo) * 340 / (hi - lo);
function hNL(lo, hi, y = 150) { let s = `<line x1="20" y1="${y}" x2="380" y2="${y}" class="a-draw st" pathLength="1"/>`; for (let v = lo; v <= hi; v++) s += `<line x1="${NLX(v, lo, hi)}" y1="${y - 6}" x2="${NLX(v, lo, hi)}" y2="${y + 6}" class="a-fade ${v === 0 ? 'sty' : 'st2'}" style="--d:${0.3 + (v - lo) * 0.03}s"/>` + (v % 2 === 0 ? tx(NLX(v, lo, hi), y + 24, n2(v), 0.4 + (v - lo) * 0.03, v === 0 ? 'hl sm' : 'sm') : ''); return s; }
const hop = (a, b, lo, hi, d, y = 150) => { const x1 = NLX(a, lo, hi), x2 = NLX(b, lo, hi); return `<path d="M${x1} ${y - 10} Q${(x1 + x2) / 2} ${y - 95} ${x2} ${y - 10}" class="a-draw stc" pathLength="1" style="--d:${d}s;--t:1s"/><circle cx="${x2}" cy="${y}" r="9" ${an('pop', d + 0.9)} fill="#FFC93C" stroke="${INK}" stroke-width="3"/>`; };
function hScale(a, b, right, x, phase) { // phase 0: full, 1: b removed, 2: one x
  let s = `<path d="M185 200 L215 200 L200 150 Z" fill="#C9D2F0"/><line x1="80" y1="140" x2="320" y2="140" class="st" stroke-linecap="round"/><rect x="50" y="140" width="120" height="8" rx="4" fill="#7FF8FF"/><rect x="230" y="140" width="120" height="8" rx="4" fill="#7FF8FF"/>`;
  const boxes = phase === 2 ? 1 : a;
  for (let i = 0; i < boxes; i++) s += `<g ${an('pop', i * 0.12)}><rect x="${58 + i * 28}" y="112" width="24" height="26" rx="5" fill="#FF4FD8" stroke="${INK}" stroke-width="3"/><text x="${70 + i * 28}" y="131" text-anchor="middle" class="ink">x</text></g>`;
  if (phase < 2) for (let i = 0; i < b; i++) s += `<circle cx="${62 + (i % 6) * 18}" cy="${100 - Math.floor(i / 6) * 18}" r="7" fill="#FFC93C" stroke="${INK}" stroke-width="2.5" class="${phase === 1 ? 'a-out' : 'a-pop'}" style="--d:${phase === 1 ? 0.3 + i * 0.08 : 0.4 + i * 0.06}s"/>`;
  s += `<text x="290" y="130" text-anchor="middle" class="big hl ${phase ? 'a-pop' : 'a-fade'}" style="--d:${phase ? 0.9 : 0.5}s">${right}</text>`;
  return s;
}
const hGrid = (ox, oy, u, x0, x1, y0, y1) => { let s = ''; for (let x = x0; x <= x1; x++) s += `<line x1="${ox + x * u}" y1="${oy - y0 * u}" x2="${ox + x * u}" y2="${oy - y1 * u}" class="${x === 0 ? 'st' : 'gl'}"/>`; for (let y = y0; y <= y1; y++) s += `<line x1="${ox + x0 * u}" y1="${oy - y * u}" x2="${ox + x1 * u}" y2="${oy - y * u}" class="${y === 0 ? 'st' : 'gl'}"/>`; return s; };
const chipT = (x, y, w, s, d, col = '#3DD6FF') => `<g ${an('pop', d)}><rect x="${x}" y="${y}" width="${w}" height="30" rx="9" fill="${col}" stroke="${INK}" stroke-width="3"/><text x="${x + w / 2}" y="${y + 21}" text-anchor="middle" class="ink">${s}</text></g>`;
const netSVG = (wireCls, d0 = 0) => { const L = [[70, [50, 110, 170]], [200, [35, 85, 135, 185]], [330, [80, 140]]]; let s = ''; for (let l = 0; l < 2; l++) L[l][1].forEach((y1, i) => L[l + 1][1].forEach((y2, j) => { s += `<line x1="${L[l][0]}" y1="${y1}" x2="${L[l + 1][0]}" y2="${y2}" class="${wireCls}" pathLength="1" style="--d:${d0 + l * 0.7 + (i + j) * 0.05}s"/>`; })); L.forEach(([x, ys], l) => ys.forEach((y, i) => { s += `<circle cx="${x}" cy="${y}" r="15" fill="${l === 2 ? '#FFC93C' : '#3DD6FF'}" stroke="${INK}" stroke-width="3.5" ${an('pop', l * 0.15 + i * 0.05)}/>`; })); return s; };

const balance = (a, b, x) => { const c = a * x + b; return [
  { say: `Think of <b>${a}x + ${b} = ${c}</b> as a balanced scale. Each pink box is one x. Both sides weigh the same.`, svg: hScale(a, b, c, x, 0) + tx(110, 30, `${a}x + ${b}`, 0.2, 'big') + tx(290, 30, c, 0.2, 'big') },
  { say: `Take <b>${b}</b> off <b>both</b> sides. The scale stays balanced, and now ${a}x = ${c - b}.`, svg: hScale(a, b, c - b, x, 1) + tx(110, 30, `${a}x`, 0.9, 'big') + tx(290, 30, c - b, 0.9, 'big') },
  { say: `${a} boxes weigh ${c - b}, so split it ${a} ways. One box is <b>x = ${x}</b>. Undo the adding first, then the multiplying.`, svg: hScale(a, b, x, x, 2) + tx(110, 30, 'x', 0.3, 'big') + tx(290, 30, `${c - b} ÷ ${a}`, 0.3, 'big') },
]; };

// Drawings built from the numbers in one specific question (used by "Echo, show me how")
const vizBalance = (a, b, x) => ({ say: `Here's <b>your</b> equation as a balanced scale: ${a} boxes of x plus ${b} on the left, ${a * x + b} on the right.`, svg: hScale(a, b, a * x + b, x, 0) + tx(110, 30, `${a}x + ${b}`, 0.2, 'big') + tx(290, 30, a * x + b, 0.2, 'big') });
const vizPyth = (a, b, c, hide) => ({ say: `Here's your triangle. The side marked <b>?</b> is the one we need.`, svg: `<polygon points="90,180 250,180 90,60" fill="#FF8A3D" stroke="#fff" stroke-width="4" ${an('pop')}/><rect x="90" y="166" width="14" height="14" fill="none" class="sty"/>` + tx(72, 126, hide === 'a' ? '?' : a, 0.5, hide === 'a' ? 'big hl' : 'big') + tx(170, 208, hide === 'b' ? '?' : b, 0.6, hide === 'b' ? 'big hl' : 'big') + tx(190, 112, hide === 'c' ? '?' : c, 0.7, hide === 'c' ? 'big hl' : 'big') + tx(320, 90, 'a² + b² = c²', 1.1, 'hl') + tx(320, 124, hide === 'c' ? `${a}² + ${b}² = ?²` : `?² + ${hide === 'a' ? b : a}² = ${c}²`, 1.6) });
const vizSlope = (x1, y1, x2, y2) => { const up = y2 >= y1, ay = up ? 170 : 60, by = up ? 60 : 170; return { say: 'Here are your two points. The <b>run</b> is how far across, and the <b>rise</b> is how far up or down.', svg: `<line x1="60" y1="${ay + (up ? 22 : -22)}" x2="300" y2="${by + (up ? -22 : 22)}" class="a-draw stp" pathLength="1"/><line x1="90" y1="${ay}" x2="270" y2="${ay}" class="a-draw stc" pathLength="1" style="--d:.8s"/><line x1="270" y1="${ay}" x2="270" y2="${by}" class="a-draw sty" pathLength="1" style="--d:1.4s"/><circle cx="90" cy="${ay}" r="8" fill="#7FF8FF" stroke="${INK}" stroke-width="3" ${an('pop', 0.3)}/><circle cx="270" cy="${by}" r="8" fill="#7FF8FF" stroke="${INK}" stroke-width="3" ${an('pop', 0.5)}/>` + tx(70, ay + (up ? 30 : -18), `(${n2(x1)}, ${n2(y1)})`, 0.4, 'sm') + tx(300, by + (up ? -16 : 30), `(${n2(x2)}, ${n2(y2)})`, 0.6, 'sm') + tx(180, ay + (up ? 24 : -12), `run = ${n2(x2 - x1)}`, 1.1, 'cy') + tx(326, 120, `rise = ${n2(y2 - y1)}`, 1.7, 'hl') }; };
const vizBag = (groups, want) => { const all = groups.flatMap(([n, col, name]) => Array.from({ length: n }, () => [col, name])), per = Math.min(9, Math.ceil(Math.sqrt(all.length * 2))); return { say: `Here's your bag: ${all.length} marbles in all. The ${want} ones are glowing.`, svg: all.map(([col, name], i) => `<circle cx="${200 - (per - 1) * 19 + (i % per) * 38}" cy="${50 + Math.floor(i / per) * 40}" r="15" fill="${col}" stroke="${INK}" stroke-width="3" ${name === want ? 'class="a-pulse"' : `${an('pop', i * 0.04)} opacity=".55"`}/>`).join('') + tx(200, 204, `${all.filter(x => x[1] === want).length} ${want} out of ${all.length}`, 0.8, 'big hl') }; };

// Each explainer: a title and a few scenes. A scene has what Echo says and an animated drawing.
const EXPLAIN = {
  neg: { title: 'Negative numbers', scenes: [
    { say: 'Here\'s a number line. <b>Zero</b> sits in the middle. Negatives live to the <b>left</b>, and the further left, the smaller.', svg: hNL(-10, 10) + tx(110, 60, '← smaller', 1.2, 'cy') + tx(290, 60, 'bigger →', 1.2, 'hl') },
    { say: '<b>−4 + 9</b>: start at −4, then hop 9 steps to the <b>right</b>. You land on <b>5</b>.', svg: hNL(-10, 10) + `<circle cx="${NLX(-4, -10, 10)}" cy="150" r="9" ${an('pop', 1)} fill="#FF4FD8" stroke="${INK}" stroke-width="3"/>` + hop(-4, 5, -10, 10, 1.4) + tx(200, 40, '−4 + 9 = 5', 2.4, 'big hl') },
    { say: 'Subtracting a negative? The two minus signs smash together into a <b>plus</b>. So 5 − (−3) is really 5 + 3.', svg: hNL(-10, 10) + `<text x="200" y="40" text-anchor="middle" class="big a-out" style="--d:1.4s">5 − (−3)</text>` + tx(200, 40, '5 + 3 = 8', 1.9, 'big hl') + `<circle cx="${NLX(5, -10, 10)}" cy="150" r="9" ${an('pop', 0.8)} fill="#FF4FD8" stroke="${INK}" stroke-width="3"/>` + hop(5, 8, -10, 10, 2.2) },
  ] },
  pow: { title: 'Exponents', scenes: [
    { say: 'An exponent says how many times to multiply a number by <b>itself</b>. 2⁴ means 2 × 2 × 2 × 2.', svg: tx(200, 60, '2⁴', 0, 'huge hl') + ['2', '×', '2', '×', '2', '×', '2'].map((c, i) => tx(110 + i * 30, 140, c, 0.6 + i * 0.2, 'big')).join('') },
    { say: 'Watch it double each time: 2, 4, 8, <b>16</b>. Exponents grow FAST. That\'s different from 2 × 4, which is only 8.', svg: [1, 2, 3, 4].map((e, r) => Array.from({ length: 2 ** e }, (_, i) => `<rect x="${40 + i * 19}" y="${30 + r * 44}" width="15" height="30" rx="4" fill="${['#3DD6FF', '#5BE36B', '#FFC93C', '#FF4FD8'][r]}" stroke="${INK}" stroke-width="2.5" ${an('pop', r * 0.7 + i * 0.03)}/>`).join('') + tx(370, 52 + r * 44, 2 ** e, r * 0.7 + 0.4, 'big')).join('') },
  ] },
  ratio: { title: 'Ratios', scenes: [
    { say: 'A ratio compares two amounts. Here it\'s <b>2 gems for every 3 coins</b>. We write 2 : 3.', svg: [0, 1].map(i => `<rect x="${90 + i * 34}" y="80" width="24" height="24" rx="4" transform="rotate(45 ${102 + i * 34} 92)" fill="#FF6BD5" stroke="${INK}" stroke-width="3" ${an('pop', i * 0.15)}/>`).join('') + [0, 1, 2].map(i => `<circle cx="${230 + i * 34}" cy="92" r="13" fill="#FFC93C" stroke="${INK}" stroke-width="3" ${an('pop', 0.4 + i * 0.15)}/>`).join('') + tx(200, 170, '2 : 3', 1, 'big hl') },
    { say: 'Make 3 copies of the whole group. Now there are 6 gems and 9 coins. The <b>ratio is the same</b>, just scaled up.', svg: [0, 1, 2].map(r => [0, 1].map(i => `<rect x="${90 + i * 34}" y="${26 + r * 46}" width="22" height="22" rx="4" transform="rotate(45 ${101 + i * 34} ${37 + r * 46})" fill="#FF6BD5" stroke="${INK}" stroke-width="3" ${an('pop', r * 0.5 + i * 0.1)}/>`).join('') + [0, 1, 2].map(i => `<circle cx="${230 + i * 34}" cy="${37 + r * 46}" r="12" fill="#FFC93C" stroke="${INK}" stroke-width="3" ${an('pop', r * 0.5 + 0.2 + i * 0.1)}/>`).join('')).join('') + tx(200, 196, '2 : 3  =  6 : 9', 1.8, 'big hl') },
  ] },
  pct: { title: 'Percents', scenes: [
    { say: 'Percent means <b>out of 100</b>. To find 25% of 80, picture the whole bar as 80.', svg: `<rect x="40" y="80" width="320" height="50" rx="10" fill="#2D2484" stroke="#fff" stroke-width="3" ${an('growx')}/>` + tx(200, 60, '80  =  100%', 0.6, 'big') },
    { say: '25% is one quarter, so cut the bar into <b>4 equal parts</b>. Each part is 80 ÷ 4 = 20.', svg: `<rect x="40" y="80" width="320" height="50" rx="10" fill="#2D2484" stroke="#fff" stroke-width="3"/>` + [1, 2, 3].map(i => `<line x1="${40 + i * 80}" y1="80" x2="${40 + i * 80}" y2="130" class="a-draw st" pathLength="1" style="--d:${i * 0.3}s"/>`).join('') + [0, 1, 2, 3].map(i => tx(80 + i * 80, 113, '20', 1.1 + i * 0.15, 'big')).join('') },
    { say: 'Light up one part. <b>25% of 80 = 20</b>. Shortcut: turn the percent into a decimal and multiply. 0.25 × 80 = 20.', svg: `<rect x="40" y="80" width="320" height="50" rx="10" fill="#2D2484" stroke="#fff" stroke-width="3"/><rect x="40" y="80" width="80" height="50" rx="10" fill="#FFC93C" ${an('growx', 0.2)}/>` + [1, 2, 3].map(i => `<line x1="${40 + i * 80}" y1="80" x2="${40 + i * 80}" y2="130" class="st"/>`).join('') + tx(80, 113, '20', 0.6, 'big ink') + tx(200, 180, '0.25 × 80 = 20', 1, 'big hl') },
  ] },
  divf: { title: 'Dividing fractions', scenes: [
    { say: '¾ ÷ ½ asks: <b>how many halves fit inside three quarters?</b> More than one, but not two.', svg: tx(200, 44, '¾ ÷ ½', 0, 'huge') + `<rect x="60" y="80" width="210" height="34" rx="8" fill="#FF8A3D" stroke="${INK}" stroke-width="3" ${an('growx', 0.5)}/><rect x="60" y="130" width="140" height="34" rx="8" fill="#3DD6FF" stroke="${INK}" stroke-width="3" ${an('growx', 1)}/>` + tx(310, 103, '¾', 0.7, 'big') + tx(240, 153, '½', 1.2, 'big') },
    { say: 'The trick: <b>keep, change, flip</b>. Keep the first fraction, change ÷ to ×, and flip the second one upside down.', svg: tx(110, 110, '¾', 0, 'huge') + `<text x="200" y="110" text-anchor="middle" class="huge a-out" style="--d:.8s">÷</text>` + tx(200, 110, '×', 1.2, 'huge hl') + `<g class="a-flip" style="--d:1.6s"><text x="290" y="110" text-anchor="middle" class="huge cy">²⁄₁</text></g>` + `<text x="290" y="110" text-anchor="middle" class="huge a-out" style="--d:1.5s">½</text>` + tx(200, 180, 'keep · change · flip', 2.2, 'hl') },
    { say: 'Now multiply straight across: 3 × 2 = 6 on top, 4 × 1 = 4 on the bottom. 6/4 = <b>1½</b>. One and a half halves fit.', svg: tx(200, 60, '¾ × ²⁄₁ = ⁶⁄₄ = 1½', 0, 'big hl') + `<rect x="60" y="100" width="210" height="34" rx="8" fill="#FF8A3D" stroke="${INK}" stroke-width="3"/><rect x="60" y="150" width="140" height="34" rx="8" fill="#3DD6FF" stroke="${INK}" stroke-width="3" ${an('growx', 0.5)}/><rect x="200" y="150" width="70" height="34" rx="8" fill="#7FF8FF" stroke="${INK}" stroke-width="3" ${an('growx', 1.1)}/>` + tx(130, 173, '1', 0.9, 'ink') + tx(235, 173, '½', 1.5, 'ink') },
  ] },
  eq: { title: 'Solving equations', scenes: balance(2, 4, 5) },
  twostep: { title: 'Two-step equations', scenes: balance(3, 5, 5) },
  area: { title: 'Area', scenes: [
    { say: 'Area counts the <b>squares</b> that cover a shape. This rectangle is 6 across and 4 down: 6 × 4 = <b>24</b> squares.', svg: Array.from({ length: 24 }, (_, i) => `<rect x="${80 + (i % 6) * 40}" y="${30 + Math.floor(i / 6) * 40}" width="38" height="38" rx="5" fill="#FF8A3D" stroke="${INK}" stroke-width="2" ${an('pop', i * 0.04)}/>`).join('') + tx(200, 212, '6 × 4 = 24', 1.2, 'big hl') },
    { say: 'Slice it corner to corner. Each triangle is exactly <b>half</b> the rectangle. That\'s why a triangle is ½ × base × height.', svg: `<rect x="80" y="30" width="240" height="160" fill="#FF8A3D" opacity=".35" stroke="#fff" stroke-width="3"/><polygon points="80,190 320,190 80,30" fill="#FFC93C" stroke="${INK}" stroke-width="3" ${an('fade', 1.1)}/><line x1="80" y1="30" x2="320" y2="190" class="a-draw st" pathLength="1" style="--d:.3s"/>` + tx(200, 212, '½ × 6 × 4 = 12', 1.5, 'big hl') },
  ] },
  stats: { title: 'Mean and median', scenes: [
    { say: 'Five scores: 2, 6, 4, 8 and 5. The <b>mean</b> is what everyone gets if you share the total out evenly.', svg: [2, 6, 4, 8, 5].map((v, i) => `<rect x="${70 + i * 56}" y="${180 - v * 18}" width="40" height="${v * 18}" rx="6" fill="#FF8A3D" stroke="${INK}" stroke-width="3" ${an('grow', i * 0.15)}/>` + tx(90 + i * 56, 172 - v * 18, v, 0.5 + i * 0.15)).join('') + `<line x1="50" y1="180" x2="350" y2="180" class="st"/>` },
    { say: 'Add them: 25. Split into 5 equal bars: <b>25 ÷ 5 = 5</b>. Tall bars gave some to short bars until all were level.', svg: [2, 6, 4, 8, 5].map((v, i) => `<rect x="${70 + i * 56}" y="${180 - v * 18}" width="40" height="${v * 18}" rx="6" fill="#FF8A3D" opacity=".3" class="a-out" style="--d:.9s"/><rect x="${70 + i * 56}" y="90" width="40" height="90" rx="6" fill="#FFC93C" stroke="${INK}" stroke-width="3" ${an('fade', 1 + i * 0.1)}/>`).join('') + `<line x1="50" y1="180" x2="350" y2="180" class="st"/><line x1="50" y1="90" x2="350" y2="90" class="a-draw stc" pathLength="1" style="--d:.2s"/>` + tx(200, 50, 'mean = 25 ÷ 5 = 5', 1.6, 'big hl') },
    { say: 'The <b>median</b> is different: line the numbers up in order and take the one in the <b>middle</b>.', svg: [2, 4, 5, 6, 8].map((v, i) => chipT(70 + i * 56, 90, 44, v, i * 0.2, i === 2 ? '#FFC93C' : '#3DD6FF')).join('') + tx(200, 170, 'median = 5', 1.4, 'big hl') + `<path d="M200 140 L200 124" class="a-draw st" pathLength="1" style="--d:1.2s"/>` },
  ] },
  prop: { title: 'Proportions', scenes: [
    { say: 'A proportion says two ratios are <b>equal</b>. Here, 3 over 4 equals x over 20.', svg: tx(130, 80, '3', 0, 'huge') + `<line x1="100" y1="96" x2="160" y2="96" class="st"/>` + tx(130, 150, '4', 0.1, 'huge') + tx(200, 118, '=', 0.3, 'huge') + tx(270, 80, 'x', 0.5, 'huge hl') + `<line x1="235" y1="96" x2="305" y2="96" class="st"/>` + tx(270, 150, '20', 0.6, 'huge') },
    { say: 'What happened on the bottom? 4 was multiplied by <b>5</b> to become 20. Whatever you do to the bottom, do to the top.', svg: tx(130, 80, '3', 0, 'huge') + `<line x1="100" y1="96" x2="160" y2="96" class="st"/>` + tx(130, 150, '4', 0, 'huge') + tx(270, 80, 'x', 0, 'huge hl') + `<line x1="235" y1="96" x2="305" y2="96" class="st"/>` + tx(270, 150, '20', 0, 'huge') + `<path d="M150 168 Q200 205 250 168" class="a-draw stc" pathLength="1" style="--d:.4s"/>` + tx(200, 208, '× 5', 1.1, 'big cy') + `<path d="M150 52 Q200 15 250 52" class="a-draw stc" pathLength="1" style="--d:1.6s"/>` + tx(200, 22, '× 5', 2.3, 'big cy') },
    { say: '3 × 5 = <b>15</b>. So x = 15. Check: 3/4 and 15/20 are the same fraction.', svg: tx(130, 80, '3', 0, 'huge') + `<line x1="100" y1="96" x2="160" y2="96" class="st"/>` + tx(130, 150, '4', 0, 'huge') + tx(200, 118, '=', 0, 'huge') + `<text x="270" y="80" text-anchor="middle" class="huge hl a-pop" style="--d:.3s">15</text><line x1="235" y1="96" x2="305" y2="96" class="st"/>` + tx(270, 150, '20', 0, 'huge') },
  ] },
  circ: { title: 'Circles and π', scenes: [
    { say: 'The distance across a circle is the <b>diameter</b>. The distance around it is the <b>circumference</b>.', svg: `<circle cx="200" cy="105" r="70" fill="none" class="a-draw stc" pathLength="1" style="--t:1.4s"/><line x1="130" y1="105" x2="270" y2="105" class="a-draw sty" pathLength="1" style="--d:1.3s"/>` + tx(200, 96, 'diameter', 1.8, 'hl') + tx(200, 204, 'circumference', 1.2, 'cy') },
    { say: 'Roll the wheel one full turn. It travels <b>3 diameters and a little bit more</b>. Every circle does this. That number is <b>π ≈ 3.14</b>.', svg: `<line x1="60" y1="170" x2="340" y2="170" class="st2"/><line x1="60" y1="170" x2="311" y2="170" class="a-draw stc" pathLength="1" style="--d:.3s;--t:3s"/>` + [1, 2, 3].map(i => `<line x1="${60 + i * 80}" y1="162" x2="${60 + i * 80}" y2="178" class="a-fade sty" style="--d:${0.3 + i * 0.95}s"/>` + tx(20 + i * 80, 196, 'd', 0.3 + i * 0.95, 'hl')).join('') + tx(306, 196, '+.14', 3.3, 'cy sm') + `<g class="a-roll"><circle cx="60" cy="130" r="40" fill="#2D2484" stroke="#7FF8FF" stroke-width="4"/><line x1="20" y1="130" x2="100" y2="130" class="sty"/><circle cx="60" cy="130" r="4" fill="#FFC93C"/></g>` + tx(200, 40, 'C = π × d', 3.4, 'big hl') },
    { say: 'For <b>area</b>, use the radius (half the diameter): A = π × r². Square the radius first, then multiply by 3.14.', svg: `<circle cx="140" cy="110" r="70" fill="#3DD6FF" opacity=".35" stroke="#7FF8FF" stroke-width="4"/><line x1="140" y1="110" x2="210" y2="110" class="a-draw sty" pathLength="1" style="--d:.3s"/>` + tx(175, 102, 'r', 0.7, 'hl') + `<rect x="140" y="40" width="70" height="70" fill="#FFC93C" opacity=".55" stroke="${INK}" stroke-width="3" ${an('pop', 1)}/>` + tx(175, 82, 'r²', 1.3, 'big ink') + tx(310, 100, 'A = π × r²', 1.7, 'big hl') + tx(310, 134, 'about 3.14 of', 2.1, 'sm') + tx(310, 152, 'those squares', 2.1, 'sm') },
  ] },
  vol: { title: 'Volume', scenes: [
    { say: 'Start with the <b>base</b>: one flat layer. This one is 5 by 3, so it holds 15 cubes.', svg: Array.from({ length: 5 }, (_, i) => `<rect x="${110 + i * 36}" y="160" width="34" height="26" rx="4" fill="#5BE36B" stroke="${INK}" stroke-width="2.5" ${an('pop', i * 0.1)}/>`).join('') + tx(200, 60, 'base area = 5 × 3 = 15', 0.8, 'big') },
    { say: 'Now <b>stack</b> identical layers. 4 layers high means 4 × 15 = <b>60</b> cubes. Volume = base area × height.', svg: [0, 1, 2, 3].map(r => Array.from({ length: 5 }, (_, i) => `<rect x="${110 + i * 36}" y="${160 - r * 28}" width="34" height="26" rx="4" fill="${['#5BE36B', '#3DD6FF', '#FFC93C', '#FF4FD8'][r]}" stroke="${INK}" stroke-width="2.5" ${an('pop', r * 0.5 + i * 0.04)}/>`).join('')).join('') + tx(200, 36, 'V = 15 × 4 = 60', 2.2, 'big hl') },
    { say: 'A cylinder works the same way. The base is a <b>circle</b> (π × r²), stacked up to the height.', svg: [0, 1, 2, 3, 4].map(r => `<ellipse cx="200" cy="${170 - r * 26}" rx="80" ry="18" fill="#3DD6FF" stroke="${INK}" stroke-width="3" ${an('pop', r * 0.3)}/>`).join('') + tx(200, 30, 'V = π × r² × h', 1.8, 'big hl') },
  ] },
  prob: { title: 'Probability', scenes: [
    { say: 'A bag holds 10 tokens: <b>2 gold</b> and 8 blue. You grab one without looking.', svg: Array.from({ length: 10 }, (_, i) => `<circle cx="${92 + (i % 5) * 54}" cy="${75 + Math.floor(i / 5) * 60}" r="21" fill="${i === 3 || i === 6 ? '#FFC93C' : '#3DD6FF'}" stroke="${INK}" stroke-width="3.5" ${an('pop', i * 0.08)}/>`).join('') },
    { say: 'Probability = the ways you <b>win</b>, divided by <b>all</b> the possible outcomes. 2 gold out of 10 total.', svg: Array.from({ length: 10 }, (_, i) => `<circle cx="${92 + (i % 5) * 54}" cy="${60 + Math.floor(i / 5) * 52}" r="19" fill="${i === 3 || i === 6 ? '#FFC93C' : '#3DD6FF'}" stroke="${INK}" stroke-width="3.5" ${i === 3 || i === 6 ? 'class="a-pulse"' : 'opacity=".4"'}/>`).join('') + tx(200, 190, 'P(gold) = 2 / 10', 0.6, 'big hl') },
    { say: 'Simplify: 2/10 = <b>1/5 = 20%</b>. For two separate events, like gold AND heads, multiply the two chances.', svg: `<rect x="40" y="90" width="320" height="40" rx="10" fill="#2D2484" stroke="#fff" stroke-width="3"/><rect x="40" y="90" width="64" height="40" rx="10" fill="#FFC93C" ${an('growx', 0.3)}/>` + tx(200, 60, '2/10 = 1/5 = 20%', 0, 'big hl') + tx(200, 180, 'gold AND heads: 1/5 × 1/2 = 1/10', 1.2) },
  ] },
  exp2: { title: 'Exponent laws', scenes: [
    { say: 'x³ is three x\'s multiplied. x⁴ is four x\'s multiplied.', svg: tx(120, 60, 'x³', 0, 'huge') + tx(290, 60, 'x⁴', 0.2, 'huge') + [0, 1, 2].map(i => chipT(70 + i * 36, 110, 30, 'x', 0.5 + i * 0.12, '#FF4FD8')).join('') + [0, 1, 2, 3].map(i => chipT(222 + i * 36, 110, 30, 'x', 1 + i * 0.12, '#3DD6FF')).join('') + tx(200, 132, '·', 0.9, 'huge') },
    { say: 'Multiply them and you just have <b>seven x\'s</b> in a row. That\'s why you <b>add</b> the exponents: 3 + 4 = 7.', svg: [0, 1, 2, 3, 4, 5, 6].map(i => `<g class="a-move" style="--d:.3s;--fx:${i < 3 ? -30 : 30}px;--fy:0px">${chipT(77 + i * 36, 90, 30, 'x', 0, i < 3 ? '#FF4FD8' : '#3DD6FF')}</g>`).join('') + tx(200, 60, 'x³ · x⁴ = x⁷', 1.2, 'big hl') + tx(200, 176, '3 + 4 = 7', 1.6, 'big') },
    { say: 'Power of a power, like (x³)², means x³ <b>twice</b>: six x\'s. So you <b>multiply</b>: 3 × 2 = 6.', svg: [0, 1].map(r => [0, 1, 2].map(i => chipT(140 + i * 40, 76 + r * 44, 32, 'x', r * 0.6 + i * 0.1, r ? '#FFC93C' : '#FF4FD8')).join('')).join('') + tx(200, 46, '(x³)² = x⁶', 1.4, 'big hl') + tx(200, 196, '3 × 2 = 6', 1.8, 'big') },
  ] },
  pyth: { title: 'The Pythagorean theorem', scenes: [
    { say: 'A right triangle with legs <b>3</b> and <b>4</b>. The long side across from the right angle is the <b>hypotenuse</b>.', svg: `<g transform="translate(-10,44) scale(.8)"><polygon points="160,120 240,120 160,60" fill="#FF8A3D" stroke="#fff" stroke-width="4" ${an('pop')}/><rect x="160" y="108" width="12" height="12" fill="none" class="sty"/></g>` + tx(108, 122, '3', 0.6, 'big') + tx(150, 164, '4', 0.7, 'big') + tx(176, 108, '?', 0.9, 'big hl') },
    { say: 'Build a square on each leg. The small one has 3 × 3 = <b>9</b> tiles. The other has 4 × 4 = <b>16</b>.', svg: `<g transform="translate(-10,44) scale(.8)">${Array.from({ length: 9 }, (_, i) => `<rect x="${100 + (i % 3) * 20}" y="${60 + Math.floor(i / 3) * 20}" width="19" height="19" fill="#3DD6FF" stroke="${INK}" stroke-width="1.5" ${an('pop', i * 0.06)}/>`).join('')}${Array.from({ length: 16 }, (_, i) => `<rect x="${160 + (i % 4) * 20}" y="${120 + Math.floor(i / 4) * 20}" width="19" height="19" fill="#5BE36B" stroke="${INK}" stroke-width="1.5" ${an('pop', 0.7 + i * 0.05)}/>`).join('')}<polygon points="160,120 240,120 160,60" fill="#FF8A3D" stroke="#fff" stroke-width="4"/></g>` + tx(60, 124, '9', 0.6, 'big cy') + tx(150, 214, '16', 1.6, 'big') },
    { say: 'Now the square on the hypotenuse. Its area is exactly the other two <b>added together</b>: 9 + 16 = <b>25</b>.', svg: `<g transform="translate(-10,44) scale(.8)"><rect x="100" y="60" width="60" height="60" fill="#3DD6FF" opacity=".6" stroke="${INK}" stroke-width="2"/><rect x="160" y="120" width="80" height="80" fill="#5BE36B" opacity=".6" stroke="${INK}" stroke-width="2"/><polygon points="160,60 240,120 300,40 220,-20" fill="#FFC93C" stroke="${INK}" stroke-width="3" ${an('fade', 0.4)}/><polygon points="160,120 240,120 160,60" fill="#FF8A3D" stroke="#fff" stroke-width="4"/></g>` + tx(176, 86, '25', 1, 'big ink') + tx(320, 100, 'a² + b² = c²', 1.3, 'hl') + tx(320, 130, '9 + 16 = 25', 1.7) },
    { say: 'If the square\'s area is 25, each side is <b>√25 = 5</b>. So the hypotenuse is 5. Works for every right triangle.', svg: `<g transform="translate(-10,44) scale(.8)"><polygon points="160,60 240,120 300,40 220,-20" fill="#FFC93C" opacity=".5" stroke="${INK}" stroke-width="3"/><polygon points="160,120 240,120 160,60" fill="#FF8A3D" stroke="#fff" stroke-width="4"/></g>` + tx(108, 122, '3', 0, 'big') + tx(150, 164, '4', 0, 'big') + `<text x="180" y="104" text-anchor="middle" class="big hl a-pop" style="--d:.5s">5</text>` + tx(320, 110, 'c = √25 = 5', 0.8, 'big hl') },
  ] },
  slope: { title: 'Slope', scenes: [
    { say: 'Here\'s a line on a grid. <b>Slope</b> measures how steep it is.', svg: hGrid(120, 180, 28, -2, 7, 0, 6) + `<line x1="92" y1="208" x2="190" y2="12" class="a-draw stp" pathLength="1" style="--t:1.2s" clip-path="inset(0)"/>` },
    { say: 'Walk it like stairs. Each step goes <b>1 across</b> (the run) and <b>2 up</b> (the rise). Slope = rise ÷ run = 2 ÷ 1 = <b>2</b>.', svg: hGrid(120, 180, 28, -2, 7, 0, 6) + `<line x1="106" y1="180" x2="190" y2="12" class="stp"/>` + [0, 1].map(i => `<line x1="${120 + i * 28}" y1="${152 - i * 56}" x2="${148 + i * 28}" y2="${152 - i * 56}" class="a-draw stc" pathLength="1" style="--d:${0.3 + i * 1.2}s"/><line x1="${148 + i * 28}" y1="${152 - i * 56}" x2="${148 + i * 28}" y2="${96 - i * 56}" class="a-draw sty" pathLength="1" style="--d:${0.8 + i * 1.2}s"/>`).join('') + tx(300, 80, 'rise 2', 1.2, 'hl') + tx(300, 106, 'run 1', 0.7, 'cy') + tx(300, 150, 'slope = 2', 2.8, 'big hl') },
    { say: 'The line crosses the y-axis at <b>1</b>. That\'s <b>b</b>, the starting value. Put it together: <b>y = 2x + 1</b>.', svg: hGrid(120, 180, 28, -2, 7, 0, 6) + `<line x1="106" y1="180" x2="190" y2="12" class="stp"/><circle cx="120" cy="152" r="8" fill="#FFC93C" stroke="${INK}" stroke-width="3" class="a-pulse"/>` + tx(290, 90, 'y = mx + b', 0.4, 'big') + tx(290, 130, 'y = 2x + 1', 1, 'big hl') },
  ] },
  sys: { title: 'Systems of equations', scenes: [
    { say: 'One equation with two unknowns has <b>lots</b> of answers: every point on its line.', svg: hGrid(110, 190, 26, -2, 8, 0, 7) + `<line x1="97" y1="216" x2="214" y2="-18" class="a-draw stp" pathLength="1" style="--t:1.2s"/>` + tx(310, 60, 'y = 2x − 1', 0.8, 'hl') },
    { say: 'Add a <b>second</b> equation. It\'s another line with its own set of answers.', svg: hGrid(110, 190, 26, -2, 8, 0, 7) + `<line x1="97" y1="216" x2="214" y2="-18" class="stp"/><line x1="84" y1="34" x2="292" y2="242" class="a-draw stc" pathLength="1" style="--t:1.2s"/>` + tx(310, 60, 'y = 2x − 1', 0, 'hl') + tx(310, 90, 'y = −x + 5', 0.8, 'cy') },
    { say: 'Only <b>one point</b> sits on both lines: (2, 3). That\'s the solution. It makes both equations true at the same time.', svg: hGrid(110, 190, 26, -2, 8, 0, 7) + `<line x1="97" y1="216" x2="214" y2="-18" class="stp"/><line x1="84" y1="34" x2="292" y2="242" class="stc"/><circle cx="162" cy="112" r="9" fill="#FFC93C" stroke="${INK}" stroke-width="3" class="a-pulse"/>` + tx(204, 108, '(2, 3)', 0.4, 'big hl') + tx(310, 150, '2(2) − 1 = 3 ✔', 1) + tx(310, 176, '−2 + 5 = 3 ✔', 1.5) },
  ] },
  loop: { title: 'Loops', scenes: [
    { say: 'Writing the same instruction again and again works, but it\'s slow and easy to mess up.', svg: [0, 1, 2, 3].map(i => chipT(130, 24 + i * 44, 140, 'move forward', i * 0.25, '#5BE36B')).join('') },
    { say: 'A <b>loop</b> says it once and tells the computer how many times to repeat. Watch the counter.', svg: `<rect x="100" y="50" width="200" height="120" rx="16" fill="none" class="a-draw stc" pathLength="1" style="--t:1.2s"/>` + tx(200, 40, 'repeat 4 times', 0.4, 'big cy') + chipT(130, 95, 140, 'move forward', 0.8, '#5BE36B') + [1, 2, 3, 4].map(i => `<text x="340" y="120" text-anchor="middle" class="huge hl a-blink" style="--d:${1 + i * 0.7}s">${i}</text>`).join('') },
    { say: 'In Lua it looks like this. <b>i</b> counts from 1 to 4, and everything between <b>do</b> and <b>end</b> runs each time.', svg: tx(200, 70, 'for i = 1, 4 do', 0, 'mono') + tx(200, 110, 'move()', 0.5, 'mono hl') + tx(200, 150, 'end', 1, 'mono') },
  ] },
  func: { title: 'Functions', scenes: [
    { say: 'A <b>function</b> is a little machine. You give it an input, it does its job, and it hands back an output.', svg: `<rect x="130" y="70" width="140" height="80" rx="16" fill="#2D2484" stroke="#7FF8FF" stroke-width="4" ${an('pop')}/>` + tx(200, 118, 'double(n)', 0.4, 'mono') },
    { say: 'Put <b>5</b> in. The machine runs n * 2 and returns <b>10</b>.', svg: `<rect x="130" y="70" width="140" height="80" rx="16" fill="#2D2484" stroke="#7FF8FF" stroke-width="4"/>` + tx(200, 118, 'n * 2', 0, 'mono') + `<g class="a-move" style="--d:.3s;--fx:-90px;--fy:0px;--t:1s">${chipT(70, 95, 44, '5', 0, '#FFC93C')}</g><g class="a-move" style="--d:1.5s;--fx:-70px;--fy:0px;--t:.8s"><g class="a-fade" style="--d:1.5s">${chipT(292, 95, 50, '10', 0, '#5BE36B')}</g></g>` },
    { say: 'Write it once, use it <b>forever</b>. Send in 12 and get 24. That\'s how big games stay organized.', svg: `<rect x="130" y="70" width="140" height="80" rx="16" fill="#2D2484" stroke="#7FF8FF" stroke-width="4"/>` + tx(200, 118, 'n * 2', 0, 'mono') + chipT(64, 95, 50, '12', 0.3, '#FFC93C') + chipT(292, 95, 50, '24', 1.1, '#5BE36B') + `<path d="M118 110 L128 110 M272 110 L288 110" class="a-draw st" pathLength="1" style="--d:.6s"/>` },
  ] },
  learn: { title: 'How AI learns', scenes: [
    { say: 'Nobody writes rules for AI. Instead it studies <b>thousands of labeled examples</b>.', svg: ['dog', 'cat', 'dog', 'dog', 'cat', 'cat'].map((t, i) => chipT(40 + (i % 3) * 76, 50 + Math.floor(i / 3) * 50, 64, t, i * 0.15, t === 'dog' ? '#FF8A3D' : '#3DD6FF')).join('') + `<rect x="290" y="56" width="80" height="80" rx="16" fill="#2D2484" stroke="#7FF8FF" stroke-width="4" ${an('pop', 1)}/>` + tx(330, 102, 'model', 1.2) + `<path d="M266 96 L286 96" class="a-draw st" pathLength="1" style="--d:1.3s"/>` },
    { say: 'It finds the pattern by itself. Show it something <b>new</b> and it makes a prediction, with a confidence level.', svg: chipT(40, 82, 64, '???', 0.2, '#C9D2F0') + `<path d="M112 96 L156 96" class="a-draw st" pathLength="1" style="--d:.6s"/><rect x="160" y="56" width="80" height="80" rx="16" fill="#2D2484" stroke="#7FF8FF" stroke-width="4"/>` + tx(200, 102, 'model', 0) + `<path d="M246 96 L282 96" class="a-draw st" pathLength="1" style="--d:1.1s"/>` + chipT(288, 82, 90, 'dog 92%', 1.6, '#FF8A3D') },
    { say: 'But if the examples are <b>lopsided</b>, it learns the wrong pattern. That\'s bias. Better data fixes it.', svg: ['dog', 'dog', 'dog', 'dog', 'dog', 'cat'].map((t, i) => chipT(60 + (i % 3) * 96, 50 + Math.floor(i / 3) * 50, 80, t, i * 0.12, t === 'dog' ? '#FF8A3D' : '#3DD6FF')).join('') + tx(200, 190, 'It will guess "dog" way too often.', 1.2, 'hl') },
  ] },
  nextword: { title: 'How chatbots write', scenes: [
    { say: 'A chatbot gets some text and has one job: <b>guess what comes next</b>.', svg: tx(200, 100, 'The cat sat on the ___', 0, 'big') + `<rect x="304" y="108" width="50" height="4" fill="#FFC93C" class="a-blink" style="--d:.5s"/>` },
    { say: 'It gives every possible next word a <b>probability</b>, based on patterns from everything it read.', svg: tx(200, 36, 'The cat sat on the ___', 0) + [['mat', 62, '#5BE36B'], ['couch', 21, '#3DD6FF'], ['roof', 9, '#B26BFF'], ['moon', 3, '#FF4FD8']].map(([w, p, c], i) => tx(90, 82 + i * 36, w, i * 0.2) + `<rect x="130" y="${64 + i * 36}" width="${p * 3}" height="24" rx="7" fill="${c}" stroke="${INK}" stroke-width="2.5" ${an('growx', 0.3 + i * 0.25)}/>` + tx(150 + p * 3 + 16, 82 + i * 36, p + '%', 0.8 + i * 0.25, 'sm')).join('') },
    { say: 'It picks one, usually a likely one, adds it, and <b>repeats</b>. One token at a time. It predicts. It doesn\'t look anything up.', svg: tx(200, 80, 'The cat sat on the <tspan class="hl">mat</tspan>', 0, 'big') + tx(200, 130, 'The cat sat on the mat <tspan class="hl">and</tspan>', 1, 'big') + tx(200, 180, 'The cat sat on the mat and <tspan class="hl">purred</tspan>', 2, 'big') },
  ] },
  tokens: { title: 'Tokens', scenes: [
    { say: 'You type a sentence. To a computer, that\'s just a string of letters.', svg: tx(200, 110, 'Robots are unbelievable', 0, 'big') },
    { say: 'Step one: chop it into <b>tokens</b>. Common words stay whole. Long words get split into pieces.', svg: [['Robots', 70], [' are', 46], [' un', 40], ['believ', 68], ['able', 50]].reduce((acc, [w, wd], i) => { acc.s += chipT(acc.x, 90, wd, w, i * 0.25, ['#3DD6FF', '#FF8FB1', '#FFE14D', '#7CF06B', '#B26BFF'][i]); acc.x += wd + 8; return acc; }, { s: '', x: 42 }).s },
    { say: 'Step two: every token becomes <b>numbers</b>. Now the model can do math on your words, and predict the next token.', svg: [['Robots', 70, 4821], [' are', 46, 77], [' un', 40, 359], ['believ', 68, 9034], ['able', 50, 512]].reduce((acc, [w, wd, n], i) => { acc.s += chipT(acc.x, 60, wd, w, 0, ['#3DD6FF', '#FF8FB1', '#FFE14D', '#7CF06B', '#B26BFF'][i]) + `<path d="M${acc.x + wd / 2} 96 L${acc.x + wd / 2} 118" class="a-draw st" pathLength="1" style="--d:${0.3 + i * 0.2}s"/>` + tx(acc.x + wd / 2, 142, n, 0.6 + i * 0.2, 'mono sm hl'); acc.x += wd + 8; return acc; }, { s: '', x: 42 }).s },
  ] },
  neural: { title: 'Neural networks', scenes: [
    { say: 'A neural network is layers of tiny math units called <b>neurons</b>. Inputs on the left, answer on the right.', svg: netSVG('wire0') + tx(70, 212, 'inputs', 0.5, 'sm') + tx(200, 212, 'hidden layer', 0.7, 'sm') + tx(330, 212, 'answer', 0.9, 'sm') },
    { say: 'Signals flow through the wires. Each wire has a <b>weight</b>: a number that says how much that signal matters.', svg: netSVG('a-draw wire1', 0.5) },
    { say: '<b>Learning</b> means nudging those weights, a tiny bit at a time, until the answers come out right. Real AIs have billions of them.', svg: netSVG('wire0') + `<line x1="70" y1="110" x2="200" y2="85" class="wirebig a-pulse"/><line x1="200" y1="85" x2="330" y2="80" class="wirebig a-pulse"/>` + tx(200, 20, 'weights change = learning', 0.5, 'hl') },
  ] },
  train: { title: 'How training works', scenes: [
    { say: 'Training is a loop. The AI <b>guesses</b>, <b>checks</b> how wrong it was, <b>adjusts</b> its weights, and goes again.', svg: chipT(160, 20, 80, 'guess', 0.1, '#3DD6FF') + chipT(280, 95, 80, 'check', 0.6, '#FFC93C') + chipT(160, 170, 80, 'adjust', 1.1, '#5BE36B') + chipT(40, 95, 80, 'repeat', 1.6, '#FF4FD8') + `<path d="M244 40 Q310 44 318 90" class="a-draw st" pathLength="1" style="--d:.4s"/><path d="M318 130 Q310 176 246 186" class="a-draw st" pathLength="1" style="--d:.9s"/><path d="M156 186 Q90 176 82 130" class="a-draw st" pathLength="1" style="--d:1.4s"/><path d="M82 90 Q90 44 156 36" class="a-draw st" pathLength="1" style="--d:1.9s"/>` },
    { say: 'Each trip around the loop, the <b>error</b> shrinks a little. Millions of trips later, the guesses are good.', svg: [150, 118, 92, 70, 52, 38, 28, 20, 14].map((h, i) => `<rect x="${50 + i * 34}" y="${180 - h}" width="26" height="${h}" rx="5" fill="#FF4F7B" stroke="${INK}" stroke-width="2.5" ${an('grow', i * 0.2)}/>`).join('') + `<line x1="40" y1="180" x2="360" y2="180" class="st"/>` + tx(250, 50, 'error going down', 1.6, 'big hl') },
    { say: 'When training ends, the weights are <b>frozen</b>. Chatting with an AI uses what it learned. It isn\'t learning from you in that moment.', svg: netSVG('wire0') + `<rect x="30" y="14" width="340" height="188" rx="18" fill="rgba(127,248,255,.12)" stroke="#7FF8FF" stroke-width="4" stroke-dasharray="10 8" ${an('fade', 0.6)}/>` + tx(200, 110, '❄ frozen', 1, 'huge cy') },
  ] },
  prompt: { title: 'Building a strong prompt', scenes: [
    { say: 'A vague prompt gets a vague answer. The AI has to <b>guess</b> what you meant.', svg: chipT(110, 40, 180, '"lava level"', 0, '#C9D2F0') + `<rect x="60" y="120" width="280" height="26" rx="10" fill="#2D2484" stroke="#fff" stroke-width="3"/><rect x="60" y="120" width="50" height="26" rx="10" fill="#FF4F7B" ${an('growx', 0.6)}/>` + tx(200, 180, 'answer quality: meh', 1) },
    { say: 'Add ingredients: a <b>role</b>, some <b>context</b>, the exact <b>task</b>, an <b>example</b>, and a <b>format</b>.', svg: [['Role', '#3DD6FF'], ['Context', '#FF8FB1'], ['Task', '#FFE14D'], ['Example', '#7CF06B'], ['Format', '#B26BFF']].map(([n, c], i) => `<g class="a-move" style="--d:${i * 0.35}s;--fx:0px;--fy:-40px">${`<g class="a-fade" style="--d:${i * 0.35}s">` + chipT(120, 20 + i * 38, 160, n, 0, c) + '</g>'}</g>`).join('') },
    { say: 'Same AI, way better answer. And if it\'s still not right, <b>follow up</b>. Prompting is a conversation.', svg: `<rect x="60" y="70" width="280" height="30" rx="10" fill="#2D2484" stroke="#fff" stroke-width="3"/><rect x="60" y="70" width="280" height="30" rx="10" fill="#5BE36B" ${an('growx', 0.3, '--t:1.4s')}/>` + tx(200, 50, 'answer quality', 0) + tx(200, 150, '"Shorter." "Sillier." "Explain step 2."', 1.6, 'hl') },
  ] },
};
// Which explainer goes with which level
const EXPLAIN_FOR = { neg: 'neg', pow: 'pow', ratio: 'ratio', pct: 'pct', divf: 'divf', eq: 'eq', expr: 'eq', area: 'area', stats: 'stats', prop: 'prop', twostep: 'twostep', circ: 'circ', vol: 'vol', prob: 'prob', exp2: 'exp2', pyth: 'pyth', slope: 'slope', sys: 'sys',
  bot2: 'loop', lua3: 'loop', lua4: 'func', ai2: 'learn', ai3: 'nextword', ai4: 'prompt', ai7: 'tokens', ai8: 'neural', ai9: 'train', ai10: 'prompt' };

const TIPS = [
  'Fast answers in boss fights land <b>critical hits</b> for extra damage.',
  'Every correct answer gives you <b>energy</b> for the Grid map.',
  'Rarer characters give bigger bonuses. Check the <b>Codex</b> to see yours.',
  'Stuck in a lesson? Tap me and pick <b>Explain it</b>. I\'ll draw it out.',
  'Beat a boss, then try the <b>Elite rematch</b> for a free capsule.',
  'Got one wrong? Tap <b>Echo, show me how</b> and I\'ll solve that exact question with you.',
  'The game remembers what you miss and asks it more often. The <b>Weak Spot Drill</b> fixes it fast.',
  'A duplicate character isn\'t wasted. It <b>powers up</b> the one you have.',
  'Relics are hidden in every zone of the Grid. They work forever once you find them.',
  'Three right in a row starts a <b>combo</b>, and combos pay bonus coins.',
  'When an AI sounds confident, that doesn\'t mean it\'s right. Check it!',
];
const TOURS = {
  sLobby: [['#playBtn', 'This is home base. Hit <b>PLAY</b> to jump straight into your next level.'], ['.worlds', 'Four worlds to beat: Math Arena, <b>Algebra Peaks</b> (the hard stuff), Code Lab and AI Academy.'], ['#toMap', '<b>The Grid</b> is the map. Spend energy to explore it and catch wild characters.'], ['#toCodex', 'The <b>Codex</b> shows every character, relic and badge you can collect.'], ['.quests', 'Daily quests reset every day. Finish them for coins and keep your streak alive.'], ['#toRaid', 'A new <b>raid boss</b> shows up every week, with a character you can only win that week.'], ['#toObby', '<b>Obby Builder</b>: write real Lua to run a character through a lava course.'], ['#echo', 'And I\'m always right here. Tap me any time you want a tip or an explanation.']],
  sWorld: [['.node.cur', 'This is your next level. Beat its boss or earn 2 stars to unlock the one after it.'], ['.node.nboss', 'At the end of the path waits the <b>Titan</b>. It uses questions from every level in this world.']],
  sLevel: [['[data-act="learn"]', 'Start with <b>Learn</b>. Short lesson, things to play with, quick checks.'], ['[data-act="practice"]', 'Then <b>practice</b> to earn up to 3 stars.'], ['[data-act="boss"]', 'Then fight the <b>boss</b>. Three hearts. Answer fast for critical hits.'], ['#lvEcho', 'Want it drawn out first? This button plays my animated explanation.']],
  sMap: [['.znode', 'Each circle is a <b>zone</b>. The number shows how much of it you\'ve explored.'], ['.pill.big', 'This is your <b>energy</b>. You earn it from correct answers anywhere in the game.'], ['#mCaps', '<b>Capsules</b> hold a random character. Common, rare, epic, legendary... or mythic.']],
  sZone: [['.tile.reach', 'Glowing <b>?</b> tiles can be scanned for 1 energy. You never know what\'s under them.'], ['.tile.guard, .tile.fog:nth-child(7)', 'The zone <b>guardian</b> waits in the far corner. Beat it to open the next zone.'], ['.roster', 'These are the characters living in this zone. Catch them all!']],
  sCodex: [['.bonusbar', 'These are the bonuses you have right now from your hero and your relics.'], ['.cx.own', 'Tap any character you own to equip it. Rarer ones give bigger bonuses.'], ['.tabs', 'Flip between characters, relics and badges here.']],
};

const Guide = (() => {
  let ctx = null, tour = null, sayT = 0;
  const strip = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent; };
  function speak(html) {
    if (!S.sound || S.voice === false || !('speechSynthesis' in window)) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(strip(html)); u.rate = 1.02; u.pitch = 1.25; speechSynthesis.speak(u); } catch (e) {}
  }
  const hush = () => { try { speechSynthesis.cancel(); } catch (e) {} };
  function mount() {
    if ($('#echo')) return;
    const b = document.createElement('button'); b.id = 'echo'; b.title = 'Echo, your guide'; b.setAttribute('aria-label', 'Echo, your guide');
    b.innerHTML = echoSVG('happy'); document.body.appendChild(b);
    const bub = document.createElement('div'); bub.id = 'echoBub'; bub.hidden = true; document.body.appendChild(bub);
    const spot = document.createElement('div'); spot.id = 'spot'; spot.hidden = true; document.body.appendChild(spot);
    const ptr = document.createElement('div'); ptr.id = 'ptr'; ptr.hidden = true; ptr.innerHTML = `<svg viewBox="0 0 40 40"><path d="M6 4 L34 18 L21 22 L16 36 Z" fill="#7FF8FF" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></svg>`; document.body.appendChild(ptr);
    b.onclick = () => { Sfx.tap(); if (tour) return endTour(); if (!bub.hidden) return hide(); menu(); };
  }
  const mood = m => { const b = $('#echo'); if (b) b.innerHTML = echoSVG(m); };
  function bubble(html, m = 'talk') { const bub = $('#echoBub'); bub.innerHTML = html; bub.hidden = false; mood(m); clearTimeout(sayT); return bub; }
  function hide() { const bub = $('#echoBub'); if (bub) bub.hidden = true; mood('happy'); hush(); }
  function say(html, ms = 4200) { if (tour || $('#holo')) return; bubble(`<p>${html}</p>`); sayT = setTimeout(hide, ms); }
  function menu() {
    const scr = document.body.dataset.screen, ex = ctx && EXPLAIN_FOR[ctx] && ['sLevel', 'sLesson', 'sPlay', 'sLua', 'sBot', 'sLab'].includes(scr);
    const bub = bubble(`<p><b>Hey${S.name ? ', ' + esc(S.name) : ''}!</b> What do you need?</p><div class="ebtns">${ex ? '<button data-a="explain">▶ Explain it</button>' : ''}${TOURS[scr] ? '<button data-a="tour">Show me around</button>' : ''}<button data-a="tip">Give me a tip</button><button data-a="voice">Voice: ${S.voice === false ? 'off' : 'on'}</button></div>`, 'happy');
    bub.onclick = e => { const a = e.target.dataset && e.target.dataset.a; if (!a) return; Sfx.tap();
      if (a === 'explain') { hide(); explain(ctx); }
      if (a === 'tour') startTour(scr);
      if (a === 'tip') { const t = pick(TIPS); bubble(`<p>${t}</p><div class="ebtns"><button data-a="tip">Another</button></div>`); speak(t); }
      if (a === 'voice') { S.voice = S.voice === false; persist(); hush(); menu(); } };
  }
  // ─── Pointer tours ───
  function startTour(scr) { const steps = (TOURS[scr] || []).filter(([sel]) => document.querySelector(sel)); if (!steps.length) return; tour = { steps, i: 0 }; document.body.classList.add('touring'); step(); }
  function step() {
    if (!tour) return;
    const [sel, text] = tour.steps[tour.i], el = document.querySelector(sel), last = tour.i === tour.steps.length - 1;
    if (!el) return endTour();
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const bub = bubble(`<p>${text}</p><div class="ebtns"><button data-a="next">${last ? 'Got it!' : 'Next ➜'}</button>${last ? '' : '<button data-a="skip" class="quiet">Skip</button>'}<span class="ecount">${tour.i + 1} / ${tour.steps.length}</span></div>`);
    bub.onclick = e => { const a = e.target.dataset && e.target.dataset.a; if (a === 'next') { Sfx.tap(); if (last) endTour(); else { tour.i++; step(); } } if (a === 'skip') endTour(); };
    speak(text);
    setTimeout(() => place(el), 380);
  }
  function place(el) {
    if (!tour || !el.isConnected) return;
    const r = el.getBoundingClientRect(), spot = $('#spot'), ptr = $('#ptr'), pad = 8;
    spot.hidden = false; ptr.hidden = false;
    Object.assign(spot.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px' });
    ptr.style.transform = `translate(${Math.min(innerWidth - 50, r.left + r.width * 0.5)}px, ${Math.min(innerHeight - 50, r.top + r.height * 0.6)}px)`;
  }
  function endTour() { tour = null; document.body.classList.remove('touring'); const s = $('#spot'), p = $('#ptr'); if (s) s.hidden = true; if (p) p.hidden = true; hide(); }
  // ─── Holo-board explainers ───
  const has = id => !!(id && EXPLAIN[EXPLAIN_FOR[id]]);
  function explain(id) { const ex = EXPLAIN[EXPLAIN_FOR[id]]; if (ex) board(ex); }
  function board(ex) {
    endTour(); const old = $('#holo'); if (old) old.remove(); let i = 0;
    const h = document.createElement('div'); h.id = 'holo'; document.body.appendChild(h);
    const draw = () => {
      const sc = ex.scenes[i], last = i === ex.scenes.length - 1;
      h.innerHTML = `<div class="holocard"><div class="holotop"><span class="eyebrow">Echo explains · ${ex.title}</span><button class="btn ghost small" data-a="x">✕</button></div>
        <div class="holostage ${sc.html ? 'htmlstage' : ''}"><div class="scanl"></div>${sc.html ? `<div class="holohtml">${sc.html}</div>` : `<svg viewBox="0 0 400 220" class="holosvg">${sc.svg}</svg>`}</div>
        <div class="holosay"><div class="holoecho">${echoSVG('talk')}</div><p>${sc.say}</p></div>
        <div class="holonav"><div class="pips">${ex.scenes.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</div><button class="btn ghost small" data-a="re">↻ Replay</button><button class="btn ghost small" data-a="back" ${i ? '' : 'disabled'}>Back</button>${last && ex.idea ? '<button class="btn small cyan" data-a="idea">See the big idea</button>' : ''}<button class="btn small ${last ? 'green' : ''}" data-a="next">${last ? 'Got it!' : 'Next ➜'}</button></div></div>`;
      speak(sc.say);
    };
    const close = () => { hush(); h.remove(); document.removeEventListener('keydown', key); };
    const key = e => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight' && i < ex.scenes.length - 1) { i++; draw(); } if (e.key === 'ArrowLeft' && i) { i--; draw(); } };
    h.onclick = e => { const a = e.target.dataset && e.target.dataset.a; if (e.target === h || a === 'x') return close(); if (!a) return; Sfx.tap();
      if (a === 'idea') { close(); return explain(ex.idea); }
      if (a === 're') draw(); if (a === 'back' && i) { i--; draw(); } if (a === 'next') { if (i < ex.scenes.length - 1) { i++; draw(); } else { close(); S.stats.holo = (S.stats.holo || 0) + 1; persist(); } } };
    document.addEventListener('keydown', key);
    draw();
  }
  // Walk through ONE specific question, step by step, with its own numbers
  function solve(q, lid) {
    const steps = String(q.why || '').split(/(?<=[.!?✔])\s+(?=[A-Z0-9(−√<])/).filter(x => x.trim()), ans = q.kind === 'choice' ? q.choices[q.correct] : q.show;
    const page = n => `<div class="solveq">${q.q}</div><ol class="solvesteps">${steps.slice(0, n).map((st, k) => `<li class="${k === n - 1 ? 'new' : ''}">${st}</li>`).join('')}</ol>`;
    const scenes = [];
    if (q.viz) scenes.push(q.viz);
    scenes.push({ say: q.hint ? `Let's work this exact one out together. First, the key idea: ${q.hint}` : 'Let\'s work this exact one out together.', html: page(0) });
    steps.forEach((st, k) => scenes.push({ say: st, html: page(k + 1) }));
    scenes.push({ say: `So the answer is <b>${ans}</b>. Try the next one with the same steps.`, html: page(steps.length) + `<div class="solveans a-pop">Answer: <b>${ans}</b></div>` });
    board({ title: 'This question, step by step', scenes, idea: has(lid) ? lid : null });
  }
  const solveBtn = () => `<button type="button" class="btn small cyan echobtn" data-solve="1">${echoSVG('happy', 'mini')} Echo, show me how</button>`;
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-solve]'); if (b && typeof P !== 'undefined' && P && P.q) { Sfx.tap(); solve(P.q, P.q.lid || (P.l && P.l.id)); } });
  const btn = (id, label = 'Watch Echo explain it') => (has(id) ? `<button type="button" class="btn small cyan echobtn" data-echo="${id}">${echoSVG('happy', 'mini')} ${label}</button>` : '');
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-echo]'); if (b) { Sfx.tap(); explain(b.dataset.echo); } });
  return { mount, say, menu, hide, explain, has, btn, solve, solveBtn, startTour, endTour, setCtx: id => { ctx = id; }, onScreen(id) { const b = $('#echo'); if (b) b.hidden = id === 'sStart'; if (tour) endTour(); else hide(); } };
})();
