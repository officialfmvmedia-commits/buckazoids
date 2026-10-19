/* BUCKAZOIDS engine: font, pixel painter, dithering, audio. Original code. */
'use strict';
const W = 320, H = 200;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').imageSmoothingEnabled = false; return c; };

/* ---------- hand-authored proportional bitmap font (7px caps, 2px descenders) ---------- */
const FONT = {
'A':'.##./#..#/#..#/####/#..#/#..#/#..#','B':'###./#..#/#..#/###./#..#/#..#/###.','C':'.##./#..#/#.../#.../#.../#..#/.##.',
'D':'###./#..#/#..#/#..#/#..#/#..#/###.','E':'####/#.../#.../###./#.../#.../####','F':'####/#.../#.../###./#.../#.../#...',
'G':'.##./#..#/#.../#.##/#..#/#..#/.###','H':'#..#/#..#/#..#/####/#..#/#..#/#..#','I':'###/.#./.#./.#./.#./.#./###',
'J':'..##/...#/...#/...#/#..#/#..#/.##.','K':'#..#/#..#/#.#./##../#.#./#..#/#..#','L':'#.../#.../#.../#.../#.../#.../####',
'M':'#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#','N':'#..#/##.#/##.#/#.##/#.##/#..#/#..#','O':'.##./#..#/#..#/#..#/#..#/#..#/.##.',
'P':'###./#..#/#..#/###./#.../#.../#...','Q':'.##./#..#/#..#/#..#/#..#/#.#./.#.#','R':'###./#..#/#..#/###./#.#./#..#/#..#',
'S':'.###/#.../#.../.##./...#/...#/###.','T':'#####/..#../..#../..#../..#../..#../..#..','U':'#..#/#..#/#..#/#..#/#..#/#..#/.##.',
'V':'#...#/#...#/#...#/#...#/.#.#./.#.#./..#..','W':'#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#','X':'#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
'Y':'#...#/#...#/.#.#./..#../..#../..#../..#..','Z':'####/...#/..#./.#../#.../#.../####',
'a':'..../..../.##./...#/.###/#..#/.###','b':'#.../#.../###./#..#/#..#/#..#/###.','c':'..../..../.##./#.../#.../#.../.##.',
'd':'...#/...#/.###/#..#/#..#/#..#/.###','e':'..../..../.##./#..#/####/#.../.##.','f':'.##/#../###/#../#../#../#..',
'g':'..../..../.###/#..#/#..#/#..#/.###/...#/.##.','h':'#.../#.../###./#..#/#..#/#..#/#..#','i':'#/./#/#/#/#/#',
'j':'..#/.../..#/..#/..#/..#/..#/..#/##.','k':'#.../#.../#..#/#.#./##../#.#./#..#','l':'#./#./#./#./#./#./.#',
'm':'...../...../##.#./#.#.#/#.#.#/#.#.#/#.#.#','n':'..../..../###./#..#/#..#/#..#/#..#','o':'..../..../.##./#..#/#..#/#..#/.##.',
'p':'..../..../###./#..#/#..#/#..#/###./#.../#...','q':'..../..../.###/#..#/#..#/#..#/.###/...#/...#','r':'..../..../#.##/##../#.../#.../#...',
's':'..../..../.###/#.../.##./...#/###.','t':'.#./.#./###/.#./.#./.#./..#','u':'..../..../#..#/#..#/#..#/#..#/.###',
'v':'...../...../#...#/#...#/.#.#./.#.#./..#..','w':'...../...../#...#/#...#/#.#.#/#.#.#/.#.#.','x':'..../..../#..#/#..#/.##./#..#/#..#',
'y':'..../..../#..#/#..#/#..#/#..#/.###/...#/.##.','z':'..../..../####/..#./.#../#.../####',
'0':'.##./#..#/#.##/##.#/#..#/#..#/.##.','1':'.#./##./.#./.#./.#./.#./###','2':'.##./#..#/...#/..#./.#../#.../####',
'3':'###./...#/...#/.##./...#/...#/###.','4':'#..#/#..#/#..#/####/...#/...#/...#','5':'####/#.../###./...#/...#/#..#/.##.',
'6':'.##./#.../#.../###./#..#/#..#/.##.','7':'####/...#/..#./..#./.#../.#../.#..','8':'.##./#..#/#..#/.##./#..#/#..#/.##.',
'9':'.##./#..#/#..#/.###/...#/...#/.##.',
' ':'...','.':'./././././././#',',':'./././././././#/#','!':'#/#/#/#/#/./#','?':'.##./#..#/...#/..#./.#../..../.#..',
"'":'#/#','"':'#.#/#.#','-':'.../.../.../###',':':'././#/././#',';':'././#/././#/#','(':'.#/#./#./#./#./#./.#',')':'#./.#/.#/.#/.#/.#/#.',
'/':'...#/...#/..#./.#../.#../#.../#...','+':'..../.#./###/.#.','=':'..../..../####/..../####','*':'.../#.#/.#./#.#',
'#':'...../.#.#./#####/.#.#./#####/.#.#.','$':'.#../.###/#.#./.##./..##/###./.#..','%':'#..#/...#/..#./.#../#.../#..#',
'&':'.#../#.#./.#../#.#./#..#/#.#./.#.#','_':'..../..../..../..../..../..../####','<':'.../..#/.#./#../.#./..#','>':'.../#../.#./..#/.#./#..',
'[':'##/#./#./#./#./#./##',']':'##/.#/.#/.#/.#/.#/##','|':'#/#/#/#/#/#/#/#','@':'.###./#...#/#.###/#.#.#/#.###/#..../.####',
'\u20bf':'.#.#./####./#...#/####./#...#/#...#/####./.#.#.','\u00b7':'./././#','~':'..../..../.#.#/#.#.','\\':'#.../#.../.#../.#../..#./...#/...#'
};
const GL = {};
for (const k in FONT) { const rows = FONT[k].split('/'); GL[k] = { w: Math.max(...rows.map(r => r.length)), rows }; }
const glyph = ch => GL[ch] || GL[ch.toUpperCase()] || GL['?'];
function textW(s) { let w = 0; for (const ch of s) w += glyph(ch).w + 1; return w ? w - 1 : 0; }
const gcache = new Map();
function glyphCanvas(ch, col) {
  const key = ch + col; let c = gcache.get(key); if (c) return c;
  const g = glyph(ch); c = mk(Math.max(1, g.w), 10); const x = c.getContext('2d'); x.fillStyle = col;
  g.rows.forEach((r, y) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') x.fillRect(i, y, 1, 1); });
  gcache.set(key, c); return c;
}
function text(c2, s, x, y, col) { x = Math.round(x); y = Math.round(y); for (const ch of s) { c2.drawImage(glyphCanvas(ch, col), x, y); x += glyph(ch).w + 1; } }
function textSh(c2, s, x, y, col, sh) { text(c2, s, x + 1, y + 1, sh || '#000'); text(c2, s, x, y, col); }
function textBig(c2, s, x, y, sc, cols) {
  for (const ch of s) { const g = glyph(ch);
    g.rows.forEach((r, ry) => { c2.fillStyle = Array.isArray(cols) ? cols[Math.min(ry, cols.length - 1)] : cols;
      for (let i = 0; i < r.length; i++) if (r[i] === '#') c2.fillRect(x + i * sc, y + ry * sc, sc, sc); });
    x += (g.w + 1) * sc; }
}
function wrap(s, maxW) {
  const out = [];
  for (const para of s.split('\n')) {
    if (para === '') { out.push(''); continue; }
    let line = '';
    for (const w of para.split(' ')) { const t = line ? line + ' ' + w : w; if (textW(t) > maxW && line) { out.push(line); line = w; } else line = t; }
    out.push(line);
  }
  return out;
}

/* ---------- color + dithering ---------- */
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const ramp = a => a.map(hex);
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
const bay = (x, y) => B4[((y & 3) << 2) | (x & 3)];
function pick(r, v, x, y) { v = v < 0 ? 0 : v > 1 ? 1 : v; const f = v * (r.length - 1); let i = Math.floor(f); if (f - i > bay(x, y)) i++; return r[i >= r.length ? r.length - 1 : i]; }
function hn(x, y, s = 0) { let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vn(x, y, sc, s = 0) {
  const gx = x / sc, gy = y / sc, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hn(x0, y0, s), b = hn(x0 + 1, y0, s), c = hn(x0, y0 + 1, s), d = hn(x0 + 1, y0 + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

const PAL = {
  METAL: ramp(['#07080d','#0e1119','#161b27','#202838','#2c374b','#3c4a61','#52627b','#6e7f97','#95a5ba','#c4d0dc']),
  DECK: ramp(['#08080a','#121318','#1c1e25','#272a33','#353944','#464b57','#5d6370','#7a808c']),
  WOOD: ramp(['#1e1208','#33200f','#4c3117','#694522','#87602f','#a67b40','#c69c5c']),
  AMBER: ramp(['#2a1400','#552a00','#8a4a00','#c47410','#f0a830','#ffd870','#fff4c8']),
  RED: ramp(['#200404','#4a0a0a','#7a1010','#b01818','#e03028','#ff7058']),
  GREEN: ramp(['#021a08','#06381a','#0c6030','#18904a','#40c870','#a0ffb8']),
  CYAN: ramp(['#020c14','#06202e','#0a3a4c','#10607a','#2090a8','#50c8d8','#a8f4ff']),
  PURP: ramp(['#06030c','#0e0718','#180c28','#24123c','#341a54','#482470','#62349a','#8452c4']),
  SPACE: ramp(['#000000','#03020a','#070618','#0d0b28','#16123c']),
  GAS: ramp(['#2a0e06','#4c1e0c','#7a3412','#a8521c','#d07c30','#e8a858','#f6d49a']),
  PINK: ramp(['#14040f','#2c0a24','#4a1240','#6c1c5e','#92287c','#c03c9c','#ec64c0','#ffa8e4']),
  TEAL: ramp(['#021210','#06241f','#0c3a33','#145a4e','#1f8070','#36a894','#6cd4bc']),
  YEL: ramp(['#2a2000','#5a4600','#927400','#c8a010','#f0cc30','#fff080']),
  SKINA: ramp(['#0c2a0c','#1a4a16','#2c6e22','#469632','#6cbc48','#a0e078']),
  GOLD: ramp(['#3a2000','#6a3e00','#9a6400','#c89010','#ecc030','#fff090','#ffffe0']),
  GRAY: ramp(['#101010','#282828','#404040','#606060','#808080','#a0a0a0','#c4c4c4','#e8e8e8'])
};

/* ---------- pixel painter ---------- */
class Pix {
  constructor(w = W, h = H) { this.w = w; this.h = h; this.c = mk(w, h); this.x = this.c.getContext('2d'); this.id = this.x.createImageData(w, h); this.d = this.id.data; }
  set(x, y, c) { x |= 0; y |= 0; if (!c || x < 0 || y < 0 || x >= this.w || y >= this.h) return; const i = (y * this.w + x) * 4; this.d[i] = c[0]; this.d[i + 1] = c[1]; this.d[i + 2] = c[2]; this.d[i + 3] = 255; }
  get(x, y) { const i = (y * this.w + x) * 4; return [this.d[i], this.d[i + 1], this.d[i + 2]]; }
  rect(x0, y0, x1, y1, f) { const fn = typeof f === 'function'; for (let y = Math.max(0, y0 | 0); y < Math.min(this.h, y1); y++) for (let x = Math.max(0, x0 | 0); x < Math.min(this.w, x1); x++) { const c = fn ? f(x, y) : f; if (c) this.set(x, y, c); } }
  poly(pts, f) {
    const fn = typeof f === 'function'; let y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(this.h - 1, Math.ceil(y1)); y++) {
      const yy = y + .5, xs = [];
      for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= yy && b[1] > yy) || (b[1] <= yy && a[1] > yy)) xs.push(a[0] + (yy - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k] - .5); x < Math.ceil(xs[k + 1] - .5); x++) { const c = fn ? f(x, y) : f; if (c) this.set(x, y, c); }
    }
  }
  ellipse(cx, cy, rx, ry, f) { const fn = typeof f === 'function'; for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) { const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy <= 1) { const c = fn ? f(x, y, dx, dy) : f; if (c) this.set(x, y, c); } } }
  line(x0, y0, x1, y1, c) { x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0; const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    for (;;) { this.set(x0, y0, typeof c === 'function' ? c(x0, y0) : c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
  text(s, x, y, c) { for (const ch of s) { const g = glyph(ch); g.rows.forEach((r, ry) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') this.set(x + i, y + ry, c); }); x += g.w + 1; } }
  outline(col) { const o = hex(col), w = this.w, h = this.h, a = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) a[i] = this.d[i * 4 + 3];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!a[y * w + x]) { if ((x > 0 && a[y * w + x - 1]) || (x < w - 1 && a[y * w + x + 1]) || (y > 0 && a[(y - 1) * w + x]) || (y < h - 1 && a[(y + 1) * w + x])) this.set(x, y, o); } }
  done() { this.x.putImageData(this.id, 0, 0); return this.c; }
}
function art(rows, key) { const h = rows.length, w = Math.max(...rows.map(r => r.length)), p = new Pix(w, h);
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const k = key[r[x]]; if (k) p.set(x, y, hex(k)); } }); return p.done(); }

