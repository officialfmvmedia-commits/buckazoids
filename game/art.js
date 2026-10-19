/* BUCKAZOIDS art: all pixel art is procedurally drawn here. Original. */
'use strict';
const P_ = PAL;
const light = (x, y, lx, ly, r, sx = 1, sy = 1) => Math.max(0, 1 - Math.hypot((x - lx) / sx, (y - ly) / sy) / r);

/* ---------- hero: Wendell Flux, Sanitation Technician 3rd Class ---------- */
const HC = { skin: '#f2b88c', skinD: '#c47c52', suit: '#e5762a', suitD: '#a24a1a', suitL: '#ffa458', cap: '#34a050', capD: '#1d6a32', hair: '#6a3a1a', boot: '#4a2a14', bootL: '#6e4422', belt: '#3a2410', patch: '#f4f0dc', eye: '#101010', mus: '#8a4418', glove: '#e8d040' };
function heroFrame(dir, f) {
  const p = new Pix(20, 40), C = k => hex(HC[k]);
  const R = (k, x, y, w = 1, h = 1) => p.rect(x, y, x + w, y + h, C(k));
  const th = (k, x0, y0, x1, y1, w) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); R(k, x - (w >> 1), y, w, 1); } };
  const s = Math.round(3 * Math.sin(f / 6 * Math.PI * 2)), bob = (f % 3 === 1) ? 1 : 0;
  const by = 38;
  if (dir === 'right') {
    // back leg + arm
    th('suitD', 9, 25 + bob, 9 - s, 34, 3); R('boot', 8 - s, 35, 4, 3);
    th('suitD', 9, 15 + bob, 9 + s, 22 + bob, 2); R('glove', 9 + s, 22 + bob, 2, 2);
    // torso
    p.rect(6, 13 + bob, 13, 25 + bob, (x, y) => C(x < 8 ? 'suitD' : x > 11 ? 'suitL' : 'suit'));
    R('belt', 6, 22 + bob, 7, 2); R('patch', 10, 15 + bob, 2, 2);
    // head
    R('skin', 8, 12 + bob, 3, 2);
    p.rect(7, 4 + bob, 13, 12 + bob, C('skin')); R('skinD', 7, 10 + bob, 1, 2);
    R('hair', 6, 6 + bob, 2, 5); R('skinD', 8, 7 + bob, 1, 2);
    R('eye', 11, 7 + bob); R('skin', 13, 8 + bob, 1, 2); R('skinD', 13, 9 + bob);
    R('mus', 10, 10 + bob, 3, 1);
    R('cap', 7, 2 + bob, 6, 3); R('capD', 6, 4 + bob, 7, 1); R('capD', 3, 5 + bob, 4, 1); R('cap', 9, 1 + bob, 3, 1);
    // front leg + arm
    th('suit', 10, 25 + bob, 10 + s, 34, 3); R('boot', 9 + s, 35, 5, 3); R('bootL', 12 + s, 35, 2, 1);
    th('suit', 10, 15 + bob, 10 - s, 22 + bob, 2); R('glove', 10 - s, 22 + bob, 2, 2);
  } else {
    const back = dir === 'up';
    const l = s > 0 ? Math.min(2, s) : 0, r = s < 0 ? Math.min(2, -s) : 0;
    th('suitD', 7, 25, 7, 34 - l, 3); R('boot', 5, 35 - l, 4, 3);
    th(back ? 'suitD' : 'suit', 12, 25, 12, 34 - r, 3); R('boot', 11, 35 - r, 4, 3);
    p.rect(4, 13 + bob, 16, 25 + bob, (x, y) => C(x < 6 ? 'suitD' : x > 13 ? 'suitD' : 'suit'));
    R('belt', 4, 22 + bob, 12, 2);
    if (!back) { R('suitL', 9, 13 + bob, 2, 9); R('patch', 12, 15 + bob, 2, 2); }
    const a1 = Math.round(s / 2);
    R('suitD', 2, 14 + bob, 2, 8 + a1); R('glove', 2, 22 + bob + a1, 2, 2);
    R('suitD', 16, 14 + bob, 2, 8 - a1); R('glove', 16, 22 + bob - a1, 2, 2);
    R('skin', 8, 12 + bob, 4, 2);
    p.rect(6, 4 + bob, 14, 12 + bob, C(back ? 'hair' : 'skin'));
    R(back ? 'hair' : 'skinD', 5, 7 + bob, 1, 3); R(back ? 'hair' : 'skinD', 14, 7 + bob, 1, 3);
    if (!back) { R('eye', 8, 7 + bob); R('eye', 11, 7 + bob); R('skinD', 9, 8 + bob, 2, 2); R('mus', 7, 10 + bob, 6, 1); }
    else { R('skinD', 6, 11 + bob, 8, 1); }
    R('cap', 6, 2 + bob, 8, 3); R('cap', 7, 1 + bob, 6, 1); R('capD', 6, 4 + bob, 8, 1);
    if (back) R('capD', 7, 5 + bob, 6, 2); else R('hair', 9, 4 + bob, 2, 1);
  }
  p.outline('#1a0e08');
  return p.done();
}
const flipC = c => { const n = mk(c.width, c.height), x = n.getContext('2d'); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(c, 0, 0); return n; };
const HERO = { down: [], up: [], right: [], left: [] };
for (let f = 0; f < 6; f++) { HERO.down.push(heroFrame('down', f)); HERO.up.push(heroFrame('up', f)); const r = heroFrame('right', f); HERO.right.push(r); HERO.left.push(flipC(r)); }
const HERO_STAND = { down: heroFrame('down', 0), up: heroFrame('up', 0), right: heroFrame('right', 0) }; HERO_STAND.left = flipC(HERO_STAND.right);

