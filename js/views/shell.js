/* IRCTC OneTrip — app shell: header icons, language selector, nav highlight, mobile menu,
 * i18n re-application and view re-render on language change. (Builder A)
 */
(function () {
  'use strict';
  var OT = window.OT;
  var shell = OT.shell = {};

  var SECTION = { trains: 'trains', home: 'home', results: 'home', journey: 'journey', checkout: 'journey', bookings: 'bookings', login: 'login', register: 'login' };

  function $(id) { return document.getElementById(id); }
  function setIcon(id, name, size) { var el = $(id); if (el) el.innerHTML = OT.icon(name, size || 20); }

  function labels() {
    var map = {
      'nav-toggle': ['aria-label', OT.t('hdr.menu', 'Open menu')],
      'hdr-mic': ['aria-label', OT.t('hdr.mic', 'Voice search')],
      'hdr-assistant': ['aria-label', OT.t('hdr.assistant', 'Open AI assistant')],
      'hdr-settings': ['aria-label', OT.t('hdr.settings', 'Settings')]
    };
    Object.keys(map).forEach(function (id) { var el = $(id); if (el) { el.setAttribute(map[id][0], map[id][1]); el.title = map[id][1]; } });
    var sel = $('lang-select'); if (sel) sel.setAttribute('aria-label', OT.t('hdr.lang', 'Select language'));
  }

  function fillLanguages() {
    var sel = $('lang-select');
    if (!sel) return;
    sel.innerHTML = OT.i18n.languages.map(function (l) {
      return '<option value="' + l.code + '" lang="' + l.code + '" title="' + OT.esc(l.name) + '">' + OT.esc(l.native) + '</option>';
    }).join('');
    sel.value = OT.i18n.lang();
    sel.addEventListener('change', function () { OT.i18n.setLang(sel.value); });
  }

  function updateUser() {
    var a = $('hdr-user'); if (!a) return;
    var u = OT.store.get('user');
    if (u && u.name) {
      var ini = u.name.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
      a.innerHTML = '<span class="avatar-ini" aria-hidden="true">' + OT.esc(ini) + '</span><span class="hu-name">' + OT.esc(u.name.split(' ')[0]) + '</span>' + OT.icon('chevronDown', 14);
      a.setAttribute('aria-label', OT.t('hdr.account', 'Account: {name}', { name: u.name }));
      a.title = u.name + ' · ' + u.role;
      a.classList.add('signed-in');
    } else {
      a.innerHTML = OT.icon('user', 18) + '<span class="hu-name">' + OT.esc(OT.t('hdr.signin', 'Sign in')) + '</span>';
      a.setAttribute('aria-label', OT.t('hdr.signinMenu', 'Sign in · choose a demo persona'));
      a.title = OT.t('hdr.signin', 'Sign in');
      a.classList.remove('signed-in');
    }
    if (menuOpen) renderMenu();
  }

  /* ---------- user menu: who is signed in, switch persona, sign out ---------- */
  var menuOpen = false;
  function renderMenu() {
    var m = $('user-menu'); if (!m) return;
    var u = OT.store.get('user'), P = OT.data.personas;
    var t = OT.t;
    var cur = u && u.name ? '<div class="um-cur"><span class="avatar-ini big">' + OT.esc(u.name.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase()) + '</span><div><strong>' + OT.esc(u.name) + '</strong>' +
      '<span class="xs muted">' + OT.esc(u.personaId && P && P.get(u.personaId) ? t(P.get(u.personaId).segKey, P.get(u.personaId).seg) : u.role) + '</span>' +
      (u.homeCity ? '<span class="xs muted">' + OT.esc(t('um.home', 'Home city')) + ': ' + OT.esc(OT.data.travel.stationName(u.homeCity, OT.i18n.lang())) + ' <bdi class="keep">' + OT.esc(u.homeCity) + '</bdi></span>' : '') +
      '<span class="xs badge b-sim">' + OT.esc(t('um.sim', 'Simulated sign-in')) + '</span></div></div>' : '<p class="small um-hint">' + OT.esc(t('um.hint', 'Pick a demo persona to sign in (no password):')) + '</p>';
    var list = P ? P.list.map(function (p) {
      var on = u && u.personaId === p.id;
      return '<button type="button" class="um-p' + (on ? ' on' : '') + '" data-persona="' + p.id + '" role="menuitem">' + OT.icon(p.role === 'partner' ? 'store' : p.role === 'admin' ? 'bank' : 'user', 16) +
        '<span><strong>' + OT.esc(p.name) + '</strong><span class="xs muted">' + OT.esc(t(p.segKey, p.seg)) + '</span></span>' + (on ? OT.icon('check', 14) : '') + '</button>';
    }).join('') : '';
    m.innerHTML = cur + '<p class="um-label xs">' + OT.esc(u && u.name ? t('um.switch', 'Switch persona') : t('um.personas', 'Demo personas')) + '</p><div class="um-list" role="menu">' + list + '</div>' +
      '<div class="um-foot"><a href="#/login" class="small" data-um-close>' + OT.esc(t('um.all', 'All personas & email sign-in')) + '</a>' +
      (u && u.name ? '<button type="button" class="btn btn-ghost btn-sm" data-um-out>' + OT.icon('logout', 14) + OT.esc(t('auth.logout', 'Sign out')) + '</button>' : '') + '</div>';
  }
  function setMenu(open) {
    var m = $('user-menu'), b = $('hdr-user'); if (!m || !b) return;
    menuOpen = open;
    if (open) renderMenu();
    m.hidden = !open; b.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  shell.userMenu = setMenu;
  function bindMenu() {
    var b = $('hdr-user'), m = $('user-menu'); if (!b || !m) return;
    b.addEventListener('click', function (e) { e.stopPropagation(); setMenu(!menuOpen); });
    m.addEventListener('click', function (e) {
      e.stopPropagation();
      var p = e.target.closest('[data-persona]');
      if (p) { setMenu(false); if (OT.auth && OT.auth.signInPersona) OT.auth.signInPersona(p.getAttribute('data-persona')); return; }
      if (e.target.closest('[data-um-out]')) { setMenu(false); OT.store.set('user', undefined); OT.toast(OT.t('auth.loggedOut', 'Signed out.'), 'info'); OT.router.render(); return; }
      if (e.target.closest('[data-um-close]')) setMenu(false);
    });
    document.addEventListener('click', function (e) { if (menuOpen && e.target.isConnected && !e.target.closest('.user-wrap')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) { setMenu(false); b.focus(); } });
  }

  /** Small dismissible offer bar, e.g. "Switched to हिन्दी for Sunita · Keep English". */
  shell.offer = function (text, actionLabel, fn) {
    var el = document.getElementById('ot-offer');
    if (!el) { el = OT.h('<div class="ot-offer" id="ot-offer" role="status"></div>'); document.body.appendChild(el); }
    el.innerHTML = '<span class="small">' + OT.esc(text) + '</span>' + (actionLabel ? '<button type="button" class="btn btn-ghost btn-sm" data-offer>' + OT.esc(actionLabel) + '</button>' : '') +
      '<button type="button" class="icon-btn" data-offer-x aria-label="Close">' + OT.icon('x', 14) + '</button>';
    el.classList.add('show');
    clearTimeout(shell._offerT);
    shell._offerT = setTimeout(function () { el.classList.remove('show'); }, 10000);
    var a = el.querySelector('[data-offer]'); if (a) a.addEventListener('click', function () { el.classList.remove('show'); if (fn) fn(); });
    el.querySelector('[data-offer-x]').addEventListener('click', function () { el.classList.remove('show'); });
  };

  function closeMenu() {
    var nav = $('main-nav'), t = $('nav-toggle');
    if (nav) nav.classList.remove('open');
    if (t) { t.setAttribute('aria-expanded', 'false'); t.innerHTML = OT.icon('menu', 20); }
  }

  function highlight(r) {
    var sec = SECTION[r.name] || r.section || r.name;
    OT.$$('#main-nav a[data-nav]').forEach(function (a) {
      var on = a.getAttribute('data-nav') === sec;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    closeMenu();
  }

  /** Header mic: voice search on the home page (or start it there). */
  shell.voice = function () {
    var cur = OT.router.current();
    if (cur && cur.name === 'home' && OT.views.home && OT.views.home.startVoice) OT.views.home.startVoice();
    else OT.go('home?voice=1');
  };

  /** Collapse the nav into the menu whenever it does not fit (long labels in some scripts). */
  shell.fitHeader = function () {
    var hdr = OT.$('.app-header'), c = hdr && hdr.querySelector('.container');
    if (!hdr || !c) return;
    hdr.classList.remove('tight', 'compact');
    if (window.innerWidth <= 1100) return;           // base.css already uses the menu here
    if (c.scrollWidth > c.clientWidth + 1) hdr.classList.add('tight');
    if (c.scrollWidth > c.clientWidth + 1) hdr.classList.add('compact');
  };

  shell.rerender = function () {
    var y = window.scrollY;
    OT.router.render();
    window.scrollTo(0, y);
  };

  shell.init = function () {
    setIcon('nav-toggle', 'menu');
    setIcon('lang-globe', 'globe', 16);
    setIcon('hdr-mic', 'mic');
    setIcon('hdr-assistant', 'chat');
    setIcon('hdr-settings', 'settings');
    var bm = OT.$('.brand-mark'); if (bm) bm.innerHTML = OT.icon('train', 20);
    fillLanguages();
    labels();
    updateUser();
    OT.i18n.apply(document);

    var t = $('nav-toggle'), nav = $('main-nav');
    if (t && nav) t.addEventListener('click', function (e) {
      e.stopPropagation(); // the icon is re-rendered below; the outside-click handler must not see a detached target
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      t.innerHTML = OT.icon(open ? 'x' : 'menu', 20);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', function (e) {
      if (!e.target.isConnected) return;
      if (nav && nav.classList.contains('open') && !e.target.closest('#main-nav') && !e.target.closest('#nav-toggle')) closeMenu();
    });

    bindMenu();
    var mic = $('hdr-mic'); if (mic) mic.addEventListener('click', shell.voice);
    var asst = $('hdr-assistant'); if (asst) asst.addEventListener('click', function () { if (OT.assistant) OT.assistant.toggle(); });
    var demo = $('hdr-demo'); if (demo) demo.addEventListener('click', function () { if (OT.tour) OT.tour.start(); });
    var set = $('hdr-settings'); if (set) set.addEventListener('click', function () { OT.go('settings'); });

    shell.fitHeader();
    window.addEventListener('resize', OT.debounce(shell.fitHeader, 120));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(shell.fitHeader).catch(function () {});
    OT.on('route', highlight);
    OT.on('store:user', updateUser);
    OT.on('lang', function (code) {
      var sel = $('lang-select'); if (sel && sel.value !== code) sel.value = code;
      OT.i18n.apply(document);
      labels(); updateUser(); shell.fitHeader();
      if (OT.lang) OT.lang.stop();
      shell.rerender();
    });
  };
})();
