/* BUCKAZOIDS: Chapter I, "The Coin of Fifty-Nine". Original game logic. */
'use strict';
const cv = document.getElementById('screen'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
function fit() { const vw = document.documentElement.clientWidth || innerWidth, vh = document.documentElement.clientHeight || innerHeight; if (!vw || !vh) return;
  let k = Math.min(vw / W, vh / H); if (k >= 1 && k - Math.floor(k) < .08) k = Math.floor(k); k = Math.max(.5, k); cv.style.width = Math.floor(W * k) + 'px'; cv.style.height = Math.floor(H * k) + 'px'; }
addEventListener('resize', fit); addEventListener('load', fit); if (window.ResizeObserver) new ResizeObserver(fit).observe(document.documentElement); fit();

const MAXSCORE = 159, SAVEKEY = 'ledgerquest.save.v1';
let S = null, mode = 'title', verb = 'walk', modal = null, busy = 0, tick = 0, barOpen = false;
const mq = [], mouse = { x: 160, y: 120, in: false };
const hero = { x: 120, y: 170, dir: 'down', f: 0, ft: 0, moving: false, tx: 0, ty: 0, arrive: null, hidden: false, zap: false };
const fx = { flash: 0, flashCol: '#fff', shake: 0, trans: null };
const rnd = a => a[Math.floor(Math.random() * a.length)];
const has = id => S.inv.includes(id);
function give(id) { if (!has(id)) S.inv.push(id); Snd.sfx('pickup'); }
function drop(id) { S.inv = S.inv.filter(i => i !== id); if (S.cur === id) { S.cur = null; if (verb === 'item') verb = 'walk'; } }
function score(k, n) { if (S.got[k]) return; S.got[k] = 1; S.score += n; setTimeout(() => Snd.sfx('score'), 380); }

const OBJ = {};
function initArt() {
  OBJ.fragile = [paintFragile(0), paintFragile(1)]; OBJ.toolbox = [paintToolbox(0), paintToolbox(1)]; OBJ.barrel = paintBarrel(); OBJ.kiosk = paintKiosk();
  OBJ.cube = paintCube(); OBJ.ghost = paintCube(9, .25);
  let p = new Pix(46, 77); p.rect(0, 0, 46, 77, (x, y) => pick(P_.PURP, .1 + .7 * light(x, y, 23, 40, 40, 1, 1.3) + (hn(x, y, 3) - .5) * .1, x, y)); OBJ.bulkOpen = p.done();
  for (const k of [0, 1]) { p = new Pix(120, 120); p.ellipse(60, 60, 58, 58, (x, y, dx, dy) => { const r = Math.hypot(dx, dy); return hn(x, y, k + 40) < (1 - r) * .55 ? pick(P_.AMBER, .9 - r * .6, x, y) : null; }); OBJ['halo' + k] = p.done(); }
  p = new Pix(26, 30); p.rect(3, 8, 23, 30, (x, y) => pick(P_.GRAY, .55 - (x - 3) * .015 + hn(x, y) * .1, x, y)); p.ellipse(13, 9, 10, 8, (x, y, dx, dy) => pick(P_.GRAY, .6 - dx * .2 - dy * .1, x, y)); p.text('RIP', 7, 9, hex('#202020')); p.rect(0, 27, 26, 30, (x, y) => pick(P_.GREEN, .4 + hn(x, y) * .3, x, y)); p.outline('#000'); OBJ.tomb = p.done();
  p = new Pix(30, 30); coinPix(p, 15, 15, 13); p.outline('#000'); OBJ.bigcoin = p.done();
  const s = new Pix(20, 40), src = HERO_STAND.down.getContext('2d').getImageData(0, 0, 20, 40).data;
  for (let i = 0; i < 800; i++) if (src[i * 4 + 3]) s.set(i % 20, (i / 20) | 0, (i % 20 + ((i / 20) | 0)) % 3 ? hex('#ffffff') : hex('#80c0ff')); OBJ.zap = s.done();
}
const BGC = {};
const bg = id => BGC[id] || (BGC[id] = ROOMS[id].paint());

function die(k) {
  if (S.dead) return; S.dead = k; hero.moving = false; hero.arrive = null; busy = 1; barOpen = false; modal = null; mq.length = 0;
  if (k === 'zap' || k === 'step') { hero.zap = true; fx.shake = 40; Snd.sfx('zap'); }
  else if (k === 'airlock') { fx.flash = 40; fx.flashCol = '#000'; fx.shake = 25; Snd.sfx('door'); setTimeout(() => hero.hidden = true, 300); }
  else { fx.flash = 50; fx.flashCol = '#c080ff'; Snd.sfx('rift'); setTimeout(() => hero.hidden = true, 200); }
  setTimeout(() => {
    busy = 0; Snd.sfx('death');
    openWin({ title: 'Thank you for playing Buckazoids', icon: OBJ.tomb, text: DEATHS[k] + '\n\nYou have died. Better luck next timeline.', kind: 'death',
      buttons: [{ label: 'Restore', fn: () => restoreGame(true) }, { label: 'Restart', fn: () => newGame() }, { label: 'Quit', fn: () => toTitle() }] });
  }, 1300);
}
function go(rm, x, y, dir) {
  const prev = mk(W, H); renderScene(prev.getContext('2d'));
  S.room = rm; hero.x = x; hero.y = y; hero.dir = dir || hero.dir; hero.moving = false; hero.arrive = null;
  fx.trans = { prev, t: 0 }; Snd.sfx('door');
  const r = ROOMS[rm]; if (r.enter) r.enter();
}

/* ---------------- walking ---------------- */
const room = () => ROOMS[S.room];
function inPoly(x, y, pts) { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if (((yi > y) !== (yj > y)) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
function clampWalk(x, y) {
  const pts = room().walk; if (inPoly(x, y, pts)) return [x, y];
  let best = [x, y], bd = 1e9;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dy = b[1] - a[1]; const t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy), 0, 1); const px = a[0] + dx * t, py = a[1] + dy * t, d = (px - x) ** 2 + (py - y) ** 2; if (d < bd) { bd = d; best = [px, py]; } }
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  for (let k = 0; k < 6 && !inPoly(best[0], best[1], pts); k++) { const l = Math.hypot(cx - best[0], cy - best[1]) || 1; best = [best[0] + (cx - best[0]) / l, best[1] + (cy - best[1]) / l]; }
  return best;
}
function walkTo(x, y, cb) { const [tx, ty] = clampWalk(x, y); hero.tx = tx; hero.ty = ty; hero.moving = true; hero.arrive = cb || null; }
function faceTo(h) { const cx = (h.r[0] + h.r[2]) / 2, cy = (h.r[1] + h.r[3]) / 2, dx = cx - hero.x, dy = cy - hero.y; hero.dir = Math.abs(dx) > Math.abs(dy) * .8 ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
function updateHero() {
  if (!hero.moving) return;
  const dx = hero.tx - hero.x, dy = hero.ty - hero.y, len = Math.hypot(dx, dy);
  if (len < .8) { hero.moving = false; hero.f = 0; const cb = hero.arrive; hero.arrive = null; if (cb) cb(); return; }
  const nx = dx / len, ny = dy / len, sp = 1 / Math.sqrt((nx / 1.05) ** 2 + (ny / .6) ** 2), st = Math.min(len, sp);
  hero.x += nx * st; hero.y += ny * st;
  hero.dir = Math.abs(dx) > Math.abs(dy) * 1.1 ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  if (++hero.ft >= 6) { hero.ft = 0; hero.f = (hero.f + 1) % 6; }
  const dz = room().danger; if (dz && !S.dead && hero.x > dz[0] && hero.x < dz[2] && hero.y > dz[1] && hero.y < dz[3]) die('step');
}
function drawHero(c) {
  if (hero.hidden) return;
  const r = room(), y0 = r.walk[0][1], sc = .84 + .16 * clamp((hero.y - y0) / (197 - y0), 0, 1);
  let img = hero.moving ? HERO[hero.dir][hero.f] : HERO_STAND[hero.dir];
  if (hero.zap && (tick >> 2) & 1) img = OBJ.zap;
  const w = Math.round(20 * sc), h = Math.round(40 * sc);
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(Math.round(hero.x - 6 * sc), Math.round(hero.y - 1), Math.round(12 * sc), 2);
  c.drawImage(img, Math.round(hero.x - w / 2), Math.round(hero.y - 38 * sc), w, h);
}

/* ---------------- interaction ---------------- */
function hit(x, y) { for (const h of room().hot) { for (const r of [h.r, h.r2]) if (r && x >= r[0] && x < r[2] && y >= r[1] && y < r[3]) return h; } return null; }
function defaultFor(v, h, item) {
  const n = h.names[0];
  switch (v) {
    case 'look': return "It looks exactly like a " + n + ". You were hoping for more, too.";
    case 'talk': return rnd(["The " + n + " doesn't respond. Frankly, it's the best listener you've met all week.", "You make small talk with the " + n + ". It's very small.", "You'd get more conversation out of your mop."]);
    case 'use': return item === 'mop' ? "You mop the " + n + ". It's cleaner. Nothing else has changed." : "Using the " + ITEMS[item].label.toLowerCase() + " on the " + n + " accomplishes nothing, except making you look busy.";
    case 'walk': return null;
    default: return rnd(["You can't do that.", "You'd rather not touch that. You've seen where it's been.", "Nothing happens. This is becoming a theme in your life."]);
  }
}
function doVerb(h, v, item) {
  const run = () => {
    if (S.dead) return; faceTo(h);
    let fn = h[v]; if (!fn && (v === 'open' || v === 'get')) fn = h.hand;
    if (!fn && v === 'close') { say("It's as closed as it's going to get."); return; }
    const r = typeof fn === 'function' ? fn.call(h, item) : fn;
    if (r === true) return; if (typeof r === 'string') { say(r); return; }
    const d = defaultFor(v, h, item); if (d) say(d);
  };
  if (v === 'look' || v === 'talk' || !h.ap) run(); else walkTo(h.ap[0], h.ap[1], run);
}

/* ---------------- parser ---------------- */
const STOP = new Set(['the', 'a', 'an', 'at', 'on', 'with', 'to', 'in', 'into', 'using', 'from', 'up', 'around', 'some', 'my', 'this', 'that', 'of', 'over', 'inside', 'through', 'for', 'please', 'about', 'toward', 'towards', 'it', 'all']);
const VERBS = { look: 'look', l: 'look', examine: 'look', x: 'look', inspect: 'look', read: 'look', check: 'look', search: 'look', see: 'look', view: 'look', describe: 'look',
  get: 'get', take: 'get', grab: 'get', pick: 'get', steal: 'get', collect: 'get',
  use: 'use', insert: 'use', put: 'use', give: 'use', show: 'use', apply: 'use', swipe: 'use', pay: 'use', place: 'use', offer: 'use', feed: 'use',
  pry: 'pry', force: 'pry', talk: 'talk', speak: 'talk', ask: 'talk', chat: 'talk', say: 'talk', hello: 'talk', hi: 'talk', greet: 'talk', hey: 'talk',
  open: 'open', unlock: 'open', close: 'close', shut: 'close', push: 'hand', press: 'hand', touch: 'hand', pull: 'hand', hit: 'hand', kick: 'hand', feel: 'hand', turn: 'hand', type: 'hand', poke: 'hand',
  walk: 'walk', go: 'walk', enter: 'walk', exit: 'walk', leave: 'walk', climb: 'walk', jump: 'walk', run: 'walk', step: 'walk', approach: 'walk',
  inventory: 'inv', inv: 'inv', i: 'inv', items: 'inv', help: 'help', save: 'save', restore: 'restore', load: 'restore', restart: 'restart', quit: 'quit', score: 'score',
  buy: 'buy', purchase: 'buy', mop: 'mop', clean: 'mop', sweep: 'mop', swab: 'mop', wait: 'wait', sleep: 'sleep', nap: 'sleep', smell: 'smell', sniff: 'smell', lick: 'lick', eat: 'lick', taste: 'lick', kiss: 'kiss', dance: 'dance', sing: 'dance', flip: 'flip', toss: 'flip' };
const DIRS = { n: 'north', s: 'south', e: 'east', w: 'west', north: 'north', south: 'south', east: 'east', west: 'west', back: 'back', out: 'out', in: 'in', lab: 'lab' };
function findItem(toks) { for (let i = 0; i < toks.length; i++) { const t = toks[i]; for (const id of S.inv) { const n = ITEMS[id].names; if (n.includes(t) || n.includes(t.replace(/s$/, ''))) return { id, i }; } } return null; }
function findHot(toks) { for (const t of toks) for (const h of room().hot) if (h.names.includes(t) || h.names.includes(t.replace(/s$/, ''))) return h; return null; }
function anyItemName(t) { for (const id in ITEMS) if (ITEMS[id].names.includes(t)) return id; return null; }
function egg(s) {
  if (/\b(xyzzy|plugh)\b/.test(s)) return "A hollow voice says: 'Wrong game, pal.'";
  if (/satoshi|nakamoto/.test(s)) return "The narrator pretends not to have heard that name, and briskly changes the subject.";
  if (/\bchits?\b/.test(s)) return "Chits? That word got retired. Around here it's buckazoids. The rebranding memo was thicker than the money.";
  if (/\bhodl\b/.test(s)) return "You grip your inventory tighter. Diamond gloves.";
  if (/\b(wen|lambo|moon)\b/.test(s)) return "Wen? Not in 1991, friend. Possibly not in 2009 either. Be patient.";
  if (/\b(fuck|shit|damn|crap|bitch|ass)\b/.test(s)) return "Such language! This is a family-rated waste-hauler.";
  if (/^(look )?(at )?(me|self|myself|wendell|yourself|hero)$/.test(s)) return "You are Wendell Flux: Sanitation Technician Third Class, five foot eight in your good boots, in orange coveralls and a cap worn backwards for aerodynamic reasons.";
  return null;
}
function parse(raw) {
  const s = raw.toLowerCase().trim(); if (!s) return;
  const e = egg(s); if (e) return say(e);
  let toks = s.replace(/[^a-z0-9\u20bf ]/g, ' ').split(/\s+/).filter(Boolean); if (!toks.length) return;
  if (DIRS[toks[0]] && toks.length === 1) toks = ['go', toks[0]];
  const v = VERBS[toks[0]]; const rest = toks.slice(1).filter(t => !STOP.has(t));
  if (!v) { const h = findHot(toks); if (h) return doVerb(h, 'look'); return say("You don't know how to '" + toks[0] + "'. In fairness, neither does the narrator."); }
  const r = room(), it = findItem(rest), h = findHot(it ? rest.filter((_, i) => i !== it.i) : rest);
  const missing = () => { const t = rest[0]; say(anyItemName(t) ? "You don't have any " + t + "." : "You don't see any " + t + " here."); };
  switch (v) {
    case 'look': if (!rest.length) return say(r.desc); if (it) return say(ITEMS[it.id].desc); if (h) return doVerb(h, 'look'); return missing();
    case 'get': if (h) return doVerb(h, 'get'); if (it) return say("You already have the " + ITEMS[it.id].label.toLowerCase() + ". Greedy."); return rest.length ? missing() : say("Get what?");
    case 'open': case 'close': case 'hand': if (h) return doVerb(h, v); if (it) return say(ITEMS[it.id].self); return rest.length ? missing() : say("Do that to what?");
    case 'use': if (it && h) return doVerb(h, 'use', it.id); if (it) { const left = rest.filter((_, i) => i !== it.i); return left.length ? say("You don't see any " + left[0] + " here.") : say(ITEMS[it.id].self); } if (h) return doVerb(h, 'hand'); return rest.length ? missing() : say("Use what?");
    case 'pry': if (!has('crowbar')) return say("Pry it with what, your personality?"); if (h) return doVerb(h, 'use', 'crowbar'); return say("Pry what?");
    case 'talk': if (h) return doVerb(h, 'talk'); if (rest.length) return missing(); return say("You talk to yourself. It's the most stimulating conversation you've had all shift.");
    case 'walk': { const d = rest.map(t => DIRS[t]).find(Boolean); if (d) { const id = r.dirs[d]; if (!id || id === 'nowhere') return say(S.room === 'mall' ? "The rift closed behind you like a rental agreement. There's no going back that way." : "You can't go that way."); const hh = r.hot.find(x => x.id === id); return doVerb(hh, hh.walk ? 'walk' : 'hand'); }
      if (h) { if (h.walk) return doVerb(h, 'walk'); if (h.ap) return walkTo(h.ap[0], h.ap[1]); return walkTo((h.r[0] + h.r[2]) / 2, h.r[3]); } return rest.length ? missing() : say("Where to? Click somewhere, or try GO EAST."); }
    case 'buy': if (S.room === 'mall') return doVerb(r.hot.find(x => x.id === 'clerk'), 'use', 'buckazoids'); return say("Nobody's selling anything here. Nobody's here at all.");
    case 'mop': if (!has('mop')) return say("You have nothing to mop with."); if (h) return doVerb(h, 'use', 'mop'); return say(ITEMS.mop.self);
    case 'flip': return say(has('coin') ? ITEMS.coin.self : "You have nothing worth flipping.");
    case 'inv': return openInv();
    case 'help': return showHelp();
    case 'save': return saveGame(); case 'restore': return restoreGame(); case 'restart': return newGame(); case 'quit': return toTitle();
    case 'score': return say("Your score is " + S.score + " of " + MAXSCORE + ". The other " + (MAXSCORE - S.score) + " points are presumably in a later chapter, or in 2009.");
    case 'wait': return say("Time passes. Not much of it, but some.");
    case 'sleep': return say("You've already had your mandated six-hour nap today. Twice.");
    case 'smell': return say(S.room === 'mall' ? "New carpet, hot plastic, and the faint bubblegum musk of 1991." : S.room === 'genesis' ? "It smells like nothing has happened yet." : "Machine oil, old garbage and destiny. Mostly garbage.");
    case 'lick': return say("You lick it. That's going on your permanent record.");
    case 'kiss': return say("Not on the first date.");
    case 'dance': return say("You perform a brief, shameful jig. Somewhere, a security camera you didn't know about saves the footage forever.");
  }
}

/* ---------------- modal windows ---------------- */
function say(text, onClose) {
  const lines = wrap(text, 220), tw = Math.max(80, ...lines.map(textW)), w = tw + 16, h = lines.length * 9 + 14;
  const m = { type: 'msg', lines, w, h, x: Math.round((W - w) / 2), y: Math.max(12, Math.round((H - h) / 2) - 8), onClose };
  if (modal) mq.push(m); else modal = m;
}
function openWin(o) {
  const iw = o.icon ? o.icon.width + 8 : 0, maxW = (o.green ? 170 : 210) - iw, lines = wrap(o.text, maxW);
  const tw = Math.max(...lines.map(textW), o.title ? textW(o.title) - iw + 4 : 0), vertical = o.vertical;
  const bws = (o.buttons || []).map(b => Math.max(44, textW(b.label) + 12));
  const bw = vertical ? Math.max(...bws) : bws.reduce((a, b) => a + b + 6, -6);
  const w = Math.max(tw + iw, bw) + 18, th = o.title ? 12 : 0, bh = vertical ? o.buttons.length * 15 : 18;
  const h = th + lines.length * 9 + bh + 16;
  const m = { type: 'win', o, lines, w, h, x: Math.round((W - w) / 2), y: Math.max(2, Math.round((H - h) / 2)), th, iw, esc: o.esc };
  let bx = m.x + Math.round((w - bw) / 2); const by = m.y + h - (vertical ? bh + 4 : 20);
  m.btns = (o.buttons || []).map((b, i) => { const r = vertical ? { x: m.x + Math.round((w - bw) / 2), y: by + i * 15, w: bw, h: 13 } : { x: bx, y: by, w: bws[i], h: 14 }; if (!vertical) bx += bws[i] + 6; return Object.assign(r, b); });
  modal = m; mq.length = 0;
}
function closeModal() { const m = modal; modal = mq.length ? mq.shift() : null; if (m && m.onClose) m.onClose(); }
function openInv() { barOpen = false; modal = { type: 'inv', mode: 'select', x: 44, y: 40, w: 232, h: 120 }; }
function openSettings() { barOpen = false;
  openWin({ title: 'Control Panel', text: 'BUCKAZOIDS v0.59, Chapter I.\nF5 save, F7 restore, Tab inventory.', vertical: true, esc: true,
    buttons: [{ label: 'Save Game', fn: () => { closeModal(); saveGame(); } }, { label: 'Restore Game', fn: () => { closeModal(); restoreGame(); } }, { label: 'Restart', fn: () => newGame() },
      { label: 'Sound: ' + (Snd.on ? 'ON' : 'OFF'), fn: () => { Snd.on = !Snd.on; closeModal(); openSettings(); } }, { label: 'Help', fn: () => { closeModal(); showHelp(); } }, { label: 'Quit to Title', fn: () => toTitle() }, { label: 'Resume', fn: () => closeModal() }] }); }
function showHelp() { say("HOW TO PLAY\n\nMove the pointer to the top of the screen to drop down the icon bar. Pick Walk, Look, Hand, Talk or your current Item, then click on the world. Right-click cycles verbs.\n\nOr just start typing: LOOK AT CRATE, GET COIN, USE CROWBAR ON CRATE, TALK TO CLERK, INVENTORY.\n\nF5 saves. F7 restores. Tab opens inventory. Esc opens the control panel.\n\nSave early. Save often. Space is not forgiving."); }

function bevel(c, x, y, w, h, down, face) { c.fillStyle = face || '#c0c0c0'; c.fillRect(x, y, w, h); c.fillStyle = down ? '#404040' : '#ffffff'; c.fillRect(x, y, w, 1); c.fillRect(x, y, 1, h); c.fillStyle = down ? '#ffffff' : '#404040'; c.fillRect(x, y + h - 1, w, 1); c.fillRect(x + w - 1, y, 1, h); }
const inR = (r, x, y) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
function drawBox(c, x, y, w, h, green) {
  c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(x + 3, y + 3, w, h);
  c.fillStyle = '#000'; c.fillRect(x - 1, y - 1, w + 2, h + 2);
  c.fillStyle = green ? '#041808' : '#f4f4ec'; c.fillRect(x, y, w, h);
  c.fillStyle = green ? '#40c870' : '#5a5aa0'; c.fillRect(x + 2, y + 2, w - 4, 1); c.fillRect(x + 2, y + h - 3, w - 4, 1); c.fillRect(x + 2, y + 2, 1, h - 4); c.fillRect(x + w - 3, y + 2, 1, h - 4);
}
function drawBtn(b, down) { const hv = inR(b, mouse.x, mouse.y); bevel(ctx, b.x, b.y, b.w, b.h, down || hv, hv ? '#d8d8f0' : '#c0c0c0'); text(ctx, b.label, b.x + Math.round((b.w - textW(b.label)) / 2), b.y + Math.round((b.h - 8) / 2), '#000'); }
function drawModal(m) {
  if (m.type === 'msg') { drawBox(ctx, m.x, m.y, m.w, m.h); m.lines.forEach((l, i) => text(ctx, l, m.x + 8, m.y + 7 + i * 9, '#141414')); return; }
  if (m.type === 'win') { const g = m.o.green; drawBox(ctx, m.x, m.y, m.w, m.h, g);
    if (m.o.title) { ctx.fillStyle = g ? '#0c6030' : (m.o.kind === 'death' ? '#801818' : '#24246a'); ctx.fillRect(m.x + 3, m.y + 3, m.w - 6, 10); text(ctx, m.o.title, m.x + Math.round((m.w - textW(m.o.title)) / 2), m.y + 4, '#ffffff'); }
    if (m.o.icon) ctx.drawImage(m.o.icon, m.x + 8, m.y + m.th + 8);
    m.lines.forEach((l, i) => text(ctx, l, m.x + 9 + m.iw, m.y + m.th + 7 + i * 9, g ? '#60f090' : '#141414'));
    for (const b of m.btns) drawBtn(b); return; }
  if (m.type === 'input') { const x = 8, y = 154, w = 304, h = 24; drawBox(ctx, x, y, w, h); text(ctx, 'Enter input:', x + 7, y + 4, '#24246a');
    let t = m.text; while (textW(t) > w - 20) t = t.slice(1); text(ctx, t, x + 7, y + 13, '#000'); if ((tick >> 4) & 1) { ctx.fillStyle = '#000'; ctx.fillRect(x + 8 + textW(t), y + 13, 4, 8); } return; }
  if (m.type === 'inv') { drawBox(ctx, m.x, m.y, m.w, m.h); ctx.fillStyle = '#24246a'; ctx.fillRect(m.x + 3, m.y + 3, m.w - 6, 10); text(ctx, 'Inventory', m.x + Math.round((m.w - textW('Inventory')) / 2), m.y + 4, '#fff');
    m.slots = []; S.inv.forEach((id, i) => { const sx = m.x + 8 + (i % 4) * 54, sy = m.y + 17 + Math.floor(i / 4) * 38, r = { x: sx, y: sy, w: 52, h: 36, id }; m.slots.push(r);
      const hv = inR(r, mouse.x, mouse.y); ctx.fillStyle = S.cur === id ? '#ffe890' : hv ? '#e0e0f8' : '#dcdcd4'; ctx.fillRect(sx, sy, 52, 36); ctx.fillStyle = '#9090a0'; ctx.fillRect(sx, sy + 35, 52, 1); ctx.fillRect(sx + 51, sy, 1, 36);
      ctx.drawImage(ITEM_ICON[id], sx + 15, sy + 4); const lb = ITEMS[id].label; text(ctx, lb, sx + Math.round((52 - textW(lb)) / 2), sy + 24, '#141414'); });
    if (!S.inv.length) text(ctx, 'You are carrying nothing at all.', m.x + 30, m.y + 50, '#444');
    m.btns = [{ label: 'Look', x: m.x + 30, y: m.y + m.h - 19, w: 50, h: 14, fn: () => { m.mode = m.mode === 'look' ? 'select' : 'look'; } }, { label: 'Select', x: m.x + 91, y: m.y + m.h - 19, w: 50, h: 14, fn: () => { m.mode = 'select'; } }, { label: 'OK', x: m.x + 152, y: m.y + m.h - 19, w: 50, h: 14, fn: () => closeModal() }];
    for (const b of m.btns) drawBtn(b, (b.label === 'Look' && m.mode === 'look') || (b.label === 'Select' && m.mode === 'select'));
    text(ctx, m.mode === 'look' ? 'Click an item to examine it.' : 'Click an item to use it.', m.x + 8, m.y + m.h - 31, '#555');
  }
}
function modalClick(x, y) {
  const m = modal;
  if (m.type === 'msg') { closeModal(); return; }
  if (m.type === 'win' || m.type === 'inv') { for (const b of m.btns || []) if (inR(b, x, y)) { Snd.sfx('click'); b.fn(); return; }
    if (m.type === 'inv') for (const s of m.slots || []) if (inR(s, x, y)) { if (m.mode === 'look') { closeModal(); say(ITEMS[s.id].desc, () => openInv()); } else { S.cur = s.id; verb = 'item'; closeModal(); } return; } }
}

/* ---------------- top bar, icon bar, cursor ---------------- */
const BAR = ['walk', 'look', 'hand', 'talk', 'item', 'inv', 'set', 'help'];
function drawTopBar() {
  if (!barOpen) { ctx.fillStyle = '#b4b4c4'; ctx.fillRect(0, 0, W, 10); ctx.fillStyle = '#50506a'; ctx.fillRect(0, 10, W, 1);
    text(ctx, 'Buckazoids', 4, 1, '#14143a'); const s = 'Score: ' + S.score + ' of ' + MAXSCORE; text(ctx, s, W - 4 - textW(s), 1, '#14143a'); return; }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 25);
  BAR.forEach((b, i) => { const x = i * 40, sel = b === verb, hv = mouse.y < 25 && Math.floor(mouse.x / 40) === i; bevel(ctx, x, 0, 40, 24, sel, hv ? '#dadaf0' : '#b8b8c8');
    let ic = null; if (b === 'inv') ic = ICON_INV; else if (b === 'set') ic = ICON_SET; else if (b === 'item') ic = S.cur ? ITEM_ICON[S.cur] : null; else if (b !== 'help') ic = CUR[b].c;
    if (ic) ctx.drawImage(ic, x + 20 - (ic.width >> 1), 12 - (ic.height >> 1)); else if (b === 'help') textBig(ctx, '?', x + 16, 5, 2, '#24246a'); else { ctx.fillStyle = '#9898a8'; ctx.fillRect(x + 12, 6, 16, 12); } });
}
function barClick(i) {
  const b = BAR[i]; Snd.sfx('click');
  if (b === 'item') { if (S.cur) { verb = 'item'; barOpen = false; } else openInv(); }
  else if (b === 'inv') openInv(); else if (b === 'set') openSettings(); else if (b === 'help') { barOpen = false; showHelp(); } else { verb = b; barOpen = false; }
}
function cycleVerb() { const order = ['walk', 'look', 'hand', 'talk'].concat(S.cur ? ['item'] : []); verb = order[(order.indexOf(verb) + 1) % order.length]; }
function drawCursor() {
  if (!mouse.in) return; let c;
  if (mode === 'title' || modal || barOpen) c = CUR.arrow; else if (busy || S.dead) c = CUR.wait;
  else if (verb === 'item' && S.cur) { const ic = ITEM_ICON[S.cur]; ctx.drawImage(ic, Math.round(mouse.x - ic.width / 2), Math.round(mouse.y - ic.height / 2)); return; } else c = CUR[verb];
  ctx.drawImage(c.c, Math.round(mouse.x - c.hx), Math.round(mouse.y - c.hy));
}

