// Teaching modules: one per camp. Each is a list of steps.
// Step types: read (just read), choice (pick one), try (type an answer), widget (hands-on tool).

const W = {}; // widget builders: each returns {html, mount(el, done)}

// Tap the part of the expression to solve first, round by round.
W.chain = (rounds, final) => ({
  html: `<div class="chain"><div class="expr chain-expr"></div><div class="row chain-opts"></div><p class="chain-msg"></p></div>`,
  mount(el, done) {
    let i = 0; const ex = el.querySelector('.chain-expr'), ops = el.querySelector('.chain-opts'), msg = el.querySelector('.chain-msg');
    const draw = () => {
      if (i >= rounds.length) { ex.innerHTML = final; ops.innerHTML = ''; msg.innerHTML = '<b>Solved!</b> You did each step in the right order.'; done(); return; }
      const r = rounds[i]; ex.innerHTML = r.expr;
      ops.innerHTML = r.opts.map((o, k) => `<button class="chip" data-k="${k}">${o}</button>`).join('');
      ops.querySelectorAll('.chip').forEach(b => b.onclick = () => {
        if (+b.dataset.k === r.correct) { Sfx.good(); msg.innerHTML = r.msg; i++; setTimeout(draw, 900); }
        else { Sfx.bad(); b.classList.add('shake'); msg.innerHTML = r.nope || 'Not that one yet. Look for parentheses first, then × or ÷.'; setTimeout(() => b.classList.remove('shake'), 400); }
      });
    };
    draw();
  }
});

// Place-value chart with ×10 and ÷10 buttons.
W.slider = () => ({
  html: `<div class="pvw"><div class="pvtable" role="table" aria-label="Place value chart"></div>
    <p class="pvval"></p><div class="row"><button class="btn" data-op="m">× 10</button><button class="btn" data-op="d">÷ 10</button></div><p class="chain-msg"></p></div>`,
  mount(el, done) {
    const places = ['thousands', 'hundreds', 'tens', 'ones', 'tenths', 'hundredths', 'thousandths'];
    let v = 3470; const used = { m: false, d: false }; // value × 1000
    const t = el.querySelector('.pvtable'), val = el.querySelector('.pvval'), msg = el.querySelector('.chain-msg');
    const draw = () => {
      const s = String(v).padStart(7, '0'); const first = s.search(/[1-9]/), last = s.length - 1 - [...s].reverse().join('').search(/[1-9]/);
      t.innerHTML = places.map((p, k) => `<div class="pvcell${k === 3 ? ' ones' : ''}"><span class="pvname">${p}</span><span class="pvdig${k >= Math.min(first, 3) && k <= Math.max(last, 3) ? '' : ' dim'}">${s[k]}</span></div>`).join('');
      val.innerHTML = `Number: <b>${n2(v / 1000)}</b>`;
    };
    el.querySelectorAll('[data-op]').forEach(b => b.onclick = () => {
      const op = b.dataset.op;
      if (op === 'm' && v * 10 > 9999000) { msg.textContent = 'That is as big as this chart goes. Try ÷ 10.'; return; }
      if (op === 'd' && v % 10 !== 0) { msg.textContent = 'That is as small as this chart goes. Try × 10.'; return; }
      v = op === 'm' ? v * 10 : v / 10; used[op] = true; Sfx.tick(); draw();
      t.classList.remove('slide-l', 'slide-r'); void t.offsetWidth; t.classList.add(op === 'm' ? 'slide-l' : 'slide-r');
      msg.textContent = op === 'm' ? 'Every digit moved one place LEFT. The number got 10 times bigger.' : 'Every digit moved one place RIGHT. The number got 10 times smaller.';
      if (used.m && used.d) done();
    });
    draw();
  }
});

