/* IRCTC OneTrip — guided jury demo (~3 minutes). OT.tour.start()
 * The tour DRIVES the app (routes, sample voice query, adds items, pays, asks the assistant), so the
 * presenter can just press Next. Captions are presenter notes (kept in English on purpose).
 * Steps on Builder B's pages route there and point at the page heading if no specific hook exists.
 */
(function () {
  'use strict';
  var OT = window.OT;
  var T = OT.tour = {};
  var root, spot, card, idx = -1, active = false, busy = false, done = {}, savedUser, raf = 0, curTarget = null;

  function waitFor(fn, ms) {
    var t0 = Date.now(); ms = ms || 8000;
    return new Promise(function (resolve) {
      (function poll() {
        var v = null; try { v = fn(); } catch (e) { v = null; }
        if (v) return resolve(v);
        if (Date.now() - t0 > ms) return resolve(null);
        setTimeout(poll, 100);
      })();
    });
  }
  function find(sel) {
    var list = [].concat(sel || []);
    for (var i = 0; i < list.length; i++) {
      var el = typeof list[i] === 'function' ? list[i]() : document.querySelector(list[i]);
      if (el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length)) return el;
    }
    return null;
  }
  function route() { var c = OT.router.current(); return c && c.name; }
  function go(path, name) { OT.go(path); return waitFor(function () { return route() === (name || path.split('?')[0].split('/')[0]); }, 4000); }
  function view(n) { return OT.views[n] || {}; }

  var steps = [
    { title: 'Welcome to IRCTC OneTrip', text: 'A rail-first trip planner that complements IRCTC ticketing. Everything is simulated sample data. This tour drives the app for you: just press Next.',
      target: '.brand', enter: function () { return go('home'); } },
    { title: 'Pick your language', text: 'The header selector offers 11 Indian languages in their own scripts. We switch to Hindi: the whole interface follows, and the destination board cycles through scripts.',
      target: '.lang-select', enter: function () { OT.i18n.setLang('hi'); return OT.sleep(300); } },
    { title: 'Speak the query (sample voice)', text: 'Real mics vary by browser, so we play the sample Hindi voice query as simulated ASR types it out. The live parse shows what was understood: Chandigarh, ₹3,000, near the station.',
      target: '[data-tour="voice"]', enter: function () { return go('home').then(function () { return view('home').sample ? view('home').sample('hi') : null; }); } },
    { title: 'Agent Trace: orchestrator → specialists', text: 'The Orchestrator decomposes the task and assigns Multilingual, Research, Verification, Recommendation and Itinerary agents. Each step shows tool calls, sources and timings.',
      target: '[data-tour="trace"]', enter: function () {
        OT.state.lastRun = null;
        var p = view('home').submit ? view('home').submit() : Promise.resolve();
        return p.then(function () { return waitFor(function () { return route() === 'results' && document.querySelector('.tr-step'); }, 5000); });
      } },
    { title: 'Verification catches problems', text: 'Every record is re-checked at the provider: a changed price is flagged “Needs confirmation”, stale data asks for a re-check, a sold-out hotel is hidden. Hotel Shivalik View (partner P-101) is the top verified pick under ₹3,000.',
      target: '[data-ref="H-CDG-01"]', enter: function () {
        return waitFor(function () { return OT.state.lastRun && OT.state.lastRun.done && document.querySelector('[data-ref="H-CDG-01"]'); }, 15000)
          .then(function () { if (view('results').tab) view('results').tab('hotel'); });
      } },
    { title: 'Add the verified hotel', text: 'One click adds it to My Journey. The price comes from the provider catalogue, never from the AI. Trip Readiness updates immediately.',
      target: '[data-ref="H-CDG-01"]', enter: function () {
        var j = OT.store.get('journey');
        var has = j && (j.items || []).some(function (i) { return i.refId === 'H-CDG-01' && i.status !== 'cancelled'; });
        if (!has && view('results').add) view('results').add('H-CDG-01');
        return OT.sleep(200);
      } },
    { title: 'Add a station cab', text: 'Under Cabs, a sedan timed to the train’s 11:05 arrival is the top pick, with a price comparison against simulated providers.',
      target: '[data-ref="C-CDG-01"]', enter: function () {
        if (view('results').tab) view('results').tab('cab');
        var j = OT.store.get('journey');
        if (!(j && j.items.some(function (i) { return i.refId === 'C-CDG-01' && i.status !== 'cancelled'; })) && view('results').add) view('results').add('C-CDG-01');
        return OT.sleep(250);
      } },
    { title: 'My Journey: one dashboard', text: 'Trip Readiness is a weighted checklist that explains every point. The timeline is drawn as a railway route line: navy for the train, saffron for local legs.',
      target: '[data-tour="readiness"]', enter: function () { return go('journey'); } },
    { title: 'Conflict detected', text: 'The train arrives at 11:05 but standard check-in is 14:00: a 2 h 55 min wait. The Itinerary Agent proposes three fixes.',
      target: '[data-tour="conflict"]', enter: function () { return waitFor(function () { return document.querySelector('[data-tour="conflict"]'); }, 3000); } },
    { title: 'Resolved, readiness rises', text: 'We leave bags at the station cloakroom and link the sample return train. The conflict turns green and the readiness ring climbs.',
      target: '[data-tour="readiness"]', enter: function () {
        if (view('journey').fix) view('journey').fix('cloak');
        var j = OT.store.get('journey');
        if (j && !j.returnTrain && view('journey').linkReturn) view('journey').linkReturn();
        return OT.sleep(400);
      } },
    { title: 'Review & pay (simulated)', text: 'An itemised summary with GST shown, and the IRCTC ticket listed separately as already paid, so it is never charged again. Payment details are masked demo values.',
      target: '[data-tour="co-items"]', enter: function () { return go('checkout'); } },
    { title: 'Human-in-the-loop confirmation', text: 'Agents propose; the traveller decides. Nothing is booked until this is confirmed. The PNR, train number, dates and amounts are shown exactly as booked and never translated.',
      target: '.modal', enter: function () {
        if (view('checkout').pay) view('checkout').pay();
        return waitFor(function () { return document.querySelector('.modal-backdrop.show .modal'); }, 3000);
      } },
    { title: 'Booking confirmed', text: 'Booking references and a simulated transaction ID are issued. Partner P-101 is notified, and the journey items turn Confirmed.',
      target: '[data-tour="confirmation"]', enter: function () {
        var b = document.querySelector('.modal-backdrop .modal-foot .btn-primary');
        if (b) b.click();
        return waitFor(function () { return document.querySelector('[data-tour="confirmation"]'); }, 5000);
      } },
    { title: 'Assistant answers in Hindi, aloud', text: 'The Customer Support Agent answers a refund question in Hindi, cites the policy it used, keeps the English original one tap away, and reads the reply aloud (or shows the text if this device has no Hindi voice).',
      target: '.asst-drawer', enter: function () {
        if (!OT.assistant) return null;
        OT.assistant.open();
        return OT.assistant.ask('मेरा रिफंड कब आएगा?', { speak: true });
      } },
    { title: 'Partner dashboard sees the booking', text: 'Logged in as Hotel Shivalik View (P-101), the partner sees the new booking and KPIs update.',
      target: ['[data-tour="partner-bookings"]', '#partner-bookings', '.page-head'], enter: function () {
        if (OT.assistant) OT.assistant.close();
        if (OT.lang) OT.lang.stop();
        OT.store.set('user', { name: 'Rajinder Singh', email: 'p101.shivalik@demo.onetrip', role: 'partner', partnerId: 'P-101', org: 'Hotel Shivalik View', simulated: true });
        return go('partner');
      } },
    { title: 'Admin & Bank: language analytics', text: 'Admin monitors users, bookings, refunds, partner performance, financial products and language usage, translation quality and support.',
      target: ['[data-tour="admin-language"]', '#admin-language', '.page-head'], enter: function () {
        OT.store.set('user', { name: 'Ananya Rao', email: 'admin@demo.onetrip', role: 'admin', org: 'IRCTC OneTrip Admin · Partner Bank (sample)', simulated: true });
        return go('admin');
      } },
    { title: 'The business case', text: 'Survey evidence (N=52), personas, the five case questions, the bank’s role, financial products, revenue model and social-mandate guardrails. End of the tour.',
      target: '.page-head', enter: function () { return go('insights'); } }
  ];

  function build() {
    root = document.getElementById('tour-root');
    if (!root) { root = document.createElement('div'); root.id = 'tour-root'; document.body.appendChild(root); }
    root.innerHTML = '<div class="tour-spot" aria-hidden="true"></div>' +
      '<div class="tour-card" role="dialog" aria-live="polite" aria-label="Guided demo">' +
      '<div class="tour-top"><span class="tour-kicker">Guided demo · presenter notes</span><span class="tour-count"></span>' +
      '<button type="button" class="icon-btn tour-x" aria-label="Exit tour">' + OT.icon('x', 16) + '</button></div>' +
      '<h3 class="tour-title"></h3><p class="tour-text"></p>' +
      '<div class="tour-bar"><span></span></div>' +
      '<div class="tour-nav"><button type="button" class="btn btn-ghost btn-sm tour-back">' + OT.icon('arrowLeft', 15) + 'Back</button>' +
      '<span class="tour-busy xs muted"></span>' +
      '<button type="button" class="btn btn-primary btn-sm tour-next">Next' + OT.icon('arrowRight', 15) + '</button></div></div>';
    spot = root.querySelector('.tour-spot'); card = root.querySelector('.tour-card');
    root.querySelector('.tour-x').addEventListener('click', T.end);
    root.querySelector('.tour-next').addEventListener('click', T.next);
    root.querySelector('.tour-back').addEventListener('click', T.back);
  }

  function place() {
    if (!active || !card) return;
    var el = curTarget && document.body.contains(curTarget) ? curTarget : null;
    var vw = window.innerWidth, vh = window.innerHeight, mobile = vw < 700;
    if (!el) { spot.style.opacity = '0'; } else {
      var r = el.getBoundingClientRect(), pad = 6;
      var top = Math.max(4, r.top - pad), left = Math.max(4, r.left - pad);
      var w = Math.min(vw - left - 4, r.width + pad * 2), h = Math.min(vh - top - 4, r.height + pad * 2);
      spot.style.opacity = '1';
      spot.style.transform = 'translate(' + left + 'px,' + top + 'px)';
      spot.style.width = Math.max(0, w) + 'px'; spot.style.height = Math.max(0, h) + 'px';
    }
    card.classList.toggle('tour-mobile', mobile);
    if (mobile) { card.style.left = ''; card.style.top = ''; return; }
    var cw = card.offsetWidth, ch = card.offsetHeight, cx, cy;
    if (el) {
      var rr = el.getBoundingClientRect();
      cy = rr.bottom + 14; cx = Math.min(Math.max(12, rr.left), vw - cw - 12);
      if (cy + ch > vh - 12) cy = rr.top - ch - 14;
      if (cy < 12) { cy = Math.min(vh - ch - 12, Math.max(12, rr.top + 12)); cx = rr.right + 14 + cw < vw ? rr.right + 14 : Math.max(12, rr.left - cw - 14); if (cx < 12) { cx = vw - cw - 12; cy = vh - ch - 12; } }
    } else { cx = (vw - cw) / 2; cy = vh - ch - 24; }
    card.style.left = Math.round(cx) + 'px'; card.style.top = Math.round(Math.max(12, cy)) + 'px';
  }
  function loop() { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { place(); }); }

  function show(i) {
    var s = steps[i];
    idx = i;
    card.querySelector('.tour-count').textContent = (i + 1) + ' / ' + steps.length;
    card.querySelector('.tour-title').textContent = s.title;
    card.querySelector('.tour-text').textContent = s.text;
    card.querySelector('.tour-bar span').style.width = Math.round((i + 1) / steps.length * 100) + '%';
    card.querySelector('.tour-back').disabled = i === 0;
    card.querySelector('.tour-next').innerHTML = i === steps.length - 1 ? 'Finish' + OT.icon('check', 15) : 'Next' + OT.icon('arrowRight', 15);
  }

  function setBusy(b) {
    busy = b;
    if (!card) return;
    card.querySelector('.tour-next').disabled = b;
    card.querySelector('.tour-busy').innerHTML = b ? '<span class="spinner"></span> working…' : '';
  }

  function run(i, fresh) {
    var s = steps[i];
    show(i);
    curTarget = null; place();
    setBusy(true);
    var p;
    if (fresh && !done[i]) { done[i] = true; try { p = Promise.resolve(s.enter && s.enter()); } catch (e) { console.error(e); p = Promise.resolve(); } }
    else p = s.hash && location.hash !== s.hash ? (location.hash = s.hash, OT.sleep(350)) : Promise.resolve();
    return p.catch(function (e) { console.error('[OT] tour step failed', e); }).then(function () {
      if (!active || idx !== i) return;
      if (fresh) s.hash = location.hash;
      return waitFor(function () { return find(s.target); }, 2500);
    }).then(function (el) {
      if (!active || idx !== i) return;
      curTarget = el || null;
      if (el && el.scrollIntoView && !el.closest('.asst-drawer') && !el.closest('.modal') && !el.closest('.app-header')) {
        try { el.scrollIntoView({ block: el.offsetHeight > window.innerHeight * 0.7 ? 'start' : 'center', behavior: 'auto' }); } catch (e) { el.scrollIntoView(); }
      }
      setBusy(false);
      place();
      setTimeout(place, 350);
    });
  }

  function onKey(e) {
    if (!active) return;
    if (e.key === 'Escape' && !document.querySelector('.modal-backdrop')) T.end();
    if (e.key === 'ArrowRight' && !busy && !/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) T.next();
    if (e.key === 'ArrowLeft' && !busy && !/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) T.back();
  }

  T.start = function () {
    if (active) T.end();
    savedUser = OT.store.get('user');
    // fresh, deterministic demo state (bookings history is kept)
    OT.state.lastRun = null; OT.state.dismissed = {}; OT.state.lastCheckout = null; OT.state.resTab = 'hotel'; OT.state.homeDraft = '';
    OT.store.set('journey', OT.data.travel.makeJourney('CDG', {}));
    OT.store.set('user', { name: 'Sunita Sharma', email: 'sunita.sharma@demo.onetrip', role: 'traveller', simulated: true });
    if (OT.assistant) { OT.assistant.close(); OT.assistant.reset(); }
    if (OT.i18n.lang() !== 'en') OT.i18n.setLang('en');
    done = {}; steps.forEach(function (s) { s.hash = null; });
    build();
    active = true;
    document.body.classList.add('touring');
    window.addEventListener('resize', loop); window.addEventListener('scroll', loop, true);
    document.addEventListener('keydown', onKey);
    return run(0, true);
  };
  T.next = function () {
    if (!active || busy) return Promise.resolve();
    if (idx >= steps.length - 1) { T.end(); return Promise.resolve(); }
    return run(idx + 1, true);
  };
  T.back = function () { if (!active || busy || idx <= 0) return Promise.resolve(); return run(idx - 1, false); };
  T.end = function () {
    if (!active) return;
    active = false;
    document.body.classList.remove('touring');
    window.removeEventListener('resize', loop); window.removeEventListener('scroll', loop, true);
    document.removeEventListener('keydown', onKey);
    if (root) root.innerHTML = '';
    OT.store.set('user', savedUser);
  };
  T.isActive = function () { return active; };
  T.step = function () { return idx; };
  T.steps = steps;
})();
