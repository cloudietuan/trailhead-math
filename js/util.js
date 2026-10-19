// Shared helpers: random numbers, fractions, answer checking, small SVG drawings.
const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[R(0, a.length - 1)];
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const r4 = x => Math.round(x * 10000) / 10000;
const n2 = x => x.toLocaleString('en-US');
const fr = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
function simp(n, d) { const g = gcd(n, d); return [n / g, d / g]; }
function fracHTML(n, d) {
  [n, d] = simp(n, d);
  if (d === 1) return String(n);
  if (n > d) { const w = Math.floor(n / d), r = n % d; return r ? `${w}${fr(r, d)}` : String(w); }
  return fr(n, d);
}
const NAMES = ['Maya', 'Leo', 'Ava', 'Kai', 'Noah', 'Zoe', 'Eli', 'Mia', 'Sam', 'Rosa', 'Jay', 'Lena'];

// Question builders
const num = (v, why, hint, q, showHTML) => ({ q, ans: { kind: 'num', value: v }, showHTML: showHTML ?? n2(v), why, hint });
const fracA = (n, d, why, hint, q) => ({ q, ans: { kind: 'num', value: n / d }, showHTML: fracHTML(n, d), why, hint, frac: true });
const pt = (x, y, why, hint, q) => ({ q, ans: { kind: 'point', x, y }, showHTML: `(${x}, ${y})`, why, hint });

// Answer checking: whole numbers, decimals, $, commas, fractions, mixed numbers, points
function parseNum(s) {
  s = String(s).replace(/[$,]/g, '').trim().replace(/\s+/g, ' ');
  let m;
  if ((m = s.match(/^(-?\d+) (\d+)\/(\d+)$/))) return +m[1] + +m[2] / +m[3];
  if ((m = s.match(/^(-?\d+)\/(\d+)$/))) return +m[1] / +m[2];
  if (s === '') return NaN;
  return Number(s.replace(/ /g, ''));
}
function isRight(a, s) {
  if (a.kind === 'point') {
    const m = String(s).match(/-?\d+(\.\d+)?/g);
    return !!m && m.length === 2 && +m[0] === a.x && +m[1] === a.y;
  }
  const v = parseNum(s);
  return !isNaN(v) && Math.abs(v - a.value) < 1e-6;
}

// Drawings
function boxSVG(l, w, h, u) {
  return `<svg class="vis" viewBox="0 0 250 155" role="img" aria-label="Box ${l} by ${w} by ${h} ${u}">
<polygon class="bx2" points="60,50 100,20 200,20 160,50"/><polygon class="bx3" points="160,50 200,20 200,100 160,130"/>
<polygon class="bx1" points="60,50 160,50 160,130 60,130"/>
<text x="110" y="148" text-anchor="middle">${l} ${u}</text><text x="186" y="126">${w} ${u}</text><text x="52" y="94" text-anchor="end">${h} ${u}</text></svg>`;
}
function gridSVG(pts, opts = {}) {
  let s = `<svg class="vis grid${opts.big ? ' big' : ''}" viewBox="0 0 250 240" role="img" aria-label="Coordinate grid"${opts.id ? ` id="${opts.id}"` : ''}>`;
  for (let i = 0; i <= 10; i++) {
    const x = 30 + i * 20, y = 210 - i * 20;
    s += `<line class="gl" x1="${x}" y1="10" x2="${x}" y2="210"/><line class="gl" x1="30" y1="${y}" x2="230" y2="${y}"/>`;
    s += `<text class="gt" x="${x}" y="226" text-anchor="middle">${i}</text>`;
    if (i) s += `<text class="gt" x="22" y="${y + 3}" text-anchor="end">${i}</text>`;
  }
  s += `<line class="ax" x1="30" y1="210" x2="236" y2="210"/><line class="ax" x1="30" y1="210" x2="30" y2="4"/>`;
  s += `<text class="axl" x="238" y="226">x</text><text class="axl" x="34" y="10">y</text>`;
  pts.forEach(p => {
    const cx = 30 + p.x * 20, cy = 210 - p.y * 20;
    s += `<circle class="${p.cls || 'pt'}" cx="${cx}" cy="${cy}" r="6"/>`;
    if (p.label) s += `<text x="${cx + 9}" y="${cy - 8}">${p.label}</text>`;
  });
  return s + `<g class="marks"></g></svg>`;
}
function fracBar(n, d, label) {
  const W = 300, H = 34; let s = `<svg class="vis bar" viewBox="0 0 ${W + 70} ${H + 4}" role="img" aria-label="${label || n + ' of ' + d}">`;
  for (let i = 0; i < d; i++) s += `<rect class="${i < n ? 'on' : 'off'}" x="${2 + i * W / d}" y="2" width="${W / d}" height="${H}"/>`;
  s += `<text x="${W + 14}" y="${H / 2 + 7}" class="barlab">${label || n + '/' + d}</text>`;
  return s + `</svg>`;
}
// Isometric box made of unit cubes (draws the three visible faces as cube grids)
function isoBox(l, w, h) {
  const s = 22, cx = s * 0.87, cy = s * 0.5;
  const P = (i, j, k) => [(i - j) * cx, (i + j) * cy - k * s];
  const quads = [];
  const q = (a, b, c, d, cls) => quads.push({ pts: [a, b, c, d].map(p => P(...p)), cls });
  for (let a = 0; a < l; a++) for (let c = 0; c < h; c++) q([a, w, c], [a + 1, w, c], [a + 1, w, c + 1], [a, w, c + 1], 'cf1');
  for (let b = 0; b < w; b++) for (let c = 0; c < h; c++) q([l, b, c], [l, b + 1, c], [l, b + 1, c + 1], [l, b, c + 1], 'cf2');
  for (let a = 0; a < l; a++) for (let b = 0; b < w; b++) q([a, b, h], [a + 1, b, h], [a + 1, b + 1, h], [a, b + 1, h], 'cf3');
  const xs = quads.flatMap(o => o.pts.map(p => p[0])), ys = quads.flatMap(o => o.pts.map(p => p[1]));
  const minX = Math.min(...xs) - 4, minY = Math.min(...ys) - 4, W = Math.max(...xs) - minX + 4, H = Math.max(...ys) - minY + 4;
  return `<svg class="vis iso" viewBox="${minX} ${minY} ${W} ${H}" role="img" aria-label="${l} by ${w} by ${h} box of cubes">` +
    quads.map(o => `<polygon class="${o.cls}" points="${o.pts.map(p => p.join(',')).join(' ')}"/>`).join('') + `</svg>`;
}
