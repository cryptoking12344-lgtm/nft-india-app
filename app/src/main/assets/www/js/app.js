/* NFT INDIA — demo app (single-page, runs inside an Android WebView) */
(() => {
'use strict';
// ---------- state ----------
const fresh = () => ({
  user: null, onboarded: false, owned: [], liked: ['cricket-0', 'spirit-1'], following: ['artverse', 'gameon', 'kalakendra'],
  orders: [], reminders: [], settings: { delay: false, drops: true }, earnings: 0, sales: [],
  notifs: [
    { id: 'n1', icon: 'gift', title: 'Welcome to NFT INDIA', body: 'Your collection is ready. No wallet setup needed — we manage it for you.', t: Date.now() - 3600e3, read: false },
    { id: 'n2', icon: 'clock', title: 'Drop reminder', body: 'Royal Rajasthan — Season 2 drops in 6 hours.', t: Date.now() - 7200e3, read: false },
  ],
});
// Demo mode: state lives in memory only, so every fresh app launch starts clean.
let S = fresh();
const save = () => {};
// Theme preference is the only thing remembered between launches.
const THEME_KEY = 'nftindia.theme';
let theme = 'light';
try { theme = localStorage.getItem(THEME_KEY) || 'light'; } catch (e) {}
const isDark = () => theme === 'dark' || (theme === 'system' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
function applyTheme() { document.documentElement.classList.toggle('dark', isDark()); }
applyTheme();
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (theme === 'system') { applyTheme(); syncBar(); } }); } catch (e) {}
let barOverride = null;
function syncBar() { try { const lz = barOverride === 'splash'; const dk = barOverride === 'dark' ? true : lz ? false : isDark(); window.Android && Android.setStatusBar(dk ? 'dark' : 'light', barOverride === 'dark' ? '#2A2234' : lz ? '#FBF8F2' : getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()); } catch (e) {} }

// ---------- helpers ----------
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const artOf = (name, hue = 0) => `<div class="art" style="${hue ? `filter:hue-rotate(${hue}deg) saturate(1.05)` : ''}">${ART[name]()}</div>`;
const itemArt = it => artOf(it.art, it.hue);
const isOwned = id => S.owned.some(o => o.itemId === id);
const isLiked = id => S.liked.includes(id);
const unread = () => S.notifs.filter(n => !n.read).length;
const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'Just now' : m < 60 ? m + 'm ago' : m < 1440 ? Math.round(m / 60) + 'h ago' : Math.round(m / 1440) + 'd ago'; };
const fmtDate = t => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const hex = n => Array.from({ length: n }, () => '0123456789abcdef'[Math.random() * 16 | 0]).join('');
const short = h => h.slice(0, 6) + '…' + h.slice(-4);
const vibrate = (ms = 12) => { try { window.Android && Android.vibrate(ms); } catch (e) {} };
const CONTRACT = '0x7a3f' + 'c91e2b84d05f6a1e9b3c7d2f40a8e6b1c35d9e';
const VAULT = '0x91c2' + '4e7ab0d3f58c26e19a74b0d5c8e3f1a62b7d4';

function toast(msg) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}
function share(text) {
  vibrate();
  try { if (window.Android && Android.share) { Android.share(text); return; } } catch (e) {}
  if (navigator.share) { navigator.share({ text }).catch(() => {}); return; }
  try { navigator.clipboard.writeText(text); } catch (e) {}
  toast('Link copied to clipboard');
}
function notify(icon, title, body) { S.notifs.unshift({ id: 'n' + Date.now(), icon, title, body, t: Date.now(), read: false }); save(); }

// ---------- router ----------
let stack = [];
let timers = [];
// timer ids and animation-frame ids share number ranges, so frames are stored as {r:id} to never cancel a global interval by mistake
const clearTimers = () => { timers.forEach(t => { if (typeof t === 'object') cancelAnimationFrame(t.r); else { clearTimeout(t); clearInterval(t); } }); timers = []; };
const TABS = ['home', 'explore', 'drops', 'mycollection', 'profile'];
function go(name, params = {}, opt = {}) {
  closeOverlays();
  if (opt.replace) stack.pop();
  if (opt.reset) stack = [];
  stack.push({ name, params });
  render(opt.anim || (opt.reset ? 'fade' : 'enter'));
}
function tab(name) { if (stack.length && stack[stack.length - 1].name === name && stack.length === 1) { const s = $('.screen'); s && s.scrollTo({ top: 0, behavior: 'smooth' }); return; } vibrate(8); go(name, {}, { reset: true }); }
function back() {
  if (closeOverlays()) return true;
  if (stack.length > 1) { stack.pop(); render('enter-back'); return true; }
  const cur = stack[0] && stack[0].name;
  if (cur && TABS.includes(cur) && cur !== 'home') { go('home', {}, { reset: true }); return true; }
  return false;
}
function refresh() { const s = $('.screen'); const top = s ? s.scrollTop : 0; render(''); const n = $('.screen'); if (n) n.scrollTop = top; }
function render(anim) {
  clearTimers();
  const cur = stack[stack.length - 1];
  const out = SCREENS[cur.name](cur.params || {});
  const app = $('#app');
  app.innerHTML = `<div class="screen ${out.nav ? 'has-nav' : ''} ${out.cta ? 'has-cta' : ''} ${anim || ''}" style="${out.bg ? 'background:' + out.bg : ''}">${out.html}</div>${out.cta ? `<div class="cta">${out.cta}</div>` : ''}${out.nav ? navBar(out.nav) : ''}`;
  barOverride = out.dark ? 'dark' : out.splash ? 'splash' : null; syncBar();
  if (out.after) out.after();
}
window.appBack = back;

// ---------- overlays ----------
function closeOverlays() {
  const o = document.querySelectorAll('.sheet,.sheet-bg,.drawer,.drawer-bg');
  if (!o.length) return false; o.forEach(e => e.remove()); return true;
}
function sheet(html, onClose) {
  closeOverlays();
  const bg = document.createElement('div'); bg.className = 'sheet-bg';
  const sh = document.createElement('div'); sh.className = 'sheet'; sh.innerHTML = '<div class="grab"></div>' + html;
  bg.onclick = () => { closeOverlays(); onClose && onClose(); };
  document.body.append(bg, sh); return sh;
}
function drawer() {
  closeOverlays(); vibrate(8);
  const cur = stack[stack.length - 1].name;
  const bg = document.createElement('div'); bg.className = 'drawer-bg'; bg.onclick = closeOverlays;
  const d = document.createElement('div'); d.className = 'drawer';
  const main = [['home', 'Home', 'home'], ['explore', 'Explore', 'explore'], ['drops', 'Drops', 'drops'], ['collection', 'Collection', 'mycollection'], ['profile', 'Profile', 'profile']];
  d.innerHTML = `<div class="row sp" style="margin-bottom:16px">${logoInline(22)}<button class="iconbtn" onclick="App.closeOverlays()">${ic('close', 24)}</button></div>
   <div class="themebtn" id="dtheme" style="margin-bottom:14px">${themeOpts()}</div>
   ${main.map(([i, l, r]) => `<div class="ditem ${cur === r ? 'on' : ''}" onclick="App.tab('${r}')">${ic(i, 22, cur === r ? '#12804A' : 'currentColor', 1.8)}${l}</div>`).join('')}
   <div class="divider" style="margin:12px 0"></div>
   <div class="ditem" onclick="App.go('notifications')">${ic('bell', 22)}Notifications ${unread() ? `<span class="badge saff" style="margin-left:auto">${unread()}</span>` : ''}</div>
   <div class="ditem" onclick="App.go('settings')">${ic('gear', 22)}Settings</div>
   <div class="ditem" onclick="App.go('help')">${ic('help', 22)}Help & Support</div>
   <div class="ditem" onclick="App.go('about')">${ic('info', 22)}About</div>
   <div class="ditem" style="color:var(--red);font-weight:600" onclick="App.logout()">${ic('logout', 22, '#e0384a', 1.9)}Logout</div>
   <div class="sm" style="margin-top:auto">Version 1.1.0 (demo) · Made in India 🇮🇳</div>`;
  document.body.append(bg, d);
}

// ---------- theme ----------
const themeOpts = () => [['light', 'sun', 'Light'], ['dark', 'moon', 'Dark'], ['system', 'phone', 'Auto']].map(([k, i, l]) => `<div class="${theme === k ? 'on' : ''}" onclick="App.setTheme('${k}')">${ic(i, 16, 'currentColor', 2)}${l}</div>`).join('');

// ---------- resale: sell / auction / gift (all simulated) ----------
const FEE = .025, ROYALTY = .05;
const BUYERS = ['Aarav M.', 'Priya S.', 'Rohan K.', 'Ananya R.', 'Vikram J.', 'Isha P.', 'Kabir N.', 'Meera T.', 'Arjun D.', 'Sneha V.'];
const CONTACTS = [['Amma', '98480 11223'], ['Imran Bhai', '99890 45612'], ['Sana', '90004 77881'], ['Rahul', '98765 43210']];
const pick = a => a[Math.random() * a.length | 0];
const net = p => Math.round(p * (1 - FEE - ROYALTY));
const ownOf = id => S.owned.find(o => o.itemId === id);
const paidFor = id => { const o = ownOf(id); const ord = o && S.orders.find(x => x.id === o.orderId); return ord ? ord.amount : getItem(id).price; };
const round10 = n => Math.max(10, Math.round(n / 10) * 10);
const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); const h = s / 3600 | 0, m = (s % 3600) / 60 | 0, ss = s % 60; return h ? `${h}h ${String(m).padStart(2, '0')}m ${String(ss).padStart(2, '0')}s` : `${m}:${String(ss).padStart(2, '0')}`; };
const visibleBids = a => a.bids.filter(b => b.t <= Date.now());
const topBid = a => { const v = visibleBids(a); return v.length ? v[v.length - 1] : null; };
function makeBids(start, dur, startTime) {
  const fr = [.06, .15, .27, .39, .52, .65, .78, .9, .97], n = 5 + (Math.random() * 4 | 0);
  let amt = start, last = '';
  return fr.slice(0, n).map((f, k) => { amt = round10(amt * (k ? 1.05 + Math.random() * .08 : 1)); let who; do { who = pick(BUYERS); } while (who === last); last = who; return { t: startTime + f * dur, amt, who }; });
}
function finishTrade(id, kind, who, amount) {
  const it = getItem(id), o = ownOf(id); if (!o) return;
  S.owned = S.owned.filter(x => x.itemId !== id);
  const rec = { id: 'S' + Date.now().toString().slice(-7), itemId: id, kind, who, amount, net: kind === 'gift' ? 0 : net(amount), t: Date.now() };
  S.sales.push(rec);
  if (kind !== 'gift') S.earnings += rec.net;
  if (kind === 'sale') notify('tag', 'Sold! 🎉', `${it.name} sold to ${who} for ${inr(amount)}. ${inr(rec.net)} added to your earnings.`);
  if (kind === 'auction') notify('gavel', 'Auction won by ' + who, `${it.name} sold for ${inr(amount)}. ${inr(rec.net)} added to your earnings.`);
  if (kind === 'gift') notify('gift', 'Gift delivered', `${it.name} was sent to ${who}.`);
  return rec;
}
// one global ticker drives listings & auctions, independent of the screen being shown
setInterval(() => {
  const now = Date.now(); let changed = false;
  S.owned.slice().forEach(o => {
    if (o.status === 'listed' && o.sellAt && now >= o.sellAt) {
      const who = pick(BUYERS); finishTrade(o.itemId, 'sale', who, o.price); changed = true;
      toast(`${getItem(o.itemId).name} sold for ${inr(o.price)}!`); vibrate(40);
    }
    if (o.status === 'auction') {
      const a = o.auction, seen = visibleBids(a).length;
      if (seen !== a.seen) { a.seen = seen; changed = true; if (seen && cur().name !== 'auction') toast(`New bid ${inr(topBid(a).amt)} on ${getItem(o.itemId).name}`); vibrate(10); }
      if (now >= a.end) {
        const tb = topBid(a);
        if (tb) { finishTrade(o.itemId, 'auction', tb.who, tb.amt); toast(`Auction ended — sold for ${inr(tb.amt)}`); }
        else { o.status = 'owned'; delete o.auction; notify('gavel', 'Auction ended', `No bids on ${getItem(o.itemId).name}. It's back in your collection.`); toast('Auction ended with no bids'); }
        vibrate(40); changed = true;
      }
    }
  });
  if (changed) { const n = cur().name; if (n === 'auction') updateAuction(); else if (['mycollection', 'nft', 'wallet', 'orders', 'profile', 'home', 'notifications'].includes(n) && !document.querySelector('.sheet')) refresh(); }
}, 1000);
const cur = () => stack[stack.length - 1] || { name: '' };

function marketPanel(id, own, processing) {
  if (processing) return `<div class="box row gap12" style="margin-top:18px;background:var(--saff-l);border-color:var(--saff-b)">${ic('clock', 22, 'var(--saff)', 2)}<div class="sm" style="color:var(--saff-t);line-height:1.45">Selling, auctions and gifting unlock once delivery to your collection completes.</div></div>`;
  if (own.status === 'listed') {
    const hi = own.price > paidFor(id) * 1.6;
    return `<div class="box" style="margin-top:18px;border-color:var(--green)"><div class="row sp"><span class="badge green">${ic('tag', 13, 'var(--green)', 2.2)}Listed for sale</span><span class="sm">${ago(own.listedAt)}</span></div>
      <div style="font:700 28px Poppins;color:var(--navy);margin-top:10px">${inr(own.price)}</div><div class="sm">You'll receive ${inr(net(own.price))} after fees & royalty</div>
      ${hi ? `<div class="sm" style="margin-top:8px;color:var(--saff)">Priced well above the floor — it may take longer to sell.</div>` : `<div class="sm row gap8" style="margin-top:8px"><span class="live" style="background:var(--green)"></span>${3 + (Date.now() / 7000 | 0) % 9} collectors viewing</div>`}
      <div class="row gap12" style="margin-top:14px"><button class="btn2" onclick="App.cancelListing('${id}')">Cancel listing</button><button class="btn" style="height:50px" onclick="App.sellSheet('${id}')">Edit price</button></div></div>`;
  }
  if (own.status === 'auction') {
    const a = own.auction, tb = topBid(a);
    return `<div class="box" style="margin-top:18px;border-color:var(--red)" onclick="App.go('auction',{id:'${id}'})"><div class="row sp"><span class="badge" style="background:var(--red-l);color:var(--red)"><span class="live"></span>LIVE AUCTION</span><span class="sm">${mmss(a.end - Date.now())} left</span></div>
      <div class="row sp" style="margin-top:10px"><div><div class="sm">${tb ? 'Highest bid' : 'Starting price'}</div><div style="font:700 26px Poppins;color:var(--navy)">${inr(tb ? tb.amt : a.start)}</div></div><div style="text-align:right"><div class="sm">Bids</div><div style="font:700 20px Poppins;color:var(--navy)">${visibleBids(a).length}</div></div></div>
      <button class="btn" style="margin-top:14px">${ic('gavel', 18, '#fff', 2)}View live auction</button></div>`;
  }
  const tile = (i, l, d, fn, c) => `<button class="box" style="flex:1;padding:14px 8px;text-align:center" onclick="App.${fn}('${id}')"><div style="width:42px;height:42px;border-radius:21px;margin:0 auto;background:${c}22;display:flex;align-items:center;justify-content:center">${ic(i, 21, c, 2)}</div><div style="font:600 14px Inter;margin-top:8px">${l}</div><div class="sm" style="font-size:11px;margin-top:2px">${d}</div></button>`;
  return `<div class="h3" style="margin:22px 0 10px">Trade this collectible</div><div class="row gap8">${tile('tag', 'Sell', 'Fixed price', 'sellSheet', '#12804A')}${tile('gavel', 'Auction', 'Take bids', 'auctionSheet', '#e0384a')}${tile('gift', 'Gift', 'Send to a friend', 'giftSheet', '#F28C28')}</div>`;
}