// Area model for 34 × 26 with fill-in boxes.
W.area = () => ({
  html: `<div class="areaw"><div class="agrid">
      <span></span><span class="ahd">30</span><span class="ahd">4</span>
      <span class="ahd">20</span><label class="acell big"><span>30 × 20</span><input data-a="600" inputmode="numeric" aria-label="30 times 20"></label><label class="acell"><span>4 × 20</span><input data-a="80" inputmode="numeric" aria-label="4 times 20"></label>
      <span class="ahd">6</span><label class="acell"><span>30 × 6</span><input data-a="180" inputmode="numeric" aria-label="30 times 6"></label><label class="acell sm"><span>4 × 6</span><input data-a="24" inputmode="numeric" aria-label="4 times 6"></label>
    </div><div class="row"><span>Add them up: 34 × 26 =</span><input class="atotal" data-a="884" inputmode="numeric" aria-label="Total"><button class="btn small">Check</button></div><p class="chain-msg"></p></div>`,
  mount(el, done) {
    const msg = el.querySelector('.chain-msg');
    el.querySelector('.btn').onclick = () => {
      let bad = 0; el.querySelectorAll('input').forEach(i => { const ok = parseNum(i.value) === +i.dataset.a; i.classList.toggle('ok', ok); i.classList.toggle('no', !ok && i.value !== ''); if (!ok) bad++; });
      if (!bad) { Sfx.good(); msg.innerHTML = '<b>Yes!</b> 600 + 80 + 180 + 24 = 884. Four small problems instead of one big one.'; done(); }
      else { Sfx.bad(); msg.textContent = `${bad} box${bad > 1 ? 'es' : ''} still need${bad > 1 ? '' : 's'} work. Green means correct.`; }
    };
  }
});

// Guess-and-check division.
W.guess = (dividend, divisor) => ({
  html: `<div class="guessw"><p class="expr">${n2(dividend)} ÷ ${divisor}</p><div class="row"><span>My guess:</span><input inputmode="numeric" aria-label="Your guess"><button class="btn small">Test it</button></div><ul class="guesslog"></ul></div>`,
  mount(el, done) {
    const inp = el.querySelector('input'), log = el.querySelector('.guesslog');
    const go = () => {
      const g = parseInt(inp.value, 10); if (!g) return; const p = g * divisor;
      const verdict = p === dividend ? '<b class="okc">Just right!</b>' : p > dividend ? '<b class="noc">Too big.</b> Go lower.' : '<b class="noc">Too small.</b> Go higher.';
      log.insertAdjacentHTML('beforeend', `<li>${divisor} × ${g} = ${n2(p)}. ${verdict}</li>`);
      if (p === dividend) { Sfx.good(); done(); } else Sfx.tick();
      inp.select();
    };
    el.querySelector('.btn').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
  }
});

// Fraction bars: find a piece size that works for 1/3 and 1/4.
W.bars = () => ({
  html: `<div class="barsw"><div class="bars"></div><p>Cut both bars into the same size pieces:</p><div class="row"><button class="chip" data-d="6">Sixths</button><button class="chip" data-d="8">Eighths</button><button class="chip" data-d="12">Twelfths</button></div><p class="chain-msg"></p></div>`,
  mount(el, done) {
    const b = el.querySelector('.bars'), msg = el.querySelector('.chain-msg');
    b.innerHTML = fracBar(1, 3, '1/3') + fracBar(1, 4, '1/4');
    el.querySelectorAll('.chip').forEach(c => c.onclick = () => {
      const d = +c.dataset.d;
      if (d === 12) { Sfx.good(); b.innerHTML = fracBar(4, 12, '4/12') + fracBar(3, 12, '3/12') + fracBar(7, 12, '7/12'); msg.innerHTML = '<b>Twelfths fit both!</b> 1/3 = 4/12 and 1/4 = 3/12. Now the pieces match: 4/12 + 3/12 = 7/12.'; done(); }
      else { Sfx.bad(); msg.textContent = d === 6 ? 'Sixths work for 1/3 (it is 2/6), but 1/4 does not split evenly into sixths. Try another.' : 'Eighths work for 1/4 (it is 2/8), but 1/3 does not split evenly into eighths. Try another.'; }
    });
  }
});

