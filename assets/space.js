/* BUCKAZOIDS outer web: VGA deep-space backdrop + pixel props. Original code. */
'use strict';
(() => {
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
const bay = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
const COIN_GLYPH = ['.#.#.', '####.', '#...#', '####.', '#...#', '#...#', '####.', '.#.#.'];
const GOLD = ['#5a2a00', '#8a4a00', '#c07000', '#f0a000', '#ffd23a', '#fff2a0'];
function hash(x, y) { let h = x * 374761393 + y * 668265263; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, s = t => t * t * (3 - 2 * t);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1), u = s(xf), v = s(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
const fbm = (x, y) => { let v = 0, a = .5; for (let i = 0; i < 5; i++) { v += a * vnoise(x, y); x *= 2.03; y *= 2.03; a *= .5; } return v; };

/* ---------- coin ---------- */
function drawCoin(g, cx, cy, r, ang, glow) {
  const c = Math.cos(ang), w = Math.max(.6, Math.abs(c) * r), side = Math.sin(ang) * Math.max(1, r * .16);
  if (glow) { for (let y = -r - 4; y <= r + 4; y++) for (let x = -r - 4; x <= r + 4; x++) { const d = Math.hypot(x / (w + 4), y / (r + 4)); if (d < 1 && d > .7 && bay(x + 99, y + 99) < (1 - d) * 1.4) { g.fillStyle = '#6a3a00'; g.fillRect(cx + x, cy + y, 1, 1); } } }
  for (let y = -r; y <= r; y++) { const hw = Math.sqrt(Math.max(0, 1 - (y / r) ** 2));
    const ew = Math.round(w * hw), off = Math.round(side);
    g.fillStyle = '#7a4200'; g.fillRect(Math.round(cx - ew + Math.min(0, off)), cy + y, ew * 2 + Math.abs(off) + 1, 1); }
  for (let y = -r; y <= r; y++) { const hw = Math.sqrt(Math.max(0, 1 - (y / r) ** 2)), ew = Math.round(w * hw);
    for (let x = -ew; x <= ew; x++) { const nx = w > 1 ? x / w : 0, ny = y / r, d = Math.hypot(nx, ny);
      let l = .62 - .32 * nx * Math.sign(c || 1) - .38 * ny; if (d > .8) l -= .28; if (d > .8 && d < .9) l += .12;
      const i = Math.max(0, Math.min(5, Math.floor(l * 5 + bay(x + 64, y + 64)))); g.fillStyle = GOLD[i]; g.fillRect(cx + x, cy + y, 1, 1); } }
  if (Math.abs(c) > .3) { const s = Math.max(1, Math.floor(r / 6)), gw = 5 * s, gh = 8 * s;
    for (let gy = 0; gy < 8; gy++) for (let gx = 0; gx < 5; gx++) if (COIN_GLYPH[gy][gx] === '#') {
      const ac = Math.abs(c), x0 = cx + (gx * s - gw / 2) * ac, x1 = cx + ((gx + 1) * s - gw / 2) * ac, y0 = Math.round(cy - gh / 2 + gy * s);
      const L = Math.round(x0), R = Math.max(L + 1, Math.round(x1));
      g.fillStyle = '#6a3000'; g.fillRect(L, y0, R - L, s); } }
}

/* ---------- ship sprite: S.S. MEMPOOL ---------- */
const SHIP = [
'..............kkkkkkkk..............................',
'............kkGGGGGGGGkk............................',
'...........kGGwwGGGGGGGGk...........................',
'..kkkk....kGGGGGGGGGGGGGGkkkkkkkkkkkkkkkkkk.........',
'.kgggk...kGGGbbGbbGbbGGGGGGGGGGGGGGGGGGGGGGkkk......',
'kogggkkkkgGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGkk....',
'kyogggggggggggggggggggggggggggggggggggGGGGGGGGGGkk..',
'kyogggrrrrgggggggggrrrrrggggggggggggggggGbbbbbGGGGk.',
'kyoggggggggggggggggggggggggggggggggggggggGGGGGGGGGGk',
'koggggggdddddddddddddddddddddddddddddddggggggggggk..',
'.kgggkkkkkgggggggggggggggggggggggggggggggggggkkkk...',
'..kkk....kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.......',
'............kddk..............kddk..................',
'............kkkk..............kkkk..................'];
const SP = { k: '#000', g: '#555566', G: '#aaaabb', w: '#ffffff', o: '#ff8800', y: '#ffff55', b: '#55ffff', r: '#aa0000', d: '#333344' };
function drawSprite(g, rows, pal, x0, y0, flip) { const W = rows[0].length;
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const ch = r[x]; if (ch === '.') continue; g.fillStyle = pal[ch]; g.fillRect(x0 + (flip ? W - 1 - x : x), y0 + y, 1, 1); } }); }
function drawShip(g, x, y, t) { drawSprite(g, SHIP, SP, x, y);
  const f = (t / 3 | 0) % 3; const fl = ['#ffff55', '#ff8800', '#ffffff'];
  for (let i = 0; i < 4 + f * 2; i++) { g.fillStyle = fl[(i + f) % 3]; g.fillRect(x - 1 - i, y + 6 + ((i + f) % 3), 1, 1); }
  if ((t / 20 | 0) % 2) { g.fillStyle = '#ff5555'; g.fillRect(x + 51, y + 8, 1, 1); } g.fillStyle = '#55ff55'; if ((t / 13 | 0) % 2) g.fillRect(x + 15, y, 1, 1); }