/* ---------- cursors & icons ---------- */
const CK = { X: '#000000', W: '#ffffff', B: '#2050d0', R: '#c82020', G: '#808080', Y: '#a0601c', y: '#e0a040', O: '#f0c000' };
const CUR = {
  arrow: { c: art(['X..........','XX.........','XWX........','XWWX.......','XWWWX......','XWWWWX.....','XWWWWWX....','XWWWWWWX...','XWWWWXXXX..','XWWXWX.....','XWX.XWX....','XX..XWX....','.....XWX...','......XX...'], CK), hx: 0, hy: 0 },
  walk: { c: art(['....XXX....','...XWWWX...','...XWWWX...','....XWX....','..XXXWXXX..','.XWWWWWWWX.','.XWXWWWXWX.','..X.XWX.X..','...XWXWX...','..XWX.XWX..','.XWX...XWX.','.XX.....XX.'], CK), hx: 5, hy: 11 },
  look: { c: art(['....XXXXX....','..XXWWWWWXX..','.XWWWXXXWWWX.','XWWWXBBBXWWWX','XWWWXBXBXWWWX','XWWWXBBBXWWWX','.XWWWXXXWWWX.','..XXWWWWWXX..','....XXXXX....'], CK), hx: 6, hy: 4 },
  hand: { c: art(['....XX.......','...XWWX......','...XWWX......','...XWWXXX....','...XWWXWWXX..','.XXXWWXWWXWX.','XWWXWWWWWXWWX','XWWWWWWWWWWWX','.XWWWWWWWWWWX','..XWWWWWWWWX.','...XWWWWWWWX.','....XWWWWWX..','....XXXXXXX..'], CK), hx: 4, hy: 0 },
  talk: { c: art(['..XXXXXXXXX..','.XRRRRRRRRRX.','XRRXXXXXXXRRX','XRXWWWWWWWXRX','XRXXXXXXXXXRX','.XRRRRRRRRRX.','..XXXXXXXXX..'], CK), hx: 6, hy: 3 },
  wait: { c: art(['XXXXXXXXX','XWWWWWWWX','.XWWWWWX.','..XWWWX..','...XWX...','..XGWGX..','.XGGGGGX.','XGGGGGGGX','XXXXXXXXX'], CK), hx: 4, hy: 4 }
};
const ICON_SET = art(['..X.X.X..','.XXXXXXX.','XXWWWWWXX','.XW...WX.','XXW.X.WXX','.XW...WX.','XXWWWWWXX','.XXXXXXX.','..X.X.X..'], CK);
const ICON_INV = art(['...XXXX...','..X....X..','.XXXXXXXX.','XyyyyyyyyX','XyyXXXXyyX','XyyyOOyyyX','XyyyyyyyyX','XYYYYYYYYX','.XXXXXXXX.'], CK);

