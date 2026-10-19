/* BUCKAZOIDS ambience: an original FM-synth (OPL2-ish) space loop, generated live with Web Audio. */
'use strict';
(() => {
  const KEY = 'bz.sound', VOL = 0.15, DUCK = 0.3;
  const btn = document.getElementById('sndbtn'), dos = document.getElementById('dos');
  let on = localStorage.getItem(KEY) !== 'off', ac = null, master = null, bus = null, wet = null, timer = null, next = 0, step = 0;
  const mf = m => 440 * Math.pow(2, (m - 69) / 12);
  /* Am9 - Fmaj7#11 - Dm9 - E7sus4 (b9 colour), 4 beats each at 60 bpm */
  const CH = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 71], [50, 53, 57, 60, 64], [52, 57, 59, 62, 65]];
  const BEAT = 1, BAR = 4;
  function label() { if (!btn) return; btn.innerHTML = '&#9834; SOUND: ' + (on ? 'ON' : 'OFF'); btn.classList.toggle('off', !on); }
  function build() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; lp.connect(master);
    bus = ac.createGain(); bus.gain.value = 1; bus.connect(lp);
    /* two-tap feedback delay as a cheap 1991 "reverb" */
    wet = ac.createGain(); wet.gain.value = .45;
    const d1 = ac.createDelay(2), d2 = ac.createDelay(2), fb = ac.createGain(), dl = ac.createBiquadFilter();
    d1.delayTime.value = .375; d2.delayTime.value = .61; fb.gain.value = .42; dl.type = 'lowpass'; dl.frequency.value = 1800;
    wet.connect(d1); wet.connect(d2); d1.connect(dl); d2.connect(dl); dl.connect(fb); fb.connect(d1); dl.connect(lp);
  }
  /* 2-operator FM voice: sine modulator -> sine/triangle carrier, AdLib style */
  function fm(f, t, dur, v, ratio, idx, att, rel, send, type) {
    const c = ac.createOscillator(), m = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain();
    c.type = type || 'sine'; c.frequency.value = f; m.frequency.value = f * ratio;
    mg.gain.setValueAtTime(f * idx, t); mg.gain.linearRampToValueAtTime(f * idx * .35, t + dur);
    m.connect(mg); mg.connect(c.frequency);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.setValueAtTime(v, t + Math.max(att, dur - rel)); g.gain.linearRampToValueAtTime(0, t + dur);
    c.connect(g); g.connect(bus); if (send) { const s = ac.createGain(); s.gain.value = send; g.connect(s); s.connect(wet); }
    c.start(t); m.start(t); c.stop(t + dur + .05); m.stop(t + dur + .05);
  }
  function schedule() {
    while (next < ac.currentTime + 1.2) {
      const t = next, bar = Math.floor(step / (BAR * 2)), ch = CH[bar % CH.length], s8 = step % (BAR * 2);
      if (s8 === 0) {
        /* slow FM pad, slightly detuned pair per note */
        ch.slice(0, 4).forEach((n, i) => { fm(mf(n), t, BAR * BEAT + 1.6, .028, 1, .9, 1.4, 1.8, .5); fm(mf(n) * 1.004, t + .05, BAR * BEAT + 1.6, .018, 2, .4, 1.6, 1.8, .4, 'triangle'); });
        /* soft sub */
        fm(mf(ch[0] - 24), t, BAR * BEAT, .07, 1, .15, .6, 1.2, 0);
      }
      /* gentle arpeggio in 8ths, skipping some steps so it breathes */
      if ((bar % 8) > 1 && [0, 1, 2, 3, 5, 6].includes(s8)) {
        const pat = [0, 2, 4, 1, 3, 2, 4, 1], n = ch[pat[s8] % ch.length] + 12;
        fm(mf(n), t, .42, .022, 3, 1.4, .006, .3, .55);
      }
      /* occasional twinkly bleep */
      if (Math.random() < .07) fm(mf(ch[Math.floor(Math.random() * ch.length)] + 24 + (Math.random() < .5 ? 12 : 0)), t + .25, .25, .014, 3.5, 2.2, .003, .2, .9);
      next += BEAT / 2; step++;
    }
  }
  function level() { return dos && !dos.hidden ? VOL * DUCK : VOL; }
  function ramp(v, tc) { if (!master) return; const t = ac.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.setTargetAtTime(v, t, tc); }
  function play() { if (!timer) { next = ac.currentTime + .1; timer = setInterval(schedule, 250); schedule(); } ramp(level(), 1.5); /* ~5s fade-in */ unhook(); }
  function start() {
    if (!on) return;
    try { if (!ac) build(); } catch (e) { return; }
    if (ac.state === 'running') { play(); return; }
    const p = ac.resume(); const chk = () => { if (on && ac.state === 'running') play(); };
    if (p && p.then) p.then(chk, () => {}); setTimeout(chk, 60);
  }
  function stop() { if (!ac) return; ramp(0, .25); setTimeout(() => { if (!on) { clearInterval(timer); timer = null; ac.suspend(); } }, 1200); }
  const EV = ['pointerdown', 'mousedown', 'touchstart', 'touchend', 'keydown', 'click', 'wheel', 'scroll'];
  const wins = new Set([window]);
  /* listeners stay until audio is actually running (scroll/wheel alone may not count as a gesture) */
  function unhook() { wins.forEach(w => { try { EV.forEach(t => w.removeEventListener(t, gesture, true)); } catch (e) {} }); wins.clear(); }
  function gesture() { start(); }
  /* same-origin frames (the BBS pane, the game) swallow clicks, so listen inside them too */
  function hookFrame(f) { const h = () => { if (!on || (ac && ac.state === 'running')) return; try { const w = f.contentWindow; wins.add(w); EV.forEach(t => w.addEventListener(t, gesture, { capture: true, passive: true })); } catch (e) {} }; f.addEventListener('load', h); h(); }
  if (on) {
    EV.forEach(t => addEventListener(t, gesture, { capture: true, passive: true }));
    document.querySelectorAll('iframe').forEach(hookFrame);
    /* try right away; most browsers block this until a gesture, some allow it */
    start();
    if (ac) ac.addEventListener('statechange', () => { if (on && ac.state === 'running') { play(); } });
  }
  if (btn) btn.addEventListener('click', e => { e.stopPropagation(); on = !on; localStorage.setItem(KEY, on ? 'on' : 'off'); label(); on ? start() : stop(); });
  /* duck while the DOS box is open */
  if (dos) new MutationObserver(() => { if (on && timer) ramp(level(), .6); }).observe(dos, { attributes: true, attributeFilter: ['hidden'] });
  label();
})();