/* ---------- planet pre-render ---------- */
function makePlanet(R) { const s = R * 4, c = document.createElement('canvas'); c.width = s; c.height = s; const g = c.getContext('2d');
  const PAL = ['#0a0620', '#1a0a3a', '#3a1a6a', '#6a2a8a', '#aa4aaa', '#ff88cc'], RING = ['#2a2a55', '#5555aa', '#aaaaff'];
  const ringPix = (front) => { for (let y = -R; y <= R; y++) for (let x = -2 * R; x <= 2 * R; x++) { const rx = x / (1.9 * R), ry = y / (0.42 * R), d = Math.hypot(rx, ry);
      if (d > .72 && d < 1) { const isFront = y > 0; if (isFront !== front) continue; if (!front && Math.hypot(x, y) < R) continue;
        const i = Math.floor((1 - Math.abs(d - .86) * 7) * 2 + bay(x + 999, y + 999)); g.fillStyle = RING[Math.max(0, Math.min(2, i))]; g.fillRect(2 * R + x, 2 * R + y, 1, 1); } } };
  ringPix(false);
  for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) { const d = Math.hypot(x, y) / R; if (d > 1) continue;
    const nz = Math.sqrt(1 - d * d), lit = Math.max(0, (-x * .6 - y * .5) / R + nz * .7);
    const band = Math.sin(y / R * 9 + fbm(x / 9, y / 4) * 3) * .12;
    const i = Math.floor((lit + band) * 4.2 + bay(x + 999, y + 999)); g.fillStyle = PAL[Math.max(0, Math.min(5, i))]; g.fillRect(2 * R + x, 2 * R + y, 1, 1); }
  ringPix(true); return c; }

/* ---------- backdrop ---------- */
const cv = document.getElementById('space'), g = cv.getContext('2d');
let S = 3, W = 0, H = 0, neb = null, stars = [], planet = null, tick = 0, comet = null, nextComet = 120;
function makeNebula(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), im = x.createImageData(w, h), d = im.data;
  const P1 = [[3, 2, 10], [10, 4, 30], [26, 8, 58], [58, 14, 90], [106, 26, 122], [160, 42, 138]], P2 = [[3, 2, 10], [4, 18, 34], [8, 42, 70], [16, 80, 106], [40, 130, 150]];
  for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) {
    const a = fbm(X / 70 + 3, y / 55) - .38 - Math.abs((y / h) - .32 - .18 * Math.sin(X / 90)) * .9,
      b = fbm(X / 60 + 40, y / 70 + 9) - .42 - Math.abs((y / h) - .78 + .1 * Math.cos(X / 110)) * .8;
    let col = [3, 2, 10];
    if (a > b) { const i = Math.floor(Math.max(0, a) * 13 + bay(X, y)); col = P1[Math.min(5, i)]; } else { const i = Math.floor(Math.max(0, b) * 12 + bay(X, y)); col = P2[Math.min(4, i)]; }
    const o = (y * w + X) * 4; d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255; }
  x.putImageData(im, 0, 0); return c; }
