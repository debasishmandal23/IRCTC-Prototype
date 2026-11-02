/* IRCTC OneTrip — visible "Budget per night" range control (v1.2).
 * Dual-handle slider ₹500–₹15,000 + min/max number inputs + quick chips, always expanded (never in a collapsed panel).
 *
 *   OT.budget.html({id, lo, hi, label, count})     -> markup
 *   OT.budget.bind(scope, id, onChange(lo, hi))    -> wires slider, inputs and chips (onChange debounced for typing)
 *   OT.budget.set(scope, id, lo, hi)               -> programmatic update (e.g. voice "under 3000")
 *   OT.budget.count(scope, id, n, total)           -> "x of y hotels within budget"
 */
(function () {
  'use strict';
  var OT = window.OT;
  var MIN = 500, MAX = 15000, STEP = 100;
  var CHIPS = [[MIN, 2000, 'bud.c1', 'Under ₹2,000'], [2000, 3000, 'bud.c2', '₹2,000–3,000'], [3000, 5000, 'bud.c3', '₹3,000–5,000'], [5000, MAX, 'bud.c4', '₹5,000+']];
  function t(k, fb, v) { return OT.t(k, fb, v); }
  function clamp(v) { v = Math.round((+v || 0) / STEP) * STEP; return Math.max(MIN, Math.min(MAX, v)); }
  function norm(lo, hi) { lo = clamp(lo == null ? MIN : lo); hi = clamp(hi == null ? MAX : hi); if (lo > hi) { var x = lo; lo = hi; hi = x; } return [lo, hi]; }
  function valText(lo, hi) {
    if (lo <= MIN && hi >= MAX) return t('bud.any', 'Any price');
    if (lo <= MIN) return t('bud.upTo', 'Up to {max}', { max: OT.inr(hi) });
    if (hi >= MAX) return t('bud.from', '{min} and above', { min: OT.inr(lo) });
    return OT.inr(lo) + ' – ' + OT.inr(hi);
  }

  function html(o) {
    o = o || {};
    var id = o.id || 'bud', r = norm(o.lo, o.hi);
    return '<div class="bud" data-bud="' + id + '" data-tour="budget">' +
      '<div class="bud-head"><span class="bud-label" id="' + id + '-lbl">' + OT.icon('rupee', 15) + ' ' + OT.esc(o.label || t('bud.label', 'Budget per night')) + '</span>' +
      '<output class="bud-val" id="' + id + '-val" for="' + id + '-lo ' + id + '-hi">' + OT.esc(valText(r[0], r[1])) + '</output></div>' +
      '<div class="bud-range"><div class="bud-track" aria-hidden="true"><span class="bud-fill"></span></div>' +
      '<input type="range" class="bud-lo" id="' + id + '-lo" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + r[0] + '" aria-label="' + OT.esc(t('bud.minAria', 'Minimum budget per night')) + '">' +
      '<input type="range" class="bud-hi" id="' + id + '-hi" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + r[1] + '" aria-label="' + OT.esc(t('bud.maxAria', 'Maximum budget per night')) + '"></div>' +
      '<div class="bud-nums"><label class="bud-num"><span class="xs muted">' + OT.esc(t('bud.min', 'Min')) + '</span><span class="rupee-input"><span>₹</span><input type="number" class="input input-sm" id="' + id + '-min" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" inputmode="numeric" value="' + r[0] + '"></span></label>' +
      '<span class="bud-dash" aria-hidden="true">–</span>' +
      '<label class="bud-num"><span class="xs muted">' + OT.esc(t('bud.max', 'Max')) + '</span><span class="rupee-input"><span>₹</span><input type="number" class="input input-sm" id="' + id + '-max" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" inputmode="numeric" value="' + r[1] + '"></span></label></div>' +
      '<div class="bud-chips" role="group" aria-label="' + OT.esc(t('bud.quick', 'Quick budget')) + '">' + CHIPS.map(function (c, i) {
        return '<button type="button" class="chip" data-bud-chip="' + i + '" aria-pressed="' + (r[0] === c[0] && r[1] === c[1]) + '">' + OT.esc(t(c[2], c[3])) + '</button>';
      }).join('') + '</div>' +
      (o.count !== false ? '<p class="bud-count xs" id="' + id + '-count" aria-live="polite"></p>' : '') + '</div>';
  }

  function paint(box, lo, hi) {
    var id = box.getAttribute('data-bud');
    var f = box.querySelector('.bud-fill');
    if (f) { f.style.left = ((lo - MIN) / (MAX - MIN) * 100) + '%'; f.style.right = (100 - (hi - MIN) / (MAX - MIN) * 100) + '%'; }
    var v = box.querySelector('#' + id + '-val'); if (v) v.textContent = valText(lo, hi);
    OT.$$('[data-bud-chip]', box).forEach(function (b) { var c = CHIPS[+b.getAttribute('data-bud-chip')]; b.setAttribute('aria-pressed', lo === c[0] && hi === c[1] ? 'true' : 'false'); });
  }
  function read(box) { var id = box.getAttribute('data-bud'); return norm(box.querySelector('#' + id + '-lo').value, box.querySelector('#' + id + '-hi').value); }
  function set(scope, id, lo, hi) {
    var box = scope && scope.querySelector('[data-bud="' + id + '"]'); if (!box) return null;
    var r = norm(lo, hi);
    box.querySelector('#' + id + '-lo').value = r[0]; box.querySelector('#' + id + '-hi').value = r[1];
    box.querySelector('#' + id + '-min').value = r[0]; box.querySelector('#' + id + '-max').value = r[1];
    paint(box, r[0], r[1]);
    return r;
  }
  function bind(scope, id, onChange) {
    var box = scope && scope.querySelector('[data-bud="' + id + '"]'); if (!box) return;
    var lo = box.querySelector('#' + id + '-lo'), hi = box.querySelector('#' + id + '-hi'), mn = box.querySelector('#' + id + '-min'), mx = box.querySelector('#' + id + '-max');
    var fire = function () { var r = read(box); if (onChange) onChange(r[0], r[1]); };
    var later = OT.debounce(fire, 350);
    function fromRange(which) {
      var a = +lo.value, b = +hi.value;
      if (a > b) { if (which === 'lo') lo.value = b; else hi.value = a; }
      var r = read(box); mn.value = r[0]; mx.value = r[1]; paint(box, r[0], r[1]);
    }
    lo.addEventListener('input', function () { fromRange('lo'); later(); });
    hi.addEventListener('input', function () { fromRange('hi'); later(); });
    lo.addEventListener('change', fire); hi.addEventListener('change', fire);
    function fromNum() { var r = set(scope, id, mn.value, mx.value); if (r && onChange) onChange(r[0], r[1]); }
    mn.addEventListener('change', fromNum); mx.addEventListener('change', fromNum);
    [mn, mx].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); fromNum(); } }); });
    OT.$$('[data-bud-chip]', box).forEach(function (b) {
      b.addEventListener('click', function () { var c = CHIPS[+b.getAttribute('data-bud-chip')]; set(scope, id, c[0], c[1]); fire(); });
    });
    var r = read(box); paint(box, r[0], r[1]);
  }
  function count(scope, id, n, total) {
    var el = scope && scope.querySelector('#' + id + '-count'); if (!el) return;
    el.innerHTML = OT.icon('filter', 12) + ' ' + OT.esc(t('bud.count', '{n} of {total} hotels within budget', { n: n, total: total }));
    el.classList.toggle('text-warn', n === 0);
  }

  OT.budget = { MIN: MIN, MAX: MAX, html: html, bind: bind, set: set, count: count, norm: norm, text: valText };
})();
