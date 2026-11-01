/* IRCTC OneTrip — Admin & Banking dashboard (#/admin[/sub]) — Builder B.
 * All figures are SIMULATED pilot data (OT.data.analytics) except live demo bookings made in this
 * browser (OT.store 'bookings'), which are added to the totals and shown in the live feed.
 */
(function () {
  'use strict';
  var OT = window.OT;
  var esc = OT.esc;
  var K = OT.dashkit, C = OT.charts;
  var t = K.t;
  var unsubs = [];

  if (OT.i18n && OT.i18n.extend) {
    OT.i18n.extend({ hi: {
      'admin.k.users': 'पंजीकृत यूज़र',
      'admin.k.partners': 'लाइव पार्टनर',
      'admin.k.gtv': 'GTV · 12 सप्ताह',
      'admin.k.attach': 'अटैच दर',
      'admin.k.compl': 'शिकायतें / 1,000 ऑर्डर',
      'admin.gtvWeekly': 'सेवा-वार साप्ताहिक GTV',
      'admin.guard': 'सामाजिक दायित्व की सीमाएँ',
      'admin.sst': 'पहचानें → अपनाएँ → बदलें',
      'admin.nav.bookings': 'बुकिंग और GTV',
      'admin.nav.finance': 'बैंक और वित्त',
      'admin.ovSub': '10 रेल गंतव्यों पर पायलट। इस ब्राउज़र में आपकी बुकिंग को छोड़कर हर संख्या सिम्युलेटेड है।',
      'admin.l.usage': 'भाषा उपयोग',
      'admin.l.policyCheck': 'महत्वपूर्ण नीति सत्यापन',
      'admin.l.voiceText': 'भाषा-वार आवाज़ बनाम टाइप',
      'admin.products': 'प्रस्तावित वित्तीय उत्पाद · 3 खंड',
      'admin.bankRole': 'बैंक की भूमिका: पैसे की पटरियाँ बैंक चलाता है, यात्रा IRCTC',
      'admin.flywheel': 'OneTrip डेटा फ़्लाईव्हील',
      'admin.layers': 'प्लेटफ़ॉर्म: तीन परतें',
      'admin.stack': 'इंडिया स्टैक / DPI पर आधारित',
      'admin.title': 'एडमिन और बैंक डैशबोर्ड',
      'admin.console': 'एडमिन और बैंकिंग कंसोल',
      'admin.overview': 'सारांश',
      'admin.users': 'यूज़र और प्रदाता',
      'admin.bookings': 'बुकिंग और लेनदेन मूल्य',
      'admin.complaints': 'शिकायतें और रिफंड',
      'admin.partners': 'पार्टनर प्रदर्शन',
      'admin.demand': 'गंतव्य-वार मांग',
      'admin.finance': 'बैंक और वित्तीय उत्पाद',
      'admin.language': 'भाषा और सहायता',
      'admin.platform': 'प्लेटफ़ॉर्म स्वास्थ्य',
      'admin.signin': 'डेमो एडमिन के रूप में साइन इन करें',
      'admin.liveFeed': 'लाइव बुकिंग फ़ीड'
    } });
  }

  var A = function () { return OT.data.analytics; };
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function isAdmin() { var u = OT.store.get('user'); return !!(u && u.role === 'admin'); }
  function fmtPct(v) { return Number(v).toFixed(1) + '%'; }
  function tickPct(v) { return Math.round(v) + '%'; }

  /* ---------- gate ---------- */
  function renderGate(root) {
    root.innerHTML = '<div class="container page"><div class="gate">' +
      '<div class="gate-side"><div class="eyebrow">' + esc(t('admin.console', 'Admin & banking console')) + '</div><h1>' + esc(t('admin.gate.h', 'Run the platform, not just the ticket counter.')) + '</h1>' +
      '<p>' + esc(t('admin.gate.p', 'IRCTC governs the ecosystem; Partner Bank (sample) runs the money rails. This console monitors both.')) + '</p><ul>' +
      '<li>' + OT.icon('chart', 18) + '<span>' + esc(t('admin.gate.b1', 'Users, partners, bookings and transaction value — with live demo bookings included.')) + '</span></li>' +
      '<li>' + OT.icon('refund', 18) + '<span>' + esc(t('admin.gate.b2', 'Complaints, refunds and SLA; partner scorecards; destination demand.')) + '</span></li>' +
      '<li>' + OT.icon('bank', 18) + '<span>' + esc(t('admin.gate.b3', 'Escrow, T+1 settlement, fraud, and 9 proposed financial products.')) + '</span></li>' +
      '<li>' + OT.icon('globe', 18) + '<span>' + esc(t('admin.gate.b4', 'Language usage, translation quality and support performance.')) + '</span></li></ul></div>' +
      '<div class="gate-form"><form data-admin-login novalidate>' +
        '<div class="demo-creds">' + OT.icon('info', 15) + ' ' + esc(t('admin.gate.demo', 'Demo access — no real credentials are stored or checked.')) + '</div>' +
        '<div class="field"><label for="ad-role">' + esc(t('admin.gate.role', 'Console role')) + '</label><select class="input" id="ad-role"><option value="irctc">IRCTC OneTrip admin</option><option value="bank">Partner Bank (sample) operations</option></select></div>' +
        '<div class="field"><label for="ad-email">' + esc(t('admin.gate.email', 'Email')) + '</label><input class="input" id="ad-email" value="admin@onetrip.example" autocomplete="off"></div>' +
        '<div class="field"><label for="ad-pass">' + esc(t('admin.gate.pass', 'Password')) + '</label><input class="input" id="ad-pass" type="password" value="demo-only" autocomplete="off"></div>' +
        '<button class="btn btn-primary btn-lg" type="submit">' + OT.icon('lock', 18) + esc(t('admin.signin', 'Sign in as demo admin')) + '</button>' +
        '<p class="small muted">' + OT.simTag() + ' ' + esc(t('admin.gate.sim', 'Role-based access: in production the bank would see payment data only, never full itineraries.')) + '</p>' +
      '</form></div></div></div>';
    root.addEventListener('submit', function (e) {
      e.preventDefault();
      var bank = OT.$('#ad-role', root).value === 'bank';
      OT.store.set('user', { name: bank ? 'Partner Bank Ops (demo)' : 'OneTrip Admin (demo)', email: OT.$('#ad-email', root).value.trim() || 'admin@onetrip.example', phone: '', role: 'admin', console: bank ? 'bank' : 'irctc' });
      OT.toast(t('admin.welcome', 'Signed in to the admin console (simulated)'), 'success');
      OT.go(bank ? 'admin/finance' : 'admin/overview');
    });
  }

  /* ---------- live data ---------- */
  function live() { return A().live(); }
  function totalsWithLive() {
    var a = A(), l = live();
    return { orders: a.totals.orders + l.confirmed.length, gtv: a.totals.gtv + l.gtv, liveN: l.all.length, liveGtv: l.gtv, liveConfirmed: l.confirmed.length, liveTrains: l.trains.length, liveTrainValue: l.trainValue };
  }
  function liveFeed() {
    var l = live().all.slice().sort(function (a, b) { return String(b.paidAt || '').localeCompare(String(a.paidAt || '')); }).slice(0, 6);
    if (!l.length) {
      return '<div class="empty-state" style="padding:18px 8px">' + OT.icon('route', 26) + '<p class="small muted">' + esc(t('admin.noLive', 'No live bookings yet. Book a hotel or cab in the traveller flow and it appears here — and in the totals above — instantly.')) + '</p><a class="btn btn-sm btn-ghost" href="#/home">' + esc(t('admin.goPlan', 'Open traveller flow')) + '</a></div>';
    }
    return '<ul class="agent-tips">' + l.map(function (b) {
      var st = b.status === 'cancelled' || b.status === 'refunded' ? OT.badge(b.status) : OT.badge('confirmed');
      return '<li>' + OT.icon(b.type === 'cab' ? 'cab' : b.type === 'food' ? 'food' : b.type === 'sight' ? 'sight' : 'hotel', 18) + '<span><strong>' + esc(b.title || 'Booking') + '</strong><br><span class="xs muted">' + K.keep(b.ref || '') + ' · ' + esc(b.city || '') + (b.partnerId ? ' · ' + K.keep(b.partnerId) : '') + ' · ' + esc(b.method || '') + '</span></span><span class="nowrap"><strong>' + K.keep(OT.inr(b.amount)) + '</strong><br>' + st + '</span></li>';
    }).join('') + '</ul>';
  }

  /* ---------- sub-views ---------- */
  function overview(body) {
    var a = A(), tw = totalsWithLive(), g = a.guardrail;
    var catSeries = a.cats.map(function (c) { return { name: c.name, values: c.gtv }; });
    body.innerHTML = K.board([
      { label: t('admin.k.users', 'Registered users'), value: OT.compact(a.users.registered[11]), delta: ((a.users.registered[11] / a.users.registered[7] - 1) * 100).toFixed(0) + '%', dir: 'up', deltaNote: t('admin.in4', 'in 4 weeks'), spark: a.users.registered },
      { label: t('admin.k.partners', 'Live partners'), value: a.users.livePartners[11].toLocaleString('en-IN'), note: a.users.registeredPartners.toLocaleString('en-IN') + ' ' + t('admin.registered', 'registered'), spark: a.users.livePartners },
      { label: t('admin.k.gtv', 'GTV · 12 wk'), value: K.cr(tw.gtv), hi: true, note: t('admin.k.gtvNote', 'add-on transaction value') + (tw.liveN ? ' · ' + t('admin.inclLive', 'incl. live') : ''), spark: a.gtv },
      { label: t('admin.k.attach', 'Attach rate'), value: a.attach[11].toFixed(2) + '%', delta: (a.attach[11] - a.attach[0]).toFixed(2) + ' pp', dir: 'up', deltaNote: t('admin.since', 'since 9 Aug'), spark: a.attach },
      { label: t('admin.k.compl', 'Complaints / 1,000 orders'), value: a.complaints.per1000[11].toFixed(1), delta: (a.complaints.per1000[0] - a.complaints.per1000[11]).toFixed(1), dir: 'down', good: true, deltaNote: t('admin.lower', 'lower is better'), spark: a.complaints.per1000 }
    ], OT.simTag() + '<span>' + esc(a.note) + '</span>' + (tw.liveN ? '<span class="pill pill-live">' + esc(t('admin.liveIncl', '{n} live booking(s) · {v} added to totals', { n: tw.liveN, v: OT.inr(tw.liveGtv) }) + (tw.liveTrains ? ' · ' + t('admin.liveTrains', '{n} train ticket(s) {v} counted as IRCTC ticketing, not add-on GTV', { n: tw.liveTrains, v: OT.inr(tw.liveTrainValue) }) : '')) + '</span>' : ''));
    body.innerHTML += '<div class="split" style="margin-top:18px">' +
      K.pane(t('admin.gtvWeekly', 'Weekly GTV by service line'), esc(t('admin.gtvWeeklySub', '₹ · hotels drive value, cabs and meals drive frequency')), C.stacked(a.weeks, catSeries, { fmt: OT.inr, label: 'Weekly GTV by service line', totalLabels: !C.narrow() })) +
      K.pane(t('admin.liveFeed', 'Live booking feed'), '<span class="pill pill-live">' + esc(t('admin.listening', 'listening to this browser')) + '</span>', liveFeed()) + '</div>';
    body.innerHTML += K.sec(t('admin.guard', 'Social-mandate guardrails'), esc(t('admin.guardSub', 'OneTrip must never slow down or complicate core ticketing.')),
      '<div class="trio">' +
        K.pane(t('admin.g.ticket', 'Ticket booking success'), '', '<div class="bk-v" style="color:var(--navy)">' + g.ticketSuccess + '%</div><p class="small muted">' + esc(t('admin.g.base', 'Baseline {b}% · unchanged', { b: g.ticketSuccessBaseline })) + '</p>' + OT.badge('verified', t('admin.g.ok', 'Within guardrail'))) +
        K.pane(t('admin.g.lat', 'Ticketing p95 latency'), '', '<div class="bk-v" style="color:var(--navy)">' + g.p95Latency + ' s</div><p class="small muted">' + esc(t('admin.g.lat2', 'Baseline {b} s · OneTrip loads only after ticket confirmation', { b: g.p95Baseline })) + '</p>' + OT.badge('verified', t('admin.g.ok', 'Within guardrail'))) +
        K.pane(t('admin.g.spam', 'Recommendation pressure'), '', '<div class="bk-v" style="color:var(--navy)">' + g.cardsPerStage + ' ' + esc(t('admin.g.card', 'card / stage')) + '</div><p class="small muted">' + esc(t('admin.g.spam2', 'Dismiss rate {d}% · opt-out {o}% · no ads in disruption messages', { d: g.dismissRate, o: g.optOutRate })) + '</p>' + OT.badge('verified', t('admin.g.ok', 'Within guardrail'))) +
      '</div>') +
      K.sec(t('admin.sst', 'Sense → Seize → Transform'), esc(t('admin.sstSub', 'Dynamic capabilities: demand signals turn into partner and product action.')), sstCard());
  }
  function sstCard() {
    return '<div class="sst"><div><div class="step">Sense</div><h4>' + esc(t('admin.sst.s', 'Varanasi forward bookings +38%')) + '</h4><p>' + esc(t('admin.sst.s2', 'Rail reservations for Dev Deepawali week are 38% above last month; hotel searches near BSB up 2.1×.')) + '</p></div>' +
      '<div><div class="step">Seize</div><h4>' + esc(t('admin.sst.z', 'Onboard 12 ghat-side homestays')) + '</h4><p>' + esc(t('admin.sst.z2', 'Partner Agent invites verified homestays; Partner Bank pre-approves Growth Line limits; Demand Radar shared with partners.')) + '</p></div>' +
      '<div><div class="step">Transform</div><h4>' + esc(t('admin.sst.t', 'Launch “Kashi Darshan” rail + stay package')) + '</h4><p>' + esc(t('admin.sst.t2', 'IRCTC Tourism package linked to Teerth Bachat RD and Trip Shield; voice support in Hindi, Bengali and Tamil.')) + '</p></div></div>';
  }

  function users(body) {
    var a = A(), u = a.users;
    var tIdx = u.registered.map(function (v) { return Math.round(v / u.registered[0] * 100); });
    var pIdx = u.livePartners.map(function (v) { return Math.round(v / u.livePartners[0] * 100); });
    body.innerHTML = K.board([
      { label: t('admin.k.users', 'Registered users'), value: u.registered[11].toLocaleString('en-IN'), spark: u.registered, hi: true },
      { label: t('admin.k.wau', 'Weekly active travellers'), value: u.active[11].toLocaleString('en-IN'), note: Math.round(u.active[11] / u.registered[11] * 100) + '% ' + t('admin.ofReg', 'of registered'), spark: u.active },
      { label: t('admin.k.sso', 'Sign-ins via IRCTC SSO'), value: u.sso + '%', note: t('admin.k.ssoNote', 'one login for ticket + trip') },
      { label: t('admin.k.repeat', 'Repeat trip rate'), value: u.repeatRate + '%', note: t('admin.k.repeatNote', 'used OneTrip on 2+ journeys') },
      { label: t('admin.k.providers', 'Service providers'), value: u.registeredPartners.toLocaleString('en-IN'), note: u.pendingKyc + ' ' + t('admin.pendingKyc', 'pending bank KYC') }
    ]) + '<div class="split-even" style="margin-top:18px">' +
      K.pane(t('admin.growth', 'Traveller growth'), esc(t('admin.growthSub', 'Registered vs weekly active')), C.line(a.weeks, [{ name: t('admin.registered2', 'Registered'), values: u.registered }, { name: t('admin.active', 'Weekly active'), values: u.active }], { label: 'Traveller growth' })) +
      K.pane(t('admin.network', 'Cross-side network effect'), esc(t('admin.networkSub', 'Both sides indexed to 100 on 9 Aug: more travellers attract more partners, which improves choice.')), C.line(a.weeks, [{ name: t('admin.travellers', 'Travellers (index)'), values: tIdx }, { name: t('admin.partnersIdx', 'Live partners (index)'), values: pIdx }], { label: 'Indexed growth of travellers and partners', fmt: function (v) { return v + ' (index)'; } })) +
      K.pane(t('admin.provTypes', 'Providers by type'), esc(t('admin.provTypesSub', 'Live partners')), C.donut(u.partnerTypes, { center: u.livePartners[11].toLocaleString('en-IN'), sub: t('admin.live', 'live'), label: 'Providers by type' })) +
      K.pane(t('admin.onboard', 'Partner onboarding funnel'), esc(t('admin.onboardSub', 'Registration → document check → bank video-KYC → live')), C.funnel([
        { label: t('admin.f.reg', 'Registered'), value: u.registeredPartners }, { label: t('admin.f.docs', 'Documents verified (DigiLocker / GST)'), value: 1219 }, { label: t('admin.f.kyc', 'Bank video-KYC + escrow account'), value: u.registeredPartners - u.pendingKyc }, { label: t('admin.f.live', 'Live with ≥ 1 listing'), value: u.livePartners[11] }
      ])) +
      '</div>' + K.sec(t('admin.newByLang', 'Registered users by preferred language'), esc(t('admin.newByLangSub', 'Language chosen at sign-up (simulated; the survey did not ask about language).')), K.pane('', '', C.hbar(u.byLangNew.map(function (d, i) { return { label: d.label, value: d.value, highlight: i === 1 }; }), { compact: true, label: 'Users by language' }))) + K.simLine();
  }

  function bookings(body) {
    var a = A(), tw = totalsWithLive(), l = live();
    var rows = a.cats.map(function (c) { return [c.name, sum(c.orders).toLocaleString('en-IN'), OT.inr(c.aov), K.cr(sum(c.gtv)), Math.round(c.take * 100) + '%', K.lakh(sum(c.commission))]; });
    body.innerHTML = K.board([
      { label: t('admin.k.orders', 'Add-on orders · 12 wk'), value: tw.orders.toLocaleString('en-IN'), spark: a.orders },
      { label: t('admin.k.trips', 'Trips with ≥ 1 add-on'), value: a.totals.trips.toLocaleString('en-IN'), note: a.overlap + ' ' + t('admin.ordersPerTrip', 'orders per trip') },
      { label: t('admin.k.gtv', 'GTV · 12 wk'), value: K.cr(tw.gtv), hi: true, spark: a.gtv },
      { label: t('admin.k.comm', 'Gross commission'), value: K.cr(a.totals.commission), note: t('admin.take', 'blended take-rate') + ' ' + (a.totals.takeRate * 100).toFixed(1) + '%' },
      { label: t('admin.k.attach', 'Attach rate'), value: a.attach[11].toFixed(2) + '%', note: t('admin.attachNote', 'trips with add-on ÷ eligible tickets'), spark: a.attach }
    ], tw.liveN ? '<span class="pill pill-live">' + esc(t('admin.liveIncl', '{n} live booking(s) · {v} added to totals', { n: tw.liveN, v: OT.inr(tw.liveGtv) }) + (tw.liveTrains ? ' · ' + t('admin.liveTrains', '{n} train ticket(s) {v} counted as IRCTC ticketing, not add-on GTV', { n: tw.liveTrains, v: OT.inr(tw.liveTrainValue) }) : '')) + '</span>' : '') +
      '<div class="split-even" style="margin-top:18px">' +
        K.pane(t('admin.ordersByCat', 'Orders by service line'), esc(t('admin.ordersByCatSub', 'Weekly add-on orders')), C.stacked(a.weeks, a.cats.map(function (c) { return { name: c.name, values: c.orders }; }), { label: 'Weekly orders by service line', totalLabels: false })) +
        K.pane(t('admin.attachTrend', 'Attach rate trend'), esc(t('admin.attachTrendSub', 'Pilot ramp toward the 8–12% base-case assumption')), C.line(a.weeks, [{ name: 'Attach rate', values: a.attach }], { area: true, fmt: function (v) { return v.toFixed(2) + '%'; }, fmtTick: tickPct, fmtLabel: function (v) { return v.toFixed(1) + '%'; }, label: 'Attach rate trend' })) +
      '</div>' +
      K.sec(t('admin.unitEcon', 'Unit economics by service line'), esc(t('admin.unitEconSub', 'AOV and take-rates mirror the revenue-model assumptions on the Business case page.')),
        '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('admin.col.line', 'Service line')) + '</th><th class="num">' + esc(t('admin.col.orders', 'Orders')) + '</th><th class="num">AOV</th><th class="num">GTV</th><th class="num">' + esc(t('admin.col.take', 'Take-rate')) + '</th><th class="num">' + esc(t('admin.col.comm', 'Commission')) + '</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (i ? ' class="num"' : '') + '>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') +
        '<tr><td><strong>' + esc(t('admin.total', 'Total (simulated)')) + '</strong></td><td class="num"><strong>' + a.totals.orders.toLocaleString('en-IN') + '</strong></td><td></td><td class="num"><strong>' + K.cr(a.totals.gtv) + '</strong></td><td class="num">' + (a.totals.takeRate * 100).toFixed(1) + '%</td><td class="num"><strong>' + K.cr(a.totals.commission) + '</strong></td></tr></tbody></table></div>') +
      K.sec(t('admin.liveBookings', 'Live demo bookings (this browser)'), esc(t('admin.liveBookingsSub', 'Created in the traveller flow; included in the totals above.')),
        l.all.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Ref</th><th>' + esc(t('admin.col.item', 'Item')) + '</th><th>' + esc(t('admin.col.partner', 'Partner')) + '</th><th>' + esc(t('admin.col.paid', 'Paid')) + '</th><th class="num">' + esc(t('admin.col.amount', 'Amount')) + '</th><th>' + esc(t('admin.col.status', 'Status')) + '</th></tr></thead><tbody>' +
          l.all.map(function (b) { return '<tr class="row-new"><td>' + K.keep(b.ref || '') + '</td><td>' + esc(b.title || '') + '<span class="sub">' + esc(b.city || '') + ' · ' + esc(b.method || '') + '</span></td><td>' + K.keep(b.partnerId || '—') + '</td><td class="nowrap">' + esc(b.paidAt ? OT.stamp(new Date(b.paidAt)) : '—') + '</td><td class="num">' + K.keep(OT.inr(b.amount)) + '</td><td>' + OT.badge(b.status === 'cancelled' || b.status === 'refunded' ? b.status : 'confirmed') + '</td></tr>'; }).join('') + '</tbody></table></div>'
          : '<div class="pane">' + liveFeed() + '</div>') + K.simLine();
  }

  function complaints(body) {
    var a = A(), c = a.complaints, r = a.refunds;
    var liveRefunds = live().cancelled.map(function (b) {
      var cx = b.cancellation || {};
      return { id: 'RF-LIVE', ref: b.ref, partner: (b.partnerId || '') + ' ' + (b.city || ''), amount: cx.refundAmount != null ? cx.refundAmount : b.amount, reason: t('admin.travellerCancel', 'Traveller cancelled (live demo)'), age: t('admin.justNow', 'just now'), status: cx.status === 'refunded' || b.status === 'refunded' ? 'refunded' : 'processing', owner: 'Partner → Escrow bank', live: true };
    });
    var queue = liveRefunds.concat(r.queue);
    body.innerHTML = K.board([
      { label: t('admin.k.compl12', 'Complaints · 12 wk'), value: c.total.toLocaleString('en-IN'), note: c.per1000[11] + ' ' + t('admin.per1000', 'per 1,000 orders now'), spark: c.weekly },
      { label: t('admin.k.sla', 'Resolved within 48 h SLA'), value: fmtPct(c.slaWithin), hi: true },
      { label: t('admin.k.open', 'Open complaints'), value: String(c.open), note: c.escalatedFromAgent + '% ' + t('admin.escalated', 'escalated by Support Agent') },
      { label: t('admin.k.refunds', 'Refunds processed'), value: r.count.toLocaleString('en-IN'), note: K.cr(r.value) + ' · ' + r.fromEscrowPct + '% ' + t('admin.fromEscrow', 'from escrow') },
      { label: t('admin.k.refundTat', 'Refund TAT'), value: r.tatTravellerCancelH + ' h', note: t('admin.k.refundTat2', 'traveller-cancel avg · provider-cancel {h} h', { h: r.tatProviderCancelH }) }
    ]) + '<div class="split" style="margin-top:18px">' +
      K.pane(t('admin.complByCat', 'Complaints by category'), esc(t('admin.complByCatSub', '12 weeks · top driver highlighted')), C.hbar(c.cats.map(function (x, i) { return { label: x.name, value: x.count, highlight: i === 0 }; }), { label: 'Complaints by category' })) +
      K.pane(t('admin.complRate', 'Complaints per 1,000 orders'), esc(t('admin.complRateSub', 'Falling as the Verification Agent filters stale listings')), C.line(a.weeks, [{ name: 'Per 1,000', values: c.per1000, color: C.palette.cat[2] }], { min: 0, max: 6, fmt: function (v) { return v.toFixed(1); }, fmtTick: function (v) { return v.toFixed(0); }, fmtLabel: function (v) { return v.toFixed(1); }, label: 'Complaint rate' })) +
      '</div>' +
      K.sec(t('admin.slaTable', 'SLA by category'), esc(t('admin.slaTableSub', 'Target: resolve within 48 h. First line = OneTrip support; fulfilment owner = partner; money = bank.')),
        '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('admin.col.cat', 'Category')) + '</th><th class="num">' + esc(t('admin.col.count', 'Count')) + '</th><th class="num">' + esc(t('admin.col.avgRes', 'Avg resolution')) + '</th><th class="num">' + esc(t('admin.col.within', 'Within SLA')) + '</th><th>' + esc(t('admin.col.owner', 'Owner')) + '</th></tr></thead><tbody>' +
        c.cats.map(function (x) {
          var owner = /Payment|Refund/.test(x.name) ? 'Partner Bank (sample)' : /Meal/.test(x.name) ? 'IRCTC e-catering' : /Translation/.test(x.name) ? 'IRCTC (language ops)' : 'Partner';
          var cls = x.sla >= 95 ? 'st-good' : x.sla >= 91 ? 'st-watch' : 'st-action';
          return '<tr><td>' + esc(x.name) + '</td><td class="num">' + x.count + '</td><td class="num">' + x.avgH + ' h</td><td class="num"><span class="status-dot ' + cls + '">' + x.sla.toFixed(1) + '%</span></td><td>' + esc(owner) + '</td></tr>';
        }).join('') + '</tbody></table></div>') +
      K.sec(t('admin.refundQ', 'Refund queue'), esc(t('admin.refundQSub', '{n} pending. Refunds are released from the bank escrow, so the traveller is never chasing a partner.', { n: r.pending + liveRefunds.filter(function (x) { return x.status !== 'refunded'; }).length })),
        '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('admin.col.refund', 'Refund')) + '</th><th>' + esc(t('admin.col.booking', 'Booking')) + '</th><th>' + esc(t('admin.col.reason', 'Reason')) + '</th><th class="num">' + esc(t('admin.col.amount', 'Amount')) + '</th><th>' + esc(t('admin.col.age', 'Age')) + '</th><th>' + esc(t('admin.col.status', 'Status')) + '</th><th>' + esc(t('admin.col.payer', 'Paid by')) + '</th></tr></thead><tbody>' +
        queue.map(function (q) {
          return '<tr class="' + (q.live ? 'row-new' : '') + '"><td>' + K.keep(q.id) + '</td><td>' + K.keep(q.ref || '') + '<span class="sub">' + esc(q.partner) + '</span></td><td>' + esc(q.reason) + '</td><td class="num">' + K.keep(OT.inr(q.amount)) + '</td><td class="nowrap">' + esc(q.age) + (q.breach ? ' <span class="badge b-bad">' + OT.icon('alert', 12) + esc(t('admin.breach', 'SLA breach')) + '</span>' : '') + '</td><td>' + OT.badge(q.status) + '</td><td>' + esc(q.owner) + '</td></tr>';
        }).join('') + '</tbody></table></div>') + K.simLine();
  }

  var pSort = 'revenue';
  function partners(body) {
    var list = A().partners.slice();
    var dir = { revenue: -1, bookings: -1, rating: -1, conv: -1, cancel: 1, complaints: 1, respH: 1 }[pSort] || -1;
    list.sort(function (x, y) { return (x[pSort] - y[pSort]) * dir; });
    var counts = { good: 0, watch: 0, action: 0 };
    list.forEach(function (p) { counts[p.status]++; });
    var label = { good: t('admin.st.good', 'Good standing'), watch: t('admin.st.watch', 'Watch'), action: t('admin.st.action', 'Action plan') };
    body.innerHTML = K.sec('', esc(t('admin.partnersSub', 'Ranking in OneTrip depends on rating, reliability and price — never on who pays more. Sponsored slots can outrank a better option by at most one position.')),
      '<div class="table-tools"><label class="small" for="p-sort">' + esc(t('admin.sortBy', 'Sort by')) + '</label><select class="input" id="p-sort">' +
      [['revenue', 'Revenue'], ['bookings', 'Bookings'], ['rating', 'Rating'], ['conv', 'Conversion'], ['cancel', 'Cancellation rate'], ['complaints', 'Complaint rate'], ['respH', 'Response time']].map(function (o) { return '<option value="' + o[0] + '"' + (pSort === o[0] ? ' selected' : '') + '>' + esc(t('admin.sort.' + o[0], o[1])) + '</option>'; }).join('') +
      '</select><span class="status-dot st-good">' + counts.good + ' ' + esc(label.good) + '</span><span class="status-dot st-watch">' + counts.watch + ' ' + esc(label.watch) + '</span><span class="status-dot st-action">' + counts.action + ' ' + esc(label.action) + '</span></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('admin.col.partner', 'Partner')) + '</th><th>' + esc(t('admin.col.type', 'Type')) + '</th><th class="num">' + esc(t('admin.col.bookings', 'Bookings')) + '</th><th class="num">' + esc(t('admin.col.revenue', 'Revenue')) + '</th><th class="num">' + esc(t('admin.col.conv', 'Conv.')) + '</th><th class="num">' + esc(t('admin.col.cancel', 'Cancel')) + '</th><th class="num">' + esc(t('admin.col.rating', 'Rating')) + '</th><th class="num">' + esc(t('admin.col.compl', 'Complaints /100')) + '</th><th class="num">' + esc(t('admin.col.resp', 'Reply time')) + '</th><th>' + esc(t('admin.col.score', 'Scorecard')) + '</th></tr></thead><tbody>' +
      list.map(function (p) {
        return '<tr' + (p.id === 'P-101' ? ' class="row-new"' : '') + '><td><strong>' + esc(p.name) + '</strong><span class="sub">' + K.keep(p.id) + ' · ' + esc(p.city) + '</span></td><td>' + esc(p.type) + '</td><td class="num">' + p.bookings.toLocaleString('en-IN') + '</td><td class="num">' + K.lakh(p.revenue) + '</td><td class="num">' + p.conv.toFixed(1) + '%</td><td class="num">' + p.cancel.toFixed(1) + '%</td><td class="num">' + p.rating.toFixed(1) + ' ★</td><td class="num">' + p.complaints.toFixed(1) + '</td><td class="num">' + p.respH.toFixed(1) + ' h</td><td><span class="status-dot st-' + p.status + '">' + esc(label[p.status]) + '</span></td></tr>';
      }).join('') + '</tbody></table></div>') +
      '<div class="split-even" style="margin-top:18px">' +
        K.pane(t('admin.rule', 'Scorecard rule'), '', '<ul class="small" style="margin:0;padding-left:18px"><li><span class="status-dot st-good">' + esc(label.good) + '</span>: ' + esc(t('admin.rule.g', 'rating ≥ 4.3, complaints < 3 per 100, cancellations < 8%')) + '</li><li><span class="status-dot st-watch">' + esc(label.watch) + '</span>: ' + esc(t('admin.rule.w', 'between the two bands — Partner Agent sends coaching tips')) + '</li><li><span class="status-dot st-action">' + esc(label.action) + '</span>: ' + esc(t('admin.rule.a', 'rating < 4.0, complaints > 5 or cancellations > 10% — ranking reduced, 30-day plan')) + '</li></ul><p class="small muted" style="margin-top:10px">' + esc(t('admin.rule.note', 'Ratings come only from verified stays; partners can reply but not delete reviews.')) + '</p>') +
        K.pane(t('admin.ratingByPartner', 'Rating by partner'), esc(t('admin.ratingByPartnerSub', 'Watch-list partners highlighted')), C.hbar(A().partners.slice().sort(function (x, y) { return y.rating - x.rating; }).map(function (p) { return { label: p.name, value: p.rating, highlight: p.status === 'action', muted: false }; }), { compact: true, max: 5, fmt: function (v) { return v.toFixed(1); }, label: 'Partner ratings' })) +
      '</div>' + K.simLine();
  }

  /** v1.1 (Builder A): long-weekend demand forecast — the data-monetisation view behind "For you". */
  function lwForecast() {
    var Dm = OT.data.demand; if (!Dm) return '';
    var lws = Dm.longWeekends(null, 3); if (!lws.length) return '';
    var homes = ['NDLS', 'CSMT', 'MAS', 'PUNE', 'CDG'];
    var rows = [];
    lws.forEach(function (lw) {
      homes.forEach(function (h) {
        var tr = Dm.trends(h, lw, null)[0];
        if (tr) rows.push({ lw: lw, home: h, tr: tr });
      });
    });
    var top = rows.filter(function (r) { return r.lw === lws[0]; }).sort(function (x, y) { return y.tr.bookings - x.tr.bookings; });
    var sn = function (c) { return OT.data.travel.stationName(c, OT.i18n.lang()); };
    var table = '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('admin.lw.weekend', 'Long weekend')) + '</th><th>' + esc(t('admin.lw.from', 'From')) + '</th><th>' + esc(t('admin.lw.route', 'Top route')) + '</th><th class="num">' + esc(t('admin.lw.bookings', 'Bookings')) + '</th><th class="num">' + esc(t('admin.lw.change', 'vs normal')) + '</th><th class="num">' + esc(t('admin.lw.fills', 'Fills early')) + '</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td>' + esc(r.lw.holiday.name) + ' <span class="xs muted">' + esc(OT.fmtDate(r.lw.start).replace(/ \d{4}$/, '') + ' – ' + OT.fmtDate(r.lw.end).replace(/ \d{4}$/, '') + ' · ' + r.lw.days + 'd') + '</span></td><td>' + esc(sn(r.home)) + '</td><td>' + esc(r.tr.label) + ' <span class="xs muted">' + esc(r.home + '→' + r.tr.to) + '</span></td>' +
          '<td class="num">' + r.tr.bookings.toLocaleString('en-IN') + '</td><td class="num">+' + r.tr.change + '%</td><td class="num">' + r.tr.fillsEarly + ' d</td></tr>';
      }).join('') + '</tbody></table></div>';
    var levers = '<ul class="small lw-levers">' +
      '<li><strong>' + esc(t('admin.lw.l1', 'Partner Demand Radar')) + '</strong> · ' + esc(t('admin.lw.l1d', 'sell aggregated arrival forecasts to hotels/cabs in the destination (k ≥ 50, no personal data)')) + '</li>' +
      '<li><strong>' + esc(t('admin.lw.l2', 'Long-weekend packages')) + '</strong> · ' + esc(t('admin.lw.l2d', 'train + verified stay + cab bundles shown to travellers who opted in')) + '</li>' +
      '<li><strong>' + esc(t('admin.lw.l3', 'Capacity planning')) + '</strong> · ' + esc(t('admin.lw.l3d', 'flag routes that fill early for extra coaches or special trains')) + '</li>' +
      '<li><strong>' + esc(t('admin.lw.l4', 'Bank offers')) + '</strong> · ' + esc(t('admin.lw.l4d', 'EMI / rewards on high-value trips, only with Account Aggregator-style consent')) + '</li></ul>';
    return '<div data-tour="lw-forecast">' + K.sec(t('admin.lw.title', 'Long-weekend demand forecast (data monetisation)'),
      esc(t('admin.lw.sub', 'Sample holiday calendar (verify with the official gazette) × simulated, aggregated route demand from home cities. Powers the traveller “For you” suggestions.')),
      '<div class="split">' + K.pane(t('admin.lw.next', 'Next long weekend: {h}', { h: lws[0].holiday.name }), esc(t('admin.lw.nextSub', 'Top route per origin city, bookings for that weekend')),
        C.hbar(top.map(function (r) { return { label: sn(r.home) + ' → ' + r.tr.label, value: r.tr.bookings, highlight: r.tr.change >= 150, tip: '+' + r.tr.change + '% vs a normal weekend' }; }), { compact: true, label: 'Long-weekend bookings by route' })) +
        K.pane(t('admin.lw.levers', 'How IRCTC can monetise it (illustrative)'), '', levers) + '</div>' + table) + '</div>';
  }

  function demand(body) {
    var a = A(), d = a.destinations;
    var byTotal = d.slice().sort(function (x, y) { return y.total - x.total; });
    var byFwd = d.slice().sort(function (x, y) { return y.fwd - x.fwd; });
    body.innerHTML = lwForecast() + K.sec('', esc(t('admin.demandSub', 'Rail arrivals on pilot routes (thousands per month) from first-party booking data — aggregated, no individual records.')),
      '<div class="split">' +
        K.pane(t('admin.heat', 'Arrivals by destination and month'), esc(t('admin.heatSub', 'Thousands of passengers · darker = more')), C.heat(byTotal.map(function (x) { return x.city + ' (' + x.code + ')'; }), a.months, byTotal.map(function (x) { return x.m; }), { rowTotals: true, totalLabel: '6-mo', corner: t('admin.dest', 'Destination'), fmt: function (v) { return v + 'K'; }, cellFmt: function (v) { return String(v); }, label: 'Arrivals by destination and month' })) +
        K.pane(t('admin.fwd', 'Forward bookings, next 30 days'), esc(t('admin.fwdSub', '% change vs previous 30 days · spikes over 20% highlighted')), C.hbar(byFwd.map(function (x) { return { label: x.city, value: x.fwd, highlight: x.fwd >= 20, tip: x.city + ': +' + x.fwd + '% · ' + x.note }; }), { compact: true, fmt: function (v) { return '+' + v + '%'; }, label: 'Forward bookings growth' })) +
      '</div>') +
      K.sec(t('admin.addonByDest', 'Add-on demand by destination'), esc(t('admin.addonByDestSub', '12-week OneTrip orders')), K.pane('', '', C.bar(d.slice().sort(function (x, y) { return y.orders - x.orders; }).map(function (x) { return { label: x.city, value: x.orders, highlight: x.city === 'Varanasi' }; }), { w: C.narrow() ? 360 : 760, h: 240, xLabelLines: 1, label: 'Add-on orders by destination' }))) +
      K.sec(t('admin.sst', 'Sense → Seize → Transform'), '', sstCard()) + K.simLine();
  }

  function finance(body) {
    var a = A(), pay = a.payments, prods = a.products;
    var segs = ['Retail traveller', 'Tourism partner', 'Financial inclusion'];
    var segIcon = { 'Retail traveller': 'user', 'Tourism partner': 'store', 'Financial inclusion': 'users' };
    var stLabel = { on: [t('admin.fp.on', 'On track'), 'target-ok'], near: [t('admin.fp.near', 'Building'), 'target-near'], early: [t('admin.fp.early', 'Early pilot'), 'target-early'] };
    body.innerHTML = '<div class="split">' +
      K.pane(t('admin.bankRole', 'Role of the bank: it runs the money rails, IRCTC runs the trip'), '',
        '<div class="two-col-list"><div><h4>' + OT.icon('lock', 16) + esc(t('admin.br.escrow', 'Escrow / nodal account')) + '</h4><p class="small">' + esc(t('admin.br.escrow2', 'Traveller money for partner services is held until the service is delivered, so refunds are instant and never chased from a partner.')) + '</p>' +
        '<h4>' + OT.icon('refresh', 16) + esc(t('admin.br.settle', 'Settlement T+1')) + '</h4><p class="small">' + esc(t('admin.br.settle2', 'Auto-split: partner share net of commission, with GST invoice and reconciliation file.')) + '</p></div>' +
        '<div><h4>' + OT.icon('shield', 16) + esc(t('admin.br.fraud', 'Fraud, KYC & disputes')) + '</h4><p class="small">' + esc(t('admin.br.fraud2', 'Video-KYC for partners, AML monitoring, chargebacks and financial grievances.')) + '</p>' +
        '<h4>' + OT.icon('wallet', 16) + esc(t('admin.br.credit', 'Credit (last, regulated)')) + '</h4><p class="small">' + esc(t('admin.br.credit2', 'Partner working capital on consented sales data; traveller EMI only with APR shown. Never from travel data alone.')) + '</p></div></div>', 'pane-wash') +
      K.pane(t('admin.t1', 'Settlements paid by T+1'), esc(t('admin.t1Sub', '% of partner settlements · target 90%')), C.line(a.weeks, [{ name: 'T+1 %', values: pay.t1Trend }, { name: t('admin.target', 'Target'), values: a.weeks.map(function () { return 90; }), color: '#9AA8BC', dash: true }], { min: 80, max: 100, fmt: fmtPct, fmtTick: tickPct, fmtLabel: function (v) { return v.toFixed(1) + '%'; }, label: 'T+1 settlement rate' })) +
      '</div>' +
      K.sec(t('admin.payments', 'Payments health'), '', K.board([
        { label: t('admin.p.success', 'Payment success'), value: pay.successRate + '%' },
        { label: t('admin.p.rev', 'Debited-not-confirmed auto-reversed < 1 h'), value: pay.autoReversal1h + '%' },
        { label: t('admin.p.escrow', 'Escrow balance (now)'), value: K.cr(pay.escrowBalance), hi: true },
        { label: t('admin.p.settled', 'Settled to partners · 12 wk'), value: K.cr(pay.settledToPartners) },
        { label: t('admin.p.cb', 'Chargebacks'), value: pay.chargebackRate + '%', note: t('admin.p.recon', 'recon exceptions {r}%', { r: pay.reconExceptions }) },
        { label: t('admin.p.fraud', 'Fraud flags → confirmed'), value: pay.fraudFlags + ' → ' + pay.fraudConfirmed, note: OT.inr(pay.fraudBlockedValue) + ' ' + t('admin.blocked', 'blocked') }
      ])) +
      K.sec(t('admin.products', 'Proposed financial products · 3 segments'), esc(t('admin.productsSub', 'Concepts issued by Partner Bank (sample) / licensed insurer. Optional, never pre-ticked, never a condition of rail travel.')),
        segs.map(function (sg) {
          var ps = prods.filter(function (p) { return p.seg === sg; });
          return '<div class="prod-seg"><h3>' + OT.icon(segIcon[sg], 18) + esc(t('admin.seg.' + sg, sg)) + '</h3><div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('admin.col.product', 'Product')) + '</th><th>' + esc(t('admin.col.adoption', 'Adoption')) + '</th><th class="num">' + esc(t('admin.col.volume', 'Volume')) + '</th><th class="num">' + esc(t('admin.col.risk', 'Risk / quality')) + '</th><th>' + esc(t('admin.col.target', 'Pilot target')) + '</th></tr></thead><tbody>' +
            ps.map(function (p) {
              return '<tr><td><strong>' + esc(p.name) + '</strong><span class="sub">' + esc(p.what) + '</span></td><td>' + p.adoption.toLocaleString('en-IN') + ' <span class="sub">' + esc(p.adoptionLabel) + ' · ' + esc(p.adoptionRate) + '</span></td><td class="num">' + K.money(p.volume) + '<span class="sub">' + esc(p.volumeLabel) + '</span></td><td class="num">' + p.risk + '%<span class="sub">' + esc(p.riskLabel) + '</span></td><td><span class="' + stLabel[p.status][1] + '">' + esc(stLabel[p.status][0]) + '</span><span class="sub">' + esc(p.target) + '</span></td></tr>';
            }).join('') + '</tbody></table></div></div>';
        }).join('')) +
      '<div class="split-even">' +
        K.pane(t('admin.volByProduct', 'Volume by product'), esc(t('admin.volByProductSub', '₹ · settlement rail dwarfs credit, by design')), C.hbar(prods.slice().sort(function (x, y) { return y.volume - x.volume; }).map(function (p) { return { label: p.name, value: p.volume, highlight: p.name === 'Settle-Fast + Escrow' }; }), { compact: true, fmt: K.money, label: 'Volume by product' })) +
        K.pane(t('admin.sequence', 'Launch sequence (BRD §27.4)'), esc(t('admin.sequenceSub', 'Credit is never the first monetisation lever')), '<ol class="rules"><li>' + esc(t('admin.seq1', 'Payment reliability, escrow, reconciliation, disputes')) + '</li><li>' + esc(t('admin.seq2', 'Co-branded rewards card and Trip Shield')) + '</li><li>' + esc(t('admin.seq3', 'Merchant tools: Smart POS / QR, Settle-Fast')) + '</li><li>' + esc(t('admin.seq4', 'Partner Growth Line and invoice finance pilots')) + '</li><li>' + esc(t('admin.seq5', 'Traveller EMI and inclusion credit, last')) + '</li></ol>') +
      '</div>' +
      K.sec(t('admin.resp', 'Responsibility matrix'), esc(t('admin.respSub', 'Answers the #1 survey concern: who owns refunds and support (23.1%).')),
        '<div class="table-wrap"><table class="matrix"><thead><tr><th></th><th>IRCTC (platform)</th><th>' + esc(t('admin.partner', 'Partner')) + '</th><th>Partner Bank (sample)</th></tr></thead><tbody>' +
        '<tr><th>' + esc(t('admin.rm.owns', 'Owns')) + '</th><td>Trip, itinerary, recommendation rules, partner standards</td><td>Inventory, accurate price & availability, fulfilment</td><td>Money movement, escrow, credit decisions, fraud</td></tr>' +
        '<tr><th>' + esc(t('admin.rm.support', 'Support')) + '</th><td>First-line support (Customer Support Agent → human)</td><td>Service issues at the destination</td><td>Payment failures, chargebacks, financial grievances</td></tr>' +
        '<tr><th>' + esc(t('admin.rm.refunds', 'Refunds')) + '</th><td>Policy display & verification</td><td>Refund obligation per its policy</td><td>Pays refund from escrow</td></tr>' +
        '<tr><th>' + esc(t('admin.rm.data', 'Data access')) + '</th><td>Journey data with consent (DPDP)</td><td>Only what fulfilment needs; aggregated insights</td><td>Payment data only — never full itinerary</td></tr></tbody></table></div>') + K.simLine();
  }

  function language(body) {
    var a = A(), L = a.languages, pc = a.policyCheck;
    var voiceAll = L.reduce(function (s, l) { return s + l.share * l.voice; }, 0) / 100;
    var tr = L.filter(function (l) { return l.nmt != null; });
    var nmtAvg = tr.reduce(function (s, l) { return s + l.share * l.nmt; }, 0) / tr.reduce(function (s, l) { return s + l.share; }, 0);
    var reviewAvg = tr.reduce(function (s, l) { return s + l.share * l.review; }, 0) / tr.reduce(function (s, l) { return s + l.share; }, 0);
    body.innerHTML = '<div class="pane pane-wash" style="margin-bottom:14px"><p class="small" style="margin:0">' + OT.simTag() + ' ' + esc(t('admin.langSim', 'Language and voice metrics are SIMULATED. The N=52 customer survey did not ask about language or voice, so these are illustrative pilot numbers, not evidence.')) + '</p></div>' +
      K.board([
        { label: t('admin.l.nonEn', 'Sessions not in English'), value: a.nonEnglishShare + '%', hi: true },
        { label: t('admin.l.voice', 'Queries by voice'), value: voiceAll.toFixed(1) + '%' },
        { label: t('admin.l.nmt', 'Avg NMT confidence'), value: nmtAvg.toFixed(2) },
        { label: t('admin.l.review', 'Translations sent to human'), value: reviewAvg.toFixed(1) + '%' },
        { label: t('admin.l.policy', 'Critical-policy text shown unverified'), value: pc.displayedUnverified + '%', note: pc.translated.toLocaleString('en-IN') + ' ' + t('admin.l.checked', 'policy translations checked') }
      ]) +
      '<div class="split" style="margin-top:18px">' +
        K.pane(t('admin.l.usage', 'Language usage'), esc(t('admin.l.usageSub', '% of sessions · 11 launch languages')), C.hbar(L.map(function (l, i) { return { label: l.name, value: l.share, highlight: i === 1 }; }), { compact: true, fmt: fmtPct, label: 'Sessions by language' })) +
        K.pane(t('admin.l.policyCheck', 'Critical-policy verification'), esc(t('admin.l.policyCheckSub', 'Cancellation, refund and payment text: back-translation + glossary check before display')), C.donut([
          { label: t('admin.l.auto', 'Auto-verified'), value: pc.autoVerified }, { label: t('admin.l.human', 'Human-verified'), value: pc.humanVerified }, { label: t('admin.l.orig', 'Original shown + human offered'), value: pc.showedOriginal }
        ], { colors: [C.palette.blue, C.palette.cat[2], C.palette.saffron], center: '100%', sub: t('admin.l.verified', 'verified'), fmt: function (v) { return v + '%'; }, showPct: false, label: 'Critical policy verification' }) + '<p class="small muted" style="margin-top:10px">' + esc(t('admin.l.tokens', 'Protected tokens (PNR, train no., station codes, dates, ₹) bypass translation: 0 alterations detected.')) + '</p>') +
      '</div>' +
      K.sec(t('admin.l.voiceText', 'Voice vs typed queries by language'), esc(t('admin.l.voiceTextSub', 'Voice lowers effort expectancy most where typing in script is hardest')),
        K.pane('', '', C.stack100(L.map(function (l) { return { label: l.name, values: [l.voice, 100 - l.voice] }; }), [t('admin.l.voiceS', 'Voice'), t('admin.l.typed', 'Typed')], { colors: [C.palette.saffron, '#C9D1DC'] }))) +
      K.sec(t('admin.l.quality', 'Translation quality & support performance by language'), esc(t('admin.l.qualitySub', 'ASR = speech recognition, NMT = machine translation (BHASHINI pipeline, simulated). Red flags trigger human review.')),
        '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('admin.col.lang', 'Language')) + '</th><th class="num">ASR conf.</th><th class="num">NMT conf.</th><th class="num">' + esc(t('admin.col.human', 'To human')) + '</th><th class="num">' + esc(t('admin.col.orig', 'Original shown')) + '</th><th class="num">FCR</th><th class="num">' + esc(t('admin.col.esc', 'Escalated')) + '</th><th class="num">CSAT</th><th class="num">' + esc(t('admin.col.frt', 'First reply')) + '</th></tr></thead><tbody>' +
        L.map(function (l) {
          var flag = function (bad, txt) { return bad ? '<span class="status-dot st-action">' + txt + '</span>' : txt; };
          return '<tr><td><strong>' + esc(l.name) + '</strong> <span class="lang-chip">' + esc(l.code) + '</span></td><td class="num">' + flag(l.asr < 0.8, l.asr.toFixed(2)) + '</td><td class="num">' + (l.nmt == null ? '<span class="muted">n/a</span>' : flag(l.nmt < 0.85, l.nmt.toFixed(2))) + '</td><td class="num">' + flag(l.review > 5, l.review.toFixed(1) + '%') + '</td><td class="num">' + l.original.toFixed(1) + '%</td><td class="num">' + flag(l.fcr < 65, l.fcr + '%') + '</td><td class="num">' + flag(l.esc > 15, l.esc.toFixed(1) + '%') + '</td><td class="num">' + flag(l.csat < 4, l.csat.toFixed(1)) + '</td><td class="num">' + l.frt + ' s</td></tr>';
        }).join('') + '</tbody></table></div>') +
      '<div class="split-even" style="margin-top:18px">' +
        K.pane(t('admin.l.supportTrend', 'Support: first-contact resolution vs escalation'), esc(t('admin.l.supportTrendSub', '% of conversations · Customer Support Agent + human team')), C.line(a.weeks, [{ name: 'First-contact resolution', values: a.supportTrend.fcr }, { name: 'Escalated to human', values: a.supportTrend.esc }], { min: 0, max: 100, fmt: fmtPct, fmtTick: tickPct, fmtLabel: function (v) { return Math.round(v) + '%'; }, label: 'Support trend' })) +
        K.pane(t('admin.l.csat', 'CSAT by language'), esc(t('admin.l.csatSub', 'Out of 5 · lowest highlighted for action')), C.bar(L.map(function (l) { return { label: l.code.toUpperCase(), value: l.csat, highlight: l.csat < 4, tip: l.name + ': ' + l.csat.toFixed(1) + ' / 5' }; }), { max: 5, fmt: function (v) { return v.toFixed(1); }, fmtTick: function (v) { return v.toFixed(0); }, label: 'CSAT by language' })) +
      '</div>' +
      K.sec(t('admin.l.action', 'Action on weak languages'), '', '<div class="pane"><p style="margin:0">' + OT.icon('alert', 16) + ' ' + esc(t('admin.l.actionTxt', 'Odia has the lowest ASR (0.79) and highest human-review rate (5.6%). Per the Hype Cycle lesson (“never buy at the peak”), Odia voice stays labelled Beta, with text fallback and priority human support, until model quality improves.')) + '</p></div>') + K.simLine();
  }

  function flywheelSvg(a) {
    var nodes = [
      { t: 'Easy onboarding', s: 'SSO: ' + a.users.sso + '% of sign-ins', x: 300, y: 50 },
      { t: 'Rapid adoption', s: OT.compact(a.users.active[11]) + ' weekly active', x: 457, y: 164 },
      { t: 'Data generation', s: 'consented journey events', x: 397, y: 352 },
      { t: 'Engagement', s: a.users.repeatRate + '% repeat trips', x: 203, y: 352 },
      { t: 'Network expansion', s: a.users.livePartners[11].toLocaleString('en-IN') + ' live partners', x: 143, y: 164 }
    ];
    var s = '<svg class="diagram" viewBox="0 0 600 410" role="img" aria-labelledby="fw-t"><title id="fw-t">OneTrip data flywheel: onboarding, adoption, data, engagement, network expansion, back to onboarding</title>' +
      '<defs><marker id="fw-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10Z" fill="#E0761A"/></marker></defs>' +
      '<circle cx="300" cy="210" r="150" fill="none" stroke="#DCE8FB" stroke-width="18"/>';
    for (var i = 0; i < 5; i++) {
      var a0 = (-90 + i * 72 + 16) * Math.PI / 180, a1 = (-90 + (i + 1) * 72 - 16) * Math.PI / 180;
      s += '<path d="M' + (300 + 150 * Math.cos(a0)).toFixed(1) + ',' + (210 + 150 * Math.sin(a0)).toFixed(1) + ' A150,150 0 0 1 ' + (300 + 150 * Math.cos(a1)).toFixed(1) + ',' + (210 + 150 * Math.sin(a1)).toFixed(1) + '" fill="none" stroke="#E0761A" stroke-width="2.5" marker-end="url(#fw-a)"/>';
    }
    s += '<circle cx="300" cy="210" r="76" fill="#0B2C5F"/><text x="300" y="200" text-anchor="middle" fill="#fff" font-size="18" font-weight="800">OneTrip</text><text x="300" y="220" text-anchor="middle" fill="#FFB46B" font-size="13.5" font-weight="700">Data Flywheel</text><text x="300" y="240" text-anchor="middle" fill="#C8D6EE" font-size="11.5">better data → better AI</text>';
    nodes.forEach(function (n) {
      s += '<g><rect x="' + (n.x - 90) + '" y="' + (n.y - 27) + '" width="180" height="54" rx="10" fill="#fff" stroke="#1C5FD4" stroke-width="1.5"/>' +
        '<text x="' + n.x + '" y="' + (n.y - 4) + '" text-anchor="middle" font-size="13.5" font-weight="700" fill="#0B2C5F">' + esc(n.t) + '</text>' +
        '<text x="' + n.x + '" y="' + (n.y + 14) + '" text-anchor="middle" font-size="11.5" fill="#3A4A60">' + esc(n.s) + '</text></g>';
    });
    return s + '</svg>';
  }
  function flywheelList(a) {
    return '<ol class="rules"><li><strong>Easy onboarding</strong> — IRCTC SSO, ' + a.users.sso + '% of sign-ins</li><li><strong>Rapid adoption</strong> — ' + OT.compact(a.users.active[11]) + ' weekly active travellers</li><li><strong>Data generation</strong> — consented journey events (booking, journey, stay, post-trip)</li><li><strong>Engagement</strong> — ' + a.users.repeatRate + '% repeat trips</li><li><strong>Network expansion</strong> — ' + a.users.livePartners[11].toLocaleString('en-IN') + ' live partners → back to easier onboarding</li></ol>';
  }

  function platform(body) {
    var a = A(), u = a.users;
    var n = u.active[11], m = u.livePartners[11];
    body.innerHTML = K.sec('', esc(t('admin.platSub', '“Technology alone ≠ platform success; ecosystem design + governance + network effects = platform success.” This view tracks all three.')),
      '<div class="split">' + K.pane(t('admin.flywheel', 'OneTrip Data Flywheel'), esc(t('admin.flywheelSub', 'More users → more data → better recommendations → more engagement → more partners')), C.narrow() ? flywheelList(a) : flywheelSvg(a)) +
        '<div class="stack">' + K.pane(t('admin.netfx', 'Network-effect metrics'), esc(t('admin.netfxSub', 'Illustrative (simulated)')),
          '<div class="table-wrap"><table class="table"><tbody>' +
          '<tr><td>' + esc(t('admin.nf.choices', 'Verified options per search (median)')) + '</td><td class="num"><strong>4.8</strong><span class="sub">' + esc(t('admin.nf.was', 'was {v} on 9 Aug', { v: '2.1' })) + '</span></td></tr>' +
          '<tr><td>' + esc(t('admin.nf.sarnoff', 'Sarnoff value (V ∝ n), travellers')) + '</td><td class="num">' + OT.compact(n) + '</td></tr>' +
          '<tr><td>' + esc(t('admin.nf.metcalfe', 'Possible traveller–partner matches (n × m)')) + '</td><td class="num">' + OT.compact(n * m) + '</td></tr>' +
          '<tr><td>' + esc(t('admin.nf.reed', 'Group-forming: travel groups (family, pilgrim, student)')) + '</td><td class="num">31%<span class="sub">' + esc(t('admin.nf.reed2', 'of trips with 3+ pax')) + '</span></td></tr>' +
          '<tr><td>' + esc(t('admin.nf.partnerRet', 'Partner 90-day retention')) + '</td><td class="num">94.2%</td></tr>' +
          '<tr><td>' + esc(t('admin.nf.listing', 'Listing completeness (policy, photos, price)')) + '</td><td class="num">91.7%</td></tr></tbody></table></div>') +
        K.pane(t('admin.health', 'Ecosystem health'), '', '<p class="small" style="margin:0">' + esc(t('admin.healthTxt', 'Orkut failed to sustain engagement and Nokia Ovi failed its developer ecosystem. OneTrip tracks the ecosystem, not just the tech: partner retention, dispute SLA, repeat trips and listing completeness are reviewed weekly.')) + '</p>', 'pane-wash') + '</div></div>') +
      K.sec(t('admin.layers', 'Platform: three layers'), esc(t('admin.layersSub', 'A digital platform is a technology-enabled business model that facilitates interactions and value exchange among multiple groups.')),
        '<div class="layers"><div class="layer l1"><div class="eyebrow">Layer 1</div><h4>' + esc(t('admin.l1', 'Technology')) + '</h4><ul><li>Agent Orchestrator + 7 specialist agents</li><li>Partner & provider APIs (simulated)</li><li>BHASHINI ASR / NMT / TTS (simulated)</li><li>Static web app, optional Gemini LLM</li></ul></div>' +
        '<div class="layer l2"><div class="eyebrow">Layer 2</div><h4>' + esc(t('admin.l2', 'Governance')) + '</h4><ul><li>Verification Agent: source + timestamp on every fact</li><li>Ranking rules, Sponsored labels, 1 card per stage</li><li>Refund owner on every card; escrow; dispute SLA</li><li>DPDP consent, k-anonymous partner insights</li></ul></div>' +
        '<div class="layer l3"><div class="eyebrow">Layer 3</div><h4>' + esc(t('admin.l3', 'Ecosystem')) + '</h4><ul><li>Travellers (11 languages, voice)</li><li>Hotels, homestays, cabs, tour operators, caterers</li><li>Partner Bank (sample), licensed insurer</li><li>Regulators: MoR, RBI, IRDAI, MeitY (DPDP)</li></ul></div></div>') +
      K.sec(t('admin.stack', 'Built on India Stack / DPI'), esc(t('admin.stackSub', 'DPI blends the trust of the state with the innovation of markets. All integrations are simulated in this prototype.')),
        '<div class="stack-strip">' +
        [['Presence-less', 'IRCTC SSO + Aadhaar e-KYC', 'One login for ticket, trip and bank products'], ['Paperless', 'DigiLocker', 'Partner documents; traveller ID reminder'], ['Cashless', 'UPI', 'One checkout for ticket + add-ons; split settlement'], ['Consent', 'Account Aggregator / DEPA', 'Time-bound consent before any credit offer'], ['Language', 'BHASHINI', 'ASR, NMT, TTS, transliteration for 11 languages'], ['Open commerce', 'ONDC (future)', 'Discover more local partners via open network']]
          .map(function (x) { return '<div><div class="eyebrow">' + esc(x[0]) + '</div><strong>' + esc(x[1]) + '</strong><p>' + esc(x[2]) + '</p></div>'; }).join('') + '</div>') +
      K.sec(t('admin.gov', 'Data governance: what we collect, where, and why'), esc(t('admin.govSub', 'Five data types × journey touchpoints. Purpose-limited under the DPDP Act, 2023.')),
        '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('admin.g.type', 'Data type')) + '</th><th>' + esc(t('admin.g.where', 'Collected at')) + '</th><th>' + esc(t('admin.g.example', 'Example fields')) + '</th><th>' + esc(t('admin.g.use', 'Use')) + '</th><th>' + esc(t('admin.g.who', 'Who sees it')) + '</th></tr></thead><tbody>' +
        [['Transaction', 'Booking, payment', 'Route, class, fare, add-on orders, refund status', 'Itinerary seed, reconciliation', 'IRCTC; bank: payment only'],
          ['Behavioural', 'Pre-journey, in-app', 'Card views, dismissals, saved items, voice vs typed', 'Relevance, frequency caps', 'IRCTC (aggregated for partners)'],
          ['Geographic', 'Journey, stay', 'Destination, station, pickup point (no continuous GPS)', 'Demand Radar, transfer timing', 'Partners: aggregated, k ≥ 50'],
          ['Demographic', 'Booking (minimal)', 'Party size, senior / child flags, preferred language', 'Accessible options, language routing', 'IRCTC; partner only for fulfilment'],
          ['Psychographic', 'Preferences (opt-in)', 'Veg / Jain food, pilgrimage interest, budget band', 'Recommendations (“Why this?”)', 'IRCTC only; user can forget']]
          .map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td>' + (i === 0 ? '<strong>' + esc(c) + '</strong>' : esc(c)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>') + K.simLine();
  }

  /* ---------- main ---------- */
  var SUBS = ['overview', 'users', 'bookings', 'complaints', 'partners', 'demand', 'finance', 'language', 'platform'];
  function render(el, params) {
    var root = document.createElement('div');
    el.appendChild(root);
    if (!isAdmin()) { renderGate(root); return; }
    var sub = SUBS.indexOf(params.sub) >= 0 ? params.sub : 'overview';
    var user = OT.store.get('user') || {};
    var titles = { overview: t('admin.overview', 'Overview'), users: t('admin.users', 'Users & providers'), bookings: t('admin.bookings', 'Bookings & transaction value'), complaints: t('admin.complaints', 'Complaints & refunds'), partners: t('admin.partners', 'Partner performance'), demand: t('admin.demand', 'Destination demand'), finance: t('admin.finance', 'Bank & financial products'), language: t('admin.language', 'Language & support'), platform: t('admin.platform', 'Platform health') };
    var liveN = live().all.length;
    root.innerHTML = K.frame({
      base: 'admin', active: sub, eyebrow: t('admin.console', 'Admin & banking console'), who: user.name || 'OneTrip Admin (demo)', whoSub: user.console === 'bank' ? 'Partner Bank (sample)' : 'IRCTC · pilot, 10 destinations',
      idAction: '<button class="btn btn-sm btn-ghost" data-act="logout" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.3)">' + OT.icon('logout', 15) + '<span class="sr-only">Sign out</span></button>',
      items: [
        { sub: 'overview', label: titles.overview, icon: 'chart', count: liveN || '' }, { sub: 'users', label: titles.users, icon: 'users' }, { sub: 'bookings', label: t('admin.nav.bookings', 'Bookings & GTV'), icon: 'rupee' },
        { sub: 'complaints', label: titles.complaints, icon: 'refund' }, { sub: 'partners', label: titles.partners, icon: 'store' }, { sub: 'demand', label: titles.demand, icon: 'map' },
        { sub: 'finance', label: t('admin.nav.finance', 'Bank & finance'), icon: 'bank' }, { sub: 'language', label: titles.language, icon: 'globe' }, { sub: 'platform', label: titles.platform, icon: 'layers' }
      ],
      foot: '<a class="btn btn-sm btn-ghost btn-block" href="#/insights">' + esc(t('admin.toCase', 'Open the business case')) + '</a>',
      kicker: t('admin.title', 'Admin & Bank dashboard'), title: titles[sub],
      sub: sub === 'overview' ? esc(t('admin.ovSub', 'Pilot across 10 rail destinations. Every number is simulated except bookings you make in this browser.')) : ''
    });
    var body = root.querySelector('[data-dash-body]');
    var draw = function () { ({ overview: overview, users: users, bookings: bookings, complaints: complaints, partners: partners, demand: demand, finance: finance, language: language, platform: platform })[sub](body); };
    draw();
    root.addEventListener('change', function (e) { if (e.target.id === 'p-sort') { pSort = e.target.value; draw(); } });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act="logout"]');
      if (!b) return;
      OT.confirmAction({ title: t('admin.signout', 'Sign out'), lines: [esc(t('admin.signoutQ', 'Sign out of the admin console?'))], confirmLabel: t('admin.signout', 'Sign out') }).then(function (ok) {
        if (ok) { OT.store.set('user', undefined); OT.router.render(); }
      });
    });
    unsubs.push(OT.on('store:bookings', function () {
      var cur = OT.router.current();
      if (!cur || cur.name !== 'admin') return;
      var y = window.scrollY; OT.router.render(); window.scrollTo(0, y);
    }));
  }

  OT.registerView('admin', {
    title: function () { return t('admin.title', 'Admin & Bank dashboard'); },
    section: 'admin',
    render: render,
    onLeave: function () { unsubs.forEach(function (u) { try { u(); } catch (e) { /* noop */ } }); unsubs = []; }
  });
})();