function resize() { S = innerWidth < 700 ? 2 : 3; W = Math.ceil(innerWidth / S); H = Math.ceil(innerHeight / S); cv.width = W; cv.height = H; g.imageSmoothingEnabled = false;
  neb = makeNebula(W, Math.ceil(H * 1.6)); planet = planet || makePlanet(26);
  stars = []; const n = Math.round(W * H / 90);
  for (let i = 0; i < n; i++) { const l = Math.random(); stars.push({ x: Math.random() * W, y: Math.random() * H, l: l < .65 ? 0 : l < .92 ? 1 : 2, tw: Math.random() < .12, ph: Math.random() * 99, c: ['#ffffff', '#aaaaff', '#ffff99', '#55ffff'][Math.random() * 4 | 0] }); } }
addEventListener('resize', () => { clearTimeout(resize.t); resize.t = setTimeout(resize, 150); });
resize();
function frame() { tick++; const sy = scrollY / S;
  g.fillStyle = '#03020a'; g.fillRect(0, 0, W, H);
  const ny = -((sy * .12) % (neb.height - H)); g.drawImage(neb, 0, Math.round(ny));
  const rates = [.04, .1, .22], drift = [.02, .05, .12];
  for (const s of stars) { const y = ((s.y - sy * rates[s.l] + tick * drift[s.l] * .3) % H + H) % H, x = ((s.x - tick * drift[s.l] * .25) % W + W) % W;
    if (s.tw && Math.sin(tick / 9 + s.ph) < -.4) continue;
    g.fillStyle = s.l === 0 ? '#555577' : s.c; g.fillRect(x | 0, y | 0, 1, 1);
    if (s.l === 2 && s.tw) { g.fillStyle = '#5555aa'; g.fillRect((x | 0) - 1, y | 0, 3, 1); g.fillRect(x | 0, (y | 0) - 1, 1, 3); g.fillStyle = '#fff'; g.fillRect(x | 0, y | 0, 1, 1); } }
  // planet
  const wrap = (v, p) => ((v % p) + p) % p;
  g.drawImage(planet, Math.round(W * .86 - planet.width / 2), Math.round(wrap(H * .78 - sy * .18 + planet.height, H * 1.9) - planet.height * 1.5));
  // far coin
  drawCoin(g, Math.round(W * .02 + 1), Math.round(wrap(H * .62 - sy * .3 + 20, H + 40) - 20), 6, tick / 22, true);
  // ship drift (long loop)
  const L = W + 120, sx = ((tick * .22 + W * .35) % L) - 70; drawShip(g, Math.round(sx), Math.round(wrap(H * .1 - sy * .14 + 30, H + 60) - 30 + Math.sin(tick / 40) * 2), tick);
  // comet
  if (!comet && --nextComet <= 0) comet = { x: W * (.3 + Math.random() * .7), y: -5, vx: -(1.4 + Math.random()), vy: .9 + Math.random() * .6, life: 0 };
  if (comet) { comet.x += comet.vx; comet.y += comet.vy; comet.life++;
    for (let i = 0; i < 26; i++) { g.fillStyle = i < 2 ? '#ffffff' : i < 7 ? '#ffff55' : i < 14 ? '#ff8800' : '#aa3300'; if (i > 14 && (i + tick) % 2) continue; g.fillRect(Math.round(comet.x - comet.vx * i * .7), Math.round(comet.y - comet.vy * i * .7), 1, 1); }
    if (comet.y > H + 30 || comet.x < -40) { comet = null; nextComet = 200 + Math.random() * 300; } }
}
let last = 0; function loop(ts) { if (ts - last > 33) { last = ts; frame(); } if (!RM) requestAnimationFrame(loop); }
frame(); if (!RM) requestAnimationFrame(loop); else addEventListener('scroll', () => frame(), { passive: true });