// ---------- components ----------
function navBar(active) {
  const items = [['home', 'Home', 'home'], ['explore', 'Explore', 'explore'], ['drops', 'Drops', 'drops'], ['collection', 'Collection', 'mycollection'], ['profile', 'Profile', 'profile']];
  return `<div class="nav">${items.map(([k, l, r]) => {
    const on = r === active;
    return `<div class="ni ${on ? 'on' : ''}" onclick="App.tab('${r}')">${on ? `<div class="nib">${ic(k, 18, '#fff', 2, '#ffffff22')}</div>` : `<div style="height:26px;display:flex;align-items:center">${ic(k, 22, 'var(--ink3)', 1.7)}</div>`}<span>${l}</span></div>`;
  }).join('')}</div>`;
}
const heartBtn = (id, size = 20) => `<button class="iconbtn heart ${isLiked(id) ? 'on' : ''}" style="width:30px;height:30px" onclick="event.stopPropagation();App.like('${id}',this)">${ic('heart', size, 'currentColor', 1.8)}</button>`;
function itemCard(it, h = 160) {
  const c = getCol(it.col), cr = CREATORS[c.creator];
  return `<div class="card" onclick="App.go('nft',{id:'${it.id}'})"><div class="thumb" style="height:${h}px">${itemArt(it)}${isOwned(it.id) ? '<span class="badge green" style="position:absolute;left:8px;top:8px">Owned</span>' : ''}</div>
   <div style="padding:10px 12px 10px"><div class="ttl">${esc(it.name)}</div><div class="sm" style="margin:2px 0 6px">by ${cr.name}</div>
   <div class="row sp"><span class="price">${inr(it.price)}</span>${heartBtn(it.id)}</div></div></div>`;
}
function colCard(c, w = 168) {
  const cr = CREATORS[c.creator];
  return `<div class="card" style="width:${w}px" onclick="App.go('collection',{id:'${c.id}'})"><div class="thumb" style="height:${w}px">${artOf(c.art)}</div>
   <div style="padding:10px 12px 12px"><div class="ttl">${c.name}</div><div class="sm row" style="gap:4px;margin:2px 0 6px">by ${cr.name} ${cr.verified ? verified(12) : ''}</div>
   <div class="row sp"><span class="price">${inr(c.price)}</span><span class="sm">${c.supply - c.minted} left</span></div></div></div>`;
}
const avatar = (cr, s = 40) => `<div style="width:${s}px;height:${s}px;border-radius:${s / 2}px;background:var(--card);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font:800 ${s * .38}px Poppins;color:var(--navy);letter-spacing:-1px;flex:none">${cr.mono}</div>`;
const topbar = (title, right = '', opts = {}) => `<div class="topbar ${opts.clear ? 'clear' : ''}"><button class="iconbtn ${opts.clear ? 'glass' : ''}" onclick="App.back()">${ic('back', 24, opts.clear ? '#fff' : 'currentColor')}</button>${title ? `<div class="h2 grow" style="font-size:20px">${title}</div>` : '<div class="grow"></div>'}${right}</div>`;
const userAvatar = (s = 88) => `<div style="width:${s}px;height:${s}px;border-radius:${s / 2}px;overflow:hidden;border:3px solid #fff;box-shadow:0 4px 12px #0002;flex:none">${ART.avatarMan()}</div>`;