/* ---------- item icons ---------- */
function coinPix(p, cx, cy, r, mark = true) {
  p.ellipse(cx, cy, r, r, (x, y, dx, dy) => pick(P_.GOLD, .75 - dx * .25 - dy * .35 - (dx * dx + dy * dy > .7 ? .3 : 0), x, y));
  if (mark) { const g = glyph('\u20bf'); const ox = Math.round(cx - g.w / 2), oy = Math.round(cy - 4);
    g.rows.forEach((row, ry) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') p.set(ox + i, oy + ry, hex('#6a3e00')); }); }
}
const ITEM_ICON = {};
(() => {
  let p = new Pix(22, 16); p.line(3, 14, 15, 2, hex('#a0703a')); p.line(4, 14, 16, 2, hex('#7a5028'));
  p.rect(14, 0, 21, 5, (x, y) => pick(P_.GRAY, .7 - (y) * .08 + hn(x, y) * .2, x, y)); p.outline('#000'); ITEM_ICON.mop = p.done();
  p = new Pix(22, 16); for (let i = 0; i < 4; i++) p.ellipse(11, 12 - i * 2.5, 7, 2.6, (x, y, dx, dy) => pick(P_.GRAY, .8 - dy * .3 - dx * .1, x, y)); p.text('59', 7, -1, hex('#e0e0ff')); p.outline('#000'); ITEM_ICON.buckazoids = p.done();
  p = new Pix(22, 16); for (let i = 0; i < 15; i++) { p.set(3 + i, 13 - Math.round(i * .6), hex('#d02020')); p.set(3 + i, 14 - Math.round(i * .6), hex('#801010')); } p.rect(17, 2, 19, 6, hex('#d02020')); p.set(16, 2, hex('#d02020')); p.outline('#000'); ITEM_ICON.crowbar = p.done();
  p = new Pix(22, 16); coinPix(p, 11, 8, 7); p.outline('#000'); ITEM_ICON.coin = p.done();
  p = new Pix(22, 16); p.rect(3, 3, 19, 13, (x, y) => pick(P_.CYAN, .55 + (13 - y) * .03, x, y)); p.rect(3, 5, 19, 7, hex('#101820')); p.rect(5, 9, 9, 12, hex('#e0c030')); p.text('L7', 12, 6, hex('#ffffff')); p.outline('#000'); ITEM_ICON.keycard = p.done();
  p = new Pix(22, 16); p.rect(4, 1, 18, 15, (x, y) => pick(P_.PURP, .35 + hn(x, y) * .1, x, y)); p.rect(7, 1, 15, 6, hex('#c0c8d0')); p.rect(12, 2, 14, 5, hex('#404850')); p.rect(6, 8, 16, 15, hex('#f0ead0')); p.text('?', 9, 8, hex('#c02020')); p.outline('#000'); ITEM_ICON.disk = p.done();
})();

/* ---------- shared painters ---------- */
function crate(p, x, y, w, h, o = {}) {
  const r = o.ramp || P_.WOOD, top = o.top == null ? 5 : o.top;
  if (top) p.poly([[x, y], [x + w, y], [x + w - 3, y - top], [x + 3, y - top]], (X, Y) => pick(r, .8 - (y - Y) * .03 + (hn(X, Y, 5) - .5) * .1, X, Y));
  p.rect(x, y, x + w, y + h, (X, Y) => {
    const lx = X - x, ly = Y - y; let v = .5 - ly / h * .22 + (vn(X, Y, 3, 7) - .5) * .16 + (hn(X, Y, 9) - .5) * .06;
    const border = lx < 3 || lx > w - 4 || ly < 3 || ly > h - 4;
    if (!border && ly % 7 === 0) v -= .3;
    if (border) v += .12;
    const d = Math.abs(lx / w - ly / h) * Math.min(w, h); if (!border && d < 1.7) v += .14;
    if (lx === 0 || ly === h - 1 || lx === w - 1) v -= .4;
    return pick(r, v, X, Y); });
  if (o.label) p.text(o.label, x + ((w - textW(o.label)) >> 1), y + (o.ly || ((h - 7) >> 1)), hex(o.lc || '#1a0e06'));
}
function stars(p, x0, y0, x1, y1, seed, dens = .02) {
  p.rect(x0, y0, x1, y1, (x, y) => { let v = .25 + vn(x, y, 22, seed) * .5 - (y - y0) / (y1 - y0) * .1; return pick(P_.SPACE, v, x, y); });
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const h = hn(x, y, seed); if (h < dens) { const b = h / dens; p.set(x, y, b < .15 ? hex('#ffffff') : b < .5 ? hex('#a0b0d0') : hex('#505878')); } }
}
function hazard(p, pts) { p.poly(pts, (x, y) => (((x + y) >> 2) & 1) ? hex('#d8a818') : hex('#18140a')); }
function frameRect(p, x0, y0, x1, y1, t, rmp) { const r = rmp || P_.METAL;
  p.rect(x0, y0, x1, y1, (x, y) => { const e = Math.min(x - x0, y - y0, x1 - 1 - x, y1 - 1 - y); if (e >= t) return null; let v = .55 + (x - x0 < t || y - y0 < t ? .15 : -.15) - (e === 0 ? .25 : 0) + (e === t - 1 ? -.2 : 0); return pick(r, v, x, y); }); }
function perspFloor(p, y0, vpx, vpy, rmp, o = {}) {
  p.rect(0, y0, W, H, (x, y) => {
    const t = (y - y0) / (H - y0); let v = (o.base || .14) + (o.grad || .36) * t;
    if (o.lx != null) v += (o.lamt || .35) * light(x, y, o.lx, o.ly, o.lr || 90, 2.2, .8);
    const u = (x - vpx) / (y - vpy) * (o.cols || 6), fu = u - Math.floor(u); if (fu < (o.lw || .06)) v -= .18;
    const z = 1 / (t + .12), fz = (z * (o.rows || 3)) % 1; if (fz < .12) v -= .16;
    if (o.check) { if (((Math.floor(u) + Math.floor(z * (o.rows || 3))) & 1)) v -= o.check; }
    v += (vn(x, y, 4, 3) - .5) * (o.noise == null ? .12 : o.noise);
    return pick(rmp, v, x, y); });
}

/* ---------- ROOM 1: cargo bay of the S.S. MEMPOOL ---------- */
function paintBay() {
  const p = new Pix();
  p.rect(0, 0, W, 125, (x, y) => {
    let v = .16 + .2 * (y / 125) + .5 * light(x, y, 160, 26, 150, 1.6, 1);
    const px = x % 44, py = y % 34; if (px === 0) v -= .25; else if (px === 1) v += .12; if (py === 0) v -= .2; else if (py === 1) v += .08;
    if (px === 4 && py % 8 === 4) v += .3; if (px === 3 && py % 8 === 4) v -= .2;
    v += (vn(x, y, 5, 1) - .5) * .14 + (hn(x, y, 2) - .5) * .05; if (vn(x, y, 9, 4) > .78) v -= .12;
    return pick(P_.METAL, v, x, y); });
  p.rect(0, 0, W, 16, (x, y) => { let v = .06 + .05 * y / 16; if ((((x + y * 2) % 36) + 36) % 36 < 3 || (((x - y * 2) % 36) + 36) % 36 < 3) v += .22; if (y === 15) v += .2; return pick(P_.METAL, v, x, y); });
  for (const [py, ph] of [[16, 5], [22, 3]]) p.rect(0, py, W, py + ph, (x, y) => { const t = (y - py + .5) / ph; let v = .12 + .55 * Math.sin(t * Math.PI) * (t < .45 ? 1.2 : .75) + .2 * light(x, y, 160, py, 120); if (x % 60 < 3) v = .5 + (x % 60) * .1; return pick(P_.METAL, v, x, y); });
  p.rect(0, 116, W, 125, (x, y) => pick(P_.METAL, y < 118 ? .55 : y < 120 ? .3 : .12, x, y));
  // lamp
  p.rect(144, 25, 176, 30, (x, y) => pick(P_.AMBER, .98 - (y - 25) * .1, x, y)); p.rect(142, 24, 178, 25, hex('#2c374b'));
  // porthole
  p.ellipse(118, 44, 15, 15, (x, y, dx, dy) => pick(P_.METAL, .6 - dy * .3 - dx * .1, x, y));
  p.ellipse(118, 44, 11, 11, (x, y) => pick(P_.SPACE, .35 + vn(x, y, 8, 3) * .5, x, y));
  for (let y = 33; y < 56; y++) for (let x = 107; x < 130; x++) if (Math.hypot(x - 118, y - 44) < 11 && hn(x, y, 31) < .03) p.set(x, y, hex('#ffffff'));
  p.ellipse(113, 39, 3, 2, (x, y) => (x + y) & 1 ? hex('#3c4a61') : null);
  // airlock
  p.rect(16, 30, 70, 39, (x, y) => pick(P_.RED, .5 - (y - 30) * .03, x, y)); p.text('AIRLOCK', 22, 31, hex('#ffe0d0'));
  hazard(p, [[14, 42], [72, 42], [72, 124], [14, 124]]);
  p.rect(19, 47, 67, 124, (x, y) => { let v = .4 + .15 * light(x, y, 30, 60, 60) - (y - 47) * .002; if (x === 43) v -= .35; if (x === 44) v += .15; if ((y - 47) % 18 === 0) v -= .15; return pick(P_.METAL, v, x, y); });
  p.ellipse(43, 84, 9, 9, (x, y, dx, dy) => { const r = Math.hypot(dx, dy); if (r > .72) return pick(P_.RED, .6 - dy * .3, x, y); if (r < .25) return pick(P_.RED, .4, x, y); return Math.abs(dx) < .14 || Math.abs(dy) < .14 ? pick(P_.RED, .5, x, y) : null; });
  p.rect(22, 100, 64, 108, hex('#e8e0c8')); p.text('BE QUIET', 25, 101, hex('#a01010'));
  // door to deck 2
  frameRect(p, 250, 50, 302, 124, 4);
  p.rect(254, 54, 298, 124, (x, y) => { let v = .48 + .12 * light(x, y, 260, 60, 70) - (y - 54) * .002; if (x === 276) v -= .4; if (x === 277) v += .1; if (y > 86 && y < 92) v += x % 4 === 0 ? -.2 : .12; return pick(P_.METAL, v, x, y); });
  p.rect(262, 66, 290, 74, hex('#0c2014')); p.text('DECK 2', 264, 66, hex('#50e080'));
  p.rect(254, 44, 298, 49, (x, y) => pick(P_.METAL, .3, x, y));
  // background crates
  crate(p, 90, 64, 42, 26, { label: 'TX-0059', lc: '#2a160a' });
  crate(p, 84, 90, 54, 34, { label: 'MEMPOOL', lc: '#2a160a', top: 0 });
  crate(p, 140, 98, 46, 26, { label: 'UNCONF.', lc: '#2a160a' });
  crate(p, 140, 72, 30, 26, { ramp: P_.METAL, label: '##', lc: '#0e1119', top: 4 });
  // floor
  perspFloor(p, 125, 160, 60, P_.DECK, { lx: 160, ly: 150, lr: 95, lamt: .4 });
  hazard(p, [[12, 125], [74, 125], [77, 131], [8, 131]]);
  p.poly([[84, 125], [186, 125], [194, 129], [78, 129]], (x, y) => pick(P_.DECK, .08, x, y)); // crate shadow
  // grime puddle
  p.ellipse(110, 178, 22, 5, (x, y) => (hn(x, y, 77) > .35) ? pick(P_.DECK, .1, x, y) : null);
  return p.done();
}
function paintFragile(open) {
  const p = new Pix(48, 44);
  crate(p, 2, 10, 42, 32, { label: 'FRAGILE', lc: '#a01010', ly: 4, top: 5 });
  p.text('2009', 14, 27, hex('#2a160a'));
  if (open) {
    p.poly([[5, 10], [41, 10], [38, 6], [8, 6]], hex('#0a0604'));
    for (let i = 0; i < 9; i++) p.rect(40 + (i > 4 ? 1 : 0), 1 + i, 47, 2 + i, (x, y) => pick(P_.WOOD, .6 - (x - 40) * .05, x, y));
    p.rect(8, 7, 38, 10, (x, y) => hn(x, y, 3) > .5 ? hex('#c6a050') : hex('#8a6a30'));
  }
  return p.done();
}
function paintToolbox(open) {
  const p = new Pix(28, 16);
  p.rect(2, 6, 26, 16, (x, y) => pick(P_.RED, .7 - (y - 6) * .04 - (x < 4 ? .2 : 0), x, y));
  p.rect(2, 9, 26, 10, hex('#5a0a0a'));
  if (open) { p.rect(1, 3, 27, 6, hex('#280404')); p.poly([[2, 3], [26, 3], [24, 0], [4, 0]], (x, y) => pick(P_.RED, .6, x, y)); p.rect(6, 4, 22, 6, hex('#808890')); }
  else { p.rect(2, 4, 26, 6, (x, y) => pick(P_.RED, .9, x, y)); p.rect(11, 1, 17, 4, hex('#303030')); p.rect(12, 2, 16, 4, null); }
  p.outline('#14080a'); return p.done();
}
function paintBarrel() {
  const p = new Pix(40, 36);
  p.rect(4, 4, 38, 36, (x, y) => { const dx = (x - 21) / 17; let v = .65 - dx * dx * .5 - dx * .2; const ly = y - 4; if (ly % 10 < 2) v -= .25; if (ly % 10 === 2) v += .1; return pick(P_.TEAL, v, x, y); });
  p.ellipse(21, 4, 17, 4, (x, y, dx, dy) => pick(P_.TEAL, .35 + dy * .2, x, y)); p.ellipse(21, 4, 12, 2.5, hex('#06241f'));
  p.text('WASTE', 10, 16, hex('#e0d040'));
  return p.done();
}

/* ---------- ROOM 2: deck-2 corridor ---------- */
function paintHall() {
  const p = new Pix();
  p.rect(0, 0, W, 127, (x, y) => {
    let v = .2 + .18 * y / 127 + .18 * light(x, y, 160, 18, 160, 2, 1);
    const px = (x + 8) % 32; if (px === 0) v -= .25; if (px === 1) v += .1; if (y === 40 || y === 110) v -= .2; if (y === 41 || y === 111) v += .12;
    if (y > 111) v += .05 - (y % 3 === 0 ? .1 : 0);
    v += (vn(x, y, 6, 21) - .5) * .12; return pick(P_.METAL, v, x, y); });
  p.rect(0, 0, W, 14, (x, y) => { let v = .07 + y * .01; if (x % 64 > 20 && x % 64 < 44 && y > 9 && y < 13) v = .95; return x % 64 > 20 && x % 64 < 44 && y > 9 && y < 13 ? pick(P_.CYAN, .9, x, y) : pick(P_.METAL, v, x, y); });
  // window with planet
  frameRect(p, 120, 30, 202, 100, 5);
  stars(p, 125, 35, 197, 95, 4, .03);
  p.ellipse(176, 72, 30, 30, (x, y, dx, dy) => { const dz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy)); const l = clamp(-dx * .6 - dy * .5 + dz * .6, 0, 1);
    const band = Math.sin((dy * 9) + vn(x, y, 7, 8) * 3) * .12; return x >= 125 && x < 197 && y >= 35 && y < 95 ? pick(P_.GAS, l * .95 + band, x, y) : null; });
  for (let a = 0; a < 720; a++) { const t = a / 720 * Math.PI * 2, x = 176 + Math.cos(t) * 46, y = 72 + Math.sin(t) * 7 - Math.cos(t) * 4; if (Math.sin(t) < 0 && Math.hypot(x - 176, y - 72) < 30) continue; for (let k = 0; k < 2; k++) { const xx = Math.round(x), yy = Math.round(y) + k; if (xx >= 125 && xx < 197 && yy >= 35 && yy < 95) p.set(xx, yy, pick(P_.AMBER, .55 + k * .1, xx, yy)); } }
  p.rect(160, 30, 162, 100, (x, y) => pick(P_.METAL, .5, x, y));
  // west door
  frameRect(p, 4, 52, 40, 127, 4); p.rect(8, 56, 36, 127, (x, y) => pick(P_.METAL, .1 + (y - 56) * .002, x, y)); p.rect(10, 58, 34, 70, null);
  p.text('BAY', 13, 44, hex('#d0d8e0'));
  // vending machine
  p.rect(46, 56, 84, 127, (x, y) => pick(P_.RED, .55 - (x - 46) * .006 + (x === 46 ? -.3 : 0) + (x === 83 ? -.3 : 0), x, y));
  p.rect(50, 62, 72, 100, (x, y) => pick(P_.AMBER, .6 + .3 * light(x, y, 61, 75, 22) + ((x + y) % 7 === 0 ? .1 : 0), x, y));
  p.text('FIZZ', 52, 64, hex('#a01010')); p.text('O', 58, 73, hex('#a01010'));
  for (let i = 0; i < 4; i++) p.ellipse(61, 86 + i * 0 , 4 , 6, (x, y, dx, dy) => pick(P_.RED, .7 - dx * .3, x, y));
  for (let i = 0; i < 6; i++) p.rect(75, 64 + i * 6, 81, 68 + i * 6, (x, y) => pick(P_.GRAY, .6 + (y % 2) * .1, x, y));
  p.rect(52, 108, 72, 116, hex('#140404')); p.rect(75, 104, 81, 110, hex('#0a0a0a'));
  // locker
  p.rect(90, 60, 116, 127, (x, y) => { let v = .55 - (x - 90) * .01 + (x === 90 ? -.3 : 0); if (y > 66 && y < 82 && (y % 3 === 0) && x > 95 && x < 111) v -= .25; return pick(P_.GRAY, v, x, y); });
  p.rect(110, 90, 113, 98, hex('#e0c030')); p.rect(92, 112, 114, 118, hex('#e8e0c8')); p.text('FLUX', 95, 112, hex('#202020'));
  // bulkhead to Lab 7
  hazard(p, [[206, 44], [264, 44], [264, 127], [206, 127]]);
  p.rect(212, 50, 258, 127, (x, y) => { let v = .4 + .2 * light(x, y, 235, 60, 60) - (y - 50) * .002; if (Math.abs(x - 235) < 1) v -= .4; if ((y - 50) % 15 === 0) v -= .15; return pick(P_.METAL, v, x, y); });
  p.rect(214, 34, 256, 42, hex('#2a0640')); p.text('LAB 7', 222, 34, hex('#e0a0ff'));
  p.rect(266, 80, 276, 98, (x, y) => pick(P_.GRAY, .4, x, y)); p.rect(268, 83, 274, 86, hex('#c02020')); p.rect(268, 89, 274, 96, hex('#101010'));
  // busted panel
  frameRect(p, 286, 66, 314, 108, 3); p.rect(289, 69, 311, 105, (x, y) => pick(P_.METAL, .06 + hn(x, y, 6) * .06, x, y));
  for (let i = 0; i < 5; i++) p.line(292 + i * 4, 70, 290 + i * 5, 104, hex(['#c02020', '#e0c030', '#2080e0', '#20c040', '#e0e0e0'][i]));
  // floor + cable
  perspFloor(p, 127, 160, 50, P_.DECK, { lx: 160, ly: 160, lr: 120, lamt: .3, cols: 10, rows: 5, lw: .1 });
  p.rect(0, 127, W, 131, (x, y) => pick(P_.METAL, .2 + (y - 127) * .02, x, y));
  const cab = (t) => [300 + Math.sin(t * 3) * 6 - t * 10, 106 + t * 52 + Math.sin(t * 7) * 2];
  for (let i = 0; i < 200; i++) { const t = i / 200, [x, y] = cab(t); p.rect(x - 1, y, x + 3, y + 3, (X, Y) => (Math.floor(t * 40) % 3 === 0) ? hex('#e0b020') : pick(P_.GRAY, Y === Math.round(y) ? .45 : .2, X, Y)); }
  p.rect(286, 158, 296, 162, hex('#d0a020'));
  return p.done();
}