/* ---------------- rendering ---------------- */
const tmp = mk(W, H), tctx = tmp.getContext('2d');
const MASK = []; for (let k = 0; k <= 16; k++) { const m = mk(4, 4), x = m.getContext('2d'); x.fillStyle = '#000'; for (let i = 0; i < 16; i++) if (B4[i] * 16 >= k) x.fillRect(i & 3, i >> 2, 1, 1); MASK.push(tctx.createPattern(m, 'repeat')); }
function renderScene(c) {
  const r = room(); c.drawImage(bg(S.room), 0, 0); if (r.anim) r.anim(c, tick);
  const list = (r.objs ? r.objs() : []).map(o => ({ base: o.base, draw: o.draw || (cc => cc.drawImage(o.img, o.x, o.y)) }));
  list.push({ base: hero.y, draw: drawHero }); list.sort((a, b) => a.base - b.base).forEach(o => o.draw(c));
}
function render() {
  if (mode === 'title') { renderTitle(); drawCursor(); return; }
  ctx.save(); if (fx.shake > 0) { ctx.translate(((Math.random() * 4) | 0) - 2, ((Math.random() * 3) | 0) - 1); fx.shake--; }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); renderScene(ctx); ctx.restore();
  if (fx.trans) { const tr = fx.trans, k = Math.min(16, Math.floor(tr.t * 16 / 22)); tctx.globalCompositeOperation = 'copy'; tctx.drawImage(tr.prev, 0, 0); tctx.globalCompositeOperation = 'destination-in'; tctx.fillStyle = MASK[k]; tctx.fillRect(0, 0, W, H); tctx.globalCompositeOperation = 'source-over'; ctx.drawImage(tmp, 0, 0); if (++tr.t > 22) fx.trans = null; }
  if (fx.flash > 0) { ctx.globalAlpha = Math.min(1, fx.flash / 30); ctx.fillStyle = fx.flashCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; fx.flash--; }
  drawTopBar(); if (modal) drawModal(modal); drawCursor();
}