/* ---------- Web Audio: PC-speaker / AdLib-flavoured synth ---------- */
const mf = m => 440 * Math.pow(2, (m - 69) / 12);
const Snd = {
  ac: null, on: true, mus: null, musT: null,
  init() { if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    try { this.ac = new (window.AudioContext || window.webkitAudioContext)(); this.master = this.ac.createGain(); this.master.gain.value = .55; this.master.connect(this.ac.destination); } catch (e) { this.ac = null; } },
  ok() { return this.ac && this.on; },
  tone(f, t, d, type = 'square', v = .05, dest, slide) { const a = this.ac, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .006); g.gain.setValueAtTime(v, t + d * .65); g.gain.linearRampToValueAtTime(0, t + d); o.connect(g); g.connect(dest || this.master); o.start(t); o.stop(t + d + .03); },
  noise(t, d, v = .08, f0 = 3000, f1 = 300) { const a = this.ac, n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(); s.buffer = b; const fl = a.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + d); const g = a.createGain(); g.gain.setValueAtTime(v, t); g.gain.linearRampToValueAtTime(0, t + d);
    s.connect(fl); fl.connect(g); g.connect(this.master); s.start(t); },
  seq(notes, bpm, type, v, t0, dest) { const b = 60 / bpm; let t = t0; for (const [m, len] of notes) { if (m != null) this.tone(mf(m), t, b * len * .95, type, v, dest); t += b * len; } return t - t0; },
  sfx(n) { if (!this.ok()) return; const t = this.ac.currentTime + .01;
    switch (n) {
      case 'pickup': this.seq([[72, .25], [76, .25], [79, .25], [84, .6]], 240, 'square', .045, t); break;
      case 'score': this.seq([[79, .25], [84, .5]], 200, 'square', .04, t); this.seq([[67, .25], [72, .5]], 200, 'triangle', .07, t); break;
      case 'door': this.noise(t, .45, .12, 1800, 200); this.tone(110, t, .4, 'sawtooth', .03, null, 55); break;
      case 'zap': for (let i = 0; i < 10; i++) this.tone(200 + Math.random() * 1800, t + i * .035, .03, 'sawtooth', .05); this.noise(t, .4, .15, 5000, 800); break;
      case 'rift': this.tone(80, t, 1.6, 'sawtooth', .04, null, 1200); this.tone(120, t + .1, 1.5, 'square', .025, null, 1800); this.noise(t, 1.6, .06, 300, 6000); break;
      case 'death': this.seq([[67, 1], [66, 1], [65, 1], [64, 2], [null, .5], [52, 3]], 110, 'triangle', .09, t); this.seq([[55, 1], [54, 1], [53, 1], [52, 2], [null, .5], [40, 3]], 110, 'square', .025, t); break;
      case 'click': this.tone(1200, t, .02, 'square', .025); break;
      case 'key': this.tone(900 + Math.random() * 200, t, .015, 'square', .015); break;
      case 'beep': this.tone(880, t, .12, 'square', .04); break;
      case 'disk': for (let i = 0; i < 14; i++) this.tone(60 + (i % 3) * 25, t + i * .06, .05, 'square', .04); break;
      case 'win': this.seq([[72, .5], [76, .5], [79, .5], [84, 1], [83, .5], [79, .5], [84, 2]], 140, 'square', .045, t); this.seq([[48, 1], [55, 1], [52, 1], [48, 2]], 140, 'triangle', .1, t); break;
    } },
  playTitle() { if (!this.ok() || this.mus) return; const a = this.ac; const g = a.createGain(); g.gain.value = 1; g.connect(this.master); this.mus = g;
    const arp = [69,72,76,81,79,76,74,76, 65,69,72,77,76,72,71,72, 67,71,74,79,77,74,72,74, 64,68,71,76,74,71,68,71].map(m => [m, .5]);
    const bass = [[45,4],[41,4],[43,4],[40,4]];
    const mel = [[null,8],[81,1.5],[79,.5],[76,2],[77,1],[76,1],[74,2],[72,2],[71,4]];
    const loop = () => { if (this.mus !== g) return; const t = a.currentTime + .05; const d = this.seq(arp, 132, 'square', .022, t, g); this.seq(bass, 132, 'triangle', .09, t, g); this.seq(mel, 132, 'triangle', .05, t, g); this.musT = setTimeout(loop, d * 1000 - 60); };
    loop(); },
  stopMusic() { if (this.mus) { const g = this.mus; this.mus = null; clearTimeout(this.musT); try { g.gain.setTargetAtTime(0, this.ac.currentTime, .1); setTimeout(() => g.disconnect(), 600); } catch (e) {} } }
};