/* ---------- side coin ---------- */
const bc = document.getElementById('bigcoin');
if (bc) { const x = bc.getContext('2d'); let t = 0; const draw = () => { x.clearRect(0, 0, 64, 64); drawCoin(x, 32, 32, 24, t / 16, true);
    const sp = (t % 90); if (sp < 12) { const k = sp < 6 ? sp : 12 - sp; x.fillStyle = '#fff'; x.fillRect(20, 15 - k / 2 | 0, 1, k + 1); x.fillRect(20 - k / 2 | 0, 15, k + 1, 1); } t++; };
  draw(); if (!RM) setInterval(draw, 50); }

/* ---------- ticker ---------- */
const LINES = ['In 1991, the Bitcoin symbol appeared in a game called <b>Space Quest IV</b>. Seventeen years before Bitcoin.', 'You started with <b>59 buckazoids</b>. Nobody asked why.', '<i>Jan 3, 2009.</i> Block 0. The coin finally had a chain.',
  'Buckazoids: the currency of the Space Quest series since <b>1986</b>.', '<i>Oct 31, 2008.</i> A whitepaper, signed Satoshi Nakamoto.', '"Chancellor on brink of second bailout for banks"',
  '<i>Mar 27, 2025.</i> "BTC in a game from 1991?"', 'Coincidence? <b>Nobody can prove otherwise.</b>', 'BUCKAZOIDS Chapter I: now playing on node 0', 'please do not feed the modem', 'CA: <b>AY4k4zvqQBvjGjQiowqh8DFyBBt11kpheMRqumQppump</b>'];
const tk = document.getElementById('tk'); if (tk) tk.innerHTML = LINES.map(s => s + ' &nbsp;<b>&#8383;</b>&nbsp; ').join('').repeat(2);

/* ---------- hit counters ---------- */
let hits = 0; try { hits = +(localStorage.getItem('bz_hits') || 0) + 1; localStorage.setItem('bz_hits', hits); } catch (e) { hits = 1; }
const base = 59000 + Math.floor((Date.now() - Date.UTC(2009, 0, 3)) / 864e5);
const num = String(base + hits).padStart(7, '0');
for (const id of ['counter1', 'counter2']) { const el = document.getElementById(id); if (el) el.innerHTML = [...num].map(d => '<span>' + d + '</span>').join(''); }