/* ---------------- title sequence ---------------- */
const T = { phase: 'press', t: 0, stars: [], btns: [] };
for (let i = 0; i < 170; i++) T.stars.push({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * .9 + .1 });
const CRAWL = ['In the year 1991...', '', 'Nobody had heard of a blockchain.', 'Floppy disks held 1.44 megabytes', 'and the hopes of an entire generation.', '', 'Far out past the last good radio station,', 'the waste-hauler S.S. MEMPOOL drifts', 'in orbit around a nameless gas giant,', 'her crew mysteriously evacuated.', '', 'Aboard her: one man. One mop.', 'Fifty-nine Buckazoids.', '', 'And, in a crate marked DO NOT OPEN', 'UNTIL 2009, a coin that should not', 'exist. Yet.'];
const GOLDR = ['#fff4c8', '#ffd870', '#f0a830', '#e08a10', '#c47410', '#8a4a00', '#552a00'];
const css = c => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
const ctr = (s, y, col, sh) => sh ? textSh(ctx, s, Math.round((W - textW(s)) / 2), y, col, sh) : text(ctx, s, Math.round((W - textW(s)) / 2), y, col);
function renderTitle() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); T.t++;
  for (const s of T.stars) { s.x -= s.z * .35; if (s.x < 0) { s.x = W; s.y = Math.random() * H; } ctx.fillStyle = s.z > .7 ? '#ffffff' : s.z > .4 ? '#9aa8d0' : '#4a5078'; ctx.fillRect(s.x | 0, s.y | 0, 1, 1); }
  if (T.phase === 'press') { textBig(ctx, 'B59', 128, 66, 4, GOLDR); if ((T.t >> 5) & 1) ctr('Click or press any key to begin', 122, '#c0c8e0'); ctr('An original, unaffiliated fan homage', 176, '#505878'); ctr('Not affiliated with or endorsed by Sierra / Activision.', 186, '#384060'); return; }
  if (T.phase === 'crawl') { const y0 = 205 - T.t * .32; CRAWL.forEach((l, i) => { const y = y0 + i * 11; if (y < 8 || y > 200) return; const a = clamp((y - 8) / 30, 0, 1); ctr(l, y, a > .66 ? (i === 0 ? '#fff4c8' : '#f0cc30') : a > .33 ? '#927400' : '#5a4600'); });
    if (y0 + CRAWL.length * 11 < 0) { T.phase = 'logo'; T.t = 0; } text(ctx, 'click to skip', W - 62, 190, '#303650'); return; }
  const sc = 3, wL = textW('BUCKAZOIDS') * sc;
  if (T.t < 50 && (T.t & 1)) return;
  textBig(ctx, 'BUCKAZOIDS', (W - wL) / 2 + 2, 28, sc, '#2a0c00'); textBig(ctx, 'BUCKAZOIDS', (W - wL) / 2, 26, sc, GOLDR);
  ctr('Chapter I: The Coin of Fifty-Nine', 68, '#a8f4ff', '#06202e');
  const cw = Math.abs(Math.cos(T.t * .04)), ccx = 160, ccy = 112;
  for (let y = -12; y <= 12; y++) for (let x = -12; x <= 12; x++) { const dx = x / (12 * Math.max(.08, cw)), dy = y / 12; if (dx * dx + dy * dy <= 1) { ctx.fillStyle = css(pick(P_.GOLD, .75 - dx * .25 * cw - dy * .3 - (dx * dx + dy * dy > .7 ? .3 : 0), x + 99, y + 99)); ctx.fillRect(ccx + x, ccy + y, 1, 1); } }
  if (cw > .75) text(ctx, '\u20bf', ccx - 2, ccy - 4, '#6a3e00');
  T.btns = [{ label: 'Play', x: 70, y: 142, w: 54, h: 15, fn: () => newGame() }, { label: 'Restore', x: 133, y: 142, w: 54, h: 15, fn: () => restoreGame() }, { label: 'Intro', x: 196, y: 142, w: 54, h: 15, fn: () => { T.phase = 'crawl'; T.t = 0; } }];
  for (const b of T.btns) { const hv = inR(b, mouse.x, mouse.y); bevel(ctx, b.x, b.y, b.w, b.h, hv, hv ? '#ffe890' : '#c0c0c0'); text(ctx, b.label, b.x + Math.round((b.w - textW(b.label)) / 2), b.y + 4, '#000'); }
  ctr('Unaffiliated fan homage.', 164, '#505878'); ctr('Not endorsed by Sierra / Activision.', 172, '#505878'); ctr('v0.59   (c) 1991-ish, built 2026', 179, '#384060');
}
function titleAdvance() { Snd.init(); if (T.phase === 'press') { T.phase = 'crawl'; T.t = 0; Snd.playTitle(); } else if (T.phase === 'crawl') { T.phase = 'logo'; T.t = 60; } else newGame(); }
function titleClick(x, y) { if (T.phase === 'logo') { for (const b of T.btns) if (inR(b, x, y)) { Snd.sfx('click'); b.fn(); return; } return; } titleAdvance(); }
function toTitle() { mode = 'title'; modal = null; mq.length = 0; T.phase = 'logo'; T.t = 60; busy = 0; Snd.playTitle(); }

