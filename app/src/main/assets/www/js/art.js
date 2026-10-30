// Illustration library — all vector, original artwork
const S = (vb, body, id) => `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">${body}</svg>`;
let uid = 0;
const U = p => p + (uid++);

function sunsetSky(id, top = '#5b4a8b', mid = '#e8784a', low = '#ffc65c') {
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${low}"/></linearGradient>
  <radialGradient id="${id}s" cx=".5" cy=".62" r=".45"><stop offset="0" stop-color="#fff3c4" stop-opacity=".95"/><stop offset=".4" stop-color="#ffd27a" stop-opacity=".5"/><stop offset="1" stop-color="#ffb44a" stop-opacity="0"/></radialGradient></defs>
  <rect width="200" height="200" fill="url(#${id})"/><rect width="200" height="200" fill="url(#${id}s)"/>`;
}
function clouds(c = '#f7a777', o = .55) {
  return `<g fill="${c}" opacity="${o}">
  <ellipse cx="30" cy="40" rx="34" ry="6"/><ellipse cx="160" cy="30" rx="40" ry="7"/><ellipse cx="120" cy="58" rx="30" ry="4"/><ellipse cx="45" cy="70" rx="25" ry="3.5"/></g>`;
}
function birds() {
  return `<g fill="none" stroke="#5a2d1e" stroke-width="1.2" stroke-linecap="round">
  <path d="M40 36q3-3 6 0q3-3 6 0"/><path d="M60 26q2-2 4 0q2-2 4 0"/><path d="M150 44q2-2 4 0q2-2 4 0"/><path d="M165 36q3-3 6 0q3-3 6 0"/></g>`;
}
function trees(y = 170, c = '#2e3b2a') {
  let t = '';
  for (let i = -10; i < 210; i += 14) {
    const h = 14 + ((i * 7) % 13);
    t += `<ellipse cx="${i}" cy="${y - h / 2}" rx="${9 + (i % 5)}" ry="${h / 1.4}" fill="${c}"/>`;
  }
  return t;
}
function indiaGateShape(x, base, w, h, fill = '#a8562f', shade = '#7a3a1f', light = '#d27a45') {
  // x = center, base = ground y
  const L = x - w / 2, top = base - h;
  const aw = w * .42, ah = h * .62;
  return `<g>
  <rect x="${L - w * .06}" y="${base - 4}" width="${w * 1.12}" height="5" fill="${shade}"/>
  <path d="M${L} ${base} V${top + h * .2} H${L + w} V${base} H${x + aw / 2} V${base - ah + aw / 2} A${aw / 2} ${aw / 2} 0 0 0 ${x - aw / 2} ${base - ah + aw / 2} V${base} Z" fill="${fill}"/>
  <rect x="${L}" y="${top + h * .2}" width="${w * .1}" height="${h * .8}" fill="${light}" opacity=".45"/>
  <rect x="${L + w * .9}" y="${top + h * .2}" width="${w * .1}" height="${h * .8}" fill="${shade}" opacity=".55"/>
  <rect x="${L - w * .04}" y="${top + h * .14}" width="${w * 1.08}" height="${h * .07}" fill="${shade}"/>
  <rect x="${L + w * .04}" y="${top + h * .05}" width="${w * .92}" height="${h * .09}" fill="${fill}"/>
  <rect x="${L + w * .14}" y="${top}" width="${w * .72}" height="${h * .06}" fill="${shade}"/>
  <path d="M${x - w * .22} ${top} q${w * .22} -${h * .14} ${w * .44} 0z" fill="${fill}"/>
  <rect x="${L + w * .12}" y="${top + h * .26}" width="${w * .76}" height="${h * .05}" fill="${shade}" opacity=".5"/>
  <path d="M${x - aw / 2} ${base} V${base - ah + aw / 2} A${aw / 2} ${aw / 2} 0 0 1 ${x + aw / 2} ${base - ah + aw / 2} V${base}" fill="none" stroke="${shade}" stroke-width="${w * .025}"/>
  </g>`;
}
function gate() {
  const id = U('g');
  return S('0 0 200 200', `${sunsetSky(id)}${clouds()}${birds()}
  <g fill="#7c4a52" opacity=".55"><rect x="8" y="140" width="10" height="34"/><path d="M6 140h14l-7-10z"/><rect x="180" y="138" width="10" height="36"/><path d="M178 138h14l-7-10z"/><rect x="30" y="150" width="14" height="24"/><rect x="156" y="150" width="14" height="24"/></g>
  ${indiaGateShape(100, 172, 76, 108)}
  ${trees(176, '#3d3a2a')}
  <path d="M0 174h200v26H0z" fill="#5a4630"/>
  <path d="M88 200 L96 174 H104 L112 200Z" fill="#c9915b" opacity=".7"/>
  <path d="M0 186 Q100 180 200 186" stroke="#e3a35f" stroke-width="1" fill="none" opacity=".5"/>`);
}
function gateWide() {
  const id = U('gw');
  return S('0 0 200 160', `${sunsetSky(id, '#fbf3e6', '#fde3c3', '#f6b884')}
  <g fill="#e78a65" opacity=".8"><path d="M30 30q3-3 6 0q3-3 6 0" stroke="#d26d4a" fill="none"/><path d="M160 24q3-3 6 0q3-3 6 0" stroke="#d26d4a" fill="none"/><path d="M170 40q2-2 4 0q2-2 4 0" stroke="#d26d4a" fill="none"/></g>
  <g fill="#9f7468" opacity=".6"><rect x="10" y="100" width="12" height="44"/><path d="M8 100h16l-8-14z"/><rect x="176" y="96" width="12" height="48"/><path d="M174 96h16l-8-14z"/><path d="M30 120 q10-16 20 0z"/><path d="M150 120 q10-16 20 0z"/><rect x="30" y="120" width="20" height="24"/><rect x="150" y="120" width="20" height="24"/></g>
  ${indiaGateShape(100, 144, 60, 84, '#b46a3f', '#874624', '#d88a57')}
  ${trees(146, '#3f5534').replace(/200/g, '200')}
  <rect y="144" width="200" height="16" fill="#4c5a3a"/>
  <path d="M92 160 L97 144 H103 L108 160Z" fill="#d8b38a"/>`);
}
function cricket() {
  const id = U('c');
  return S('0 0 200 200', `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c3f8f"/><stop offset=".6" stop-color="#3f7fd6"/><stop offset="1" stop-color="#8cc4f2"/></linearGradient>
  <radialGradient id="${id}l" cx=".8" cy=".1" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
  <rect width="200" height="200" fill="url(#${id})"/><rect width="200" height="200" fill="url(#${id}l)"/>
  <g fill="#13306b" opacity=".7"><rect x="0" y="120" width="200" height="40"/></g>
  <g fill="#fff" opacity=".35">${Array.from({ length: 30 }, (_, i) => `<circle cx="${i * 7 + 3}" cy="${125 + (i % 3) * 8}" r="1.4"/>`).join('')}</g>
  <rect x="0" y="160" width="200" height="40" fill="#4f9a45"/><rect x="0" y="160" width="200" height="6" fill="#62b257"/>
  <g transform="translate(100 98)">
   <path d="M-34 -70 L-8 -20" stroke="#e6c38a" stroke-width="7" stroke-linecap="round"/>
   <path d="M-36 -74 L-30 -62" stroke="#3a2a1c" stroke-width="5" stroke-linecap="round"/>
   <path d="M-18 -10 Q-4 -34 14 -28 Q30 -20 26 10 L22 34 H-16 Z" fill="#1f5fd1"/>
   <path d="M-6 -20 Q4 -24 14 -18" stroke="#f28c28" stroke-width="3" fill="none"/>
   <path d="M-14 -16 L-10 -22 L-26 -40" stroke="#1f5fd1" stroke-width="8" stroke-linecap="round" fill="none"/>
   <path d="M20 -18 Q4 -40 -8 -28" stroke="#1f5fd1" stroke-width="8" stroke-linecap="round" fill="none"/>
   <circle cx="-10" cy="-26" r="5" fill="#fff"/>
   <circle cx="6" cy="-44" r="13" fill="#173b8a"/><path d="M-8 -44 h28" stroke="#0e2a66" stroke-width="3"/>
   <path d="M-6 -40 v8 h22 v-8" stroke="#ccd" stroke-width="1.4" fill="none"/>
   <path d="M-14 34 L-20 62 H-8 L0 36 Z M10 34 L14 62 H26 L22 34Z" fill="#f3f3f3"/>
   <rect x="-22" y="60" width="16" height="6" rx="2" fill="#222"/><rect x="12" y="60" width="16" height="6" rx="2" fill="#222"/>
  </g>`);
}
function temple() {
  const id = U('t');
  return S('0 0 200 200', `${sunsetSky(id, '#e9a35a', '#f6c06a', '#ffe1a0')}${clouds('#fff', .35)}
  <g fill="#a85a2a">
   <path d="M60 170 V120 Q70 70 100 30 Q130 70 140 120 V170Z"/>
   <path d="M30 170 V135 Q38 105 52 92 Q66 105 74 135 V170Z" fill="#b8693a"/>
   <path d="M126 170 V135 Q134 105 148 92 Q162 105 170 135 V170Z" fill="#b8693a"/>
  </g>
  <g stroke="#7d3c18" stroke-width="1.2" fill="none" opacity=".7">${[50, 64, 78, 92, 106, 120, 134, 148].map(y => `<path d="M${100 - (y - 30) * .28} ${y + 4} H${100 + (y - 30) * .28}"/>`).join('')}</g>
  <path d="M100 30 V18" stroke="#7d3c18" stroke-width="2"/><path d="M100 18 l9 3 -9 3z" fill="#f28c28"/>
  <path d="M86 170 V146 a14 14 0 0 1 28 0 V170Z" fill="#5c2b10"/>
  <rect y="168" width="200" height="32" fill="#c79a5c"/><rect y="168" width="200" height="4" fill="#8a5a2c"/>
  ${trees(178, '#4d6b3a')}`);
}
function train() {
  const id = U('tr');
  return S('0 0 200 200', `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb3b8"/><stop offset="1" stop-color="#d7e4cf"/></linearGradient></defs>
  <rect width="200" height="200" fill="url(#${id})"/>
  <g fill="#9bb3a8" opacity=".7"><path d="M0 100 Q40 60 80 95 Q120 55 160 92 Q185 72 200 85 V120 H0Z"/></g>
  <rect y="110" width="200" height="90" fill="#3f7a3a"/>
  <g fill="#2c5e2c">${Array.from({ length: 16 }, (_, i) => `<ellipse cx="${i * 14}" cy="${110 - (i % 3) * 4}" rx="10" ry="${14 + (i % 4) * 3}"/>`).join('')}</g>
  <g fill="#245224"><path d="M150 112 q6-40 4-60 M150 70 q-20 -6 -30 4 M150 70 q20-8 28 4" stroke="#245224" stroke-width="3" fill="none"/></g>
  <path d="M0 150 L200 132" stroke="#5e4a3a" stroke-width="6"/>
  <g transform="rotate(-5 100 140)">
   <rect x="20" y="118" width="70" height="26" rx="4" fill="#c8331f"/><rect x="92" y="118" width="70" height="26" rx="4" fill="#c8331f"/>
   <path d="M164 118 h14 q12 0 14 26 h-28z" fill="#d84a2a"/>
   <rect x="20" y="138" width="172" height="5" fill="#1f2a44"/>
   ${[26, 42, 58, 74, 98, 114, 130, 146].map(x => `<rect x="${x}" y="123" width="10" height="7" rx="1" fill="#ffe1a8"/>`).join('')}
   <rect x="20" y="132" width="142" height="2" fill="#f5b52a"/>
  </g>
  <path d="M0 175 Q60 160 120 180 T200 170 V200 H0Z" fill="#6aa6c9" opacity=".8"/>`);
}
function dancer(bg = '#2a1a3a') {
  const id = U('d');
  return S('0 0 200 200', `<defs><radialGradient id="${id}" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#8a3a2a"/><stop offset="1" stop-color="${bg}"/></radialGradient></defs>
  <rect width="200" height="200" fill="url(#${id})"/>
  <g fill="#f6b23a" opacity=".25">${Array.from({ length: 14 }, (_, i) => `<circle cx="${(i * 37) % 200}" cy="${(i * 53) % 120}" r="${1 + (i % 3)}"/>`).join('')}</g>
  <g transform="translate(100 100)">
   <path d="M-6 -30 L-40 -54" stroke="#c98a5a" stroke-width="6" stroke-linecap="round"/>
   <path d="M6 -30 L36 -14" stroke="#c98a5a" stroke-width="6" stroke-linecap="round"/>
   <circle cx="-42" cy="-56" r="4" fill="#c98a5a"/><circle cx="38" cy="-12" r="4" fill="#c98a5a"/>
   <path d="M-12 -32 Q0 -38 12 -32 L10 4 H-10Z" fill="#e8601e"/>
   <path d="M-10 2 L-34 70 Q0 82 34 70 L10 2Z" fill="#f07d22"/>
   <path d="M-6 4 L-14 72 M0 4 V76 M6 4 L14 72" stroke="#c94a12" stroke-width="2"/>
   <path d="M-34 70 Q0 82 34 70" stroke="#f6c64a" stroke-width="3" fill="none"/>
   <path d="M-12 -32 Q0 -24 12 -32" stroke="#f6c64a" stroke-width="2" fill="none"/>
   <circle cx="0" cy="-46" r="11" fill="#c98a5a"/>
   <path d="M-11 -48 Q0 -64 12 -48 Q14 -60 0 -60 Q-14 -60 -11 -48Z" fill="#1e1410"/>
   <circle cx="12" cy="-54" r="5" fill="#1e1410"/><circle cx="12" cy="-54" r="2.5" fill="#f6c64a"/>
   <circle cx="0" cy="-48" r="1.2" fill="#d22"/>
  </g>
  <ellipse cx="100" cy="186" rx="50" ry="5" fill="#000" opacity=".3"/>`);
}
function auto() {
  const id = U('a');
  return S('0 0 200 200', `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d2a6"/><stop offset="1" stop-color="#e6a87a"/></linearGradient></defs>
  <rect width="200" height="200" fill="url(#${id})"/>
  <rect x="0" y="20" width="50" height="140" fill="#d65a5a"/><rect x="50" y="40" width="44" height="120" fill="#4e9ec4"/>
  <rect x="140" y="10" width="60" height="150" fill="#7cc06a"/><rect x="94" y="30" width="46" height="130" fill="#f2b33d"/>
  <g fill="#fff6" >${[30, 60, 90, 120].map(y => `<rect x="8" y="${y}" width="14" height="14"/><rect x="28" y="${y}" width="14" height="14"/><rect x="150" y="${y}" width="14" height="14"/><rect x="172" y="${y}" width="14" height="14"/>`).join('')}</g>
  <g stroke="#e8428a" stroke-width="2"><path d="M0 40 Q50 52 100 40 T200 40" fill="none"/></g>
  <g fill="#f28c28">${[10, 30, 50, 70, 90, 110, 130, 150, 170, 190].map((x, i) => `<path d="M${x} ${44 + Math.sin(i) * 4}l4 8 h-8z" fill="${['#e8428a', '#f28c28', '#2bb3a3', '#f6c64a'][i % 4]}"/>`).join('')}</g>
  <rect y="160" width="200" height="40" fill="#8a8a8a"/>
  <g transform="translate(100 140)">
   <path d="M-46 22 V-10 Q-40 -40 0 -42 Q40 -40 46 -10 V22Z" fill="#1d8a4a"/>
   <path d="M-46 -6 Q-40 -38 0 -40 Q40 -38 46 -6 Z" fill="#1d6a3a"/>
   <path d="M-38 22 V0 H38 V22Z" fill="#f6d12a"/>
   <path d="M-30 0 V-26 H8 V0Z" fill="#2c3a4a" opacity=".85"/>
   <rect x="16" y="-6" width="16" height="10" fill="#bcd" opacity=".8"/>
   <circle cx="-28" cy="26" r="10" fill="#222"/><circle cx="-28" cy="26" r="4" fill="#bbb"/>
   <circle cx="30" cy="26" r="10" fill="#222"/><circle cx="30" cy="26" r="4" fill="#bbb"/>
  </g>`);
}
function portrait() {
  const id = U('p');
  return S('0 0 200 200', `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f5c6a"/><stop offset="1" stop-color="#e8b34a"/></linearGradient></defs>
  <rect width="200" height="200" fill="url(#${id})"/>
  <g transform="translate(108 110)">
   <path d="M-60 90 Q-50 30 0 26 Q50 30 60 90Z" fill="#c2311f"/>
   <path d="M-40 90 Q-36 50 0 46 Q36 50 40 90" fill="none" stroke="#f2c14a" stroke-width="4"/>
   <rect x="-10" y="10" width="20" height="22" fill="#c98a5a"/>
   <path d="M-36 -6 Q-40 -60 0 -62 Q40 -60 36 -6 Q36 40 26 50 L-26 50 Q-36 40 -36 -6Z" fill="#2a1a12"/>
   <ellipse cx="0" cy="-8" rx="26" ry="32" fill="#d79a68"/>
   <path d="M-26 -18 Q0 -46 26 -18 Q22 -40 0 -42 Q-22 -40 -26 -18Z" fill="#2a1a12"/>
   <path d="M-14 -10 q5 -3 10 0 M4 -10 q5 -3 10 0" stroke="#2a1a12" stroke-width="2" fill="none"/>
   <path d="M0 -6 v10" stroke="#b5764a" stroke-width="1.4"/>
   <path d="M-7 12 q7 4 14 0" stroke="#a2342a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
   <circle cx="0" cy="-22" r="2" fill="#c41e2a"/>
   <circle cx="-26" cy="4" r="3" fill="#f2c14a"/><circle cx="26" cy="4" r="3" fill="#f2c14a"/>
   <path d="M-18 24 Q0 36 18 24" stroke="#f2c14a" stroke-width="3" fill="none"/>
   ${[[-30, -40], [-20, -52], [-36, -26], [-8, -58]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${7 - i}" fill="${['#e8428a', '#f28c28', '#f2c14a', '#d63a5a'][i]}"/><circle cx="${x}" cy="${y}" r="2" fill="#fff4"/>`).join('')}
  </g>`);
}
function bannerWoman() { return portrait(); }
function avatarMan() {
  return S('0 0 100 100', `<rect width="100" height="100" fill="#d8dfe8"/>
  <path d="M10 100 Q14 72 50 70 Q86 72 90 100Z" fill="#2f3b4c"/>
  <path d="M40 60 h20 v14 q-10 6 -20 0z" fill="#c48a62"/>
  <ellipse cx="50" cy="46" rx="18" ry="21" fill="#c9926a"/>
  <path d="M31 42 Q30 20 50 20 Q72 20 69 44 Q66 30 50 30 Q36 30 31 42Z" fill="#231812"/>
  <path d="M34 54 Q36 68 50 69 Q64 68 66 54 Q62 62 50 62 Q38 62 34 54Z" fill="#3a2a20"/>
  <path d="M43 56 q7 4 14 0" stroke="#fff" stroke-width="2" fill="none"/>
  <circle cx="43" cy="44" r="1.8" fill="#231812"/><circle cx="57" cy="44" r="1.8" fill="#231812"/>`);
}
function cityNight() {
  const id = U('cn');
  return S('0 0 200 200', `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2a5a"/><stop offset="1" stop-color="#d0569a"/></linearGradient></defs>
  <rect width="200" height="200" fill="url(#${id})"/>
  <circle cx="150" cy="50" r="16" fill="#ffe3a8"/>
  <g fill="#2a1c4a">${[[0, 90, 30], [28, 70, 26], [52, 100, 22], [72, 60, 30], [100, 84, 24], [122, 50, 28], [148, 96, 26], [172, 74, 30]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${200 - y}"/>`).join('')}</g>
  <g fill="#ffd166">${Array.from({ length: 40 }, (_, i) => `<rect x="${(i * 23) % 196 + 2}" y="${110 + (i * 17) % 80}" width="3" height="4"/>`).join('')}</g>`);
}
function studioBanner() {
  return S('0 0 400 200', `<rect width="400" height="200" fill="#2a2234"/>
  <rect x="0" y="0" width="400" height="200" fill="#4a3424" opacity=".6"/>
  <g transform="translate(250 30)"><rect width="110" height="120" fill="#6a2a1a"/><rect x="6" y="6" width="98" height="108" fill="#d7553a"/>
   <circle cx="55" cy="60" r="34" fill="#f2b33d"/><circle cx="55" cy="60" r="22" fill="#2a3a8a"/><circle cx="55" cy="60" r="8" fill="#f6e3a3"/>
   ${Array.from({ length: 12 }, (_, i) => `<path d="M55 60 L${55 + 40 * Math.cos(i * Math.PI / 6)} ${60 + 40 * Math.sin(i * Math.PI / 6)}" stroke="#f6e3a3" stroke-width="1.5"/>`).join('')}</g>
  <rect x="235" y="150" width="140" height="8" fill="#3a2a1a"/>
  <g fill="#8a6a3a" opacity=".6"><rect x="20" y="40" width="60" height="80"/><rect x="100" y="60" width="50" height="60"/></g>
  <g fill="#e8a24a" opacity=".5"><circle cx="40" cy="160" r="10"/><circle cx="70" cy="170" r="8"/><circle cx="110" cy="164" r="12"/></g>
  <rect width="400" height="200" fill="url(#vg)" opacity=".0"/>`);
}
function palace() {
  const id = U('pl');
  return S('0 0 200 200', `${sunsetSky(id, '#3a2a6a', '#b04a7a', '#f2a24a')}
  <g fill="#6a2a4a"><rect x="40" y="110" width="120" height="70"/>
  <path d="M70 110 Q100 50 130 110Z"/><path d="M40 110 Q50 84 60 110Z"/><path d="M140 110 Q150 84 160 110Z"/>
  <rect x="96" y="40" width="8" height="20"/></g>
  <g fill="#f6c64a">${[52, 72, 92, 112, 132].map(x => `<rect x="${x}" y="130" width="10" height="16" rx="5"/>`).join('')}</g>
  <rect y="178" width="200" height="22" fill="#2a1a3a"/>`);
}
function family() {
  const id = U('f');
  return S('0 0 200 200', `${sunsetSky(id, '#3f6aa8', '#7aa8d8', '#f2c88a')}
  <rect y="150" width="200" height="50" fill="#7a5a3a"/>
  ${[[60, '#e8601e'], [100, '#2a6ad6'], [140, '#c2311f']].map(([x, c]) => `<g transform="translate(${x} 130)"><circle cy="-30" r="10" fill="#c98a5a"/><path d="M-10 -30 q10 -16 20 0" fill="#2a1a12"/><path d="M-14 -18 Q0 -24 14 -18 L18 30 H-18Z" fill="${c}"/></g>`).join('')}`);
}
window.ART = { gate, gateWide, cricket, temple, train, dancer, auto, portrait, avatarMan, cityNight, studioBanner, palace, family };