/* ---------- box art + floppy ---------- */
function pxText(x, s, X, Y, col, size) { x.font = (size || 10) + 'px bzvga'; x.textBaseline = 'alphabetic'; x.fillStyle = col; x.fillText(s, X, Y); }
function centerText(x, s, Y, col, size, sh) { x.font = (size || 10) + 'px bzvga'; const w = Math.round(x.measureText(s).width), X = Math.round((x.canvas.width - w) / 2); if (sh) pxText(x, s, X + (size || 10) / 10, Y + (size || 10) / 10, sh, size); pxText(x, s, X, Y, col, size); }
function drawBox() { const c = document.getElementById('boxart'); if (!c) return; const x = c.getContext('2d'), w = 160, h = 200; x.imageSmoothingEnabled = false;
  for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) { const v = fbm(X / 30, y / 26 + 5) - .3 - Math.abs(y / h - .55) * .5; const pal = ['#04020c', '#120830', '#2a0c50', '#4a1270', '#7a2088'];
    x.fillStyle = pal[Math.max(0, Math.min(4, Math.floor(v * 9 + bay(X, y))))]; x.fillRect(X, y, 1, 1); }
  for (let i = 0; i < 160; i++) { x.fillStyle = Math.random() < .2 ? '#ffff99' : '#fff'; x.fillRect(Math.random() * w | 0, Math.random() * h | 0, 1, 1); }
  x.drawImage(planet, 70, 92, 104, 104);
  // rays behind coin
  for (let a = 0; a < 24; a++) { const an = a / 24 * Math.PI * 2; for (let r = 30; r < 56; r++) { if (bay(a, r) > .5 - (r - 30) / 60) continue; x.fillStyle = a % 2 ? '#c07000' : '#f0a000'; x.fillRect(80 + Math.cos(an) * r | 0, 96 + Math.sin(an) * r | 0, 1, 1); } }
  drawCoin(x, 80, 96, 28, .35, true);
  drawShip(x, 8, 150, 9);
  // title band
  x.fillStyle = '#000'; x.fillRect(0, 0, w, 44); x.fillStyle = '#aa0000'; x.fillRect(0, 44, w, 2); x.fillStyle = '#ff5500'; x.fillRect(0, 46, w, 1); x.fillStyle = '#ffaa00'; x.fillRect(0, 47, w, 1);
  x.font = '20px bzvga'; const tw = Math.round(x.measureText('BUCKAZOIDS').width), tx = Math.round((w - tw) / 2);
  pxText(x, 'BUCKAZOIDS', tx + 2, 28, '#3a1400', 20); const gr = x.createLinearGradient(0, 12, 0, 26); [['#fff6b0', 0], ['#ffe04a', .25], ['#ffc020', .45], ['#f09000', .65], ['#c86400', .85]].forEach(([cc, p]) => { gr.addColorStop(p, cc); gr.addColorStop(Math.min(1, p + .2) - .001, cc); });
  pxText(x, 'BUCKAZOIDS', tx, 26, gr, 20);
  centerText(x, 'CHAPTER I: THE COIN OF 59', 39, '#55ffff', 10);
  // bottom band
  x.fillStyle = '#000'; x.fillRect(0, 176, w, 24); x.fillStyle = '#0000aa'; x.fillRect(0, 175, w, 1);
  centerText(x, 'A 1991-STYLE ADVENTURE', 187, '#ffffff', 10); centerText(x, '16 COLORS - PARSER - MOUSE', 197, '#ffff55', 10);
  // VGA corner + sticker
  x.fillStyle = '#ffff55'; x.beginPath(); x.moveTo(w, 48); x.lineTo(w - 26, 48); x.lineTo(w, 74); x.fill(); pxText(x, 'VGA', w - 16, 58, '#aa0000', 10);
  for (let y = -11; y <= 11; y++) for (let X = -11; X <= 11; X++) { const an = Math.atan2(y, X), rr = 9 + 2 * Math.sign(Math.sin(an * 8)); if (Math.hypot(X, y) <= rr) { x.fillStyle = '#ff2020'; x.fillRect(20 + X, 64 + y, 1, 1); } }
  pxText(x, '59', 15, 67, '#ffff55', 10);
  // spine shading
  x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, 0, 3, h); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(3, 0, 1, h); }
function drawFloppy() { const c = document.getElementById('floppy'); if (!c) return; const x = c.getContext('2d');
  const R = (cc, a, b, w, h) => { x.fillStyle = cc; x.fillRect(a, b, w, h); };
  R('#000', 3, 3, 58, 58); R('#2030a0', 4, 4, 56, 56); R('#3a4ac8', 4, 4, 56, 1); R('#3a4ac8', 4, 4, 1, 56); R('#101860', 59, 4, 1, 56); R('#101860', 4, 59, 56, 1);
  x.clearRect(3, 3, 3, 3); R('#000', 5, 3, 1, 1);
  R('#000', 15, 3, 32, 20); R('#c0c0c8', 16, 4, 30, 18); R('#ffffff', 16, 4, 30, 1); R('#808088', 16, 21, 30, 1); R('#202028', 34, 7, 7, 12); R('#808088', 20, 7, 3, 12);
  R('#000', 9, 28, 46, 30); R('#f8f6ea', 10, 29, 44, 28);
  for (let i = 0; i < 3; i++) R('#c8d0ff', 12, 41 + i * 5, 40, 1);
  pxText(x, 'B59.EXE', 12, 37, '#aa0000', 10);
  pxText(x, 'DISK 1 OF 1', 12, 46, '#0000aa', 10); pxText(x, '1.44MB', 12, 54, '#333', 10);
  R('#000', 54, 52, 4, 4); R('#000', 6, 52, 4, 4); }
const fontReady = document.fonts && document.fonts.load ? document.fonts.load('10px bzvga') : Promise.resolve();
fontReady.then(() => { drawBox(); drawFloppy(); }, () => { drawBox(); drawFloppy(); });
})();