/* ---------------- lifecycle / save ---------------- */
function resetHero(x, y, dir) { Object.assign(hero, { x, y, dir, f: 0, ft: 0, moving: false, arrive: null, hidden: false, zap: false }); }
function newGame() {
  S = { room: 'bay', inv: ['mop', 'buckazoids'], cur: null, flags: {}, score: 0, got: {}, dead: null };
  mode = 'play'; modal = null; mq.length = 0; verb = 'walk'; busy = 0; barOpen = false; fx.shake = 0; fx.trans = null; Snd.stopMusic();
  resetHero(118, 168, 'down'); fx.flash = 40; fx.flashCol = '#000';
  setTimeout(() => { if (S.room === 'bay' && !S.score && !modal) say("You wake up inside a packing crate, which is where you sleep when you're on the clock. The cargo bay of the waste-hauler S.S. MEMPOOL is very quiet. Suspiciously quiet. Ship-wide-evacuation-while-you-were-napping quiet.",
    () => say("You are Wendell Flux, Sanitation Technician Third Class. Your worldly possessions: one mop, and fifty-nine Buckazoids.\n\n(Move the pointer to the top of the screen for the icon bar, or just start typing.)")); }, 500);
}
function saveGame() { if (!S || S.dead) return say("You can't save now. You're dead. Even Sanitation has standards.");
  try { localStorage.setItem(SAVEKEY, JSON.stringify({ S, hero: { x: hero.x, y: hero.y, dir: hero.dir }, at: Date.now() })); say("Game saved. Your progress has been written to the ledger, permanently and irreversibly. (Until you save again.)"); } catch (e) { say("The save failed. The ledger is full."); } }
