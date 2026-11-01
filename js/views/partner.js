/* IRCTC OneTrip — Tourism Partner dashboard (#/partner[/sub]) — Builder B.
 * Demo partner P-101 "Hotel Shivalik View, Chandigarh". Static sample data comes from
 * OT.data.analytics.p101 (SIMULATED); live bookings made in the traveller flow are merged in
 * from OT.store 'bookings' (partnerId === 'P-101') and highlighted "New via OneTrip".
 */
(function () {
  'use strict';
  var OT = window.OT;
  var esc = OT.esc;
  var K = OT.dashkit, C = OT.charts;
  var t = K.t;
  var PID = 'P-101';
  var unsubs = [];

  if (OT.i18n && OT.i18n.extend) {
    OT.i18n.extend({ hi: {
      'partner.revWeekly': 'साप्ताहिक राजस्व',
      'partner.recent': 'हाल की बुकिंग',
      'partner.allBookings': 'सभी बुकिंग',
      'partner.ovSub': 'एक नज़र में आपका OneTrip व्यवसाय। प्रोटोटाइप के सभी आंकड़े सिम्युलेटेड हैं।',
      'partner.reviewsRecent': 'हाल की समीक्षाएँ',
      'partner.sentiment': 'भावना',
      'partner.reviewLang': 'समीक्षा की भाषा',
      'partner.funnel': 'बुकिंग फ़नल · 12 सप्ताह',
      'partner.convTrend': 'रूपांतरण दर',
      'partner.cancelWhy': 'रद्दीकरण और कारण',
      'partner.radar': 'डिमांड रडार: चंडीगढ़ आगमन (अगले 30 दिन)',
      'partner.avgOrder': 'औसत बुकिंग मूल्य',
      'partner.replied': 'जवाब दिया गया',
      'partner.awaiting': 'जवाब बाकी',
      'partner.original': 'मूल',
      'partner.redraft': 'फिर से तैयार करें',
      'partner.discard': 'हटाएँ',
      'partner.live': 'लाइव',
      'partner.paused': 'रोकी गई',
      'partner.draftSt': 'ड्राफ़्ट',
      'partner.goLive': 'लाइव करें',
      'partner.pause': 'रोकें',
      'partner.col.ref': 'बुकिंग संदर्भ',
      'partner.col.guest': 'मेहमान',
      'partner.col.service': 'सेवा',
      'partner.col.date': 'चेक-इन / पिकअप',
      'partner.col.amount': 'राशि',
      'partner.col.status': 'स्थिति',
      'partner.col.channel': 'चैनल',
      'partner.f.all': 'सभी',
      'partner.f.upcoming': 'पक्की',
      'partner.f.cancelled': 'रद्द',
      'partner.f.live': 'OneTrip से नई',
      'sent.positive': 'सकारात्मक',
      'sent.neutral': 'तटस्थ',
      'sent.negative': 'नकारात्मक',
      'partner.title': 'पार्टनर डैशबोर्ड',
      'partner.console': 'पार्टनर कंसोल',
      'partner.overview': 'सारांश',
      'partner.listings': 'लिस्टिंग',
      'partner.pricing': 'कीमत और उपलब्धता',
      'partner.enquiries': 'बुकिंग पूछताछ',
      'partner.bookings': 'पक्की बुकिंग',
      'partner.performance': 'प्रदर्शन',
      'partner.feedback': 'ग्राहक प्रतिक्रिया',
      'partner.login': 'पार्टनर लॉगिन',
      'partner.register': 'पार्टनर के रूप में पंजीकरण करें',
      'partner.signin': 'साइन इन करें',
      'partner.signout': 'साइन आउट',
      'partner.revenue': 'राजस्व',
      'partner.bookingsKpi': 'बुकिंग',
      'partner.conversion': 'रूपांतरण',
      'partner.cancellations': 'रद्दीकरण',
      'partner.rating': 'रेटिंग',
      'partner.draft': 'पार्टनर एजेंट से जवाब तैयार करें',
      'partner.send': 'जवाब भेजें',
      'partner.newVia': 'OneTrip से नई',
      'partner.addListing': 'नई लिस्टिंग जोड़ें',
      'partner.agentSays': 'पार्टनर एजेंट के सुझाव',
      'partner.showOriginal': 'मूल देखें',
      'partner.showTranslation': 'अनुवाद देखें'
    } });
  }

  var A = function () { return OT.data.analytics; };
  var P = function () { return OT.data.analytics.p101; };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- data access ---------- */
  function listings() {
    var l = OT.store.get('partnerListings');
    if (!Array.isArray(l) || !l.length) l = clone(P().listings);
    return l.filter(function (x) { return x && typeof x === 'object'; });
  }
  function saveListings(l) { OT.store.set('partnerListings', l); }

  function liveBookings() {
    var j = OT.store.get('journey') || {};
    var items = (j && j.items) || [];
    return A().live().p101.map(function (b) {
      var it = items.filter(function (x) { return x && x.id === b.itemId; })[0];
      return {
        ref: b.ref || 'OT-LIVE', guest: b.guest || 'OneTrip traveller', title: b.title || 'OneTrip booking', type: b.type,
        checkin: (it && it.when) || b.when || (j.train && j.train.date) || b.paidAt,
        nights: b.nights || (it && it.endWhen ? 1 : null), amount: Number(b.amount) || 0,
        status: b.status === 'refunded' ? 'cancelled' : (b.status || 'confirmed'), lang: langName(b.lang), paidAt: b.paidAt, live: true, early: !!b.earlyCheckIn, pax: b.pax,
        refund: b.cancellation
      };
    });
  }
  function langName(code) {
    if (!code) return '';
    var l = ((OT.i18n && OT.i18n.languages) || []).filter(function (x) { return x.code === code; })[0];
    return l ? l.name : String(code);
  }
  function allBookings() {
    var live = liveBookings().sort(function (a, b) { return String(b.paidAt).localeCompare(String(a.paidAt)); });
    return live.concat(P().sampleBookings.map(function (b) { var c = clone(b); c.live = false; return c; }));
  }

  function enquiries() {
    var stored = OT.store.get('enquiries');
    stored = Array.isArray(stored) ? stored.filter(function (e) { return e && e.id; }) : [];
    var byId = {};
    stored.forEach(function (e) { byId[e.id] = e; });
    var base = P().enquiries.map(function (e) { var c = clone(e); if (byId[e.id]) Object.keys(byId[e.id]).forEach(function (k) { c[k] = byId[e.id][k]; }); return c; });
    var extra = stored.filter(function (e) { return (e.partnerId === PID || !e.partnerId) && !P().enquiries.some(function (x) { return x.id === e.id; }) && (e.original || e.english || e.text || e.message); })
      .map(function (e) { return { id: e.id, partnerId: PID, guest: e.guest || 'OneTrip traveller', lang: e.lang || 'en', langName: e.langName || (e.lang || 'English'), listingId: e.listingId, dates: e.dates || '', pax: e.pax || '', topic: e.topic || 'general', received: e.received || e.createdAt || new Date().toISOString(), original: e.original || e.text || e.message || e.english, english: e.english || e.text || e.message || e.original, status: e.status, reply: e.reply, repliedAt: e.repliedAt, live: true }; });
    return extra.concat(base);
  }
  function saveEnquiry(id, patch) {
    OT.store.update('enquiries', function (cur) {
      cur = Array.isArray(cur) ? cur.slice() : [];
      var i = -1;
      cur.forEach(function (e, k) { if (e && e.id === id) i = k; });
      if (i >= 0) { Object.keys(patch).forEach(function (k) { cur[i][k] = patch[k]; }); } else { patch.id = id; patch.partnerId = PID; cur.push(patch); }
      return cur;
    });
  }

  function isPartner() { var u = OT.store.get('user'); return !!(u && u.role === 'partner'); }

  /* ---------- computed KPIs ---------- */
  function kpis() {
    var p = P(), live = liveBookings();
    var liveConf = live.filter(function (b) { return b.status !== 'cancelled'; });
    var liveCanc = live.filter(function (b) { return b.status === 'cancelled'; });
    var sum = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };
    var revBase = sum(p.revenue), bkBase = sum(p.bookings), views = sum(p.views), canc = sum(p.cancellations);
    var rev = revBase + liveConf.reduce(function (a, b) { return a + b.amount; }, 0);
    var bk = bkBase + live.length;
    var last4 = sum(p.revenue.slice(8)), prev4 = sum(p.revenue.slice(4, 8));
    var bLast4 = sum(p.bookings.slice(8)), bPrev4 = sum(p.bookings.slice(4, 8));
    return {
      rev: rev, bk: bk, live: live.length, liveRev: liveConf.reduce(function (a, b) { return a + b.amount; }, 0),
      conv: bk / (views + live.length) * 100, cancel: (canc + liveCanc.length) / bk * 100,
      revGrowth: (last4 / prev4 - 1) * 100, bkGrowth: (bLast4 / bPrev4 - 1) * 100,
      rating: p.rating, reviews: p.reviews
    };
  }

  /* ---------- gate ---------- */
  function renderGate(root, query) {
    var mode = query && query.mode === 'register' ? 'register' : 'login';
    root.innerHTML = '<div class="container page"><div class="gate">' +
      '<div class="gate-side"><div class="eyebrow">' + esc(t('partner.console', 'Partner console')) + '</div>' +
      '<h1>' + esc(t('partner.gate.h', 'Grow with travellers who already booked their train.')) + '</h1>' +
      '<p>' + esc(t('partner.gate.p', 'OneTrip shows verified hotels, cabs and tours to IRCTC travellers after their ticket is confirmed — one card per stage, no spam.')) + '</p>' +
      '<ul>' +
        '<li>' + OT.icon('target', 18) + '<span>' + esc(t('partner.gate.b1', 'Demand Radar: see arrivals to your city by date (aggregated, small cohorts hidden).')) + '</span></li>' +
        '<li>' + OT.icon('bot', 18) + '<span>' + esc(t('partner.gate.b2', 'Partner Agent drafts replies to enquiries in the traveller’s language. You approve every message.')) + '</span></li>' +
        '<li>' + OT.icon('bank', 18) + '<span>' + esc(t('partner.gate.b3', 'Escrow-backed payments, settled T+1 after check-in by Partner Bank (sample).')) + '</span></li>' +
      '</ul><div class="sim-line" style="color:#C8D6EE">' + OT.simTag() + '<span>' + esc(t('partner.gate.sim', 'Simulated login — no real credentials are stored or checked.')) + '</span></div></div>' +
      '<div class="gate-form"><div class="tabs" role="tablist">' +
        '<button class="tab" role="tab" data-mode="login" aria-selected="' + (mode === 'login') + '">' + esc(t('partner.login', 'Partner login')) + '</button>' +
        '<button class="tab" role="tab" data-mode="register" aria-selected="' + (mode === 'register') + '">' + esc(t('partner.register', 'Register as partner')) + '</button></div>' +
        '<div data-gate-body></div></div></div></div>';
    var body = root.querySelector('[data-gate-body]');
    function draw(m) {
      OT.$$('.tab', root).forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-mode') === m)); });
      if (m === 'login') {
        body.innerHTML = '<form data-form="login" novalidate>' +
          '<div class="demo-creds">' + OT.icon('info', 15) + ' ' + esc(t('partner.gate.demo', 'Demo credentials are prefilled for P-101 Hotel Shivalik View, Chandigarh.')) + '</div>' +
          '<div class="field"><label for="pl-id">' + esc(t('partner.gate.id', 'Partner ID')) + '</label><input class="input" id="pl-id" value="P-101" autocomplete="off"></div>' +
          '<div class="field"><label for="pl-email">' + esc(t('partner.gate.email', 'Email')) + '</label><input class="input" id="pl-email" type="email" value="frontdesk@shivalikview.example" autocomplete="off"></div>' +
          '<div class="field"><label for="pl-pass">' + esc(t('partner.gate.pass', 'Password')) + '</label><input class="input" id="pl-pass" type="password" value="demo-only" autocomplete="off"></div>' +
          '<button class="btn btn-primary btn-lg" type="submit">' + OT.icon('lock', 18) + esc(t('partner.signin', 'Sign in')) + '</button>' +
          '<p class="small muted">' + esc(t('partner.gate.other', 'Any Partner ID opens the P-101 demo data in this prototype.')) + '</p></form>';
      } else {
        body.innerHTML = '<form data-form="register" novalidate><div class="form-grid">' +
          '<div class="field full"><label for="pr-name">' + esc(t('partner.reg.name', 'Business name')) + ' *</label><input class="input" id="pr-name" required placeholder="e.g. Hotel Ganga Darshan"></div>' +
          '<div class="field"><label for="pr-type">' + esc(t('partner.reg.type', 'Business type')) + '</label><select class="input" id="pr-type"><option>Hotel</option><option>Homestay / dharamshala</option><option>Cab operator</option><option>Tour operator</option><option>Caterer</option></select></div>' +
          '<div class="field"><label for="pr-city">' + esc(t('partner.reg.city', 'City / nearest station')) + ' *</label><input class="input" id="pr-city" required placeholder="e.g. Varanasi (BSB)"></div>' +
          '<div class="field"><label for="pr-gst">GSTIN <span class="muted">(' + esc(t('partner.reg.mock', 'mock, optional')) + ')</span></label><input class="input" id="pr-gst" placeholder="Do not enter a real GSTIN"></div>' +
          '<div class="field"><label for="pr-contact">' + esc(t('partner.reg.contact', 'Contact email or phone')) + ' *</label><input class="input" id="pr-contact" required placeholder="name@example.com"></div>' +
          '<div class="field full"><label for="pr-lang">' + esc(t('partner.reg.lang', 'Preferred language for enquiries')) + '</label><select class="input" id="pr-lang">' + langOptions() + '</select></div>' +
          '</div><p class="small muted">' + OT.icon('bank', 15) + ' ' + esc(t('partner.reg.bank', 'Settlement account is set up later through Partner Bank video-KYC (simulated). This prototype never asks for real bank details.')) + '</p>' +
          '<button class="btn btn-primary" type="submit">' + esc(t('partner.reg.submit', 'Submit application')) + '</button></form>';
      }
    }
    draw(mode);
    root.addEventListener('click', function (e) {
      var tab = e.target.closest('.tab[data-mode]');
      if (tab) draw(tab.getAttribute('data-mode'));
      if (e.target.closest('[data-demo-login]')) draw('login');
    });
    root.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target;
      if (f.getAttribute('data-form') === 'login') {
        var prev = OT.store.get('user') || {};
        OT.store.set('user', { name: 'Hotel Shivalik View', email: (OT.$('#pl-email', root).value || 'frontdesk@shivalikview.example').trim(), phone: prev.phone || '', role: 'partner', partnerId: PID });
        OT.toast(t('partner.welcome', 'Signed in as P-101 Hotel Shivalik View (simulated)'), 'success');
        OT.router.render();
      } else {
        var name = OT.$('#pr-name', root).value.trim(), city = OT.$('#pr-city', root).value.trim(), contact = OT.$('#pr-contact', root).value.trim();
        if (!name || !city || !contact) { OT.toast(t('partner.reg.missing', 'Please fill business name, city and contact.'), 'error'); return; }
        var appId = 'PA-' + Math.random().toString(36).slice(2, 7).toUpperCase();
        body.innerHTML = '<div class="stack"><div class="badge b-ok">' + OT.icon('checkCircle', 14) + esc(t('partner.reg.ok', 'Application received')) + '</div>' +
          '<h3>' + esc(name) + ' · ' + esc(city) + '</h3><p class="muted">' + esc(t('partner.reg.ref', 'Reference')) + ' ' + K.keep(appId) + ' ' + OT.simTag() + '</p>' +
          '<ol class="rules"><li>' + esc(t('partner.reg.s1', 'Document check via DigiLocker / GST (simulated)')) + '</li><li>' + esc(t('partner.reg.s2', 'Partner Bank video-KYC and escrow settlement account')) + '</li><li>' + esc(t('partner.reg.s3', 'Listing review by Partner Agent: photos, prices, cancellation policy')) + '</li><li>' + esc(t('partner.reg.s4', 'Go live in OneTrip recommendations (ranked on rating, price and reliability, not on payment)')) + '</li></ol>' +
          '<button class="btn btn-ghost" type="button" data-demo-login>' + esc(t('partner.reg.demo', 'Meanwhile, explore the demo partner P-101')) + '</button></div>';
      }
    });
  }
  function langOptions() {
    var langs = (OT.i18n && OT.i18n.languages) || [{ code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' }];
    return langs.map(function (l) { return '<option value="' + esc(l.code) + '">' + esc(l.name + (l.native && l.native !== l.name ? ' · ' + l.native : '')) + '</option>'; }).join('');
  }

  /* ---------- sub-views ---------- */
  function overview(body) {
    var k = kpis(), p = P();
    var newEnq = enquiries().filter(function (e) { return e.status !== 'replied'; }).length;
    var rows = allBookings().slice(0, 5);
    body.innerHTML = K.board([
      { label: t('partner.revenue', 'Revenue') + ' · 12 wk', value: K.money(k.rev), delta: k.revGrowth.toFixed(1) + '%', dir: 'up', deltaNote: t('partner.vsPrev', 'last 4 wk vs prior 4'), spark: p.revenue, hi: true },
      { label: t('partner.bookingsKpi', 'Bookings'), value: k.bk.toLocaleString('en-IN'), delta: k.bkGrowth.toFixed(1) + '%', dir: 'up', deltaNote: t('partner.vsPrev', 'last 4 wk vs prior 4'), spark: p.bookings },
      { label: t('partner.conversion', 'Conversion'), value: K.pct(k.conv), note: t('partner.convNote', 'bookings ÷ listing views'), spark: p.conversion },
      { label: t('partner.cancellations', 'Cancellations'), value: K.pct(k.cancel), note: t('partner.cancelNote', 'of bookings · platform avg 6.9%'), spark: p.cancellations },
      { label: t('partner.rating', 'Rating'), value: k.rating.toFixed(1) + ' ★', note: k.reviews.toLocaleString('en-IN') + ' ' + t('partner.reviews', 'verified reviews') }
    ], OT.simTag() + '<span>' + esc(t('partner.boardNote', 'Sample partner data, 12 weeks ending 25 Oct 2026.')) + '</span>' + (k.live ? '<span class="pill pill-live">' + esc(t('partner.liveIncl', '{n} live OneTrip booking(s) included', { n: k.live })) + '</span>' : ''));

    var tips = p.agentTips.map(function (tp) {
      return '<li class="' + tp.kind + '">' + OT.icon(tp.kind === 'warn' ? 'alert' : 'bot', 18) + '<span>' + esc(tp.text) + '</span><a class="btn btn-sm btn-ghost" href="#/partner/' + tp.action + '">' + esc(t('common.open', 'Open')) + '</a></li>';
    }).join('');

    body.innerHTML += '<div class="split" style="margin-top:18px">' +
      K.pane(t('partner.revWeekly', 'Weekly revenue'), t('partner.revWeeklySub', 'OneTrip-referred stays, cabs and tours (₹, simulated)'),
        C.line(p.weeks, [{ name: 'Revenue', values: p.revenue }], { area: true, fmt: OT.inr, label: 'Weekly revenue, Hotel Shivalik View' })) +
      K.pane(t('partner.agentSays', 'Partner Agent suggestions'), t('partner.agentSub', 'Suggestions only — nothing changes until you act.'), '<ul class="agent-tips">' + tips + '</ul>', 'pane-wash') +
      '</div>';

    body.innerHTML += K.sec(t('partner.recent', 'Latest bookings'), esc(t('partner.recentSub', 'Bookings made by travellers in OneTrip appear here instantly.')),
      bookingTable(rows), '<a class="btn btn-sm btn-ghost" href="#/partner/bookings">' + esc(t('partner.allBookings', 'All bookings')) + '</a>' +
      (newEnq ? ' <a class="btn btn-sm btn-primary" href="#/partner/enquiries">' + esc(t('partner.enqWaiting', '{n} enquiries waiting', { n: newEnq })) + '</a>' : ''));
  }

  function bookingTable(rows) {
    if (!rows.length) return '<div class="pane empty-state">' + esc(t('partner.noBookings', 'No bookings match this filter.')) + '</div>';
    return '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('partner.col.ref', 'Booking ref')) + '</th><th>' + esc(t('partner.col.guest', 'Guest')) + '</th><th>' + esc(t('partner.col.service', 'Service')) + '</th><th>' + esc(t('partner.col.date', 'Check-in / pickup')) + '</th><th class="num">' + esc(t('partner.col.amount', 'Amount')) + '</th><th>' + esc(t('partner.col.status', 'Status')) + '</th><th>' + esc(t('partner.col.channel', 'Channel')) + '</th></tr></thead><tbody>' +
      rows.map(function (b) {
        var st = b.status === 'completed' ? '<span class="badge b-info">' + OT.icon('check', 13) + esc(t('status.completed', 'Stayed')) + '</span>' : OT.badge(b.status === 'cancelled' ? 'cancelled' : 'confirmed');
        return '<tr class="' + (b.live ? 'row-new' : '') + '"><td>' + K.keep(b.ref) + '</td><td>' + esc(b.guest) + (b.lang ? '<span class="sub">' + esc(b.lang) + '</span>' : '') + '</td><td>' + esc(b.title) + (b.nights ? '<span class="sub">' + b.nights + ' ' + esc(t('partner.nights', 'night(s)')) + '</span>' : '') + '</td>' +
          '<td class="nowrap">' + K.keep(K.date(b.checkin)) + '</td><td class="num">' + K.keep(OT.inr(b.amount)) + '</td><td>' + st + (b.refund && b.refund.status ? '<span class="sub">' + esc(t('partner.refund', 'Refund')) + ': ' + esc(b.refund.status) + '</span>' : '') + '</td>' +
          '<td>' + (b.live ? '<span class="pill pill-live">' + esc(t('partner.newVia', 'New via OneTrip')) + '</span>' : '<span class="pill">' + esc(t('partner.sample', 'Sample')) + '</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* Listings CRUD */
  var TYPE = { hotel: { icon: 'hotel', label: 'Hotel room', unit: 'night' }, cab: { icon: 'cab', label: 'Cab / transfer', unit: 'trip' }, tour: { icon: 'sight', label: 'Tour / experience', unit: 'person' } };
  function listingsView(body) {
    var ls = listings();
    var cards = ls.map(function (l) {
      var ty = TYPE[l.type] || TYPE.hotel;
      var st = l.status === 'live' ? '<span class="badge b-ok">' + OT.icon('checkCircle', 13) + esc(t('partner.live', 'Live')) + '</span>' : l.status === 'paused' ? '<span class="badge b-warn">' + OT.icon('clock', 13) + esc(t('partner.paused', 'Paused')) + '</span>' : '<span class="badge b-info">' + OT.icon('edit', 13) + esc(t('partner.draftSt', 'Draft')) + '</span>';
      return '<article class="lst" data-id="' + esc(l.id) + '"><div class="lst-top"><span class="lst-type">' + OT.icon(ty.icon, 15) + esc(t('partner.type.' + l.type, ty.label)) + '</span>' + st + '</div>' +
        '<h3>' + esc(l.title) + '</h3><div class="lst-price">' + K.keep(OT.inr(l.price)) + ' <small>/ ' + esc(l.unit || ty.unit) + '</small></div><div class="small muted">' + esc(l.units) + ' ' + esc(t('partner.units', 'units')) + (l.capacity ? ' · ' + esc(t('partner.upto', 'up to {n} guests', { n: l.capacity })) : '') + '</div>' +
        (l.checkin ? '<div class="small muted">' + OT.icon('clock', 14) + ' ' + esc(t('partner.checkin', 'Check-in')) + ' ' + K.keep(l.checkin) + '</div>' : '') +
        '<div class="lst-policy' + (l.policy ? '' : ' missing') + '">' + (l.policy ? OT.icon('shield', 14) + ' ' + esc(l.policy) : OT.icon('alert', 14) + ' ' + esc(t('partner.noPolicy', 'Cancellation policy missing — Partner Agent blocks go-live (TRUST-01).'))) + '</div>' +
        '<div class="lst-actions"><button class="btn btn-sm btn-ghost" data-act="edit">' + OT.icon('edit', 15) + esc(t('common.edit', 'Edit')) + '</button>' +
        (l.status === 'live' ? '<button class="btn btn-sm btn-ghost" data-act="pause">' + esc(t('partner.pause', 'Pause')) + '</button>' : '<button class="btn btn-sm btn-ghost" data-act="golive">' + esc(t('partner.goLive', 'Go live')) + '</button>') +
        '<span class="spacer"></span><a class="btn btn-sm btn-ghost" href="#/partner/pricing?listing=' + encodeURIComponent(l.id) + '" title="' + esc(t('partner.prices', 'Prices')) + '" aria-label="' + esc(t('partner.prices', 'Prices')) + ': ' + esc(l.title) + '">' + OT.icon('calendar', 15) + '</a>' +
        '<button class="btn btn-sm btn-ghost" data-act="delete" title="' + esc(t('common.delete', 'Delete')) + '" aria-label="' + esc(t('common.delete', 'Delete')) + ' ' + esc(l.title) + '">' + OT.icon('trash', 15) + '</button></div></article>';
    }).join('');
    var live = ls.filter(function (l) { return l.status === 'live'; }).length;
    body.innerHTML = K.sec('', esc(t('partner.listSub', '{live} live of {n}. In production, prices you set here are what travellers see, with source “Partner extranet” and a checked-at time.', { live: live, n: ls.length })),
      ls.length ? '<div class="listing-grid">' + cards + '</div>' : '<div class="pane empty-state">' + OT.icon('store', 28) + '<p>' + esc(t('partner.noListings', 'No listings yet.')) + '</p></div>',
      '<button class="btn btn-primary btn-sm" data-act="add">' + OT.icon('plus', 16) + esc(t('partner.addListing', 'Add listing')) + '</button>') +
      K.simLine(t('partner.listSim', 'Listings are saved in this browser only (simulated partner extranet). In this prototype the traveller results use the fixed sample catalogue.'));
  }

  function listingForm(l) {
    l = l || { type: 'hotel', title: '', price: '', unit: 'night', units: 1, capacity: 2, checkin: '14:00', policy: '', status: 'draft' };
    return '<form class="form-grid" data-listing-form novalidate>' +
      '<div class="field"><label for="lf-type">' + esc(t('partner.lf.type', 'Type')) + '</label><select class="input" id="lf-type">' + Object.keys(TYPE).map(function (k) { return '<option value="' + k + '"' + (l.type === k ? ' selected' : '') + '>' + esc(TYPE[k].label) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label for="lf-status">' + esc(t('partner.lf.status', 'Status')) + '</label><select class="input" id="lf-status"><option value="live"' + (l.status === 'live' ? ' selected' : '') + '>Live</option><option value="draft"' + (l.status === 'draft' ? ' selected' : '') + '>Draft</option><option value="paused"' + (l.status === 'paused' ? ' selected' : '') + '>Paused</option></select></div>' +
      '<div class="field full"><label for="lf-title">' + esc(t('partner.lf.title', 'Title')) + ' *</label><input class="input" id="lf-title" maxlength="80" value="' + esc(l.title) + '" placeholder="e.g. Deluxe Double Room (AC)"></div>' +
      '<div class="field"><label for="lf-price">' + esc(t('partner.lf.price', 'Price (₹, incl. taxes)')) + ' *</label><input class="input" id="lf-price" type="number" min="1" step="1" inputmode="numeric" value="' + esc(l.price) + '"></div>' +
      '<div class="field"><label for="lf-unit">' + esc(t('partner.lf.unit', 'Per')) + '</label><select class="input" id="lf-unit">' + ['night', 'trip', 'person', 'day'].map(function (u) { return '<option' + (l.unit === u ? ' selected' : '') + '>' + u + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label for="lf-units">' + esc(t('partner.lf.units', 'Units available (rooms / vehicles / seats)')) + '</label><input class="input" id="lf-units" type="number" min="0" step="1" value="' + esc(l.units) + '"></div>' +
      '<div class="field"><label for="lf-cap">' + esc(t('partner.lf.cap', 'Max guests per unit')) + '</label><input class="input" id="lf-cap" type="number" min="1" step="1" value="' + esc(l.capacity || '') + '"></div>' +
      '<div class="field"><label for="lf-checkin">' + esc(t('partner.lf.checkin', 'Check-in / start time')) + '</label><input class="input" id="lf-checkin" type="time" value="' + esc(l.checkin || '') + '"></div>' +
      '<div class="field full"><label for="lf-policy">' + esc(t('partner.lf.policy', 'Cancellation & refund policy')) + ' *</label><textarea class="input" id="lf-policy" maxlength="300" placeholder="e.g. Free cancellation up to 24 h before check-in.">' + esc(l.policy) + '</textarea>' +
      '<span class="small muted">' + OT.icon('bot', 14) + ' ' + esc(t('partner.lf.agent', 'Partner Agent: a listing without a cancellation policy stays in Draft. Policy text is verified before it is translated for travellers.')) + '</span></div></form>';
  }

  function openListingModal(id, rerender) {
    var ls = listings();
    var cur = id ? ls.filter(function (x) { return x.id === id; })[0] : null;
    var bodyEl = null;
    OT.modal({
      title: cur ? t('partner.editListing', 'Edit listing') : t('partner.addListing', 'Add listing'), wide: true,
      body: listingForm(cur),
      onOpen: function (b) { bodyEl = b; var f = b.querySelector('#lf-title'); if (f) f.focus(); },
      actions: [
        { label: t('common.cancel', 'Cancel'), kind: 'ghost' },
        { label: t('common.save', 'Save listing'), kind: 'primary', onClick: function (close) {
          var g = function (s) { return bodyEl.querySelector(s).value; };
          var title = g('#lf-title').trim(), price = Math.round(Number(g('#lf-price'))), units = Math.max(0, Math.round(Number(g('#lf-units')) || 0));
          if (!title) { OT.toast(t('partner.lf.needTitle', 'Please add a title.'), 'error'); return; }
          if (!(price > 0)) { OT.toast(t('partner.lf.needPrice', 'Please enter a price above ₹0.'), 'error'); return; }
          var policy = g('#lf-policy').trim(), status = g('#lf-status');
          var forced = false;
          if (status === 'live' && !policy) { status = 'draft'; forced = true; }
          var rec = { id: cur ? cur.id : 'L-101-' + Math.random().toString(36).slice(2, 6).toUpperCase(), type: g('#lf-type'), title: title, price: price, unit: g('#lf-unit'), units: units,
            capacity: Math.max(1, Math.round(Number(g('#lf-cap')) || 1)), checkin: g('#lf-checkin'), policy: policy, status: status, cal: cur && cur.cal ? cur.cal : {}, updatedAt: new Date().toISOString() };
          var next = cur ? ls.map(function (x) { return x.id === cur.id ? rec : x; }) : ls.concat([rec]);
          saveListings(next);
          close();
          OT.toast(forced ? t('partner.lf.forced', 'Saved as Draft: add a cancellation policy to go live.') : t('partner.lf.saved', 'Listing saved (simulated extranet).'), forced ? 'error' : 'success');
          rerender();
        } }
      ]
    });
  }

  /* Price & availability calendar */
  var calState = { listing: null, month: '2026-11', sel: null };
  function ymd(y, m, d) { return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
  function dayInfo(l, iso) {
    var o = (l.cal || {})[iso] || {};
    var d = new Date(iso + 'T00:00:00');
    var dn = d.getDate();
    var booked = Math.min(l.units, (dn * 7 + (l.units || 1)) % (Math.max(1, l.units) + 1));
    if (iso === '2026-11-14' || iso === '2026-11-15') booked = Math.max(0, l.units - 2); // Demand Radar weekend
    var avail = o.avail != null ? o.avail : Math.max(0, l.units - booked);
    return { price: o.price != null ? o.price : l.price, avail: avail, closed: !!o.closed, custom: !!(o.price != null || o.avail != null || o.closed) };
  }
  function pricingView(body, query) {
    var ls = listings().filter(function (l) { return l.type !== 'tour' || true; });
    if (!ls.length) { body.innerHTML = K.sec(t('partner.pricing', 'Prices & availability'), '', '<div class="pane empty-state">' + esc(t('partner.noListings', 'No listings yet.')) + '</div>'); return; }
    if (query && query.listing && ls.some(function (l) { return l.id === query.listing; })) calState.listing = query.listing;
    if (!calState.listing || !ls.some(function (l) { return l.id === calState.listing; })) calState.listing = ls[0].id;
    var l = ls.filter(function (x) { return x.id === calState.listing; })[0];
    var parts = calState.month.split('-'), y = +parts[0], m = +parts[1];
    var first = new Date(y, m - 1, 1), days = new Date(y, m, 0).getDate();
    var lead = (first.getDay() + 6) % 7; // Monday-first
    var monthName = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    var cells = '';
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(function (d) { cells += '<div class="cal-dow">' + d + '</div>'; });
    for (var i = 0; i < lead; i++) cells += '<div class="cal-blank"></div>';
    for (var d = 1; d <= days; d++) {
      var iso = ymd(y, m, d), info = dayInfo(l, iso);
      var cls = 'cal-day' + (info.closed ? ' closed' : '') + (info.custom ? ' custom' : '') + (info.avail <= 2 && !info.closed ? (info.avail === 0 ? ' out' : ' low') : '') + (calState.sel === iso ? ' sel' : '') + (iso === '2026-11-01' ? ' today' : '');
      cells += '<button type="button" class="' + cls + '" data-day="' + iso + '" aria-label="' + esc(d + ' ' + monthName + ': ' + OT.inr(info.price) + ', ' + (info.closed ? 'closed' : info.avail + ' available')) + '"><span class="d">' + d + '</span><span class="p">' + esc(OT.inr(info.price)) + '</span><span class="a">' + esc(info.closed ? t('partner.closed', 'Closed') : info.avail + ' ' + t('partner.left', 'left')) + '</span></button>';
    }
    var sel = calState.sel ? dayInfo(l, calState.sel) : null;
    var editor = calState.sel ?
      '<form data-day-form class="stack" novalidate><h3>' + K.keep(K.date(calState.sel)) + '</h3>' +
        '<div class="field"><label for="cd-price">' + esc(t('partner.lf.price', 'Price (₹, incl. taxes)')) + '</label><input class="input" id="cd-price" type="number" min="1" value="' + sel.price + '"></div>' +
        '<div class="field"><label for="cd-avail">' + esc(t('partner.availUnits', 'Units available')) + '</label><input class="input" id="cd-avail" type="number" min="0" max="999" value="' + sel.avail + '"></div>' +
        '<div class="field"><label for="cd-to">' + esc(t('partner.applyTo', 'Apply through (optional)')) + '</label><input class="input" id="cd-to" type="date" min="' + calState.sel + '" value=""></div>' +
        '<label class="check"><input type="checkbox" id="cd-closed"' + (sel.closed ? ' checked' : '') + '> ' + esc(t('partner.closeSales', 'Stop sell (closed)')) + '</label>' +
        '<div class="row-wrap"><button class="btn btn-primary btn-sm" type="submit">' + esc(t('common.save', 'Save')) + '</button><button class="btn btn-ghost btn-sm" type="button" data-act="cal-clear">' + esc(t('partner.resetDay', 'Reset to base')) + '</button></div></form>'
      : '<p class="muted">' + esc(t('partner.pickDay', 'Select a date to change its price or availability.')) + '</p>';
    body.innerHTML = K.sec('', esc(t('partner.priceSub', 'The Verification Agent re-checks these against your extranet before a traveller sees them; stale prices (> 6 h) show “Needs confirmation”.')),
      '<div class="cal-head"><div class="field"><label for="cal-listing">' + esc(t('partner.listing', 'Listing')) + '</label><select class="input" id="cal-listing">' + ls.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === l.id ? ' selected' : '') + '>' + esc(x.title) + ' (' + esc(OT.inr(x.price)) + ')</option>'; }).join('') + '</select></div>' +
        '<div class="row-wrap"><button class="btn btn-ghost btn-sm" data-act="cal-prev" aria-label="Previous month"' + (calState.month <= '2026-11' ? ' disabled' : '') + '>' + OT.icon('arrowLeft', 16) + '</button><strong style="min-width:130px;text-align:center">' + esc(monthName) + '</strong><button class="btn btn-ghost btn-sm" data-act="cal-next" aria-label="Next month"' + (calState.month >= '2027-01' ? ' disabled' : '') + '>' + OT.icon('arrowRight', 16) + '</button></div>' +
        '<div class="row-wrap"><button class="btn btn-ghost btn-sm" data-act="cal-weekend">' + esc(t('partner.weekend', 'Fri–Sat +15%')) + '</button><button class="btn btn-ghost btn-sm" data-act="cal-reset">' + esc(t('partner.resetMonth', 'Reset month')) + '</button></div></div>' +
      '<div class="split"><div class="pane"><div class="cal">' + cells + '</div><div class="cal-legend"><span><i style="border-color:var(--saffron)"></i>' + esc(t('partner.custom', 'Custom price/availability')) + '</span><span><i style="background:repeating-linear-gradient(135deg,#F4F6FA 0 4px,#fff 4px 8px)"></i>' + esc(t('partner.closed', 'Closed')) + '</span><span><i style="box-shadow:inset 0 3px 0 var(--saffron)"></i>' + esc(t('partner.today', 'Today')) + '</span></div></div>' +
      '<div class="pane pane-wash">' + editor + '<div class="divider"></div><p class="small muted">' + OT.icon('target', 14) + ' ' + esc(t('partner.radarHint', 'Demand Radar: NDLS arrivals on 13–15 Nov are up 18%. Rates stay your decision; OneTrip never auto-prices.')) + '</p></div></div>') +
      K.simLine(t('partner.priceSim', 'Calendar saved in this browser only (simulated extranet). Traveller results use the fixed sample catalogue in this prototype.'));
  }
  function updateCal(fn) {
    var ls = listings();
    ls.forEach(function (l) { if (l.id === calState.listing) { l.cal = l.cal || {}; fn(l); l.updatedAt = new Date().toISOString(); } });
    saveListings(ls);
  }

  /* Enquiries */
  var drafts = {};
  function listingById(id) { return listings().filter(function (l) { return l.id === id; })[0] || listings()[0]; }
  function templateReply(e) {
    var ls = listings();
    var L = listingById(e.listingId) || {};
    var find = function (type, re) { return ls.filter(function (x) { return x.type === type && (!re || re.test(x.title)); })[0]; };
    var cab = find('cab'), fam = find('hotel', /family|suite/i) || L, deluxe = find('hotel', /deluxe/i) || L;
    var pol = function (x) { return x && x.policy ? x.policy : 'Our cancellation policy is being updated; please confirm before booking.'; };
    var greet = 'Namaste ' + (e.guest ? e.guest.replace(/\s*\(.*\)/, '') : '') + ', thank you for your enquiry to Hotel Shivalik View (1.2 km from Chandigarh station, CDG).';
    var sign = '\n\nWarm regards,\nFront desk, Hotel Shivalik View';
    var body;
    switch (e.topic) {
      case 'earlyCheckin':
        body = 'Standard check-in is ' + (deluxe.checkin || '14:00') + '. For ' + (e.dates || 'your dates') + ' we can hold your ' + deluxe.title + ' (' + OT.inr(deluxe.price) + '/night, incl. taxes) with early check-in from 11:30' + (deluxe.earlyCheckInFee ? ' for ' + OT.inr(deluxe.earlyCheckInFee) : '') + ', confirmed by 9 PM the day before. If the room is not ready, you can keep your luggage at the front desk free of charge.' +
          (cab ? ' A ' + cab.title + ' costs ' + OT.inr(cab.price) + ' per trip; we will track train 12011 and adjust pickup if it runs late.' : '') + '\nCancellation: ' + pol(deluxe);
        break;
      case 'family':
        body = 'Yes, our ' + fam.title + ' (' + OT.inr(fam.price) + '/night, incl. taxes) suits ' + (e.pax || 4) + ' guests for ' + (e.dates || 'your dates') + '. We will request a lift-access room close to reception for your parents; a wheelchair is available on request.\nCancellation: ' + pol(fam);
        break;
      case 'pickup':
        body = cab ? 'Yes. ' + cab.title + ' is ' + OT.inr(cab.price) + ' per trip (up to ' + (cab.capacity || 4) + ' guests). Our driver will wait at the main exit with a name board for train 12011 (arrival 11:05) on ' + (e.dates || 'your date') + ', and we track running status if the train is late.\nCancellation: ' + pol(cab)
          : 'We do not list a station pickup at the moment; a verified cab partner can be added from your OneTrip itinerary.';
        break;
      case 'food':
        body = 'Breakfast is included with the ' + deluxe.title + ' (' + OT.inr(deluxe.price) + '/night). Jain meals (no onion, no garlic, no root vegetables) can be prepared on request: please mention it at booking. For ' + (e.dates || 'your dates') + ' rooms are currently available.\nCancellation: ' + pol(deluxe);
        break;
      case 'refund':
        body = 'For the ' + L.title + ' (' + OT.inr(L.price) + '/night) the policy is: ' + pol(L) + ' Refunds are paid from the OneTrip escrow account by Partner Bank (sample) to your original payment method, and you can track them in “Bookings & refunds”.';
        break;
      default:
        body = 'Thank you for reaching out. ' + (L.title ? 'Our ' + L.title + ' is ' + OT.inr(L.price) + ' per ' + (L.unit || 'night') + '. ' : '') + 'Please share your dates and number of guests and we will confirm availability.';
    }
    return greet + '\n\n' + body + sign;
  }
  function draftReply(e) {
    var L = listingById(e.listingId) || {};
    var enriched = clone(e); enriched.listing = L; enriched.partner = { id: PID, name: 'Hotel Shivalik View', city: 'Chandigarh', station: 'CDG' }; enriched.listings = listings();
    // Builder A's Partner Agent handles common intents (early check-in, price, veg, parking). For intents it does not
    // cover (refund policy, pickup, family room) we use our listing-grounded template so prices come from the listing.
    var specific = { earlyCheckin: 'early', food: 'veg' };
    if (OT.agents && typeof OT.agents.partnerDraftReply === 'function' && specific[e.topic]) {
      try {
        var r = OT.agents.partnerDraftReply({ message: e.original, text: e.original, lang: e.lang, guest: (e.guest || '').replace(/\s*\(.*\)/, ''), listing: 'Hotel Shivalik View', checkIn: e.dates, pax: e.pax, partnerId: PID });
        var text = r && (r.textEn || (typeof r === 'string' ? r : r.text));
        if (text && (!r.topic || r.topic === specific[e.topic])) {
          var extra = '\n\n' + (L.title ? L.title + ': ' + OT.inr(L.price) + '/' + (L.unit || 'night') + ' incl. taxes. ' : '') + (L.policy ? 'Cancellation: ' + L.policy : '');
          return Promise.resolve({ text: String(text) + extra.replace(/\s+$/, '') + '\n\nWarm regards,\nFront desk, Hotel Shivalik View', by: 'Partner Agent', note: r.note });
        }
      } catch (err) { /* fall through to template */ }
    }
    if (OT.gemini && OT.gemini.available && OT.gemini.available()) {
      var facts = listings().map(function (x) { return '- ' + x.title + ': ' + OT.inr(x.price) + ' per ' + x.unit + '; check-in ' + (x.checkin || 'n/a') + '; policy: ' + (x.policy || 'NOT SET'); }).join('\n');
      var prompt = 'Traveller enquiry (translated to English): "' + e.english + '"\nDates: ' + e.dates + '. Guests: ' + e.pax + '.\nListings (only source of prices/policies):\n' + facts + '\nWrite a short, warm reply in English from the front desk of Hotel Shivalik View (1.2 km from Chandigarh station CDG). Use ONLY the facts above for prices, times and policies; never invent numbers. Quote the cancellation policy verbatim. Plain text, under 120 words.';
      return OT.gemini.generate(prompt, { system: 'You are the Partner Agent of IRCTC OneTrip. You draft replies for a hotel partner who will review and confirm before sending.', timeoutMs: 12000, maxTokens: 400 })
        .then(function (txt) {
          // guardrail: every ₹ amount in the draft must exist in the listing facts, else use the template
          var nums = (String(txt).match(/₹\s?[\d,]+/g) || []).map(function (x) { return x.replace(/[₹,\s]/g, ''); });
          var known = facts.replace(/,/g, '');
          if (nums.some(function (n) { return known.indexOf(n) < 0; })) return { text: templateReply(e), by: 'Partner Agent (rules — AI draft had an unverified price)' };
          return { text: String(txt).trim(), by: 'Partner Agent (Gemini ' + OT.gemini.model() + ')' };
        })
        .catch(function () { return { text: templateReply(e), by: 'Partner Agent (rules — AI unavailable)' }; });
    }
    return Promise.resolve({ text: templateReply(e), by: 'Partner Agent (rules)' });
  }
  function protectedTokens(s) {
    var re = /₹\s?[\d,]+|\b\d{5}\b|\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}(?:–\d{1,2})?\s(?:Nov|Dec|Oct|Jan)\w*(?:\s\d{4})?|\b(?:CDG|NDLS|PNR)\b/g;
    var out = [], m;
    while ((m = re.exec(s))) { if (out.indexOf(m[0]) < 0) out.push(m[0]); }
    return out.slice(0, 10);
  }
  function enquiriesView(body) {
    var list = enquiries();
    var open = list.filter(function (e) { return e.status !== 'replied'; }).length;
    var uiLang = OT.i18n && OT.i18n.lang ? OT.i18n.lang() : 'en';
    body.innerHTML = K.sec('', esc(t('partner.enqSub', '{n} awaiting reply. Messages arrive translated by BHASHINI NMT (simulated); the original is always kept.', { n: open })),
      list.map(function (e) {
        var L = listingById(e.listingId) || {};
        var replied = e.status === 'replied';
        var d = drafts[e.id];
        var showOrig = e.lang && e.lang !== 'en';
        return '<article class="enq' + (replied ? ' replied' : '') + '" data-enq="' + esc(e.id) + '">' +
          '<div class="enq-top"><div class="enq-meta"><strong style="color:var(--navy)">' + esc(e.guest) + '</strong><span class="lang-chip">' + esc((e.langName || e.lang || '').toUpperCase()) + '</span>' + K.keep(e.id) + '<span>' + OT.icon('calendar', 14) + ' ' + K.keep(e.dates || '—') + '</span><span>' + OT.icon((TYPE[L.type] || TYPE.hotel).icon, 14) + ' ' + esc(L.title || '') + '</span>' + (e.live ? '<span class="pill pill-live">' + esc(t('partner.newVia', 'New via OneTrip')) + '</span>' : '') + '</div>' +
          (replied ? '<span class="badge b-ok">' + OT.icon('send', 13) + esc(t('partner.replied', 'Replied')) + '</span>' : '<span class="badge b-warn">' + OT.icon('clock', 13) + esc(t('partner.awaiting', 'Awaiting reply')) + '</span>') + '</div>' +
          '<p class="enq-msg">' + esc(uiLang === e.lang ? e.original : e.english) + '</p>' +
          (showOrig ? '<p class="enq-msg orig" lang="' + esc(e.lang) + '"><span class="xs muted">' + esc(t('partner.original', 'Original')) + ' (' + esc(e.langName) + '):</span><br>' + esc(e.original) + '</p>' : '') +
          (replied ? '<div class="sent-reply"><div class="xs muted">' + esc(t('partner.sentAt', 'Sent')) + ' ' + esc(e.repliedAt ? OT.stamp(new Date(e.repliedAt)) : '') + ' · ' + esc(t('partner.deliveredIn', 'delivered in {lang}', { lang: e.langName || 'English' })) + '</div>' + esc(e.reply || '').replace(/\n/g, '<br>') + '</div>' :
            d ? '<div class="draft"><div class="draft-head"><span>' + OT.icon('bot', 16) + ' <strong>' + esc(d.by) + '</strong> · ' + esc(t('partner.editable', 'editable draft — you confirm before it is sent')) + '</span>' + OT.badge('confirm', t('partner.needsYou', 'Needs your confirmation')) + '</div>' +
              '<label class="sr-only" for="dr-' + esc(e.id) + '">Reply draft</label><textarea class="input" id="dr-' + esc(e.id) + '" data-draft-text>' + esc(d.text) + '</textarea>' +
              '<div class="tr-preview">' + OT.icon('globe', 14) + ' ' + esc(e.lang && e.lang !== 'en' ? t('partner.willTranslate', 'Will be delivered in {lang} via BHASHINI NMT (simulated). Protected tokens are passed through unchanged:', { lang: e.langName }) : t('partner.noTranslate', 'Delivered in English. Protected tokens:')) + '<div data-tokens>' + protectedTokens(d.text).map(function (x) { return '<span class="token">' + esc(x) + '</span>'; }).join('') + '</div></div>' +
              '<div class="row-wrap" style="margin-top:10px"><button class="btn btn-primary btn-sm" data-act="send">' + OT.icon('send', 15) + esc(t('partner.send', 'Send reply')) + '</button><button class="btn btn-ghost btn-sm" data-act="redraft">' + OT.icon('refresh', 15) + esc(t('partner.redraft', 'Redraft')) + '</button><button class="btn btn-link btn-sm" data-act="discard">' + esc(t('partner.discard', 'Discard')) + '</button></div></div>'
            : '<div class="row-wrap"><button class="btn btn-ghost btn-sm" data-act="draft">' + OT.icon('bot', 16) + esc(t('partner.draft', 'Draft reply with Partner Agent')) + '</button></div>') +
          '</article>';
      }).join('')) + K.simLine(t('partner.enqSim', 'Sample enquiries; replies are stored in this browser only and not sent to anyone.'));
  }

  /* Bookings */
  var bkFilter = 'all';
  function bookingsView(body) {
    var all = allBookings();
    var rows = all.filter(function (b) { return bkFilter === 'all' || (bkFilter === 'live' ? b.live : bkFilter === 'cancelled' ? b.status === 'cancelled' : b.status === 'confirmed'); });
    var live = all.filter(function (b) { return b.live; });
    body.innerHTML = K.sec('', esc(t('partner.bkSub', 'Paid into escrow by the traveller; settled to you T+1 after check-in (simulated).')),
      '<div class="table-tools" role="group" aria-label="Filter">' + ['all', 'confirmed', 'cancelled', 'live'].map(function (f) {
        return '<button class="chip" aria-pressed="' + (bkFilter === f) + '" data-filter="' + f + '">' + esc({ all: t('partner.f.all', 'All'), confirmed: t('partner.f.upcoming', 'Confirmed'), cancelled: t('partner.f.cancelled', 'Cancelled'), live: t('partner.f.live', 'New via OneTrip') + ' (' + live.length + ')' }[f]) + '</button>';
      }).join('') + '</div>' +
      (live.length ? '' : '<div class="pane pane-wash" style="margin-bottom:12px"><p class="small" style="margin:0">' + OT.icon('info', 15) + ' ' + esc(t('partner.tryLive', 'Tip for the demo: book “Hotel Shivalik View” as a traveller (Plan trip → Chandigarh) and it appears here instantly, highlighted.')) + '</p></div>') +
      bookingTable(rows)) + K.simLine();
  }

  /* Performance */
  function performanceView(body) {
    var p = P(), k = kpis();
    var sum = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };
    var views = sum(p.views), enq = sum(p.enquiryCounts), bk = sum(p.bookings), canc = sum(p.cancellations);
    body.innerHTML = K.board([
      { label: t('partner.revenue', 'Revenue') + ' · 12 wk', value: K.money(k.rev), hi: true, delta: k.revGrowth.toFixed(1) + '%', dir: 'up', deltaNote: t('partner.vsPrev', 'last 4 wk vs prior 4') },
      { label: t('partner.conversion', 'Conversion'), value: K.pct(k.conv), note: t('partner.convNote', 'bookings ÷ listing views') },
      { label: t('partner.cancellations', 'Cancellations'), value: K.pct(k.cancel), note: canc + ' ' + t('partner.of', 'of') + ' ' + bk },
      { label: t('partner.avgOrder', 'Avg booking value'), value: OT.inr(sum(p.revenue) / bk) }
    ]) +
      '<div class="split-even" style="margin-top:18px">' +
        K.pane(t('partner.revWeekly', 'Weekly revenue'), '₹ · ' + esc(t('partner.lastHi', 'latest week highlighted')), C.bar(p.weeks.map(function (w, i) { return { label: w, value: p.revenue[i], highlight: i === p.weeks.length - 1 }; }), { fmt: OT.inr, valueLabels: false, label: 'Weekly revenue bar chart' })) +
        K.pane(t('partner.convTrend', 'Conversion rate'), esc(t('partner.convTrendSub', 'Bookings ÷ listing views, % per week')), C.line(p.weeks, [{ name: 'Conversion', values: p.conversion }], { fmt: function (v) { return v.toFixed(1) + '%'; }, fmtTick: function (v) { return v.toFixed(0) + '%'; }, fmtLabel: function (v) { return v.toFixed(1) + '%'; }, label: 'Conversion rate trend' })) +
        K.pane(t('partner.funnel', 'Booking funnel · 12 weeks'), esc(t('partner.funnelSub', 'From OneTrip card view to completed stay')), C.funnel([
          { label: t('partner.fn.views', 'Listing views (card opened)'), value: views }, { label: t('partner.fn.enq', 'Enquiries / saved to journey'), value: enq }, { label: t('partner.fn.bk', 'Bookings paid'), value: bk }, { label: t('partner.fn.stay', 'Stayed (not cancelled)'), value: bk - canc }
        ], { label: 'Booking funnel' })) +
        K.pane(t('partner.cancelWhy', 'Cancellations and reasons'), esc(t('partner.cancelWhySub', 'Weekly count; reasons captured at cancellation')), C.bar(p.weeks.map(function (w, i) { return { label: w, value: p.cancellations[i] }; }), { h: 170, max: 3, color: C.palette.cat[2], label: 'Weekly cancellations' }) +
          '<div style="margin-top:10px">' + C.donut(p.cancelReasons, { center: String(canc), sub: t('partner.cancelled', 'cancelled'), label: 'Cancellation reasons' }) + '</div>') +
      '</div>' +
      K.sec(t('partner.radar', 'Demand Radar: arrivals to Chandigarh (next 30 days)'), esc(t('partner.radarSub', 'Aggregated, de-identified rail arrivals by origin. Cohorts under 50 travellers are suppressed (k-anonymity).')),
        '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('partner.origin', 'Origin market')) + '</th><th class="num">' + esc(t('partner.arrivals', 'Arrivals')) + '</th><th class="num">' + esc(t('partner.lead', 'Median booking lead (days)')) + '</th></tr></thead><tbody>' +
        p.demandRadar.map(function (r) { return '<tr><td>' + esc(r.origin) + '</td><td class="num">' + (r.suppressed ? '<span class="muted">' + esc(t('partner.suppressed', '< 50 · hidden')) + '</span>' : r.arrivals.toLocaleString('en-IN')) + '</td><td class="num">' + (r.lead == null ? '—' : r.lead) + '</td></tr>'; }).join('') +
        '</tbody></table></div>') + K.simLine();
  }

  /* Feedback */
  var showOrig = {};
  function feedbackView(body) {
    var p = P();
    var uiLang = OT.i18n && OT.i18n.lang ? OT.i18n.lang() : 'en';
    var revs = p.feedback.map(function (r) {
      var orig = r.lang === 'en' || (showOrig[r.id] != null ? showOrig[r.id] : r.lang === uiLang);
      var sCls = r.sentiment === 'positive' ? 'sent-pos' : r.sentiment === 'negative' ? 'sent-neg' : 'sent-neu';
      return '<div class="review"><div class="review-top"><span class="stars" aria-label="' + r.rating + ' of 5 stars">' + '★★★★★'.slice(0, r.rating) + '<span style="color:var(--line)">' + '★★★★★'.slice(r.rating) + '</span></span><span class="lang-chip">' + esc(r.langName.toUpperCase()) + '</span><span class="' + sCls + '">● ' + esc(t('sent.' + r.sentiment, r.sentiment)) + '</span><span>' + esc(r.stay) + '</span><span>' + K.keep(K.date(r.date)) + '</span></div>' +
        '<p' + (orig ? ' lang="' + esc(r.lang) + '"' : '') + '>' + esc(orig ? r.original : r.english) + '</p>' +
        (r.lang !== 'en' ? '<div class="row-wrap xs muted">' + (orig ? '' : OT.icon('globe', 13) + ' ' + esc(t('partner.trBy', 'Translated from {lang} · BHASHINI NMT (simulated)', { lang: r.langName }))) + ' <button class="btn-link xs" data-toggle-orig="' + esc(r.id) + '">' + esc(orig ? t('partner.showTranslation', 'Show translation') : t('partner.showOriginal', 'Show original')) + '</button></div>' : '') + '</div>';
    }).join('');
    body.innerHTML = '<div class="split">' +
      K.pane(t('partner.reviewsRecent', 'Recent reviews'), esc(t('partner.fbSub', 'Verified stays only. Sentiment tagged automatically; you can reply from the review.')), revs) +
      '<div class="stack">' +
        K.pane(t('partner.ratingDist', 'Rating {r} ★ from {n} reviews', { r: p.rating.toFixed(1), n: p.reviews.toLocaleString('en-IN') }), '', C.hbar(p.ratingDist.map(function (d, i) { return { label: d.label, value: d.value, highlight: i === 0 }; }), { compact: true, label: 'Rating distribution' })) +
        K.pane(t('partner.sentiment', 'Sentiment'), '', C.donut(p.sentiment, { colors: [C.palette.blue, '#C9D1DC', C.palette.saffron], center: Math.round(p.sentiment[0].value / p.reviews * 100) + '%', sub: t('sent.positive', 'positive'), label: 'Review sentiment' })) +
        K.pane(t('partner.reviewLang', 'Language of review'), esc(t('partner.reviewLangSub', '{p}% are in an Indian language other than English', { p: Math.round((p.reviews - p.reviewLangs[1].value) / p.reviews * 100) })), C.donut(p.reviewLangs, { label: 'Review languages' })) +
      '</div></div>' + K.simLine();
  }

  /* ---------- main render ---------- */
  var SUBS = ['overview', 'listings', 'pricing', 'enquiries', 'bookings', 'performance', 'feedback'];
  function render(el, params) {
    var root = document.createElement('div');
    el.appendChild(root);
    if (!isPartner()) { renderGate(root, params.query); return; }
    var sub = SUBS.indexOf(params.sub) >= 0 ? params.sub : 'overview';
    var openEnq = enquiries().filter(function (e) { return e.status !== 'replied'; }).length;
    var liveN = liveBookings().length;
    var titles = { overview: t('partner.overview', 'Overview'), listings: t('partner.listings', 'Listings'), pricing: t('partner.pricing', 'Prices & availability'), enquiries: t('partner.enquiries', 'Booking enquiries'), bookings: t('partner.bookings', 'Confirmed bookings'), performance: t('partner.performance', 'Performance'), feedback: t('partner.feedback', 'Customer feedback') };
    root.innerHTML = K.frame({
      base: 'partner', active: sub, eyebrow: t('partner.console', 'Partner console') + ' · P-101', who: 'Hotel Shivalik View', whoSub: 'Chandigarh · 1.2 km from CDG',
      idAction: '<button class="btn btn-sm btn-ghost" data-act="logout" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.3)">' + OT.icon('logout', 15) + '<span class="sr-only">' + esc(t('partner.signout', 'Sign out')) + '</span></button>',
      items: [
        { sub: 'overview', label: titles.overview, icon: 'chart' }, { sub: 'listings', label: titles.listings, icon: 'store' },
        { sub: 'pricing', label: titles.pricing, icon: 'calendar' }, { sub: 'enquiries', label: titles.enquiries, icon: 'chat', count: openEnq || '' },
        { sub: 'bookings', label: titles.bookings, icon: 'checkCircle', count: liveN || '' }, { sub: 'performance', label: titles.performance, icon: 'trending' },
        { sub: 'feedback', label: titles.feedback, icon: 'star' }
      ],
      foot: '<a class="btn btn-sm btn-ghost btn-block" href="#/admin/partners">' + esc(t('partner.seeScore', 'How IRCTC scores partners')) + '</a>',
      kicker: t('partner.title', 'Partner dashboard'), title: titles[sub],
      sub: sub === 'overview' ? esc(t('partner.ovSub', 'Your OneTrip business at a glance. Every figure is simulated for the prototype.')) : ''
    });
    var body = root.querySelector('[data-dash-body]');
    var draw = function () {
      ({ overview: overview, listings: listingsView, pricing: pricingView, enquiries: enquiriesView, bookings: bookingsView, performance: performanceView, feedback: feedbackView })[sub](body, params.query);
    };
    draw();

    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act],[data-filter],[data-toggle-orig],[data-day]');
      if (!b || !root.contains(b)) return;
      var act = b.getAttribute('data-act');
      if (act === 'logout') {
        OT.confirmAction({ title: t('partner.signout', 'Sign out'), lines: [esc(t('partner.signoutQ', 'Sign out of the partner console?'))], confirmLabel: t('partner.signout', 'Sign out') }).then(function (ok) {
          if (ok) { OT.store.set('user', undefined); OT.router.render(); }
        });
        return;
      }
      if (b.hasAttribute('data-filter')) { bkFilter = b.getAttribute('data-filter'); draw(); return; }
      if (b.hasAttribute('data-toggle-orig')) {
        var id = b.getAttribute('data-toggle-orig');
        var r = P().feedback.filter(function (x) { return x.id === id; })[0];
        var uiLang = OT.i18n && OT.i18n.lang ? OT.i18n.lang() : 'en';
        var cur = showOrig[id] != null ? showOrig[id] : (r && r.lang === uiLang);
        showOrig[id] = !cur; draw(); return;
      }
      if (b.hasAttribute('data-day')) { calState.sel = b.getAttribute('data-day'); draw(); return; }
      var card = b.closest('[data-id]'), enqEl = b.closest('[data-enq]');
      if (act === 'add') openListingModal(null, draw);
      if (act === 'edit' && card) openListingModal(card.getAttribute('data-id'), draw);
      if ((act === 'pause' || act === 'golive') && card) {
        var lid = card.getAttribute('data-id');
        var ls = listings(), blocked = false;
        ls.forEach(function (l) { if (l.id === lid) { if (act === 'golive' && !l.policy) blocked = true; else l.status = act === 'pause' ? 'paused' : 'live'; } });
        if (blocked) { OT.toast(t('partner.blocked', 'Partner Agent: add a cancellation policy before going live.'), 'error'); openListingModal(lid, draw); return; }
        saveListings(ls); OT.toast(act === 'pause' ? t('partner.pausedT', 'Listing paused') : t('partner.liveT', 'Listing is live'), 'success'); draw();
      }
      if (act === 'delete' && card) {
        var did = card.getAttribute('data-id');
        var L = listings().filter(function (l) { return l.id === did; })[0];
        OT.confirmAction({ title: t('partner.delQ', 'Delete listing?'), lines: [esc(L ? L.title : did), esc(t('partner.delNote', 'Travellers will no longer see it. Existing bookings are not affected.'))], confirmLabel: t('common.delete', 'Delete'), danger: true }).then(function (ok) {
          if (!ok) return;
          saveListings(listings().filter(function (l) { return l.id !== did; }));
          OT.toast(t('partner.deleted', 'Listing deleted'), 'success'); draw();
        });
      }
      if (act === 'cal-prev' || act === 'cal-next') {
        var pr = calState.month.split('-').map(Number), dt = new Date(pr[0], pr[1] - 1 + (act === 'cal-next' ? 1 : -1), 1);
        calState.month = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0'); calState.sel = null; draw();
      }
      if (act === 'cal-weekend') {
        var pr2 = calState.month.split('-').map(Number), n = new Date(pr2[0], pr2[1], 0).getDate();
        updateCal(function (l) { for (var d = 1; d <= n; d++) { var dd = new Date(pr2[0], pr2[1] - 1, d); if (dd.getDay() === 5 || dd.getDay() === 6) { var iso = ymd(pr2[0], pr2[1], d); var c = l.cal[iso] || {}; c.price = Math.round(l.price * 1.15 / 10) * 10; l.cal[iso] = c; } } });
        OT.toast(t('partner.weekendDone', 'Fri–Sat prices set to base +15%'), 'success'); draw();
      }
      if (act === 'cal-reset') {
        var pref = calState.month + '-';
        updateCal(function (l) { Object.keys(l.cal).forEach(function (k) { if (k.indexOf(pref) === 0) delete l.cal[k]; }); });
        calState.sel = null; OT.toast(t('partner.resetDone', 'Month reset to base price'), 'success'); draw();
      }
      if (act === 'cal-clear' && calState.sel) {
        updateCal(function (l) { delete l.cal[calState.sel]; }); draw();
      }
      if ((act === 'draft' || act === 'redraft') && enqEl) {
        var eid = enqEl.getAttribute('data-enq');
        var en = enquiries().filter(function (x) { return x.id === eid; })[0];
        if (!en) return;
        b.disabled = true; b.innerHTML = OT.icon('bot', 16) + esc(t('partner.drafting', 'Partner Agent is drafting…'));
        draftReply(en).then(function (d) { drafts[eid] = d; draw(); var ta = OT.$('#dr-' + eid, root); if (ta) ta.focus(); });
      }
      if (act === 'discard' && enqEl) { delete drafts[enqEl.getAttribute('data-enq')]; draw(); }
      if (act === 'send' && enqEl) {
        var sid = enqEl.getAttribute('data-enq');
        var se = enquiries().filter(function (x) { return x.id === sid; })[0];
        var txt = (enqEl.querySelector('[data-draft-text]') || {}).value || '';
        if (!txt.trim()) { OT.toast(t('partner.emptyReply', 'The reply is empty.'), 'error'); return; }
        OT.confirmAction({
          title: t('partner.sendQ', 'Send this reply?'),
          lines: [esc(t('partner.to', 'To')) + ': ' + esc(se.guest) + ' · ' + K.keep(se.id), esc(t('partner.lang', 'Language')) + ': ' + esc(se.langName || 'English') + (se.lang !== 'en' ? ' (' + esc(t('partner.viaNmt', 'translated by BHASHINI NMT, simulated')) + ')' : ''),
            esc(t('partner.tokensKept', 'Unchanged in translation')) + ': ' + (protectedTokens(txt).map(function (x) { return '<span class="token">' + esc(x) + '</span>'; }).join(' ') || '—')],
          note: esc(t('partner.hitl', 'Human-in-the-loop: the Partner Agent never sends messages on its own.')),
          confirmLabel: t('partner.send', 'Send reply')
        }).then(function (ok) {
          if (!ok) return;
          saveEnquiry(sid, { status: 'replied', reply: txt.trim(), repliedAt: new Date().toISOString() });
          delete drafts[sid];
          OT.toast(t('partner.sentT', 'Reply sent (simulated)'), 'success');
          OT.router.render();
        });
      }
    });
    root.addEventListener('change', function (e) {
      if (e.target.id === 'cal-listing') { calState.listing = e.target.value; calState.sel = null; draw(); }
    });
    root.addEventListener('input', function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute('data-draft-text')) {
        var en = e.target.closest('[data-enq]');
        if (en && drafts[en.getAttribute('data-enq')]) drafts[en.getAttribute('data-enq')].text = e.target.value;
        var tk = en && en.querySelector('[data-tokens]');
        if (tk) tk.innerHTML = protectedTokens(e.target.value).map(function (x) { return '<span class="token">' + esc(x) + '</span>'; }).join('');
      }
    });
    root.addEventListener('submit', function (e) {
      if (!e.target.hasAttribute('data-day-form')) return;
      e.preventDefault();
      var price = Math.round(Number(OT.$('#cd-price', root).value)), avail = Math.max(0, Math.round(Number(OT.$('#cd-avail', root).value) || 0));
      var closed = OT.$('#cd-closed', root).checked, to = OT.$('#cd-to', root).value;
      if (!(price > 0)) { OT.toast(t('partner.lf.needPrice', 'Please enter a price above ₹0.'), 'error'); return; }
      var start = new Date(calState.sel + 'T00:00:00'), end = to ? new Date(to + 'T00:00:00') : start;
      if (end < start) end = start;
      var count = 0;
      updateCal(function (l) {
        for (var d = new Date(start); d <= end && count < 92; d.setDate(d.getDate() + 1)) {
          l.cal[ymd(d.getFullYear(), d.getMonth() + 1, d.getDate())] = { price: price, avail: avail, closed: closed }; count++;
        }
      });
      OT.toast(t('partner.calSaved', 'Saved {n} day(s). Travellers see “Partner extranet (simulated) · checked {time}”.', { n: count, time: OT.stamp() }), 'success');
      draw();
    });

    var onBk = function () {
      var cur = OT.router.current();
      if (!cur || cur.name !== 'partner') return;
      var y = window.scrollY;
      OT.toast(t('partner.liveToast', 'New OneTrip booking received for Hotel Shivalik View'), 'success');
      OT.router.render(); window.scrollTo(0, y);
    };
    unsubs.push(OT.on('store:bookings', onBk));
    unsubs.push(OT.on('store:reset', function () { drafts = {}; calState.sel = null; }));
  }

  OT.registerView('partner', {
    title: function () { return t('partner.title', 'Partner dashboard'); },
    section: 'partner',
    render: render,
    onLeave: function () { unsubs.forEach(function (u) { try { u(); } catch (e) { /* noop */ } }); unsubs = []; }
  });
})();