// Tap groups to take 3/4 of 12.
W.groups = () => ({
  html: `<div class="groupsw"><div class="groups"></div><p class="chain-msg">Tap groups to color them. Take 3 of the 4 groups.</p></div>`,
  mount(el, done) {
    const g = el.querySelector('.groups'), msg = el.querySelector('.chain-msg'); const on = [false, false, false, false];
    const draw = () => {
      g.innerHTML = on.map((o, k) => `<button class="grp${o ? ' on' : ''}" data-k="${k}" aria-pressed="${o}">${'<i></i>'.repeat(3)}</button>`).join('');
      g.querySelectorAll('.grp').forEach(b => b.onclick = () => { on[+b.dataset.k] = !on[+b.dataset.k]; Sfx.tick(); draw(); check(); });
    };
    const check = () => {
      const n = on.filter(Boolean).length;
      if (n === 3) { msg.innerHTML = '<b>That is 3/4 of 12!</b> 12 split into 4 groups is 3 each. 3 groups × 3 = 9.'; Sfx.good(); done(); }
      else msg.textContent = `You colored ${n} group${n === 1 ? '' : 's'} (${n * 3} dots). We want 3 of the 4 groups.`;
    };
    draw();
  }
});

// Build a box of cubes with sliders.
W.cubes = target => ({
  html: `<div class="cubew"><div class="cubepic"></div><div class="sliders">
    <label>Length <input type="range" min="1" max="6" value="2" data-k="l"><b data-o="l">2</b></label>
    <label>Width <input type="range" min="1" max="5" value="2" data-k="w"><b data-o="w">2</b></label>
    <label>Height <input type="range" min="1" max="5" value="2" data-k="h"><b data-o="h">2</b></label></div>
    <p class="cubecount"></p><p class="chain-msg">Challenge: build a box with exactly <b>${target}</b> cubes.</p></div>`,
  mount(el, done) {
    const s = { l: 2, w: 2, h: 2 }; const pic = el.querySelector('.cubepic'), cnt = el.querySelector('.cubecount'), msg = el.querySelector('.chain-msg'); let won = false;
    const draw = () => {
      pic.innerHTML = isoBox(s.l, s.w, s.h); const v = s.l * s.w * s.h;
      cnt.innerHTML = `${s.l} × ${s.w} × ${s.h} = <b>${v} cubes</b>`;
      if (v === target && !won) { won = true; Sfx.good(); msg.innerHTML = `<b>You built ${target}!</b> There are other ways too. Can you find another?`; done(); }
    };
    el.querySelectorAll('input').forEach(i => i.oninput = () => { s[i.dataset.k] = +i.value; el.querySelector(`[data-o="${i.dataset.k}"]`).textContent = i.value; Sfx.tick(); draw(); });
    draw();
  }
});

// Tap a point on the grid.
W.gridtap = targets => ({
  html: `<div class="gridw"><p class="gridask"></p>${gridSVG([], { big: true, id: 'tapgrid' })}<p class="chain-msg"></p></div>`,
  mount(el, done) {
    let i = 0; const svg = el.querySelector('svg'), ask = el.querySelector('.gridask'), msg = el.querySelector('.chain-msg'), marks = svg.querySelector('.marks');
    const showAsk = () => { ask.innerHTML = i < targets.length ? `Tap the point <b>(${targets[i][0]}, ${targets[i][1]})</b>` : '<b>All found!</b>'; };
    svg.style.cursor = 'crosshair';
    svg.addEventListener('click', e => {
      if (i >= targets.length) return;
      const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse());
      const x = Math.round((q.x - 30) / 20), y = Math.round((210 - q.y) / 20); if (x < 0 || x > 10 || y < 0 || y > 10) return;
      const [tx, ty] = targets[i]; const ok = x === tx && y === ty;
      marks.insertAdjacentHTML('beforeend', `<circle class="${ok ? 'pt' : 'ptbad'}" cx="${30 + x * 20}" cy="${210 - y * 20}" r="6"/>${ok ? `<text x="${36 + x * 20}" y="${202 - y * 20}">(${x}, ${y})</text>` : ''}`);
      if (ok) { Sfx.good(); i++; msg.textContent = i < targets.length ? 'Nice! Next one.' : 'You can read a map like a pro.'; showAsk(); if (i === targets.length) done(); }
      else { Sfx.bad(); msg.textContent = `You tapped (${x}, ${y}). Remember: walk right ${tx} first, then climb up ${ty}.`; setTimeout(() => marks.lastElementChild?.remove(), 900); }
    });
    showAsk();
  }
});

