/* IRCTC OneTrip — core utilities.
 * Classic script (no ES modules) so index.html works by double-click (file://).
 * Everything hangs off the single global namespace window.OT.
 */
(function () {
  'use strict';
  var OT = (window.OT = window.OT || {});

  OT.version = '1.0.0';

  /** Escape text for safe insertion into HTML. Always use for user/AI text. */
  OT.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  /** Indian-format currency: 12345 -> "₹12,345" */
  OT.inr = function (n, opts) {
    if (n == null || isNaN(n)) return '—';
    var v = Math.round(Number(n));
    return '₹' + v.toLocaleString('en-IN', opts || {});
  };

  /** Compact Indian number: 1234567 -> "12.3 L", 12345678 -> "1.23 Cr" */
  OT.compact = function (n) {
    n = Number(n);
    if (n >= 1e7) return (n / 1e7).toFixed(2).replace(/\.00$/, '') + ' Cr';
    if (n >= 1e5) return (n / 1e5).toFixed(1).replace(/\.0$/, '') + ' L';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  };

  OT.$ = function (sel, root) { return (root || document).querySelector(sel); };
  OT.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /** Create a DOM element from an HTML string (first element). */
  OT.h = function (html) {
    var t = document.createElement('template');
    t.innerHTML = String(html).trim();
    return t.content.firstElementChild;
  };

  OT.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  OT.uid = function (prefix) {
    return (prefix || 'id') + '-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  };

  /** Timestamp label in IST, e.g. "01 Nov 2026, 14:06 IST" */
  OT.stamp = function (d) {
    d = d || new Date();
    try {
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      }) + ' IST';
    } catch (e) { return d.toISOString(); }
  };

  /** Simple event bus: OT.on('lang', fn); OT.emit('lang', 'hi') */
  var listeners = {};
  OT.on = function (evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); return function () { OT.off(evt, fn); }; };
  OT.off = function (evt, fn) { listeners[evt] = (listeners[evt] || []).filter(function (f) { return f !== fn; }); };
  OT.emit = function (evt, data) {
    (listeners[evt] || []).slice().forEach(function (fn) {
      try { fn(data); } catch (e) { console.error('[OT] listener error for', evt, e); }
    });
  };

  /** Debounce helper */
  OT.debounce = function (fn, ms) {
    var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); };
  };
})();