// ---------- splash ----------
function splashHTML() {
  return `<div id="sp" style="position:absolute;inset:0;display:flex;flex-direction:column;background:var(--bg)">
  <div style="flex:1.1"></div>
  <div style="display:flex;justify-content:center"><svg style="width:68%;max-width:300px" viewBox="0 0 240 120" overflow="visible">
   <g id="lNFT"><text x="0" y="52" font-family="Poppins" font-weight="800" font-size="56" fill="#13213C" letter-spacing="-1">NFT</text></g>
   <g id="flag" transform="translate(136 8)"><path id="f1" fill="#F28C28"/><path id="f2" fill="#fff" stroke="#e6dccb" stroke-width=".8"/><path id="f3" fill="#12804A"/><circle id="chak" r="3.6" fill="none" stroke="#13213C" stroke-width="1.4"/></g>
   <g id="lIND"><text x="0" y="112" font-family="Poppins" font-weight="800" font-size="56" fill="#13213C" letter-spacing="-1">INDIA</text></g></svg></div>
  <div style="text-align:center;font:400 20px/1.4 Inter;color:var(--ink2);margin-top:18px"><div id="t1">Digital Collectibles.</div><div id="t2">Made for India.</div></div>
  <div style="flex:1"></div>
  <div style="height:44vh;min-height:300px"><svg width="100%" height="100%" viewBox="0 0 200 180" preserveAspectRatio="xMidYMax slice">
   <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF8F2"/><stop id="sk1" offset=".55" stop-color="#fde3c3"/><stop id="sk2" offset="1" stop-color="#f6b884"/></linearGradient>
   <radialGradient id="sunG"><stop offset="0" stop-color="#fff6d6"/><stop offset=".35" stop-color="#ffd27a"/><stop offset="1" stop-color="#ffb44a" stop-opacity="0"/></radialGradient>
   <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF8F2"/><stop offset=".25" stop-color="#FBF8F2" stop-opacity="0"/></linearGradient></defs>
   <rect x="-100" width="400" height="180" fill="url(#sky)"/>
   <circle id="glow" cx="100" r="60" fill="url(#sunG)"/><circle id="sun" cx="100" r="14" fill="#ffe9a8"/>
   <g id="cloudsA" fill="#f3a983" opacity="0"><ellipse cx="30" cy="50" rx="30" ry="4"/><ellipse cx="150" cy="40" rx="36" ry="5"/></g>
   <g id="cloudsB" fill="#fff" opacity="0"><ellipse cx="70" cy="66" rx="24" ry="3"/><ellipse cx="180" cy="72" rx="20" ry="2.5"/></g>
   <g id="birds" fill="none" stroke="#c8603e" stroke-width="1.1" stroke-linecap="round">${[0, 1, 2, 3, 4].map(i => `<path id="b${i}"/>`).join('')}</g>
   <g id="bg" fill="#a37a6c" opacity="0"><g id="mL"><rect x="10" y="118" width="12" height="46"/><path d="M8 118h16l-8-14z"/><rect x="30" y="138" width="20" height="26"/><path d="M30 138q10-16 20 0z"/></g>
   <g id="mR"><rect x="176" y="114" width="12" height="50"/><path d="M174 114h16l-8-14z"/><rect x="150" y="138" width="20" height="26"/><path d="M150 138q10-16 20 0z"/></g></g>
   <g id="gate">${gateSVG()}</g><g id="trees">${treesSVG()}</g>
   <rect x="-100" y="162" width="400" height="18" fill="#4c5a3a"/>
   <path d="M92 180 L97.5 162 H102.5 L108 180Z" fill="#d8b38a"/><path id="beam" d="M97.5 162 L102.5 162 L130 180 L70 180Z" fill="#ffe3a0" opacity="0"/>
   <rect x="-100" width="400" height="180" fill="url(#fade)"/></svg></div>
  <div id="foot" style="text-align:center;font:400 14px Inter;color:#6b7280;background:#4c5a3a00;padding:14px 0 10px;margin-top:-1px">Art &nbsp;•&nbsp; Culture &nbsp;•&nbsp; Creators &nbsp;•&nbsp; Community</div>
  <div style="margin:4px auto 28px;width:64px;height:5px;border-radius:3px;background:#e2ddd3;overflow:hidden" id="bar"><div id="fill" style="height:5px;border-radius:3px;background:#12804A;width:0"></div></div></div>`;
}
function gateSVG() {
  const x = 100, base = 164, w = 60, h = 84, L = x - w / 2, top = base - h, aw = w * .35, ah = h * .6, F = '#b46a3f', D = '#874624', Li = '#d88a57';
  return `<rect x="${L - 4}" y="${base - 4}" width="${w + 8}" height="5" fill="${D}"/>
  <path d="M${L} ${base} V${top + h * .2} H${L + w} V${base} H${x + aw / 2} V${base - ah + aw / 2} A${aw / 2} ${aw / 2} 0 0 0 ${x - aw / 2} ${base - ah + aw / 2} V${base} Z" fill="${F}"/>
  <rect x="${L}" y="${top + h * .2}" width="${w * .1}" height="${h * .8}" fill="${Li}" opacity=".45"/><rect x="${L + w * .9}" y="${top + h * .2}" width="${w * .1}" height="${h * .8}" fill="${D}" opacity=".55"/>
  <rect x="${L - w * .04}" y="${top + h * .14}" width="${w * 1.08}" height="${h * .07}" fill="${D}"/><rect x="${L + w * .04}" y="${top + h * .05}" width="${w * .92}" height="${h * .09}" fill="${F}"/>
  <rect x="${L + w * .14}" y="${top}" width="${w * .72}" height="${h * .06}" fill="${D}"/><path d="M${x - w * .22} ${top} q${w * .22} -${h * .14} ${w * .44} 0z" fill="${F}"/>
  <rect x="${L + w * .12}" y="${top + h * .26}" width="${w * .76}" height="${h * .05}" fill="${D}" opacity=".5"/>
  <text x="${x}" y="${top + h * .3}" text-anchor="middle" font-size="3" font-family="Poppins" font-weight="700" fill="#6a3418" opacity=".7" letter-spacing=".6">INDIA</text>
  <path d="M${x - aw / 2} ${base} V${base - ah + aw / 2} A${aw / 2} ${aw / 2} 0 0 1 ${x + aw / 2} ${base - ah + aw / 2} V${base}" fill="none" stroke="${D}" stroke-width="1.5"/>
  <g id="flame" transform="translate(100 162)" opacity="0"><path id="fl" fill="#ff9a2e"/><path id="fl2" fill="#ffe08a"/></g>`;
}
function treesSVG() {
  let t = ''; for (let i = -60; i < 260; i += 12) { if (i > 66 && i < 134) continue; const h2 = 12 + ((Math.abs(i) * 7 + 40) % 11); t += `<ellipse class="tr" data-x="${i}" data-h="${h2}" cx="${i}" cy="164" rx="${8 + (Math.abs(i) % 4)}" ry="0" fill="${i % 24 ? '#3f5534' : '#4d6a3e'}"/>`; }
  return t + `<ellipse class="tr" data-x="74" data-h="9" cx="74" cy="164" rx="6" ry="0" fill="#4d6a3e"/><ellipse class="tr" data-x="126" data-h="9" cx="126" cy="164" rx="6" ry="0" fill="#4d6a3e"/>`;
}
function runSplash(done) {
  const g = id => document.getElementById(id);
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), ease = x => 1 - Math.pow(1 - clamp(x), 3);
  const bk = x => { x = clamp(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const pr = (t, a, b) => clamp((t - a) / (b - a)), lerp = (a, b, k) => a + (b - a) * k;
  const mix = (c1, c2, k) => { const p = c => [1, 3, 5].map(i => parseInt(c.substr(i, 2), 16)); const A = p(c1), B = p(c2); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };
  const birds = [[-20, 52, 1, 0], [-45, 38, .8, .7], [-70, 60, .9, 1.4], [-30, 28, .7, 2.1], [-90, 46, .75, .4]];
  const trees = [...document.querySelectorAll('.tr')];
  const wave = (y0, t, a) => { const p = x => y0 + Math.sin(x / 68 * Math.PI * 2 - t * 6) * a * (.25 + x / 68); let s = `M0 ${p(0)}`, b = ''; for (let x = 4; x <= 68; x += 4) s += ` L${x} ${p(x)}`; for (let x = 68; x >= 0; x -= 4) b += ` L${x} ${p(x) + 10}`; return s + b + 'Z'; };
  const st = performance.now(); let finished = false;
  const frame = () => {
    if (!g('sp')) return;
    const t = (performance.now() - st) / 1000, k = ease(pr(t, 0, 2.4));
    g('sk1').setAttribute('stop-color', mix('#f6ead8', '#fde3c3', k)); g('sk2').setAttribute('stop-color', mix('#d9c3b0', '#f6b884', k));
    const sy = lerp(176, 128, ease(pr(t, .1, 2.6))); g('sun').setAttribute('cy', sy); g('glow').setAttribute('cy', sy);
    g('glow').setAttribute('r', lerp(30, 70, ease(pr(t, .3, 2.8))) + Math.sin(t * 2.2) * 2);
    g('beam').setAttribute('opacity', .5 * ease(pr(t, 1.6, 2.8)) * (.85 + .15 * Math.sin(t * 3)));
    g('cloudsA').setAttribute('transform', `translate(${t * 3} 0)`); g('cloudsB').setAttribute('transform', `translate(${-t * 5} 0)`);
    g('cloudsA').setAttribute('opacity', .45 * ease(pr(t, .2, 1.4))); g('cloudsB').setAttribute('opacity', .6 * ease(pr(t, .4, 1.6)));
    const mk = ease(pr(t, .3, 1.5)); g('mL').setAttribute('transform', `translate(0 ${lerp(30, 0, mk)})`); g('mR').setAttribute('transform', `translate(0 ${lerp(30, 0, mk)})`); g('bg').setAttribute('opacity', .55 * mk);
    g('gate').setAttribute('transform', `translate(0 ${lerp(70, 0, bk(pr(t, .4, 1.7)))})`); g('gate').setAttribute('opacity', ease(pr(t, .4, 1)));
    const f = 1 + Math.sin(t * 17) * .15 + Math.sin(t * 29) * .08;
    g('fl').setAttribute('d', `M-2 0 Q-2.5 ${-3 * f} 0 ${-5.5 * f} Q2.5 ${-3 * f} 2 0Z`); g('fl2').setAttribute('d', `M-1 0 Q-1.2 ${-1.8 * f} 0 ${-3 * f} Q1.2 ${-1.8 * f} 1 0Z`); g('flame').setAttribute('opacity', ease(pr(t, 1.6, 2.2)));
    trees.forEach(e => { const x = +e.dataset.x, h = +e.dataset.h, d = .7 + Math.min(Math.abs(x - 100), 160) / 100 * .6, s = bk(pr(t, d, d + .7)); e.setAttribute('cy', 164 - h / 2 * s); e.setAttribute('ry', h / 1.3 * s); e.setAttribute('cx', x + Math.sin(t * 1.5 + x) * .4 * s); });
    birds.forEach(([x0, y0, sc, ph], i) => { const bt = Math.max(0, t - ph * .4), x = x0 + bt * 30, y = y0 + Math.sin(bt * 1.3 + i) * 3, fl = Math.sin(bt * 12 + i) * 2.6 * sc; const b = g('b' + i); b.setAttribute('d', `M${x - 4 * sc} ${y - fl} Q${x - 2 * sc} ${y - 1} ${x} ${y} Q${x + 2 * sc} ${y - 1} ${x + 4 * sc} ${y - fl}`); b.setAttribute('opacity', ease(pr(t, .6 + ph * .3, 1.4 + ph * .3))); });
    const n = ease(pr(t, .9, 1.6)), d2 = ease(pr(t, 1.1, 1.8));
    g('lNFT').setAttribute('transform', `translate(0 ${lerp(-24, 0, n)})`); g('lNFT').setAttribute('opacity', n);
    g('lIND').setAttribute('transform', `translate(0 ${lerp(24, 0, d2)})`); g('lIND').setAttribute('opacity', d2);
    const fk = bk(pr(t, 1.5, 2.2)); g('flag').setAttribute('transform', `translate(${136 + 34 * (1 - fk)} ${8 + 20 * (1 - fk)}) scale(${Math.max(fk, .001)})`); g('flag').setAttribute('opacity', clamp(fk));
    g('f1').setAttribute('d', wave(0, t, 2.2)); g('f2').setAttribute('d', wave(12, t, 2.2)); g('f3').setAttribute('d', wave(24, t, 2.2));
    g('chak').setAttribute('cx', 34); g('chak').setAttribute('cy', 22 + Math.sin(Math.PI - t * 6) * 2.2 * .75);
    [['t1', 1.9], ['t2', 2.15]].forEach(([id, s]) => { const kk = ease(pr(t, s, s + .6)); g(id).style.opacity = kk; g(id).style.transform = `translateY(${lerp(14, 0, kk)}px)`; });
    const fo = ease(pr(t, 2.5, 3.1)); g('foot').style.opacity = fo;
    g('bar').style.opacity = ease(pr(t, .2, .6)); g('fill').style.width = 64 * ease(pr(t, .3, 3.9)) + 'px';
    if (t > 4.1 && !finished) { finished = true; done(); return; }
    timers.push({ r: requestAnimationFrame(frame) });
  };
  timers.push({ r: requestAnimationFrame(frame) });
}

// ---------- screens ----------
const SCREENS = {};

SCREENS.splash = () => ({
  splash: true, bg: '#FBF8F2',
  html: `<div class="lightzone">${splashHTML()}</div>`,
  after: () => runSplash(() => {
    if (!S.onboarded) go('onboard', {}, { reset: true });
    else if (!S.user) go('login', {}, { reset: true });
    else go('home', {}, { reset: true });
  }),
});

const SLIDES = [
  { t: 'Collect<br>what you love', d: 'Discover, buy and own unique digital collectibles from Indian creators and global artists.', arts: [['dancer', -30, 110, 120, 170, -12, 1], ['portrait', 18, 36, 140, 210, -10, 3], ['cricket', 152, 8, 150, 190, 8, 2], ['temple', 176, 128, 150, 170, 12, 4]] },
  { t: 'Pay in ₹<br>with UPI', d: 'Prices in rupees. Checkout with GPay, PhonePe, Paytm or any UPI app — no crypto needed.', upi: true },
  { t: 'Truly yours,<br>verified', d: 'Every collectible is backed by the blockchain. We set up and secure your collection — zero wallet setup.', own: true },
];
// All onboarding visuals sit on a fixed 340×330 stage that is centred and scaled to the screen width.
const STAGE_W = 340, STAGE_H = 330;
SCREENS.onboard = ({ i = 0 }) => {
  const s = SLIDES[i];
  const sc = Math.min(1.15, Math.max(.7, (Math.min(window.innerWidth, 520) - 24) / STAGE_W));
  let vis = '';
  if (s.arts) vis = s.arts.map(([n, x, y, w, h, r, z]) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${r}deg);z-index:${z}"><div style="width:100%;height:100%;border-radius:14px;overflow:hidden;border:4px solid #fff;box-shadow:0 14px 30px #0003;animation:pop .5s ${z * .08}s both">${ART[n]()}</div></div>`).join('');
  if (s.upi) vis = `<div class="box" style="position:absolute;left:30px;top:0;width:280px;animation:pop .45s both;box-shadow:0 14px 34px var(--shadow)">
     <div class="row gap12"><div style="width:56px;height:56px;border-radius:12px;overflow:hidden;flex:none">${ART.gate()}</div><div class="grow"><div class="ttl">Bharat Forever #0123</div><div class="sm">by ArtVerse ${verified(11)}</div></div></div>
     <div class="divider" style="margin:14px 0"></div><div class="row sp"><span class="h3">Total</span><span class="h2">₹799</span></div>
     <div class="row gap8" style="margin-top:14px">${['UPI', 'GPay', 'PhonePe', 'Paytm'].map((u, k) => `<span class="chip ${k == 0 ? 'on' : ''}" style="font-size:12px;padding:6px 10px">${u}</span>`).join('')}</div>
     <div class="btn" style="margin-top:14px;height:46px;font-size:15px;line-height:1">Pay ₹799</div></div>
     <div style="position:absolute;left:138px;top:258px;width:64px;height:64px"><div style="width:64px;height:64px;border-radius:32px;background:var(--green);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 9px #12804a22;animation:pop .5s .35s both">${ic('check', 34, '#fff', 3)}</div></div>`;
  if (s.own) vis = `<div style="position:absolute;left:65px;top:14px;width:210px;height:270px;border-radius:20px;overflow:hidden;border:5px solid #fff;box-shadow:0 18px 40px #0003;animation:pop .5s both">${ART.temple()}<span class="badge green" style="position:absolute;left:10px;top:10px;background:#fff;color:#12804A">${ic('shield', 13, '#12804A', 2.2)} Verified</span></div>
     <div style="position:absolute;left:0;top:222px"><div class="box row gap8" style="padding:10px 12px;animation:pop .5s .25s both;box-shadow:0 8px 20px var(--shadow)">${ic('chain', 18, '#12804A', 2)}<div><div style="font:600 12px Inter">On-chain proof</div><div class="sm" style="font-size:11px">Token #1203</div></div></div></div>
     <div style="position:absolute;right:0;top:66px"><div class="box row gap8" style="padding:10px 12px;animation:pop .5s .4s both;box-shadow:0 8px 20px var(--shadow)">${ic('wallet', 18, '#F28C28', 2)}<div><div style="font:600 12px Inter">Managed wallet</div><div class="sm" style="font-size:11px">No setup needed</div></div></div></div>`;
  vis = `<div style="position:absolute;left:50%;top:0;width:${STAGE_W}px;height:${STAGE_H}px;margin-left:${-STAGE_W / 2}px;transform:scale(${sc.toFixed(3)});transform-origin:50% 0">${vis}</div>`;
  const next = i < 2 ? `App.go('onboard',{i:${i + 1}},{replace:true})` : `App.finishOnboard()`;
  return {
    html: `<div style="display:flex;flex-direction:column;min-height:100%">
     <div class="row" style="justify-content:flex-end;padding:14px 20px;height:56px">${i < 2 ? `<button style="font:500 15px Inter;color:var(--ink2);padding:8px" onclick="App.finishOnboard()">Skip</button>` : ''}</div>
     <div style="padding:22px 24px 0"><div style="font:700 38px/1.12 Poppins;color:var(--navy);letter-spacing:-1px">${s.t}</div><div style="font:400 16px/1.5 Inter;color:var(--ink2);margin-top:14px">${s.d}</div></div>
     <div style="position:relative;flex:1;min-height:${Math.round(STAGE_H * sc) + 10}px;margin-top:26px;overflow:hidden">${vis}</div>
     <div class="row sp" style="padding:10px 28px 34px"><div class="row gap8">${[0, 1, 2].map(k => `<i style="width:${k == i ? 22 : 8}px;height:8px;border-radius:4px;background:${k == i ? 'var(--green)' : 'var(--line)'};transition:.3s"></i>`).join('')}</div>
     <button style="width:60px;height:60px;border-radius:30px;background:var(--green);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px #12804a44" onclick="${next}">${ic('arrow', 24, '#fff', 2.2)}</button></div></div>`,
  };
};

SCREENS.login = () => ({
  html: `<div style="padding:70px 24px 0">${logoInline(22)}
   <div class="h1" style="font-size:30px;margin-top:40px;line-height:1.15">Enter your<br>mobile number</div>
   <div class="body" style="margin-top:10px">We'll send a one-time password to verify it. No wallet, no seed phrase.</div>
   <div class="field" style="margin-top:28px"><span style="font:600 17px Inter;color:var(--navy);white-space:nowrap">🇮🇳 +91</span><span style="width:1px;height:26px;background:var(--line)"></span>
   <input id="ph" type="tel" inputmode="numeric" maxlength="10" placeholder="98765 43210" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,10);document.getElementById('cont').disabled=this.value.length!==10"></div>
   <div class="sm" style="margin-top:14px;line-height:1.5">By continuing you agree to our <span class="link">Terms</span> & <span class="link">Privacy Policy</span>.</div></div>`,
  cta: `<button class="btn" id="cont" disabled onclick="App.sendOtp()">Get OTP</button>`,
  after: () => setTimeout(() => { const p = $('#ph'); p && p.focus(); }, 350),
});

SCREENS.otp = ({ phone }) => ({
  html: `${topbar('')}<div style="padding:10px 24px 0">
   <div class="h1" style="font-size:30px;line-height:1.15">Verify OTP</div>
   <div class="body" style="margin-top:10px">Enter the 6-digit code sent to <b style="color:var(--navy)">+91 ${phone.slice(0, 5)} ${phone.slice(5)}</b></div>
   <div style="position:relative;margin-top:28px"><div class="otp" id="otpb">${[0, 1, 2, 3, 4, 5].map(k => `<div class="${k == 0 ? 'on' : ''}"></div>`).join('')}</div>
   <input id="otpi" type="tel" inputmode="numeric" autocomplete="one-time-code" maxlength="6" style="position:absolute;inset:0;opacity:0;width:100%" oninput="App.otpInput(this)"></div>
   <div class="row sp" style="margin-top:18px"><span class="sm" id="rs">Resend code in 0:30</span><span class="badge saff">Demo code: 123456</span></div>
   <button class="link" style="margin-top:22px;font-size:14px" onclick="App.autofillOtp()">Auto-fill demo OTP</button></div>`,
  cta: `<button class="btn" id="vbtn" disabled onclick="App.verifyOtp()">Verify & Continue</button>`,
  after: () => {
    setTimeout(() => { const p = $('#otpi'); p && p.focus(); }, 350);
    let s = 30; timers.push(setInterval(() => { s--; const r = $('#rs'); if (!r) return; r.innerHTML = s > 0 ? `Resend code in 0:${String(s).padStart(2, '0')}` : `<span class="link" onclick="App.toast('OTP resent (demo: 123456)')">Resend OTP</span>`; }, 1000));
  },
});

let setupDraft = { name: '', interests: [] };
SCREENS.setup = () => ({
  html: `<div style="padding:60px 24px 0">
   <div class="h1" style="font-size:30px;line-height:1.15">Set up your<br>profile</div>
   <div class="body" style="margin-top:10px">Tell us a little about you so we can recommend collections you'll love.</div>
   <div class="sm" style="margin:26px 0 8px;font-weight:600;color:var(--ink)">Your name</div>
   <div class="field"><input id="nm" placeholder="e.g. Rahul Sharma" value="${esc(setupDraft.name)}" oninput="App.setName(this.value)"></div>
   <div class="sm" style="margin:24px 0 10px;font-weight:600;color:var(--ink)">What do you like to collect?</div>
   <div class="row" style="flex-wrap:wrap;gap:10px" id="ints">${intChips()}</div></div>`,
  cta: `<button class="btn" id="sbtn" ${setupDraft.name.trim() ? '' : 'disabled'} onclick="App.finishSetup()">Start collecting</button>`,
});
const intChips = () => CATS.map(([i, l, c, b]) => { const on = setupDraft.interests.includes(l); return `<button class="row gap8" style="padding:10px 14px;border-radius:14px;border:1.5px solid ${on ? 'var(--green)' : 'var(--line)'};background:${on ? 'var(--green-l)' : '#fff'};font:600 14px Inter;color:${on ? 'var(--green)' : 'var(--ink)'}" onclick="App.toggleInt('${l}')">${ic(i, 20, c, 1.9)}${l}${on ? ic('check', 16, '#12804A', 2.6) : ''}</button>`; }).join('');

SCREENS.home = () => {
  const recs = ITEMS.filter(i => i.idx < 2 && (!S.user || !S.user.interests || !S.user.interests.length || S.user.interests.includes(getCol(i.col).cat))).slice(0, 6);
  const recItems = recs.length >= 4 ? recs : ITEMS.filter(i => i.idx === 1).slice(0, 6);
  const first = S.user && S.user.name ? S.user.name.split(' ')[0] : '';
  return {
    nav: 'home',
    html: `<div class="row sp pad" style="padding-top:14px;padding-bottom:4px"><div class="row gap8"><button class="iconbtn" style="margin-left:-10px" onclick="App.drawer()">${ic('menu', 24)}</button>${logoInline(22)}</div>
      <button class="iconbtn" onclick="App.go('notifications')">${ic('bell', 24)}${unread() ? `<span class="dot">${unread()}</span>` : ''}</button></div>
     ${first ? `<div class="pad sm" style="font-size:14px;margin-top:2px">Namaste, <b style="color:var(--navy)">${esc(first)}</b> 👋</div>` : ''}
     <div class="pad" style="margin-top:14px"><div class="search" onclick="App.go('search')">${ic('search', 20, '#12804A', 2)}Search collections, creators, art...</div></div>
     <div class="row sp pad" style="margin-top:20px">${CATS.map(([i, l, c, b]) => `<div style="text-align:center" onclick="App.goExplore('${l}')"><div style="width:56px;height:56px;border-radius:16px;background:${b};display:flex;align-items:center;justify-content:center">${ic(i, 26, c, 1.9)}</div><div style="font:500 12px Inter;margin-top:7px">${l}</div></div>`).join('')}</div>
     <div class="pad" style="margin-top:22px"><div style="height:176px;border-radius:20px;overflow:hidden;position:relative;background:linear-gradient(110deg,#0d5a36 0 45%,#12804A)" onclick="App.go('collection',{id:'spirit'})">
       <div style="position:absolute;right:-10px;top:0;width:58%;height:176px;-webkit-mask:linear-gradient(90deg,transparent,#000 30%);mask:linear-gradient(90deg,transparent,#000 30%)">${ART.portrait()}</div>
       <div style="position:absolute;left:18px;top:20px;color:#fff;width:58%"><div style="font:700 21px/1.15 Poppins">Indian Creators<br>Global Stage</div><div style="font:400 12px/1.4 Inter;opacity:.85;margin:8px 0 14px">Explore exclusive drops from India's top talent.</div><span style="background:var(--card);color:var(--green);font:600 12px Inter;padding:8px 14px;border-radius:20px">Explore Now</span></div></div></div>
     <div class="sec"><div class="sechead"><span class="h2">Trending Collections</span><span class="link" onclick="App.tab('explore')">See All</span></div>
      <div class="hscroll">${COLLECTIONS.slice(0, 6).map(c => colCard(c, 160)).join('')}</div></div>
     <div class="sec"><div class="sechead"><span class="h2">New Drops</span><span class="link" onclick="App.tab('drops')">See All</span></div>
      <div class="hscroll">${DROPS.map(d => dropCard(d, 280)).join('')}</div></div>
     <div class="sec"><div class="sechead"><span class="h2">Recommended for you</span></div>
      <div class="pad grid2">${recItems.map(i => itemCard(i, 150)).join('')}</div></div>
     <div class="pad" style="margin-top:24px"><div class="box row gap12" style="background:var(--saff-l);border-color:var(--saff-b)">${ic('shield', 26, '#F28C28', 2)}<div class="grow"><div style="font:600 14px Inter">Every creator is verified</div><div class="sm" style="margin-top:2px;line-height:1.4">Look for ${verified(12)} — collections are reviewed for authenticity before listing.</div></div></div></div>`,
    after: startCountdowns,
  };
};
function dropEnd(d) { return Math.floor(Date.now() / 3600e3) * 3600e3 + d.inHours * 3600e3; }
function dropCard(d, w) {
  const c = getCol(d.col), on = S.reminders.includes(d.col);
  return `<div class="card" style="width:${w}px" onclick="App.go('collection',{id:'${c.id}'})"><div class="thumb" style="height:140px">${artOf(c.art, 12)}<span class="badge dark" style="position:absolute;left:10px;top:10px">${ic('clock', 12, '#fff', 2.2)}<span class="cd" data-end="${dropEnd(d)}">--</span></span></div>
   <div class="row gap12" style="padding:12px"><div class="grow"><div class="ttl">${d.title}</div><div class="sm" style="margin-top:2px">${inr(c.price)} · ${CREATORS[c.creator].name}</div></div>
   <button class="btn sm ${on ? 'ghost' : ''}" style="height:34px;padding:0 12px;font-size:13px" onclick="event.stopPropagation();App.remind('${d.col}')">${on ? ic('check', 15, '#12804A', 2.6) + 'Set' : ic('bell', 15, '#fff', 2) + 'Remind'}</button></div></div>`;
}
function startCountdowns() {
  const tick = () => document.querySelectorAll('.cd').forEach(e => { let s = Math.max(0, (+e.dataset.end - Date.now()) / 1000 | 0); const h = s / 3600 | 0, m = (s % 3600) / 60 | 0, ss = s % 60; e.textContent = h >= 24 ? `${h / 24 | 0}d ${h % 24}h ${m}m` : `${h}h ${String(m).padStart(2, '0')}m ${String(ss).padStart(2, '0')}s`; });
  tick(); timers.push(setInterval(tick, 1000));
}

let exploreState = { cat: 'All', sort: 'trending', view: 'items' };
SCREENS.explore = () => {
  let list = ITEMS.filter(i => exploreState.cat === 'All' || getCol(i.col).cat === exploreState.cat);
  if (exploreState.sort === 'low') list = list.slice().sort((a, b) => a.price - b.price);
  else if (exploreState.sort === 'high') list = list.slice().sort((a, b) => b.price - a.price);
  else list = list.slice().sort((a, b) => a.idx - b.idx || a.col.localeCompare(b.col));
  const cols = COLLECTIONS.filter(c => exploreState.cat === 'All' || c.cat === exploreState.cat);
  const sortL = { trending: 'Trending', low: 'Price: Low to High', high: 'Price: High to Low' }[exploreState.sort];
  return {
    nav: 'explore',
    html: `<div class="pad" style="padding-top:18px"><div class="h1" style="font-size:28px">Explore</div></div>
     <div class="pad" style="margin-top:14px"><div class="search" onclick="App.go('search')">${ic('search', 20, '#12804A', 2)}Search collections, creators...</div></div>
     <div class="chips" style="margin-top:16px">${['All', ...CATS.map(c => c[1])].map(c => `<span class="chip ${exploreState.cat === c ? 'on' : ''}" onclick="App.setExplore('cat','${c}')">${c}</span>`).join('')}</div>
     <div class="row sp pad" style="margin-top:16px"><div class="tabs" style="width:190px;padding:3px"><div class="${exploreState.view === 'items' ? 'on' : ''}" style="padding:6px" onclick="App.setExplore('view','items')">Items</div><div class="${exploreState.view === 'cols' ? 'on' : ''}" style="padding:6px" onclick="App.setExplore('view','cols')">Collections</div></div>
      <button class="row gap8" style="font:600 13px Inter;color:var(--ink)" onclick="App.sortSheet()">${ic('filter', 18)}${sortL}</button></div>
     <div class="pad grid2" style="margin-top:14px">${exploreState.view === 'items' ? list.map(i => itemCard(i, 150)).join('') : cols.map(c => `<div>${colCard(c, '100%').replace('width:100%px', 'width:100%').replace('height:100%px', 'height:150px')}</div>`).join('')}</div>
     ${!list.length ? '<div class="empty">No items in this category yet.</div>' : ''}`,
  };
};

let searchState = { q: '', tab: 'All' };
SCREENS.search = () => ({
  html: `<div class="row pad gap8" style="padding-top:12px;padding-left:10px"><button class="iconbtn" onclick="App.back()">${ic('back', 24)}</button>
   <div class="search grow" style="color:var(--ink)">${ic('search', 20, 'currentColor', 2)}<input id="sq" placeholder="Search NFT India" value="${esc(searchState.q)}" oninput="App.searchInput(this.value)">
   <span id="sclr" style="width:20px;height:20px;border-radius:10px;background:#9ca0a8;display:${searchState.q ? 'flex' : 'none'};align-items:center;justify-content:center" onclick="App.searchInput('');document.getElementById('sq').value='';document.getElementById('sq').focus()">${ic('close', 12, '#fff', 3)}</span></div></div>
   <div class="chips" style="margin-top:14px" id="stabs">${searchTabs()}</div>
   <div class="pad" id="sres" style="margin-top:6px">${searchResults()}</div>`,
  after: () => setTimeout(() => { const i = $('#sq'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 320),
});
const searchTabs = () => ['All', 'Collections', 'Creators', 'Items'].map(t => `<span class="chip ${searchState.tab === t ? 'on' : ''}" onclick="App.searchTab('${t}')">${t}</span>`).join('');
function searchResults() {
  const q = searchState.q.trim().toLowerCase(), t = searchState.tab;
  if (!q) return `<div class="sm" style="margin:14px 0 10px;font-weight:600;color:var(--ink)">Popular searches</div><div class="row" style="flex-wrap:wrap;gap:8px">${['india', 'cricket', 'temple', 'rajasthan', 'mumbai', 'dance'].map(s => `<span class="tag" onclick="App.searchInput('${s}');document.getElementById('sq').value='${s}'">${ic('search', 12, '#6b7280', 2)} ${s}</span>`).join('')}</div>
    <div class="sm" style="margin:24px 0 4px;font-weight:600;color:var(--ink)">Top collections</div>${COLLECTIONS.slice(0, 4).map(colRow).join('')}`;
  const cols = COLLECTIONS.filter(c => (c.name + ' ' + c.desc + ' ' + c.cat + ' ' + c.tags.join(' ')).toLowerCase().includes(q));
  const crs = Object.values(CREATORS).filter(c => (c.name + c.bio).toLowerCase().includes(q));
  const its = ITEMS.filter(i => i.name.toLowerCase().includes(q) || getCol(i.col).desc.toLowerCase().includes(q)).slice(0, 12);
  let h = '';
  if (t === 'All' || t === 'Collections') h += cols.map(colRow).join('');
  if (t === 'All' || t === 'Creators') h += crs.map(c => `<div class="row gap12" style="padding:12px 0;border-bottom:1px solid var(--line)" onclick="App.go('creator',{id:'${c.id}'})">${avatar(c, 56)}<div class="grow"><div class="ttl row" style="gap:5px;font-size:15px">${c.name} ${c.verified ? verified(14) : ''}</div><div class="sm" style="font-size:13px;margin-top:3px">Creator · ${c.followers} followers</div></div>${ic('chev', 18, '#6b7280')}</div>`).join('');
  if (t === 'All' || t === 'Items') h += its.map(i => `<div class="row gap12" style="padding:12px 0;border-bottom:1px solid var(--line)" onclick="App.go('nft',{id:'${i.id}'})"><div class="thumb" style="width:56px;height:56px;border-radius:12px;flex:none">${itemArt(i)}</div><div class="grow"><div class="ttl" style="font-size:15px">${i.name}</div><div class="sm" style="font-size:13px;margin-top:3px">Item · ${inr(i.price)}</div></div>${ic('chev', 18, '#6b7280')}</div>`).join('');
  return h || `<div class="empty">${ic('search', 40, 'var(--mut)', 1.6)}<div class="h3">No results for “${esc(searchState.q)}”</div><div>Try “india”, “cricket” or “temple”.</div></div>`;
}
const colRow = c => `<div class="row gap12" style="padding:12px 0;border-bottom:1px solid var(--line)" onclick="App.go('collection',{id:'${c.id}'})"><div class="thumb" style="width:56px;height:56px;border-radius:12px;flex:none">${artOf(c.art)}</div><div class="grow"><div class="ttl" style="font-size:15px">${c.name}</div><div class="sm" style="font-size:13px;margin-top:3px">Collection · ${c.supply} items</div></div>${ic('chev', 18, '#6b7280')}</div>`;

SCREENS.collection = ({ id, tab = 'items' }) => {
  const c = getCol(id), cr = CREATORS[c.creator], its = colItems(id), pct = Math.round(c.minted / c.supply * 100);
  return {
    dark: true, bar: '#00000000',
    html: `<div style="position:relative;height:250px">${artOf(c.art)}<div style="position:absolute;inset:0;background:linear-gradient(#0007,#0000 40%,#0006)"></div>
      ${topbar('', `<button class="iconbtn glass" onclick="App.share('Check out ${c.name} on NFT INDIA — digital collectibles made for India. https://nftindia.app/c/${c.id}')">${ic('share', 20, '#fff')}</button>`, { clear: true })}
      <div style="position:absolute;left:20px;bottom:16px;right:20px;color:#fff"><span class="badge" style="background:#fff3;color:#fff">${c.cat}</span><div style="font:700 26px Poppins;margin-top:6px">${c.name}</div></div></div>
     <div class="pad" style="margin-top:16px"><div class="row gap12" onclick="App.go('creator',{id:'${cr.id}'})">${avatar(cr, 44)}<div class="grow"><div class="sm">Created by</div><div class="row" style="gap:5px;font:600 15px Inter">${cr.name} ${cr.verified ? verified(15) : ''}</div></div>${ic('chev', 18, '#6b7280')}</div>
      <div class="body" style="margin-top:14px">${c.desc}</div>
      <div class="box row" style="margin-top:16px;padding:14px 4px">${[[inr(c.price), 'Price'], [c.supply, 'Supply'], [c.owners, 'Owners'], [c.supply - c.minted, 'Available']].map(([v, l], k) => `<div style="flex:1;text-align:center;${k ? 'border-left:1px solid var(--line)' : ''}"><div style="font:700 16px Poppins;color:var(--navy)">${v}</div><div class="sm">${l}</div></div>`).join('')}</div>
      <div style="margin-top:14px"><div class="row sp sm"><span>${pct}% collected</span><span>${c.minted} / ${c.supply}</span></div><div style="height:6px;border-radius:3px;background:var(--line);margin-top:6px"><div style="height:6px;border-radius:3px;background:var(--green);width:${pct}%"></div></div></div>
      <div class="box row gap12" style="margin-top:14px;background:var(--green-l);border-color:var(--green-l)">${ic('gift', 22, '#12804A', 1.9)}<div class="grow"><div style="font:600 13px Inter;color:var(--green)">Holder benefit</div><div class="sm" style="color:var(--green-t);margin-top:2px">${c.utility}</div></div></div>
      <div class="tabs" style="margin-top:20px"><div class="${tab === 'items' ? 'on' : ''}" onclick="App.go('collection',{id:'${id}',tab:'items'},{replace:true,anim:'fade'})">Items</div><div class="${tab === 'about' ? 'on' : ''}" onclick="App.go('collection',{id:'${id}',tab:'about'},{replace:true,anim:'fade'})">About</div></div></div>
     ${tab === 'items' ? `<div class="pad grid2" style="margin-top:14px">${its.map(i => itemCard(i, 150)).join('')}</div>` :
      `<div class="pad" style="margin-top:14px"><div class="box">${[['Category', c.cat], ['Creator', cr.name + (cr.verified ? ' ✓' : '')], ['Blockchain', 'Polygon (demo)'], ['Token standard', 'ERC-721'], ['Contract', short(CONTRACT)], ['Royalty to creator', '5%'], ['Verification', 'Reviewed by NFT India']].map(([k, v]) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`).join('')}</div></div>`}`,
  };
};

SCREENS.creator = ({ id }) => {
  const cr = CREATORS[id], cols = COLLECTIONS.filter(c => c.creator === id), fol = S.following.includes(id);
  const its = ITEMS.filter(i => cols.some(c => c.id === i.col)).slice(0, 9);
  return {
    dark: true, bar: '#00000000',
    html: `<div style="position:relative;height:200px">${artOf(cr.banner)}<div style="position:absolute;inset:0;background:linear-gradient(#0006,#0000 50%)"></div>
      ${topbar('', `<button class="iconbtn glass" onclick="App.share('Follow ${cr.name} on NFT INDIA https://nftindia.app/u/${cr.id}')">${ic('share', 20, '#fff')}</button>`, { clear: true })}</div>
     <div class="pad"><div class="row sp" style="align-items:flex-end;margin-top:-48px;position:relative"><div style="width:96px;height:96px;border-radius:48px;background:var(--card);border:4px solid var(--bg);display:flex;align-items:center;justify-content:center;font:900 38px Poppins;color:#111;letter-spacing:-3px;box-shadow:0 4px 12px #0002">${cr.mono}</div>
      <button class="btn sm ${fol ? 'ghost' : ''}" style="margin-bottom:4px;width:116px" onclick="App.follow('${id}')">${fol ? 'Following' : 'Follow'}</button></div>
      <div class="row" style="gap:8px;margin-top:12px;font:700 22px Poppins;color:var(--navy)">${cr.name} ${cr.verified ? verified(19) : ''}</div>
      <div class="sm" style="font-size:13px">${cr.handle}</div>
      <div class="body" style="margin-top:8px">${cr.bio}</div>
      <div class="row" style="justify-content:space-around;margin:20px 0">${[[cols.length, 'Collections'], [cr.followers, 'Followers'], [cr.following, 'Following']].map(([n, l]) => `<div style="text-align:center"><div style="font:700 17px Poppins;color:var(--navy)">${n}</div><div class="sm">${l}</div></div>`).join('')}</div>
      <div class="h3" style="margin-bottom:10px">Collections</div>
      ${cols.map(colRow).join('')}
      <div class="h3" style="margin:22px 0 10px">Items</div>
      <div class="grid3">${its.map(i => `<div class="thumb card" style="height:112px;border-radius:12px" onclick="App.go('nft',{id:'${i.id}'})">${itemArt(i)}</div>`).join('')}</div></div>`,
  };
};

SCREENS.nft = ({ id }) => {
  const it = getItem(id), c = getCol(it.col), cr = CREATORS[c.creator], own = S.owned.find(o => o.itemId === id);
  const order = own && S.orders.find(o => o.id === own.orderId);
  const processing = order && order.status === 'processing';
  const sold = !own && S.sales.slice().reverse().find(x => x.itemId === id);
  return {
    html: `${topbar('', `<button class="iconbtn heart ${isLiked(id) ? 'on' : ''}" onclick="App.like('${id}',this)">${ic('heart', 24)}</button><button class="iconbtn" onclick="App.shareItem('${id}')">${ic('share', 22)}</button>`)}
     <div class="pad"><div class="thumb" style="aspect-ratio:1/1.02;border-radius:22px;box-shadow:0 10px 30px #0002" onclick="App.viewArt('${id}')">${itemArt(it)}
      ${own ? `<span class="badge ${processing ? 'saff' : 'green'}" style="position:absolute;left:12px;top:12px;background:var(--card)">${processing ? ic('clock', 13, 'var(--saff)', 2.2) + 'Processing' : ic('check', 13, '#12804A', 2.6) + 'You own this'}</span>` : ''}
      <span class="badge dark" style="position:absolute;right:12px;bottom:12px">${it.attrs.Rarity}</span></div></div>
     <div class="pad" style="margin-top:20px">
      <div style="font:700 25px Poppins;color:var(--navy);line-height:1.2">${it.name}</div>
      <div class="row" style="gap:8px;margin-top:10px;font:500 14px Inter" onclick="App.go('creator',{id:'${cr.id}'})">${avatar(cr, 28)}by ${cr.name} ${cr.verified ? verified(16) : ''}<span class="sm" style="margin-left:auto" onclick="event.stopPropagation();App.go('collection',{id:'${c.id}'})">${c.name} ›</span></div>
      <div class="body" style="margin-top:14px">${c.desc} Part of the ${c.name} collection.</div>
      <div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap">${c.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      ${own ? marketPanel(id, own, processing) : sold ? `<div class="box row gap12" style="margin-top:18px">${ic(sold.kind === 'gift' ? 'gift' : 'check', 22, '#12804A', 2)}<div class="grow"><div style="font:600 14px Inter">${sold.kind === 'gift' ? 'You gifted this to ' + esc(sold.who) : 'You sold this to ' + sold.who}</div><div class="sm" style="margin-top:2px">${sold.kind === 'gift' ? fmtDate(sold.t) : inr(sold.amount) + ' · you earned ' + inr(sold.net)}</div></div></div>` : `<div class="divider" style="margin:20px 0 16px"></div>
      <div class="row sp"><div><div style="font:700 32px Poppins;color:var(--navy);line-height:1.1">${inr(it.price)}</div><div class="sm" style="font-size:14px;margin-top:2px">(≈ ${usd(it.price)}) · No gas fees</div></div><div style="font:500 13px Inter;color:var(--ink2);align-self:flex-start;margin-top:10px">Only <b style="color:var(--saff)">${it.left}</b> left</div></div>`}
      <div class="h3" style="margin:24px 0 10px">Attributes</div>
      <div class="grid2" style="gap:10px">${Object.entries(it.attrs).map(([k, v]) => `<div class="attr"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}</div>
      <div class="box row gap12" style="margin-top:14px;background:var(--green-l);border-color:var(--green-l)">${ic('gift', 22, '#12804A', 1.9)}<div class="grow"><div style="font:600 13px Inter;color:var(--green)">Holder benefit</div><div class="sm" style="color:var(--green-t);margin-top:2px">${c.utility}</div></div></div>
      <div class="h3" style="margin:24px 0 10px">Ownership & provenance</div>
      <div class="box">
       <div class="kv"><span>Creator</span><b>${cr.name}${cr.verified ? ' ✓' : ''}</b></div>
       <div class="kv"><span>Owner</span><b>${own ? (S.user ? esc(S.user.name) : 'You') : sold ? esc(sold.who) : 'NFT India (unsold)'}</b></div>
       <div class="kv"><span>Edition</span><b>${it.attrs.Edition}</b></div>
       <div class="kv"><span>Verified collection</span><b style="color:var(--green)">Yes</b></div>
       <button class="row sp" style="width:100%;padding-top:12px;font:600 14px Inter;color:var(--green)" onclick="App.chainDetails('${id}')"><span class="row gap8">${ic('chain', 18, '#12804A', 2)}View blockchain details</span>${ic('chev', 18, '#12804A', 2)}</button></div>
      ${own && order ? `<div class="h3" style="margin:24px 0 10px">Activity</div><div class="box">${activity(order).map(([i, t, s]) => `<div class="row gap12" style="padding:8px 0">${ic(i, 20, '#12804A', 1.9)}<div class="grow"><div style="font:600 14px Inter">${t}</div><div class="sm">${s}</div></div></div>`).join('')}</div>` : ''}
     </div>`,
    cta: own ? `<div class="row gap12"><button class="btn2" onclick="App.shareItem('${id}')">${ic('share', 18)}Share</button><button class="btn" onclick="App.go('order',{id:'${own.orderId}'})">View order</button></div>` : sold ? `<button class="btn2" onclick="App.go('collection',{id:'${it.col}'})">More from ${c.name}</button>` : `<button class="btn" onclick="App.go('checkout',{id:'${id}'})">Buy Now · ${inr(it.price)}</button>`,
  };
};
const activity = o => [['bag', 'Purchased for ' + inr(o.amount), fmtDate(o.t) + ' · via ' + o.method], ...(o.status === 'completed' ? [['chain', 'Transferred to your collection', 'Tx ' + short(o.tx)]] : [['clock', 'Delivery in progress', 'Securing on blockchain']]), ['sparkle', 'Minted by ' + CREATORS[getCol(getItem(o.itemId).col).creator].name, 'Edition ' + getItem(o.itemId).attrs.Edition]];

const UPIS = [
  ['GPay', `<svg width="30" height="30" viewBox="0 0 30 30"><path d="M6 20 15 6l5 8z" fill="#4285F4"/><path d="M15 6l9 14-8 4z" fill="#EA4335"/><path d="M6 20l10 4 8-4-10-2z" fill="#34A853"/><path d="M10 14l6 4 4-4z" fill="#FBBC05"/></svg>`],
  ['PhonePe', `<div style="width:34px;height:34px;border-radius:17px;background:#5f259f;color:#fff;font:700 18px Poppins;display:flex;align-items:center;justify-content:center">पे</div>`],
  ['Paytm', `<span style="font:800 16px Poppins;color:#0b2a6f;letter-spacing:-.5px">pay<span style="color:#00baf2">tm</span></span>`],
  ['Other UPI', `<svg width="30" height="30" viewBox="0 0 30 30"><path d="M8 24 14 6l3 9-5 9z" fill="#F28C28"/><path d="M14 24l6-18 3 9-5 9z" fill="#12804A"/></svg>`]];
let payMethod = 'PhonePe';
SCREENS.checkout = ({ id }) => {
  const it = getItem(id), c = getCol(it.col), cr = CREATORS[c.creator];
  return {
    html: `${topbar('Checkout')}<div class="pad">
     <div class="row gap16" style="margin-top:6px"><div class="thumb" style="width:84px;height:84px;border-radius:14px">${itemArt(it)}</div><div class="grow"><div style="font:700 17px Poppins;color:var(--navy)">${it.name}</div><div class="row" style="gap:6px;margin-top:4px;font:400 14px Inter;color:var(--ink2)">by ${cr.name} ${cr.verified ? verified(15) : ''}</div><span class="badge saff" style="margin-top:6px">${it.attrs.Rarity} · Edition ${it.edition}</span></div></div>
     <div class="divider" style="margin:22px 0 8px"></div>
     <div class="kv" style="border:0"><span>Price</span><b>${inr(it.price)}</b></div>
     <div class="kv" style="border:0"><span>Platform fee</span><b>₹0</b></div>
     <div class="kv" style="border:0"><span>Gas / network fee</span><b style="color:var(--green)">Free</b></div>
     <div class="divider" style="margin:8px 0 14px"></div>
     <div class="row sp" style="font:700 20px Poppins;color:var(--navy)"><span>Total</span><span>${inr(it.price)}</span></div>
     <div class="sm" style="margin-top:4px">Final amount — no hidden charges. Incl. all taxes.</div>
     <div class="h3" style="margin:30px 0 14px">Pay with UPI</div>
     <div class="row sp" id="upis">${upiRow()}</div>
     <div class="box row gap12" style="margin-top:22px">${ic('wallet', 22, '#12804A', 1.9)}<div class="grow"><div style="font:600 13px Inter">Delivered to your NFT India collection</div><div class="sm" style="margin-top:2px">Secure managed wallet · no setup needed</div></div></div>
     <div class="row" style="gap:10px;justify-content:center;margin-top:22px;font:400 12px/1.4 Inter;color:#6b7280">${ic('lock', 18, 'currentColor', 2)}<span>Secure payment powered by trusted<br>Indian payment partners.</span></div></div>`,
    cta: `<button class="btn" onclick="App.pay('${id}')">Pay ${inr(it.price)}</button>`,
  };
};
const upiRow = () => UPIS.map(([l, s]) => `<div style="text-align:center" onclick="App.setPay('${l}')"><div style="width:76px;height:64px;border-radius:14px;background:#fff;border:${payMethod === l ? '2px solid var(--green)' : '1px solid var(--line)'};display:flex;align-items:center;justify-content:center;position:relative">${s}${payMethod === l ? `<span style="position:absolute;top:-7px;right:-7px;width:20px;height:20px;border-radius:10px;background:var(--green);display:flex;align-items:center;justify-content:center">${ic('check', 12, '#fff', 3)}</span>` : ''}</div><div style="font:500 12px Inter;margin-top:7px;color:var(--ink2)">${l}</div></div>`).join('');

SCREENS.processing = ({ order }) => {
  const o = S.orders.find(x => x.id === order), it = getItem(o.itemId);
  return {
    html: `<div style="padding:70px 24px 0;text-align:center">
     <div class="thumb" style="width:150px;height:150px;border-radius:18px;margin:0 auto;box-shadow:0 10px 24px #0002">${itemArt(it)}<div class="skel" style="position:absolute;inset:0;opacity:.25"></div></div>
     <div class="h1" style="margin-top:26px">Processing your order</div>
     <div class="body" style="margin-top:8px">Please don't worry — your payment is safe.<br>Order ${o.id}</div></div>
     <div class="pad" style="margin-top:26px"><div class="box" id="steps">${procSteps(1)}</div>
     <div id="delaynote"></div></div>`,
    after: () => {
      timers.push(setTimeout(() => { const s = $('#steps'); s && (s.innerHTML = procSteps(2)); vibrate(10); }, 1300));
      if (S.settings.delay) {
        timers.push(setTimeout(() => {
          const n = $('#delaynote'); if (!n) return;
          n.innerHTML = `<div class="box row gap12" style="margin-top:14px;background:var(--saff-l);border-color:var(--saff-b)">${ic('clock', 22, '#F28C28', 2)}<div class="grow"><div style="font:600 14px Inter">Taking a little longer</div><div class="sm" style="margin-top:2px;line-height:1.4">Payment received. Blockchain delivery is queued — we'll notify you the moment it lands in your collection.</div></div></div>
           <button class="btn" style="margin-top:16px" onclick="App.tab('mycollection')">Go to My Collection</button>`;
          scheduleDelivery(o.id, 12000);
        }, 3600));
      } else {
        timers.push(setTimeout(() => { completeOrder(o.id, false); const s = $('#steps'); s && (s.innerHTML = procSteps(3)); }, 3200));
        timers.push(setTimeout(() => go('success', { order: o.id }, { replace: true, anim: 'fade' }), 4000));
      }
    },
  };
};
const procSteps = n => [['Payment received', 'UPI · confirmed'], ['Securing on blockchain', 'Minting & transferring'], ['Added to your collection', 'Ready to view']].map(([t, s], k) => {
  const st = k + 1 < n ? 'done' : k + 1 === n ? 'active' : 'pending';
  return `<div class="step ${st}"><div class="ico">${st === 'done' ? ic('check', 16, '#fff', 3) : st === 'pending' ? `<span style="font:700 13px Inter;color:#a0a4ad">${k + 1}</span>` : ''}</div><div><div class="t">${t}</div><div class="sm">${s}</div></div></div>`;
}).join('');
let deliveryTimers = [];
function scheduleDelivery(oid, ms) { deliveryTimers.push(setTimeout(() => { completeOrder(oid, true); }, ms)); }
function completeOrder(oid, notifyUser) {
  const o = S.orders.find(x => x.id === oid); if (!o || o.status === 'completed') return;
  o.status = 'completed'; o.tx = '0x' + hex(64); o.done = Date.now();
  const it = getItem(o.itemId);
  notify('check', 'Collectible delivered 🎉', `${it.name} is now in your collection.`);
  save();
  if (notifyUser) { toast(`${it.name} delivered to your collection`); vibrate(30); const cur = stack[stack.length - 1].name; if (['mycollection', 'orders', 'order', 'nft', 'home', 'notifications'].includes(cur)) refresh(); }
}

SCREENS.success = ({ order }) => {
  const o = S.orders.find(x => x.id === order), it = getItem(o.itemId);
  const conf = Array.from({ length: 36 }, (_, i) => `<i style="position:fixed;top:-20px;left:${(i * 29) % 100}%;width:${8 + i % 5}px;height:${4 + i % 3}px;border-radius:2px;background:${['#F28C28', '#12804A', '#2f6fe0', '#e0384a', '#f6c64a'][i % 5]};animation:fall ${2.2 + (i % 7) * .3}s ${(i % 9) * .12}s ease-in forwards;z-index:30"></i>`).join('');
  return {
    html: `${conf}<div style="padding:70px 24px 0;text-align:center">
     <div style="margin:0 auto;width:104px;height:104px;border-radius:52px;background:var(--green);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 14px #12804a1a;animation:pop .5s both">${ic('check', 54, '#fff', 3)}</div>
     <div class="h1" style="margin-top:34px;font-size:26px">Payment Successful!</div>
     <div class="body" style="margin-top:8px;font-size:16px">You have successfully purchased<br>${it.name}.</div>
     <div class="thumb" style="width:180px;height:180px;border-radius:16px;margin:26px auto 0;box-shadow:0 10px 24px #0002;animation:pop .5s .2s both">${itemArt(it)}</div>
     <div class="sm" style="margin-top:14px">Order ${o.id} · Paid ${inr(o.amount)} via ${o.method}</div></div>`,
    cta: `<button class="btn" onclick="App.go('nft',{id:'${it.id}'},{reset:true});App._fixStack('mycollection')">View in My Collection</button>
     <div class="row gap12" style="margin-top:12px"><button class="btn2" onclick="App.tab('explore')">Explore More</button><button class="btn2" onclick="App.shareItem('${it.id}',true)">${ic('share', 18)}Share</button></div>`,
    after: () => vibrate(40),
  };
};

let colTab = 'owned';
SCREENS.mycollection = () => {
  const owned = S.owned.map(o => ({ it: getItem(o.itemId), o: S.orders.find(x => x.id === o.orderId), w: o })).reverse();
  const liked = S.liked.map(getItem).filter(Boolean);
  const total = S.orders.reduce((a, o) => a + o.amount, 0);
  return {
    nav: 'mycollection',
    html: `<div class="row sp pad" style="padding-top:18px"><div class="h1">My Collection</div><button class="iconbtn" onclick="App.go('orders')">${ic('receipt', 22)}</button></div>
     ${owned.length ? `<div class="pad" style="margin-top:12px"><div class="box row" style="padding:14px 4px">${[[owned.length, 'Owned'], [inr(total), 'Spent'], [new Set(owned.map(x => x.it.col)).size, 'Collections']].map(([v, l], k) => `<div style="flex:1;text-align:center;${k ? 'border-left:1px solid var(--line)' : ''}"><div style="font:700 17px Poppins;color:var(--navy)">${v}</div><div class="sm">${l}</div></div>`).join('')}</div></div>` : ''}
     <div class="pad" style="margin-top:14px"><div class="tabs"><div class="${colTab === 'owned' ? 'on' : ''}" onclick="App.colTab('owned')">Owned (${owned.length})</div><div class="${colTab === 'liked' ? 'on' : ''}" onclick="App.colTab('liked')">Liked (${liked.length})</div></div></div>
     ${colTab === 'owned' ? (owned.length ? `<div class="pad grid2" style="margin-top:16px">${owned.map(({ it, o, w }) => `<div class="card" onclick="App.go('nft',{id:'${it.id}'})"><div class="thumb" style="height:150px">${itemArt(it)}${w.status === 'listed' ? `<span class="badge green" style="position:absolute;left:8px;top:8px;background:var(--card)">${ic('tag', 12, 'var(--green)', 2.2)}${inr(w.price)}</span>` : ''}${w.status === 'auction' ? `<span class="badge" style="position:absolute;left:8px;top:8px;background:var(--red);color:#fff"><span class="live" style="background:#fff"></span>Auction</span>` : ''}${o && o.status === 'processing' ? `<div style="position:absolute;inset:0;background:#fff8;display:flex;align-items:center;justify-content:center"><span class="badge saff" style="animation:pulse 1.4s infinite">${ic('clock', 12, 'var(--saff)', 2.2)}Processing</span></div>` : ''}</div><div style="padding:10px 12px 12px"><div class="ttl">${getCol(it.col).name}</div><div class="sm" style="font-size:13px;margin-top:2px">#${String(it.edition).padStart(4, '0')}</div></div></div>`).join('')}</div>`
      : `<div class="empty">${ic('collection', 48, 'var(--mut)', 1.5)}<div class="h3">No collectibles yet</div><div>Your purchases will appear here — ready the moment payment completes.</div><button class="btn" style="margin-top:22px" onclick="App.tab('explore')">Start exploring</button></div>`)
      : (liked.length ? `<div class="pad grid2" style="margin-top:16px">${liked.map(i => itemCard(i, 150)).join('')}</div>` : `<div class="empty">${ic('heart', 48, 'var(--mut)', 1.5)}<div class="h3">Nothing liked yet</div><div>Tap the heart on any collectible to save it here.</div></div>`)}`,
  };
};

SCREENS.drops = () => ({
  nav: 'drops',
  html: `<div class="pad" style="padding-top:18px"><div class="h1">Drops</div><div class="body" style="margin-top:4px">Curated releases from verified Indian creators.</div></div>
   <div class="pad" style="margin-top:18px"><div class="card" onclick="App.go('collection',{id:'bharat'})" style="position:relative"><div class="thumb" style="height:200px">${ART.gate()}</div><span class="badge" style="position:absolute;left:12px;top:12px;background:var(--red);color:#fff">● LIVE NOW</span>
    <div style="padding:14px"><div class="row sp"><div><div class="h3">Bharat Forever</div><div class="sm">by ArtVerse · ${inr(799)}</div></div><button class="btn sm">Collect</button></div>
    <div style="height:6px;border-radius:3px;background:var(--line);margin-top:12px"><div style="height:6px;border-radius:3px;background:var(--green);width:91%"></div></div><div class="sm" style="margin-top:6px">455 / 500 collected · 45 left</div></div></div></div>
   <div class="sechead" style="margin-top:24px"><span class="h2">Upcoming</span></div>
   <div class="pad col gap12">${DROPS.map(d => dropCard(d, '100%').replace('width:100%px', 'width:100%')).join('')}</div>`,
  after: startCountdowns,
});

SCREENS.profile = () => {
  const u = S.user || { name: 'Guest', phone: '' };
  const handle = '@' + u.name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '') + '.collects';
  return {
    nav: 'profile',
    html: `<div class="row sp pad" style="padding-top:18px"><div class="h1">Profile</div><button class="iconbtn" onclick="App.go('settings')">${ic('gear', 24)}</button></div>
     <div class="row pad" style="gap:18px;margin-top:20px">${userAvatar(84)}<div class="grow"><div style="font:700 21px Poppins;color:var(--navy)">${esc(u.name)}</div><div class="sm" style="font-size:14px;margin-top:2px">${esc(handle)}</div>${u.phone ? `<div class="sm" style="margin-top:4px">+91 ${u.phone.slice(0, 5)} ${u.phone.slice(5)} ${ic('check', 12, '#12804A', 3)}</div>` : ''}</div></div>
     <div class="row pad" style="justify-content:space-around;margin-top:22px">${[[S.owned.length, 'Collected', "App.colTab('owned',true)"], [S.liked.length, 'Liked', "App.colTab('liked',true)"], [S.following.length, 'Following', "App.go('following')"]].map(([n, l, a]) => `<div style="text-align:center" onclick="${a}"><div style="font:700 18px Poppins;color:var(--navy)">${n}</div><div class="sm" style="font-size:13px">${l}</div></div>`).join('')}</div>
     <div class="pad" style="margin-top:14px"><div class="list">${[['wallet', 'My Wallet', "App.go('wallet')"], ['receipt', 'Purchase History', "App.go('orders')"], ['heart', 'Saved Items', "App.colTab('liked',true)"], ['users', 'Following Creators', "App.go('following')"], ['bell', 'Notifications', "App.go('notifications')"], ['help', 'Help & Support', "App.go('help')"], ['doc', 'Terms & Privacy', "App.go('about')"]].map(([i, l, a]) => `<div class="li" onclick="${a}">${ic(i, 22, 'currentColor', 1.7)}<span class="grow">${l}</span>${l === 'Notifications' && unread() ? `<span class="badge saff">${unread()}</span>` : ''}${ic('chev', 18, '#6b7280')}</div>`).join('')}</div>
     <button class="row gap12" style="margin-top:18px;font:600 15px Inter;color:var(--red);padding:8px 0" onclick="App.logout()">${ic('logout', 22, '#e0384a', 1.9)}Logout</button></div>`,
  };
};

SCREENS.wallet = () => ({
  html: `${topbar('My Wallet')}<div class="pad">
   <div style="border-radius:20px;padding:20px;background:linear-gradient(135deg,#13213C,#1f3a5f);color:#fff;position:relative;overflow:hidden">
    <div style="position:absolute;right:-30px;top:-30px;width:140px;height:140px;border-radius:70px;background:#ffffff0d"></div>
    <div class="row sp"><span style="font:600 13px Inter;opacity:.8">NFT India Managed Wallet</span>${ic('shield', 22, '#7ee0a8', 2)}</div>
    <div style="font:700 30px Poppins;margin-top:16px">${S.owned.length} <span style="font-size:16px;font-weight:500;opacity:.8">collectibles</span></div>
    <div class="row sp" style="margin-top:18px;font:500 13px Inter;opacity:.85"><span>Vault ${short(VAULT)}</span><span>Polygon (demo)</span></div></div>
   <div class="box" style="margin-top:16px"><div class="row sp"><div><div class="sm">Earnings from sales</div><div style="font:700 28px Poppins;color:var(--navy)" class="${S.earnings ? 'flash' : ''}">${inr(S.earnings)}</div></div>${ic('trend', 30, '#12804A', 2)}</div>
    <div class="sm" style="margin-top:4px">${S.sales.filter(x => x.kind !== 'gift').length} sold · after 2.5% platform fee & 5% creator royalty</div>
    <button class="btn" style="margin-top:14px;height:48px" ${S.earnings ? '' : 'disabled'} onclick="App.withdrawSheet()">${ic('bank', 18, '#fff', 2)}Withdraw to bank (UPI)</button></div>
   <div class="box" style="margin-top:14px">${[['shield', 'Secured by NFT India', 'Keys are protected with institutional-grade custody. No seed phrase to lose.'], ['wallet', 'Zero setup', 'Your wallet was created automatically when you signed up.'], ['chain', 'Real ownership', 'Every collectible is recorded on-chain and linked to your account.']].map(([i, t, d]) => `<div class="row gap12" style="padding:10px 0;align-items:flex-start">${ic(i, 22, '#12804A', 1.9)}<div><div style="font:600 14px Inter">${t}</div><div class="sm" style="margin-top:2px;line-height:1.45">${d}</div></div></div>`).join('')}</div>
   <div class="box row gap12" style="margin-top:14px;opacity:.75">${ic('ext', 22, '#6b7280', 1.9)}<div class="grow"><div style="font:600 14px Inter">Withdraw to external wallet</div><div class="sm" style="margin-top:2px">Coming in a later phase</div></div><span class="badge blue">Soon</span></div></div>`,
});

SCREENS.orders = () => ({
  html: `${topbar('Purchase History')}<div class="pad">${S.sales.length ? `<div class="sm" style="font-weight:600;margin:4px 0 2px">SALES & GIFTS</div>${S.sales.slice().reverse().map(x => { const it = getItem(x.itemId); return `<div class="row gap12" style="padding:14px 0;border-bottom:1px solid var(--line)" onclick="App.go('nft',{id:'${it.id}'})"><div class="thumb" style="width:58px;height:58px;border-radius:12px;flex:none">${itemArt(it)}</div><div class="grow"><div class="ttl">${it.name}</div><div class="sm" style="margin-top:3px">${x.kind === 'gift' ? 'Gifted to' : x.kind === 'auction' ? 'Auction · won by' : 'Sold to'} ${esc(x.who)}</div></div><div style="text-align:right">${x.kind === 'gift' ? `<span class="badge saff">${ic('gift', 12, 'var(--saff)', 2.2)}Gift</span>` : `<div class="price" style="color:var(--green)">+${inr(x.net)}</div><div class="sm" style="font-size:11px">of ${inr(x.amount)}</div>`}</div></div>`; }).join('')}<div class="sm" style="font-weight:600;margin:22px 0 2px">PURCHASES</div>` : ''}${S.orders.length ? S.orders.slice().reverse().map(o => { const it = getItem(o.itemId); return `<div class="row gap12" style="padding:14px 0;border-bottom:1px solid var(--line)" onclick="App.go('order',{id:'${o.id}'})"><div class="thumb" style="width:58px;height:58px;border-radius:12px;flex:none">${itemArt(it)}</div><div class="grow"><div class="ttl">${it.name}</div><div class="sm" style="margin-top:3px">${fmtDate(o.t)} · ${o.method}</div></div><div style="text-align:right"><div class="price">${inr(o.amount)}</div>${o.status === 'completed' ? '<span class="badge green" style="margin-top:4px">Completed</span>' : '<span class="badge saff" style="margin-top:4px">Processing</span>'}</div></div>`; }).join('') : `<div class="empty">${ic('receipt', 48, 'var(--mut)', 1.5)}<div class="h3">No orders yet</div><div>Your purchases and receipts will show up here.</div></div>`}</div>`,
});
SCREENS.order = ({ id }) => {
  const o = S.orders.find(x => x.id === id), it = getItem(o.itemId);
  return {
    html: `${topbar('Order details')}<div class="pad">
     <div class="row gap16"><div class="thumb" style="width:72px;height:72px;border-radius:14px">${itemArt(it)}</div><div class="grow"><div style="font:700 16px Poppins;color:var(--navy)">${it.name}</div>${o.status === 'completed' ? '<span class="badge green" style="margin-top:6px">✓ Delivered</span>' : '<span class="badge saff" style="margin-top:6px">Processing — payment received</span>'}</div></div>
     <div class="box" style="margin-top:18px">${[['Order ID', o.id], ['Date', fmtDate(o.t)], ['Paid via', o.method + ' (UPI)'], ['UPI ref', o.upi], ['Amount', inr(o.amount)], ['Status', o.status === 'completed' ? 'Completed' : 'Processing'], ...(o.tx ? [['Tx hash', short(o.tx)]] : [])].map(([k, v]) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
     ${o.status !== 'completed' ? `<div class="box row gap12" style="margin-top:14px;background:var(--saff-l);border-color:var(--saff-b)">${ic('clock', 22, '#F28C28', 2)}<div class="sm" style="color:var(--saff-t);line-height:1.45">Your money is safe. Blockchain delivery is in progress and usually completes in a few minutes. You'll get a notification.</div></div>` : ''}
     <button class="btn2" style="margin-top:16px" onclick="App.go('help')">${ic('help', 18)}Need help with this order?</button></div>`,
  };
};

SCREENS.notifications = () => {
  setTimeout(() => { S.notifs.forEach(n => n.read = true); save(); }, 600);
  return {
    html: `${topbar('Notifications', S.notifs.length ? `<button class="link" onclick="App.clearNotifs()">Clear</button>` : '')}<div class="pad">${S.notifs.length ? S.notifs.map(n => `<div class="row gap12" style="padding:14px 0;border-bottom:1px solid var(--line);align-items:flex-start"><div style="width:40px;height:40px;border-radius:20px;background:${n.read ? 'var(--chip)' : 'var(--green-l)'};display:flex;align-items:center;justify-content:center;flex:none">${ic(n.icon, 20, n.read ? '#6b7280' : '#12804A', 2)}</div><div class="grow"><div class="row sp"><span style="font:600 14px Inter">${n.title}</span>${n.read ? '' : '<i style="width:8px;height:8px;border-radius:4px;background:var(--green)"></i>'}</div><div class="sm" style="font-size:13px;margin-top:3px;line-height:1.45">${n.body}</div><div class="sm" style="margin-top:4px;font-size:11px">${ago(n.t)}</div></div></div>`).join('') : `<div class="empty">${ic('bell', 48, 'var(--mut)', 1.5)}<div class="h3">You're all caught up</div></div>`}</div>`,
  };
};
SCREENS.following = () => ({
  html: `${topbar('Following')}<div class="pad">${Object.values(CREATORS).map(c => { const f = S.following.includes(c.id); return `<div class="row gap12" style="padding:12px 0;border-bottom:1px solid var(--line)" onclick="App.go('creator',{id:'${c.id}'})">${avatar(c, 50)}<div class="grow"><div class="row" style="gap:5px;font:600 15px Inter">${c.name} ${c.verified ? verified(14) : ''}</div><div class="sm" style="margin-top:2px">${c.followers} followers</div></div><button class="btn sm ${f ? 'ghost' : ''}" style="width:104px;height:34px;font-size:13px" onclick="event.stopPropagation();App.follow('${c.id}')">${f ? 'Following' : 'Follow'}</button></div>`; }).join('')}</div>`,
});
SCREENS.settings = () => ({
  html: `${topbar('Settings')}<div class="pad">
   <div class="sm" style="font-weight:600;margin:8px 0 10px">APPEARANCE</div>
   <div class="themebtn" id="stheme">${themeOpts()}</div>
   <div class="sm" style="font-weight:600;margin:24px 0 4px">NOTIFICATIONS</div>
   <div class="list"><div class="li"><span class="grow">Drop reminders</span><div class="switch ${S.settings.drops ? 'on' : ''}" onclick="App.setting('drops')"></div></div>
   <div class="li"><span class="grow">Order updates</span><div class="switch on" onclick="App.toast('Order updates are always on')"></div></div></div>
   <div class="sm" style="font-weight:600;margin:24px 0 4px">DEMO OPTIONS</div>
   <div class="list"><div class="li"><div class="grow"><div>Simulate delayed delivery</div><div class="sm" style="margin-top:3px;font-weight:400">Payment succeeds but blockchain delivery takes ~15s — shows the “Processing” state.</div></div><div class="switch ${S.settings.delay ? 'on' : ''}" onclick="App.setting('delay')"></div></div>
   <div class="li" onclick="App.resetDemo()"><div class="grow"><div style="color:var(--red)">Reset demo now</div><div class="sm" style="margin-top:3px;font-weight:400">The demo also resets automatically every time the app is closed.</div></div>${ic('chev', 18, '#6b7280')}</div></div>
   <div class="sm" style="font-weight:600;margin:24px 0 4px">ACCOUNT</div>
   <div class="list"><div class="li"><span class="grow">Language</span><span class="sm">English</span></div><div class="li"><span class="grow">Currency</span><span class="sm">₹ INR</span></div></div></div>`,
});
SCREENS.auction = ({ id }) => {
  const it = getItem(id), o = ownOf(id);
  if (!o || o.status !== 'auction') { const sold = S.sales.slice().reverse().find(x => x.itemId === id); return { html: `${topbar('Auction')}<div class="empty">${ic('gavel', 48, 'var(--mut)', 1.5)}<div class="h3">${sold ? 'Auction ended — sold to ' + sold.who : 'Auction ended'}</div><div>${sold ? 'Final price ' + inr(sold.amount) + '. You earned ' + inr(sold.net) + '.' : 'No bids were placed. The collectible is back in your collection.'}</div><button class="btn" style="margin-top:22px" onclick="App.go('nft',{id:'${id}'},{replace:true})">View collectible</button></div>` }; }
  return {
    html: `${topbar('Live auction', `<span class="badge" style="background:var(--red-l);color:var(--red);margin-right:6px"><span class="live"></span>LIVE</span>`)}<div class="pad">
     <div class="row gap16"><div class="thumb" style="width:92px;height:92px;border-radius:16px;flex:none">${itemArt(it)}</div><div class="grow"><div style="font:700 17px Poppins;color:var(--navy)">${it.name}</div><div class="sm" style="margin-top:4px">Started at ${inr(o.auction.start)} · ${it.attrs.Rarity}</div></div></div>
     <div class="box" style="margin-top:18px;text-align:center"><div class="sm">Time left</div><div id="atimer" style="font:700 34px Poppins;color:var(--navy);font-variant-numeric:tabular-nums">--</div>
      <div style="height:6px;border-radius:3px;background:var(--line);margin-top:8px"><div id="abar" style="height:6px;border-radius:3px;background:var(--red);width:0;transition:width 1s linear"></div></div></div>
     <div class="row gap12" style="margin-top:12px"><div class="box grow" style="text-align:center"><div class="sm" id="alabel">Starting price</div><div id="atop" style="font:700 24px Poppins;color:var(--navy)">--</div></div><div class="box grow" style="text-align:center"><div class="sm">You'd receive</div><div id="anet" style="font:700 24px Poppins;color:var(--green)">--</div></div></div>
     <div class="h3" style="margin:22px 0 6px">Bids <span class="sm" id="acount"></span></div>
     <div id="abids"></div></div>`,
    cta: `<button class="btn2" id="acancel" onclick="App.cancelAuction('${id}')">Cancel auction</button>`,
    after: () => { updateAuction(); timers.push(setInterval(updateAuction, 1000)); },
  };
};
function updateAuction() {
  const p = cur().params || {}, o = ownOf(p.id);
  if (!o || o.status !== 'auction') { if (cur().name === 'auction') refresh(); return; }
  const a = o.auction, v = visibleBids(a), tb = topBid(a), $$ = id => document.getElementById(id);
  if (!$$('atimer')) return;
  $$('atimer').textContent = mmss(a.end - Date.now());
  $$('abar').style.width = Math.min(100, (Date.now() - a.begin) / (a.end - a.begin) * 100) + '%';
  $$('alabel').textContent = tb ? 'Highest bid' : 'Starting price';
  const amt = inr(tb ? tb.amt : a.start);
  if ($$('atop').textContent !== amt) { $$('atop').textContent = amt; $$('atop').classList.remove('flash'); void $$('atop').offsetWidth; $$('atop').classList.add('flash'); }
  $$('anet').textContent = inr(net(tb ? tb.amt : a.start));
  $$('acount').textContent = `(${v.length})`;
  if ($$('abids').dataset.n != v.length) {
    $$('abids').dataset.n = v.length;
    $$('abids').innerHTML = v.length ? v.slice().reverse().map((b, k) => `<div class="row gap12 ${k === 0 ? 'bidrow' : ''}" style="padding:12px 0;border-bottom:1px solid var(--line)"><div style="width:36px;height:36px;border-radius:18px;background:var(--chip);display:flex;align-items:center;justify-content:center;font:700 13px Inter;flex:none">${b.who.split(' ').map(x => x[0]).join('')}</div><div class="grow"><div style="font:600 14px Inter">${b.who}</div><div class="sm">${ago(b.t)}</div></div><div class="price" style="${k === 0 ? 'color:var(--green)' : ''}">${inr(b.amt)}</div></div>`).join('') : `<div class="sm" style="padding:18px 0;text-align:center"><span class="live" style="background:var(--saff)"></span> Waiting for the first bid… collectors have been notified.</div>`;
    const c = $$('acancel'); if (c) { c.disabled = !!v.length; c.style.opacity = v.length ? .45 : 1; c.textContent = v.length ? 'Bids received — auction is locked' : 'Cancel auction'; }
  }
}

SCREENS.gifted = ({ id, to }) => {
  const it = getItem(id);
  return {
    html: `<div style="padding:80px 24px 0;text-align:center">
     <div style="position:relative;width:180px;height:180px;margin:0 auto">
      <div class="thumb" style="width:180px;height:180px;border-radius:20px;box-shadow:0 12px 30px #0003;animation:giftFly 1.6s .3s cubic-bezier(.5,0,.7,1) forwards">${itemArt(it)}</div>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;animation:pop .5s 1.7s both"><div style="width:110px;height:110px;border-radius:55px;background:var(--saff);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 14px #F28C2822">${ic('gift', 54, '#fff', 2)}</div></div></div>
     <div class="h1" style="margin-top:36px;animation:fadeIn .4s 1.8s both">Gift sent! 🎁</div>
     <div class="body" style="margin-top:8px;font-size:16px;animation:fadeIn .4s 2s both">${it.name} is on its way to<br><b style="color:var(--navy)">${esc(to)}</b>. They'll get an SMS to claim it — no wallet needed.</div></div>`,
    cta: `<button class="btn" onclick="App.tab('mycollection')">Back to My Collection</button><button class="btn2" style="margin-top:12px" onclick="App.tab('explore')">Explore more</button>`,
    after: () => vibrate(40),
  };
};

SCREENS.help = () => ({
  html: `${topbar('Help & Support')}<div class="pad">
   ${[['What is a digital collectible?', 'A unique digital item — art, sports moments or cultural pieces — whose ownership is recorded on a blockchain, so it is verifiably yours.'], ['Do I need a crypto wallet?', 'No. NFT India creates and secures a managed wallet for you automatically. You pay in rupees via UPI.'], ['My payment succeeded but I can’t see my item', 'Sometimes blockchain delivery takes a few minutes. Your order shows as “Processing” and you’ll be notified once it lands in My Collection. Your money is always safe.'], ['Are collections authentic?', 'Every creator and collection is reviewed and verified before listing. Look for the blue tick.'], ['Can I sell or gift my collectibles?', 'Yes. Open any collectible you own and choose Sell (fixed price), Auction (take bids for a set time) or Gift (send it to anyone by mobile number). Sale earnings, after a 2.5% platform fee and 5% creator royalty, can be withdrawn to your bank via UPI.']].map(([q, a], k) => `<details class="box" style="margin-bottom:10px" ${k == 0 ? 'open' : ''}><summary style="font:600 15px Inter;list-style:none;display:flex;justify-content:space-between;gap:10px">${q}<span>${ic('chev', 18, '#6b7280')}</span></summary><div class="body" style="margin-top:10px">${a}</div></details>`).join('')}
   <button class="btn" style="margin-top:12px" onclick="App.toast('Support chat is not available in the demo')">${ic('help', 18, '#fff', 2)}Chat with support</button></div>`,
});
SCREENS.about = () => ({
  html: `${topbar('About')}<div class="pad" style="text-align:center;padding-top:20px">${logoSVG(110)}
   <div class="body" style="margin-top:16px">Digital Collectibles. Made for India.<br>Version 1.1.0 (demo build)</div>
   <div class="box" style="margin-top:22px;text-align:left"><div class="body">NFT India is an India-first marketplace for blockchain-backed digital collectibles. Browse like a shop, pay in ₹ with UPI, and own collectibles that are verifiable on-chain — no wallet setup needed.</div></div>
   <div class="box" style="margin-top:12px;text-align:left;background:var(--saff-l);border-color:var(--saff-b)"><div class="sm" style="color:var(--saff-t);line-height:1.5"><b>Demo notice:</b> this is a prototype. Payments, OTP and blockchain transactions are simulated — no real money is charged and no tokens are minted.</div></div>
   <div class="list" style="text-align:left;margin-top:10px">${['Terms of Service', 'Privacy Policy', 'Refund Policy', 'Open-source licences'].map(l => `<div class="li" onclick="App.toast('Available in the full release')"><span class="grow">${l}</span>${ic('chev', 18, '#6b7280')}</div>`).join('')}</div></div>`,
});

// ---------- actions ----------
const priceBreak = p => `<div class="box" style="margin-top:14px;padding:6px 14px"><div class="kv"><span>Price</span><b>${inr(p)}</b></div><div class="kv"><span>Platform fee (2.5%)</span><b>−${inr(Math.round(p * FEE))}</b></div><div class="kv"><span>Creator royalty (5%)</span><b>−${inr(Math.round(p * ROYALTY))}</b></div><div class="kv"><span style="font-weight:600;color:var(--ink)">You receive</span><b style="color:var(--green);font-size:16px">${inr(net(p))}</b></div></div>`;
const amtInput = (id, v, onin) => `<div class="amt"><span style="color:var(--mut)">₹</span><input id="${id}" type="tel" inputmode="numeric" value="${v}" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,7);${onin}"></div>`;
const App = {
  go, back, tab, toast, share, drawer, closeOverlays,
  setTheme(t) {
    theme = t; try { localStorage.setItem(THEME_KEY, t); } catch (e) {} applyTheme(); syncBar(); vibrate(6);
    ['dtheme', 'stheme'].forEach(i => { const e = document.getElementById(i); if (e) e.innerHTML = themeOpts(); });
  },
  sellSheet(id) {
    const it = getItem(id), o = ownOf(id), paid = paidFor(id), sug = o.status === 'listed' ? o.price : round10(paid * 1.2);
    sheet(`<div class="h2">${o.status === 'listed' ? 'Edit price' : 'Sell at a fixed price'}</div><div class="sm" style="margin:4px 0 14px">${it.name} · you paid ${inr(paid)}</div>
      ${amtInput('sp', sug, "App._sellUpd()")}
      <div class="row gap8" style="margin-top:10px">${[[1.1, '+10%'], [1.25, '+25%'], [1.5, '+50%'], [2, '2×']].map(([m, l]) => `<span class="chip" onclick="document.getElementById('sp').value=${round10(paid * m)};App._sellUpd()">${l}</span>`).join('')}</div>
      <div id="spb">${priceBreak(sug)}</div><div class="sm" id="sph" style="margin-top:8px"></div>
      <button class="btn" id="spgo" style="margin-top:16px" onclick="App.list('${id}')">${o.status === 'listed' ? 'Update listing' : 'List for sale'}</button>`);
    App._sellUpd();
  },
  _sellUpd() { const v = +($('#sp').value || 0), paid = paidFor(stack[stack.length - 1].params.id); $('#spb').innerHTML = priceBreak(v); $('#spgo').disabled = v < 50; $('#sph').innerHTML = v < 50 ? 'Minimum price is ₹50.' : v > paid * 1.6 ? `<span style="color:var(--saff)">Above the floor price — may take longer to sell.</span>` : `<span style="color:var(--green)">Great price — likely to sell quickly.</span>`; },
  list(id) {
    const v = +$('#sp').value, o = ownOf(id); if (!o || v < 50) return;
    o.status = 'listed'; o.price = v; o.listedAt = Date.now(); o.sellAt = v <= paidFor(id) * 1.6 ? Date.now() + 12000 + Math.random() * 10000 : null;
    closeOverlays(); vibrate(20); toast(`Listed for ${inr(v)}`); notify('tag', 'Listed for sale', `${getItem(id).name} is listed for ${inr(v)}.`); refresh();
  },
  cancelListing(id) { const o = ownOf(id); if (!o) return; o.status = 'owned'; delete o.price; delete o.sellAt; toast('Listing cancelled'); refresh(); },
  auctionSheet(id) {
    const it = getItem(id), paid = paidFor(id);
    App._dur = 0;
    sheet(`<div class="h2">Start an auction</div><div class="sm" style="margin:4px 0 14px">${it.name} · collectors bid, highest bid wins</div>
      <div class="sm" style="font-weight:600;color:var(--ink);margin-bottom:8px">Starting price</div>${amtInput('ap', round10(paid * .9), "App._aucUpd()")}
      <div class="sm" style="font-weight:600;color:var(--ink);margin:16px 0 8px">Duration</div><div class="seg" id="adur">${App._durOpts()}</div>
      <div class="box row gap12" style="margin-top:14px;background:var(--saff-l);border-color:var(--saff-b)">${ic('info', 20, 'var(--saff)', 2)}<div class="sm" style="color:var(--saff-t);line-height:1.4">Once the first bid arrives the auction can't be cancelled. Fees: 2.5% platform + 5% creator royalty.</div></div>
      <button class="btn" id="apgo" style="margin-top:16px" onclick="App.startAuction('${id}')">${ic('gavel', 18, '#fff', 2)}Start auction</button>`);
  },
  _durs: [['2 min', 'Demo', 120e3], ['1 hour', '', 3600e3], ['24 hours', '', 86400e3]],
  _durOpts() { return App._durs.map(([l, sub], k) => `<div class="opt ${App._dur === k ? 'on' : ''}" onclick="App._dur=${k};document.getElementById('adur').innerHTML=App._durOpts()">${l}${sub ? `<div class="sm" style="font-size:10px;color:inherit;opacity:.8">${sub}</div>` : ''}</div>`).join(''); },
  _aucUpd() { $('#apgo').disabled = +($('#ap').value || 0) < 50; },
  startAuction(id) {
    const v = +$('#ap').value, o = ownOf(id); if (!o || v < 50) return;
    const dur = App._durs[App._dur][2], now = Date.now();
    o.status = 'auction'; o.auction = { start: v, begin: now, end: now + dur, bids: makeBids(v, dur, now), seen: 0 };
    closeOverlays(); vibrate(20); notify('gavel', 'Auction is live', `${getItem(id).name} — starting at ${inr(v)}.`);
    go('auction', { id }, { replace: true });
  },
  cancelAuction(id) { const o = ownOf(id); if (!o || !o.auction || visibleBids(o.auction).length) return; o.status = 'owned'; delete o.auction; toast('Auction cancelled'); back(); },
  giftSheet(id) {
    const it = getItem(id);
    sheet(`<div class="h2">Send as a gift</div><div class="sm" style="margin:4px 0 14px">${it.name} · they don't need a wallet to receive it</div>
      <div class="sm" style="font-weight:600;color:var(--ink);margin-bottom:8px">Recent contacts</div>
      <div class="row gap8" style="flex-wrap:wrap">${CONTACTS.map(([n, p]) => `<span class="chip" onclick="document.getElementById('gn').value='${n}';document.getElementById('gp').value='${p.replace(' ', '')}';App._giftUpd()">${n}</span>`).join('')}</div>
      <div class="sm" style="font-weight:600;color:var(--ink);margin:16px 0 8px">Friend's name</div><div class="field"><input id="gn" placeholder="e.g. Sana" oninput="App._giftUpd()"></div>
      <div class="sm" style="font-weight:600;color:var(--ink);margin:14px 0 8px">Mobile number</div><div class="field"><span style="font:600 16px Inter;white-space:nowrap">+91</span><input id="gp" type="tel" inputmode="numeric" maxlength="10" placeholder="98765 43210" oninput="this.value=this.value.replace(/\\D/g,'').slice(0,10);App._giftUpd()"></div>
      <div class="sm" style="font-weight:600;color:var(--ink);margin:14px 0 8px">Message (optional)</div><div class="field"><input id="gm" maxlength="80" placeholder="Happy Diwali! 🪔"></div>
      <button class="btn" id="ggo" style="margin-top:18px" disabled onclick="App.sendGift('${id}')">${ic('send', 18, '#fff', 2)}Send gift</button>`);
  },
  _giftUpd() { $('#ggo').disabled = !($('#gn').value.trim() && $('#gp').value.length === 10); },
  sendGift(id) {
    const n = $('#gn').value.trim(), p = $('#gp').value; if (!n || p.length !== 10) return;
    const to = `${n} (+91 ${p.slice(0, 5)} ${p.slice(5)})`;
    closeOverlays(); finishTrade(id, 'gift', to, 0); go('gifted', { id, to }, { replace: true, anim: 'fade' });
  },
  withdrawSheet() {
    const u = S.user ? S.user.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '') : 'me';
    sheet(`<div class="h2">Withdraw earnings</div><div class="sm" style="margin:4px 0 14px">Sent instantly to your bank via UPI</div>
      <div style="font:700 36px Poppins;color:var(--navy);text-align:center;margin:8px 0">${inr(S.earnings)}</div>
      <div class="sm" style="font-weight:600;color:var(--ink);margin:12px 0 8px">UPI ID</div><div class="field"><input id="wu" value="${u}@okaxis"></div>
      <button class="btn" style="margin-top:18px" onclick="App.withdraw()">Withdraw ${inr(S.earnings)}</button>`);
  },
  withdraw() {
    const id = ($('#wu').value || '').trim(); if (!/^[\w.\-]+@[\w]+$/.test(id)) { toast('Enter a valid UPI ID'); return; }
    const amt = S.earnings; S.earnings = 0; closeOverlays(); vibrate(30);
    notify('bank', 'Withdrawal successful', `${inr(amt)} sent to ${id}.`); toast(`${inr(amt)} sent to ${id}`); refresh();
  },
  _fixStack(t) { stack.unshift({ name: t, params: {} }); },
  finishOnboard() { S.onboarded = true; save(); go(S.user ? 'home' : 'login', {}, { reset: true }); },
  sendOtp() { const p = $('#ph').value; if (p.length !== 10) return; vibrate(); toast('OTP sent to +91 ' + p + ' (demo: 123456)'); go('otp', { phone: p }); },
  otpInput(el) {
    el.value = el.value.replace(/\D/g, '').slice(0, 6); const v = el.value;
    document.querySelectorAll('#otpb div').forEach((d, k) => { d.textContent = v[k] || ''; d.className = k === Math.min(v.length, 5) ? 'on' : ''; });
    $('#vbtn').disabled = v.length !== 6;
    if (v.length === 6) setTimeout(() => App.verifyOtp(), 250);
  },
  autofillOtp() { const i = $('#otpi'); i.value = '123456'; App.otpInput(i); },
  verifyOtp() {
    const v = $('#otpi') && $('#otpi').value; if (!v || v.length !== 6) return;
    if (v !== '123456') { toast('Incorrect OTP. Use 123456 for the demo.'); vibrate(60); $('#otpi').value = ''; App.otpInput($('#otpi')); return; }
    const ph = stack[stack.length - 1].params.phone;
    S.user = { phone: ph, name: '', interests: [] }; save(); vibrate(20);
    setupDraft = { name: '', interests: [] }; go('setup', {}, { reset: true });
  },
  setName(v) { setupDraft.name = v; $('#sbtn').disabled = !v.trim(); },
  toggleInt(l) { const a = setupDraft.interests; a.includes(l) ? a.splice(a.indexOf(l), 1) : a.push(l); $('#ints').innerHTML = intChips(); vibrate(6); },
  finishSetup() { S.user.name = setupDraft.name.trim(); S.user.interests = setupDraft.interests.slice(); save(); toast(`Welcome, ${S.user.name.split(' ')[0]}!`); go('home', {}, { reset: true }); },
  goExplore(cat) { exploreState.cat = cat; exploreState.view = 'items'; tab('explore'); },
  setExplore(k, v) { exploreState[k] = v; refresh(); },
  sortSheet() {
    sheet(`<div class="h2" style="margin-bottom:8px">Sort by</div>${[['trending', 'Trending'], ['low', 'Price: Low to High'], ['high', 'Price: High to Low']].map(([k, l]) => `<div class="row sp" style="padding:16px 0;border-bottom:1px solid var(--line);font:500 15px Inter" onclick="App.closeOverlays();App.setExplore('sort','${k}')">${l}<span class="radio ${exploreState.sort === k ? 'on' : ''}"></span></div>`).join('')}`);
  },
  searchInput(v) { searchState.q = v; $('#sres').innerHTML = searchResults(); const c = $('#sclr'); if (c) c.style.display = v ? 'flex' : 'none'; },
  searchTab(t) { searchState.tab = t; $('#stabs').innerHTML = searchTabs(); $('#sres').innerHTML = searchResults(); },
  like(id, el) {
    vibrate(8);
    if (isLiked(id)) S.liked = S.liked.filter(x => x !== id); else { S.liked.push(id); }
    save();
    document.querySelectorAll('.heart').forEach(b => { if ((b.getAttribute('onclick') || '').includes(`'${id}'`)) b.classList.toggle('on', isLiked(id)); });
    if (el) { el.style.transform = 'scale(1.25)'; setTimeout(() => el.style.transform = '', 150); }
  },
  follow(id) { vibrate(); if (S.following.includes(id)) S.following = S.following.filter(x => x !== id); else { S.following.push(id); toast('Following ' + CREATORS[id].name); } save(); refresh(); },
  remind(col) {
    vibrate();
    if (S.reminders.includes(col)) { S.reminders = S.reminders.filter(x => x !== col); toast('Reminder removed'); }
    else { S.reminders.push(col); toast("We'll notify you when " + getCol(col).name + ' drops'); notify('bell', 'Reminder set', `You'll be notified when ${getCol(col).name} goes live.`); }
    save(); refresh();
  },
  shareItem(id, owned) { const it = getItem(id); share(`${owned || isOwned(id) ? 'I just collected' : 'Check out'} ${it.name} by ${CREATORS[getCol(it.col).creator].name} on NFT INDIA 🇮🇳 https://nftindia.app/nft/${id}`); },
  viewArt(id) { const it = getItem(id); sheet(`<div class="thumb" style="aspect-ratio:1;border-radius:18px">${itemArt(it)}</div><div class="h3" style="margin-top:14px;text-align:center">${it.name}</div>`); },
  chainDetails(id) {
    const it = getItem(id), own = S.owned.find(o => o.itemId === id), o = own && S.orders.find(x => x.id === own.orderId);
    sheet(`<div class="h2">Blockchain details</div><div class="sm" style="margin:4px 0 14px">For advanced collectors. You don't need any of this to own or enjoy your collectible.</div>
     <div class="box">${[['Network', 'Polygon (demo)'], ['Token standard', 'ERC-721'], ['Contract', short(CONTRACT)], ['Token ID', it.token], ['Held in', own ? 'Your managed wallet' : 'NFT India primary vault'], ['Wallet', short(VAULT)], ...(o && o.tx ? [['Transfer tx', short(o.tx)]] : []), ['Metadata', 'IPFS (pinned)']].map(([k, v]) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
     <div class="row gap12" style="margin-top:16px"><button class="btn2" onclick="App.toast('Contract address copied')">${ic('copy', 18)}Copy contract</button><button class="btn2" onclick="App.toast('Block explorer opens in the full release')">${ic('ext', 18)}Explorer</button></div>`);
  },
  setPay(m) { payMethod = m; vibrate(6); $('#upis').innerHTML = upiRow(); },
  pay(id) {
    const it = getItem(id); vibrate();
    const sh = sheet(`<div style="text-align:center"><div class="row gap8" style="justify-content:center">${ic('lock', 16, '#12804A', 2.2)}<span class="sm" style="font-weight:600;color:var(--green)">Secure UPI payment</span></div>
      <div class="sm" style="margin-top:14px">Paying NFT India via <b style="color:var(--ink)">${payMethod}</b></div>
      <div style="font:700 40px Poppins;color:var(--navy);margin:6px 0">${inr(it.price)}</div><div class="sm">${it.name}</div>
      <div id="paystate" style="margin:22px 0 4px"><div style="width:34px;height:34px;border-radius:17px;border:3px solid var(--green);border-top-color:transparent;margin:0 auto;animation:spin .8s linear infinite"></div><div class="sm" style="margin-top:10px">Opening ${payMethod}…</div></div></div>`);
    sh.dataset.pay = 1;
    setTimeout(() => {
      const ps = $('#paystate'); if (!ps) return;
      ps.innerHTML = `<div class="box" style="text-align:left;background:var(--chip)"><div class="sm" style="line-height:1.45"><b style="color:var(--ink)">Demo payment</b> — in the real app, ${payMethod} opens for you to approve with your UPI PIN. No money is charged here.</div></div>
        <div class="row gap12" style="margin-top:16px"><button class="btn2" onclick="App.payResult('${id}',false)">Decline</button><button class="btn" onclick="App.payResult('${id}',true)">Approve ${inr(it.price)}</button></div>`;
    }, 1200);
  },
  payResult(id, ok) {
    closeOverlays();
    const it = getItem(id);
    if (!ok) { vibrate(60); go('failed', { id }); return; }
    const o = { id: 'NI' + Date.now().toString().slice(-8), itemId: id, amount: it.price, method: payMethod, upi: String(Math.floor(1e11 + Math.random() * 9e11)), t: Date.now(), status: 'processing' };
    S.orders.push(o); S.owned.push({ itemId: id, orderId: o.id }); save();
    notify('bag', 'Payment received', `${inr(it.price)} paid via ${payMethod} for ${it.name}.`);
    go('processing', { order: o.id }, { replace: true, anim: 'fade' });
  },
  colTab(t, nav) { colTab = t; if (nav) tab('mycollection'); else refresh(); },
  setting(k) { S.settings[k] = !S.settings[k]; save(); vibrate(6); refresh(); if (k === 'delay') toast(S.settings.delay ? 'Delayed delivery simulation ON' : 'Delayed delivery simulation OFF'); },
  clearNotifs() { S.notifs = []; save(); refresh(); },
  logout() {
    closeOverlays();
    sheet(`<div class="h2">Log out?</div><div class="body" style="margin:8px 0 18px">Your collection stays safe in your account. Log back in with your mobile number anytime.</div><div class="row gap12"><button class="btn2" onclick="App.closeOverlays()">Cancel</button><button class="btn" style="background:var(--red);box-shadow:none" onclick="App.doLogout()">Log out</button></div>`);
  },
  doLogout() { S.user = null; save(); go('login', {}, { reset: true }); },
  resetDemo() {
    sheet(`<div class="h2">Reset demo?</div><div class="body" style="margin:8px 0 18px">This clears your account, purchases and settings, and restarts from the splash screen.</div><div class="row gap12"><button class="btn2" onclick="App.closeOverlays()">Cancel</button><button class="btn" style="background:var(--red);box-shadow:none" onclick="App.doReset()">Reset</button></div>`);
  },
  doReset() { S = fresh(); colTab = 'owned'; exploreState = { cat: 'All', sort: 'trending', view: 'items' }; go('splash', {}, { reset: true }); },
};
SCREENS.failed = ({ id }) => ({
  html: `<div style="padding:90px 24px 0;text-align:center"><div style="margin:0 auto;width:100px;height:100px;border-radius:50px;background:var(--red-l);display:flex;align-items:center;justify-content:center;animation:pop .5s both">${ic('close', 46, '#e0384a', 3)}</div>
   <div class="h1" style="margin-top:30px">Payment not completed</div><div class="body" style="margin-top:10px">The payment was declined or cancelled. <b>No money has been deducted.</b> If any amount was debited, it will be refunded automatically within 3–5 working days.</div></div>`,
  cta: `<button class="btn" onclick="App.go('checkout',{id:'${id}'},{replace:true})">Try again</button><button class="btn2" style="margin-top:12px" onclick="App.back()">Back to collectible</button>`,
});
window.App = App;

// resume any pending deliveries after restart
S.orders.filter(o => o.status === 'processing').forEach(o => scheduleDelivery(o.id, 8000));
go('splash', {}, { reset: true });
})();
