/* IRCTC OneTrip — app state store.
 * In-memory state with best-effort localStorage persistence (wrapped in try/catch:
 * private windows / file:// in some browsers can throw).
 *
 * API:
 *   OT.store.get('journey')            -> value
 *   OT.store.set('journey', value)     -> persists + emits 'store:journey'
 *   OT.store.update('journey', fn)     -> set(key, fn(current))
 *   OT.store.reset()                   -> clears persisted demo state
 */
(function () {
  'use strict';
  var OT = window.OT;
  var KEY = 'onetrip.v1';
  var state = {};
  var PERSIST = ['lang', 'user', 'journey', 'bookings', 'geminiKey', 'geminiModel', 'aiMode', 'cancellations', 'partnerListings', 'enquiries', 'tickets', 'sound', 'notifications'];

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) state = JSON.parse(raw) || {};
    } catch (e) { state = {}; }
  }
  function save() {
    try {
      var out = {};
      PERSIST.forEach(function (k) { if (state[k] !== undefined) out[k] = state[k]; });
      window.localStorage.setItem(KEY, JSON.stringify(out));
    } catch (e) { /* storage unavailable: stay in-memory */ }
  }

  load();

  OT.store = {
    get: function (k, fallback) { return state[k] === undefined ? fallback : state[k]; },
    set: function (k, v) { state[k] = v; save(); OT.emit('store:' + k, v); OT.emit('store', { key: k, value: v }); return v; },
    update: function (k, fn) { return OT.store.set(k, fn(state[k])); },
    reset: function () {
      var keep = { geminiKey: state.geminiKey, geminiModel: state.geminiModel, lang: state.lang };
      state = keep; save(); OT.emit('store:reset');
    },
    _dump: function () { return JSON.parse(JSON.stringify(state)); }
  };
})();
