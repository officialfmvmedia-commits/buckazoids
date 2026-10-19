'use strict';
const main = document.getElementById('main');
function nav(u) { main.src = u; }
function navTop(u) { nav(u); scrollTo({ top: 0, behavior: 'smooth' }); }
function stopIt() { document.getElementById('stat').textContent = 'Transfer interrupted!'; }
main.addEventListener('load', () => {
  try { const p = main.contentWindow.location.pathname.split('/').pop().replace('.html', ''); document.getElementById('locbar').value = 'telnet://ledger.bbs:2009/node0/' + (p === 'home' ? '' : p.toUpperCase() + (p === 'readme' ? '.TXT' : '/')); } catch (e) {}
  document.getElementById('stat').textContent = 'Document: Done.';
});
main.addEventListener('loadstart', () => {});
/* throbber: a tiny meteor shower in the logo box */
(() => { const c = document.getElementById('meteor'), x = c.getContext('2d'); let t = 0; const st = [...Array(14)].map(() => [Math.random() * 40, Math.random() * 40, Math.random()]);
  setInterval(() => { t++; x.fillStyle = '#000'; x.fillRect(0, 0, 40, 40); for (const s of st) { s[0] -= s[2] * 1.5; s[1] += s[2]; if (s[0] < 0 || s[1] > 40) { s[0] = 40; s[1] = Math.random() * 30; } x.fillStyle = s[2] > .6 ? '#fff' : '#68a'; x.fillRect(s[0] | 0, s[1] | 0, 1, 1); }
    x.fillStyle = '#f0c000'; x.font = 'bold 22px Times New Roman'; x.fillText('\u20bf', 13 + Math.sin(t / 9), 28); }, 80); })();
/* uptime counts days since the genesis block, 2009-01-03 */
document.getElementById('uptime').textContent = Math.floor((Date.now() - Date.UTC(2009, 0, 3, 18, 15, 5)) / 864e5) + 'd';
/* PLAY: DOS box boot */
const BOOT = ['BUCKA BIOS v1.991  (C) 1991 Nobody In Particular', 'Memory Test: 640K OK   Extended: 3072K OK', 'Detecting AdLib-ish sound............ found (it\'s Web Audio)', 'Detecting mouse...................... found', '', 'C:\\> cd \\GAMES\\BUCKA', 'C:\\GAMES\\BUCKA> dir /w', '[.]  [..]  B59.EXE  RESOURCE.001  COIN.59  README.TXT', '        4 file(s)     1,474,560 bytes', '', 'C:\\GAMES\\BUCKA> B59.EXE', 'Loading BUCKAZOIDS...'];
let bootT = null;
function openPlay() {
  const d = document.getElementById('dos'), pre = document.getElementById('boot'), gf = document.getElementById('gameframe');
  d.hidden = false; gf.hidden = true; gf.src = 'about:blank'; pre.textContent = ''; let i = 0, ch = 0; clearInterval(bootT);
  bootT = setInterval(() => { if (i >= BOOT.length) { clearInterval(bootT); setTimeout(() => { gf.src = 'game/index.html'; gf.hidden = false; gf.onload = () => { try { gf.contentWindow.focus(); } catch (e) {} }; }, 450); return; }
    const line = BOOT[i]; if (line.startsWith('C:\\') && ch < line.length) { ch += 2; pre.textContent = pre.textContent.replace(/[^\n]*$/, '') + line.slice(0, ch) + '_'; return; }
    pre.textContent = pre.textContent.replace(/_$/, '').replace(/[^\n]*$/, '') + line + '\n'; i++; ch = 0; }, 45);
}
function closePlay() { clearInterval(bootT); const gf = document.getElementById('gameframe'); gf.src = 'about:blank'; document.getElementById('dos').hidden = true; }
function fullPlay() { const s = document.getElementById('dosscreen'); (s.requestFullscreen || s.webkitRequestFullscreen || (() => {})).call(s); }
addEventListener('keydown', e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if (!document.getElementById('dos').hidden) { if (e.key === 'Escape' && document.activeElement !== document.getElementById('gameframe')) closePlay(); return; }
  const k = e.key.toLowerCase(); const m = { p: () => openPlay(), a: () => nav('bbs/archive.html'), r: () => nav('bbs/readme.html'), s: () => nav('bbs/sysop.html'), g: () => nav('bbs/guestbook.html'), m: () => nav('bbs/home.html') };
  if (m[k] && !e.metaKey && !e.ctrlKey) m[k](); });
window.addEventListener('message', e => { if (e.data === 'lq:play') openPlay(); });
if (location.hash === '#play') openPlay();