const pvChart = (digits) => `<div class="pvtable static">${['hundreds', 'tens', 'ones', 'tenths', 'hundredths'].map((p, k) => `<div class="pvcell${k === 2 ? ' ones' : ''}"><span class="pvname">${p}</span><span class="pvdig">${digits[k]}</span></div>`).join('')}</div>`;
const stack = (rows, note) => `<pre class="stack">${rows.join('\n')}</pre>${note ? `<p class="fmt">${note}</p>` : ''}`;

const LESSONS = {
oa: [
  { type: 'read', title: 'Two hikers, two answers', html: `<p>Two hikers solved <b>2 + 3 × 4</b>.</p><div class="duel"><div class="card">🧗 Hiker A went left to right:<br>2 + 3 = 5, then 5 × 4 = <b>20</b></div><div class="card">🧗 Hiker B multiplied first:<br>3 × 4 = 12, then 2 + 12 = <b>14</b></div></div><p>They can't both be right! Mathematicians agreed on an order so everyone gets the same answer. Hiker B followed it. The answer is <b>14</b>.</p>` },
  { type: 'read', title: 'The trail rules', html: `<ol class="rules"><li><b>Grouping first.</b> Anything inside ( ) or [ ].</li><li><b>Then × and ÷,</b> left to right.</li><li><b>Then + and −,</b> left to right.</li></ol><p>Tip: [ ] brackets are just bigger parentheses. Do the inside ( ) first, then the rest of the [ ].</p>` },
  { type: 'widget', title: 'Your turn: tap what comes first', html: 'Tap the part to solve first. Keep going until it is one number.', widget: W.chain([
      { expr: '4 + 3 × (6 − 2)', opts: ['4 + 3', '3 × (6 − 2)', '6 − 2'], correct: 2, msg: 'Yes! Parentheses first: 6 − 2 = 4.' },
      { expr: '4 + 3 × 4', opts: ['4 + 3', '3 × 4'], correct: 1, msg: 'Right! Multiply before adding: 3 × 4 = 12.', nope: 'Close, but multiplying comes before adding.' },
      { expr: '4 + 12', opts: ['4 + 12'], correct: 0, msg: '4 + 12 = 16.' }], '16') },
  { type: 'choice', title: 'Quick check', html: 'What do you do first in <span class="expr">18 − 2 × 5</span>', opts: ['18 − 2', '2 × 5'], correct: 1, explain: 'Multiply first: 2 × 5 = 10. Then 18 − 10 = 8.' },
  { type: 'try', title: 'Solve it', html: '<span class="expr">(5 + 3) × 2 − 4</span>', ans: { kind: 'num', value: 12 }, hint: 'Parentheses: 5 + 3 = 8. Then 8 × 2. Then subtract 4.', explain: '5 + 3 = 8, then 8 × 2 = 16, then 16 − 4 = 12.' },
  { type: 'try', title: 'Brackets challenge', html: '<span class="expr">[2 × (3 + 4)] + 6</span>', ans: { kind: 'num', value: 20 }, hint: 'Start in the innermost ( ): 3 + 4.', explain: '3 + 4 = 7, then 2 × 7 = 14, then 14 + 6 = 20.' }
],
pv: [
  { type: 'read', title: 'Every place is worth 10 times more', html: `<p>In <b>352.47</b>, each place is worth 10 times the place to its right.</p>${pvChart(['3', '5', '2', '4', '7'])}<p>The 5 means 5 tens (50). The 4 means 4 tenths (0.4). The 7 means 7 hundredths (0.07).</p>` },
  { type: 'widget', title: 'Slide the digits', html: 'Press × 10 and ÷ 10. Watch what the digits do.', widget: W.slider() },
  { type: 'read', title: 'Powers of 10', html: `<table class="powers"><tr><td>10<sup>1</sup></td><td>10</td><td>1 zero</td></tr><tr><td>10<sup>2</sup></td><td>10 × 10 = 100</td><td>2 zeros</td></tr><tr><td>10<sup>3</sup></td><td>10 × 10 × 10 = 1,000</td><td>3 zeros</td></tr></table><p>The little number tells you how many zeros. It also tells you how many places the digits slide.</p>` },
  { type: 'choice', title: 'Quick check', html: 'What is <span class="expr">6.2 × 100</span>', opts: ['6.200', '620', '62', '0.062'], correct: 1, explain: '× 100 slides the digits 2 places left: 6.2 → 62 → 620.' },
  { type: 'read', title: 'Which decimal is bigger?', html: `<p>Is <b>0.5</b> or <b>0.45</b> bigger? Give them the same number of digits: <b>0.50</b> vs <b>0.45</b>.</p><div class="dec-bars"><div><span style="width:50%"></span></div><b>0.50</b><div><span style="width:45%"></span></div><b>0.45</b></div><p>50 hundredths beats 45 hundredths. More digits does <b>not</b> mean bigger.</p>` },
  { type: 'try', title: 'Solve it', html: '<span class="expr">4.7 ÷ 10</span>', ans: { kind: 'num', value: 0.47 }, hint: 'Dividing by 10 slides the digits one place right.', explain: '4.7 ÷ 10 = 0.47. The 4 moved from ones to tenths.' },
  { type: 'try', title: 'Rounding', html: 'Round <b>3.86</b> to the nearest tenth.', ans: { kind: 'num', value: 3.9 }, hint: 'The tenths digit is 8. Look at the digit after it.', explain: 'The 6 after the 8 is 5 or more, so round up: 3.9.' }
],
dec: [
  { type: 'read', title: 'Line up the points', html: `<p>To add <b>12.5 + 3.75</b>, stack them so the decimal points line up. Fill the empty spot with a zero.</p>${stack(['  12.5<mark>0</mark>', '+  3.75', '--------', '  16.25'], 'The highlighted 0 is a placeholder. It keeps the columns straight.')}` },
  { type: 'choice', title: 'Which is set up right?', html: `<div class="duel"><div class="card"><b>A</b>${stack(['  4.2', '+ 1.35'])}</div><div class="card"><b>B</b>${stack(['  4.20', '+ 1.35'])}</div></div>`, opts: ['A', 'B'], correct: 1, explain: 'In B the decimal points line up, so tenths add to tenths. A would add 2 tenths to 5 hundredths. Oops!' },
  { type: 'read', title: 'Money is decimals', html: `<p><b>$4.25</b> is 4 dollars, 2 dimes, and 5 pennies. Dollars are ones, dimes are tenths, pennies are hundredths.</p><p>When you subtract from a whole number, add the zeros: <b>10 − 3.6</b> becomes <b>10.0 − 3.6 = 6.4</b>.</p>` },
  { type: 'try', title: 'Solve it', html: '<span class="expr">6.3 + 2.45</span>', ans: { kind: 'num', value: 8.75 }, hint: 'Write 6.3 as 6.30 first.', explain: '6.30 + 2.45 = 8.75.' },
  { type: 'try', title: 'Subtract from a whole', html: '<span class="expr">10 − 3.6</span>', ans: { kind: 'num', value: 6.4 }, hint: 'Write 10 as 10.0.', explain: '10.0 − 3.6 = 6.4.' },
  { type: 'try', title: 'Decimal times a whole', html: '<span class="expr">2.5 × 3</span>', ans: { kind: 'num', value: 7.5 }, hint: 'Think 25 × 3, then put the decimal point back.', explain: '25 × 3 = 75. One decimal place in 2.5, so 7.5.' }
],
mul: [
  { type: 'read', title: 'Break it apart', html: `<p>Big problems are easier in pieces. For <b>23 × 14</b>, split 23 into 20 + 3 and 14 into 10 + 4:</p><div class="agrid static"><span></span><span class="ahd">20</span><span class="ahd">3</span><span class="ahd">10</span><span class="acell big">200</span><span class="acell">30</span><span class="ahd">4</span><span class="acell">80</span><span class="acell sm">12</span></div><p>200 + 30 + 80 + 12 = <b>322</b>. This is called an <b>area model</b>.</p>` },
  { type: 'widget', title: 'Fill the area model', html: 'Solve <b>34 × 26</b>. Fill each box, then add.', widget: W.area() },
  { type: 'read', title: 'The fast way', html: `<p>The standard method does the same thing, stacked:</p>${stack(['    234', '  ×  16', '  -----', '   1404   ← 234 × 6', '+  234<mark>0</mark>   ← 234 × 10', '  -----', '   3744'], 'The highlighted 0 is there because the 1 in 16 really means 10.')}` },
  { type: 'choice', title: 'Quick check', html: 'When you multiply by the <b>1</b> in <b>16</b>, what are you really multiplying by?', opts: ['1', '10', '16', '100'], correct: 1, explain: 'The 1 is in the tens place, so it means 10. That is why you write a 0 first.' },
  { type: 'try', title: 'Solve it', html: '<span class="expr">45 × 12</span>', ans: { kind: 'num', value: 540 }, hint: '45 × 10 = 450. Then 45 × 2.', explain: '450 + 90 = 540.' },
  { type: 'try', title: 'Bigger one', html: '<span class="expr">312 × 21</span>', ans: { kind: 'num', value: 6552 }, hint: '312 × 20, then 312 × 1, then add.', explain: '6,240 + 312 = 6,552.' }
],
div: [
  { type: 'read', title: 'Division asks: how many groups?', html: `<p><b>96 ÷ 8</b> asks: how many groups of 8 fit into 96?</p><p>Think of multiplication backwards: 8 × <b>12</b> = 96. So 96 ÷ 8 = <b>12</b>.</p>` },
  { type: 'read', title: 'Estimate with friendly numbers', html: `<p>For <b>936 ÷ 24</b>, round to easy numbers: 1,000 ÷ 25 = 40.</p><p>Test it: 24 × 40 = 960. A little too big. Try 39: 24 × 39 = 936. <b>Got it!</b></p><p>Estimate, test, adjust. That is how pros divide.</p>` },
  { type: 'widget', title: 'Guess and check', html: 'Find <b>744 ÷ 24</b>. Make a guess, test it, then adjust.', widget: W.guess(744, 24) },
  { type: 'choice', title: 'Leftover trap', html: '100 kids are going to camp. Each van holds 12 kids. How many vans do they need?', opts: ['8', '9', '8.33'], correct: 1, explain: '100 ÷ 12 = 8 with 4 left over. Those 4 kids need a van too, so 9 vans.' },
  { type: 'try', title: 'Solve it', html: '<span class="expr">576 ÷ 18</span>', ans: { kind: 'num', value: 32 }, hint: 'Estimate: 600 ÷ 20 = 30. Then test numbers near 30.', explain: '18 × 32 = 576, so the answer is 32.' },
  { type: 'try', title: 'One more', html: '<span class="expr">1,440 ÷ 36</span>', ans: { kind: 'num', value: 40 }, hint: '36 × 4 = 144. What about 36 × 40?', explain: '36 × 40 = 1,440, so the answer is 40.' }
],
fadd: [
  { type: 'read', title: 'Pieces must match', html: `<p>You can't add <b>1/3</b> and <b>1/4</b> directly. The pieces are different sizes:</p>${fracBar(1, 3, '1/3')}${fracBar(1, 4, '1/4')}<p>It is like adding 1 apple and 1 orange. First we need pieces of the same size.</p>` },
  { type: 'widget', title: 'Find a matching size', html: 'Which piece size works for <b>both</b> bars?', widget: W.bars() },
  { type: 'read', title: 'The renaming recipe', html: `<p>Multiply the top and bottom by the same number. The fraction looks different but is the same amount.</p><p class="expr">${fr(1, 3)} = ${fr('1 × 4', '3 × 4')} = ${fr(4, 12)}</p><p class="expr">${fr(1, 4)} = ${fr('1 × 3', '4 × 3')} = ${fr(3, 12)}</p><p>Then add the tops: ${fr(4, 12)} + ${fr(3, 12)} = ${fr(7, 12)}. The bottom stays 12.</p>` },
  { type: 'choice', title: 'Trap check', html: `What is <span class="expr">${fr(1, 2)} + ${fr(1, 2)}</span>`, opts: ['2/4', '1', '1/4'], correct: 1, explain: 'Two halves make one whole. Adding the bottoms (2/4) is the most common mistake. Never add the denominators!' },
  { type: 'try', title: 'Solve it', html: `<span class="expr">${fr(1, 2)} + ${fr(1, 3)}</span>`, ans: { kind: 'num', value: 5 / 6 }, hint: 'Sixths work for both. 1/2 = 3/6 and 1/3 = 2/6.', explain: '3/6 + 2/6 = 5/6.', fmt: 'Type a fraction like 5/6.' },
  { type: 'try', title: 'Subtract', html: `<span class="expr">${fr(3, 4)} − ${fr(1, 6)}</span>`, ans: { kind: 'num', value: 7 / 12 }, hint: 'Twelfths: 3/4 = 9/12 and 1/6 = 2/12.', explain: '9/12 − 2/12 = 7/12.', fmt: 'Type a fraction like 7/12.' },
  { type: 'try', title: 'Mixed numbers', html: `<span class="expr">1${fr(1, 2)} + 2${fr(1, 4)}</span>`, ans: { kind: 'num', value: 3.75 }, hint: 'Add the wholes (1 + 2). Then add 1/2 + 1/4.', explain: '1 + 2 = 3. 1/2 + 1/4 = 2/4 + 1/4 = 3/4. Total: 3 3/4.', fmt: 'Type a mixed number like 3 3/4.' }
],
fmul: [
  { type: 'read', title: '"Of" means multiply', html: `<p><b>${fr(1, 2)} of 8</b> means split 8 into 2 equal groups and take 1 group. That is 4.</p><p>So ${fr(1, 2)} × 8 = 4. Taking part of something makes it <b>smaller</b>.</p>` },
  { type: 'widget', title: 'Take 3/4 of 12', html: '12 dots are split into 4 equal groups.', widget: W.groups() },
  { type: 'read', title: 'Fraction times fraction', html: `<p>${fr(2, 3)} × ${fr(3, 4)}: shade 3/4 of a square one way and 2/3 the other way. The overlap is the answer.</p><svg class="vis" viewBox="0 0 200 150" role="img" aria-label="Area model showing 6 of 12 parts overlap">${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<rect class="${c < 3 && r < 2 ? 'ov' : c < 3 ? 'c1' : r < 2 ? 'c2' : 'off'}" x="${10 + c * 45}" y="${10 + r * 40}" width="45" height="40"/>`).join('')).join('')}</svg><p>6 of the 12 boxes overlap: ${fr(6, 12)} = ${fr(1, 2)}.</p>` },
  { type: 'read', title: 'The shortcut', html: `<p>Multiply top × top and bottom × bottom:</p><p class="expr">${fr(2, 3)} × ${fr(3, 4)} = ${fr('2 × 3', '3 × 4')} = ${fr(6, 12)} = ${fr(1, 2)}</p><p>Same answer as the picture!</p>` },
  { type: 'try', title: 'Solve it', html: `<span class="expr">${fr(2, 5)} × ${fr(1, 3)}</span>`, ans: { kind: 'num', value: 2 / 15 }, hint: 'Top: 2 × 1. Bottom: 5 × 3.', explain: '2 × 1 = 2 and 5 × 3 = 15, so 2/15.', fmt: 'Type a fraction like 2/15.' },
  { type: 'choice', title: 'Think, don\'t calculate', html: `Is <span class="expr">8 × ${fr(3, 4)}</span> more or less than 8?`, opts: ['More than 8', 'Less than 8', 'Exactly 8'], correct: 1, explain: '3/4 is less than 1 whole, so 8 × 3/4 is less than 8. (It is 6.)' },
  { type: 'try', title: 'Whole times fraction', html: `<span class="expr">4 × ${fr(2, 3)}</span>`, ans: { kind: 'num', value: 8 / 3 }, hint: 'Think of 4 as 4/1. Multiply the tops.', explain: '4 × 2 = 8, so 8/3 = 2 2/3.', fmt: 'Type 8/3 or 2 2/3.' }
],
vol: [
  { type: 'read', title: 'Volume counts cubes', html: `<p><b>Volume</b> is how much space a solid takes up. We measure it by counting how many unit cubes fit inside.</p>${isoBox(3, 2, 2)}<p>This box is 3 long, 2 wide, 2 tall. One layer has 3 × 2 = 6 cubes. Two layers: <b>12 cubes</b>.</p>` },
  { type: 'widget', title: 'Cube builder', html: 'Drag the sliders to build boxes.', widget: W.cubes(24) },
  { type: 'read', title: 'The formula', html: `<p class="expr">V = length × width × height</p><p>Or think of it as <b>one layer × number of layers</b>. Volume units are cubed: cm³, in³, ft³.</p>` },
  { type: 'try', title: 'Solve it', html: `What is the volume?${boxSVG(5, 4, 3, 'cm')}`, ans: { kind: 'num', value: 60 }, hint: '5 × 4 × 3', explain: '5 × 4 = 20 per layer. 3 layers: 60 cm³.' },
  { type: 'try', title: 'A cube', html: 'A cube has sides of <b>4 inches</b>. What is its volume in cubic inches?', ans: { kind: 'num', value: 64 }, hint: 'A cube has the same length, width, and height.', explain: '4 × 4 × 4 = 64 in³.' },
  { type: 'try', title: 'Missing height', html: 'A box holds <b>90</b> cubic feet. It is 5 ft long and 3 ft wide. How tall is it?', ans: { kind: 'num', value: 6 }, hint: 'One layer holds 5 × 3 = 15. How many layers make 90?', explain: '90 ÷ 15 = 6 feet tall.' }
],
grid: [
  { type: 'read', title: 'Every point has an address', html: `<p>A point's address is written <b>(x, y)</b>.</p><ul class="rules"><li><b>x</b> tells how far to walk <b>right</b>.</li><li><b>y</b> tells how far to climb <b>up</b>.</li></ul><p>Start at <b>(0, 0)</b>, called the origin. Remember: <b>walk before you climb.</b></p>${gridSVG([{ x: 3, y: 5, label: '(3, 5)' }])}` },
  { type: 'widget', title: 'Tap the points', html: 'Find each point on the grid.', widget: W.gridtap([[3, 5], [5, 3], [0, 4]]) },
  { type: 'choice', title: 'Quick check', html: 'Which point is 4 right and 0 up?', opts: ['(0, 4)', '(4, 0)', '(4, 4)'], correct: 1, explain: 'Walk 4 (x = 4), climb 0 (y = 0): (4, 0).' },
  { type: 'try', title: 'Take a hike', html: `Start at A. Walk <b>3 right</b> and <b>4 up</b>. Where do you end?${gridSVG([{ x: 2, y: 1, label: 'A' }])}`, ans: { kind: 'point', x: 5, y: 5 }, hint: 'A is at (2, 1). Add 3 to x and 4 to y.', explain: '(2 + 3, 1 + 4) = (5, 5).', fmt: 'Type a point like (5, 5).' },
  { type: 'try', title: 'How far apart?', html: 'Point A is at (3, 2). Point B is at (3, 9). How many units apart?', ans: { kind: 'num', value: 7 }, hint: 'Both have x = 3. Subtract the y values.', explain: '9 − 2 = 7 units.' }
]
};