function restoreGame(fromDeath) {
  let d = null; try { d = JSON.parse(localStorage.getItem(SAVEKEY)); } catch (e) {}
  if (!d) { if (fromDeath) { const k = S.dead; modal = null; say("There's no saved game to restore. You've been living dangerously.", () => { S.dead = null; hero.zap = hero.hidden = false; die(k); }); return; }
    if (mode === 'title') { newGame(); modal = null; mq.length = 0; } return say("There's no saved game. You've been living dangerously."); }
  S = d.S; S.dead = null; mode = 'play'; modal = null; mq.length = 0; busy = 0; Snd.stopMusic(); verb = 'walk'; fx.trans = null;
  resetHero(d.hero.x, d.hero.y, d.hero.dir); fx.flash = 20; fx.flashCol = '#000'; say("Game restored. Previously, on Buckazoids...");
}

/* ---------------- input ---------------- */
function setMouse(e) { const r = cv.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * W / r.width; mouse.y = (e.clientY - r.top) * H / r.height; mouse.in = true; }
cv.addEventListener('mousemove', e => { setMouse(e); if (mode !== 'play') return; if (!modal && !busy && !S.dead && mouse.y < 9) barOpen = true; else if (barOpen && mouse.y > 26) barOpen = false; });
cv.addEventListener('mouseleave', () => { mouse.in = false; });
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('mousedown', e => { setMouse(e); Snd.init(); cv.focus();
  if (mode === 'title') return titleClick(mouse.x, mouse.y);
  if (modal) return modalClick(mouse.x, mouse.y);
  if (busy || S.dead) return;
  if (e.button === 2) return cycleVerb();
  if (barOpen && mouse.y < 25) return barClick(Math.floor(mouse.x / 40));
  const h = hit(mouse.x, mouse.y);
  switch (verb) {
    case 'walk': if (h && h.walk) doVerb(h, 'walk'); else walkTo(mouse.x, mouse.y); break;
    case 'look': if (h) doVerb(h, 'look'); else say(room().desc); break;
    case 'hand': if (h) doVerb(h, 'hand'); break;
    case 'talk': if (h) doVerb(h, 'talk'); break;
    case 'item': if (h && S.cur) doVerb(h, 'use', S.cur); break;
  }
});
addEventListener('keydown', e => {
  Snd.init();
  if (mode === 'title') { if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); titleAdvance(); } return; }
  if (e.key === 'F5') { e.preventDefault(); if (!modal) saveGame(); return; }
  if (e.key === 'F7') { e.preventDefault(); restoreGame(); return; }
  if (modal) {
    if (modal.type === 'msg') { e.preventDefault(); if (!e.repeat) closeModal(); return; }
    if (modal.type === 'input') { e.preventDefault(); const m = modal;
      if (e.key === 'Enter') { modal = null; parse(m.text); } else if (e.key === 'Escape') modal = null; else if (e.key === 'Backspace') m.text = m.text.slice(0, -1); else if (e.key.length === 1 && m.text.length < 60) { m.text += e.key; Snd.sfx('key'); } return; }
    if (e.key === 'Escape' && (modal.type === 'inv' || modal.esc)) closeModal(); return;
  }
  if (busy || S.dead) return;
  if (e.key === 'Tab') { e.preventDefault(); return openInv(); }
  if (e.key === 'Escape') return openSettings();
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key.length === 1 || e.key === 'Enter') { e.preventDefault(); barOpen = false; modal = { type: 'input', text: e.key.length === 1 && e.key !== ' ' ? e.key : '' }; Snd.sfx('key'); }
});

/* ---------------- main loop ---------------- */
let last = performance.now(), acc = 0;
function frame(now) {
  acc += Math.min(100, now - last); last = now;
  while (acc >= 1000 / 60) { acc -= 1000 / 60; tick++; if (mode === 'play' && !modal) updateHero(); }
  render(); requestAnimationFrame(frame);
}
initArt(); requestAnimationFrame(frame);

window.LQ = { get S() { return S; }, hero, mouse, newGame, go: (r, x, y, d) => { go(r, x, y, d); fx.trans = null; }, parse, say, die, closeModal, get modal() { return modal; },
  title: p => { mode = 'title'; T.phase = p; T.t = p === 'crawl' ? 200 : 80; }, give: id => give(id), flag: (k, v = 1) => { S.flags[k] = v; }, verb: v => { verb = v; }, bar: v => { barOpen = v; }, openInv, openSettings,
  clear: () => { modal = null; mq.length = 0; fx.flash = 0; fx.trans = null; fx.shake = 0; } };
