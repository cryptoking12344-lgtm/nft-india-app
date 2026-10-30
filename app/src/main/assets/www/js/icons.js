const I = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  explore: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  drops: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M9 12h6M12 9v6"/>',
  collection: '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M7 3h10M9 11h6"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  heart: '<path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.3 12 20 12 20z"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  back: '<path d="M20 12H4M10 6l-6 6 6 6"/>',
  arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  gavel: '<path d="m14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10"/><path d="m16 16 6-6M8 8l6-6M9 7l8 8M21 11l-8-8"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
  bank: '<path d="M3 10h18L12 4zM5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.6c2.4.6 4 2.4 4 5.4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  logout: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  brush: '<path d="M18 3 9 12M7 14c-2 0-3 1.5-3 3.5S3 21 3 21s4 0 5.5-1.5S10 16 10 14z"/>',
  sports: '<path d="M14 3c4 1 6 4 7 7l-9 9-7-7z"/><path d="M5 12l-2 2 7 7 2-2"/>',
  game: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15 12h.01M18 13h.01"/>',
  culture: '<path d="M4 21V10l8-6 8 6v11z"/><path d="M8 21v-6h8v6M2 21h20M12 4V2"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.3"/><circle cx="12" cy="7.5" r="1.3"/><circle cx="16" cy="10" r="1.3"/><path d="M12 21a2 2 0 0 1 0-4h2a3 3 0 0 0 3-3"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  chain: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  gift: '<rect x="3" y="8" width="18" height="5"/><path d="M5 13v8h14v-8M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8zm0 0s2-5 4.5-3.5S15 8 12 8z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  bellOff: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>',
};
const ic = (n, s = 22, c = 'currentColor', w = 1.8, fill = 'none') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${I[n]}</svg>`;

function logoSVG(h = 60, mono = false) {
  // wordmark + waving tricolour
  return `<svg height="${h}" viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg">
   <text x="0" y="52" font-family="Poppins" font-weight="800" font-size="56" style="fill:var(--navy)" letter-spacing="-1">NFT</text>
   <g transform="translate(136 8)">
     <path d="M0 6 Q18 -4 34 6 T68 4 V14 Q52 22 34 14 T0 16Z" fill="#F28C28"/>
     <path d="M0 18 Q18 8 34 18 T68 16 V26 Q52 34 34 26 T0 28Z" fill="#fff" stroke="#e6dccb" stroke-width=".8"/>
     <path d="M0 30 Q18 20 34 30 T68 28 V38 Q52 46 34 38 T0 40Z" fill="#12804A"/>
     <circle cx="34" cy="22" r="3.6" fill="none" style="stroke:var(--navy)" stroke-width="1.4"/>
   </g>
   <text x="0" y="112" font-family="Poppins" font-weight="800" font-size="56" style="fill:var(--navy)" letter-spacing="-1">INDIA</text>
  </svg>`;
}
const verified = (s = 14) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 1.5l2.6 2 3.3-.2.9 3.2 2.7 1.9-1.1 3.1 1.1 3.1-2.7 1.9-.9 3.2-3.3-.2-2.6 2-2.6-2-3.3.2-.9-3.2-2.7-1.9 1.1-3.1L2.4 8.4l2.7-1.9.9-3.2 3.3.2z" fill="#2f7cf6"/><path d="m8 12 3 3 5-6" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;
function logoInline(size = 20) {
  return `<span style="display:inline-flex;align-items:center;gap:6px;font:800 ${size}px Poppins;color:var(--navy);letter-spacing:-.5px">NFT INDIA
  <svg width="${size * 1.1}" height="${size * .8}" viewBox="0 0 68 46"><path d="M0 6 Q18 -4 34 6 T68 4 V14 Q52 22 34 14 T0 16Z" fill="#F28C28"/><path d="M0 18 Q18 8 34 18 T68 16 V26 Q52 34 34 26 T0 28Z" fill="#fff" stroke="#e6dccb"/><path d="M0 30 Q18 20 34 30 T68 28 V38 Q52 46 34 38 T0 40Z" fill="#12804A"/></svg></span>`;
}