/* ---------- ROOM 3: Lab 7 / temporal anomaly ---------- */
function paintLab() {
  const p = new Pix();
  p.rect(0, 0, W, 135, (x, y) => { const dx = (x - 160) / 160; let v = .12 + .45 * light(x, y, 160, 92, 130, 1.3, 1) - dx * dx * .1;
    const ang = Math.atan2(y - 260, x - 160), rib = ((ang * 30) % 1 + 1) % 1; if (rib < .08) v -= .2; else if (rib < .14) v += .08;
    if (y % 26 === 0) v -= .12; v += (vn(x, y, 5, 41) - .5) * .12; return pick(P_.PURP, v, x, y); });
  p.rect(0, 0, W, 12, (x, y) => pick(P_.PURP, .05, x, y));
  // coils
  for (const cx of [100, 220]) {
    p.rect(cx - 5, 40, cx + 5, 132, (x, y) => pick(P_.METAL, .5 - Math.abs(x - cx) * .07, x, y));
    for (let k = 0; k < 7; k++) p.ellipse(cx, 50 + k * 11, 10, 3, (x, y, dx, dy) => pick(P_.AMBER, .45 - dy * .25 - dx * .1, x, y));
    p.ellipse(cx, 36, 8, 8, (x, y, dx, dy) => pick(P_.CYAN, .9 - Math.hypot(dx, dy) * .5 - dy * .2, x, y));
  }
  // console
  p.poly([[22, 104], [78, 104], [84, 134], [16, 134]], (x, y) => pick(P_.METAL, .35 + (y - 104) * .004 + (y === 104 ? .3 : 0), x, y));
  p.rect(26, 78, 74, 104, (x, y) => pick(P_.METAL, .25, x, y)); p.rect(29, 81, 71, 101, (x, y) => pick(P_.GREEN, .15 + (y % 2) * .05, x, y));
  p.text('YEAR', 32, 82, hex('#40e070')); p.text('1991?', 32, 91, hex('#a0ffb8'));
  for (let i = 0; i < 8; i++) p.rect(26 + i * 6, 112, 30 + i * 6, 115, hex(['#e03028', '#f0cc30', '#40c870', '#2090a8'][i % 4]));
  // exit door
  frameRect(p, 266, 56, 310, 135, 4, P_.PURP); p.rect(270, 60, 306, 135, (x, y) => pick(P_.METAL, .1 + (y - 60) * .002, x, y)); p.text('EXIT', 278, 48, hex('#e0c0ff'));
  // floor + platform
  p.rect(0, 135, W, H, (x, y) => { let v = .1 + (y - 135) * .004 + .3 * light(x, y, 160, 150, 120, 2, .7); return pick(P_.PURP, v + (vn(x, y, 3, 2) - .5) * .1, x, y); });
  p.ellipse(160, 160, 112, 28, (x, y, dx, dy) => { const r = Math.hypot(dx, dy); if (r > .94) return pick(P_.CYAN, .7, x, y); if (Math.abs(r - .6) < .025) return pick(P_.CYAN, .45, x, y); return pick(P_.METAL, .25 + (1 - r) * .2 + (y > 160 ? .05 : 0), x, y); });
  p.ellipse(160, 140, 34, 7, (x, y, dx, dy) => pick(P_.METAL, .4 - dy * .2, x, y));
  for (let i = 0; i < 300; i++) { const t = i / 300; const x = 84 - t * 40, y = 134 + t * 50 + Math.sin(t * 9) * 3; p.set(x, y, hex('#101018')); p.set(x + 1, y, hex('#202030')); }
  return p.done();
}

