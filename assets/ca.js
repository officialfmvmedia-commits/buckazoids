/* BUCKAZOIDS: contract address, click to copy (with fallback for old browsers / non-https). */
(function () {
  var box = document.getElementById('ca'), btn = document.getElementById('cacopy'), msg = document.getElementById('camsg'), str = document.getElementById('castr');
  if (!box || !btn) return;
  var CA = box.getAttribute('data-ca');
  var idle = msg ? msg.innerHTML : '', t;
  function legacy(text) {
    var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.top = '-1000px'; ta.style.opacity = '0'; document.body.appendChild(ta);
    ta.select(); ta.setSelectionRange(0, text.length); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta); return ok;
  }
  function selectText() { try { var r = document.createRange(); r.selectNodeContents(str); var s = getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {} }
  function done(ok) {
    clearTimeout(t); box.classList.add('got');
    btn.innerHTML = ok ? '&#10003; COPIED!' : 'PRESS CTRL+C';
    if (msg) msg.innerHTML = ok ? '&gt; 59 buckazoids added to your clipboard.' : '&gt; selected. press ctrl+c (cmd+c on a mac).';
    if (!ok) selectText();
    t = setTimeout(function () { btn.innerHTML = '[C] COPY CA'; if (msg) msg.innerHTML = idle; box.classList.remove('got'); }, 2200);
  }
  function copy() {
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(CA).then(function () { done(true); }, function () { done(legacy(CA)); });
    else done(legacy(CA));
  }
  btn.addEventListener('click', copy);
  if (str) str.addEventListener('click', copy);
})();
