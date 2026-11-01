/* IRCTC OneTrip — app shell: header icons, language selector, nav highlight, mobile menu,
 * i18n re-application and view re-render on language change. (Builder A)
 */
(function () {
  'use strict';
  var OT = window.OT;
  var shell = OT.shell = {};

  var SECTION = { home: 'home', results: 'home', journey: 'journey', checkout: 'journey', bookings: 'bookings', login: 'login', register: 'login' };

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
      a.innerHTML = '<span class="avatar-ini" aria-hidden="true">' + OT.esc(ini) + '</span>';
      a.setAttribute('aria-label', OT.t('hdr.account', 'Account: {name}', { name: u.name }));
      a.title = u.name + ' · ' + u.role;
      a.classList.add('signed-in');
    } else {
      a.innerHTML = OT.icon('user', 20);
      a.setAttribute('aria-label', OT.t('hdr.login', 'Login'));
      a.title = OT.t('hdr.login', 'Login');
      a.classList.remove('signed-in');
    }
  }

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
    if (t && nav) t.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      t.innerHTML = OT.icon(open ? 'x' : 'menu', 20);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', function (e) {
      if (nav && nav.classList.contains('open') && !e.target.closest('#main-nav') && !e.target.closest('#nav-toggle')) closeMenu();
    });

    var mic = $('hdr-mic'); if (mic) mic.addEventListener('click', shell.voice);
    var asst = $('hdr-assistant'); if (asst) asst.addEventListener('click', function () { if (OT.assistant) OT.assistant.toggle(); });
    var demo = $('hdr-demo'); if (demo) demo.addEventListener('click', function () { if (OT.tour) OT.tour.start(); });
    var set = $('hdr-settings'); if (set) set.addEventListener('click', function () { OT.go('settings'); });

    OT.on('route', highlight);
    OT.on('store:user', updateUser);
    OT.on('lang', function (code) {
      var sel = $('lang-select'); if (sel && sel.value !== code) sel.value = code;
      OT.i18n.apply(document);
      labels(); updateUser();
      if (OT.lang) OT.lang.stop();
      shell.rerender();
    });
  };
})();