/* ---------- ROOM 4: FLOPPY PLANET, 1991 ---------- */
function paintMall() {
  const p = new Pix();
  p.rect(0, 0, W, 125, (x, y) => { let v = .25 + .25 * (y / 125) + .2 * light(x, y, 160, 0, 160, 1.5, 1);
    const m = hn(x >> 3, y >> 3, 51); const lx = x & 7, ly = y & 7;
    if (m < .12 && lx + ly < 6 && lx > 1 && ly > 1) return pick(P_.TEAL, .6, x, y);
    if (m > .9 && (lx - 4) ** 2 + (ly - 4) ** 2 < 4) return pick(P_.YEL, .7, x, y);
    if (m > .5 && m < .56 && ly === ((lx >> 1) & 1) + 3) return hex('#f0f0f0');
    return pick(P_.PINK, v, x, y); });
  // sign plate + glow
  p.rect(60, 8, 262, 32, (x, y) => pick(P_.PURP, .08 + .25 * light(x, y, 161, 20, 90, 2, 1), x, y)); frameRect(p, 60, 8, 262, 32, 2, P_.PINK);
  // shelves
  p.rect(8, 36, 196, 126, (x, y) => pick(P_.WOOD, .25 + (x < 10 || x > 193 ? .3 : 0), x, y));
  const cols = [P_.CYAN, P_.RED, P_.YEL, P_.GREEN, P_.PINK, P_.AMBER, P_.PURP, P_.TEAL];
  let seed = 7;
  for (const sy of [62, 92, 122]) {
    p.rect(8, sy, 196, sy + 3, (x, y) => pick(P_.WOOD, .7 - (y - sy) * .2, x, y));
    let x = 12;
    while (x < 186) { const w = 8 + Math.floor(hn(x, sy, seed) * 7), h = 17 + Math.floor(hn(sy, x, seed) * 7), c = cols[Math.floor(hn(x, x, sy) * cols.length)];
      if (x + w > 192) break;
      p.rect(x, sy - h, x + w, sy, (X, Y) => { let v = .62 - (X - x) / w * .25; if (Y - (sy - h) > 3 && Y - (sy - h) < 6) return hex('#f8f0e0'); if ((Y - (sy - h)) > 9 && (X - x) > 1 && (X - x) < w - 2 && hn(X, Y, 2) < .25) v += .4; return pick(c, v, X, Y); });
      p.rect(x + w - 1, sy - h, x + w, sy, hex('#100810'));
      x += w + (hn(x, 1, 2) < .2 ? 3 : 1); }
  }
  p.rect(64, 37, 140, 44, hex('#f8f0e0')); p.text('NEW RELEASES', 66, 37, hex('#c01060'));
  // poster
  p.rect(278, 32, 316, 86, (x, y) => pick(P_.CYAN, .2 + (y - 32) * .008, x, y)); stars(p, 280, 34, 314, 60, 9, .05);
  p.ellipse(297, 52, 7, 7, (x, y, dx, dy) => pick(P_.GAS, .8 - dx * .4 - dy * .3, x, y)); p.text('BIT', 285, 63, hex('#f0cc30')); p.text('BLASTR', 280, 72, hex('#f0cc30'));
  // clerk (alien with mullet)
  p.rect(232, 78, 274, 106, (x, y) => pick(P_.TEAL, .5 - Math.abs(x - 253) * .015, x, y)); p.rect(250, 78, 256, 106, (x, y) => pick(P_.PINK, .6, x, y));
  p.rect(260, 86, 270, 92, hex('#f0f0e0')); p.text('ZB', 261, 85, hex('#202020'));
  p.ellipse(253, 66, 12, 13, (x, y, dx, dy) => pick(P_.SKINA, .7 - dx * .3 - dy * .2, x, y));
  p.poly([[240, 60], [266, 60], [270, 84], [262, 76], [244, 76], [236, 84]], (x, y) => y < 64 || x < 244 || x > 262 ? pick(P_.PURP, .7 - (y - 60) * .01 + hn(x, y) * .1, x, y) : null);
  for (const ex of [246, 253, 260]) { p.rect(ex - 2, 64, ex + 2, 68, hex('#ffffff')); p.rect(ex, 65, ex + 1, 67, hex('#101010')); }
  p.rect(248, 73, 258, 74, hex('#1a4a16'));
  // counter
  p.rect(198, 104, W, 111, (x, y) => pick(P_.PINK, .85 - (y - 104) * .05, x, y));
  p.rect(198, 111, W, 148, (x, y) => { let v = .45 - (y - 111) * .006; if ((y - 111) % 9 < 2) v += .25; return pick(P_.TEAL, v, x, y); });
  p.rect(198, 111, 200, 148, hex('#06241f'));
  p.rect(284, 86, 312, 104, (x, y) => pick(P_.GRAY, .5 - (y - 86) * .01, x, y)); p.rect(287, 89, 309, 95, hex('#062a10')); p.text('59.00', 288, 88, hex('#40ff70'));
  // floor
  perspFloor(p, 126, 160, 40, P_.TEAL, { base: .3, grad: .3, cols: 3, rows: 2.2, lw: 0, check: .32, lx: 140, ly: 170, lr: 120, lamt: .2, noise: .06 });
  p.rect(0, 126, 198, 129, (x, y) => pick(P_.WOOD, .2, x, y));
  // potted plant
  p.rect(176, 132, 196, 150, (x, y) => pick(P_.AMBER, .5 - (x - 176) * .02, x, y));
  for (let i = 0; i < 9; i++) { const a = -2.6 + i * .32; for (let r = 0; r < 26; r++) { const x = 186 + Math.cos(a) * r, y = 132 + Math.sin(a) * r * .9 + r * r * .012; p.set(x, y, pick(P_.GREEN, .6 - r * .015, x | 0, y | 0)); p.set(x + 1, y, pick(P_.GREEN, .4, x | 0, y | 0)); } }
  return p.done();
}
function paintKiosk() {
  const p = new Pix(40, 62);
  p.rect(16, 30, 24, 60, (x, y) => pick(P_.GRAY, .5 - (x - 16) * .04, x, y)); p.rect(8, 57, 32, 62, (x, y) => pick(P_.GRAY, .35, x, y));
  p.rect(2, 2, 38, 32, (x, y) => pick(P_.GRAY, .72 - (y - 2) * .008 - (x > 35 ? .25 : 0), x, y));
  p.rect(6, 5, 34, 25, (x, y) => pick(P_.GREEN, .12 + (y % 2) * .06 + .1 * light(x, y, 14, 9, 18), x, y));
  p.rect(10, 27, 30, 29, hex('#202020')); p.text('C:\\>', 8, 7, hex('#40e070'));
  p.outline('#0a0a0a'); return p.done();
}

