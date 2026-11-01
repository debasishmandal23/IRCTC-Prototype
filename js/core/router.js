/* IRCTC OneTrip — hash router + view registry.
 * Hash routing works on file:// and on any static server.
 *
 * Views register themselves:
 *   OT.registerView('partner', {
 *     title: 'Partner Dashboard',          // or a function returning a string
 *     section: 'partner',                  // 'traveller' | 'partner' | 'admin' | 'insights' (for nav highlight)
 *     render: function (el, params) {...}, // el = <main id="view"> container, params = {sub, query}
 *     onLeave: function () {...}           // optional cleanup
 *   });
 *
 * Routes look like  #/partner  or  #/partner/listings  or  #/results?from=NDLS&to=CDG
 * params.sub = 'listings', params.query = {from:'NDLS', to:'CDG'}
 * Navigate with OT.go('partner/listings') or <a href="#/partner/listings">.
 */
(function () {
  'use strict';
  var OT = window.OT;
  var views = {};
  var current = null;

  OT.registerView = function (name, def) { views[name] = def; };
  OT.views = views;

  function parse() {
    var hash = (location.hash || '').replace(/^#\/?/, '');
    var q = {};
    var qi = hash.indexOf('?');
    if (qi >= 0) {
      hash.slice(qi + 1).split('&').forEach(function (p) {
        if (!p) return;
        var kv = p.split('=');
        q[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
      });
      hash = hash.slice(0, qi);
    }
    var parts = hash.split('/').filter(Boolean);
    return { name: parts[0] || 'home', sub: parts.slice(1).join('/'), query: q };
  }

  OT.go = function (path) {
    var target = '#/' + String(path || '').replace(/^#?\/?/, '');
    if (location.hash === target) OT.router.render(); else location.hash = target;
  };

  OT.router = {
    current: function () { return current; },
    render: function () {
      var r = parse();
      var def = views[r.name] || views.notfound || views.home;
      var el = document.getElementById('view');
      if (!el || !def) return;
      if (current && current.def && typeof current.def.onLeave === 'function') {
        try { current.def.onLeave(); } catch (e) { console.error(e); }
      }
      current = { name: r.name, def: def, params: r };
      el.innerHTML = '';
      el.setAttribute('data-view', r.name);
      try {
        def.render(el, { sub: r.sub, query: r.query });
      } catch (e) {
        console.error('[OT] view render failed:', r.name, e);
        el.innerHTML = '<div class="container"><div class="card empty-state"><h2>Something went wrong</h2><p>' +
          OT.esc(e.message) + '</p><a class="btn btn-primary" href="#/home">Back to home</a></div></div>';
      }
      var title = typeof def.title === 'function' ? def.title() : def.title;
      document.title = (title ? title + ' · ' : '') + 'IRCTC OneTrip';
      OT.emit('route', { name: r.name, section: def.section || r.name, sub: r.sub, query: r.query });
      if (!r.query.keepScroll) window.scrollTo(0, 0);
      el.focus({ preventScroll: true });
    }
  };

  window.addEventListener('hashchange', function () { OT.router.render(); });
})();
