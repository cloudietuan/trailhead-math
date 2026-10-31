// Brain Brawl art: original chunky characters drawn as SVG, plus icons.
const INK = '#120C33';
function shade(hex, amt) {
  let c = hex.replace('#', ''); if (c.length === 3) c = [...c].map(x => x + x).join('');
  const n = parseInt(c, 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// One function draws every hero, boss and AI-lab creature.
// look: { color, acc, eyes, mouth, brows, spots }
function creature(look = {}, cls = '') {
  const c = look.color || '#3DD6FF', d = shade(c, -0.3), l = shade(c, 0.45);
  const sw = 'stroke="' + INK + '" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"';
  let back = '', front = '', face = '';
  const acc = look.acc || '';
  // Accessories behind the body
  if (acc === 'antenna') { back += `<path d="M60 36 L60 15" ${sw} fill="none"/>`; front += `<circle cx="60" cy="12" r="7.5" fill="#FFC93C" ${sw}/><circle cx="57.5" cy="9.5" r="2.4" fill="#fff"/>`; }
  if (acc === 'sprout') back += `<path d="M60 34 Q57 24 60 16" ${sw} fill="none"/><ellipse cx="50" cy="16" rx="11" ry="6" transform="rotate(-25 50 16)" fill="#5BE36B" ${sw}/><ellipse cx="70" cy="13" rx="11" ry="6" transform="rotate(20 70 13)" fill="#5BE36B" ${sw}/>`;
  if (acc === 'flame') back += `<path d="M30 46 Q24 22 40 24 Q40 6 54 14 Q62 -2 70 16 Q82 6 82 26 Q96 24 90 46 Z" fill="#FFC93C" ${sw}/><path d="M44 40 Q42 26 52 28 Q56 16 62 26 Q72 20 74 40 Z" fill="#FF5A3C"/>`;
  if (acc === 'horns') back += `<path d="M32 46 Q14 30 22 10 Q30 30 46 36 Z" fill="#F4FBFF" ${sw}/><path d="M88 46 Q106 30 98 10 Q90 30 74 36 Z" fill="#F4FBFF" ${sw}/>`;
  if (acc === 'ears') back += `<path d="M27 52 L30 16 L54 36 Z" fill="${c}" ${sw}/><path d="M93 52 L90 16 L66 36 Z" fill="${c}" ${sw}/><path d="M33 44 L34 27 L45 37 Z" fill="#FF8FB1"/><path d="M87 44 L86 27 L75 37 Z" fill="#FF8FB1"/>`;
  if (acc === 'spikes') back += `<path d="M28 44 L36 16 L48 36 L58 8 L68 34 L80 14 L90 44 Z" fill="${d}" ${sw}/>`;
  if (acc === 'wings') back += `<path d="M24 62 Q2 40 8 70 Q14 88 28 80 Z" fill="${l}" ${sw}/><path d="M96 62 Q118 40 112 70 Q106 88 92 80 Z" fill="${l}" ${sw}/>`;
  // Shadow, feet, arms, body
  let s = `<ellipse cx="60" cy="124" rx="36" ry="6" fill="rgba(0,0,0,.28)"/>`;
  s += back;
  s += `<rect x="33" y="102" width="20" height="17" rx="8" fill="${d}" ${sw}/><rect x="67" y="102" width="20" height="17" rx="8" fill="${d}" ${sw}/>`;
  s += `<ellipse class="arm" cx="19" cy="80" rx="9" ry="12" fill="${c}" ${sw}/><ellipse class="arm r" cx="101" cy="80" rx="9" ry="12" fill="${c}" ${sw}/>`;
  s += `<rect x="20" y="32" width="80" height="78" rx="28" fill="${c}" ${sw}/>`;
  s += `<path d="M25 82 Q60 104 95 82 L95 84 Q95 108 72 108 L48 108 Q25 108 25 84 Z" fill="${d}" opacity=".45"/>`;
  s += `<rect x="31" y="40" width="22" height="8" rx="4" fill="#fff" opacity=".5"/>`;
  if (look.spots) s += `<circle cx="34" cy="92" r="4" fill="${d}"/><circle cx="86" cy="58" r="5" fill="${d}"/><circle cx="80" cy="96" r="3" fill="${d}"/>`;
  if (look.belly) s += `<ellipse cx="60" cy="90" rx="20" ry="12" fill="${l}" opacity=".8"/>`;
  // Eyes
  const eyes = look.eyes || 'big';
  const eye = (x, y, rx, ry, px = 2, py = 2) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" ${sw}/><circle cx="${x + px}" cy="${y + py}" r="${Math.min(rx, ry) * 0.48}" fill="${INK}"/><circle cx="${x + px - 2}" cy="${y + py - 2.5}" r="2.2" fill="#fff"/>`;
  if (eyes === 'big') face += eye(45, 62, 10, 12) + eye(75, 62, 10, 12);
  if (eyes === 'one') face += eye(60, 60, 16, 16, 0, 2);
  if (eyes === 'three') face += eye(40, 66, 8, 9) + eye(60, 56, 9, 10) + eye(80, 66, 8, 9);
  if (eyes === 'robot') face += `<rect x="33" y="52" width="22" height="18" rx="6" fill="#0F2E4A" ${sw}/><rect x="65" y="52" width="22" height="18" rx="6" fill="#0F2E4A" ${sw}/><rect x="39" y="57" width="10" height="8" rx="3" fill="#7FF8FF"/><rect x="71" y="57" width="10" height="8" rx="3" fill="#7FF8FF"/>`;
  if (eyes === 'focus') face += `<rect x="20" y="50" width="80" height="22" rx="9" fill="#FF4F7B" ${sw}/><path d="M36 61 Q45 55 54 61" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M66 61 Q75 55 84 61" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M98 56 L114 48 L110 62 Z M98 64 L116 70 L104 74 Z" fill="#FF4F7B" ${sw}/>`;
  if (eyes === 'glitch') face += eye(45, 62, 10, 12) + eye(75, 62, 10, 12) + `<rect x="26" y="40" width="6" height="6" fill="#3DD6FF"/><rect x="90" y="88" width="6" height="6" fill="#FFC93C"/><rect x="84" y="40" width="5" height="5" fill="#5BE36B"/>`;
  if (eyes === 'angry') face += eye(45, 63, 10, 11, 1, 3) + eye(75, 63, 10, 11, -1, 3) + `<path d="M33 48 L54 56 M87 48 L66 56" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  if (eyes === 'sleepy') face += `<path d="M36 62 Q45 68 54 62 M66 62 Q75 68 84 62" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  if (eyes === 'visor') face += `<rect x="27" y="46" width="66" height="32" rx="15" fill="#5FD8FF" ${sw}/><path d="M34 54 Q44 48 56 50 L40 70 Q32 66 34 54 Z" fill="#fff" opacity=".55"/><circle cx="50" cy="63" r="4" fill="${INK}"/><circle cx="70" cy="63" r="4" fill="${INK}"/>`;
  // Mouth
  const m = look.mouth || 'smile';
  if (m === 'smile') face += `<path d="M50 84 Q60 94 70 84" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  if (m === 'grin') face += `<path d="M46 82 Q60 100 74 82 Z" fill="${INK}" ${sw}/><path d="M52 86 Q60 96 68 86" fill="#FF6B8B"/>`;
  if (m === 'teeth') face += `<path d="M42 82 L78 82 Q76 98 60 98 Q44 98 42 82 Z" fill="${INK}" ${sw}/><path d="M46 83 L50 90 L54 83 L58 90 L62 83 L66 90 L70 83 L74 90 L76 83 Z" fill="#fff"/>`;
  if (m === 'o') face += `<ellipse cx="60" cy="88" rx="6" ry="7" fill="${INK}"/>`;
  if (m === 'flat') face += `<path d="M52 88 L68 88" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
  if (m === 'fangs') face += `<path d="M46 84 Q60 92 74 84" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M50 86 L53 94 L56 87 Z M64 87 L67 94 L70 86 Z" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
  // Accessories in front
  if (acc === 'crown') front += `<path d="M36 38 L40 12 L51 26 L60 6 L69 26 L80 12 L84 38 Z" fill="#FFC93C" ${sw}/><circle cx="60" cy="27" r="4" fill="#FF4F7B" stroke="${INK}" stroke-width="2"/>`;
  if (acc === 'cap') front += `<path d="M24 46 Q26 14 60 14 Q94 14 96 46 Z" fill="${look.cap || '#3DD6FF'}" ${sw}/><path d="M60 38 L110 38 Q112 48 98 48 L60 48 Z" fill="${look.cap || '#3DD6FF'}" ${sw}/><circle cx="60" cy="15" r="4" fill="${INK}"/>`;
  if (acc === 'headband') front += `<rect x="19" y="40" width="82" height="11" rx="5" fill="#FF4F7B" ${sw}/>`;
  if (acc === 'goggles') front += `<rect x="19" y="36" width="82" height="8" fill="#3B2F86"/><circle cx="44" cy="40" r="11" fill="#9FF0FF" ${sw}/><circle cx="76" cy="40" r="11" fill="#9FF0FF" ${sw}/>`;
  if (acc === 'bolt') front += `<path d="M64 6 L48 30 L60 30 L54 46 L74 20 L62 20 Z" fill="#FFE14D" ${sw}/>`;
  return `<svg class="creature ${cls}" viewBox="0 -4 120 134" aria-hidden="true">${s}${face}${front}</svg>`;
}

const HEROES = [
  { id: 'bolt', name: 'Bolt', role: 'Robot', cost: 0, start: true, look: { color: '#3DD6FF', acc: 'antenna', eyes: 'robot', mouth: 'grin' } },
  { id: 'pixel', name: 'Pixel', role: 'Sprout', cost: 0, start: true, look: { color: '#7CF06B', acc: 'sprout', mouth: 'smile', belly: true } },
  { id: 'blaze', name: 'Blaze', role: 'Fire', cost: 0, start: true, look: { color: '#FF8A3D', acc: 'flame', mouth: 'grin' } },
  { id: 'kit', name: 'Kit', role: 'Ninja', cost: 150, look: { color: '#3E4380', eyes: 'focus', mouth: 'flat' } },
  { id: 'nova', name: 'Nova', role: 'Astronaut', cost: 250, look: { color: '#EEF1FF', eyes: 'visor', mouth: 'smile', acc: 'antenna' } },
  { id: 'rex', name: 'Rex', role: 'Dino', cost: 350, look: { color: '#4FD18B', acc: 'spikes', mouth: 'fangs', spots: true } },
  { id: 'frost', name: 'Frost', role: 'Ice', cost: 500, look: { color: '#BDEBFF', acc: 'horns', mouth: 'o', belly: true } },
  { id: 'glitch', name: 'Glitch', role: 'Hacker', cost: 700, look: { color: '#B26BFF', acc: 'ears', eyes: 'glitch', mouth: 'smile' } },
  { id: 'ace', name: 'Ace', role: 'Pro', cost: 900, look: { color: '#FF4F7B', acc: 'cap', cap: '#3DD6FF', mouth: 'grin' } },
  { id: 'zap', name: 'Zap', role: 'Storm', cost: -1, road: 40, look: { color: '#FFE14D', acc: 'bolt', eyes: 'big', mouth: 'grin', spots: true } },
  { id: 'king', name: 'King Byte', role: 'Royal', cost: -1, road: 100, look: { color: '#FFC93C', acc: 'crown', mouth: 'grin', belly: true } },
];
const hero = id => HEROES.find(h => h.id === id) || HEROES[0];

const ICON = {
  coin: `<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FFC93C" stroke="${INK}" stroke-width="2.6"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="#D9940B" stroke-width="2.6"/></svg>`,
  star: `<svg class="ic" viewBox="0 0 24 24"><path d="M12 2.2l3 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.3l-6 3.1 1.2-6.6-4.8-4.6 6.6-.9z" fill="#FFC93C" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
  starOff: `<svg class="ic" viewBox="0 0 24 24"><path d="M12 2.2l3 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.3l-6 3.1 1.2-6.6-4.8-4.6 6.6-.9z" fill="#4A3F9E" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
  heart: `<svg class="ic" viewBox="0 0 24 24"><path d="M12 21s-8.5-5.3-8.5-11.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8.5 2.8C20.5 15.7 12 21 12 21z" fill="#FF4F7B" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
  heartOff: `<svg class="ic" viewBox="0 0 24 24"><path d="M12 21s-8.5-5.3-8.5-11.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8.5 2.8C20.5 15.7 12 21 12 21z" fill="#3A3080" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
  lock: `<svg class="ic" viewBox="0 0 24 24"><rect x="4.5" y="10" width="15" height="11" rx="3" fill="#B9B2F0" stroke="${INK}" stroke-width="2.4"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10" fill="none" stroke="${INK}" stroke-width="2.4"/></svg>`,
  check: `<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#5BE36B" stroke="${INK}" stroke-width="2.4"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  xp: `<svg class="ic" viewBox="0 0 24 24"><path d="M12 2l8.5 5v10L12 22l-8.5-5V7z" fill="#A070FF" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 9l6 6M15 9l-6 6" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  flame: `<svg class="ic" viewBox="0 0 24 24"><path d="M12 22c-4.5 0-7-3-7-6.5 0-4 3.5-5.5 3.5-9.5 2.5 1.5 3 3.5 3 5 1-1 1.5-2.5 1.5-4 3 2 5 5 5 8.5 0 3.5-2.5 6.5-6 6.5z" fill="#FF8A3D" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 20c-1.8 0-3-1.2-3-2.8 0-1.8 1.5-2.5 2-4 1.5 1 4 2.5 4 4.2 0 1.5-1.2 2.6-3 2.6z" fill="#FFE14D"/></svg>`,
  book: `<svg class="ic" viewBox="0 0 24 24"><path d="M3 5.5Q7.5 3.5 12 6q4.5-2.5 9-.5V19q-4.5-2-9 .5Q7.5 17 3 19z" fill="#3DD6FF" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 6v13.5" stroke="${INK}" stroke-width="2.2"/></svg>`,
  sword: `<svg class="ic" viewBox="0 0 24 24"><path d="M14 3h7v7L10 21l-3-3z" fill="#E8ECFF" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M4 14l6 6M3 21l3-3" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/></svg>`,
  target: `<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="#FF4F7B" stroke="${INK}" stroke-width="2.2"/><circle cx="12" cy="12" r="5.5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="${INK}"/></svg>`,
  gift: `<svg class="ic" viewBox="0 0 24 24"><rect x="3.5" y="9" width="17" height="12" rx="2" fill="#5BE36B" stroke="${INK}" stroke-width="2.2"/><rect x="2.5" y="6.5" width="19" height="4.5" rx="1.5" fill="#7CF06B" stroke="${INK}" stroke-width="2.2"/><path d="M12 6.5V21" stroke="${INK}" stroke-width="2.4"/><path d="M12 6.5C9 1 5 4 8 6.5M12 6.5C15 1 19 4 16 6.5" fill="none" stroke="${INK}" stroke-width="2.2"/></svg>`,
};

// World emblems
function emblem(world) {
  const W = WORLDS[world];
  return `<svg class="emblem" viewBox="0 0 100 100" aria-hidden="true">
  <path d="M50 4 L90 27 L90 73 L50 96 L10 73 L10 27 Z" fill="${shade(W.color, -0.35)}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M50 10 L84 30 L84 68 L50 88 L16 68 L16 30 Z" fill="${W.color}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M50 10 L84 30 L50 50 L16 30 Z" fill="#fff" opacity=".22"/>
  <text x="50" y="${W.glyphY || 64}" text-anchor="middle" class="emblem-t" font-size="${W.glyphSize || 38}">${W.glyph}</text></svg>`;
}

const WORLDS = {
  math: { name: 'Math Arena', short: 'Math', color: '#FF8A3D', glyph: 'x²', glyphSize: 34, blurb: 'Negatives, ratios, percents, equations and more. 6th grade and up.' },
  code: { name: 'Code Lab', short: 'Code', color: '#5BE36B', glyph: '{ }', glyphSize: 32, glyphY: 62, blurb: 'Program a robot, then write real Lua, the language behind Roblox games.' },
  ai: { name: 'AI Academy', short: 'AI', color: '#3DD6FF', glyph: 'AI', glyphSize: 34, blurb: 'How AI learns, how chatbots talk, better prompts, and staying safe.' },
};