/* ---------- ROOM 5: the Genesis Chamber ---------- */
function paintGenesis() {
  const p = new Pix();
  stars(p, 0, 0, W, 130, 99, .015);
  p.rect(0, 0, W, 130, (x, y) => { const g = light(x, y, 160, 92, 140, 1.4, 1); if (g < .05) return null; const c = p.get(x, y); return (hn(x, y, 7) < g * g * .18) ? pick(P_.AMBER, g * .45, x, y) : c; });
  p.rect(0, 130, W, H, (x, y) => { const t = (y - 130) / 70; const u = (x - 160) / (y - 112) * 4; const z = 1 / (t + .06);
    let v = .02 + .1 * light(x, y, 160, 140, 150, 2, .6); if (u - Math.floor(u) < .07 * (1 + t) || (z * 2) % 1 < .06 + t * .1) v += .5 * (1 - t * .3) * (.5 + light(x, y, 160, 130, 200)); return pick(P_.AMBER, v, x, y); });
  return p.done();
}
function paintCube(sz = 26, glow = 1) {
  const p = new Pix(96, 110), cx = 48, top = 6, d = sz * 1.7;
  const T = [cx, top], Rr = [cx + sz * 1.4, top + sz * .7], B = [cx, top + sz * 1.4], L = [cx - sz * 1.4, top + sz * .7];
  const dn = q => [q[0], q[1] + d];
  p.poly([T, Rr, B, L], (x, y) => pick(P_.GOLD, .8 + hn(x, y) * .1 - (((x + y * 2) >> 2) % 5 === 0 ? .15 : 0), x, y));
  p.poly([L, B, dn(B), dn(L)], (x, y) => { let v = .55 - (y - top) * .002; if ((y - Math.round((x - L[0]) * .5)) % 6 === 0) v -= .2; if (hn(x >> 1, y >> 1, 4) < .08) v += .3; return pick(P_.GOLD, v * glow, x, y); });
  p.poly([B, Rr, dn(Rr), dn(B)], (x, y) => { let v = .38; if ((y + Math.round((x - B[0]) * .5)) % 6 === 0) v -= .15; if (hn(x >> 1, y >> 1, 5) < .08) v += .3; return pick(P_.GOLD, v * glow, x, y); });
  for (const [a, b] of [[T, Rr], [Rr, B], [B, L], [L, T], [L, dn(L)], [B, dn(B)], [Rr, dn(Rr)], [dn(L), dn(B)], [dn(B), dn(Rr)]]) p.line(a[0], a[1], b[0], b[1], hex('#fffbe0'));
  p.text('0', 26, 52, hex('#3a2000')); p.text('0', 25, 51, hex('#fff4c8'));
  return p.done();
}
